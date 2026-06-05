# Frontend README

Next.js TypeScript frontend for the Employee Management test project. The UI uses Tailwind CSS for the page layout, sidebar, forms, modal dialogs, and tables. Icons come from `lucide-react`, and the app uses Noto Sans Thai for Thai and English text.

## Requirements

- Node.js 22 or later
- npm
- Backend API running on `http://localhost:5000`

## Frontend Structure

```text
frontend/
|-- app/
|   |-- departments/
|   |-- employees/
|   |-- login/
|   |-- layout.tsx
|   `-- page.tsx
|-- components/
|-- contexts/
|-- locales/
|   |-- en.json
|   `-- th.json
|-- services/
|-- types/
|-- .env.local.example
`-- README.md
```

## Setup

1. Install dependencies:

   ```powershell
   npm.cmd install
   ```

2. Create a local environment file:

   ```powershell
   Copy-Item .env.local.example .env.local
   ```

3. Run the frontend:

   ```powershell
   npm.cmd run dev
   ```

4. Open the app:

   ```text
   http://localhost:3000
   ```

   The app shows the login page first when there is no active JWT token.

## Pages

- `/` - Dashboard
- `/login` - Login page for receiving a JWT token
- `/departments` - Department CRUD page
- `/employees` - Employee CRUD page

Department and employee list pages use server-side pagination. The frontend sends `pageNumber` and `pageSize` to the backend API and displays the returned total count and page count.

## Login And Language

The backend protects department and employee APIs with JWT authentication. Sign in before using CRUD pages.

After login, `services/api.ts` stores the JWT token locally and sends it with API requests as a Bearer token.

The sidebar includes a Thai/English language switch. The selected language is saved in local storage. UI labels and translated API error messages are stored in `locales/en.json` and `locales/th.json`.

## Employee Photo Upload

The employee form supports photo upload through the backend API. Allowed image types are:

- `.jpg`
- `.jpeg`
- `.png`
- `.webp`

The API stores the uploaded file in the backend and saves the returned photo path in the employee record.

## Notes

- API calls are kept in `services/api.ts`.
- `services/api.ts` maps the API field names, such as `Department_Name`, into frontend-friendly TypeScript names.
- `services/api.ts` returns structured API errors.
- `contexts/LanguageContext.tsx` handles language state and translates API error messages for the current language.
- Translation dictionaries are kept in `locales/en.json` and `locales/th.json`.
- Shared TypeScript types are kept in `types`.
- Forms and tables are separated into reusable components.
- `PaginationControls.tsx` is shared by the department and employee list pages.
- No state management library is used because the project only needs page-level state.
- Tailwind CSS utility classes are used directly in frontend components for a clean modern design.

## Useful Commands

```powershell
npm.cmd run typecheck
npm.cmd run build
```
