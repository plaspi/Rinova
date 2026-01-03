import { SidebarProvider, Sidebar, SidebarTrigger } from "@/components/sidebar/sidebarLayout"
import { NavLayout } from "@/components/nav/navLayout"
import { ModeToggle } from "@/components/modeToggle"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function HomePage() {
    return (
        <SidebarProvider>
            {/* 1. SIDEBAR (Sticky a sinistra) */}
            <Sidebar />

            {/* 2. MAIN WRAPPER (Il resto della pagina) */}
            {/* flex-1: occupa tutto lo spazio rimanente */}
            {/* overflow-hidden: impedisce scroll orizzontale durante transizione sidebar */}
            {/* transition-all: anima il resize del contenuto quando la sidebar si muove */}
            <main className="flex-1 flex flex-col min-h-screen min-w-0 bg-background transition-all duration-300 ease-in-out">
                
                {/* A. NAVBAR */}
                <NavLayout className="sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur-md flex items-center px-6 gap-4 justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger />
                        <div className="h-6 w-px bg-border/60 mx-2 hidden md:block" /> {/* Separatore */}
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="#" className="font-medium">Rinova</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex items-center gap-3">
                        <ModeToggle />
                    </div>
                </NavLayout>

                {/* B. CONTENUTO SCROLLABILE */}
                {/* p-6 o p-8 da "aria" tra sidebar/navbar e contenuto */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                    
                    {/* Header Pagina */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold tracking-tight">Panoramica Energetica</h1>
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow hover:bg-primary/90 transition-colors">
                            Scarica Report
                        </button>
                    </div>

                    {/* Griglia Grafici (Esempio Shadcn Blocks) */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <CardDemo title="Produzione Oggi" value="24.5 kWh" change="+12%" icon="sun" />
                        <CardDemo title="Consumo" value="18.2 kWh" change="-2%" icon="zap" />
                        <CardDemo title="Batteria" value="85%" change="In carica" icon="battery" />
                        <CardDemo title="Risparmio CO2" value="12kg" change="Ottimo" icon="leaf" />
                    </div>

                    {/* Grafico Grande */}
                    <div className="grid gap-6 md:grid-cols-7 lg:h-[400px]">
                        <div className="col-span-4 rounded-xl border bg-card p-6 shadow-sm">
                            <h3 className="font-semibold mb-4">Produzione vs Consumo</h3>
                            <div className="h-[300px] w-full bg-muted/20 rounded-lg flex items-center justify-center border border-dashed border-border">
                                <span className="text-muted-foreground">Area Grafico (Recharts)</span>
                            </div>
                        </div>
                        <div className="col-span-3 rounded-xl border bg-card p-6 shadow-sm">
                            <h3 className="font-semibold mb-4">Stato Dispositivi</h3>
                             <div className="h-[300px] w-full bg-muted/20 rounded-lg flex items-center justify-center border border-dashed border-border">
                                <span className="text-muted-foreground">Lista Impianti</span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </SidebarProvider>
    )
}

// Componente Demo per le Card (giusto per vedere il layout)
function CardDemo({ title, value, change }: { title: string, value: string, change: string, icon: string }) {
    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                <div className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground mt-1">
                <span className={change.includes('+') ? "text-green-600" : "text-muted-foreground"}>{change}</span> rispetto a ieri
            </p>
        </div>
    )
}