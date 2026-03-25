// ============================================================
// Triangulate — useFilterState Hook (Chunk 2.1)
// React hook wrapping URL search params for filter management
// ============================================================

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { parseFilters, serializeFilters } from "./filter-codec";
import { DEFAULT_FILTER_STATE, type FilterState } from "~/types/filters";

/**
 * Hook for reading and writing filter state from/to URL search params.
 * All filter changes update the URL with replace: true (no history pollution).
 */
export function useFilterState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filterState = useMemo(
    () => parseFilters(searchParams),
    [searchParams]
  );

  const setFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      const next = { ...filterState, [key]: value };
      // If modifying any filter, deselect preset (becomes "custom")
      if (key !== "preset") {
        next.preset = null;
      }
      const params = serializeFilters(next);
      setSearchParams(params, { replace: true });
    },
    [filterState, setSearchParams]
  );

  const setFilters = useCallback(
    (updates: Partial<FilterState>) => {
      const next = { ...filterState, ...updates };
      const params = serializeFilters(next);
      setSearchParams(params, { replace: true });
    },
    [filterState, setSearchParams]
  );

  const clearAll = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const isDefault = useMemo(() => {
    return JSON.stringify(filterState) === JSON.stringify(DEFAULT_FILTER_STATE);
  }, [filterState]);

  return {
    filters: filterState,
    setFilter,
    setFilters,
    clearAll,
    isDefault,
  };
}
