---
name: Cheria National Identity
colors:
  surface: '#fff8f7'
  surface-dim: '#f2d2d5'
  surface-bright: '#fff8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0f1'
  surface-container: '#ffe9ea'
  surface-container-high: '#ffe1e4'
  surface-container-highest: '#fbdbde'
  on-surface: '#281719'
  on-surface-variant: '#514345'
  inverse-surface: '#3f2b2e'
  inverse-on-surface: '#ffeced'
  outline: '#837375'
  outline-variant: '#d6c2c4'
  surface-tint: '#864e5a'
  primary: '#864e5a'
  on-primary: '#ffffff'
  primary-container: '#ffb7c5'
  on-primary-container: '#7b4551'
  inverse-primary: '#fbb3c1'
  secondary: '#b52619'
  on-secondary: '#ffffff'
  secondary-container: '#ff5c47'
  on-secondary-container: '#610000'
  tertiary: '#9d4139'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffb9b0'
  on-tertiary-container: '#903830'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9df'
  primary-fixed-dim: '#fbb3c1'
  on-primary-fixed: '#360c19'
  on-primary-fixed-variant: '#6b3743'
  secondary-fixed: '#ffdad4'
  secondary-fixed-dim: '#ffb4a8'
  on-secondary-fixed: '#410000'
  on-secondary-fixed-variant: '#920703'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4aa'
  on-tertiary-fixed: '#410001'
  on-tertiary-fixed-variant: '#7e2b23'
  background: '#fff8f7'
  on-background: '#281719'
  surface-variant: '#fbdbde'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system for Cheria balances the delicate ephemeral beauty of the cherry blossom with the enduring strength of cherry wood. The brand personality is welcoming, transparent, and grounded in natural heritage.

The aesthetic style is **Modern Organic**. It leverages high-quality whitespace and professional typography (Minimalism) but softens the digital edges with tactile textures and soft gradients. The interface should feel like a sun-drenched courtyard: bright, airy, and structured by the warm, dark tones of traditional architecture.

**Visual Principles:**
- **Luminosity:** Backgrounds remain predominantly white or very light pink to maintain a "bright" emotional response.
- **Natural Contrast:** Use the deep wood tones to anchor the design, providing a sense of authority and permanence against the lighter floral elements.
- **Heritage Modernism:** Traditional serif headers paired with high-performance, accessible sans-serif body text.

## Colors

The palette is derived from the life cycle of the cherry tree.

- **Primary (Blossom Pink - #FFB7C5):** Used for primary actions, decorative flourishes, and brand accents. It represents the "welcoming" nature of the state.
- **Secondary (Cherry Wood - #8B0000):** Used for navigation bars, secondary buttons, and text that requires high authority.
- **Tertiary (Deep Bark - #4A0404):** Reserved for high-contrast text, footers, and deep structural lines.
- **Neutrals:** Soft whites and #FADADD (Light Petal) serve as background washes to prevent the "starkness" of pure white, keeping the UI warm.

**Gradients:**
Use "Petal Gradients" for hero sections: a soft linear transition from #FFFFFF to #FADADD at a 45-degree angle.

## Typography

The typographic system establishes a "Modern State" feel.

**Libre Caslon Text** is used for all headings. Its historical roots provide the "official" and "authoritative" tone required for a national identity, while its elegant curves mirror the organic shapes of blossoms.

**Plus Jakarta Sans** is the workhorse for all functional text. It is modern, soft, and highly legible, ensuring that government services feel accessible to all citizens.

**Usage Guidelines:**
- All H1-H3 headers should use the Secondary Wood color (#8B0000) to ensure readability and authority.
- Body text should use the Tertiary Deep Bark (#4A0404) at 90% opacity for a softer, more natural black.

## Layout & Spacing

The layout follows a **Fluid Grid** model to accommodate the diverse range of digital literacy among users.

- **Desktop:** 12-column grid with a maximum content width of 1280px.
- **Tablet:** 8-column grid with 24px margins.
- **Mobile:** 4-column grid with 16px margins.

The spacing philosophy is "Generous and Breathable." Avoid dense clusters of information. Use `lg` and `xl` spacing tokens to separate major sections, allowing the "airy" floral feel to permeate the design. Elements should feel like they have room to "bloom."

## Elevation & Depth

In this design system, depth is achieved through **Tonal Layers** and **Soft Ambient Shadows**.

Instead of harsh black shadows, use "Petal Shadows"—low-opacity dropshadows tinted with the Primary Pink color (e.g., `rgba(255, 183, 197, 0.3)`). This keeps the interface bright even when elements are elevated.

**Depth Levels:**
- **Level 0 (Surface):** The neutral background (#FADADD wash).
- **Level 1 (Cards):** Pure white surfaces with a 1px border of #FFB7C5 at 20% opacity.
- **Level 2 (Modals/Popups):** Pure white surfaces with a wide, soft Petal Shadow (20px blur, 4px Y-offset).
- **Level 3 (Interactive):** Elements that are being hovered should show a slight "glow" effect using the Primary color.

## Shapes

The shape language is **Rounded**, reflecting the soft edges of cherry blossoms and the polished finish of fine cherry wood furniture.

- **Standard Elements (Buttons, Inputs):** 0.5rem (8px) radius.
- **Large Elements (Cards, Containers):** 1rem (16px) radius.
- **Special Elements (Chips, Tags):** Use "Pill" shapes (Full radius) to mimic the organic fall of a petal.

**Decorative Accents:**
Where appropriate, use a subtle 5% opacity "Wood Grain" pattern overlay on Secondary-colored components to reinforce the tactile nature of the brand.

## Components

**Buttons:**
- **Primary:** Background of #FFB7C5 with White text. Bold, rounded. On hover, darken to a slightly more vibrant pink.
- **Secondary (Authoritative):** Background of #8B0000 with White text. Used for "Submit," "Apply," or "Confirm."
- **Tertiary (Ghost):** #8B0000 border and text, transparent background.

**Inputs:**
- Fields use a soft White background with a 1px border of #FFB7C5.
- Focus state: Border thickens to 2px and gains a soft pink outer glow.

**Cards:**
- Cards are always white.
- They should feature a "header accent"—a 4px top-border of #8B0000 to provide visual structure and a sense of "top-down" importance.

**Lists:**
- Bullet points should be replaced with a simplified 5-petal blossom icon in the Primary color.

**Interactive Patterns:**
- Hover states on images should apply a subtle warm "Sunlight" overlay (yellow/orange tint at 10% opacity) to enhance the welcoming feel.
