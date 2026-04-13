import { useState } from 'react';
import { Hotel, Home, Wifi, Coffee, Waves, Car } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const lodges = [
  { name: 'Samburu Intrepids Camp', location: 'Samburu National Reserve', stars: 5 },
  { name: 'Mara Serena Safari Lodge', location: 'Masai Mara', stars: 5 },
  { name: 'Ol Pejeta Bush Camp', location: 'Ol Pejeta Conservancy', stars: 4 },
];

export default function AccommodationSection() {
  const [showLodgesModal, setShowLodgesModal] = useState(false);
  const { t } = useLanguage();

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-primary font-playfair mb-3">
            {t('acc_title')}
          </h2>
          <p className="text-gray-600">{t('acc_sub')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Hotel card */}
          <div className="border border-gray-200 rounded-2xl p-8 hover:border-blue-primary hover:shadow-lg transition-all group">
            <div className="w-14 h-14 bg-blue-primary/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-primary/20 transition-colors">
              <Hotel className="text-blue-primary" size={28} />
            </div>
            <h3 className="text-xl font-bold font-playfair text-gray-900 mb-2">{t('acc_hotel_title')}</h3>
            <p className="text-gray-600 text-sm mb-5">{t('acc_hotel_sub')}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['WiFi', 'Full Board', 'Pool', 'Game Drives'].map((f) => (
                <span key={f} className="bg-blue-primary/10 text-blue-primary text-xs font-medium px-3 py-1 rounded-full">{f}</span>
              ))}
            </div>
            <button
              onClick={() => setShowLodgesModal(true)}
              className="w-full bg-blue-primary hover:bg-blue-light text-white py-3 rounded-xl font-semibold transition-colors"
            >
              {t('acc_hotel_btn')}
            </button>
          </div>

          {/* Airbnb card */}
          <div className="border border-gray-200 rounded-2xl p-8 hover:border-brown-primary hover:shadow-lg transition-all group">
            <div className="w-14 h-14 bg-brown-primary/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-brown-primary/20 transition-colors">
              <Home className="text-brown-primary" size={28} />
            </div>
            <h3 className="text-xl font-bold font-playfair text-gray-900 mb-2">{t('acc_airbnb_title')}</h3>
            <p className="text-gray-600 text-sm mb-5">{t('acc_airbnb_sub')}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['Self-catering', 'Local host', 'Flexible check-in', 'Unique stays'].map((f) => (
                <span key={f} className="bg-brown-primary/10 text-brown-primary text-xs font-medium px-3 py-1 rounded-full">{f}</span>
              ))}
            </div>
            <button
              onClick={() => window.open('https://www.airbnb.com/s/Kenya/homes', '_blank')}
              className="w-full bg-brown-primary hover:bg-brown-light text-white py-3 rounded-xl font-semibold transition-colors"
            >
              {t('acc_airbnb_btn')}
            </button>
          </div>
        </div>
      </div>

      {/* Lodges Modal */}
      {showLodgesModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowLodgesModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold font-playfair text-blue-primary mb-4">{t('acc_lodges_title')}</h3>
            <div className="space-y-4">
              {lodges.map((lodge) => (
                <div key={lodge.name} className="flex items-start gap-3 p-3 rounded-xl bg-gray-light">
                  <Hotel className="text-blue-primary mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{lodge.name}</p>
                    <p className="text-xs text-gray-500">{lodge.location}</p>
                    <div className="flex mt-1">
                      {Array.from({ length: lodge.stars }).map((_, i) => (
                        <span key={i} className="text-amber-400 text-xs">★</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowLodgesModal(false)} className="mt-5 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition-colors">{t('acc_close')}</button>
          </div>
        </div>
      )}
    </section>
  );
}
