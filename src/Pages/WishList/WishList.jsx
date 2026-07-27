import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const WishList = () => {
    const navigate = useNavigate();

    // ---- Search & Pagination States ----
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);

    // ---- Debounce Search Logic ----
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // إعادة التعيين للصفحة الأولى عند كل بحث جديد
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

    const wishListApiUrl = `/api/admin/wish_list?${queryParams.toString()}`;

    // ---- Fetch Data ----
    const { data: response, loading: isLoading, refresh } = useGet(wishListApiUrl);

    // استخراج البيانات والـ Pagination حسب الـ Schema (تعتمد على response مباشرة أو response.data)
    const wish_list = response?.data?.allWishLists || response?.allWishLists || [];
    const paginationData = response?.data?.pagination || response?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

    const [wishListToDelete, setWishListToDelete] = useState(null);
    const { mutate: deleteWishList, loading: isDeleting } = useMutation();

    // ---- Table Columns Definition ----
    const columns = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "description", header: "Description" },
    ];

    // ---- Actions ----
    const handleEdit = (row) => {
        navigate(`/wishlist/${row.id}/edit/`, { state: row });
    };

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
            {/* Controls Section: Search Bar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 relative min-w-[280px]">
                    <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search wish list by name or description..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <DataTable
                title="Wish List Management"
                onAdd={() => navigate("/wishlist/add")}
                columns={columns}
                data={wish_list}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                search_auto={false} // إيقاف الفلترة المحلية ليعتمد كلياً على الـ Backend
            />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-600">
                    Showing page <span className="font-semibold">{paginationData.page}</span> of{" "}
                    <span className="font-semibold">{paginationData.totalPages || 1}</span> (Total: {paginationData.total})
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((old) => Math.max(old - 1, 1))}
                        disabled={page === 1 || isLoading}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((old) => Math.min(old + 1, paginationData.totalPages))}
                        disabled={page >= paginationData.totalPages || isLoading}
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