import { auth } from "@/auth";
import { redirect } from "next/navigation";


export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  // The user's database record is created at sign-in (see auth.ts).

  return (
    <main>
      <h1>Welcome {session.user.name} to PortfolioLab.</h1>
    </main>
  );
}
