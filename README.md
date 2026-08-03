# PatchFlow <img height="20" alt="Image" src="https://github.com/user-attachments/assets/f23b203a-9e13-432f-906c-29c0c70e5d56"/>

## Our Project is now [live](https://patchflowai.netlify.app/) current Status : [![Netlify Status](https://api.netlify.com/api/v1/badges/3364289d-d800-4af9-a8b3-a8a4e8f42c4d/deploy-status)](https://app.netlify.com/projects/patchflowai/deploys)

###### An AI Bug tracker for an easier workflow for developers  



Please consider donating some money to our organization to help fund this project:  
<a href="https://buymeacoffee.com/mahadhevha" target="_blank">
    <img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" height="30"/>
</a>



<img width="200" alt="Image" src="https://github.com/user-attachments/assets/3bcf50e8-9b8e-4c93-9dc6-52ad4674657f"/>
<img width="200" alt="Image" src="https://github.com/user-attachments/assets/158fc16e-d5f0-4001-8bdd-7e0def3d8df6"/>



## Table Of Contents
- [Introducing PatchFlow](#introducing-patchflow)
- [Features Of PatchFlow](#features)
  * [Teams](#teams)
  * [AI](#ai)
  * [Pulse](#pulse)
  * [Github Issues](#github-issues)
- [Issues](#issues)


## What's New?
Here at Temavrix we are committed in keeping PatchFlow up-to-date and up-to-speed with the growing tech solutions, services and algorithms. Hence this new commit includes:


```
PatchFlow Changelogs:-

ANNOUNCEMENT:- 

1. Introducing Pulse: AI-powered project analytics engine

2. Fixed bugs and stability issues in Teams

3. UI improvements

4. Markdown viewing support has been added.

Code Checks Manifest:-
All Checks Status: ✅
-----------------------------------------
UX (User Experience) Checks: ✅
BackEnd Code-FrontEnd UI Integration Checks: ✅
(All evaluations are done by the R&D Department)

Last Updated: 3-Aug-2026 19:10 HRS (Singapore Standard Time)
Publisher: Temavrix
```
Keep up-to-date with what's happening on this repository by clicking the 'Star' and 'Watch' button on the top right corner of this repository.


## Introducing PatchFlow
PatchFlow provides a centralized workspace for creating, organizing, and tracking software development issues. Users can create detailed issues with descriptions, priorities, statuses, and project associations. 

<img height="200" alt="Image" src="https://github.com/user-attachments/assets/079fce4f-9d91-4b55-b9de-d0cb51698ae4" />

The platform supports customizable workflows, allowing teams to adapt issue tracking to their development process. GitHub integration enables repositories and issues to be imported directly into PatchFlow for seamless synchronization. 

Developers can monitor progress from initial planning through implementation and completion. This feature ensures better visibility, accountability, and collaboration across development teams.   

<img height="80" alt="Image" src="https://github.com/user-attachments/assets/48c7a40b-e2dd-4ff3-ad32-f49efdd3ff6d" />

The Kanban Board offers a visual and intuitive approach to managing tasks throughout the software development lifecycle. Issues are displayed as cards that move across customizable workflow columns. 

Teams can quickly identify task status, priorities, and ownership at a glance. The drag-and-drop interface makes updating task progress simple and efficient. Imported GitHub issues can be managed directly within the board, keeping development activities synchronized. 

Developers can improve team collaboration, streamline workflows, and reduce project bottlenecks.   
<img height="200" alt="Image" src="https://github.com/user-attachments/assets/b7aa506e-49af-4618-95ef-108848d2e647" />



The Calendar View provides a timeline-based representation of projects, tasks, and important deadlines. Users can easily schedule work, track due dates, and monitor project milestones from a single interface. 

The calendar automatically reflects updates made to tasks and issues across the platform. Team members can quickly identify overdue items, upcoming deadlines, and workload distribution. This feature supports better planning by giving teams a clear overview of project schedules and priorities. 

By centralizing project timelines, the Calendar View enhances coordination, productivity, and deadline management.   
<img height="200" alt="Image" src="https://github.com/user-attachments/assets/35e761aa-eef0-4b87-b4fc-0a73da6a5eda" />


## Features

### Teams
A new way introduced to delegate and assign tasks. 

The Teams feature enables seamless collaboration by allowing project owners to assign team members to specific projects. Once assigned, team members gain access to a dedicated workspace where they can view all projects shared with them. Each shared project displays its associated issues, priorities, statuses, and project details in real time. 

<img height="190" alt="Image" src="https://github.com/user-attachments/assets/fc435ec2-5f09-4e03-a6a4-22de53d80db7"/>

Team members can open issue details in a sidebar interface similar to the main Issues page for a consistent user experience. To maintain project control, members are restricted from editing project information and can only update issue statuses as they progress through the workflow.

Ensuring transparent task tracking, improved team coordination, and efficient project management without compromising project ownership or security.

 

### AI
#### 1. Auto-Fill
Powered by Google AI The AI Auto-Fill feature helps users create detailed and professional issue descriptions with minimal effort. When creating a new issue, users simply provide a title and the AI generates a relevant description based on the issue context. 

Reducing the time spent writing repetitive details and improves issue quality across projects. The generated content can be edited and customized before submission to match specific requirements. By providing structured and meaningful descriptions, the feature helps teams communicate requirements more effectively. 

AI Auto-Fill enables developers to focus on solving problems rather than documenting them.

Before:  
<img height="150" alt="Image" src="https://github.com/user-attachments/assets/5de0d9da-0561-4489-852d-64a44622a538" />


After:  
<img height="150" alt="Image" src="https://github.com/user-attachments/assets/9fc42eab-065e-4f0d-9386-bd83417b885f" />



#### 2. Project Health Analysis
Powered by Google AI the Project Health Analysis uses AI to evaluate the overall state of a project and provide actionable insights by analyzing project data such as issue status, priorities, deadlines, and workload distribution to identify potential risks. 

Users receive a concise summary highlighting project progress, bottlenecks, and areas requiring attention. The AI also provides recommendations to help teams prioritize work and address critical issues more effectively. By offering data-driven insights, the feature supports better planning and informed decision-making. 

<img height="200" alt="Image" src="https://github.com/user-attachments/assets/4ee510b0-1555-4767-9d13-964880bf28ba" />

Project Health Analysis helps teams maintain project momentum and improve the likelihood of successful delivery. 


### Pulse
The Weekly Project Pulse is an AI-powered analytics feature that generates a periodic health summary for each project by processing issue status transition events. Status changes are stored in Azure Cosmos DB and queried by an Azure Function, which constructs a chronological activity timeline and submits it to an large language model for analysis. 

The model produces a structured report covering project health, productivity trends and workflow bottlenecks. To minimize latency, API usage and inference costs, generated reports are cached in Redis with a six-day TTL. 

<img height="200"  alt="Image" src="https://github.com/user-attachments/assets/2f5c1489-f02d-4632-9003-946899e21179" />

After a pulse is successfully generated and cached, the processed activity records are removed from Cosmos DB, enabling the next pulse to analyze only newly accumulated project activity.


### Github Issues
PatchFlow integrates directly with GitHub, allowing teams to connect their repositories and bring development workflows into a single platform. Users can securely authenticate their GitHub accounts, browse accessible repositories, and import issues directly into PatchFlow.  

<img height="200" alt="Image" src="https://github.com/user-attachments/assets/79abc399-6194-49ad-868a-8bca1588d1cc" />

Eliminating the need to manually recreate tasks and ensures that project information remains consistent across both platforms. By centralizing issue management, teams can spend less time switching between tools and more time focusing on development.   

<img height="100" alt="Image" src="https://github.com/user-attachments/assets/52d5c2d9-e132-40bc-bd60-ad41ebd28f7f" />

Once imported, GitHub issues can be managed alongside native PatchFlow tasks through the Kanban Board, Calendar View, and project workspaces.


This seamless integration improves collaboration between project managers and developers, provides better visibility into project status, and helps ensure that development activities remain synchronized throughout the software lifecycle.


## License
IMPORTANT NOTE: Any User who are willing to Share or Re-Distribute PatchFlow are kindly advised to:

1. A link to this repository from the user's 'Modified program' README file. 

This will be helpful for us as users will know it's original source and about our startup.
Please also refer to LICENSE file for clarifications.  
Thank you for your kind co-operation :-)


NexaView Copyright (C) Temavrix 2026  
All Rights Reserved

Version 1.8
