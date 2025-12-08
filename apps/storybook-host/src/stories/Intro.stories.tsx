import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Introduction",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Welcome: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-primary to-brand-primary/80 bg-clip-text text-transparent">
          Design System Storybook
        </h1>
        <p className="text-lg text-surface-foreground/80">
          Welcome to the isolated design system showcase. This Storybook instance is dedicated to
          showcasing components from <code className="bg-brand-muted px-2 py-1 rounded text-sm">@domie/ui</code> and
          feature-level components from the application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border-subtle rounded-xl p-6 space-y-3">
          <h2 className="text-2xl font-semibold">Design Tokens</h2>
          <p className="text-surface-foreground/80">
            Our design system uses CSS variables for consistent theming:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>
              <code className="bg-brand-muted px-2 py-1 rounded">--brand-primary</code> - Primary brand color
            </li>
            <li>
              <code className="bg-brand-muted px-2 py-1 rounded">--surface</code> - Surface backgrounds
            </li>
            <li>
              <code className="bg-brand-muted px-2 py-1 rounded">--border-subtle</code> - Subtle borders
            </li>
          </ul>
        </div>

        <div className="bg-brand-primary text-brand-primary-foreground rounded-xl p-6 space-y-3">
          <h2 className="text-2xl font-semibold">Brand Colors</h2>
          <p>
            This card demonstrates the brand primary color token. All components use these tokens
            for consistent theming across light and dark modes.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border-strong rounded-xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Token Usage Examples</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-brand-primary text-brand-primary-foreground p-4 rounded-lg text-center">
            <div className="font-semibold">Primary</div>
            <div className="text-xs opacity-80">bg-brand-primary</div>
          </div>
          <div className="bg-brand-muted text-brand-muted-foreground p-4 rounded-lg text-center">
            <div className="font-semibold">Muted</div>
            <div className="text-xs opacity-80">bg-brand-muted</div>
          </div>
          <div className="bg-surface border border-border-subtle p-4 rounded-lg text-center">
            <div className="font-semibold">Surface</div>
            <div className="text-xs opacity-60">bg-surface</div>
          </div>
          <div className="bg-surface border-2 border-border-strong p-4 rounded-lg text-center">
            <div className="font-semibold">Border</div>
            <div className="text-xs opacity-60">border-strong</div>
          </div>
        </div>
      </div>
    </div>
  ),
};

