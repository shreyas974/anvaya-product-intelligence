/**
 * ANVAYA — Sunrise Liquid Glass Design System Tokens
 * Section 62 Master Specification
 */

export const sunriseTokens = {
  // Base sunrise gradient (canvas / hero / marketing / auth only)
  canvas: {
    horizonGold: '#FFD9A0',
    sunriseCoral: '#FF9E7D',
    blushPink: '#FDB4C0',
    dawnLavender: '#C9B8E8',
    paleSky: '#AFD3E8',
    gradient: 'linear-gradient(135deg, #FFD9A0 0%, #FF9E7D 25%, #FDB4C0 50%, #C9B8E8 75%, #AFD3E8 100%)',
    softGradient: 'linear-gradient(135deg, rgba(255, 217, 160, 0.35) 0%, rgba(255, 158, 125, 0.3) 30%, rgba(253, 180, 192, 0.25) 60%, rgba(201, 184, 232, 0.25) 85%, rgba(175, 211, 232, 0.2) 100%)',
    heroRadial: 'radial-gradient(ellipse at bottom, rgba(255, 217, 160, 0.5) 0%, rgba(255, 158, 125, 0.4) 30%, rgba(201, 184, 232, 0.2) 70%, transparent 100%)',
  },

  // Neutral / glass surface tokens (workspace, tables, forms)
  surfaces: {
    base: '#FFFBF7', // warm-white, not pure #FFFFFF
    glass: 'rgba(255, 251, 247, 0.60)',
    glassMedium: 'rgba(255, 251, 247, 0.72)',
    glassStrong: 'rgba(255, 251, 247, 0.85)',
    glassSolid: '#FAF5EF',
    borderHairline: 'rgba(120, 90, 70, 0.12)',
    borderHover: 'rgba(120, 90, 70, 0.22)',
    borderFocus: '#E8703A',
    shadowWarm: '0 8px 32px 0 rgba(120, 70, 40, 0.08)',
    shadowWarmSm: '0 2px 8px 0 rgba(120, 70, 40, 0.05)',
    shadowWarmLg: '0 16px 48px 0 rgba(120, 70, 40, 0.12)',
  },

  // Text hierarchy (warm near-black, never pure #000000)
  text: {
    primary: '#2B2320',
    secondary: '#6B5E56',
    muted: '#9C8F86',
    inverted: '#FFFBF7',
  },

  // Accent ramp (buttons, links, active states, charts)
  accents: {
    primary: '#E8703A', // burnt coral — primary CTA, active nav
    primaryHover: '#D45D28',
    secondary: '#F2A65A', // amber gold — secondary emphasis
    secondaryHover: '#E09242',
    tertiary: '#D98CA6', // dusty rose — tertiary chart series
    quaternary: '#8E7FC7', // soft plum — quaternary chart series
  },

  // Semantic status colors (evidence, validation, confidence)
  status: {
    verified: {
      text: '#C77F2E',
      bg: '#FBEEDD',
      border: 'rgba(199, 127, 46, 0.25)',
      label: 'Verified',
    },
    passed: {
      text: '#C77F2E',
      bg: '#FBEEDD',
      border: 'rgba(199, 127, 46, 0.25)',
      label: 'Passed',
    },
    matched: {
      text: '#B8863B',
      bg: '#FBEEDD',
      border: 'rgba(184, 134, 59, 0.25)',
      label: 'Matched',
    },
    supported: {
      text: '#B8863B',
      bg: '#FBEEDD',
      border: 'rgba(184, 134, 59, 0.25)',
      label: 'Supported',
    },
    inferred: {
      text: '#C98A52',
      bg: '#FBF2E6',
      border: 'rgba(201, 138, 82, 0.25)',
      label: 'Inferred',
    },
    needsReview: {
      text: '#C2571F',
      bg: '#FDEADE',
      border: 'rgba(194, 87, 31, 0.25)',
      label: 'Needs Review',
    },
    unavailable: {
      text: '#8A7E76',
      bg: '#F1ECE7',
      border: 'rgba(138, 126, 118, 0.25)',
      label: 'Unavailable',
    },
    error: {
      text: '#B23B2E',
      bg: '#FBE3DE',
      border: 'rgba(178, 59, 46, 0.25)',
      label: 'Failed',
    },
  },

  // Chart color palette (warm sunrise ramp on light-glass background)
  charts: {
    series1: '#E8703A', // burnt coral
    series2: '#F2A65A', // amber gold
    series3: '#D98CA6', // dusty rose
    series4: '#8E7FC7', // soft plum
    series5: '#C77F2E', // warm gold-brown
    series6: '#B8863B', // warm bronze
  },
} as const;

export type SunriseToken = typeof sunriseTokens;
