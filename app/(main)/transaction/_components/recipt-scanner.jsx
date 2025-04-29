"use client";

import { useRef, useEffect, useState } from "react";
import { Camera, Loader2, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";
import { motion } from "framer-motion";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setFileName(file.name);
    await scanReceiptFn(file);
  };

  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      onScanComplete(scannedData);
      toast.success("Receipt scanned successfully");
    }
  }, [scanReceiptLoading, scannedData]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <div 
        className={`border-2 border-dashed rounded-xl p-6 transition-all ${
          isHovering ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsHovering(true);
        }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsHovering(false);
          const file = e.dataTransfer.files[0];
          if (file) handleReceiptScan(file);
        }}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
            {scanReceiptLoading ? (
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            ) : scannedData ? (
              <Check className="h-8 w-8 text-white" />
            ) : (
              <Camera className="h-8 w-8 text-white" />
            )}
          </div>
          
          <h3 className="text-lg font-medium mb-1">
            {scanReceiptLoading 
              ? "Analyzing Receipt..." 
              : scannedData 
                ? "Receipt Scanned Successfully" 
                : "Scan Your Receipt"}
          </h3>
          
          <p className="text-gray-500 text-sm mb-4">
            {scanReceiptLoading 
              ? "Our AI is extracting transaction details..." 
              : scannedData 
                ? "Transaction details have been filled automatically" 
                : "Upload or drag & drop your receipt to automatically fill transaction details"}
          </p>
          
          {fileName && !scanReceiptLoading && !scannedData && (
            <div className="text-sm text-gray-500 mb-4">
              <span className="font-medium">Selected file:</span> {fileName}
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleReceiptScan(file);
            }}
          />
          
          {!scannedData && (
            <div className="flex gap-3 w-full max-w-xs">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10 border-blue-300 hover:border-blue-400 hover:bg-blue-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={scanReceiptLoading}
              >
                <Upload className="mr-2 h-4 w-4" />
                <span>Upload</span>
              </Button>
              
              <Button
                type="button"
                className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                onClick={() => fileInputRef.current?.click()}
                disabled={scanReceiptLoading}
              >
                <Camera className="mr-2 h-4 w-4" />
                <span>Take Photo</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}