import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { FaInstagram, FaTiktok, FaWhatsapp, FaArrowRight } from "react-icons/fa";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CircularGallery } from "@/components/ui/circular-gallery";
import { BRIDAL_ADDONS, BRIDAL_BOOKING, BRIDAL_ENQUIRIES, BRIDAL_GROUPS, BRIDAL_PACKAGES, BUDGET_TIERS, CURATE_STEPS, FLORAL_CATEGORY, HERO_IMAGES, SERVICE_IMAGES, SHOWCASE_WORKS, isFloral } from "@/lib/showcase";
import { WorksWheel } from "@/components/ui/works-wheel";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";


// Shown if the categories have not loaded yet, so the page never looks empty.
// The corridor is sized off the screen's width, so on a tall phone it shrinks to
// a thin strip. Taller cards, in the same ratio, fill the screen again.
const HERO_PATH_DESKTOP = { turnExit: 12, turnBirth: 3, cardRadius: 1.1 };

/** Corridor for portrait screens. It is sized off the screen's width, so on a
    tall phone it shrinks to a strip; `k` grows the cards back to fill the
    height, and eases off on shorter screens so they do not crowd the text. */
const heroPathTall = (k: number) => ({
  turnExit: 12,
  turnBirth: 3,
  cardRadius: 2.4,
  cardWidth: 40 * k,
  cardHeight: 58 * k,
  birthHeight: 6.5 * k,
  exitHeight: 115 * k,
});

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

/** The Atelier's script wordmark. Animated, it is written out letter by letter;
    static, it is the finished word. */
function Wordmark({ animated, loop, loopSeconds, className }: { animated?: boolean; loop?: boolean; loopSeconds?: number; className: string }) {
  return (
    <svg viewBox="0 0 560 150" className={`${className} h-auto overflow-visible`} role="presentation">
      <text
        x="280"
        y="108"
        textAnchor="middle"
        fontFamily="'Great Vibes', cursive"
        fontSize="118"
        fill="#C9A84C"
        {...(animated ? { stroke: "#C9A84C", strokeWidth: 1.6, strokeLinejoin: "round" as const } : {})}
      >
        {Array.from("Nhyira's").map((ch, i) => (
          <tspan
            key={i}
            className={animated ? (loop ? "loader-glyph-loop" : "loader-glyph") : undefined}
            style={animated ? { animationDelay: loop ? `${i * 0.2}s` : `${0.3 + i * 0.28}s, ${1.4 + i * 0.28}s`, ...(loop && loopSeconds ? { animationDuration: `${loopSeconds}s` } : {}) } : undefined}
          >
            {ch}
          </tspan>
        ))}
      </text>
    </svg>
  );
}

/** The full lockup - written wordmark, ATELIER, and the tagline. Animated, the
    word is written out letter by letter, then ATELIER and the tagline fade in. */
function Lockup({ animated, small }: { animated?: boolean; small?: boolean }) {
  const fade = (delay: number) =>
    animated ? { className: "loader-fade", style: { animationDelay: `${delay}s` } } : { className: "", style: undefined };
  return (
    <div className="flex flex-col items-center text-center">
      <h1 aria-label="Nhyira's Atelier - Curated Experiences" className="mb-1">
        <Wordmark
          animated={animated}
          loop={animated}
          loopSeconds={5.4}
          className={small ? "w-[14.5rem] sm:w-[20rem] lg:w-[24rem]" : "w-[17rem] md:w-[30rem]"}
        />
      </h1>
      <p
        className={`font-label tracking-[0.3em] text-[#0A4F4F] ${small ? "text-lg sm:text-2xl lg:text-3xl mb-3" : "text-2xl md:text-4xl mb-5"} ${fade(3.4).className}`}
        style={fade(3.4).style}
      >
        ATELIER
      </p>
      <p
        className={`font-serif italic text-[#0A4F4F] ${small ? "text-base sm:text-lg" : "text-xl"} ${fade(3.7).className}`}
        style={fade(3.7).style}
      >
        Curated Experiences
      </p>
    </div>
  );
}

