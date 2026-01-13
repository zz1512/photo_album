export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  year: number;
  timestamp: number;
  description?: string;
}

export interface YearGroup {
  year: number;
  photos: Photo[];
}

export enum AppState {
  LANDING = 'LANDING',
  HEART_ANIMATION = 'HEART_ANIMATION',
  TIMELINE = 'TIMELINE',
  GALLERY = 'GALLERY',
}

// Configuration for the relationship start date
export const START_DATE = new Date('2017-01-13T00:00:00'); 
