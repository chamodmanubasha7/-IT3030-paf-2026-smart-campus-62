import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { GraduationCap, Mail, Lock, User, Loader2, AlertCircle, ArrowRight, Phone, CalendarDays, BookOpen, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RegisterPage() {
  const { register, registerWithInvite } = useAuth();
  const navigate = useNavigate();
  const { token: inviteToken } = useParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState('');
  const [role, setRole] = useState('USER');
  const [adminPasscode, setAdminPasscode] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      if (inviteToken) {
        await registerWithInvite(inviteToken, name, email, password, contactNo, academicYear, semester);
      } else {
        await register(name, email, password, contactNo, academicYear, semester, role, adminPasscode);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side: Branding / Background */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-linear-to-br from-slate-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
        <div className="relative z-10 font-medium">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-indigo-500/20 rounded-xl backdrop-blur-md border border-indigo-500/30">
              <GraduationCap className="size-8 text-indigo-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Smart Campus</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Join the Next <br />
            <span className="text-indigo-400">Generation</span> of Learners
          </h1>
          <p className="text-lg text-slate-300 max-w-md leading-relaxed">
            Create your account today and get access to personlized learning tracks, expert mentorship, and a global student community.
          </p>
        </div>
        <div className="relative z-10 flex gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 max-w-sm">
          <div className="size-10 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center font-bold">JD</div>
          <div>
            <p className="text-sm font-semibold">"Best decision for my studies!"</p>
            <p className="text-xs text-slate-400">Romesh Gamadikari, Computer Science Major</p>
          </div>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <Card className="w-full max-w-md border-slate-200/60 dark:border-slate-800 shadow-2xl shadow-indigo-500/10">
          <CardHeader className="space-y-1">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30">
                <GraduationCap className="size-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {inviteToken ? 'Accept admin invite' : 'Create account'}
            </CardTitle>
            <CardDescription className="text-center text-slate-500">
              {inviteToken ? 'Complete signup to join as an invited admin' : 'Join the Smart Campus community today'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[65vh] overflow-y-auto px-6 custom-scrollbar">
            {error && (
              <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 py-3">
                <AlertCircle className="size-4" />
                <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 size-4 text-slate-500" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Romesh Gamadikari"
                    className="pl-10 placeholder:text-slate-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {!inviteToken && (
                <div className="space-y-2">
                  <Label htmlFor="role">Account Type <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 size-4 text-slate-500" />
                    <select
                      id="role"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-10 text-slate-700 dark:text-slate-300"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="USER">Student</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                </div>
              )}

              {role === 'SUPER_ADMIN' && !inviteToken && (
                <div className="space-y-2">
                  <Label htmlFor="adminPasscode">Super Admin Passcode <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 size-4 text-slate-500" />
                    <Input
                      id="adminPasscode"
                      type="password"
                      placeholder="Enter the master passcode"
                      className="pl-10 placeholder:text-slate-500"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      required={role === 'SUPER_ADMIN'}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 px-1">Required to verify elevated access rights</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 size-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="regnumber@my.sliit.lk"
                    className="pl-10 placeholder:text-slate-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 size-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 placeholder:text-slate-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 px-1">Must be at least 6 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 size-4 text-slate-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 placeholder:text-slate-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pt-4 pb-2">
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  <span className="flex-shrink-0 mx-4 text-xs font-medium text-slate-500">Optional Details</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNo" className="text-slate-600 dark:text-slate-400">Contact Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 size-4 text-slate-500" />
                  <Input
                    id="contactNo"
                    type="text"
                    placeholder="e.g. 0712345678"
                    className="pl-10 placeholder:text-slate-500"
                    value={contactNo}
                    onChange={(e) => setContactNo(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="academicYear" className="text-slate-600 dark:text-slate-400">Academic Year</Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-3 size-4 text-slate-500" />
                    <Input
                      id="academicYear"
                      type="text"
                      placeholder="e.g. Year 2"
                      className="pl-10 placeholder:text-slate-500"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="semester" className="text-slate-600 dark:text-slate-400">Semester</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-3 size-4 text-slate-500" />
                    <Input
                      id="semester"
                      type="text"
                      placeholder="e.g. Semester 1"
                      className="pl-10 placeholder:text-slate-500"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 mt-4 text-base font-semibold group transition-all active:scale-[0.98]" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Start Learning
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pt-2">
            <p className="text-center text-sm text-slate-500 w-full font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
