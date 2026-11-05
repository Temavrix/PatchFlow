import { useEffect, useMemo, useRef, useState } from "react";
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

const DAY_MS = 24 * 60 * 60 * 1000;
const PX_PER_DAY = 50;
const SIDE_PADDING = 60;
const MIN_TIMELINE_WIDTH = 1200;

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

const formatMonthDay = (date: Date) => date.toLocaleString("en-US", { month: "short", day: "numeric" }).toUpperCase();
const formatMonth = (date: Date) => date.toLocaleString("en-US", { month: "short" }).toUpperCase();
const getPosition = (date: Date, timelineStart: Date) => {
  const days =
    (startOfDay(date).getTime() - startOfDay(timelineStart).getTime()) /
    DAY_MS;

  return SIDE_PADDING + days * PX_PER_DAY;
};
const getIssueDate = (issue: Issue) => toDate(issue.dueDate);
const hasDateValue = (issue: Issue & { dateValue: Date | null }): issue is RoadmapIssue => issue.dateValue instanceof Date;

const getPriorityClass = (priority?: string) => (priority || "No Priority").toLowerCase().replace(/\s+/g, "-");

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

    const defaultStart = startOfMonth(addMonths(today, -1));
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

    const defaultEnd = endOfMonth(addMonths(today, 3));
    if (latestIssueDate && latestIssueDate.getTime() > defaultEnd.getTime()) {
      return endOfMonth(latestIssueDate);
    }

    return defaultEnd;
  }, [datedIssues, today]);

  const timelineWidth = useMemo(() => {
    const days = Math.ceil(
      (timelineEnd.getTime() - timelineStart.getTime()) / DAY_MS
    );

    return Math.max(
      MIN_TIMELINE_WIDTH,
      days * PX_PER_DAY + SIDE_PADDING * 2
    );
  }, [timelineEnd, timelineStart]);

  // One tick per Monday, so the numbers in the header sit at their real dates.
  const weekTicks = useMemo(() => {
    const ticks: { date: Date; showMonth: boolean }[] = [];
    const currentDate = startOfDay(timelineStart);
    currentDate.setDate(currentDate.getDate() + ((8 - currentDate.getDay()) % 7));

    let previousMonth = -1;
    while (currentDate <= timelineEnd) {
      ticks.push({
        date: new Date(currentDate),
        showMonth: currentDate.getMonth() !== previousMonth,
      });
      previousMonth = currentDate.getMonth();
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return ticks;
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

  const todayPosition = getPosition(today, timelineStart);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScrolledToToday = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || hasScrolledToToday.current) return;

    const todayX = todayPosition;
    container.scrollLeft = Math.max(0, todayX - container.clientWidth * 0.35);
    hasScrolledToToday.current = true;
  }, [timelineWidth, todayPosition]);

  return (
    <div className="layout">
      <Sidebar />

      <main className="content-board">
        <div className="roadmap-container" ref={containerRef}>
          <div className="timeline-content" style={{ width: `${timelineWidth}px` }}>
            <div className="timeline-body">
              <div className="timeline-grid">
                {weekTicks.map((tick) => (
                  <div
                    key={tick.date.toISOString()}
                    className="grid-line"
                    style={{
                      left: `${getPosition(tick.date, timelineStart)}px`
                    }}
                  />
                ))}
              </div>

              <div
                className="today-line"
                style={{ left: `${todayPosition}px` }}
              />

              <div className="timeline-header">
                {weekTicks.map((tick) => {
                  const nearToday = Math.abs(tick.date.getTime() - today.getTime()) < 3 * DAY_MS;

                  return (
                    <div
                      key={tick.date.toISOString()}
                      className="tick"
                      style={{
                        left: `${getPosition(tick.date, timelineStart)}px`
                      }}
                    >
                      {tick.showMonth && (
                        <span className="tick-month">{formatMonth(tick.date)}</span>
                      )}
                      {!nearToday && <span className="tick-day">{tick.date.getDate()}</span>}
                    </div>
                  );
                })}

                <div
                  className="today-pill"
                  style={{ left: `${todayPosition}px` }}
                >
                  {formatMonthDay(today)}
                </div>
              </div>

            {roadmapProjects.length === 0 && (
              <div className="empty-roadmap">
                Add due dates to issues to see them on the roadmap.
              </div>
            )}

            {roadmapProjects.map((project) => {
              const firstIssueDate = project.issues[0].dateValue!;
              const lastIssueDate = project.issues[project.issues.length - 1].dateValue!;

              const projectStart = toDate(project.startDate);
              const projectEnd = toDate(project.endDate);

              const barStartDate =
                projectStart && projectStart < firstIssueDate
                  ? projectStart
                  : firstIssueDate;

              const barEndDate =
                projectEnd && projectEnd > lastIssueDate
                  ? projectEnd
                  : lastIssueDate;

              // Add a small inset so the first and last diamonds sit inside the bar.
              const barLeft = getPosition(barStartDate, timelineStart) - 10;
              const barRight = getPosition(barEndDate, timelineStart) + 10;
              const barWidth = Math.max(20, barRight - barLeft);

              // Keep all milestones on the same horizontal bar.
              const issuesWithPositions = project.issues.map((issue) => ({
                ...issue,
                position: getPosition(issue.dateValue, timelineStart),
              }));

              const status = project.status || "Backlog";
              const healthStatus = project.healthStatus || "On Track";

              const trackHeight = 115;

              return (
                <section key={project.id} className="project-section">
                  <div
                    className="project-track"
                    style={{ height: `${trackHeight}px` }}
                  >
                    <div
                      className="project-title"
                      style={{ left: `${barLeft}px` }}
                    >
                      <span>{project.name}</span>

                      <div className="project-icons" aria-label="Project status">
                        <img src={projectHealthIcons[healthStatus] || OnTrackIcon} alt={healthStatus} />
                        <img src={statusIcons[status] || BacklogIcon} alt={status} />
                      </div>
                    </div>

                    <div
                      className="project-bar"
                      style={{
                        left: `${barLeft}px`,
                        width: `${barWidth}px`
                      }}
                    />

                    {issuesWithPositions.map((issue) => (
                      <div
                        key={issue.id}
                        className={`milestone-wrapper priority-${getPriorityClass(issue.priority)}`}
                        style={{
                          left: `${issue.position}px`,
                          top: "38px"
                        }}
                      >
                        <div className="issue-dot" />

                        <span className="milestone-code">
                          {(issue.projectName || project.name || "PRJ")
                            .slice(0, 3)
                            .toUpperCase()}-{issue.id.slice(0, 3).toUpperCase()}
                        </span>

                        <div className="issue-label">
                          <span>{issue.title}</span>
                          <small>{formatMonthDay(issue.dateValue)}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Calander;
