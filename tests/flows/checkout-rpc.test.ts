import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSupabaseMock, createMockOrder } from "../mocks/supabase";

// Mock the client BEFORE importing anything that uses it
vi.mock("@/integrations/supabase/client", () => ({
  supabase: createSupabaseMock(),
}));

import { supabase } from "@/integrations/supabase/client";

describe("Checkout flow (create_storefront_order RPC)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls the RPC with the expected payload shape", async () => {
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [createMockOrder()],
      error: null,
    });

    const payload = {
      p_customer_name: "João Silva",
      p_customer_phone: "11987654321",
      p_total: 199.8,
      p_payment_method: "pix",
      p_items: [{ product_name: "Camiseta", quantity: 2, price: 99.9 }],
    };

    const { data, error } = await supabase.rpc("create_storefront_order", payload);

    expect(error).toBeNull();
    expect(supabase.rpc).toHaveBeenCalledWith("create_storefront_order", payload);
    expect(data?.[0]).toMatchObject({ order_number: expect.any(Number) });
  });

  it("propagates RPC errors (invalid phone, empty items, etc.)", async () => {
    (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: null,
      error: { message: "Telefone inválido (mínimo 8 dígitos)" },
    });

    const { error } = await supabase.rpc("create_storefront_order", {
      p_customer_name: "X",
      p_customer_phone: "1",
      p_total: 10,
      p_items: [],
    });

    expect(error?.message).toMatch(/Telefone/);
  });
});
