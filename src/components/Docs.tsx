import { useState } from "react";

interface Document {
  id: string;
  title: string;
  category: string;
  year: string;
  downloadUrl: string;
  description?: string;
}

const documents: Document[] = [
  {
    id: "1",
    title: "SilverTimes Whitepaper",
    category: "Whitepaper",
    year: "2025",
    downloadUrl: "/docs/SilverTimes Token whitepaper_v6.pdf",
    description:
      "Comprehensive overview of SilverTimes protocol and tokenomics",
  },
  {
    id: "2",
    title: "One-Pager",
    category: "Project Documents",
    year: "2025",
    downloadUrl: "https://stt-onepapger.my.canva.site/",
    description: "SilverTimes project overview and key highlights",
  },
  {
    id: "3",
    title: "Branding Guideline",
    category: "Project Documents",
    year: "2025",
    downloadUrl: "/docs/SilverTimes BrandGuideline.pdf",
    description: "Official SilverTimes brand assets and usage guidelines",
  },
];

const categories = ["All categories", "Whitepaper", "Project Documents"];

const years = ["All years", "2025"];

export default function Docs() {
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [selectedYear, setSelectedYear] = useState("All years");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  const filteredDocs = documents.filter((doc) => {
    const categoryMatch =
      selectedCategory === "All categories" ||
      doc.category === selectedCategory;
    const yearMatch = selectedYear === "All years" || doc.year === selectedYear;
    return categoryMatch && yearMatch;
  });

  return (
    <div className="min-h-screen bg-background-primary pt-32">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center mb-6">
          Docs
        </h1>
        <p className="text-xl text-silver-300 text-center max-w-3xl mx-auto mb-12">
          Get closer to the detail with a look through our historical reports
          and documentation.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <a
            href="https://silvertimes.gitbook.io/silvertimes-docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-silver-200 transition-all"
          >
            View Whitepaper
          </a>
          <a
            href="https://silvertimes.gitbook.io/silvertimes-docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-background-secondary/60 backdrop-blur-sm border border-white/10 text-white rounded-xl font-bold hover:bg-background-secondary/80 transition-all"
          >
            Project Documents
          </a>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-center">
          {/* Year Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setYearOpen(!yearOpen);
                setCategoryOpen(false);
              }}
              className="px-6 py-3 bg-background-secondary/60 backdrop-blur-sm border border-white/10 rounded-full text-white font-medium hover:bg-background-secondary/80 transition-all flex items-center gap-2 min-w-[150px] justify-between"
            >
              <span>{selectedYear}</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  yearOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {yearOpen && (
              <div className="absolute top-full mt-2 w-full bg-background-secondary/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year);
                      setYearOpen(false);
                    }}
                    className={`w-full px-6 py-3 text-left hover:bg-white/5 transition-colors ${
                      selectedYear === year
                        ? "text-blue-400"
                        : "text-silver-300"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setCategoryOpen(!categoryOpen);
                setYearOpen(false);
              }}
              className="px-6 py-3 bg-background-secondary/60 backdrop-blur-sm border border-white/10 rounded-full text-white font-medium hover:bg-background-secondary/80 transition-all flex items-center gap-2 min-w-[200px] justify-between"
            >
              <span>{selectedCategory}</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  categoryOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {categoryOpen && (
              <div className="absolute top-full mt-2 w-full bg-background-secondary/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCategoryOpen(false);
                    }}
                    className={`w-full px-6 py-3 text-left hover:bg-white/5 transition-colors ${
                      selectedCategory === category
                        ? "text-blue-400 bg-white/5"
                        : "text-silver-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="max-w-5xl mx-auto px-4 pb-32">
        <div className="space-y-4">
          {filteredDocs.map((doc) => (
            <a
              key={doc.id}
              href={doc.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:bg-background-secondary/40 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-blue-400/80 font-medium px-3 py-1 bg-blue-500/10 rounded-full">
                      {doc.category}
                    </span>
                    <span className="text-xs text-silver-500">{doc.year}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400/90 transition-colors">
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p className="text-sm text-silver-400">{doc.description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-2 text-sm text-blue-400/80 font-medium">
                    <span>Download</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-silver-500 group-hover:text-blue-400/80 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-silver-400 text-lg">
              No documents found matching your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
