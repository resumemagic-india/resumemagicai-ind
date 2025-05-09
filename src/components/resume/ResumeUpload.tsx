
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ResumeUploadProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

export const ResumeUpload = ({ file, onFileChange, onRemoveFile }: ResumeUploadProps) => {
  return (
    <div className="flex items-center gap-4">
      <Input
        type="file"
        accept=".docx,.pdf,.txt"
        onChange={onFileChange}
        className="hidden"
        id="resume-upload"
      />
      <div className="flex-1 flex items-center">
        <Button
          type="button"
          variant="outline"
          className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
          onClick={() => document.getElementById("resume-upload")?.click()}
        >
          {file ? (
            <>
              <FileText className="mr-2 h-4 w-4" />
              <span className="truncate max-w-[240px]">{file.name}</span>
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Resume
            </>
          )}
        </Button>
        {file && (
          <Button
            type="button"
            variant="ghost"
            onClick={onRemoveFile}
            className="ml-2 text-white/80 hover:text-white hover:bg-white/10"
            size="icon"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove file</span>
          </Button>
        )}
      </div>
    </div>
  );
};
