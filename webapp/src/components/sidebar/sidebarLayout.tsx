import { useState, useCallback, useEffect, useMemo } from "react"; //TODO: make collapsible and responsive
import React from "react";
import {cn} from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { TooltipProvider } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetHeader } from "@/components/ui/sheet"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH_MOBILE = "18.75rem"
const SIDEBAR_WIDTH = "18.75rem"
const SIDEBAR_WIDTH_ICON = "3.75rem"


type SidebarProps = {
    state: "expanded" | "collapsed"
    open: boolean
    setOpen: (open: boolean) => void
    openMobile: boolean
    setOpenMobile: (open: boolean) => void
    isMobile: boolean
    toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarProps | null>(null)

function useSidebar() {
    const context = React.useContext(SidebarContext)
    if(!context) {
        throw new Error("Sidebar context error")
    }
    return context
}


const SidebarLayout = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
        defaultOpen?: boolean
        open?: boolean
        onOpenChange?: (open: boolean) => void
    }
    >(
        (
            {
                defaultOpen = true,
                open: openProp,
                onOpenChange: setOpenProp,
                style,
                className,
                children,
                ...props 
            }, ref
        )=> {
            const isMobile = useIsMobile()
            const [openMobile, setOpenMobile] = useState(false)

            //intern part of sidebar
            //openProp and setOpenProp to control sidebar from outside the component
            const [_open, _setOpen] = useState(defaultOpen)
            const open = openProp ?? _open
            const setOpen = useCallback(
                (value: boolean | ((value: boolean)=> boolean)) => {
                    const openState = typeof value === "function" ? value(open) : value
                    if(setOpenProp) {
                        setOpenProp(openState)
                    } else {
                        _setOpen(openState)
                    }
                    //set cookie to keep sidebar state
                    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
                },
                [setOpenProp, open]
            )

            //toggle the sidebar
            const toggleSidebar = useCallback(() => {
                return isMobile
                    ? setOpenMobile((open) => !open)
                    : setOpen((open)=> !open)
            }, [isMobile, setOpen, setOpenMobile])

            //add kb shortcut to toggle sidebar
            useEffect(() => {
                const handleKeyDown = (event: KeyboardEvent) => {
                    if(
                        event.key === "b" && (event.metaKey || event.ctrlKey)
                    ) {
                        event.preventDefault()
                        toggleSidebar()
                    }
                }
                window.addEventListener("keydown", handleKeyDown)
                return () => window.removeEventListener("keydown", handleKeyDown)
            }, [toggleSidebar])

            //add state to sidebar to do data-state="expanded" or "collapsed" and better deal with sidebar with tailwind classes
            const state = open ? "expanded" : "collapsed"

            const contextValue = useMemo<SidebarProps>(
                ()=> ({
                    state,
                    open,
                    setOpen,
                    isMobile,
                    openMobile,
                    setOpenMobile,
                    toggleSidebar,
                }),
                [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
            )

        //return the sidebar context provider and wrap everyting with tooltip provider to use tooltip in children
        return (
            <SidebarContext.Provider value={contextValue}>
                <TooltipProvider delayDuration={0}>
                    <div
                        style={
                            {
                                "--sidebar-width": SIDEBAR_WIDTH,
                                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                                ...style,
                            } as React.CSSProperties
                        }
                        ref={ref} 
                        className={cn(
                            "bg-white col-start-1 row-start-1 row-span-2 w-full h-full",
                            className
                        )}
                        {...props}
                    >
                    </div>
                </TooltipProvider>
            </SidebarContext.Provider>
        )
    }
)
SidebarLayout.displayName = "SidebarLayout"

const Sidebar = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
        collapsible?: "offcanvas" | "icon"        
    }
>(
    (
        {
            collapsible,
            className,
            children,
            ...props
        },
        ref
    ) => {
        const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

        if (isMobile) {
            return (
                <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
                    <SheetContent
                        data-sidebar= "sidebar"
                        data-mobile= "true"
                        className=""
                        style={
                            {
                                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
                            } as React.CSSProperties
                        }
                        side={"left"}
                    >
                        <SheetHeader className="sr-only">
                            <SheetTitle>Sidebar</SheetTitle>
                            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
                        </SheetHeader>
                         <div className="flex h-full w-full flex-col">{children}</div>
                    </SheetContent>
                </Sheet>
            )
        }

        //if not mobile
        return (
            <div
               ref={ref}
               className="group w-auto h-screen text-sidebar-foreground md:block"
               data-state={state}
               data-collapsible={state === "collapsed" ? collapsible : ""}
               data-variant={"sidebar"}
               data-side={"left"}
            >
                <div
                    className={cn(
                        "w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear"

                    )}
                >

                </div>

            </div>
        )
    }
)

export{
    SidebarLayout,
    Sidebar,
}