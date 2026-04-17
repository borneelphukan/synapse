import * as React from "react";
import { forwardRef } from "react";

type TextareaProps = React.ComponentPropsWithoutRef<"textarea"> & {
  id: string;
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  required?: boolean;
};

const TextArea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      id,
      label,
      hideLabel,
      hint,
      error,
      placeholder,
      required,
      ...props
    }: TextareaProps,
    ref
  ) => {
    return (
      <label className="flex flex-col gap-1.5 group/input disabled:pointer-events-none">
        <span
          className={
            hideLabel
              ? "sr-only"
              : "text-slate-400 font-medium text-[10px] uppercase tracking-wider group-focus-within/input:text-sky-400 transition-colors"
          }
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>

        <div
          className={`flex flex-row gap-2 items-start p-0 rounded-lg border border-slate-700 bg-slate-900 overflow-hidden transition-colors focus-within:border-sky-500 ${
            error ? "border-red-400" : ""
          } ${className || ""}`}
        >
          <textarea
            className={`w-full bg-transparent px-3 py-2 text-xs focus:outline-none transition-colors resize-none placeholder-slate-500 text-slate-200 min-h-[120px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent`}
            id={id}
            name={id}
            ref={ref}
            placeholder={placeholder}
            {...props}
          />
        </div>
        {hint && (
          <span className="text-slate-500 font-normal text-[10px]">
            {hint}
          </span>
        )}
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </label>
    );
  }
);

export { TextArea };

