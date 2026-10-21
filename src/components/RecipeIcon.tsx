import type { ReactNode } from "react";

export type RecipeIconName =
  | "home"
  | "book"
  | "plus"
  | "search"
  | "clock"
  | "users"
  | "back"
  | "edit"
  | "trash"
  | "close"
  | "image"
  | "bag"
  | "gift";

const paths: Record<RecipeIconName, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M4 16a2 2 0 0 1 2-2h14M8 7h7" /></>,
  plus: <path d="M12 5v14m-7-7h14" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  back: <path d="m15 18-6-6 6-6M9 12h12" />,
  edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z" /><path d="M4 20h16" /></>,
  trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6" /><path d="M10 11v5m4-5v5" /></>,
  close: <path d="m18 6-12 12M6 6l12 12" />,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></>,
  bag: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  gift: <><path d="M3 10h18v11H3zM2 6h20v4H2zM12 6v15" /><path d="M12 6H8.5a2.5 2.5 0 1 1 2.5-2.5V6Zm0 0h3.5a2.5 2.5 0 1 0-2.5-2.5V6Z" /></>,
};

export function RecipeIcon({
  name,
  className = "size-5",
}: {
  name: RecipeIconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}