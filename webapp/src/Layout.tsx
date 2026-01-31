import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/sidebar/sidebarLayout";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar /> 
      
      {/* Area del contenuto principale */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
         <Outlet /> 
      </div>
    </div>
  );
}