"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Database, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSeed = async () => {
    try {
      setLoading(true);
      setResult(null);
      
      const response = await fetch("/api/seed");
      const data = await response.json();
      
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mt-8 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden"
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Seed Tool
        </h3>
        <p className="text-indigo-100 mt-1 text-sm">
          Add sample transactions to your account for testing and demonstration purposes.
        </p>
      </div>
      
      <div className="p-6">
        <p className="text-gray-600 mb-6">
          This tool will generate 90 days of realistic financial transactions with appropriate income and expense categories, 
          giving you a complete dataset to explore the app's features.
        </p>
        
        <Button 
          onClick={handleSeed} 
          disabled={loading}
          className={`w-full py-6 text-lg font-medium rounded-xl ${
            loading 
              ? "bg-gray-100 text-gray-500" 
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
          } transition-all duration-300`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>Generating Transactions...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Database className="mr-2 h-5 w-5" />
              <span>Seed Database with Sample Transactions</span>
            </div>
          )}
        </Button>
        
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`mt-6 p-4 rounded-lg flex items-start ${
              result.success 
                ? "bg-green-50 text-green-800 border border-green-100" 
                : "bg-red-50 text-red-800 border border-red-100"
            }`}
          >
            {result.success ? (
              <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium">
                {result.success ? "Success!" : "Error"}
              </p>
              <p className="text-sm mt-1">
                {result.success ? result.message : `Failed to seed database: ${result.error}`}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
