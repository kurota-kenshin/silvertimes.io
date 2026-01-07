import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Blog posts metadata for OG tags - add new blog posts here
const blogPosts = [
  {
    route: '/blog/the-great-silver-paradigm-shift',
    title: 'SilverTimes - The Great Silver Paradigm Shift',
    description: "2025 was the year silver broke free. This report offers retail investors and industry observers a data-driven understanding of why silver has evolved into the world's most critical strategic metal.",
    image: 'https://www.silvertimes.io/press/silver_press_1_main.jpeg',
  },
  // Add more blog posts here:
  // {
  //   route: '/blog/another-post',
  //   title: 'Another Post Title',
  //   description: 'Description for another post',
  //   image: 'https://www.silvertimes.io/path/to/image.jpg',
  // },
];

const distDir = path.join(__dirname, '..', 'dist');
const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

console.log('Generating static blog pages with OG tags...\n');

for (const post of blogPosts) {
  // Create the directory structure
  const routeParts = post.route.split('/').filter(Boolean);
  let currentDir = distDir;

  for (const part of routeParts) {
    currentDir = path.join(currentDir, part);
    if (!fs.existsSync(currentDir)) {
      fs.mkdirSync(currentDir, { recursive: true });
    }
  }

  // Generate HTML with replaced meta tags
  let html = indexHtml
    // OG tags
    .replace(
      /<meta property="og:title" content="[^"]*"/,
      `<meta property="og:title" content="${post.title}"`
    )
    .replace(
      /<meta property="og:description" content="[^"]*"/,
      `<meta property="og:description" content="${post.description}"`
    )
    .replace(
      /<meta property="og:image" content="[^"]*"/,
      `<meta property="og:image" content="${post.image}"`
    )
    .replace(
      /<meta property="og:url" content="[^"]*"/,
      `<meta property="og:url" content="https://www.silvertimes.io${post.route}/"`
    )
    // Twitter tags
    .replace(
      /<meta name="twitter:title" content="[^"]*"/,
      `<meta name="twitter:title" content="${post.title}"`
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*"/,
      `<meta name="twitter:description" content="${post.description}"`
    )
    .replace(
      /<meta name="twitter:image" content="[^"]*"/,
      `<meta name="twitter:image" content="${post.image}"`
    )
    .replace(
      /<meta name="twitter:url" content="[^"]*"/,
      `<meta name="twitter:url" content="https://www.silvertimes.io${post.route}/"`
    );

  // Write the file
  const outputPath = path.join(currentDir, 'index.html');
  fs.writeFileSync(outputPath, html);
  console.log(`✓ Generated: ${post.route}/index.html`);
}

console.log('\nDone! Blog pages generated with unique OG tags.');
