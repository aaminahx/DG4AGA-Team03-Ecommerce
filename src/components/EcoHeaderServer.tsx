
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import EcoHeader from "./EcoHeader";

export default async function EcoHeaderServer() {
  const supabase = await createClient();

  let products: Product[] = [];

  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select(
        "id,name,description,price,stock_quantity,image_url,category:categories(name)"
      )
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("ECOHOME AI PRODUCT ERROR:", error);
    } else if (data) {
      products = data as unknown as Product[];
    }
  }

  return <EcoHeader products={products} />;
}
