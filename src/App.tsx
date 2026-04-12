import { useState, useEffect, useCallback } from 'react';
import { SECTIONS } from './data/constants';
import Cursor from './components/Cursor';
import Nav from './components/Nav';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  const [active, setActive] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Section tracking via IntersectionObserver
    const sectionObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = SECTIONS.indexOf(
              entry.target.id as (typeof SECTIONS)[number]
            );
            if (idx >= 0) setActive(idx);
          }
        });
      },
      { threshold: 0.4 }
    );

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObs.observe(el);
    });

    // Reveal-on-scroll observer
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el));

    // Scroll detection for nav background
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);

    return () => {
      sectionObs.disconnect();
      revealObs.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const onDotClick = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <>
      <Cursor />
      <Nav active={active} onDotClick={onDotClick} scrolled={scrolled} />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
