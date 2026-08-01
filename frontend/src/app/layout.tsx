import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhoenixBank | Welcome",
  description: "A Resilient, Zero-Trust Digital Banking Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
