"use client";

import dynamic from "next/dynamic";

const AdminToolbar = dynamic(() => import("@/components/AdminToolbar"), {
  ssr: false,
});

export default function AdminToolbarLoader() {
  return <AdminToolbar />;
}
