import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/services/supabase_client";
import { useAuth } from "@/context/authContext";

// Updated Interface with Status
export interface Plant {
  id: string;
  nome: string;
  status: 'attivo' | 'offline' | 'manutenzione';
}

interface PlantContextType {
  plants: Plant[];
  selectedPlant: string | null;
  isLoading: boolean;
  selectPlant: (id: string) => void;
  refreshPlants: () => Promise<void>;
  getPlantStatus: (id: string) => string; // Helper to get status easily
  updatePlantStatus: (id: string, status: 'attivo' | 'offline' | 'manutenzione') => Promise<void>; // New function to update status
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export function PlantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. FETCH PLANTS
  const fetchPlants = async () => {
    if (!user?.id) {
      setPlants([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("impianti")
        .select("id, nome, status") // Added status fetch
        .eq("user_id", user.id); 

      if (error) throw error;
      
      const plantList = (data || []) as Plant[];
      setPlants(plantList);
      
      // Trigger Smart Selection Logic after fetch
      handleSmartSelection(plantList, selectedPlant);
    } catch (error) {
      console.error("Error loading plants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. SMART SELECTION LOGIC
  const handleSmartSelection = (list: Plant[], currentSelection: string | null) => {
    if (list.length === 0) {
      setSelectedPlant(null);
    } else if (list.length === 1) {
      setSelectedPlant(list[0].id);
    } else {
      const exists = list.find(p => p.id === currentSelection);
      if (currentSelection === 'summary' || exists) {
         // Keep current choice
      } else {
         // Default to first plant if selection is invalid
         setSelectedPlant(list[0].id);
      }
    }
  };

  const getPlantStatus = (id: string) => {
      const plant = plants.find(p => p.id === id);
      return plant?.status || 'attivo';
  };

  // Initial Load
  useEffect(() => {
    fetchPlants();
  }, [user?.id]);

  const selectPlant = (id: string) => {
    setSelectedPlant(id);
  };

  const updatePlantStatus = async (id: string, status: 'attivo' | 'offline' | 'manutenzione') => {
    try {
      const { error } = await supabase
        .from('impianti')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      // Refresh the plants list after updating status
      fetchPlants();
    } catch (error) {
      console.error("Error updating plant status");
    }
  };

  return (
    <PlantContext.Provider value={{ plants, selectedPlant, isLoading, selectPlant, refreshPlants: fetchPlants, getPlantStatus, updatePlantStatus }}>
      {children}
    </PlantContext.Provider>
  );
}

export function usePlants() {
  const context = useContext(PlantContext);
  if (context === undefined) {
    throw new Error("usePlants must be used within a PlantProvider");
  }
  return context;
}