import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PanelCardProps = {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function PanelCard({
  title,
  subtitle,
  action,
  className,
  children,
}: PanelCardProps) {
  return (
    <section className={cn("glass-card rounded-2xl p-5 animate-rise", className)}>
      {(title || subtitle || action) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title ? <h3 className="text-lg font-semibold text-slate-100">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
