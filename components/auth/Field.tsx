"use client";

import { ComponentType, InputHTMLAttributes, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  labelAside?: React.ReactNode;
};

/** Labelled input. Password inputs get a show/hide toggle. */
export function Field({ label, icon: Icon, value, onChange, hint, labelAside, type = "text", className, ...rest }: Props) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1.5">
      <div className="ml-1 flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-slate-300">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="group relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-primary-400" />
        )}
        <input
          id={id}
          type={isPassword && shown ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border border-slate-700/50 bg-slate-950/50 py-2.5 text-sm text-slate-100 transition-all placeholder:text-slate-600 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-60 ${
            Icon ? "pl-10" : "pl-4"
          } ${isPassword ? "pr-10" : "pr-4"} ${className ?? ""}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300 focus:outline-none"
          >
            {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {hint && <p className="ml-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}
