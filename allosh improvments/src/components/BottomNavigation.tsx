import { Home, LayoutGrid, ShoppingCart, Tag, MoreHorizontal } from 'lucide-react';

interface BottomNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function BottomNavigation({ currentPage, onNavigate }: BottomNavigationProps) {
  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'categories', label: 'الفئات', icon: LayoutGrid },
    { id: 'cart', label: 'السلة', icon: ShoppingCart },
    { id: 'deals', label: 'العروض', icon: Tag },
    { id: 'more', label: 'المزيد', icon: MoreHorizontal }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] shadow-[0_-2px_8px_rgba(0,0,0,0.05)] z-50">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center gap-1 py-2 px-3 min-w-[60px] transition-all"
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? 'text-[#F97316]' : 'text-[#9CA3AF]'
                  }`}
                />
                <span
                  className={`text-xs ${
                    isActive ? 'text-[#F97316]' : 'text-[#9CA3AF]'
                  }`}
                  style={{ fontWeight: isActive ? 600 : 400 }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
