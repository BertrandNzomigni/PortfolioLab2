"use client";

import { signIn } from "next-auth/react";


/**
 * Sign-in buttons for the providers enabled on the server.
 * @param google Show the "Sign in with Google" button.
 * @param demo Show the "Try the demo" button (shared demo account).
 * @returns a Next.js component with one button per enabled provider.
 */

export default function SignIn({ google, demo }: { google: boolean; demo: boolean }) {
  return (
    <div style={{ display: "flex", gap: "1em" }}>
      {demo && (
        <button onClick={() => signIn("demo", { callbackUrl: "/main" })}>
          Try the demo
        </button>
      )}
      {google && (
        <button onClick={() => signIn("google", { callbackUrl: "/main" })}>
          Sign in with Google
        </button>
      )}
      {!demo && !google && (
        <p>
          No sign-in method is configured. Set DEMO_MODE=true or the Google
          OAuth variables (AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET).
        </p>
      )}
    </div>
  );
}
