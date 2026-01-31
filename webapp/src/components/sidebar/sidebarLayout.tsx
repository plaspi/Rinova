import React, { createContext, useContext, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, Zap, Building2, Leaf, 
  PanelLeft, LogOut, ChevronsUpDown, 
  BadgeCheck, Bell, Settings, Sparkles,
  LifeBuoy, ChartNoAxesCombined,
} from "lucide-react"; 
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { useAuth } from "@/context/authContext";
import { LogoutScreen } from "@/components/logout-screen";
import { RinovaLogo } from "@/components/rinova-logo";

// --- CONFIGURAZIONE ---
const WIDTH_OPEN = "280px";
const WIDTH_CLOSED = "80px";
const SIDEBAR_KEY = "sidebar_state";

// Mapping dei ruoli per UI (Colori e Etichette)
// Keys match UserRole type in authContext
const ROLE_STYLES: Record<string, { label: string, color: string }> = {
  admin: { label: "Admin", color: "bg-primary/10 text-primary border-primary/20" },
  super_admin: { label: "Dev Admin", color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  representative: { label: "Comune", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  member: { label: "Prosumer", color: "bg-green-500/10 text-green-600 border-green-200" },
  // Fallback
  default: { label: "Utente", color: "bg-muted text-muted-foreground border-border" }
};

// Tipo per i dati processati pronti per la UI
type SidebarUserUI = {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
  roleStyle: { label: string, color: string };
};

type SidebarContextType = {
  expanded: boolean;
  setExpanded: (val: boolean) => void;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
  toggleSidebar: () => void;
  sidebarUser: SidebarUserUI; // Dati utente pronti per la UI
  signOut: () => Promise<void>;
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
  const { user, profile, signOut, isLoggingOut } = useAuth();

  //dati dal profilo per la sidebar
  const sidebarUser: SidebarUserUI = {
    fullName: profile?.name && profile?.surname 
      ? `${profile.name} ${profile.surname}` 
      : "Utente Rinova",
    
    email: user?.email || "",
    
    avatarUrl: profile?.avatar_url || null,
    
    initials: profile?.name && profile?.surname 
      ? (profile.name[0] + profile.surname[0]).toUpperCase() 
      : "R",

    roleStyle: profile?.role 
      ? (ROLE_STYLES[profile.role] || ROLE_STYLES.default) 
      : ROLE_STYLES.default
  };

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
    <SidebarContext.Provider value={{ 
      expanded, setExpanded, isMobile, mobileOpen, setMobileOpen, toggleSidebar, 
      sidebarUser, signOut 
    }}>
      <div className="flex min-h-screen w-full bg-background transition-colors duration-300">
        {isLoggingOut && <LogoutScreen/>}
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

// --- CONTENUTO SIDEBAR ---
function SidebarContent() {
  const navigate = useNavigate();
  const { expanded, isMobile, sidebarUser, signOut } = useSidebar();
  const location = useLocation();

  const items = [
    { title: "Dashboard", href: "/home", icon: LayoutDashboard },
    { title: "Produzione Live", href: "/production", icon: Zap },
    { title: "Storico Produzione", href: "/recap", icon: ChartNoAxesCombined },
    { title: "Gestione CER", href: "/cer", icon: Building2 },
    { title: "Impianti", href: "/plants", icon: Leaf },
  ];

  //helper per renderizzare l'avatar
  const renderAvatar = (className?: string) => {
    return (
      <Avatar className={cn("rounded-lg items-center justify-center transition-transform", className)}>
         {sidebarUser.avatarUrl ? (
            <AvatarImage src={sidebarUser.avatarUrl} alt={sidebarUser.fullName} />
         ) : null}
         
         <AvatarFallback className="rounded-lg bg-green-500/10 text-green-600">
            {/*no avatar quindi Leaf icon come standard  */}
            <Leaf className="h-5 w-5 fill-current" />
         </AvatarFallback>
      </Avatar>
    );
  };

  return (
    <div className="flex h-full flex-col bg-card text-card-foreground overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="flex h-24 items-center shrink-0">
        <Link to="/home" className="flex items-center w-full h-full group hover:bg-muted/10 transition-colors">
          <div className="flex items-center justify-center w-20 min-w-20 h-full shrink-0">
            <RinovaLogo></RinovaLogo>
          </div>
          <div className={cn(
            "flex flex-col overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap origin-left pl-2",
            expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5 w-0"
          )}>
            <span className="font-bold text-2xl tracking-tight leading-none">Rinova</span>
            <span className={cn("text-[10px] uppercase font-bold tracking-wider mt-1.5! px-3.5! py-0.5! rounded-full w-fit border", sidebarUser.roleStyle.color)}>
              {sidebarUser.roleStyle.label}
            </span>
          </div>
        </Link>
      </div>

      <Separator className="w-[80%] mx-auto opacity-50 mb-2" />

      {/* --- NAVIGAZIONE --- */}
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
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted/10 hover:text-foreground", 
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

      {/* --- USER FOOTER --- */}
      <div className="flex h-20 items-center shrink-0 mb-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
                variant="ghost" 
                className={cn(
                    "bg-transparent!",
                    "w-full h-20 border-0 focus-visible:ring-0 rounded-none transition-all",
                    "p-0 hover:bg-muted/10 data-[state=open]:bg-muted/10",
                    "justify-start",
                )}
            >
                {/* Avatar Container */}
                <div className="flex items-center w-10 min-w-10 h-full shrink-0 justify-center">
                  {renderAvatar("h-10 w-10")}
                </div>

                {/* Testo Utente */}
                <div className={cn(
                    "flex flex-col text-left text-sm overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap origin-left pl-2",
                    expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5 w-0"
                )}>
                    <span className="truncate font-semibold">{sidebarUser.fullName}</span>
                    <span className="truncate text-xs text-muted-foreground">{sidebarUser.email}</span>
                </div>

                 <ChevronsUpDown className={cn(
                    "ml-auto size-4 mr-4 transition-all duration-300 text-muted-foreground",
                    expanded ? "opacity-100" : "opacity-0 hidden"
                )} />
            </Button>
          </DropdownMenuTrigger>
          
          {/* --- DROPDOWN MENU --- */}
          <DropdownMenuContent 
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg p-1 border-border" 
            side={isMobile ? "bottom" : "right"} 
            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm"> 
                {renderAvatar("h-8 w-8")}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{sidebarUser.fullName}</span>
                  <span className="truncate text-xs text-muted-foreground">{sidebarUser.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="my-1" />
            
            <DropdownMenuGroup className="gap-1 flex flex-col">
              <DropdownMenuItem 
                className="gap-2 py-1.5 px-2 cursor-pointer focus:bg-amber-500/10 focus:text-amber-600 rounded-md group"
                onClick={() => navigate("/subscription")}
              >
                  <Sparkles className="size-4 text-amber-500 group-hover:text-amber-600" />
                  <span className="font-semibold text-amber-600/90 group-hover:text-amber-700">Upgrade to Pro</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="my-1 opacity-50" />

              <DropdownMenuItem asChild className="gap-2 py-1.5 px-2 cursor-pointer focus:bg-primary/10 focus:text-primary rounded-md" >
                  <Link to="/user-area">
                    <BadgeCheck className="size-4" />
                    Account
                  </Link>
              </DropdownMenuItem>

              <DropdownMenuItem className="gap-2 py-1.5 px-2 cursor-pointer focus:bg-primary/10 focus:text-primary rounded-md" onClick={()=> navigate("/settings?tab=notifiche")}>
                  <Bell className="size-4" />
                  Notifiche
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 py-1.5 px-2 cursor-pointer focus:bg-primary/10 focus:text-primary rounded-md" onClick={()=> navigate("/settings")}>
                  <Settings className="size-4" />
                  Impostazioni
              </DropdownMenuItem>

              <DropdownMenuItem 
                    className="gap-2 py-1.5 px-2 cursor-pointer focus:bg-primary/10 focus:text-primary rounded-md"
                    onClick={() => navigate("/user-area/support")}
                >
                    <LifeBuoy className="size-4" />
                    Supporto
                </DropdownMenuItem>

            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-1" />
            
            <DropdownMenuItem 
              onClick={async () => {
                await signOut();
                navigate("/login");
              }}
              className="gap-2 py-1.5 px-2 text-red-700 focus:text-red-700 focus:bg-red-400 cursor-pointer font-medium rounded-md"
            >
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// --- SIDEBAR PRINCIPALE ---
export function Sidebar() {
  const { isMobile, mobileOpen, setMobileOpen, expanded } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-75 border-r-0 bg-card">
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
    <Button variant="ghost" size="icon" onClick={toggleSidebar} className={cn("h-9 w-9 hover:bg-muted/10", className)}>
      <PanelLeft className="h-5 w-5 text-muted-foreground" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}