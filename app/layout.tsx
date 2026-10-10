import "./globals.css";
import { DM_Mono, DM_Sans, Manrope } from "next/font/google";
import type { ReactNode } from "react";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const dmMono = DM_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-dm-mono", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata = {
  title: "Stellar Sentinel | Account intelligence",
  description:
    "Screen Stellar accounts with explainable activity signals and review Soroban contract flag events.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
