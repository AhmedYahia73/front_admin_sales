import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { useGet } from "@/hooks/useGet";
import { Button } from "@/components/ui/button";

const HistoryRequests = () => {
    const navigate = useNavigate();

    // ---- Pagination State ----
    const [page, setPage] = useState(1);

    // ---- Get History Requests Data (Dynamic based on page) ----
    const historyApiUrl = `/api/admin/status_requests/history?page=${page}`;
    const { data: response, loading: isLoading } = useGet(historyApiUrl);

    // استخراج الداتا والـ pagination بناءً على الـ Response Schema
    const requests = response?.data?.historyRequests || [];
    const paginationData = response?.data?.pagination || { 
        totalItems: 0, 
        totalPages: 1, 
        currentPage: 1, 
        limit: 10 
    };

    const columns = [
        { accessorKey: "user_name", header: "Sales Name" },
        { accessorKey: "user_phone", header: "Sales Phone" },
        { accessorKey: "visit_name", header: "Visit" },
        { accessorKey: "from", header: "From Status" },
        { accessorKey: "to", header: "To Status" },
        { 
            accessorKey: "status", 
            header: "Status",
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    row.status === "approve"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                }`}>
                    {row.status || "-"}
                </span>
            ),
        },
    ];

    return (
        <div className="container mx-auto py-10">
            <DataTable
                title="History Requests Management"  
                columns={columns}
                data={requests}
                isLoading={isLoading}
            />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-600">
                    Showing page <span className="font-semibold">{paginationData.currentPage}</span> of{" "}
                    <span className="font-semibold">{paginationData.totalPages}</span> (Total: {paginationData.totalItems})
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((old) => Math.max(old - 1, 1))}
                        disabled={!paginationData.hasPrevPage || page === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((old) => Math.min(old + 1, paginationData.totalPages))}
                        disabled={!paginationData.hasNextPage || page >= paginationData.totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default HistoryRequests;