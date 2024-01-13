import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './Sidebar';
import Main from './Main';
import uuid from 'react-uuid';

import { db } from './firebaseConfig';
import {
  collection, addDoc, onSnapshot, deleteDoc, doc
} from 'firebase/firestore';



const App = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(false);
  const [cache, setCache] = useState(0);
  const [userValified,setUserValified] = useState(false);
  


  useEffect(() => {
    const getNotes = async () => {
      const collectionRef = collection(db, 'React');

      const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
        const documents = [];

        querySnapshot.forEach((doc) => {
          if (doc.exists()) {
            const data = doc.data();

            // 'body' 
            const newNote = {
              id: doc.id,
              title: data.title,
              body: data.body || [],
              lastModified: data.lastModified
            };

            documents.push(newNote);
          } else {
            console.log('No document was founded');
          }
        });

        setNotes(documents);
      });

      return () => {
        unsubscribe();
      };
    };
    getNotes();
  }, []);



  const onAddNote = async (titleName) => {

    try {
      const collectionRef = collection(db, 'React');

      const newDocRef = await addDoc(collectionRef, {
        title: titleName,
        body: [{
          subTitle: '',
          subBody: '',
          subBody2: '',
          img: ''
        }],
        id: uuid(),
        lastModified: Date.now(),
      });

      console.log('new document was created. document ID:', newDocRef.id);
    } catch (err) {
      console.log(err);
    }

    console.log('new note was successfully created');
  };


  const onUpdateNote = (updatedNote) => {

    console.log(updatedNote);

    // apply update in local storage
    const updatedNotes = notes.map((note) =>
      note.id === updatedNote.id ? { ...note, ...updatedNote } : note
    );
    setNotes(updatedNotes);
  };



  const onDeleteNote = async (noteId) => {
    // setNotes(notes.filter(({ id }) => id !== noteId));
    await deleteDoc(doc(db, "React", noteId));
  };


  const getCurrentNote = () => {
    return notes.find((note) => note.id === currentNote);
  };


  return (
    <div className="App">
      <Sidebar
        notes={notes}
        onAddNote={onAddNote}
        onDeleteNote={onDeleteNote}
        currentNote={currentNote}
        setCurrentNote={setCurrentNote}
        refresh={() => setCache(cache + 1)}
        userValified={userValified}
        setUserValified={setUserValified}
        
      />

      {getCurrentNote() ? (
        <Main
          currentNote={getCurrentNote()}
          onUpdateNote={onUpdateNote}
          key={cache}
          userValified={userValified}
        setUserValified={setUserValified}
        />
      ) : (
        <div className="no-active-note">No note selected</div>
      )}
    </div>
  );
}

export default App;
