# Plan: SuperFrete Integration for Shipping Labels

Redesign the shipping label printer to follow the SuperFrete visual standard instead of the basic Correios model, ensuring it includes the appropriate branding, layout, and data fields.

## Proposed Changes

### Admin Components

#### [OrderLabelPrinter.tsx](src/components/admin/OrderLabelPrinter.tsx)
- Redesign the label layout to match the SuperFrete aesthetic (Blue/Orange/White theme).
- Add the SuperFrete logo and branding elements.
- Update the layout structure to follow the SuperFrete label format:
  - Top section with SuperFrete logo and tracking status.
  - Clear separation for Sender and Recipient with SuperFrete icons.
  - QR Code and Barcode positioning according to their standard.
  - "Powered by SuperFrete" footer.
- Ensure the print styles are maintained for perfect alignment.

## Technical Details
- Use SuperFrete's brand colors (Orange: #FF6B00, Blue: #0047BB).
- Keep the deterministic Barcode and QR Code generation for consistency.
- Maintain compatibility with the existing `DBOrder` and `DBCustomer` types.
- Update the print media queries to ensure the new design prints correctly.
