export function calculateSkillMatch(userSkills: string[], jobText: string): number {
  if (!userSkills.length || !jobText) return 0
  const lower = jobText.toLowerCase()
  const matched = userSkills.filter((skill) => lower.includes(skill.toLowerCase()))
  return Math.min(100, Math.round((matched.length / userSkills.length) * 100))
}
