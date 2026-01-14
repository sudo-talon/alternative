import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabaseClient as supabase } from "@/lib/supabase";
import { Upload, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MagazineUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MagazineUploadDialog = ({ isOpen, onClose, onSuccess }: MagazineUploadDialogProps) => {
  const [title, setTitle] = useState("");
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !pdfFile) {
      toast.error("Title and PDF file are required");
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const timestamp = Date.now();
      let coverUrl = null;
      let pdfUrl = "";

      // Upload cover image if provided
      if (coverFile) {
        const coverPath = `covers/${timestamp}-${coverFile.name}`;
        const { data: coverData, error: coverError } = await supabase.storage
          .from("magazines")
          .upload(coverPath, coverFile);
        
        if (coverError) throw coverError;
        
        const { data: { publicUrl } } = supabase.storage
          .from("magazines")
          .getPublicUrl(coverPath);
        coverUrl = publicUrl;
      }

      // Upload PDF
      const pdfPath = `pdfs/${timestamp}-${pdfFile.name}`;
      const { data: pdfData, error: pdfError } = await supabase.storage
        .from("magazines")
        .upload(pdfPath, pdfFile);
      
      if (pdfError) throw pdfError;
      
      const { data: { publicUrl: pdfPublicUrl } } = supabase.storage
        .from("magazines")
        .getPublicUrl(pdfPath);
      pdfUrl = pdfPublicUrl;

      // Insert magazine record
      const { error: insertError } = await supabase
        .from("magazines")
        .insert({
          title,
          issue: issue || null,
          description: description || null,
          cover_image_url: coverUrl,
          pdf_url: pdfUrl,
        });

      if (insertError) throw insertError;

      toast.success("Magazine uploaded successfully!");
      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload magazine");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setIssue("");
    setDescription("");
    setPdfFile(null);
    setCoverFile(null);
    setCoverPreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Magazine
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter magazine title"
              required
            />
          </div>

          {/* Issue */}
          <div className="space-y-2">
            <Label htmlFor="issue">Issue (optional)</Label>
            <Input
              id="issue"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="e.g., Vol. 1, Issue 3"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the magazine"
              rows={3}
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image (optional)</Label>
            <div className="flex items-start gap-4">
              <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {coverFile ? coverFile.name : "Click to upload cover"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
              {coverPreview && (
                <img 
                  src={coverPreview} 
                  alt="Cover preview" 
                  className="w-20 h-28 object-cover rounded border"
                />
              )}
            </div>
          </div>

          {/* PDF File */}
          <div className="space-y-2">
            <Label>PDF File *</Label>
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
              <FileText className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                {pdfFile ? pdfFile.name : "Click to upload PDF"}
              </span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfChange}
                className="hidden"
                required
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={isUploading || !title || !pdfFile}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};