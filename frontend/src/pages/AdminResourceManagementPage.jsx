import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { createResource, getResources, updateResource, deleteResource, uploadResourceImage } from '@/api/resourceApi';
import { getAllBookings } from '@/api/bookingApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, Plus, X, Search, ChevronRight, 
  Building2, MapPin, Users, Settings2, Trash2, 
  Eye, EyeOff, LayoutGrid, ListChecks
} from 'lucide-react';
import { ResourceStatuses, ResourceTypes, formatResourceTypeLabel, getResourceCapacity } from '@/types/resource';
import { cn } from '@/lib/utils';

const EMPTY_FORM = {
  name: '',
  type: ResourceTypes.LAB,
  capacity: 1,
  location: '',
  status: ResourceStatuses.ACTIVE,
  imageUrl: '',
  description: '',
  downloadUrl: '',
  available: true,
};

const CAPACITY_COUNTABLE_STATUSES = new Set(['PENDING', 'APPROVED']);

const toMinutes = (timeValue = '00:00') => {
  const [hours = '0', minutes = '0'] = String(timeValue).split(':');
  return Number(hours) * 60 + Number(minutes);
};

const calculatePeakSeatDemandByResource = (bookings = []) => {
  const today = new Date().toISOString().slice(0, 10);
  const grouped = new Map();

  bookings
    .filter((booking) => CAPACITY_COUNTABLE_STATUSES.has(booking.status))
    .filter((booking) => booking.date >= today)
    .forEach((booking) => {
      const key = `${booking.resourceId}::${booking.date}`;
      const attendees = Number(booking.attendees || 0);
      if (attendees <= 0) return;
      const events = grouped.get(key) || [];
      events.push({ minute: toMinutes(booking.startTime), delta: attendees, type: 'start' });
      events.push({ minute: toMinutes(booking.endTime), delta: -attendees, type: 'end' });
      grouped.set(key, events);
    });

  const peakByResource = new Map();
  grouped.forEach((events, key) => {
    events.sort((a, b) => {
      if (a.minute !== b.minute) return a.minute - b.minute;
      if (a.type === b.type) return 0;
      return a.type === 'end' ? -1 : 1;
    });
    let active = 0;
    let peak = 0;
    events.forEach((event) => {
      active += event.delta;
      peak = Math.max(peak, active);
    });
    const [resourceId] = key.split('::');
    peakByResource.set(resourceId, Math.max(peakByResource.get(resourceId) || 0, peak));
  });

  return peakByResource;
};

