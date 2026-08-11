import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useLogin } from '@/hooks/useLogin';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema } from '@/lib/validators';
import { refreshToken, getMe } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSessionExpired = searchParams.get('reason') === 'expired';
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    let isMounted = true;

    async function checkSessionOnMount() {
      // If session expired flag is set in URL, don't attempt auto-login
      if (isSessionExpired) return;

      // If access token already exists in memory, send user to dashboard immediately
      const state = useAuthStore.getState();
      if (state.accessToken && state.user) {
        if (isMounted) {
          navigate('/dashboard', { replace: true });
        }
        return;
      }

      try {
        // Step 1: Call refresh API to verify if access token can be created from session
        const refreshRes = await refreshToken();
        const token = refreshRes?.accessToken;

        // Step 2: If there is access token, store it, call getMe, and send user to dashboard
        if (token) {
          useAuthStore.getState().setAccessToken(token);
          const meData: any = await getMe();
          const userObj = meData?.user || meData?.data || meData;

          if (isMounted && userObj && userObj.id) {
            setAuth(userObj, token);
            toast.success(`Welcome back, ${userObj.name}!`);
            navigate('/dashboard', { replace: true });
            return;
          }
        }
      } catch (_) {
        // No valid token found, user must log in
      }
    }

    checkSessionOnMount();

    return () => {
      isMounted = false;
    };
  }, [navigate, setAuth, isSessionExpired]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const { login: mutate, isPending } = useLogin();

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
        <p className="text-gray-400">Sign in to your APTS account</p>
      </div>

      {isSessionExpired && (
        <div className="mb-5 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 text-amber-400" />
          <span>Your session has expired. Please sign in again to continue.</span>
        </div>
      )}

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
            <Button variant="ghost" size="icon" type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-white transition-colors">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0" size="lg" isLoading={isPending} loadingText="Signing in..." id="login-submit">
          Sign In
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">
        Faculty member?{' '}
        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
          Create a faculty account
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-gray-600">
        Students are registered by administrators.
      </p>
    </div>
  );
}
