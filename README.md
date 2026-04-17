# Synapse AI

Synapse AI is a professional decision analysis platform that transforms meeting transcripts into structured, interactive decision graphs. Using advanced AI, it extracts participants, key decisions, and the rationale behind them, visualizing the entire flow of a meeting in a single glance.

## 🚀 Core Features

-   **AI-Powered Extraction**: Automatically identifies participants and decisions from raw meeting transcripts.
-   **Multi-Format Support**: Supports standard text files (`.txt`, `.md`) and binary documents (`.docx`) through client-side extraction.
-   **Interactive Decision Graphs**: Visualize decisions and their connections using a dynamic React Flow canvas.
-   **Premium Interface**: A modern, slate-themed UI with glassmorphism effects and Material Symbol icons.
-   **Secure Authentication**: Full JWT-based user system with login, registration, and email-based password reset.
-   **Export Capabilities**: Save your decision graphs as high-fidelity PNG images for sharing and documentation.

## 🛠 Tech Stack

-   **Frontend**: Next.js (App Router), React, Tailwind CSS, React Flow.
-   **Backend**: NestJS (Node.js), Prisma (ORM), Passport (JWT).
-   **Database**: PostgreSQL.
-   **AI**: OpenAI API.
-   **Icons**: Material Symbols.

## 🏁 Getting Started

### Prerequisites

-   **Node.js**: v18.x or higher
-   **pnpm**: Recommended package manager
-   **PostgreSQL**: A running instance of PostgreSQL 16

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd synapse
    ```

2.  **Install dependencies**:
    ```bash
    pnpm install
    ```

### Environment Setup

Create a `.env` file in `apps/backend/` and configure the following variables:

```env
DATABASE_URL="postgresql://<user>@localhost:5432/synapse?schema=public"
OPENAI_API_KEY="your-openai-api-key"

# JWT Configuration
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Email Configuration (for Password Reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Synapse AI <your-email@gmail.com>"

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

### Database Initialization

1.  **Create the database** in pgAdmin or via CLI named `synapse`.
2.  **Push the schema**:
    ```bash
    cd apps/backend
    npx prisma db push
    ```

### Running Locally

From the root directory, run:

```bash
pnpm run dev
```

The application will be available at:
-   **Frontend**: `http://localhost:3000` (Login Page)
-   **Backend**: `http://localhost:3001`

## 📂 Project Structure

-   `apps/frontend`: Next.js application containing the UI logic and pages.
-   `apps/backend`: NestJS server handling AI extraction, auth, and database interactions.
-   `packages/ui`: Shared UI component library containing standardized buttons, icons, and upload widgets.
-   `packages/database`: Shared Prisma client and schema definitions.

## 🛡 License

This project is licensed under the UNLICENSED license.
