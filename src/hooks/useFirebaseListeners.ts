import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc, query, collection, where, onSnapshot } from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError, getRedirectResult } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { Project } from '../types';

/**
 * Synchronizes Firebase authentication and user projects with application state and completes redirect-based sign-ins on startup.
 *
 * Registers an authentication state listener that updates `currentUser` and `isAuthReady`, fetches the user's profile to decide whether to show onboarding or restore stored user state, and registers a real-time listener for the current user's `projects` collection (sorted by `createdAt`) after auth is ready. Also attempts to complete any pending redirect sign-in when the hook mounts and surfaces relevant login errors via the store. Listeners are detached on cleanup.
 */
export function useFirebaseListeners() {
  const { 
    setCurrentUser, 
    setIsAuthReady, 
    setShowOnboarding, 
    setUserState, 
    setProjects,
    setLoginError,
    currentUser,
    isAuthReady
  } = useStore();

  // FIX: Handle redirect sign-in result on app startup.
  // When signInWithRedirect is used (popup blocked), Firebase redirects back
  // to the app. getRedirectResult() must be called to complete the sign-in.
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          // Redirect sign-in succeeded — onAuthStateChanged below will fire automatically

        }
      })
      .catch((error: any) => {
        if (error?.code === 'auth/unauthorized-domain') {
          setLoginError(
            "This domain is not authorized in Firebase. Add your app URL to Firebase Console → Authentication → Settings → Authorized Domains."
          );
        } else if (error?.code !== 'auth/no-current-user') {
          console.error("Redirect sign-in error:", error);
          setLoginError(error?.message || "Sign-in failed. Please try again.");
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount only

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
      
      if (user) {
        // Fetch user profile in background
        getDoc(doc(db, 'users', user.uid)).then(userDoc => {
          if (!userDoc.exists()) {
            setShowOnboarding(true);
          } else {
            setUserState(userDoc.data().state || '');
          }
        }).catch(error => {
          console.error("Error fetching user profile:", error);
        });
      }
    });
    return () => unsubscribe();
  }, [setCurrentUser, setIsAuthReady, setShowOnboarding, setUserState]);

  // Firestore Projects Listener
  useEffect(() => {
    if (!isAuthReady) return;
    
    if (!currentUser) {
      setProjects([]);
      return;
    }

    const q = query(
      collection(db, 'projects'),
      where('uid', '==', currentUser.uid)
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

        setProjects(projectsData);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'projects');
      }
    );

    return () => unsubscribe();
  }, [currentUser, isAuthReady, setProjects]);
}
