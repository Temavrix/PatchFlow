import "./Sidebar.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import Boardb from "./assets/Boardb.png";
import Issuesb from "./assets/Issuesb.png";
import Projectsb from "./assets/Projectsb.png";
import user from "./assets/User.png";
import Github from "./assets/Githubb.png";
import Roadmap from "./assets/Roadmap.png";
import Support from "./assets/Support.png";


function Sidebar() {

  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <nav>
          <ul>
            Workspace ▾
            <li><Link to="/board"><img src={Boardb} className="status-icon-side"/>Board</Link></li>
            <li><Link to="/issues"><img src={Issuesb} className="status-icon-side"/>My Issues</Link></li>
            <li><Link to="/projects"><img src={Projectsb} className="status-icon-side"/>Projects</Link></li>
            <li><Link to="/calander"><img src={Roadmap} className="status-icon-side"/>RoadMap</Link></li>
            <br/>
            My Teams ▾
            <li><Link to="/teams"><img src={user} className="status-icon-side"/>Teams</Link></li>
            <li><Link to="/github"><img src={Github} className="status-icon-side"/>Github</Link></li>
            <br/>
            <li><a href="https://buymeacoffee.com/mahadhevha" target="_blank" rel="noopener noreferrer"><img src={Support} className="status-icon-side"/>Support Us</a></li>
            <li onClick={handleLogout}>Logout</li>
          </ul>
        </nav>
      </aside>

      {isOpen && (
        <div
          className="overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export default Sidebar;