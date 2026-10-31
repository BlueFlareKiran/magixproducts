# Hero-product placement update — 26 October 2026

- The second homepage hero slide no longer renders a broom product image, white product card or accompanying product image label. The text, 90+ Days disclaimer, background room photography, two-slide carousel and controls remain intact.
- The hero slide button now reads **Explore hero product** and opens the existing accessible modal.
- The modal uses the original Magix catalogue asset `p07-1-1.webp` (the broom with **MAKAI GOLD** purple packaging), rather than the unpackaged `p07-1-2.webp`. A dedicated image `public/brand/hero-broom-makai-gold.webp` is a whitespace-only crop of that original asset for better visibility; the catalogue image is unchanged.
- The popup retains usage-life description, disclaimer, enquiry/category links and close/ESC/backdrop handling.
- No changes to the other hero slide, Everyday Favourites, room carousel, catalogue, navigation or admin features.

Verify: Run `npm ci`, `npm test`, `npm run typecheck`, and `npm run build`; then view the second homepage hero slide on desktop/mobile and open the dialog.
