import React, { createContext, useContext, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, Zap, Building2, Leaf, 
  PanelLeft, LogOut, ChevronsUpDown, 
  Sparkles, BadgeCheck, Bell, CreditCard, Settings
} from "lucide-react"; 
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup, 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- CONFIGURAZIONE ---
const WIDTH_OPEN = "300px";
const WIDTH_CLOSED = "80px"; 
const SIDEBAR_KEY = "sidebar_state";

const CURRENT_USER = {
  name: "Mario Rossi",
  email: "mario@rinova.app",
  role: "user",
  avatar: "" 
};

const ROLE_LABELS: Record<string, { label: string, color: string }> = {
  admin: { label: "Admin Panel", color: "bg-primary/20 text-primary border-primary/20" },
  representative: { label: "Comune", color: "bg-blue-500/20 text-blue-600 border-blue-200" },
  user: { label: "Prosumer Panel", color: "bg-green-500/20 text-green-600 border-green-200" }
};

type SidebarContextType = {
  expanded: boolean;
  setExpanded: (val: boolean) => void;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem(SIDEBAR_KEY);
    if (savedState && !isMobile) setExpanded(savedState === "true");
    if (isMobile) setExpanded(true); 
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      const newState = !expanded;
      setExpanded(newState);
      localStorage.setItem(SIDEBAR_KEY, String(newState));
    }
  };

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, isMobile, mobileOpen, setMobileOpen, toggleSidebar }}>
      <div className="flex min-h-screen w-full bg-background transition-colors duration-300">
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

