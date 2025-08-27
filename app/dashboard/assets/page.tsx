'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSession } from '@/lib/auth-client';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Asset {
  id: number;
  name: string;
  description: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  depreciationRate: number;
  categoryId: number;
  category: {
    name: string;
  };
  maintenanceSchedule: string;
  insuranceInfo: string;
}

interface Category {
  id: number;
  name: string;
  type: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purchaseDate: format(new Date(), 'yyyy-MM-dd'),
    purchasePrice: '',
    currentValue: '',
    depreciationRate: '',
    categoryId: 0,
    maintenanceSchedule: '',
    insuranceInfo: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await fetch('/api/categories?type=asset');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }

      // Fetch assets
      const assetsResponse = await fetch('/api/assets');
      if (assetsResponse.ok) {
        const assetsData = await assetsResponse.json();
        setAssets(assetsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingAsset 
        ? `/api/assets/${editingAsset.id}` 
        : '/api/assets';
        
      const method = editingAsset ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          purchasePrice: parseFloat(formData.purchasePrice),
          currentValue: formData.currentValue ? parseFloat(formData.currentValue) : null,
          depreciationRate: formData.depreciationRate ? parseFloat(formData.depreciationRate) : null,
          categoryId: parseInt(formData.categoryId.toString()),
        }),
      });
      
      if (response.ok) {
        await fetchData();
        setIsDialogOpen(false);
        resetForm();
      } else {
        console.error('Failed to save asset');
      }
    } catch (error) {
      console.error('Error saving asset:', error);
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      description: asset.description,
      purchaseDate: asset.purchaseDate,
      purchasePrice: asset.purchasePrice.toString(),
      currentValue: asset.currentValue?.toString() || '',
      depreciationRate: asset.depreciationRate?.toString() || '',
      categoryId: asset.categoryId,
      maintenanceSchedule: asset.maintenanceSchedule || '',
      insuranceInfo: asset.insuranceInfo || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      try {
        const response = await fetch(`/api/assets/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchData();
        } else {
          console.error('Failed to delete asset');
        }
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingAsset(null);
    setFormData({
      name: '',
      description: '',
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      purchasePrice: '',
      currentValue: '',
      depreciationRate: '',
      categoryId: 0,
      maintenanceSchedule: '',
      insuranceInfo: '',
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assets</h1>
        <p className="text-muted-foreground">
          Manage your company assets
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Assets</CardTitle>
              <CardDescription>
                View and manage your company assets
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingAsset ? 'Edit Asset' : 'Add Asset'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAsset 
                      ? 'Edit your asset details' 
                      : 'Add a new company asset'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        className="col-span-3"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="description"
                        className="col-span-3"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="purchaseDate" className="text-right">
                        Purchase Date
                      </Label>
                      <Input
                        id="purchaseDate"
                        type="date"
                        className="col-span-3"
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="purchasePrice" className="text-right">
                        Purchase Price
                      </Label>
                      <Input
                        id="purchasePrice"
                        type="number"
                        step="0.01"
                        className="col-span-3"
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="currentValue" className="text-right">
                        Current Value
                      </Label>
                      <Input
                        id="currentValue"
                        type="number"
                        step="0.01"
                        className="col-span-3"
                        value={formData.currentValue}
                        onChange={(e) => setFormData({...formData, currentValue: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="depreciationRate" className="text-right">
                        Depreciation (%)
                      </Label>
                      <Input
                        id="depreciationRate"
                        type="number"
                        step="0.01"
                        className="col-span-3"
                        value={formData.depreciationRate}
                        onChange={(e) => setFormData({...formData, depreciationRate: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Category
                      </Label>
                      <Select
                        value={formData.categoryId.toString()}
                        onValueChange={(value) => setFormData({...formData, categoryId: parseInt(value)})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="maintenanceSchedule" className="text-right">
                        Maintenance
                      </Label>
                      <Input
                        id="maintenanceSchedule"
                        className="col-span-3"
                        value={formData.maintenanceSchedule}
                        onChange={(e) => setFormData({...formData, maintenanceSchedule: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="insuranceInfo" className="text-right">
                        Insurance
                      </Label>
                      <Input
                        id="insuranceInfo"
                        className="col-span-3"
                        value={formData.insuranceInfo}
                        onChange={(e) => setFormData({...formData, insuranceInfo: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingAsset ? 'Update Asset' : 'Add Asset'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {assets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead className="text-right">Purchase Price</TableHead>
                  <TableHead className="text-right">Current Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{asset.category.name}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(asset.purchaseDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">${asset.purchasePrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      ${asset.currentValue?.toLocaleString() || asset.purchasePrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(asset)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(asset.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No assets found</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add your first asset
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}