import React from 'react';

const FullPageSkeleton = () => {
    return (
        <div className="bg-[#FAFAFA] min-h-screen pb-24 md:pb-8">
            {/* TopBar Skeleton */}
            <div className="bg-white shadow-sm">
                <div className="px-4 py-3">
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
            </div>

            <div className="px-4 py-3 space-y-5 max-w-7xl mx-auto">
                {/* Stories Section Skeleton */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="h-2 w-12 bg-gray-200 rounded mt-1 animate-pulse mx-auto"></div>
                        </div>
                    ))}
                </div>

                {/* Hero Carousel Skeleton */}
                <div className="mt-8">
                    <div className="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
                </div>

                {/* Featured Brands Skeleton */}
                <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                </div>

                {/* Brands Carousel Skeleton */}
                <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                </div>

                {/* Brand Offers Skeleton */}
                <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-36 animate-pulse"></div>
                    <div className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
                </div>

                {/* Quick Access (Hot Deals & Magazine) Skeleton */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
                    <div className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
                </div>

                {/* Dynamic Sections Skeleton */}
                {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-4">
                        {/* Section Title */}
                        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                        
                        {/* Section Banner */}
                        <div className="h-44 bg-gray-200 rounded-2xl animate-pulse"></div>
                        
                        {/* Products Grid */}
                        <div className="grid grid-cols-4 gap-3">
                            {[1, 2, 3, 4].map(j => (
                                <div key={j} className="space-y-2">
                                    {/* Product Image */}
                                    <div className="aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
                                    {/* Product Name */}
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                    {/* Product Price */}
                                    <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Facebook Reels Skeleton */}
                <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-44 animate-pulse"></div>
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2].map(i => (
                            <div key={i} className="aspect-[9/16] bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FullPageSkeleton;
