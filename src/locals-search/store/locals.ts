import { create } from "zustand";
import { Local } from "../interfaces/Local";

interface LocalsSearchState {
  selectedLocal: Local | null;
  setSelectedLocal: (local: Local) => void;
  clearSelectedLocal: () => void;
}

export const useLocalsSearchStore = create<LocalsSearchState>((set) => ({
  selectedLocal: null,
  setSelectedLocal: (local: Local) => set({ selectedLocal: local }),
  clearSelectedLocal: () => set({ selectedLocal: null }),
}));