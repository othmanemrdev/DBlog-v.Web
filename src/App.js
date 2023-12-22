import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./Pages/Home";
import CreateArticle from "./Pages/CreateArticle";
import Login from "./Pages/Login"
import EditArticle from './Pages/EditArticle';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';

function App() {
  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth"));

  const signUserOut = () => {
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?");
    if (isConfirmed) {
    signOut(auth).then(() => {
      localStorage.clear();
      setIsAuth(false);
      window.location.pathname = "/login";
    });
  }
  };

  window.addEventListener('scroll', function () {
    const nav = document.querySelector('nav');
    if (window.scrollY > 0) {
      nav.classList.add('fixed-nav');
    } else {
      nav.classList.remove('fixed-nav');
    }
  });

  return (
    <Router>
      <nav>
        <Link to="/"> Home </Link>
        {isAuth && <Link to="/createarticle">Ajouter Article</Link>}
        {!isAuth ? (
          <Link to="/login">Login</Link>
        ) : (
          <button onClick={signUserOut}>Log Out</button>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Home isAuth={isAuth} />} />
        <Route path="/createarticle" element={<CreateArticle isAuth={isAuth} />} />
        <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
        <Route path="/editarticle/:articleId" element={<EditArticle isAuth={isAuth} />} />
      </Routes>
    </Router>
  );
}

export default App;
  
