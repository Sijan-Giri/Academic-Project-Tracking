import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfile } from '@/hooks';
import { User, Lock, Save, Eye, EyeOff, BookOpen, GraduationCap, Building2, BadgeCheck, Hash, ShieldCheck, Phone } from 'lucide-react';
import { Button, Input, Label, PageHeader, FormSkeleton } from '@/components';

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
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-brand" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-foreground font-semibold text-sm break-all">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {

  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const {
    user,
    isLoading,
    updateProfile: updateProfileMutate,
    isUpdatingProfile,
    changePassword: changePasswordMutate,
    isChangingPassword,
  } = useProfile();

  const { register: regProfile, handleSubmit: handleProfileSubmit, reset: resetProfile, formState: { errors: profileErrors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.studentProfile?.phone || user?.facultyProfile?.phone || '',
      designation: user?.facultyProfile?.designation || '',
      specialization: user?.facultyProfile?.specialization || ''
    }
  });

  const { register: regPw, handleSubmit: handlePwSubmit, formState: { errors: pwErrors } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || '',
        phone: user.studentProfile?.phone || user.facultyProfile?.phone || '',
        designation: user.facultyProfile?.designation || '',
        specialization: user.facultyProfile?.specialization || ''
      });
    }
  }, [user, resetProfile]);

  const updateProfileMut = { mutate: updateProfileMutate, isPending: isUpdatingProfile };
  const changePasswordMut = { mutate: changePasswordMutate, isPending: isChangingPassword };

  // Early return for loading AFTER all hooks are called
  if (isLoading) {
    return <FormSkeleton />;
  }

  const studentProf = user?.studentProfile;
  const facultyProf = user?.facultyProfile;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Account Profile & Security"
        subtitle="Manage your personal information, department records, and account password."
      />

      {/* Top Profile Identity Banner */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-foreground tracking-tight truncate">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-subtle text-brand border border-brand">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-brand" />
                Personal Information
              </h3>
            </div>

            <form onSubmit={handleProfileSubmit((data) => updateProfileMut.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Full Name</Label>
                  <Input id="name" {...regProfile('name')} />
                  {profileErrors.name?.message && <p className="text-xs text-danger font-medium">{String(profileErrors.name.message)}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Phone Number</Label>
                  <Input id="phone" placeholder="+977 9857364826" {...regProfile('phone')} />
                </div>
              </div>

              {user?.role === 'FACULTY' || user?.role === 'COORDINATOR' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="designation" className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Designation</Label>
                    <Input id="designation" placeholder="e.g. Assistant Professor" {...regProfile('designation')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="specialization" className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Specialization</Label>
                    <Input id="specialization" placeholder="e.g. AI / Machine Learning" {...regProfile('specialization')} />
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={updateProfileMut.isPending} loadingText="Saving Profile..." className="btn-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand" />
                Security & Password
              </h3>
            </div>

            <form onSubmit={handlePwSubmit((data) => changePasswordMut.mutate(data))} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Current Password</Label>
                <div className="relative">
                  <Input id="currentPassword" type={showOldPw ? 'text' : 'password'} {...regPw('currentPassword')} />
                  <Button variant="ghost" size="icon" type="button" onClick={() => setShowOldPw(!showOldPw)} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground">
                    {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {pwErrors.currentPassword?.message && <p className="text-xs text-danger font-medium">{String(pwErrors.currentPassword.message)}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="font-medium text-xs text-muted-foreground uppercase tracking-wider">New Password</Label>
                  <div className="relative">
                    <Input id="newPassword" type={showNewPw ? 'text' : 'password'} {...regPw('newPassword')} />
                    <Button variant="ghost" size="icon" type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {pwErrors.newPassword?.message && <p className="text-xs text-danger font-medium">{String(pwErrors.newPassword.message)}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Confirm New Password</Label>
                  <div className="relative">
                    <Input id="confirmPassword" type={showConfirmPw ? 'text' : 'password'} {...regPw('confirmPassword')} />
                    <Button variant="ghost" size="icon" type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground">
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {pwErrors.confirmPassword?.message && <p className="text-xs text-danger font-medium">{String(pwErrors.confirmPassword.message)}</p>}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={changePasswordMut.isPending} loadingText="Updating Password..." className="btn-primary">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Update Security Password
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Academic & System Profile Metadata */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-2">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3 flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-brand" />
              Academic Metadata
            </h3>

            <div className="divide-y divide-border">
              <InfoRow icon={Hash} label="User ID" value={user?.id} />
              <InfoRow icon={GraduationCap} label="Student Roll ID" value={studentProf?.studentId} />
              <InfoRow icon={BadgeCheck} label="Faculty ID" value={facultyProf?.facultyId} />
              <InfoRow icon={Building2} label="Department" value={facultyProf?.department?.name || studentProf?.batch?.department?.name} />
              <InfoRow icon={BookOpen} label="Academic Batch" value={studentProf?.batch?.name} />
              <InfoRow icon={Phone} label="Contact Phone" value={studentProf?.phone || facultyProf?.phone} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
