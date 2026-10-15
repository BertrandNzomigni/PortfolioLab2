import { prisma } from "../../lib/prisma";
import userId from "../actions/userId";
import { auth } from "@/auth";

export default async function TransactionsData({searchText, sliceIndice}: {searchText?: string, sliceIndice?: number}) {
    const session = await auth();
    const id = await userId(session?.user?.email)
    const transactions = await prisma.transaction.findMany({
        select: {
            id: true,
            type: true,
            quantity: true,
            price: true,
            datetime: true,
            company:{
                select:{
                    name: true
                }
            }
        },
        where : {
            userId: {
                equals: id != null ? id : 0,
            },
            company: {
                name : {
                    contains: searchText,
                }
            }
        },
        orderBy: {
            datetime: "desc"
        }
    })
    let firstIndice = sliceIndice ? sliceIndice * 34 : 0;
    let lastIndice = sliceIndice ? (sliceIndice + 1 ) * 34 : 34;
    if (firstIndice > transactions.length - 34){
        firstIndice = Math.max(0,transactions.length - 34);
        lastIndice = transactions.length;
    }
    const slicedTransactions = transactions.slice(firstIndice,lastIndice)

    if (slicedTransactions.length === 0) {
        return (
            <tbody>
                <tr><td colSpan={6}>No transactions yet.</td></tr>
            </tbody>
        );
    }
    return (
        <tbody>
            {slicedTransactions.map((transaction) => {
                let date = transaction.datetime.getHours().toString() + ":" + transaction.datetime.getMinutes().toString() + " " + transaction.datetime.toDateString();
                return (
                    <tr key={transaction.id}>
                        <th>{transaction.company.name}</th><th>{transaction.type == "buy" ? "Buy" : "Sell"}</th><th>{transaction.quantity}</th><th>{transaction.price.toString()}$</th><th>{(transaction.price.mul(transaction.quantity)).toString()}$</th><th>{date}</th>
                    </tr>
                )
            })}
        </tbody>
    )

}