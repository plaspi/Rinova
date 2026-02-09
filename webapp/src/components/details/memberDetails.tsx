import { cn } from "@/lib/utils"
import { X, Leaf } from "lucide-react"

interface MemberDetailsProps {
  member: any | null
  onClose: () => void
}

/**
 * Modal component to display detailed information about a CER member.
 */
export function MemberDetails({ member, onClose }: MemberDetailsProps) {
  if (!member) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
      
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl p-6 w-full max-w-xl relative animate-in zoom-in-95 duration-200">

        <button
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition rounded-full p-1 hover:bg-muted"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4 mb-6 border-b border-border pb-6">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                 {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.nome} className="h-full w-full object-cover" />
                 ) : (
                    <Leaf className="h-7 w-7 text-green-600" />
                 )}
            </div>
            <div>
                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                  {member.nome} {member.cognome}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{member.email}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-sm">

          <div className="col-span-1">
             <p className="font-medium text-muted-foreground mb-1">Ruolo</p>
             <p className="font-medium">{member.ruolo}</p>
          </div>

          <div className="col-span-1">
             <p className="font-medium text-muted-foreground mb-1">Stato</p>
             <span className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                member.stato === "attivo" && "bg-green-500/10 text-green-600 border-green-500/20",
                member.stato === "in_attesa" && "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
                member.stato === "sospeso" && "bg-red-500/10 text-red-600 border-red-500/20"
              )}>
              {member.stato}
            </span>
          </div>

          <div className="col-span-1">
            <p className="font-medium text-muted-foreground mb-1">Codice Fiscale</p>
            <p className="font-mono">{member.codiceFiscale || "—"}</p>
          </div>

          <div className="col-span-1">
            <p className="font-medium text-muted-foreground mb-1">POD Associati</p>
            <p className="font-mono text-xs truncate" title={member.pod}>{member.pod || "Nessun POD"}</p>
          </div>

          {member.impianto && (
            <div className="col-span-2">
              <p className="font-medium text-muted-foreground mb-1">Impianto</p>
              <p>{member.impianto}</p>
            </div>
          )}

        </div>

        <div className="mt-8 flex justify-end pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition text-sm font-medium"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  )
}