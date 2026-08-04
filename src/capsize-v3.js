const { createStyleObject } = require('@capsizecss/core');
const fs = require('fs');

/**
 * Scto Grotesk A font metrics
 * Extracted via @capsizecss/unpack from SctoGroteskA__Regular.otf
 */
const sctoGroteskA = {
  familyName: 'Scto Grotesk A',
  capHeight: 694,
  ascent: 800,
  descent: -200,
  lineGap: 244,
  unitsPerEm: 1000,
};

/**
 * V3 text styles — responsive font-size and line-height per breakpoint.
 *
 * Line-height is expressed as a ratio (1 = cap-height trim for single-line text).
 * Add new styles here as components are built. Run `npm run capsize:v3` to regenerate.
 *
 * Sources: design-system/extractions/navigation.md, submenu-drawer.md,
 * search-drawer.md, cart-drawer.md
 */
const textStyles = {
  'nav-label': {
    tiny: { fontSize: 15, lineHeight: 1 },
    xxs: { fontSize: 15, lineHeight: 1 },
    xs: { fontSize: 15, lineHeight: 1 },
    sm: { fontSize: 15, lineHeight: 1 },
    md: { fontSize: 15, lineHeight: 1 },
    'md-lg': { fontSize: 15, lineHeight: 1 },
    lg: { fontSize: 16, lineHeight: 1 },
    xl: { fontSize: 16, lineHeight: 1 },
  },
  'nav-badge': {
    tiny: { fontSize: 10, lineHeight: 1 },
    xxs: { fontSize: 10, lineHeight: 1 },
    xs: { fontSize: 10, lineHeight: 1 },
    sm: { fontSize: 10, lineHeight: 1 },
    md: { fontSize: 10, lineHeight: 1 },
    'md-lg': { fontSize: 10, lineHeight: 1 },
    lg: { fontSize: 10, lineHeight: 1 },
    xl: { fontSize: 10, lineHeight: 1 },
  },
  'submenu-l1': {
    tiny: { fontSize: 16, lineHeight: 1 },
    xxs: { fontSize: 17, lineHeight: 1 },
    xs: { fontSize: 18, lineHeight: 1 },
    sm: { fontSize: 18, lineHeight: 1 },
    md: { fontSize: 18, lineHeight: 1 },
    'md-lg': { fontSize: 18, lineHeight: 1 },
    lg: { fontSize: 20, lineHeight: 1 },
    xl: { fontSize: 20, lineHeight: 1 },
  },
  'submenu-l2': {
    tiny: { fontSize: 16, lineHeight: 1 },
    xxs: { fontSize: 17, lineHeight: 1 },
    xs: { fontSize: 18, lineHeight: 1 },
    sm: { fontSize: 15, lineHeight: 1 },
    md: { fontSize: 15, lineHeight: 1 },
    'md-lg': { fontSize: 15, lineHeight: 1 },
    lg: { fontSize: 16, lineHeight: 1 },
    xl: { fontSize: 16, lineHeight: 1 },
  },
  'submenu-caption': {
    tiny: { fontSize: 12, lineHeight: 1 },
    xxs: { fontSize: 13, lineHeight: 1 },
    xs: { fontSize: 13, lineHeight: 1 },
    sm: { fontSize: 13, lineHeight: 1 },
    md: { fontSize: 13, lineHeight: 1 },
    'md-lg': { fontSize: 13, lineHeight: 1 },
    lg: { fontSize: 14, lineHeight: 1 },
    xl: { fontSize: 14, lineHeight: 1 },
  },
  'submenu-utility': {
    tiny: { fontSize: 13, lineHeight: 1 },
    xxs: { fontSize: 14, lineHeight: 1 },
    xs: { fontSize: 15, lineHeight: 1 },
    sm: { fontSize: 15, lineHeight: 1 },
    md: { fontSize: 15, lineHeight: 1 },
    'md-lg': { fontSize: 15, lineHeight: 1 },
    lg: { fontSize: 16, lineHeight: 1 },
    xl: { fontSize: 16, lineHeight: 1 },
  },
  'search-input': {
    tiny: { fontSize: 16, lineHeight: 1 },
  },
  'search-caption': {
    tiny: { fontSize: 12, lineHeight: 1 },
    xxs: { fontSize: 13, lineHeight: 1 },
    lg: { fontSize: 14, lineHeight: 1 },
  },
  'search-result-link': {
    tiny: { fontSize: 16, lineHeight: 1 },
    xxs: { fontSize: 17, lineHeight: 1 },
    xs: { fontSize: 18, lineHeight: 1 },
    lg: { fontSize: 20, lineHeight: 1 },
  },
  'search-view-all': {
    tiny: { fontSize: 18, lineHeight: 1 },
    lg: { fontSize: 20, lineHeight: 1 },
  },
  'search-suggestion': {
    tiny: { fontSize: 14, lineHeight: 1 },
  },
  'search-product-meta': {
    tiny: { fontSize: 14, lineHeight: 1.3 },
  },
  'search-product-price': {
    tiny: { fontSize: 14, lineHeight: 1 },
  },
  'search-small': {
    tiny: { fontSize: 12, lineHeight: 1 },
  },
  'search-recent-clear': {
    tiny: { fontSize: 11, lineHeight: 1 },
    lg: { fontSize: 12, lineHeight: 1 },
  },
  'search-callout-title': {
    tiny: { fontSize: 14, lineHeight: 1.3 },
    lg: { fontSize: 16, lineHeight: 1.3 },
  },
  'search-callout-body': {
    tiny: { fontSize: 14, lineHeight: 1.35 },
    lg: { fontSize: 16, lineHeight: 1.35 },
  },
  'search-footer-hint': {
    tiny: { fontSize: 16, lineHeight: 1 },
  },
  'cart-title': {
    tiny: { fontSize: 24, lineHeight: 1 },
  },
  'cart-badge': {
    tiny: { fontSize: 12, lineHeight: 1 },
  },
  'cart-product-meta': {
    tiny: { fontSize: 14, lineHeight: 1.3 },
  },
  'cart-price': {
    tiny: { fontSize: 14, lineHeight: 1 },
  },
  'cart-small': {
    tiny: { fontSize: 12, lineHeight: 1 },
  },
  'cart-quantity': {
    tiny: { fontSize: 14, lineHeight: 1 },
  },
  'cart-subtotal': {
    tiny: { fontSize: 14, lineHeight: 1 },
    lg: { fontSize: 16, lineHeight: 1 },
  },
  'cart-shipping': {
    tiny: { fontSize: 14, lineHeight: 1.35 },
    lg: { fontSize: 16, lineHeight: 1.35 },
  },
  'cart-button': {
    tiny: { fontSize: 18, lineHeight: 1 },
    lg: { fontSize: 20, lineHeight: 1 },
  },
  'cart-callout-title': {
    tiny: { fontSize: 14, lineHeight: 1.3 },
    lg: { fontSize: 16, lineHeight: 1.3 },
  },
  'cart-callout-body': {
    tiny: { fontSize: 14, lineHeight: 1.35 },
    lg: { fontSize: 16, lineHeight: 1.35 },
  },
};

