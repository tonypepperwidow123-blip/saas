import { create } from 'zustand';

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));