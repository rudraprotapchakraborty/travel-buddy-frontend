"use client";

import { ClipboardEvent, KeyboardEvent, useRef } from "react";

/** Six single-digit boxes with paste support and arrow / backspace navigation. */
export function OtpInput({
  value,
  onChange,
  disabled,
  autoFocus,
  label = "Verification code",
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  label?: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const focus = (i: number) => refs.current[Math.min(Math.max(i, 0), 5)]?.focus();

  const setDigit = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, "");
    if (!d) return;
    const next = digits.slice();
    // typing more than one digit at once (autofill) spreads over the boxes
    d.split("").forEach((ch, k) => {
      if (i + k < 6) next[i + k] = ch;
    });
    onChange(next.join(""));
    focus(i + d.length);
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = digits.slice();
      if (next[i]) next[i] = "";
      else if (i > 0) {
        next[i - 1] = "";
        focus(i - 1);
      }
      onChange(next.join(""));
    } else if (e.key === "ArrowLeft") focus(i - 1);
    else if (e.key === "ArrowRight") focus(i + 1);
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    focus(pasted.length);
  };

  return (
    <div role="group" aria-label={label} className="flex justify-center gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          maxLength={6}
          aria-label={`Digit ${i + 1}`}
          className="h-14 w-11 rounded-xl border border-slate-700/50 bg-slate-950/50 text-center text-xl font-semibold tabular-nums text-slate-100 transition-all focus:border-primary-500/60 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-60 sm:w-12"
        />
      ))}
    </div>
  );
}
