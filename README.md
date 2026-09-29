# Week 2 - Accessible Accordion Component

A reusable accordion built with vanilla HTML, CSS and JavaScript (no dependencies).

## Run it
Open `index.html` in any modern browser. No build step or server is needed.

## Use it in your own page
1. Include `css/accordion.css` and `js/accordion.js`.
2. Add markup: a container with `data-accordion`, then heading > button.accordion__trigger, followed by a div.accordion__panel for each item.
3. Add `data-multiple` to allow several open panels (omit for single-open).
4. Optional: add `<script>document.documentElement.className='js'</script>` in `<head>` (enables collapsing; without it all content stays visible = no-JS fallback).

```js
const acc = new Accordion(document.querySelector('#faq'), { multiple: true });
acc.open(0); acc.close(0); acc.toggle(1); acc.expandAll(); acc.collapseAll(); acc.destroy();
document.querySelector('#faq').addEventListener('accordion:toggle', e => console.log(e.detail));
```

## How to test
| Test | Expected |
|---|---|
| Click a heading | Panel slides open; chevron rotates; `aria-expanded="true"` |
| Tab to a heading, press Enter or Space | Same as click |
| Press Down / Up arrow | Focus moves to next / previous heading (wraps around) |
| Press Home / End | Focus jumps to first / last heading |
| Expand all / Collapse all | Works in the multi-open accordion only |
| Second accordion (single-open) | Opening one closes the other |
| Disable JavaScript | All answers visible as normal text (fallback) |
| OS "reduce motion" on | Panels open instantly, no animation |
| Screen reader (NVDA / VoiceOver) | Announces "button, collapsed/expanded" and the region name |
| Resize to 320px wide | No horizontal scroll; text wraps |

## Accessibility features
- Real `<button>` triggers inside headings; `aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby`.
- Visible `:focus-visible` outline; forced-colors support; `prefers-reduced-motion` respected.

## Error handling and fallbacks
- Mismatched trigger/panel counts log a warning and leave the markup untouched.
- Browsers lacking `closest` or `CustomEvent` skip enhancement, so content stays visible.

## Files
`index.html` demo | `css/accordion.css` styles | `js/accordion.js` component | `js/demo.js` demo wiring
