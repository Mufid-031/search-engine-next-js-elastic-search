/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
// No import needed since we'll use fetch

interface UploadStatus {
  status: "idle" | "uploading" | "processing" | "success" | "error";
  progress: number;
  message: string;
  indexName?: string;
  totalRecords?: number;
  processedRecords?: number;
}

export default function UploadPage() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: "idle",
    progress: 0,
    message: "",
  });
  const [indexName, setIndexName] = useState("");
  const [indexDescription, setIndexDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
      setUploadStatus({
        status: "idle",
        progress: 0,
        message: `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(
          2
        )} MB)`,
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile || !indexName.trim()) return;

    setUploadStatus({
      status: "uploading",
      progress: 10,
      message: "Uploading file...",
    });

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("indexName", indexName.trim());
      formData.append("indexDescription", indexDescription.trim());

      setUploadStatus({
        status: "processing",
        progress: 30,
        message: "Processing CSV file...",
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadStatus({
          status: "success",
          progress: 100,
          message: result.message || "File indexed successfully!",
          indexName: result.indexName,
          totalRecords: result.totalRecords,
          processedRecords: result.processedRecords,
        });
      } else {
        setUploadStatus({
          status: "error",
          progress: 0,
          message: result.error || "Failed to index file",
        });
      }
    } catch (error) {
      setUploadStatus({
        status: "error",
        progress: 0,
        message: "An unexpected error occurred",
      });
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setIndexName("");
    setIndexDescription("");
    setUploadStatus({
      status: "idle",
      progress: 0,
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <Link
            href="/search"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Link>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-600" />
          Data Indexing
        </h1>
      </nav>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Upload a CSV file to index its contents in Elasticsearch for
              searching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Index Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="indexName">Index Name *</Label>
                <Input
                  id="indexName"
                  placeholder="e.g., products, users, articles"
                  value={indexName}
                  onChange={(e) => setIndexName(e.target.value)}
                  disabled={
                    uploadStatus.status === "uploading" ||
                    uploadStatus.status === "processing"
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="indexDescription">Description (Optional)</Label>
                <Input
                  id="indexDescription"
                  placeholder="Brief description of the data"
                  value={indexDescription}
                  onChange={(e) => setIndexDescription(e.target.value)}
                  disabled={
                    uploadStatus.status === "uploading" ||
                    uploadStatus.status === "processing"
                  }
                />
              </div>
            </div>

            {/* File Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                  : selectedFile
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                {selectedFile ? (
                  <>
                    <FileText className="w-12 h-12 text-green-600" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {isDragActive
                          ? "Drop the CSV file here"
                          : "Drag & drop a CSV file here"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to select a file
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex gap-4">
              <Button
                onClick={handleUpload}
                disabled={
                  !selectedFile ||
                  !indexName.trim() ||
                  uploadStatus.status === "uploading" ||
                  uploadStatus.status === "processing"
                }
                className="flex-1"
              >
                {uploadStatus.status === "uploading" ||
                uploadStatus.status === "processing" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Index Data
                  </>
                )}
              </Button>
              {selectedFile && (
                <Button variant="outline" onClick={resetUpload}>
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        {uploadStatus.message && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {uploadStatus.status === "success" && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {uploadStatus.status === "error" && (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                {(uploadStatus.status === "uploading" ||
                  uploadStatus.status === "processing") && (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                )}
                Upload Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              {uploadStatus.progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{uploadStatus.progress}%</span>
                  </div>
                  <Progress value={uploadStatus.progress} className="w-full" />
                </div>
              )}

              {/* Status Message */}
              <Alert
                className={
                  uploadStatus.status === "success"
                    ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                    : uploadStatus.status === "error"
                    ? "border-red-200 bg-red-50 dark:bg-red-950/20"
                    : "border-blue-200 bg-blue-50 dark:bg-blue-950/20"
                }
              >
                <AlertDescription>{uploadStatus.message}</AlertDescription>
              </Alert>

              {/* Success Details */}
              {uploadStatus.status === "success" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {uploadStatus.totalRecords}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Records
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {uploadStatus.processedRecords}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Processed
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge variant="secondary" className="text-sm">
                      {uploadStatus.indexName}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      Index Name
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {uploadStatus.status === "success" && (
                <div className="flex gap-4 pt-4">
                  <Button asChild>
                    <Link href="/search">Go to Search</Link>
                  </Button>
                  <Button variant="outline" onClick={resetUpload}>
                    Upload Another File
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">CSV Format Requirements</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• First row should contain column headers</li>
                  <li>• Use comma (,) as delimiter</li>
                  <li>• UTF-8 encoding recommended</li>
                  <li>• Maximum file size: 100MB</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Index Naming</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use lowercase letters and numbers</li>
                  <li>• Separate words with hyphens (-)</li>
                  <li>• Avoid special characters</li>
                  <li>• Keep it descriptive and short</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
