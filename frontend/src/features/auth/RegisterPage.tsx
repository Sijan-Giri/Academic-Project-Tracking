import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Briefcase, Hash, Phone, Info } from 'lucide-react';
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
  role: z.enum(['FACULTY']).default('FACULTY'),
  facultyId: z.string().optional(),
  phone: z.string().optional(),
  departmentId: z.string().optional(),
  designation: z.string().optional(),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  const { departments, register: mutate, isPending } = useRegister();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'FACULTY' },
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Faculty Registration</h2>
        <p className="text-gray-400">Create your faculty account to get started</p>
      </div>

      {/* Info Notice */}
      <div className="flex items-start gap-3 p-3.5 mb-6 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
        <p className="text-xs leading-relaxed">
          <span className="font-semibold">Students</span> are registered directly by administrators.
          If you are a student, please contact your institution's admin for account access.
        </p>
      </div>

      <form onSubmit={handleSubmit(d => mutate({ ...d, role: 'FACULTY' }))} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label className="text-gray-300">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input {...register('name')} placeholder="Dr. Jane Smith" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
          </div>
          {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-gray-300">Institutional Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input {...register('email')} type="email" placeholder="faculty@institution.edu" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
          </div>
          {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label className="text-gray-300">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
            <Button variant="ghost" size="icon" type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-white">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
        </div>

        {/* Faculty-specific Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-gray-300">Faculty ID <span className="text-gray-500">(Optional)</span></Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input {...register('facultyId')} placeholder="FAC001" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300">Designation <span className="text-gray-500">(Optional)</span></Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input {...register('designation')} placeholder="Assistant Professor" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-gray-300">Department <span className="text-gray-500">(Optional)</span></Label>
            <Select onValueChange={(val) => setValue('departmentId', val)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e2e] border-white/10 text-white">
                {departments.map((d: any) => (
                  <SelectItem key={d.id} value={d.id}>{d.name} ({d.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300">Phone <span className="text-gray-500">(Optional)</span></Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input {...register('phone')} placeholder="+91 9876543210" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0 mt-2"
          size="lg"
          isLoading={isPending}
          loadingText="Creating Account..."
        >
          Create Faculty Account
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
