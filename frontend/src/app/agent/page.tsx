// components
import Sidebar from "@/components/Sidebar";
import ClaudioChat from "@/components/ClaudioChat";

export default function AssistantPage() {
  return (
    <main className="relative h-screen bg-[#FFF] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto h-full">
        <ClaudioChat />
      </div>
    </main>
  );
}
