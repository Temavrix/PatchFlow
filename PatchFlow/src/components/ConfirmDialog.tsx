
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import "./ConfirmDialog.css";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmContextType = {
  confirmDialog: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmDialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);

  const confirmDialog = useCallback((newOptions: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      // Resolve any existing confirmation before opening another.
      resolveRef.current?.(false);

      resolveRef.current = resolve;
      setOptions(newOptions);
    });
  }, []);

  const closeDialog = useCallback((confirmed: boolean) => {
    resolveRef.current?.(confirmed);
    resolveRef.current = null;
    setOptions(null);
  }, []);

  useEffect(() => {
    if (!options) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDialog(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [options, closeDialog]);

  return (
    <ConfirmContext.Provider value={{ confirmDialog }}>
      {children}

      {options && (
        <div
          className="confirm-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog(false);
            }
          }}
        >
          <section
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
          >
            <div className="confirm-dialog-icon" aria-hidden="true">
              !
            </div>

            <h2 id="confirm-title">
              {options.title ?? "Are you sure?"}
            </h2>

            <p id="confirm-message">{options.message}</p>

            <div className="confirm-dialog-actions">
              <button
                type="button"
                className="confirm-cancel-btn"
                onClick={() => closeDialog(false)}
              >
                {options.cancelText ?? "Cancel"}
              </button>

              <button
                type="button"
                className="confirm-delete-btn"
                autoFocus
                onClick={() => closeDialog(true)}
              >
                {options.confirmText ?? "Confirm"}
              </button>
            </div>
          </section>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error(
      "useConfirmDialog must be used within ConfirmDialogProvider"
    );
  }

  return context;
}
