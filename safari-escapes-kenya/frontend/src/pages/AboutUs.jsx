import { Link } from 'react-router-dom';
import { Leaf, Users, MapPin, Shield } from 'lucide-react';

const VALUES = [
  { icon: Leaf, iconBg: '#D1FAE5', iconColor: '#059669', title: 'Ethical Tourism', body: 'We actively support conservation projects and community-based tourism across all six ecosystems.' },
  { icon: Users, iconBg: '#DBEAFE', iconColor: '#2563EB', title: 'Small Groups', body: 'Maximum 8 travelers per vehicle — intimate, immersive, and never a cattle-truck experience.' },
  { icon: MapPin, iconBg: '#FEF3C7', iconColor: '#D97706', title: 'Local Guides', body: 'Every guide was born near the reserves they lead. Local knowledge, global standards.' },
  { icon: Shield, iconBg: '#FCE7F3', iconColor: '#DB2777', title: '100% Transparent', body: 'No hidden fees. No bait-and-switch pricing. What you see is exactly what you pay.' },
];

const TEAM_IMG_1 = 'https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327173804_17_6.jpg?alt=media&token=2deaeb52-ef85-4a5f-a9e7-d258d4262e81';

const TEAM = [
  {
    name: 'James',
    role: 'Head Safari Guide',
    img: TEAM_IMG_1,
    bio: '12 years tracking wildlife in Masai Mara',
  },
];

export default function AboutUs() {
  return (
    <div style={{ background: 'var(--ivory)' }}>

      {/* Hero */}
      <section style={{ position: 'relative', height: 500, overflow: 'hidden' }}>
        <img
          src="https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327173816_25_6.jpg?alt=media&token=feedfd07-f1d1-4c8a-a27c-7d73f8ce1e5d"
          alt="Safari landscape"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(12,26,18,0.3), rgba(12,26,18,0.7))',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '0 24px',
        }}>
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>FOUNDER'S STORY</p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900,
            color: 'white', lineHeight: 1.1,
          }}>
            Kenya deserves<br />
            <em>to be seen properly</em>
          </h1>
          <p style={{
            fontFamily: "'Outfit'", fontSize: 18,
            color: 'rgba(255,255,255,0.8)', maxWidth: 560, marginTop: 20,
          }}>
            "I didn't start Sight Seekers to build a business. I started it because Kenya deserves to be seen properly."
          </p>
        </div>
      </section>

      {/* Story section */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 64, alignItems: 'center' }}
            className="story-grid">
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(28px, 3vw, 40px)', fontStyle: 'italic',
                color: 'var(--charcoal)', lineHeight: 1.3, marginBottom: 32,
              }}>
                "I didn't start Sight Seekers to build a business. I started it because Kenya deserves to be seen properly."
              </h2>
              <p style={{ fontFamily: "'Outfit'", fontSize: 16, color: 'var(--stone)', lineHeight: 1.8, marginBottom: 20 }}>
                James has spent most of his life in the wild. Long before he founded Sight Seekers, he was the guide —
                the one waking up before dawn, reading the grass, knowing which trail the elephants took the night before.
                Years of leading tourists through the Maasai Mara, Amboseli, and the Great Rift Valley gave him something
                no classroom could: an unshakeable understanding of Kenya's soul.
              </p>
              <p style={{ fontFamily: "'Outfit'", fontSize: 16, color: 'var(--stone)', lineHeight: 1.8, marginBottom: 20 }}>
                What he kept seeing frustrated him. Travelers arriving with wonder, only to be rushed through game drives,
                packed into overcrowded vans, and handed generic itineraries copy-pasted from a brochure. Kenya was being
                undersold. The wildlife was being disrespected. The experience was being commodified.
              </p>
              <p style={{ fontFamily: "'Outfit'", fontSize: 16, color: 'var(--stone)', lineHeight: 1.8, marginBottom: 20 }}>
                In 2025, James founded Sight Seekers — a small, intentional safari company built on one belief: that every
                traveler deserves to truly see Kenya, not just pass through it.
              </p>
              <p style={{
                fontFamily: "'Playfair Display', serif", fontSize: 18, fontStyle: 'italic',
                color: 'var(--charcoal)', lineHeight: 1.6,
              }}>
                We are new. We are small. And that is exactly the point.
              </p>
            </div>
            <div>
              <img
                src="https://firebasestorage.googleapis.com/v0/b/sightseekers-c3892.firebasestorage.app/o/Weixin%20Image_20260327191536_131_6.jpg?alt=media&token=dadfac6b-9783-4697-b5e5-294ef62c1205"
                alt="Safari in Kenya"
                style={{ width: '100%', borderRadius: 24, objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values — dark bg */}
      <section className="section" style={{ background: 'var(--night)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>OUR PRINCIPLES</p>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'white',
            }}>What we stand for</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}
            className="values-grid">
            {VALUES.map(({ icon: Icon, iconBg, iconColor, title, body }) => (
              <div key={title} style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20, padding: 32,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', background: iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                }}>
                  <Icon size={22} color={iconColor} />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: 'white', marginBottom: 12 }}>
                  {title}
                </h3>
                <p style={{ fontFamily: "'Outfit'", fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .values-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 480px) {
            .values-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="eyebrow" style={{ color: 'var(--stone)', marginBottom: 16 }}>THE TEAM</p>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'var(--charcoal)',
            }}>The people behind the magic</h2>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}
            className="team-grid">
            {TEAM.map((member) => (
              <div key={member.name} style={{ textAlign: 'center' }}>
                <img
                  src={member.img}
                  alt={member.name}
                  style={{
                    width: 100, height: 100, borderRadius: '50%',
                    objectFit: 'cover', margin: '0 auto 16px',
                    border: '3px solid var(--mist)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  }}
                />
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--charcoal)', marginBottom: 4 }}>
                  {member.name}
                </h3>
                <p style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--gold)', fontWeight: 500, marginBottom: 8 }}>
                  {member.role}
                </p>
                <p style={{ fontFamily: "'Outfit'", fontSize: 13, color: 'var(--stone)' }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .team-grid { grid-template-columns: 1fr !important; }
            .story-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--mist)', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <p className="eyebrow" style={{ color: 'var(--stone)', marginBottom: 16 }}>THE NEXT STEP</p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700,
            color: 'var(--charcoal)', marginBottom: 32,
          }}>Ready for your adventure?</h2>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/packages" className="btn-earth">Browse Packages</Link>
            <Link to="/about" className="btn-outline">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
