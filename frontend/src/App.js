import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Link, Route, Routes, useLocation, useParams } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, ChevronRight, Menu, X, ArrowDown, Mail, Play } from "lucide-react";
import Lenis from "lenis";
import axios from "axios";
import { projects } from "@/data/projects";
import "@/App.css";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const EASE = [0.16, 1, 0.3, 1];
const roles = ["UI/UX DESIGNER", "AI VIDEO CREATOR", "VIDEO EDITOR", "MOTION DESIGNER", "GRAPHIC DESIGNER"];
const tools = ["FIGMA", "AFTER EFFECTS", "DAVINCI RESOLVE", "ILLUSTRATOR", "PHOTOSHOP", "BLENDER", "RUNWAY", "EMERGENT"];
const services = [
  ["UI / UX DESIGN", "Interfaces that feel clear, considered and alive."],
  ["AI VIDEO + VISUALS", "New visual languages, directed with intention."],
  ["EDITING + MOTION", "Cuts, pacing and movement that give ideas a pulse."],
  ["GRAPHIC DESIGN", "Visual systems that hold a point of view."],
];
const experiments = [
  { title: "Nexus Interface Reel", poster: "/videos/v1.jpg", video: "/videos/v1.mp4" },
  { title: "Motion — 3D Title Study", poster: "/videos/v2.jpg", video: "/videos/v2.mp4" },
  { title: "Product Film — Dark Metal", poster: "/videos/v3.jpg", video: "/videos/v3.mp4" },
  { title: "Kinetic Type Study", poster: "/videos/v4.jpg", video: "/videos/v4.mp4" },
];

function useLenis() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const lenis = new Lenis({ duration: 1.15, anchors: true });
    let frame;
    const raf = (time) => { lenis.raf(time); frame = requestAnimationFrame(raf); };
    frame = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(frame); lenis.destroy(); };
  }, []);
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  return <motion.div className="scroll-progress" style={{ scaleX }} data-testid="scroll-progress" aria-hidden="true" />;
}

function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 });
  const [active, setActive] = useState(false);
  useEffect(() => {
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    const over = (e) => setActive(Boolean(e.target.closest("a, button, input, textarea")));
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseover", over); };
  }, [x, y]);
  return (
    <>
      <motion.div className="cursor-dot" style={{ x, y }} aria-hidden="true" />
      <motion.div className="cursor-ring" style={{ x: ringX, y: ringY }} animate={{ scale: active ? 1.7 : 1, opacity: active ? 1 : 0.7 }} transition={{ duration: 0.3, ease: EASE }} aria-hidden="true" />
    </>
  );
}

function Loader({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="loader" exit={{ y: "-100%" }} transition={{ duration: 0.9, ease: EASE }} data-testid="intro-loader">
          <motion.span className="loader-mark" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>VED<span>©</span></motion.span>
          <motion.span className="loader-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>PORTFOLIO — MMXXVI</motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MaskedLine({ children, delay = 0 }) {
  return (
    <span className="mask-line">
      <motion.span initial={{ y: "115%" }} animate={{ y: 0 }} transition={{ duration: 1.15, delay, ease: EASE }}>{children}</motion.span>
    </span>
  );
}

function Reveal({ children, delay = 0, className = "", ...rest }) {
  return (
    <motion.div className={className} initial={{ y: 44, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, margin: "-70px" }} transition={{ duration: 0.95, delay, ease: EASE }} {...rest}>
      {children}
    </motion.div>
  );
}

function VideoModal({ video, onClose }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <motion.div className="video-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} data-testid="video-modal">
      <motion.div className="video-modal-inner" initial={{ scale: 0.92, y: 26 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 14 }} transition={{ duration: 0.4, ease: EASE }} onClick={(e) => e.stopPropagation()}>
        <video src={video.video} poster={video.poster} controls autoPlay playsInline data-testid="video-player" />
        <div className="video-modal-bar">
          <span className="mono">{video.title}</span>
          <button type="button" onClick={onClose} aria-label="Close video" data-testid="video-modal-close"><X size={18} /></button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <motion.nav className="nav" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.5, duration: 0.8, ease: EASE }} data-testid="site-navigation">
      <Link to="/" className="wordmark" data-testid="home-link">VED<span>©</span></Link>
      <div className={`nav-links ${open ? "open" : ""}`}>
        <Link to="/work" onClick={() => setOpen(false)} data-testid="work-nav-link">Work</Link>
        <a href="/#services" onClick={() => setOpen(false)} data-testid="services-nav-link">Services</a>
        <a href="/#experiments" onClick={() => setOpen(false)} data-testid="experiments-nav-link">Experiments</a>
        <a href="/#about" onClick={() => setOpen(false)} data-testid="about-nav-link">About</a>
        <a href="/#contact" onClick={() => setOpen(false)} data-testid="contact-nav-link">Contact</a>
      </div>
      <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu" data-testid="mobile-menu-button">{open ? <X /> : <Menu />}</button>
    </motion.nav>
  );
}

