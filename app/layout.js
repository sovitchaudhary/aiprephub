import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI PrepHub",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    // <ClerkProvider appearance={{ baseTheme: dark }}>
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            // defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/* header section */}
            <Header />
            <main className="min-h-screen">{children}</main>
            {/* footer section */}
            <footer className="bg-muted/50 py-12">
              <div className="container mx-auto px-4 text-center text-gray-300">
                <p className="text-black">developed by SMJ Group</p>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
