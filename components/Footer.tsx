import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-orange-100 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-brand-brown rounded-full flex items-center justify-center ml-3 border-2 border-brand-orange">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <span className="text-2xl font-extrabold text-brand-brown">علوش<span className="text-brand-orange">.</span></span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-md font-medium">
              وجهتك اليومية لكل احتياجات بيتك. خضار طازة، لحوم بلدي، مخبوزات سخنة وكل منتجات السوبر ماركت. فاتحين 24 ساعة عشانك.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-brand-brown hover:bg-brand-orange hover:text-white transition-all duration-300">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-bold text-brand-brown mb-6">الأقسام</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-brand-orange transition-colors">خضار وفاكهة</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">لحوم وأسماك</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">مخبوزات</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">ألبان وجبن</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">مشروبات</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-brand-brown mb-6">خدمة العملاء</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-brand-orange transition-colors">تتبع طلبك</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">سياسة التوصيل</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">الاستبدال والاسترجاع</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">الأسئلة الشائعة</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors flex items-center"><Phone size={14} className="ml-1"/> 19999</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-brand-brown mb-6">النشرة البريدية</h4>
            <p className="text-xs text-slate-500 mb-4">اشترك عشان توصلك أحدث العروض وكوبونات الخصم.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="اكتب ايميلك هنا" 
                className="bg-slate-50 border border-slate-200 rounded-r-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-brand-orange"
              />
              <button className="bg-brand-brown text-white px-4 py-2 rounded-l-lg hover:bg-brand-orange transition-colors">
                <Mail size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-slate-400 mb-4 md:mb-0 font-medium">© 2025 علوش سوبر ماركت. جميع الحقوق محفوظة.</p>
          <div className="flex space-x-6 space-x-reverse text-xs text-slate-400 font-medium">
            <a href="#" className="hover:text-brand-orange">سياسة الخصوصية</a>
            <a href="#" className="hover:text-brand-orange">الشروط والأحكام</a>
          </div>
        </div>
      </div>
    </footer>
  );
}