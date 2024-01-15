import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import uuid from 'react-uuid';
import PopupAuth from './PopupAuth';


import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from './firebaseConfig';

import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/default-highlight';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FaCopy } from "react-icons/fa";

const Main = ({ currentNote, onUpdateNote, userValified, setUserValified }) => {

    const [img, setImg] = useState(null);
    // -1:default, x: pointing the current note, -10: new note
    const [currentEdit, setCurrentEdit] = useState(-1);
    const [popupSeen, setPopupSeen] = useState(false);

    const [newSubTitle, setNewSubTitle] = useState('');
    const [newSubBody, setNewSubBody] = useState('');
    const [newSubBody2, setNewSubBody2] = useState('');


    const refresh = () => {
        setCurrentEdit(-1);
        setImg(null);
        setNewSubTitle('');
        setNewSubBody('');
        setNewSubBody2('');
    }


    // Edit Start
    const initEdit = (key) => {

        if (userValified) {
            setCurrentEdit(key);
            setNewSubTitle(currentNote.body[key].subTitle);

            setNewSubBody(currentNote.body[key].img === ''
                ? currentNote.body[key].subBody
                : '');

            setImg(currentNote.body[key].img !== ''
                ? currentNote.body[key].img
                : '');

            setNewSubBody2(currentNote.body[key].subBody2);

            console.log(currentNote.body[key].img)

        } else {
            setPopupSeen(true);
        }
    }


    //creating a new note
    const addNote = async () => {

        let newNote = JSON.parse(JSON.stringify(currentNote));
        // image included
        if (img) {
            const uploadTask = uploadBytesResumable(ref(storage, uuid()), img);

            try {
                uploadTask.on(
                    "state_changed", () => { },
                    async (error) => console.error('Image upload failed:', error),
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                            newNote.body.push({
                                img: downloadURL,
                                subTitle: newSubTitle,
                                subBody: '',
                                subBody2: newSubBody2
                            });

                            // Update in firebase
                            await updateDoc(doc(db, 'React', currentNote.id), newNote);
                            // Update in app.js
                            await onUpdateNote(newNote, true);
                        } catch (error) {
                            console.error('Error processing image upload:', error);
                        }
                    }
                );
            } catch (error) {
                console.error('Error in image upload:', error);
            }
        } else {

            // image not included 
            newNote.body.push({
                subTitle: newSubTitle,
                subBody: newSubBody,
                subBody2: newSubBody2,
                img: ''
            })
        }

        newNote.lastModified = Date.now();
        // update in firease
        await updateDoc(doc(db, 'React', currentNote.id), newNote);
        await onUpdateNote(newNote);
        refresh();
    }

    const isValidUrl = urlString => {
        var urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
        return !!urlPattern.test(urlString);
    }



    // Done editing an existing note
    const editEnd = async () => {
        let newNote = JSON.parse(JSON.stringify(currentNote));

        // image included
        if (img && !isValidUrl(img)) {
            const uploadTask = uploadBytesResumable(ref(storage, uuid()), img);

            try {
                uploadTask.on(
                    "state_changed",
                    () => { },
                    async (error) => console.error('Image upload failed:', error),
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                            newNote.body[currentEdit].img = downloadURL;
                            newNote.body[currentEdit].subTitle = newSubTitle;
                            newNote.body[currentEdit].subBody = '';
                            newNote.body[currentEdit].subBody2 = newSubBody2;

                            // Note: Move the updateDoc inside the image upload completion block
                            await updateNoteInFirebase(newNote);
                        } catch (error) {
                            console.error('Error processing image upload:', error);
                        }
                    }
                );
            } catch (error) {
                console.error('Error in image upload:', error);
            }
        } else if (img && isValidUrl(img)) {
            newNote.body[currentEdit].img = img;
            newNote.body[currentEdit].subTitle = newSubTitle;
            newNote.body[currentEdit].subBody = '';
            newNote.body[currentEdit].subBody2 = newSubBody2;
            // Note: Move the updateDoc here for the case when there is no image
            await updateNoteInFirebase(newNote);

        }
        else if (!img) {
            // image not included
            newNote.body[currentEdit].img = '';
            newNote.body[currentEdit].subTitle = newSubTitle;
            newNote.body[currentEdit].subBody = newSubBody;
            newNote.body[currentEdit].subBody2 = newSubBody2;
            // Note: Move the updateDoc here for the case when there is no image
            await updateNoteInFirebase(newNote);
        }

        refresh();
    };


    // Function to update the note in Firebase
    const updateNoteInFirebase = async (updatedNote) => {
        try {
            updatedNote.lastModified = Date.now();
            await updateDoc(doc(db, 'React', updatedNote.id), updatedNote);
            onUpdateNote(updatedNote);
        } catch (error) {
            console.error('Error updating note in Firebase:', error);
        }
    };

    const createANew = () => {
        if (userValified) {
            setCurrentEdit(-10);

        } else {
            setPopupSeen(true);
        }
    }




    return (
        <div className='app-main'>

            {popupSeen
                ? <PopupAuth
                    setPopupSeen={setPopupSeen}
                    popupSeen={popupSeen}
                    userValified={userValified}
                    setUserValified={setUserValified}
                />
                : null}

            {/* title */}
            <div>
                {currentNote
                    ?
                    <div className="app-main-note-preview">
                        <h1 className='preview-title'>
                            {currentNote.title}
                        </h1>
                    </div>
                    : 'no note selected'}
            </div>

            <div className='app-main-body'>

                {/* content */}
                <div>
                    {currentNote && Array.isArray(currentNote.body)
                        ? currentNote.body.map((content, key) => (

                            (currentEdit !== key)
                                // preview mode ---------------------------------------------------------------------
                                ? (currentEdit === -10)
                                    ? <div key={key}></div>
                                    : <div
                                        key={key}
                                        className="app-main-note-preview" >

                                        {/* subtitle */}
                                        <div className='create-newButton-container'>
                                            <ReactMarkdown className='markdown-preview-title'>
                                                {content.subTitle}
                                            </ReactMarkdown>

                                            {/* edit button */}
                                            <button className='edit-btn' onClick={() => initEdit(key)}>Edit</button>
                                        </div>

                                        <div className='markdown-preview-body'>
                                            {/* image or subBody */}
                                            {(currentNote.body[key].img !== '')

                                                //  img
                                                ? <img src={currentNote.body[key].img}
                                                    className='displayImg' alt='' />

                                                // subBody
                                                // : <textarea
                                                //     className='textArea-body'
                                                //     id={`body-subBody-${key}`}
                                                //     value={content.subBody}
                                                //     disabled />
                                                // :<pre className='textArea-body-code'>
                                                //     <code className='language-javascript'>{content.subBody}</code>
                                                // </pre>
                                                : <div className='textArea-body-code'>
                                                    <div className='copy-btn-container'>
                                                        <button className='copyBtn'>
                                                            <span className='copyIcon'><FaCopy /></span>Copy
                                                        </button>
                                                    </div>

                                                    <SyntaxHighlighter
                                                        language='js'
                                                        style={darcula}
                                                        customStyle={{
                                                            height: '100%',
                                                            lineHeight: "1.5",
                                                            fontSize: "0.8em"
                                                        }}
                                                        wrapLongLines={true}
                                                    >
                                                        {content.subBody}
                                                    </SyntaxHighlighter>
                                                </div>
                                            }

                                            {/* subBody2 */}
                                            <ReactMarkdown className='markdown-preview-body2'>
                                                {content.subBody2}
                                            </ReactMarkdown>
                                        </div>
                                    </div>

                                // Edit mode --------------------------------------------------------------
                                : <div className='app-main-note-edit' key={key}>

                                    {/* subTitle */}
                                    <textarea
                                        className='textArea-title'
                                        id={`body-subTitle-${key}`}
                                        placeholder="Write your note here..."
                                        onChange={(e) => setNewSubTitle(e.target.value)}
                                        value={newSubTitle}
                                    />

                                    <div className='textArea-body-container-editMode'>
                                        {/* if image, button is [+Message], otherwise [+Image] */}
                                        {(content.img)

                                            // [+Message]
                                            ? img
                                                ? <label htmlFor="file"
                                                    onClick={() => { setImg(null) }
                                                    }>[+Message]</label>
                                                : <div>
                                                    <input type="file" style={{ display: 'none' }} id='file'
                                                        onChange={e => setImg(e.target.files[0])}>
                                                    </input>
                                                    <label htmlFor="file">[+Image]
                                                    </label>
                                                </div>

                                            //[+Image]
                                            : img
                                                ? <label htmlFor="file"
                                                    onClick={() => { setImg(null) }
                                                    }>[+Message]</label>
                                                : <div>
                                                    <input type="file" style={{ display: 'none' }} id='file'
                                                        onChange={e => setImg(e.target.files[0])}>
                                                    </input>
                                                    <label htmlFor="file">[+Image]
                                                    </label>
                                                </div>
                                        }


                                        {/* if image, enable textBody 1, otherwise disable it */}
                                        {(content.img)
                                            ? img
                                                ? <textarea
                                                    className='textArea-body'
                                                    id={`body-subBody-${key}`}
                                                    disabled />
                                                : <textarea
                                                    className='textArea-body'
                                                    id={`body-subBody-${key}`}
                                                    placeholder="Write your note here..."
                                                    onChange={(e) => setNewSubBody(e.target.value)}
                                                    value={newSubBody}
                                                />

                                            : img
                                                ? <textarea
                                                    className='textArea-body'
                                                    id={`body-subBody-${key}`}
                                                    disabled />
                                                : <textarea
                                                    className='textArea-body'
                                                    id={`body-subBody-${key}`}
                                                    placeholder="Write your note here..."
                                                    onChange={(e) => setNewSubBody(e.target.value)}
                                                    value={newSubBody}
                                                />
                                        }

                                        {/* textBody2 */}
                                        <textarea
                                            className='textArea-body'
                                            id={`body-subBody-${key}`}
                                            placeholder="Write your note here..."
                                            onChange={(e) => setNewSubBody2(e.target.value)}
                                            value={newSubBody2}
                                        />
                                    </div>

                                    <div className='finaliseEdit-container'>
                                        <button onClick={() => {
                                            setCurrentEdit(key);
                                            editEnd();
                                        }}>Save the edit</button>

                                        <button className='create-discard' onClick={() => {
                                            refresh();
                                        }}>Discard</button>
                                    </div>
                                </div>
                        ))
                        : 'no note selected'
                    }
                </div>


                {/* show [create a new button] if not editing */}
                {(currentEdit === -1) &&
                    <div className='app-main-note-newbtn-container'>
                        <button onClick={createANew} className='app-main-note-newbtn'
                        >[ + Create a new]</button>
                    </div>
                }

                {/* creating -------------------------------------------------------------------------------------*/}
                {(currentEdit === -10) &&
                    <div className='app-main-note-edit' >
                        {/* new title */}
                        <textarea
                            className='textArea-title'
                            placeholder="Title"
                            value={newSubTitle}
                            onChange={(e) => setNewSubTitle(e.target.value)}
                        />

                        <div className='textArea-body-container-createNewMode'>

                            {/* if image, button is [+Message], otherwise [+Image] */}
                            {img
                                // [+Message]
                                ? <label htmlFor="file" onClick={() => setImg(null)}>
                                    [+Message]
                                </label>

                                //[+Image]
                                : <div>
                                    <input type="file" style={{ display: 'none' }} id='file'
                                        onChange={e => {
                                            setImg(e.target.files[0])
                                        }}>
                                    </input>
                                    <label htmlFor="file">[+Image]
                                    </label>
                                </div>
                            }

                            {/* new subBody1, ebabled/ disabled */}
                            {img
                                ? <textarea
                                    className='textArea-body'
                                    id={`body-subBody`}
                                    disabled />

                                : <textarea
                                    className='textArea-body'
                                    id={`body-subBody`}
                                    placeholder="Write your note here...1"
                                    value={newSubBody}
                                    onChange={(e) => setNewSubBody(e.target.value)}
                                />
                            }

                            {/* new subBody2 */}
                            <textarea
                                className='textArea-body'
                                // id={`body-subBody-${key}`}
                                placeholder="Write your note here...2"
                                value={newSubBody2}
                                onChange={(e) => setNewSubBody2(e.target.value)}
                            />
                        </div>

                        <div className='create-newButton-container'>
                            <button onClick={() => addNote()} >Save the edit</button>
                            <button onClick={() => refresh()}
                                className='create-discard'>Discard</button>

                        </div>
                    </div>}
            </div>
        </div>
    );
}

export default Main;
