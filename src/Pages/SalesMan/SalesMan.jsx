import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { DeleteDialog } from "@/components/DeleteDialog";
// استخدام sonner بناءً على طلبك
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

    // ---- Filter State ----
    const [selectedSalesFilter, setSelectedSalesFilter] = useState("");

    // ---- Get Sales Data ----
    const salesApiUrl = selectedSalesFilter
        ? `/api/admin/sales?sales_id=${selectedSalesFilter}`
        : "/api/admin/sales";

    const { data: response, loading: isLoading, refresh } = useGet(salesApiUrl);
    const sales = response?.data?.sales || [];

    const [salesToDelete, setSalesToDelete] = useState(null);
    
    // ---- Get Lists for Filter ----
    const { data: listsResponse } = useGet("/api/admin/sales/lists");
    const salesList = listsResponse?.leaders || listsResponse?.data?.leaders || [];

    const { mutate: deleteSales, loading: isDeleting } = useMutation();

    // ---- 2. دالة الحذف (Delete) ----
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
            toast.success("Sales deleted successfully"); // sonner هتشتغل هنا تمام
            setSalesToDelete(null);
            refresh?.();
        } else {
            toast.error("Failed to delete sales"); // وهنا كمان
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
            {/* Sales Filter Section */}
            <div className="mb-4 flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label htmlFor="sales-filter" className="text-sm font-semibold text-gray-700">
                    Filter by Leader:
                </label>
                <select
                    id="sales-filter"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
                    value={selectedSalesFilter}
                    onChange={(e) => setSelectedSalesFilter(e.target.value)}
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