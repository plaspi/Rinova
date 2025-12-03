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
                className={cn(
                    "bg-black col-start-2 row-start-1 w-full h-full",
                    className
                )}
                {...props}
            >
            </div>
        )
    })

export{
    NavLayout,

}