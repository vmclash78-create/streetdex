// Barrel-bridge: re-exports mantidos para compatibilidade após split por domínio.
// Novos imports devem usar diretamente @/hooks/{products,banners,sales,expenses,coupons,settings}.
export * from "./products";
export * from "./banners";
export * from "./settings";
export * from "./sales";
export * from "./expenses";
export * from "./coupons";
