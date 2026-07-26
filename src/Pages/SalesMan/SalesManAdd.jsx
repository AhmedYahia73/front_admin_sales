import React from "react";
import { useParams } from "react-router-dom"; // 💡 استيراد useParams
import AddPage from "@/components/AddPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGet } from "@/hooks/useGet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"; // 💡 استيراد Loader2

// 💡 دالة مساعدة لتحويل الملف إلى Base64
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

const SalesManAdd = () => {
    // 💡 1. نقلنا كل الـ Hooks دي جوه الـ Component
    const { id } = useParams();

    // جلب قائمة القادة (Leaders)
    const { data: listsResponse, loading: isLoadingLists } = useGet("/api/admin/sales/lists");
    const leadersList = listsResponse?.data?.leaders || listsResponse?.leaders || [];

    // جلب بيانات المندوب في حالة التعديل (لو فيه ID)
    const { data: response, loading: isLoadingData } = useGet(
        id ? `/api/admin/sales/${id}` : null,
        Boolean(id)
    );

    // استخراج بيانات المندوب من الاستجابة
    const fetchedSales =
        response?.data?.sales?.[0] ||
        response?.sales?.[0] ||
        response?.data?.sales ||
        response;

    // 💡 2. إظهار شاشة تحميل لو احنا في وضع التعديل والداتا لسه بتيجي
    if (id && isLoadingData) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <AddPage
            title={id ? "Edit Sales" : "Add Sales"} // تغيير العنوان ديناميكياً
            apiUrl= "/api/admin/sales" // 💡 تغيير الرابط حسب حالة الإضافة أو التعديل
            // method={id ? "PUT" : "POST"} // 💡 لو الـ AddPage عندك بتدعم الـ method ضيف السطر ده
            
            method={id ? "PUT" : "POST"}
            initialData={
                id && fetchedSales
                    ? {
                          // لو فيه داتا جاية من الباك إند نركبها هنا
                          id: fetchedSales.id || "",
                          name: fetchedSales.name || "",
                          email: fetchedSales.email || "",
                          phone: fetchedSales.phone || "",
                          password: "", // الباسورد بيفضل فاضي في التعديل
                          imageBase64: "", 
                          status: fetchedSales.status || "active",
                          leader_id: fetchedSales.leader_id || null,
                      }
                    : {
                          // لو إضافة جديدة دي القيم الافتراضية
                          id: "",
                          name: "",
                          email: "",
                          phone: "",
                          password: "",
                          imageBase64: "",
                          status: "active",
                          leader_id: null,
                      }
            }
            transformPayload={(data) => {
                const payload = {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    status: data.status,
                    leader_id: data.leader_id,
                };

                // إرسال كلمة المرور فقط في حالة كتابتها
                if (data.password) {
                    payload.password = data.password;
                }

                // إرسال الصورة كـ Base64 (النص) في الـ Body
                if (data.imageBase64) {
                    payload.image = data.imageBase64;
                }
                
                return payload;
            }}
            onSuccessAction={() => window.history.back()}
        >
            {(methods) => {
                const {
                    register,
                    control,
                    setValue,
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
                                    <Label className="text-sm font-medium">
                                        Password {id ? "(Leave empty to keep current)" : "*"}
                                    </Label>
                                    <Input
                                        type="password"
                                        {...register("password", {
                                            // 💡 الباسورد إجباري فقط في حالة الإضافة (id مش موجود)
                                            required: id ? false : "Password is required",
                                            minLength: {
                                                value: 6,
                                                message: "Password must be at least 6 characters",
                                            },
                                        })}
                                        placeholder={id ? "Enter new password (optional)" : "Enter secret password"}
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

                                {/* 6. Leaders Search Select */}
                                <div className="space-y-2 flex flex-col w-full">
                                    <Label className="text-sm font-medium">Leaders *</Label>
                                    <Controller
                                        name="leader_id"
                                        control={control}
                                        rules={{ required: "Leader is required" }}
                                        render={({ field }) => (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full justify-between font-normal text-left h-10 px-3 text-sm rounded-md",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? leadersList.find((l) => l.id == field.value)?.name
                                                            : "Select Leader"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-[var(--radix-popover-trigger-width)] p-0"
                                                    align="start"
                                                >
                                                    <Command className="text-sm">
                                                        <CommandInput
                                                            placeholder="Search leaders..."
                                                            className="h-9 text-sm"
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty className="p-2 text-sm text-center text-gray-500">
                                                                No results found.
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {leadersList.map((s) => (
                                                                    <CommandItem
                                                                        key={s.id}
                                                                        value={s.name}
                                                                        className="text-sm py-1.5 px-2 cursor-pointer"
                                                                        onSelect={() => field.onChange(s.id)}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                s.id == field.value
                                                                                    ? "opacity-100"
                                                                                    : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {s.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                    {errors.leader_id && (
                                        <span className="text-xs text-red-500">
                                            {errors.leader_id.message}
                                        </span>
                                    )}
                                </div>

                                {/* 7. Image Field */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Image {id && "(Leave empty to keep current)"}</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="h-10 text-sm rounded-md cursor-pointer"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const base64 = await fileToBase64(file);
                                                setValue("imageBase64", base64);
                                            } else {
                                                setValue("imageBase64", ""); // مسح القيمة لو ألغى الاختيار
                                            }
                                        }}
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