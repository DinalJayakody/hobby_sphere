import React, { createContext, useContext, useState, useCallback } from "react";
import { StatusModal } from "../components/ui/StatusModal";

type ModalState = {
  open: boolean;
  status: "success" | "error";
  title?: string;
  message?: string;
};

type ModalContextValue = {
  showSuccess: (title?: string, message?: string, autoCloseMs?: number | null) => void;
  showError: (title?: string, message?: string, autoCloseMs?: number | null) => void;
  close: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ModalState>({ open: false, status: "success" });

  const show = useCallback((status: "success" | "error", title?: string, message?: string, autoCloseMs?: number | null) => {
    setState({ open: true, status, title, message });
    // If autoCloseMs === null, the StatusModal will not auto-close; we still let it be controlled by close()
    if (autoCloseMs && autoCloseMs > 0) {
      setTimeout(() => setState(prev => ({ ...prev, open: false })), autoCloseMs);
    }
  }, []);

  const showSuccess = useCallback((title?: string, message?: string, autoCloseMs = 3500) => show("success", title, message, autoCloseMs), [show]);
  const showError = useCallback((title?: string, message?: string, autoCloseMs = 5000) => show("error", title, message, autoCloseMs), [show]);

  const close = useCallback(() => setState(prev => ({ ...prev, open: false })), []);

  return (
    <ModalContext.Provider value={{ showSuccess, showError, close }}>
      {children}
      {/* Render the StatusModal at top-level so it overlays everything */}
      <StatusModal
        open={state.open}
        onClose={close}
        status={state.status}
        title={state.title}
        message={state.message}
        autoCloseMs={null} // ModalProvider handles auto-close; pass null to avoid double timeouts.
      />
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextValue => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
};
