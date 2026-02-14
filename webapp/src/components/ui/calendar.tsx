import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:2rem]",
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        // STILE FRECCE NAVIGAZIONE
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "bg-popover absolute inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium text-sm",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse space-y-1",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        day: cn(
          "p-0 text-center text-sm focus-within:relative focus-within:z-20",
          defaultClassNames.day
        ),
        range_start: "range-start",
        range_end: "range-end",
        range_middle: "range-middle",
        today: "today",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
            // Logica frecce
            const Icon = orientation === "left" ? ChevronLeftIcon : (orientation === "right" ? ChevronRightIcon : ChevronDownIcon);
            return <Icon className={cn("size-4", className)} {...props} />
        },
        DayButton: CalendarDayButton, // Usiamo il nostro bottone custom qui sotto
        ...components,
      }}
      {...props}
    />
  )
}

// --- QUI C'È LA LOGICA DEI COLORI HARDCODED ---
// components/ui/calendar.tsx

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)

  // 1. Definiamo gli stati basandoci sui modifiers
  const isSelected = modifiers.selected;
  const isRangeStart = modifiers.range_start;
  const isRangeEnd = modifiers.range_end;
  const isRangeMiddle = modifiers.range_middle;
  const isOutside = modifiers.outside;
  const isToday = modifiers.today;

  return (
    <Button
      ref={ref}
      variant="ghost" // Usiamo ghost per evitare lo sfondo bianco di default
      size="icon"
      className={cn(
        "h-9 w-9 p-0 font-normal transition-colors relative",
        
        // 1. GIORNI NORMALI (Non selezionati)
        // Usiamo bg-[#1e293b] o simile se bg-card non basta a coprire il bianco
        !isSelected && "bg-card! hover:border-primary! text-foreground! hover:bg-muted",

        // 2. EVIDENZIAZIONE GIORNO CORRENTE (Oggi)
        // Se è oggi e NON è selezionato, mettiamo un bordo e il testo colorato
        (isToday && !isSelected) && "border-2 hover:border-primary! border-yellow-500! text-primary font-bold",
        // Se è oggi ed è ANCHE selezionato, aggiungiamo solo un piccolo indicatore (es. un puntino in basso) 
        // o lo lasciamo semplicemente col colore primary pieno
        (isToday && isSelected) && "after:content-[''] after:absolute hover:border-primary! after:bottom-1 after:w-1 after:h-1 after:bg-white after:rounded-full",
        
        // 3. GIORNI FUORI DAL MESE (Grigiati)
        isOutside && "bg-transparent text-muted-foreground opacity-50",

        // 4. RANGE MIDDLE (Il periodo nel mezzo - Sbiadito)
        // Forziamo il colore con ! per vincere su tutto
        isRangeMiddle && "bg-primary/20! text-foreground! border-0! rounded-none hover:bg-primary/30!",

        // 5. START / END / SELEZIONE SINGOLA (Pieno)
        (isRangeStart || isRangeEnd || (isSelected && !isRangeMiddle)) && 
          "bg-primary! text-primary-foreground! hover:bg-primary! border-0! hover:text-primary-foreground! rounded-md",

        // 6. LOGICA ARROTONDAMENTI PER IL RANGE
        isRangeStart && "rounded-r-none",
        isRangeEnd && "rounded-l-none",

        // 7. OGGI
        (isToday && !isSelected) && "border border-primary text-primary font-bold",

        className
      )}
      {...props}
    />
  )
}
export { Calendar, CalendarDayButton }