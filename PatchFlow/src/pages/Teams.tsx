import { useState, useEffect } from "react";
import Sidebar from "./Sidebar.tsx";
import { auth, db } from "../firebase";
import { doc, updateDoc, collection, query, where, onSnapshot,} from "firebase/firestore";

import "./Issues.css";
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

function Teams() {
  const [projects, setProjects] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showProjectSidebar, setShowProjectSidebar] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [showIssueSidebar, setShowIssueSidebar] = useState(false);
  const [showStatus, setShowStatus] = useState(false);


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

  useEffect(() => {
    if (!auth.currentUser?.email) return;
    const q = query(
      collection(db, "projects"),
      where(
        "members",
        "array-contains",
        auth.currentUser.email
      )
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(data);
    });
    return unsubscribe;
  }, []);


  useEffect(() => {
    if (projects.length === 0) {
        setIssues([]);
        return;
    }
    const unsubscribeList: any[] = [];

    projects.forEach((project) => {
        const q = query(
        collection(db, "issues"),
        where("projectId", "==", project.id)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
        setIssues((prev) => {
            const otherIssues = prev.filter(
            (issue) =>
                issue.projectId !== project.id
            );

            const newIssues = snapshot.docs.map(
            (doc) => ({
                id: doc.id,
                ...doc.data(),
            })
            );
            return [...otherIssues, ...newIssues];
        });
        });
        unsubscribeList.push(unsubscribe);
    });

    return () =>
        unsubscribeList.forEach((u) => u());
    }, [projects]);


    const updateIssueStatus = async (
        issueId: string,
        status: string
        ) => {
        try {
            await updateDoc(
            doc(db, "issues", issueId),
            {
                status,
            }
            );

            setSelectedIssue({
            ...selectedIssue,
            status,
            });
        } catch (error) {
            console.error(error);
        }
    };



  return (
    <>
      <div className="layout">
        <Sidebar />

        <main className="content">
            <div className="greydiv">
                <h2>My Assigned Projects</h2>
            </div>
            <br />

            <div className="projects-table">
                {projects.length === 0 ? (
                    <div className="empty-state">
                    No shared Projects assigned to you.
                    </div>
                ) : (
                <div className="projects-header">
                    <span>Title</span>
                    <span>Status</span>
                    <span>Priority</span>
                    <span>Project</span>
                </div>
                )}

                {projects.map((project) => {
                    const projectIssues = issues.filter(
                    issue => issue.projectId === project.id
                    );

                    return (
                    <div key={project.id} className="project-row" onClick={() => {
                        setSelectedProject(project);
                        setShowProjectSidebar(true);
                    }}>
                        <div className="project-name-cell">
                        {project.projectName}
                        </div>

                        <div>
                        <img src={projectHealthIcons[ project.healthStatus || "On Track" ]} className="health-icon"/>
                        </div>

                        <div>
                        <img src={priorityIcons[project.priority]} className="priority-icon"/>
                        </div>

                        <div>{projectIssues.length}</div>

                        <div className="status-cell">
                        <img src={statusIcons[project.status]} className="status-dropdown-icon"/>
                        {project.status}
                        </div>
                    </div>
                    );
                })}{showProjectSidebar && selectedProject && (
                    <>
                        <div className="details-overlay" onClick={() => setShowProjectSidebar(false)}/>

                        <aside className="issue-details-sidebar">
                            <div className="details-header">
                                <div className="issue-title-edit">
                                    {selectedProject.projectName}
                                </div>

                                <span className="close-details" onClick={() => setShowProjectSidebar(false)}>✕</span>
                            </div>

                            <div className="details-section">
                                <h4>Summary</h4>
                                <p>{selectedProject.summary}</p>
                            </div>

                            <div className="details-section">
                                <h4>Description</h4>
                                <p>{selectedProject.description}</p>
                            </div>

                            <div className="details-section">
                                <h4>Latest Update</h4>
                                <p>{selectedProject.latestUpdate}</p>
                            </div>

                            <div className="details-section">
                                <h4>Members</h4>
                                {selectedProject.members?.map((email: string) => ( <p key={email}>{email}</p> ))}
                            </div>
                        </aside>
                    </>
                    )}
            </div>
            
            <div className="issues-table">
                {issues.length === 0 ? (
                    <div className="empty-state">
                    No shared Issues assigned to you.
                    </div>
                ) : (
                <div className="projects-header">
                    <span>Title</span>
                    <span>Status</span>
                    <span>Priority</span>
                    <span>Project</span>
                </div>
                )}
                    
                {issues.map((issue) => (
                    <div key={issue.id} className="project-row"
                        onClick={() => {
                            setSelectedIssue(issue);
                            setShowIssueSidebar(true);
                        }}>
                        <div>{issue.title}</div>

                        <div>
                            <img src={statusIcons[issue.status]} className="status-dropdown-icon" />
                        </div>

                        <div>
                            <img src={priorityIcons[issue.priority]} className="priority-icon" />
                        </div>

                        <div>
                            { projects.find( p => p.id === issue.projectId )?.projectName }
                        </div>
                    </div>
                ))}{showIssueSidebar && selectedIssue && (
                    <>
                        <div className="details-overlay" onClick={() => setShowIssueSidebar(false)}/>

                        <aside className="issue-details-sidebar">
                        <div className="details-header">
                            <div className="issue-title-edit">
                                {selectedIssue.title}
                            </div>
                            <span className="close-details" onClick={() => setShowIssueSidebar(false)}>✕</span>
                        </div>

                        <div className="details-section">
                            <h4>Description</h4>
                            <p> {selectedIssue.description || "No description"} </p>
                        </div>

                        <div className="details-section">
                            <h4>Status</h4>

                            <div className="dropdown">
                            <button className="option-btn" onClick={() => setShowStatus(!showStatus)}>
                                <img src={ statusIcons[ selectedIssue.status ]} className="status-dropdown-icon-main" />
                                {selectedIssue.status}
                            </button>

                            {showStatus && (
                                <div className="dropdown-menu">
                                {[ "Todo", "In Progress", "Code Review", "Backlog",].map((item) => (
                                    <div key={item} className="dropdown-item status-item"
                                        onClick={() => {updateIssueStatus(selectedIssue.id,item); setShowStatus(false);}}>
                                        <img src={statusIcons[item]} className="status-dropdown-icon-sub"/> {item}
                                    </div>
                                ))}
                                </div>
                            )}
                            </div>
                        </div>

                        <div className="details-section">
                            <h4>Priority</h4>
                            <p><img src={priorityIcons[selectedIssue.priority]} style={{marginBottom:'-6px'}} className="priority-icon"/> {selectedIssue.priority}</p>
                        </div>

                        <div className="details-section">
                            <h4>Project</h4>
                            <p>
                                {projects.find(p => p.id === selectedIssue.projectId )?.projectName}
                            </p>
                        </div>

                        <div className="details-section">
                            <h4>Created By</h4>
                            <p>{selectedIssue.userName}</p>
                        </div>

                        <div className="details-section">
                            <h4>Email</h4>
                            <p>{selectedIssue.userEmail}</p>
                        </div>

                        <div className="details-section">
                            <h4>Created On</h4>
                            <p>
                                {selectedIssue.createdAt?.toDate ? selectedIssue.createdAt.toDate().toLocaleDateString() : "Unknown"}
                            </p>
                        </div>

                        <div className="details-section">
                            <h4>Due Date</h4>

                            <p>{selectedIssue.dueDate || "No due date"}</p>
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

export default Teams;