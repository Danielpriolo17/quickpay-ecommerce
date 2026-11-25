export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  BASE_FEE_IN_CENTS: Number(import.meta.env.VITE_BASE_FEE_IN_CENTS || 300000),
  DELIVERY_FEE_IN_CENTS: Number(
    import.meta.env.VITE_DELIVERY_FEE_IN_CENTS || 1000000,
  ),
};