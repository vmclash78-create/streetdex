import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const authState = { user: null as unknown, isAdmin: false, loading: false };

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

const renderAt = (path = "/admin") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <div>Admin Dashboard</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe("ProtectedRoute", () => {
  beforeEach(() => {
    authState.user = null;
    authState.isAdmin = false;
    authState.loading = false;
  });

  it("redirects unauthenticated users to /login", () => {
    const { getByText } = renderAt();
    expect(getByText("Login Page")).toBeInTheDocument();
  });

  it("blocks authenticated but non-admin users", () => {
    authState.user = { id: "u1" };
    authState.isAdmin = false;
    const { getByText, queryByText } = renderAt();
    expect(getByText(/Acesso Negado/i)).toBeInTheDocument();
    expect(queryByText("Admin Dashboard")).not.toBeInTheDocument();
  });

  it("renders children for admin users", () => {
    authState.user = { id: "u1" };
    authState.isAdmin = true;
    const { getByText } = renderAt();
    expect(getByText("Admin Dashboard")).toBeInTheDocument();
  });

  it("shows loader while auth is resolving", () => {
    authState.loading = true;
    const { container } = renderAt();
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });
});
