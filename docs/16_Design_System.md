# 16 — Design System

> Source of truth for `ui/design-tokens/`. All values below are implemented as CSS variables + a Tailwind config extension, never hardcoded in components.

## 1. Colors

### Light Mode
| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#4F46E5` (indigo-600) | Primary CTAs, active states, links |
| `--color-primary-hover` | `#4338CA` | Primary hover state |
| `--color-secondary` | `#0EA5A4` (teal-600) | Secondary actions, complementary accents |
| `--color-accent` | `#F59E0B` (amber-500) | Highlights, badges, promotional elements |
| `--color-success` | `#16A34A` | Success states, completed status |
| `--color-warning` | `#D97706` | Warnings, pending/awaiting states |
| `--color-error` | `#DC2626` | Errors, destructive actions, declined status |
| `--color-info` | `#2563EB` | Informational banners, tooltips |
| `--color-background` | `#FFFFFF` | Page background |
| `--color-surface` | `#F8FAFC` (slate-50) | Cards, panels, elevated containers |
| `--color-border` | `#E2E8F0` (slate-200) | Dividers, card borders, input borders |
| `--color-text-primary` | `#0F172A` (slate-900) | Headings, primary body text |
| `--color-text-secondary` | `#475569` (slate-600) | Secondary/muted text |
| `--color-text-disabled` | `#94A3B8` (slate-400) | Disabled labels/placeholders |

### Dark Mode
| Token | Value |
|---|---|
| `--color-primary` | `#6366F1` (indigo-500, lighter for contrast) |
| `--color-secondary` | `#2DD4BF` |
| `--color-accent` | `#FBBF24` |
| `--color-success` | `#4ADE80` |
| `--color-warning` | `#FBBF24` |
| `--color-error` | `#F87171` |
| `--color-info` | `#60A5FA` |
| `--color-background` | `#0B1120` |
| `--color-surface` | `#111827` |
| `--color-border` | `#1F2937` |
| `--color-text-primary` | `#F1F5F9` |
| `--color-text-secondary` | `#94A3B8` |
| `--color-text-disabled` | `#4B5563` |

**Rule:** dark mode is authored as its own palette (per `10_UI_Research.md` synthesis), not a CSS `invert()` of light mode.

## 2. Typography

- **Font Family:** `Inter` (UI/body), fallback `system-ui, sans-serif`. Marketing headlines may use a secondary display cut of the same family (`Inter Display` / variable font weight) for personality — never a fully separate typeface, to keep the system cohesive.
- **Font Weights:** 400 (regular, body), 500 (medium, labels/buttons), 600 (semibold, subheadings), 700 (bold, headings/emphasis).

### Heading Sizes (desktop / mobile)
| Token | Desktop | Mobile | Weight |
|---|---|---|---|
| `--text-h1` | 48px / 56px lh | 32px / 40px lh | 700 |
| `--text-h2` | 36px / 44px lh | 28px / 36px lh | 700 |
| `--text-h3` | 28px / 36px lh | 24px / 32px lh | 600 |
| `--text-h4` | 22px / 30px lh | 20px / 28px lh | 600 |
| `--text-h5` | 18px / 26px lh | 18px / 26px lh | 600 |

### Paragraph / Body Sizes
| Token | Size / Line-height | Usage |
|---|---|---|
| `--text-body-lg` | 18px / 28px | Marketing lead paragraphs |
| `--text-body` | 16px / 24px | Default body text |
| `--text-body-sm` | 14px / 20px | Secondary text, table cells |
| `--text-caption` | 12px / 16px | Captions, helper text, timestamps |

### Button Fonts
- 14px (small), 16px (default), 18px (large) — weight 500, no italics, letter-spacing 0.01em for uppercase-style CTAs only.

### Line Heights
- Headings: 1.2–1.3x font size.
- Body: 1.5x font size (readability-first).
- Compact UI (tables, badges): 1.3x.

## 3. Border Radius
| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 6px | Inputs, badges, small buttons |
| `--radius-md` | 10px | Buttons, dropdown menus |
| `--radius-lg` | 12px | Cards (matches Stripe-style direction) |
| `--radius-xl` | 16px | Modals, large panels |
| `--radius-full` | 9999px | Pills, avatars, toggle switches |

