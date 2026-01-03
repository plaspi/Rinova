import { TableSection } from "@/components/tables/members-table";
import {ImpiantiTable} from "@/components/tables/impianti-table";



export default function TablePage(){
    return(
        <div>
            <TableSection/>
            <ImpiantiTable />
        </div>
        
    )
}