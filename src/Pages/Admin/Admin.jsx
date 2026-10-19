import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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

    // ---- Search & Pagination States ----
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);

    // ---- Debounce Search Logic ----
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // العودة للصفحة الأولى عند كل بحث جديد
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // ---- Build Query Parameters for Backend ----
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", "10");

    if (debouncedSearch.trim()) {
        queryParams.append("search", debouncedSearch.trim());
    }

    const adminApiUrl = `/api/admin/admins?${queryParams.toString()}`;

    // ---- Get Admin Data ----
    const { data: response, loading: isLoading, refresh } = useGet(adminApiUrl);
    const admin = response?.data?.admins || [];
    
    // استخراج بيانات الـ Pagination من الـ Response
    const paginationData = response?.data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

    const [adminToDelete, setAdminToDelete] = useState(null);
    const { mutate: deleteAdmin, loading: isDeleting } = useMutation();

    // ---- Delete Flow ----
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

    // ---- Table Columns Definition ----
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
        <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6">
            {/* Controls Section: Search Bar */}
            <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3.5 sm:p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xs">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search admins by name, email, or phone..."
                        className="pl-9 h-10 w-full text-xs sm:text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <DataTable
                title="Admin Management"
                onAdd={() => navigate("/admin/add")}
                showActions={true}
                onEdit={(row) => navigate(`/admin/${row.id}/edit`)}
                onDelete={handleDeleteClick}
                columns={columns}
                data={admin}
                isLoading={isLoading}
                search_auto={false} // إيقاف الفلترة المحلية ليعتمد كلياً على الـ Backend
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
                isOpen={!!adminToDelete}
                onClose={() => setAdminToDelete(null)}
                onConfirm={handleDeleteConfirm}
                loading={isDeleting}
            />
        </div>
    );
};

export default Admin;