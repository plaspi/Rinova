import { SidebarTrigger } from "@/components/sidebar/sidebarLayout";
import { NavLayout } from "@/components/nav/navLayout";
import { ModeToggle } from "@/components/modeToggle";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { UserAvatarCard } from "@/components/user-area/userAvatarCard";
import { UserProfileForm } from "@/components/user-area/userProfileForm";
import { UserPasswordForm } from "@/components/user-area/userPasswordForm";
import { UserCog2 } from "lucide-react";

export default function UserAreaPage() {
    return (
                <main className="flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out">
                    <NavLayout className="sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur-md flex items-center px-6 gap-4 justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="bg-card!" />
                            <div className="h-6 w-px bg-border/60 mx-2 hidden md:block" />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem><BreadcrumbLink href="/home">Rinova</BreadcrumbLink></BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem><BreadcrumbPage>Il mio Account</BreadcrumbPage></BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        <div className="flex items-center gap-3"><ModeToggle/></div>
                    </NavLayout>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="max-w-6xl mx-auto space-y-8">
                            <div>
                                <h1 className="text-4xl! font-bold tracking-tight flex items-center gap-2">
                                    <UserCog2 className="h-8 w-8 text-primary" />
                                    Impostazioni Profilo
                                </h1>
                                <p className="text-muted-foreground mt-1">Gestisci le tue informazioni personali e la sicurezza dell'account.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* Colonna SX: Avatar e Danger Zone */}
                                <div className="lg:col-span-4 space-y-6">
                                    <UserAvatarCard />
                                </div>

                                {/* Colonna DX: Forms */}
                                <div className="lg:col-span-8 space-y-6">
                                    <UserProfileForm />
                                    <UserPasswordForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
    )
}