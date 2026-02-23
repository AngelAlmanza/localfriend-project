export interface UserPreferencesResponse {
  id: string;
  language: string;
  latitude: number;
  longitude: number;
  searchRadius: number;
  timezone: string;
  preferredCurrency: string;
  userId: string;
  updatedAt: Date;
  createdAt: Date;
}
