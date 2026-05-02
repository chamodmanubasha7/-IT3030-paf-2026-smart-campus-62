import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, Building2, Copy, LifeBuoy, MoreHorizontal, ShieldCheck, 
  BarChart3, Trash2, Settings as SettingsIcon, User as UserIcon, 
  Palette, Sun, Moon, Monitor, Search, Sparkles, ChevronRight, XCircle,
  AlertCircle
} from 'lucide-react';
import { ADMIN_ROLES } from '@/constants/roles';
import { MyBookingsPage } from '@/pages/MyBookingsPage';
import { AdminBookingPage } from '@/pages/AdminBookingPage';
import { AdminResourceManagementPage } from '@/pages/AdminResourceManagementPage';

const ROLE_OPTIONS = ['USER', 'ADMIN', 'TECHNICIAN', 'SUPER_ADMIN'];

export default function DashboardPage() {
  const { user, logout, updateProfile, uploadProfileImage } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = user?.role ?? 'USER';
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdminLike = ADMIN_ROLES.includes(role);

  const [activePage, setActivePage] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [suggestions, setSuggestions] = useState([]);
  const [settingsTab, setSettingsTab] = useState('profile');

  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  const [invites, setInvites] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [copiedInviteId, setCopiedInviteId] = useState(null);
  const [profileForm, setProfileForm] = useState({ 
    name: '', 
    email: '', 
    profileImageUrl: '',
    contactNo: '',
    academicYear: '',
    semester: '',
    studentId: '',
    companyId: '',
    department: '',
    designation: '',
    bio: '',
    officeLocation: '',
    emergencyContact: '',
    socialLink: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const profileImageInputRef = useRef(null);
  const [cropSourceImage, setCropSourceImage] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Suggestions logic for user management
  useEffect(() => {
    if (search.trim().length > 1 && users.length > 0) {
      const query = search.toLowerCase();
      const filtered = users
        .filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
        .map(u => u.name)
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [search, users]);

  useEffect(() => {
    if (!isSuperAdmin) {
      const allowedForCoreRoles = isAdminLike
        ? ['dashboard', 'bookings', 'resource-management', 'manage-bookings', 'settings']
        : ['dashboard', 'bookings', 'settings'];
      if (!allowedForCoreRoles.includes(activePage)) {
        setActivePage('dashboard');
      }
      return;
    }
    if (!['dashboard', 'bookings', 'resource-management', 'manage-bookings', 'user-management', 'admin-management', 'super-admin-management', 'admin-invites', 'settings'].includes(activePage)) {
      setActivePage('dashboard');
    }
  }, [activePage, isSuperAdmin, isAdminLike]);

  useEffect(() => {
    const section = searchParams.get('section');
    if (!section) return;

    const allowed = isSuperAdmin
      ? ['dashboard', 'resource-management', 'user-management', 'admin-management', 'super-admin-management', 'admin-invites', 'settings']
      : isAdminLike
        ? ['dashboard', 'bookings', 'resource-management', 'manage-bookings', 'settings']
        : ['dashboard', 'bookings', 'settings'];

    if (allowed.includes(section)) {
      setActivePage(section);
    }
  }, [isSuperAdmin, isAdminLike, searchParams]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    if (!['user-management', 'admin-management', 'super-admin-management'].includes(activePage)) return;
    fetchUsers();
  }, [isSuperAdmin, activePage, search, roleFilter, statusFilter]);

  useEffect(() => {
    if (!isSuperAdmin || activePage !== 'admin-invites') return;
    fetchInvites();
  }, [isSuperAdmin, activePage]);

  useEffect(() => {
    if (activePage !== 'settings') return;
    fetchProfile();
  }, [activePage]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    setProfileError('');
    try {
      const response = await api.get('/api/auth/me');
      setProfileForm({
        name: response?.data?.name || '',
        email: response?.data?.email || '',
        profileImageUrl: response?.data?.profileImageUrl || '',
        contactNo: response?.data?.contactNo || '',
        academicYear: response?.data?.academicYear || '',
        semester: response?.data?.semester || '',
        studentId: response?.data?.studentId || '',
        companyId: response?.data?.companyId || '',
        department: response?.data?.department || '',
        designation: response?.data?.designation || '',
        bio: response?.data?.bio || '',
        officeLocation: response?.data?.officeLocation || '',
        emergencyContact: response?.data?.emergencyContact || '',
        socialLink: response?.data?.socialLink || '',
      });
    } catch (err) {
      setProfileError(err?.response?.data?.message || 'Failed to load your profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    
    // Validations
    if (!profileForm.name.trim()) {
      setProfileError('Full legal name is required');
      toast.error('Name is required');
      return;
    }

    if (profileForm.contactNo && !/^(?:\+94|0)?7[0-9]{8}$/.test(profileForm.contactNo)) {
      setProfileError('Invalid contact number format (e.g. +94771234567)');
      toast.error('Invalid contact number');
      return;
    }

    if (user.role === 'USER' && profileForm.studentId && !/^[A-Z]{2}[0-9]{8}$/.test(profileForm.studentId)) {
      setProfileError('Invalid Student ID format (e.g. IT21004567)');
      return;
    }

    setProfileSaving(true);
    setProfileError('');
    try {
      await updateProfile(profileForm);
      toast.success('Profile updated successfully');
    } catch (err) {
      setProfileError(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleProfileImagePick = () => {
    profileImageInputRef.current?.click();
  };

  const handleProfileImageChange = async (event) => {
    const selected = event.target.files?.[0];
    event.target.value = '';
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    try {
      const imageUrl = URL.createObjectURL(selected);
      setCropSourceImage(imageUrl);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setCropModalOpen(true);
    } catch (err) {
      toast.error('Failed to load selected image');
    }
  };

  const handleCropComplete = (_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const closeCropModal = () => {
    if (cropSourceImage) {
      URL.revokeObjectURL(cropSourceImage);
    }
    setCropSourceImage(null);
    setCropModalOpen(false);
  };

  const handleCroppedUpload = async () => {
    if (!cropSourceImage || !croppedAreaPixels) {
      toast.error('Please adjust crop area before uploading');
      return;
    }

    setProfileUploading(true);
    try {
      // Helper functions defined inside component for simplicity or could be imported
      const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', (e) => reject(e));
        img.setAttribute('crossOrigin', 'anonymous');
        img.src = cropSourceImage;
      });

      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height);
      
      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.9));
      const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
      
      const session = await uploadProfileImage(file);
      setProfileForm((prev) => ({
        ...prev,
        profileImageUrl: session?.profileImageUrl || prev.profileImageUrl,
      }));
      toast.success('Profile image updated');
      closeCropModal();
    } catch (err) {
      toast.error('Failed to upload profile image');
    } finally {
      setProfileUploading(false);
    }
  };

  const updateDashboardSectionParam = (nextPage) => {
    const currentSection = searchParams.get('section');
    const nextSection = nextPage === 'settings' ? 'settings' : null;
    if (currentSection === nextSection) return;

    const nextParams = new URLSearchParams(searchParams);
    if (nextSection) {
      nextParams.set('section', nextSection);
    } else {
      nextParams.delete('section');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const fetchInvites = async () => {
    setInviteLoading(true);
    try {
      const response = await api.get('/api/admin/invites');
      setInvites(response.data ?? []);
    } catch (err) {
      toast.error('Failed to load invites');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCreateInvite = async (event) => {
    event.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    setInviteSubmitting(true);
    try {
      await api.post('/api/admin/invites', { email });
      setInviteEmail('');
      await fetchInvites();
      toast.success('Invite created');
    } catch (err) {
      toast.error('Failed to create invite');
    } finally {
      setInviteSubmitting(false);
    }
  };

  const copyInviteLink = async (id, url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedInviteId(id);
      setTimeout(() => setCopiedInviteId(null), 2000);
      toast.success('Link copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDeleteInvite = async (invite) => {
    if (!window.confirm(`Delete invite for ${invite.email}?`)) return;
    try {
      await api.delete(`/api/admin/invites/${invite.id}`);
      toast.success('Invite deleted');
      await fetchInvites();
    } catch (err) {
      toast.error('Failed to delete invite');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activePage === 'admin-management') params.role = 'ADMIN';
      if (activePage === 'super-admin-management') params.role = 'SUPER_ADMIN';
      if (activePage === 'user-management' && roleFilter !== 'ALL') params.role = roleFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const response = await api.get('/api/admin/users', { params });
      setUsers(response.data ?? []);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (key) => {
    if (key === 'dashboard') {
      updateDashboardSectionParam('dashboard');
      return setActivePage('dashboard');
    }
    if (key === 'catalogue') return navigate('/resources');
    if (key === 'my-bookings' || key === 'bookings') {
      updateDashboardSectionParam('bookings');
      return setActivePage('bookings');
    }
    if (key === 'resource-management') {
      updateDashboardSectionParam('resource-management');
      return setActivePage('resource-management');
    }
    if (key === 'tickets') return navigate(user?.role === 'USER' ? '/tickets/my' : '/tickets/manage');
    if (key === 'manage-bookings') {
      updateDashboardSectionParam('manage-bookings');
      return setActivePage('manage-bookings');
    }
    if (key === 'analytics') return navigate('/admin/analytics');
    updateDashboardSectionParam(key);
    setActivePage(key);
  };

  const openDashboardModule = (key) => {
    if (key === 'catalogue') return navigate('/resources');
    if (key === 'my-bookings') return setActivePage('bookings');
    if (key === 'tickets') return navigate(user?.role === 'USER' ? '/tickets/my' : '/tickets/manage');
    if (key === 'admin-bookings') return setActivePage('manage-bookings');
    if (key === 'resource-management') return setActivePage('resource-management');
    if (key === 'analytics') return navigate('/admin/analytics');
  };

  const handleBanToggle = async (target) => {
    try {
      await api.patch(`/api/admin/users/${target.id}/ban`, { banned: target.enabled });
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleRoleChange = async (target, newRole) => {
    try {
      await api.patch(`/api/admin/users/${target.id}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (target) => {
    if (!window.confirm(`Delete ${target.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/users/${target.id}`);
      fetchUsers();
      toast.success('User deleted');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const roleCounts = useMemo(
    () =>
      ROLE_OPTIONS.reduce((acc, current) => {
        acc[current] = users.filter((item) => item.role === current).length;
        return acc;
      }, {}),
    [users]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              {activePage === 'user-management' && 'User Directory'}
              {activePage === 'admin-management' && 'Admin Hub'}
              {activePage === 'super-admin-management' && 'System Authority'}
              {activePage === 'admin-invites' && 'Security Invitations'}
              {activePage === 'settings' && 'Global Settings'}
              {activePage === 'dashboard' && 'Operations Dashboard'}
              {activePage === 'bookings' && 'My Schedule'}
              {activePage === 'resource-management' && 'Asset Management'}
              {activePage === 'manage-bookings' && 'Booking Control'}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Smart Campus Operations Hub — Management Interface
            </p>
          </div>
        </div>

        {activePage === 'settings' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Navigation / Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-card border-border shadow-xl shadow-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <SettingsIcon className="size-5 text-primary" /> Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    <button 
                      onClick={() => setSettingsTab('profile')}
                      className={`w-full flex items-center gap-3 px-6 py-4 text-sm transition-all border-l-4 ${
                        settingsTab === 'profile' 
                          ? 'font-bold border-primary bg-primary/5 text-primary' 
                          : 'font-medium text-muted-foreground hover:bg-muted/50 border-transparent'
                      }`}
                    >
                      <UserIcon className="size-4" /> Account Profile
                    </button>
                    <button 
                      onClick={() => setSettingsTab('appearance')}
                      className={`w-full flex items-center gap-3 px-6 py-4 text-sm transition-all border-l-4 ${
                        settingsTab === 'appearance' 
                          ? 'font-bold border-primary bg-primary/5 text-primary' 
                          : 'font-medium text-muted-foreground hover:bg-muted/50 border-transparent'
                      }`}
                    >
                      <Palette className="size-4" /> Interface Appearance
                    </button>
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest mb-3">
                  <Sparkles className="size-3.5" /> Pro Tip
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Toggle between Light and Dark modes to optimize your workspace environment for day or night operations.
                </p>
              </div>
            </div>

            {/* Right Col: Forms */}
            <div className="lg:col-span-2 space-y-8">
              {settingsTab === 'profile' && (
                <Card className="bg-card border-border shadow-xl animate-in fade-in slide-in-from-right-4 duration-500">
                  <CardHeader className="border-b border-border/50 pb-6">
                    <CardTitle className="text-xl font-black">Personal Identity</CardTitle>
                    <CardDescription>Update your public-facing profile and contact information.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-8">
                    {profileLoading ? (
                      <div className="flex justify-center py-10"><div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
                    ) : (
                      <form className="space-y-8" onSubmit={handleProfileSubmit}>
                        {profileError && (
                          <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/20 text-rose-500">
                            <AlertCircle className="size-4" />
                            <AlertDescription className="font-bold">{profileError}</AlertDescription>
                          </Alert>
                        )}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                          <div className="relative group">
                            <Avatar className="size-28 border-4 border-primary/20 ring-4 ring-background">
                              <AvatarImage src={profileForm.profileImageUrl} alt={profileForm.name} />
                              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black">
                                {(profileForm.name || 'U').slice(0, 1).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <Button 
                              type="button" 
                              variant="secondary" 
                              size="icon" 
                              className="absolute -bottom-2 -right-2 size-8 rounded-full shadow-lg border border-border"
                              onClick={handleProfileImagePick}
                            >
                              <Copy className="size-3.5" />
                            </Button>
                          </div>
                          <div className="space-y-2 flex-1">
                            <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Profile Image</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                              Recommended: Square image, 400x400px. Maximum size 1MB. Our system will auto-optimize your upload.
                            </p>
                            <input ref={profileImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                          </div>
                        </div>

                        <Separator className="bg-border/50" />

                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="p-name" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Full Legal Name</Label>
                            <Input 
                              id="p-name" 
                              value={profileForm.name} 
                              onChange={e => setProfileForm(p => ({...p, name: e.target.value}))}
                              className="bg-muted/30 border-border focus:ring-primary h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="p-email" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Email Address</Label>
                            <Input 
                              id="p-email" 
                              value={profileForm.email} 
                              readOnly 
                              className="bg-muted/10 border-border/50 text-muted-foreground cursor-not-allowed h-11"
                            />
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {user.role === 'USER' && (
                            <div className="space-y-2">
                              <Label htmlFor="p-studentId" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Student ID</Label>
                              <Input 
                                id="p-studentId" 
                                value={profileForm.studentId} 
                                onChange={e => setProfileForm(p => ({...p, studentId: e.target.value}))}
                                className="bg-muted/30 border-border h-11"
                                placeholder="e.g. IT21004567"
                              />
                            </div>
                          )}
                          {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                            <div className="space-y-2">
                              <Label htmlFor="p-companyId" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Staff / Company ID</Label>
                              <Input 
                                id="p-companyId" 
                                value={profileForm.companyId} 
                                onChange={e => setProfileForm(p => ({...p, companyId: e.target.value}))}
                                className="bg-muted/30 border-border h-11"
                                placeholder="e.g. STF-8829"
                              />
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label htmlFor="p-contact" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Contact Number</Label>
                            <Input 
                              id="p-contact" 
                              value={profileForm.contactNo} 
                              onChange={e => setProfileForm(p => ({...p, contactNo: e.target.value}))}
                              className="bg-muted/30 border-border h-11"
                              placeholder="+94 77 123 4567"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="p-dept" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Department / Faculty</Label>
                            <Input 
                              id="p-dept" 
                              value={profileForm.department} 
                              onChange={e => setProfileForm(p => ({...p, department: e.target.value}))}
                              className="bg-muted/30 border-border h-11"
                              placeholder="e.g. Computing"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="p-desig" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Designation</Label>
                            <Input 
                              id="p-desig" 
                              value={profileForm.designation} 
                              onChange={e => setProfileForm(p => ({...p, designation: e.target.value}))}
                              className="bg-muted/30 border-border h-11"
                              placeholder="e.g. Senior Lecturer"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="p-office" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Office / Room Location</Label>
                            <Input 
                              id="p-office" 
                              value={profileForm.officeLocation} 
                              onChange={e => setProfileForm(p => ({...p, officeLocation: e.target.value}))}
                              className="bg-muted/30 border-border h-11"
                              placeholder="e.g. Block A, Room 302"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="p-emergency" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Emergency Contact</Label>
                            <Input 
                              id="p-emergency" 
                              value={profileForm.emergencyContact} 
                              onChange={e => setProfileForm(p => ({...p, emergencyContact: e.target.value}))}
                              className="bg-muted/30 border-border h-11"
                              placeholder="Contact person & number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="p-social" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Social Link / Portfolio</Label>
                            <Input 
                              id="p-social" 
                              value={profileForm.socialLink} 
                              onChange={e => setProfileForm(p => ({...p, socialLink: e.target.value}))}
                              className="bg-muted/30 border-border h-11"
                              placeholder="https://linkedin.com/in/..."
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="p-bio" className="text-xs font-black uppercase tracking-wider text-muted-foreground">Short Biography</Label>
                          <textarea 
                            id="p-bio" 
                            rows={3}
                            value={profileForm.bio} 
                            onChange={e => setProfileForm(p => ({...p, bio: e.target.value}))}
                            className="w-full rounded-md bg-muted/30 border border-border p-3 text-sm focus:ring-primary focus:outline-none"
                            placeholder="Tell us about yourself..."
                          />
                        </div>

                        <div className="flex justify-end pt-4">
                          <Button type="submit" className="bg-primary hover:bg-primary/90 font-bold px-8 h-11" disabled={profileSaving}>
                            {profileSaving ? 'Synchronizing...' : 'Update Profile'}
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Theme Settings Card */}
              {settingsTab === 'appearance' && (
                <Card className="bg-card border-border shadow-xl animate-in fade-in slide-in-from-right-4 duration-500">
                  <CardHeader className="border-b border-border/50 pb-6">
                    <CardTitle className="text-xl font-black">Interface Appearance</CardTitle>
                    <CardDescription>Customize how the Smart Campus Operations Hub looks on your device.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'light', label: 'Light Mode', icon: Sun, desc: 'Clean and bright' },
                        { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Optimized for night' },
                        { id: 'system', label: 'System Sync', icon: Monitor, desc: 'Matches your device' }
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setTheme(mode.id)}
                          className={`flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all group ${
                            theme === mode.id 
                              ? 'border-primary bg-primary/5 ring-4 ring-primary/10' 
                              : 'border-border bg-muted/20 hover:border-border/80'
                          }`}
                        >
                          <div className={`p-3 rounded-xl transition-all ${
                            theme === mode.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-background text-muted-foreground group-hover:scale-110'
                          }`}>
                            <mode.icon className="size-6" />
                          </div>
                          <div className="text-center">
                            <p className={`font-black text-sm ${theme === mode.id ? 'text-primary' : 'text-foreground'}`}>{mode.label}</p>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1">{mode.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : isSuperAdmin && ['user-management', 'admin-management', 'super-admin-management'].includes(activePage) ? (
          <div className="space-y-8">
            {activePage === 'user-management' && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {ROLE_OPTIONS.map((c) => (
                  <Card key={c} className="bg-card border-border shadow-lg hover:border-primary/30 transition-all">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-[10px] font-black uppercase tracking-widest">{c} VOLUME</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-3xl font-black text-foreground">{roleCounts[c] || 0}</CardTitle>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Card className="bg-card border-border shadow-2xl overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/20 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black">
                    {activePage === 'user-management' ? 'Directory Master' : activePage === 'admin-management' ? 'Administrative Tier' : 'Authority Control'}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium">Managing access privileges and security protocols.</CardDescription>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                    <Input 
                      placeholder="Search accounts..." 
                      className="pl-11 bg-white dark:bg-slate-900 border-border/50 h-12 rounded-2xl focus:ring-blue-500 shadow-xl"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                    {/* Suggestions UI */}
                    {suggestions.length > 0 && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2">
                        {suggestions.map((s, i) => (
                          <button 
                            key={i} 
                            className="w-full text-left px-4 py-3 text-sm hover:bg-muted flex items-center justify-between group"
                            onClick={() => { setSearch(s); setSuggestions([]); }}
                          >
                            <span className="font-medium text-foreground">{s}</span>
                            <ChevronRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto">
                    <select 
                      className="h-12 rounded-2xl border border-border bg-white dark:bg-slate-900 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground focus:ring-blue-500 outline-none transition-all shadow-xl"
                      value={roleFilter}
                      onChange={e => setRoleFilter(e.target.value)}
                    >
                      <option value="ALL">All Roles</option>
                      {ROLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select 
                      className="h-12 rounded-2xl border border-border bg-white dark:bg-slate-900 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground focus:ring-blue-500 outline-none transition-all shadow-xl"
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                    >
                      <option value="ALL">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="BANNED">Banned</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-muted/10 border-b border-border/50">
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User Entity</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Role</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {loading ? (
                        <tr><td colSpan={4} className="px-8 py-20 text-center text-muted-foreground font-medium italic">Synchronizing directory records...</td></tr>
                      ) : users.length === 0 ? (
                        <tr><td colSpan={4} className="px-8 py-20 text-center text-muted-foreground font-medium italic">No entities match current security filter.</td></tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.id} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <Avatar className="size-11 border border-border shadow-lg">
                              <AvatarImage src={u.profileImageUrl} />
                              <AvatarFallback className="bg-blue-500/10 text-blue-500 font-black text-xs">{(u.name || 'U').slice(0, 1)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                              <p className="font-black text-slate-900 dark:text-slate-100">{u.name}</p>
                              <p className="text-xs font-medium text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <Badge variant="outline" className="font-black border-blue-500/20 text-blue-500 bg-blue-500/5 px-3 py-1 text-[10px] uppercase tracking-widest">
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <div className={`size-2 rounded-full ${u.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${u.enabled ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {u.enabled ? 'Operational' : 'Suspended'}
                            </span>
                          </div>
                        </td>
                            <td className="px-8 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                                    <MoreHorizontal className="size-4 text-muted-foreground" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 border-border bg-popover">
                                  <DropdownMenuLabel className="text-xs font-black uppercase tracking-widest">Authority Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleBanToggle(u)} className="font-medium">
                                    {u.enabled ? 'Suspend Access' : 'Restore Access'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {ROLE_OPTIONS.map(o => (
                                    <DropdownMenuItem key={o} onClick={() => handleRoleChange(u, o)} className="text-xs font-bold">
                                      Promote to {o}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-rose-500 font-bold" onClick={() => handleDelete(u)}>
                                    Purge Record
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : activePage === 'bookings' ? (
          <MyBookingsPage embedded />
        ) : activePage === 'resource-management' ? (
          <AdminResourceManagementPage embedded />
        ) : activePage === 'manage-bookings' ? (
          <AdminBookingPage embedded />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              { key: 'catalogue', icon: Building2, title: 'Asset Catalogue', desc: 'Browse campus facilities and smart resources.' },
              { key: 'my-bookings', icon: BookOpen, title: 'My Schedule', desc: 'Track your pending and active reservations.' },
              { key: 'tickets', icon: LifeBuoy, title: 'Operational Tickets', desc: 'Report issues or request maintenance.' }
            ].map(m => (
              <Card key={m.key} className="cursor-pointer group hover:border-primary/50 transition-all bg-card border-border shadow-xl hover:shadow-primary/5" onClick={() => openDashboardModule(m.key)}>
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <div className="p-3 rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                    <m.icon className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-black group-hover:text-primary transition-colors">{m.title}</CardTitle>
                    <CardDescription className="text-sm font-medium">{m.desc}</CardDescription>
                  </div>
                </CardHeader>
                <CardFooter className="bg-muted/10 px-6 py-4 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">Enter Module</span>
                  <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {cropModalOpen && cropSourceImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl bg-background border-border shadow-2xl overflow-hidden scale-in-95 duration-300">
            <div className="border-b border-border p-6 flex items-center justify-between bg-muted/10">
              <div className="space-y-1">
                <h3 className="text-xl font-black">Refine Identity Portrait</h3>
                <p className="text-sm text-muted-foreground">Adjust the frame to your preference.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeCropModal}><XCircle className="size-5" /></Button>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="relative h-[400px] w-full overflow-hidden rounded-3xl bg-slate-950 border border-border shadow-inner">
                <Cropper
                  image={cropSourceImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={handleCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <Label htmlFor="zoom" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Optical Zoom</Label>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  id="zoom"
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={e => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </CardContent>
            <CardFooter className="p-8 border-t border-border bg-muted/10 flex justify-end gap-3">
              <Button variant="ghost" className="font-bold text-muted-foreground" onClick={closeCropModal} disabled={profileUploading}>Cancel</Button>
              <Button onClick={handleCroppedUpload} className="bg-primary hover:bg-primary/90 font-bold px-10 h-11" disabled={profileUploading}>
                {profileUploading ? 'Processing...' : 'Deploy Portrait'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
