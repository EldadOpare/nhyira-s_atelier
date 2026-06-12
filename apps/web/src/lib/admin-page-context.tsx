import { createContext, useContext, useState, useCallback } from "react";

type PageHeader = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

type AdminPageCtx = {
  header: PageHeader;
  setHeader: (h: PageHeader) => void;
};

const AdminPageContext = createContext<AdminPageCtx>({
  header: { title: "" },
  setHeader: () => {},
});

export function AdminPageProvider({ children }: { children: React.ReactNode }) {
  const [header, setHeaderState] = useState<PageHeader>({ title: "" });
  const setHeader = useCallback((h: PageHeader) => setHeaderState(h), []);
  return (
    <AdminPageContext.Provider value={{ header, setHeader }}>
      {children}
    </AdminPageContext.Provider>
  );
}

export function useAdminPage() {
  return useContext(AdminPageContext);
}
