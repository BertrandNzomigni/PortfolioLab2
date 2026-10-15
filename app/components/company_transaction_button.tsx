"use client";

import { useRouter } from "next/navigation";


/**
 * A button that navigates to the transaction page for a specific company.
 * @param companyid The ID of the company for which to view transactions.
 * @returns a Next.js button component that navigates to the company's transaction page when clicked.
 */

export default function CompanyTransactionButton({ companyid }: { companyid: number }) {
    const router = useRouter();

    return (
        <button onClick={() => router.push(`/main/stocks/${companyid}`)}>
            Buy/Sell stocks
        </button>
    );
}