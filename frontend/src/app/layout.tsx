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
          <header className="header">
            <h1>PhoenixBank</h1>
            <div className="header-user">
              <span>Good morning, User</span>
              <div className="avatar">U</div>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
