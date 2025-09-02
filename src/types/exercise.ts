export interface Tag {
  id: number;
  name: string;
}

export interface Exercise {
  id: number;
  name: string;
  instructions: string;
  enrichment: string;
  videoUrl: string | null;
  crop_id: number | null;
  tags: Tag[];
}

export interface ExerciseFormData {
  name: string;
  instructions: string;
  enrichment: string;
  videoUrl: string;
  tag_ids: number[];
}