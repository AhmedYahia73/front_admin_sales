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

const Admin = () => {
    const navigate = useNavigate();

    // ---- Filter State ----
    const [selectedadminFilter, setSelectedadminFilter] = useState("");

    // ---- Get admin Data ----
    // ⚠️ غيري اسم الـ key (مثلاً admin_id أو admin_id أو id) حسب ما يطلبه الباك إند ف الـ Query
    const adminApiUrl = selectedadminFilter
        ? `/api/admin/admins?target_id=${selectedadminFilter}`
        : "/api/admin/admins";

    const { data: response, loading: isLoading, refresh } = useGet(adminApiUrl);
    const admin = response?.data?.admins || [];

    const [adminToDelete, setAdminToDelete] = useState(null);
    const { mutate: deleteAdmin, loading: isDeleting } = useMutation();

    // ---- 2. دالة الحذف (Delete) ----
    const handleDeleteClick = (row) => {
        setAdminToDelete(row);
    };

    const handleDeleteConfirm = async () => {
        if (!adminToDelete) return;

        const result = await deleteAdmin({
            method: "DELETE",
            url: `/api/admin/admins/${adminToDelete.id}`,
            showToast: false,
        });

        if (result.success) {
            toast.success("Admin deleted successfully");
            setAdminToDelete(null);
            refresh?.();
        } else {
            toast.error("Failed to delete admin");
        }
    };

    // ---- Table Columns definition ----
    const columns = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "email", header: "Email" },
        { accessorKey: "phone", header: "Phone" },
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
            {/* admin Filter Section */}
            {/* <div className="mb-4 flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label htmlFor="admin-filter" className="text-sm font-semibold text-gray-700">
                    Filter by Admin:
                </label>
                <select
                    id="admin-filter"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
                    value={selectedadminFilter}
                    onChange={(e) => setSelectedadminFilter(e.target.value)}
                >
                    <option value="">All (Show All)</option>
                    {adminList.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div> */}

            <DataTable
                title="admin Management"
                onAdd={() => navigate("/admin/add")}
                showActions={true}
                onEdit={(row) => navigate(`/admin/${row.id}/edit`)}
                onDelete={handleDeleteClick}
                columns={columns}
                data={admin}
                isLoading={isLoading}
            />

            <DeleteDialog
                isOpen={!!adminToDelete}
                onClose={() => setAdminToDelete(null)}
                onConfirm={handleDeleteConfirm}
                loading={isDeleting}
            />
        </div>
    );
};

export default Admin;