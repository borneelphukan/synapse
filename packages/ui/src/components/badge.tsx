import React, { forwardRef } from "react";

export type BadgeType = "default" | "success" | "error" | "warning" | "blue" | "outline" | "dotted" | "orange";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  type?: BadgeType;
  size?: BadgeSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const typeClasses: Record<BadgeType, string> = {
  default: "bg-gray-500 text-gray-100 border-gray-400",
  success: "bg-green-400 text-green-200 border-green-200",
  error: "bg-red-400 text-red-200 border-red-200",
  warning: "bg-yellow-400 text-yellow-200 border-yellow-200",
  blue: "bg-blue-400 text-blue-200 border-blue-200",
  orange: "bg-orange-400 text-orange-200 border-orange-200",
  outline: "bg-transparent text-gray-200 border-gray-400",
  dotted: "bg-transparent text-gray-100 border-gray-400 border-dashed",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "text-[10px] px-3 py-1 gap-1",
  md: "text-xs px-3.5 py-1 gap-1.5",
  lg: "text-sm px-4 py-1.5 gap-2",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", type = "default", size = "md", label, iconLeft, iconRight, ...props }: BadgeProps, ref) => {
    return (
      <span
        ref={ref}
        className={`flex flex-row items-center justify-center rounded-full shrink-0 relative font-bold text-center whitespace-nowrap border uppercase tracking-tighter ${typeClasses[type]} ${sizeClasses[size]} ${className}`.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {iconLeft && <span className="flex items-center justify-center">{iconLeft}</span>}
        <span>{label}</span>
        {iconRight && <span className="flex items-center justify-center">{iconRight}</span>}
      </span>
    );
  }
);

Badge.displayName = "Badge";
