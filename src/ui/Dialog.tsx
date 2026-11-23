import { createContext, type ComponentChildren } from 'preact';
import { useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks';

export type DialogOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive action: confirm button styled as danger. */
  danger?: boolean;
};
type Open = DialogOptions & { kind: 'confirm' | 'alert'; resolve: (v: boolean) => void };

type DialogApi = {
  /** Resolves `true` on confirm, `false` on cancel / Escape / outside click. */
  confirm: (o: DialogOptions) => Promise<boolean>;
  /** Single-button notice. */
  alert: (o: DialogOptions) => Promise<void>;
};

const Ctx = createContext<DialogApi | null>(null);

/**
 * In-panel modal replacing native confirm()/alert() (use `useDialog()`, never the browser dialogs).
 * Escape closes only the dialog (does not reach the rest of the panel).
 */
export function DialogProvider({ children }: { children?: ComponentChildren }) {
  const [open, setOpen] = useState<Open | null>(null);
  const openRef = useRef<Open | null>(null);
  openRef.current = open;
  const okBtn = useRef<HTMLButtonElement>(null);

  const api = useMemo<DialogApi>(() => {
    const show = (kind: Open['kind'], o: DialogOptions) =>
      new Promise<boolean>((resolve) => {
        openRef.current?.resolve(false);
        setOpen({ ...o, kind, resolve });
      });
    return { confirm: (o) => show('confirm', o), alert: (o) => show('alert', o).then(() => undefined) };
  }, []);

  const close = (v: boolean) => {
    openRef.current?.resolve(v);
    setOpen(null);
  };

  useEffect(() => {
    if (!open) return;
    okBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      close(false);
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {open && (
        <div class="dialog-backdrop" onPointerDown={(e) => e.target === e.currentTarget && close(false)}>
          <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="tl-dialog-title" aria-describedby="tl-dialog-msg">
            {open.title && <h4 id="tl-dialog-title">{open.title}</h4>}
            <p id="tl-dialog-msg">{open.message}</p>
            <div class="dialog-actions">
              {open.kind === 'confirm' && (
                <button type="button" class="btn dialog-cancel" onClick={() => close(false)}>
                  {open.cancelLabel ?? 'Cancel'}
                </button>
              )}
              <button type="button" ref={okBtn} class={open.danger ? 'btn primary danger-solid dialog-ok' : 'btn primary dialog-ok'} onClick={() => close(true)}>
                {open.confirmLabel ?? 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useDialog(): DialogApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDialog must be used inside <DialogProvider>');
  return v;
}
