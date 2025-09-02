import { LoaderCircle } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <LoaderCircle className="h-8 w-8 animate-spin" />
    </div>
  );
};