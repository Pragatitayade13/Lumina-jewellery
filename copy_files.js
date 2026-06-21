const fs = require('fs');
const path = require('path');

const files = [
  'components/CartModal/CartModal.css',
  'components/CartModal/CartModal.jsx',
  'components/FeaturedCategories/FeaturedCategories.jsx',
  'components/BestSellers/BestSellers.jsx',
  'components/Header/Header.jsx'
];

files.forEach(f => {
  const src = path.join(__dirname, 'src', f);
  const dest = path.join(__dirname, 'frontend', 'src', f);
  fs.copyFileSync(src, dest);
  console.log(`Copied ${f}`);
});