function LoaderScreen({ onComplete }: { onComplete: () => void }) {
  // The wordmark keeps writing itself on a loop while the page gets ready: the
  // script font, and the first hero photos. It stays for at least one full pass.
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        onComplete();
      }
    };
    const minimum = new Promise((r) => setTimeout(r, 2800));
    const ready = Promise.all([
      document.fonts.load("118px 'Great Vibes'"),
      ...HERO_IMAGES.slice(0, 4).map(
        ({ src }) =>
          new Promise((r) => {
            const img = new Image();
            img.onload = img.onerror = () => r(null);
            img.src = src;
          }),
      ),
    ]).catch(() => null);
    Promise.all([minimum, ready]).then(finish);
    const cap = setTimeout(finish, 7000);
    return () => clearTimeout(cap);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.9, ease: "easeInOut" } }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      <Wordmark animated loop className="w-[17rem] md:w-[30rem]" />
    </motion.div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const { data: portfolioItems, isLoading: portfolioLoading } = useListPortfolio({ published: true });
  const { data: categoryData } = useCategories();
  const allServices = categoryData?.length ? categoryData.map((c) => c.name) : FALLBACK_SERVICES;
  const services = allServices.filter((name) => !isFloral(name));
  const floralService = allServices.find(isFloral);
  const worksRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const [isNarrow, setIsNarrow] = useState(false);
  // Portrait screens (phones, tablets held upright) get the taller hero corridor.
  const [isTall, setIsTall] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [heroK, setHeroK] = useState(1);
  useEffect(() => {
    const onResize = () => {
      setIsNarrow(window.innerWidth < 768);
      setIsPhone(window.innerWidth < 640 && window.innerHeight > window.innerWidth);
      const ratio = window.innerHeight / window.innerWidth;
      setIsTall(ratio > 0.9);
      // 2.16 is a modern phone held upright; a tablet or short phone gets less.
      setHeroK(Math.min(1, Math.max(0.55, ratio / 2.16)));
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  // The ring needs enough cards to look full, so short lists are repeated.
  // Real pieces from the admin when there are any, otherwise the showcase set.
  // Floral pieces are kept apart from the balloon work and get their own section.
  const realWorks = portfolioItems ?? [];
  const worksBase = realWorks.length ? realWorks.filter((w) => !isFloral(w.category)) : SHOWCASE_WORKS.filter((w) => !isFloral(w.category));
  const floralWorks = realWorks.some((w) => isFloral(w.category))
    ? realWorks.filter((w) => isFloral(w.category))
    : SHOWCASE_WORKS.filter((w) => isFloral(w.category));
  const galleryItems = worksBase.length
    ? Array.from({ length: Math.max(worksBase.length, Math.ceil(8 / worksBase.length) * worksBase.length) }, (_, i) => {
        const item = worksBase[i % worksBase.length];
        return { title: item.title, category: item.category, image: item.images[0] || "https://placehold.co/600x800/F9F5EE/0D6E6E?text=Nhyira's" };
      })
    : [];
  // Each service wears the first photo from its category, else a house image.
  const serviceWheelItems = services.map((name, i) => ({
    title: name,
    image:
      SERVICE_IMAGES[name] ??
      worksBase.find((item) => item.category === name)?.images[0] ??
      HERO_IMAGES[i % HERO_IMAGES.length].src,
  }));
  const heroHeading = (
    <div className="flex flex-col items-center px-6 pt-28 pb-5 text-center sm:pt-[calc(6rem+9svh)] sm:pb-10">
      <Lockup small animated />
    </div>
  );
  const submitEnquiry = useSubmitEnquiry();
  // Everything a visitor can enquire about, so the form can name the exact piece.
  const enquirable: any[] = [...worksBase, ...floralWorks, ...BRIDAL_ENQUIRIES];
  const [enquiryItem, setEnquiryItem] = useState<any>(null);
  const [floralTab, setFloralTab] = useState<"bouquets" | "curate" | "packages">("bouquets");
  const floralPhotos = floralWorks.flatMap((item: any) => item.images.map((src: string) => ({ src, item })));
  const formServices = allServices.some(isFloral) ? allServices : [...allServices, FLORAL_CATEGORY];
  const pickEnquiryItem = (item: any | null) => {
    setEnquiryItem(item);
    if (item && formServices.includes(item.category)) form.setValue("service", item.category, { shouldValidate: true });
  };
  const goToContact = (service?: string, item?: any) => {
    if (item) pickEnquiryItem(item);
    else if (service && formServices.includes(service)) form.setValue("service", service, { shouldValidate: true });
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };
  const { toast } = useToast();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activePortfolioItem, setActivePortfolioItem] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
    }, 3200);
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
    // The API has no item field, so the chosen piece leads the message.
    const message = enquiryItem
      ? `Enquiring about: ${enquiryItem.title} (${enquiryItem.category})${enquiryItem.price ? ` - ${enquiryItem.price}` : ""}\n\n${values.message}`
      : values.message;
    submitEnquiry.mutate({ data: { ...values, message } }, {
      onSuccess: () => {
        setEnquiryItem(null);
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
    <div className="min-h-screen bg-white text-[#0A4F4F] overflow-x-clip selection:bg-[#0D6E6E] selection:text-white">
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
              <a href="#florals" className="hover:text-[#C9A84C] transition-colors">FLORALS</a>
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
                    { href: "#florals", label: "Florals" },
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
          {isPhone ? (
            // On a phone the corridor shrinks every photo toward a vanishing point, so
            // two rows of large photos drift past instead, each one seen whole.
            <section className="relative flex h-[max(100svh,36rem)] w-full flex-col overflow-hidden bg-white">
              {heroHeading}
              <div className="flex min-h-0 flex-1 flex-col gap-3 pb-5">
                {[HERO_IMAGES.slice(0, 6), HERO_IMAGES.slice(6)].map((row, r) => (
                  <motion.div
                    key={r}
                    initial={{ opacity: 0, x: r === 0 ? 80 : -80 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.4, delay: 0.6 + r * 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="relative min-h-0 flex-1 overflow-hidden"
                  >
                    <div
                      className={`flex h-full w-max gap-3 pr-3 ${r === 0 ? "hero-drift-left" : "hero-drift-right"}`}
                    >
                      {[...row, ...row].map((img, i) => (
                        <img
                          key={i}
                          src={img.src}
                          alt=""
                          aria-hidden
                          draggable={false}
                          className="h-full aspect-[3/4] shrink-0 rounded-[18px] object-cover"
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          ) : (
            <ImageStreamHero
              images={HERO_IMAGES}
              axis={isTall ? 66 : 64}
              path={isTall ? heroPathTall(heroK) : HERO_PATH_DESKTOP}
              introDelay={0.4}
              speed={26}
              className="min-h-[max(100svh,36rem)] w-full bg-white"
            >
              <div className="relative z-10 flex min-h-[max(100svh,36rem)] flex-col items-center justify-start text-center">
                {heroHeading}
              </div>
            </ImageStreamHero>
          )}

          {/* Services */}
          <section id="services" className="bg-white relative">
            {/* Tall wrapper gives scroll distance; the sticky stage pins the wheel while it turns. */}
            <div ref={servicesRef} style={{ height: `${(services.length + 1) * 70 + 100}vh` }}>
              <div className="sticky top-0 h-screen pt-[68px]">
                <WorksWheel
                  className="h-full bg-white text-[#0A4F4F] font-heading"
                  items={serviceWheelItems}
                  label="Bespoke Services"
                  action="Enquire"
                  scrollContainerRef={servicesRef}
                  onItemSelect={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                />
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
                    className={isNarrow ? "scale-[0.62] translate-y-[5vh]" : "scale-[0.72] translate-y-[7vh]"}
                    radius={isNarrow ? 520 : 600}
                    onItemClick={(i) => {
                      setActivePortfolioItem(worksBase[i % worksBase.length]);
                      setSelectedImageIndex(0);
                    }}
                    scrollContainerRef={worksRef}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Florals — the bridal floral side of the Atelier, kept apart from the balloons */}
          <section id="florals" className="bg-[#FBF3F1] py-20 md:py-32 px-6 md:px-12">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-end">
                <div>
                  <p className="font-label text-[10px] tracking-[0.25em] text-[#B4637A] uppercase mb-5">BRIDAL FLORALS · ACCRA</p>
                  <h2 className="font-heading text-5xl md:text-7xl text-[#0A4F4F] leading-[0.95]">
                    Flowers, styled to <span className="italic text-[#B4637A]">your story.</span>
                  </h2>
                  <p className="font-sans text-sm md:text-base text-[#0A4F4F]/70 leading-relaxed mt-6 max-w-lg">
                    Bridal bouquets, bridesmaids and boutonnières. Fresh flowers as standard, artificial on request, and
                    always curated to your budget.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 lg:items-stretch xl:items-center lg:justify-end">
                  <Button
                    onClick={() => goToContact(floralService ?? FLORAL_CATEGORY)}
                    className="bg-[#B4637A] hover:bg-[#9D5368] text-white rounded-[16px] px-8 py-6 font-label text-[10px] tracking-[0.2em] uppercase"
                  >
                    CURATE MY BOUQUET
                  </Button>
                  <a
                    href="https://wa.me/233558112779?text=Hi%20Nhyira's%20Atelier!%20I'd%20love%20a%20bridal%20floral%20quote."
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-white px-8 py-4 font-label text-[10px] tracking-[0.2em] uppercase text-[#0A4F4F] hover:text-[#B4637A] transition-colors"
                  >
                    <FaWhatsapp className="w-4 h-4 text-[#25D366]" /> WHATSAPP A QUOTE
                  </a>
                </div>
              </div>

              {/* Photos */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                {floralPhotos.map(({ src, item }, i) => (
                  <motion.button
                    key={src}
                    type="button"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
                    onClick={() => {
                      setActivePortfolioItem(item);
                      setSelectedImageIndex(Math.max(0, item.images.indexOf(src)));
                    }}
                    aria-label={item.title}
                    className={`group aspect-[3/4] overflow-hidden rounded-[18px] bg-white ${i % 2 === 1 ? "md:mt-8" : ""}`}
                  >
                    <img src={src} alt={item.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </motion.button>
                ))}
              </div>

              {/* Rate card */}
              <div className="mt-16 md:mt-24">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <h3 className="font-heading text-3xl md:text-4xl text-[#0A4F4F]">Rate card</h3>
                  <div className="inline-flex rounded-full bg-white p-1" role="tablist">
                    {([
                      ["bouquets", "Bouquets"],
                      ["curate", "Curate yours"],
                      ["packages", "Packages"],
                    ] as const).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={floralTab === key}
                        onClick={() => setFloralTab(key)}
                        className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${floralTab === key ? "bg-[#B4637A] text-white" : "text-[#0A4F4F]/70 hover:text-[#0A4F4F]"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {floralTab === "bouquets" && (
                  <div className="grid md:grid-cols-2 gap-5">
                    {BRIDAL_GROUPS.map((group, gi) => (
                      <div key={group.title} className={`bg-white rounded-[20px] p-6 md:p-8 ${gi === 0 ? "md:row-span-2" : ""}`}>
                        <p className="font-label text-[10px] tracking-[0.2em] text-[#B4637A] uppercase mb-2">{group.title}</p>
                        <ul className="divide-y divide-[#0A4F4F]/10">
                          {group.rows.map((row) => (
                            <li key={row.id} className="py-4 flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="font-heading text-xl md:text-2xl text-[#0A4F4F] leading-tight">{row.name}</p>
                                <p className="text-sm text-[#0A4F4F]/60 mt-1 leading-relaxed">{row.note}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-price text-[15px] font-medium text-[#B4637A] whitespace-nowrap">{row.price}</p>
                                <button
                                  type="button"
                                  onClick={() => goToContact(FLORAL_CATEGORY, BRIDAL_ENQUIRIES.find((e) => e.id === `rate-${row.id}`))}
                                  className="mt-1 text-[11px] text-[#B4637A] underline underline-offset-4 hover:text-[#9D5368]"
                                >
                                  Enquire
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <p className="md:col-span-2 text-xs text-[#0A4F4F]/55">
                      Starting prices per piece, Accra. Made with fresh flowers; artificial flowers are available on request. Your final quote depends on your design, flowers and size.
                    </p>
                  </div>
                )}

                {floralTab === "curate" && (
                  <div className="grid lg:grid-cols-2 gap-5">
                    <div className="bg-white rounded-[20px] p-6 md:p-8">
                      <p className="font-label text-[10px] tracking-[0.2em] text-[#B4637A] uppercase mb-2">OUR SIGNATURE SERVICE</p>
                      <h4 className="font-heading text-3xl md:text-4xl text-[#0A4F4F] leading-tight">Curate your bouquet</h4>
                      <p className="text-sm text-[#0A4F4F]/70 mt-3">Tell us your budget. We'll design the most beautiful bouquet around it.</p>
                      <ol className="mt-6 space-y-4">
                        {CURATE_STEPS.map((step, i) => (
                          <li key={i} className="flex gap-4">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#FBF3F1] font-price text-xs font-medium text-[#B4637A]">{i + 1}</span>
                            <p className="text-sm text-[#0A4F4F]/75 leading-relaxed">{step}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="bg-white rounded-[20px] p-6 md:p-8">
                      <p className="font-label text-[10px] tracking-[0.2em] text-[#B4637A] uppercase mb-2">WHAT YOUR BUDGET CAN CREATE</p>
                      <ul className="divide-y divide-[#0A4F4F]/10">
                        {BUDGET_TIERS.map((tier) => (
                          <li key={tier.price} className="py-4">
                            <p className="font-price text-lg font-medium text-[#B4637A]">{tier.price}</p>
                            <p className="text-sm text-[#0A4F4F]/70 mt-1 leading-relaxed">{tier.text}</p>
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-[#0A4F4F]/70 mt-2">Bridesmaid bouquets from <span className="font-price">GH₵200</span>. Mini bouquets of 2 to 3 stems from <span className="font-price">GH₵150</span>.</p>
                      <Button
                        onClick={() => goToContact(FLORAL_CATEGORY)}
                        className="mt-6 w-full bg-[#B4637A] hover:bg-[#9D5368] text-white rounded-[16px] py-6 font-label text-[10px] tracking-[0.2em] uppercase"
                      >
                        SHARE MY BUDGET
                      </Button>
                    </div>
                  </div>
                )}

                {floralTab === "packages" && (
                  <div>
                    <div className="grid md:grid-cols-3 gap-5">
                      {BRIDAL_PACKAGES.map((pkg) => (
                        <div key={pkg.id} className="bg-white rounded-[20px] p-6 md:p-8 flex flex-col">
                          <h4 className="font-heading text-3xl text-[#0A4F4F] leading-tight">{pkg.name}</h4>
                          <p className="text-sm text-[#0A4F4F]/65 mt-3 leading-relaxed flex-1">{pkg.note}</p>
                          <div className="mt-6 flex items-end justify-between gap-3">
                            <div>
                              <p className="font-price text-xl font-medium text-[#B4637A]">{pkg.price}</p>
                              <span className="font-price mt-1 inline-block rounded-full bg-[#FBF3F1] px-3 py-1 text-[11px] text-[#B4637A]">{pkg.save}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => goToContact(FLORAL_CATEGORY, BRIDAL_ENQUIRIES.find((e) => e.id === `rate-${pkg.id}`))}
                              className="rounded-full bg-[#B4637A] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#9D5368] transition-colors"
                            >
                              Enquire
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-5 mt-5">
                      <div className="bg-white rounded-[20px] p-6 md:p-8">
                        <p className="font-label text-[10px] tracking-[0.2em] text-[#B4637A] uppercase mb-2">ADD-ONS</p>
                        <ul className="divide-y divide-[#0A4F4F]/10">
                          {BRIDAL_ADDONS.map((a) => (
                            <li key={a.name} className="py-3 flex items-baseline justify-between gap-4 text-sm">
                              <span className="text-[#0A4F4F]">{a.name}</span>
                              <span className="font-price text-[13px] font-medium text-[#0A4F4F] text-right">{a.price}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white rounded-[20px] p-6 md:p-8">
                        <p className="font-label text-[10px] tracking-[0.2em] text-[#B4637A] uppercase mb-2">BOOKING</p>
                        <p className="text-sm text-[#0A4F4F]/70 leading-relaxed">{BRIDAL_BOOKING}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

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
            <div className="bg-white py-20 md:py-32 px-6 md:px-12 w-full">
              <div className="max-w-4xl mx-auto">
                <div className="mb-20 text-center">
                  <p className="font-poppins text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase mb-6">BOOK A MOMENT</p>
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
                            <FormLabel className="font-poppins text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase">Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Name" {...field} className="border-0 border-b border-[#0A4F4F]/20 focus-visible:ring-0 focus-visible:border-[#0A4F4F] rounded-none bg-transparent px-0 text-lg font-poppins pb-2" />
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
                            <FormLabel className="font-poppins text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase">Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Your Email" {...field} className="border-0 border-b border-[#0A4F4F]/20 focus-visible:ring-0 focus-visible:border-[#0A4F4F] rounded-none bg-transparent px-0 text-lg font-poppins pb-2" />
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
                            <FormLabel className="font-poppins text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase">Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Phone (Optional)" {...field} className="border-0 border-b border-[#0A4F4F]/20 focus-visible:ring-0 focus-visible:border-[#0A4F4F] rounded-none bg-transparent px-0 text-lg font-poppins pb-2" />
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
                            <FormLabel className="font-poppins text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase">Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="border-0 border-b border-[#0A4F4F]/20 focus-visible:ring-0 focus-visible:border-[#0A4F4F] rounded-none bg-transparent px-0 text-lg font-poppins pb-2" />
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
                          <FormLabel className="font-poppins text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase">Service</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-0 border-b border-[#0A4F4F]/20 focus:ring-0 focus:border-[#0A4F4F] rounded-none bg-transparent px-0 text-lg font-poppins pb-2 shadow-none">
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-none border-[#0A4F4F]/20 bg-white">
                              {formServices.map(s => (
                                <SelectItem key={s} value={s} className="font-poppins text-lg focus:bg-[#F9F5EE] focus:text-[#0A4F4F] rounded-none cursor-pointer py-3">{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2">
                      <p className="font-poppins text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase mb-2">Item you're enquiring about (optional)</p>
                      <Select
                        value={enquiryItem ? String(enquiryItem.id) : "none"}
                        onValueChange={(v) => pickEnquiryItem(v === "none" ? null : enquirable.find((w: any) => String(w.id) === v) ?? null)}
                      >
                        <SelectTrigger className="border-0 border-b border-[#0A4F4F]/20 focus:ring-0 focus:border-[#0A4F4F] rounded-none bg-transparent px-0 text-lg font-poppins pb-2 shadow-none">
                          <SelectValue placeholder="A general enquiry" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[14px] border-[#0A4F4F]/20 bg-white max-h-72">
                          <SelectItem value="none" className="font-poppins text-lg cursor-pointer py-3">A general enquiry</SelectItem>
                          {enquirable.map((w: any) => (
                            <SelectItem key={w.id} value={String(w.id)} className="font-poppins text-lg cursor-pointer py-3">
                              {w.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {enquiryItem && (
                        <div className="mt-4 flex items-center gap-4 rounded-[16px] bg-[#F9F5EE] p-3">
                          {enquiryItem.images?.[0] ? (
                            <img src={enquiryItem.images[0]} alt="" className="h-16 w-16 rounded-[12px] object-cover" />
                          ) : (
                            <div className="grid h-16 w-16 place-items-center rounded-[12px] bg-white font-poppins text-[10px] tracking-widest text-[#B4637A]">BRIDAL</div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-poppins text-xl text-[#0A4F4F] leading-tight truncate">{enquiryItem.title}</p>
                            <p className="font-poppins text-[10px] tracking-[0.2em] text-[#C9A84C] uppercase truncate">{enquiryItem.category}{enquiryItem.price ? " · " : ""}{enquiryItem.price && <span className="font-price">{enquiryItem.price}</span>}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => pickEnquiryItem(null)}
                            aria-label="Remove item"
                            className="grid h-8 w-8 place-items-center rounded-full text-[#0A4F4F]/60 hover:bg-white hover:text-[#0A4F4F]"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-poppins text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase">Message</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Tell us about your vision..." className="min-h-[100px] border-0 border-b border-[#0A4F4F]/20 focus-visible:ring-0 focus-visible:border-[#0A4F4F] rounded-none bg-transparent px-0 text-lg font-poppins pb-2 resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-8">
                      <Button type="submit" disabled={submitEnquiry.isPending} className="w-full bg-[#0A4F4F] hover:bg-[#0D6E6E] text-white font-poppins tracking-[0.2em] text-xs uppercase rounded-[16px] py-8 transition-colors">
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

          {/* Piece details */}
          <Dialog open={!!activePortfolioItem} onOpenChange={(open) => !open && setActivePortfolioItem(null)}>
            <DialogContent
              className="!block p-0 gap-0 overflow-hidden border-0 bg-white rounded-[22px] w-[calc(100vw-1.5rem)] max-w-5xl h-[calc(100dvh-1.5rem)] md:h-auto md:max-h-[88dvh] [&>button:last-child]:hidden"
            >
              {activePortfolioItem && (
                <div className="relative flex h-full flex-col md:grid md:h-[min(40rem,88dvh)] md:grid-cols-[1.1fr_1fr]">
                  <button
                    type="button"
                    onClick={() => setActivePortfolioItem(null)}
                    aria-label="Close"
                    className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#0A4F4F] shadow-sm hover:bg-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                  {/* Photos */}
                  <div className="relative shrink-0 h-[46dvh] md:h-full bg-[#F4EEE6]">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={selectedImageIndex}
                        src={activePortfolioItem.images[selectedImageIndex]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="absolute inset-0 h-full w-full object-contain md:object-cover"
                        alt={`${activePortfolioItem.title} - photo ${selectedImageIndex + 1}`}
                      />
                    </AnimatePresence>

                    {activePortfolioItem.images.length > 1 && (
                      <>
                        {(["prev", "next"] as const).map((dir) => (
                          <button
                            key={dir}
                            type="button"
                            aria-label={dir === "prev" ? "Previous photo" : "Next photo"}
                            onClick={() =>
                              setSelectedImageIndex(
                                (selectedImageIndex + (dir === "next" ? 1 : -1) + activePortfolioItem.images.length) %
                                  activePortfolioItem.images.length,
                              )
                            }
                            className={`absolute top-1/2 -translate-y-1/2 ${dir === "prev" ? "left-3" : "right-3"} grid h-9 w-9 place-items-center rounded-full bg-white/85 text-[#0A4F4F] backdrop-blur hover:bg-white transition-colors`}
                          >
                            {dir === "prev" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                          </button>
                        ))}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 rounded-full bg-white/80 p-1.5 backdrop-blur">
                          {activePortfolioItem.images.map((src: string, idx: number) => (
                            <button
                              key={src + idx}
                              type="button"
                              onClick={() => setSelectedImageIndex(idx)}
                              aria-label={`Photo ${idx + 1}`}
                              className={`h-10 w-10 overflow-hidden rounded-full border-2 transition-all ${idx === selectedImageIndex ? "border-[#C9A84C]" : "border-transparent opacity-70 hover:opacity-100"}`}
                            >
                              <img src={src} alt="" className="h-full w-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Details */}
                  <div className="relative flex min-h-0 flex-1 flex-col">

                    <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-4 md:px-10 md:pt-10">
                      <p className="font-label text-[10px] tracking-[0.2em] text-[#C9A84C] uppercase mb-3">{activePortfolioItem.category}</p>
                      <DialogTitle className="font-heading text-3xl md:text-4xl text-[#0A4F4F] leading-tight">
                        {activePortfolioItem.title}
                      </DialogTitle>
                      <DialogDescription asChild>
                        <div>
                          {activePortfolioItem.description && (
                            <p className="font-sans text-sm text-[#0A4F4F]/70 leading-relaxed mt-4">{activePortfolioItem.description}</p>
                          )}
                        </div>
                      </DialogDescription>

                      {(activePortfolioItem.packageDetails || activePortfolioItem.estimatedBudget) && (
                        <dl className="mt-6 divide-y divide-[#0A4F4F]/10 rounded-[14px] bg-[#F9F5EE] px-4">
                          {activePortfolioItem.packageDetails && (
                            <div className="py-3">
                              <dt className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F]/60 uppercase">Package details</dt>
                              <dd className="mt-1 text-sm text-[#0A4F4F]">{activePortfolioItem.packageDetails}</dd>
                            </div>
                          )}
                          {activePortfolioItem.estimatedBudget && (
                            <div className="py-3">
                              <dt className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F]/60 uppercase">Estimated budget</dt>
                              <dd className="font-price mt-1 text-sm font-medium text-[#0A4F4F]">{activePortfolioItem.estimatedBudget}</dd>
                            </div>
                          )}
                        </dl>
                      )}

                      {activePortfolioItem.tags && activePortfolioItem.tags.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                          {activePortfolioItem.tags.map((tag: string) => (
                            <span key={tag} className="rounded-full bg-[#F9F5EE] px-3 py-1 text-[10px] font-label tracking-widest uppercase text-[#0A4F4F]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 border-t border-[#0A4F4F]/10 bg-white px-6 py-4 md:px-10 md:py-5">
                      <Button
                        onClick={() => {
                          const item = activePortfolioItem;
                          setActivePortfolioItem(null);
                          setTimeout(() => goToContact(item.category, item), 250);
                        }}
                        className="w-full bg-[#0A4F4F] hover:bg-[#0D6E6E] text-white rounded-[16px] py-6 font-label text-[10px] tracking-[0.2em] uppercase"
                      >
                        ENQUIRE ABOUT THIS
                      </Button>
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