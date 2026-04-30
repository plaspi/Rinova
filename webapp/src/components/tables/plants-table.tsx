import { useState } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { Sun, Wind, Flame, Zap, Settings, AlertTriangle, Search, MoreHorizontal, Check, Wrench } from "lucide-react";
import { ImpiantoDetails } from "../details/impiantoDetails"
import { usePlants } from "@/context/plantsContext"
import { useQueryClient } from "@tanstack/react-query"

interface PlantsTableProps {
    data: any[]; 
}

export function PlantsTable({ data }: PlantsTableProps) {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const { updatePlantStatus } = usePlants(); // Context function to update plant status
  const queryClient = useQueryClient();

  // Filtro client-side
  const filteredData = data.filter(item => 
    item.nome?.toLowerCase().includes(filter.toLowerCase()) ||
    item.id?.toString().includes(filter)
  );

  const handleStatusUpdate = async (plant: any, status: "attivo" | "offline" | "manutenzione") => {
    await updatePlantStatus(plant.id, status);
    queryClient.invalidateQueries({ queryKey: ['plants-list'] });
  }

  return (
    <div className="space-y-4">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full"> {/* Search prende tutta la larghezza disponibile */}
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cerca impianto per nome o ID..." 
            className="pl-8 h-9" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* TABELLA CARD */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-12.5"></TableHead>
              <TableHead>Nome Impianto</TableHead>
              <TableHead className="hidden md:table-cell">Potenza</TableHead>
              <TableHead className="md:table-cell">Installazione</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/50 transition-colors">
                
                {/* Icona Tipo */}
                <TableCell>
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {row.tipo?.toLowerCase().includes("eolico") ? <Wind className="h-5 w-5" /> : row.tipo?.toLowerCase().includes("fotovoltaico") ? <Sun className="h-5 w-5" /> : <Flame className="h-5 w-5" />}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{row.nome}</span>
                    <span className="text-xs font-mono text-muted-foreground">{row.produttore}</span>
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell">
                   <div className="flex items-center gap-1 font-medium">
                     <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                     {row.pot_nominale} kW
                   </div>
                </TableCell>

                <TableCell className=" md:table-cell text-sm text-muted-foreground">
                  {new Date(row.data_attivazione).toLocaleDateString()}
                </TableCell>

                {/* Badge Stato */}
                <TableCell>
                   <PlantBadge status={row.stato} />
                </TableCell>

                {/* Azioni */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 bg-background! hover:border-transparent!">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelected(row)}>
                        <Settings className="mr-2 h-4 w-4" /> Dettagli tecnici
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {/* case 1: allowed states: offline, manutenzione */}
                      {["offline", "manutenzione"].includes(row.stato) && (
                        <DropdownMenuItem className="text-green-600" onClick={() => handleStatusUpdate(row, "attivo")}>
                          <Check className="mr-2 h-4 w-4 text-green-600" /> Attiva impianto
                        </DropdownMenuItem>
                      )}
                      {/* case 2: allowed states: active, offline */}
                      {["attivo", "offline"].includes(row.stato) && (
                        <DropdownMenuItem className="text-yellow-600" onClick={() => handleStatusUpdate(row, "manutenzione")}>
                          <Wrench className="mr-2 h-4 w-4 text-yellow-600" /> Segnala manutenzione
                        </DropdownMenuItem>
                      )}

                      {/* case 3: allowed states: active, manutenzione */}
                      {["attivo", "manutenzione"].includes(row.stato) && (
                        <DropdownMenuItem className="text-red-600" onClick={() => handleStatusUpdate(row, "offline")}>
                          <AlertTriangle className="mr-2 h-4 w-4 text-red-600" /> Segnala guasto
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredData.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Nessun impianto trovato.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* MODALE DETTAGLI */}
      {selected && (
         <ImpiantoDetails impianto={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function PlantBadge({ status }: { status: string }) {
    let style = "bg-gray-100 text-gray-800 border-gray-200"; 
    
    // Gestione ENUM (case sensitive solitamente lowercase dal DB)
    const s = status?.toLowerCase() || "";
    
    if (s === 'attivo') {
        style = "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20";
    } else if (s === 'offline') {
        style = "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20";
    } else if (s === 'manutenzione') {
        style = "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    }

    return (
        <Badge variant="outline" className={`font-medium border capitalize ${style}`}>
            {status}
        </Badge>
    )
}