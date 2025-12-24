# 🎨 دليل Tailwind CSS للتصميم ثنائي الاتجاه (RTL/LTR)

## المشكلة
الكلاسات الافتراضية في Tailwind مثل `ml-4` (margin-left) أو `text-left` تعمل فقط في اتجاه واحد.  
عند التبديل للعربية (RTL)، يجب أن تنعكس الهوامش والمحاذاة تلقائياً.

## الحل: الكلاسات المنطقية (Logical Properties)

بدلاً من استخدام `left/right/top/bottom`، استخدم `start/end`:

### ❌ الطريقة القديمة (غير متوافقة مع RTL)
```jsx
<div className="ml-4 text-left">
  <button className="mr-2">Click</button>
</div>
```

### ✅ الطريقة الصحيحة (متوافقة تلقائياً)
```jsx
<div className="ms-4 text-start">
  <button className="me-2">Click</button>
</div>
```

---

## 📋 جدول التحويل السريع

| ❌ القديمة | ✅ الجديدة المنطقية | الوصف |
|------------|---------------------|-------|
| `ml-4` | `ms-4` | Margin Start |
| `mr-4` | `me-4` | Margin End |
| `pl-4` | `ps-4` | Padding Start |
| `pr-4` | `pe-4` | Padding End |
| `text-left` | `text-start` | Text Align Start |
| `text-right` | `text-end` | Text Align End |
| `left-0` | `start-0` | Position Start |
| `right-0` | `end-0` | Position End |
| `rounded-l-lg` | `rounded-s-lg` | Border Radius Start |
| `rounded-r-lg` | `rounded-e-lg` | Border Radius End |
| `border-l-4` | `border-s-4` | Border Start |
| `border-r-4` | `border-e-4` | Border End |

---

## 🔧 أمثلة عملية

### 1. Card مع صورة على الجانب
```jsx
// ❌ قديم
<div className="flex">
  <img className="rounded-l-lg" />
  <div className="ml-4 text-left">
    <h3>Title</h3>
    <button className="mr-2">Buy</button>
  </div>
</div>

// ✅ جديد - يعمل في RTL و LTR تلقائياً
<div className="flex">
  <img className="rounded-s-lg" />
  <div className="ms-4 text-start">
    <h3>Title</h3>
    <button className="me-2">Buy</button>
  </div>
</div>
```

### 2. Sidebar مع محتوى
```jsx
// ❌ قديم
<div className="flex">
  <aside className="w-64 border-r-2 pr-4">Sidebar</aside>
  <main className="flex-1 pl-4">Content</main>
</div>

// ✅ جديد
<div className="flex">
  <aside className="w-64 border-e-2 pe-4">Sidebar</aside>
  <main className="flex-1 ps-4">Content</main>
</div>
```

### 3. Modal مع زر إغلاق
```jsx
// ❌ قديم
<div className="relative">
  <button className="absolute top-0 right-0 mt-2 mr-2">×</button>
  <div className="text-left p-4">Content</div>
</div>

// ✅ جديد
<div className="relative">
  <button className="absolute top-0 end-0 mt-2 me-2">×</button>
  <div className="text-start p-4">Content</div>
</div>
```

---

## 🎯 القواعد الذهبية

### 1. **Top & Bottom** - تبقى كما هي
```jsx
// هذه لا تتغير أبداً
<div className="mt-4 mb-4 pt-2 pb-2">
```

### 2. **Left & Right** - تتحول لـ Start & End
```jsx
// تحويل إلزامي
ml-4  →  ms-4
mr-4  →  me-4
```

### 3. **Flexbox** - استخدم justify-between و items-center
```jsx
// ✅ هذه تعمل في كل الاتجاهات
<div className="flex justify-between items-center">
  <span>Start</span>
  <span>End</span>
</div>
```

### 4. **Grid** - استخدم gap بدلاً من margins
```jsx
// ✅ الأفضل للـ RTL
<div className="grid grid-cols-3 gap-4">
  {items.map(item => <Card />)}
</div>
```

---

## 🛠️ تحديث الكود الموجود

### طريقة سريعة للبحث والاستبدال:

```bash
# في VSCode أو أي محرر نصوص
# ابحث عن:
ml-(\d+)

# استبدل بـ:
ms-$1
```

كرر العملية مع:
- `mr-` → `me-`
- `pl-` → `ps-`
- `pr-` → `pe-`
- `text-left` → `text-start`
- `text-right` → `text-end`

---

## 📱 حالات خاصة

### Absolute Positioning
```jsx
// ❌ قديم
<div className="absolute left-0">Left Side</div>
<div className="absolute right-0">Right Side</div>

// ✅ جديد
<div className="absolute start-0">Start Side</div>
<div className="absolute end-0">End Side</div>
```

### Transform & Translate
```jsx
// لو محتاج تحريك عنصر لليسار/يمين، استخدم CSS variables

// في Tailwind Config
module.exports = {
  theme: {
    extend: {
      translate: {
        'start': 'var(--translate-start, 0)',
        'end': 'var(--translate-end, 0)',
      }
    }
  }
}

// في CSS
[dir="ltr"] { --translate-start: -100%; }
[dir="rtl"] { --translate-start: 100%; }
```

---

## 🎨 Icons & SVG

### تدوير الأيقونات في RTL
بعض الأيقونات (مثل الأسهم) تحتاج انعكاس:

```jsx
// إضافة class لقلب الأيقونة في RTL
<svg className="rtl:rotate-180">
  <path d="arrow-right" />
</svg>

// أو باستخدام useLanguage
const { isRTL } = useLanguage();

<ChevronRight className={isRTL ? 'rotate-180' : ''} />
```

---

## ✅ Checklist للمراجعة

قبل نشر الكود، تأكد من:

- [ ] كل `ml-*` و `mr-*` تحولت لـ `ms-*` و `me-*`
- [ ] كل `pl-*` و `pr-*` تحولت لـ `ps-*` و `pe-*`
- [ ] كل `text-left` و `text-right` تحولت لـ `text-start` و `text-end`
- [ ] الـ Borders استخدمت `border-s-*` و `border-e-*`
- [ ] الـ Rounded Corners استخدمت `rounded-s-*` و `rounded-e-*`
- [ ] الأيقونات التي تحتاج انعكاس أضيف لها `rtl:rotate-180`
- [ ] جربت الموقع في كلا الاتجاهين (RTL و LTR)

---

## 💡 نصائح إضافية

### 1. استخدم المتغيرات للقيم المتكررة
```jsx
// بدل تكرار الكلاس
const cardPadding = "p-4 ps-6 pe-6";

<div className={cardPadding}>
```

### 2. استخدم Tailwind Plugins للتخصيص
```js
// في tailwind.config.js
module.exports = {
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.rtl-mirror': {
          '[dir="rtl"] &': {
            transform: 'scaleX(-1)',
          },
        },
      })
    }
  ]
}
```

### 3. Testing
```jsx
// Component للتجربة السريعة
function DirectionToggle() {
  return (
    <button onClick={() => {
      const dir = document.dir === 'rtl' ? 'ltr' : 'rtl';
      document.dir = dir;
    }}>
      Toggle Direction
    </button>
  );
}
```

---

## 🚀 الخلاصة

**قاعدة بسيطة:** 
- أي شيء متعلق بـ **Left/Right** → حوّله لـ **Start/End**
- أي شيء متعلق بـ **Top/Bottom** → يبقى كما هو
- استخدم Flexbox و Grid قدر الإمكان (أفضل للـ RTL)

**النتيجة:** كود واحد يعمل في الاتجاهين بدون تعديلات! 🎉
