import React, { useState } from "react";
import { LuArrowUp } from "react-icons/lu";

interface SimpleChatInputProps {
  onSubmit: (message: string) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export default function SimpleChatInput({
  onSubmit,
  loading = false,
  disabled = false,
  placeholder = "Escribe tu mensaje...",
}: SimpleChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || disabled) return;
    
    onSubmit(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && input.trim() && !disabled) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-end gap-2 p-2 border border-gray-200 rounded-2xl bg-white shadow-sm">
        <textarea
          className="flex-1 resize-none bg-transparent px-3 py-2 text-base focus:outline-none min-h-[40px] max-h-[200px]"
          placeholder={placeholder}
          rows={1}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          disabled={loading || disabled}
        />
        
        <button
          type="submit"
          className="p-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !input.trim() || disabled}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <LuArrowUp className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
}