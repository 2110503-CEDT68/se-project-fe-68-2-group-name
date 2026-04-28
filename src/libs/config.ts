const PUBLIC_API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://swdevprac-project-backend.vercel.app/api/v1";

const INTERNAL_API_BASE =
  process.env.INTERNAL_API_URL || PUBLIC_API_BASE;

export const API_BASE =
  typeof window === "undefined" ? INTERNAL_API_BASE : PUBLIC_API_BASE;