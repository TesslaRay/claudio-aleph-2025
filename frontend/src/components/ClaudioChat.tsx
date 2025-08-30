"use client";

// react
import React, { useState, useRef, useEffect } from "react";

// next
import Link from "next/link";
import { usePathname } from "next/navigation";

// components
import DashboardHeader from "./DashboardHeader";

export default function ClaudioChat() {
  const pathname = usePathname();
  const [showCaseFactsPanel, setShowCaseFactsPanel] = useState(false);

  const handleNewCase = () => {
    // startNewCase();
  };

  return (
    <div className="relative w-full h-full font-spectral bg-white flex flex-col">
      {/* Header section */}
      <DashboardHeader
        onNewCase={handleNewCase}
        onShowAdvanced={
          pathname === "/assistant" || pathname.startsWith("/assistant/case/")
            ? () => setShowCaseFactsPanel((prev) => !prev)
            : undefined
        }
        showCaseFactsPanel={showCaseFactsPanel}
      />

      <div
        className={`flex-1 flex min-h-0 transition-all duration-500 ease-out overflow-hidden${
          showCaseFactsPanel ? " flex-row" : " flex-row"
        }`}
      >
        wena wena
      </div>
    </div>
  );
}
