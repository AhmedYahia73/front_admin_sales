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

const Admin = () => {
    const navigate = useNavigate();

    // ---- Pagination State ----
    const [page, setPage] = useState(1);

    // ---- Get admin Data (Dynamic based on page) ----
    const adminApiUrl = `/api/admin/admins?page=${page}`;

    const { data: response, loading: isLoading, refresh } = useGet(adminApiUrl);
    const admin = response?.data?.admins || [];
    
    // استخراج بيانات الـ Pagination من الـ Response
    const paginationData = response?.data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

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
                isOpen={!!adminToDelete}
                onClose={() => setAdminToDelete(null)}
                onConfirm={handleDeleteConfirm}
                loading={isDeleting}
            />
        </div>
    );
};

export default Admin;