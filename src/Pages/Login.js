import React, { useEffect } from 'react';
import {auth , provider} from '../firebaseConfig';
import {signInWithPopup} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 

function Login({setIsAuth, isAuth}) {
 let navigate = useNavigate();
 const authorizedGoogleUserIDs = ['COSE1Jxlz1aYPJo6IWTmt5rCl5n1', 'h9HXSoDgadgkMAqUVVKQH4mClPf1'];


 const SignInWithGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const userID = result.user.uid;
      if (authorizedGoogleUserIDs.includes(userID)) {
        localStorage.setItem("isAuth", true);
        setIsAuth(true);
        navigate("/");
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Accès non autorisé',
          text: "Vous n'êtes pas autorisé à accéder.",
        });
      }
    });
};

  useEffect(() => {
    if (isAuth){
      navigate("/");
    }
  }, [])

  return (
    <div className='loginPage'>
      <p className='sih'> Sign In  Here</p>
      <button   className='login-with-google-btn' onClick={SignInWithGoogle}> Sign In</button>
    </div>
  ); 
}

export default Login
