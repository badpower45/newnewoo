import React from 'react';

interface FlyerPage {
    id: number;
    image: string;
    title: string;
}

interface FlyerCarouselProps {
    pages: FlyerPage[];
}

const FlyerCarousel: React.FC<FlyerCarouselProps> = ({ pages }) => {
    return (
        <div className="py-6 bg-orange-50 -mx-4 px-4 md:mx-0 md:px-0 md:rounded-2xl md:p-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Weekly Magazine</h3>
                    <p className="text-sm text-gray-500">Best offers for this week!</p>
                </div>
                <button className="text-primary font-bold text-sm hover:underline">View All</button>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar snap-x">
                {pages.map((page) => (
                    <div key={page.id} className="snap-center flex-shrink-0 w-48 md:w-64 rounded-xl overflow-hidden shadow-lg border-4 border-white transform hover:-rotate-1 transition-transform duration-300 cursor-pointer">
                        <img
                            src={page.image}
                            alt={page.title}
                            className="w-full h-64 md:h-80 object-cover"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FlyerCarousel;
