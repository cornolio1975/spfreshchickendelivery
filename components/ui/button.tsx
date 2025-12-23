import * as React from "react"
import { cn } from "@/lib/utils"

import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "secondary" | "accent"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-primary text-white hover:opacity-90": variant === "default",
                        "bg-accent text-white hover:opacity-90": variant === "accent",
                        "bg-muted text-foreground hover:bg-muted/80": variant === "secondary",
                        "border-2 border-primary text-primary bg-transparent hover:bg-primary/10": variant === "outline",
                        "hover:bg-muted hover:text-foreground": variant === "ghost",
                        "h-10 px-6 py-2": size === "default",
                        "h-9 px-4 text-xs": size === "sm",
                        "h-12 px-8 text-base": size === "lg",
                        "h-10 w-10 p-0": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
