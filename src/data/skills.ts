import type { IconType } from 'react-icons';
import {
  SiClaude,
  SiCursor,
  SiGithub,
  SiGithubcopilot,
  SiJavascript,
  SiNestjs,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiRailway,
  SiReact,
  SiSupabase,
  SiTypescript,
  SiVercel,
} from 'react-icons/si';
import { BsDatabase, BsRobot } from 'react-icons/bs';

export interface TechItem {
  name: string;
  Icon: IconType;
}

export interface TechStackRow {
  label: string;
  direction: 'left' | 'right';
  duration: number;
  items: TechItem[];
}

export const TECH_STACK_ROWS: TechStackRow[] = [
  {
    label: 'Languages',
    direction: 'right',
    duration: 32,
    items: [
      { name: 'JavaScript', Icon: SiJavascript },
      { name: 'TypeScript', Icon: SiTypescript },
      { name: 'Python', Icon: SiPython },
      { name: 'SQL', Icon: BsDatabase },
    ],
  },
  {
    label: 'Tools',
    direction: 'left',
    duration: 54,
    items: [
      { name: 'React', Icon: SiReact },
      { name: 'NestJS', Icon: SiNestjs },
      { name: 'PostgreSQL', Icon: SiPostgresql },
      { name: 'Supabase', Icon: SiSupabase },
      { name: 'GitHub Copilot', Icon: SiGithubcopilot },
      { name: 'Claude', Icon: SiClaude },
      { name: 'OpenAI API', Icon: BsRobot },
      { name: 'Cursor', Icon: SiCursor },
      { name: 'Git/GitHub', Icon: SiGithub },
      { name: 'Vercel', Icon: SiVercel },
      { name: 'Railway', Icon: SiRailway },
      { name: 'Prisma', Icon: SiPrisma },
    ],
  },
];
