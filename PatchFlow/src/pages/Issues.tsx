import { useState, useEffect, useRef  } from "react";
import Sidebar from "./Sidebar";
import { db, auth } from "../firebase";
import { addDoc, collection, serverTimestamp, onSnapshot, query, orderBy, updateDoc, deleteDoc, doc} from "firebase/firestore";
import { where } from "firebase/firestore";
import "./Issues.css";
import TodoIcon from "./assets/Todo.png";
import InProgressIcon from "./assets/InProgress.png";
import CodeReviewIcon from "./assets/CodeReview.png";
import BacklogIcon from "./assets/Backlog.png";
import OnTrackIcon from "./assets/Ontrack.png";
import AtRiskIcon from "./assets/Atrisk.png";
import OffTrackIcon from "./assets/Offtrack.png";

import issueone from "./assets/Issues.png";
import user from "./assets/User.png";

import pTodoIcon from "./assets/pTodo.png";
import pInProgressIcon from "./assets/pInProgress.png";
import pCodeReviewIcon from "./assets/pCodeReview.png";
import pBacklogIcon from "./assets/pBacklog.png";
import Projectsb from "./assets/Projectsb.png";

import Nopriority from "./assets/Nopriority.png";
import Low from "./assets/Low.png";
import Medium from "./assets/Medium.png";
import High from "./assets/High.png";
import Urgent from "./assets/Urgent.png";

