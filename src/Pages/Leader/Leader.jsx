import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { Button } from "@/components/ui/button";
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

const Leader = () => {
    const navigate = useNavigate();

    // ---- Filter & Pagination States ----
    const [selectedleaderFilter, setSelectedleaderFilter] = useState("");
    const [page, setPage] = useState(1);

    // ---- Get leader Data (Dynamic based on filter & page) ----
    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    if (selectedleaderFilter) {
        queryParams.append("target_id", selectedleaderFilter);
    }

    const leaderApiUrl = `/api/admin/leader?${queryParams.toString()}`;

    const { data: response, loading: isLoading, refresh } = useGet(leaderApiUrl);
    const leader = response?.data?.leaders || [];
    
    // استخراج بيانات الـ Pagination من الـ Response
    const paginationData = response?.data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

    // إعادة تعيين الصفحة إلى 1 عند تغيير الفلتر
    const handleFilterChange = (e) => {
        setSelectedleaderFilter(e.target.value);
        setPage(1);
    };

    // ---- Get Lists for Filter ----
    const { data: listsResponse } = useGet("/api/admin/leader/lists");
    const leaderList = listsResponse?.target_list || listsResponse?.data?.target_list || [];

    const [leaderToDelete, setLeaderToDelete] = useState(null);
    const { mutate: deleteLeader, loading: isDeleting } = useMutation();

    // ---- 2. دالة الحذف (Delete) ----
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

    // ---- Table Columns definition ----
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
            {/* leader Filter Section */}
            <div className="mb-4 flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label htmlFor="leader-filter" className="text-sm font-semibold text-gray-700">
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

            <DataTable
                title="leader Management"
                onAdd={() => navigate("/leader/add")}
                showActions={true}
                onEdit={(row) => navigate(`/leader/${row.id}/edit`)}
                onDelete={handleDeleteClick}
                columns={columns}
                data={leader}
                isLoading={isLoading}
            />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-600">
                    Showing page <span className="font-semibold">{paginationData.page}</span> of{" "}
                    <span className="font-semibold">{paginationData.totalPages}</span> (Total: {paginationData.total})
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((old) => Math.max(old - 1, 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((old) => Math.min(old + 1, paginationData.totalPages))}
                        disabled={page >= paginationData.totalPages}
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