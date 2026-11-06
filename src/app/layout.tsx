import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mufrodat Ceria | Belajar Bahasa Arab",
  description: "Media belajar mufrodat Bahasa Arab interaktif untuk kelas 4 SD."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
