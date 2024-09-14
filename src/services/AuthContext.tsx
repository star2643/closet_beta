import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import googlesignin,{ GoogleSignin } from '@react-native-google-signin/google-signin';

interface AuthContextData {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (userName: string, email: string, password: string) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;
      await database().ref('/users/' + uid).set({
        name: userName,
        birthday: null,
        current_clothe_number: 0,
        total_clothe_number: 0,
        discarded_clothe_number: 0
      });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth().signOut();
      if (await GoogleSignin.isSignedIn()) {
        await GoogleSignin.signOut();
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  async function signInWithGoogle() {
    GoogleSignin.signOut()
    GoogleSignin.configure({
      webClientId: '451362612871-mj4tts3f4gdb6je7g1dgj5jblndlldp0.apps.googleusercontent.com', // 從 Firebase Console 獲取
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      
    });
    console.log("1")
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  // Get the users ID token
    const userinfo = (await GoogleSignin.signIn()).data?.idToken;
    if(!userinfo){
      return false
    }
    console.log(userinfo)
  // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(userinfo);
    const userCredential = await auth().signInWithCredential(googleCredential);
    const isNewUser = userCredential.additionalUserInfo?.isNewUser || false;
    const uid = userCredential.user.uid;
    if(isNewUser){
      await database().ref('/users/' + uid).set({
        name: 'google_user',
        birthday: null,
        current_clothe_number: 0,
        total_clothe_number: 0,
        discarded_clothe_number: 0
      });
    }
    return true;
  // Sign-in the user with the credential
  
    
  
    // Sign-in the user with the credential
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, forgotPassword, signInWithGoogle }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);