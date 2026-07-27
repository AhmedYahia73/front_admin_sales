import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { MapPin, StickyNote } from "lucide-react";
import { toast } from "sonner";

// استيراد مكونات الـ Dialog والمكونات الإضافية للزرار
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const statusColors = {
    "Negotiation": "bg-yellow-100 text-yellow-800",
    "Sales": "bg-gray-100 text-gray-800",
    "Deliverd": "bg-green-100 text-green-800",
}; 

const Requests = () => {
    const navigate = useNavigate();
 
  
    const { data: response, loading: isLoading, refresh } = useGet("/api/admin/status_requests/pending");
    const requests = response?.data?.pendingRequests || [];
 
 
    const { mutate: updateRequest } = useMutation();
   

    // ---- Update Status flow ----
    const handleStatusChange = async (requests, status) => {
        const payload = { status: status };
        const result = await updateRequest({
            method: "PUT",
            url: `/api/admin/status_requests/status/${requests.id}`,
            data: payload,
        });

        if (result.success) {
            toast?.success?.("Status updated successfully");
            refresh?.();
        } else {
            toast?.error?.("Failed to update status");
        }
    };  

    const columns = [
        { accessorKey: "user_name", header: "Sales Name" },
        { accessorKey: "user_phone", header: "Sales Phone" },
        { accessorKey: "visit_name", header: "Visit" },
        { accessorKey: "from", header: "From Status" },
        { accessorKey: "to", header: "To Status" },
        { accessorKey: "visit_name", header: "Visit" },
        { 
            accessorKey: "visit_status",
            header: "Status",
            render: (row) => {

                return (
                    <select
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 transition-colors ${
                            statusColors[row.visit_status] || "bg-gray-100 text-gray-800"
                        }`}
                        value="pending"
                        onChange={(e) => {
                            if (e.target.value) handleStatusChange(row, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="" >Select Status</option> 
                        <option key="approve" value="approve" className="bg-white text-black">
                            Approve
                        </option>
                        <option key="reject" value="reject" className="bg-white text-black">
                            Reject
                        </option>
                    </select>
                );
            },
        }, 
    ];

    return (
        <div className="container mx-auto py-10">
            {/* Sales Filter Section */}
       

            <DataTable
                title="Requests Management"  
                columns={columns}
                data={requests}
                isLoading={isLoading}
            />
  
        </div>
    );
};

export default Requests;