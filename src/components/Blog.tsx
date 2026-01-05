import { useState } from "react";
import { Link } from "react-router-dom";
import { blogPostsData } from "./BlogPost";

interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
}

// Transform blogPostsData to match the listing format
const blogPosts: BlogPost[] = blogPostsData.map((post) => ({
  id: post.id,
  title: post.title,
  category: post.category,
  date: post.date,
  image: post.mainImage,
  excerpt: post.excerpt,
}));

const categories = ["All topics", "Market Analysis", "Industry Insights", "Technology", "Investment"];
const years = ["All years", "2026", "2025", "2024"];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("All topics");
  const [selectedYear, setSelectedYear] = useState("All years");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  const filteredPosts = blogPosts.filter((post) => {
    const categoryMatch = selectedCategory === "All topics" || post.category === selectedCategory;
    const yearMatch = selectedYear === "All years" || post.date.includes(selectedYear);
    return categoryMatch && yearMatch;
  });

  return (
    <div className="min-h-screen bg-background-primary pt-32">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center mb-12">
          Blog
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-center">
          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setCategoryOpen(!categoryOpen);
                setYearOpen(false);
              }}
              className="px-6 py-3 bg-background-secondary/60 backdrop-blur-sm border border-white/10 rounded-full text-white font-medium hover:bg-background-secondary/80 transition-all flex items-center gap-2"
            >
              {selectedCategory}
              <svg
                className={`w-4 h-4 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {categoryOpen && (
              <div className="absolute top-full mt-2 w-full min-w-[200px] bg-background-secondary/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCategoryOpen(false);
                    }}
                    className={`w-full px-6 py-3 text-left hover:bg-white/5 transition-colors ${
                      selectedCategory === category ? "text-blue-400" : "text-silver-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setYearOpen(!yearOpen);
                setCategoryOpen(false);
              }}
              className="px-6 py-3 bg-background-secondary/60 backdrop-blur-sm border border-white/10 rounded-full text-white font-medium hover:bg-background-secondary/80 transition-all flex items-center gap-2"
            >
              {selectedYear}
              <svg
                className={`w-4 h-4 transition-transform ${yearOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {yearOpen && (
              <div className="absolute top-full mt-2 w-full min-w-[150px] bg-background-secondary/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year);
                      setYearOpen(false);
                    }}
                    className={`w-full px-6 py-3 text-left hover:bg-white/5 transition-colors ${
                      selectedYear === year ? "text-blue-400" : "text-silver-300"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-32">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link to={`/blog/${post.id}`} key={post.id}>
              <article className="group bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all cursor-pointer h-full">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-violet-500/10"></div>
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs text-blue-400/80 font-medium">{post.category}</span>
                    <span className="text-xs text-silver-500">•</span>
                    <span className="text-xs text-silver-500">{post.date}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400/90 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-sm text-silver-400 leading-relaxed">{post.excerpt}</p>

                  <div className="mt-6 flex items-center gap-2 text-sm text-blue-400/80 font-medium group-hover:gap-3 transition-all">
                    <span>Read more</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-silver-400 text-lg">No posts found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
