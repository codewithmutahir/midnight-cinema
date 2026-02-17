import type { Metadata } from "next";
import { AdminEditClient } from "@/components/admin/AdminEditClient";

export const metadata: Metadata = {
  title: "Edit post",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div>
      <AdminEditClient id={id} />
    </div>
  );
}
