import Image from "next/image";
import TopNavBar from "@/components/layout/TopNavBar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import GradientBackground from "@/components/layout/GradientBackground";
import FadeIn from "@/components/layout/FadeIn";

export default function ContactPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <GradientBackground />
      <TopNavBar />

      <main className="flex-grow flex flex-col pb-24 md:pb-0">
        {/* Brand Story Section */}
        <section className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-10 md:py-24 w-full grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-gutter)] items-center">
          <FadeIn
            className="flex flex-col gap-[var(--spacing-stack-md)] order-2 md:order-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-tertiary uppercase tracking-widest">
              About Saaral
            </span>
            <h1 className="font-display text-[32px] md:text-[48px] leading-[1.2] md:tracking-[-0.01em] text-on-surface tracking-tight">
              Apothecary Heritage,
              <br />
              Modern Rituals.
            </h1>
            <p className="font-body text-[16px] md:text-[18px] leading-[1.6] text-on-surface-variant max-w-lg">
              Born from a lineage of traditional botanical mastery, Saaral
              Cosmetics bridges the gap between ancient apothecary wisdom and
              contemporary skincare science. We believe in the tactile luxury
              of natural ingredients, ethically sourced and meticulously
              blended to elevate your daily self-care into a restorative
              ritual.
            </p>
          </FadeIn>
          <FadeIn
            className="order-1 md:order-2 w-full h-[320px] md:h-[500px] rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(26,26,26,0.04)] bg-surface-container"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYm5e8wFw8uCH6-vUQeq_660IPZb1B8-AC72bicZ5s2kWSba9lkHGD9ajh9BnhPbsRxGG9yfgMNRpDifOXbbktBxLtOXRIJVGMSBQkhF-8Y0vqYWuEw1bIp8WZ2mLzTSjHWSvqze9WO-I8IjwFdsboJnyrxC0OSm_GnuwMXYqx49N-jPCp5zRhLobl6dvkxNA1xyG04IY08mwCje-jruD29DGfTq_vCIY8gGokT2HDaH1OXDbB5MDsl96bnEbtR4KjbPx96iu0Nkva"
              alt="Saaral Apothecary Heritage — amber glass bottles on marble"
              width={640}
              height={500}
              className="w-full h-full object-cover"
            />
          </FadeIn>
        </section>

        {/* Divider */}
        <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] w-full">
          <hr className="border-t border-outline-variant/30 my-[var(--spacing-stack-sm)]" />
        </div>

        {/* Contact Bento Grid */}
        <section className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-stack-lg)] w-full flex flex-col gap-[var(--spacing-stack-lg)]">
          <FadeIn
            className="text-center max-w-2xl mx-auto flex flex-col gap-[var(--spacing-stack-sm)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-[28px] md:text-[32px] leading-[1.3] text-on-surface">
              Get in Touch
            </h2>
            <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant">
              Our concierge team is available to assist you with bespoke
              product recommendations and order inquiries.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-gutter)]">
            {/* WhatsApp CTA Card */}
            <FadeIn
              className="md:col-span-2 bg-surface-container-low rounded-xl p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] flex flex-col justify-between items-start gap-[var(--spacing-stack-lg)] border border-outline-variant/20 shadow-[0_10px_30px_rgba(26,26,26,0.03)] group transition-all duration-300 hover:shadow-[0_15px_40px_rgba(201,169,110,0.08)]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-col gap-[var(--spacing-stack-sm)]">
                <span className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-tertiary flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    forum
                  </span>
                  Priority Support
                </span>
                <h3 className="font-display text-[28px] md:text-[32px] leading-[1.3] text-on-surface">
                  Chat with our Apothecary Experts
                </h3>
                <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant max-w-md">
                  For immediate assistance, formulation advice, or urgent order
                  updates, connect with us directly via WhatsApp. Available
                  Monday to Friday, 9am - 6pm EST.
                </p>
              </div>
              <a
                href="https://wa.me/918428251423?text=Hi%2C%20I%20have%20a%20question%20about%20Saaral%20Cosmetics"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-primary text-on-primary px-8 py-4 rounded-full font-body text-[16px] leading-[1.6] font-medium flex items-center justify-center gap-3 hover:bg-[#9d4d6e] active:scale-95 transition-all duration-200"
              >
                <span className="material-symbols-outlined">chat</span>
                Start WhatsApp Chat
              </a>
            </FadeIn>

            {/* Contact Info Cards */}
            <div className="flex flex-col gap-[var(--spacing-gutter)]">
              {/* Email Card */}
              <FadeIn
                className="bg-surface-container-lowest rounded-xl p-[var(--spacing-stack-md)] flex flex-col gap-[var(--spacing-stack-sm)] border border-outline-variant/40 shadow-[0_5px_15px_rgba(26,26,26,0.02)] flex-1 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <span className="material-symbols-outlined text-tertiary-container text-3xl">
                  mail
                </span>
                <h4 className="font-body text-[18px] leading-[1.6] font-medium text-on-surface mt-2">
                  Email Inquiries
                </h4>
                <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant mb-2">
                  For wholesale, press, or general questions.
                </p>
                <a
                  href="mailto:saaralcosmetics@gmail.com"
                  className="font-body text-[16px] leading-[1.6] text-primary hover:text-tertiary transition-colors border-b border-transparent hover:border-tertiary inline-block w-max break-all pb-1"
                >
                  saaralcosmetics@gmail.com
                </a>
              </FadeIn>

              {/* Instagram Card */}
              <FadeIn
                className="bg-surface-container-lowest rounded-xl p-[var(--spacing-stack-md)] flex flex-col gap-[var(--spacing-stack-sm)] border border-outline-variant/40 shadow-[0_5px_15px_rgba(26,26,26,0.02)] flex-1 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <span className="material-symbols-outlined text-tertiary-container text-3xl">
                  photo_camera
                </span>
                <h4 className="font-body text-[18px] leading-[1.6] font-medium text-on-surface mt-2">
                  Follow Our Journey
                </h4>
                <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant mb-2">
                  See our behind-the-scenes, rituals, and new launches.
                </p>
                <a
                  href="https://www.instagram.com/saaral_cosmetics/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-[16px] leading-[1.6] text-primary hover:text-tertiary transition-colors border-b border-transparent hover:border-tertiary inline-block w-max break-all pb-1"
                >
                  @saaral_cosmetics
                </a>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
      <WhatsAppFAB />
    </div>
  );
}
