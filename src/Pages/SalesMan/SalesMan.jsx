import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { useGet } from "@/hooks/useGet";

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
    // ⚠️ غيري اسم الـ key (مثلاً sales_id أو leader_id أو id) حسب ما يطلبه الباك إند ف الـ Query
    const salesApiUrl = selectedSalesFilter
        ? `/api/admin/sales?sales_id=${selectedSalesFilter}`
        : "/api/admin/sales";

    const { data: response, loading: isLoading, refresh } = useGet(salesApiUrl);
    const sales = response?.data?.sales || [];

    // ---- Get Lists for Filter ----
    const { data: listsResponse } = useGet("/api/admin/sales/lists");
    const salesList = listsResponse?.leaders || listsResponse?.data?.leaders || [];

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
                showActions={false}
                columns={columns}
                data={sales}
                isLoading={isLoading}
            />
        </div>
    );
};

export default SalesMan;