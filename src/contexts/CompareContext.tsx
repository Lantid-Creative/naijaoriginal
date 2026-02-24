import { createContext, useContext, useState, ReactNode } from "react";

interface CompareContextType {
  compareIds: string[];
  addToCompare: (productId: string) => void;
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  compareCount: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const addToCompare = (productId: string) => {
    if (compareIds.length >= 4) return; // max 4
    if (!compareIds.includes(productId)) {
      setCompareIds((prev) => [...prev, productId]);
    }
  };

  const removeFromCompare = (productId: string) => {
    setCompareIds((prev) => prev.filter((id) => id !== productId));
  };

  const isInCompare = (productId: string) => compareIds.includes(productId);
  const clearCompare = () => setCompareIds([]);

  return (
    <CompareContext.Provider value={{ compareIds, addToCompare, removeFromCompare, isInCompare, clearCompare, compareCount: compareIds.length }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) throw new Error("useCompare must be used within CompareProvider");
  return context;
};
