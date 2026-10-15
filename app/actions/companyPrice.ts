import { prisma } from "@/lib/prisma";

async function companyLatestPrice(companyId : number){
    const companies = await prisma.company.findMany({
        where : { id : companyId },
        select : {
            stockPrices: {
                orderBy: {
                    datetime: "desc"
                },
                take : 1,
                select: {
                    closePrice: true
                }
            }
        }

    })
    // null when the company does not exist or has no prices yet
    return companies[0]?.stockPrices[0]?.closePrice ?? null;
}

async function companyPrices(quantity : number, firstPricePos : number, companyId : number){
    return await prisma.stockPrice.findMany({
        where : { companyId : companyId },
        select : {
            id : true,
            datetime: true,
            closePrice: true,
            highPrice: true,
            lowPrice: true,
            openPrice: true
        },
        skip: firstPricePos,
        take: quantity,
        orderBy: {
            datetime: 'desc'
        }
    })

}

/**
 * One price per week: starting from the most recent price (after skipping
 * firstPricePos rows), keep each price that is at least 7 days older than the
 * previously kept one. Returns at most `quantity` prices, fewer if the
 * history is shorter.
 */
async function weeklyCompanyPrices(quantity : number, firstPricePos : number, companyId : number){
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    // Daily prices exclude weekends, so ~5 rows per week plus a margin.
    const prices = await companyPrices(quantity * 7 + 7, firstPricePos, companyId);
    const result_prices: typeof prices = [];

    for (const price of prices) {
        const last = result_prices[result_prices.length - 1];
        if (!last || last.datetime.getTime() - price.datetime.getTime() >= WEEK_MS) {
            result_prices.push(price);
            if (result_prices.length === quantity) {
                break;
            }
        }
    }
    return result_prices;
}

export { companyLatestPrice as companyLastestPrice, companyPrices, weeklyCompanyPrices }