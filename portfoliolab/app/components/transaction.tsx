"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import buyOrSell from "@/app/actions/buy_or_sell";


/**
 * A component for handling stock transactions (buying or selling).
 * @param companyid The ID of the company for which to perform the transaction.
 * @param companyName The name of the company for which to perform the transaction.
 * @returns a Next.js component for handling stock transactions.
 */

export default function Transaction({
    companyid,
    companyName,
}: {
    companyid: number;
    companyName: string;
}) {
    const router = useRouter();

    const [transactionType, setTransactionType] =
        useState<"buy" | "sell">("buy");

    const [amount, setAmount] = useState<number>(0);

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    let placeholderText = "";

    if (transactionType === "buy") {
        placeholderText = "Stocks to buy";
    } else {
        placeholderText = "Stocks to sell";
    }

    async function doTransaction() {
        // Remove the previous error
        setErrorMessage(null);

        const result = await buyOrSell(
            companyid,
            transactionType,
            amount
        );

        if (!result.success) {
            setErrorMessage(result.error);
            return;
        }

        // Transaction succeeded
        router.refresh();
    }

    return (
        <div>
            <label>
                <input
                    type="radio"
                    name="transactionType"
                    value="buy"
                    onChange={() => setTransactionType("buy")}
                    checked={transactionType === "buy"}
                />
                Buy

                <input
                    type="radio"
                    name="transactionType"
                    value="sell"
                    onChange={() => setTransactionType("sell")}
                    checked={transactionType === "sell"}
                />
                Sell
            </label>

            <p>
                <input
                    type="number"
                    placeholder={placeholderText}
                    value={amount}
                    onChange={(e) =>
                        setAmount(parseFloat(e.target.value) || 0)
                    }
                />
            </p>

            {errorMessage && (
                <p style={{ color: "red" }} role="alert">
                    Error: {errorMessage}
                </p>
            )}

            <button onClick={doTransaction}>
                Submit
            </button>
        </div>
    );
}