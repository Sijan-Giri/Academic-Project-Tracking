import { useQuery, useMutation } from '@tanstack/react-query'; import toast from 'react-hot-toast'; 
import { useAuthStore } from '@/store/auth.store';
import { getMe, updateProfile, changePassword } from '@/api';

export function useProfile() {
  const authUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const { data: meRes, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const meData = (meRes as any)?.data ?? meRes;
  const user = meData || authUser;

  const updateProfileMut = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data: any) => {
      toast.success('Profile information updated successfully!');
      const updatedUser = data?.data || data;
      if (updatedUser) setUser(updatedUser);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    },
  });

  const changePasswordMut = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Security password updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    },
  });

  return {
    user,
    isLoading,
    updateProfile: updateProfileMut.mutate,
    isUpdatingProfile: updateProfileMut.isPending,
    changePassword: changePasswordMut.mutate,
    isChangingPassword: changePasswordMut.isPending,
  };
}
