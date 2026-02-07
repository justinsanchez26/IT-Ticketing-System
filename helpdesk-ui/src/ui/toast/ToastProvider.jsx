import { useCallback, useMemo, useRef, useState } from "react";
import { ToastCtx } from "./toastContext";
import "../../styles/toast.css";

export default function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(1);

    const remove = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const show = useCallback((message, type = "info", opts = {}) => {
        const id = idRef.current++;
        const duration = opts.duration ?? 3000;

        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => remove(id), duration);
    }, [remove]);

    const value = useMemo(() => ({ show, remove }), [show, remove]);

    return (
        <ToastCtx.Provider value={value}>
            {children}
            <div className="toast-stack">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast-${t.type}`}>
                        <span>{t.message}</span>
                        <button onClick={() => remove(t.id)}>×</button>
                    </div>
                ))}
            </div>
        </ToastCtx.Provider>
    );
}
