import { SidebarProvider, Sidebar, SidebarTrigger } from "@/components/sidebar/sidebarLayout"
import { NavLayout } from "@/components/nav/navLayout"
import UserArea from "@/components/user-area";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/modeToggle";

export default function UserAreaPage(){
    return(
        <div className="w-screen h-screen overflow-x-hidden">
            <SidebarProvider>
                {/* 1. SIDEBAR (Sticky a sinistra) */}
                <Sidebar />

                {/* 2. MAIN WRAPPER (Il resto della pagina) */}
                {/* flex-1: occupa tutto lo spazio rimanente */}
                {/* overflow-hidden: impedisce scroll orizzontale durante transizione sidebar */}
                {/* transition-all: anima il resize del contenuto quando la sidebar si muove */}
                
                    <main className="flex-1 flex flex-col min-h-screen w-full bg-background transition-all duration-300 ease-in-out">
                        
                        {/* A. NAVBAR */}
                        <NavLayout className="sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur-md flex items-center px-6 gap-4 justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <SidebarTrigger/>
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
                                <ModeToggle/>
                            </div>
                        </NavLayout>

                        {/* B. CONTENUTO SCROLLABILE */}
                        {/* p-6 o p-8 da "aria" tra sidebar/navbar e contenuto */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8">
                            <div className="max-w-6xl mx-auto"> {/* Opzionale: per centrare il contenuto su schermi larghi */}
                                <UserArea/>
                            </div>
                        </div>
                    </main>
                
            </SidebarProvider>
        </div>

    )
}