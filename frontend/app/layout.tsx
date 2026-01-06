import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PyPole - F1 Analytics",
  description: "Formula 1 race data and analytics platform",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
