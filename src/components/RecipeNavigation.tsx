"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RecipeIcon } from "@/components/RecipeIcon";

const items = [
  { href: "/", label: "Accueil", icon: "home" as const },
  { href: "/Recettes", label: "Recettes", icon: "book" as const },
  { href: "/Courses", label: "Courses", icon: "bag" as const },
  { href: "/Cadeaux", label: "Cadeaux", icon: "gift" as const },
];

export function RecipeNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-3 pt-2 backdrop-blur"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-lg justify-around">
        {items.map((item) => {
          const active = item.href === "/"
            ? pathname === "/"
            : item.href === "/Recettes"
              ? pathname === "/Recettes" || pathname.startsWith("/Recettes/")
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md text-xs transition-colors ${
                active ? "font-semibold text-blue" : "text-muted hover:text-blue"
              }`}
            >
              <RecipeIcon name={item.icon} className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}