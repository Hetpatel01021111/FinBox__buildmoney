"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function FinanceChatbot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I am your Finance Chatbot. Ask me any finance-related calculation or question!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/finance-chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        { role: "bot", text: data.answer || data.error || "Sorry, I couldn't process that." }
      ]);
    } catch {
      setMessages((msgs) => [
        ...msgs,
        { role: "bot", text: "Sorry, there was an error contacting the AI." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg"
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 font-bold text-xl flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="white" fillOpacity="0.9"/>
            <path d="M13.5 8C13.5 7.17157 12.8284 6.5 12 6.5C11.1716 6.5 10.5 7.17157 10.5 8C10.5 8.82843 11.1716 9.5 12 9.5C12.8284 9.5 13.5 8.82843 13.5 8Z" fill="#4F46E5"/>
            <path d="M12 18C12.5523 18 13 17.5523 13 17V11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11V17C11 17.5523 11.4477 18 12 18Z" fill="#4F46E5"/>
          </svg>
        </div>
        Finance AI Assistant
      </div>
      
      <div className="h-80 overflow-y-auto px-6 py-4 bg-gradient-to-b from-blue-50/50 to-white">
        {messages.map((msg, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`my-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`rounded-2xl px-4 py-3 max-w-[80%] ${
              msg.role === "user" 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md" 
                : "bg-white border border-gray-100 text-gray-800 shadow-sm"
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </div>
      
      <form onSubmit={sendMessage} className="flex border-t border-gray-100 bg-white">
        <input
          className="flex-1 p-4 bg-transparent outline-none text-gray-700 placeholder-gray-400"
          type="text"
          placeholder="Ask a finance question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className={`px-6 py-4 font-medium rounded-bl-none rounded-tl-none rounded-br-xl rounded-tr-none ${
            loading || !input.trim() 
              ? "bg-gray-100 text-gray-400" 
              : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-md"
          } transition-all`}
          disabled={loading || !input.trim()}
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </motion.div>
  );
}
