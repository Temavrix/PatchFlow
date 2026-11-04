import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useAlert } from "../components/Alert";

function GithubCallback() {
  const navigate = useNavigate();
  const {showAlert} = useAlert();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (!code) return;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          showAlert(`Please re-login again`,"info");
          return;
        }

        try {
          const firebaseToken = await user.getIdToken();

          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_BASE_URL}/api/github/exchange`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${firebaseToken}`,
              },
              body: JSON.stringify({ code }),
            }
          );

          if (!response.ok) {
            showAlert(`Unable to fetch token please re-login again`,"error");
            return;
          }

          localStorage.setItem("githubConnected", "true");

          navigate("/github");
        } catch (error) {
          showAlert(`Please refresh and re-login again`,"error");
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  return(
    <>
      <section style={{display: 'grid', justifyContent: 'center', alignItems: 'center', height: '100vh', fontWeight: 'bold'}}>
        <h3>Fetching Issues from GitHub... Please hang tight...</h3>
      </section>
    </>
  )
}

export default GithubCallback;