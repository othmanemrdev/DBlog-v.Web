/* global renderMedia limitedMedia */
import React, { useEffect, useState } from 'react';
import { getDocs, collection, doc, addDoc, deleteDoc, query } from 'firebase/firestore';
import { db, auth } from "../firebaseConfig";
import { Link } from 'react-router-dom';

const renderMedia = (mediaLink, index) => {
  const isImage = /\.(jpeg|jpg|png|gif|bmp|svg|webp)/i.test(mediaLink);
  const isVideo = /\.(mp4|webm|ogg|avi|mov|wmv)/i.test(mediaLink);
  const isAudio = /\.(mp3|wav|flac|aac|ogg)/i.test(mediaLink);
  const isPDF = /\.(pdf)/i.test(mediaLink);
  const isDocument = /\.(doc|docx|ppt|pptx|xls|xlsx|odt|odp|ods)/i.test(mediaLink);
  const isArchive = /\.(zip|rar|7z|tar|gz)/i.test(mediaLink);
  const isText = /\.(txt|rtf|csv|xml|json)/i.test(mediaLink);

  return (
    <div key={index}>
      {isImage ? (
        <img src={mediaLink} alt="Image" />
      ) : isVideo ? (
        <video controls>
          <source src={mediaLink} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : isAudio ? (
        <audio controls>
          <source src={mediaLink} type="audio/mpeg" />
          Your browser does not support the audio tag.
        </audio>
      ) : isPDF ? (
        <>
          <embed src={mediaLink} type="application/pdf" width="100%" height="500" />
          <a className='lkk' href={mediaLink} target="_blank" rel="noopener noreferrer">
            View PDF
          </a>
        </>
      ) : isDocument ? (
        <a className='lkk' href={mediaLink} target="_blank" rel="noopener noreferrer">
          View Document
        </a>
      ) : isArchive ? (
        <a className='lkk' href={mediaLink} target="_blank" rel="noopener noreferrer">
          Download Archive
        </a>
      ) : isText ? (
        <a className='lkk' href={mediaLink} target="_blank" rel="noopener noreferrer" >
          View Text
        </a>
      ) : (
        <a href={mediaLink} target="_blank" rel="noopener noreferrer">
          {mediaLink}
        </a>
      )}
    </div>
  );
};


const limitedMedia = (mediaArray) => {
  if (mediaArray && mediaArray.length > 0) {
    return mediaArray.slice(0, 2);
  }
  return [];
};

function Home({ isAuth }) {
  
  const [postLists, setPostList] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [expandedText, setExpandedText] = useState({});
const [expandedMedia, setExpandedMedia] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [postsWithComments, setPostsWithComments] = useState([]);



  
  const filteredPosts = postsWithComments.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedCategory || post.category === selectedCategory)
  );

  const postsCollectionRef = collection(db, "articles");

  useEffect(() => {
    const getPosts = async () => {
      try {
        const data = await getDocs(postsCollectionRef);
        const posts = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

        const updatedComments = {};

        const postsWithComments = await Promise.all(
          posts.map(async (post) => {
            const commentsQuery = query(collection(db, `articles/${post.id}/comments`));
            const commentsSnapshot = await getDocs(commentsQuery);
            const postComments = commentsSnapshot.docs.map((commentDoc) => ({
              ...commentDoc.data(),
              id: commentDoc.id,
            }));

            updatedComments[post.id] = postComments;

            return { ...post, comments: postComments };
          })
        );

        setPostsWithComments(postsWithComments);
        setPostList(filteredPosts);
        setComments(updatedComments);
      } catch (error) {
        console.error("Erreur lors de la récupération des articles : ", error);
      }
    };

    getPosts();
  }, [searchTerm, selectedCategory, postsCollectionRef, filteredPosts]);


  const deletePost = async (id) => {
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?");
    if (isConfirmed) {
    const postDoc = doc(db, "articles", id);
    await deleteDoc(postDoc);
    window.location.reload();
  }
  };

  const addComment = async (postId) => {
    if (newComment.trim() === '' || userNickname.trim() === '') {
      return;
    }

    const post = postLists.find((post) => post.id === postId);

    if (post.enableComments) {
      const commentData = {
        author: userNickname,
        text: newComment,
      };

      try {
        const commentRef = await addDoc(collection(db, `articles/${postId}/comments`), commentData);
        const addedCommentId = commentRef.id;

        setComments((prevComments) => ({
          ...prevComments,
          [postId]: [...(prevComments[postId] || []), { ...commentData, id: addedCommentId }],
        }));

        setNewComment('');
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du commentaire : ", error);
      }
    }
  };

  const deleteComment = async (postId, commentId) => {
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?");
    if (isConfirmed) {
    try {
      if (!postId || !commentId) {
        console.error("postId or commentId is empty or undefined.");
        return;
      }

      const commentsRef = collection(db, 'articles', postId, 'comments');
      await deleteDoc(doc(commentsRef, commentId));

      setComments((prevComments) => ({
        ...prevComments,
        [postId]: prevComments[postId].filter((comment) => comment.id !== commentId),
      }));

      console.log("Comment deleted successfully.");
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire : ", error);
       }
    }
  };

  const togglePostExpansion = (postId, type) => {
    if (type === 'text') {
      setExpandedText((prevExpandedText) => ({
        ...prevExpandedText,
        [postId]: !prevExpandedText[postId],
      }));
    } else if (type === 'media') {
      setExpandedMedia((prevExpandedMedia) => ({
        ...prevExpandedMedia,
        [postId]: !prevExpandedMedia[postId],
      }));
    }
  };
  


  function formatDate(timestamp) {
    const dateObject = timestamp.toDate(); // Convertir Timestamp en objet Date
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Intl.DateTimeFormat('fr-FR', options).format(dateObject);
  }

  const calculateTotalLength = (post) => {
    const textLength = post.postText.length;

    const mediaLength = post.media.reduce((total, mediaLink) => {
      let mediaWeight = 1; 

      if (/\.(jpeg|jpg|png|gif|bmp|svg|webp)/i.test(mediaLink)) {
        mediaWeight = 1;
      } else if (/\.(mp4|webm|ogg|avi|mov|wmv)/i.test(mediaLink)) {
        mediaWeight = 3; // Ajustez le poids en fonction de votre préférence
      } else if (/\.(mp3|wav|flac|aac|ogg)/i.test(mediaLink)) {
        mediaWeight = 2; // Ajustez le poids en fonction de votre préférence
      } else if (/\.(pdf)/i.test(mediaLink)) {
        mediaWeight = 4; // Ajustez le poids en fonction de votre préférence
      } else if (/\.(doc|docx|ppt|pptx|xls|xlsx|odt|odp|ods)/i.test(mediaLink)) {
        mediaWeight = 4; // Ajustez le poids en fonction de votre préférence
      } else if (/\.(zip|rar|7z|tar|gz)/i.test(mediaLink)) {
        mediaWeight = 5; // Ajustez le poids en fonction de votre préférence
      } else if (/\.(txt|rtf|csv|xml|json)/i.test(mediaLink)) {
        mediaWeight = 2; // Ajustez le poids en fonction de votre préférence
      }

      return total + mediaWeight;
    }, 0);

    return textLength + mediaLength;
  };

  return (
    <div className="homePage">
  <h1 className='WLCM'>WELCOME TO D BLOG </h1>
      <div className="categoryButtons">
  <button onClick={() => setSelectedCategory('science')}>Science</button>
  <button onClick={() => setSelectedCategory('technology')}>Technologie</button>
  <button onClick={() => setSelectedCategory('sante')}>Santé</button>
  <button onClick={() => setSelectedCategory('education')}>Éducation</button>
  <button onClick={() => setSelectedCategory('divertissement')}>Divertissement</button>
  <button onClick={() => setSelectedCategory('sport')}>Sport</button>
  <button onClick={() => setSelectedCategory('mode')}>Mode</button>
  <button onClick={() => setSelectedCategory('voyage')}>Voyage</button>
  <button onClick={() => setSelectedCategory('cuisine')}>Cuisine</button>
  <button onClick={() => setSelectedCategory('musique')}>Musique</button>
  <button onClick={() => setSelectedCategory('gaming')}>Gaming</button>
</div>

      <input className="kallab"
  type="text"
  placeholder="Rechercher des articles"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

      {filteredPosts.map((post) => (
        <div className="post" key={post.id}>
          <div className="postHeader">
            <div className="title">
              <h1>{post.title}</h1>
              <p>{formatDate(post.createdAt)}</p> 
        {post.updatedAt && <p>(edited: {formatDate(post.updatedAt)})</p>}
            </div>
            <div className="actions2">
              {isAuth && post.authorid === auth.currentUser.uid && (
                <>
                  <button className='deletebtn' onClick={() => deletePost(post.id)}>X</button>
                  <button className='editbtn'>
                    <Link className='editbtn' to={`/editarticle/${post.id}`}>Modifier</Link>
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="postTextContainer">
          {calculateTotalLength(post) > 1000 ? (
  <div>
    {expandedText[post.id] ? (
      <div>
        {post.postText}
        <button
          onClick={() => togglePostExpansion(post.id, 'text')}
          className="show-less-button"
        >
          Show Less
        </button>
      </div>
    ) : (
      <div>
        {`${post.postText.substring(0, 600)}...`}
        <button
          onClick={() => togglePostExpansion(post.id, 'text')}
          className="show-more-button"
        >
          Show More
        </button>
      </div>
    )}
  </div>
) : (
  <div>{post.postText}</div>
)}

          </div>
          {post.media.length > 1 ? (
  <div>
    {calculateTotalLength(post) > 1000 ? (
      <div>
        {expandedMedia[post.id] ? (
          <div>
            {post.media.map((mediaLink, index) => (
              <div key={index}>
                {renderMedia(mediaLink, index)}
              </div>
            ))}
            <button
              onClick={() => togglePostExpansion(post.id, 'media')}
              className="show-less-button"
            >
              Show Less
            </button>
          </div>
        ) : (
          <div>
            {limitedMedia(post.media).map((mediaLink, index) => (
              <div key={index}>
                {renderMedia(mediaLink, index)}
              </div>
            ))}
            <button
              onClick={() => togglePostExpansion(post.id, 'media')}
              className="show-more-button"
            >
              Show More
            </button>
          </div>
        )}
      </div>
    ) : (
      <div>
        {post.media.map((mediaLink, index) => (
          <div key={index}>
            {renderMedia(mediaLink, index)}
          </div>
        ))}
      </div>
    )}
  </div>
) : (
  <div>
    {post.media.map((mediaLink, index) => (
      <div key={index}>
        {renderMedia(mediaLink, index)}
      </div>
    ))}
  </div>
)}


          {comments[post.id] && (
            <div className="comments">
              {comments[post.id].map((comment) => (
                <div key={comment.id} className="comment">
                  <strong>{comment.author}:</strong> {comment.text}
                  {isAuth && post.authorid === auth.currentUser.uid && (
                    <div className='delete-comment2'>
                      <button onClick={() => deleteComment(post.id, comment.id)}>
                        X
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {(isAuth || !isAuth) && (
            <div className="add-comment">
              <input
                type="text"
                placeholder="Votre pseudonyme"
                value={userNickname}
                onChange={(e) => setUserNickname(e.target.value)}
              />
              <input
                type="text"
                placeholder="Votre commentaire"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button onClick={() => addComment(post.id)}>Ajouter un commentaire</button>
            </div>
          )}
          <h3>@ {post.author}</h3>
        </div>
      ))}
    </div>
  );
}

export default Home;
