"use client";

import { useEffect, useMemo, useState } from "react";

export const PAGE_SIZE_OPTIONS = [10, 15, 25, 50] as const;

export function usePagination<T>(items: T[], defaultPageSize = 15) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const itemsKey = useMemo(
    () => items.map((item) => (item as { id?: string }).id ?? JSON.stringify(item)).join("|"),
    [items],
  );

  useEffect(() => {
    setPage(1);
  }, [itemsKey, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, total);

  return {
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    total,
    paginatedItems,
    rangeStart,
    rangeEnd,
  };
}
