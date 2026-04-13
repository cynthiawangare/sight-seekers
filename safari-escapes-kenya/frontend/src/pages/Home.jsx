import HeroBanner from '../components/home/HeroBanner';
import ValueProposition from '../components/home/ValueProposition';
import PackagesSection from '../components/home/PackagesSection';
import WildlifeStrip from '../components/home/WildlifeStrip';
import HowItWorks from '../components/home/HowItWorks';
import BentoGallery from '../components/home/BentoGallery';
import ReviewsSection from '../components/home/ReviewsSection';
import ContactSection from '../components/home/ContactSection';

export default function Home() {
  return (
    <div style={{ background: 'var(--ivory)' }}>
      <HeroBanner />
      <ValueProposition />
      <PackagesSection />
      <WildlifeStrip />
      <HowItWorks />
      <BentoGallery />
      <ReviewsSection />
      <ContactSection />
    </div>
  );
}
