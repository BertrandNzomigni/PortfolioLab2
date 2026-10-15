"use client";

import { useRouter } from "next/navigation";


/**
 * A button that navigates to the details page for a specific company.
 * @param companyid The ID of the company for which to view details.
 * @returns a Next.js button component that navigates to the company's details page when clicked.
 */


export default function CompanyDetailsButton({ companyid }: { companyid: number }) {
    const router = useRouter();

    return (
        <button onClick={() => router.push(`/main/stocks/${companyid}/details`)}>
            View Details
        </button>
    );
}