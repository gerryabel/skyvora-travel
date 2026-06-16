// app/page.tsx — Landing Page Skyvora Travel
import Hero from "@/components/landing/hero";
import KenapaSkyvora from "@/components/landing/kenapa-skyvora";
import Layanan from "@/components/landing/layanan";
import CaraPesan from "@/components/landing/cara-pesan";
import Testimonial from "@/components/landing/testimonial";
import FAQ from "@/components/landing/faq";
import CTA from "@/components/landing/cta";

export default function Home() {
  return (
    <>
      <Hero />
      <KenapaSkyvora />
      <Layanan />
      <CaraPesan />
      <Testimonial />
      <FAQ />
      <CTA />
    </>
  );
}
