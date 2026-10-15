import { prisma } from "../../lib/prisma";
import CompanyTransactionButton from "./company_transaction_button";
import CompanyDetailsButton from "./company_details_button";


/**
 * Displays a list of companies with their latest stock prices and action buttons for transactions and details.
 * 
 * @param searchText Optional search text to filter companies by name.
 * @param sliceIndice Optional index to slice the list of companies for pagination.
 * @returns Next.js component rendering a table body with company data.
 */

export default async function Company_data({searchText, sliceIndice}: {searchText?: string, sliceIndice?: number}) {
    const SIZE = 30;
    const companies = await prisma.company.findMany({
        where: {
            name: {
                contains: searchText,
            },
        },
        select: {
            id: true,
            name: true,
            stockPrices: {
                orderBy: {
                    datetime: "desc",
                },
                take: 1,
                select: {
                    id: true,
                    closePrice: true,
                    datetime: true,
                },
            },
        },
    });
    let firstIndice = sliceIndice ? sliceIndice * SIZE : 0;
    let lastIndice = sliceIndice ? (sliceIndice + 1) * SIZE : SIZE;
    if (firstIndice > companies.length - SIZE){
        firstIndice = Math.max(0,companies.length - SIZE);
        lastIndice = companies.length;
    };
    const slicedCompanies = companies.slice(firstIndice, lastIndice);
    if (slicedCompanies.length === 0) {
        return (
            <tbody>
                <tr><td colSpan={4}>No companies found.</td></tr>
            </tbody>
        );
    }
    return (
        <tbody>
            {slicedCompanies.map((company) => {
                const latestPrice = company.stockPrices[0];
                return(
                    <tr key={company.id}>
                        <th>{company.name}</th><th>{latestPrice ? `${latestPrice.closePrice.toNumber()}$` : "—"}</th><th><CompanyTransactionButton companyid={company.id}/></th><th><CompanyDetailsButton companyid={company.id}/></th>
                    </tr>
                )
            })}
        </tbody>
    );
}