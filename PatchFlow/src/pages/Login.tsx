import "./login.css";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../components/Alert";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import patchicon from "./assets/patchicon.png";
import boardshowcase from "./assets/boardshowcase.png";
import roadmapshowcase from "./assets/roadmapshowcase.png"
import analyticsshowcase from "./assets/analyticsshowcase.png";

function Login() {
  const navigate = useNavigate();
  const {showAlert} = useAlert();

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
      showAlert(`Failed to Login please try again`,"error");
    }
  };

  return (
    <>
      <section className="base">
        <div className="hero">
          <h2>The product development system for developers.</h2>
          <p>
            Plan, build and ship better products in one place.
          </p>
        </div>

        <div className="login-card">
          <img src={patchicon} alt="PatchFlow" width="40" height="40" />

          <h1>Welcome to PatchFlow</h1>
          <p className="subtitle">
            Sign in to continue to your workspace.
          </p>

          <button className="button" onClick={googleSignIn}>
            Continue with Google
          </button>

          <p className="signup-text">
            Don't have an account?
            <button className="signupbutton" onClick={googleSignIn}>
              Sign up
            </button>
          </p>
        </div>
      </section>

      <section className="secone">
        <div className="heroone">
          <h2>Purpose-built for planning and building products.</h2>
          <p>Coordinate larger pieces of work and move seamlessly between ideation and execution.</p>
        </div>
        <div className="product-visual">
          <img src={boardshowcase} alt="PatchFlow Dashboard" className="product-image"/>
        </div>
      </section>

      <section className="thirone">
        <div className="third-heading">
          <h2>Planning and monitoring</h2>
          <p>
            Plan and navigate from idea to launch. Align your priorities
            with product updates, strategic roadmaps and deadlines.
          </p>
        </div>

        <div className="roadmap-visual">
          <img
            src={roadmapshowcase}
            alt="PatchFlow Roadmap"
            className="roadmap-image"
          />

          <div className="analytics-visual">
            <img
              src={analyticsshowcase}
              alt="PatchFlow Analytics"
              className="analytics-image"
            />
          </div>
        </div>
      </section>
    </>
  );
}

export default Login;