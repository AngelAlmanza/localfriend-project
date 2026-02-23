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