// --- CONTENUTO SIDEBAR ---
function SidebarContent() {
  const { expanded, isMobile } = useSidebar();
  const location = useLocation();
  const roleInfo = ROLE_LABELS[CURRENT_USER.role] || ROLE_LABELS.user;

  const items = [
    { title: "Dashboard", href: "/home", icon: LayoutDashboard },
    { title: "Produzione Live", href: "/production", icon: Zap },
    { title: "Gestione CER", href: "/members", icon: Building2 },
    { title: "Impianti", href: "/plants", icon: Leaf },
  ];

  return (
    <div className="flex h-full flex-col bg-card text-card-foreground overflow-hidden">
      
      {/* 1. HEADER */}
      <div className="flex h-24 items-center shrink-0">
        <Link to="/home" className="flex items-center w-full h-full group hover:bg-muted/30 transition-colors">
          <div className="flex items-center justify-center w-20 min-w-20 h-full shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-2xl shadow-lg transition-transform group-hover:scale-105">
              R
            </div>
          </div>
          <div className={cn(
            "flex flex-col overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap origin-left pl-2",
            expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5 w-0"
          )}>
            <span className="font-bold text-2xl tracking-tight leading-none">Rinova</span>
            <span className={cn("text-[10px] uppercase font-bold tracking-wider mt-1.5! px-3.5! py-0.5! rounded-full w-fit border", roleInfo.color)}>
              {roleInfo.label}
            </span>
          </div>
        </Link>
      </div>

      <Separator className="w-[300px] opacity-50 mb-2" />

      {/* 2. NAVIGAZIONE */}
      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden py-4">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "group flex items-center relative transition-all duration-300",
                "h-14 w-full", 
                isActive 
                  ? "bg-primary/20 text-primary" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
               <div className={cn(
                 "absolute left-0 h-full w-1 bg-primary rounded-r-full transition-all duration-300",
                 isActive ? "opacity-100" : "opacity-0"
               )} />
              <div className="flex items-center justify-center w-20 min-w-20 h-full shrink-0">
                <item.icon className={cn("h-6 w-6 transition-transform duration-300", !isActive && "group-hover:scale-110", isActive && "text-primary drop-shadow-sm")} />
              </div>
              <span className={cn(
                  "font-medium text-base whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out origin-left",
                  expanded ? "opacity-100 translate-x-0 pr-4" : "opacity-0 -translate-x-5 w-0"
              )}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* 3. USER FOOTER */}
      <div className="mt-auto border-t border-border/40 shrink-0 bg-card!"> 
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
                variant="ghost" 
                className={cn(
                    "w-full h-20 p-0 hover:bg-muted/30 transition-all flex items-center rounded-none border-0 focus-visible:ring-0 focus-visible:bg-muted/30 justify-start data-[state=open]:bg-muted/30",
                )}
            >
                <div className="flex items-center justify-center w-20 min-w-20 h-full shrink-0">
                  <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarImage src={CURRENT_USER.avatar} alt={CURRENT_USER.name} />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">MR</AvatarFallback>
                  </Avatar>
                </div>

                <div className={cn(
                    "grid flex-1 text-left text-sm leading-tight overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out pl-2",
                    expanded ? "opacity-100 translate-x-0 w-full pr-4! -ml-4!" : "opacity-0 -translate-x-5 w-0"
                )}>
                    <span className="truncate font-semibold">{CURRENT_USER.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{CURRENT_USER.email}</span>
                </div>

                 <ChevronsUpDown className={cn(
                    "ml-auto size-4 mr-4! transition-all duration-300",
                    expanded ? "opacity-100" : "opacity-0 hidden"
                )} />
            </Button>
          </DropdownMenuTrigger>
          
          {/* --- DROPDOWN MENU --- */}
          <DropdownMenuContent 
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg p-1!" // Container Sottile
            side={isMobile ? "bottom" : "right"} 
            align="end"
            sideOffset={4}
          >
            {/* HEADER UTENTE */}
            <DropdownMenuLabel className="p-0! font-normal">
              <div className="flex items-center gap-2! px-2! py-1.5! text-left text-sm"> {/* Header Compatto */}
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={CURRENT_USER.avatar} alt={CURRENT_USER.name} />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary">MR</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{CURRENT_USER.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{CURRENT_USER.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="my-1!" /> {/* Separatore Sottile */}
            
            <DropdownMenuGroup className="gap-1! flex flex-col">
              <DropdownMenuItem className="gap-2! py-1.5! px-2! cursor-pointer focus:bg-primary/10 focus:text-primary rounded-md">
                <Sparkles className="size-4" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator className="my-1!" />
            
            <DropdownMenuGroup className="gap-1! flex flex-col">
              <DropdownMenuItem className="gap-2! py-1.5! px-2! cursor-pointer focus:bg-primary/10 focus:text-primary rounded-md">
                <BadgeCheck className="size-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2! py-1.5! px-2! cursor-pointer focus:bg-primary/10 focus:text-primary rounded-md">
                <CreditCard className="size-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2! py-1.5! px-2! cursor-pointer focus:bg-primary/10 focus:text-primary rounded-md">
                <Bell className="size-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2! py-1.5! px-2! cursor-pointer focus:bg-primary/10 focus:text-primary rounded-md">
                <Settings className="size-4" />
                Impostazioni
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-1!" />
            
            <DropdownMenuItem className="gap-2! py-1.5! px-2! text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer font-medium rounded-md">
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { isMobile, mobileOpen, setMobileOpen, expanded } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[300px] border-r-0 bg-card">
            <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader>
            <SidebarContext.Provider value={{ ...useSidebar(), expanded: true }}>
                <SidebarContent />
            </SidebarContext.Provider>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      style={{ width: expanded ? WIDTH_OPEN : WIDTH_CLOSED }}
      className={cn(
        "hidden md:block h-screen sticky top-0 left-0 z-30",
        "border-r border-border/50 bg-card",
        "transition-[width] duration-500 cubic-bezier(0.25, 1, 0.5, 1)", 
        "will-change-[width] overflow-hidden shadow-sm"
      )}
    >
      <SidebarContent />
    </aside>
  );
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button variant="ghost" size="icon" onClick={toggleSidebar} className={cn("h-9 w-9 hover:bg-muted/50", className)}>
      <PanelLeft className="h-5 w-5 text-muted-foreground" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}