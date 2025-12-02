import { Heart, MessageCircle, Share2, ChefHat, Plus } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ReelsPage() {
  const [isLiked, setIsLiked] = useState(false);

  const reel = {
    username: '@Chef_Aloosh',
    caption: 'أفضل وصفة معكرونة لرمضان! 🍝 #وصفات_علوش',
    likes: '1.2K',
    comments: '450',
    product: {
      name: 'معكرونة ريجينا 400 جرام',
      price: '12.50 جنيه',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop'
    }
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-black relative overflow-hidden">
      {/* Full-screen Background Video/Image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=1200&fit=crop"
          alt="Cooking pasta"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="text-white text-xl" style={{ fontWeight: 700 }}>
            ريلز علوش
          </span>
        </div>
      </div>

      {/* Right Sidebar Actions */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-6">
        {/* Like Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-1 hover:bg-white/30 transition-all"
          >
            <Heart
              className={`w-6 h-6 ${isLiked ? 'fill-[#F97316] text-[#F97316]' : 'text-white'}`}
            />
          </button>
          <span className="text-white text-sm">{reel.likes}</span>
        </div>

        {/* Comment Button */}
        <div className="flex flex-col items-center">
          <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-1 hover:bg-white/30 transition-all">
            <MessageCircle className="w-6 h-6 text-white" />
          </button>
          <span className="text-white text-sm">{reel.comments}</span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center">
          <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all">
            <Share2 className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Recipe Icon */}
        <div className="flex flex-col items-center">
          <button className="w-12 h-12 rounded-full bg-[#F97316] flex items-center justify-center shadow-lg hover:bg-[#ea580c] transition-all">
            <ChefHat className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-20 right-4 left-4">
        {/* User Profile */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F97316] to-[#ea580c] flex items-center justify-center text-white">
            👨‍🍳
          </div>
          <span className="text-white" style={{ fontWeight: 600 }}>
            {reel.username}
          </span>
          <button className="px-4 py-1 bg-transparent border-2 border-white text-white rounded-full text-sm hover:bg-white/10 transition-all">
            متابعة
          </button>
        </div>

        {/* Caption */}
        <p className="text-white mb-4">
          {reel.caption}
        </p>

        {/* Shoppable Product Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 shadow-xl">
          <ImageWithFallback
            src={reel.product.image}
            alt={reel.product.name}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div className="flex-1">
            <p className="text-[#23110C] text-sm mb-1" style={{ fontWeight: 600 }}>
              {reel.product.name}
            </p>
            <p className="text-[#F97316]" style={{ fontWeight: 700 }}>
              {reel.product.price}
            </p>
          </div>
          <button className="w-10 h-10 bg-[#F97316] rounded-full flex items-center justify-center shadow-lg hover:bg-[#ea580c] transition-all">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
