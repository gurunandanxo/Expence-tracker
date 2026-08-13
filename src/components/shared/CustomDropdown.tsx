import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface CustomDropdownProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: DropdownOption[];
  compact?: boolean;
}

const MENU_MAX_HEIGHT = 240;
const MENU_ROW_HEIGHT = 40;
const VIEWPORT_MARGIN = 12;

export default function CustomDropdown({ label, value, onChange, options, compact = false }: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 0, maxHeight: MENU_MAX_HEIGHT });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const estimatedMenuHeight = Math.min(MENU_MAX_HEIGHT, options.length * MENU_ROW_HEIGHT + 8);
      const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
      const spaceAbove = rect.top - VIEWPORT_MARGIN;
      const openUpward = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;

      const maxHeight = Math.max(
        120,
        Math.min(MENU_MAX_HEIGHT, openUpward ? spaceAbove - 6 : spaceBelow - 6),
      );

      const top = openUpward ? Math.max(VIEWPORT_MARGIN, rect.top - maxHeight - 6) : rect.bottom + 6;
      const left = Math.max(VIEWPORT_MARGIN, Math.min(rect.left, window.innerWidth - rect.width - VIEWPORT_MARGIN));

      setMenuStyle({ top, left, width: rect.width, maxHeight });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={containerRef} className="relative">
      {label && <label className="text-xs text-muted-foreground mb-1 block">{label}</label>}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-2 bg-muted/30 border border-border rounded-lg text-sm text-foreground hover:border-primary/50 transition-colors ${compact ? 'px-3 py-2' : 'w-full px-4 py-2.5'}`}
      >
        <span className="flex items-center gap-2">
          {selected?.icon}
          {selected?.label || value}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width,
              maxHeight: menuStyle.maxHeight,
            }}
            className="fixed z-[120] glass-panel border border-border/50 rounded-lg py-1 overflow-y-auto shadow-xl"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${value === opt.value ? 'bg-primary/15 text-primary' : 'text-foreground hover:bg-muted/40'}`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
