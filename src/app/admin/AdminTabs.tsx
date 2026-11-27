"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
];

const UPCOMING = [
  "Returns",
  "Enquiries",
];

export default function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="adm-tabs" aria-label="Admin">
      {TABS.map((tab) => {
        const active =
          tab.href === "/admin"
            ? pathname === "/admin"
            : pathname === tab.href ||
              pathname.startsWith(tab.href + "/");

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              active
                ? "adm-tab adm-tab-on"
                : "adm-tab"
            }
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}

      {UPCOMING.map((label) => (
        <span
          key={label}
          className="adm-tab adm-tab-off"
          aria-disabled="true"
        >
          {label} <small>soon</small>
        </span>
      ))}
    </nav>
  );
}