import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

export const initDb = () => {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT
    )`);

        // Products Table
        db.run(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT,
      price REAL,
      originalPrice REAL,
      category TEXT,
      rating REAL,
      reviews INTEGER,
      image TEXT,
      isOrganic INTEGER,
      weight TEXT,
      isNew INTEGER
    )`);

        // Cart Table
        db.run(`CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      productId TEXT,
      quantity INTEGER,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(productId) REFERENCES products(id)
    )`);

        // Orders Table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      total REAL,
      items TEXT,
      date TEXT,
      status TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`);

        // Seed Products
        seedProducts();
    });
};

const seedProducts = () => {
    db.get("SELECT count(*) as count FROM products", (err, row) => {
        if (err) {
            console.error(err.message);
            return;
        }
        if (row.count === 0) {
            console.log("Seeding products...");
            const products = [
                // Fresh Products
                {
                    id: '1',
                    name: 'بلح سيوي فاخر',
                    price: 65.00,
                    originalPrice: 80.00,
                    category: 'ياميش',
                    rating: 4.9,
                    reviews: 342,
                    image: 'https://images.unsplash.com/photo-1628607270974-c06490723748?q=80&w=600&auto=format&fit=crop',
                    isOrganic: 1,
                    weight: '1 كجم'
                },
                {
                    id: '2',
                    name: 'عيش فينو طازة',
                    price: 25.00,
                    category: 'مخبوزات',
                    rating: 4.8,
                    reviews: 1500,
                    image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?q=80&w=600&auto=format&fit=crop',
                    weight: '10 أرغفة'
                },
                {
                    id: '3',
                    name: 'طماطم بلدي صلصة',
                    price: 15.00,
                    originalPrice: 20.00,
                    category: 'خضروات',
                    rating: 4.5,
                    reviews: 230,
                    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop',
                    weight: '1 كجم'
                },
                {
                    id: '4',
                    name: 'كباب حلة بلدي',
                    price: 480.00,
                    category: 'جزارة',
                    rating: 4.9,
                    reviews: 89,
                    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=600&auto=format&fit=crop',
                    weight: '1 كجم'
                },
                // Pantry Products
                {
                    id: '5',
                    name: 'زيت كريستال عباد',
                    price: 95.00,
                    originalPrice: 110.00,
                    category: 'زيوت',
                    rating: 4.7,
                    reviews: 540,
                    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop',
                    weight: '800 مل'
                },
                {
                    id: '6',
                    name: 'أرز الضحى مصري',
                    price: 42.00,
                    category: 'أرز',
                    rating: 4.8,
                    reviews: 800,
                    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop',
                    weight: '1 كجم'
                },
                {
                    id: '7',
                    name: 'مكرونة الملكة بنا',
                    price: 15.00,
                    category: 'مكرونة',
                    rating: 4.6,
                    reviews: 320,
                    image: 'https://images.unsplash.com/photo-1612966874574-1041c94f8a55?q=80&w=600&auto=format&fit=crop',
                    weight: '400 جرام'
                },
                {
                    id: '8',
                    name: 'شاي العروسة ناعم',
                    price: 60.00,
                    category: 'مشروبات ساخنة',
                    rating: 4.9,
                    reviews: 1200,
                    image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?q=80&w=600&auto=format&fit=crop',
                    weight: '250 جرام'
                },
                // Snack Products
                {
                    id: '9',
                    name: 'شيبسي طماطم عائلي',
                    price: 15.00,
                    category: 'سناكس',
                    rating: 4.8,
                    reviews: 156,
                    image: 'https://images.unsplash.com/photo-1613919085533-0a05360b1cbe?q=80&w=600&auto=format&fit=crop',
                    weight: 'جامبو'
                },
                {
                    id: '10',
                    name: 'بيبسي كانز',
                    price: 12.00,
                    category: 'مشروبات',
                    rating: 4.9,
                    reviews: 2000,
                    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?q=80&w=600&auto=format&fit=crop',
                    weight: '330 مل'
                },
                {
                    id: '11',
                    name: 'مولتو ماجموم شوكولاتة',
                    price: 10.00,
                    category: 'مخبوزات',
                    rating: 4.5,
                    reviews: 450,
                    image: 'https://images.unsplash.com/photo-1545337706-16125eb23d15?q=80&w=600&auto=format&fit=crop',
                    weight: 'قطعة'
                },
                {
                    id: '12',
                    name: 'شوكولاتة كيت كات 4 أصابع',
                    price: 25.00,
                    category: 'شوكولاتة',
                    rating: 4.8,
                    reviews: 600,
                    image: 'https://images.unsplash.com/photo-1614066000917-5c51861e37e0?q=80&w=600&auto=format&fit=crop',
                    weight: '41.5 جرام'
                }
            ];

            const stmt = db.prepare(`INSERT INTO products (id, name, price, originalPrice, category, rating, reviews, image, isOrganic, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            products.forEach(p => {
                stmt.run(p.id, p.name, p.price, p.originalPrice, p.category, p.rating, p.reviews, p.image, p.isOrganic ? 1 : 0, p.weight);
            });
            stmt.finalize();
            console.log("Products seeded.");
        }
    });
};

export default db;
