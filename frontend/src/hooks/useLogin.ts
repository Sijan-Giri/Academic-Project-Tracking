import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/constants/routes';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (response: any) => {
      const user = response?.user || response?.data?.user;
      const accessToken = response?.accessToken || response?.data?.accessToken;
      if (user) {
        setAuth(user, accessToken || null);
        toast.success(`Welcome back, ${user.name}!`);
        navigate(ROUTES.DASHBOARD, { replace: true });
      } else {
        toast.error('Unexpected login response format.');
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Login failed. Please check your credentials.');
    },
  });

  return {
    login: mutation.mutate,
    isPending: mutation.isPending,
  };
}
