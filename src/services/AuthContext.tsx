import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import googlesignin,{ GoogleSignin } from '@react-native-google-signin/google-signin';
import { Alert } from 'react-native';

interface AuthContextData {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
  processDate:() =>Promise<void>;
  getClotheNumber:() =>Promise<ClothesCount>;
}
interface ClothesCount {
  total_clothe_number: number;
  top_number: number;
  bottom_number: number;
  onepiece_number:number,
      jacket_number:number
  // 可以添加其他类型的衣物
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
      const uid=auth().currentUser?.uid;
      const formattedDate = formatDateToYYYYMMDD(today);
      console.log(formattedDate);
      await database().ref('/usersDate/' + uid).update({
        lastLogin: formattedDate,
        
      });
      await database().ref('/usersDate/' + uid).once('value').then(snapshot => {
        const prevWeek=snapshot.val().currentWeek
        
        const nowWeek=formatDateToYYYYMMDD(getFirstDayOfWeek())
        if(nowWeek!=prevWeek){
          const tmpdate=new Date(prevWeek)
          const tmpdate2=tmpdate.setDate(tmpdate.getDate() + 6);
          database().ref('/usersDate/' + uid).update({
            currentWeek : nowWeek,
          });
        }
      });
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };
  const processDate=async ()=>{
    const currentDate=new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const date = currentDate.getDate();
      
      
  }
  const getClotheNumber=async ()=>{
    let w;
    let tmp={total_clothe_number:0,
      top_number: 0,
      bottom_number: 0,
      onepiece_number:0,
      jacket_number:0}
    try {
      const uid=auth().currentUser?.uid;
      await database()
      .ref('/users/'+uid)
      .once('value')
      .then(snapshot => {
        console.log(snapshot.val())
        console.log('123456789123456789')
        w=snapshot.val()
        tmp={total_clothe_number: w.total_clothe_number,
          top_number: w.top_number,
          bottom_number: w.bottom_number,
          onepiece_number:w.onepiece_number,
          jacket_number:w.jacket_number}

        
      })
    } catch (error) {
      console.error('Error fetching user data:', error);
      
    }
    return (tmp)
  }
  const signUp = async (userName: string, email: string, password: string) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;
      await database().ref('/users/' + uid).set({
        name: userName,
        birthday: null,
        current_clothe_number: 0,
        total_clothe_number: 0,
        discarded_clothe_number: 0,
        currentWeekAdd:0,
        currentDateAdd:0,
        top_number:0,
        bottom_number:0,
        onepiece_number:0,
        jacket_number:0,
        loveOutfitSerialNum:0,
        loveOutfitNum:0
      });
      const formattedDate = formatDateToYYYYMMDD(today);
      console.log(formattedDate);
      await database().ref('/usersDate/' + uid).set({
        currentWeek : formatDateToYYYYMMDD(getFirstDayOfWeek()),
        lastLogin: formattedDate,
      });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth().signOut();
      
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
        discarded_clothe_number: 0,
        top_number:0,
        bottom_number:0,
        onepiece_number:0,
        jacket_number:0,
        loveOutfitSerialNum:0,
        loveOutfitNum:0
      });
      
      const formattedDate = formatDateToYYYYMMDD(today);
      console.log(formattedDate);
      await database().ref('/usersDate/' + uid).set({
        currentWeek : formatDateToYYYYMMDD(getFirstDayOfWeek()),
        lastLogin: formattedDate,
      });
      return true;
    }
    const formattedDate = formatDateToYYYYMMDD(today);
    console.log(formattedDate);
    await database().ref('/usersDate/' + uid).update({
      lastLogin: formattedDate,
      
    });
    await database().ref('/usersDate/' + uid).once('value').then(snapshot => {
      const prevWeek=snapshot.val().currentWeek
      
      const nowWeek=formatDateToYYYYMMDD(getFirstDayOfWeek())
      if(nowWeek!=prevWeek){
        const tmpdate=new Date(prevWeek)
        const tmpdate2=tmpdate.setDate(tmpdate.getDate() + 6);
        database().ref('/usersDate/' + uid).update({
          currentWeek : nowWeek,
        });
      }
    });
    return true;
  // Sign-in the user with the credential
  
  
  
    // Sign-in the user with the credential
  }
  const getFirstDayOfWeek = (date = new Date()) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  };
  function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  // 使用示例
  const today = new Date();
  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, forgotPassword, signInWithGoogle,processDate,getClotheNumber }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);