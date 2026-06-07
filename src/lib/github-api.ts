export interface GitHubRepo {
  name: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  topics: string[]
  updatedAt: string
  readme: string | null
}

export interface GitHubProfileData {
  username: string
  publicRepos: number
  followers: number
  totalStars: number
  repos: GitHubRepo[]
  languages: Record<string, number>
  recentActivity: boolean
}

export async function fetchGitHubProfile(username: string): Promise<GitHubProfileData | null> {
  try {
    const [reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=30&sort=updated`, {
        headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "HirePilot/1.0" },
        signal: AbortSignal.timeout(5000),
      }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=5`, {
        headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "HirePilot/1.0" },
        signal: AbortSignal.timeout(5000),
      }),
    ])

    if (!reposRes.ok) return null

    const repos: Array<{
      name: string
      description: string | null
      language: string | null
      stargazers_count: number
      forks_count: number
      topics: string[]
      updated_at: string
      fork: boolean
    }> = await reposRes.json()

    const events = eventsRes.ok ? await eventsRes.json() : []
    const recentCommit = Array.isArray(events) && events.some((e: { type?: string }) => e.type === "PushEvent")

    const repoData: GitHubRepo[] = repos
      .filter((r) => !r.fork)
      .slice(0, 10)
      .map((r) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        topics: r.topics || [],
        updatedAt: r.updated_at,
        readme: null,
      }))

    const languages: Record<string, number> = {}
    for (const r of repoData) {
      if (r.language) {
        languages[r.language] = (languages[r.language] || 0) + 1
      }
    }

    const totalStars = repoData.reduce((sum, r) => sum + r.stars, 0)

    const topRepos = repoData.slice(0, 3)
    await Promise.allSettled(
      topRepos.map(async (repo) => {
        try {
          const readmeRes = await fetch(
            `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo.name)}/readme`,
            {
              headers: { Accept: "application/vnd.github.v3.raw", "User-Agent": "HirePilot/1.0" },
              signal: AbortSignal.timeout(3000),
            }
          )
          if (readmeRes.ok) {
            const text = await readmeRes.text()
            repo.readme = text.slice(0, 2000)
          }
        } catch {}
      })
    )

    return {
      username,
      publicRepos: repos.length,
      followers: 0,
      totalStars,
      repos: repoData,
      languages,
      recentActivity: recentCommit,
    }
  } catch {
    return null
  }
}

export function formatGitHubDataForAI(data: GitHubProfileData): string {
  const lines = [
    `GitHub Profile: ${data.username}`,
    `Public Repos: ${data.publicRepos}`,
    `Total Stars: ${data.totalStars}`,
    `Recent Activity: ${data.recentActivity ? "Active (recent commits)" : "No recent commits detected"}`,
  ]

  if (Object.keys(data.languages).length > 0) {
    const langList = Object.entries(data.languages)
      .sort((a, b) => b[1] - a[1])
      .map(([lang, count]) => `${lang} (${count} repos)`)
    lines.push(`Languages: ${langList.join(", ")}`)
  }

  if (data.repos.length > 0) {
    lines.push("")
    lines.push("Repositories:")
    for (const repo of data.repos) {
      lines.push(`  - ${repo.name}${repo.description ? `: ${repo.description}` : ""} [${repo.language || "N/A"}, ${repo.stars} stars]`)
      if (repo.readme) {
        lines.push(`    README: ${repo.readme.slice(0, 500).replace(/\n/g, " ")}`)
      }
    }
  }

  return lines.join("\n")
}
