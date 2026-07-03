import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

function GithubCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const code =
      new URLSearchParams(window.location.search)
        .get("code");

    if (!code) return;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          console.log("Waiting for Firebase user...");
          return;
        }

        try {
          const firebaseToken =
            await user.getIdToken();

          const response = await fetch(
            `${window.location.origin}/api/github/exchange`,
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
            const errorText =
              await response.text();

            console.error(errorText);
            return;
          }

          const data =
            await response.json();

          console.log(data);

          localStorage.setItem(
            "githubConnected",
            "true"
          );

          navigate("/github");
        } catch (error) {
          console.error(error);
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  return <h2>Connecting to GitHub...</h2>;
}

export default GithubCallback;