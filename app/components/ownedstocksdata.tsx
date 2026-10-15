import { prisma } from "../../lib/prisma";
import CompanyTransactionButton from "./company_transaction_button";
import CompanyDetailsButton from "./company_details_button";
import { Decimal } from "@prisma/client/runtime/client";


/**
 * Displays a list of companies with their latest stock prices and action buttons for transactions and details.
 * 
 * @param searchText Optional search text to filter companies by name.
 * @param sliceIndice Optional index to slice the list of companies for pagination.
 * @returns Next.js component rendering a table body with company data.
 */

export async function OwnedStocksData({searchText, sliceIndice}: {searchText?: string, sliceIndice?: number}) {
    const ownedStocks = await prisma.stockOwnership.findMany({
        where: {
            company:{
                name: {
                    contains: searchText,
                },
            }
            
        },
        select: {
            id: true,
            quantity : true,
            company:{
                select:{
                    name: true,
                    stockPrices: {
                        orderBy: {
                            datetime: "desc",
                        },
                        take: 1,
                        select: {
                            closePrice: true
                        },
                    },
                }
                    
            }
            
        },
    });
    let firstIndice = sliceIndice ? sliceIndice * 34 : 0;
    let lastIndice = sliceIndice ? (sliceIndice + 1) * 34 : 34;
    if (firstIndice > ownedStocks.length - 34){
        firstIndice = Math.max(0,ownedStocks.length - 34);
        lastIndice = ownedStocks.length;
    }
    const slicedStocks = ownedStocks.slice(firstIndice, lastIndice);
    slicedStocks.sort((a,b) => (a.company.name.codePointAt(0) ?? 0) - (b.company.name.codePointAt(0) ?? 0))
    const filteredStocks = slicedStocks.filter((stocks) => {
        return stocks.quantity > 0
    })
    if (filteredStocks.length === 0) {
        return (
            <tbody>
                <tr><td colSpan={4}>You don&apos;t own any stocks yet.</td></tr>
            </tbody>
        );
    }
    return (
        <tbody>
            {filteredStocks.map((stock) => {
                let quantity = stock.quantity
                let price = stock.company.stockPrices[0]?.closePrice
                return(
                    <tr key={stock.id}>
                        <th>{stock.company.name}</th><th>{quantity}</th><th>{price ? `${price.toString()}$` : "—"}</th><th>{price ? `${Decimal(quantity).mul(price).toString()}$` : "—"}</th>
                    </tr>
                )
            })}
        </tbody>
    );
}