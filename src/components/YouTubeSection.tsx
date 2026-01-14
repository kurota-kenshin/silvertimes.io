export default function YouTubeSection() {
  return (
    <section className="bg-background-primary pt-32 pb-0 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute inset-0 w-full h-full rounded-2xl"
            src="https://www.youtube.com/embed/--uK4CnyrHc?autoplay=1&mute=1&loop=1&playlist=--uK4CnyrHc&controls=1&showinfo=0&rel=0"
            title="SilverTimes Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
