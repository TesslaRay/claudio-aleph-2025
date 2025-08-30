// react
import React from "react";

// react-markdown
import ReactMarkdown from "react-markdown";

// components
import TypeWriter from "./TypeWriter";

// types
interface ChatMessageProps {
  message: {
    role: "user" | "agent";
    content: string;
  };
  isHistoricalData: boolean;
}

/**
 * Individual chat message component
 */
export default function ChatMessage({
  message,
  isHistoricalData,
}: ChatMessageProps) {
  return (
    <div className="flex w-full mb-6">
      {message.role === "agent" && (
        <div className="flex items-start mr-2">
          <div className="w-10 h-10 rounded-full font-nocturne flex items-center justify-center bg-[#F4F4F4] text-black text-2xl font-bold select-none mt-3">
            C
          </div>
        </div>
      )}

      <div className="flex flex-col w-full">
        <div
          className={`px-5 py-3 rounded-2xl text-base w-full ${
            message.role === "user" ? "border" : "bg-white"
          }`}
          style={{
            background: message.role === "user" ? "#FBFBF9" : undefined,
            borderColor: message.role === "user" ? "#F0EEE7" : undefined,
            boxShadow: "none",
          }}
        >
          {message.role === "agent" ? (
            isHistoricalData ? (
              <ReactMarkdown
                components={{
                  // Customize markdown components to match the design
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-2 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-2 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-base">{children}</li>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm mb-2">
                      {children}
                    </pre>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              <TypeWriter text={message.content} speed={10} />
            )
          ) : (
            message.content
          )}
        </div>
      </div>
    </div>
  );
}
