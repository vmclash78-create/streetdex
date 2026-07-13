import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validatePhone, validateCEP, BRAZIL_DDDS } from "./validation";

describe("validatePhone", () => {
  it("accepts a valid Brazilian mobile number", () => {
    expect(validatePhone("11987654321")).toEqual({ isValid: true });
  });

  it("accepts formatted numbers (strips non-digits)", () => {
    expect(validatePhone("(11) 98765-4321").isValid).toBe(true);
  });

  it("rejects numbers with wrong length", () => {
    expect(validatePhone("1198765432").isValid).toBe(false);
    expect(validatePhone("").isValid).toBe(false);
  });

  it("rejects repeated digits", () => {
    expect(validatePhone("11111111111").isValid).toBe(false);
  });

  it("rejects invalid DDD", () => {
    const res = validatePhone("10987654321");
    expect(res.isValid).toBe(false);
    expect(res.error).toMatch(/DDD/);
  });

  it("rejects numbers not starting with 9 after DDD", () => {
    expect(validatePhone("11887654321").isValid).toBe(false);
  });

  it("rejects known fake patterns", () => {
    expect(validatePhone("11999999999").isValid).toBe(false);
    expect(validatePhone("11123456789").isValid).toBe(false);
  });

  it("BRAZIL_DDDS contains São Paulo", () => {
    expect(BRAZIL_DDDS).toContain("11");
  });
});

describe("validateCEP", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("rejects CEP with wrong length", async () => {
    const res = await validateCEP("123");
    expect(res.isValid).toBe(false);
  });

  it("returns valid on successful lookup", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => ({ logradouro: "Rua X" }) })
    );
    const res = await validateCEP("01310100");
    expect(res.isValid).toBe(true);
  });

  it("returns invalid when API reports erro", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: async () => ({ erro: true }) }));
    const res = await validateCEP("00000000");
    expect(res.isValid).toBe(false);
  });

  it("returns invalid on network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("net")));
    const res = await validateCEP("01310100");
    expect(res.isValid).toBe(false);
  });
});
