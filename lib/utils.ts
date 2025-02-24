import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...classes: unknown[]) {
  return twMerge(clsx(classes));
}
