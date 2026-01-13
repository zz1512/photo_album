import { Photo, YearGroup } from '../types';

/**
 * Generate mock data for demo purposes if real data is missing
 */
const generateMockPhotos = (): Photo[] => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2, 2017];
  const photos: Photo[] = [];
  
  years.forEach((year) => {
    // Generate 5 photos per year
    for (let i = 1; i <= 5; i++) {
       const width = 600;
       const height = i % 2 === 0 ? 800 : 600; // Mix orientations
       photos.push({
         id: `demo-${year}-${i}`,
         // Use picsum with seed to ensure consistent images across reloads
         url: `https://picsum.photos/seed/${year}_${i}/${width}/${height}`,
         thumbnailUrl: `https://picsum.photos/seed/${year}_${i}/300/400`,
         year: year,
         timestamp: new Date(year, i, 15).getTime(),
         description: `Demo Memory ${year}`
       });
    }
  });
  return photos;
};

/**
 * 现在的逻辑非常简单高效：
 * 直接请求 /photos.json 文件。
 * 如果失败（未生成或网络错误），则自动降级为演示数据。
 */
export const detectAvailablePhotos = async (onProgress?: (msg: string) => void): Promise<Photo[]> => {
  try {
    if (onProgress) onProgress("Loading photo manifest...");
    
    // 添加时间戳防止缓存
    const response = await fetch(`/photos.json?t=${Date.now()}`);
    
    if (!response.ok) {
      console.warn("photos.json not found (404). Loading demo data.");
      if (onProgress) onProgress("Manifest not found. Entering Demo Mode...");
      // Simulate a short network delay for realism
      await new Promise(resolve => setTimeout(resolve, 800));
      return generateMockPhotos();
    }

    const photos: Photo[] = await response.json();
    
    if (onProgress) onProgress(`Loaded ${photos.length} memories successfully.`);
    
    return photos;
  } catch (error) {
    console.warn("Manifest load failed (Network Error?). Using demo data.", error);
    if (onProgress) onProgress("Network error. Entering Demo Mode...");
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockPhotos();
  }
};

export const groupPhotosByYear = (photos: Photo[]): YearGroup[] => {
  const groups: Record<number, Photo[]> = {};
  
  photos.forEach(photo => {
    if (!groups[photo.year]) {
      groups[photo.year] = [];
    }
    groups[photo.year].push(photo);
  });

  return Object.keys(groups)
    .map(year => ({
      year: parseInt(year),
      photos: groups[parseInt(year)]
    }))
    .sort((a, b) => b.year - a.year); 
};

// 预加载保持不变，但为了性能，还是限制数量
export const preloadPhotos = async (photos: Photo[], onProgress: (progress: number) => void) => {
  let loaded = 0;
  // 仅预加载前 15 张，保证进入动画流畅即可
  const toLoad = photos.slice(0, 15); 
  const total = toLoad.length;
  
  if (total === 0) {
    onProgress(100);
    return;
  }

  const promises = toLoad.map(photo => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.src = photo.thumbnailUrl;
      img.onload = () => {
        loaded++;
        onProgress(Math.round((loaded / total) * 100));
        resolve();
      };
      img.onerror = () => {
        // Even if error, resolve to keep progress moving
        loaded++; 
        onProgress(Math.round((loaded / total) * 100));
        resolve();
      };
    });
  });

  await Promise.all(promises);
};