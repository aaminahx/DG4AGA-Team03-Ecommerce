import { createClient } from "@/lib/supabase/server";
import ProductForm from "../ProductForm";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const supabase = (await createClient())!;
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Add a product</h1>
          <p className="adm-muted">Fields marked * are required.</p>
        </div>
      </header>
      {categories && categories.length > 0 ? (
        <ProductForm categories={categories} action={createProduct} />
      ) : (
        <p className="adm-empty">Create a category in Supabase first, then come back.</p>
      )}
    </>
  );
}