# Design tokens

Collected 2026-10-20 from legacy CSS and from the PNG files under `legacy/`. Figma screen exports were sampled only to confirm colours that already appear in the CSS. No token was invented to fill a gap.

Two greens are in the repo. The admin UI and the Figma screens use mint `#1DBF73`. The landing page uses forest `#228B22`. The mobile app and admin web should follow the mint set, because `docs/PLAN-SPEC.md` section 5.7 says the app keeps the Figma look. The landing palette is recorded because it is in the CSS, and the landing page itself is dropped.

## Colour

### Mint set used by the admin UI and the Figma screens

| Token | Hex | Where it is set |
|---|---|---|
| Brand green | `#1DBF73` | 100 occurrences across admin and landing class names. Default accent in `legacy/admin-portal/src/components/animations/StaggeredMenu.tsx`. Sampled as a dominant fill on the Figma individual-form and transaction-history PNGs. |
| Brand green hover | `#17A665` | `hover:border-[#17a665]` on the approved-projects filter. |
| Mint chip | `#ACEEC7` | Status pill background on approved-project cards (`bg-[#aceec7]`). Dominant green fill on the Figma individual-form PNG (the Land Record well). |
| Page wash | `#EDFCF3` | Most common non-white pixel on the Figma Home export. Neighbouring samples `#EEFCF4`, `#ECFBF2`. This wash is not declared in CSS. It is a measured sample from the screen PNG. |
| White | `#FFFFFF` | Card and navbar surfaces. |
| Black | `#000000` | Selected pills, upload button, primary text. Admin nav uses `text-black/80` and `text-black/90` for secondary text. |
| Ink | `#111111` | Social link text in the staggered menu. |
| Near-black | `#0F0F0F`, `#1A1A1A`, `#010204` | Scattered text and overlay colours in animation components. |

`#1DBF73` as an rgb() fallback for the name "green" is `rgba(29, 191, 115, …)` in `AnimatedButton.tsx`.

### Forest set used by the landing page

Declared in `legacy/landing-page/src/globals.css`.

| Token | Value |
|---|---|
| Forest green | `#228B22` |
| Forest gradient end | `#32CD32` |
| Deep forest | `#006400`, `#2F4F2F` |
| Emerald | `#047857` |
| Forest washes | `rgba(34, 139, 34, 0.05)`, `0.10`, `0.20`, `0.25`, `0.30`, `0.50`, `0.70` |
| Body text | `#333333` |
| Contributor page background | `#07110B` in `legacy/contributor-portal/src/index.css` |

The landing stylesheet also maps `.hover\:text-[#1DBF73]` onto `#228B22`, so the mint hex in that one rule is not the colour that paints.

### Landing shadcn variables

`legacy/landing-page/tailwind.css` `:root`. These are the Anima/shadcn defaults, not the forest theme.

| Variable | HSL |
|---|---|
| `--background`, `--popover` | `0 0% 100%` |
| `--foreground`, `--primary` | `222.2 47.4% 11.2%` |
| `--muted`, `--secondary`, `--accent` | `210 40% 96.1%` |
| `--muted-foreground` | `215.4 16.3% 46.9%` |
| `--border`, `--input` | `214.3 31.8% 91.4%` |
| `--destructive` | `0 100% 50%` |
| `--ring` | `215 20.2% 65.1%` |
| `--radius` | `0.5rem` |

A `.dark` block repeats the same radius and inverts the surfaces. The landing page is dropped, so these variables are reference only.

### Status and error colours in CSS

| Hex | Role in the old UI |
|---|---|
| `#FF5247`, `#E6453A` | Destructive reds in animation components |
| `#FECACA` | Light red fill |
| `#00BCF2` | A one-off blue in an animation component |

Approved pills use mint text `#1DBF73` on `#ACEEC7`. There is no CSS class for the new statuses `under_review`, `needs_more_evidence`, or `credited`.

### PNG files under legacy/

| File | What the pixels are | Use as a token? |
|---|---|---|
| `legacy/admin-portal/src/photos/logo.jpg` | Dominant sample `#074226`, with a light-green leaf. The image is an Adobe Stock preview with a watermark. | No. Do not ship it. |
| `legacy/admin-portal/src/photos/countdown.png` | Black line icon on white (`#000000` on `#FFFFFF`). | No colour token. The icon is a generic countdown mark. |
| `legacy/admin-portal/src/photos/nature.png` | Solid `#000000`. | No. |
| `legacy/admin-portal/src/photos/placeholder.png` | Solid `#000000` at a 80×80 sample. | No. |
| Figma exports of the five linked frames | Confirm `#FFFFFF`, `#1DBF73`, `#ACEEC7`, and the `#EDFCF3` page wash. | Yes, as confirmation of the mint set above. |

