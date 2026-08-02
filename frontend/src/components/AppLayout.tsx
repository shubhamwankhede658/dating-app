import type { ReactNode } from "react";
import BottomNav from "./BottomNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-container">
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>{children}</div>
      <BottomNav />
    </div>
  );
}