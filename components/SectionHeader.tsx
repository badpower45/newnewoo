import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SectionHeaderProps {
    title: string;
    linkText?: string;
    linkTo?: string;
    children?: React.ReactNode;
}

export default function SectionHeader({ title, linkText = "عرض الكل", linkTo = "/products", children }: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6 md:mb-8 border-r-4 border-brand-orange pr-4">
            <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-3xl font-extrabold text-brand-brown font-header leading-tight">{title}</h2>
                {children}
            </div>
            <Link to={linkTo} className="group flex items-center text-xs md:text-sm font-bold text-brand-orange hover:text-brand-brown transition-colors">
                {linkText} <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