function FloatingNav() {
  const { pathname } = useLocation();
  const [active, setActive] = useState("");
  useEffect(() => {
    if (pathname !== "/") { setActive("work"); return undefined; }
    setActive("");
    const ids = ["work", "services", "experiments", "about", "contact"];
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [pathname]);
  const anchor = (id) => (pathname === "/" ? `#${id}` : `/#${id}`);
  const slider = (id) => (active === id ? <motion.span className="nav-slider" layoutId="nav-slider" transition={{ type: "spring", stiffness: 350, damping: 32 }} /> : null);
  const linkCls = (id) => (active === id ? "active" : "");
  return (
    <>
      <motion.nav className="floating-nav" style={{ x: "-50%" }} initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2, duration: 0.9, ease: EASE }} aria-label="Quick navigation" data-testid="floating-navigation">
        <Link to="/work" className={linkCls("work")} data-testid="floating-work-link">{slider("work")}<span>Work</span></Link>
        <a href={anchor("services")} className={linkCls("services")} data-testid="floating-services-link">{slider("services")}<span>Services</span></a>
        <a href={anchor("experiments")} className={linkCls("experiments")} data-testid="floating-experiments-link">{slider("experiments")}<span>Experiments</span></a>
        <a href={anchor("about")} className={linkCls("about")} data-testid="floating-about-link">{slider("about")}<span>About</span></a>
      </motion.nav>
      <motion.a href={anchor("contact")} className={`contact-float ${active === "contact" ? "active" : ""}`} initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2.15, duration: 0.9, ease: EASE }} data-testid="floating-contact-button">
        <span>Start a project</span><ArrowUpRight size={16} />
      </motion.a>
    </>
  );
}

function SectionLabel({ number, children }) {
  return (
    <div className="section-label" data-testid={`section-label-${number}`}>
      <span className="label-index">({number})</span>
      <span>{children}</span>
    </div>
  );
}

function ButtonLink({ to, children, secondary = false }) {
  return (
    <Link to={to} className={`button ${secondary ? "button-secondary" : ""}`} data-testid={`button-${String(children).toLowerCase().replace(/\s/g, "-")}`}>
      {children}<ArrowUpRight size={16} />
    </Link>
  );
}

function ProjectCard({ project, index }) {
  return (
    <motion.div className={`project-cell project-${index % 4}`} initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.9, delay: (index % 2) * 0.12, ease: EASE }}>
      <Link to={`/work/${project.slug}`} className="project-card" data-testid={`project-card-${project.slug}`}>
        <div className="project-image">
          <img src={project.thumbnail} alt={`${project.title} project visual`} loading="lazy" />
          {project.isPlaceholder && <span className="placeholder-tag" data-testid={`placeholder-media-${project.slug}`}>Media placeholder</span>}
          <span className="view-pill">View <ArrowUpRight size={14} /></span>
        </div>
        <div className="project-meta">
          <span className="mono">{String(index + 1).padStart(2, "0")} — {project.category} / {project.year}</span>
          <h3 data-testid={`project-title-${project.slug}`}>{project.title}</h3>
        </div>
      </Link>
    </motion.div>
  );
}

