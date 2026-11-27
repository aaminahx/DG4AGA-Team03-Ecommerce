
"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ProductFormState } from "./actions";

type Props = {
  categories: { id: string; name: string }[];
  action: (
    prev: ProductFormState,
    formData: FormData
  ) => Promise<ProductFormState>;
  initialValues?: Record<string, string>;
  mode?: "create" | "edit";
};

const initial: ProductFormState = {};

type Opts = {
  type?: string;
  required?: boolean;
  hint?: string;
  rows?: number;
  max?: number;
  step?: string;
  min?: number;
  placeholder?: string;
};

export default function ProductForm({
  categories,
  action,
  initialValues,
  mode = "create",
}: Props) {
  const [state, formAction, pending] = useActionState(
    action,
    initialValues ? { values: initialValues } : initial
  );

  // Retrieve existing or previously submitted values.
  const v = (name: string) =>
    state.values?.[name] ?? initialValues?.[name] ?? "";

  // Retrieve individual field validation errors.
  const err = (name: string) =>
    state.fieldErrors?.[name];

  // Reusable form field.
  const field = (
    name: string,
    label: string,
    o: Opts = {}
  ) => {
    const id = `f-${name}`;

    const describedBy =
      [
        o.hint ? `h-${name}` : "",
        err(name) ? `e-${name}` : "",
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    const common = {
      id,
      name,
      defaultValue: v(name),
      required: o.required,
      maxLength: o.max,
      placeholder: o.placeholder,
      "aria-invalid": err(name) ? true : undefined,
      "aria-describedby": describedBy,
    } as const;

    return (
      <div className="adm-field">
        <label htmlFor={id}>
          {label}
          {o.required && (
            <span
              className="adm-required"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>

        {o.rows ? (
          <textarea {...common} rows={o.rows} />
        ) : (
          <input
            {...common}
            type={o.type ?? "text"}
            step={o.step}
            min={o.min}
          />
        )}

        {o.hint && (
          <small id={`h-${name}`}>
            {o.hint}
          </small>
        )}

        {err(name) && (
          <small
            id={`e-${name}`}
            className="adm-err"
          >
            {err(name)}
          </small>
        )}
      </div>
    );
  };

  return (
    <form
      action={formAction}
      className="adm-product-form"
      noValidate
    >
      {/* General form error */}
      {state.error && (
        <p role="alert" className="adm-alert">
          {state.error}
        </p>
      )}

      {/* Basic product information */}
      <fieldset className="adm-card">
        <legend>Basic information</legend>

        <p className="adm-section-description">
          Enter the essential information about your product.
        </p>

        {field("name", "Product name", {
          required: true,
          max: 120,
          placeholder: "e.g. LED Energy Saving Bulb",
        })}

        <div className="adm-field">
          <label htmlFor="f-category_id">
            Category
            <span
              className="adm-required"
              aria-hidden="true"
            >
              *
            </span>
          </label>

          <select
            id="f-category_id"
            name="category_id"
            defaultValue={v("category_id")}
            required
            aria-invalid={
              err("category_id") ? true : undefined
            }
            aria-describedby={
              err("category_id")
                ? "e-category_id"
                : undefined
            }
          >
            <option value="">
              Select a product category…
            </option>

            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {err("category_id") && (
            <small
              id="e-category_id"
              className="adm-err"
            >
              {err("category_id")}
            </small>
          )}
        </div>

        {field("description", "Description", {
          required: true,
          rows: 4,
          max: 1000,
          placeholder:
            "Describe the product, its features and benefits...",
          hint:
            "10 to 1000 characters. This is what shoppers read.",
        })}
      </fieldset>

      {/* Pricing, stock and visibility */}
      <fieldset className="adm-card">
        <legend>Pricing &amp; inventory</legend>

        <p className="adm-section-description">
          Manage product pricing, stock levels and availability.
        </p>

        <div className="adm-form-grid">
          {field("price", "Price (£)", {
            required: true,
            type: "number",
            step: "0.01",
            min: 0,
            placeholder: "0.00",
          })}

          {field("stock_quantity", "Stock quantity", {
            required: true,
            type: "number",
            step: "1",
            min: 0,
            placeholder: "0",
          })}
        </div>

        {field("price_note", "Price note", {
          max: 200,
          placeholder: "Optional pricing information",
          hint: "Optional, e.g. “price checked on 1 Nov”.",
        })}

        <label className="adm-visibility">
          <span>
            <strong>Visible to shoppers</strong>
            <small>
              Show this product in the EcoHome online shop.
            </small>
          </span>

          <input
            type="checkbox"
            name="is_active"
            aria-label="Visible to shoppers"
            defaultChecked={
              state.values
                ? state.values.is_active === "on"
                : initialValues
                  ? initialValues.is_active === "on"
                  : mode === "create"
            }
          />
        </label>
      </fieldset>

      {/* Additional product information */}
      <fieldset className="adm-card">
        <legend>Product specifications</legend>

        <p className="adm-section-description">
          Provide additional technical details to help
          customers make informed purchasing decisions.
        </p>

        <div className="adm-form-grid">
          {field("brand", "Brand", {
            max: 80,
            placeholder: "e.g. Philips",
          })}

          {field("model_code", "Model code", {
            max: 80,
            placeholder: "Enter model number",
          })}

          {field("product_type", "Product type", {
            max: 80,
            placeholder: "e.g. LED bulb",
          })}

          {field("colour", "Colour", {
            max: 40,
            placeholder: "e.g. Warm white",
          })}

          {field("size_capacity", "Size / capacity", {
            max: 80,
            placeholder: "Enter size or capacity",
          })}

          {field("pack_of", "Pack of", {
            type: "number",
            step: "1",
            min: 1,
            placeholder: "1",
            hint: "Defaults to 1 if left blank.",
          })}
        </div>

        {field("warranty", "Warranty", {
          max: 120,
          placeholder: "e.g. 2-year manufacturer warranty",
        })}

        {field("specifications", "Specifications", {
          rows: 3,
          max: 1000,
          placeholder:
            "Enter technical specifications and product features...",
        })}
      </fieldset>

      {/* Energy-saving information */}
      <fieldset className="adm-card">
        <legend>Energy &amp; sustainability</legend>

        <p className="adm-section-description">
          Explain how this product helps customers reduce
          energy consumption and environmental impact.
        </p>

        {field("energy_saving", "Energy saving", {
          rows: 3,
          max: 500,
          placeholder:
            "Describe the energy-saving benefits...",
          hint:
            "Only include claims you can back up with a source.",
        })}

        {field("drawbacks", "Drawbacks", {
          rows: 3,
          max: 500,
          placeholder:
            "Describe any limitations or considerations...",
        })}
      </fieldset>

      {/* Product image and sources */}
      <fieldset className="adm-card">
        <legend>Images &amp; sources</legend>

        <p className="adm-section-description">
          Add product imagery and supporting references.
        </p>

        {field("image_url", "Image web address", {
          type: "url",
          max: 500,
          placeholder: "https://...",
          hint:
            "Use an image you have the licence to use.",
        })}

        <div className="adm-form-grid">
          {field("where_listed", "Where it's listed", {
            max: 120,
            placeholder: "e.g. Manufacturer website",
          })}

          {field("source_link", "Source link", {
            type: "url",
            max: 500,
            placeholder: "https://...",
          })}
        </div>
      </fieldset>

      {/* Form actions */}
      <div className="adm-form-actions">
        <Link
          href="/admin/products"
          className="adm-cancel"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={pending}
        >
          {pending
            ? "Saving…"
            : mode === "edit"
              ? "Save changes"
              : "+ Add product"}
        </button>
      </div>
    </form>
  );
}
