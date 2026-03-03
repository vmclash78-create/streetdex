

## Plano: Refatoração completa do layout da loja

O Store.tsx atual tem 860 linhas em um único arquivo monolítico. A refatoração será dividida em componentes e incluirá um sistema de tema Light/Dark Mode.

### Estrutura de arquivos

```text
src/
├── components/store/
│   ├── StoreHeader.tsx        (topbar fixa: logo + busca + carrinho)
│   ├── HeroCarousel.tsx       (carrossel compacto, max-height: 70vh)
│   ├── ProductCard.tsx        (cards menores e compactos)
│   ├── ProductDetail.tsx      (modal/página side-by-side no desktop)
│   ├── CartView.tsx           (carrinho)
│   ├── CookieConsent.tsx      (banner cookies)
│   ├── StoreFooter.tsx        (footer)
│   └── ThemeToggle.tsx        (botão light/dark mode)
├── contexts/
│   └── ThemeContext.tsx        (provider de tema com localStorage)
├── pages/
│   └── Store.tsx              (orquestrador simplificado)
```

### Mudanças principais

**1. Header compacto e fixo**
- Remover as duas announcement bars separadas e o nav bar, consolidar em um header `fixed top-0` com altura reduzida (~56px)
- Layout: Logo à esquerda | Campo de busca centralizado (com ícone Search) | Carrinho à direita
- Menu hambúrguer movido para dentro do header (mobile only)
- Announcement bar fica acima do header fixo como um banner dismissível fino

**2. Hero Carousel compacto**
- `max-height: 70vh` com `object-fit: cover` e `object-position: center`
- Padding-top para compensar header fixo
- CTA button centralizado com estilo roxo

**3. Best Sellers - Grid compacto**
- Cards menores: reduzir aspect-ratio de `4/5` para `3/4`, padding de `p-3` para `p-2`
- Grid: `lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1`
- Imagens com altura máxima menor
- Reduzir margens da seção (pt-6 pb-8 em vez de pt-8 pb-12)
- Gap reduzido de `gap-4` para `gap-3`

**4. Product Detail - Layout lado a lado**
- No desktop: flex row com imagem à esquerda (max-width: 500px) e informações à direita
- Modal com overlay (z-index: 60), centralizado
- No mobile: mantém layout vertical compacto
- Imagem principal limitada a `max-w-[500px]`

**5. Sistema de Tema (Light/Dark Mode)**
- ThemeContext com provider que lê/salva no localStorage
- Classe `dark` aplicada no `<html>` element
- Botão toggle (Sun/Moon icon) no header
- CSS vars já existem no index.css para `.dark` - ajustar valores:
  - Light: fundo branco, botões roxo, texto preto
  - Dark: fundo #0a0a0a, secundário #1a1a1a, destaque roxo, texto branco
- Transição suave: `transition-colors duration-300` no body
- Ajustar hardcoded `style={{ background: "hsl(270,...)" }}` para usar CSS vars

**6. Ajustes gerais**
- Reduzir espaçamentos globais (seções, gaps, paddings)
- Padronizar tipografia usando font-sans do Tailwind
- Remover inline styles e migrar para classes Tailwind/CSS vars para suporte correto ao tema
- Footer e ticker bar: usar CSS vars em vez de cores hardcoded

### Detalhes técnicos

- O sistema de tema usará `next-themes` (já instalado) com `ThemeProvider` envolvendo o App
- Todos os inline `style={{ background: "hsl(270, ...)" }}` no Store e Admin serão substituídos por CSS custom properties que respondem ao tema
- As CSS vars `.dark` no `index.css` serão refinadas para os tons preto/roxo especificados
- A transição entre temas terá `transition: background-color 0.3s, color 0.3s` no body

### Ordem de implementação

1. Configurar ThemeProvider (next-themes) no App.tsx e criar ThemeToggle
2. Ajustar CSS vars em index.css para light/dark adequados (preto + roxo)
3. Extrair componentes do Store.tsx em arquivos separados
4. Refatorar Header (fixo, compacto, com busca e toggle de tema)
5. Refatorar HeroCarousel (compacto, 70vh)
6. Refatorar ProductCard e grid Best Sellers (compacto)
7. Refatorar ProductDetail (layout side-by-side desktop, modal)
8. Migrar inline styles para CSS vars em todo o projeto
9. Ajustes finais de espaçamento e proporção

