import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";
 

const statusColors = {
    "Negotiation": "bg-yellow-100 text-yellow-800",
    "Sales": "bg-gray-100 text-gray-800",
    "Deliverd": "bg-green-100 text-green-800",
}; 

const HistoryRequests = () => {
    const navigate = useNavigate();
 
  
    const { data: response, loading: isLoading, refresh } = useGet("/api/admin/status_requests/history");
    const requests = response?.data?.historyRequests || [];
 
 
     

    const columns = [
        { accessorKey: "user_name", header: "Sales Name" },
        { accessorKey: "user_phone", header: "Sales Phone" },
        { accessorKey: "visit_name", header: "Visit" },
        { accessorKey: "from", header: "From Status" },
        { accessorKey: "to", header: "To Status" },
        { accessorKey: "visit_name", header: "Visit" },
        { accessorKey: "status", header: "Status" },
    ];

    return (
        <div className="container mx-auto py-10">
            {/* Sales Filter Section */}
       

            <DataTable
                title="History Requests Management"  
                columns={columns}
                data={requests}
                isLoading={isLoading}
            />
  
        </div>
    );
};

export default HistoryRequests;