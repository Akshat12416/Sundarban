import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold w-auto transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-green focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-forest-green text-white shadow-lg hover:bg-emerald-700 hover:shadow-xl hover:shadow-forest-green/25 hover:scale-105 active:scale-95",
        destructive:
          "bg-red-500 text-white shadow-lg hover:bg-red-600 hover:shadow-xl hover:shadow-red-500/25 hover:scale-105 active:scale-95",
        outline:
          "border-2 border-forest-green bg-transparent text-forest-green shadow-sm hover:bg-forest-green hover:text-white hover:shadow-lg hover:shadow-forest-green/25 hover:scale-105 active:scale-95",
        secondary:
          "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 hover:shadow-lg hover:scale-105 active:scale-95",
        ghost: 
          "hover:bg-forest-green/10 hover:text-forest-green hover:scale-105 active:scale-95",
        link: 
          "text-forest-green underline-offset-4 hover:underline hover:scale-105 active:scale-95",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-8 rounded-md px-4 text-xs",
        lg: "h-14 rounded-md px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  ripple?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ripple = true, children, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const createRipple = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple || !buttonRef.current) return;

      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      const id = Date.now();

      setRipples(prev => [...prev, { x, y, id }]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== id));
      }, 600);
    }, [ripple]);

    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref || buttonRef}
        onClick={(e) => {
          createRipple(e);
          props.onClick?.(e);
        }}
        {...props}
      >
        {/* Ripple Effect */}
        {ripple && (
          <span className="absolute inset-0 overflow-hidden rounded-md">
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  width: 100,
                  height: 100,
                  transform: 'scale(0)',
                  animation: 'ripple 0.6s linear',
                }}
              />
            ))}
          </span>
        )}

        {/* Shimmer Effect */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
        
        {/* Content */}
        <span className="relative z-10">{children}</span>

        <style jsx>{`
          @keyframes ripple {
            to {
              transform: scale(2);
              opacity: 0;
            }
          }
          .animate-ripple {
            animation: ripple 0.6s linear;
          }
        `}</style>
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };