import { type VariantProps, cva } from "class-variance-authority";

export { default as Button } from "./Button.vue";

export const buttonVariants = cva(
  "flex items-center justify-center border font-medium enabled:cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&>svg]:mr-1.5 [&>svg]:opacity-60 [&>svg+svg]:hidden",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20",
        error: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-secondary/15 bg-transparent text-secondary hover:bg-secondary/10",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90",
        light: "border-transparent bg-secondary/5 text-foreground hover:bg-secondary/10",
        ghost: "border-transparent text-primary hover:bg-primary/10 hover:text-primary",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        md: "h-9 rounded-md px-4 text-sm",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-6 text-base",
        icon: "size-9 rounded-md [&>svg]:m-0 [&>svg]:opacity-100",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