## 4. Shadows
| Token | Value | Usage |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgba(15,23,42,0.04)` | Inputs, subtle separation |
| `--shadow-sm` | `0 1px 3px rgba(15,23,42,0.08)` | Default card resting state |
| `--shadow-md` | `0 4px 12px rgba(15,23,42,0.10)` | Card hover/lift |
| `--shadow-lg` | `0 10px 24px rgba(15,23,42,0.12)` | Dropdowns, popovers |
| `--shadow-xl` | `0 20px 40px rgba(15,23,42,0.16)` | Modals, dialogs |
| Dark mode shadows | Same structure, lower opacity + a 1px border substituted where shadows read poorly on dark backgrounds (Linear-style reliance on contrast over elevation) |

## 5. Gradients
| Token | Value | Usage |
|---|---|---|
| `--gradient-hero` | `linear-gradient(135deg, #4F46E5 0%, #0EA5A4 100%)` | Marketing hero background mesh (animated, slow drift) |
| `--gradient-accent-glow` | `radial-gradient(circle, rgba(79,70,229,0.25), transparent 70%)` | Behind CTA sections, feature highlights |
| `--gradient-cta-button` | `linear-gradient(90deg, #4F46E5 0%, #6366F1 100%)` | Primary button background (subtle, not overused) |
| **Rule** | Gradients are reserved for marketing/hero surfaces only — dashboards and admin panels stay flat per the animation-restraint principle in `10_UI_Research.md`. |

## 6. Spacing System
4px base unit, scaled geometrically for predictable rhythm:
```
4px   (--space-1)   micro gaps (icon-to-label)
8px   (--space-2)   tight component padding
12px  (--space-3)   input padding, small gaps
16px  (--space-4)   default component padding, card gaps
24px  (--space-6)   section-internal spacing
32px  (--space-8)   card-to-card grid gaps
48px  (--space-12)  section spacing (mobile)
64px  (--space-16)  section spacing (desktop)
96px  (--space-24)  major marketing section breaks
```
**Rule:** all spacing is a multiple of 4px — no arbitrary values in components.

## 7. Icon System
- **Library:** `lucide-react` exclusively — one icon set across the entire product for visual consistency.
- **Sizes:** 16px (inline with body/caption text), 20px (default UI — buttons, inputs, list items), 24px (section headers, empty states), 32px+ (illustrative/empty-state icons only).
- **Stroke width:** 1.5–2px consistently; never mix stroke weights on the same screen.
- **Color:** icons inherit `currentColor` (matches adjacent text) except status icons, which use semantic colors (success/warning/error).
- **Placement rules:** navigation items (left of label), buttons (left of label for primary actions, right for "next/forward" actions), input fields (left = decorative, right = actionable e.g. clear/password-toggle).

## 8. Buttons

### Variants
| Variant | Style | Usage |
|---|---|---|
| Primary | Solid `--color-primary`, white text | Main CTA per screen (one per view) |
| Secondary | Outlined, `--color-primary` border/text, transparent fill | Secondary actions alongside a primary |
| Ghost | No border/fill, text-only with hover background tint | Low-emphasis actions, table row actions |
| Danger | Solid `--color-error`, white text | Destructive actions (delete, cancel project, decline) |
| Loading | Spinner replaces label, button width preserved (no layout shift) | Any async submit |
| Disabled | Reduced opacity (0.5), no hover/press response, cursor `not-allowed` | Invalid/incomplete form states |

### Sizes
- Small (32px height, 14px text, 12px horizontal padding)
- Default (40px height, 16px text, 16px horizontal padding)
- Large (48px height, 18px text, 24px horizontal padding — marketing CTAs)

### Interaction states (ties to `11_Animations.md`)
- Hover: background/opacity shift, 120ms.
- Press: scale 0.97.
- Focus-visible: 2px `--color-primary` ring, offset 2px (accessibility requirement, keyboard nav).

## 9. Forms

### Inputs (text, email, password, textarea)
- Height 40px (default), 12px horizontal padding, `--radius-sm`, 1px `--color-border`.
- Focus: border → `--color-primary`, 150ms transition + subtle ring glow.
- Error: border → `--color-error`, helper text below in error color, small shake animation on submit-triggered error.
- Placeholder text uses `--color-text-disabled`.
- Password fields include a show/hide toggle icon (right-aligned, 20px).

### Checkboxes
- 18x18px, `--radius-sm` (4px), `--color-border` default, `--color-primary` filled when checked with a white checkmark draw-in.
- Indeterminate state supported (partial selection in bulk-select tables).

### Radio Buttons
- 18x18px, fully circular, `--color-primary` fill dot when selected, smooth scale-in on selection (120ms).

### Dropdowns / Selects
- Same height/border as text inputs; chevron-down icon (right, 16px).
- Menu: `--shadow-lg`, `--radius-md`, fade + translateY(-4→0) on open (per `11_Animations.md`).
- Searchable variant used for long lists (Category select, Assign team member).

### File Upload
- Dropzone pattern: dashed `--color-border`, `--color-surface` background, centered icon + "Drag & drop or click to upload" copy.
- Active drag-over state: border → `--color-primary`, background tint.
- Per-file row: filename, size, progress bar fill, success checkmark or error state with reason (type/size rejected).

### Validation (global rules)
- Inline, on-blur validation (not only on submit) for immediate feedback — matches the Clerk-style tight feedback loop noted in `10_UI_Research.md`.
- Error messages are specific and actionable ("Password must be at least 8 characters", never a generic "Invalid input").
- Required fields marked with a subtle asterisk + `aria-required`; all form controls carry proper `label` association for accessibility.
- Submit buttons disable + show loading state during async validation/submission — never allow double-submit.
