// @refresh rest

import React,{useState, useEffect,useCallback} from 'react';
import {GiftedChat} from 'react-native-gifted-chat'
import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet,TextInput, View ,Button,LogBox} from 'react-native';
import * as firebase from 'firebase'
import 'firebase/firestore' 


const  firebaseConfig = {
  apiKey: "AIzaSyA4nD_Ij-XQWBiPzn0BvAGUOcKwQ-i6yhM",
  authDomain: "sbilo2-chatapp.firebaseapp.com",
  databaseURL: "https://sbilo2-chatapp.firebaseio.com",
  projectId: "sbilo2-chatapp",
  storageBucket: "sbilo2-chatapp.appspot.com",
  messagingSenderId: "1033886421707",
  appId: "1:1033886421707:web:8a731cc48097b552ca014e"
};
if(firebase.apps.length == 0){
  firebase.initializeApp(firebaseConfig)
}
LogBox.ignoreLogs(['Setting a timer for a long period of time'])
LogBox.ignoreLogs(['Encountered two children with the same key'])
const db = firebase.firestore()
const chatsRef = db.collection('chats')

export default function App() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const[messsages, setMessage] = useState([])
  useEffect(()=>{
    readUser()
    const unsubscribe = chatsRef.onSnapshot(querySnapshot => {
      const messageFirestore = querySnapshot.docChanges().filter(({type}) => type == 'added')
                                            .map(({doc})=>{
                                              const message = doc.data()
                                              return {...message, createdAt: message.createdAt.toDate()}
                                            }).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())
                                       appendMeesages(messageFirestore)    
      
    })
    return () => unsubscribe()
  },[])
  const appendMeesages = useCallback((messsages) =>{
    setMessage((previousMessages) => GiftedChat.append(previousMessages, messsages) )
  },[messsages])
  async function readUser(){
    const user = await AsyncStorage.getItem('user')
    if(user){
      setUser(JSON.parse(user))
    }
  }
  async function handlePress(){
    const _id = Math.random().toString(36).substring(7)
    const user ={_id, name}
    await AsyncStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }
  async function handleSend(messsages){
    const writes = messsages.map(m => chatsRef.add(m))
    await Promise.all(writes)
  }
  if(!user){
    return (<View style={styles.container}>
      <TextInput style={styles.input} placeholder="Enter your name please" value={name} onChangeText={setName}/>
      <Button onPress={handlePress} title="Enter the chat" />
    </View>)
  }
  return (<GiftedChat messages={messsages} user={user} onSend={handleSend}/>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#808080',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  input:{
    height:50,
    width: '100%',
    borderWidth : 1,
    padding : 15,
    marginBottom: 20,
    borderColor:'gray'

  }
});
