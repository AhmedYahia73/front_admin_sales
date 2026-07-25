import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";

const WishList = () => {
    const navigate = useNavigate();

    // ---- Get WishList Data ----
    const { data: response, loading: isLoading, refresh } = useGet("/api/admin/wish_list");

    // استخراج المصفوفة بناءً على الـ Response Schema
    const wish_list = response?.data?.allWishLists || response?.allWishLists || [];

    const [wishListToDelete, setWishListToDelete] = useState(null);
    const { mutate: deleteWishList, loading: isDeleting } = useMutation();

    // ---- Table Columns definition ----
    const columns = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "description", header: "Description" },
    ];

    // ---- 1. دالة التعديل (Edit) ----
    const handleEdit = (row) => {
        // التوجيه لصفحة التعديل مع تمرير بيانات الصف الحالي
        navigate(`/wishlist/${row.id}/edit/`, { state: row });
    };

    // ---- 2. دالة الحذف (Delete) ----
    const handleDeleteClick = (row) => {
        setWishListToDelete(row);
    };

    const handleDeleteConfirm = async () => {
        if (!wishListToDelete) return;

        const result = await deleteWishList({
            method: "DELETE",
            url: `/api/admin/wish_list/${wishListToDelete.id}`,
            showToast: false,
        });

        if (result.success) {
            toast.success("Wish list deleted successfully");
            setWishListToDelete(null);
            refresh?.();
        } else {
            toast.error("Failed to delete wish list");
        }
    };

    return (
        <div className="container mx-auto py-10">
            <DataTable
                title="Wish List Management"
                onAdd={() => navigate("/wishlist/add")}
                columns={columns}
                data={wish_list}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />

            <DeleteDialog
                isOpen={!!wishListToDelete}
                onClose={() => setWishListToDelete(null)}
                onConfirm={handleDeleteConfirm}
                loading={isDeleting}
            />
        </div>
    );
};

export default WishList;