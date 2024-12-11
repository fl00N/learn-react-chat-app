import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand'
import { db } from './firebase';

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid) => {
    if (!uid) return set({ currentUser: null, isLoading: false });
  
    set({ isLoading: true });
  
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        set({ currentUser: { uid, ...docSnap.data() }, isLoading: false });
      } else {
        console.warn("User not found in Firestore:", uid);
        set({ currentUser: null, isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      set({ currentUser: null, isLoading: false });
    }
  }
}))