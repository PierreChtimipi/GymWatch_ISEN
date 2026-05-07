import { useState, useCallback, useRef } from "react";

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const timeoutRef = useRef<number>(0);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ message, type });
    timeoutRef.current = window.setTimeout(() => setToast(null), 2500);
  }, []);

  return { toast, showToast };
}
