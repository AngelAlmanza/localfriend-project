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

export interface CreateUserPreferencesDTO {
  language: string;
  latitude: number;
  longitude: number;
  searchRadiusKm: number;
  timezone: string;
  preferredCurrency: string;
  userId: string;
}

export interface UpdateUserPreferencesDTO extends CreateUserPreferencesDTO {
  id: string;
  updatedAt: string;
}
