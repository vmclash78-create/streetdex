

## Plan: Replicate lojaduartt.com.br layout precisely

The current Store.tsx is already close to the reference. Key differences to fix:

### 1. Hero Banner — Add image carousel with arrows
The reference has a full-width image carousel/slider in the hero (not just text on dark bg). Add embla-carousel with prev/next arrows, using placeholder banner images. Include auto-play.

### 2. Navigation bar — Add "Produtos" dropdown with chevron
The reference nav has: Início, **Produtos ▼** (dropdown), Contato, Guia de medidas, Camisas Jogadores, Camisas Casais, Perguntas Frequentes. Add a dropdown for "Produtos" with a ChevronDown icon that shows subcategories.

### 3. Product cards — Add second image on hover + color swatches
Reference cards show a second product image on hover (image swap), and some show color variant circles/swatches below the image. Add image swap on hover and color indicators.

### 4. Product cards — Add size selector popup on hover
Reference cards have an inline size selector that appears on hover (above the Comprar/Espiar buttons). Add size chips that appear in the hover overlay.

### 5. Product section title — "BEST SELLERS" style
Reference uses "BEST SELLERS" as the main section heading. Update section headings to match.

### 6. Cookie consent banner
Reference shows a cookie consent bar at the bottom. Add a dismissible cookie banner.

### 7. Small floating discount badge (bottom-left)
Reference has a small circular "5% OFF" badge floating at the bottom-left corner. Add this element.

### Implementation steps

1. **Add hero carousel**: Use embla-carousel (already installed) to create a full-width image slider with left/right arrow buttons and auto-advance, replacing the current static dark hero.

2. **Update nav with Produtos dropdown**: Replace flat category list with a nav matching reference structure — add a hoverable "Produtos" dropdown that reveals subcategories.

3. **Enhance product cards**: Add hover image swap (show second image on hover), inline size selector in hover overlay, and color swatch dots.

4. **Add cookie consent banner**: Fixed bottom bar with "Ao navegar por este site você aceita o uso de cookies..." text and "Entendi" button, dismissible via localStorage.

5. **Add floating discount badge**: Small circular badge bottom-left with "5%" text.

6. **Update section headings**: Rename to "BEST SELLERS" for the main product grid.

### Files to modify
- `src/pages/Store.tsx` — All changes above