function Home() {
  const heroRef = useRef(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.5 });
  const yContent = useTransform(smooth, [0, 1], [0, 150]);
  const fade = useTransform(smooth, [0, 0.75], [1, 0]);
  const yOrbit = useTransform(smooth, [0, 1], [0, -130]);
  return (
    <main>
      <section className="hero" ref={heroRef} data-testid="hero-section">
        <div className="aurora" aria-hidden="true"><i /><i /><i /></div>
        <motion.div className="hero-orbit" style={{ y: yOrbit }}>
          <motion.div className="orbit-rings" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} aria-hidden="true"><span /></motion.div>
          <div className="hero-photo" data-testid="hero-photo"><img src="/vedansh.png" alt="Portrait of Vedansh Gothi" /></div>
        </motion.div>
        <motion.div className="hero-spark" animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.8, 0.35] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} aria-hidden="true" />
        <motion.div className="hero-top" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.8, ease: EASE }}>
          <span className="eyebrow">MUMBAI, INDIA</span>
          <span className="eyebrow status"><i /> OPEN TO NEW OPPORTUNITIES</span>
        </motion.div>
        <motion.div className="hero-content" style={{ y: yContent, opacity: fade }}>
          <motion.p className="eyebrow hero-kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.45, duration: 0.8 }}>MULTI-DISCIPLINARY CREATIVE</motion.p>
          <h1 data-testid="hero-name">
            <MaskedLine delay={1.5}>Vedansh</MaskedLine>
            <MaskedLine delay={1.62}>Gothi<span className="dot">.</span></MaskedLine>
          </h1>
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.85, duration: 0.9, ease: EASE }}>
            <p className="hero-copy">I design interfaces, cut films and direct AI visuals, all in one workflow.</p>
            <div className="hero-actions">
              <ButtonLink to="/work">Explore work</ButtonLink>
              <a href="#contact" className="text-link" data-testid="hero-contact-link">Start a conversation <ArrowDown size={16} /></a>
            </div>
          </motion.div>
        </motion.div>
        <motion.div className="hero-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1, duration: 0.9 }}>
          <span className="mono">SCROLL TO EXPLORE</span>
          <div className="role-ticker">{roles.map((role) => <span key={role}>{role} <b>✳</b></span>)}</div>
        </motion.div>
      </section>

      <section className="marquee-section" data-testid="tools-section">
        <div className="marquee">
          {[0, 1].map((copy) => (
            <div className="marquee-track" key={copy} aria-hidden={copy === 1}>
              {tools.map((t) => <span key={t}>{t} <b>✳</b></span>)}
            </div>
          ))}
        </div>
      </section>

      <section className="section featured" id="work">
        <Reveal><SectionLabel number="1">SELECTED WORK</SectionLabel></Reveal>
        <div className="section-intro">
          <Reveal delay={0.05}><h2>Selected<br /><em>thinking.</em></h2></Reveal>
          <Reveal delay={0.12}><p>A few places where structure, story and visual rhythm meet. More work is always in progress.</p></Reveal>
          <Reveal delay={0.18}><ButtonLink to="/work" secondary>View all work</ButtonLink></Reveal>
        </div>
        <div className="project-grid">{projects.slice(0, 4).map((p, i) => <ProjectCard project={p} index={i} key={p.slug} />)}</div>
      </section>

      <section className="section services" id="services">
        <Reveal><SectionLabel number="2">WHAT I DO</SectionLabel></Reveal>
        <div className="services-list">
          {services.map(([t, d], i) => (
            <Reveal className="service-row" delay={i * 0.06} key={t} data-testid={`service-row-${i}`}>
              <span className="service-no">0{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
              <ChevronRight />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section experiments" id="experiments">
        <Reveal><SectionLabel number="3">EXPERIMENTS</SectionLabel></Reveal>
        <div className="experiment-grid">
          <Reveal><div><span className="mono">01 / AI IMAGE + VIDEO</span><h2>Curiosity<br /><em>in motion.</em></h2></div></Reveal>
          <Reveal delay={0.1}><p>Small studies in generative image, motion, sound and interaction — a space for testing what a new tool can make possible.</p></Reveal>
        </div>
        <Reveal delay={0.12} className="video-rail" data-testid="experiments-rail">
          <div className="video-track">
            {[0, 1].map((copy) => experiments.map((v, i) => (
              <button type="button" className="video-card" key={`${copy}-${v.title}`} onClick={() => setActiveVideo(v)} aria-hidden={copy === 1} tabIndex={copy === 1 ? -1 : undefined} data-testid={copy === 0 ? `experiment-card-${i}` : undefined}>
                <img src={v.poster} alt={`${v.title} video poster`} loading="lazy" />
                <span className="video-play"><Play size={16} fill="currentColor" /></span>
                <span className="video-title mono">{v.title}</span>
              </button>
            )))}
          </div>
        </Reveal>
      </section>

      <AnimatePresence>{activeVideo && <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />}</AnimatePresence>

      <section className="section about" id="about">
        <Reveal><SectionLabel number="4">ABOUT / APPROACH</SectionLabel></Reveal>
        <div className="about-grid">
          <Reveal><h2>Design as<br /><em>an ecosystem.</em></h2></Reveal>
          <Reveal delay={0.12}>
            <div>
              <p className="large-copy">My IT background lets me treat every interface as a system, not a static screen.</p>
              <p>I move between product thinking, visual craft and emerging tools to make work that is useful, expressive and built to connect.</p>
              <div className="about-links">
                <a href="https://www.linkedin.com/in/vedanshkumargothi/" target="_blank" rel="noreferrer" data-testid="linkedin-link">LinkedIn <ArrowUpRight size={15} /></a>
                <a href="mailto:vedanshpatel1611@gmail.com" data-testid="about-email-link">Email me <ArrowUpRight size={15} /></a>
                <a href="https://drive.google.com/file/d/1opKsLNoVtbSsCBvVGEx072IA_EAWKvMW/view?usp=sharing" target="_blank" rel="noreferrer" data-testid="resume-link">Resume <ArrowUpRight size={15} /></a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section experience">
        <Reveal><SectionLabel number="5">EXPERIENCE / EDUCATION</SectionLabel></Reveal>
        <div className="timeline">
          {[["NOV 2024 — APR 2025", "UI/UX Design Intern", "Intellectsia AI"],
            ["2022 — 2026", "B.E. Information Technology", "Atharva College of Engineering / Mumbai University"],
            ["ONGOING", "Community & leadership", "CSI management team leader · GDSC member · Hackathons & bootcamps"]].map(([d, t, s], i) => (
            <Reveal delay={i * 0.08} key={t}><div className="timeline-cell"><span className="mono">{d}</span><h3>{t}</h3><p>{s}</p></div></Reveal>
          ))}
        </div>
      </section>

      <Contact />
    </main>
  );
}

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", project_type: "", message: "", website: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      await axios.post(`${API}/contact`, form);
      setSent(true);
      setForm({ name: "", email: "", project_type: "", message: "", website: "" });
    } catch {
      setSent(false);
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="section contact" id="contact">
      <Reveal><SectionLabel number="6">GET IN TOUCH</SectionLabel></Reveal>
      <div className="contact-heading">
        <Reveal><div><span className="contact-kicker">AVAILABLE FOR SELECT PROJECTS</span><h2>Let’s make<br /><em>something real.</em></h2></div></Reveal>
        <Reveal delay={0.12}><p>Have an idea, a rough direction, or just a question? Send it over. I’ll get back to you with a thoughtful next step.</p></Reveal>
      </div>
      <div className="contact-grid">
        <Reveal className="contact-aside">
          <span className="contact-index">01</span>
          <p>For collaborations, freelance work, and creative experiments.</p>
          <a className="email-display" href="mailto:vedanshpatel1611@gmail.com" data-testid="direct-email-link">vedanshpatel1611@gmail.com <ArrowUpRight /></a>
          <div className="contact-links">
            <a href="https://www.linkedin.com/in/vedanshkumargothi/" target="_blank" rel="noreferrer" data-testid="contact-linkedin-link">LinkedIn <ArrowUpRight size={15} /></a>
            <a href="https://drive.google.com/file/d/1opKsLNoVtbSsCBvVGEx072IA_EAWKvMW/view?usp=sharing" target="_blank" rel="noreferrer" data-testid="contact-resume-link">Resume <ArrowUpRight size={15} /></a>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <form onSubmit={submit} data-testid="contact-form">
            <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="contact-name-input" /></label>
            <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="contact-email-input" /></label>
            <label>Project type<input required value={form.project_type} onChange={(e) => setForm({ ...form, project_type: e.target.value })} placeholder="UI/UX, video, something new..." data-testid="contact-project-input" /></label>
            <label>Message<textarea required rows="4" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="contact-message-input" /></label>
            <input className="honeypot" tabIndex="-1" autoComplete="off" aria-hidden="true" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} data-testid="contact-website-input" />
            <button className="button" disabled={loading} data-testid="contact-submit-button">{loading ? "Sending..." : "Send enquiry"}<ArrowUpRight size={16} /></button>
            {sent && <p className="success" data-testid="contact-success-message">Thanks — your note is on its way.</p>}
            {error && <p className="form-error" data-testid="contact-error-message">Something went wrong. Please try again or email directly.</p>}
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Work() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "UI/UX", "AI Video", "Video Editing", "Graphic", "Motion"];
  const list = useMemo(() => (filter === "All" ? projects : projects.filter((p) => p.category === filter)), [filter]);
  return (
    <main className="work-page">
      <div className="page-heading">
        <Reveal><SectionLabel number="1">THE WORK</SectionLabel></Reveal>
        <Reveal delay={0.08}><h1>A collection of<br /><em>in-progress thinking.</em></h1></Reveal>
        <Reveal delay={0.14}><p>Projects across product, moving image and visual systems — made with curiosity and care.</p></Reveal>
      </div>
      <Reveal className="filters" delay={0.2} data-testid="work-filters">
        {filters.map((f) => <button className={filter === f ? "active" : ""} onClick={() => setFilter(f)} key={f} data-testid={`filter-${f.toLowerCase().replace("/", "-").replace(" ", "-")}`}>{f}</button>)}
      </Reveal>
      <div className="project-grid work-grid">{list.map((p, i) => <ProjectCard project={p} index={i} key={p.slug} />)}</div>
    </main>
  );
}

