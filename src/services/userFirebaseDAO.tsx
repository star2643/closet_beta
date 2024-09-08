import userDAO from './userDAO';
import { firebase } from '@react-native-firebase/database';
import database from '@react-native-firebase/database';
import { useState } from 'react';
import auth from '@react-native-firebase/auth';

class firebaseUserDAO extends userDAO{
  private reference:any;
  constructor(){
    super()
    this.reference = firebase.app().database('https://closet-b2d3d-default-rtdb.asia-southeast1.firebasedatabase.app')
  }
  
  async getUserById(id) {
    let w;
    try {
      let w;
      await this.reference
      .ref('/users/'+id)
      .once('value')
      .then(snapshot => {
        console.log('User data: ', snapshot.val());
        w=snapshot.val()
        console.log('User data: ', snapshot.val());
      })
      return w ? w.name : null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
   
  }
  async createUserByEmail(userEmail:string,userPassword:string) {
    auth()
    .createUserWithEmailAndPassword(userEmail,userPassword )
    .then(() => {
      console.log('User account created & signed in!');
    })
    .catch(error => {
      if (error.code === 'auth/email-already-in-use') {
        console.log('That email address is already in use!');
      }

      if (error.code === 'auth/invalid-email') {
        console.log('That email address is invalid!');
      }

      console.error(error);
    });
  }
  async updateUser(id, user) {

  }
  async deleteUser(id) {

  }
}


export default firebaseUserDAO;
