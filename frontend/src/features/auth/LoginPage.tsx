import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema } from '@/lib/validators';
import { login } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setUser(data.data.user);
      toast.success(`Welcome back, ${data.data.user.name}!`);
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Login failed. Please check your credentials.');
    },
  });

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
        <p className="text-gray-400">Sign in to your APTS account</p>
      </div>
      <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login-email" className="text-gray-300">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input id="login-email" {...register('email')} type="email" placeholder="you@institution.edu" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500" />
          </div>
          {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password" className="text-gray-300">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input id="login-password" {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500" />
            <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0" size="lg" disabled={isPending} id="login-submit">
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : 'Sign In'}
        </Button>
      </form>
      <p className="mt-6 text-center text-xs text-gray-500">Default admin: admin@apts.edu / Admin@123</p>
    </div>
  );
}
