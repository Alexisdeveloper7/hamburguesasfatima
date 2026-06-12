import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import CartBarControl from "@/components/CartBarControl";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Hamburguesas Fátima | Menú Digital",
  description: "Consulta el menú y ordena fácil desde tu celular",

  icons: {
    icon: "/logo.jpeg",
    shortcut: "/logo.jpeg",
    apple: "/logo.jpeg",
  },

  openGraph: {
    title: "Hamburguesas Fátima | Menú Digital",
    description: "Consulta el menú y ordena fácil desde tu celular",
    url: "https://tudominio.com",
    siteName: "Hamburguesas Fátima",
    images: [
      {
        url: "/logo.jpeg",
        width: 1200,
        height: 630,
        alt: "Hamburguesas Fátima",
      },
    ],
    locale: "es_MX",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Hamburguesas Fátima | Menú Digital",
    description: "Consulta el menú y ordena fácil desde tu celular",
    images: ["/logo.jpeg"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d94b16",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es-MX"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="flex min-h-svh flex-col overflow-x-hidden bg-[#d94b16] font-sans antialiased">
        <Header />

        <main className="flex flex-1 flex-col bg-[radial-gradient(circle_at_top,#ff8b24_0%,#d94b16_45%,#9f2d0c_100%)] text-white">
          {children}
          <CartBarControl />
        </main>

        <Footer />
      </body>
    </html>
  );
}