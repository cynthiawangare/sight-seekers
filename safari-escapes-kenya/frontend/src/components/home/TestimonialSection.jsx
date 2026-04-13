export default function TestimonialSection() {
  return (
    <section style={{ background: '#0D1F1A', padding: '120px 40px', textAlign: 'center' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Heading */}
        <div style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--savanna-gold)', marginBottom: 14 }}>
            Traveler Stories
          </p>
          <h2 className="section-heading" style={{ fontSize: 'clamp(34px, 4.5vw, 54px)', color: '#fff' }}>
            The reviews speak{' '}
            <em style={{ color: 'var(--savanna-gold)', fontStyle: 'italic' }}>for themselves</em>
          </h2>
        </div>

        {/* Letter card */}
        <div style={{ position: 'relative', display: 'inline-block', maxWidth: 600, width: '100%', margin: '0 auto' }}>

          {/* Sticky note — floating top-right */}
          <div style={{
            position: 'absolute',
            top: -20, right: -20,
            background: '#FEF08A',
            padding: '12px 16px',
            borderRadius: 4,
            transform: 'rotate(8deg)',
            fontFamily: 'Caveat, cursive',
            fontSize: 16,
            fontWeight: 600,
            color: '#78350f',
            boxShadow: '2px 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10,
            whiteSpace: 'nowrap',
            animation: 'float 6s ease-in-out infinite',
          }}>
            5 stars! ⭐⭐⭐⭐⭐
          </div>

          {/* White letter card */}
          <div style={{
            background: '#fff',
            borderRadius: 24,
            padding: 48,
            boxShadow: '0 32px 80px rgba(0,0,0,0.40)',
            textAlign: 'left',
            fontFamily: 'DM Sans, sans-serif',
          }}>
            <p style={{ fontSize: 15, color: 'var(--body-gray)', lineHeight: 1.8, margin: 0 }}>
              Dear Sight Seekers,
            </p>
            <br />
            <p style={{ fontSize: 15, color: 'var(--near-black)', lineHeight: 1.85, margin: 0 }}>
              I've traveled to 14 countries and nothing compared to the Masai Mara at sunrise. Our guide Emmanuel knew every animal by name. The booking through your website was seamless and M-Pesa payment worked perfectly.
            </p>
            <br />
            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 20 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--near-black)' }}>
                Li Wei 🇨🇳
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--body-gray)' }}>
                Verified Traveler · Masai Mara Adventure · August 2024
              </p>
            </div>
          </div>
        </div>

        <p style={{ marginTop: 40, fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
          4.9 ★ average · 2,400+ verified reviews
        </p>
      </div>
    </section>
  );
}
