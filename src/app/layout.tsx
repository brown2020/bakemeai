import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthListener } from "@/components/AuthListener";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Bake.me",
  description: "AI-powered recipe generation platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthListener />
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
