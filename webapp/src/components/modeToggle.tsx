import { Moon, Sun } from "lucide-react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/themeProvider"
import { useAuth } from "@/context/authContext"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const { updateSettings } = useAuth()

  //cambia state locale e chiama db per salvataggio preferenze
  const changeTheme = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    updateSettings({ theme: newTheme });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-card!">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="left">
        <DropdownMenuItem className="justify-between" onClick={() => changeTheme("light")}>
          Light
          {theme === "light" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem className="justify-between" onClick={() => changeTheme("dark")}>
          Dark
          {theme === "dark" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem className="justify-between" onClick={() => changeTheme("system")}>
          System
          {theme === "system" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}