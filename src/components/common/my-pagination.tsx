"use client";

import { DataTablePagination } from "../ui/data-table-pagination";

interface MyPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export function MyPagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  onItemsPerPageChange,
}: MyPaginationProps) {
  return (
    <DataTablePagination
      page={currentPage - 1}
      lastPage={totalPages - 1}
      updatePage={(page) => onPageChange(page + 1)}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={
        onItemsPerPageChange ? (size) => onItemsPerPageChange(size) : undefined
      }
    />
  );
}
