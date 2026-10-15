"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
    {
        name: "Stocks",
        href: "/main/stocks",
    },
    {
        name: "Dashboard",
        href: "/main/dashboard",
    },
    {
        name: "Transactions",
        href: "/main/transactions"
    }
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
                
                {/* Logo */}
                <Link
                    href="/main"
                    className="mr-10 text-xl font-bold tracking-tight text-gray-900"
                >
                    PortfolioLab
                </Link>

                {/* Navigation */}
                <div className="flex h-full items-center gap-1">
                    {navigation.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            pathname.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex h-full items-center px-4 text-sm font-medium transition-colors ${
                                    isActive
                                        ? "text-gray-900"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                            >
                                {item.name}

                                {isActive && (
                                    <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gray-900" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Right side */}
                <div className="ml-auto flex items-center gap-4">
                    <Link
                        href="/main/profile"
                        className={`text-sm font-medium transition-colors ${
                            pathname === "/profile"
                                ? "text-gray-900"
                                : "text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        Profile
                    </Link>
                </div>
            </div>
        </nav>
    );
}