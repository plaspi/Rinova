"use client"

import React from "react";
import {cn} from "@/lib/utils";

const ContentLayout = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
    >(({className, ...props }, ref)=> {
        return (
            <div
                ref={ref}
                className={cn(
                    "bg-gray-400 col-start-2 row-start-2 w-full h-full",
                    className
                )}
                {...props}
            >
            </div>
        )
    })

export{
    ContentLayout,
    
}