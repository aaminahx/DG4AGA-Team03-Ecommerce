
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ==========================================
// ADMIN SECURITY
// ==========================================

async function adminClient() {
  const supabase = await createClient();

  if (!supabase) {
    throw new Error("Not configured");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not signed in");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || profile?.role !== "admin") {
    throw new Error("Not allowed");
  }

  return supabase;
}

// ==========================================
// REFRESH WEBSITE DATA
// ==========================================

function refresh(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/products");

  if (id) {
    revalidatePath(`/products/${id}`);
    revalidatePath(`/admin/products/${id}/edit`);
  }
}

// ==========================================
// QUICK STOCK UPDATE
// ==========================================

export async function setStock(formData: FormData) {
  const supabase = await adminClient();

  const id = String(formData.get("id") ?? "");
  const raw = String(formData.get("stock") ?? "").trim();
  const stock = Number(raw);

  if (
    !UUID.test(id) ||
    !/^\d+$/.test(raw) ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    stock > 100000
  ) {
    throw new Error("Invalid stock quantity.");
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      stock_quantity: stock,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Stock update failed:", error?.code);
    throw new Error("Unable to update stock.");
  }

  refresh(id);
}

// ==========================================
// QUICK VISIBILITY UPDATE
// ==========================================

export async function setActive(formData: FormData) {
  const supabase = await adminClient();

  const id = String(formData.get("id") ?? "");
  const raw = formData.get("active");

  if (
    !UUID.test(id) ||
    (raw !== "true" && raw !== "false")
  ) {
    throw new Error("Invalid product status.");
  }

  const active = raw === "true";

  const { data, error } = await supabase
    .from("products")
    .update({
      is_active: active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Visibility update failed:", error?.code);
    throw new Error("Unable to update product visibility.");
  }

  refresh(id);
}

// ==========================================
// PRODUCT FORM STATE
// ==========================================

export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const TEXT_LIMITS: Record<string, number> = {
  brand: 80,
  model_code: 80,
  product_type: 80,
  colour: 40,
  size_capacity: 80,
  specifications: 1000,
  energy_saving: 500,
  drawbacks: 500,
  warranty: 120,
  price_note: 200,
  where_listed: 120,
};

// ==========================================
// URL VALIDATION
// ==========================================

function validUrl(value: string) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}

// ==========================================
// SHARED PRODUCT VALIDATION
// ==========================================

async function validateProduct(
  supabase: Awaited<ReturnType<typeof adminClient>>,
  formData: FormData
) {
  const values: Record<string, string> = {};

  const allowedFields = [
    "name",
    "category_id",
    "description",
    "price",
    "stock_quantity",
    "pack_of",
    "is_active",
    "image_url",
    "source_link",
    ...Object.keys(TEXT_LIMITS),
  ];

  for (const key of allowedFields) {
    const value = formData.get(key);

    if (typeof value === "string") {
      values[key] = value;
    }
  }

  const get = (key: string) =>
    (values[key] ?? "").trim();

  const fieldErrors: Record<string, string> = {};

  // Product name
  const name = get("name");

  if (name.length < 2 || name.length > 120) {
    fieldErrors.name =
      "Enter a name of 2 to 120 characters.";
  }

  // Category
  const categoryId = get("category_id");

  if (!UUID.test(categoryId)) {
    fieldErrors.category_id = "Choose a category.";
  } else {
    const { data: category, error } = await supabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .maybeSingle();

    if (error || !category) {
      fieldErrors.category_id =
        "Choose a valid category.";
    }
  }

  // Description
  const description = get("description");

  if (
    description.length < 10 ||
    description.length > 1000
  ) {
    fieldErrors.description =
      "Enter a description of 10 to 1000 characters.";
  }

  // Price
  const priceRaw = get("price");

  if (!/^\d{1,8}(\.\d{1,2})?$/.test(priceRaw)) {
    fieldErrors.price =
      "Enter a price like 12.99 (no currency symbol).";
  }

  // Stock quantity
  const stockRaw = get("stock_quantity");
  const stock = Number(stockRaw);

  if (
    !/^\d+$/.test(stockRaw) ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    stock > 100000
  ) {
    fieldErrors.stock_quantity =
      "Enter a whole number from 0 to 100000.";
  }

  // Pack quantity
  const packRaw = get("pack_of");
  let packOf = 1;

  if (packRaw !== "") {
    packOf = Number(packRaw);

    if (
      !/^\d+$/.test(packRaw) ||
      !Number.isInteger(packOf) ||
      packOf < 1 ||
      packOf > 1000
    ) {
      fieldErrors.pack_of =
        "Enter a whole number from 1 to 1000, or leave blank.";
    }
  }

  // Image and source URLs
  for (const key of ["image_url", "source_link"]) {
    const value = get(key);

    if (
      value !== "" &&
      (value.length > 500 || !validUrl(value))
    ) {
      fieldErrors[key] =
        "Enter a valid HTTP or HTTPS web address, or leave blank.";
    }
  }

  // Optional product information
  const optionalText: Record<string, string | null> = {};

  for (const [key, max] of Object.entries(TEXT_LIMITS)) {
    const value = get(key);

    if (value.length > max) {
      fieldErrors[key] =
        `Use no more than ${max} characters.`;
    }

    optionalText[key] =
      value === "" ? null : value;
  }

  // Visibility
  const activeValue = formData.get("is_active");

  if (activeValue !== null && activeValue !== "on") {
    fieldErrors.is_active = "Invalid visibility setting.";
  }

  // Return validation errors
  if (Object.keys(fieldErrors).length > 0) {
    return {
      values,
      fieldErrors,
      product: null,
    };
  }

  // Validated product information
  return {
    values,
    fieldErrors,
    product: {
      category_id: categoryId,
      name,
      description,
      price: Number(priceRaw),
      stock_quantity: stock,
      is_active: activeValue === "on",
      image_url: get("image_url") || null,
      source_link: get("source_link") || null,
      pack_of: packOf,
      ...optionalText,
    },
  };
}

// ==========================================
// CREATE NEW PRODUCT
// ==========================================

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await adminClient();

  const { values, fieldErrors, product } =
    await validateProduct(supabase, formData);

  if (!product) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors,
      values,
    };
  }

  const { error } = await supabase
    .from("products")
    .insert(product);

  if (error) {
    console.error("createProduct failed:", error.code);

    return {
      error: "Could not save the product. Please try again.",
      values,
    };
  }

  refresh();

  redirect("/admin/products?added=1");
}

// ==========================================
// EDIT EXISTING PRODUCT
// ==========================================

export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await adminClient();

  if (!UUID.test(id)) {
    return {
      error: "Invalid product ID.",
    };
  }

  const { values, fieldErrors, product } =
    await validateProduct(supabase, formData);

  if (!product) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors,
      values,
    };
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      ...product,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("updateProduct failed:", error?.code);

    return {
      error: "Could not update the product. Please try again.",
      values,
    };
  }

  refresh(id);

  redirect("/admin/products?updated=1");
}
