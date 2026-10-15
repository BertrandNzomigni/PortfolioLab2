"use client";

import { useRouter } from "next/navigation";


/** A button that navigates back to the previous page in the browser history.
 * @returns a Next.js button component that navigates back when clicked.
 */

export default function GoBackButton() {
  const router = useRouter();

  return (
    <button onClick={() => router.back()}>Go Back</button>
  );
}