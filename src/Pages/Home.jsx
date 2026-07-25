import { useState } from "react";
import { useGet } from "@/hooks/useGet";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

import {
    Plus,
    Calendar,
    RefreshCw,
    Target,
    TrendingUp,
    Activity,
    Handshake,
    CheckCircle2,
    Loader2,
    ListTodo
} from "lucide-react";
import { Link } from "react-router-dom"; // استيراد Link الخاص بـ React Router[cite: 3]

export default function Home() {
    const [dateFilter, setDateFilter] = useState({ from: "", to: "" });

    const queryParams = new URLSearchParams();
    if (dateFilter.from) queryParams.append("from", dateFilter.from);
    if (dateFilter.to) queryParams.append("to", dateFilter.to);

    const queryString = queryParams.toString();
    const endpoint = `/api/admin/dashboard${queryString ? `?${queryString}` : ""}`;

    const { data, loading, error, refresh } = useGet(endpoint);

    const apiData = data?.data || {};

    const achievedVisits = apiData.targetAchievedVisits || 0;
    const targetVisits = apiData.total_visits_target || 0;
    const visitsProgress = targetVisits > 0 ? (achievedVisits / targetVisits) * 100 : 0;

    const achievedSales = apiData.targetAchievedSales || 0;
    const targetSales = apiData.total_sales_target || 0;
    const salesProgress = targetSales > 0 ? (achievedSales / targetSales) * 100 : 0;

    const stats = {
        sales: apiData.sales || 0,
        delivered: apiData.delivered || 0,
        negotiation: apiData.negotiation || 0,
    };

    const visitStatuses = apiData.allVisitStatuss || [];

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setDateFilter((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">

            {/* --- Header & Filters Section --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Sales Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        follow up with your team performance
                    </p>
                </div>

                <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="from" className="text-xs font-medium text-slate-600 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary" /> From
                        </Label>
                        <Input
                            id="from"
                            type="date"
                            name="from"
                            value={dateFilter.from}
                            onChange={handleFilterChange}
                            className="w-40 h-10 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-xl"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="to" className="text-xs font-medium text-slate-600 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary" /> To
                        </Label>
                        <Input
                            id="to"
                            type="date"
                            name="to"
                            value={dateFilter.to}
                            onChange={handleFilterChange}
                            className="w-40 h-10 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-xl"
                        />
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={refresh}
                        disabled={loading}
                        className="h-10 w-10 rounded-xl hover:bg-secondary/10 transition-all border-slate-200 text-secondary"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <Button variant="ghost" size="sm" onClick={refresh} className="text-red-700 hover:bg-red-100">
                        إعادة المحاولة
                    </Button>
                </div>
            )}

            {/* --- Action Button --- */}
            <div>
                <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                >
                    {/* تم التعديل هنا لـ to بدلاً من href */}
                    <Link to="/visits/add" className="flex items-center gap-3">
                        <div className="bg-primary-foreground/20 p-1.5 rounded-lg group-hover:rotate-90 transition-transform duration-300">
                            <Plus className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span>Add New Visit</span>
                    </Link>
                </Button>
            </div>

            {/* --- Targets & Achievements (Progress Section) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Visits Target */}
                <Card className="border-slate-200/80 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-secondary">Visits Target</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-3xl font-bold text-slate-900">{achievedVisits}</span>
                                    <span className="text-sm text-slate-500">/ {targetVisits}</span>
                                </div>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Target className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                        <Progress value={visitsProgress} className="h-2 bg-secondary/20 indicator-primary" />
                        <p className="text-xs text-slate-400 mt-3 flex justify-end">
                            {visitsProgress.toFixed(1)}% Achieved
                        </p>
                    </CardContent>
                </Card>

                {/* Sales Target */}
                <Card className="border-slate-200/80 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-secondary">Sales Target</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-3xl font-bold text-slate-900">{achievedSales}</span>
                                    <span className="text-sm text-slate-500">/ {targetSales}</span>
                                </div>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                        <Progress value={salesProgress} className="h-2 bg-secondary/20 indicator-primary" />
                        <p className="text-xs text-slate-400 mt-3 flex justify-end">
                            {salesProgress.toFixed(1)}% Achieved
                        </p>
                    </CardContent>
                </Card>

            </div>

            {/* --- Main Stats & Statuses --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">

                {/* Negotiation */}
                <Card className="border-l-4 border-l-secondary shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Negotiation</CardTitle>
                        <Handshake className="w-4 h-4 text-secondary" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="text-2xl font-bold text-slate-900">{stats.negotiation}</div>}
                    </CardContent>
                </Card>

                {/* Delivered */}
                <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Delivered</CardTitle>
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="text-2xl font-bold text-slate-900">{stats.delivered}</div>}
                    </CardContent>
                </Card>

                {/* Total Sales (Standalone) */}
                <Card className="border-l-4 border-l-slate-800 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Sales</CardTitle>
                        <Activity className="w-4 h-4 text-slate-800" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="text-2xl font-bold text-slate-900">{stats.sales}</div>}
                    </CardContent>
                </Card>

                {/* Dynamic Statuses (من الـ Array) */}
                {visitStatuses.map((status) => (
                    <Card key={status.id} className="border-slate-200/80 shadow-sm hover:shadow-md transition-all bg-slate-50/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 truncate mr-2" title={status.name.trim()}>
                                {status.name.trim()}
                            </CardTitle>
                            <ListTodo className="w-4 h-4 text-slate-400 shrink-0" />
                        </CardHeader>
                        <CardContent>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="text-2xl font-bold text-slate-700">{status.count}</div>}
                        </CardContent>
                    </Card>
                ))}

            </div>
        </div>
    );
}