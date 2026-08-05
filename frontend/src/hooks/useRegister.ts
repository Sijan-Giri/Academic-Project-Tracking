import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signup } from '@/api/auth.api';
import { getDepartments } from '@/api/departments.api';
import { getBatches } from '@/api/batches.api';
import { useAuthStore } from '@/store/auth.store';
import { unwrapList } from '@/utils/apiUtils';
import { ROUTES } from '@/constants/routes';

export function useRegister() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { data: deptRes } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const { data: batchRes } = useQuery({
    queryKey: ['batches'],
    queryFn: () => getBatches(),
  });

  const departments = unwrapList<any>(deptRes);
  const batches = unwrapList<any>(batchRes);

  const signupMutation = useMutation({
    mutationFn: signup,
    onSuccess: (response: any) => {
      const user = response?.user || response?.data?.user;
      const accessToken = response?.accessToken || response?.data?.accessToken;
      if (user) {
        setAuth(user, accessToken || null);
        toast.success(`Account created successfully! Welcome, ${user.name}!`);
        navigate(ROUTES.DASHBOARD, { replace: true });
      } else {
        toast.success('Registration successful. Please log in.');
        navigate(ROUTES.LOGIN, { replace: true });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Registration failed. Please check your input.');
    },
  });

  return {
    departments,
    batches,
    register: signupMutation.mutate,
    isPending: signupMutation.isPending,
  };
}
