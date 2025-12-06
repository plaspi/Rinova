"use client"
import React from "react";
import {cn} from "@/lib/utils";

const NavLayout = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
    >(({className, ...props }, ref)=> {
        return (
            <div 
                ref={ref} 
                // Rimosse classi specifiche di griglia, lasciamo solo quelle passate dal padre
                className={cn(
                    "w-full", 
                    className
                )}
                {...props}
            >
                {props.children}
            </div>
        )
    })

export { NavLayout }