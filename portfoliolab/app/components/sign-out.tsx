"use client";

import { signOut } from "next-auth/react";



/**
 * A button that allows users to sign out of their account.
 * @returns a Next.js button component that triggers the sign-out process when clicked.
 */

export default function SignOut() {
  return (
    <button onClick={() => signOut()}>
      Sign out
    </button>
  );
}