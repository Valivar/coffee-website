import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const UICtx = createContext(null);
export const useUI = () => useContext(UICtx);

export function UIProvider({ children }) {
  const [drawerOpen, setDrawer] = useState(false);
  const [quickId, setQuick] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const idRef = useRef(0);

  const toast = useCallback((msg, opts = {}) => {
    const id = ++idRef.current;
    setToasts(t => [...t, { id, msg, ...opts }]);
  }, []);
  const dismissToast = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), []);

  const value = useMemo(() => ({
    drawerOpen, openDrawer: () => setDrawer(true), closeDrawer: () => setDrawer(false),
    quickId, openQuick: id => setQuick(id), closeQuick: () => setQuick(null),
    toasts, toast, dismissToast, loaded, setLoaded
  }), [drawerOpen, quickId, toasts, toast, dismissToast, loaded]);

  return <UICtx.Provider value={value}>{children}</UICtx.Provider>;
}
