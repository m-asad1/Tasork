# 11 — Animation Catalog

> Principle: animation communicates state and guides attention — it is never purely decorative outside the marketing hero. Default easing: `ease-out` for entrances, `ease-in-out` for state changes. Default duration: 150–250ms for UI feedback, 400–600ms for page-level reveals.

## Hero (Marketing)
- Headline: staggered word/line fade-up on load (60ms stagger)
- Background: subtle animated gradient mesh, slow drift (20s loop, GPU-friendly)
- CTA button: soft pulse/glow on first load to draw the eye (once only)
- Scroll-cue arrow: gentle bounce loop

## Cards (Services, Blog, Testimonials, Pricing tiers)
- Entrance: fade + slide-up on scroll into view (staggered per grid item)
- Hover: lift (translateY -4px) + shadow increase, 150ms
- Active/press: scale down to 0.98 for tactile feedback

## Navbar
- Scroll: background blur/solidify transition from transparent to solid, 200ms
- Mobile menu: slide-in drawer from right, backdrop fade-in
- Dropdown/mega-menu: fade + slight scale (0.98 → 1) on open

## Buttons
- Hover: background/opacity shift, 120ms
- Press: scale 0.97
- Loading state: spinner fade-in replacing label, button width preserved (no layout shift)
- Disabled: opacity reduction, no hover response

## Inputs / Forms
- Focus: border color transition + subtle ring glow, 150ms
- Validation error: shake (small, 2-cycle) + red border fade-in
- Success (e.g., valid field): checkmark icon fade-in
- Multi-step form: horizontal slide transition between steps (direction-aware: forward = slide left, back = slide right)

## Modals
- Backdrop: fade-in (200ms)
- Panel: scale (0.95 → 1) + fade, spring-based easing
- Close: reverse of open, faster (150ms)

## Dropdowns / Menus
- Open: fade + slight translateY (-4px → 0)
- Item hover: background highlight transition, instant-feeling (80ms)

## Page Transitions
- Route change: fade-through (exit fade-out 100ms → enter fade-in 150ms), no jarring slides between unrelated sections
- Dashboard tab switches: crossfade content, persistent shared layout elements (e.g., sidebar) unaffected

## Loading States
- Skeleton screens for dashboard lists/tables (shimmer effect) instead of spinners where content shape is known
- Spinner only for indeterminate short actions (button submits, small fetches)
- Progress bar (top-of-page) for full navigation loads

## Dashboard (General)
- Sidebar item active state: sliding indicator/pill that animates position between items
- Card/metric entrance: staggered fade-up on dashboard load
- Empty states: subtle illustration fade-in, no motion loop (avoid distraction)

## Charts (Analytics)
- Bar/line charts animate in on first render (grow from baseline, 500–700ms)
- Tooltip: fade + follow cursor with slight lag/spring for smoothness
- Data refresh: crossfade between old/new values, not a jarring reset

## Notifications
- Toast: slide-in from top-right + fade, auto-dismiss with shrinking progress bar
- In-app notification bell: badge count pop-in (scale bounce) on new notification
- Notification list item: fade-in on new item arrival (real-time)

## Status/Progress Indicators (Project Milestones)
- Milestone completion: checkmark draw-in animation (SVG path animation) rather than instant swap
- Progress bar: animated fill transition when status updates, not instant jump

## Micro-interactions
- Copy-to-clipboard (referral link): icon morph to checkmark + "Copied" tooltip, reverts after 2s
- Like/rating stars: scale bounce on selection
- File upload: progress bar fill + success checkmark on completion, shake + red outline on rejected file type

## Accessibility Note
All animations respect `prefers-reduced-motion`: reduce to opacity-only transitions (no translate/scale) when the user's OS setting requests reduced motion.
