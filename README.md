# ZeroToCoder

An e-learning platform for new programmers: courses with lessons, exams and certificates, learning roadmaps, a community forum, job board, bundles and coupons, plus an admin area to manage all of it.

| Part | Stack |
| --- | --- |
| `frontend/` | React 19, Vite 6, React Router 7, styled-components, axios |
| `backend/ZeroToCoder.Api/` | ASP.NET Core 8 Web API, EF Core 9 (SQL Server), JWT auth |
| `backend/ZeroToCoder.Api.Tests/` | xUnit integration tests (in-memory SQLite) |

## Project structure

```
ZeroToCoder/
├── backend/
│   ├── ZeroToCoder.sln
│   ├── ZeroToCoder.Api/
│   │   ├── Common/          # role names, rate-limit policy names
│   │   ├── Controllers/     # thin HTTP endpoints (ApiControllerBase gives CurrentUserId / IsAdmin)
│   │   ├── Data/            # AppDbContext (database-first; table names = DbSet names)
│   │   ├── Dtos/            # request/response contracts with validation attributes
│   │   ├── Extensions/      # ClaimsPrincipal helpers
│   │   ├── Helpers/         # PasswordHasher (PBKDF2)
│   │   ├── Models/          # EF entities
│   │   ├── Options/         # strongly typed settings (Jwt, FileStorage)
│   │   ├── Services/        # TokenService, CommunityService, CvStorage
│   │   └── Program.cs
│   └── ZeroToCoder.Api.Tests/
└── frontend/
    └── src/
        ├── api/             # axios client (base URL + auth header) and API modules
        ├── assets/          # Lottie animations
        ├── auth/            # session persistence helpers
        ├── components/      # layout/, home/, community/, courses/, todo/
        ├── context/         # AuthContext + useAuth hook
        ├── pages/           # admin/, auth/, community/, courses/, faq/, jobs/, payment/, profile/, roadmaps/, todo/
        └── styles/
```

## Running locally

### Prerequisites
- .NET SDK 8+
- Node.js 20+
- SQL Server with the `ZeroToCoder` database

### Backend

Secrets are **not** stored in the repository. Configure them with .NET user-secrets (stored in your user profile):

```bash
cd backend/ZeroToCoder.Api
dotnet user-secrets set "Jwt:Key" "<a random string of at least 32 characters>"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=<YOUR_SERVER>;Database=ZeroToCoder;Trusted_Connection=True;TrustServerCertificate=True;"
dotnet run --launch-profile http        # http://localhost:5067, Swagger at /swagger
```

In production use environment variables instead (`Jwt__Key`, `ConnectionStrings__DefaultConnection`, `Cors__AllowedOrigins__0`, ...). The app refuses to start without a valid `Jwt:Key`.

The schema is database-first (there are no EF migrations). Entity and `DbSet` names map directly to existing tables, so don't rename them without renaming the tables too.

### Frontend

```bash
cd frontend
cp .env.example .env          # adjust VITE_API_URL if the API is not on localhost:5067
npm install
npm run dev                   # http://localhost:5173
```

### Tests & checks

```bash
cd backend && dotnet test     # integration tests, no SQL Server needed
cd frontend && npm run lint && npm run build
```

## Security notes

- Passwords are hashed with salted PBKDF2-SHA256 (210k iterations). Legacy unsalted SHA-256 hashes are still accepted and are upgraded automatically at the next login.
- Every write endpoint requires authentication; course, bundle, coupon, FAQ, job, roadmap and user-management endpoints require the `Admin` role.
- The user is always taken from the JWT, never from the request body or URL (profile, reviews, enrollments, job applications, community).
- Tokens of blocked or deleted users stop working immediately.
- Login/signup are rate limited per IP. CORS only allows the configured frontend origins.
- Uploaded CVs are validated (extension, size, file signature), stored outside the web root, and downloadable only by admins.
- Payment is **simulated**: card details never leave the browser. Integrate a PCI-compliant provider before taking real payments.
