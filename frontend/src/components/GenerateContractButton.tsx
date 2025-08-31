"use client";

import React, { useState } from "react";

interface GenerateContractButtonProps {
  onGenerate: () => Promise<void>;
  caseId: string;
}

export default function GenerateContractButton({
  onGenerate,
}: GenerateContractButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-4 mt-4">
      <div className="flex flex-col items-center space-y-4 p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-green-50 to-blue-50">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            ¡Listo para generar el contrato!
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Tu caso tiene una puntuación superior al 80%. Ya tienes suficiente
            información para generar un contrato legal.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg ${
            isGenerating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-green-500/25"
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generando contrato...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 cursor-pointer">
              <span>📄</span>
              <span>Generar Contrato</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
