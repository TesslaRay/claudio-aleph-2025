"use client";

// react
import React, { useState, useRef, useEffect } from "react";

// next
import Link from "next/link";
import { usePathname } from "next/navigation";

// components
import DashboardHeader from "./DashboardHeader";
import HowToUseClaudio from "./HowToUseClaudio";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

// types
import { Message } from "@/types/claudio.types";

// services
import { claudioService } from "@/services/claudio.service";

// stores
import { useClaudioStore } from "@/stores/claudio.store";
import UcsPanel from "./UcsPanel";

export default function ClaudioChat() {
  const pathname = usePathname();
  const [showUcsPanel, setShowUcsPanel] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [isHistoricalData, setIsHistoricalData] = useState(false);
  const [shouldShowTutorial, setShouldShowTutorial] = useState(true);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [input, setInput] = useState("");

  const { messages, ucs, addMessage, setUcs } = useClaudioStore();

  const handleSend = async (message: string) => {
    if (!message.trim() || loading) return;

    const userMessage: Message = { role: "user", content: message };
    addMessage(userMessage);
    setLoading(true);

    try {
      const data = await claudioService.chatWithClaudio(message);

      if (data && data.success && data.message) {
        addMessage({ role: "agent", content: data.message });

        if (data.ucs) {
          setUcs(data.ucs);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
      setDisabled(false);
      setInput("");
    }
  };

  const messagesEndRef = useRef(null);

  const handleNewCase = () => {
    // startNewCase();
  };

  return (
    <div className="relative w-full h-full font-spectral bg-white flex flex-col">
      {/* Header section */}
      <DashboardHeader
        onNewCase={handleNewCase}
        onShowAdvanced={
          pathname === "/agent" || pathname.startsWith("/agent/case/")
            ? () => setShowUcsPanel((prev) => !prev)
            : undefined
        }
        showUcsPanel={showUcsPanel}
      />

      <div
        className={`flex-1 flex min-h-0 transition-all duration-500 ease-out overflow-hidden${
          showUcsPanel ? " flex-row" : " flex-row"
        }`}
      >
        <div
          className={`transition-all duration-500 ease-out mt-[20px] overflow-hidden flex flex-col ${
            showUcsPanel ? "w-1/2 pr-4" : "w-full"
          }`}
        >
          <div className="flex-1 flex flex-col overflow-hidden">
            {showChat && (
              <div
                className="w-full h-full overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 280px)" }}
              >
                <div className="max-w-3xl mx-auto">
                  {messages.map((msg, idx) => (
                    <ChatMessage
                      key={idx}
                      message={msg}
                      isHistoricalData={isHistoricalData}
                    />
                  ))}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}

            {shouldShowTutorial && (
              <div
                className="flex-1 flex flex-col justify-center items-center transition-all duration-500 ease-in-out opacity-100 translate-y-0 overflow-visible"
                style={{
                  transitionProperty: "opacity, transform",
                  opacity: 1,
                  transform: "translateY(0)",
                }}
              >
                <HowToUseClaudio
                  setShowChat={setShowChat}
                  setShouldShowTutorial={setShouldShowTutorial}
                />
              </div>
            )}
          </div>

          {!shouldShowTutorial && (
            <div className="w-full max-w-3xl mx-auto mb-4 mt-4">
              <ChatInput
                onSubmit={handleSend}
                loading={loading}
                disabled={disabled}
                placeholder="Escribe tu mensaje..."
              />
            </div>
          )}
        </div>

        {/* Case Facts Panel (right side, 50%) */}
        {showUcsPanel && (
          <div
            className="relative w-1/2 h-full flex flex-col bg-white border-l border-gray-200 shadow-lg animate-slide-in-right"
            style={{ minWidth: 0 }}
          >
            <div className="flex-1 overflow-y-auto p-6">
              <UcsPanel ucs={ucs} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
