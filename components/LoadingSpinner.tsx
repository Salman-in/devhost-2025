export default function LoadingSpinner() {
  return (
    <div className="z-10 flex min-h-screen w-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
        <p className="font-orbitron text-primary mt-4">Loading...</p>
      </div>
    </div>
  );
}
