// components/ImpiantoDetails.tsx
import { cn } from "@/lib/utils"

interface ImpiantoDetailsProps {
  impianto: any
  onClose: () => void
}

export function ImpiantoDetails({ impianto, onClose }: ImpiantoDetailsProps) {
  if (!impianto) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex">
      {/* FULLSCREEN PANEL */}
      <div className="bg-white w-full h-full overflow-y-auto p-10 relative animate-in slide-in-from-bottom duration-200">

        {/* CHIUSURA */}
        <button
          className="absolute top-6 right-6 text-gray-600 hover:text-gray-800 text-3xl"
          onClick={onClose}
        >
          ✕
        </button>

        {/* TITOLO */}
        <h2 className="text-3xl font-bold text-primary mb-8">
          Dettagli Impianto
        </h2>

        {/* SEZIONE 1 — DATI PRINCIPALI */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Informazioni generali</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            
            <Info label="ID Impianto" value={impianto.id} />
            <Info label="Nome impianto" value={impianto.nome} />
            <Info label="Tipologia" value={impianto.tipo} />
            <Info label="Potenza nominale" value={impianto.potenza + " kW"} />
            <Info label="Produttore (brand)" value={impianto.produttore} />
            <Info label="Modello pannelli" value={impianto.modelloPannelli} />
            <Info label="Orientamento" value={impianto.orientamento} />
            <Info label="Inclinazione" value={impianto.inclinazione + "°"} />
            
            <div>
              <p className="font-medium text-gray-700">Stato impianto</p>
              <span
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-semibold",
                  impianto.stato === "Attivo" && "bg-green-100 text-green-800",
                  impianto.stato === "Offline" && "bg-red-100 text-red-800",
                  impianto.stato === "Manutenzione" && "bg-yellow-100 text-yellow-800"
                )}
              >
                {impianto.stato}
              </span>
            </div>

            <Info label="Data attivazione" value={impianto.dataAttivazione} />
            <Info label="Ultima manutenzione" value={impianto.ultimaManutenzione} />

          </div>
        </section>

        {/* SEZIONE 2 — DATI TECNICI (INVERTER, POD, GSE...) */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Dati tecnici</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <Info label="Numero di matricola inverter" value={impianto.inverterMatricola} />
            <Info label="Marca / Modello inverter" value={impianto.inverterModello} />
            <Info label="Codice POD" value={impianto.pod} />
            <Info label="Codice di connessione GSE" value={impianto.codiceGSE || "Non disponibile"} />
            <Info label="Tensione di lavoro" value={impianto.tensione + " V"} />
            <Info label="Corrente massima" value={impianto.corrente + " A"} />
          </div>
        </section>

        {/* SEZIONE 3 — POSIZIONE */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Localizzazione</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <Info label="Indirizzo" value={impianto.indirizzo} />
            <Info label="Coordinate GPS" value={`${impianto.lat}, ${impianto.lng}`} />
          </div>

          {/* MINI MAPPA (mock) */}
          <div className="mt-4 w-full h-48 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
            (Mappa dell'impianto - da integrare con Leaflet / Google Maps)
          </div>
        </section>

        {/* SEZIONE 4 — PRODUZIONE */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Produzione energetica</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <Info label="Produzione oggi" value={impianto.produzioneOggi + " kWh"} />
            <Info label="Produzione mensile" value={impianto.produzioneMese + " kWh"} />
            <Info label="Produzione totale" value={impianto.produzioneTotale + " kWh"} />
          </div>

          {/* GRAFICO (placeholder) */}
          <div className="mt-6 bg-gray-100 w-full h-64 rounded-md flex items-center justify-center text-gray-500">
            (Grafico produzione - da integrare con Recharts)
          </div>

          {/* come integrarlo
          <p className="text-xs mt-2 text-gray-500">
            Per implementare il grafico puoi usare
            <code className="px-1 mx-1 bg-gray-200 rounded">Recharts</code>:
            <br />
            &lt;LineChart data={...}&gt; ... &lt;/LineChart&gt;
          </p> */}
        </section>

        {/* SEZIONE 5 — ASSOCIATO A MEMBRO */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Proprietario / associato</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <Info label="Membro proprietario" value={impianto.proprietarioNome} />
            <Info label="Codice fiscale" value={impianto.proprietarioCF} />
          </div>
        </section>

        {/* FOOTER */}
        <div className="mt-12 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-md bg-primary text-white hover:bg-primary/80 transition"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="font-medium text-gray-700">{label}</p>
      <p className="text-gray-900">{value}</p>
    </div>
  )
}
