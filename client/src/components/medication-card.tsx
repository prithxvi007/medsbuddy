import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Pill, Trash2 } from "lucide-react";
import type { Medication } from "@shared/schema";
import { useMedications } from "@/hooks/use-medications";

interface MedicationCardProps {
  medication: Medication;
  canMarkAsTaken?: boolean;
  showActions?: boolean;
}

export function MedicationCard({ 
  medication, 
  canMarkAsTaken = true, 
  showActions = true 
}: MedicationCardProps) {
  const { markAsTaken, deleteMedication, isMarkingAsTaken, isDeletingMedication } = useMedications();

  const handleMarkAsTaken = () => {
    markAsTaken(medication.id);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this medication?")) {
      deleteMedication(medication.id);
    }
  };

  const frequencyDisplay = medication.frequency.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  let times: string[] = [];
  try {
    times = medication.times ? JSON.parse(medication.times) : [];
  } catch (e) {
    // Handle malformed JSON
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Pill className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{medication.name}</h3>
              <p className="text-gray-600 mt-1">{medication.dosage}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">{frequencyDisplay}</span>
              </div>
              {times.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {times.map((time, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {time}
                    </Badge>
                  ))}
                </div>
              )}
              {medication.notes && (
                <p className="text-sm text-gray-600 mt-2">{medication.notes}</p>
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-2">
              {canMarkAsTaken && (
                <Button
                  onClick={handleMarkAsTaken}
                  disabled={isMarkingAsTaken}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isMarkingAsTaken ? "Marking..." : "Mark as Taken"}
                </Button>
              )}
              <Button
                onClick={handleDelete}
                disabled={isDeletingMedication}
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
