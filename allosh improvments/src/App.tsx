import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { ProductDetailsPage } from './components/ProductDetailsPage';
import { ReelsPage } from './components/ReelsPage';
import { CustomerSupportPage } from './components/CustomerSupportPage';
import { MagazinePage } from './components/MagazinePage';
import { HotDealsPage } from './components/HotDealsPage';
import { BottomNavigation } from './components/BottomNavigation';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showProductDetails, setShowProductDetails] = useState(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setShowProductDetails(false);
  };

  const renderPage = () => {
    if (showProductDetails) {
      return <ProductDetailsPage onBack={() => setShowProductDetails(false)} />;
    }

    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleNavigate}
            onProductClick={() => setShowProductDetails(true)}
          />
        );
      case 'reels':
        return <ReelsPage />;
      case 'support':
        return <CustomerSupportPage onBack={() => setCurrentPage('home')} />;
      case 'magazine':
        return <MagazinePage onBack={() => setCurrentPage('home')} />;
      case 'deals':
        return <HotDealsPage onBack={() => setCurrentPage('home')} />;
      case 'categories':
        return (
          <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center pb-20">
            <div className="text-center">
              <h2 className="text-[#23110C] mb-2">صفحة الفئات</h2>
              <p className="text-[#6B7280]">قريباً...</p>
            </div>
          </div>
        );
      case 'cart':
        return (
          <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center pb-20">
            <div className="text-center">
              <h2 className="text-[#23110C] mb-2">سلة التسوق</h2>
              <p className="text-[#6B7280]">السلة فارغة</p>
            </div>
          </div>
        );
      case 'more':
        return (
          <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center pb-20">
            <div className="text-center">
              <h2 className="text-[#23110C] mb-2">المزيد</h2>
              <p className="text-[#6B7280]">قريباً...</p>
            </div>
          </div>
        );
      default:
        return (
          <HomePage
            onNavigate={handleNavigate}
            onProductClick={() => setShowProductDetails(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {renderPage()}
      {!showProductDetails && currentPage !== 'reels' && (
        <BottomNavigation currentPage={currentPage} onNavigate={handleNavigate} />
      )}
    </div>
  );
}
