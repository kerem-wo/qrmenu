import type { ReactNode } from "react";
import { AdminBackButtonOverlay } from "./_components/AdminBackButtonOverlay";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <AdminBackButtonOverlay />
      {children}
    </div>
  );
}

