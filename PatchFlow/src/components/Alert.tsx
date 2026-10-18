
import {createContext, useCallback, useContext, useEffect, useState, type ReactNode,} from "react";
import "./Alert.css";

export type AlertType = "success" | "error" | "warning" | "info";

type AlertItem = {
  id: number;
  message: string;
  type: AlertType;
};

type AlertContextType = {
  showAlert: (message: string, type?: AlertType) => void;
};

const AlertContext = createContext<AlertContextType | null>(null);

let nextAlertId = 0;

function Alert({
    alert,
    onClose,
  }: {
    alert: AlertItem;
    onClose: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(alert.id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [alert.id, onClose]);

  const icons: Record<AlertType, string> = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "i",
  };

  return (
    <div className={`alert alert-${alert.type}`} role={alert.type === "error" ? "alert" : "status"} aria-live={alert.type === "error" ? "assertive" : "polite"}>
      <span className="alert-icon" aria-hidden="true">
        {icons[alert.type]}
      </span>

      <span className="alert-message">{alert.message}</span>

      <button className="alert-close" onClick={() => onClose(alert.id)} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  );
}

export function AlertProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const dismissAlert = useCallback((id: number) => {
    setAlerts((current) =>
      current.filter((alert) => alert.id !== id)
    );
  }, []);

  const showAlert = useCallback(
    (message: string, type: AlertType = "info") => {
      const id = ++nextAlertId;

      setAlerts((current) => [
        ...current,
        { id, message, type },
      ]);
    },
    []
  );

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      <div className="alert-container">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            alert={alert}
            onClose={dismissAlert}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error(
      "Error ABpos"
    );
  }

  return context;
}
