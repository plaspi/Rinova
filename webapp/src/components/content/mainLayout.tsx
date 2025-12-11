"use client"
import React from "react";
import {cn} from "@/lib/utils";

const ContentLayout = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
    >(({className, ...props }, ref)=> {
        return (
            <main
                ref={ref}
                className={cn(
                    "w-full h-full", // Rimosso bg-gray-400 per usare i colori del tema shadcn
                    className
                )}
                {...props}
            >
                {props.children}
            </main>
        )
    })

export { ContentLayout }