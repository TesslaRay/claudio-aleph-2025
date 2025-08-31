"use client";

// react
import { useState } from "react";

// next
import Link from "next/link";
import Image from "next/image";

// components
// import Navbar from "@/components/Navbar";

export default function Home() {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Show video after image loads with a small delay
  const handleImageLoad = () => {
    setIsImageLoaded(true);
    setTimeout(() => setShowVideo(true), 1000);
  };

  return (
    <main className="relative min-h-screen bg-[#F4F3ED]">
      {/* Hero Section */}
      <section className="relative flex flex-col min-h-screen">
        {/* Background Image */}
        <div
          className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
            isImageLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: "url(/assets/cover.png)",
            backgroundPosition: "center 0%",
            backgroundSize: "cover",
          }}
        />

        {/* Background Video */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
            showVideo ? "opacity-100" : "opacity-0"
          }`}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 0%" }}
          >
            <source src="/assets/cover-animated.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Loading background color */}
        <div
          className={`absolute inset-0 w-full h-full bg-[#B5C186] transition-opacity duration-1000 ${
            isImageLoaded ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Overlay for opacity */}
        <div className="absolute inset-0 h-full bg-black/30" />

        {/* Preload image */}
        <div className="hidden">
          <Image
            src="/assets/cover.png"
            alt="Background"
            width={1920}
            height={1080}
            onLoad={handleImageLoad}
            priority
          />
        </div>

        {/* <Navbar /> */}

        <section className="relative z-10 flex flex-1 flex-col justify-center items-start max-w-7xl mx-auto px-6 w-full pt-12 md:pt-0">
          {/* Titles */}
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-lg mb-2 mt-8 md:mt-0">
            CLAUDIO
          </h1>

          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-lg mb-6">
            LEGAL ONCHAIN AGENT
          </h1>

          {/* Divider */}
          <div className="w-full h-px bg-white/30" />

          <div className="w-full flex flex-col md:flex-row items-start justify-between gap-2 md:gap-0 mt-2">
            <div className="text-white p-2 md:p-4 rounded-lg text-sm md:text-[16px] font-medium">
              WEB3 + LEGAL
            </div>

            <div className="max-w-[800px] text-white p-2 md:p-4 rounded-lg text-justify text-sm md:text-xl font-bold">
              Claudio es una plataforma que simplifica lacreación, ejecución y
              gestión de contratos legalmente vinculantes en blockchain,
              diseñada específicamente para los marcos jurídicos de
              Latinoamérica.
              <br />
              <br />
              Su objetivo es facilitar las transacciones locales y
              transfronterizas, asegurando que empleadores y trabajadores puedan
              firmar acuerdos de forma segura, transparente y verificable
              on-chain.
            </div>
          </div>

          {/* Buttons */}
          <div className="w-full flex flex-col md:flex-row justify-end gap-2 mt-4">
            {/* <Link
              href="https://youtu.be/CXfXiVHWS48?si=MElNZZ77cuB1xSLF"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="px-4 py-1.5 rounded-[10px] border border-white font-semibold transition-colors duration-200 text-white hover:bg-black hover:text-white hover:border-black cursor-pointer w-full md:w-auto">
                Ver demo
              </button>
            </Link> */}

            <Link href="/agent">
              <button className="px-4 py-1.5 rounded-[10px] font-semibold transition-opacity duration-200 bg-white text-black hover:opacity-80 cursor-pointer w-full md:w-auto">
                Generar contrato
              </button>
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