function Issues() {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const [status, setStatus] = useState("Todo");
  const [priority, setPriority] = useState("No Priority");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projectName, setProjectName] = useState("Project");
  const [projects, setProjects] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [priorityDropdownIssue, setPriorityDropdownIssue] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [showProject, setShowProject] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [titleDraft, setTitleDraft] = useState("");


  const [statusDropdownIssue, setStatusDropdownIssue] = useState<string | null>(null);

  const priorityIcons: Record<string, string> = {
    "No Priority": Nopriority,
    "Low": Low,
    "Medium": Medium,
    "High": High,
    "Urgent": Urgent,
  };


  const statusIcons: Record<string, string> = {
    "Todo": TodoIcon,
    "In Progress": InProgressIcon,
    "Code Review": CodeReviewIcon,
    "Backlog": BacklogIcon,
  };

  const statusGroups = [
    "In Progress",
    "Todo",
    "Code Review",
    "Backlog",
  ];

  const pstatusIcons: Record<string, string> = {
    "Todo": pTodoIcon,
    "In Progress": pInProgressIcon,
    "Code Review": pCodeReviewIcon,
    "Backlog": pBacklogIcon,
  };

  const projectHealthIcons: Record<string, string> = {
    "On Track": OnTrackIcon,
    "At Risk": AtRiskIcon,
    "Off Track": OffTrackIcon
  };

  const createIssue = async () => {
    try {
      if (!title.trim()) {
        alert("Issue title is required");
        return;
      }

      await addDoc(collection(db, "issues"), {
        title,
        description,
        status,
        priority,
        dueDate,
        projectId,
        projectName,

        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.displayName,
        userEmail: auth.currentUser?.email,

        createdAt: serverTimestamp()
      });

      setTitle("");
      setDescription("");
      setStatus("Todo");
      setPriority("No Priority");
      setDueDate("");
      setProjectId("");
      setProjectName("Project");

      setShowModal(false);

      alert("Issue created");
    } catch (error) {
      console.error(error);
      alert("Failed to create issue");
    }
  };

  const updateIssuePriority = async (
    issueId: string,
    newPriority: string
  ) => {
    try {
      await updateDoc(
        doc(db, "issues", issueId),
        {priority: newPriority}
      );

      setPriorityDropdownIssue(null);
    } catch (error) {
      console.error(error);
      alert("Failed to update priority");
    }
  };


  const autoResizeTextarea = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const updateIssueStatus = async (
    issueId: string,
    newStatus: string
  ) => {
    try {
      await updateDoc(
        doc(db, "issues", issueId),
        {status: newStatus,}
      );

      setStatusDropdownIssue(null);
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  const updateIssueField = async ( issueId: string, field: string, value: any) => {
    try {
      await updateDoc(
        doc(db, "issues", issueId),
        {[field]: value}
      );

      if (selectedIssue?.id === issueId) {
        setSelectedIssue(null);
      }
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {

    const q = query(
      collection(db, "issues"),
      where("userId", "==", auth.currentUser?.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setIssues(data);
    });

    return () => unsubscribe();
  }, []);



  useEffect(() => {
    const q = query(
      collection(db, "projects"),
      where("userId", "==", auth.currentUser?.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setProjects(data);
    });

    return () => unsubscribe();
  }, []);
  

  const deleteIssue = async (issueId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this issue?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "issues", issueId));
      setSelectedIssue(null);
      alert("Issue deleted");
    } catch (error) {
      console.error(error);
      alert("Failed to delete issue");
    }
  };

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = "auto";
      descriptionRef.current.style.height =
        `${descriptionRef.current.scrollHeight}px`;
    }
  }, [selectedIssue]);

  useEffect(() => {
    if (selectedIssue) {
      setDescriptionDraft(selectedIssue.description || "");
      setTitleDraft(selectedIssue.title || "");
    }
  }, [selectedIssue]);

  

  const aiauto = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: title,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.text();
      setDescription(result);
    } catch (error) {
      console.error(error);
      setDescription("Failed to generate description");
    }
  };

  const renderIssueCard = (issue: any) => {
    const project = projects.find(
      (p) => p.id === issue.projectId
    );

    return (
      <div key={issue.id} className="issue-card" onClick={() => setSelectedIssue(issue)}>
        <div className="priority-container" onClick={(e) => { e.stopPropagation();
            setPriorityDropdownIssue( priorityDropdownIssue === issue.id ? null : issue.id );}}>
          <div className="priority-container"
            onClick={(e) => { e.stopPropagation(); setPriorityDropdownIssue(
              priorityDropdownIssue === issue.id ? null : issue.id);
            }}>
            <img src={priorityIcons[issue.priority]} alt={issue.priority} className="priority-icon"/>

            {priorityDropdownIssue === issue.id && (
              <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                {["No Priority", "Urgent", "High", "Medium", "Low"].map((item) => (
                  <div key={item} className="dropdown-item status-item" onClick={() => updateIssuePriority(issue.id, item)}>
                    <img src={priorityIcons[item]} alt={item} className="priority-dropdown-icon"/>
                    {item}
                  </div>
                ))}
                </div>
            )}
          </div>

          <div className="status-container" onClick={(e) => {e.stopPropagation(); setStatusDropdownIssue(statusDropdownIssue === issue.id ? null : issue.id);}}>
            <img src={statusIcons[issue.status]} alt={issue.status} className="status-icon"/>
            {statusDropdownIssue === issue.id && (
              <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                {["Todo","In Progress","Code Review","Backlog"].map((item) => (
                  <div key={item} className="dropdown-item status-item"
                    onClick={() => updateIssueStatus(issue.id, item)}>
                    <img src={statusIcons[item]} alt={item} className="status-dropdown-icon"/>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <span className="issue-name">
          {issue.title}
        </span>

        <div className="project-link-wrapper">
          <button className="project-link-btn">
            <img src={Projectsb} className="status-icon-but"/>{issue.projectName}
          </button>

          {project && (
            <div className="project-tooltip">
              <div> 
                <img src={pstatusIcons[project.status]} alt={project.status} className="status-icon-project"/><span>{project.status}</span> <br/>
                <img src={projectHealthIcons[project.healthStatus]} alt={project.healthStatus} className="status-icon-project"/><span>{project.healthStatus}</span>
              </div>

              <div>
                <img src={priorityIcons[project.priority]} alt={project.priority} className="status-icon-project"/><span>{project.priority}</span><br/>
                <img src={issueone} className="status-icon-project"/>
                {"Issues: "}
                {issues.filter(
                  (i) => i.projectId === issue.projectId
                ).length}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };




  return (
    <div className="layout">
      <Sidebar />

      <main className="content">
        <div className="greydiv">
          <h2> My Issues</h2>
          <span className="add-icon" onClick={() => setShowModal(true)}>+</span>
        </div>
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>New Issue</h3>

                <span className="close-icon" onClick={() => setShowModal(false)}> ✕ </span>
              </div>

              <input type="text" placeholder="Issue title" className="issue-title" value={title} onChange={(e) => setTitle(e.target.value)}/>

              <div className="issue-options">

                {/* Status */}
                <div className="dropdown">
                  <button className="option-btn" onClick={() => setShowStatus(!showStatus)}>
                    {status}
                  </button>

                  {showStatus && (
                    <div className="dropdown-menu">
                      {["Todo", "In Progress", "Code Review", "Backlog"].map((item) => (
                        <div key={item} className="dropdown-item" onClick={() => {   setStatus(item);   setShowStatus(false); }}>                        
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

              {/* Due Date */}
                <input
                  type="date"
                  className="option-btn"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <textarea placeholder="Add description..." className="issue-description" value={description} onChange={(e) => setDescription(e.target.value)}/>
              <button className="ai-btn" onClick={aiauto}>
                AI Autofill
              </button>
              <button className="create-btn" onClick={createIssue}>
                Create Issue
              </button>
            </div>
          </div>
        )}
        <br/>
                
        <div className="issues-list">
          {statusGroups.map((statusName) => {
            const statusIssues = issues.filter(
              (issue) => issue.status === statusName
            );

            if (statusIssues.length === 0) return null;

            return (
              <div key={statusName} className="status-group">
                <div className="greydiv">
                  <h2> <img src={statusIcons[statusName]} alt={statusName} className="status-dropdown-icon"/> {statusName} - {statusIssues.length}</h2>

                  <span className="add-icon" onClick={() => setShowModal(true)}>+</span>
                </div>
                {statusIssues.map(renderIssueCard)}
              </div>
            );
          })}
          {selectedIssue && (
            <>
            <div className="details-overlay" onClick={() => setSelectedIssue(null)}/>

            <aside className="issue-details-sidebar">
              <div className="details-header">
                <input className="issue-title-edit" value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={() => updateIssueField(selectedIssue.id, "title", titleDraft)}/>
                <span className="close-details" onClick={() => setSelectedIssue(null)}> ✕ </span>
              </div>

              <div className="details-section">
                <h4>Description</h4>
                <textarea ref={descriptionRef} className="issue-description-edit" value={descriptionDraft}
                  onChange={(e) => {autoResizeTextarea(e); setDescriptionDraft(e.target.value);}}
                  onBlur={async () =>{
                    await updateIssueField(selectedIssue.id, "description", descriptionDraft); setSelectedIssue(null); }}
                  />
              </div>

              <div className="details-section">
                <h4>Status</h4>

                <div className="dropdown">
                  <button className="option-btn" onClick={() => setShowStatus(!showStatus)}>
                    <img src={statusIcons[selectedIssue.status]} alt={selectedIssue.status} className="status-dropdown-icon"/>
                    {selectedIssue.status}
                  </button>

                  {showStatus && (
                    <div className="dropdown-menu">
                      {["Todo", "In Progress", "Code Review", "Backlog"].map((item) => (
                        <div key={item} className="dropdown-item status-item"
                          onClick={() => { updateIssueField(selectedIssue.id, "status", item);
                            setShowStatus(false);}}>
                          <img src={statusIcons[item]} alt="" className="status-dropdown-icon"/>
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
                    <img src={priorityIcons[selectedIssue.priority]} alt={selectedIssue.priority} className="priority-icon"/>
                      {selectedIssue.priority}
                  </button>

                  {showPriority && (
                    <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                      {["No Priority", "Urgent", "High", "Medium", "Low"].map((item) => (
                        <div key={item} className="dropdown-item status-item" onClick={() => { updateIssueField(selectedIssue.id, "priority", item); setShowPriority(false);}}>
                          <img src={priorityIcons[item]} alt={item} className="priority-dropdown-icon"/>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="details-section">
                <h4>Project</h4>
                <p>{selectedIssue.projectName}</p>
              </div>

              <div className="details-section">
                <h4>Created By</h4>
                <p><img src={user}className="status-icon"/>{selectedIssue.userName}</p>
              </div>

              <div className="details-section">
                <h4>Email</h4>
                <p>{selectedIssue.userEmail}</p>
              </div>

              <div className="details-section">
                <h4>Created On</h4>
                {selectedIssue.createdAt?.toDate
                  ? selectedIssue.createdAt.toDate().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Unknown"}
              </div>

              <div className="details-section">
                <h4>Due Date</h4>

                <input
                  className="option-btn "
                  type="date"
                  value={selectedIssue.dueDate || ""}
                  onChange={(e) => setSelectedIssue({
                      ...selectedIssue,
                      dueDate: e.target.value,
                  })}
                  onBlur={() => updateIssueField(selectedIssue.id, "dueDate", selectedIssue.dueDate)}
                />
              </div>

              <div className="details-footer">
                <button className="delete-issue-btn" onClick={() => deleteIssue(selectedIssue.id)}>
                  Delete
                </button>
              </div>
            </aside>
          </>)}
        </div>
      </main>
    </div>
  );
}

export default Issues;