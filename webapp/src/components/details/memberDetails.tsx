import { cn } from "@/lib/utils"

interface MemberDetailsProps {
  member: any | null
  onClose: () => void
}

export function MemberDetails({ member, onClose }: MemberDetailsProps) {
  if (!member) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative animate-in fade-in zoom-in duration-200">

        {/* Pulsante chiusura */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Titolo */}
        <h3 className="text-2xl font-semibold mb-6 text-primary">
          Dettagli membro CER
        </h3>

        {/* Grid delle info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">

          <div>
            <p className="font-medium text-gray-700">Nome e Cognome</p>
            <p className="text-gray-900">{member.nome} {member.cognome}</p>
          </div>

          <div>
            <p className="font-medium text-gray-700">Email</p>
            <p className="text-gray-900">{member.email}</p>
          </div>

          <div>
            <p className="font-medium text-gray-700">Codice Fiscale</p>
            <p className="text-gray-900">{member.codiceFiscale}</p>
          </div>

          <div>
            <p className="font-medium text-gray-700">Ruolo nella CER</p>
            <p className="text-gray-900">{member.ruolo}</p>
          </div>

          <div>
            <p className="font-medium text-gray-700">Stato</p>
            <span
              className={cn(
                "px-2 py-1 rounded-md text-xs font-semibold",
                member.stato === "Attivo" && "bg-green-100 text-green-800",
                member.stato === "In attesa" && "bg-yellow-100 text-yellow-800",
                member.stato === "Sospeso" && "bg-red-100 text-red-800"
              )}
            >
              {member.stato}
            </span>
          </div>

          <div>
            <p className="font-medium text-gray-700">POD associati</p>
            <p className="text-gray-900">{member.pod || "Nessun POD associato"}</p>
          </div>

          {member.impianto && (
            <div>
              <p className="font-medium text-gray-700">Impianto associato</p>
              <p className="text-gray-900">{member.impianto}</p>
            </div>
          )}

          <div>
            <p className="font-medium text-gray-700">Data di adesione</p>
            <p className="text-gray-900">{member.dataAdesione}</p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-[#2c6e29]! text-white hover:bg-primary/90 transition"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  )
}
