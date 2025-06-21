import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { addMedicationSchema, type AddMedicationData } from "@shared/schema";
import { useMedications } from "@/hooks/use-medications";

interface AddMedicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMedicationModal({ open, onOpenChange }: AddMedicationModalProps) {
  const { addMedication, isAddingMedication } = useMedications();
  const [times, setTimes] = useState<string[]>([]);

  const form = useForm<AddMedicationData>({
    resolver: zodResolver(addMedicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "",
      notes: "",
      times: [],
    },
  });

  const handleSubmit = (data: AddMedicationData) => {
    addMedication({ ...data, times }, {
      onSuccess: () => {
        form.reset();
        setTimes([]);
        onOpenChange(false);
      },
    });
  };

  const addTime = () => {
    setTimes([...times, ""]);
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const removeTime = (index: number) => {
    setTimes(times.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Medication</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name">Medication Name</Label>
            <Input
              id="name"
              placeholder="e.g., Lisinopril, Metformin"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                placeholder="e.g., 10mg, 2 tablets"
                {...form.register("dosage")}
              />
              {form.formState.errors.dosage && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.dosage.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select onValueChange={(value) => form.setValue("frequency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once_daily">Once daily</SelectItem>
                  <SelectItem value="twice_daily">Twice daily</SelectItem>
                  <SelectItem value="three_times_daily">Three times daily</SelectItem>
                  <SelectItem value="four_times_daily">Four times daily</SelectItem>
                  <SelectItem value="every_other_day">Every other day</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="as_needed">As needed</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.frequency && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.frequency.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Time(s)</Label>
            <div className="space-y-2">
              {times.map((time, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => updateTime(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTime(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addTime}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Time
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">Add specific times when this medication should be taken</p>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or notes about this medication"
              rows={3}
              {...form.register("notes")}
            />
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isAddingMedication}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isAddingMedication ? "Adding..." : "Add Medication"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
