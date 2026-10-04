import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drops",
};

export default function DropsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
