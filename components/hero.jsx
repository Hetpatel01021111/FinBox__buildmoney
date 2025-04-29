"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const HeroSection = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const banners = [
    "/banner1.jpeg",
    "/banner2.jpeg",
    "/banner3.jpeg",
    "/banner4.jpeg",
    "/banner5.jpeg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // 3D tilt effect on mouse move
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (x - 0.5) * 20, y: (y - 0.5) * 10 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section className="relative pt-32 pb-40 px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/20 via-purple-50/20 to-pink-50/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] bg-[length:100px_100px] opacity-5"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold pb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500"
          >
            Manage Your Finance <br /> 
            <span className="whitespace-nowrap">with Intelligence of</span> <br />
            <span className="text-6xl md:text-8xl lg:text-9xl">FinBox</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto"
          >
            An AI-powered financial management platform that helps you track,
            analyze, and optimize your spending with real-time insights.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center space-x-6 mb-20"
          >
            <Link href="/dashboard">
              <Button size="xl" className="px-12 py-7 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
                Get Started
              </Button>
            </Link>
            <Link href="https://www.youtube.com">
              <Button size="xl" variant="outline" className="px-12 py-7 text-lg font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50/50 shadow-sm hover:shadow-md transition-all">
                Watch Demo
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* 3D Rotating Banner Container */}
        <motion.div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1000px) rotateX(${-tilt.y}deg) rotateY(${tilt.x}deg)`,
            transition: "transform 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67)"
          }}
          className="relative h-[600px] w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gradient-to-br from-gray-50 to-gray-100"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: -90, scale: 0.8 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={banners[currentBanner]}
                fill
                alt={`Dashboard Preview ${currentBanner + 1}`}
                className="object-cover"
                priority
              />
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 pointer-events-none"></div>
            </motion.div>
          </AnimatePresence>
          
          {/* Floating indicators */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-3 h-3 rounded-full transition-all ${currentBanner === index ? 'bg-blue-600 w-6' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl"></div>
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-purple-400/10 blur-3xl"></div>
    </section>
  );
};

export default HeroSection;