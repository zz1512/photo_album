
const fs = require('fs');
const path = require('path');

// 配置路径
const PUBLIC_DIR = path.join(__dirname, '../public');
const PHOTOS_DIR = path.join(PUBLIC_DIR, 'photos');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'photos.json');

// 支持的图片后缀
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

const photos = [];

console.log('🌟 Starting Photo Manifest Generation...');

if (!fs.existsSync(PHOTOS_DIR)) {
  console.error(`❌ Error: Photos directory not found at ${PHOTOS_DIR}`);
  console.log('   Please create "public/photos" and add year folders (e.g., 2017, 2018).');
  process.exit(1);
}

// 读取年份文件夹
const years = fs.readdirSync(PHOTOS_DIR).filter(file => {
  return fs.statSync(path.join(PHOTOS_DIR, file)).isDirectory() && !isNaN(parseInt(file));
});

years.forEach(year => {
  const yearPath = path.join(PHOTOS_DIR, year);
  const files = fs.readdirSync(yearPath);

  files.forEach((file, index) => {
    const ext = path.extname(file).toLowerCase();
    if (IMAGE_EXTENSIONS.includes(ext)) {
      // 构建相对路径 (public目录之外的路径)
      const relativePath = `/photos/${year}/${file}`;
      
      photos.push({
        id: `${year}-${index}-${file}`, // 唯一ID
        url: relativePath,
        thumbnailUrl: relativePath, // 暂时用原图做缩略图
        year: parseInt(year),
        timestamp: new Date(parseInt(year), 5, 15).getTime(), // 默认为年中，你可以解析文件元数据优化这里
        description: `Memory from ${year}`
      });
    }
  });
  console.log(`   ✅ Processed ${year}: Found ${files.filter(f => IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase())).length} photos`);
});

// 按照年份倒序排列
photos.sort((a, b) => b.year - a.year);

// 写入 JSON 文件
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(photos, null, 2));

console.log(`\n✨ Success! Generated manifest with ${photos.length} photos.`);
console.log(`📁 File saved to: ${OUTPUT_FILE}`);
