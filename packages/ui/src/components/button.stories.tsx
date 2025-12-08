import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Design System/Button",
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
      table: {
        type: { summary: "default | outline | ghost | muted" },
        defaultValue: { summary: "default" },
      },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the button",
      table: {
        type: { summary: "sm | md | lg" },
        defaultValue: { summary: "md" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
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

export const Primary: Story = {
  args: {
    children: "Submit",
    variant: "default",
    size: "md",
  },
  parameters: {
    docs: {
      description: {
        story: "Primary button using brand-primary color token. Use for main actions.",
      },
    },
  },
};

export const Outline: Story = {
  args: {
    children: "Cancel",
    variant: "outline",
    size: "md",
  },
  parameters: {
    docs: {
      description: {
        story: "Outline button with border-strong token. Use for secondary actions.",
      },
    },
  },
};

export const Ghost: Story = {
  args: {
    children: "Skip",
    variant: "ghost",
    size: "md",
  },
  parameters: {
    docs: {
      description: {
        story: "Ghost button with hover effects using surface tokens. Use for tertiary actions.",
      },
    },
  },
};

export const Muted: Story = {
  args: {
    children: "Reset",
    variant: "muted",
    size: "md",
  },
  parameters: {
    docs: {
      description: {
        story: "Muted button using brand-muted color token. Use for less prominent actions.",
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Button size variants: small, medium (default), and large.",
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Submit</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Skip</Button>
      <Button variant="muted">Reset</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All button variants using design tokens from the design system.",
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Normal</Button>
      <Button disabled>Disabled</Button>
      <Button variant="outline">Normal Outline</Button>
      <Button variant="outline" disabled>
        Disabled Outline
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Button states: normal and disabled. Disabled buttons have reduced opacity.",
      },
    },
  },
};

export const InContext: Story = {
  render: () => (
    <div className="bg-surface border border-border-subtle rounded-xl p-8 space-y-6 max-w-md">
      <div>
        <h2 className="text-2xl font-bold mb-2">Expense Approval</h2>
        <p className="text-surface-foreground/80">
          Review and approve or reject this expense submission.
        </p>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-surface border border-border-subtle rounded-lg">
          <div className="font-semibold mb-1">Plumbing Repair</div>
          <div className="text-sm text-surface-foreground/70">$250.00</div>
        </div>
        <div className="flex gap-4">
          <Button variant="default">Approve</Button>
          <Button variant="outline">Reject</Button>
          <Button variant="ghost">View Details</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story:
          "Buttons in a realistic context showing how they work with surface and border tokens from the design system.",
      },
    },
  },
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">
        <span className="mr-2">✓</span>
        Approve
      </Button>
      <Button variant="outline">
        <span className="mr-2">✗</span>
        Reject
      </Button>
      <Button variant="ghost" size="sm">
        <span className="mr-2">→</span>
        Next
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Buttons can contain icons or other content alongside text.",
      },
    },
  },
};

