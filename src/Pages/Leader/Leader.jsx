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

const Leader = () => {
    const navigate = useNavigate();

    // ---- Filter, Search & Pagination States ----
    const [selectedleaderFilter, setSelectedleaderFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);

    // ---- Debounce Search Logic ----
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // العودة للصفحة الأولى عند البحث
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // ---- Build Query Parameters for Backend ----
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", "10");

    if (selectedleaderFilter) {
        queryParams.append("target_id", selectedleaderFilter);
    }

    if (debouncedSearch.trim()) {
        queryParams.append("search", debouncedSearch.trim());
    }

    const leaderApiUrl = `/api/admin/leader?${queryParams.toString()}`;

    // ---- Fetch Leader Data ----
    const { data: response, loading: isLoading, refresh } = useGet(leaderApiUrl);
    const leader = response?.data?.leaders || [];
    const paginationData = response?.data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

    // ---- Get Lists for Filter (استرجاع القائمة بنفس المفاتيح الأصلية) ----
    const { data: listsResponse } = useGet("/api/admin/leader/lists");
    const leaderList = listsResponse?.target_list || listsResponse?.data?.target_list || [];

    // إعادة تعيين الصفحة إلى 1 عند تغيير الفلتر
    const handleFilterChange = (e) => {
        setSelectedleaderFilter(e.target.value);
        setPage(1);
    };

    // ---- Delete Flow ----
    const [leaderToDelete, setLeaderToDelete] = useState(null);
    const { mutate: deleteLeader, loading: isDeleting } = useMutation();

    const handleDeleteClick = (row) => {
        setLeaderToDelete(row);
    };

    const handleDeleteConfirm = async () => {
        if (!leaderToDelete) return;

        const result = await deleteLeader({
            method: "DELETE",
            url: `/api/admin/leader/${leaderToDelete.id}`,
            showToast: false,
        });

        if (result.success) {
            toast.success("Leader deleted successfully");
            setLeaderToDelete(null);
            refresh?.();
        } else {
            toast.error("Failed to delete leader");
        }
    };

    // ---- Table Columns Definition ----
    const columns = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "email", header: "Email" },
        { accessorKey: "phone", header: "Phone" },
        {
            accessorKey: "target",
            header: "Target",
            render: (row) => row.target || "-"
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
        <div className="container mx-auto py-10">
            {/* Controls Section: Filter & Search Bar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                
                {/* 1. Target Filter (مأخوذ من كودك الأصلي بالضبط) */}
                <div className="flex items-center gap-3">
                    <label htmlFor="leader-filter" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                        Filter by Target:
                    </label>
                    <select
                        id="leader-filter"
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
                        value={selectedleaderFilter}
                        onChange={handleFilterChange}
                    >
                        <option value="">All (Show All)</option>
                        {leaderList.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 2. Search Input */}
                <div className="flex items-center gap-2 relative min-w-[280px]">
                    <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search leaders by name, email, or phone..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Section */}
            <DataTable
                title="leader Management"
                onAdd={() => navigate("/leader/add")}
                showActions={true}
                onEdit={(row) => navigate(`/leader/${row.id}/edit`)}
                onDelete={handleDeleteClick}
                columns={columns}
                data={leader}
                isLoading={isLoading}
                search_auto={false} // إيقاف الفلترة المحلية ليعتمد كلياً على الـ Backend
            />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-600">
                    Showing page <span className="font-semibold">{paginationData.page}</span> of{" "}
                    <span className="font-semibold">{paginationData.totalPages || 1}</span> (Total: {paginationData.total})
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((old) => Math.max(old - 1, 1))}
                        disabled={page === 1 || isLoading}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((old) => Math.min(old + 1, paginationData.totalPages))}
                        disabled={page >= paginationData.totalPages || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <DeleteDialog
                isOpen={!!leaderToDelete}
                onClose={() => setLeaderToDelete(null)}
                onConfirm={handleDeleteConfirm}
                loading={isDeleting}
            />
        </div>
    );
};

export default Leader;