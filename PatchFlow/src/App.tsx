import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Issues from "./pages/Issues";
import Projects from "./pages/Projects";
import Board from "./pages/Board";
import Githubpage from "./pages/Github";
import GithubCallback from "./pages/GithubCallback";
import Calander from "./pages/Calander";
import Teams from "./pages/Teams";

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/issues" /> : <Login />}/>
      <Route path="/board" element={ user ? <Board /> : <Navigate to="/" />}/>
      <Route path="/issues" element={user ? <Issues /> : <Navigate to="/" />}/>
      <Route path="/projects" element={ user ? <Projects /> : <Navigate to="/" />}/>
      <Route path="/calander" element={ user ? <Calander /> : <Navigate to="/" />}/>
      <Route path="/teams" element={ user ? <Teams /> : <Navigate to="/" />}/>
      <Route path="/github" element={ user ? <Githubpage /> : <Navigate to="/" />}/>
      <Route path="/github/callback" element={<GithubCallback />} />
    </Routes>
  );
}

export default App;