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
  
  // Extended Details
  const [studentId, setStudentId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [bio, setBio] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [socialLink, setSocialLink] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validations
    if (!name.trim()) { setError('Full name is required'); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address'); return; }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!contactNo.trim()) { setError('Contact number is required'); return; }
    if (!/^(?:\+94|0)?7[0-9]{8}$/.test(contactNo)) { setError('Invalid contact number (e.g. +94771234567)'); return; }
    
    if (role === 'USER') {
      if (!academicYear) { setError('Academic year is required'); return; }
      if (!semester) { setError('Semester is required'); return; }
      if (!studentId.trim()) { setError('Student ID is required'); return; }
      if (!/^[A-Z]{2}[0-9]{8}$/.test(studentId)) { setError('Invalid Student ID format (e.g. IT21004567)'); return; }
    }

    setLoading(true);
    try {
      if (inviteToken) {
        await registerWithInvite({ token: inviteToken, name, email, password, contactNo, academicYear, semester, studentId, companyId, department, designation, bio, officeLocation, emergencyContact, socialLink });
      } else {
        await register({ name, email, password, contactNo, academicYear, semester, role, adminPasscode, studentId, companyId, department, designation, bio, officeLocation, emergencyContact, socialLink });
      }
      navigate('/dashboard?section=settings');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side: Branding / Background */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-linear-to-br from-[#0f172a] via-[#0d9488] to-[#134e4a] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-cover bg-center scale-110" style={{ backgroundImage: "url('/campus_bg_new_1777603540244.png')" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-1.5 bg-white/10 rounded-xl backdrop-blur-xl border border-white/20 shadow-2xl">
              <img src="/hub_logo_new_1777603517713.png" alt="Logo" className="size-10 rounded-lg object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white/95">Smart Campus Operations Hub</span>
          </div>
          <h1 className="text-6xl font-black leading-tight mb-8 text-white tracking-tighter">
            Digital <br />
            <span className="text-[#5EEAD4]">Innovation.</span>
          </h1>
          <p className="text-xl text-[#CCFBF1] max-w-lg leading-relaxed font-medium opacity-90 border-l-4 border-[#0D9488] pl-6 py-2 bg-white/5 rounded-r-lg">
            Join the operational hub where administration meets automation. A centralized platform for the modern academic ecosystem.
          </p>
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="size-10 rounded-lg bg-[#0D9488]/30 flex items-center justify-center border border-[#0D9488]/50">
              <div className="size-2 rounded-full bg-[#5EEAD4] animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-white">Live Monitoring</p>
              <p className="text-xs text-[#99F6E4]">Real-time resource tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="size-10 rounded-lg bg-[#0D9488]/30 flex items-center justify-center border border-[#0D9488]/50">
              <div className="size-2 rounded-full bg-[#5EEAD4]" />
            </div>
            <div>
              <p className="font-bold text-white">Unified API</p>
              <p className="text-xs text-[#99F6E4]">Seamless system integration</p>
            </div>
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
              {inviteToken ? 'Complete signup to join as an invited admin' : 'Join the Smart Campus Operations Hub community today'}
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

              <div className="pt-2 pb-2 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-4">Mandatory Identity Details</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactNo">Contact Number <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 size-4 text-slate-500" />
                      <Input
                        id="contactNo"
                        type="text"
                        placeholder="e.g. 0712345678"
                        className="pl-10 placeholder:text-slate-500"
                        value={contactNo}
                        onChange={(e) => setContactNo(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="academicYear">Academic Year <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-3 size-4 text-slate-500" />
                        <Input
                          id="academicYear"
                          type="text"
                          placeholder="e.g. Year 2"
                          className="pl-10 placeholder:text-slate-500"
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-3 size-4 text-slate-500" />
                        <Input
                          id="semester"
                          type="text"
                          placeholder="e.g. Semester 1"
                          className="pl-10 placeholder:text-slate-500"
                          value={semester}
                          onChange={(e) => setSemester(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {role === 'USER' ? (
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID <span className="text-red-500">*</span></Label>
                      <Input
                        id="studentId"
                        type="text"
                        placeholder="ITXXXXXXXX"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="companyId">Staff / Company ID <span className="text-red-500">*</span></Label>
                      <Input
                        id="companyId"
                        type="text"
                        placeholder="STF-XXXX"
                        value={companyId}
                        onChange={(e) => setCompanyId(e.target.value)}
                        required
                      />
                    </div>
                  )}
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
