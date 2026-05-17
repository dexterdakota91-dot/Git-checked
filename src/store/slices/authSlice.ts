import { StateCreator } from "zustand";
import {
  User,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { AppState } from "../useStore";

export interface AuthSlice {
  userState: string;
  setUserState: (state: string) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthReady: boolean;
  setIsAuthReady: (isReady: boolean) => void;
  // FIX: Added loginError and isLoggingIn for proper UI feedback
  loginError: string | null;
  setLoginError: (error: string | null) => void;
  isLoggingIn: boolean;
  setIsLoggingIn: (isLoggingIn: boolean) => void;

  // Auth Actions
  handleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

export const createAuthSlice: StateCreator<AppState, [], [], AuthSlice> = (
  set,
) => ({
  userState: "",
  setUserState: (state) => set({ userState: state }),
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  isAuthReady: false,
  setIsAuthReady: (isReady) => set({ isAuthReady: isReady }),
  loginError: null,
  setLoginError: (error) => set({ loginError: error }),
  isLoggingIn: false,
  setIsLoggingIn: (isLoggingIn) => set({ isLoggingIn }),

  handleLogin: async () => {
    set({ loginError: null, isLoggingIn: true });
    try {
      // Primary: try popup (works on most browsers/localhost)
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      const popupBlockedCodes = [
        "auth/popup-blocked",
        "auth/popup-closed-by-user",
        "auth/cancelled-popup-request",
      ];

      if (popupBlockedCodes.includes(error?.code)) {
        // FIX: Fallback to redirect for environments that block popups
        // (Vercel previews, some mobile browsers, strict browser settings)
        try {
          await signInWithRedirect(auth, googleProvider);
          // signInWithRedirect navigates away; result is handled in useFirebaseListeners
          return;
        } catch (redirectError: any) {
          console.error("Login redirect failed", redirectError);
          set({ loginError: "Sign-in failed. Please try again." });
        }
      } else if (error?.code === "auth/unauthorized-domain") {
        // FIX: Clear error message for the most common deployment issue
        set({
          loginError:
            "This domain is not authorized in Firebase. Go to Firebase Console → Authentication → Settings → Authorized Domains and add your app URL.",
        });
        console.error(
          "Unauthorized domain. Add your deployment URL to Firebase Console → Auth → Authorized Domains.",
          error,
        );
      } else {
        console.error("Login failed", error);
        set({
          loginError: error?.message || "Sign-in failed. Please try again.",
        });
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },

  handleLogout: async () => {
    try {
      await signOut(auth);
      set({ activeTab: "landing", selectedProject: null, loginError: null });
    } catch (error) {
      console.error("Logout failed", error);
    }
  },
});
