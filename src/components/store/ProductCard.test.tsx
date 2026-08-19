import { render, screen, fireEvent } from "@testing-library/react";
import ProductCard from "./ProductCard";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock hooks
vi.mock("@/hooks/useStoreData", () => ({
  useStoreSettings: vi.fn(() => ({
    data: { pix_discount: "5" },
    isLoading: false,
  })),
}));

vi.mock("@/hooks/useFavorites", () => ({
  useFavorites: vi.fn(() => ({
    isFavorite: vi.fn(() => false),
    toggleFavorite: vi.fn(),
  })),
}));

const mockProduct = {
  id: 1,
  name: "Street Dex T-Shirt",
  price: 100,
  oldPrice: 150,
  img: "image1.jpg",
  img2: "image2.jpg",
  sizes: ["P", "M", "G"],
  colors: ["#000000"],
  freeShipping: true,
  stock: 10,
  category: "Camisetas",
  sort_order: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("ProductCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders product information correctly", () => {
    const onClick = vi.fn();
    render(<ProductCard product={mockProduct} onClick={onClick} />, { wrapper: createWrapper() });

    expect(screen.getByText("Street Dex T-Shirt")).toBeInTheDocument();
    expect(screen.getByText("R$100,00")).toBeInTheDocument();
    expect(screen.getByText("R$150,00")).toBeInTheDocument(); // old price
    expect(screen.getByText("Frete grátis")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<ProductCard product={mockProduct} onClick={onClick} />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText("Street Dex T-Shirt"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows 'Esgotado' when stock is 0", () => {
    const soldOutProduct = { ...mockProduct, stock: 0 };
    render(<ProductCard product={soldOutProduct} onClick={vi.fn()} />, { wrapper: createWrapper() });

    expect(screen.getByText("Esgotado")).toBeInTheDocument();
  });

  it("displays correct discount percentage", () => {
    render(<ProductCard product={mockProduct} onClick={vi.fn()} />, { wrapper: createWrapper() });
    
    // (150 - 100) / 150 = 33.33% -> 33%
    expect(screen.getByText("-33%")).toBeInTheDocument();
  });
});
