import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; 

const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const SalesMan = () => {
    const navigate = useNavigate();

    // ---- Filter, Search & Pagination States ----
    const [selectedLeaderFilter, setSelectedLeaderFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);

    // ---- Debounce Search Logic ----
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // إعادة التعيين للصفحة الأولى عند كل بحث جديد
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // ---- Build Query Parameters for Backend ----
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", "10");

    if (selectedLeaderFilter) {
        queryParams.append("leader_id", selectedLeaderFilter);
    }

    if (debouncedSearch.trim()) {
        queryParams.append("search", debouncedSearch.trim());
    }

    const salesApiUrl = `/api/admin/sales?${queryParams.toString()}`;

    // ---- Get Sales Data ----
    const { data: response, loading: isLoading, refresh } = useGet(salesApiUrl);
    const sales = response?.data?.sales || [];
    const paginationData = response?.data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

    // ---- Get Leaders List for Filter ----
    const { data: listsResponse } = useGet("/api/admin/sales/lists");
    const leadersList = listsResponse?.leaders || listsResponse?.data?.leaders || [];

    // ---- Delete Flow ----
    const [salesToDelete, setSalesToDelete] = useState(null);
    const { mutate: deleteSales, loading: isDeleting } = useMutation();

    const handleFilterChange = (e) => {
        setSelectedLeaderFilter(e.target.value);
        setPage(1);
    };

    const handleDeleteClick = (row) => {
        setSalesToDelete(row);
    };

    const handleDeleteConfirm = async () => {
        if (!salesToDelete) return;

        const result = await deleteSales({
            method: "DELETE",
            url: `/api/admin/sales/${salesToDelete.id}`,
            showToast: false,
        });

        if (result.success) {
            toast.success("Sales deleted successfully");
            setSalesToDelete(null);
            refresh?.();
        } else {
            toast.error("Failed to delete sales");
        }
    };

    // ---- Table Columns Definition ----
    const columns = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "email", header: "Email" },
        { accessorKey: "phone", header: "Phone" },
        {
            accessorKey: "leader_name",
            header: "Leader",
            render: (row) => row.leader_name || "-"
        },
        {
            accessorKey: "target_name",
            header: "Target",
            render: (row) => row.target_name || "-"
        },
        {
            accessorKey: "status",
            header: "Status",
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    row.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                }`}>
                    {row.status || "-"}
                </span>
            ),
        },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6">
            {/* Controls Section: Filter & Search */}
            <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3.5 sm:p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xs">
                
                {/* Leader Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <label htmlFor="leader-filter" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300">
                        Filter by Leader:
                    </label>
                    <select
                        id="leader-filter"
                        className="border border-gray-300 dark:border-zinc-700 rounded-md px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 w-full sm:w-auto sm:min-w-[200px]"
                        value={selectedLeaderFilter}
                        onChange={handleFilterChange}
                    >
                        <option value="">All (Show All)</option>
                        {leadersList.map((leader) => (
                            <option key={leader.id} value={leader.id}>
                                {leader.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Search Input (Backend Search) */}
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search sales by name, email, or phone..."
                        className="pl-9 h-10 w-full text-xs sm:text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <DataTable
                title="Sales Management"
                onAdd={() => navigate("/sales-man/add")}
                showActions={true} 
                columns={columns}
                data={sales}
                isLoading={isLoading}
                search_auto={false} // إيقاف الفلترة المحلية ليعتمد كلياً على الـ Backend
                onEdit={(row) => navigate(`/sales-man/${row.id}/edit`, { state: { rowData: row } })}
                onDelete={handleDeleteClick}
            />
            
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xs">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 text-center sm:text-left">
                    Showing page <span className="font-semibold text-zinc-900 dark:text-zinc-100">{paginationData.page}</span> of{" "}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{paginationData.totalPages || 1}</span> (Total: {paginationData.total})
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((old) => Math.max(old - 1, 1))}
                        disabled={page === 1 || isLoading}
                        className="flex-1 sm:flex-initial"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((old) => Math.min(old + 1, paginationData.totalPages))}
                        disabled={page >= paginationData.totalPages || isLoading}
                        className="flex-1 sm:flex-initial"
                    >
                        Next
                    </Button>
                </div>
            </div>

            <DeleteDialog
                isOpen={!!salesToDelete}
                onClose={() => setSalesToDelete(null)}
                onConfirm={handleDeleteConfirm}
                loading={isDeleting}
            />
        </div>
    );
};

export default SalesMan;