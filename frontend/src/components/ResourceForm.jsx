import React, { useState, useEffect } from 'react';
import { ResourceStatuses, ResourceTypes, formatResourceTypeLabel, getResourceCapacity } from '../types/resource';
import { createResource, updateResource } from '../api/resourceApi';
import { X, Save, Building2, MapPin, Users, Activity, FileText, ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const ResourceForm = ({ resource, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: ResourceTypes.LAB,
    capacity: 10,
    location: '',
    status: ResourceStatuses.ACTIVE,
    imageUrl: '',
    description: '',
    downloadUrl: '',
    available: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (resource) {
      setFormData({
        ...resource,
        capacity: getResourceCapacity(resource)
      });
    }
  }, [resource]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Maximum capacity must be at least 1';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (resource?.id) {
        await updateResource(resource.id, formData);
        toast.success('Resource updated successfully!');
      } else {
        await createResource(formData);
        toast.success('Resource added successfully!');
      }
      onSuccess();
    } catch (err) {
      const apiMessage = err?.response?.data?.message || err?.response?.data?.error || '';
      toast.error(`Failed to save resource. ${apiMessage}`.trim());
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <Card className="max-w-2xl w-full bg-slate-900 border-slate-800 shadow-2xl animate-in zoom-in-95 duration-300">
        <CardHeader className="border-b border-slate-800/50 pb-6 relative">
          <div className="flex items-center gap-3 text-teal-400 font-bold uppercase text-[10px] tracking-widest mb-1">
            <Building2 className="size-3.5" />
            <span>Resource Management</span>
          </div>
          <CardTitle className="text-2xl font-black text-white">
            {resource ? 'Update Existing Asset' : 'Register New Asset'}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {resource ? 'Modify the details for this campus resource.' : 'Add a new facility or technical equipment to the catalogue.'}
          </CardDescription>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 text-slate-500 hover:text-white"
            onClick={onClose}
          >
            <X className="size-5" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Asset Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <Input
                    id="name"
                    name="name"
                    className="pl-10 bg-slate-950/50 border-slate-800 h-11"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Computing Lab 01"
                  />
                </div>
                {errors.name && <p className="text-rose-500 text-xs font-medium">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-slate-500">Resource Category</Label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 pointer-events-none" />
                    <select 
                      id="type"
                      name="type" 
                      className="w-full pl-10 h-11 bg-slate-950/50 border border-slate-800 rounded-md text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/50" 
                      value={formData.type} 
                      onChange={handleChange}
                    >
                      {Object.values(ResourceTypes).map(t => (
                        <option key={t} value={t}>{formatResourceTypeLabel(t)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-slate-500">Operational Status</Label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 pointer-events-none" />
                    <select 
                      id="status"
                      name="status" 
                      className="w-full pl-10 h-11 bg-slate-950/50 border border-slate-800 rounded-md text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/50" 
                      value={formData.status} 
                      onChange={handleChange}
                    >
                      {Object.values(ResourceStatuses).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-xs font-bold uppercase tracking-wider text-slate-500">Max Occupancy</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                    <Input
                      id="capacity"
                      type="number"
                      name="capacity"
                      className="pl-10 bg-slate-950/50 border-slate-800 h-11"
                      value={formData.capacity}
                      onChange={handleChange}
                      min={1}
                    />
                  </div>
                  {errors.capacity && <p className="text-rose-500 text-xs font-medium">{errors.capacity}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-slate-500">Campus Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                    <Input
                      id="location"
                      name="location"
                      className="pl-10 bg-slate-950/50 border-slate-800 h-11"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Building A, Floor 2"
                    />
                  </div>
                  {errors.location && <p className="text-rose-500 text-xs font-medium">{errors.location}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Public Availability</Label>
                <div 
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    formData.available 
                      ? 'bg-teal-500/5 border-teal-500/30 text-teal-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                  onClick={() => setFormData(p => ({ ...p, available: !p.available }))}
                >
                  <div className={`size-5 rounded border flex items-center justify-center transition-colors ${
                    formData.available ? 'bg-teal-500 border-teal-500' : 'bg-transparent border-slate-700'
                  }`}>
                    {formData.available && <X className="size-3 text-slate-900 stroke-[4px]" />}
                  </div>
                  <span className="text-sm font-bold">
                    {formData.available ? 'Publicly visible and open for booking' : 'Private asset (Hidden from student catalogue)'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-xs font-bold uppercase tracking-wider text-slate-500">Visual Identity (Image URL)</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    className="pl-10 bg-slate-950/50 border-slate-800 h-11"
                    value={formData.imageUrl || ''}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-500">Detailed Description</Label>
                <textarea
                  id="description"
                  name="description"
                  className="flex min-h-[100px] w-full rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Enter detailed technical specifications or facility rules..."
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-8 border-t border-slate-800/50 bg-slate-950/30 flex justify-end gap-3 rounded-b-2xl">
            <Button type="button" variant="ghost" className="text-slate-400 hover:text-white" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 font-bold gap-2 px-8 shadow-lg shadow-teal-600/20" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {resource ? 'Update Resource' : 'Register Resource'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
