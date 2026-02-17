"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { isAdmin } from "@/lib/admin";

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [adminChecked, setAdminChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/?admin=1");
      return;
    }
    let cancelled = false;
    isAdmin(user.uid)
      .then((ok) => {
        if (!cancelled) {
          setAllowed(ok);
          setAdminChecked(true);
          if (!ok) router.replace("/?admin=denied");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAllowed(false);
          setAdminChecked(true);
          router.replace("/?admin=denied");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    );
  }

  if (!adminChecked || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <p className="text-[var(--text-muted)]">Checking access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
