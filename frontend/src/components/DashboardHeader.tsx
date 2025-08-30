"use client";

// next
import { usePathname } from "next/navigation";

// icons
import {
  LuShare,
  LuSquarePen,
  LuPanelLeft,
  LuBriefcase,
} from "react-icons/lu";

// shadcn/ui
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/**
 * DashboardHeader component that displays the header section with dynamic title based on route
 * @param onNewCase Callback for creating a new case
 * @param onShowAdvanced Callback for showing advanced (case facts) panel
 */
export default function DashboardHeader({
  onNewCase,
  onShowAdvanced,
  showCaseFactsPanel,
}: {
  onNewCase?: () => void;
  onShowAdvanced?: () => void;
  showCaseFactsPanel?: boolean;
}) {
  const pathname = usePathname();

  // Determine the title based on the current route
  const getTitle = () => {
    if (pathname === "/chat-provisory") {
      return "Asistente";
    }

    if (pathname === "/cases") {
      return "Casos";
    }

    if (pathname === "/vault") {
      return "Bóveda";
    }

    if (pathname === "/settings") {
      return "Configuración";
    }

    return "Asistente";
  };

  // Check if we're in assistant view (including specific cases)
  const isAssistantView =
    pathname === "/assistant" || pathname.startsWith("/assistant/case/");

  return (
    <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-gray-300 bg-white">
      <div className="w-full pl-[20px] flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg text-gray-600 mb-1">{getTitle()} /</h2>
        </div>

        <div className="flex items-center space-x-4">
          {isAssistantView && onNewCase && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="ml-2 px-4 py-1.5 rounded-[10px] font-semibold transition-all duration-200 cursor-pointer hover:scale-105 bg-black text-white flex items-center gap-2"
                  title="New Case"
                  variant="default"
                >
                  <LuShare size={18} />
                  Share
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Acceso restringido</AlertDialogTitle>

                  <AlertDialogDescription>
                    Solo usuarios con una suscripción activa pueden compartir
                    sus cases.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogAction className="cursor-pointer">
                    Aceptar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {isAssistantView && onNewCase && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="ml-2 px-4 py-1.5 rounded-[10px] font-semibold transition-all duration-200 cursor-pointer hover:scale-105 bg-black text-white flex items-center gap-2"
                  title="New Case"
                  variant="default"
                >
                  <LuSquarePen size={18} />
                  Nuevo Caso
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl">
                    Elige tu Asistente Legal
                  </AlertDialogTitle>

                  <AlertDialogDescription className="text-base">
                    Selecciona el agente especializado que mejor se adapte a las
                    necesidades de tu caso.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid gap-4 py-4">
                  <div
                    className="border rounded-lg p-4 hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer"
                    onClick={() => {
                      // Here you can add logic to differentiate between agents
                      // For now, calling the original onNewCase function
                      onNewCase();
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                        <LuBriefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          Tomas
                        </h3>

                        <p className="text-sm text-gray-600 mb-2">
                          Asociado Junior - Práctica General
                        </p>

                        <p className="text-sm text-gray-700 mb-3">
                          Un asociado junior versátil que se especializa en nada
                          pero sabe de todo. Perfecto para investigación y casos
                          que requieren conocimiento legal amplio.
                        </p>

                        <div className="text-sm">
                          <p className="text-gray-700 font-semibold mb-2">
                            Capaz de realizar:
                          </p>
                          <ul className="text-gray-600 space-y-1 ml-2">
                            <li>• Consultas generales</li>
                            <li>• Asesoría inicial</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Advanced button only in assistant view */}
          {isAssistantView && onShowAdvanced && (
            <Button
              className="ml-2 px-4 py-1.5 rounded-[10px] font-semibold transition-all duration-200 cursor-pointer hover:scale-105 bg-black text-white flex items-center gap-2"
              title={showCaseFactsPanel ? "Simple" : "Ver detalles"}
              variant="default"
              onClick={onShowAdvanced}
            >
              <LuPanelLeft size={18} />
              {showCaseFactsPanel ? "Simple" : "Ver detalles"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
