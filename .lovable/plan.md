
## Fase 1 — Auditoria Arquitetural

Total analisado: **~7.975 linhas** em 40 arquivos (excluindo `components/ui/*`, `integrations/supabase/types.ts` e testes). Nada foi modificado ainda.

---

### 1. Ofensores por tamanho (violação clara de SRP)

| Arquivo | Linhas | Problema principal |
|---|---|---|
| `src/pages/Admin.tsx` | **2.528** | 11 sub-views (`DashboardView`, `ProductsView`, `BannersView`, `SalesView`, `FinancesView`, `SettingsView`, `OrdersAdminView`, `CouponsView`, `MeasurementsEditor`, `ShippingConfigEditor`) declaradas dentro de um único arquivo. 58 hooks React distintos. Layout + roteamento + estado de UI + lógica de som + notificações + formulários. |
| `src/integrations/supabase/types.ts` | 741 | Auto-gerado — não tocar. |
| `src/components/store/CheckoutView.tsx` | **610** | Fluxo de 4 steps + validação + cupom + integração ViaCEP + integração Supabase + WhatsApp + estado do PIX, tudo no mesmo componente. |
| `src/hooks/useStoreData.ts` | **423** | 7 domínios (produtos, banners, sales, expenses, coupons, settings, sale items) em 1 arquivo, com todos os tipos `DB*` co-localizados. |
| `src/pages/Store.tsx` | 395 | Filtros + busca + categorias + listagem + navegação para checkout — precisa de sub-hook `useStoreCatalog`. |
| `src/components/store/ProductDetail.tsx` | 387 | Modal + galeria + seletor de tamanho + medidas + CTAs — dividir. |
| `src/components/store/StoreHeader.tsx` | 365 | Header desktop + menu mobile + busca + navegação de categorias. |

**Meta pós-refactor:** nenhum arquivo de UI > 200 linhas; nenhum hook > 150 linhas.

---

### 2. Lógica de negócio dentro de UI

- `CheckoutView.tsx` — cálculos de desconto (PIX, dinheiro, cupom), validação de cupom via RPC, chamada ViaCEP, montagem de payload do pedido, geração do link WhatsApp. Nada disso é apresentação.
- `Admin.tsx` — cálculos financeiros (`FinancesView`), agregações de dashboard, desbloqueio de áudio, listeners de Realtime, dedup de pedidos, permissões — tudo misturado com JSX.
- `Store.tsx` — filtros de preço/categoria/tamanho e ordenação implementados inline no componente da página.
- `ProductDetail.tsx` — montagem da mensagem WhatsApp e cálculo de parcelamento.

---

### 3. Duplicação detectada

| Padrão duplicado | Onde | Solução |
|---|---|---|
| `settings?.whatsapp_store \|\| settings?.whatsapp \|\| WHATSAPP` | CheckoutView, HeroCarousel, OrderSuccessView, StoreHeader (via prop) | Hook `useStoreWhatsapp()` |
| `formatPrice` importado em 6 arquivos + reimplementado em Admin como local | Admin.tsx (linha 63) + storeData.ts | Mover para `src/lib/format.ts` e reusar |
| `PAYMENT_METHODS` / `PAYMENT_LABELS` | CheckoutView (loja) e Admin (dashboard) — listas diferentes para o mesmo domínio | `src/constants/payments.ts` unificado |
| Cálculo de desconto PIX/dinheiro | CheckoutView, CartView, ProductCard, ProductDetail | Utilitário `applyPaymentDiscount()` |
| Padrão `useQuery`/`useMutation` + toast + invalidate | ~15 lugares em useStoreData/useOrders | Factory `createResource(table, keys)` |
| Tipos `DB*` (Product, Sale, etc.) escritos à mão | useStoreData.ts | Derivar de `Database['public']['Tables']['x']['Row']` |
| Fetch ViaCEP | Inline em CheckoutView | `src/services/viacep.ts` |
| Montagem de link WhatsApp | 4 lugares — parcialmente centralizado em `utils/whatsapp.ts` | Consolidar 100% |

---

### 4. Prop drilling / estado mal posicionado

- `Admin.tsx` passa `somLiberado` + `testarNotificacao` para `OrdersAdminView` — som/notificação deveria ser um hook `useOrderNotifications()`.
- `Store.tsx` faz drilling de `cart` + `setCart` + `searchQuery` + `selectedCategory` para 4+ componentes → candidato a `StoreContext` ou hook `useCart()` (server-side sync futuro).
- `StoreHeader` recebe 8 props que são todas do mesmo domínio "estado da loja" → mesmo `StoreContext`.

---

### 5. Naming / clareza

| Atual | Sugerido | Motivo |
|---|---|---|
| `useStoreData.ts` (arquivo com 7 domínios) | quebrar em `hooks/products/`, `hooks/sales/`, etc. | Não é um "hook" — é um módulo |
| `useOrders.ts` exportando `ORDER_STATUSES`, `getStatusInfo`, `DBOrder` | separar tipos e constants | Hook não deve exportar constantes de domínio |
| `somLiberado` / `testarNotificacao` | `isAudioUnlocked` / `playTestNotification` | Consistência PT/EN + prefixo `is` |
| `storeData.ts` (componente e dados juntos) | `constants/store.ts` + `types/store.ts` | Mistura tipos, constantes e helpers |
| `Store.tsx` variável `data` genérica em vários hooks | nomes específicos (`products`, `banners`) | Legibilidade |
| `MeasurementsEditor` dentro de Admin | próprio arquivo em `features/admin/products/` | Reuso e testes |

