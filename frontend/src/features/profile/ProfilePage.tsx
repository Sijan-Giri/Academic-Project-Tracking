import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { User, Lock, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth.store';
import { updateProfile, changePassword } from '@/api/profile.api';
import StatusBadge from '@/components/shared/StatusBadge';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  designation: z.string().optional(),
  specialization: z.string().optional()
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export default function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const { register: regProfile, handleSubmit: submitProfile, formState: { errors: errProfile } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      designation: user?.designation || '',
      specialization: user?.specialization || ''
    }
  });

  const { register: regPw, handleSubmit: submitPw, reset: resetPw, formState: { errors: errPw } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const updateProfileMut = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      setUser({ ...user, ...data.data });
      toast.success('Profile updated successfully');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update profile')
  });

  const changePwMut = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
      resetPw();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to change password')
  });

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Profile Section */}
      <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/20 shrink-0">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
            <p className="text-gray-400 mb-2">{user.email}</p>
            <StatusBadge status={user.role} />
          </div>
        </div>

        <form onSubmit={submitProfile(d => updateProfileMut.mutate(d))} className="space-y-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" /> Profile Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-gray-300">Full Name</Label>
              <Input {...regProfile('name')} className="bg-white/5 border-white/10 text-white" />
              {errProfile.name && <p className="text-red-400 text-xs">{errProfile.name.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Phone Number</Label>
              <Input {...regProfile('phone')} placeholder="+1 234 567 8900" className="bg-white/5 border-white/10 text-white" />
            </div>
            
            {user.role === 'FACULTY' && (
              <>
                <div className="space-y-2">
                  <Label className="text-gray-300">Designation</Label>
                  <Input {...regProfile('designation')} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Specialization</Label>
                  <Input {...regProfile('specialization')} className="bg-white/5 border-white/10 text-white" />
                </div>
              </>
            )}
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={updateProfileMut.isPending} className="bg-indigo-500 hover:bg-indigo-600 text-white">
              {updateProfileMut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 h-fit">
        <form onSubmit={submitPw(d => changePwMut.mutate(d))} className="space-y-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-violet-400" /> Change Password
          </h3>
          
          <div className="space-y-2">
            <Label className="text-gray-300">Current Password</Label>
            <div className="relative">
              <Input type={showOldPw ? 'text' : 'password'} {...regPw('currentPassword')} className="bg-white/5 border-white/10 text-white pr-10" />
              <button type="button" onClick={() => setShowOldPw(!showOldPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errPw.currentPassword && <p className="text-red-400 text-xs">{errPw.currentPassword.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">New Password</Label>
            <div className="relative">
              <Input type={showNewPw ? 'text' : 'password'} {...regPw('newPassword')} className="bg-white/5 border-white/10 text-white pr-10" />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errPw.newPassword && <p className="text-red-400 text-xs">{errPw.newPassword.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Confirm Password</Label>
            <div className="relative">
              <Input type={showConfirmPw ? 'text' : 'password'} {...regPw('confirmPassword')} className="bg-white/5 border-white/10 text-white pr-10" />
              <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errPw.confirmPassword && <p className="text-red-400 text-xs">{errPw.confirmPassword.message as string}</p>}
          </div>
          
          <div className="pt-2">
            <Button type="submit" disabled={changePwMut.isPending} className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
              {changePwMut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Update Password
            </Button>
          </div>
        </form>
      </div>

    </div>
  );
}
