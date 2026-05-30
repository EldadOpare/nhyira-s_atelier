import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { useListPortfolio, useSubmitEnquiry } from "@workspace/api-client-react";
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

import card1 from "@assets/1_1780130493933.png";
import card2 from "@assets/2_1780130493934.png";
import card3 from "@assets/3_1780130493934.png";

const services = [
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
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
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
  const { data: portfolioItems, isLoading: portfolioLoading } = useListPortfolio({ published: true });
  const submitEnquiry = useSubmitEnquiry();
  const { toast } = useToast();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activePortfolioItem, setActivePortfolioItem] = useState<any>(null);
  
  useEffect(() => {
    if (activePortfolioItem) {
      const interval = setInterval(() => {
        if (activePortfolioItem.images && activePortfolioItem.images.length > 1) {
          setSelectedImageIndex((prev) => (prev + 1) % activePortfolioItem.images.length);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
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
          {/* Navigation */}
          <motion.nav 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-[#0D6E6E] py-4 px-6 md:px-12 flex justify-between items-center"
          >
            <div className="flex items-center gap-2">
              <span className="font-brand text-2xl text-[#C9A84C]">Nhyira's</span>
              <span className="font-label text-sm tracking-widest text-[#0A4F4F] mt-2">ATELIER</span>
            </div>
            <div className="hidden md:flex gap-8 font-label text-sm tracking-wider">
              <a href="#works" className="hover:text-[#0D6E6E] transition-colors">WORKS</a>
              <a href="#services" className="hover:text-[#0D6E6E] transition-colors">SERVICES</a>
              <a href="#about" className="hover:text-[#0D6E6E] transition-colors">ABOUT</a>
              <a href="#contact" className="hover:text-[#0D6E6E] transition-colors">CONTACT</a>
            </div>
          </motion.nav>

          {/* Hero */}
          <section className="min-h-screen pt-24 px-6 md:px-12 flex flex-col justify-center items-center text-center bg-white relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="max-w-4xl"
            >
              <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl leading-tight mb-8 text-[#0A4F4F]">
                Curated Experiences for Your Most Beautiful Moments
              </h1>
              <p className="font-sans text-lg md:text-xl text-[#0D6E6E] mb-12 tracking-wide font-light">
                Balloon & Floral Installations · Backdrops · Curated Gift Sets · Surprise Setups
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a href="#contact" className="px-8 py-4 bg-[#0D6E6E] text-white font-label text-sm tracking-widest hover:bg-[#0A4F4F] transition-colors duration-300 rounded-none">
                  GET IN TOUCH
                </a>
                <a href="#works" className="px-8 py-4 bg-[#F9F5EE] text-[#0A4F4F] border border-[#0D6E6E] font-label text-sm tracking-widest hover:bg-[#0D6E6E] hover:text-white transition-colors duration-300 rounded-none">
                  VIEW OUR WORK
                </a>
              </div>
            </motion.div>
          </section>

          {/* Services */}
          <section id="services" className="py-24 px-6 md:px-12 bg-[#F9F5EE]">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="max-w-7xl mx-auto"
            >
              <div className="mb-16 text-center">
                <h2 className="font-label text-sm tracking-[0.3em] text-[#0D6E6E] mb-4">WHAT WE DO</h2>
                <h3 className="font-heading text-4xl md:text-5xl text-[#0A4F4F]">Bespoke Services</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, i) => (
                  <motion.div
                    key={service}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-8 border-l-4 border-[#0D6E6E] rounded-none group hover:bg-[#0A4F4F] transition-colors duration-500"
                  >
                    <h4 className="font-heading text-2xl text-[#0A4F4F] group-hover:text-white mb-4">{service}</h4>
                    <p className="font-sans text-gray-600 group-hover:text-gray-300 font-light">
                      Meticulously crafted to transform your vision into an unforgettable reality.
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Works */}
          <section id="works" className="py-24 px-6 md:px-12 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="mb-16 text-center">
                <h2 className="font-label text-sm tracking-[0.3em] text-[#0D6E6E] mb-4">PORTFOLIO</h2>
                <h3 className="font-heading text-4xl md:text-5xl text-[#0A4F4F]">Our Works</h3>
              </div>

              {portfolioLoading ? (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="w-full h-80 bg-[#F9F5EE] rounded-none" />
                  ))}
                </div>
              ) : !portfolioItems?.length ? (
                <div className="text-center py-20">
                  <p className="font-serif italic text-2xl text-[#0D6E6E]">More beautiful works coming soon.</p>
                </div>
              ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                  {portfolioItems.map((item: any, i: number) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="relative overflow-hidden group cursor-pointer break-inside-avoid rounded-none"
                      onClick={() => {
                        setActivePortfolioItem(item);
                        setSelectedImageIndex(0);
                      }}
                    >
                      <img 
                        src={item.images[0] || "https://placehold.co/600x800/F9F5EE/0D6E6E?text=Nhyira's"} 
                        alt={item.title}
                        className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-[#0A4F4F]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-6 text-center">
                        <p className="font-label text-xs tracking-widest text-[#C9A84C] mb-2">{item.category}</p>
                        <h4 className="font-heading text-3xl text-white">{item.title}</h4>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Cards Showcase */}
          <section id="cards" className="py-24 px-6 md:px-12 bg-[#F9F5EE] overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="mb-20 text-center">
                <h2 className="font-label text-sm tracking-[0.3em] text-[#0D6E6E] mb-4">THE ATELIER</h2>
                <h3 className="font-heading text-4xl md:text-5xl text-[#0A4F4F]">Our Cards</h3>
              </div>
              
              <div className="flex flex-col items-center justify-center min-h-[400px] relative perspective-1000">
                <div className="flex justify-center items-center gap-4 md:gap-8 flex-wrap">
                  {[card1, card2, card3].map((card, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.5
                      }}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                      className="relative"
                    >
                      <img src={card} alt={`Business Card ${i + 1}`} className="w-64 md:w-80 shadow-none" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* About */}
          <section id="about" className="py-32 px-6 md:px-12 bg-white">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1"
              >
                <div className="w-16 h-px bg-[#0D6E6E] mb-8" />
                <h2 className="font-heading text-4xl md:text-5xl text-[#0A4F4F] mb-8 leading-tight">
                  We believe every celebration deserves to be curated with love.
                </h2>
                <p className="font-sans text-lg text-gray-600 font-light leading-relaxed">
                  From intimate surprises to grand installations, Nhyira's Atelier transforms spaces into memories. 
                  We approach each setup not just as decoration, but as an expression of emotion and a reflection of your unique story.
                </p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1 bg-[#F9F5EE] p-12 md:p-16 border-l border-[#0D6E6E]"
              >
                <p className="font-heading text-3xl md:text-4xl text-[#0A4F4F] italic">
                  "You are the heart of what we do."
                </p>
              </motion.div>
            </div>
          </section>

          {/* Form & Contact */}
          <section id="contact" className="py-24 px-6 md:px-12 bg-[#0A4F4F]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-label text-sm tracking-[0.3em] text-[#C9A84C] mb-4">BOOK A MOMENT</h2>
                <h3 className="font-heading text-4xl md:text-5xl text-white mb-8">Let's Create Together</h3>
                
                <div className="bg-[#F9F5EE] p-8 md:p-12">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-label text-xs tracking-widest text-[#0A4F4F]">NAME</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Name" {...field} className="border-[#0D6E6E]/30 focus-visible:ring-[#0D6E6E] rounded-none bg-white" />
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
                              <FormLabel className="font-label text-xs tracking-widest text-[#0A4F4F]">EMAIL</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Your Email" {...field} className="border-[#0D6E6E]/30 focus-visible:ring-[#0D6E6E] rounded-none bg-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-label text-xs tracking-widest text-[#0A4F4F]">PHONE</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Phone (Optional)" {...field} className="border-[#0D6E6E]/30 focus-visible:ring-[#0D6E6E] rounded-none bg-white" />
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
                              <FormLabel className="font-label text-xs tracking-widest text-[#0A4F4F]">DATE</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} className="border-[#0D6E6E]/30 focus-visible:ring-[#0D6E6E] rounded-none bg-white" />
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
                            <FormLabel className="font-label text-xs tracking-widest text-[#0A4F4F]">SERVICE</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-[#0D6E6E]/30 focus:ring-[#0D6E6E] rounded-none bg-white">
                                  <SelectValue placeholder="Select a service" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {services.map(s => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
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
                            <FormLabel className="font-label text-xs tracking-widest text-[#0A4F4F]">MESSAGE</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Tell us about your vision..." className="min-h-[120px] border-[#0D6E6E]/30 focus-visible:ring-[#0D6E6E] rounded-none bg-white" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={submitEnquiry.isPending} className="w-full bg-[#0D6E6E] hover:bg-[#0A4F4F] text-white font-label tracking-widest rounded-none py-6">
                        {submitEnquiry.isPending ? "SENDING..." : "SEND ENQUIRY"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col justify-center"
              >
                <h2 className="font-label text-sm tracking-[0.3em] text-[#C9A84C] mb-4">STAY CONNECTED</h2>
                <h3 className="font-heading text-4xl md:text-5xl text-white mb-12">Connect With Us</h3>
                
                <div className="space-y-8">
                  <a href="https://instagram.com/nhyiras_atelier" target="_blank" rel="noreferrer" className="flex items-center gap-6 group">
                    <div className="w-16 h-16 border border-[#C9A84C] flex items-center justify-center group-hover:bg-[#C9A84C] transition-colors duration-300">
                      <FaInstagram className="w-6 h-6 text-[#C9A84C] group-hover:text-white" />
                    </div>
                    <div>
                      <p className="font-label text-sm tracking-widest text-[#C9A84C]">INSTAGRAM</p>
                      <p className="font-heading text-2xl text-white">@nhyiras_atelier</p>
                    </div>
                  </a>
                  
                  <a href="#" className="flex items-center gap-6 group">
                    <div className="w-16 h-16 border border-[#C9A84C] flex items-center justify-center group-hover:bg-[#C9A84C] transition-colors duration-300">
                      <FaTiktok className="w-6 h-6 text-[#C9A84C] group-hover:text-white" />
                    </div>
                    <div>
                      <p className="font-label text-sm tracking-widest text-[#C9A84C]">TIKTOK</p>
                      <p className="font-heading text-2xl text-white">@nhyiras_atelier</p>
                    </div>
                  </a>
                  
                  <a href="tel:+233558112779" className="flex items-center gap-6 group">
                    <div className="w-16 h-16 border border-[#C9A84C] flex items-center justify-center group-hover:bg-[#C9A84C] transition-colors duration-300">
                      <FaWhatsapp className="w-6 h-6 text-[#C9A84C] group-hover:text-white" />
                    </div>
                    <div>
                      <p className="font-label text-sm tracking-widest text-[#C9A84C]">WHATSAPP</p>
                      <p className="font-heading text-2xl text-white">055 811 2779</p>
                    </div>
                  </a>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-[#052828] py-16 px-6 md:px-12 border-t border-[#0A4F4F]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <h2 className="font-brand text-4xl text-[#F9F5EE] mb-2">Nhyira's Atelier</h2>
                <p className="font-serif italic text-[#C9A84C]">Curated Experiences</p>
              </div>
              <div className="flex gap-6">
                <a href="#" className="text-[#F9F5EE] hover:text-[#C9A84C] transition-colors"><FaInstagram size={24} /></a>
                <a href="#" className="text-[#F9F5EE] hover:text-[#C9A84C] transition-colors"><FaTiktok size={24} /></a>
                <a href="#" className="text-[#F9F5EE] hover:text-[#C9A84C] transition-colors"><FaWhatsapp size={24} /></a>
              </div>
              <p className="font-sans text-sm text-[#F9F5EE]/60 font-light">
                © 2025 Nhyira's Atelier. All rights reserved.
              </p>
            </div>
          </footer>

          {/* Portfolio Modal */}
          <AnimatePresence>
            {activePortfolioItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex bg-white/95 backdrop-blur-sm p-4 md:p-12"
              >
                <div className="w-full max-w-6xl mx-auto bg-[#F9F5EE] flex flex-col md:flex-row shadow-2xl relative border border-[#0D6E6E]/20">
                  <button 
                    onClick={() => setActivePortfolioItem(null)}
                    className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white text-[#0A4F4F] border border-[#0D6E6E] hover:bg-[#0A4F4F] hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                  
                  <div className="w-full md:w-3/5 relative overflow-hidden bg-black flex items-center justify-center min-h-[400px]">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={selectedImageIndex}
                        src={activePortfolioItem.images[selectedImageIndex]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </AnimatePresence>
                  </div>
                  
                  <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
                    <p className="font-label text-sm tracking-widest text-[#0D6E6E] mb-4">{activePortfolioItem.category}</p>
                    <h2 className="font-heading text-4xl text-[#0A4F4F] mb-6">{activePortfolioItem.title}</h2>
                    
                    {activePortfolioItem.description && (
                      <p className="font-sans text-gray-700 font-light mb-8 leading-relaxed">
                        {activePortfolioItem.description}
                      </p>
                    )}
                    
                    {activePortfolioItem.packageDetails && (
                      <div className="mb-8">
                        <h3 className="font-label text-xs tracking-widest text-[#0A4F4F] mb-3">PACKAGE DETAILS</h3>
                        <p className="font-sans text-sm text-gray-600 font-light whitespace-pre-wrap">{activePortfolioItem.packageDetails}</p>
                      </div>
                    )}
                    
                    {activePortfolioItem.estimatedBudget && (
                      <div className="mt-auto">
                        <h3 className="font-label text-xs tracking-widest text-[#0A4F4F] mb-2">ESTIMATED BUDGET</h3>
                        <p className="font-serif italic text-xl text-[#0D6E6E]">{activePortfolioItem.estimatedBudget}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}