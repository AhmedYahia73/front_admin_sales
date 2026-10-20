import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, Eye, EyeOff, Building2 } from 'lucide-react';
import { setAuthToken } from '@/utils/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation } from '@/hooks/useMutation';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';
import { brandConfig, setProjectBrand, applyBrandTheme } from '@/utils/brand';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(true);

  const { mutate, loading } = useMutation();

  // جلب مشاريع المبيعات المتاحة للاختيار
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get('/api/admin/auth/sales-projects');
        const list = response?.data?.data?.salesProjects || [];
        setProjects(list);

        if (list.length > 0) {
          const stored = localStorage.getItem('project');
          const parsed = stored ? JSON.parse(stored) : null;
          const initial = list.find((p) => p.id === parsed?.id) || list[0];
          setSelectedProjectId(initial.id);
          setProjectBrand(initial);
        }
      } catch (err) {
        console.error('Failed to load sales projects:', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProjectChange = (e) => {
    const pId = e.target.value;
    setSelectedProjectId(pId);
    const chosen = projects.find((p) => p.id === pId);
    if (chosen) {
      setProjectBrand(chosen);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await mutate({
      method: 'POST',
      url: '/api/admin/auth/login',
      data: {
        ...formData,
        project_id: selectedProjectId || undefined,
      },
    });

    if (response?.data?.data) {
      const { token, user, project } = response.data.data;

      if (user.role !== 'admin') {
        toast.error('عفواً، لا تملك الصلاحية للدخول كمدير (Admin)');
        return;
      }

      // 1. تخزين التوكن في الكوكيز
      setAuthToken(token);

      // 2. تخزين بيانات المستخدم
      localStorage.setItem('user', JSON.stringify(user));

      // 3. تخزين بيانات المشروع وتطبيق التصميم المختار (design 1 -> keeto, design 2 -> systego)
      if (project) {
        setProjectBrand(project);
      } else {
        applyBrandTheme();
      }

      // 4. التوجيه
      navigate('/home', { replace: true });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 overflow-hidden">
      {/* Subtle Branded Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-zinc-400/10 dark:bg-zinc-800/5 blur-[120px] pointer-events-none" />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200/60 dark:border-zinc-800 p-8 z-10"
      >
        <div className="text-center mb-8">
          {/* Logo preview */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex items-center justify-center mx-auto mb-4 min-h-[64px]"
          >
            <img
              src={brandConfig.logo}
              alt={brandConfig.logoAlt}
              className={brandConfig.logoClassName}
            />
          </motion.div>
          <h2 className="text-xl font-bold text-foreground">
            {brandConfig.appTitle} (Admin)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Sign in to manage your sales dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sales Project Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                Sales Project (المشروع)
              </span>
              {loadingProjects && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </label>
            <select
              value={selectedProjectId}
              onChange={handleProjectChange}
              disabled={loadingProjects || projects.length === 0}
              className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
            >
              {projects.length === 0 ? (
                <option value="">{loadingProjects ? 'جاري تحميل المشاريع...' : 'لا يوجد مشاريع'}</option>
              ) : (
                projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name} ({proj.design || 'design 1'})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                type="email"
                name="email"
                placeholder={brandConfig.emailPlaceholder}
                className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-950/50 focus-visible:ring-primary/50"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                className="pl-10 pr-10 h-11 bg-zinc-50/50 dark:bg-zinc-950/50 focus-visible:ring-primary/50"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 dark:shadow-none mt-2"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