---

### 6. Estrutura por feature (proposta — profundidade Completa)

```text
src/
├── app/                          # App.tsx, providers, router
├── features/
│   ├── admin/
│   │   ├── dashboard/            # DashboardView + hooks
│   │   ├── products/             # ProductsView, ProductForm, MeasurementsEditor
│   │   ├── banners/
│   │   ├── sales/
│   │   ├── finances/
│   │   ├── coupons/
│   │   ├── orders/               # OrdersAdminView + useOrderNotifications
│   │   ├── settings/             # SettingsView, ShippingConfigEditor
│   │   └── index.ts              # barrel
│   ├── auth/                     # useAuth, ProtectedRoute, AuthPage, ResetPassword
│   ├── storefront/
│   │   ├── catalog/              # Store.tsx (Page), useStoreCatalog, filters
│   │   ├── product/              # ProductCard, ProductDetail, gallery
│   │   ├── cart/                 # CartView, useCart
│   │   ├── checkout/             # CheckoutView + subcomponentes por step
│   │   ├── order-tracking/
│   │   ├── layout/               # StoreHeader, StoreFooter, HeroCarousel, FAQ
│   │   └── index.ts
│   └── notifications/            # notification-sounds + useOrderNotifications
├── shared/
│   ├── components/               # ImageUploadField, ThemeToggle, Logos
│   ├── ui/                       # shadcn (não tocar)
│   ├── hooks/                    # use-mobile, use-toast
│   └── constants/                # payments, sizes, statuses
├── lib/                          # utils, format, cn
├── services/                     # supabase client, viacep, whatsapp
├── types/                        # DB* derivados
└── pages/                        # apenas mount de features (thin)
```

---

### 7. Plano de execução proposto (Fases 2–5, após sua aprovação)

Ordem sugerida (menor risco → maior risco), cada bloco commitável isoladamente:

1. **Constantes/tipos/serviços** — mover `formatPrice`, `PAYMENT_METHODS`, tipos `DB*`, `viacep.ts`, `whatsapp.ts`. Zero mudança de comportamento.
2. **Quebrar `useStoreData.ts`** em `hooks/products.ts`, `hooks/sales.ts`, etc. + barrel para manter imports atuais funcionando durante transição.
3. **Storefront**: extrair `useStoreCatalog`, `useCart`, `useStoreWhatsapp`. Dividir `Store.tsx`, `ProductDetail.tsx`, `StoreHeader.tsx`.
4. **Checkout**: dividir `CheckoutView` em `Step1Customer`, `Step2Address`, `Step3Payment`, `Step4Confirm` + hook `useCheckoutForm` + `useCoupon`.
5. **Admin**: extrair cada `*View` para `features/admin/<domain>/*View.tsx`, extrair `useOrderNotifications`, `useFinances`.
6. **Reorganização por feature** + barrel exports + atualização de todos os imports (codemod com `sed` + verificação `tsgo`).
7. **Naming pass** final + JSDoc nos hooks públicos.

---

### 8. Riscos e sinalizações

- **Checkout e RPC `create_storefront_order`** — não mudar assinaturas nem ordem de campos. Testar fluxo end-to-end via Playwright após cada mudança.
- **Realtime de pedidos no Admin** — o canal `admin-order-notifications-v2` deve ser preservado exatamente (Supabase Realtime é sensível a nome/config).
- **`ProtectedRoute` tem teste** (`ProtectedRoute.test.tsx`) — manter contrato.
- **`storeData.ts`** exporta `WHATSAPP`, `fallbackImg`, `formatPrice`, `pixPrice`, `discountPct`, `heroBanners`, `type Product`, `type CartItem`, `type Measurement` — importados por 7 arquivos; a transição precisa de re-exports temporários.
- **`Admin.tsx`** com 58 hooks é um alvo de alta chance de regressão em som/Realtime — separar em PR próprio.
- **Nada de mudança visual, de rota (`/`, `/loja`, `/admin`, `/auth`, `/reset-password`, `/track-order`, `/order-tracking/:id`), ou de assinatura de RPC.**

---

### O que preciso de você antes da Fase 2

1. **Aprovação do mapa** acima (ou correções).
2. **Confirmação de que posso mover arquivos** (a estrutura `features/*` implica renomear/mover ~30 arquivos; git mantém o histórico, mas quero seu OK explícito).
3. **Escolha de estratégia de transição** para os re-exports:
   - (a) *Big-bang*: mover tudo e atualizar todos os imports em cada PR — mais limpo, mais volumoso.
   - (b) *Barrel-bridge*: manter re-exports em `storeData.ts`/`useStoreData.ts` apontando para os novos módulos por 1–2 iterações — mais seguro, deixa dívida temporária.

Ao aprovar, começo pela Fase 2 na ordem descrita, um bloco por vez, com verificação de build a cada passo.
