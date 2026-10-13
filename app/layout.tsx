import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoomShift 360 — AI spatial redesign",
  description: "Turn a 360 room capture into an editable spatial concept.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
