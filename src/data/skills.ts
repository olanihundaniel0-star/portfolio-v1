export interface Skill {
  name: string;
  type: string;
  level: number;
}

export const SKILLS: Skill[] = [
  { name: 'Python', type: 'Language', level: 80 },
  { name: 'React', type: 'Framework', level: 85 },
  { name: 'TypeScript', type: 'Language', level: 75 },
  { name: 'NestJS', type: 'Framework', level: 70 },
  { name: 'Tailwind', type: 'CSS Framework', level: 88 },
  { name: 'JavaScript', type: 'Language', level: 82 },
  { name: 'HTML / CSS', type: 'Markup & Style', level: 90 },
  { name: 'C', type: 'Language', level: 60 },
];