export function AdminResourceManagementPage({ embedded = false }) {
  const [resources, setResources] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingResource, setEditingResource] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formSaving, setFormSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  const fetchResources = async (name = '') => {
    setLoading(true);
    try {
      const [response, bookings] = await Promise.all([
        getResources({
          page: 0,
          size: 500,
          name: name.trim() || undefined,
        }),
        getAllBookings().catch(() => []),
      ]);
      setResources(response?.content ?? []);
      setAllBookings(Array.isArray(bookings) ? bookings : []);
      setSelectedIds([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchResources(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const openEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name || '',
      type: resource.type || ResourceTypes.LAB,
      capacity: getResourceCapacity(resource) || 1,
      location: resource.location || '',
      status: resource.status || ResourceStatuses.ACTIVE,
      imageUrl: resource.imageUrl || '',
      description: resource.description || '',
      downloadUrl: resource.downloadUrl || '',
      available: Boolean(resource.available),
    });
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setEditingResource(null);
    setFormData(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingResource(null);
    setFormData(EMPTY_FORM);
  };

  const peakSeatDemandByResource = calculatePeakSeatDemandByResource(allBookings);
  const editingPeakDemand = editingResource?.id ? (peakSeatDemandByResource.get(editingResource.id) || 0) : 0;

  const saveResource = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) {
      toast.error('Name and location are required');
      return;
    }
    if (!Number.isInteger(formData.capacity) || formData.capacity < 1) {
      toast.error('Maximum capacity must be a whole number and at least 1');
      return;
    }
    if (editingResource?.id && formData.capacity < editingPeakDemand) {
      toast.error(
        `Cannot reduce capacity below current peak reserved seats (${editingPeakDemand}). ` +
        'Please resolve or adjust bookings first.'
      );
      return;
    }

    setFormSaving(true);
    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        location: formData.location.trim(),
      };
      if (editingResource?.id) {
        await updateResource(editingResource.id, payload);
        toast.success('Resource updated successfully');
      } else {
        await createResource(payload);
        toast.success('Resource created successfully');
      }
      closeForm();
      fetchResources(search);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save resource');
    } finally {
      setFormSaving(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setImageUploading(true);
    try {
      const response = await uploadResourceImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: response?.imageUrl || prev.imageUrl }));
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const toggleOffline = async (resource) => {
    const nextOffline = resource.status === 'ACTIVE';
    try {
      await updateResource(resource.id, {
        ...resource,
        status: nextOffline ? 'OUT_OF_SERVICE' : 'ACTIVE',
        available: !nextOffline,
      });
      toast.success(nextOffline ? 'Resource set to offline' : 'Resource set to active');
      fetchResources(search);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update resource status');
    }
  };

  const handleDelete = async (resource) => {
    const shouldDelete = window.confirm(`Delete "${resource.name}"? This cannot be undone.`);
    if (!shouldDelete) return;
    try {
      await deleteResource(resource.id);
      toast.success('Resource deleted successfully');
      fetchResources(search);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete resource');
    }
  };

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(resources.map((resource) => resource.id));
      return;
    }
    setSelectedIds([]);
  };

  const toggleSelectOne = (resourceId, checked) => {
    setSelectedIds((prev) => {
      if (checked) return [...prev, resourceId];
      return prev.filter((id) => id !== resourceId);
    });
  };

  const handleBulkAction = async (action) => {
    if (!selectedIds.length) {
      toast.error('Select at least one row first');
      return;
    }

    const selectedResources = resources.filter((resource) => selectedIds.includes(resource.id));
    if (!selectedResources.length) return;

    try {
      if (action === 'DELETE') {
        const confirmed = window.confirm(`Delete ${selectedResources.length} selected resource(s)? This cannot be undone.`);
        if (!confirmed) return;
        await Promise.all(selectedResources.map((resource) => deleteResource(resource.id)));
        toast.success(`${selectedResources.length} resource(s) deleted`);
      }

      if (action === 'SET_OFFLINE') {
        await Promise.all(
          selectedResources.map((resource) =>
            updateResource(resource.id, {
              ...resource,
              status: 'OUT_OF_SERVICE',
              available: false,
            })
          )
        );
        toast.success(`${selectedResources.length} resource(s) set offline`);
      }

      if (action === 'SET_ACTIVE') {
        await Promise.all(
          selectedResources.map((resource) =>
            updateResource(resource.id, {
              ...resource,
              status: 'ACTIVE',
              available: true,
            })
          )
        );
        toast.success(`${selectedResources.length} resource(s) set active`);
      }

      setBulkAction('');
      fetchResources(search);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Bulk action failed');
    }
  };

  const allSelected = resources.length > 0 && selectedIds.length === resources.length;
  const hasSelected = selectedIds.length > 0;

  const content = (
    <div className="space-y-8 pb-20">
      {/* Header & Controls Area */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/10 text-[10px] font-black uppercase tracking-widest text-blue-500">
            <LayoutGrid className="size-3" />
            Inventory Master
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Assets & Facilities</h2>
          <p className="text-sm font-medium text-muted-foreground">Managing {resources.length} operational campus resources.</p>
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <div className="relative group flex-1 min-w-[240px] max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="Filter by asset name..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-11 h-12 rounded-2xl border-border/50 bg-white dark:bg-slate-900 shadow-xl focus:ring-blue-500"
            />
          </div>
          <Button 
            className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95" 
            onClick={openCreate}
          >
            <Plus className="mr-2 size-5" /> Add Asset
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {hasSelected && (
        <div className="flex items-center gap-4 p-4 rounded-[2rem] bg-slate-900 text-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <span className="text-xs font-black uppercase tracking-widest ml-4">{selectedIds.length} Assets Selected</span>
          <div className="h-6 w-px bg-white/20 mx-2" />
          <div className="flex gap-2">
            <Button variant="ghost" className="h-9 px-4 text-xs font-bold hover:bg-white/10 text-emerald-400" onClick={() => handleBulkAction('SET_ACTIVE')}>Set Active</Button>
            <Button variant="ghost" className="h-9 px-4 text-xs font-bold hover:bg-white/10 text-amber-400" onClick={() => handleBulkAction('SET_OFFLINE')}>Go Offline</Button>
            <Button variant="ghost" className="h-9 px-4 text-xs font-bold hover:bg-rose-500/20 text-rose-400" onClick={() => handleBulkAction('DELETE')}>Purge Assets</Button>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto hover:bg-white/10" onClick={() => setSelectedIds([])}><X className="size-4" /></Button>
        </div>
      )}

      {/* Main Table Card */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center space-y-4">
              <div className="size-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Inventory Records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-border/50">
                    <th className="pl-8 py-6 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(event) => toggleSelectAll(event.target.checked)}
                        className="size-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identity & Name</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Geography</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payload</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visibility</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right pr-8">Authority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {resources.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-32 text-center text-muted-foreground font-medium italic">
                        No assets discovered within current filter parameters.
                      </td>
                    </tr>
                  ) : (
                    resources.map((resource) => (
                      <tr key={resource.id} className="group hover:bg-blue-500/5 transition-colors">
                        <td className="pl-8 py-5">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(resource.id)}
                            onChange={(event) => toggleSelectOne(resource.id, event.target.checked)}
                            className="size-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-inner group-hover:scale-105 transition-transform">
                              {resource.imageUrl ? (
                                <img src={resource.imageUrl} alt={resource.name} className="size-full object-cover" />
                              ) : (
                                <div className="size-full flex items-center justify-center text-slate-400">
                                  <Building2 className="size-6" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-slate-900 dark:text-slate-100 truncate">{resource.name}</p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">ID: {resource.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <Badge variant="outline" className="font-bold border-blue-500/20 text-blue-500 bg-blue-500/5 px-2.5 py-1 text-[10px] uppercase tracking-wider">
                            {formatResourceTypeLabel(resource.type)}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <MapPin className="size-3.5 text-rose-500" />
                          {resource.location}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 font-black">
                            <Users className="size-4 text-indigo-500" />
                            {getResourceCapacity(resource)} <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Seats</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <div className={cn("size-2 rounded-full", resource.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500')} />
                              <span className={cn("text-[10px] font-black uppercase tracking-widest", resource.status === 'ACTIVE' ? 'text-emerald-500' : 'text-rose-500')}>
                                {resource.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {resource.available ? <Eye className="size-3 text-blue-500" /> : <EyeOff className="size-3 text-slate-400" />}
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{resource.available ? 'Live' : 'Hidden'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right pr-8">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-blue-500/10">
                                <MoreVertical className="size-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-border/50">
                              <DropdownMenuItem onClick={() => openEdit(resource)} className="rounded-xl font-bold gap-3 cursor-pointer">
                                <Settings2 className="size-4 text-blue-500" /> Edit Configuration
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleOffline(resource)} className="rounded-xl font-bold gap-3 cursor-pointer">
                                {resource.status === 'ACTIVE' ? <EyeOff className="size-4 text-amber-500" /> : <Eye className="size-4 text-emerald-500" />}
                                {resource.status === 'ACTIVE' ? 'Set Offline' : 'Set Active'}
                              </DropdownMenuItem>
                              <div className="h-px bg-border/50 my-1 mx-1" />
                              <DropdownMenuItem onClick={() => handleDelete(resource)} className="rounded-xl font-bold gap-3 text-rose-500 focus:text-rose-500 cursor-pointer">
                                <Trash2 className="size-4" /> Purge Asset
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
          )}
        </CardContent>
      </Card>

      {/* Modern Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-3xl border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 scale-in-95 duration-300">
            <div className="p-8 border-b border-border/50 bg-muted/20 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-black">{editingResource ? 'Edit Asset Config' : 'Register New Asset'}</h3>
                <p className="text-sm font-medium text-muted-foreground">Adjust operational parameters for this resource.</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800" onClick={closeForm}>
                <X className="size-5" />
              </Button>
            </div>
            
            <CardContent className="p-8 pt-10 overflow-y-auto max-h-[70vh]">
              <form className="space-y-8" onSubmit={saveResource}>
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><ListChecks className="size-3" /> Official Resource Name</label>
                    <Input
                      value={formData.name}
                      onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="e.g. Advanced AI Research Laboratory"
                      className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border-border/50 font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category Tier</label>
                    <select
                      className="flex h-12 w-full rounded-2xl border border-border/50 bg-slate-50 dark:bg-slate-950 px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      value={formData.type}
                      onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value }))}
                    >
                      {Object.values(ResourceTypes).map((type) => (
                        <option key={type} value={type}>{formatResourceTypeLabel(type)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational Status</label>
                    <select
                      className="flex h-12 w-full rounded-2xl border border-border/50 bg-slate-50 dark:bg-slate-950 px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      value={formData.status}
                      onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}
                    >
                      {Object.values(ResourceStatuses).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Users className="size-3" /> Maximum Occupancy</label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.capacity}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          capacity: Math.max(1, Number.parseInt(event.target.value || '1', 10) || 1),
                        }))
                      }
                      className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border-border/50 font-bold"
                    />
                    {editingResource && (
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">
                        Reserved Peak: {editingPeakDemand} Seats
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><MapPin className="size-3" /> Geographical Location</label>
                    <Input
                      value={formData.location}
                      onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))}
                      placeholder="e.g. Block C, Level 4"
                      className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border-border/50 font-bold"
                    />
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visual Asset Management</label>
                       <Button type="button" variant="outline" disabled={imageUploading} size="sm" className="rounded-xl border-blue-500 text-blue-500 font-bold">
                        <label className="cursor-pointer flex items-center gap-2">
                          {imageUploading ? 'Uploading...' : <><Plus className="size-3" /> Direct Upload</>}
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      </Button>
                    </div>
                    <Input
                      value={formData.imageUrl}
                      onChange={(event) => setFormData((prev) => ({ ...prev, imageUrl: event.target.value }))}
                      placeholder="Cloudinary URL or external image link..."
                      className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border-border/50 font-medium"
                    />
                    {formData.imageUrl && (
                      <div className="relative group rounded-3xl overflow-hidden border border-border/50 shadow-2xl aspect-video">
                        <img src={formData.imageUrl} alt="Resource preview" className="size-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white text-[10px] font-black uppercase tracking-widest">Digital Twin Preview</div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational Notes</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-2xl border border-border/50 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      value={formData.description}
                      onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="Maintenance schedules, special access rules, etc..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                   <label className="flex items-center gap-3 cursor-pointer">
                    <div className={cn("size-6 rounded-lg border-2 flex items-center justify-center transition-all", formData.available ? "bg-blue-500 border-blue-500" : "bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700")}>
                      {formData.available && <X className="size-4 text-white rotate-45" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.available}
                      onChange={(event) => setFormData((prev) => ({ ...prev, available: event.target.checked }))}
                    />
                    <div className="space-y-0.5">
                      <p className="text-sm font-black text-slate-900 dark:text-slate-100">Visibility Status</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Public discovery & reservation access</p>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" className="h-12 px-8 rounded-2xl font-bold" onClick={closeForm} disabled={formSaving}>Discard Changes</Button>
                  <Button type="submit" className="h-12 px-10 rounded-2xl bg-blue-600 hover:bg-blue-500 font-black shadow-xl shadow-blue-500/20" disabled={formSaving}>
                    {formSaving ? 'Synchronizing...' : editingResource ? 'Commit Changes' : 'Register Asset'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  if (embedded) return content;
  return <div className="p-8 container">{content}</div>;
}
