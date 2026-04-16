import * as React from "react";

export type ToggleVariant = 'default' | 'outline';
export type ToggleSize = 'default' | 'sm' | 'lg';

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  variant?: ToggleVariant;
  size?: ToggleSize;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className = "",
      label,
      description,
      icon,
      isActive = false,
      variant = "default",
      size = "default",
      onClick,
      ...props
    }: ToggleProps,
    ref
  ) => {
    const variantClasses: Record<ToggleVariant, string> = {
      default: "bg-slate-50 border-gray-400",
      outline: "bg-transparent border-gray-400 shadow-sm",
    };

    const sizeClasses: Record<ToggleSize, string> = {
      default: "h-9 px-3 min-w-[36px]",
      sm: "h-8 px-2 min-w-[32px] text-xs",
      lg: "h-10 px-4 min-w-[40px] text-lg",
    };

    const baseClasses = "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer whitespace-nowrap";

    if (description || icon) {
      return (
        <button
          ref={ref}
          type="button"
          onClick={onClick}
          className={`
            flex w-full items-center gap-3 rounded-xl border p-2 transition-all duration-200 outline-none focus:ring-2 focus:ring-orange-500/20
            ${isActive ? "bg-orange-50 border-orange-500" : "bg-white border-gray-400"}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        >
          {icon && (
            <div
              className={`flex-shrink-0 rounded-lg p-2 flex items-center justify-center
                ${isActive ? "bg-white" : "bg-slate-50"}
              `}
            >
              {icon}
            </div>
          )}
          <div className="text-left flex-1 min-w-0">
            <div className="text-sm font-bold text-gray-900 break-words line-clamp-1">
              {label}
            </div>
            {description && (
              <div className="text-xs text-gray-100 line-clamp-1">{description}</div>
            )}
          </div>
        </button>
      );
    }

    const combinedClassName = `
      ${baseClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${isActive ? "!bg-orange-50 !border-orange-500 !text-orange-600 !ring-1" : "text-gray-900 hover:bg-slate-100"}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={combinedClassName}
        {...props}
      >
        <span>{label}</span>
      </button>
    );
  }
);

Toggle.displayName = "Toggle";

export { Toggle };
