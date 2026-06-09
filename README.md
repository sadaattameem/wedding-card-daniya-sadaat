# Sadaat &amp; Daniya — Luxury Wedding Invitation

An ultra-premium, mobile-first digital wedding invitation with cinematic animations,
inspired by luxury European wedding stationery and watercolor-floral fine-art design.

**The experience, in order:**

1. **Loading screen** — gold monogram with a spinning ring, fades away on load.
2. **Handcrafted envelope** — ivory textured card, gold-foil monogram badge, and a wax seal. Tap the seal.
3. **Seal cracks** &rarr; the card lifts away &rarr; **floral curtains part** with light rays and sparkles.
4. **Butterfly swarm** — hundreds of soft ivory / blush / champagne butterflies pour out, flutter with depth/parallax, and gather into an **oval frame**.
5. **Hero reveal** — the couple's names shimmer in gold foil inside the floral oval.
6. Scroll for **Countdown · Celebrations · Dress Code · Venue (map) · RSVP**, with elegant scroll-reveal animations.

Plain HTML/CSS/JS (no build tools) so it hosts free anywhere. GSAP is loaded from a CDN for
premium scroll transitions, with an automatic fallback if it is unavailable.

## Edit your details

All content lives in the `WEDDING` object at the top of [`script.js`](script.js) —
names, date (drives the live countdown), events, dress code, and RSVP settings.

```js
const WEDDING = {
  partner1: "Sadaat",
  partner2: "Daniya",
  weddingDateISO: "2026-07-18T11:15:00", // Nikah day — drives the live countdown
  "e2-name": "Nikah",  // ...e3- for Dinner
  ...
};
```

## Type &amp; palette

- **Fonts** (Google Fonts): Playfair Display, Cormorant Garamond, Great Vibes, Parisienne.
- **Palette**: Ivory · Pearl White · Champagne Gold · Soft Blush · Sage · Dusty Rose.

The butterflies are drawn **procedurally** on a canvas in the luxury palette, so no butterfly
image files are required.

## Background music (optional)

Drop an audio file at **`music/ambient.mp3`** and it will fade in when the seal is broken.
The floating control (bottom-left) toggles it on/off. With no file present, the site stays silent.

## Venue map

The venue section embeds Google Maps for `11900 N Lamar Blvd, Austin, TX 78753` and includes a
**Get Directions** button. Change the address in the `iframe` `src` and the directions link in [`index.html`](index.html).

## Artwork (`images/`)

| File | Use |
|------|-----|
| `oval-floral-frame.png` | Hero name frame (watercolor florals + coastal scene) |
| `wavy-frame.svg` | Ornamental scalloped frame (available) |

> Other legacy images (`wax-seal.png`, `butterfly-*.png`, etc.) are no longer used — the seal,
> monogram, dress-code silhouettes, and butterflies are now drawn with CSS/SVG/canvas.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Make the RSVP form work (free)

Works out of the box via a `mailto:` fallback. For automatic collection, use **Formspree**:

1. Create a form at <https://formspree.io>.
2. Copy your endpoint (e.g. `https://formspree.io/f/abcdwxyz`).
3. Paste it into `formspreeEndpoint` in `script.js`.

## Host it for free

- **Netlify Drop**: drag this folder onto <https://app.netlify.com/drop>.
- **GitHub Pages**: push to a repo, then Settings → Pages → Source: `main` / root.
- **Vercel / Cloudflare Pages**: import the repo and deploy.

---

Celebrating love &amp; happiness — In Sha Allah.
