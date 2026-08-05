import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Loader2, GraduationCap, Briefcase, Phone, Hash } from 'lucide-react';
import { useRegister } from '@/hooks/useRegister';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'FACULTY']),
  studentId: z.string().optional(),
  facultyId: z.string().optional(),
  phone: z.string().optional(),
  departmentId: z.string().optional(),
  batchId: z.string().optional(),
  designation: z.string().optional(),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'FACULTY'>('STUDENT');

  const { departments, batches, register: mutate, isPending } = useRegister();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'STUDENT',
    },
  });

  const handleRoleChange = (role: 'STUDENT' | 'FACULTY') => {
    setSelectedRole(role);
    setValue('role', role);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-gray-400">Join APTS to track academic projects</p>
      </div>

      {/* Role Toggle Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 border border-white/10 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => handleRoleChange('STUDENT')}
          className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${selectedRole === 'STUDENT' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
        >
          <GraduationCap className="w-4 h-4" /> Student
        </button>
        <button
          type="button"
          onClick={() => handleRoleChange('FACULTY')}
          className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${selectedRole === 'FACULTY' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
        >
          <Briefcase className="w-4 h-4" /> Faculty
        </button>
      </div>

      <form onSubmit={handleSubmit(d => mutate({ ...d, role: selectedRole }))} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label className="text-gray-300">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input {...register('name')} placeholder="John Doe" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
          </div>
          {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-gray-300">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input {...register('email')} type="email" placeholder="you@institution.edu" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
          </div>
          {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label className="text-gray-300">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
            <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
        </div>

        {/* Role Specific Fields */}
        {selectedRole === 'STUDENT' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-gray-300">Roll Number / Student ID</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input {...register('studentId')} placeholder="CS2023001" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Batch</Label>
              <Select onValueChange={(val) => setValue('batchId', val)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select Batch" /></SelectTrigger>
                <SelectContent className="bg-[#1e1e2e] border-white/10 text-white">
                  {batches.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-gray-300">Faculty ID</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input {...register('facultyId')} placeholder="FAC001" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Department</Label>
              <Select onValueChange={(val) => setValue('departmentId', val)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select Department" /></SelectTrigger>
                <SelectContent className="bg-[#1e1e2e] border-white/10 text-white">
                  {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name} ({d.code})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Phone */}
        <div className="space-y-1.5">
          <Label className="text-gray-300">Phone Number (Optional)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input {...register('phone')} placeholder="+91 9876543210" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
          </div>
        </div>

        <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0 mt-2" size="lg" disabled={isPending}>
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account...</> : 'Create Account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
