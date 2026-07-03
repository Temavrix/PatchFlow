import "./login.css";
import patch from "./assets/patchflow.ico";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

function Login() {
  const navigate = useNavigate();

  const googleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      await setDoc(
        doc(db, "users", result.user.uid),
        {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        },
        { merge: true }
      );
      navigate("/issues");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="card">
      <div>
        <img src={patch} alt="patchflow" width="32" height="32" />
        <h1>Log in to PatchFlow</h1>

        <button className="button" onClick={googleSignIn}>
          Continue with Google
        </button>

        <br />
        <br />

        Don't have an account? <button className="signupbutton" onClick={googleSignIn}>Sign up</button>
      </div>
    </section>
  );
}

export default Login;