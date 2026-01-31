import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Upload, X, FileSpreadsheet, Download } from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { useNavigate } from 'react-router-dom';
import { TableSkeleton } from '../../components/Skeleton';
import { API_URL } from '../../src/config';

const emptyProduct = {
    barcode: '',
    name: '',
    price: 0,
    originalPrice: 0, // السعر قبل
    image: 'https://placehold.co/400x400?text=Product',
    category: 'Food',
    subcategory: '',
    expiryDate: '',
    branchIds: [] as number[], // 🆕 Changed to array for multiple branches
    stockQuantity: 0,
    weight: '',
    rating: 0,
    reviews: 0,
    shelfLocation: '',
    brandId: undefined as string | undefined
};

// Will be loaded from API
const defaultCategories = ['بقالة', 'ألبان', 'مشروبات', 'سناكس', 'زيوت', 'منظفات', 'عناية شخصية', 'مخبوزات', 'مجمدات', 'خضروات', 'فواكه', 'لحوم', 'أخرى'];

const sampleProducts: Product[] = [
    { id: 'p1001', name: 'لبن كامل الدسم 1 لتر', category: 'ألبان', price: 65, rating: 4.7, reviews: 120, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop', weight: '1 لتر' },
    { id: 'p1002', name: 'أرز مصري ممتاز', category: 'بقالة', price: 42, rating: 4.8, reviews: 300, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop', weight: '1 كجم' },
];

const ProductsManager = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const ITEMS_PER_PAGE = 50;
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState(emptyProduct);
    
    // 🆕 Branch filter
    const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
    
    // 🆕 Branch-specific data (price, stock, etc. per branch)
    const [branchData, setBranchData] = useState<{[branchId: number]: {price: number, stockQuantity: number, originalPrice: number, isAvailable: boolean}}>({});
    
    // Dynamic data from API
    const [branches, setBranches] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<{ [key: string]: any[] }>({});
    
    // 🖼️ Frames state
    const [frames, setFrames] = useState<any[]>([]);
    const [selectedFrame, setSelectedFrame] = useState<string>('');
    const [frameEnabled, setFrameEnabled] = useState<boolean>(false);

    // Clean invalid brand selection when brand list changes
    useEffect(() => {
        if (!form.brandId || brands.length === 0) return;
        
        const exists = brands.find(b => String(b.id) === String(form.brandId));
        if (!exists) {
            setForm(prev => ({ ...prev, brandId: undefined }));
        }
    }, [brands, form.brandId]);

    useEffect(() => {
        loadProducts();
        loadBranches();
        loadCategories();
        loadBrands();
        loadFrames();
    }, []);

    // Reload products when branch filter changes
    useEffect(() => {
        setCurrentPage(1);
        loadProducts(1);
    }, [selectedBranchFilter]);

    useEffect(() => {
        loadProducts(currentPage);
    }, [currentPage]);

    const loadProducts = async (page = currentPage) => {
        setLoading(true);
        try {
            // Use the correct backend route: /products with includeAllBranches=true
            let url = `${API_URL}/products?includeAllBranches=true&limit=${ITEMS_PER_PAGE}&offset=${(page - 1) * ITEMS_PER_PAGE}`;
            if (selectedBranchFilter !== 'all') {
                url += `&branchId=${selectedBranchFilter}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            console.log('📦 Products loaded:', data);

            const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
            const total = Number.isFinite(Number(data?.total)) ? Number(data.total) : list.length;
            setTotalCount(total);

            const normalized = list.map((item: any) => ({
                id: item.id,
                name: item.name,
                category: item.category_id || item.category || '',
                price: Number(item.price) || 0,
                stock_quantity: Number(item.stock) || 0,
                barcode: item.barcode || '',
                subcategory: item.subcategory || '',
                image: '', // intentionally empty to avoid loading Base64 in list view
                weight: item.weight || '',
                rating: Number(item.rating) || 0,
                reviews: Number(item.reviews) || 0
            }));

            setProducts(normalized);
        } catch (error) {
            console.error('❌ Error loading products:', error);
            setProducts(sampleProducts);
            setTotalCount(sampleProducts.length);
        } finally {
            setLoading(false);
        }
    };

    const loadBranches = async () => {
        try {
            const response = await api.branches.getAll();
            console.log('📍 Branches loaded:', response);
            // Handle different response formats
            const branchData = response?.data || response || [];
            if (Array.isArray(branchData) && branchData.length > 0) {
                setBranches(branchData);
            } else {
                // Fallback to default branches
                setBranches([
                    { id: 1, name: 'الفرع الرئيسي', address: 'القاهرة' },
                    { id: 2, name: 'فرع المعادي', address: 'المعادي' },
                    { id: 3, name: 'فرع الإسكندرية', address: 'الإسكندرية' }
                ]);
            }
        } catch (error) {
            console.error('❌ Failed to load branches:', error);
            // Fallback to default branches
            setBranches([
                { id: 1, name: 'الفرع الرئيسي', address: 'القاهرة' },
                { id: 2, name: 'فرع المعادي', address: 'المعادي' },
                { id: 3, name: 'فرع الإسكندرية', address: 'الإسكندرية' }
            ]);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await api.categories.getAll();
            console.log('🗂️ Categories loaded:', response);
            // Handle different response formats
            const categoryData = response?.data || response || [];
            if (Array.isArray(categoryData) && categoryData.length > 0) {
                setCategories(categoryData);
                
                // Build subcategories map
                const subMap: { [key: string]: any[] } = {};
                categoryData.forEach((cat: any) => {
                    if (!cat.parent_id) {
                        // Main category - find its children
                        const children = categoryData.filter((c: any) => c.parent_id === cat.id);
                        subMap[cat.name] = children;
                        if (cat.name_ar) {
                            subMap[cat.name_ar] = children;
                        }
                    }
                });
                setSubcategories(subMap);
            } else {
                // Fallback to default
                setCategories(defaultCategories.map((name, idx) => ({ id: idx + 1, name, name_ar: name, parent_id: null })));
            }
        } catch (error) {
            console.error('❌ Failed to load categories:', error);
            // Fallback to default
            setCategories(defaultCategories.map((name, idx) => ({ id: idx + 1, name, name_ar: name, parent_id: null })));
        }
    };

    const loadBrands = async () => {
        try {
            const response = await api.brands.getAll();
            console.log('🏷️ Brands API response:', response);
            const brandData = response?.data || response || [];
            if (Array.isArray(brandData)) {
                const normalizedBrands = brandData.map((b: any) => ({
                    ...b,
                    id: String(b.id)
                }));
                console.log('✅ Loaded', normalizedBrands.length, 'brands:', normalizedBrands.map(b => ({ id: b.id, name: b.name_ar })));
                setBrands(normalizedBrands);
            } else {
                console.warn('⚠️ Brands data is not array:', brandData);
                setBrands([]);
            }
        } catch (error) {
            console.error('❌ Failed to load brands:', error);
            setBrands([]);
        }
    };

    const loadFrames = async () => {
        try {
            const response = await api.products.getFrames();
            console.log('🖼️ Frames loaded:', response);
            const framesData = response.data || [];
            setFrames(framesData);
        } catch (error) {
            console.error('Error loading frames:', error);
            setFrames([]);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.products.delete(id);
                loadProducts();
            } catch (err) {
                console.error("Failed to delete product", err);
                alert("Failed to delete product");
            }
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm(emptyProduct);
        setBranchData({}); // 🆕 Clear branch data
        setShowModal(true);
    };

    const openEdit = async (p: Product) => {
        let productToEdit: Product = p;
        try {
            const branchId = selectedBranchFilter !== 'all' ? Number(selectedBranchFilter) : undefined;
            const fullProduct = await api.products.getOne(String(p.id), branchId);
            if (fullProduct) {
                productToEdit = fullProduct as Product;
            }
        } catch (error) {
            console.warn('⚠️ Failed to load full product, using list data only', error);
        }

        setEditing(productToEdit);
        
        // Check if brand exists in available brands
        const productBrandId = (productToEdit as any).brand_id ?? (productToEdit as any).brandId;
        let validBrandId = productBrandId !== undefined && productBrandId !== null ? String(productBrandId) : undefined;
        
        if (validBrandId && brands.length > 0) {
            const brandExists = brands.find(b => String(b.id) === String(validBrandId));
            if (!brandExists) {
                console.warn('⚠️ Product has brand_id', productBrandId, 'but brand not found in list. Clearing it.');
                validBrandId = undefined;
            }
        }
        
        // 🖼️ Load frame data
        const productFrameUrl = (productToEdit as any).frame_overlay_url || '';
        const productFrameEnabled = (productToEdit as any).frame_enabled || false;
        setSelectedFrame(productFrameUrl);
        setFrameEnabled(productFrameEnabled);
        
        // 🆕 Load product data from all branches
        try {
            const response = await fetch(`${API_URL}/branch-products/all-branches?productId=${productToEdit.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const result = await response.json();
            
            console.log('📦 Branch data loaded:', result);
            
            const branchIdsList: number[] = [];
            const branchDataMap: {[branchId: number]: any} = {};
            
            if (result.data && result.data.length > 0) {
                const productData = result.data[0];
                productData.branches.forEach((branch: any) => {
                    if (branch.price && branch.price > 0) {
                        branchIdsList.push(branch.branch_id);
                        branchDataMap[branch.branch_id] = {
                            price: branch.price || 0,
                            stockQuantity: branch.stock_quantity || 0,
                            originalPrice: branch.discount_price || 0,
                            isAvailable: branch.is_available !== false
                        };
                    }
                });
            } else {
                // Fallback to single branch from product
                if ((productToEdit as any).branch_id) {
                    const branchId = (productToEdit as any).branch_id;
                    branchIdsList.push(branchId);
                    branchDataMap[branchId] = {
                        price: productToEdit.price || 0,
                        stockQuantity: (productToEdit as any).stock_quantity || 0,
                        originalPrice: (productToEdit as any).discount_price || (productToEdit as any).originalPrice || 0,
                        isAvailable: true
                    };
                }
            }
            
            setBranchData(branchDataMap);
            
            setForm({
                barcode: (productToEdit as any).barcode || '',
                name: productToEdit.name,
                price: productToEdit.price,
                originalPrice: (productToEdit as any).discount_price || (productToEdit as any).originalPrice || 0,
                image: (productToEdit as any).image,
                category: productToEdit.category,
                subcategory: (productToEdit as any).subcategory || '',
                expiryDate: (productToEdit as any).expiry_date || '',
                branchIds: branchIdsList,
                stockQuantity: (productToEdit as any).stock_quantity || 0,
                weight: productToEdit.weight,
                rating: productToEdit.rating,
                reviews: productToEdit.reviews,
                shelfLocation: (productToEdit as any).shelf_location || '',
                brandId: validBrandId
            });
        } catch (error) {
            console.error('❌ Error loading branch data:', error);
            // Fallback to single branch
            const branchIdsList = (productToEdit as any).branch_id ? [(productToEdit as any).branch_id] : [];
            setBranchData((productToEdit as any).branch_id ? {
                [(productToEdit as any).branch_id]: {
                    price: productToEdit.price || 0,
                    stockQuantity: (productToEdit as any).stock_quantity || 0,
                    originalPrice: (productToEdit as any).discount_price || (productToEdit as any).originalPrice || 0,
                    isAvailable: true
                }
            } : {});
            
            setForm({
                barcode: (productToEdit as any).barcode || '',
                name: productToEdit.name,
                price: productToEdit.price,
                originalPrice: (productToEdit as any).discount_price || (productToEdit as any).originalPrice || 0,
                image: (productToEdit as any).image,
                category: productToEdit.category,
                subcategory: (productToEdit as any).subcategory || '',
                expiryDate: (productToEdit as any).expiry_date || '',
                branchIds: branchIdsList,
                stockQuantity: (productToEdit as any).stock_quantity || 0,
                weight: productToEdit.weight,
                rating: productToEdit.rating,
                reviews: productToEdit.reviews,
                shelfLocation: (productToEdit as any).shelf_location || '',
                brandId: validBrandId
            });
        }
        
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!form.name || form.name.trim() === '') {
            alert('❌ يرجى إدخال اسم المنتج');
            return;
        }
        
        if (!form.price || form.price <= 0) {
            alert('❌ يرجى إدخال سعر صحيح للمنتج (يجب أن يكون أكبر من صفر)');
            return;
        }
        
        // 🆕 Validate branch selection
        if (!form.branchIds || form.branchIds.length === 0) {
            alert('❌ يرجى اختيار فرع واحد على الأقل');
            return;
        }
        
        // Validate brand_id ONLY if selected
        if (form.brandId) {
            const brandExists = brands.find(b => String(b.id) === String(form.brandId));
            if (!brandExists) {
                alert('❌ البراند المختار (ID: ' + form.brandId + ') غير موجود في النظام. يرجى اختيار براند آخر أو إلغاء الاختيار.');
                console.error('🚫 Brand validation failed:', {
                    selectedBrandId: form.brandId,
                    availableBrands: brands.map(b => ({ id: b.id, name: b.name_ar }))
                });
                return;
            }
            console.log('✅ Brand validation passed:', brandExists);
        } else {
            console.log('🏷️ No brand selected - saving without brand');
        }
        
        try {
            // Keep brandId as-is to support UUID/text IDs (don't coerce to number)
            const normalizedBrandId = form.brandId ? String(form.brandId) : null;
            
            // 🆕 Prepare branch-specific data
            const branchesData = form.branchIds.map(branchId => ({
                branchId,
                price: branchData[branchId]?.price || form.price,
                originalPrice: branchData[branchId]?.originalPrice || form.originalPrice,
                stockQuantity: branchData[branchId]?.stockQuantity || form.stockQuantity,
                isAvailable: branchData[branchId]?.isAvailable !== false
            }));
            
            const productData = {
                barcode: form.barcode,
                name: form.name,
                price: form.price,
                originalPrice: form.originalPrice,
                image: form.image,
                category: form.category,
                subcategory: form.subcategory,
                expiryDate: form.expiryDate,
                branchIds: form.branchIds,
                branchesData: branchesData, // 🆕 Send detailed branch data
                stockQuantity: form.stockQuantity,
                weight: form.weight,
                shelfLocation: form.shelfLocation,
                brandId: normalizedBrandId,  // 🏷️ إرسال brand_id كما هو (يدعم UUID)
                frame_overlay_url: frameEnabled && selectedFrame ? selectedFrame : null, // 🖼️ رابط الإطار
                frame_enabled: frameEnabled // 🖼️ تفعيل/إيقاف الإطار
            };
            
            console.log('📦 Saving product with data:', productData);
            
            if (editing) {
                const result = await api.products.update(editing.id, productData);
                if (result.error) {
                    throw new Error(result.error);
                }
                alert('✅ تم تعديل المنتج بنجاح في ' + form.branchIds.length + ' فرع');
            } else {
                const result = await api.products.create(productData);
                if (result.error) {
                    throw new Error(result.message || result.error);
                }
                alert('✅ تم إضافة المنتج بنجاح في ' + form.branchIds.length + ' فرع');
            }
            setShowModal(false);
            // Force reload products after save
            await loadProducts();
        } catch (err: any) {
            console.error('❌ Failed to save product:', err);
            console.error('❌ Error details:', {
                message: err.message,
                response: err.response,
                data: err.response?.data
            });
            
            let errorMessage = err.message || 'فشل حفظ المنتج';
            
            // Check for foreign key constraint error
            if (errorMessage.includes('foreign key constraint') || errorMessage.includes('brand_id_fkey')) {
                errorMessage = '❌ البراند المختار غير موجود. يرجى اختيار براند آخر أو إلغاء الاختيار.';
            }
            
            alert('❌ ' + errorMessage);
        }
    };

    const filteredProducts = products.filter(p =>
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

    const seedBranches = async () => {
        try {
            console.log('🚀 Seeding branches to:', `${API_URL}/branches/dev/seed`);
            const res = await fetch(`${API_URL}/branches/dev/seed`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!res.ok) {
                const text = await res.text();
                console.error('❌ Response not OK:', res.status, text);
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            
            const json = await res.json();
            console.log('✅ Branches seeded:', json);
            alert('تم إضافة الفروع بنجاح');
            loadBranches();
        } catch (e) {
            console.error('❌ Branch seed failed:', e);
            alert('فشل إضافة الفروع: ' + (e instanceof Error ? e.message : 'خطأ غير معروف'));
        }
    };

    const seedCategories = async () => {
        try {
            console.log('🚀 Seeding categories to:', `${API_URL}/categories/dev/seed`);
            const res = await fetch(`${API_URL}/categories/dev/seed`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!res.ok) {
                const text = await res.text();
                console.error('❌ Response not OK:', res.status, text);
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            
            const json = await res.json();
            console.log('✅ Categories seeded:', json);
            alert('تم إضافة التصنيفات بنجاح');
            loadCategories();
        } catch (e) {
            console.error('❌ Category seed failed:', e);
            alert('فشل إضافة التصنيفات: ' + (e instanceof Error ? e.message : 'خطأ غير معروف'));
        }
    };

    const fixPrices = async () => {
        if (!confirm('هل تريد إصلاح أسعار المنتجات التي بها مشاكل؟\n\nسيتم:\n1. إضافة المنتجات المفقودة من branch_products\n2. تحديث الأسعار التي تساوي صفر إلى 10 جنيه\n\nهل تريد المتابعة؟')) {
            return;
        }
        
        try {
            console.log('🔧 Fixing prices...');
            const res = await fetch(`${API_URL}/products/dev/fix-prices`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!res.ok) {
                const text = await res.text();
                console.error('❌ Response not OK:', res.status, text);
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            
            const json = await res.json();
            console.log('✅ Prices fixed:', json);
            alert(`✅ تم إصلاح الأسعار بنجاح!\n\n` +
                  `تمت إضافة ${json.fixed.addedToBranch} منتج للفروع\n` +
                  `تم تحديث ${json.fixed.updatedPrices} سعر`);
            loadProducts();
        } catch (e) {
            console.error('❌ Fix prices failed:', e);
            alert('فشل إصلاح الأسعار: ' + (e instanceof Error ? e.message : 'خطأ غير معروف'));
        }
    };

    // 🔥 Export all products to Excel with ALL details
    const exportAllToExcel = async () => {
        try {
            console.log('📄 Starting Excel export...');
            
            // Use products from state first, fallback to API
            let allProducts = products;
            
            // If filtered or no products loaded, fetch all
            if (selectedBranchFilter !== 'all' || allProducts.length === 0) {
                console.log('📡 Fetching all products from API...');
                const res = await fetch(`${API_URL}/products`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!res.ok) {
                    throw new Error(`فشل تحميل المنتجات: ${res.status}`);
                }
                
                const data = await res.json();
                allProducts = Array.isArray(data) ? data : (data.data || []);
            }
            
            console.log(`✅ Found ${allProducts.length} products to export`);
            
            if (allProducts.length === 0) {
                alert('⚠️ لا توجد منتجات للتصدير!');
                return;
            }

            console.log('🔄 Fetching branch details for each product...');
            
            // Fetch branch-products data for each product
            const productsWithFullDetails = await Promise.all(
                allProducts.map(async (product: any, index: number) => {
                    try {
                        const branchRes = await fetch(`${API_URL}/branch-products/product/${product.id}`, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });
                        
                        let branches: any[] = [];
                        
                        if (branchRes.ok) {
                            const branchData = await branchRes.json();
                            branches = Array.isArray(branchData) ? branchData : (branchData.data || []);
                        }
                        
                        if (index % 10 === 0) {
                            console.log(`📍 Progress: ${index + 1}/${allProducts.length} products`);
                        }

                        return {
                            // Basic Info
                            'ID': product.id,
                            'Barcode': product.barcode || '',
                            'Name': product.name || '',
                            'Name (EN)': product.name_en || '',
                            'Description': product.description || '',
                            'Description (EN)': product.description_en || '',
                            
                            // Category & Brand
                            'Category': product.category || '',
                            'Category (EN)': product.category_en || '',
                            'Subcategory': product.subcategory || '',
                            'Subcategory (EN)': product.subcategory_en || '',
                            'Brand ID': product.brand_id || '',
                            'Brand Name': product.brand_name || '',
                            
                            // Pricing
                            'Price': product.price || 0,
                            'Original Price': product.original_price || product.price || 0,
                            'Cost Price': product.cost_price || 0,
                            'Discount %': product.discount_percentage || 0,
                            
                            // Stock & Availability
                            'Total Stock': product.stock_quantity || 0,
                            'Min Stock Level': product.min_stock_level || 0,
                            'Max Stock Level': product.max_stock_level || 0,
                            'Is Available': product.is_available ? 'Yes' : 'No',
                            'Is Featured': product.is_featured ? 'Yes' : 'No',
                            'Is Hot Deal': product.is_hot_deal ? 'Yes' : 'No',
                            'Is Offer Only': product.is_offer_only ? 'Yes' : 'No',
                            
                            // Product Details
                            'Weight': product.weight || '',
                            'Unit': product.unit || '',
                            'Size': product.size || '',
                            'Color': product.color || '',
                            'Flavor': product.flavor || '',
                            'Package Type': product.package_type || '',
                            
                            // Ratings & Reviews
                            'Rating': product.rating || 0,
                            'Reviews Count': product.reviews || 0,
                            'Total Sales': product.total_sales || 0,
                            
                            // Images
                            'Main Image': product.image || '',
                            'Gallery Images': product.images ? product.images.join(', ') : '',
                            
                            // Dates
                            'Expiry Date': product.expiry_date || '',
                            'Manufacturing Date': product.manufacturing_date || '',
                            'Created At': product.created_at || '',
                            'Updated At': product.updated_at || '',
                            
                            // Location
                            'Shelf Location': product.shelf_location || '',
                            'Aisle': product.aisle || '',
                            
                            // Additional Info
                            'SKU': product.sku || '',
                            'Tags': product.tags ? product.tags.join(', ') : '',
                            'Keywords': product.keywords || '',
                            'Meta Title': product.meta_title || '',
                            'Meta Description': product.meta_description || '',
                            
                            // Loyalty & Points
                            'Loyalty Points': product.loyalty_points || 0,
                            'Min Purchase Quantity': product.min_purchase_quantity || 1,
                            'Max Purchase Quantity': product.max_purchase_quantity || '',
                            
                            // Branch-specific data (first 5 branches)
                            ...branches.slice(0, 5).reduce((acc: any, branch: any, idx: number) => {
                                acc[`Branch ${idx + 1} Name`] = branch.branch_name || '';
                                acc[`Branch ${idx + 1} Price`] = branch.price || 0;
                                acc[`Branch ${idx + 1} Stock`] = branch.stock_quantity || 0;
                                acc[`Branch ${idx + 1} Available`] = branch.is_available ? 'Yes' : 'No';
                                return acc;
                            }, {}),
                            
                            // Total Branches
                            'Total Branches': branches.length
                        };
                    } catch (err) {
                        console.error(`❌ Error fetching branch data for product ${product.id}:`, err);
                        return {
                            'ID': product.id,
                            'Barcode': product.barcode || '',
                            'Name': product.name || '',
                            'Price': product.price || 0,
                            'Stock': product.stock_quantity || 0,
                            'Category': product.category || '',
                            'Error': `Failed to load branch details: ${err instanceof Error ? err.message : 'Unknown'}`
                        };
                    }
                })
            );

            console.log('📊 Creating Excel workbook...');
            console.log(`✅ Processed ${productsWithFullDetails.length} products with full details`);
            
            if (productsWithFullDetails.length === 0) {
                alert('⚠️ لم يتم معالجة أي منتجات!');
                return;
            }

            // Lazy load XLSX library only when exporting
            const XLSX = await import('xlsx');

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(productsWithFullDetails);
            console.log('✅ Worksheet created');
            
            // Auto-size columns
            const colWidths = Object.keys(productsWithFullDetails[0] || {}).map(key => ({
                wch: Math.max(key.length, 15)
            }));
            ws['!cols'] = colWidths;

            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'All Products');
            console.log('✅ Workbook created with products sheet');

            // Add summary sheet
            const summary = [{
                'Total Products': allProducts.length,
                'Total Branches': branches.length,
                'Total Categories': [...new Set(allProducts.map((p: any) => p.category))].length,
                'Export Date': new Date().toLocaleString('ar-EG'),
                'Exported By': 'Admin'
            }];
            const wsSummary = XLSX.utils.json_to_sheet(summary);
            XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
            console.log('✅ Summary sheet added');

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `All_Products_${timestamp}.xlsx`;

            console.log('💾 Downloading file:', filename);
            
            // Download using writeFileXLSX (better browser support)
            XLSX.writeFileXLSX(wb, filename, { compression: true });
            
            console.log('✅ Excel file downloaded successfully!');
            alert(`✅ تم تصدير ${allProducts.length} منتج بنجاح!\nاسم الملف: ${filename}`);
        } catch (err) {
            console.error('❌ Excel export failed:', err);
            console.error('Error details:', {
                message: err instanceof Error ? err.message : 'Unknown',
                stack: err instanceof Error ? err.stack : undefined
            });
            alert('❌ فشل تصدير Excel:\n\n' + (err instanceof Error ? err.message : 'خطأ غير معروف') + '\n\nتحقق من Console للمزيد من التفاصيل');
        }
    };

    return (
        <div className="admin-page-container">
            <div className="admin-page-header">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <div>
                        <h1 className="admin-page-title mb-0">إدارة المنتجات</h1>
                        <p className="admin-page-subtitle">عرض وتحرير وإضافة المنتجات</p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        {/* Export to Excel Button */}
                        <button
                            onClick={exportAllToExcel}
                            className="admin-btn-secondary flex-1 sm:flex-initial"
                        >
                            <FileSpreadsheet size={18} />
                            <span className="hidden sm:inline">تصدير Excel</span>
                            <span className="sm:hidden">Excel</span>
                        </button>
                        
                        <button
                            onClick={() => navigate('/admin/upload')}
                            className="admin-btn-secondary flex-1 sm:flex-initial"
                        >
                            <Upload size={16} />
                            <span className="hidden sm:inline">استيراد Excel</span>
                            <span className="sm:hidden">استيراد</span>
                        </button>
                        <button
                            onClick={openCreate}
                            className="admin-btn-primary flex-1 sm:flex-initial"
                        >
                            <Plus size={18} />
                            <span>إضافة منتج</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Bar & Branch Filter */}
            <div className="admin-card mb-4 sm:mb-6">
                <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="ابحث عن منتج..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-form-input pl-10"
                        />
                    </div>
                    
                    {/* Branch Filter */}
                    <div className="w-full md:w-64">
                        <select
                            value={selectedBranchFilter}
                            onChange={(e) => setSelectedBranchFilter(e.target.value)}
                            className="admin-form-select"
                        >
                            <option value="all">🏪 جميع الفروع</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name_ar || branch.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Product Count Badge */}
            <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-gray-600">
                    عرض {filteredProducts.length} من {totalCount} منتج
                    {selectedBranchFilter !== 'all' && (
                        <span className="text-brand-orange font-semibold">
                            {' '}في {branches.find(b => String(b.id) === selectedBranchFilter)?.name_ar || 'الفرع'}
                        </span>
                    )}
                </span>
            </div>

            {/* Products Table */}
            {loading ? (
                <TableSkeleton rows={8} cols={7} />
            ) : (
            <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-4 font-semibold text-gray-600">المنتج</th>
                                <th className="px-4 py-4 font-semibold text-gray-600">الباركود</th>
                                <th className="px-4 py-4 font-semibold text-gray-600">التصنيف</th>
                                <th className="px-4 py-4 font-semibold text-gray-600">البراند</th>
                                <th className="px-4 py-4 font-semibold text-gray-600">السعر قبل</th>
                                <th className="px-4 py-4 font-semibold text-gray-600">السعر بعد</th>
                                <th className="px-4 py-4 font-semibold text-gray-600">الكمية</th>
                                <th className="px-4 py-4 font-semibold text-gray-600 text-right">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500">
                                                {(product.name || '?').charAt(0)}
                                            </div>
                                            <span className="font-medium text-gray-900">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-600 text-sm">{product.barcode || '-'}</td>
                                    <td className="px-4 py-4 text-gray-600">
                                        <div className="flex flex-col">
                                            <span>{product.category}</span>
                                            {product.subcategory && <span className="text-xs text-gray-400">{product.subcategory}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-600">
                                        {(product as any).brand_name || (product as any).brand_name_ar || (product as any).brand_name_en || '-'}
                                    </td>
                                    <td className="px-4 py-4 text-gray-500 line-through">
                                        {product.discount_price || product.originalPrice ? `${(Number(product.discount_price) || Number(product.originalPrice) || 0).toFixed(2)} EGP` : '-'}
                                    </td>
                                    <td className="px-4 py-4 font-bold text-green-600">{(Number(product.price) || 0).toFixed(2)} EGP</td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${(product.stock_quantity || 0) > 10 ? 'bg-green-100 text-green-700' : (product.stock_quantity || 0) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                            {product.stock_quantity || 0} قطعة
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => openEdit(product)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                        <div className="text-sm text-gray-600">
                            صفحة {currentPage} من {totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-brand-orange"
                            >
                                السابق
                            </button>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage >= totalPages}
                                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-brand-orange"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </>
            )}

            {/* Product Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editing ? 'تعديل منتج' : 'إضافة منتج جديد'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            {/* Barcode */}
                            <div>
                                <label className="block text-sm font-medium mb-1">الباركود</label>
                                <input
                                    type="text"
                                    value={form.barcode}
                                    onChange={e => setForm({ ...form, barcode: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="مثال: 6221155049784"
                                />
                            </div>
                            
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium mb-1">اسم المنتج *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>

                            {/* Prices Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">السعر قبل (الأصلي)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.originalPrice}
                                        onChange={e => setForm({ ...form, originalPrice: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        placeholder="السعر قبل الخصم"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">السعر بعد (الحالي) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={form.price}
                                        onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">⚠️ يجب أن يكون السعر أكبر من صفر</p>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-1">صورة المنتج</label>
                                <div className="space-y-2">
                                    {/* Current Image Preview */}
                                    {form.image && (
                                        <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                                            <img 
                                                src={form.image} 
                                                alt="Product preview" 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://placehold.co/400x400?text=No+Image';
                                                }}
                                            />
                                        </div>
                                    )}
                                    
                                    {/* File Upload */}
                                    <div className="flex items-center gap-2">
                                        <label className="flex-1 cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    
                                                    // Show loading state
                                                    const originalImage = form.image;
                                                    setForm({ ...form, image: 'uploading...' });
                                                    
                                                    try {
                                                        const formData = new FormData();
                                                        formData.append('image', file);
                                                        formData.append('productId', form.barcode || `product_${Date.now()}`);
                                                        
                                                        const response = await fetch(`${API_URL}/upload/image`, {
                                                            method: 'POST',
                                                            body: formData
                                                        });
                                                        
                                                        const result = await response.json();
                                                        
                                                        if (result.success) {
                                                            setForm({ ...form, image: result.data.url });
                                                            alert('✅ تم رفع الصورة بنجاح!');
                                                        } else {
                                                            throw new Error(result.error || 'فشل رفع الصورة');
                                                        }
                                                    } catch (error) {
                                                        console.error('Upload error:', error);
                                                        alert('❌ فشل رفع الصورة: ' + error.message);
                                                        setForm({ ...form, image: originalImage });
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                            <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center">
                                                📤 رفع صورة
                                            </div>
                                        </label>
                                        
                                        {/* Or URL Input */}
                                        <span className="text-gray-500">أو</span>
                                        <input
                                            type="text"
                                            value={form.image === 'uploading...' ? '' : form.image}
                                            onChange={e => setForm({ ...form, image: e.target.value })}
                                            className="flex-1 px-3 py-2 border rounded-md text-sm"
                                            placeholder="https://..."
                                            disabled={form.image === 'uploading...'}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        💡 يمكنك رفع صورة من جهازك أو إدخال رابط مباشر
                                    </p>
                                </div>
                            </div>

                            {/* Categories Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">التصنيف الأساسي *</label>
                                    <select
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value, subcategory: '' })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        <option value="">اختر تصنيف</option>
                                        {categories.filter(cat => !cat.parent_id).map(cat => (
                                            <option key={cat.id || cat.name} value={cat.name_ar || cat.name}>
                                                {cat.name_ar || cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                  

                            {/* Brand Selection */}
                            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-orange-800">
                                        🏷️ البراند
                                    </label>
                                    {form.brandId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                console.log('🗑️ Clearing brand selection');
                                                setForm({ ...form, brandId: undefined });
                                            }}
                                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                        >
                                            ✕ إلغاء البراند
                                        </button>
                                    )}
                                </div>
                                <select
                                    value={form.brandId || ''}
                                    onChange={e => {
                                        const newBrandId = e.target.value ? e.target.value : undefined;
                                        console.log('🏷️ Brand selected:', newBrandId);
                                        setForm({ ...form, brandId: newBrandId });
                                    }}
                                    className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-4 focus:ring-orange-500 focus:border-orange-500 bg-white font-medium text-gray-900"
                                >
                                    <option value="" className="text-gray-500">بدون براند</option>
                                    {brands.map(brand => (
                                        <option key={brand.id} value={String(brand.id)} className="font-medium">
                                            🏷️ {brand.name_ar} - {brand.name_en}
                                        </option>
                                    ))}
                                </select>
                                {form.brandId && brands.find(b => String(b.id) === String(form.brandId)) && (
                                    <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded-lg">
                                        <p className="text-sm text-green-800 font-bold flex items-center gap-2">
                                            ✅ تم اختيار البراند
                                            <span className="px-2 py-1 bg-green-200 rounded text-xs">
                                                ID: {form.brandId}
                                            </span>
                                            <span className="text-xs">
                                                ({brands.find(b => String(b.id) === String(form.brandId))?.name_ar})
                                            </span>
                                        </p>
                                    </div>
                                )}
                                {!form.brandId && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        💡 يمكنك تركه بدون براند أو اختيار براند لربطه بصفحة البراند.
                                    </p>
                                )}
                                {brands.length === 0 && (
                                    <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
                                        <p className="text-xs text-yellow-800">⚠️ لا توجد براندات متاحة. يرجى إضافة براندات أولاً.</p>
                                    </div>
                                )}
                            </div>  <label className="block text-sm font-medium mb-1">التصنيف الفرعي</label>
                                    <select
                                        value={form.subcategory}
                                        onChange={e => setForm({ ...form, subcategory: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="">اختر تصنيف فرعي</option>
                                        {(subcategories[form.category] || []).map(sub => (
                                            <option key={sub.id} value={sub.name_ar || sub.name}>
                                                {sub.name_ar || sub.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Expiry & Branch Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">تاريخ الصلاحية</label>
                                    <input
                                        type="date"
                                        value={form.expiryDate}
                                        onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                                {/* 🆕 Multi-Select Branches */}
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-orange-800">
                                        🏪 الفروع *
                                    </label>
                                    <div className="text-xs text-gray-600 mb-2">
                                        اختر فرع أو أكثر (Ctrl/Cmd + Click)
                                    </div>
                                </div>
                            </div>

                            {/* 🆕 Branch Selection with Checkboxes (Better UX) */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-bold text-blue-800">
                                        🏪 اختر الفروع المتاحة للمنتج *
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const allBranchIds = branches.map(b => b.id);
                                                setForm({ ...form, branchIds: allBranchIds });
                                            }}
                                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            ✓ تحديد الكل
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, branchIds: [] })}
                                            className="text-xs px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                                        >
                                            ✕ إلغاء الكل
                                        </button>
                                    </div>
                                </div>
                                
                                {branches.length === 0 ? (
                                    <div className="p-3 bg-yellow-100 border border-yellow-300 rounded">
                                        <p className="text-sm text-yellow-800">⚠️ لا توجد فروع متاحة. يرجى إضافة فروع أولاً.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                        {branches.map(branch => {
                                            const isSelected = form.branchIds.includes(branch.id);
                                            return (
                                                <label
                                                    key={branch.id}
                                                    className={`
                                                        flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                                                        ${isSelected 
                                                            ? 'bg-blue-600 text-white shadow-md' 
                                                            : 'bg-white border-2 border-blue-200 hover:bg-blue-100'
                                                        }
                                                    `}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setForm({ 
                                                                    ...form, 
                                                                    branchIds: [...form.branchIds, branch.id] 
                                                                });
                                                            } else {
                                                                setForm({ 
                                                                    ...form, 
                                                                    branchIds: form.branchIds.filter(id => id !== branch.id) 
                                                                });
                                                            }
                                                        }}
                                                        className="w-5 h-5 rounded border-2"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-bold">
                                                            {branch.name || branch.name_ar || `فرع ${branch.id}`}
                                                        </div>
                                                        {branch.address && (
                                                            <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                                                                📍 {branch.address}
                                                            </div>
                                                        )}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                                
                                {form.branchIds.length > 0 && (
                                    <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                                        <p className="text-sm text-green-800 font-bold">
                                            ✅ تم اختيار {form.branchIds.length} فرع
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {form.branchIds.map(branchId => {
                                                const branch = branches.find(b => b.id === branchId);
                                                return branch ? (
                                                    <span 
                                                        key={branchId}
                                                        className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs"
                                                    >
                                                        {branch.name || branch.name_ar}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}
                                
                                {form.branchIds.length === 0 && (
                                    <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                                        <p className="text-sm text-red-800 font-bold">
                                            ⚠️ يجب اختيار فرع واحد على الأقل
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* 🆕 Branch-Specific Data Section */}
                            {form.branchIds.length > 0 && (
                                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-bold text-purple-800">
                                            📊 بيانات كل فرع (السعر والكمية)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // Copy default values to all branches
                                                const newBranchData: any = {};
                                                form.branchIds.forEach(branchId => {
                                                    newBranchData[branchId] = {
                                                        price: form.price,
                                                        stockQuantity: form.stockQuantity,
                                                        originalPrice: form.originalPrice,
                                                        isAvailable: true
                                                    };
                                                });
                                                setBranchData(newBranchData);
                                            }}
                                            className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                                        >
                                            📋 نسخ البيانات الافتراضية للكل
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {form.branchIds.map(branchId => {
                                            const branch = branches.find(b => b.id === branchId);
                                            if (!branch) return null;
                                            
                                            const data = branchData[branchId] || {
                                                price: form.price,
                                                stockQuantity: form.stockQuantity,
                                                originalPrice: form.originalPrice,
                                                isAvailable: true
                                            };
                                            
                                            return (
                                                <div key={branchId} className="bg-white border-2 border-purple-300 rounded-lg p-3">
                                                    <div className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                                                        🏪 {branch.name || branch.name_ar}
                                                        {branch.address && (
                                                            <span className="text-xs text-gray-500 font-normal">
                                                                ({branch.address})
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium mb-1">السعر الحالي *</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0.01"
                                                                value={data.price}
                                                                onChange={e => {
                                                                    setBranchData({
                                                                        ...branchData,
                                                                        [branchId]: {
                                                                            ...data,
                                                                            price: parseFloat(e.target.value) || 0
                                                                        }
                                                                    });
                                                                }}
                                                                className="w-full px-2 py-1 border rounded text-sm"
                                                                placeholder="السعر"
                                                            />
                                                        </div>
                                                        
                                                        <div>
                                                            <label className="block text-xs font-medium mb-1">السعر قبل الخصم</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={data.originalPrice}
                                                                onChange={e => {
                                                                    setBranchData({
                                                                        ...branchData,
                                                                        [branchId]: {
                                                                            ...data,
                                                                            originalPrice: parseFloat(e.target.value) || 0
                                                                        }
                                                                    });
                                                                }}
                                                                className="w-full px-2 py-1 border rounded text-sm"
                                                                placeholder="السعر الأصلي"
                                                            />
                                                        </div>
                                                        
                                                        <div>
                                                            <label className="block text-xs font-medium mb-1">الكمية المتوفرة *</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={data.stockQuantity}
                                                                onChange={e => {
                                                                    setBranchData({
                                                                        ...branchData,
                                                                        [branchId]: {
                                                                            ...data,
                                                                            stockQuantity: parseInt(e.target.value) || 0
                                                                        }
                                                                    });
                                                                }}
                                                                className="w-full px-2 py-1 border rounded text-sm"
                                                                placeholder="الكمية"
                                                            />
                                                        </div>
                                                        
                                                        <div>
                                                            <label className="block text-xs font-medium mb-1">الحالة</label>
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={data.isAvailable !== false}
                                                                    onChange={e => {
                                                                        setBranchData({
                                                                            ...branchData,
                                                                            [branchId]: {
                                                                                ...data,
                                                                                isAvailable: e.target.checked
                                                                            }
                                                                        });
                                                                    }}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">
                                                                    {data.isAvailable !== false ? '✅ متوفر' : '❌ غير متوفر'}
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    <div className="mt-3 p-2 bg-purple-100 border border-purple-300 rounded">
                                        <p className="text-xs text-purple-800">
                                            💡 يمكنك تعديل السعر والكمية لكل فرع بشكل منفصل. إذا تركت الحقول فارغة، سيتم استخدام البيانات الافتراضية.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Stock & Weight Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">عدد القطع المتوفرة</label>
                                    <input
                                        type="number"
                                        value={form.stockQuantity}
                                        onChange={e => setForm({ ...form, stockQuantity: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">الوزن/الحجم</label>
                                    <input
                                        type="text"
                                        value={form.weight}
                                        onChange={e => setForm({ ...form, weight: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        placeholder="مثال: 1 كجم، 500 جم"
                                    />
                                </div>
                            </div>

                            {/* Shelf Location */}
                            <div>
                                <label className="block text-sm font-medium mb-1">موقع الرف (اختياري)</label>
                                <input
                                    type="text"
                                    value={form.shelfLocation}
                                    onChange={e => setForm({ ...form, shelfLocation: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="مثال: صف 3 - رف A"
                                />
                            </div>

                            {/* 🖼️ Product Frames Section */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-bold text-purple-900 flex items-center gap-2">
                                        🖼️ إطار المنتج
                                        <span className="text-xs font-normal text-purple-600">(اختياري)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={frameEnabled}
                                            onChange={e => setFrameEnabled(e.target.checked)}
                                            className="w-4 h-4 text-purple-600"
                                        />
                                        <span className="text-sm font-medium">
                                            {frameEnabled ? '✅ تفعيل الإطار' : '⚪ إيقاف الإطار'}
                                        </span>
                                    </label>
                                </div>
                                
                                {frameEnabled && (
                                    <>
                                        <select
                                            value={selectedFrame}
                                            onChange={e => setSelectedFrame(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-4 focus:ring-purple-500 focus:border-purple-500 bg-white font-medium mb-3"
                                        >
                                            <option value="">اختر إطاراً...</option>
                                            {frames.map(frame => (
                                                <option key={frame.id} value={frame.frame_url}>
                                                    🖼️ {frame.name_ar} - {frame.name} ({frame.category})
                                                </option>
                                            ))}
                                        </select>
                                        
                                        {selectedFrame && (
                                            <div className="mt-3 p-3 bg-white border-2 border-purple-300 rounded-lg">
                                                <p className="text-sm text-purple-800 font-bold mb-2">معاينة الإطار:</p>
                                                <div className="relative w-32 h-32 mx-auto">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg opacity-30"></div>
                                                    <img
                                                        src={selectedFrame}
                                                        alt="Frame preview"
                                                        className="absolute inset-0 w-full h-full object-contain"
                                                        onError={e => {
                                                            (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Frame';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                
                                {frames.length === 0 && (
                                    <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                                        <p className="text-xs text-yellow-800">⚠️ لا توجد إطارات متاحة. يرجى إضافة إطارات من صفحة إدارة الإطارات.</p>
                                    </div>
                                )}
                                
                                <p className="text-xs text-purple-600 mt-2">
                                    💡 الإطارات تظهر فوق صورة المنتج مباشرة في الواجهة الأمامية
                                </p>
                            </div>

                            {/* 🖼️ Product Frames Section */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-bold text-purple-900 flex items-center gap-2">
                                        🖼️ إطار المنتج
                                        <span className="text-xs font-normal text-purple-600">(اختياري)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={frameEnabled}
                                            onChange={e => setFrameEnabled(e.target.checked)}
                                            className="w-4 h-4 text-purple-600"
                                        />
                                        <span className="text-sm font-medium">
                                            {frameEnabled ? '✅ تفعيل الإطار' : '⚪ إيقاف الإطار'}
                                        </span>
                                    </label>
                                </div>
                                
                                {frameEnabled && (
                                    <>
                                        <select
                                            value={selectedFrame}
                                            onChange={e => setSelectedFrame(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-4 focus:ring-purple-500 focus:border-purple-500 bg-white font-medium mb-3"
                                        >
                                            <option value="">اختر إطاراً...</option>
                                            {frames.map(frame => (
                                                <option key={frame.id} value={frame.frame_url}>
                                                    🖼️ {frame.name_ar} - {frame.name} ({frame.category})
                                                </option>
                                            ))}
                                        </select>
                                        
                                        {selectedFrame && (
                                            <div className="mt-3 p-3 bg-white border-2 border-purple-300 rounded-lg">
                                                <p className="text-sm text-purple-800 font-bold mb-2">معاينة الإطار:</p>
                                                <div className="relative w-32 h-32 mx-auto">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg opacity-30"></div>
                                                    <img
                                                        src={selectedFrame}
                                                        alt="Frame preview"
                                                        className="absolute inset-0 w-full h-full object-contain"
                                                        onError={e => {
                                                            (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Frame';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                
                                {frames.length === 0 && (
                                    <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                                        <p className="text-xs text-yellow-800">⚠️ لا توجد إطارات متاحة. يرجى إضافة إطارات من صفحة إدارة الإطارات.</p>
                                    </div>
                                )}
                                
                                <p className="text-xs text-purple-600 mt-2">
                                    💡 الإطارات تظهر فوق صورة المنتج مباشرة في الواجهة الأمامية
                                </p>
                            </div>

                            <div className="flex gap-2 pt-4 border-t">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-orange-700"
                                >
                                    {editing ? 'تحديث' : 'إضافة'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsManager;
