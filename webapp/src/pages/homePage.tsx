import { SidebarLayout, Sidebar } from "@/components/sidebar/sidebarLayout"
import { NavLayout } from "@/components/nav/navLayout"
import { ContentLayout } from "@/components/content/mainLayout"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"

export default function HomePage() {
    return (
        <div className="grid grid-cols-[300px_1fr] grid-rows-[60px_1fr] min-h-screen min-w-screen">
            <NavLayout className="sticky top-0 z-10">
                <Breadcrumb id="TO-REMAKE">
                    <BreadcrumbList>
                        <BreadcrumbItem className="">
                        <BreadcrumbLink href="#">
                            Building Your Application
                        </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="" />
                        <BreadcrumbItem>
                        <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </NavLayout>
            <SidebarLayout>
                <Sidebar></Sidebar>
            </SidebarLayout>
            <ContentLayout/>
        </div>
    )
        {/*<SidebarProvider 
            className="grid h-screen w-screen"
            style={{
                gridTemplateColumns: "var(--sidebar-width, 16rem) 1fr",
                gridTemplateRows: "auto 1fr",
            }}>
            <AppSidebar className="row-span-2 border-r overflow-hidden" />
            <SidebarInset>
                <header>
                <div id="breadcrumbBar" className="border-b sticky top-0 bg-background z-10">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="">
                        <BreadcrumbLink href="#">
                            Building Your Application
                        </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="" />
                        <BreadcrumbItem>
                        <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                    </Breadcrumb>
                </div>
                </header>
                <main className="overflow-y-auto min-h-screen">
                    prova
                </main>
            </SidebarInset>
        </SidebarProvider>*/}
}
