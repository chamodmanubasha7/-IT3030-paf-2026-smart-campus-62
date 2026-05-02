import React, { useState, useEffect, useCallback } from 'react';
import { ResourceTypes, ResourceStatuses, formatResourceTypeLabel, getResourceCapacity } from '../types/resource';
import { getResources, deleteResource, getDashboardStats } from '../api/resourceApi';
import { ResourceForm } from './ResourceForm';
import { 
  Plus, Edit2, Trash2, MapPin, Users, Activity, RefreshCw, 
  Layers, PieChart, CheckCircle, AlertCircle, FileDown, 
  Search, MoreVertical, Building2, LayoutGrid, List,
  Filter, Calendar, ExternalLink, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ADMIN_ROLES } from '../constants/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, outOfService: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Filters & Search
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [size] = useState(12);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(undefined);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = ADMIN_ROLES.includes(user?.role);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getResources({
        page,
        size,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        minCapacity: capacityFilter || undefined,
        name: searchFilter || undefined
      });
      setResources(data.content || []);
      setTotalPages(data.totalPages || 0);
      if (isAdmin) fetchStats();
    } catch (err) {
      console.error('Error fetching resources:', err);
      toast.error('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  }, [page, size, typeFilter, statusFilter, capacityFilter, searchFilter, isAdmin]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResources();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchResources]);

  const handleDelete = async () => {
    if (!resourceToDelete) return;
    try {
      await deleteResource(resourceToDelete);
      toast.success('Resource deleted successfully.');
      setIsDeleteModalOpen(false);
      fetchResources();
    } catch (err) {
      toast.error('Failed to delete resource.');
    }
  };

  const confirmDelete = (id) => {
    setResourceToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingResource(undefined);
    setIsFormOpen(true);
  };

  const handleViewDetails = (id) => {
    if (id) navigate(`/resources/${id}`);
  };

  const exportToCSV = () => {
    if (resources.length === 0) {
      toast.error('No data to export.');
      return;
    }
    
    const headers = ['ID', 'Name', 'Type', 'Capacity', 'Location', 'Status', 'Availability', 'Description'];
    const csvContent = [
      headers.join(','),
      ...resources.map(r => [
        r.id,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        r.type,
        getResourceCapacity(r),
        `"${(r.location || '').replace(/"/g, '""')}"`,
        r.status,
        r.available ? 'Yes' : 'No',
        `"${(r.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smart_campus_catalogue_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Catalogue exported successfully!');
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: "bg-teal-500/30 text-teal-400 border-teal-500/40",
      MAINTENANCE: "bg-amber-500/30 text-amber-400 border-amber-500/40",
      OUT_OF_SERVICE: "bg-rose-500/30 text-rose-400 border-rose-500/40",
    };
    return <Badge className={`${styles[status] || 'bg-slate-500/20'} border font-black px-3 py-1 text-[10px] uppercase tracking-widest`}>{status.replace('_', ' ')}</Badge>;
  };

  const getAvailabilityBadge = (res) => {
    if (res.status !== 'ACTIVE') return <Badge variant="outline" className="text-slate-500 opacity-50">Unavailable</Badge>;
    if (res.available) return <Badge variant="outline" className="text-teal-400 border-teal-400/30 bg-teal-400/5">Available</Badge>;
    return <Badge variant="outline" className="text-amber-400 border-amber-400/30 bg-amber-400/5">Booked</Badge>;
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 pb-24 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-teal-400 font-bold uppercase text-xs tracking-widest">
            <Building2 className="size-4" />
            <span>Resource Directory</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white leading-none">
            Campus <span className="text-teal-500">Catalogue</span>
          </h1>
          <p className="text-slate-400 max-w-lg text-sm font-medium">
            Browse and manage university facilities, study spaces, and technical equipment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900/50 p-1 rounded-xl border border-slate-800 flex items-center">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={`gap-2 ${viewMode === 'grid' ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'text-slate-400'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="size-4" />
              <span className="hidden sm:inline">Grid View</span>
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={`gap-2 ${viewMode === 'list' ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'text-slate-400'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="size-4" />
              <span className="hidden sm:inline">List View</span>
            </Button>
          </div>
          {isAdmin && (
            <Button onClick={handleCreate} className="bg-teal-600 hover:bg-teal-700 font-bold gap-2 rounded-xl shadow-lg shadow-teal-600/20">
              <Plus className="size-4" />
              Add Resource
            </Button>
          )}
        </div>
      </div>

      {/* Admin Stats Dashboard */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <PieChart className="size-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Total Assets</p>
                <p className="text-2xl font-black text-white">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                <CheckCircle className="size-6 text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Active & Ready</p>
                <p className="text-2xl font-black text-white">{stats.active}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <AlertCircle className="size-6 text-rose-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Out of Service</p>
                <p className="text-2xl font-black text-white">{stats.outOfService}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters Section */}
      <Card className="bg-slate-950/40 border-slate-900 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-1 lg:col-span-2 space-y-2 relative group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Quick Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-teal-500 transition-colors" />
                <Input 
                  placeholder="Filter by name..." 
                  className="pl-10 bg-slate-900/50 border-slate-800 h-11 focus:ring-teal-500"
                  value={searchFilter}
                  onChange={(e) => { setSearchFilter(e.target.value); setPage(0); }}
                />
              </div>
              
              {/* Search Suggestions */}
              {searchFilter.trim().length > 1 && resources.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2">
                  {resources
                    .filter(r => r.name.toLowerCase().includes(searchFilter.toLowerCase()))
                    .slice(0, 5)
                    .map((r, i) => (
                      <button 
                        key={i} 
                        className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between group/item"
                        onClick={() => { setSearchFilter(r.name); setPage(0); }}
                      >
                        <span className="font-medium">{r.name}</span>
                        <ChevronRight className="size-3.5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </button>
                    ))
                  }
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Resource Type</label>
              <select 
                className="w-full h-11 bg-slate-900/50 border border-slate-800 rounded-md px-3 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
              >
                <option value="">All Categories</option>
                {Object.values(ResourceTypes).map(t => (
                  <option key={t} value={t}>{formatResourceTypeLabel(t)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Current Status</label>
              <select 
                className="w-full h-11 bg-slate-900/50 border border-slate-800 rounded-md px-3 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              >
                <option value="">All Statuses</option>
                {Object.values(ResourceStatuses).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1 lg:col-span-1 flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 h-11 border-slate-800 bg-slate-900/30 text-slate-400 hover:text-white"
                onClick={() => { setTypeFilter(''); setStatusFilter(''); setCapacityFilter(''); setSearchFilter(''); setPage(0); }}
              >
                <RefreshCw className="size-4 mr-2" /> Reset
              </Button>
              {isAdmin && (
                <Button variant="outline" className="h-11 border-slate-800 bg-slate-900/30 text-slate-400" onClick={exportToCSV}>
                  <FileDown className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="size-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse text-sm tracking-wide">Syncing Catalogue Resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
          <div className="size-20 rounded-3xl bg-slate-900 flex items-center justify-center mb-6">
            <Search className="size-8 text-slate-700" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Resources Found</h3>
          <p className="text-slate-500 text-sm max-w-xs text-center leading-relaxed">
            We couldn't find any assets matching your filters. Try adjusting your search parameters.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resources.map((res) => (
            <Card 
              key={res.id} 
              className="group overflow-hidden bg-slate-900/30 border-slate-800/60 hover:border-teal-500/40 transition-all hover:shadow-2xl hover:shadow-teal-500/5 flex flex-col"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-950">
                <div className="absolute top-3 right-3 z-10">
                  {getStatusBadge(res.status)}
                </div>
                {res.imageUrl ? (
                  <img src={res.imageUrl} alt={res.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700">
                    <Building2 className="size-12 opacity-20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              </div>
              
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] font-bold py-0">{formatResourceTypeLabel(res.type)}</Badge>
                    <h3 className="font-bold text-lg text-white leading-tight line-clamp-1">{res.name}</h3>
                  </div>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 text-slate-500 hover:text-white">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                        <DropdownMenuItem onClick={() => handleEdit(res)} className="text-slate-300 focus:text-white focus:bg-slate-800 cursor-pointer">
                          <Edit2 className="size-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDelete(res.id)} className="text-rose-400 focus:text-rose-300 focus:bg-rose-500/10 cursor-pointer">
                          <Trash2 className="size-4 mr-2" /> Delete Asset
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin className="size-3.5 text-teal-500" />
                    <span>{res.location || 'Central Campus'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Users className="size-3.5 text-teal-500" />
                    <span>Up to {getResourceCapacity(res)} People</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between">
                  {getAvailabilityBadge(res)}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-teal-500 hover:text-teal-400 font-bold text-xs gap-1"
                    onClick={() => handleViewDetails(res.id)}
                  >
                    View Details <ExternalLink className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <Card className="bg-slate-900/20 border-slate-900 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-900/50">
              <TableRow className="hover:bg-transparent border-slate-800">
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Resource Info</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Category</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Availability</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase text-slate-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((res) => (
                <TableRow key={res.id} className="hover:bg-white/5 border-slate-900 group cursor-pointer" onClick={() => handleViewDetails(res.id)}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-lg bg-slate-950 flex-shrink-0 overflow-hidden border border-slate-800">
                        {res.imageUrl ? (
                          <img src={res.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-800">
                            <Building2 className="size-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{res.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="size-3" /> {res.location || 'Main Campus'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-[10px]">
                      {formatResourceTypeLabel(res.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(res.status)}
                  </TableCell>
                  <TableCell>
                    {getAvailabilityBadge(res)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                      {isAdmin && (
                        <>
                          <Button variant="ghost" size="icon" className="size-8 text-slate-500 hover:text-white" onClick={() => handleEdit(res)}>
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8 text-rose-500 hover:bg-rose-500/10" onClick={() => confirmDelete(res.id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="size-8 text-teal-500" onClick={() => handleViewDetails(res.id)}>
                        <ExternalLink className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-10">
          <Button 
            variant="outline" 
            className="border-slate-800 text-slate-400"
            disabled={page === 0} 
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <div className="text-sm font-bold text-slate-500">
            Page <span className="text-white">{page + 1}</span> of {totalPages}
          </div>
          <Button 
            variant="outline" 
            className="border-slate-800 text-slate-400"
            disabled={page >= totalPages - 1} 
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      {isFormOpen && (
        <ResourceForm 
          resource={editingResource} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={handleFormSuccess} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-slate-900 border-slate-800 shadow-2xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="size-20 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 mx-auto">
                <AlertCircle className="size-10 text-rose-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Delete Asset?</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Are you sure you want to permanently remove this resource? This action cannot be undone and will affect existing bookings.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12 border-slate-800 text-slate-300" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                <Button variant="destructive" className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 font-bold" onClick={handleDelete}>Confirm Delete</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
