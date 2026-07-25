import React from "react";
import AddPage from "@/components/AddPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "react-router-dom";
import { useGet } from "@/hooks/useGet";
import { Loader2 } from "lucide-react";

const WishListAdd = () => {
    // 1. استخراج الـ id بشكل صحيح من params
    const { id } = useParams();

    // 2. جلب البيانات بـ ID فقط في حالة التعديل (عند وجود id)
    const { data: response, loading: isLoadingData } = useGet(
        id ? `/api/admin/wish_list/${id}` : null,
        Boolean(id) // ينفذ الـ fetch تلقائياً فقط إذا كان id موجوداً
    );

    // استخراج البيانات القادمة من الـ API
    const fetchedData = response?.data?.WishList || response;

    // 3. عرض مؤشر التحميل أثناء جلب البيانات في حالة التعديل
    if (id && isLoadingData) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <AddPage
            title="Wish List"
            apiUrl="/api/admin/wish_list"
            initialData={
                id && fetchedData
                    ? fetchedData
                    : {
                        name: "",
                        description: "",
                    }
            }
            onSuccessAction={() => window.history.back()}
        >
            {(methods) => {
                const {
                    register,
                    formState: { errors },
                } = methods;

                return (
                    <div className="mt-2 space-y-6">
                        <div className="space-y-5">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
                                Wish List Details
                            </h3>

                            <div className="grid grid-cols-1 gap-5">
                                {/* 1. Name Field */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Name *</Label>
                                    <Input
                                        {...register("name", { required: "Name is required" })}
                                        placeholder="e.g. Premium Products"
                                        className="h-10 text-sm rounded-md"
                                    />
                                    {errors.name && (
                                        <span className="text-xs text-red-500">
                                            {errors.name.message}
                                        </span>
                                    )}
                                </div>

                                {/* 2. Description Field */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Description</Label>
                                    <Textarea
                                        {...register("description")}
                                        placeholder="e.g. High-value product wishlist"
                                        className="text-sm rounded-md min-h-[100px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }}
        </AddPage>
    );
};

export default WishListAdd;