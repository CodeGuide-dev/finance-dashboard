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

interface Investment {
  id: number;
  name: string;
  description: string;
  type: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  quantity: number;
  roi: number;
  categoryId: number;
  category: {
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
  type: string;
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    purchaseDate: format(new Date(), 'yyyy-MM-dd'),
    purchasePrice: '',
    currentValue: '',
    quantity: '',
    roi: '',
    categoryId: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await fetch('/api/categories?type=investment');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }

      // Fetch investments
      const investmentsResponse = await fetch('/api/investments');
      if (investmentsResponse.ok) {
        const investmentsData = await investmentsResponse.json();
        setInvestments(investmentsData);
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
      const url = editingInvestment 
        ? `/api/investments/${editingInvestment.id}` 
        : '/api/investments';
        
      const method = editingInvestment ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          purchasePrice: parseFloat(formData.purchasePrice),
          currentValue: formData.currentValue ? parseFloat(formData.currentValue) : null,
          quantity: formData.quantity ? parseFloat(formData.quantity) : null,
          roi: formData.roi ? parseFloat(formData.roi) : null,
          categoryId: parseInt(formData.categoryId.toString()),
        }),
      });
      
      if (response.ok) {
        await fetchData();
        setIsDialogOpen(false);
        resetForm();
      } else {
        console.error('Failed to save investment');
      }
    } catch (error) {
      console.error('Error saving investment:', error);
    }
  };

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setFormData({
      name: investment.name,
      description: investment.description,
      type: investment.type,
      purchaseDate: investment.purchaseDate,
      purchasePrice: investment.purchasePrice.toString(),
      currentValue: investment.currentValue?.toString() || '',
      quantity: investment.quantity?.toString() || '',
      roi: investment.roi?.toString() || '',
      categoryId: investment.categoryId,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this investment?')) {
      try {
        const response = await fetch(`/api/investments/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchData();
        } else {
          console.error('Failed to delete investment');
        }
      } catch (error) {
        console.error('Error deleting investment:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingInvestment(null);
    setFormData({
      name: '',
      description: '',
      type: '',
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      purchasePrice: '',
      currentValue: '',
      quantity: '',
      roi: '',
      categoryId: 0,
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
          <p className="mt-4 text-muted-foreground">Loading investments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Investments</h1>
        <p className="text-muted-foreground">
          Manage your investment portfolio
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Investments</CardTitle>
              <CardDescription>
                View and manage your investments
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Investment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingInvestment ? 'Edit Investment' : 'Add Investment'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingInvestment 
                      ? 'Edit your investment details' 
                      : 'Add a new investment to your portfolio'}
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
                      <Label htmlFor="type" className="text-right">
                        Type
                      </Label>
                      <Input
                        id="type"
                        className="col-span-3"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        required
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
                      <Label htmlFor="quantity" className="text-right">
                        Quantity
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.0001"
                        className="col-span-3"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="roi" className="text-right">
                        ROI (%)
                      </Label>
                      <Input
                        id="roi"
                        type="number"
                        step="0.01"
                        className="col-span-3"
                        value={formData.roi}
                        onChange={(e) => setFormData({...formData, roi: e.target.value})}
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
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingInvestment ? 'Update Investment' : 'Add Investment'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {investments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead className="text-right">Purchase Price</TableHead>
                  <TableHead className="text-right">Current Value</TableHead>
                  <TableHead className="text-right">ROI (%)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map((investment) => (
                  <TableRow key={investment.id}>
                    <TableCell className="font-medium">{investment.name}</TableCell>
                    <TableCell>{investment.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{investment.category.name}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(investment.purchaseDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">${investment.purchasePrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      ${investment.currentValue?.toLocaleString() || investment.purchasePrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={(investment.roi || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {(investment.roi || 0).toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(investment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(investment.id)}
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
              <p>No investments found</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add your first investment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}