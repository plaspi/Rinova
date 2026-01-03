// components/ImpiantiTable.tsx
import { useState, useEffect } from "react"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow, TableFooter, TableCaption
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import {
  DropdownMenu, DropdownMenuTrigger,
  DropdownMenuContent, DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { ImpiantoDetails } from "../details/impiantoDetails"

// Mock data
const mockImpianti = [
  {
    id: "IMP001",
    nome: "Impianto Fotovoltaico Rossi",
    tipo: "Fotovoltaico",
    potenza: "3.2 kW",
    stato: "Attivo",
    produttore: "Mario Rossi",
    dataAttivazione: "2023-06-14"
  },
  {
    id: "IMP002",
    nome: "Eolico Bianchi",
    tipo: "Eolico",
    potenza: "1.0 kW",
    stato: "Manutenzione",
    produttore: "Luca Bianchi",
    dataAttivazione: "2022-11-03"
  },
  {
    id: "IMP003",
    nome: "FV Verdi",
    tipo: "Fotovoltaico",
    potenza: "6.0 kW",
    stato: "Offline",
    produttore: "Giulia Verdi",
    dataAttivazione: "2024-01-22"
  },
   {
    id: "IMwP003",
    nome: "FV Verdi",
    tipo: "Fotovoltaico",
    potenza: "6.0 kW",
    stato: "Offline",
    produttore: "Giulia Verdi",
    dataAttivazione: "2024-01-22"
  },
  {
    id: "IMwP003",
    nome: "FV Verdi",
    tipo: "Fotovoltaico",
    potenza: "6.0 kW",
    stato: "Offline",
    produttore: "Giulia Verdi",
    dataAttivazione: "2024-01-22"
  },
  {
    id: "IMwP003",
    nome: "FV Verdi",
    tipo: "Fotovoltaico",
    potenza: "6.0 kW",
    stato: "Offline",
    produttore: "Giulia Verdi",
    dataAttivazione: "2024-01-22"
  },
  {
    id: "IMwP003",
    nome: "FV Verdi",
    tipo: "Fotovoltaico",
    potenza: "6.0 kW",
    stato: "Offline",
    produttore: "Giulia Verdi",
    dataAttivazione: "2024-01-22"
  }
]

export function ImpiantiTable() {

  //const [page, setPage] = useState(0)
  const [/*impianti*/_, setImpianti] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => {
    setImpianti(mockImpianti)
  }, [])


  const currentRows = mockImpianti

  return (
<div className="w-full flex justify-center mt-6">
      <div className="
        w-full max-w-3xl 
        bg-card 
        shadow-lg 
        rounded-xl 
        p-6 
        border 
        border-border
        transition 
        hover:shadow-xl
      ">
        <div className="flex flex-row items-center gap-4 pb-3.5">
          <div className="relative w-1/3 flex items-center">
          <a href="#" className="w-[50%] flex items-center">
            <img 
            src="/images/rinova_logo.png" 
            alt="Logo Rinova" 
            className="w-full h-auto object-contain"
            />
          </a>
          </div>
          <div className="w-1/3 flex justify-center">
          <h2 className="text-xl font-semibold text-center">
          Impianti CER
        </h2>
        </div>
        </div>

            <Table>
                <TableCaption>Lista impianti della tua CER</TableCaption>
                
        <div className="max-h-80 overflow-y-auto">
                <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Potenza</TableHead>
                    <TableHead>Produttore</TableHead>
                    <TableHead className="text-right">Stato</TableHead>
                    <TableHead></TableHead>
                    </TableRow>
                </TableHeader>

                    <TableBody>
                        {currentRows.map((imp) => (
                        <TableRow key={imp.id} className="hover:bg-muted/40">

                            <TableCell>{imp.id}</TableCell>
                            <TableCell>{imp.nome}</TableCell>
                            <TableCell>{imp.tipo}</TableCell>
                            <TableCell>{imp.potenza}</TableCell>
                            <TableCell>{imp.produttore}</TableCell>

                            <TableCell className="text-right">{imp.stato}</TableCell>

                            {/* Dropdown azioni */}
                            <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelected(imp)}>
                                    Dettagli
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Modifica
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                    Disattiva
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            </TableCell>

                        </TableRow>
                        ))}
                    </TableBody>
                    


                {/* Footer con paginazione */}
                <TableFooter>
                    <TableRow>
                    <TableCell colSpan={7}>
                        <div className="flex justify-between items-center">
                        </div>
                    </TableCell>
                    </TableRow>
                </TableFooter>
            </div>
                </Table>
                
        
        {selected && (
          <ImpiantoDetails impianto={selected} onClose={() => setSelected(null)} />
        )}

      </div>
    </div>
  )
}
