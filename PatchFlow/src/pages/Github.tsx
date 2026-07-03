import {useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import {db, auth } from "../firebase";
import {addDoc, collection, serverTimestamp, getDocs, query, where} from "firebase/firestore";
import "./Github.css";

function Githubpage() {
  const [connected, setConnected] = useState(false);
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedGitIssue, setSelectedGitIssue] = useState<any | null>(null);

  const [showStatus, setShowStatus] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [showProject, setShowProject] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);
  const [showRepos, setShowRepos] = useState(false);

  const [status, setStatus] = useState("Todo");
  const [priority, setPriority] = useState("No Priority");
  const [projectId, setProjectId] = useState("");
  const [projectName, setProjectName] = useState("Project");
  const [projects, setProjects] = useState<any[]>([]);

  const connectGithub = async () => {
    try {
      const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

      const redirectUri = `${window.location.origin}/github/callback`;

      window.location.href =
        `https://github.com/login/oauth/authorize` +
        `?client_id=${githubClientId}` +
        `&scope=repo` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    } catch (err) {
      console.error(err);
    }
  };


  const createIssue = async () => {
    try {
      if (!selectedGitIssue?.title?.trim()) {
        alert("Issue title is required");
        return;
      }

      await addDoc(collection(db, "issues"), {
        title: selectedGitIssue.title,
        description: selectedGitIssue.body,
        status,
        priority,
        projectId,
        projectName,

        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.displayName,
        userEmail: auth.currentUser?.email,

        createdAt: serverTimestamp()
      });

      setStatus("Todo");
      setPriority("No Priority");
      setProjectId("");
      setProjectName("Project");

      setSelectedGitIssue(null);

      alert("Issue created");
    } catch (error) {
      console.error(error);
      alert("Failed to create issue");
    }
  };


  useEffect(() => {
    setConnected(
      localStorage.getItem("githubConnected") === "true"
    );
  }, []);

  //Fetch github Repos
  useEffect(() => {
    const fetchRepos = async () => {
      const isConnected =
        localStorage.getItem("githubConnected") === "true";

      setConnected(isConnected);

      if (!isConnected) return;
      if (!auth.currentUser) {
        return;
      }

      try {
        const firebaseToken =
          await auth.currentUser?.getIdToken();

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/api/github/repos`,
          {
            headers: {
              Authorization: `Bearer ${firebaseToken}`
            }
          }
        );

        if (!res.ok) {
          localStorage.removeItem("githubConnected");
          setConnected(false);
          return;
        }

        const data = await res.json();
        if (Array.isArray(data)) {
          setRepos(data);
        } else {
          console.error(data);
          localStorage.removeItem("githubConnected");
          setConnected(false);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchRepos();
  }, []);

  //Fetch github Issues
  useEffect(() => {
    if (!selectedValue) return;

    const fetchIssues = async () => {
      const [owner, repo] = selectedValue.split("/");

      if (!auth.currentUser) {
        return;
      }

      const firebaseToken =
        await auth.currentUser?.getIdToken();

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/github/issues?owner=${owner}&repo=${repo}`,
        {
          headers: {
            Authorization: `Bearer ${firebaseToken}`
          }
        }
      );

      if (!res.ok) {
        localStorage.removeItem("githubConnected");
        setConnected(false);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setIssues(data);
      } else {
        console.error(data);
        setIssues([]);
      }
    };

    fetchIssues();
  }, [selectedValue]);

  //Load projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!auth.currentUser) return;

        const q = query(
          collection(db, "projects"),
          where("userId", "==", auth.currentUser.uid)
        );

        const snapshot = await getDocs(q);

        const projectList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProjects(projectList);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProjects();
  }, []);

  

  return (
    <div className="layout">
      <Sidebar />

      <main className="content">
        {!connected ? (
          <>
            <div className="github-card">
              <h2>GitHub Integration</h2>
              <p>Connect your GitHub account to import repositories and sync issues.</p>
              <button className="github-connect-btn" onClick={connectGithub}>Connect GitHub</button>
            </div>
          </>
        ) : (
          <>
            <div className="github-container">
              <div className="greydiv">
                <h2>Import GitHub Issue</h2>
              </div><br/>

              <div className="repo-selector-card">
                <div className="repo-selector-header">
                  <h3>Repository</h3>
                  <span>Select a GitHub repository</span>
                </div>

                <div className="repo-dropdown">
                  <button
                    className="repo-select"
                    onClick={() => setShowRepos(!showRepos)}
                  >
                    {selectedValue || "Choose repository"}
                  </button>

                  {showRepos && (
                    <div className="repo-menu">
                      {repos.map((repo) => (
                        <div
                          key={repo.id}
                          className="repo-item"
                          onClick={() => {
                            setSelectedValue(repo.full_name);
                            setShowRepos(false);
                          }}
                        >
                          {repo.full_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedValue && (
                  <div className="selected-repo">
                    <span className="repo-label">
                      Issues of {selectedValue}
                    </span>

                    <div className="issues-list">
                      {issues.length === 0 ? (
                        <p>No issues found</p>
                      ) : (
                        issues.filter((issue) => !issue.pull_request).map((issue) => (
                          <div key={issue.id} className="issue-card-github" onClick={() => setSelectedGitIssue({
                              title: issue.title,
                              body: issue.body
                          })}>
                            <strong>{issue.title}</strong>
                            <p>#{issue.number} • {issue.state}</p>
                          </div>
                        ))
                      )}{selectedGitIssue && (
                        <> 
                          <div className="modal-overlay" onClick={() => setSelectedGitIssue(false)}>
                            <div className="modal" onClick={(e) => e.stopPropagation()}>
                              <div className="modal-header">
                                <h3>Import Issue to Workspace</h3>
                                <span className="close-icon" onClick={() => setSelectedGitIssue(false)}> ✕ </span>
                              </div>

                              <input type="text" placeholder="Issue title" className="issue-title" value={selectedGitIssue.title} onChange={(e) => setSelectedGitIssue({ ...selectedGitIssue, title: e.target.value})}/>

                              <div className="issue-options">
                                {/* Status */}
                                <div className="dropdown">
                                  <button className="option-btn" onClick={() => setShowStatus(!showStatus)}>
                                    {status}
                                  </button>
                                  {showStatus && (
                                    <div className="dropdown-menu">
                                      {["Todo", "In Progress", "Code Review", "Backlog"].map((item) => (
                                        <div key={item} className="dropdown-item" onClick={() => {setStatus(item);   setShowStatus(false); }}>                        
                                          {item}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Priority */}
                                <div className="dropdown">
                                  <button className="option-btn" onClick={() => setShowPriority(!showPriority)}>
                                    {priority}
                                  </button>
                                  {showPriority && (
                                    <div className="dropdown-menu">
                                      {["No Priority", "Urgent", "High", "Medium", "Low"].map((item) => (
                                        <div key={item} className="dropdown-item" onClick={() => {setPriority(item); setShowPriority(false); }}>
                                          {item}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Project */}
                                <div className="dropdown">
                                  <button className="option-btn" onClick={() => setShowProject(!showProject)}>
                                    {projectName}
                                  </button>
                                  {showProject && (
                                    <div className="dropdown-menu">
                                      {projects.map((projectItem) => (
                                        <div key={projectItem.id} className="dropdown-item" onClick={() => {setProjectId(projectItem.id); setProjectName(projectItem.projectName); setShowProject(false);}}>
                                          {projectItem.projectName}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <textarea placeholder="Add description..." className="issue-description" value={selectedGitIssue.body} onChange={(e) => setSelectedGitIssue({...selectedGitIssue, body: e.target.value})}/>
                              <button className="create-btn" onClick={createIssue}>
                                Import Issue
                              </button>
                            </div>
                          </div>
                        </>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Githubpage;