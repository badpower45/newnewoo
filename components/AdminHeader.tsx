import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
    title: string;
    backPath?: string;
    rightButton?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, backPath = '/more', rightButton }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white border-b sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate(backPath)} 
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                    </div>
                    {rightButton && (
                        <div>
                            {rightButton}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminHeader;
