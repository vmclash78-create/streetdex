import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthPage from "@/pages/AuthPage";
import { supabase } from "@/integrations/supabase/client";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import React from "react";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe("AuthPage Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows error on failed login", async () => {
    const { toast } = await import("sonner");
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid credentials" },
    });

    render(<AuthPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.queryByTestId("auth-loading")).not.toBeInTheDocument(), { timeout: 2000 });

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/senha/i);
    const submitButton = screen.getByRole("button", { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "wrongpassword",
      });
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
    });
  });

  it("logs in successfully", async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: { id: "123" } },
      error: null,
    });

    render(<AuthPage />, { wrapper: createWrapper() });

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/senha/i);
    const submitButton = screen.getByRole("button", { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: "admin@streetdex.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });
  });
});
