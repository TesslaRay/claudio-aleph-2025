// Next
import type { Metadata } from "next";
import { headers } from "next/headers";

// Fonts
import localFont from "next/font/local";
import { Exo_2 } from "next/font/google";

// Styles
import "./globals.css";

// Context Wagmi
import ContextProvider from "../../context";

const nocturne = localFont({
  src: "../../public/assets/fonts/NocturneSerif-Regular.ttf",
  variable: "--font-nocturne",
});

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-exo2",
});

export const metadata: Metadata = {
  title: "Claudio Onchain Agent",
  description: "Claudio Onchain Agent",
  openGraph: {
    title: "Claudio Onchain Agent",
    description: "Claudio Onchain Agent",
    url: "",
    siteName: "Claudio Onchain Agent",
    type: "website",
    images: [
      {
        url: "assets/cover.jpg",
        alt: "Frontend web3 hackathon starter",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = headers();
  const cookies = cookieStore.toString();

  return (
    <html lang="en" className={`${nocturne.variable} ${exo2.variable}`}>
      <body className={`${nocturne.className} antialiased`}>
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  );
}
