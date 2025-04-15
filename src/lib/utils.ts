
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function classNames(...classes: (string | Record<string, boolean>)[]) {
  return classes
    .flatMap(cls => {
      if (typeof cls === 'string') return cls;
      return Object.entries(cls)
        .filter(([_, value]) => Boolean(value))
        .map(([key]) => key);
    })
    .filter(Boolean)
    .join(' ');
}
