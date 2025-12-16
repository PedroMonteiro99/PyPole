import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PyPole - F1 Analytics",
  description: "Formula 1 race data and analytics platform",
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
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-4 py-6">
                  <div className="flex justify-end mb-4">
                    <ThemeToggle />
                  </div>
                  {children}
                </div>
              </main>
            </div>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

