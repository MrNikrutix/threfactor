import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { Tag } from "@/types/exercise";
import { useTags } from "@/hooks/useTags";
import { createTag } from "@/lib/api-client";

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const { tags, mutate } = useTags();
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const handleAddTag = async () => {
    if (!newTagName.trim() || isCreatingTag) return;

    try {
      setIsCreatingTag(true);
      
      // Check if tag already exists
      let tagToAdd = tags.find(
        (tag) => tag.name.toLowerCase() === newTagName.trim().toLowerCase()
      );

      // If tag doesn't exist, create it
      if (!tagToAdd) {
        tagToAdd = await createTag(newTagName.trim());
        // Update the tags cache
        mutate();
      }

      // Check if tag is already selected
      if (!selectedTags.some((tag) => tag.id === tagToAdd.id)) {
        onTagsChange([...selectedTags, tagToAdd]);
      }

      setNewTagName("");
    } catch (error) {
      console.error("Error adding tag:", error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleRemoveTag = (tagId: number) => {
    onTagsChange(selectedTags.filter((tag) => tag.id !== tagId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTagName.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="tagInput">Tagi</Label>
      <div className="flex gap-2">
        <Input
          id="tagInput"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Wpisz nazwę tagu i naciśnij Enter lub dodaj"
          disabled={isCreatingTag}
        />
        <Button 
          type="button" 
          onClick={handleAddTag} 
          variant="outline" 
          className="shrink-0"
          disabled={isCreatingTag || !newTagName.trim()}
        >
          <Plus className="h-4 w-4 mr-2" />
          {isCreatingTag ? "Dodawanie..." : "Dodaj"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Wpisz nazwę tagu i naciśnij Enter lub kliknij przycisk Dodaj
      </p>

      <div className="flex flex-wrap gap-2 mt-2">
        {selectedTags.length > 0 ? (
          selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Usuń tag {tag.name}</span>
              </button>
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Brak wybranych tagów</p>
        )}
      </div>
    </div>
  );
}