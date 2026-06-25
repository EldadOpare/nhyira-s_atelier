import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useListPortfolio } from "@workspace/api-client-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

function ImageSlideshow({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(id);
  }, [images.length]);

  if (!images.length) {
    return <div className="w-full h-full bg-[#0A4F4F]" />;
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence>
        <motion.img
          key={current}
          src={images[current]}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-[#0A4F4F]/40" />

      {/* Brand overlay */}
      <div className="absolute bottom-10 left-10">
        <p className="font-brand text-4xl text-white">Nhyira's</p>
        <p className="font-label text-[10px] tracking-[0.3em] text-white/70 uppercase mt-1">Atelier</p>
      </div>

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-10 right-10 flex gap-1.5">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${i === current ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: portfolio } = useListPortfolio();

  const images = useRef<string[]>([]);

  if (images.current.length === 0 && portfolio?.length) {
    const allImages = portfolio.flatMap((item: any) => item.images as string[]).filter(Boolean);
    const shuffled = [...allImages].sort(() => Math.random() - 0.5);
    images.current = shuffled.slice(0, 8);
  }

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginForm) => {
    setIsLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    setIsLoading(false);

    if (signInError) {
      setError(signInError.message ?? "Invalid email or password");
      return;
    }

    setLocation("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex">

      {/* Left — 65% image slideshow */}
      <div className="hidden lg:block lg:w-[65%] relative">
        <ImageSlideshow images={images.current} />
      </div>

      {/* Vertical divider */}
      <div className="hidden lg:block w-px bg-[#0A4F4F]/15 flex-shrink-0" />

      {/* Right — 35% login form */}
      <div className="w-full lg:w-[35%] bg-white flex items-center justify-center px-10 py-16">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="mb-12">
            <h1 className="font-brand text-5xl text-[#C9A84C] mb-1">Nhyira's</h1>
            <p className="font-label text-[10px] tracking-[0.3em] text-[#0A4F4F]/60 uppercase">Atelier Admin</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        className="border-0 border-b border-[#0A4F4F]/20 focus-visible:ring-0 focus-visible:border-[#0A4F4F] rounded-none bg-transparent h-11 px-0 text-[#0A4F4F]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-label text-[10px] tracking-[0.2em] text-[#0A4F4F] uppercase">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="border-0 border-b border-[#0A4F4F]/20 focus-visible:ring-0 focus-visible:border-[#0A4F4F] rounded-none bg-transparent h-11 px-0 text-[#0A4F4F]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0A4F4F] hover:bg-[#0D6E6E] text-white font-label tracking-[0.2em] text-xs uppercase rounded-[10px] h-12 transition-colors"
                >
                  {isLoading ? "SIGNING IN…" : "SIGN IN"}
                </Button>
              </div>

              {error && (
                <p className="text-red-500 text-xs text-center font-sans">{error}</p>
              )}
            </form>
          </Form>
        </motion.div>
      </div>

    </div>
  );
}
