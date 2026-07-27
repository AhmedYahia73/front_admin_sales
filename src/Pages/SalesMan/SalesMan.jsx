import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { DeleteDialog } from "@/components/DeleteDialog";
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

const SalesMan = () => {
    const navigate = useNavigate();

    // ---- Filter & Pagination States ----
    const [selectedSalesFilter, setSelectedSalesFilter] = useState("");
    const [page, setPage] = useState(1);

    // ---- Get Sales Data (Dynamic based on filter & page) ----
    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    if (selectedSalesFilter) {
        queryParams.append("sales_id", selectedSalesFilter);
    }

    const salesApiUrl = `/api/admin/sales?${queryParams.toString()}`;

    const { data: response, loading: isLoading, refresh } = useGet(salesApiUrl);
    const sales = response?.data?.sales || [];
    
    // استخراج بيانات الـ Pagination من الـ Response
    const paginationData = response?.data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

    // إعادة تعيين الصفحة إلى 1 عند تغيير الفلتر
    const handleFilterChange = (e) => {
        setSelectedSalesFilter(e.target.value);
        setPage(1);
    };

    const [salesToDelete, setSalesToDelete] = useState(null);
    
    // ---- Get Lists for Filter ----
    const { data: listsResponse } = useGet("/api/admin/sales/lists");
    const salesList = listsResponse?.leaders || listsResponse?.data?.leaders || [];

    const { mutate: deleteSales, loading: isDeleting } = useMutation();

    // ---- Delete flow ----
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

    // ---- Table Columns definition ----
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
        <div className="container mx-auto py-10">
            {/* Sales Filter Section */}
            <div className="mb-4 flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label htmlFor="sales-filter" className="text-sm font-semibold text-gray-700">
                    Filter by Leader:
                </label>
                <select
                    id="sales-filter"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
                    value={selectedSalesFilter}
                    onChange={handleFilterChange}
                >
                    <option value="">All (Show All)</option>
                    {salesList.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>

            <DataTable
                title="Sales Management"
                onAdd={() => navigate("/sales-man/add")}
                showActions={true} 
                columns={columns}
                data={sales}
                isLoading={isLoading}
                onEdit={(row) => navigate(`/sales-man/${row.id}/edit`, { state: { rowData: row } })}
                onDelete={handleDeleteClick}
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
                isOpen={!!salesToDelete}
                onClose={() => setSalesToDelete(null)}
                onConfirm={handleDeleteConfirm}
                loading={isDeleting}
            />
        </div>
    );
};

export default SalesMan;