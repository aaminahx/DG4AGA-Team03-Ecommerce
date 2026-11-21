import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  if (!supabase) redirect("/login?next=/admin");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="section adm">
      <nav className="adm-tabs" aria-label="Admin">
        <Link href="/admin" className="adm-tab adm-tab-on" aria-current="page">
          Dashboard
        </Link>
        <span className="adm-tab adm-tab-off" aria-disabled="true">
          Products <small>soon</small>
        </span>
        <span className="adm-tab adm-tab-off" aria-disabled="true">
          Orders <small>soon</small>
        </span>
      </nav>
      {children}
    </div>
  );
}