import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
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

    // ---- Filter State ----
    const [selectedleaderFilter, setSelectedleaderFilter] = useState("");

    // ---- Get leader Data ----
    // ⚠️ غيري اسم الـ key (مثلاً leader_id أو leader_id أو id) حسب ما يطلبه الباك إند ف الـ Query
    const leaderApiUrl = selectedleaderFilter
        ? `/api/admin/leader?target_id=${selectedleaderFilter}`
        : "/api/admin/leader";

    const { data: response, loading: isLoading, refresh } = useGet(leaderApiUrl);
    const leader = response?.data?.leaders || [];

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
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${row.status === "active"
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
                    Filter by Leader:
                </label>
                <select
                    id="leader-filter"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
                    value={selectedleaderFilter}
                    onChange={(e) => setSelectedleaderFilter(e.target.value)}
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