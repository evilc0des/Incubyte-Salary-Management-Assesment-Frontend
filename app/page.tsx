import { HomePage } from "../components/home-page";

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

  return <HomePage apiUrl={apiUrl} />;
}

