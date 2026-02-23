# Employee Management System (EMS)

## Features
- **Role-based access**: Admin, Manager, Employee
- **Manager sees only their department's employees**
- **Resign from Profile**: Employee can submit resignation with a last working day — status changes to "Notice Period"
- **Announcements**: Admin posts notices visible to all users with a count badge in sidebar
- **Audit Logs**: Admin can see all actions (create/update/delete/resign) with who did it and when
- **Manager Notes**: Managers can add private notes on their team members
- **Link to User is now optional** when adding an employee

## Setup

### 1. Database
Run the provided schema in MySQL Workbench or CLI:

**Fresh install:**
```sql
-- Run the full seed script from the repo (includes emp_db creation)
SOURCE path/to/your_seed_script.sql;

-- Then run migration for new tables:
SOURCE database_migration.sql;
```

**If you already had the old ems_db setup:**
Create a new database `emp_db` or rename, then run `database_migration.sql`.

### 2. Backend
```bash
cd backend
# Set DB credentials if different from root/root:
./mvnw spring-boot:run
# OR
mvn spring-boot:run
```
Backend runs on: http://localhost:8080

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5173

## Default Credentials
| Username | Password  | Role     |
|----------|-----------|----------|
| admin    | Admin@123 | ADMIN    |
| manager1 | (your password from seed) | MANAGER |
| emp1     | Admin@123 | EMPLOYEE |

## New API Endpoints
- `POST /api/employees/me/resign` — Submit resignation
- `GET /api/announcements` — Get all active announcements  
- `POST /api/announcements` — Create announcement (Admin only)
- `DELETE /api/announcements/{id}` — Remove announcement (Admin only)
- `GET /api/audit-logs` — Get audit logs (Admin only)
- `GET /api/manager-notes/my-notes` — Manager's own notes
- `POST /api/manager-notes` — Add note on employee
- `DELETE /api/manager-notes/{noteId}` — Delete a note
