import Hero from "../components/Hero";
import TrustStrip from "../components/TrustStrip";
import ShopByCategory from "../components/ShopByCategory";

import FeatureBanner from "../components/FeatureBanner";
import AboutSection from "../components/AboutSection";
import DealsOfWeek from "../components/DealsOfWeek";
import FeaturedSection from "../components/FeaturedSection";
import Testimonials from "../components/Testimonials";
import NewsletterCTA from "../components/NewsletterCTA";

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustStrip />
      <ShopByCategory />
      <FeaturedSection />
      <DealsOfWeek />
      <FeatureBanner />
      <AboutSection />
      <Testimonials />
      <NewsletterCTA />
    </main>
  );
}