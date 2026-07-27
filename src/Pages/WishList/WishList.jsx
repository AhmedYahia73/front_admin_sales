import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const WishList = () => {
    const navigate = useNavigate();

    // ---- Pagination State ----
    const [page, setPage] = useState(1);

    // ---- Get WishList Data (Dynamic based on page) ----
    const wishListApiUrl = `/api/admin/wish_list?page=${page}`;
    const { data: response, loading: isLoading, refresh } = useGet(wishListApiUrl);

    // استخراج المصفوفة وبيانات التقسيم بناءً على الـ Response Schema
    const wish_list = response?.data?.allWishLists || response?.allWishLists || [];
    const paginationData = response?.data?.pagination || response?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

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
                isOpen={!!wishListToDelete}
                onClose={() => setWishListToDelete(null)}
                onConfirm={handleDeleteConfirm}
                loading={isDeleting}
            />
        </div>
    );
};

export default WishList;