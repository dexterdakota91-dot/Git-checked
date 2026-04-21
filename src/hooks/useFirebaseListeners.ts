import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc, query, collection, where, onSnapshot } from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { Project } from '../types';

export function useFirebaseListeners() {
  const { 
    setCurrentUser, 
    setIsAuthReady, 
    setShowOnboarding, 
    setUserState, 
    setProjects,
    currentUser,
    isAuthReady
  } = useStore();

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
