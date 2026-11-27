
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import ProductForm from "../../ProductForm";
import { updateProduct } from "../../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return <p role="alert">Unable to load product.</p>;
  }

  if (!product) notFound();

  const { data: categories, error: categoryError } =
    await supabase
      .from("categories")
      .select("id, name")
      .order("name");

  if (categoryError || !categories?.length) {
    return <p role="alert">Unable to load categories.</p>;
  }

  const initialValues: Record<string, string> = {};

  for (const [key, value] of Object.entries(product)) {
    initialValues[key] =
      value === null || value === undefined
        ? ""
        : String(value);
  }

  initialValues.is_active = product.is_active ? "on" : "";

  const editAction = updateProduct.bind(null, id);

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Edit product</h1>
          <p className="adm-muted">
            Update details for {product.name}.
          </p>
        </div>
      </header>

      <ProductForm
        categories={categories}
        action={editAction}
        initialValues={initialValues}
        mode="edit"
      />
    </>
  );
}