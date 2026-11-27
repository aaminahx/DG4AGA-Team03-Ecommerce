
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminTabs from "./AdminTabs";

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
      <AdminTabs />
      {children}
    </div>
  );
}
