import React from "react";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export default function Input({ label, error, prefix, suffix, className = "", id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className={`flex items-center bg-[#0d1117] border ${error ? "border-[#f87171]" : "border-[#30363d]"} rounded-[8px] overflow-hidden focus-within:border-[#2dd4bf] transition-colors`}>
        {prefix && (
          <span className="pl-3 text-[#6e7681] text-sm shrink-0">{prefix}</span>
        )}
        <input
          id={inputId}
          className={`
            flex-1 bg-transparent px-3 py-2.5 text-sm text-[#e6edf3] placeholder:text-[#6e7681]
            outline-none font-['Outfit'] ${prefix ? "pl-1.5" : ""} ${suffix ? "pr-1.5" : ""}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className="pr-3 text-[#6e7681] text-sm shrink-0">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-[#f87171]">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = "", id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`
          bg-[#0d1117] border ${error ? "border-[#f87171]" : "border-[#30363d]"} rounded-[8px]
          px-3 py-2.5 text-sm text-[#e6edf3] placeholder:text-[#6e7681]
          outline-none focus:border-[#2dd4bf] transition-colors resize-none font-['Outfit']
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-[#f87171]">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = "", id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`
          bg-[#0d1117] border ${error ? "border-[#f87171]" : "border-[#30363d]"} rounded-[8px]
          px-3 py-2.5 text-sm text-[#e6edf3]
          outline-none focus:border-[#2dd4bf] transition-colors cursor-pointer font-['Outfit']
          ${className}
        `}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[#f87171]">{error}</p>}
    </div>
  );
}
