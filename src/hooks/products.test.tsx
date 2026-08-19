import { renderHook, waitFor } from "@testing-library/react";
import { useProducts } from "./products";
import { supabase } from "@/integrations/supabase/client";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches products successfully", async () => {
    const mockProducts = [
      { id: "1", name: "Product 1", price: 100, sort_order: 1 },
      { id: "2", name: "Product 2", price: 200, sort_order: 2 },
    ];

    (supabase.from as any)().select().order.mockResolvedValue({
      data: mockProducts,
      error: null,
    });

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProducts);
    expect(supabase.from).toHaveBeenCalledWith("products");
  });

  it("handles fetch error", async () => {
    const mockError = { message: "Fetch failed" };

    (supabase.from as any)().select().order.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
  });
});
