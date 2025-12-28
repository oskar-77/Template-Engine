import { useRef, useState } from "react";
import { useCreateTemplate } from "@/hooks/use-templates";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function UploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: createTemplate, isPending } = useCreateTemplate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "File size must be less than 5MB", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      createTemplate(
        { 
          name: file.name.split('.')[0], 
          imageUrl: base64,
          isCustom: true 
        },
        {
          onSuccess: () => {
            toast({ title: "Success", description: "Template created successfully!" });
          },
          onError: (err) => {
            toast({ title: "Failed", description: err.message, variant: "destructive" });
          }
        }
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        disabled={isPending}
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-12 border-dashed border-2 border-primary/50 hover:border-primary hover:bg-primary/10 transition-all font-display uppercase tracking-widest"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Upload className="w-4 h-4 mr-2" />
        )}
        Upload Custom
      </Button>
    </>
  );
}
