import { useState, useEffect } from "react";
import Sidebar from "./Sidebar.tsx";
import { db, auth } from "../firebase";
import { addDoc, collection, serverTimestamp, onSnapshot, query, orderBy, where, deleteDoc, doc, getDocs, updateDoc, arrayUnion} from "firebase/firestore";
import "./Projects.css";
import OnTrackIcon from "./assets/Ontrack.png";
import AtRiskIcon from "./assets/Atrisk.png";
import OffTrackIcon from "./assets/Offtrack.png";
import TodoIcon from "./assets/pTodo.png";
import InProgressIcon from "./assets/pInProgress.png";
import CodeReviewIcon from "./assets/pCodeReview.png";
import BacklogIcon from "./assets/pBacklog.png";

import Nopriority from "./assets/Nopriority.png";
import Low from "./assets/Low.png";
import Medium from "./assets/Medium.png";
import High from "./assets/High.png";
import Urgent from "./assets/Urgent.png";

function Projects() {
  const [showModal, setShowModal] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showAIDes, setShowAIDes] = useState("");
  const [showTeamBox, setShowTeamBox] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectName, setProjectName] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Backlog");
  const [priority, setPriority] = useState("No Priority");
  const [showStatus, setShowStatus] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showProjectSidebar, setShowProjectSidebar] = useState(false);
  const [issueCount, setIssueCount] = useState(0);
  const [showHealthDropdown, setShowHealthDropdown] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);
  const [memberEmail, setMemberEmail] = useState("");

  const [projectStats, setProjectStats] = useState<
    Record<
      string,
      {
        total: number;
        completed: number;
      }
    >
  >({});

  const createProject = async () => {
    try {
      if (!projectName.trim()) {
        alert("Project name is required");
        return;
      }

      await addDoc(collection(db, "projects"), {
        projectName,
        summary,
        description,
        status,
        priority,
        healthStatus: "On Track",
        latestUpdate: "",
        latestUpdateEditedAt: null,

        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.displayName,
        userEmail: auth.currentUser?.email,

        members: [],  // team members

        createdAt: serverTimestamp()
      });

      setProjectName("");
      setSummary("");
      setDescription("");
      setStatus("Backlog");
      setPriority("No Priority");

      setShowModal(false);
      alert("Project created");
      setProjects((prev) => [{
          id: "temp",
          projectName,
          summary,
          status,
          priority,
        },
        ...prev,
      ]);
    } catch (error) {
      alert("Failed to create project");
    }
  };

  const statusIcons: Record<string, string> = {
    "Todo": TodoIcon,
    "In Progress": InProgressIcon,
    "Code Review": CodeReviewIcon,
    "Backlog": BacklogIcon,
  };

  const projectHealthIcons: Record<string, string> = {
    "On Track": OnTrackIcon,
    "At Risk": AtRiskIcon,
    "Off Track": OffTrackIcon
  };

    const priorityIcons: Record<string, string> = {
    "No Priority": Nopriority,
    "Low": Low,
    "Medium": Medium,
    "High": High,
    "Urgent": Urgent,
  };



  const updateProjectField = async (
    projectId: string,
    field: string,
    value: string
  ) => {
    try {
      await updateDoc(
        doc(db, "projects", projectId),
        {
          [field]: value
        }
      );

      setSelectedProject({
        ...selectedProject,
        [field]: value
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateProjectHealth = async (projectId: string, newStatus: string) => {
    try {
      await updateDoc(
        doc(db, "projects", projectId),
        {healthStatus: newStatus}
      );

      setProjects(prev =>
        prev.map(project =>
          project.id === projectId
            ? { ...project, healthStatus: newStatus }
            : project
        )
      );

      setSelectedProject({
        ...selectedProject,
        healthStatus: newStatus
      });

      setShowHealthDropdown(false);
    } catch (error) {
      console.error(error);
    }
  };


  const deleteProject = async (projectId: string, projectName: string) => {
    const confirmed = window.confirm(`Delete "${projectName}" and all linked issues?`);

    if (!confirmed) return;

    try {
      // Delete linked issues
      const issuesQuery = query(
        collection(db, "issues"),
        where("projectId", "==", projectId)
      );

      const issuesSnapshot = await getDocs(issuesQuery);

      const deletePromises = issuesSnapshot.docs.map((issueDoc) =>
        deleteDoc(doc(db, "issues", issueDoc.id))
      );

      await Promise.all(deletePromises);

      // Delete project
      await deleteDoc(doc(db, "projects", projectId));

      setShowProjectSidebar(false);
      setSelectedProject(null);

      alert("Project and related issues deleted");
      setProjects((prev) =>
        prev.filter((p) => p.id !== projectId)
      );
    } catch (error) {
      console.error(error);
      alert("Failed to delete project");
    }
  };



  const analyzeProject = async (projectId: string) => {
    try {
      const projectIssues = issues.filter(
        (issue: any) => issue.projectId === projectId
      );

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/analyze-project`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project: selectedProject,
            issues: projectIssues,
          }),
        }
      );

      const analysis  = await response.text();

      setShowAIDes(analysis);
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    const q = query(collection(db, "issues"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setIssues(data);

      const stats: any = {};

      data.forEach((issue: any) => {
        if (!issue.projectId) return;

        if (!stats[issue.projectId]) {
          stats[issue.projectId] = {
            total: 0,
            completed: 0,
          };
        }

        stats[issue.projectId].total++;

        if (issue.status === "Code Review") {
          stats[issue.projectId].completed++;
        }
      });

      setProjectStats(stats);
    });

    return unsubscribe;
  }, []);


  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "projects"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProjects(data);
    });
    return unsubscribe;
  }, [auth.currentUser]);



  useEffect(() => {
    if (!selectedProject) return;
    const q = query( collection(db, "issues"), where("projectId", "==", selectedProject.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIssueCount(snapshot.size);
    });

    return unsubscribe;
  }, [selectedProject]);


  const addMemberToProject = async () => {
    try {
      if (!memberEmail.trim()) {
        alert("Enter an email");
        return;
      }

      await updateDoc(
        doc(db, "projects", selectedProject.id),
        {
          members: arrayUnion(memberEmail.trim())
        }
      );

      setSelectedProject({
        ...selectedProject,
        members: [
          ...(selectedProject.members || []),
          memberEmail.trim()
        ]
      });

      setMemberEmail("");
      setShowTeamBox(false);

      alert("Member added");
    } catch (error) {
      console.error(error);
      alert("Failed to add member");
    }
  };



  return (
    <>
      <div className="layout">
        <Sidebar />

        <main className="content">
          <div className="greydiv">
            <h2> My Projects</h2>
            <span className="add-icon" onClick={() => setShowModal(true)}>+</span>
          </div>{showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="project-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>New Project</h3>
            
                  <span className="close-icon" onClick={() => setShowModal(false)}> ✕ </span>
                </div>
            
                <input type="text" placeholder="Project name" className="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)}/>
            
                <input type="text" placeholder="Add a short summary..." className="project-summary" value={summary} onChange={(e) => setSummary(e.target.value)}/>
            
                <div className="project-options">
            
                  {/* Status */}
                  <div className="dropdown">
                    <button className="option-btn" onClick={() => setShowStatus(!showStatus)}>
                      {status}
                    </button>
            
                    {showStatus && (
                      <div className="dropdown-menu">
                        {["Backlog", "Todo", "In Progress", "Code Review", "Completed"].map((item) => (
                          <div key={item} className="dropdown-item"
                            onClick={() => {setStatus(item); setShowStatus(false);}}>
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
                          <div key={item} className="dropdown-item"
                            onClick={() => {setPriority(item); setShowPriority(false);}}>
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                </div>
                  
                <textarea placeholder="Write a description, project brief, or collect ideas..." className="project-description" value={description} onChange={(e) => setDescription(e.target.value)}/>
                  
                <div className="project-footer">
                  <button onClick={createProject} className="create-project-btn">
                    Create Project
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="projects-list">
            <div className="projects-table">

            <div className="projects-header">
              <span>Name</span>
              <span>Health</span>
              <span>Priority</span>
              <span>Issues</span>
              <span>Status</span>
            </div>

            {projects.map((project) => {
              const stats = projectStats[project.id] || {
                total: 0,
                completed: 0
              };

              const percentage =
                stats.total === 0
                  ? 0
                  : Math.round(
                      (stats.completed / stats.total) * 100
                    );

              return (
                <div key={project.id} className="project-row"
                  onClick={() => {setSelectedProject(project); setShowProjectSidebar(true);}}>

                  <div className="project-name-cell">
                    {project.projectName}
                  </div>

                  <div>
                    <img src={ projectHealthIcons[
                          project.healthStatus || "On Track"
                        ]} className="health-icon"/>
                  </div>

                  <div>
                    <img src={priorityIcons[project.priority]} alt={project.priority} className="priority-icon"/>
                  </div>

                  <div> {stats.total} </div>

                  <div className="status-cell">
                    <img src={statusIcons[project.status]} alt="" className="status-dropdown-icon"/>
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>
            {showProjectSidebar && selectedProject && (
                <>
                  <div className="details-overlay" onClick={() => setShowProjectSidebar(false)}/>
                  <aside className="issue-details-sidebar">
                    <div className="details-header">
                      <div className="issue-title-edit">
                        {selectedProject.projectName}
                      </div>
                      <span className="close-details" onClick={() => setShowProjectSidebar(false)}> ✕ </span>
                    </div>

                    <h4>Latest Update</h4>
                    <div className="project-update-box">
                      <div className="health-dropdown">

                        <button className="health-btn" onClick={() => setShowHealthDropdown(!showHealthDropdown)}>
                          <img src={projectHealthIcons[ selectedProject.healthStatus || "On Track"]} alt="selectedProject.healthStatus"/>

                          {selectedProject.healthStatus || "On Track"}
                        </button>

                        {showHealthDropdown && (
                          <div className="dropdown-menu">

                            {["On Track", "At Risk", "Off Track"
                            ].map((item) => (
                              <div key={item} className="dropdown-item status-item" onClick={() => updateProjectHealth(selectedProject.id, item)}>
                                <img src={projectHealthIcons[item]} alt="" className="status-dropdown-icon"/>
                                {item}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <textarea className="project-update-input" placeholder="Write a project update..."
                        value={selectedProject.latestUpdate || ""}
                        onChange={(e) => updateProjectField(selectedProject.id, "latestUpdate", e.target.value)}/>
                    </div>
            
                    <div className="details-section">
                      <h4>Summary</h4>
                      <textarea
                        className="issue-description-edit"
                        value={selectedProject.summary || ""}
                        onChange={(e) =>
                          updateProjectField(
                            selectedProject.id,
                            "summary",
                            e.target.value
                          )
                        }
                      />
                    </div>
            
                    <div className="details-section">
                      <h4>Description</h4>
                      <textarea
                        className="issue-description-edit"
                        value={selectedProject.description || ""}
                        onChange={(e) =>
                          updateProjectField(
                            selectedProject.id,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </div>
            
                    <div className="details-section">
                      <h4>Status</h4>
                      <div className="dropdown">
                        <button className="option-btn" onClick={() => setShowStatus(!showStatus)}> 
                          <img src={statusIcons[selectedProject.status]} alt="" className="status-dropdown-icon-main"/>
                          {selectedProject.status}
                        </button>

                        {showStatus && (
                          <div className="dropdown-menu">
                            {["Todo", "In Progress", "Code Review", "Backlog"].map((item) => (
                              <div key={item} className="dropdown-item status-item"
                                onClick={() => { updateProjectField(selectedProject.id, "status", item);
                                  setShowStatus(false);}}>
                                <img src={statusIcons[item]} alt="" className="status-dropdown-icon-sub"/>
                                {item}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
            
                    <div className="details-section">
                      <h4>Priority</h4>
                      <div className="dropdown">
                        <button className="option-btn" onClick={() => setShowPriority(!showPriority)}>
                          <img src={priorityIcons[selectedProject.priority]} alt={selectedProject.priority} className="priority-icon"/>
                          {selectedProject.priority}
                        </button>

                        {showPriority && (
                          <div className="dropdown-menu">
                            {["No Priority", "Urgent", "High", "Medium", "Low"].map((item) => (
                              <div key={item} className="dropdown-item status-item" onClick={() => { updateProjectField(selectedProject.id, "priority", item); setShowPriority(false); }}>
                                  <img src={priorityIcons[item]} alt={item} className="priority-dropdown-icon"/>
                                {item}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
            
                    <div className="details-section">
                      <h4>Created</h4>
                      <p>
                        {selectedProject.createdAt?.toDate
                          ? selectedProject.createdAt.toDate().toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Unknown"}
                      </p>
                    </div>
                        
                    <div className="details-section">
                      <h4>Issues Linked</h4>
                      <p>{issueCount}</p>
                    </div>

                    <div className="details-section">
                      <h4>Team Members</h4>

                      {selectedProject.members?.length > 0 ? (
                        selectedProject.members.map((email: string) => (
                          <p key={email}>{email}</p>
                        ))
                      ) : (
                        <p>No members added</p>
                      )}
                    </div>
                        
                    <div className="details-footer">
                      <button className="delete-project-btn"
                        onClick={() => deleteProject( selectedProject.id, selectedProject.projectName)}>
                        Delete
                      </button>{' '}
                      <button className="delete-project-btn"
                        onClick={() => {
                          analyzeProject(selectedProject.id);
                          setShowAI(true);
                        }}>
                        AI Analyser
                      </button>{showAI &&(
                        <>
                          <div className="modal-overlay" onClick={() => setShowModal(false)}>
                            <div className="project-modal" onClick={(e) => e.stopPropagation()}>

                              <div className="modal-header">
                                <h3>Project Analyzer</h3>
                          
                                <span className="close-icon" onClick={() => setShowAI(false)}> ✕ </span>
                              </div>
                              <textarea placeholder="Performing project health checks..." className="project-description" value={showAIDes}/>
                              <button className="delete-project-btn" onClick={() => {updateProjectField(selectedProject.id, "latestUpdate", showAIDes); setShowAI(false); setShowAIDes("")}}>Set as Latest Update</button>
                            </div>
                          </div>
                        </>
                      )}{' '}
                      <button className="delete-project-btn"
                        onClick={() => setShowTeamBox(true)}>
                        Add Member
                      </button>{showTeamBox &&(
                        <>
                        <div className="modal-overlay" onClick={() => setShowTeamBox(false)}>
                            <div className="team-modal" onClick={(e) => e.stopPropagation()}>

                              <div className="modal-header">
                                <h3>Add Team Member</h3>
                          
                                <span className="close-icon" onClick={() => setShowTeamBox(false)}> ✕ </span>
                              </div>
                              <textarea
                                placeholder="Enter Team Member's Email"
                                className="project-description"
                                value={memberEmail}
                                onChange={(e) => setMemberEmail(e.target.value)}
                              />
                              <button className="delete-project-btn" onClick={addMemberToProject}>Add Member</button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </aside>
                </>
              )}
          </div>
        </main>
      </div>
    </>
  );
}

export default Projects;