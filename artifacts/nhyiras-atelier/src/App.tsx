import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Import pages
import Home from "./pages/public/home";
import AdminLogin from "./pages/admin/login";
import AdminLayout from "./pages/admin/layout";
import AdminDashboard from "./pages/admin/dashboard";
import AdminPortfolio from "./pages/admin/portfolio";
import AdminEnquiries from "./pages/admin/enquiries";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin">
        <Switch>
          <Route path="/" component={AdminLogin} />
          <Route path="/dashboard">
            <AdminLayout><AdminDashboard /></AdminLayout>
          </Route>
          <Route path="/portfolio">
            <AdminLayout><AdminPortfolio /></AdminLayout>
          </Route>
          <Route path="/enquiries">
            <AdminLayout><AdminEnquiries /></AdminLayout>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;