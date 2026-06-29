import { useState, useMemo, FormEvent, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Grid, 
  List, 
  AlertTriangle, 
  Tag, 
  DollarSign, 
  Layers,
  Sparkles,
  X,
  PlusCircle,
  MinusCircle,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, StoreSettings } from '../types';

interface ProductManagementProps {
  products: Product[];
  settings: StoreSettings;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  initialSearchQuery?: string;
}

export default function ProductManagement({ 
  products, 
  settings, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct,
  initialSearchQuery = ''
}: ProductManagementProps) {
  
  // State variables
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'InStock' | 'LowStock' | 'OutOfStock'>('All');

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
    if (initialSearchQuery) {
      setSelectedCategory('All');
      setStockFilter('All');
    }
  }, [initialSearchQuery]);
  
  // Viewing modal state
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Editor form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form input fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(0);
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formImage, setFormImage] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState<'Active' | 'Draft'>('Active');
  const [formSku, setFormSku] = useState('');

  // 1. Get unique categories
  const categories = useMemo(() => {
    const cats = products.map(p => p.category);
    return ['All', ...Array.from(new Set(cats))];
  }, [products]);

  // 2. Filter & Search logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      
      let matchesStock = true;
      if (stockFilter === 'InStock') {
        matchesStock = p.stock > settings.lowStockThreshold;
      } else if (stockFilter === 'LowStock') {
        matchesStock = p.stock > 0 && p.stock <= settings.lowStockThreshold;
      } else if (stockFilter === 'OutOfStock') {
        matchesStock = p.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter, settings.lowStockThreshold]);

  // 3. Open editor for Add
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDescription('');
    setFormPrice(0);
    setFormStock(10);
    setFormCategory('Electronics');
    setFormImage('');
    setFormImages([]);
    setFormStatus('Active');
    // Generate a quick pseudo-SKU
    const rand = Math.floor(Math.random() * 9000) + 1000;
    setFormSku(`SKU-NEW-${rand}`);
    setIsFormOpen(true);
  };

  // 4. Open editor for Edit
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormDescription(p.description);
    setFormPrice(p.price);
    setFormStock(p.stock);
    setFormCategory(p.category);
    setFormImage(p.image);
    setFormImages(p.images || []);
    setFormStatus(p.status);
    setFormSku(p.sku);
    setIsFormOpen(true);
  };

  // 5. Save product action
  const handleSaveProduct = (e: FormEvent) => {
    e.preventDefault();
    
    // Quick validation
    if (!formName.trim() || !formSku.trim()) return;

    // Standard high-quality fallbacks for product image
    let imageUrl = formImage.trim();
    if (!imageUrl) {
      if (formCategory === 'Electronics') {
        imageUrl = 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=400';
      } else if (formCategory === 'Accessories') {
        imageUrl = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400';
      } else if (formCategory === 'Furniture') {
        imageUrl = 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=400';
      } else if (formCategory === 'Apparel') {
        imageUrl = 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400';
      } else {
        imageUrl = 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400';
      }
    }

    const payload = {
      name: formName,
      description: formDescription,
      price: Number(formPrice) || 0,
      stock: Number(formStock) || 0,
      category: formCategory,
      image: imageUrl,
      status: formStatus,
      sku: formSku.toUpperCase(),
      images: formImages.filter(img => img.trim() !== '')
    };

    if (editingProduct) {
      onEditProduct({
        ...editingProduct,
        ...payload
      });
    } else {
      onAddProduct(payload);
    }
    setIsFormOpen(false);
  };

  // 6. Inline product status change (Active vs Draft)
  const handleToggleStatus = (p: Product) => {
    onEditProduct({
      ...p,
      status: p.status === 'Active' ? 'Draft' : 'Active'
    });
  };

  const getProductImages = (p: Product): string[] => {
    if (p.images && p.images.length > 0) {
      // Filter out empty URL strings
      const valid = p.images.filter(img => img.trim() !== '');
      if (valid.length > 0) {
        return [p.image, ...valid];
      }
    }
    
    // Fallbacks based on category if there's only one main image
    const fallbacks: Record<string, string[]> = {
      Electronics: [
        'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'
      ],
      Accessories: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80'
      ],
      Furniture: [
        'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=600&auto=format&fit=crop&q=80'
      ],
      Lifestyle: [
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80'
      ],
      Apparel: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80'
      ]
    };
    
    const categoryFallback = fallbacks[p.category] || [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80'
    ];
    
    return [p.image, ...categoryFallback];
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD',
    }).format(val);
  };

  return (
    <div className="space-y-6" id="product-management-panel">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight" id="products-heading">
            Product Catalog
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Maintain and coordinate catalog inventories, pricing listings, and status visibility.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-indigo-600/10 cursor-pointer self-start sm:self-center"
          id="btn-add-product"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Catalog Search, Filters and View Toggle Controls */}
      <div className="bg-white border border-zinc-100 shadow-3xs rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, SKU, or specs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-zinc-800 border border-zinc-200 focus:border-indigo-500 rounded-xl focus:outline-none transition-all placeholder:text-zinc-400"
            id="product-search-input"
          />
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Tag className="w-3.5 h-3.5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1 px-2 border border-zinc-200 rounded-lg text-zinc-700 focus:outline-none focus:border-indigo-500 bg-white"
              id="select-category-filter"
            >
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <AlertTriangle className="w-3.5 h-3.5" />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="py-1 px-2 border border-zinc-200 rounded-lg text-zinc-700 focus:outline-none focus:border-indigo-500 bg-white"
              id="select-stock-filter"
            >
              <option value="All">All Stock Levels</option>
              <option value="InStock">In Stock</option>
              <option value="LowStock">Low Stock (≤{settings.lowStockThreshold})</option>
              <option value="OutOfStock">Out of Stock</option>
            </select>
          </div>

          {/* Divider */}
          <span className="h-4 w-px bg-zinc-200 hidden sm:inline" />

          {/* View Toggle */}
          <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200" id="view-mode-toggle">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded-md transition-all ${
                viewMode === 'table' ? 'bg-white text-zinc-800 shadow-2xs' : 'text-zinc-400 hover:text-zinc-700'
              }`}
              title="Table view"
              id="btn-view-table"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-md transition-all ${
                viewMode === 'grid' ? 'bg-white text-zinc-800 shadow-2xs' : 'text-zinc-400 hover:text-zinc-700'
              }`}
              title="Grid view"
              id="btn-view-grid"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main product display */}
      <div id="product-container">
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-zinc-100 rounded-2xl p-16 flex flex-col items-center text-center shadow-3xs">
            <Sparkles className="w-12 h-12 text-zinc-300 mb-3" />
            <p className="text-zinc-800 font-bold text-lg">No Products Found</p>
            <p className="text-zinc-400 text-sm max-w-sm mt-1">
              Your filters and searches did not return any matches. Try relaxing parameters or add a new product.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const isLowStock = p.stock > 0 && p.stock <= settings.lowStockThreshold;
              const isOutOfStock = p.stock === 0;

              return (
                <motion.div
                  layout
                  key={p.id}
                  className="bg-white border border-zinc-150 hover:border-zinc-300 rounded-2xl overflow-hidden flex flex-col group transition-all duration-200 shadow-3xs"
                  id={`product-card-${p.id}`}
                >
                  <div 
                    className="relative aspect-video bg-zinc-50 overflow-hidden shrink-0 border-b border-zinc-100 cursor-pointer"
                    onClick={() => {
                      setViewingProduct(p);
                      setActiveImageIndex(0);
                    }}
                    title="Click to view details & gallery"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold bg-zinc-900/80 text-white backdrop-blur-xs px-2 py-0.5 rounded-md font-mono tracking-wide">
                      {p.sku}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(p);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 bg-white/95 text-zinc-800 rounded-full shadow-md hover:bg-zinc-100 hover:text-indigo-600 transition-colors cursor-pointer"
                      title={p.status === 'Active' ? 'Set as Draft' : 'Set as Active'}
                    >
                      {p.status === 'Active' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-400" />}
                    </button>
                  </div>

                  <div 
                    className="p-4 flex-1 flex flex-col justify-between cursor-pointer"
                    onClick={() => {
                      setViewingProduct(p);
                      setActiveImageIndex(0);
                    }}
                    title="Click to view details & gallery"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                          {p.category}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                          p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-zinc-900 text-sm mt-2.5 line-clamp-1 leading-snug group-hover:text-indigo-600 transition-colors" title={p.name}>
                        {p.name}
                      </h4>
                      <p className="text-zinc-500 text-xs mt-1 line-clamp-2 min-h-[2rem]">
                        {p.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-900">
                          {formatCurrency(p.price)}
                        </span>
                        <span className={`text-[11px] font-bold ${
                          isOutOfStock ? 'text-rose-600' :
                          isLowStock ? 'text-amber-600' :
                          'text-zinc-600'
                        }`}>
                          {isOutOfStock ? 'Out of stock' : `${p.stock} in stock`}
                        </span>
                      </div>

                      {/* Card hover buttons */}
                      <div className="flex items-center gap-2 mt-3 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(p);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          id={`btn-edit-grid-${p.id}`}
                        >
                          <Edit className="w-3 h-3" />
                          Modify
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProduct(p.id);
                          }}
                          className="p-1.5 border border-rose-100 hover:border-rose-200 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete product"
                          id={`btn-delete-grid-${p.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Table View Layout */
          <div className="bg-white border border-zinc-150 rounded-2xl overflow-hidden shadow-3xs overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm" id="product-table">
              <thead>
                <tr className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-100 select-none">
                  <th className="px-5 py-4 text-xs uppercase tracking-wider">Product Info</th>
                  <th className="px-5 py-4 text-xs uppercase tracking-wider">SKU</th>
                  <th className="px-5 py-4 text-xs uppercase tracking-wider">Category</th>
                  <th className="px-5 py-4 text-xs uppercase tracking-wider">Unit Price</th>
                  <th className="px-5 py-4 text-xs uppercase tracking-wider">Stock Status</th>
                  <th className="px-5 py-4 text-xs uppercase tracking-wider">Visibility</th>
                  <th className="px-5 py-4 text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {filteredProducts.map((p) => {
                  const isLowStock = p.stock > 0 && p.stock <= settings.lowStockThreshold;
                  const isOutOfStock = p.stock === 0;

                  return (
                    <tr 
                      key={p.id} 
                      className="hover:bg-zinc-50/50 transition-colors group"
                      id={`product-row-${p.id}`}
                    >
                      <td 
                        className="px-5 py-3.5 max-w-[280px] cursor-pointer group/cell"
                        onClick={() => {
                          setViewingProduct(p);
                          setActiveImageIndex(0);
                        }}
                        title="Click to view details & image gallery"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-lg border border-zinc-200 shrink-0 shadow-2xs group-hover/cell:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div className="truncate">
                            <p className="font-bold text-zinc-900 text-xs truncate group-hover/cell:text-indigo-600 transition-colors" title={p.name}>{p.name}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5 truncate" title={p.description}>
                              {p.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-zinc-800 tracking-wider">
                        {p.sku}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-zinc-950 font-mono">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            isOutOfStock ? 'bg-rose-500' :
                            isLowStock ? 'bg-amber-500' :
                            'bg-emerald-500'
                          }`} />
                          <span className={`text-xs font-medium ${
                            isOutOfStock ? 'text-rose-700 font-bold' :
                            isLowStock ? 'text-amber-700 font-bold' :
                            'text-zinc-600'
                          }`}>
                            {isOutOfStock ? 'Out of stock' : `${p.stock} units`}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                            p.status === 'Active' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' 
                              : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-150'
                          }`}
                          title="Click to toggle visibility status"
                        >
                          {p.status === 'Active' ? 'Active' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setViewingProduct(p);
                              setActiveImageIndex(0);
                            }}
                            className="p-1.5 text-zinc-500 hover:text-indigo-600 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
                            title="View image gallery & specs"
                            id={`btn-view-gallery-${p.id}`}
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-zinc-500 hover:text-indigo-600 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
                            title="Edit Product"
                            id={`btn-edit-${p.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Product"
                            id={`btn-delete-${p.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal Overlay for Add/Edit */}
      <AnimatePresence>
        {isFormOpen && (
          <div 
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            id="editor-overlay"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-zinc-150 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden"
              id="product-form-container"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <h3 className="font-bold text-zinc-900 text-base" id="modal-title">
                  {editingProduct ? 'Modify Product Specifications' : 'Add New Product to Catalog'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-200/50 transition-all cursor-pointer"
                  id="btn-close-modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ergonomic Office Desk"
                    className="w-full px-3 py-2 text-sm border border-zinc-200 focus:border-indigo-500 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none transition-all text-zinc-800"
                    id="input-product-name"
                  />
                </div>

                {/* SKU and Category Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">SKU / Code *</label>
                    <input
                      type="text"
                      required
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      placeholder="e.g. DSK-ERGO-02"
                      className="w-full px-3 py-2 text-sm border border-zinc-200 focus:border-indigo-500 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none transition-all font-mono tracking-wider text-zinc-800"
                      id="input-product-sku"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 focus:border-indigo-500 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none transition-all text-zinc-800"
                      id="input-product-category"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Lifestyle">Lifestyle</option>
                      <option value="Apparel">Apparel</option>
                    </select>
                  </div>
                </div>

                {/* Price and Stock Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Retail Price ({settings.currency}) *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 font-semibold text-xs pointer-events-none">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formPrice}
                        onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2 text-sm border border-zinc-200 focus:border-indigo-500 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none transition-all font-mono text-zinc-800"
                        id="input-product-price"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Initial Stock *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(parseInt(e.target.value, 10) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-zinc-200 focus:border-indigo-500 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none transition-all font-mono text-zinc-800"
                      id="input-product-stock"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Image URL (Optional)</label>
                  <input
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo..."
                    className="w-full px-3 py-2 text-sm border border-zinc-200 focus:border-indigo-500 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none transition-all text-zinc-800"
                    id="input-product-image"
                  />
                  <p className="text-[10px] text-zinc-400 mt-0.5">Leave blank to use a category-themed placeholder visual automatically.</p>
                </div>

                {/* Additional Gallery Images */}
                <div className="space-y-2 border-t border-zinc-100 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                      Additional Gallery Images
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormImages([...formImages, ''])}
                      className="text-[10px] text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3 h-3" />
                      Add URL
                    </button>
                  </div>
                  {formImages.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const newImgs = [...formImages];
                          newImgs[index] = e.target.value;
                          setFormImages(newImgs);
                        }}
                        placeholder="https://images.unsplash.com/photo..."
                        className="flex-1 px-3 py-1.5 text-xs border border-zinc-200 focus:border-indigo-500 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none transition-all text-zinc-800"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImgs = formImages.filter((_, i) => i !== index);
                          setFormImages(newImgs);
                        }}
                        className="text-rose-500 hover:text-rose-600 p-1"
                      >
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formImages.length === 0 && (
                    <p className="text-[10px] text-zinc-400 italic">No additional gallery images specified. The viewer will auto-generate beautiful contextual images for the slideshow.</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Description</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide full description, dimensions, and specifications..."
                    className="w-full px-3 py-2 text-sm border border-zinc-200 focus:border-indigo-500 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none transition-all text-zinc-800"
                    id="input-product-desc"
                  />
                </div>

                {/* Visibility Status */}
                <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-150 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-800">Catalog Visibility</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Draft items will be hidden from customer sales views.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormStatus('Active')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        formStatus === 'Active' ? 'bg-indigo-600 text-white shadow-3xs' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStatus('Draft')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        formStatus === 'Draft' ? 'bg-indigo-600 text-white shadow-3xs' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                      }`}
                    >
                      Draft
                    </button>
                  </div>
                </div>

                {/* Form Footer Buttons */}
                <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-xl text-xs font-semibold hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs hover:shadow-indigo-600/10 cursor-pointer"
                    id="btn-save-product-submit"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {viewingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingProduct(null)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
              id="product-gallery-viewer"
            >
              {/* Close Button */}
              <button
                onClick={() => setViewingProduct(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 shadow-md transition-all cursor-pointer border border-zinc-100 dark:border-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left Side: Image Gallery Carousel */}
              <div className="w-full md:w-1/2 bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col justify-between border-r border-zinc-100 dark:border-zinc-850 min-h-[320px] md:min-h-[480px]">
                {/* Title inside viewer for smaller screens */}
                <div className="md:hidden mb-4">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {viewingProduct.category}
                  </span>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-xl mt-2">{viewingProduct.name}</h3>
                  <p className="font-mono text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{viewingProduct.sku}</p>
                </div>

                {/* Slideshow Display */}
                <div className="relative flex-1 flex items-center justify-center min-h-[220px]">
                  {/* Left arrow */}
                  {getProductImages(viewingProduct).length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const imgs = getProductImages(viewingProduct);
                        setActiveImageIndex((prev) => (prev === 0 ? imgs.length - 1 : prev - 1));
                      }}
                      className="absolute left-2 p-2 rounded-full bg-white/90 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-750 shadow-md transition-colors cursor-pointer z-10 border border-zinc-100 dark:border-zinc-700"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}

                  {/* Main Image */}
                  <div className="w-full h-full max-h-[300px] flex items-center justify-center overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-2 border border-zinc-100 dark:border-zinc-800 shadow-2xs">
                    <motion.img
                      key={activeImageIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      src={getProductImages(viewingProduct)[activeImageIndex]}
                      alt={`${viewingProduct.name} - slide ${activeImageIndex}`}
                      className="max-w-full max-h-full object-contain rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Right arrow */}
                  {getProductImages(viewingProduct).length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const imgs = getProductImages(viewingProduct);
                        setActiveImageIndex((prev) => (prev === imgs.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-2 p-2 rounded-full bg-white/90 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-750 shadow-md transition-colors cursor-pointer z-10 border border-zinc-100 dark:border-zinc-700"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  {/* Image Counter Badge */}
                  <span className="absolute bottom-4 right-4 text-[10px] font-bold bg-zinc-900/80 dark:bg-zinc-950/80 text-white backdrop-blur-xs px-2 py-0.5 rounded-md font-mono">
                    {activeImageIndex + 1} / {getProductImages(viewingProduct).length}
                  </span>
                </div>

                {/* Thumbnails Row */}
                {getProductImages(viewingProduct).length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto pt-4 justify-center max-w-full scrollbar-none">
                    {getProductImages(viewingProduct).map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white dark:bg-zinc-900 ${
                          idx === activeImageIndex 
                            ? 'border-indigo-600 dark:border-indigo-500 scale-105 shadow-3xs' 
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Specs & Info */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[480px] md:max-h-none bg-white dark:bg-zinc-900">
                <div className="space-y-5">
                  {/* Category, Status & Title (Desktop) */}
                  <div className="hidden md:block">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {viewingProduct.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                        viewingProduct.status === 'Active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {viewingProduct.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-2xl mt-3 leading-tight">{viewingProduct.name}</h3>
                    <p className="font-mono text-xs text-zinc-400 dark:text-zinc-500 mt-1">SKU: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{viewingProduct.sku}</span></p>
                  </div>

                  {/* Pricing and Stock Status section */}
                  <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                    <div>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">Unit Price</p>
                      <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1 font-mono">{formatCurrency(viewingProduct.price)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">Stock Status</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          viewingProduct.stock === 0 ? 'bg-rose-500 animate-pulse' :
                          viewingProduct.stock <= settings.lowStockThreshold ? 'bg-amber-500 animate-pulse' :
                          'bg-emerald-500'
                        }`} />
                        <span className={`text-sm font-bold ${
                          viewingProduct.stock === 0 ? 'text-rose-600 dark:text-rose-400' :
                          viewingProduct.stock <= settings.lowStockThreshold ? 'text-amber-600 dark:text-amber-400' :
                          'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {viewingProduct.stock === 0 ? 'Out of Stock' : `${viewingProduct.stock} Units`}
                        </span>
                      </div>
                      {viewingProduct.stock > 0 && viewingProduct.stock <= settings.lowStockThreshold && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">Below trigger ({settings.lowStockThreshold})</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Specifications & Info</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-350 leading-relaxed whitespace-pre-line">
                      {viewingProduct.description || "No full specifications or description has been provided for this product catalog item yet. Update the specs using the modify button below."}
                    </p>
                  </div>
                </div>

                {/* Footer specs / Quick Edit button */}
                <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                    ID: {viewingProduct.id.slice(0, 8)}...
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setViewingProduct(null);
                        handleOpenEdit(viewingProduct);
                      }}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 border border-transparent dark:border-zinc-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Modify Specs
                    </button>
                    <button
                      onClick={() => setViewingProduct(null)}
                      className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
