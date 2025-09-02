import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Save } from 'lucide-react';
import { WorkoutSectionForm } from '@/components/workout/workoutSectionForm';
import { useExercises } from '@/hooks/useExercises';
import type { Workout, WorkoutFormData, WorkoutSection } from '@/types/workout';

interface WorkoutFormProps {
  initialWorkout?: Workout | null;
  onSave: (data: WorkoutFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  isEditMode?: boolean;
}

export function WorkoutForm({ 
  initialWorkout, 
  onSave, 
  onCancel, 
  isLoading = false, 
  isEditMode = false 
}: WorkoutFormProps) {
  const [formData, setFormData] = useState<WorkoutFormData>({
    title: initialWorkout?.title || '',
    description: initialWorkout?.description || '',
    duration: initialWorkout?.duration || null,
    sections: initialWorkout?.sections || [],
  });

  const { exercises = [] } = useExercises();

  // Reset form when initialWorkout changes
  useEffect(() => {
    if (initialWorkout) {
      setFormData({
        title: initialWorkout.title,
        description: initialWorkout.description,
        duration: initialWorkout.duration,
        sections: initialWorkout.sections,
      });
    }
  }, [initialWorkout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    await onSave(formData);
  };

  const addSection = () => {
    const newSection: Omit<WorkoutSection, 'id' | 'workId'> = {
      name: `Sekcja ${formData.sections.length + 1}`,
      position: formData.sections.length,
      exercises: [],
    };

    setFormData({
      ...formData,
      sections: [...formData.sections, newSection],
    });
  };

  const updateSection = (index: number, section: Omit<WorkoutSection, 'id' | 'workId'>) => {
    const updatedSections = [...formData.sections];
    updatedSections[index] = section;
    setFormData({ ...formData, sections: updatedSections });
  };

  const removeSection = (index: number) => {
    const updatedSections = formData.sections
      .filter((_, i) => i !== index)
      .map((section, i) => ({ ...section, position: i }));
    
    setFormData({ ...formData, sections: updatedSections });
  };

  const moveSection = (fromIndex: number, toIndex: number) => {
    const updatedSections = [...formData.sections];
    const [movedSection] = updatedSections.splice(fromIndex, 1);
    updatedSections.splice(toIndex, 0, movedSection);
    
    // Update positions
    updatedSections.forEach((section, index) => {
      section.position = index;
    });

    setFormData({ ...formData, sections: updatedSections });
  };

  const isValid = formData.title.trim() && formData.sections.length > 0;

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Podstawowe informacje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Nazwa treningu *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Wprowadź nazwę treningu"
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Szacowany czas (minuty)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={formData.duration ?? ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  duration: e.target.value ? parseInt(e.target.value) : null 
                })}
                placeholder="np. 45"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Opis treningu</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
              placeholder="Opcjonalny opis treningu..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        {formData.sections.map((section, index) => (
          <WorkoutSectionForm
            key={index}
            section={section}
            sectionIndex={index}
            exercises={exercises}
            onUpdate={(updatedSection) => updateSection(index, updatedSection)}
            onRemove={() => removeSection(index)}
            onMoveUp={index > 0 ? () => moveSection(index, index - 1) : undefined}
            onMoveDown={index < formData.sections.length - 1 ? () => moveSection(index, index + 1) : undefined}
          />
        ))}
      </div>

      {/* Add Section Button */}
      <Card className="border-dashed border-2">
        <CardContent className="p-6">
          <Button onClick={addSection} variant="ghost" className="w-full" type="button">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj nową sekcję
          </Button>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={!isValid || isLoading}
          className="min-w-[120px]"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Zapisywanie...' : isEditMode ? 'Zapisz zmiany' : 'Zapisz trening'}
        </Button>
      </div>
    </form>
  );
}