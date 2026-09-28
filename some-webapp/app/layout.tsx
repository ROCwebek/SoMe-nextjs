import type { Metadata } from "next";
import { NavBar } from "../components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "some-webapp",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main className="mx-auto max-w-160 p-4">{children}</main>
      </body>
    </html>
  );
}
