// app/companies/CompanySearch.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";


/**
 * A search input for filtering companies by name.
 * @returns A Next.js input component that updates the URL search parameters based on user input.
 */


export default function SearchBar({id,placeholder} : {id : number,placeholder : string}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(
        searchParams.get("search") ?? ""
    );

    function handleSearch(value: string) {
        setSearch(value);

        const params = new URLSearchParams(searchParams);

        if (value) {
            params.set("search" + id.toString(), value);
        } else {
            params.delete("search" + id.toString());
        }

        router.push(`${window.location.origin + window.location.pathname}?${params.toString()}`);
    }

    return (
        <input
            type="text"
            placeholder= {placeholder}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
        />
    );
}