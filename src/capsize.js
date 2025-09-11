const { createStyleObject } = require('@capsizecss/core');
const interMetrics = require('@capsizecss/metrics/inter');
const fs = require('fs');

const textStyles = {
  'body-xl-brand-description': {
    tiny: { fontSize: 17, lineHeight: 1.32 },
    xxs: { fontSize: 18, lineHeight: 1.32 },
    xs: { fontSize: 18, lineHeight: 1.32 },
    sm: { fontSize: 22, lineHeight: 1.25 },
    md: { fontSize: 24, lineHeight: 1.25 },
    'md-lg': { fontSize: 26, lineHeight: 1.25 },
    lg: { fontSize: 26, lineHeight: 1.2 },
    xl: { fontSize: 26, lineHeight: 1.2 },
  },
  'body-xl-home-hero': {
    tiny: { fontSize: 16, lineHeight: 1.25 },
    xxs: { fontSize: 18, lineHeight: 1.3 },
    xs: { fontSize: 18, lineHeight: 1.3 },
    sm: { fontSize: 18, lineHeight: 1.3 },
    md: { fontSize: 22, lineHeight: 1.3 },
    'md-lg': { fontSize: 24, lineHeight: 1.25 },
    lg: { fontSize: 26, lineHeight: 1.2 },
    xl: { fontSize: 40, lineHeight: 1.15 },
  },
  'label-xl-home-hero-btn': {
    tiny: { fontSize: 14, lineHeight: 1 },
    xxs: { fontSize: 16, lineHeight: 1 },
    xs: { fontSize: 16, lineHeight: 1 },
    sm: { fontSize: 16, lineHeight: 1 },
    md: { fontSize: 17, lineHeight: 1 },
    'md-lg': { fontSize: 19, lineHeight: 1 },
    lg: { fontSize: 26, lineHeight: 1 },
    xl: { fontSize: 40, lineHeight: 1 },
  },
  'label-base-breadcrumbs': {
    tiny: { fontSize: 12, lineHeight: 1 },
    xxs: { fontSize: 13, lineHeight: 1 },
    xs: { fontSize: 14, lineHeight: 1 },
    sm: { fontSize: 14, lineHeight: 1 },
    md: { fontSize: 14, lineHeight: 1 },
    'md-lg': { fontSize: 14, lineHeight: 1 },
    lg: { fontSize: 14, lineHeight: 1 },
    xl: { fontSize: 14, lineHeight: 1 },
  },
};

// Breakpoint mapping to match your CSS
const breakpoints = {
  tiny: null, // Base styles (no media query)
  xxs: '375px',
  xs: '428px',
  sm: '768px',
  md: '1024px',
  'md-lg': '1280px',
  lg: '1440px',
  xl: '1920px',
};

function generateTextStyleCSS() {
  let css = '/* Capsize Text Styles */\n';

  Object.entries(textStyles).forEach(([styleName, breakpointStyles]) => {
    // Generate base styles (tiny)
    const fontSize = breakpointStyles.tiny.fontSize;
    const lineHeight = breakpointStyles.tiny.lineHeight;
    const leading = fontSize * lineHeight; // Convert relative to absolute

    const baseStyles = createStyleObject({
      fontSize: fontSize,
      leading: leading, // ✅ Use leading instead of lineHeight
      fontMetrics: interMetrics,
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

    // Generate responsive styles
    Object.entries(breakpointStyles).forEach(
      ([breakpoint, { fontSize, lineHeight }]) => {
        if (breakpoint === 'tiny') return; // Skip base styles

        const minWidth = breakpoints[breakpoint];
        if (!minWidth) return;

        const leading = fontSize * lineHeight; // Convert here too

        const styles = createStyleObject({
          fontSize,
          leading: leading, // ✅ Use leading instead of lineHeight
          fontMetrics: interMetrics,
        });

        css += `
@media (min-width: ${minWidth}) {
  .text-${styleName} {
    font-size: ${styles.fontSize};
    line-height: ${styles.lineHeight};
  }
  .text-${styleName}::before {
    margin-bottom: ${styles['::before'].marginBottom};
  }
  .text-${styleName}::after {
    margin-top: ${styles['::after'].marginTop};
  }
}
`;
      }
    );
  });

  return css;
}

// Generate and write CSS file
const css = generateTextStyleCSS();
fs.writeFileSync('./assets/capsize.css', css);
console.log('✅ Capsize text styles generated!');
