import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import Layout from "@/components/Layout";
import { APP_DESC, APP_TITLE } from "@lib/constants";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESC,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
