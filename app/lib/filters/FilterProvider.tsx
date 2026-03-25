// ============================================================
// Triangulate — FilterProvider (Chunk 2.1)
// React context wrapper for filter state
// ============================================================

import { createContext, useContext, type ReactNode } from "react";
import { useFilterState } from "./useFilterState";
import type { FilterState, FacetCounts } from "~/types/filters";

interface FilterContextValue {
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  setFilters: (updates: Partial<FilterState>) => void;
  clearAll: () => void;
  isDefault: boolean;
  facets: FacetCounts | null;
}

const FilterContext = createContext<FilterContextValue | null>(null);

interface FilterProviderProps {
  facets?: FacetCounts | null;
  children: ReactNode;
}

export function FilterProvider({ facets = null, children }: FilterProviderProps) {
  const filterState = useFilterState();

  return (
    <FilterContext.Provider value={{ ...filterState, facets }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return ctx;
}
