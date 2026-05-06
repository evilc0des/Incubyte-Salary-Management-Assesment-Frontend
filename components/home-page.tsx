const cards = [
  {
    title: "Frontend",
    body: "Next.js App Router with strict TypeScript configuration and Docker support."
  },
  {
    title: "Backend",
    body: "FastAPI with SQLAlchemy 2.x, Alembic migrations, and PostgreSQL connectivity."
  },
  {
    title: "Infrastructure",
    body: "Docker Compose wires the frontend, backend, and database into one local stack."
  }
];

const gettingStarted = [
  "Copy the root .env.example file to .env.",
  "Run docker compose up --build from the orchestration repository.",
  "Push backend and frontend to separate remotes, then attach them as submodules."
];

type HomePageProps = {
  apiUrl: string;
};

export function HomePage({ apiUrl }: HomePageProps) {
  return (
    <main className="page">
      <div className="container">
        <section className="hero">
          <span className="pill">Starter boilerplate</span>
          <h1>FastAPI + Next.js + Postgres</h1>
          <p>
            This frontend is intentionally simple: it is ready for local Docker development and
            already wired to the backend API base URL through an environment variable.
          </p>
        </section>

        <section className="grid">
          {cards.map((card) => (
            <article className="card" key={card.title}>
              <h2>{card.title}</h2>
              <p>{card.body}</p>
            </article>
          ))}

          <article className="card">
            <h2>Getting started</h2>
            <ul>
              {gettingStarted.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="api">
          <strong>Configured API base URL:</strong> <code>{apiUrl}</code>
        </section>
      </div>
    </main>
  );
}
