export type GithubRepo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
};

export async function getGithubRepos(username: string) {
  const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, {
    next: { revalidate: 3600 } // This refreshes the data once per hour
  });
  
  if (!response.ok) return [] as GithubRepo[];
  
  return (await response.json()) as GithubRepo[];
}