import React from "react";
import { useParams } from "react-router-dom";
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
import { useGet } from "@/hooks/useGet";
import { Loader2 } from "lucide-react";

const AdminAdd = () => {
    const { id } = useParams();

    const { data: response, loading: isLoadingData } = useGet(
        id ? `/api/admin/admins/${id}` : null,
        Boolean(id)
    );

    const fetchedAdmin =
        response?.data?.admin?.[0] ||
        response?.admins?.[0] ||
        response?.data?.admin ||
        response;

    if (id && isLoadingData) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <AddPage
            title="Admin"
            apiUrl="/api/admin/admins"
            initialData={
                id && fetchedAdmin
                    ? fetchedAdmin
                    : {
                        name: "",
                        email: "",
                        phone: "",
                        password: "",
                        status: "active",
                    }
            }
            // 💡 التعديل هنا: إرجاع Object عادي عشان يتبعت كـ JSON Body
            transformPayload={(data) => {
                const payload = {
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    status: data.status || "active",
                };

                // إرسال كلمة المرور فقط في حالة كتابتها
                if (data.password) {
                    payload.password = data.password;
                }

                // إرسال الصورة كـ Base64 (النص) في الـ Body
                if (data.image) {
                    payload.image = data.image;
                }

                return payload;
            }}
            onSuccessAction={() => window.history.back()}
        >
            {(methods) => {
                const {
                    register,
                    control,
                    formState: { errors },
                    toBase64, // الدالة الممررة من AddPage
                } = methods;

                return (
                    <div className="mt-2 space-y-6">
                        <div className="space-y-5">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
                                Admin Details
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
                                    {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
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
                                    {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
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
                                    {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
                                </div>

                                {/* 4. Password Field */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Password {id ? "(Leave empty to keep current)" : "*"}
                                    </Label>
                                    <Input
                                        type="password"
                                        {...register("password", {
                                            required: id ? false : "Password is required",
                                            minLength: {
                                                value: 6,
                                                message: "Password must be at least 6 characters",
                                            },
                                        })}
                                        placeholder={id ? "Enter new password" : "Enter secret password"}
                                        className="h-10 text-sm rounded-md"
                                    />
                                    {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
                                </div>

                                {/* 6. Status Field */}
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

                                {/* 7. Image Field (Base64) */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Image</Label>
                                    <Controller
                                        name="image"
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <div className="space-y-3">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            // تحويل الصورة لـ base64
                                                            const base64 = await toBase64(file);
                                                            onChange(base64);
                                                        }
                                                    }}
                                                    className="h-10 text-sm rounded-md cursor-pointer"
                                                />
                                                
                                                {/* معاينة الصورة */}
                                                {value && typeof value === "string" && (
                                                    <div className="mt-2 flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                                                        <img
                                                            src={value}
                                                            alt="Preview"
                                                            className="w-12 h-12 object-cover rounded-md border"
                                                        />
                                                        <span className="text-xs text-muted-foreground font-medium">Image Preview</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
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

export default AdminAdd;