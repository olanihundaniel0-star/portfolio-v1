export interface Skill {
  name: string;
  type: string;
  level: number;
}

export const SKILLS: Skill[] = [
  { name: 'Python', type: 'Language', level: 70 },
  { name: 'React', type: 'Framework', level: 72 },
  { name: 'TypeScript', type: 'Language', level: 75 },
  { name: 'NestJS', type: 'Framework', level: 50 },
  { name: 'Tailwind', type: 'CSS Framework', level: 88 },
  { name: 'JavaScript', type: 'Language', level: 80 },
  { name: 'HTML / CSS', type: 'Markup & Style', level: 100 },
  { name: 'C', type: 'Language', level: 30 },
];
