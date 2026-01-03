  import { useEffect, useState } from "react"
  import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Button } from "@/components/ui/button"
  import { MemberDetails } from "../details/memberDetails"
  import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
  } from "@/components/ui/dropdown-menu"
  import { MoreVertical } from "lucide-react"


  // mockData.ts
  const mockMembers = [
    {
      id: 1,
      nome: "Mario",
      cognome: "Rossi",
      email: "mario.rossi@example.com",
      codiceFiscale: "RSSMRA80A01H501U",
      ruolo: "Prosumer",
      stato: "Attivo",
      pod: "IT123456789",
      impianto: "Impianto 1",
      dataAdesione: "2023-04-01",
    },
    {
      id: 2,
      nome: "Luca",
      cognome: "Bianchi",
      email: "luca.bianchi@example.com",
      codiceFiscale: "BNCLEU90B12F205Z",
      ruolo: "Consumer",
      stato: "Sospeso",
      pod: "IT987654321",
      impianto: null,
      dataAdesione: "2023-08-12",
    },
    {
      id: 4,
      nome: "Giulia",
      cognome: "Verdi",
      email: "giulia.verdi@example.com",
      codiceFiscale: "VRDGLI85C11F205X",
      ruolo: "Amministratore",
      stato: "In attesa",
      pod: null,
      impianto: null,
      dataAdesione: "2024-01-20",
    },
    {
      id: 5,
      nome: "Giulia",
      cognome: "Verdi",
      email: "giulia.verdi@example.com",
      codiceFiscale: "VRDGLI85C11F205X",
      ruolo: "Amministratore",
      stato: "In attesa",
      pod: null,
      impianto: null,
      dataAdesione: "2024-01-20",
    },
    {
      id: 6,
      nome: "Giulia",
      cognome: "Verdi",
      email: "giulia.verdi@example.com",
      codiceFiscale: "VRDGLI85C11F205X",
      ruolo: "Amministratore",
      stato: "In attesa",
      pod: null,
      impianto: null,
      dataAdesione: "2024-01-20",
    },
    {
      id: 7,
      nome: "Giulia",
      cognome: "Verdi",
      email: "giulia.verdi@example.com",
      codiceFiscale: "VRDGLI85C11F205X",
      ruolo: "Amministratore",
      stato: "In attesa",
      pod: null,
      impianto: null,
      dataAdesione: "2024-01-20",
    },
    {
      id: 8,
      nome: "Giulia",
      cognome: "Verdi",
      email: "giulia.verdi@example.com",
      codiceFiscale: "VRDGLI85C11F205X",
      ruolo: "Amministratore",
      stato: "In attesa",
      pod: null,
      impianto: null,
      dataAdesione: "2024-01-20",
    },
    {
      id: 9,
      nome: "Giulia",
      cognome: "Verdi",
      email: "giulia.verdi@example.com",
      codiceFiscale: "VRDGLI85C11F205X",
      ruolo: "Amministratore",
      stato: "In attesa",
      pod: null,
      impianto: null,
      dataAdesione: "2024-01-20",
    },
    {
      id: 10,
      nome: "Giulia",
      cognome: "Verdi",
      email: "giulia.verdi@example.com",
      codiceFiscale: "VRDGLI85C11F205X",
      ruolo: "Amministratore",
      stato: "In attesa",
      pod: null,
      impianto: null,
      dataAdesione: "2024-01-20",
    }
  ];


  export function TableSection() {
    //const [page, setPage] = useState(0)
    const [members, setMembers] = useState<any[]>([])
    const [selectedRow, setSelectedRow] = useState<any>(null)

    //caricamento dati
      // 🔹 QUI un giorno ci metti la chiamata al backend (fetch/axios)
    useEffect(() => {
      // Simulazione caricamento dati da backend
      setMembers(mockMembers)
    }, [])


    const currentRows = members
    
    const handleRowClick = (row: any) => {
      setSelectedRow(row)
    }
    const handleEdit = (row: { id: string }) =>{
      alert("al momento non è possibile modificare le informazioni dell'utente in row: " + row.id)
    }
    const handleMessage = (row: { id: string }) =>{
      alert("al momento non è possibile inviare messaggi all'utente in row: " +row.id)
    }
    const updateStatus = (id: number, newStatus: string) =>{
      setMembers(prev=>
        prev.map(row=>
          row.id === id ? { ...row, stato: newStatus } : row
        )
      )
      
    }

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
            Membri CER
          </h2>
          </div>
          </div>
          <Table>
            
          <TableCaption>Lista dei membri della tua CER</TableCaption>
            <div className="max-h-80 overflow-y-auto">

          <TableHeader className="sticky top-0 bg-card z-10">
            
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Cognome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ruolo</TableHead>
              <TableHead className="text-right">Stato</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentRows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-muted/50 transition"
                //onClick={() => handleRowClick(row)}
              >
                <TableCell className="font-medium">{row.id}</TableCell>
                <TableCell>{row.nome}</TableCell>
                <TableCell>{row.cognome}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.ruolo}</TableCell>
                <TableCell className="text-right">{row.stato}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRowClick(row)}>
                        Dettagli
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => handleEdit(row)}>
                        Modifica
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => handleMessage(row)}>
                        Invia messaggio
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => updateStatus(row.id, "Attivo")}
                        className="text-green-600"

                      >
                        Accetta
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => updateStatus(row.id, "Sospeso")}
                        className="text-red-600"
                      >
                        Sospendi
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>


              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
          </TableFooter>
          </div>
        </Table>
        {selectedRow && (
          <MemberDetails member = {selectedRow} onClose={() => setSelectedRow(null)}></MemberDetails>
        )}

      </div>
      </div>
      
    )
  }
