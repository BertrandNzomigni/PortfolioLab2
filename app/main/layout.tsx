import Navbar from "../components/navbar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const session = await auth();
    
    if (!session?.user) {
        redirect("/")
    }
  return (
    <div>
        <Navbar></Navbar>
        {process.env.SIMULATED_PRICES !== "false" && (
            <p className="bg-amber-50 px-6 py-2 text-sm text-amber-900">
                Demo data: stock prices are simulated and are not real market data.
            </p>
        )}
        {children}
    </div>
  );
}