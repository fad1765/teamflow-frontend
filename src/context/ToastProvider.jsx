import { useCallback, useRef, useState } from "react";
import Toast from "../components/Toast";
import { ToastContext } from "./ToastContext";

export function ToastProvider({ children }) {
  const timerRef = useRef(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "info",
  });

  const showToast = useCallback((message, type = "info") => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({
      open: true,
      message,
      type,
    });

    timerRef.current = setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        open: false,
      }));
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast open={toast.open} message={toast.message} type={toast.type} />
    </ToastContext.Provider>
  );
}