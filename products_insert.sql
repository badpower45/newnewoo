-- إضافة منتجات للأقسام الثمانية
-- تأكد من تشغيل هذا الملف في Supabase SQL Editor
-- ملاحظة: السعر موجود في جدول branch_products منفصل

-- ======================
-- قسم الحلويات
-- ======================

-- إضافة المنتجات
INSERT INTO products (id, name, category, subcategory, image, barcode, weight, is_active) VALUES
('SWEET-001', 'شوكولاتة جالاكسي 100 جم', 'حلويات', 'شوكولاتة', 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400', '6001067003817', '100g', true),
('SWEET-002', 'كيت كات 4 أصابع', 'حلويات', 'شوكولاتة', 'https://images.unsplash.com/photo-1559717201-fbb671ff56b7?w=400', '7613035257504', '45g', true),
('SWEET-003', 'سنيكرز شوكولاتة 50 جم', 'حلويات', 'شوكولاتة', 'https://images.unsplash.com/photo-1604424259525-2e9cc726a1e4?w=400', '5000159459223', '50g', true),
('SWEET-004', 'توينكس شوكولاتة توأم', 'حلويات', 'شوكولاتة', 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400', '5000159462223', '57g', true),
('SWEET-005', 'باونتي شوكولاتة بالجوز', 'حلويات', 'شوكولاتة', 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400', '4011100021099', '57g', true),
('SWEET-006', 'مارس شوكولاتة 51 جم', 'حلويات', 'شوكولاتة', 'https://images.unsplash.com/photo-1542843137-8791a6904d14?w=400', '5000159407229', '51g', true),
('SWEET-007', 'كادبري ديري ميلك 80 جم', 'حلويات', 'شوكولاتة', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400', '6001067003824', '80g', true),
('SWEET-008', 'فيريرو روشيه 16 حبة', 'حلويات', 'شوكولاتة', 'https://images.unsplash.com/photo-1548848638-d2c9ffc58f49?w=400', '9556456052741', '200g', true);

-- إضافة الأسعار للفرع الرئيسي (branch_id = 1)
INSERT INTO branch_products (branch_id, product_id, price, discount_price, stock_quantity, is_available) VALUES
(1, 'SWEET-001', 25.00, 30.00, 100, true),
(1, 'SWEET-002', 15.00, 18.00, 150, true),
(1, 'SWEET-003', 12.00, 15.00, 200, true),
(1, 'SWEET-004', 20.00, 25.00, 120, true),
(1, 'SWEET-005', 18.00, 22.00, 130, true),
(1, 'SWEET-006', 14.00, 17.00, 180, true),
(1, 'SWEET-007', 28.00, 35.00, 90, true),
(1, 'SWEET-008', 120.00, 150.00, 50, true);

-- ======================
-- قسم الألبان
-- ======================
INSERT INTO products (name, category, subcategory, price, discount_price, image, barcode, weight, is_active, created_at, updated_at) VALUES
('حليب المراعي كامل الدسم 1 لتر', 'ألبان', 'حليب', 22.00, 25.00, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', '6281007000018', '1L', true, NOW(), NOW()),
('حليب المراعي قليل الدسم 1 لتر', 'ألبان', 'حليب', 21.00, 24.00, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', '6281007000025', '1L', true, NOW(), NOW()),
('زبادي المراعي 170 جم', 'ألبان', 'زبادي', 5.00, 6.00, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', '6281007000032', '170g', true, NOW(), NOW()),
('لبنة المراعي 200 جم', 'ألبان', 'لبنة', 15.00, 18.00, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400', '6281007000049', '200g', true, NOW(), NOW()),
('زبدة لورباك 200 جم', 'ألبان', 'زبدة', 45.00, 55.00, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400', '5760466935180', '200g', true, NOW(), NOW()),
('كريمة المراعي للطبخ 500 مل', 'ألبان', 'كريمة', 18.00, 22.00, 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400', '6281007000056', '500ml', true, NOW(), NOW()),
('حليب نادك طويل الأجل 1 لتر', 'ألبان', 'حليب', 20.00, 23.00, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', '6281007100019', '1L', true, NOW(), NOW()),
('زبادي أكتيفيا بالفراولة 120 جم', 'ألبان', 'زبادي', 7.50, 9.00, 'https://images.unsplash.com/photo-1580910051074-2c39e0cdf019?auto=format&fit=crop&w=400&q=80', '6281007000063', '120g', true, NOW(), NOW());

-- ======================
-- قسم المنتجات الصحية (Healthy)
-- ======================
INSERT INTO products (name, category, subcategory, price, discount_price, image, barcode, weight, is_active, created_at, updated_at) VALUES
('شوفان كويكر 500 جم', 'صحي', 'حبوب', 35.00, 42.00, 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400', '3046920010153', '500g', true, NOW(), NOW()),
('عسل طبيعي 500 جم', 'صحي', 'عسل', 85.00, 100.00, 'https://images.unsplash.com/photo-1587049352846-4a222e784fbf?w=400', '6001067003855', '500g', true, NOW(), NOW()),
('زيت زيتون بكر 500 مل', 'صحي', 'زيوت', 120.00, 145.00, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', '8076809513555', '500ml', true, NOW(), NOW()),
('لوز محمص غير مملح 200 جم', 'صحي', 'مكسرات', 65.00, 75.00, 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400', '6001067003862', '200g', true, NOW(), NOW()),
('كينوا عضوية 500 جم', 'صحي', 'حبوب', 55.00, 65.00, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', '6001067003879', '500g', true, NOW(), NOW()),
('بذور الشيا 250 جم', 'صحي', 'بذور', 40.00, 48.00, 'https://images.unsplash.com/photo-1617611750138-30db7c7a36f8?w=400', '6001067003886', '250g', true, NOW(), NOW()),
('جرانولا بالفواكه 400 جم', 'صحي', 'حبوب', 48.00, 58.00, 'https://images.unsplash.com/photo-1589734267710-83d4e0eb4f8e?w=400', '6001067003893', '400g', true, NOW(), NOW()),
('تمر المدينة 500 جم', 'صحي', 'تمور', 38.00, 45.00, 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400', '6001067003909', '500g', true, NOW(), NOW());

-- ======================
-- قسم مستحضرات التجميل (Cosmetics)
-- ======================
INSERT INTO products (name, category, subcategory, price, discount_price, image, barcode, weight, is_active, created_at, updated_at) VALUES
('شامبو دوف 400 مل', 'تجميل', 'شامبو', 45.00, 55.00, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400', '8712561178877', '400ml', true, NOW(), NOW()),
('صابون لوكس 6 قطع', 'تجميل', 'صابون', 28.00, 35.00, 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=400', '8712561675055', '540g', true, NOW(), NOW()),
('معجون أسنان سيجنال 120 مل', 'تجميل', 'عناية بالأسنان', 18.00, 22.00, 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400', '8712561121736', '120ml', true, NOW(), NOW()),
('كريم نيفيا 200 مل', 'تجميل', 'كريمات', 65.00, 78.00, 'https://images.unsplash.com/photo-1556228852-80f751db1c28?w=400', '4005900118004', '200ml', true, NOW(), NOW()),
('مزيل عرق نيفيا رول 50 مل', 'تجميل', 'مزيلات عرق', 32.00, 38.00, 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400', '4005900118011', '50ml', true, NOW(), NOW()),
('غسول الوجه نيتروجينا 200 مل', 'تجميل', 'عناية بالبشرة', 85.00, 100.00, 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400', '3574661153445', '200ml', true, NOW(), NOW()),
('فرشاة أسنان أورال بي', 'تجميل', 'عناية بالأسنان', 22.00, 28.00, 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400', '8001090031112', '1pc', true, NOW(), NOW()),
('مناديل مبللة جونسون 80 منديل', 'تجميل', 'مناديل', 35.00, 42.00, 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=400', '3574661153452', '80pc', true, NOW(), NOW());

-- ======================
-- قسم الجبن
-- ======================
INSERT INTO products (name, category, subcategory, price, discount_price, image, barcode, weight, is_active, created_at, updated_at) VALUES
('جبنة شيدر بوك 500 جم', 'جبن', 'جبن صلب', 65.00, 78.00, 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400', '6001067003916', '500g', true, NOW(), NOW()),
('جبنة موزاريلا بيضاني 400 جم', 'جبن', 'جبن طري', 55.00, 65.00, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400', '6001067003923', '400g', true, NOW(), NOW()),
('جبنة فيتا دومتي 250 جم', 'جبن', 'جبن أبيض', 35.00, 42.00, 'https://images.unsplash.com/photo-1559561853-08451507cbe7?w=400', '6001067003930', '250g', true, NOW(), NOW()),
('جبنة كريمي بريزيدون 500 جم', 'جبن', 'جبن كريمي', 48.00, 58.00, 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400', '3073780972017', '500g', true, NOW(), NOW()),
('جبنة حلوم نادك 250 جم', 'جبن', 'جبن حلوم', 38.00, 45.00, 'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?w=400', '6281007000070', '250g', true, NOW(), NOW()),
('جبنة قشقوان 300 جم', 'جبن', 'جبن صلب', 52.00, 62.00, 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400', '6001067003947', '300g', true, NOW(), NOW()),
('جبنة بارميزان مبشورة 100 جم', 'جبن', 'جبن صلب', 45.00, 55.00, 'https://images.unsplash.com/photo-1525677402372-4c9ad4e632e5?w=400', '8000430130102', '100g', true, NOW(), NOW()),
('جبنة كيري مربعات 108 جم', 'جبن', 'جبن طري', 22.00, 28.00, 'https://images.unsplash.com/photo-1616555428175-4765bea45110?w=400', '3073780972024', '108g', true, NOW(), NOW());

-- ======================
-- قسم الكاندي
-- ======================
INSERT INTO products (name, category, subcategory, price, discount_price, image, barcode, weight, is_active, created_at, updated_at) VALUES
('سكاكر هاريبو دببة 100 جم', 'كاندي', 'جيلي', 15.00, 18.00, 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400', '4001686307007', '100g', true, NOW(), NOW()),
('مصاصات تشوبا تشوبس 12 حبة', 'كاندي', 'مصاصات', 18.00, 22.00, 'https://images.unsplash.com/photo-1574706542259-8f35f45e82f1?w=400', '8410031960013', '144g', true, NOW(), NOW()),
('منتوس نعناع 37.5 جم', 'كاندي', 'نعناع', 5.00, 6.00, 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400', '8715035110106', '37.5g', true, NOW(), NOW()),
('سكاكر ستاربرست 192 جم', 'كاندي', 'حلوى طرية', 25.00, 30.00, 'https://images.unsplash.com/photo-1606312619070-d48b4cdb0df8?w=400', '4001686302002', '192g', true, NOW(), NOW()),
('سكيتلز فواكه 174 جم', 'كاندي', 'حلوى صلبة', 22.00, 28.00, 'https://images.unsplash.com/photo-1575563653497-f3b45f0c5f08?w=400', '4001686302019', '174g', true, NOW(), NOW()),
('إم آند إمز شوكولاتة 45 جم', 'كاندي', 'شوكولاتة', 10.00, 12.00, 'https://images.unsplash.com/photo-1585159812596-fac104f2f069?w=400', '4001686302026', '45g', true, NOW(), NOW()),
('علكة اكسترا نعناع 64 جم', 'كاندي', 'علكة', 12.00, 15.00, 'https://images.unsplash.com/photo-1606312619070-d48b4cdb0df8?w=400', '4001686302033', '64g', true, NOW(), NOW()),
('لبان بابل غام 140 جم', 'كاندي', 'لبان', 20.00, 25.00, 'https://images.unsplash.com/photo-1575563653497-f3b45f0c5f08?w=400', '4001686302040', '140g', true, NOW(), NOW());

-- ======================
-- قسم المشروبات
-- ======================
INSERT INTO products (name, category, subcategory, price, discount_price, image, barcode, weight, is_active, created_at, updated_at) VALUES
('كوكاكولا 2.25 لتر', 'مشروبات', 'مشروبات غازية', 18.00, 22.00, 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400', '6001067003954', '2.25L', true, NOW(), NOW()),
('بيبسي 1.5 لتر', 'مشروبات', 'مشروبات غازية', 15.00, 18.00, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', '6001067003961', '1.5L', true, NOW(), NOW()),
('ماء نستله 600 مل', 'مشروبات', 'مياه', 3.00, 4.00, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', '6281007000087', '600ml', true, NOW(), NOW()),
('عصير العلالي برتقال 1 لتر', 'مشروبات', 'عصائر', 12.00, 15.00, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', '6001067003978', '1L', true, NOW(), NOW()),
('عصير نكتار مانجو 1 لتر', 'مشروبات', 'عصائر', 14.00, 17.00, 'https://images.unsplash.com/photo-1587811378147-0f85b90ad3ff?w=400', '6001067003985', '1L', true, NOW(), NOW()),
('ريد بول 250 مل', 'مشروبات', 'مشروبات طاقة', 15.00, 18.00, 'https://images.unsplash.com/photo-1502741509048-203e5d2e3f70?w=400', '9002490100018', '250ml', true, NOW(), NOW()),
('نسكافيه جولد 200 جم', 'مشروبات', 'قهوة', 75.00, 90.00, 'https://images.unsplash.com/photo-1595981234058-6673fa8a43a3?w=400', '7613036512008', '200g', true, NOW(), NOW()),
('شاي ربيع 100 كيس', 'مشروبات', 'شاي', 35.00, 42.00, 'https://images.unsplash.com/photo-1597318112589-b5c0c0cd8567?w=400', '6001067003992', '200g', true, NOW(), NOW());

-- ======================
-- قسم المجمدات
-- ======================
INSERT INTO products (name, category, subcategory, price, discount_price, image, barcode, weight, is_active, created_at, updated_at) VALUES
('آيس كريم سنكرس 50 مل', 'مجمدات', 'آيس كريم', 12.00, 15.00, 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?w=400', '4001686004001', '50ml', true, NOW(), NOW()),
('بطاطس مقلية ماكين 750 جم', 'مجمدات', 'بطاطس', 35.00, 42.00, 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=400', '5449000030931', '750g', true, NOW(), NOW()),
('دجاج ناجتس 400 جم', 'مجمدات', 'دجاج', 48.00, 58.00, 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400', '6001067004005', '400g', true, NOW(), NOW()),
('خضار مشكل مجمد 900 جم', 'مجمدات', 'خضروات', 25.00, 30.00, 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400', '6001067004012', '900g', true, NOW(), NOW()),
('بيتزا مارجريتا 500 جم', 'مجمدات', 'بيتزا', 55.00, 65.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', '6001067004029', '500g', true, NOW(), NOW()),
('برجر لحم بقري 400 جم', 'مجمدات', 'لحوم', 58.00, 70.00, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400', '6001067004036', '400g', true, NOW(), NOW()),
('سمبوسة لحم 250 جم', 'مجمدات', 'معجنات', 32.00, 38.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', '6001067004043', '250g', true, NOW(), NOW()),
('آيس كريم ماجنوم 440 مل', 'مجمدات', 'آيس كريم', 65.00, 78.00, 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=400', '8711327387003', '440ml', true, NOW(), NOW());

-- ملاحظات:
-- 1. تأكد من وجود الأقسام في جدول categories
-- 2. يمكنك تعديل الأسعار والصور حسب الحاجة
-- 3. الباركود عشوائي - يجب استبداله بالباركود الحقيقي
-- 4. يمكن إضافة المزيد من المنتجات لكل قسم حسب الحاجة
