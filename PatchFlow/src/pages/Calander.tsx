import { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";
import { where } from "firebase/firestore";
import "./Calander.css";
import OnTrackIcon from "./assets/Ontrack.png";
import AtRiskIcon from "./assets/Atrisk.png";
import OffTrackIcon from "./assets/Offtrack.png";
import TodoIcon from "./assets/pTodo.png";
import InProgressIcon from "./assets/pInProgress.png";
import CodeReviewIcon from "./assets/pCodeReview.png";
import BacklogIcon from "./assets/pBacklog.png";

interface Project {
  id: string;
  projectName?: string;
  name?: string;
  createdAt?: any;
  startDate?: any;
  endDate?: any;
  status?: string;
  priority?: string;
  healthStatus?: string;
}

interface Issue {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: any;
  projectId?: string;
  projectName?: string;
  createdAt?: any;
}

interface RoadmapIssue extends Issue {
  dateValue: Date;
}

interface ProjectGroup {
  id: string;
  name: string;
  createdAt?: any;
  startDate?: any;
  endDate?: any;
  status?: string;
  healthStatus?: string;
  issues: Issue[];
}

interface RoadmapProject extends Omit<ProjectGroup, "issues"> {
  issues: RoadmapIssue[];
}

interface MonthBlock {
  key: string;
  name: string;
  weeks: number[];
}

const startOfDay = (date: Date) => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

const addMonths = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();

  if (typeof value === "string") {
    const parsedDate = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  return null;
};

const formatMonthDay = (date: Date) =>
  date.toLocaleString("en-US", { month: "short", day: "numeric" }).toUpperCase();

const formatMonth = (date: Date) =>
  date.toLocaleString("en-US", { month: "short" }).toUpperCase();

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getPosition = (date: Date, timelineStart: Date, timelineEnd: Date) => {
  const range = timelineEnd.getTime() - timelineStart.getTime();
  if (range <= 0) return 0;
  return clamp(((date.getTime() - timelineStart.getTime()) / range) * 100, 0, 100);
};

const getIssueDate = (issue: Issue) =>
  toDate(issue.dueDate);

const hasDateValue = (issue: Issue & { dateValue: Date | null }): issue is RoadmapIssue =>
  issue.dateValue instanceof Date;

const getPriorityClass = (priority?: string) =>
  (priority || "No Priority").toLowerCase().replace(/\s+/g, "-");

const statusIcons: Record<string, string> = {
  "Todo": TodoIcon,
  "In Progress": InProgressIcon,
  "Code Review": CodeReviewIcon,
  "Backlog": BacklogIcon,
  "Completed": CodeReviewIcon,
};

const projectHealthIcons: Record<string, string> = {
  "On Track": OnTrackIcon,
  "At Risk": AtRiskIcon,
  "Off Track": OffTrackIcon,
};

function Calander() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const projectsQuery = query(
      collection(db, "projects"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const issuesQuery = query(
      collection(db, "issues"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribeProjects = onSnapshot(
      projectsQuery,
      (snapshot) => {
        setProjects(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Project[]
        );
      }
    );

    const unsubscribeIssues = onSnapshot(
      issuesQuery,
      (snapshot) => {
        setIssues(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Issue[]
        );
      }
    );

    return () => {
      unsubscribeProjects();
      unsubscribeIssues();
    };
  }, []);

  const today = useMemo(() => startOfDay(new Date()), []);

  const datedIssues = useMemo(
    () =>
      issues
        .map((issue) => ({
          ...issue,
          dateValue: getIssueDate(issue),
        }))
        .filter(hasDateValue),
    [issues]
  );

  const timelineStart = useMemo(() => {
    const earliestIssueDate = datedIssues.reduce<Date | null>((earliest, issue) => {
      if (!issue.dateValue) return earliest;
      if (!earliest || issue.dateValue.getTime() < earliest.getTime()) return issue.dateValue;
      return earliest;
    }, null);

    const defaultStart = startOfMonth(addMonths(today, -0));
    if (earliestIssueDate && earliestIssueDate.getTime() < defaultStart.getTime()) {
      return startOfMonth(earliestIssueDate);
    }

    return defaultStart;
  }, [datedIssues, today]);

  const timelineEnd = useMemo(() => {
    const latestIssueDate = datedIssues.reduce<Date | null>((latest, issue) => {
      if (!issue.dateValue) return latest;
      if (!latest || issue.dateValue.getTime() > latest.getTime()) return issue.dateValue;
      return latest;
    }, null);

    const defaultEnd = endOfMonth(addMonths(today, 0));
    if (latestIssueDate && latestIssueDate.getTime() > defaultEnd.getTime()) {
      return endOfMonth(latestIssueDate);
    }

    return defaultEnd;
  }, [datedIssues, today]);

  const months = useMemo<MonthBlock[]>(() => {
    const blocks: MonthBlock[] = [];
    const currentDate = new Date(timelineStart);

    while (currentDate <= timelineEnd) {
      const daysInMonth = endOfMonth(currentDate).getDate();
      const weeks: number[] = [];

      for (let day = 1; day <= daysInMonth; day += 7) {
        weeks.push(day);
      }

      blocks.push({
        key: `${currentDate.getFullYear()}-${currentDate.getMonth()}`,
        name: formatMonth(currentDate),
        weeks,
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return blocks;
  }, [timelineEnd, timelineStart]);

  const gridLines = useMemo(() => {
    const lines: Date[] = [];
    const currentDate = new Date(timelineStart);

    while (currentDate <= timelineEnd) {
      lines.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return lines;
  }, [timelineEnd, timelineStart]);

  const roadmapProjects = useMemo<RoadmapProject[]>(() => {
    const projectMap = new Map<string, ProjectGroup>();

    projects.forEach((project) => {
      projectMap.set(project.id, {
        id: project.id,
        name: project.projectName || project.name || "Project",
        createdAt: project.createdAt,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
        healthStatus: project.healthStatus,
        issues: [],
      });
    });

    issues.forEach((issue) => {
      const key = issue.projectId || "unassigned";
      const existingProject = projectMap.get(key);

      if (existingProject) {
        existingProject.issues.push(issue);
        return;
      }

      projectMap.set(key, {
        id: key,
        name: issue.projectName || "Project",
        status: "Backlog",
        healthStatus: "On Track",
        issues: [issue],
      });
    });

    return Array.from(projectMap.values())
      .map((project) => ({
        ...project,
        issues: project.issues
          .map((issue) => ({
            ...issue,
            dateValue: getIssueDate(issue),
          }))
          .filter(hasDateValue)
          .sort((a, b) => a.dateValue!.getTime() - b.dateValue!.getTime()),
      }))
      .filter((project) => project.issues.length > 0);
  }, [issues, projects]);

  const todayPosition = getPosition(today, timelineStart, timelineEnd);

  return (
    <div className="layout">
      <Sidebar />

      <main className="content-board">
        <div className="roadmap-container">
          <div className="timeline-content">
            <div className="timeline-grid">
              {gridLines.map((lineDate) => (
                <div
                  key={lineDate.toISOString()}
                  className="grid-line"
                  style={{left: `${getPosition(lineDate, timelineStart, timelineEnd)}%`,}}/>
              ))}
            </div>

            <div className="today-line" style={{left: `${todayPosition}%`,}}>
              <span>{formatMonthDay(today)}</span>
            </div>

            <div className="timeline-header">
              {months.map((month) => (
                <div key={month.key} className="month-block">
                  <div className="month-name">{month.name}</div>

                  <div className="weeks-row">
                    {month.weeks.map((week) => (
                      <span key={week}>{week}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {roadmapProjects.length === 0 && (
              <div className="empty-roadmap">
                Add due dates to issues to see them on the roadmap.
              </div>
            )}

            {roadmapProjects.map((project) => {
              const firstIssueDate = project.issues[0].dateValue!;
              const lastIssueDate = project.issues[project.issues.length - 1].dateValue!;
              const barLeft = getPosition(firstIssueDate, timelineStart, timelineEnd);
              const barRight = getPosition(lastIssueDate, timelineStart, timelineEnd);
              const barWidth = Math.max(.8, barRight - barLeft);
              const status = project.status || "Backlog";
              const healthStatus = project.healthStatus || "On Track";

              return (
                <section key={project.id} className="project-section">
                  <div className="project-track">
                    <div className="project-title" style={{left: `${barLeft}%`}}>
                      <span>{project.name}</span>

                      <div className="project-icons" aria-label="Project status">
                        <img src={projectHealthIcons[healthStatus] || OnTrackIcon} alt={healthStatus} />
                        <img src={statusIcons[status] || BacklogIcon} alt={status} />
                      </div>
                    </div>

                    <div
                      className="project-bar"
                      style={{ left: `${barLeft}%`, width: `${barWidth}%`,}}
                    />

                    {project.issues.map((issue) => {
                      const issueDate = issue.dateValue!;
                      const issuePosition = getPosition(issueDate, timelineStart, timelineEnd);

                      return (
                        <div key={issue.id} className={`milestone-wrapper priority-${getPriorityClass(issue.priority)}`}
                          style={{ left: `${issuePosition}%`, }}
                          title={`${issue.title} - ${formatMonthDay(issueDate)}`}
                        >
                          <div className="issue-dot" />

                          <div className="issue-label">
                            <span>{issue.title}</span>
                            <small>{formatMonthDay(issueDate)}</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Calander;
