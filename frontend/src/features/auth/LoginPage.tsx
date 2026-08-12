import { useState, useEffect } from 'react'; import { useForm } from 'react-hook-form'; import { zodResolver } from '@hookform/resolvers/zod'; import { useNavigate, useSearchParams, Link } from 'react-router-dom'; import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'; import { useLogin } from '@/hooks'; import toast from 'react-hot-toast'; import { z } from 'zod'; import { Button, Input, Label } from '@/components'; import { loginSchema } from '@/lib';
 
import { useAuthStore } from '@/store';
import { refreshToken, getMe } from '@/api';

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
      
      if (isSessionExpired) return;

      const state = useAuthStore.getState();
      if (state.accessToken && state.user) {
        if (isMounted) {
          navigate('/dashboard', { replace: true });
        }
        return;
      }

      try {
        
        const refreshRes = await refreshToken();
        const token = refreshRes?.accessToken;

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
        <p className="text-dark-muted">Sign in to your APTS account</p>
      </div>

      {isSessionExpired && (
        <div className="mb-5 p-3.5 rounded-xl bg-warning-subtle border border-warning text-warning text-xs font-medium flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 text-warning" />
          <span>Your session has expired. Please sign in again to continue.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login-email" className="label-dark">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-muted" />
            <Input id="login-email" {...register('email')} type="email" placeholder="you@institution.edu" className="pl-10 input-dark focus-visible:ring-brand" />
          </div>
          {errors.email && <p className="text-danger text-xs">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password" className="label-dark">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-muted" />
            <Input id="login-password" {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-10 pr-10 input-dark focus-visible:ring-brand" />
            <Button variant="ghost" size="icon" type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-dark-muted hover:text-white transition-colors">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && <p className="text-danger text-xs">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full gradient-brand gradient-brand-hover text-white border-0" size="lg" isLoading={isPending} loadingText="Signing in..." id="login-submit">
          Sign In
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-dark-muted">
        Faculty member?{' '}
        <Link to="/register" className="text-brand font-semibold underline">
          Create a faculty account
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-dark-muted">
        Students are registered by administrators.
      </p>
    </div>
  );
}
