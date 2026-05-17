import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc, query, collection, where, onSnapshot } from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError, getRedirectResult } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { USState } from '../constants/mockData';
import { Project } from '../types';

/**
 * Synchronizes Firebase authentication and user projects with application state and completes redirect-based sign-ins on startup.
 *
 * Registers an authentication state listener that updates `currentUser` and `isAuthReady`, fetches the user's profile to decide whether to show onboarding or restore stored user state, and registers a real-time listener for the current user's `projects` collection (sorted by `createdAt`) after auth is ready. Also attempts to complete any pending redirect sign-in when the hook mounts and surfaces relevant login errors via the store. Listeners are detached on cleanup.
 */
export function useFirebaseListeners() {
  const store = useStore();

  useEffect(() => {
    // FIX: Handle redirect sign-in result on app startup.
    // This is required for browsers that block popups (e.g., Safari, mobile browsers, Vercel previews).
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Successfully signed in via redirect:", result.user.uid);
          // We don't need to manually update state here because the onAuthStateChanged listener
          // will automatically catch the state change and update the store.

        }
      }).catch((error) => {
        console.error("Error during redirect sign-in handling:", error);
        useStore.setState({ loginError: error.message || "Redirect sign-in failed." });
      });

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      store.setCurrentUser(firebaseUser);
      store.setIsAuthReady(true);
      
      if (firebaseUser) {
        // Fetch user profile in background
        getDoc(doc(db, 'users', firebaseUser.uid)).then(userDoc => {
          if (!userDoc.exists()) {
            store.setShowOnboarding(true);
          } else {
            store.setUserState((userDoc.data().state as USState) || '');
          }
        }).catch(error => {
          console.error("Error fetching user profile:", error);
        });
      }
    });

    return () => unsubscribeAuth();
  }, [store]);

  // Firestore Projects Listener
  useEffect(() => {
    if (!store.isAuthReady) return;
    
    if (!store.currentUser) {
      store.setProjects([]);
      return;
    }

    const q = query(
      collection(db, 'projects'),
      where('uid', '==', store.currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const projectsData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Project[];

        projectsData.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );

        store.setProjects(projectsData);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'projects');
      }
    );

    return () => unsubscribe();
  }, [store.currentUser, store.isAuthReady, store.setProjects]);
}