## Typography

| Token | Value | Where |
|---|---|---|
| Family | Inter, then Helvetica, then the system sans stack | Landing `index.html` loads `Inter` at weights 400, 500, and 700. Admin JSX sets `[font-family:'Inter',Helvetica]`. Navbar inline CSS falls back to Segoe UI and Roboto. `globals.css` body stack is Inter, `-apple-system`, `BlinkMacSystemFont`, Segoe UI, Roboto. |
| Body line height | `1.6` | `legacy/landing-page/src/globals.css` |
| Nav link | 16px, weight 500, line height 24px | `Navbar.jsx` |
| Page title | Tailwind `text-6xl` up to `text-8xl`, weight 700, tracking `-0.5px` | Approved and rejected headings |
| Landing hero | Inter, weight 700, tracking down to `-2.5px` | `HeroSection.tsx` |
| Menu overlay | `2.5rem` to `4rem`, weight 600, uppercase, tracking `-1px` to `-2px` | Staggered menu. Dropped with the animation components. |

Admin `index.html` does not load a font stylesheet. Inter is named in class strings and will fall through to the next family unless the new app adds the font.

## Radius

| Token | Value | Where |
|---|---|---|
| Control radius | `0.5rem` (8px) | `--radius` in landing `tailwind.css`. Tailwind `rounded-lg` on admin cards. |
| Tight | `calc(var(--radius) - 2px)` and `- 4px` | Landing `borderRadius.md` and `.sm` |
| Card image | `rounded-xl` (12px), and `rounded-2xl` (16px) on the lightbox image | Approved-project thumbnails |
| Pills | `rounded-full` | Filters, status chips, Figma primary buttons |
| Icon line | `2px` | Staggered-menu hamburger bars |
| Scrollbar thumb | `10px` | Landing `globals.css` |

Figma text fields and the Land Record well use a large corner radius consistent with `rounded-xl` or pill ends. The metadata does not store a corner-radius number, so the CSS values above stay the source of truth.

## Spacing

Tailwind 4 defaults, as used in the admin layout. 1 unit is 4px.

| Use | Classes | Pixels |
|---|---|---|
| Navbar horizontal padding | `px-4 md:px-10` | 16px, then 40px |
| Navbar vertical padding | `py-4` | 16px |
| Page content max width | `max-w-[1203px]` | 1203px |
| Footer max width and padding | `max-w-7xl`, `px-6 py-8` | 80rem cap, 24px × 32px |
| Footer top margin | `mt-12` | 48px |
| Card grid gap | `gap-2`, `gap-3`, `gap-4`, `gap-6` | 8, 12, 16, 24px |
| Card padding | `p-3 sm:p-4 lg:p-6` | 12, 16, 24px |
| Inline clusters | `gap-5`, `gap-8` | 20px, 32px |
| Landing container | `padding: 2rem`, screen `2xl: 1400px` | 32px, 1400px cap |
| Landing section padding | `px-4 md:px-10 py-7` | 16 / 40px horizontal, 28px vertical |

Figma frame measures from the file metadata (file `shpkaFOkntqpC8YNVw4KEb`), for the mobile app only:

| Measure | Pixels |
|---|---|
| Frame width | 393 |
| Home and history and profile height | 852 |
| Individual form frame height | 899 |
| Organisation form frame height | 1015 |
| Page inset | 10 |
| Home header block | 131 tall |
| Compact top bar | 80 tall |
| Bottom navigation | 80 tall |
| Form bottom bar | 70 tall |
| Text field | 48 tall |
| Dropdown and split number fields | 52 tall |
| Filter row | 45 tall |

## Shadow

| Use | Value |
|---|---|
| Navbar | `shadow-md` |
| Project card container | `shadow-xl` |
| Forest hover glow | `0 10px 15px -3px rgba(34, 139, 34, 0.25)` |
| Forest deep glow | `0 25px 50px -12px rgba(34, 139, 34, 0.3)` |
| Focus ring | `0 0 0 3px rgba(34, 139, 34, 0.3)` |

The forest shadows belong to the dropped landing page. The admin cards use Tailwind's default `shadow-xl`.
