import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { User, Lock, Save, Loader2, Eye, EyeOff, BookOpen, GraduationCap, Building2, BadgeCheck, Hash, ShieldCheck, Calendar, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/shared/PageHeader';
import { useAuthStore } from '@/store/auth.store';
import { getMe, updateProfile, changePassword } from '@/api/auth.api';
import { cn } from '@/lib/utils';

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
    <div className="flex items-start gap-3.5 py-3.5 dark:border-white/5 border-slate-100 border-b last:border-0">
      <div className="w-9 h-9 rounded-xl dark:bg-indigo-500/10 dark:border-indigo-500/20 bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs dark:text-gray-400 text-slate-500 font-bold uppercase tracking-wider mb-0.5">{label}</p>
        <p className="dark:text-white text-slate-900 font-bold text-sm break-all">{value}</p>
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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="User Profile & Settings"
        subtitle="Manage your personal details, phone number, and security credentials."
      />

      {/* Avatar + Identity Banner */}
      <div className="relative overflow-hidden rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-indigo-500/25 shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1 space-y-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight leading-tight">
                {user.name}
              </h1>
              <p className="dark:text-gray-400 text-slate-500 font-medium text-sm mt-0.5">{user.email}</p>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2.5 pt-1">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-xs shadow-xs">
                {user.role}
              </span>
              {isStudent && studentProfile?.studentId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30 bg-violet-50 text-violet-700 border border-violet-200 text-xs font-bold">
                  <Hash className="w-3.5 h-3.5" /> Roll: {studentProfile.studentId}
                </span>
              )}
              {isFaculty && facultyProfile?.facultyId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                  <BadgeCheck className="w-3.5 h-3.5" /> ID: {facultyProfile.facultyId}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Edit Profile & Change Password Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Info Form */}
          <div className="rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
            <form onSubmit={submitProfile(d => updateProfileMut.mutate(d))} className="space-y-6">
              <h3 className="text-xl font-extrabold dark:text-white text-slate-900 flex items-center gap-2.5">
                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider dark:text-gray-400 text-slate-600">Full Name</Label>
                  <Input {...regProfile('name')} className="h-11 rounded-xl" />
                  {errProfile.name && <p className="text-rose-500 text-xs font-semibold">{errProfile.name.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider dark:text-gray-400 text-slate-600">Phone Number</Label>
                  <Input {...regProfile('phone')} placeholder="+977 98XXXXXXXX" className="h-11 rounded-xl" />
                </div>

                {isFaculty && (
                  <>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-wider dark:text-gray-400 text-slate-600">Designation</Label>
                      <Input {...regProfile('designation')} className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-wider dark:text-gray-400 text-slate-600">Specialization</Label>
                      <Input {...regProfile('specialization')} className="h-11 rounded-xl" />
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={updateProfileMut.isPending}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold shadow-md shadow-indigo-500/20 px-6 h-11 rounded-xl"
                >
                  {updateProfileMut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
            <form onSubmit={submitPw(d => changePwMut.mutate(d))} className="space-y-6">
              <h3 className="text-xl font-extrabold dark:text-white text-slate-900 flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-violet-600 dark:text-violet-400" /> Security & Password
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider dark:text-gray-400 text-slate-600">Current Password</Label>
                  <div className="relative">
                    <Input type={showOldPw ? 'text' : 'password'} {...regPw('currentPassword')} className="h-11 rounded-xl pr-10" />
                    <button
                      type="button"
                      onClick={() => setShowOldPw(!showOldPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 dark:text-gray-400 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errPw.currentPassword && <p className="text-rose-500 text-xs font-semibold">{errPw.currentPassword.message as string}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-wider dark:text-gray-400 text-slate-600">New Password</Label>
                    <div className="relative">
                      <Input type={showNewPw ? 'text' : 'password'} {...regPw('newPassword')} className="h-11 rounded-xl pr-10" />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 dark:text-gray-400 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errPw.newPassword && <p className="text-rose-500 text-xs font-semibold">{errPw.newPassword.message as string}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-wider dark:text-gray-400 text-slate-600">Confirm New Password</Label>
                    <div className="relative">
                      <Input type={showConfirmPw ? 'text' : 'password'} {...regPw('confirmPassword')} className="h-11 rounded-xl pr-10" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 dark:text-gray-400 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errPw.confirmPassword && <p className="text-rose-500 text-xs font-semibold">{errPw.confirmPassword.message as string}</p>}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={changePwMut.isPending}
                  className="w-full h-11 dark:bg-white/10 dark:hover:bg-white/20 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                >
                  {changePwMut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                  Update Security Password
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right — Profile Details Sidebar */}
        <div className="space-y-8">
          <div className="rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 md:p-7 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="text-lg font-extrabold dark:text-white text-slate-900 mb-4 flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Account Records
            </h3>

            {/* Student info */}
            {isStudent && (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                <InfoRow icon={Hash} label="Student ID / Roll No" value={studentProfile?.studentId} />
                <InfoRow icon={Phone} label="Phone Number" value={studentProfile?.phone} />
                <InfoRow icon={BookOpen} label="Academic Batch" value={studentProfile?.batch?.name} />
                <InfoRow icon={Building2} label="Department" value={studentProfile?.batch?.department?.name} />
              </div>
            )}

            {/* Faculty info */}
            {isFaculty && (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                <InfoRow icon={Hash} label="Faculty Member ID" value={facultyProfile?.facultyId} />
                <InfoRow icon={Building2} label="Department" value={facultyProfile?.department?.name} />
                <InfoRow icon={GraduationCap} label="Designation" value={facultyProfile?.designation} />
                <InfoRow icon={BookOpen} label="Specialization" value={facultyProfile?.specialization} />
              </div>
            )}

            {user.role === 'ADMIN' && (
              <p className="dark:text-gray-400 text-slate-500 text-sm text-center py-4 font-medium">System Super Administrator</p>
            )}
          </div>

          {/* Account Meta */}
          <div className="rounded-3xl dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200/80 p-6 md:p-7 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="text-lg font-extrabold dark:text-white text-slate-900 mb-4">Account Meta</h3>
            <div className="space-y-3.5 text-sm font-medium">
              <div className="flex justify-between items-center pb-2 border-b dark:border-white/5 border-slate-100">
                <span className="dark:text-gray-400 text-slate-500">System Role</span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 text-xs font-bold border border-indigo-200">
                  {user.role}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b dark:border-white/5 border-slate-100">
                <span className="dark:text-gray-400 text-slate-500">Account Status</span>
                <span className={cn(
                  'text-xs font-extrabold px-2.5 py-0.5 rounded-full border',
                  (user as any).isActive !== false
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-200'
                )}>
                  {(user as any).isActive !== false ? 'Active Account' : 'Inactive Account'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="dark:text-gray-400 text-slate-500">Member Since</span>
                <span className="dark:text-gray-200 text-slate-800 font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  {(user as any).createdAt
                    ? new Date((user as any).createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : '2025'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
