import type { Metadata } from "next";
import { BoltProvider } from "./bolt-provider";

export const metadata: Metadata = {
  title: "Bolt-style Menu Demo",
  description: "Menu listing + add product demo (Bolt Food inspired)",
};

export default function BoltLayout({ children }: { children: React.ReactNode }) {
  return (
    <BoltProvider>
      <div className="min-h-screen bg-white text-black">{children}</div>
    </BoltProvider>
  );
}

