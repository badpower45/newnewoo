import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductUploadPage = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Redirect to the new Product Importer page
        navigate('/admin/import', { replace: true });
    }, [navigate]);

    return (
        <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">جاري التحويل إلى صفحة الاستيراد...</p>
        </div>
    );
};

export default ProductUploadPage;
