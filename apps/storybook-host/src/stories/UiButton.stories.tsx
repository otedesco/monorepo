import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@domie/ui";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "ghost", "muted"],
      description: "Visual style variant using brand tokens",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the button",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    children: {
      control: "text",
      description: "Button label",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
    size: "md",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="muted">Muted</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button>Normal</Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
};

export const Primary: Story = {
  args: {
    children: "Primary Action",
    variant: "default",
    size: "lg",
  },
  parameters: {
    docs: {
      description: {
        story: "Primary button using brand-primary color token",
      },
    },
  },
};

export const Outline: Story = {
  args: {
    children: "Secondary Action",
    variant: "outline",
    size: "lg",
  },
  parameters: {
    docs: {
      description: {
        story: "Outline button with border-strong token",
      },
    },
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost Button",
    variant: "ghost",
  },
  parameters: {
    docs: {
      description: {
        story: "Ghost button with hover effects using surface tokens",
      },
    },
  },
};

export const InContext: Story = {
  render: () => (
    <div className="bg-surface border border-border-subtle rounded-xl p-8 space-y-6 max-w-md">
      <div>
        <h2 className="text-2xl font-bold mb-2">Property Details</h2>
        <p className="text-surface-foreground/80">
          This section demonstrates buttons in a realistic context using our design tokens.
        </p>
      </div>
      <div className="flex gap-4">
        <Button variant="default">Approve</Button>
        <Button variant="outline">Reject</Button>
        <Button variant="ghost">Cancel</Button>
      </div>
    </div>
  ),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story: "Buttons in context showing how they work with surface and border tokens",
      },
    },
  },
};

