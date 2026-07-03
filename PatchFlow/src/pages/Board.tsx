import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { where } from "firebase/firestore";
import { db, auth } from "../firebase";
import "./Board.css";
import TodoIcon from "./assets/Todo.png";
import InProgressIcon from "./assets/InProgress.png";
import CodeReviewIcon from "./assets/CodeReview.png";
import Projectsb from "./assets/Projectsb.png";
import BacklogIcon from "./assets/Backlog.png";

import Nopriority from "./assets/Nopriority.png";
import Low from "./assets/Low.png";
import Medium from "./assets/Medium.png";
import High from "./assets/High.png";
import Urgent from "./assets/Urgent.png";

function Board() {
  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "issues"),
      where("userId", "==", auth.currentUser?.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setIssues(data);
    });

    return () => unsubscribe();
  }, []);

  const todoIssues = issues.filter((issue) => issue.status === "Todo");
  const progressIssues = issues.filter((issue) => issue.status === "In Progress");
  const reviewIssues = issues.filter((issue) => issue.status === "Code Review");
  const backlogIssues = issues.filter((issue) => issue.status === "Backlog");

  const priorityIcons: Record<string, string> = {
    "No Priority": Nopriority,
    "Low": Low,
    "Medium": Medium,
    "High": High,
    "Urgent": Urgent,
  };


  return (
    <div className="layout">
      <Sidebar/>

    <main className="content-board">
        <div className="board-container">

          <div className="board-column">
            <h3><img src={TodoIcon} className="status-icon-board"/> Todo ({todoIssues.length})</h3>

            {todoIssues.map((issue) => (
              <div key={issue.id} className="issue-board-card">
                <div className="issue-board-title">
                  <img src={TodoIcon} className="status-icon-board"/> {issue.title}
                </div>

                <div className="issue-board-project">
                  <img src={priorityIcons[issue.priority]} alt={issue.priority} className="priority-icon"/>
                  <button className="project-link-btn">
                    <img src={Projectsb} className="status-icon-board"/> {issue.projectName}
                  </button>
                </div>

                <div className="issue-board-title">
                  Created {issue.createdAt?.toDate
                  ? issue.createdAt.toDate().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Unknown"}
                </div>
              </div>
            ))}
          </div>

          <div className="board-column">
            <h3><img src={InProgressIcon} className="status-icon-board"/> In Progress ({progressIssues.length})</h3>

            {progressIssues.map((issue) => (
              <div key={issue.id} className="issue-board-card">
                <div className="issue-board-title">
                  <img src={InProgressIcon} className="status-icon-board"/>  {issue.title}
                </div>

                <div className="issue-board-project">
                  <img src={priorityIcons[issue.priority]} alt={issue.priority} className="priority-icon"/>
                  <button className="project-link-btn">
                    <img src={Projectsb} className="status-icon-board"/> {issue.projectName}
                  </button>
                </div>

                <div className="issue-board-title">
                  Created {issue.createdAt?.toDate
                  ? issue.createdAt.toDate().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Unknown"}
                </div>
              </div>
            ))}
          </div>

          <div className="board-column">
            <h3><img src={CodeReviewIcon} className="status-icon-board"/> Code Review ({reviewIssues.length})</h3>

            {reviewIssues.map((issue) => (
              <div key={issue.id} className="issue-board-card">
                <div className="issue-board-title">
                  <img src={CodeReviewIcon} className="status-icon-board"/> {issue.title}
                </div>

                <div className="issue-board-project">
                  <img src={priorityIcons[issue.priority]} alt={issue.priority} className="priority-icon"/>
                  <button className="project-link-btn">
                    <img src={Projectsb} className="status-icon-board"/> {issue.projectName}
                  </button>
                </div>

                <div className="issue-board-title">
                  Created {issue.createdAt?.toDate
                  ? issue.createdAt.toDate().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Unknown"}
                </div>
              </div>
            ))}
          </div>

          <div className="board-column">
            <h3><img src={BacklogIcon} className="status-icon-board"/> Backlog ({backlogIssues.length})</h3>

            {backlogIssues.map((issue) => (
              <div key={issue.id} className="issue-board-card">
                <div className="issue-board-title">
                  <img src={BacklogIcon} className="status-icon-board"/> {issue.title}
                </div>

                <div className="issue-board-project">
                  <img src={priorityIcons[issue.priority]} alt={issue.priority} className="priority-icon"/>
                  <button className="project-link-btn">
                    <img src={Projectsb} className="status-icon-board"/> {issue.projectName}
                  </button>
                </div>

                <div className="issue-board-title">
                  Created {issue.createdAt?.toDate
                  ? issue.createdAt.toDate().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Unknown"}
                </div>
              </div>
            ))}
          </div>

        </div>
    </main>
    </div>
  );
}

export default Board;