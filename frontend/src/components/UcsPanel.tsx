"use client";

// react
import React from "react";

interface UcsPanelProps {
  ucs: string[];
}

/**
 * Case Facts component to display extracted facts from the conversation
 */
export default function UcsPanel({ ucs }: UcsPanelProps) {
  if (ucs.length === 0) {
    return null;
  }

  return (
    <div className="hidden lg:flex flex-col transition-all duration-500 ease-out">
      <div className="flex items-center justify-between gap-3 py-4 w-full select-none group flex-shrink-0">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 text-lg">
              Estado Cognitivo Universal
            </span>
          </div>

          {/* {typeof lastScore === "number" && (
            <span
              className="ml-2 px-2 py-0.5 rounded-full bg-black text-white text-xs font-semibold min-w-[36px] text-center"
              title="Last sufficiency score"
            >
              {Math.round(lastScore * 100)}%
            </span>
          )} */}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="px-6 pb-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="space-y-0">
            {ucs.map((fact, idx) => (
              <div key={idx}>
                <p
                  className={`text-[12px] text-gray-700 break-words${
                    idx < ucs.length - 1 ? " py-3" : " pt-3"
                  }`}
                >
                  {fact}
                </p>

                {idx < ucs.length - 1 && (
                  <div className="border-b border-gray-200 -mx-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
