import React from 'react';

interface SponsoredAd {
    id: number;
    image: string;
    title: string;
}

interface SponsoredAdsProps {
    ads: SponsoredAd[];
    layout?: 'grid' | 'carousel';
}

const SponsoredAds: React.FC<SponsoredAdsProps> = ({ ads, layout = 'carousel' }) => {
    return (
        <div className="py-4">
            {/* Minimal Header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-lg font-bold text-gray-800 tracking-tight">Featured Brands</h3>
            </div>

            {layout === 'grid' ? (
                <div className="grid grid-cols-2 gap-3">
                    {ads.map((ad) => (
                        <div key={ad.id} className="group relative overflow-hidden rounded-2xl bg-gray-100 aspect-[16/9] cursor-pointer">
                            <img
                                src={ad.image}
                                alt={ad.title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-3 left-3">
                                <span className="text-white font-semibold text-sm tracking-wide">{ad.title}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex space-x-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    {ads.map((ad) => (
                        <div key={ad.id} className="flex-shrink-0 w-64 group relative overflow-hidden rounded-2xl bg-gray-100 aspect-[2/1] cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                            <img
                                src={ad.image}
                                alt={ad.title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent opacity-60" />
                            <div className="absolute bottom-3 left-4">
                                <span className="text-white font-bold text-lg">{ad.title}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SponsoredAds;
