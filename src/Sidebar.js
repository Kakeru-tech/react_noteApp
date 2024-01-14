import { useState } from 'react';
import PopupAuth from './PopupAuth';


const Sidebar = ({ notes, onAddNote, onDeleteNote, setCurrentNote, currentNote, refresh, userValified, setUserValified }) => {

  const sortedNotes = notes.sort((a, b) => b.lastModified - a.lastModified);

  const [createNewBool, setCreateNewBool] = useState(false);
  const [nameStr, setNameStr] = useState('');
  const [popupSeen, setPopupSeen] = useState(false);



  const onEditNoteName = (e) => {
    setNameStr(e);
  }

  const createNew = () => {
    if (userValified) {
      setCreateNewBool(true)
    } else {
      setPopupSeen(true);
    }
  }

  const deleteNote = (id) => {
    if (userValified) {
      onDeleteNote(id);
    } else {
      setPopupSeen(true);
    }
  }



  return (
    <div className='app-sidebar'>
      <div className='app-sidebar-header'>
        <h1>Kakeru's Note</h1>
        {!createNewBool && (
          <button onClick={createNew}>Add</button>
        )}
      </div>

      <div className="app-sidebar-notes">

        {popupSeen
          ? <PopupAuth
            setPopupSeen={setPopupSeen}
            popupSeen={popupSeen}
            userValified={userValified}
            setUserValified={setUserValified}
            createNewBool={createNewBool}
          />
          : null}


        {/* create a new note field */}
        {createNewBool &&
          (
            <div className='createNewNoteCard'>
              <div className={`app-sidebar-note`}>

                <div className="sidebar-note-title">

                  <textarea className='newFileName'
                    onChange={(e) => onEditNoteName(e.target.value)}
                    value={nameStr}
                  >
                  </textarea>

                  {/* add new button */}
                  <button
                    onClick={() => {
                      if (nameStr !== '') {
                        onAddNote(nameStr);
                        setCreateNewBool(false);
                        setNameStr('');
                      }
                    }}
                  >Add new</button>

                  {/* discard */}
                  <button onClick={() =>
                    setCreateNewBool(false)
                  }>Discard</button>

                </div>
              </div>
            </div>
          )}



        {/* existing notes */}
        {sortedNotes.map((obj, key) => (
          <div
            key={key}
            className={`app-sidebar-note ${obj.id === currentNote && "active"}`}
            onClick={() => {
              setCurrentNote(obj.id);
              setCreateNewBool(false);
              refresh();
            }}
          >
            <div className="sidebar-note-title">
              <strong>{obj.title}</strong>
              {/* <button onClick={() => deleteNote(obj.id)}>Delete</button> */}
            </div>

            <small className="note-meta">
              Last Modified:
              {new Date(obj.lastModified).toLocaleDateString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}

            </small>
          </div>
        ))}
      </div>


    </div>
  );
}

export default Sidebar;
