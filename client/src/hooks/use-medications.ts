import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Medication, AddMedicationData, MedicationLog } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const medicationApi = {
  getMedications: async (): Promise<Medication[]> => {
    const response = await fetch("/api/medications", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch medications");
    }
    
    return response.json();
  },

  addMedication: async (data: AddMedicationData): Promise<Medication> => {
    const response = await apiRequest("POST", "/api/medications", data);
    return response.json();
  },

  deleteMedication: async (id: number): Promise<void> => {
    await apiRequest("DELETE", `/api/medications/${id}`);
  },

  markAsTaken: async (id: number): Promise<MedicationLog> => {
    const response = await apiRequest("POST", `/api/medications/${id}/mark-taken`);
    return response.json();
  },

  getAdherence: async (): Promise<{
    adherenceRate: number;
    totalExpectedDoses: number;
    totalTakenDoses: number;
    period: string;
  }> => {
    const response = await fetch("/api/adherence", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch adherence data");
    }
    
    return response.json();
  },

  getMedicationLogs: async (startDate?: string, endDate?: string): Promise<MedicationLog[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`/api/medication-logs?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch medication logs");
    }
    
    return response.json();
  },
};

export function useMedications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const medicationsQuery = useQuery({
    queryKey: ["/api/medications"],
    queryFn: medicationApi.getMedications,
  });

  const adherenceQuery = useQuery({
    queryKey: ["/api/adherence"],
    queryFn: medicationApi.getAdherence,
  });

  const addMedicationMutation = useMutation({
    mutationFn: medicationApi.addMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/adherence"] });
      toast({
        title: "Medication added",
        description: "Your medication has been added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add medication",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const deleteMedicationMutation = useMutation({
    mutationFn: medicationApi.deleteMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/adherence"] });
      toast({
        title: "Medication deleted",
        description: "Your medication has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete medication",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const markAsTakenMutation = useMutation({
    mutationFn: medicationApi.markAsTaken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/adherence"] });
      queryClient.invalidateQueries({ queryKey: ["/api/medication-logs"] });
      toast({
        title: "Medication marked as taken",
        description: "Great job staying on track!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to mark medication",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  return {
    medications: medicationsQuery.data || [],
    adherence: adherenceQuery.data,
    isLoading: medicationsQuery.isLoading,
    isAdherenceLoading: adherenceQuery.isLoading,
    addMedication: addMedicationMutation.mutate,
    deleteMedication: deleteMedicationMutation.mutate,
    markAsTaken: markAsTakenMutation.mutate,
    isAddingMedication: addMedicationMutation.isPending,
    isDeletingMedication: deleteMedicationMutation.isPending,
    isMarkingAsTaken: markAsTakenMutation.isPending,
  };
}
