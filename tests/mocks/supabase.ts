import { vi } from "vitest";

/**
 * Minimal chainable Supabase mock factory for smoke tests.
 * Extend per-test by overriding terminal methods (single, then, etc.).
 */
export const createSupabaseMock = (overrides: Partial<Record<string, unknown>> = {}) => {
  const builder: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  };

  return {
    from: vi.fn(() => builder),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  };
};

export const createMockUser = (overrides: Partial<{ id: string; email: string }> = {}) => ({
  id: "user-123",
  email: "admin@test.com",
  ...overrides,
});

export const createMockProduct = (overrides: Record<string, unknown> = {}) => ({
  id: "prod-1",
  name: "Camiseta Test",
  price: 99.9,
  status: "active",
  category_id: "cat-1",
  ...overrides,
});

export const createMockOrder = (overrides: Record<string, unknown> = {}) => ({
  id: "order-1",
  order_number: 1001,
  status: "aguardando_pagamento",
  total: 199.8,
  payment_method: "pix",
  ...overrides,
});
