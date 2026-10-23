import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { FaInstagram, FaTiktok, FaWhatsapp, FaArrowRight } from "react-icons/fa";
import { Menu, X } from "lucide-react";
import { useListPortfolio, useSubmitEnquiry } from "@workspace/api-client-react";
import { useCategories } from "@/lib/categories";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CircularGallery } from "@/components/ui/circular-gallery";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";

const card1 = "/assets/1_1780130493933.png";
const card2 = "/assets/2_1780130493934.png";
const card3 = "/assets/3_1780130493934.png";

// Shown if the categories have not loaded yet, so the page never looks empty.
// Used when no portfolio photos have been published yet.
const FALLBACK_HERO_IMAGES = [
  "/assets/1_1780130493933.png",
  "/assets/2_1780130493934.png",
  "/assets/3_1780130493934.png",
  "/assets/image_1780130880698.png",
  "/assets/image_1780130964140.png",
  "/assets/image_1780132583798.png",
  "/assets/image_1780132617430.png",
  "/assets/image_1780525240334.png",
  "/assets/image_1780525498569.png",
  "/assets/image_1780525632058.png",
];

const FALLBACK_SERVICES = [
  "Balloon & Floral Installations",
  "Backdrops & Setups",
  "Curated Gift Sets",
  "Surprise Setups",
  "Special Day Packages"
];

const enquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  service: z.string().min(1, "Service is required"),
  eventDate: z.string().optional(),
  message: z.string().min(1, "Message is required"),
});

function LoaderScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const } }
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
    >
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col items-center text-center">
        <motion.h1 
          variants={item}
          className="font-brand text-6xl md:text-8xl text-[#C9A84C] mb-4"
        >
          Nhyira's
        </motion.h1>
        <motion.h2 
          variants={item}
          className="font-label text-2xl md:text-4xl tracking-[0.3em] text-[#0A4F4F] mb-6"
        >
          ATELIER
        </motion.h2>
        <motion.p 
          variants={item}
          className="font-serif italic text-xl text-[#0A4F4F] mb-6"
        >
          Curated Experiences
        </motion.p>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100px" }}
          transition={{ duration: 1, delay: 1 }}
          className="h-px bg-[#0D6E6E]"
        />
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const { data: portfolioItems, isLoading: portfolioLoading } = useListPortfolio({ published: true });
  const { data: categoryData } = useCategories();
  const services = categoryData?.length ? categoryData.map((c) => c.name) : FALLBACK_SERVICES;
  const portfolioImages = (portfolioItems ?? []).flatMap((item) => item.images ?? []);
  const heroImages = (portfolioImages.length ? portfolioImages : FALLBACK_HERO_IMAGES)
    .slice(0, 12)
    .map((src) => ({ src }));
  const worksRef = useRef<HTMLDivElement>(null);
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  // The ring needs enough cards to look full, so short lists are repeated.
  const worksBase = portfolioItems ?? [];
  const galleryItems = worksBase.length
    ? Array.from({ length: Math.max(worksBase.length, Math.ceil(8 / worksBase.length) * worksBase.length) }, (_, i) => {
        const item = worksBase[i % worksBase.length];
        return { title: item.title, category: item.category, image: item.images[0] || "https://placehold.co/600x800/F9F5EE/0D6E6E?text=Nhyira's" };
      })
    : [];
  const submitEnquiry = useSubmitEnquiry();
  const { toast } = useToast();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activePortfolioItem, setActivePortfolioItem] = useState<any>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cards = [card1, card2, card3];
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!activePortfolioItem) return;
    const interval = setInterval(() => {
      if (activePortfolioItem.images && activePortfolioItem.images.length > 1) {
        setSelectedImageIndex((prev) => (prev + 1) % activePortfolioItem.images.length);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activePortfolioItem]);

  const form = useForm<z.infer<typeof enquirySchema>>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: "",
      eventDate: "",
      message: ""
    }
  });

  const onSubmit = (values: z.infer<typeof enquirySchema>) => {
    submitEnquiry.mutate({ data: values }, {
      onSuccess: () => {
        toast({
          title: "Thank you!",
          description: "Nhyira will be in touch soon.",
          className: "border-[#0D6E6E] bg-[#F9F5EE] text-[#0A4F4F]"
        });
        form.reset();
      }
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#0A4F4F] overflow-x-hidden selection:bg-[#0D6E6E] selection:text-white">
      <AnimatePresence>
        {loading && <LoaderScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <>
          {/* Minimal Nav */}
          <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8 }}
            className={`fixed top-0 w-full z-40 transition-all duration-500 py-4 px-6 md:px-12 flex justify-between items-center ${scrolled ? 'bg-white border-b border-[#0D6E6E]/10' : 'bg-transparent'}`}
          >
            <div className="flex items-center gap-3">
              <span className="font-brand text-3xl text-[#0A4F4F]">Nhyira's</span>
              <span className="font-label text-[10px] tracking-[0.3em] text-[#0A4F4F] mt-2 hidden sm:inline">ATELIER</span>
            </div>
            <div className="hidden md:flex gap-8 font-label text-[10px] tracking-[0.2em]">
              <a href="#works" className="hover:text-[#C9A84C] transition-colors">WORKS</a>
              <a href="#services" className="hover:text-[#C9A84C] transition-colors">SERVICES</a>
              <a href="#contact" className="hover:text-[#C9A84C] transition-colors">CONTACT</a>
            </div>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#0A4F4F]"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </motion.nav>

          {/* Mobile menu overlay */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50 bg-white flex flex-col px-8 pt-8 pb-16"
              >
                <div className="flex justify-between items-center mb-16">
                  <div className="flex items-center gap-3">
                    <span className="font-brand text-3xl text-[#0A4F4F]">Nhyira's</span>
                    <span className="font-label text-[10px] tracking-[0.3em] text-[#0A4F4F] mt-2">ATELIER</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-[#0A4F4F]" aria-label="Close menu">
                    <X size={22} />
                  </button>
                </div>
                <nav className="flex flex-col gap-10">
                  {[
                    { href: "#works", label: "Works" },
                    { href: "#services", label: "Services" },
                    { href: "#contact", label: "Contact" },
                  ].map(({ href, label }) => (
                    <a
                      key={label}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="font-heading text-5xl text-[#0A4F4F] hover:text-[#C9A84C] transition-colors"
                    >
                      {label}
                    </a>
                  ))}
                </nav>
                <div className="mt-auto">
                  <div className="h-px w-12 bg-[#C9A84C] mb-6" />
                  <p className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F]/40 uppercase">Curated Experiences</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hero */}
          <ImageStreamHero
            images={heroImages}
            axis={64}
            className="min-h-screen w-full bg-white"
          >
            <div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-6 pt-28 pb-12 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="font-heading text-[14vw] leading-[0.9] tracking-tight sm:text-[10vw] lg:text-[6.5vw]"
              >
                <span className="block text-[#0A4F4F]">Curated</span>
                <span className="block text-[#C9A84C] italic">Experiences</span>
                <span className="block font-sans font-light text-xl sm:text-2xl lg:text-3xl text-[#0A4F4F] my-3">for every</span>
                <span className="block text-[#0A4F4F]">Moment.</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="flex items-center gap-6 rounded-full bg-white/85 px-6 py-3 backdrop-blur"
              >
                <a href="#contact" className="flex items-center gap-2 text-[10px] font-label font-medium tracking-[0.2em] text-[#0A4F4F] hover:text-[#C9A84C] transition-colors">
                  GET IN TOUCH <FaArrowRight />
                </a>
                <a href="#works" className="text-[10px] font-label font-medium tracking-[0.2em] text-[#0A4F4F] hover:text-[#C9A84C] transition-colors">
                  VIEW WORKS
                </a>
              </motion.div>
            </div>
          </ImageStreamHero>

          {/* Services */}
          <section id="services" className="py-32 px-6 md:px-12 bg-white relative">
            <div className="absolute top-20 left-6 md:left-12 z-0">
              <span className="font-heading text-[20vw] leading-none text-gray-100 opacity-50 select-none">01</span>
            </div>
            
            <div className="max-w-7xl mx-auto relative z-10 pt-20">
              <div className="mb-24">
                <p className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase mb-6">WHAT WE DO</p>
                <h2 className="font-heading text-5xl md:text-7xl text-[#0A4F4F]">Bespoke Services</h2>
              </div>
              
              <div className="flex flex-col border-t border-[#0A4F4F]/10">
                {services.map((service, i) => (
                  <div key={service} className="group flex items-center justify-between py-7 md:py-12 px-3 md:px-6 border-b border-[#0A4F4F]/10 hover:bg-[#0D6E6E]/5 transition-colors duration-500 cursor-pointer">
                    <span className="font-label text-sm text-[#0A4F4F]/40 tracking-widest w-10 md:w-16">0{i + 1}</span>
                    <h3 className="flex-1 font-heading text-2xl md:text-5xl text-[#0A4F4F] text-center transition-transform duration-500 group-hover:scale-[1.02]">{service}</h3>
                    <div className="w-16 flex justify-end">
                      <FaArrowRight className="text-[#0A4F4F] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Works */}
          <section id="works" className="bg-[#F9F5EE]">
            {portfolioLoading ? (
              <div className="py-32 px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#0A4F4F]/10 border border-[#0A4F4F]/10">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-[4/3] bg-white animate-pulse" />
                  ))}
                </div>
              </div>
            ) : !portfolioItems?.length ? (
              <div className="py-32 px-6 md:px-12 text-center">
                <p className="font-heading italic text-3xl text-[#0A4F4F]">Curating beautiful moments...</p>
              </div>
            ) : (
              // Tall wrapper gives scroll distance; the inner stage sticks while the ring turns.
              <div ref={worksRef} style={{ height: "400vh" }}>
                <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute top-24 z-10 text-center px-6">
                    <p className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase mb-4">PORTFOLIO</p>
                    <h2 className="font-heading text-5xl md:text-7xl text-[#0A4F4F]">Our Works</h2>
                    <p className="font-label text-xs text-[#0A4F4F]/60 mt-3">Scroll to explore · tap a piece to view</p>
                  </div>
                  <CircularGallery
                    items={galleryItems}
                    radius={isNarrow ? 380 : 600}
                    onItemClick={(i) => {
                      setActivePortfolioItem(portfolioItems[i % portfolioItems.length]);
                      setSelectedImageIndex(0);
                    }}
                    scrollContainerRef={worksRef}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Business Cards Showcase */}
          <section id="cards" className="py-32 px-6 md:px-12 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="mb-16 flex flex-col items-center text-center">
                <p className="font-label text-[10px] tracking-[0.2em] text-[#C9A84C] uppercase mb-4">THE ATELIER</p>
                <h2 className="font-heading text-4xl md:text-5xl text-[#0A4F4F] mb-4">The Cards We Leave Behind</h2>
                <p className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F]/50 uppercase">Click any card to view</p>
              </div>

              <div className="flex justify-center items-end gap-3 sm:gap-6 md:gap-10 relative">
                {cards.map((card, i) => (
                  <motion.div
                    key={i}
                    layoutId={`business-card-${i}`}
                    onClick={() => setExpandedCard(i)}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.15 }}
                    whileHover={{ y: -16, scale: 1.04, transition: { duration: 0.3 } }}
                    className="cursor-pointer shadow-xl rounded-sm"
                    style={{ rotate: (i - 1) * -4, zIndex: i === 1 ? 10 : i }}
                  >
                    <img src={card} alt={`Business Card ${i + 1}`} className="w-24 sm:w-40 md:w-60 lg:w-72 h-auto rounded-sm" />
                  </motion.div>
                ))}
              </div>

              <div className="mt-16 w-full flex flex-col items-center">
                <div className="h-px w-24 bg-[#0D6E6E]/20 mb-6" />
                <p className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F]/50 uppercase">Nhyira's Atelier · Curated Experiences</p>
              </div>
            </div>
          </section>

          {/* Expanded Card Overlay */}
          <AnimatePresence>
            {expandedCard !== null && (
              <>
                <motion.div
                  className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setExpandedCard(null)}
                />
                <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none">
                  <motion.div
                    layoutId={`business-card-${expandedCard}`}
                    className="pointer-events-auto relative"
                    style={{ rotate: 0 }}
                  >
                    <img
                      src={cards[expandedCard]}
                      alt={`Business Card ${expandedCard + 1}`}
                      className="max-w-[92vw] max-h-[85vh] w-auto h-auto shadow-2xl rounded-sm"
                    />
                    <button
                      onClick={() => setExpandedCard(null)}
                      className="absolute -top-4 -right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg font-label text-xs text-[#0A4F4F] hover:bg-[#F9F5EE] transition-colors"
                    >
                      ✕
                    </button>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>

          {/* About */}
          <section id="about" className="flex flex-col lg:flex-row bg-white">
            <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-24 flex items-center">
              <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl text-[#0A4F4F] leading-tight italic">
                We believe every celebration deserves to be curated with love.
              </h2>
            </div>
            <div className="w-full lg:w-1/2 bg-[#F9F5EE] p-8 md:p-12 lg:p-24 flex flex-col justify-center">
              <div className="w-16 h-px bg-[#C9A84C] mb-8 md:mb-12" />
              <blockquote className="font-heading text-3xl md:text-4xl lg:text-5xl text-[#0A4F4F] italic leading-snug mb-8 md:mb-12">
                "You are the heart of what we do."
              </blockquote>
              <p className="font-brand text-4xl text-[#0A4F4F]">With love, Nhyira</p>
            </div>
          </section>

          {/* Form & Contact */}
          <section id="contact" className="bg-[#0A4F4F] flex flex-col">
            {/* Top Half: Form */}
            <div className="bg-white py-32 px-6 md:px-12 w-full">
              <div className="max-w-4xl mx-auto">
                <div className="mb-20 text-center">
                  <p className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase mb-6">BOOK A MOMENT</p>
                  <h3 className="font-heading text-4xl md:text-6xl text-[#0A4F4F]">Let's Create Together</h3>
                  <p className="font-sans text-sm text-[#0A4F4F]/60 mt-6">Prefer a quicker hello? Find us here.</p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    {/* Instagram's gradient can't come from a text colour, so it is painted through an SVG gradient. */}
                    <svg width="0" height="0" className="absolute" aria-hidden>
                      <defs>
                        <linearGradient id="ig-gradient" x1="0" y1="1" x2="1" y2="0">
                          <stop offset="0%" stopColor="#F77737" />
                          <stop offset="50%" stopColor="#E1306C" />
                          <stop offset="100%" stopColor="#833AB4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {[
                      { href: "https://wa.me/233558112779?text=Hi%20Nhyira's%20Atelier!%20I'd%20love%20to%20enquire%20about%20a%20setup.", icon: <FaWhatsapp className="w-6 h-6 text-[#25D366]" />, label: "+233 55 811 2779" },
                      { href: "https://instagram.com/nhyiras_atelier", icon: <FaInstagram className="w-6 h-6" style={{ fill: "url(#ig-gradient)" }} />, label: "@nhyiras_atelier" },
                      { href: "https://tiktok.com/@nhyiras_atelier", icon: <FaTiktok className="w-6 h-6 text-[#010101]" />, label: "@nhyiras_atelier" },
                    ].map(({ href, icon, label }) => (
                      <a
                        key={href}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2.5 px-2 py-1 text-sm font-medium text-[#0A4F4F] hover:text-[#C9A84C] transition-colors"
                      >
                        {icon}
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase">Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Name" {...field} className="border-0 border-b border-[#0A4F4F]/20 focus-visible:ring-0 focus-visible:border-[#0A4F4F] rounded-none bg-transparent px-0 text-lg font-heading pb-2" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase">Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Your Email" {...field} className="border-0 border-b border-[#0A4F4F]/20 focus-visible:ring-0 focus-visible:border-[#0A4F4F] rounded-none bg-transparent px-0 text-lg font-heading pb-2" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase">Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Phone (Optional)" {...field} className="border-0 border-b border-[#0A4F4F]/20 focus-visible:ring-0 focus-visible:border-[#0A4F4F] rounded-none bg-transparent px-0 text-lg font-heading pb-2" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="eventDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase">Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="border-0 border-b border-[#0A4F4F]/20 focus-visible:ring-0 focus-visible:border-[#0A4F4F] rounded-none bg-transparent px-0 text-lg font-heading pb-2" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase">Service</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-0 border-b border-[#0A4F4F]/20 focus:ring-0 focus:border-[#0A4F4F] rounded-none bg-transparent px-0 text-lg font-heading pb-2 shadow-none">
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-none border-[#0A4F4F]/20 bg-white">
                              {services.map(s => (
                                <SelectItem key={s} value={s} className="font-heading text-lg focus:bg-[#F9F5EE] focus:text-[#0A4F4F] rounded-none cursor-pointer py-3">{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase">Message</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Tell us about your vision..." className="min-h-[100px] border-0 border-b border-[#0A4F4F]/20 focus-visible:ring-0 focus-visible:border-[#0A4F4F] rounded-none bg-transparent px-0 text-lg font-heading pb-2 resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-8">
                      <Button type="submit" disabled={submitEnquiry.isPending} className="w-full bg-[#0A4F4F] hover:bg-[#0D6E6E] text-white font-label tracking-[0.2em] text-xs uppercase rounded-xl py-8 transition-colors">
                        {submitEnquiry.isPending ? "SENDING..." : "SEND ENQUIRY"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-[#0A4F4F] py-16 px-6 md:px-12">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <h2 className="font-brand text-4xl text-[#C9A84C]">Nhyira's Atelier</h2>
              <p className="font-label text-[10px] tracking-[0.2em] text-white/50 uppercase">
                &copy; {new Date().getFullYear()} Nhyira's Atelier. All rights reserved.
              </p>
            </div>
          </footer>

          {/* Portfolio Modal */}
          <Dialog open={!!activePortfolioItem} onOpenChange={(open) => !open && setActivePortfolioItem(null)}>
            <DialogContent className="max-w-[100vw] w-full h-[100dvh] max-h-[100dvh] p-0 border-0 bg-black/95 rounded-none flex flex-col justify-center items-center">
              {activePortfolioItem && (
                <div className="w-full h-full flex flex-col md:flex-row">
                  {/* Left: Images */}
                  <div className="flex-none h-[45vh] md:h-auto md:flex-1 relative overflow-hidden bg-[#0A0A0A]">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={selectedImageIndex}
                        src={activePortfolioItem.images[selectedImageIndex]}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full object-contain"
                        alt={`${activePortfolioItem.title} - Image ${selectedImageIndex + 1}`}
                      />
                    </AnimatePresence>
                    {activePortfolioItem.images.length > 1 && (
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
                        {activePortfolioItem.images.map((_: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`h-1 transition-all duration-300 ${idx === selectedImageIndex ? 'w-8 bg-[#C9A84C]' : 'w-4 bg-white/30 hover:bg-white/60'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Right: Details */}
                  <div className="w-full md:w-[400px] lg:w-[500px] bg-white flex-1 md:h-full p-6 md:p-12 overflow-y-auto">
                    <button 
                      onClick={() => setActivePortfolioItem(null)}
                      className="absolute top-6 right-6 z-50 text-[#0A4F4F] hover:text-[#C9A84C] font-label text-[10px] tracking-[0.2em] uppercase"
                    >
                      CLOSE ✕
                    </button>
                    
                    <div className="mt-4 md:mt-12 h-full flex flex-col">
                      <p className="font-label text-[10px] tracking-[0.2em] text-[#C9A84C] mb-4 uppercase">{activePortfolioItem.category}</p>
                      <h2 className="font-heading text-4xl lg:text-5xl text-[#0A4F4F] mb-6">{activePortfolioItem.title}</h2>
                      
                      {activePortfolioItem.description && (
                        <p className="font-sans text-sm text-gray-600 mb-8 font-light leading-relaxed">
                          {activePortfolioItem.description}
                        </p>
                      )}

                      <div className="mt-auto space-y-6 pt-8 border-t border-[#0A4F4F]/10">
                        {activePortfolioItem.packageDetails && (
                          <div>
                            <p className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F] mb-2 uppercase">PACKAGE DETAILS</p>
                            <p className="font-sans text-sm text-gray-600">{activePortfolioItem.packageDetails}</p>
                          </div>
                        )}
                        {activePortfolioItem.estimatedBudget && (
                          <div>
                            <p className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F] mb-2 uppercase">ESTIMATED BUDGET</p>
                            <p className="font-sans text-sm text-[#0A4F4F]">{activePortfolioItem.estimatedBudget}</p>
                          </div>
                        )}
                        {activePortfolioItem.tags && activePortfolioItem.tags.length > 0 && (
                          <div>
                            <p className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F] mb-2 uppercase">TAGS</p>
                            <div className="flex flex-wrap gap-2">
                              {activePortfolioItem.tags.map((tag: string) => (
                                <span key={tag} className="px-3 py-1 bg-[#F9F5EE] text-[#0A4F4F] text-[10px] font-label tracking-widest uppercase">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-12">
                        <Button 
                          onClick={() => {
                            setActivePortfolioItem(null);
                            setTimeout(() => {
                              const el = document.getElementById('contact');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }, 300);
                          }}
                          className="w-full bg-[#0A4F4F] hover:bg-[#0D6E6E] text-white rounded-none py-6 font-label text-[10px] tracking-[0.2em] uppercase"
                        >
                          ENQUIRE ABOUT THIS STYLE
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}