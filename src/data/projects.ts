export interface Project {
  index: string;
  year: string;
  name: string;
  desc: string;
  stack: string[];
  type: 'stock' | 'portfolio' | 'productivity';
  link: string;
  image: string;
  imageFilter?: string;
  imagePosition?: string;
}

export const PROJECTS: Project[] = [
  {
    index: '01',
    year: '2025',
    name: 'StockPulse',
    desc: 'A digital inventory management platform that tracks stock levels in real-time, manages product catalogs, handles user roles, and generates business reports. Built full-stack with a focus on data clarity and speed.',
    stack: ['React', 'TypeScript', 'Vite', 'Supabase', 'Recharts'],
    type: 'stock',
    link: 'https://stock-pulse-ptt.vercel.app',
    image: '/images/stockpulse-preview.png',
  },
  {
    index: '02',
    year: '2025',
    name: 'Portfolio V1',
    desc: 'My personal portfolio — a React + TypeScript monochrome site built to tell my story cleanly. Featuring scroll-driven animations, a custom cursor, and a brutalist aesthetic with premium polish.',
    stack: ['React', 'TypeScript', 'Vite', 'Vanilla CSS'],
    type: 'portfolio',
    link: '/',
    image: '/images/portfolio-preview.png',
  },
  {
    index: '03',
    year: '2026',
    name: 'Whispr',
    desc: 'Frontend - An AI-powered accountability partner built as a Telegram mini-app. Helps users stick to commitments through structured reminders — powered by Claude.',
    stack: ['React', 'React Query', 'Vite', 'Vanilla CSS', 'Telegram Mini App SDK'],
    type: 'productivity',
    link: 'https://whispr-mini.vercel.app',
    image: '/images/whispr-preview.png',
    imagePosition: 'center top',
    imageFilter: 'brightness(1.2) contrast(1.05) saturate(1.05)',
  },
];
