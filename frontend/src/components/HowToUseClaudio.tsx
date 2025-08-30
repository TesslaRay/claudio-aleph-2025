export default function HowToUseClaudio({
  setShowChat,
  setShouldShowTutorial,
}: {
  setShowChat: (showChat: boolean) => void;
  setShouldShowTutorial: (shouldShowTutorial: boolean) => void;
}) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-black">
        Claudio
      </h1>

      <div className="flex flex-col gap-4">
        <button className="text-xl text-gray-600 hover:text-black cursor-pointer transition-colors duration-200 hover:underline">
          Pregúntale a Claudio cualquier cosa para iniciar un caso
        </button>

        <button
          className="text-xl text-gray-600 hover:text-black cursor-pointer transition-colors duration-200 hover:underline border border-gray-300 rounded-md p-2"
          onClick={() => {
            setShowChat(true);
            setShouldShowTutorial(false);
          }}
        >
          Iniciar nuevo caso
        </button>
      </div>
    </div>
  );
}
