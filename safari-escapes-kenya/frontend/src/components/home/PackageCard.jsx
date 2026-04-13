import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Users, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export default function PackageCard({ pkg }) {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);

  const discountedPrice = pkg.discount_percent > 0
    ? Math.round(pkg.price_per_person * (1 - pkg.discount_percent / 100))
    : null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={pkg.images?.[0] || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600'}
          alt={pkg.name}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop'; e.target.onerror = null; }}
          className={clsx(
            'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105',
            imgLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
        {!imgLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

        {/* Tour type badge */}
        <span className="absolute top-3 left-3 bg-blue-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {pkg.tour_type}
        </span>

        {/* Featured badge */}
        {pkg.is_featured && (
          <span className="absolute top-3 right-3 bg-amber-400 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            FEATURED
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 font-playfair text-lg leading-tight mb-1">
          {pkg.name}
        </h3>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
          <span className="flex items-center gap-1"><Clock size={12} /> {pkg.duration_days} Days · {pkg.duration_days - 1} Nights</span>
          <span className="flex items-center gap-1"><Users size={12} /> Max {pkg.max_travelers}</span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-3 flex-1">
          {pkg.short_description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} size={13} className="fill-amber-400 text-amber-400" />
          ))}
          <span className="text-xs text-gray-500 ml-1">4.9 (24 reviews)</span>
        </div>

        {/* Price & buttons */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div>
            {discountedPrice ? (
              <div>
                <p className="text-xs text-gray-400 line-through">${pkg.price_per_person}</p>
                <p className="text-lg font-bold text-brown-primary">${discountedPrice}<span className="text-xs font-normal text-gray-500"> /person</span></p>
              </div>
            ) : (
              <p className="text-lg font-bold text-brown-primary">
                ${pkg.price_per_person}<span className="text-xs font-normal text-gray-500"> /person</span>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/packages/${pkg.slug}`)}
              className="text-xs border border-gray-300 text-gray-600 hover:border-blue-primary hover:text-blue-primary rounded-lg px-3 py-2 transition-colors"
            >
              Details
            </button>
            <button
              onClick={() => navigate(`/enquiry/${pkg.slug}`)}
              className="text-xs bg-brown-primary hover:bg-brown-light text-white rounded-lg px-3 py-2 font-semibold transition-colors"
            >
              Enquire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
