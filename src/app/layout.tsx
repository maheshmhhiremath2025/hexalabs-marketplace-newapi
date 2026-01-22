import type { Metadata } from "next";
import "./globals.css";
import RootLayoutClient from "@/components/layout/RootLayoutClient";

export const metadata: Metadata = {
  title: "Hexalabs Marketplace for Microsoft Partners",
  description: "Premier Lab Training Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootLayoutClient>{children}</RootLayoutClient>;
}
