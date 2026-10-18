import { useEffect } from 'react';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import Manifesto from './components/Manifesto.jsx';
import About from './components/About.jsx';
import Experience from './components/Experience.jsx';
import Work from './components/Work.jsx';
import Stack from './components/Stack.jsx';
import Process from './components/Process.jsx';
import Credentials from './components/Credentials.jsx';
import Contact from './components/Contact.jsx';

export default function App() {
  useEffect(() => {
    let cleanup = () => {};
    let off = false;
    import('./motion/init.js').then(({ initMotion, initMagnetic }) => {
      if (off) return;
      const a = initMotion();
      const b = initMagnetic();
      cleanup = () => { a(); b(); };
    });
    return () => { off = true; cleanup(); };
  }, []);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Nav />
      <main id="main">
        <Hero />
        <Manifesto />
        <About />
        <Experience />
        <Work />
        <Stack />
        <Process />
        <Credentials />
      </main>
      <Contact />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
