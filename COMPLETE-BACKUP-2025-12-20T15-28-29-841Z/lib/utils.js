import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Based on Orchids design system utilities
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Variant props utility for component variants
 * Simplified version of class-variance-authority for JavaScript
 */
export function cva(base, config = {}) {
  return function(props = {}) {
    let classes = base;
    
    if (config.variants) {
      Object.entries(config.variants).forEach(([key, variants]) => {
        const value = props[key] || config.defaultVariants?.[key];
        if (value && variants[value]) {
          classes += ' ' + variants[value];
        }
      });
    }
    
    return classes;
  };
}