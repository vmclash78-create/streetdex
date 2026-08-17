
# Integração Melhor Envio — Expedição de Pedidos

## Pré-requisitos (você faz uma vez, antes de eu implementar)

1. Criar conta grátis em https://melhorenvio.com.br
2. Criar um **App** no painel Melhor Envio → Configurações → Tokens de Acesso
3. Gerar um **Token de Produção** (ou Sandbox pra testar) com escopos:
   `cart-read`, `cart-write`, `shipping-calculate`, `shipping-cancel`, `shipping-checkout`, `shipping-generate`, `shipping-preview`, `shipping-print`, `shipping-share`, `shipping-tracking`, `orders-read`
4. Ter saldo na carteira do Melhor Envio (só pra emitir etiqueta real; sandbox é grátis)

Quando terminar, me manda o token — abro um formulário seguro pra você colar.

---

## Escopo

Feature isolada, sem tocar em nada existente. Adiciona:
- Botões **Gerar Etiqueta**, **Imprimir Etiqueta**, **Rastrear** no card de cada pedido no Admin
- Aba **Expedição** nas Configurações (token, ambiente, CEP de origem, peso/dimensões padrão)
- Atualização automática de status conforme o Melhor Envio retorna

## Banco de Dados

Nova tabela `shipments` (uma entrega por pedido, mas preparada pra múltiplas transportadoras no futuro):

```text
shipments
├── id, order_id (FK), created_at, updated_at
├── carrier                 (text — 'melhor_envio' por enquanto)
├── carrier_service         (text — 'PAC', 'SEDEX', etc.)
├── carrier_order_id        (text — id do pedido no Melhor Envio)
├── tracking_code           (text — ex: 'AB123456789BR')
├── label_url               (text — PDF da etiqueta)
├── status                  (text — 'pending','purchased','generated','posted','in_transit','delivered','cancelled')
├── shipping_cost           (numeric)
├── raw_response            (jsonb — resposta completa da API pra debug)
└── posted_at, delivered_at (timestamptz)
```

Coluna nova em `store_settings` (JSON `shipping_config` já existe, só estender):
- `melhor_envio_env`: 'sandbox' | 'production'
- `origin_zip`, `origin_address`, `origin_number`, `origin_city`, `origin_state`
- `default_weight_kg`, `default_length_cm`, `default_width_cm`, `default_height_cm`, `default_insurance`

Coluna opcional em `products`: `weight_kg`, `length_cm`, `width_cm`, `height_cm` — sobrescreve o padrão.

RLS: só admin lê/escreve `shipments`. Token do Melhor Envio salvo como **secret** (`MELHOR_ENVIO_TOKEN`), nunca no banco público.

## Edge Functions

Uma função só, com rotas internas — mais fácil manter:

**`melhor-envio`** (verify_jwt = true, checa role admin em toda chamada):
- `POST /calculate`   → cota preços/prazos por CEP (útil pro checkout também no futuro)
- `POST /generate`    → cria carrinho, compra, gera etiqueta. Retorna `tracking_code`, `label_url`, salva em `shipments`
- `POST /print`       → gera PDF 100x150mm da etiqueta (endpoint `/shipment/print` do ME)
- `GET  /track/:code` → consulta rastreamento
- `POST /webhook`     → recebe atualizações do ME e atualiza `shipments.status` + `orders.status`

Todas usam `MELHOR_ENVIO_TOKEN` do Deno.env, base URL alterna sandbox/produção conforme `store_settings.melhor_envio_env`.

## Frontend

**`src/features/shipping/`** (novo módulo, isolado):
- `useShipment(orderId)` — hook que lê/cria shipment
- `ShipmentActions.tsx` — 3 botões (Gerar / Imprimir / Rastrear) + badge de status
- `TrackingDialog.tsx` — timeline dos eventos do rastreio
- `GenerateLabelDialog.tsx` — confirma serviço (PAC/SEDEX), peso, dimensões antes de gerar

**No `Admin.tsx`** (mudança mínima):
- Dentro do card de pedido existente, adicionar `<ShipmentActions orderId={order.id} />` no rodapé
- Nova aba em Configurações: `ShippingSettingsTab.tsx` (token via botão "Configurar Token" → chama `add_secret`, resto dos campos vão em `store_settings.shipping_config`)

## Fluxo de Status

```text
Cliente compra → order.status = 'preparando'
Admin clica "Gerar Etiqueta" → shipments criado, status 'generated', order.status = 'etiqueta_gerada'
ME confirma postagem (webhook) → status 'posted', order.status = 'postado'
ME atualiza rastreio → status 'in_transit' → 'delivered' → order.status = 'entregue'
```

Novos valores no enum `order_status`: `etiqueta_gerada`, `postado`, `em_transito`, `entregue` (adiciono via migration se não existirem).

## Preparado para Futuro

- Coluna `carrier` na tabela `shipments` permite adicionar Frenet/Kangu depois só criando outra edge function
- Hook `useShipment` abstrai a transportadora, componentes UI não precisam saber qual é

## Segurança

- Token do ME só existe como secret de edge function — nunca chega no browser
- Toda edge function valida JWT + role admin antes de chamar API externa
- Webhook do ME valida assinatura HMAC (secret separado, gero automaticamente)
- Rate limit básico por IP no endpoint de webhook

## Fora de Escopo (fica pra depois se você quiser)

- Cálculo de frete no checkout via Melhor Envio (hoje usa sua tabela por região — funciona bem)
- Múltiplos volumes/caixas por pedido
- Declaração de conteúdo automática
- Integração com outras transportadoras

---

**Aprova pra eu começar?** Confirma também: **sandbox primeiro** (recomendo, pra testar sem gastar) ou já vai direto pra produção?
