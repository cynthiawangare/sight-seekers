import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useLanguage } from '../../context/LanguageContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SAFARI_LOCATIONS = [
  { name: 'Masai Mara', lat: -1.5021, lng: 35.1448, emoji: '🦁', desc: 'Lions, Leopards, Wildebeest Migration' },
  { name: 'Amboseli', lat: -2.6527, lng: 37.2563, emoji: '🐘', desc: 'Elephants with Mt. Kilimanjaro backdrop' },
  { name: 'Samburu', lat: 0.6000, lng: 37.5500, emoji: '🦒', desc: 'Giraffes, Grevy\'s Zebra, Reticulated Giraffe' },
  { name: 'Tsavo', lat: -2.9833, lng: 38.4833, emoji: '🐆', desc: 'Leopards, Lions, Red Elephants' },
  { name: 'Lake Nakuru', lat: -0.3031, lng: 36.0800, emoji: '🦩', desc: 'Flamingos, Rhinos, Pelicans' },
  { name: 'Ol Pejeta', lat: 0.0167, lng: 36.9000, emoji: '🦏', desc: 'Black Rhinos, Chimpanzees' },
  { name: 'Lake Naivasha', lat: -0.7667, lng: 36.3500, emoji: '🦅', desc: 'Fish Eagles, Hippos, Boat Safaris' },
  { name: 'Nairobi', lat: -1.2921, lng: 36.8219, emoji: '🌆', desc: 'Nairobi National Park, Gateway City' },
];

const PILL_KEYS = [
  { emoji: '🦁', key: 'wildlife_lion' },
  { emoji: '🐘', key: 'wildlife_elephant' },
  { emoji: '🦒', key: 'wildlife_giraffe' },
  { emoji: '🐆', key: 'wildlife_leopard' },
  { emoji: '🦓', key: 'wildlife_zebra' },
  { emoji: '🦩', key: 'wildlife_flamingo' },
  { emoji: '🦏', key: 'wildlife_rhino' },
  { emoji: '🐊', key: 'wildlife_croc' },
  { emoji: '🦅', key: 'wildlife_eagle' },
];

// Custom emoji marker
function emojiIcon(emoji) {
  return L.divIcon({
    html: `<div style="
      background: white;
      border-radius: 50%;
      width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      border: 2px solid #fff;
    ">${emoji}</div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24],
  });
}

export default function WildlifeStrip() {
  const { t } = useLanguage();
  const PILLS = PILL_KEYS.map((p) => ({ ...p, label: t(p.key) }));
  return (
    <section className="section" style={{ background: 'var(--ivory)', overflow: 'hidden' }}>
      <div className="container" style={{ marginBottom: 48 }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700,
            color: 'var(--charcoal)', marginBottom: 12,
          }}>
            <em>{t('wildlife_title')}</em>
          </h2>
          <p style={{ fontFamily: "'Outfit'", fontSize: 18, color: 'var(--stone)' }}>
            {t('wildlife_sub')}{' '}
            <span style={{
              textDecoration: 'underline', textDecorationColor: 'var(--gold)',
              textDecorationThickness: 3, textUnderlineOffset: 4,
            }}>{t('wildlife_fast')}</span>
          </p>
        </div>
      </div>

      {/* White pills strip */}
      <div style={{ overflow: 'hidden', marginBottom: 8 }}>
        <div className="strip-track" style={{
          display: 'flex', gap: 12, padding: '8px 0',
          animation: 'scrollLeft 30s linear infinite', width: 'max-content',
        }}>
          {[...PILLS, ...PILLS].map((pill, i) => (
            <span key={i} style={{
              background: 'white', border: '1px solid #E5E7EB', borderRadius: 100,
              padding: '10px 20px', fontFamily: "'Outfit'", fontSize: 13, fontWeight: 500,
              display: 'inline-flex', gap: 8, alignItems: 'center',
              whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              {pill.emoji} {pill.label}
            </span>
          ))}
        </div>
      </div>

      {/* Dark pills strip — reversed */}
      <div style={{ overflow: 'hidden', marginBottom: 56 }}>
        <div className="strip-track" style={{
          display: 'flex', gap: 12, padding: '8px 0',
          animation: 'scrollLeft 24s linear infinite reverse', width: 'max-content',
        }}>
          {[...PILLS.slice().reverse(), ...PILLS.slice().reverse()].map((pill, i) => (
            <span key={i} style={{
              background: 'var(--charcoal)', color: 'white', borderRadius: 100,
              padding: '10px 20px', fontFamily: "'Outfit'", fontSize: 13, fontWeight: 500,
              display: 'inline-flex', gap: 8, alignItems: 'center',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {pill.emoji} {pill.label}
            </span>
          ))}
        </div>
      </div>

      {/* Interactive Leaflet Map */}
      <div className="container">
        <div style={{ borderRadius: 24, overflow: 'hidden', height: 'clamp(350px, 45vw, 520px)', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}>
          <MapContainer
            center={[-1.0, 37.5]}
            zoom={6}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {SAFARI_LOCATIONS.map((loc) => (
              <Marker
                key={loc.name}
                position={[loc.lat, loc.lng]}
                icon={emojiIcon(loc.emoji)}
              >
                <Popup>
                  <div style={{ fontFamily: "'Outfit', sans-serif", minWidth: 160 }}>
                    <strong style={{ fontSize: 14 }}>{loc.emoji} {loc.name}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>{loc.desc}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Map legend */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20, justifyContent: 'center',
        }}>
          {SAFARI_LOCATIONS.map((loc) => (
            <span key={loc.name} style={{
              background: 'white', border: '1px solid #E5E7EB', borderRadius: 100,
              padding: '6px 14px', fontFamily: "'Outfit'", fontSize: 12, fontWeight: 500,
              color: 'var(--charcoal)', boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            }}>
              {loc.emoji} {loc.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