const breakpoints = {
  tiny: null,
  xxs: '375px',
  xs: '428px',
  sm: '768px',
  md: '1024px',
  'md-lg': '1280px',
  lg: '1440px',
  xl: '1920px',
};

function generateTextStyleCSS() {
  let css = '/* Capsize V3 Text Styles — Scto Grotesk A */\n';
  css += '/* Generated by src/capsize-v3.js — do not edit directly */\n';

  Object.entries(textStyles).forEach(([styleName, breakpointStyles]) => {
    let pseudoElementsInitialized = false;

    if (breakpointStyles.tiny) {
      const baseFontSize = breakpointStyles.tiny.fontSize;
      const baseLineHeight = breakpointStyles.tiny.lineHeight;
      const baseLeading = baseFontSize * baseLineHeight;

      const baseStyles = createStyleObject({
        fontSize: baseFontSize,
        leading: baseLeading,
        fontMetrics: sctoGroteskA,
      });

      css += `
.text-${styleName} {
  font-size: ${baseStyles.fontSize};
  line-height: ${baseStyles.lineHeight};
}
.text-${styleName}::before {
  content: "";
  margin-bottom: ${baseStyles['::before'].marginBottom};
  display: table;
}
.text-${styleName}::after {
  content: "";
  margin-top: ${baseStyles['::after'].marginTop};
  display: table;
}
`;
      pseudoElementsInitialized = true;
    }

    Object.entries(breakpointStyles).forEach(
      ([breakpoint, { fontSize, lineHeight }]) => {
        if (breakpoint === 'tiny') return;

        const minWidth = breakpoints[breakpoint];
        if (!minWidth) return;

        const leading = fontSize * lineHeight;

        const styles = createStyleObject({
          fontSize,
          leading,
          fontMetrics: sctoGroteskA,
        });

        const beforeInitialization = pseudoElementsInitialized
          ? ''
          : '    content: "";\n    display: table;\n';
        const afterInitialization = pseudoElementsInitialized
          ? ''
          : '    content: "";\n    display: table;\n';

        css += `
@media (min-width: ${minWidth}) {
  .text-${styleName} {
    font-size: ${styles.fontSize};
    line-height: ${styles.lineHeight};
  }
  .text-${styleName}::before {
${beforeInitialization}    margin-bottom: ${styles['::before'].marginBottom};
  }
  .text-${styleName}::after {
${afterInitialization}    margin-top: ${styles['::after'].marginTop};
  }
}
`;
        pseudoElementsInitialized = true;
      }
    );
  });

  return css;
}

const css = generateTextStyleCSS();
fs.writeFileSync('./assets/capsize-v3.css', css);
console.log('Capsize V3 text styles generated (Scto Grotesk A)');
