import { Home, Grid, ShoppingCart, Tag, MoreHorizontal } from 'lucide-react';

export const APP_NAME = "Aloosh Market";

export const CATEGORIES = [
    { name: 'By Aloosh...', color: 'bg-orange-50', icon: '🍟' },
    { name: 'New Arrivals', color: 'bg-yellow-50', icon: '✨' },
    { name: 'Best Sellers', color: 'bg-red-50', icon: '🔥' },
    { name: 'Winter Essentials', color: 'bg-blue-50', icon: '❄️' },
];

export const ALL_CATEGORIES = [
    'Cheese',
    'Cosmetics',
    'Chocolates',
    'Candy',
    'Cannedfood',
    'Drinks',
    'Legumes',
    'healthy',
    'Milk',
    'Dates',
    'Oils',
    'Freezers',
    'الورقيات',
    'المساحيق',
    'سناكس',
    'بيكري',
    'لحوم',
    'فواكه وخضار',
    'All'
];

export const PRODUCTS = [
    {
        id: 1,
        title: 'Almarai Full Fat Milk 1 Liter',
        weight: '1.00 Liter',
        price: 48.95,
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80',
        category: 'Dairy & Eggs'
    },
    {
        id: 2,
        title: 'Lamar Long Life Full Fat Milk',
        weight: '1.00 L',
        price: 48.95,
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80',
        category: 'Dairy & Eggs'
    },
    {
        id: 3,
        title: 'Roumi Cheese Aged',
        weight: '250.00 gm',
        price: 61.24,
        image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=300&q=80',
        category: 'Deli'
    },
    {
        id: 4,
        title: 'Aloosh Special Chips - Chili',
        weight: '140.00 gm',
        price: 19.95,
        image: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=300&q=80',
        category: 'Snacks'
    },
    {
        id: 5,
        title: 'Fresh Bananas',
        weight: '1.00 kg',
        price: 25.00,
        image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=300&q=80',
        category: 'Fruits & Vegetables'
    },
];

export const NAV_ITEMS = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Grid, label: 'Categories', path: '/categories' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart' },
    { icon: Tag, label: 'Deals', path: '/deals' },
    { icon: MoreHorizontal, label: 'More', path: '/more' },
];

export const SPONSORED_ADS = [
    { id: 1, title: 'Cadbury Dairy Milk', image: 'https://images.unsplash.com/photo-1582126892976-35914656454b?auto=format&fit=crop&w=600&q=80' },
    { id: 2, title: 'Galaxy Chocolate', image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=600&q=80' },
    { id: 3, title: 'Lays Chips', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80' },
    { id: 4, title: 'Pepsi Offers', image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=600&q=80' },
];

export const FLYER_PAGES = [
    { id: 1, title: 'Offer 1', image: 'https://i.postimg.cc/7f0p5FFP/561432638-852357677118121-8045121795431786907-n.jpg' },
    { id: 2, title: 'Offer 2', image: 'https://i.postimg.cc/xJB4C5gD/561634247-852357670451455-4415429852468347683-n.jpg' },
    { id: 3, title: 'Offer 3', image: 'https://i.postimg.cc/jwBF5cvR/564078988-852357653784790-7362469362867190563-n.jpg' },
    { id: 4, title: 'Offer 4', image: 'https://i.postimg.cc/7GjW69XH/564614580-852357623784793-6747780499897368656-n.jpg' },
    { id: 5, title: 'Offer 5', image: 'https://i.postimg.cc/qhNF4Scp/564714515-852357840451438-2592897648795572222-n.jpg' },
];
