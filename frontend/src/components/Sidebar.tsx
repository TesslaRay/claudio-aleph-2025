"use client";

// react
import React, { useState } from "react";

// next
import Link from "next/link";

// icons
import {
  LuBookOpen,
  LuMessageCircle,
  LuFolderLock,
  LuSettings,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";

// shadcn/ui
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";

/**
 * Sidebar component for the left side of the app.
 * Contains main navigation and bottom section for help and settings.
 * Includes a collapse/expand button next to the title.
 */
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [selectedOption, setSelectedOption] = useState("tomas");

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-[200px]"
      } h-full min-h-screen bg-[#FBFBF9] flex flex-col justify-between border-r border-gray-300 transition-all duration-300 ease-in-out flex-shrink-0`}
    >
      <div>
        <div
          className={`flex items-center ${
            collapsed ? "justify-center px-2" : "pl-5 pr-2"
          } pt-6 pb-10 gap-2`}
        >
          <h3
            className={`text-2xl font-departure font-semibold text-[#222] transition-all duration-300 ease-in-out ${
              collapsed
                ? "opacity-0 scale-95 w-0 overflow-hidden"
                : "opacity-100 scale-100"
            }`}
          >
            Claudio
          </h3>

          <button
            className={`p-1 rounded hover:bg-gray-200 transition-all duration-200 ease-in-out cursor-pointer ${
              collapsed ? "" : "ml-auto"
            }`}
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <LuChevronsRight size={20} />
            ) : (
              <LuChevronsLeft size={20} />
            )}
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          <Link href="/agent">
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <SidebarOption
                      icon={<LuMessageCircle size={20} />}
                      label="Asistente"
                      isActive={selectedOption === "assistant"}
                      onSelect={() => setSelectedOption("assistant")}
                      collapsed={collapsed}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Asistente</TooltipContent>
              </Tooltip>
            ) : (
              <SidebarOption
                icon={<LuMessageCircle size={20} />}
                label="Asistente"
                isActive={selectedOption === "assistant"}
                onSelect={() => setSelectedOption("assistant")}
                collapsed={collapsed}
              />
            )}
          </Link>

          <Link href="/cases">
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <SidebarOption
                      icon={<LuBookOpen size={20} />}
                      label="Casos"
                      isActive={selectedOption === "cases"}
                      onSelect={() => setSelectedOption("cases")}
                      collapsed={collapsed}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Casos</TooltipContent>
              </Tooltip>
            ) : (
              <SidebarOption
                icon={<LuBookOpen size={20} />}
                label="Casos"
                isActive={selectedOption === "cases"}
                onSelect={() => setSelectedOption("cases")}
                collapsed={collapsed}
              />
            )}
          </Link>

          <Link href="/vault">
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <SidebarOption
                      icon={<LuFolderLock size={20} />}
                      label="Bóveda"
                      isActive={selectedOption === "vault"}
                      onSelect={() => setSelectedOption("vault")}
                      collapsed={collapsed}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Bóveda</TooltipContent>
              </Tooltip>
            ) : (
              <SidebarOption
                icon={<LuFolderLock size={20} />}
                label="Bóveda"
                isActive={selectedOption === "vault"}
                onSelect={() => setSelectedOption("vault")}
                collapsed={collapsed}
              />
            )}
          </Link>
        </nav>
      </div>

      <div className="flex flex-col gap-1 pr-2 pb-6">
        {/* <Link href="/settings">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <SidebarOption
                    icon={<LuSettings size={20} />}
                    label="Configuración"
                    isActive={selectedOption === "settings"}
                    onSelect={() => setSelectedOption("settings")}
                    collapsed={collapsed}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">Configuración</TooltipContent>
            </Tooltip>
          ) : (
            <SidebarOption
              icon={<LuSettings size={20} />}
              label="Configuración"
              isActive={selectedOption === "settings"}
              onSelect={() => setSelectedOption("settings")}
              collapsed={collapsed}
            />
          )}
        </Link> */}
      </div>
    </aside>
  );
}

/**
 * SidebarOption component for rendering a single sidebar menu item.
 * @param icon ReactNode - Icon to display
 * @param label string - Label for the menu item
 * @param isActive boolean - Whether this option is currently active
 * @param onSelect function - Callback when this option is selected
 * @param collapsed boolean - Whether the sidebar is collapsed
 */
function SidebarOption({
  icon,
  label,
  isActive = false,
  onSelect,
  collapsed = false,
}: {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onSelect: () => void;
  collapsed?: boolean;
}) {
  return (
    <div
      className={`flex items-center min-h-[44px] rounded-lg cursor-pointer group transition-all duration-300 ease-in-out hover:bg-[#E6F0FA] pl-5 pr-2 py-2 ${
        isActive ? "bg-[#E6F0FA]" : ""
      }`}
      onClick={onSelect}
    >
      <span
        className={`transition-all duration-300 ease-in-out flex-shrink-0 ${
          isActive ? "text-black" : "text-gray-500 group-hover:text-black"
        }`}
      >
        {icon}
      </span>

      <span
        className={`text-base font-medium transition-all duration-300 ease-in-out ml-3 ${
          isActive ? "text-black" : "text-gray-500 group-hover:text-black"
        } ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
      >
        {label}
      </span>
    </div>
  );
}
