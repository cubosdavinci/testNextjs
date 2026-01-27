import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  return Array.from(array)
    .map((value) => charset[value % charset.length])
    .join('');
}
/*
export function consoleLog(message: string, variable?: any) {
  // ✅ Global logging toggle
  if (!(process.env.NEXT_PUBLIC_CONSOLE_LOG_ENABLED === "true")) return;

  // ✅ Print message + var (if provided)
  if (typeof variable !== "undefined") {
    console.log(`${message}:`, variable);
  } else {
    console.log(`${message}`);
  }
}*/

export function consoleLog(message: string, variable?: any) {
  // Determine environment toggle
  const isEnabled =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_CONSOLE_LOG_ENABLED === "true" // client
      : process.env.CONSOLE_LOG_ENABLED === "true"; // server

  if (!isEnabled) return;

  // Add context label
  const context = typeof window !== "undefined" ? "CLIENT" : "SERVER";

  if (typeof variable !== "undefined") {
    console.log(`[${context}] ${message}:`, variable);
  } else {
    console.log(`[${context}] ${message}`);
  }
}


export function browserConsoleLog(message: string, variable?: any) {
  // Only log if NEXT_PUBLIC flag is "true"
  if (process.env.NEXT_PUBLIC_CONSOLE_LOG_ENABLED !== "true") return;

  if (variable !== undefined) {
    console.log(`${message}:`, variable);
  } else {
    console.log(message);
  }
}


export function printTime(){
  return new Date().toISOString();
} 



// Utility to get tree_id for a given product type
export function getTreeId(productType: string): number {
  const mapping: Record<string, number> = {
    "3d": 1,
    "2d": 2,
    "video": 3,
    // add other product types here
  };
  const treeId = mapping[productType];
  if (!treeId) throw new Error(`No tree_id mapping found for productType: ${productType}`);
  return treeId;
}

// Helper: CapitalCase
export function toCapitalCase(str: string) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function toCapital(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}