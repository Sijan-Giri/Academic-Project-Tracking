import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { User, Lock, Save, Loader2, Eye, EyeOff, BookOpen, GraduationCap, Building2, BadgeCheck, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { getMe, updateProfile, changePassword } from '@/api/auth.api';

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

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 dark:border-white/5 border-slate-100 border-b last:border-0">
      <div className="w-8 h-8 rounded-lg dark:bg-indigo-500/10 dark:border-indigo-500/20 bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs dark:text-gray-400 text-slate-500 mb-0.5">{label}</p>
        <p className="dark:text-white text-slate-900 font-medium text-sm break-all">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const authUser = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Fetch fresh profile data on mount
  const { data: meRes } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  useEffect(() => {
    const fresh = (meRes as any)?.data ?? meRes;
    if (fresh?.id) setUser(fresh);
  }, [meRes, setUser]);

  const rawMe = meRes as any;
  const freshUser = rawMe?.data ?? (rawMe?.id ? rawMe : null);
  const user = freshUser || authUser;

  const studentProfile = (user as any)?.studentProfile;
  const facultyProfile = (user as any)?.facultyProfile;

  const { register: regProfile, handleSubmit: submitProfile, formState: { errors: errProfile } } = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name || '',
      phone: studentProfile?.phone || facultyProfile?.phone || '',
      designation: facultyProfile?.designation || '',
      specialization: facultyProfile?.specialization || ''
    }
  });

  const { register: regPw, handleSubmit: submitPw, reset: resetPw, formState: { errors: errPw } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const updateProfileMut = useMutation({
    mutationFn: updateProfile,
    onSuccess: (res: any) => {
      const updated = res.data || res;
      setUser(updated);
      toast.success('Profile updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  });

  const changePwMut = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password updated successfully');
      resetPw();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  });

  if (!user) return null;

  const isStudent = user.role === 'STUDENT';
  const isFaculty = user.role === 'FACULTY' || user.role === 'COORDINATOR' || user.role === 'PANEL';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Avatar + Identity Banner */}
      <div className="dark:bg-white/5 dark:border-white/10 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/20 shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold dark:text-white text-slate-900 mb-1">{user.name}</h1>
            <p className="dark:text-gray-400 text-slate-500 mb-3">{user.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <Badge className="bg-indigo-600 text-white font-semibold px-3 py-1 text-sm">{user.role}</Badge>
              {isStudent && studentProfile?.studentId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30 bg-violet-50 text-violet-700 border border-violet-200 text-sm font-semibold">
                  <Hash className="w-3.5 h-3.5" />
                  {studentProfile.studentId}
                </span>
              )}
              {isFaculty && facultyProfile?.facultyId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 bg-blue-50 text-blue-700 border border-blue-200 text-sm font-semibold">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {facultyProfile.facultyId}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Edit Form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Profile Info Form */}
          <div className="dark:bg-white/5 dark:border-white/10 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8 backdrop-blur-md">
            <form onSubmit={submitProfile(d => updateProfileMut.mutate(d))} className="space-y-5">
              <h3 className="text-lg font-semibold dark:text-white text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Profile Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input {...regProfile('name')} />
                  {errProfile.name && <p className="text-red-400 text-xs">{errProfile.name.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input {...regProfile('phone')} placeholder="+977 9847583758" />
                </div>
                
                {isFaculty && (
                  <>
                    <div className="space-y-2">
                      <Label>Designation</Label>
                      <Input {...regProfile('designation')} />
                    </div>
                    <div className="space-y-2">
                      <Label>Specialization</Label>
                      <Input {...regProfile('specialization')} />
                    </div>
                  </>
                )}
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={updateProfileMut.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {updateProfileMut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="dark:bg-white/5 dark:border-white/10 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8 backdrop-blur-md">
            <form onSubmit={submitPw(d => changePwMut.mutate(d))} className="space-y-5">
              <h3 className="text-lg font-semibold dark:text-white text-slate-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-violet-500 dark:text-violet-400" /> Change Password
              </h3>
              
              <div className="space-y-2">
                <Label>Current Password</Label>
                <div className="relative">
                  <Input type={showOldPw ? 'text' : 'password'} {...regPw('currentPassword')} className="pr-10" />
                  <button type="button" onClick={() => setShowOldPw(!showOldPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white">
                    {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errPw.currentPassword && <p className="text-red-400 text-xs">{errPw.currentPassword.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input type={showNewPw ? 'text' : 'password'} {...regPw('newPassword')} className="pr-10" />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errPw.newPassword && <p className="text-red-400 text-xs">{errPw.newPassword.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Input type={showConfirmPw ? 'text' : 'password'} {...regPw('confirmPassword')} className="pr-10" />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white">
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errPw.confirmPassword && <p className="text-red-400 text-xs">{errPw.confirmPassword.message as string}</p>}
              </div>
              
              <div className="pt-2">
                <Button type="submit" disabled={changePwMut.isPending} className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/20">
                  {changePwMut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right — Account Details Sidebar */}
        <div className="space-y-6">
          <div className="dark:bg-white/5 dark:border-white/10 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-base font-semibold dark:text-white text-slate-900 mb-4 flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Account Details
            </h3>

            {/* Student-specific info */}
            {isStudent && (
              <div className="divide-y divide-white/5">
                <InfoRow
                  icon={Hash}
                  label="Roll Number / Student ID"
                  value={studentProfile?.studentId}
                />
                <InfoRow
                  icon={User}
                  label="Phone Number"
                  value={studentProfile?.phone}
                />
                <InfoRow
                  icon={BookOpen}
                  label="Batch"
                  value={studentProfile?.batch?.name}
                />
                <InfoRow
                  icon={Building2}
                  label="Department"
                  value={studentProfile?.batch?.department?.name}
                />
              </div>
            )}

            {/* Faculty-specific info */}
            {isFaculty && (
              <div className="divide-y divide-white/5">
                <InfoRow
                  icon={Hash}
                  label="Faculty ID"
                  value={facultyProfile?.facultyId}
                />
                <InfoRow
                  icon={Building2}
                  label="Department"
                  value={facultyProfile?.department?.name}
                />
                <InfoRow
                  icon={GraduationCap}
                  label="Designation"
                  value={facultyProfile?.designation}
                />
                <InfoRow
                  icon={BookOpen}
                  label="Specialization"
                  value={facultyProfile?.specialization}
                />
              </div>
            )}

            {/* Admin has no special profile */}
            {user.role === 'ADMIN' && (
              <p className="text-gray-500 text-sm text-center py-4">System Administrator</p>
            )}
          </div>

          {/* Read-only account meta */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">Account Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="dark:text-gray-400 text-slate-500">Role</span>
                <Badge className="bg-indigo-600 text-white font-semibold">{user.role}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${(user as any).isActive !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {(user as any).isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Member since</span>
                <span className="text-gray-300">
                  {(user as any).createdAt
                    ? new Date((user as any).createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
