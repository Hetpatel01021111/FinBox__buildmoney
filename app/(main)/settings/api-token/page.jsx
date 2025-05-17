"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Check, RefreshCw, Key } from "lucide-react";
import { motion } from "framer-motion";

export default function ApiTokenPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Fetch token on page load
  useEffect(() => {
    fetchToken();
  }, []);

  // Fetch token from API
  const fetchToken = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/auth/generate-token");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate token");
      }

      setToken(data.token);
    } catch (error) {
      console.error("Error fetching token:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Copy token to clipboard
  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container max-w-4xl py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          API Token
        </h1>
        <p className="text-gray-500 mb-8">
          Generate and manage your API token for the FinBox Receipt Scanner desktop app
        </p>

        <Card className="mb-8 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5 text-blue-600" />
              Your API Token
            </CardTitle>
            <CardDescription>
              Use this token to authenticate the FinBox Receipt Scanner desktop app
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                {error}
              </div>
            ) : null}

            <div className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  value={token}
                  readOnly
                  className="pr-24 font-mono text-sm bg-gray-50"
                  placeholder={loading ? "Generating token..." : "No token generated yet"}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1 h-8"
                  onClick={copyToken}
                  disabled={!token || loading}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This token expires in 30 days and grants access to your account via the desktop app
              </p>
            </div>

            <Button
              onClick={fetchToken}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate New Token
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Use Your Token</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>
                <span className="font-medium">Download the FinBox Receipt Scanner</span>
                <p className="text-gray-500 ml-6 text-sm">
                  Download and install the desktop application from the FinBox website
                </p>
              </li>
              <li>
                <span className="font-medium">Copy your API token</span>
                <p className="text-gray-500 ml-6 text-sm">
                  Click the Copy button above to copy your token to the clipboard
                </p>
              </li>
              <li>
                <span className="font-medium">Authenticate the desktop app</span>
                <p className="text-gray-500 ml-6 text-sm">
                  Paste your token into the authentication screen when prompted
                </p>
              </li>
              <li>
                <span className="font-medium">Start scanning receipts</span>
                <p className="text-gray-500 ml-6 text-sm">
                  Use the desktop app to quickly scan receipts and add transactions to your FinBox account
                </p>
              </li>
            </ol>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
