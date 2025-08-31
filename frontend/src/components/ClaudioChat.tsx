"use client";

// react
import React, { useState, useRef, useEffect } from "react";

// next
import { usePathname } from "next/navigation";

// wagmi
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

// components
import DashboardHeader from "./DashboardHeader";
import HowToUseClaudio from "./HowToUseClaudio";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import UcsPanel from "./UcsPanel";

// types
import { Message } from "@/types/claudio.types";

// services
import { claudioService } from "@/services/claudio.service";

// stores
import { useClaudioStore } from "@/stores/claudio.store";

export default function ClaudioChat() {
  const pathname = usePathname();
  const { address, isConnected, isConnecting } = useAccount();
  const { connect } = useConnect();

  const [showUcsPanel, setShowUcsPanel] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [isHistoricalData, setIsHistoricalData] = useState(false);
  const [shouldShowTutorial, setShouldShowTutorial] = useState(true);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    messages,
    ucs,
    score,
    caseId,
    addMessage,
    setUcs,
    setMessages,
    clearMessages,
    setCaseId,
    setScore,
  } = useClaudioStore();

  // Initialize after a minimum delay to prevent flash
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 800); // Minimum 800ms before showing wallet connection screen

    return () => clearTimeout(timer);
  }, []);

  // Load previous conversation when component mounts or address changes
  useEffect(() => {
    const loadLastActiveConversation = async () => {
      console.log("Loading last active conversation...", {
        isConnected,
        address,
      });

      if (!isConnected || !address) {
        console.log("Not connected or no address, clearing messages");
        setIsLoadingHistory(false);
        clearMessages();
        return;
      }

      setIsLoadingHistory(true);

      try {
        console.log("Fetching conversation for address:", address);
        const response = await claudioService.getLastActiveCaseConversation(
          address
        );
        console.log("API Response:", response);

        if (
          response.status === "success" &&
          response.conversation &&
          response.conversation.length > 0
        ) {
          console.log(
            "Found conversation with",
            response.conversation.length,
            "turns"
          );
          console.log("Raw conversation structure:", response.conversation);

          // Convert conversation to messages format
          const convertedMessages: Message[] = [];

          response.conversation.forEach((turn: any, index: number) => {
            console.log(`Turn ${index}:`, turn);

            if (turn.userMessage) {
              convertedMessages.push({
                role: "user",
                content: turn.userMessage,
                isHistorical: true,
              });
              console.log(`Added user message: ${turn.userMessage}`);
            }
            if (turn.agentMessage) {
              convertedMessages.push({
                role: "agent",
                content: turn.agentMessage,
                isHistorical: true,
              });
              console.log(`Added agent response: ${turn.agentMessage}`);
            }
          });

          console.log("Converted messages:", convertedMessages);

          // Set messages and UCS
          setMessages(convertedMessages);

          if (response.ucs && response.ucs.length > 0) {
            setUcs(response.ucs);
            console.log("Setting UCS:", response.ucs);
          }

          // Set the caseId from the response
          if (response.caseId) {
            setCaseId(response.caseId);
            console.log("Setting caseId:", response.caseId);
          }

          if (response.score) {
            setScore(response.score);
            console.log("Setting score:", response.score);
          }

          // If there are messages, show the chat and hide tutorial
          if (convertedMessages.length > 0) {
            console.log("Setting showChat=true, shouldShowTutorial=false");
            setShowChat(true);
            setShouldShowTutorial(false);
            setIsHistoricalData(true);
          }
        } else {
          console.log("No previous conversation found or empty response");
          clearMessages();
        }
      } catch (error) {
        console.error("Error loading last active conversation:", error);
        clearMessages();
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadLastActiveConversation();
  }, [address, isConnected, setMessages, setUcs, clearMessages, setCaseId]);

  const handleSend = async (message: string) => {
    if (!message.trim() || loading || !address) return;

    const userMessage: Message = {
      role: "user",
      content: message,
      isHistorical: false,
    };
    addMessage(userMessage);
    setLoading(true);

    // Always scroll to bottom when user sends a message
    setIsUserAtBottom(true);

    // If this is the first new message after loading historical data,
    // mark as no longer historical
    if (isHistoricalData) {
      setIsHistoricalData(false);
    }

    try {
      const data = await claudioService.chatWithClaudio(
        message,
        address,
        caseId || undefined
      );

      if (data && data.success && data.message) {
        addMessage({
          role: "agent",
          content: data.message,
          isHistorical: false,
        });

        if (data.ucs) {
          setUcs(data.ucs);
        }

        // Set caseId if this is a new conversation and we got one back
        if (data.caseId && !caseId) {
          setCaseId(data.caseId);
        }

        if (data.score) {
          setScore(data.score);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
      setDisabled(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);

  // Check if user is at the bottom of the chat
  const checkIfUserAtBottom = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold
      setIsUserAtBottom(isAtBottom);
    }
  };

  // Auto-scroll to bottom when messages change (only if user is already at bottom)
  useEffect(() => {
    if (isUserAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isUserAtBottom]);

  // Scroll to bottom when historical data is loaded
  useEffect(() => {
    if (isHistoricalData && showChat && messages.length > 0) {
      const timeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isHistoricalData, showChat, messages.length]);

  const handleNewCase = () => {
    // startNewCase();
  };

  // Loading state component
  const LoadingScreen = ({ message }: { message: string }) => (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-white">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
        <span className="text-lg font-semibold text-gray-700 mt-6 text-center max-w-md">
          {message}
        </span>
      </div>
    </div>
  );

  // Wallet connection component
  const WalletConnectionScreen = () => (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-white">
      <div className="flex flex-col items-center">
        <div className="text-6xl mb-6">🔗</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Conecta tu Wallet
        </h2>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          Para comenzar a chatear con Claudio y generar contratos legales
          onchain, necesitas conectar tu wallet.
        </p>
        <button
          onClick={() => connect({ connector: injected() })}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 font-medium shadow-lg shadow-blue-500/25 cursor-pointer"
        >
          🔗 Conectar Wallet
        </button>
      </div>
    </div>
  );

  // Show loading screen while initializing or connecting
  if (!isInitialized || isConnecting) {
    return (
      <div className="relative w-full h-full font-spectral bg-white flex flex-col">
        <DashboardHeader
          onNewCase={handleNewCase}
          onShowAdvanced={
            pathname === "/agent" || pathname.startsWith("/agent/case/")
              ? () => setShowUcsPanel((prev) => !prev)
              : undefined
          }
          showUcsPanel={showUcsPanel}
        />
        <LoadingScreen message="Inicializando Claudio..." />
      </div>
    );
  }

  // Show wallet connection screen if not connected (only after initialization)
  if (!isConnected) {
    return (
      <div className="relative w-full h-full font-spectral bg-white flex flex-col">
        <DashboardHeader
          onNewCase={handleNewCase}
          onShowAdvanced={
            pathname === "/agent" || pathname.startsWith("/agent/case/")
              ? () => setShowUcsPanel((prev) => !prev)
              : undefined
          }
          showUcsPanel={showUcsPanel}
        />
        <WalletConnectionScreen />
      </div>
    );
  }

  // Show loading screen while history is loading
  if (isLoadingHistory) {
    return (
      <div className="relative w-full h-full font-spectral bg-white flex flex-col">
        <DashboardHeader
          onNewCase={handleNewCase}
          onShowAdvanced={
            pathname === "/agent" || pathname.startsWith("/agent/case/")
              ? () => setShowUcsPanel((prev) => !prev)
              : undefined
          }
          showUcsPanel={showUcsPanel}
        />
        <LoadingScreen message="Cargando conversación anterior..." />
      </div>
    );
  }

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
                ref={chatContainerRef}
                className="w-full h-full overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 280px)" }}
                onScroll={checkIfUserAtBottom}
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
              <UcsPanel ucs={ucs} score={score} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
