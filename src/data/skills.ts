export interface Skill {
  name: string;
  type: string;
  level: number;
}

export const SKILLS: Skill[] = [
  { name: 'JavaScript', type: 'Language', level: 80 },
  { name: 'TypeScript', type: 'Language', level: 75 },
  { name: 'HTML', type: 'Markup', level: 90 },
  { name: 'CSS', type: 'Style', level: 90 },
  { name: 'Python', type: 'Language', level: 70 },
];
