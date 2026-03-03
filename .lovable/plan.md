
## Plano de Correções

### 1. Mover filtros de categoria para cima do carrossel
- Reposicionar o bloco de filtros de categoria em `Store.tsx` para ficar entre o header/busca e o carrossel `HeroCarousel`

### 2. Navegação desktop no header
- O menu hambúrguer é apenas mobile (correto). Adicionar navegação horizontal de categorias visível no desktop dentro do `StoreHeader`, extraindo categorias dos produtos via prop

### 3. Corrigir configurações no admin (RLS)
- **Causa raiz**: Todas as políticas RLS em `store_settings` (e outras tabelas) foram criadas como **RESTRICTIVE** (`Permissive: No`). PostgreSQL exige pelo menos uma política **PERMISSIVE** para permitir acesso. Sem ela, nenhuma operação funciona.
- **Correção**: Migration SQL para recriar as políticas de `store_settings` como PERMISSIVE, garantindo que admins consigam atualizar os valores. Aplicar a mesma correção nas demais tabelas admin (products, hero_banners, sales, sale_items, expenses)
