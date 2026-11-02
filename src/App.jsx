import { useEffect, useRef, useState } from 'react';
import { ListIcon, XIcon, CircleIcon } from '@phosphor-icons/react';
import '@fontsource-variable/onest';
import { development, creative } from './data';
import { Arrow, asset, BotDemo, Contact, Lightbox, Media, Scramble, ServiceSelector } from './components';

export function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [menu, setMenu] = useState(false);
  const [media, setMedia] = useState(null);
  const [selected, setSelected] = useState(null);
  const [telegramNotice, setTelegramNotice] = useState(false);
  const [contactRequest, setContactRequest] = useState(0);
  const nameRef = useRef(null);
  const page = path === '/development' ? 'development' : path === '/creative' ? 'creative' : 'home';
  useEffect(() => {
    const pop = () => { setPath(window.location.pathname); setSelected(null); setMedia(null); setMenu(false); };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  useEffect(() => {
    document.title = page === 'home' ? 'NOVARY — идеи в дело' : page === 'development' ? 'Разработка — NOVARY' : 'Дизайн и креативы — NOVARY';
  }, [page]);
  function navigate(url) {
    const [next, hash] = url.split('#');
    setMedia(null);
    if (window.location.pathname !== next) { window.history.pushState({}, '', url); setPath(next); setSelected(null); }
    else if (hash) window.history.replaceState({}, '', url);
    setMenu(false);
    requestAnimationFrame(() => {
      if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }
  const link = url => event => {
    if (!event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) { event.preventDefault(); navigate(url); }
  };
  const contact = (service = null) => {
    if (service?.id) setSelected(service);
    setContactRequest(v => v + 1);
    setMenu(false);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 400);
  };
  const telegram = () => { setTelegramNotice(true); contact(); };
  return <>
    <a className="skip-link" href="#main">К содержанию</a>
    <header className="site-header container">
      <a href="/" onClick={link('/')} className="wordmark" aria-label="NOVARY — главная">NOVARY</a>
      <nav className={menu ? 'main-nav open' : 'main-nav'} aria-label="Основная навигация">
        <a href="/development" onClick={link('/development')} className={page === 'development' ? 'current' : ''} aria-current={page === 'development' ? 'page' : undefined}>Разработка</a>
        <a href="/creative" onClick={link('/creative')} className={page === 'creative' ? 'current' : ''} aria-current={page === 'creative' ? 'page' : undefined}>Дизайн и креативы</a>
        <a href="/#approach" onClick={link('/#approach')}>Подход</a>
      </nav>
      <button className="button button-orange header-cta" onClick={() => contact()}>Обсудить проект<Arrow diagonal /></button>
      <button className="icon-button mobile-menu" aria-label={menu ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={menu} onClick={() => setMenu(v => !v)}>{menu ? <XIcon /> : <ListIcon />}</button>
    </header>
    <main id="main">
      {page === 'home' ? <Home key="page-home" navigate={navigate} contact={contact} telegram={telegram} onMedia={setMedia} /> : <ServicePage key={'page-' + page} page={page} navigate={navigate} contact={contact} telegram={telegram} onMedia={setMedia} />}
      <Contact key={'contact-' + page} selected={selected} setSelected={setSelected} telegramNotice={telegramNotice} clearTelegram={() => setTelegramNotice(false)} nameRef={nameRef} requestId={contactRequest} title={page === 'home' ? 'project' : 'task'} onTelegram={telegram} />
    </main>
    <footer className="site-footer container"><a href="/" onClick={link('/')} className="wordmark">NOVARY</a><p>Разработка · Дизайн · AI-креативы</p><small>© 2026 NOVARY</small><button onClick={telegram} className="text-link">Написать в Telegram<Arrow diagonal /></button></footer>
    <Lightbox media={media} onClose={() => setMedia(null)} />
  </>;
}

function Workflow({ navigate, contact }) {
  return <div className="workflow">
    <img src={asset('workflow.png')} alt="Ваша задача объединяет разработку и креатив в готовый проект" fetchPriority="high" />
    <a className="workflow-hit flow-dev" href="/development" onClick={e => { e.preventDefault(); navigate('/development'); }} aria-label="Услуги разработки" />
    <a className="workflow-hit flow-creative" href="/creative" onClick={e => { e.preventDefault(); navigate('/creative'); }} aria-label="Услуги дизайна и креативов" />
    <button className="workflow-hit flow-result" onClick={() => contact()} aria-label="Обсудить готовый проект" />
    <CircleIcon weight="fill" className="workflow-signal" aria-hidden="true" />
  </div>;
}

function Home({ navigate, contact, telegram, onMedia }) {
  return <>
    <section className="home-hero container">
      <div className="hero-copy"><h1>Идеи —<br />в <span>дело.</span></h1><p>Разрабатываем сайты и ботов.<br />Создаём дизайн и AI-контент для бизнеса.</p><div className="hero-actions"><button className="button button-orange" onClick={() => contact()}>Обсудить проект<Arrow diagonal /></button><button className="text-link" onClick={telegram}>Написать в Telegram</button></div></div>
      <Workflow navigate={navigate} contact={contact} />
    </section>
    <section className="directions container" aria-label="Направления NOVARY">
      <a href="/development" onClick={e => { e.preventDefault(); navigate('/development'); }}><div><h2>Разработка</h2><p>Сайты · Лендинги · Telegram-боты</p></div><img src={asset('coffee-landing.png')} alt="" /><Arrow /></a>
      <a href="/creative" onClick={e => { e.preventDefault(); navigate('/creative'); }}><div><h2>Дизайн и креативы</h2><p>Рекламные макеты · AI-изображения · AI-видео</p></div><img src={asset('coffee-photo.png')} alt="" /><Arrow /></a>
    </section>
    <section className="home-concept container" id="concepts">
      <div className="concept-heading"><h2>Одна идея.<br />Три воплощения.</h2><p>Изображение, сайт и рекламный креатив<br />в едином стиле.</p></div>
      <div className="home-collage">
        <Media name="coffee-photo.png" alt="Оранжевый кофейный пакет и чашка — концепт" className="coffee-photo" onOpen={onMedia} caption="Изображение" />
        <span className="concept-tag coffee-tag">КОНЦЕПТ</span>
        <Media name="coffee-landing.png" alt="Лендинг кофейни — концепт" className="coffee-site" onOpen={onMedia} caption="Сайт" />
        <Media name="coffee-poster-tall.png" alt="Рекламный постер кофейни — концепт" className="coffee-poster" onOpen={onMedia} caption="Креатив" />
      </div>
    </section>
    <section className="manifesto" id="approach"><div className="container"><div className="manifesto-grid"><h2><Scramble text="Ясно." /><Scramble text="Смело." /><Scramble text="По делу." /></h2><div className="principles"><button><Scramble text="Понятный процесс" /></button><button><Scramble text="Цельный визуальный стиль" /></button><button><Scramble text="Технологии под задачу" /></button></div></div><p>Сначала задача. Затем решение.</p></div></section>
    <section className="process container" aria-label="Этапы работы">{[['Обсуждаем задачу', 'Погружаемся в ваш бизнес и цели.'], ['Согласуем решение', 'Предлагаем подход и план работ.'], ['Создаём', 'Разрабатываем, рисуем, генерируем, собираем.'], ['Передаём результат', 'Вы получаете готовый проект и все материалы.']].map(([title, text], i) => <div key={title}><span className="step-number">0{i + 1}</span><h3>{title}</h3><p>{text}</p></div>)}</section>
  </>;
}

function ServicePage({ page, navigate, contact, telegram, onMedia }) {
  const isDev = page === 'development';
  return <>
    <div className={'service-page-top ' + (isDev ? 'development-top' : 'creative-top')}>
      <img className="page-scene" src={asset(isDev ? 'coffee-background.png' : 'flower-vase.png')} alt="" />
      <section className="page-intro container">
        <div className="breadcrumb"><a href="/" onClick={e => { e.preventDefault(); navigate('/'); }}>Главная</a><span>/</span><span>{isDev ? 'Разработка' : 'Дизайн и креативы'}</span></div>
        <h1>{isDev ? <>Разработка.<br />Под задачу <span>бизнеса.</span></> : <>Дизайн<br />и <span>креативы.</span></>}</h1>
        <p>{isDev ? 'Сайты и Telegram-боты: от содержания и сценария до запуска и проверки.' : 'Визуальные материалы для рекламы, сайтов и соцсетей.'}</p>
        <div className="hero-actions"><button className="button button-orange" onClick={() => contact()}>Обсудить проект<Arrow diagonal /></button><button className="text-link" onClick={telegram}>Написать в Telegram</button></div>
      </section>
      {isDev ? <section className="development-concept container">
        <div className="concept-heading"><h2>От экрана<br /><span>к заявке.</span></h2><p>Пример лендинга и Telegram-бота<br />по заданному сценарию.</p></div>
        <Media name="coffee-landing.png" alt="Концепт лендинга кофейни" className="development-site" onOpen={onMedia} caption="КОНЦЕПТ / КОФЕЙНЯ" />
        <div className="development-bot"><BotDemo /></div>
      </section> : <section className="flower-concept container">
        <h2>Идея<br /><span>расцветает.</span></h2>
        <Media name="flower-vase.png" alt="AI-концепт цветов в вазе" className="flower-main" onOpen={onMedia} caption="AI-изображение" />
        <span className="concept-tag flower-tag">КОНЦЕПТ /<br />ЦВЕТОЧНАЯ МАСТЕРСКАЯ</span>
        <Media name="flower-poster.png" alt="Постер цветочной мастерской" className="flower-poster" onOpen={onMedia} caption="Постер" />
        <Media name="flower-video.png" alt="Кадр AI-видеоконцепта с цветами" className="flower-frame" onOpen={onMedia} caption="Кадр AI-видеоконцепта" />
      </section>}
    </div>
    <ServiceSelector services={isDev ? development : creative} initial={isDev ? 'site' : 'ads'} direction={page} choose={contact} onMedia={onMedia} />
  </>;
}
