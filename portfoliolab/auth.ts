import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

/** Email of the shared account used by the demo login. */
export const DEMO_EMAIL = "demo@portfoliolab.local";

/** Cash given to every new account. */
const STARTING_MONEY = 30000;

/** True when the "Try the demo" login is enabled (DEMO_MODE=true). */
export const demoEnabled = process.env.DEMO_MODE === "true";

/** True when Google OAuth credentials are configured. */
export const googleEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

const providers: Provider[] = [];

if (googleEnabled) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

if (demoEnabled) {
  // Passwordless shared account so reviewers can try the app without
  // creating a Google OAuth client. Only active when DEMO_MODE=true.
  providers.push(
    Credentials({
      id: "demo",
      name: "Demo account",
      credentials: {},
      authorize: async () => ({
        id: "demo",
        name: "Demo User",
        email: DEMO_EMAIL,
      }),
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  callbacks: {
    // Make sure every signed-in user has a database record before any page
    // that reads their balance or portfolio is rendered.
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: { email: user.email, money: STARTING_MONEY },
      });
      return true;
    },
  },
});
