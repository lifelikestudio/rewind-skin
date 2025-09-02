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
    const baseStyles = createStyleObject({
      fontSize: breakpointStyles.tiny.fontSize,
      lineHeight: breakpointStyles.tiny.lineHeight,
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

        const styles = createStyleObject({
          fontSize,
          lineHeight,
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