function ProjectDetail() {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug) || projects[0];
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  return (
    <main className="detail-page">
      <Reveal><Link to="/work" className="back-link" data-testid="back-to-work-link">← Back to work</Link></Reveal>
      <div className="detail-hero">
        <Reveal><div><span className="mono">{project.category} / {project.year}</span><h1>{project.title}</h1><p>{project.description}</p></div></Reveal>
        <Reveal delay={0.12}><div className="detail-image"><img src={project.thumbnail} alt={`${project.title} visual`} />{project.isPlaceholder && <span className="placeholder-tag">Media placeholder</span>}</div></Reveal>
      </div>
      <Reveal className="detail-info">
        <div><span className="mono">ROLE</span><p>{project.role}</p></div>
        <div><span className="mono">TOOLS</span><p>{project.tools.join(" · ")}</p></div>
        <div><span className="mono">STATUS</span><p>{project.isPlaceholder ? "Placeholder study" : "Selected case study"}</p></div>
      </Reveal>
      {project.video_url && (
        <Reveal className="detail-video">
          <span className="mono">FILM / MOTION</span>
          <a href={project.video_url} target="_blank" rel="noreferrer" data-testid="project-video-link">Watch the film <ArrowUpRight size={18} /></a>
        </Reveal>
      )}
      <div className="process">
        <Reveal><SectionLabel number="2">PROCESS</SectionLabel></Reveal>
        {project.process.map((x, i) => (
          <Reveal className="process-row" delay={i * 0.07} key={x}><span>0{i + 1}</span><h2>{x}</h2></Reveal>
        ))}
      </div>
      <div className="detail-gallery">
        <Reveal className="gallery-note"><span className="mono">MEDIA NOTE</span><p>{project.isPlaceholder ? "This project is a clearly marked placeholder. Real media and links will be added when available." : "A focused visual study from the project."}</p></Reveal>
        {project.gallery.map((img) => <Reveal key={img}><img src={img} alt={`${project.title} detail`} loading="lazy" /></Reveal>)}
      </div>
      <Reveal><Link to={`/work/${next.slug}`} className="next-project" data-testid="next-project-link"><span className="mono">NEXT PROJECT</span><h2>{next.title} <ArrowUpRight /></h2></Link></Reveal>
    </main>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  useLenis();
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1300);
    return () => clearTimeout(t);
  }, []);
  return (
    <BrowserRouter>
      <div className="App">
        <Loader show={loading} />
        <div className="grain" aria-hidden="true" />
        <ScrollProgress />
        <Cursor />
        <ScrollToTop />
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:slug" element={<ProjectDetail />} />
        </Routes>
        <FloatingNav />
        <footer>
          <span className="wordmark">VED<span>©</span></span>
          <span className="mono">© 2026 / MADE IN MUMBAI</span>
          <a href="mailto:vedanshpatel1611@gmail.com" data-testid="footer-email-link"><Mail size={15} /></a>
        </footer>
      </div>
    </BrowserRouter>
  );
}
