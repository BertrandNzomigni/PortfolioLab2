"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";


/**
 * A button component for navigating between slices of data.
 * @returns a Next.js button component that allows users to navigate between slices.
 */

export default function SliceButtons({id} : {id : number}){
    const [sliceIndice,setSliceIndice] = useState<number>(0);
    const searchParams = useSearchParams();
    const router = useRouter();

    function HandleSlice(sliceIndice: number){
        setSliceIndice(sliceIndice);
        if (sliceIndice < 0) {
            setSliceIndice(0);
        }

        const params = new URLSearchParams(searchParams);
        params.set("sliceIndice" + id.toString(), sliceIndice.toString());

        router.push(`${window.location.origin + window.location.pathname}?${params.toString()}`);
    }

    return (
        <div>
            <button onClick={() => HandleSlice(sliceIndice - 1)} disabled={sliceIndice === 0}>Previous</button> &nbsp;
            <button onClick={() => HandleSlice(sliceIndice + 1)}>Next</button>
        </div>
    );
}