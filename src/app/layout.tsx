import NextAuthProvider from "@/provider/NextAuthProvider";
import TanStackQueryProvider from "@/provider/TanstackProvider";
import { ThemeProvider } from "@/provider/theme-provider";
import "@/styles/globals.css";
import { type Metadata } from "next";
import { Inter } from "next/font/google";
import ErrorBoundary from "@/components/error-boundary";

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Presentation AI - Create with AI",
  description: "AI-powered presentation creator. Transform your ideas into stunning presentations, documents, and webpages with advanced AI technology.",
  keywords: ["AI presentation", "presentation maker", "AI content creation", "slide generator", "document creator"],
  authors: [{ name: "Presentation AI Team" }],
  openGraph: {
    title: "Presentation AI - Create with AI",
    description: "Transform your ideas into stunning presentations with AI",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Presentation AI - Create with AI",
    description: "Transform your ideas into stunning presentations with AI",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TanStackQueryProvider>
      <NextAuthProvider>
        <html lang="en" suppressHydrationWarning>
          <body className={`${inter.className} antialiased`} suppressHydrationWarning>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </ThemeProvider>
          </body>
        </html>
      </NextAuthProvider>
    </TanStackQueryProvider>
  );
}
