"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { Exercise, ExerciseFormData, Tag } from "@/types/exercise";
import { TagSelector } from "./TagSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { invalidateExercisesCache } from "@/hooks/useExercises";

interface ExerciseFormProps {
  initialData?: Exercise;
  onSubmit: (data: ExerciseFormData) => Promise<Exercise>;
  submitLabel: string;
  isLoading?: boolean;
}

export function ExerciseForm({ 
  initialData, 
  onSubmit, 
  submitLabel, 
  isLoading = false 
}: ExerciseFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ExerciseFormData>({
    name: "",
    instructions: "",
    enrichment: "",
    videoUrl: "",
    tag_ids: [],
  });
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        instructions: initialData.instructions || "",
        enrichment: initialData.enrichment || "",
        videoUrl: initialData.videoUrl || "",
        tag_ids: initialData.tags?.map(tag => tag.id) || [],
      });
      setSelectedTags(initialData.tags || []);
    }
  }, [initialData]);

  // Update tag_ids when selectedTags changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      tag_ids: selectedTags.map(tag => tag.id),
    }));
  }, [selectedTags]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error("Nazwa ćwiczenia jest wymagana");
      }

      const result = await onSubmit(formData);
      
      // Invalidate exercises cache to refresh the list
      invalidateExercisesCache();
      
      router.push(`/exercises/${result.id}`);
    } catch (error) {
      console.error("Error saving exercise:", error);
      setError(error instanceof Error ? error.message : "Wystąpił błąd podczas zapisywania");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="flex items-center gap-2" disabled>
            <ArrowLeft className="h-4 w-4" />
            Powrót
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Informacje o ćwiczeniu</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Powrót
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informacje o ćwiczeniu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nazwa ćwiczenia *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instrukcje</Label>
              <Textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrichment">Dodatkowe informacje</Label>
              <Textarea
                id="enrichment"
                name="enrichment"
                value={formData.enrichment}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL do wideo</Label>
              <Input
                id="videoUrl"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>

            <TagSelector
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Zapisywanie..." : submitLabel}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}