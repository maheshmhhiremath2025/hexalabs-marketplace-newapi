'use client';

import { usePathname } from 'next/navigation';
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { NavigationBar } from "@/components/layout/NavigationBar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/Providers";
// import { Chatbot } from "@/components/Chatbot";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLabPage = pathname?.startsWith('/lab/');

    if (isLabPage) {
        // Lab pages: no header, nav, or footer - full screen
        return (
            <html lang="en" suppressHydrationWarning>
                <body className={inter.className} suppressHydrationWarning>
                    <Providers>
                        {children}
                    </Providers>
                </body>
            </html>
        );
    }

    // Regular pages: with header, nav, and footer
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <Providers>
                    <Header />
                    <NavigationBar />
                    <main className="min-h-screen bg-gray-50 flex flex-col">
                        {children}
                    </main>
                    <Footer />
                    {/* <Chatbot /> */}
                </Providers>
            </body>
        </html>
    );
}
