export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-silver-800 via-silver-700 to-silver-600 text-white">
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            The Future of Silver Investment
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-silver-100">
            Yield-bearing silver tokens backed by real assets from a reputable Hong Kong listed company
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-silver-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-silver-100 transition-colors">
              Get Started
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-silver-800 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  )
}
