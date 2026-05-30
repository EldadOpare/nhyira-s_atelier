import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const login = useAdminLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    login.mutate({ data: values }, {
      onSuccess: () => {
        setLocation("/admin/dashboard");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F9F5EE] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-12 border border-[#0D6E6E]/20"
      >
        <div className="text-center mb-10">
          <h1 className="font-brand text-5xl text-[#C9A84C] mb-2">Nhyira's</h1>
          <h2 className="font-label text-sm tracking-widest text-[#0A4F4F]">ATELIER ADMIN</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-label text-xs tracking-widest text-[#0A4F4F]">PASSWORD</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      className="border-[#0D6E6E]/30 focus-visible:ring-[#0D6E6E] rounded-none bg-white h-12" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={login.isPending}
              className="w-full bg-[#0D6E6E] hover:bg-[#0A4F4F] text-white font-label tracking-widest rounded-none h-12"
            >
              {login.isPending ? "AUTHENTICATING..." : "LOGIN"}
            </Button>
            
            {login.isError && (
              <p className="text-red-500 text-sm text-center font-sans">Invalid password</p>
            )}
          </form>
        </Form>
      </motion.div>
    </div>
  );
}