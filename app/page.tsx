import { redirect } from "next/navigation";
import SignIn from "@/app/components/sign-in";
import { auth, demoEnabled, googleEnabled } from "@/auth";

export default async function Home() {
  // Signed-in users go straight to the app.
  const session = await auth();
  if (session?.user) {
    redirect("/main");
  }

  return (
    <main>
      <div style={{alignItems: 'center',marginLeft: '16em',marginTop:'16em'}}>
        <h1 style={{fontSize: 50}} >PortfolioLab</h1>
        <p style={{marginBottom: '1.5em'}}>
          Paper-trade S&amp;P 500 stocks with a virtual 30,000 $ portfolio.
        </p>
        <SignIn google={googleEnabled} demo={demoEnabled} />
      </div>
    </main>
  );
}
