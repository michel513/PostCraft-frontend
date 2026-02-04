import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "~/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import { FileQuestion } from "lucide-react";
import { useState } from "react";

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
    // Pagination props
    enablePagination?: boolean;
    pageSize?: number;
    currentPage?: number;
    totalItems?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
}

export function DataTable<T extends { id: string | number }>({
    columns,
    data,
    isLoading,
    emptyMessage = "No data available",
    onRowClick,
    enablePagination = false,
    pageSize = 10,
    currentPage = 1,
    totalItems,
    onPageChange,
    onPageSizeChange,
}: DataTableProps<T>) {
    const [localPageSize, setLocalPageSize] = useState(pageSize);
    const [localCurrentPage, setLocalCurrentPage] = useState(currentPage);

    // Use controlled or uncontrolled pagination
    const effectivePageSize = onPageSizeChange ? pageSize : localPageSize;
    const effectivePage = onPageChange ? currentPage : localCurrentPage;
    const effectiveTotalItems = totalItems || data.length;

    // Calculate pagination values
    const totalPages = Math.ceil(effectiveTotalItems / effectivePageSize);
    const startItem = (effectivePage - 1) * effectivePageSize + 1;
    const endItem = Math.min(effectivePage * effectivePageSize, effectiveTotalItems);

    // Paginate data locally if not controlled
    const displayData = enablePagination && !totalItems
        ? data.slice((effectivePage - 1) * effectivePageSize, effectivePage * effectivePageSize)
        : data;

    const handlePageChange = (page: number) => {
        if (onPageChange) {
            onPageChange(page);
        } else {
            setLocalCurrentPage(page);
        }
    };

    const handlePageSizeChange = (size: string) => {
        const newSize = parseInt(size);
        if (onPageSizeChange) {
            onPageSizeChange(newSize);
        } else {
            setLocalPageSize(newSize);
            setLocalCurrentPage(1); // Reset to first page
        }
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (effectivePage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('ellipsis');
                pages.push(totalPages);
            } else if (effectivePage >= totalPages - 2) {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('ellipsis');
                pages.push(effectivePage - 1);
                pages.push(effectivePage);
                pages.push(effectivePage + 1);
                pages.push('ellipsis');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (isLoading) {
        return <div className="flex h-48 items-center justify-center border rounded-md"><LoadingSpinner text="Loading data..." /></div>;
    }

    if (data.length === 0) {
        return (
            <div className="border rounded-md">
                <EmptyState
                    icon={FileQuestion}
                    title="No results found"
                    description={emptyMessage}
                    className="border-none"
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            {columns.map((col, index) => (
                                <TableHead key={index} className={col.className}>{col.header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayData.map((item) => (
                            <TableRow
                                key={item.id}
                                onClick={onRowClick ? () => onRowClick(item) : undefined}
                                className={onRowClick ? "cursor-pointer hover:bg-sky-50/50" : ""}
                            >
                                {columns.map((col, index) => (
                                    <TableCell key={index} className={col.className}>
                                        {col.cell
                                            ? col.cell(item)
                                            : (col.accessorKey ? String(item[col.accessorKey]) : null)
                                        }
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {enablePagination && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 w-full mb-2">
                        <span>Afficher</span>
                        <Select value={String(effectivePageSize)} onValueChange={handlePageSizeChange}>
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <span>
                            {startItem} à {endItem} sur {effectiveTotalItems} entrées
                        </span>
                    </div>

                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (effectivePage > 1) handlePageChange(effectivePage - 1);
                                    }}
                                    className={effectivePage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {getPageNumbers().map((page, idx) => (
                                <PaginationItem key={idx}>
                                    {page === 'ellipsis' ? (
                                        <PaginationEllipsis />
                                    ) : (
                                        <PaginationLink
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePageChange(page);
                                            }}
                                            isActive={page === effectivePage}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (effectivePage < totalPages) handlePageChange(effectivePage + 1);
                                    }}
                                    className={effectivePage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}