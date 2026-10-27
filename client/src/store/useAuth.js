import { create } from "zustand";

const useAuth = create((set) => ({
  user: null,
  status: "checking",
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  setAuthUser: (user) =>
    set({ user, status: user ? "authenticated" : "unauthenticated" }),
  clearAuth: () => set({ user: null, status: "unauthenticated" }),
}));

export default useAuth;
