import * as React from "react";
import { Icon } from './icon';


export type ButtonVariant = 'primary' | 'success' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'md' | 'sm' | 'lg' | 'icon';
export type ButtonShape = 'default' | 'circle';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  isLoading?: boolean;
  icon?: {
    left?: React.ReactNode;
    right?: React.ReactNode;
  };
  label?: string;
  asChild?: boolean;
  href?: string;
  target?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className = "",
  variant = "primary",
  size = "md",
  shape = "default",
  icon,
  isLoading = false,
  asChild = false,
  label,
  children,
  href,
  ...props
}: ButtonProps, ref) => {
  const isEffectivelyDisabled = isLoading || props.disabled;
  const hasContent = !!label || !!children;
  const isIconOnly = size === "icon" || (!hasContent && !!(icon?.left || icon?.right));

  const variantClasses: Record<ButtonVariant, string> = {
    primary: "text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/20 disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none",
    success: "text-white bg-emerald-500 hover:bg-emerald-600",
    destructive: "text-white bg-red-500 hover:bg-red-600",
    outline: "text-slate-200 border border-slate-700 hover:border-sky-500/50",
    secondary: "text-slate-200 bg-slate-800 hover:bg-slate-700",
    ghost: "text-slate-300 hover:bg-slate-800",
    link: "text-sky-400 p-0 rounded-none hover:underline",
  };

  const sizeClasses: Record<ButtonSize, string> = {
    md: "py-2 px-6",
    sm: "py-1 px-3 text-sm",
    lg: "py-3 px-8 text-lg",
    icon: "size-9 p-2",
  };

  const shapeClasses: Record<ButtonShape, string> = {
    default: "rounded-lg",
    circle: "rounded-full",
  };

  const baseClasses = "relative inline-flex items-center justify-center gap-2 h-fit whitespace-nowrap text-xs font-bold transition-all duration-200 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shrink-0 cursor-pointer ease-out";

  const combinedClassName = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${shapeClasses[shape]}
    ${isIconOnly ? "aspect-square" : ""}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const content = (
    <div className={`flex items-center justify-center gap-2 transition-opacity duration-200 ${isLoading ? "opacity-0" : ""}`}>
      {icon?.left}
      {isIconOnly ? children : label || children}
      {icon?.right}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className={combinedClassName}
        {...props as any}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      className={combinedClassName}
      disabled={isEffectivelyDisabled}
      {...props}
    >
      {content}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon type="sync" className="animate-spin !text-[14px]" />
        </div>
      )}
    </button>
  );
});

Button.displayName = "Button";

export default Button;

