import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import "../App.css";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function EditArticle({ isAuth }) {
  const { articleId } = useParams();
  const [article, setArticle] = useState({ media: [], category: '', title: '', postText: '', enableComments: false });
  const [newMediaLink, setNewMediaLink] = useState('');
  let navigate = useNavigate();


  const isArticleOwner = isAuth && auth.currentUser && auth.currentUser.displayName === article.author;

  useEffect(() => {
  const fetchArticle = async () => {
    const articleRef = doc(db, 'articles', articleId);
    const articleSnapshot = await getDoc(articleRef);

    if (articleSnapshot.exists()) {
      const articleData = articleSnapshot.data();
      const mediaLinks = articleData.media || [];

      setArticle({
        ...articleData,
        media: mediaLinks,
      });
    }
  };

  fetchArticle();
}, [articleId]);
  

  const cleanHTMLContent = (htmlContent) => {
    const parser = new DOMParser();
    const parsedContent = parser.parseFromString(htmlContent, 'text/html');
    return parsedContent.body.textContent || "";
  };

  const handleUpdate = async () => {
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir mettre à jour cet article ?");
    if (isConfirmed) {
      const cleanedPostText = cleanHTMLContent(article.postText);
      const updatedMedia = article.media.filter(link => link.trim() !== '');
  
      const articleRef = doc(db, 'articles', articleId);
      await updateDoc(articleRef, {
        title: article.title ?? '', 
        postText: cleanedPostText ?? '', 
        media: updatedMedia,
        updatedAt: new Date(),
      });
  
      navigate('/');
    }
  };
  


  const handleRemoveMedia = (index) => {
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce média ?");
    if (isConfirmed) {
    const updatedMedia = [...article.media];
    updatedMedia.splice(index, 1);
    setArticle((prevArticle) => ({ ...prevArticle, media: updatedMedia }));
  }
  };

  const handleAddMedia = (link) => {
    if (link.trim() !== '') {
      const updatedMedia = [...article.media, link];
      setArticle((prevArticle) => ({ ...prevArticle, media: [...prevArticle.media, link] }));
      setNewMediaLink('');
    }
  };

  const handleDeleteArticle = async () => {
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?");
    if (isConfirmed) {
    const articleRef = doc(db, 'articles', articleId);
    await deleteDoc(articleRef);
    navigate('/');
  }
  };

  const handleToggleComments = async () => {
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir activer/désactiver les commentaires ?");
    if (isConfirmed) {
    const articleRef = doc(db, 'articles', articleId);
    await updateDoc(articleRef, {
      enableComments: !article.enableComments,
    });
    setArticle((prevArticle) => ({
      ...prevArticle,
      enableComments: !prevArticle.enableComments,
    }));
  }
  };

  return (
    <div className="editArticlePage">
      <h1>Modifier l'article</h1>
      <div className="inputGp">
        <label>Titre : </label>
        <input
          value={article.title}
          onChange={(event) =>
            setArticle({ ...article, title: event.target.value })
          }
        />
      </div>
      <div className="inputGp">
  <label>Contenu : </label>
  <ReactQuill
    value={article.postText}
    onChange={(value) => setArticle((prevArticle) => ({ ...prevArticle, postText: value }))}

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

      <div className="mediaLinks">
        {article.media &&
          article.media.map((mediaLink, index) => (
            <div key={index}>
              {/\.(jpeg|jpg|png|gif|bmp|svg|webp)/i.test(mediaLink) ? (
                <img src={mediaLink} alt="Image" />
              ) : /\.(mp4|webm|ogg|avi|mov|wmv)/i.test(mediaLink) ? (
                <video controls>
                  <source src={mediaLink} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : /\.(mp3|wav|flac|aac|ogg)/i.test(mediaLink) ? (
                <audio controls>
                  <source src={mediaLink} type="audio/mpeg" />
                  Your browser does not support the audio tag.
                </audio>
              ) : /\.(pdf)/i.test(mediaLink) ? (
                <>
                  <embed
                    src={mediaLink}
                    type="application/pdf"
                    width="100%"
                    height="500"
                  />
                  <a
                    className="lkk"
                    href={mediaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View PDF
                  </a>
                </>
              ) : /\.(doc|docx|ppt|pptx|xls|xlsx|odt|odp|ods)/i.test(
                  mediaLink
                ) ? (
                <a
                  className="lkk"
                  href={mediaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Document
                </a>
              ) : /\.(zip|rar|7z|tar|gz)/i.test(mediaLink) ? (
                <a
                  className="lkk"
                  href={mediaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Archive
                </a>
              ) : /\.(txt|rtf|csv|xml|json)/i.test(mediaLink) ? (
                <a
                  className="lkk"
                  href={mediaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Text
                </a>
              ) : (
                <a
                  href={mediaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {mediaLink}
                </a>
              )}
              <button
                className="deletebtn"
                onClick={() => handleRemoveMedia(index)}
              >
                X
              </button>
            </div>
          ))}
      </div>

      <div className="inputGp">
  <label>Catégorie : </label>
  <select
    value={article.category}
    onChange={(event) => setArticle((prevArticle) => ({ ...prevArticle, category: event.target.value }))}
  >
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
          value={newMediaLink}
          onChange={(event) => setNewMediaLink(event.target.value)}
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              handleAddMedia(newMediaLink);
            }
          }}
        />
        <button onClick={() => handleAddMedia(newMediaLink)}>Ajouter</button>
      </div>

      {isAuth && (
        <div className="actions">
          <button onClick={handleToggleComments}>
            {article.enableComments
              ? 'Désactiver les commentaires'
              : 'Activer les commentaires'}
          </button>
          <button onClick={handleDeleteArticle}>Supprimer l'article</button>
        </div>
      )}

      <button onClick={handleUpdate}>Mettre à jour</button>
    </div>
  );
}

export default EditArticle;
