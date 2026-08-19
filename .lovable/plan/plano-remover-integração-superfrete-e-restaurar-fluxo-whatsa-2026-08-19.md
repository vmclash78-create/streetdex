# Plano: Remover Integração SuperFrete e Restaurar Fluxo WhatsApp

O usuário deseja remover completamente a integração com SuperFrete (e Melhor Envio, se houver) e retornar ao fluxo de pedidos via WhatsApp, onde os dados do pedido são formatados em uma mensagem e o usuário é redirecionado ao WhatsApp após finalizar.

## Alterações Técnicas

### Frontend
- **src/components/store/CheckoutView.tsx**: 
    - Remover lógica de cálculo de frete via `calculateShipping` do SuperFrete.
    - Manter apenas o cálculo manual por região (CEP) como fallback.
    - No final do processo (`handleFinalize`), construir a mensagem do WhatsApp com todos os detalhes do pedido (produtos, tamanhos, endereço, frete, total, método de pagamento).
    - Abrir o link do WhatsApp após a criação bem-sucedida do pedido no banco de dados.
- **src/components/store/ProductDetail.tsx**:
    - Remover `ShippingCalculator` ou simplificá-lo para não usar SuperFrete.
- **src/pages/Admin.tsx**:
    - Remover a aba ou seção de configurações do SuperFrete.
    - Remover botões de geração de etiqueta real no gerenciamento de pedidos.
- **src/lib/superfrete.ts**: Opcionalmente remover o arquivo, mas é melhor apenas parar de usá-lo para evitar erros de importação em outros locais ainda não mapeados.

### Infraestrutura
- **supabase/functions/superfrete-proxy**: A função pode ser mantida no backend, mas não será mais chamada pelo frontend.

## Passos de Implementação

1. **Modificar `CheckoutView.tsx`**:
    - Remover imports e chamadas ao `calculateShipping`.
    - Atualizar `handleFinalize` para gerar a mensagem e redirecionar para o WhatsApp.
2. **Modificar `ProductDetail.tsx`**:
    - Remover lógica de SuperFrete do componente de cálculo de frete.
3. **Limpar `Admin.tsx`**:
    - Remover a interface de configuração do SuperFrete.
4. **Verificar `OrderLabelPrinter.tsx`**:
    - Desativar ou remover opções relacionadas à SuperFrete.

A mensagem de WhatsApp incluirá:
- Número do Pedido
- Lista de Itens (Nome, Tamanho, Qtd, Preço)
- Dados do Cliente
- Endereço de Entrega
- Método de Frete e Valor
- Método de Pagamento
- Valor Total
