import { useState } from "react";
import { uploadApi, type UploadResult } from "@/services/api";

export function useUpload(folder: string = "uploads") {
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File): Promise<UploadResult> => {
    setIsUploading(true);
    try {
      return await uploadApi.upload(file, folder);
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading };
}
