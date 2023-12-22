  import React, { useState, useEffect } from 'react';
  import { addDoc, collection } from 'firebase/firestore';
  import { db, auth } from '../firebaseConfig';
  import { useNavigate } from 'react-router-dom';
  import ReactQuill from 'react-quill';
  import 'react-quill/dist/quill.snow.css';

  function CreateArticle({ isAuth }) {
    const [title, setTitle] = useState('');
    const [postText, setPostText] = useState('');
    const [mediaLinks, setMediaLinks] = useState([]);
    const postsCollectionRef = collection(db, 'articles');
    const [enableComments, setEnableComments] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    let navigate = useNavigate();

    const createPost = async () => {

      const isConfirmed = window.confirm("Êtes-vous sûr de vouloir ajouter cet article ?");
      if (isConfirmed) {

        const parser = new DOMParser();
        const parsedContent = parser.parseFromString(postText, 'text/html');
        const plainText = parsedContent.body.textContent || "";


      const newArticle = {
        title,
      postText: plainText,
        author: auth.currentUser.displayName,
        authorid: auth.currentUser.uid,
        media: mediaLinks,
        enableComments: enableComments, 
        category: selectedCategory,
        createdAt: new Date(),
      };

      await addDoc(postsCollectionRef, newArticle);
      navigate('/');
      }
    };

    const addMediaLink = (link) => {
      setMediaLinks([...mediaLinks, link]);
    };

    useEffect(() => {
      if (!isAuth) {
        navigate('/login');
      }
    }, [isAuth, navigate]);

    return (
      <div className="createPostPage">
        <div className="cpContainer">
          <h1>Ajouter Article</h1>
          <div className="inputGp">
            <label>Titre : </label>
            <input onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="inputGp">
    <label>Contenu : </label>
    <ReactQuill
      value={postText}
      onChange={(value) => setPostText(value)}
      modules={{
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link', 'image'],
          ['clean'],
        ],
      }}
    />
  </div>
                <div className="inputGp">
          <label>Catégorie : </label>
          <select onChange={(event) => setSelectedCategory(event.target.value)}>
            <option value="null">Null</option>
            <option value="technology">Technologie</option>
            <option value="science">Science</option>
            <option value="sante">Santé</option>
            <option value="education">Éducation</option>
            <option value="divertissement">Divertissement</option>
            <option value="sport">Sport</option>
            <option value="mode">Mode</option>
            <option value="voyage">Voyage</option>
            <option value="cuisine">Cuisine</option>
            <option value="musique">Musique</option>
            <option value="gaming">Gaming</option>
          </select>
        </div>
          <div className="inputGp">
            <label>Ajouter des médias : </label>
            <input
              type="text"
              placeholder="Collez le lien du média ici"
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  addMediaLink(event.target.value);
                  event.target.value = '';
                }
              }}
            />
          </div>
          <div className="inputGp">
            <label>Activer les commentaires :</label>
            <input
    type="checkbox"
    checked={enableComments}
    onChange={() => setEnableComments(prevState => !prevState)}
  />

          </div>
          <button onClick={createPost}>Ajouter</button>
        </div>
      </div>
    );
  }

  export default CreateArticle;
