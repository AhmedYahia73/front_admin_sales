import React from "react";
import AddPage from "@/components/AddPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";

const SalesManAdd = () => {
    return (
        <AddPage
            title="Add Sales"
            apiUrl="/api/admin/sales"
            initialData={{
                name: "",
                email: "",
                phone: "",
                password: "",
                image: "",
                status: "active",
            }}
            // 💡 تحويل البيانات إلى FormData لإرسال الملف الحقيقي للباك إند
            transformPayload={(data) => {
                const formData = new FormData();
                formData.append("name", data.name || "");
                formData.append("email", data.email || "");
                formData.append("phone", data.phone || "");
                formData.append("password", data.password || "");
                formData.append("status", data.status || "active");

                if (data.image?.[0]) {
                    formData.append("image", data.image[0]);
                }

                return formData;
            }}
            onSuccessAction={() => window.history.back()}
        >
            {(methods) => {
                const {
                    register,
                    control,
                    formState: { errors },
                } = methods;

                return (
                    <div className="mt-2 space-y-6">
                        <div className="space-y-5">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
                                Sales Account Details
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* 1. Name Field */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Name *</Label>
                                    <Input
                                        {...register("name", { required: "Name is required" })}
                                        placeholder="e.g. Mohamed Hassan"
                                        className="h-10 text-sm rounded-md"
                                    />
                                    {errors.name && (
                                        <span className="text-xs text-red-500">
                                            {errors.name.message}
                                        </span>
                                    )}
                                </div>

                                {/* 2. Email Field */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Email *</Label>
                                    <Input
                                        type="email"
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address",
                                            },
                                        })}
                                        placeholder="e.g. mohamed@example.com"
                                        className="h-10 text-sm rounded-md"
                                    />
                                    {errors.email && (
                                        <span className="text-xs text-red-500">
                                            {errors.email.message}
                                        </span>
                                    )}
                                </div>

                                {/* 3. Phone Field */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Phone *</Label>
                                    <Input
                                        type="tel"
                                        {...register("phone", { required: "Phone number is required" })}
                                        placeholder="e.g. 01098765432"
                                        className="h-10 text-sm rounded-md"
                                    />
                                    {errors.phone && (
                                        <span className="text-xs text-red-500">
                                            {errors.phone.message}
                                        </span>
                                    )}
                                </div>

                                {/* 4. Password Field */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Password *</Label>
                                    <Input
                                        type="password"
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: {
                                                value: 6,
                                                message: "Password must be at least 6 characters",
                                            },
                                        })}
                                        placeholder="Enter secret password (min. 6 characters)"
                                        className="h-10 text-sm rounded-md"
                                    />
                                    {errors.password && (
                                        <span className="text-xs text-red-500">
                                            {errors.password.message}
                                        </span>
                                    )}
                                </div>

                                {/* 5. Status Field */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Status</Label>
                                    <Controller
                                        name="status"
                                        control={control}
                                        defaultValue="active"
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || "active"}
                                            >
                                                <SelectTrigger className="h-10 text-sm rounded-md">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                {/* 6. Image Field */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Image</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        {...register("image")}
                                        className="h-10 text-sm rounded-md cursor-pointer"
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

export default SalesManAdd;