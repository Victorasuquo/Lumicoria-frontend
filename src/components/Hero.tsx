import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, Check } from 'lucide-react';

const TRUST = ['21 production agents', '6 model providers', 'Multi-region', 'SOC 2 underway'];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Dashboard scrub: as the hero scrolls, the dashboard image rises and settles.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const dashY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-hero-pattern pt-24 md:pt-32 pb-0"
    >
      {/* Ambient blurred orbs (existing theme) */}
      <motion.div
        style={{ y: orbY }}
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[760px] h-[760px] max-w-none"
      >
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-lumicoria-lightPurple/30 rounded-full filter blur-[90px]" />
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-lumicoria-blue/20 rounded-full filter blur-[90px]" />
        <div className="absolute top-40 left-1/3 w-64 h-64 bg-lumicoria-purple/15 rounded-full filter blur-[90px]" />
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        {/* ── Centered hero copy ── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="font-hero max-w-4xl mx-auto text-center"
        >
          <motion.h1
            variants={item}
            className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-[-0.035em] mb-6 text-gray-900"
          >
            The operating environment for{' '}
            <span className="gradient-text">AI-powered work</span>.
          </motion.h1>

          <motion.p
            variants={item}
            className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto mb-7 leading-relaxed"
          >
            Twenty-one production AI agents. Six model providers. One environment to build, deploy, and govern them.
          </motion.p>

          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5"
          >
            <Button asChild className="bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white py-6 px-8 text-base btn-hover-effect shadow-lg shadow-lumicoria-purple/25 hover:scale-[1.03] transition-transform">
              <Link to="/signup">
                <span className="flex items-center gap-2">Start free <ArrowRight size={18} /></span>
              </Link>
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-lumicoria-purple/40 text-lumicoria-purple hover:bg-lumicoria-purple/5 py-6 px-8 text-base"
                >
                  <span>Book a demo</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[900px] p-0 border-none bg-black/80 shadow-2xl">
                <div className="aspect-video w-full rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/zFcxA9T_BWs?si=Ov_7CYjzlUFjHYZ0&autoplay=1"
                    title="Lumicoria Demo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                </div>
              </DialogContent>
            </Dialog>

            <a
              href="/enterprise"
              className="text-base font-medium text-gray-600 hover:text-lumicoria-purple transition-colors underline-offset-4 hover:underline px-2 py-2"
            >
              Talk to our Enterprise team
            </a>
          </motion.div>

          <motion.div
            variants={item}
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-12"
          >
            {TRUST.map((t, i) => (
              <React.Fragment key={t}>
                {i > 0 && <span className="hidden sm:inline h-1 w-1 rounded-full bg-gray-300" />}
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Check size={14} className="text-lumicoria-purple shrink-0" />
                  {t}
                </span>
              </React.Fragment>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Dashboard image, top edge peeking under the hero (visible on load) ── */}
        <motion.div style={{ y: dashY }} className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <DashboardImage />
          </motion.div>
        </motion.div>
      </div>

      {/* Soft fade where the dashboard meets the next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 z-20"
        style={{ background: 'linear-gradient(180deg, transparent, #ffffff)' }}
      />
    </section>
  );
};

/**
 * Real product image. Drop the screenshot at /public/images/dashboard-hero.png
 * and it renders automatically. Until then, a clean on-theme placeholder shows.
 * Only the top edge is visible here — the frame extends below the fold.
 */
function DashboardImage() {
  const [errored, setErrored] = useState(false);

  return (
    <div className="relative rounded-t-2xl border border-gray-200/80 border-b-0 bg-white shadow-2xl overflow-hidden mx-auto">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="hidden sm:flex mx-auto items-center gap-2 text-xs text-gray-400 font-medium">
          <img src="/images/lumicoria-logo-gradient.png" alt="" className="w-4 h-4 rounded" />
          app.lumicoria.ai / workspace / production
        </div>
      </div>

      {/* Clip so only the top of the dashboard shows */}
      <div className="relative h-[360px] md:h-[480px] overflow-hidden">
        {!errored ? (
          <img
            src="/images/dashboard_hero.png"
            alt="Lumicoria production dashboard"
            className="w-full block"
            onError={() => setErrored(true)}
          />
        ) : (
          <DashboardPlaceholder />
        )}
      </div>
    </div>
  );
}

/** On-theme placeholder shown until /images/dashboard-hero.png is added. */
function DashboardPlaceholder() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-lumicoria-purple/5 via-white to-lumicoria-blue/5 flex">
      <div className="w-48 border-r border-gray-100 bg-white/60 p-4 hidden md:block">
        <div className="flex items-center gap-2 mb-6">
          <img src="/images/lumicoria-logo-gradient.png" alt="" className="w-7 h-7 rounded-lg" />
          <span className="font-medium text-gray-800 text-sm">
            <span className="italic font-light">Lumi</span>coria
          </span>
        </div>
        {['Agents', 'Documents', 'Chat', 'Observability'].map((l, i) => (
          <div
            key={l}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 mb-1 text-sm ${
              i === 0 ? 'bg-lumicoria-purple/10 text-lumicoria-purple font-medium' : 'text-gray-400'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded bg-current opacity-40" />
            {l}
          </div>
        ))}
      </div>
      <div className="flex-1 p-6">
        <div className="h-3 w-40 bg-gray-200 rounded mb-2" />
        <div className="h-2 w-56 bg-gray-100 rounded mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {['28s', '71%', '94%', '$4.21'].map((v) => (
            <div key={v} className="rounded-xl border border-gray-100 bg-white p-3">
              <div className="h-2 w-12 bg-gray-100 rounded mb-2" />
              <div className="text-xl font-bold text-gray-800">{v}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 flex items-end gap-1.5 h-40">
          {[40, 55, 45, 65, 60, 75, 70, 82, 78, 90, 85, 96].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-lumicoria-purple to-lumicoria-lightPurple"
              style={{ height: `${h}%`, opacity: 0.5 + (i / 12) * 0.5 }}
            />
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400 text-center">
          Drop your screenshot at <code className="text-lumicoria-purple">/images/dashboard-hero.png</code>
        </p>
      </div>
    </div>
  );
}

export default Hero;
