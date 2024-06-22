import type { Metadata } from "next";
import "./globals.css";
import { ApplicationLayout } from "./application-layout";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    template: "%s - Titan",
    default: "Titan",
  },
  description: "Manage all your StarkNet positions in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className="w-full h-full text-zinc-950 antialiased lg:bg-zinc-100  dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950"
    >
      <Providers>
        <body className="h-full w-full">
          <ApplicationLayout>{children}</ApplicationLayout>
        </body>
      </Providers>
    </html>
  );
}
