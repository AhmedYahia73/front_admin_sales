import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { MapPin, StickyNote, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const Visits = () => {
    const navigate = useNavigate();

    // ---- Filter, Search & Pagination States ----
    const [page, setPage] = useState(1);
    const [selectedSalesFilter, setSelectedSalesFilter] = useState("");
    const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    
    // ---- Month & Year Filter States ----
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonths, setSelectedMonths] = useState([]);

    const months = [
        { value: "01", label: "Jan" },
        { value: "02", label: "Feb" },
        { value: "03", label: "Mar" },
        { value: "04", label: "Apr" },
        { value: "05", label: "May" },
        { value: "06", label: "Jun" },
        { value: "07", label: "Jul" },
        { value: "08", label: "Aug" },
        { value: "09", label: "Sep" },
        { value: "10", label: "Oct" },
        { value: "11", label: "Nov" },
        { value: "12", label: "Dec" },
    ];

    const [selectedNotes, setSelectedNotes] = useState(null);

    // ---- Product Selection States ----
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [pendingSalesStatusVisit, setPendingSalesStatusVisit] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState("");

    // ---- Get Products Data ----
    const { data: productsRes } = useGet("/api/admin/products");
    const productsList = Array.isArray(productsRes?.data?.allProducts) ? productsRes.data.allProducts : 
                         Array.isArray(productsRes?.allProducts) ? productsRes.allProducts : 
                         Array.isArray(productsRes?.data?.products) ? productsRes.data.products : [];

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

    if (selectedSalesFilter) {
        queryParams.append("sales_id", selectedSalesFilter);
    }
    if (selectedStatusFilter) {
        queryParams.append("status_id", selectedStatusFilter);
    }

    if (debouncedSearch.trim()) {
        queryParams.append("search", debouncedSearch.trim());
    }

    if (selectedMonths.length > 0 && selectedYear) {
        queryParams.append("months", selectedMonths.join(','));
        queryParams.append("year", selectedYear);
    }

    const visitsApiUrl = `/api/admin/visits?${queryParams.toString()}`;

    // ---- Get Visits Data ----
    const { data: response, loading: isLoading, refresh } = useGet(visitsApiUrl);
    const visits = response?.data?.allVisits || [];
    
    // استخراج بيانات الـ Pagination من الـ Response
    const paginationData = response?.data?.pagination || response?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

    // إعادة تعيين الصفحة إلى 1 عند تغيير الفلتر
    const handleFilterChange = (e) => {
        setSelectedSalesFilter(e.target.value);
        setPage(1); 
    };

    const handleStatusFilterChange = (e) => {
        setSelectedStatusFilter(e.target.value);
        setPage(1); 
    };

    // ---- Get Status & Sales Lists ----
    const { data: listsResponse } = useGet("/api/admin/visits/lists");
    const statusList = listsResponse?.visit_status || listsResponse?.data?.visit_status || [];
    const sales_statues = ["visit", "sales", "delivered"];
    const salesList = listsResponse?.sales || listsResponse?.data?.sales || [];

    // ---- Mutations ----
    const { mutate: deleteVisit, loading: isDeleting } = useMutation();
    const { mutate: updateVisit } = useMutation();

    const [visitToDelete, setVisitToDelete] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState("");

    const handleDeleteClick = (visit) => {
        setVisitToDelete(visit);
    };

    const handleDeleteConfirm = async () => {
        if (!visitToDelete) return;

        const result = await deleteVisit({
            method: "DELETE",
            url: `/api/admin/visits/${visitToDelete.id}`,
        });

        if (result.success) {
            toast?.success?.("Visit deleted successfully");
            setVisitToDelete(null);
            refresh?.();
        } else {
            toast?.error?.("Failed to delete visit");
        }
    };

    const handleStatusChange = async (visit, newStatusId) => {
        const payload = { status_id: newStatusId };
        const result = await updateVisit({
            method: "PUT",
            url: `/api/admin/visits/${visit.id}`,
            data: payload,
        });

        if (result.success) {
            toast?.success?.("Status updated successfully");
            refresh?.();
        } else {
            toast?.error?.("Failed to update status");
        }
    };

    const handleSalesStatusChange = async (visit, newStatus) => {
        if (newStatus === "sales" || newStatus === "delivered") {
            setPendingSalesStatusVisit(visit);
            setSelectedProductId(visit.product_id || "");
            setProductModalOpen(true);
            return;
        }

        const payload = { status: newStatus };
        const result = await updateVisit({
            method: "PUT",
            url: `/api/admin/visits/${visit.id}`,
            data: payload,
        });

        if (result.success) {
            toast?.success?.("Status updated successfully");
            refresh?.();
        } else {
            toast?.error?.("Failed to update status");
        }
    };

    const confirmProductEnrollment = async () => {
        if (!pendingSalesStatusVisit || !selectedProductId || !selectedDuration) {
            toast?.error?.("Please select a product and duration");
            return;
        }
        const result = await updateVisit({
            method: "PUT",
            url: `/api/admin/visits/${pendingSalesStatusVisit.id}`,
            data: { status: "sales", product_id: selectedProductId, duration: selectedDuration },
        });
        
        if (result.success) {
            toast.success("Status updated and product enrolled successfully");
            setProductModalOpen(false);
            setPendingSalesStatusVisit(null);
            refresh?.();
        } else {
            toast.error("Failed to update status and enroll product");
        }
    };

    const handleSalesChange = async (visit, newSalesId) => {
        const payload = { sales_id: newSalesId };
        const result = await updateVisit({
            method: "PUT",
            url: `/api/admin/visits/${visit.id}`,
            data: payload,
        });

        if (result.success) {
            toast?.success?.("Sales updated successfully");
            refresh?.();
        } else {
            toast?.error?.("Failed to update sales");
        }
    };

    const columns = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "address", header: "Address" },
        { accessorKey: "phone", header: "Phone" },
        { accessorKey: "createdAt", header: "Date" },
        {
            accessorKey: "product",
            header: "Product",
            render: (row) => row.product?.name || row.product_name || "-",
        },
        {
            accessorKey: "visit_status",
            header: "Status",
            render: (row) => {
                const currentStatus = statusList.find((s) => s.name === row.visit_status);
                const currentStatusId = currentStatus ? currentStatus.id : row.status_id || "";

                return (
                    <select
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 transition-colors ${
                            statusColors[row.visit_status] || "bg-gray-100 text-gray-800"
                        }`}
                        value={currentStatusId}
                        onChange={(e) => {
                            if (e.target.value) handleStatusChange(row, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="" disabled>Select Status</option>
                        {statusList.map((s) => (
                            <option key={s.id} value={s.id} className="bg-white text-black">
                                {s.name}
                            </option>
                        ))}
                    </select>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Sales Status",
            render: (row) => {
                const currentStatus = sales_statues.find((s) => s === row.status);
                const currentStatusId = currentStatus || row.status || "";

                return (
                    <select
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 transition-colors ${
                            statusColors[row.status] || "bg-gray-100 text-gray-800"
                        }`}
                        value={currentStatusId}
                        onChange={(e) => {
                            if (e.target.value) handleSalesStatusChange(row, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="" disabled>Select Status</option>
                        {sales_statues.map((s) => (
                            <option key={s} value={s} className="bg-white text-black">
                                {s}
                            </option>
                        ))}
                    </select>
                );
            },
        },
        {
            accessorKey: "sales",
            header: "Sales",
            render: (row) => {
                const currentSales = salesList.find((s) => s.name === row.sales);
                const currentSalesId = currentSales ? currentSales.id : row.sales_id || "";

                return (
                    <select
                        className="px-2 py-1 rounded-full text-xs font-medium border border-gray-200 bg-white cursor-pointer focus:ring-2 focus:ring-offset-1 transition-colors text-gray-800"
                        value={currentSalesId}
                        onChange={(e) => {
                            if (e.target.value) handleSalesChange(row, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="" disabled>Select Sales</option>
                        {salesList.map((s) => (
                            <option key={s.id} value={s.id} className="bg-white text-black">
                                {s.name}
                            </option>
                        ))}
                    </select>
                );
            },
        },
        {
            accessorKey: "notes",
            header: "Notes",
            render: (row) => {
                if (!row.notes) return <span className="text-gray-400">-</span>;

                return (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNotes({
                                name: row.name,
                                notes: row.notes,
                            });
                        }}
                    >
                        <StickyNote className="h-3.5 w-3.5 text-blue-500" />
                        View Notes
                    </Button>
                );
            },
        },
        {
            accessorKey: "map_link",
            header: "Map",
            render: (row) => (
                <a
                    href={row.map_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:underline flex items-center gap-1"
                >
                    <MapPin className="h-4 w-4" /> View
                </a>
            ),
        },
    ];

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col xl:flex-row gap-6 mb-6">
                {/* Left Side: Filters */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Year & Month Filter */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <label htmlFor="year-filter" className="text-sm font-semibold text-gray-700">
                                Filter by Year:
                            </label>
                            <select
                                id="year-filter"
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[120px]"
                                value={selectedYear}
                                onChange={(e) => {
                                    setSelectedYear(e.target.value);
                                    setPage(1);
                                }}
                            >
                                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            <button
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${selectedMonths.length === 0 ? "bg-red-500 text-white font-medium shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"}`}
                                onClick={() => { setSelectedMonths([]); setPage(1); }}
                            >
                                All Months
                            </button>
                            {months.map(m => {
                                const isSelected = selectedMonths.includes(m.value);
                                return (
                                    <button
                                        key={m.value}
                                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${isSelected ? "bg-red-500 text-white font-medium shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"}`}
                                        onClick={() => { 
                                            if (isSelected) {
                                                setSelectedMonths(selectedMonths.filter(x => x !== m.value));
                                            } else {
                                                setSelectedMonths([...selectedMonths, m.value]);
                                            }
                                            setPage(1);
                                        }}
                                    >
                                        {m.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Controls Section: Filter & Search */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        {/* Sales Filter */}
                        <div className="flex items-center gap-3">
                            <label htmlFor="sales-filter" className="text-sm font-semibold text-gray-700">
                                Filter by Sales:
                            </label>
                            <select
                                id="sales-filter"
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
                                value={selectedSalesFilter}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Sales (Show All)</option>
                                {salesList.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-3">
                            <label htmlFor="status-filter" className="text-sm font-semibold text-gray-700">
                                Filter by Status:
                            </label>
                            <select
                                id="status-filter"
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
                                value={selectedStatusFilter}
                                onChange={handleStatusFilterChange}
                            >
                                <option value="">All Statuses (Show All)</option>
                                {statusList.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search Input (Backend Search) */}
                        <div className="flex items-center gap-2 relative min-w-[250px]">
                            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search visits by name, phone or address..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Side: Total Visits Overview */}
                <div className="shrink-0 flex items-stretch">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-white border border-red-400/50 transition-transform hover:scale-[1.02] min-h-full" style={{ width: 'calc(var(--spacing) * 55)' }}>
                        <div className="bg-white/20 p-4 rounded-full mb-4 shadow-inner">
                            <MapPin className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-5xl font-extrabold leading-none mb-2">{paginationData.total}</p>
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-red-100 text-center">Total Visits</h2>
                    </div>
                </div>
            </div>

            <DataTable
                title="Visits Management"
                onAdd={() => navigate("/visits/add")}
                onDelete={handleDeleteClick}
                onEdit={(row) => navigate(`/visits/${row.id}/edit`)}
                columns={columns}
                data={visits}
                isLoading={isLoading}
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

            {/* Product Enrollment Dialog */}
            <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Enroll Product for Sales</DialogTitle>
                        <DialogDescription>
                            Please select a product to enroll this visit as a sale.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <select 
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                        >
                            <option value="">Select a Product</option>
                            {productsList.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        {selectedProductId && (
                            <select 
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
                                value={selectedDuration}
                                onChange={(e) => setSelectedDuration(e.target.value)}
                            >
                                <option value="">Select Duration</option>
                                { (() => {
                                    const product = productsList.find(p => p.id === selectedProductId);
                                    let pointsData = product?.points || [];
                                    if (typeof pointsData === 'string') {
                                        try { pointsData = JSON.parse(pointsData); } catch(e) { pointsData = []; }
                                    }
                                    return pointsData.map(p => (
                                        <option key={p.duration} value={p.duration}>{p.duration}</option>
                                    ));
                                })() }
                            </select>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setProductModalOpen(false)}>Cancel</Button>
                        <Button onClick={confirmProductEnrollment}>Confirm</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <DeleteDialog
                isOpen={!!visitToDelete}
                onClose={() => setVisitToDelete(null)}
                onConfirm={handleDeleteConfirm}
                loading={isDeleting}
            />

            {/* PopUp / Modal لعرض الـ Notes */}
            <Dialog open={!!selectedNotes} onOpenChange={() => setSelectedNotes(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <StickyNote className="h-5 w-5 text-primary" />
                            Visit Notes - {selectedNotes?.name}
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                            {selectedNotes?.notes}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Visits;