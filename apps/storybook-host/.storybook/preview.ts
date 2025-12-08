import type { Preview } from "@storybook/react";
import "@my-org/ui/styles";
import "../src/styles/storybook.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "dark",
      values: [
        {
          name: "dark",
          value: "hsl(var(--surface))",
        },
        {
          name: "light",
          value: "#ffffff",
        },
      ],
    },
    // Accessibility (a11y) Configuration
    // ===================================
    // The @storybook/addon-a11y addon automatically checks stories for accessibility issues.
    // 
    // Usage:
    // 1. Open any story in Storybook
    // 2. Click the "Accessibility" tab in the bottom panel
    // 3. Review violations, passes, and incomplete checks
    // 4. Fix issues in your components based on the recommendations
    //
    // The addon uses axe-core to check for WCAG violations and provides:
    // - Color contrast issues
    // - Missing ARIA labels
    // - Keyboard navigation problems
    // - Semantic HTML issues
    // - And more accessibility best practices
    //
    // You can configure specific rules or disable checks per story:
    // parameters: {
    //   a11y: {
    //     config: { rules: [{ id: 'color-contrast', enabled: false }] }
    //   }
    // }
    a11y: {
      // Optional: Configure specific a11y rules
      // See https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md
      config: {
        rules: [
          // Example: You can disable or configure specific rules here
          // { id: 'color-contrast', enabled: true },
        ],
      },
      // Optional: Set element to check (defaults to story root)
      element: "#storybook-root",
    },
  },
  decorators: [
    (Story) => {
      // Apply dark mode class to body
      if (typeof document !== "undefined") {
        document.body.classList.add("dark");
      }
      return (
        <div className="bg-surface text-surface-foreground min-h-screen p-8">
          <Story />
        </div>
      );
    },
  ],
};

export default preview;

