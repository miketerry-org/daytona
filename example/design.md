````markdown
# Mini Project Management System Using Server-Side JavaScript MVC

This document describes the design for a mini project management system built with a server-rendered JavaScript MVC web framework. The architecture follows traditional MVC patterns found in frameworks like Ruby on Rails or Laravel, but implemented in JavaScript using a server-side rendering approach.

## Project Overview

The system is intended to manage source code projects, including libraries, frameworks, packages, and full web applications. It supports collaborative development, modular architecture, task tracking, versioning, and dependency management.

This application will use a full-stack JavaScript MVC framework (modeled after frameworks like Ruby on Rails and Laravel. It will not separate frontend and backend with an API. Instead, the application will serve complete HTML pages from the server, with minimal or JavaScript on the client side.

## Database Schema

The database schema supports users, projects, modules, tasks, versions, dependencies, and developer roles. All tables are written in SQL and designed for a relational database.

### users

Stores registered users of the application. Each user is uniquely identified by their email address.

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(100) UNIQUE,
  firstname VARCHAR(20),
  lastname VARCHAR(20),
  password_hash VARCHAR(255),
  role ENUM('admin', 'developer'),
  created_at DATETIME,
  updated_at DATETIME
);
```
````

### projects

Projects are top-level containers for libraries, applications, or other software products. Each project is owned by a single user but may include multiple collaborators.

```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100),
  description TEXT,
  type ENUM('webapp', 'restapi, framework', 'package'),
  owner_id INTEGER REFERENCES users(id),
  created_at DATETIME,
  updated_at DATETIME,
  UNIQUE(owner_id, name)
);
```

### project_members

Allows multiple users to collaborate on a project. Each member can have a role such as lead, developer, or viewer.

```sql
CREATE TABLE project_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER REFERENCES projects(id),
  user_id INTEGER REFERENCES users(id),
  role ENUM('lead', 'developer', 'tester', 'viewer'),
  UNIQUE(project_id, user_id)
);
```

### modules

Modules represent subsystems or components within a project. These may include database layers, APIs, or UI layers.

```sql
CREATE TABLE modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER REFERENCES projects(id),
  name VARCHAR(100),
  description TEXT,
  type ENUM('core', 'ui', 'db', 'api'),
  created_at DATETIME,
  UNIQUE(project_id, name)
);
```

### module_owners

Optionally defines users responsible for specific modules. This supports finer-grained collaboration.

```sql
CREATE TABLE module_owners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER REFERENCES modules(id),
  user_id INTEGER REFERENCES users(id),
  role ENUM('owner', 'contributor'),
  UNIQUE(module_id, user_id)
);
```

### tasks

Tasks represent individual units of work within a project or module. Tasks can be assigned to users and tracked through different states.

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER REFERENCES projects(id),
  module_id INTEGER REFERENCES modules(id),
  title VARCHAR(200),
  description TEXT,
  status ENUM('todo', 'in_progress', 'done'),
  priority INTEGER,
  due_date DATE,
  assignee_id INTEGER REFERENCES users(id),
  created_at DATETIME,
  updated_at DATETIME
);
```

### versions

Projects can have one or more version records to track semantic versioning or release milestones.

```sql
CREATE TABLE versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER REFERENCES projects(id),
  version VARCHAR(50),
  notes TEXT,
  released_at DATETIME,
  created_at DATETIME,
  UNIQUE(project_id, version)
);
```

### project_dependencies

Defines relationships between projects where one project depends on another. This supports dependency tracking and version constraints.

```sql
CREATE TABLE project_dependencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER REFERENCES projects(id),
  dependency_id INTEGER REFERENCES projects(id),
  constraint VARCHAR(50),
  UNIQUE(project_id, dependency_id)
);
```

## Server-Side MVC Framework Design

This application will use a server-side JavaScript MVC architecture, where:

- Models manage business logic and data access.
- Controllers handle incoming HTTP requests and coordinate models and views.
- Views are HTML templates rendered on the server and sent to the client.

Each controller responds to route-based URLs and returns a fully rendered HTML page. There is no separate frontend API or SPA.

### Folder Structure Example

```
/app/
  /controllers/
    ProjectsController.js
    TasksController.js
  /models/
    Project.js
    Task.js
  /views/
    /projects/
      index.ejs
      show.ejs
    /tasks/
      list.ejs
/core/
  Router.js
  Controller.js
  Model.js
/public/
  /css/
  /js/
main.js
```

### Routing

Routing maps URL paths to controller actions. For example:

- `GET /projects` → `ProjectsController.index`
- `GET /projects/1` → `ProjectsController.show`
- `POST /projects` → `ProjectsController.create`
- `GET /tasks?project=1` → `TasksController.listByProject`

Routes are declared in a central router file and executed on the server for every request.

### Views

Views are rendered using HTML template files such as EJS, Pug, or another templating engine. The server renders views before sending HTML to the browser.

## Core Features

- User registration and login
- Project creation, editing, and deletion
- Multiple users per project with role-based access
- Modules within each project with optional ownership
- Tasks assigned to users, linked to projects or modules
- Semantic version tracking
- Inter-project dependency management

## Development Plan

1. Build user authentication (register, login, logout)
2. Implement project dashboard with full CRUD operations
3. Add module support for organizing project components
4. Implement task lists with filters by assignee, status, or priority
5. Track project versions with release notes
6. Enable defining dependencies between projects
7. Refine templates and layout for accessibility and usability

## Optional Enhancements

- Markdown editor for notes or version logs
- GitHub or GitLab integration
- Notifications via email or UI alerts
- Search and filtering across tasks and projects

## License

This project may be released under the MIT License.

```

```
