import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowUp, X, List, ChatCircleDots, ArrowLeft, ArrowCounterClockwise, Check, Plus } from '@phosphor-icons/react';
import '@fontsource-variable/onest';

const categories = [{ id: 'coffee', label: 'Кофе' }, { id: 'tea', label: 'Не только кофе' }, { id: 'desserts', label: 'Десерты' }];
const items = [
  { id: 'espresso', category: 'coffee', name: 'Эспрессо', size: '35 мл', price: 160, note: 'Насыщенный, плотный, с нотами шоколада.', ingredients: 'Кофе, вода.' },
  { id: 'americano', category: 'coffee', name: 'Американо', size: '200 мл', price: 190, note: 'Мягкий чёрный кофе на каждый день.', ingredients: 'Эспрессо, горячая вода.' },
  { id: 'cappuccino', category: 'coffee', name: 'Капучино', size: '250 мл', price: 240, note: 'Баланс эспрессо, молока и нежной пены.', ingredients: 'Эспрессо, молоко. Содержит молоко.' },
  { id: 'flatwhite', category: 'coffee', name: 'Флэт уайт', size: '200 мл', price: 270, note: 'Двойной эспрессо и тонкая молочная пена.', ingredients: 'Двойной эспрессо, молоко. Содержит молоко.' },
  { id: 'latte', category: 'coffee', name: 'Латте', size: '300 мл', price: 280, note: 'Больше молока, мягче вкус.', ingredients: 'Эспрессо, молоко. Содержит молоко.' },
  { id: 'filter', category: 'coffee', name: 'Фильтр-кофе', size: '250 мл', price: 210, note: 'Чистый вкус без молока. Для неспешного утра.', ingredients: 'Кофе, фильтрованная вода.' },
  { id: 'tea', category: 'tea', name: 'Чай в чайнике', size: '500 мл', price: 290, note: 'Чёрный, зелёный или травяной. На двоих.', ingredients: 'Чай или травяной сбор, вода. Состав зависит от выбранного сбора.' },
  { id: 'cocoa', category: 'tea', name: 'Какао', size: '300 мл', price: 260, note: 'Шоколадный и уютный, с молочной пеной.', ingredients: 'Какао, молоко, сахар. Содержит молоко.' },
  { id: 'matcha', category: 'tea', name: 'Матча-латте', size: '250 мл', price: 310, note: 'Яркая матча и мягкое молоко.', ingredients: 'Матча, молоко. Содержит молоко.' },
  { id: 'lemonade', category: 'tea', name: 'Лимонад', size: '300 мл', price: 250, note: 'Лимон, мята и лёгкие пузырьки.', ingredients: 'Лимон, мята, газированная вода, сахарный сироп.' },
  { id: 'cheesecake', category: 'desserts', name: 'Чизкейк', size: '140 г', price: 340, note: 'Нежный сливочный десерт к любимому кофе.', ingredients: 'Сливочный сыр, сливки, печенье, яйцо, сахар. Содержит молоко, яйцо, глютен.' },
  { id: 'carrot', category: 'desserts', name: 'Морковный торт', size: '150 г', price: 350, note: 'Пряный корж, грецкий орех и сливочный крем.', ingredients: 'Морковь, мука, грецкий орех, яйцо, сливочный сыр, сахар, специи. Содержит орехи, яйцо, молоко, глютен.' },
  { id: 'croissant', category: 'desserts', name: 'Круассан', size: '80 г', price: 190, note: 'Хрустящая корочка, мягкая середина.', ingredients: 'Мука, сливочное масло, молоко, яйцо, дрожжи, сахар. Содержит глютен, молоко, яйцо.' },
  { id: 'cookie', category: 'desserts', name: 'Шоколадное печенье', size: '90 г', price: 170, note: 'С кусочками шоколада и щепоткой соли.', ingredients: 'Мука, масло, яйцо, шоколад, сахар, соль. Содержит глютен, молоко, яйцо.' },
];
const money = amount => `${amount} ₽`;

function Dialog({ title, onClose, children, className = '' }) {
  const ref = useRef(null);
  const previous = useRef(null);
  useEffect(() => {
    previous.current = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; previous.current?.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={ref} className={`dialog ${className}`} aria-label={title} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <button className="icon-button dialog-close" onClick={onClose} aria-label="Закрыть"><X size={24} /></button>
    {children}
  </dialog>;
}

function CoffeeBot({ onClose, onMenu }) {
  const [screen, setScreen] = useState('start');
  const [answer, setAnswer] = useState('');
  const [flavour, setFlavour] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [formError, setFormError] = useState('');
  function showAnswer(text) { setAnswer(text); setScreen('answer'); }
  function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = { name: data.get('name').trim(), contact: data.get('contact').trim(), message: data.get('message').trim() };
    if (Object.values(result).some(value => !value)) { setFormError('Заполните все поля — одних пробелов недостаточно.'); return; }
    setFormError('');
    setReceipt(result);
    setScreen('receipt');
  }
  return <Dialog title="Демонстрация Telegram-бота кофейни Рядом" onClose={onClose} className="bot-dialog">
    <header className="bot-header"><span className="bot-avatar">рядом</span><div><h2>Кофейня «Рядом»</h2><p>Демонстрация сценарного бота</p></div></header>
    <div className="bot-body" aria-live="polite">
      <div className="bot-bubble">{screen === 'start' ? 'Здравствуйте! Рады, что вы рядом. Чем помочь?' : screen === 'choose' ? 'Какой кофе вам нравится?' : screen === 'recommend' ? flavour === 'milk' ? 'Попробуйте капучино — мягкий баланс кофе и молока. А если хочется более насыщенный вкус, выбирайте флэт уайт.' : flavour === 'black' ? 'Для чистого вкуса — фильтр-кофе. Для короткой насыщенной паузы — эспрессо.' : 'У нас есть какао и травяной чай. Откройте раздел «Не только кофе» в меню.' : screen === 'answer' ? answer : screen === 'form' ? 'Оставьте вопрос для кофейни. Это демонстрация: данные останутся на этой странице и никуда не отправятся.' : 'Заявка собрана. В рабочем боте она пришла бы администратору кофейни.'}</div>
      {screen === 'start' && <div className="bot-choices"><button onClick={() => { onMenu('coffee'); onClose(); }}>Посмотреть меню <ArrowUpRight size={18}/></button><button onClick={() => setScreen('choose')}>Помочь выбрать напиток <ArrowUpRight size={18}/></button><button onClick={() => showAnswer('«Рядом» — кофейня у дома с кофе, десертами и посадочными местами. Это концепт BARBOS: реальный адрес и часы работы пока не заданы.')}>О кофейне <ArrowUpRight size={18}/></button><button onClick={() => setScreen('form')}>Оставить вопрос <ArrowUpRight size={18}/></button></div>}
      {screen === 'choose' && <div className="bot-choices">{[['milk', 'Кофе с молоком'], ['black', 'Чёрный кофе'], ['other', 'Без кофе']].map(([id, label]) => <button key={id} onClick={() => { setFlavour(id); setScreen('recommend'); }}>{label}<ArrowUpRight size={18}/></button>)}</div>}
      {screen === 'recommend' && <button className="primary bot-menu-link" onClick={() => { onMenu(flavour === 'other' ? 'tea' : 'coffee'); onClose(); }}>Посмотреть в меню <ArrowUpRight size={20}/></button>}
      {screen === 'form' && <form className="bot-form" onSubmit={submit}>{formError && <p role="alert" className="form-error">{formError}</p>}<label>Как вас зовут<input name="name" required maxLength={80} autoComplete="given-name" /></label><label>Telegram или email<input name="contact" required maxLength={120} autoComplete="off" placeholder="@username или почта" /></label><label>Ваш вопрос<textarea name="message" required maxLength={600} rows={3} /></label><button className="primary" type="submit">Собрать пример заявки <ArrowUpRight size={20}/></button><small>Ничего не отправляется. Можно использовать вымышленные данные.</small></form>}
      {screen === 'receipt' && <div className="bot-receipt"><span className="receipt-label"><Check size={18}/> Пример заявки</span><dl><div><dt>Имя</dt><dd>{receipt.name}</dd></div><div><dt>Контакт</dt><dd>{receipt.contact}</dd></div><div><dt>Вопрос</dt><dd>{receipt.message}</dd></div></dl><p>Это локальный пример — уведомление не отправлено.</p></div>}
    </div>
    {screen !== 'start' && <button className="bot-back text-button" onClick={() => { setScreen('start'); setReceipt(null); }}><ArrowLeft size={18}/> К началу</button>}
    <footer className="bot-footer"><span>Готовые сценарии · без AI</span><button className="icon-button" aria-label="Начать сценарий заново" onClick={() => { setScreen('start'); setReceipt(null); }}><ArrowCounterClockwise size={18}/></button></footer>
  </Dialog>;
}

export function App() {
  const [navOpen, setNavOpen] = useState(false);
  const [category, setCategory] = useState('coffee');
  const [selected, setSelected] = useState(null);
  const [botOpen, setBotOpen] = useState(() => new URLSearchParams(window.location.search).get('bot') === '1');
  const [faqOpen, setFaqOpen] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [active, setActive] = useState('');
  const tabRefs = useRef([]);
  useEffect(() => {
    function onKey(event) { if (event.key === 'Escape') setNavOpen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  function jump(id) { setNavOpen(false); setActive(id); document.getElementById(id)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }
  function showMenu(id) { setCategory(id); requestAnimationFrame(() => jump('menu')); }
  function tabsKey(event, index) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % categories.length;
    else if (event.key === 'ArrowLeft') next = (index + categories.length - 1) % categories.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = categories.length - 1;
    else return;
    event.preventDefault(); setCategory(categories[next].id); tabRefs.current[next]?.focus();
  }
  return <>
    <a className="skip-link" href="#main">К содержанию</a>
    <main id="main">
      <section className="hero" id="top" aria-labelledby="hero-title">
        <img className="hero-image" src="/demos/ryadom/assets/cafe-hero.png" alt="Солнечный интерьер кофейни с деревянными столиками, капучино и десертом" fetchPriority="high" />
        <header className="header page-padding">
          <a href="#top" className="wordmark" aria-label="Рядом — на главную" onClick={e => { e.preventDefault(); jump('top'); }}>рядом</a>
          <button className="mobile-nav-toggle icon-button" aria-label={navOpen ? 'Закрыть меню навигации' : 'Открыть меню навигации'} aria-expanded={navOpen} aria-controls="navigation" onClick={() => setNavOpen(!navOpen)}>{navOpen ? <X size={27}/> : <List size={27}/>}</button>
          <nav id="navigation" className={navOpen ? 'navigation is-open' : 'navigation'} aria-label="Основная навигация">
            {[['menu', 'Меню'], ['about', 'О кофейне'], ['visit', 'Как добраться']].map(([id, label]) => <a key={id} className={active === id ? 'active' : ''} href={`#${id}`} onClick={e => { e.preventDefault(); jump(id); }}>{label}</a>)}
          </nav>
        </header>
        <div className="hero-content page-padding">
          <h1 id="hero-title">Загляните.<br/>Останьтесь.</h1>
          <p>За кофе, десертом<br/>и хорошим разговором.</p>
          <div className="hero-actions"><a className="primary" href="#menu" onClick={e => { e.preventDefault(); jump('menu'); }}>Посмотреть меню</a><a className="underlined" href="#visit" onClick={e => { e.preventDefault(); jump('visit'); }}>Как нас найти</a></div>
        </div>
      </section>
      <section className="about page-padding" id="about" aria-labelledby="about-title">
        <h2 id="about-title">Ваше место<br/>рядом<span className="orange">.</span></h2>
        <button className="photo-button about-photo" onClick={() => setPhoto({ src: '/demos/ryadom/assets/cafe-hands.png', alt: 'Руки бариста подают чашку капучино на солнечном деревянном столе' })} aria-label="Рассмотреть фотографию капучино"><img src="/demos/ryadom/assets/cafe-hands.png" alt="Руки бариста подают чашку капучино" loading="eager"/></button>
        <div className="about-copy"><h3>Здесь можно<br/>никуда не спешить.</h3><p>Уютная атмосфера, продуманные детали и любимый кофе — чтобы встречаться, работать, читать и просто быть рядом.</p></div>
      </section>
      <section className="menu section-spacing page-padding" id="menu" aria-labelledby="menu-title">
        <div className="section-heading"><span className="eyebrow">На каждый день</span><h2 id="menu-title">Любимые вкусы<span className="orange">.</span></h2><p>Знакомая классика и маленькие поводы<br className="desktop-break"/> попробовать что-то новое.</p></div>
        <div className="menu-toolbar"><div className="menu-tabs" role="tablist" aria-label="Разделы меню">{categories.map((cat, index) => <button ref={node => tabRefs.current[index] = node} key={cat.id} id={`tab-${cat.id}`} role="tab" aria-selected={category === cat.id} aria-controls="menu-panel" tabIndex={category === cat.id ? 0 : -1} onKeyDown={e => tabsKey(e, index)} onClick={() => setCategory(cat.id)}>{cat.label}</button>)}</div><span className="menu-note">Пример меню · цены для концепта</span></div>
        <div className="menu-grid" role="tabpanel" id="menu-panel" aria-labelledby={`tab-${category}`} tabIndex={0}>
          {items.filter(item => item.category === category).map((item, index) => <button className="menu-item" key={item.id} onClick={() => setSelected(item)} aria-label={`Подробнее: ${item.name}, ${money(item.price)}`}><span className="menu-index">{String(index + 1).padStart(2, '0')}</span><span className="menu-item-copy"><span className="item-name">{item.name}</span><span className="item-note">{item.note}</span></span><span className="item-end"><span className="item-price">{money(item.price)}</span><span className="item-size">{item.size}</span></span><ArrowUpRight className="item-arrow" size={24}/></button>)}
        </div>
        <div className="menu-help"><p>Не знаете, с чего начать?</p><button className="text-button" onClick={() => setBotOpen(true)}>Поможем выбрать в демоботе <ArrowUpRight size={22}/></button></div>
      </section>
      <section className="slow-section page-padding" aria-labelledby="slow-title"><div className="slow-image"><img src="/demos/ryadom/assets/cafe-hero.png" alt="Столики у окна в тёплом интерьере кофейни" loading="lazy"/></div><div className="slow-copy"><span className="eyebrow">Не только кофе</span><h2 id="slow-title">Пусть дела<br/>подождут<span className="orange">.</span></h2><p>Утром — взять капучино по пути. Днём — встретиться за десертом. Вечером — дочитать ту самую главу.</p><p>Для хорошего повода не нужен особенный день.</p><a className="underlined" href="#menu" onClick={e => { e.preventDefault(); jump('menu'); }}>Найти свой вкус <ArrowUpRight size={21}/></a></div></section>
      <section className="faq-section section-spacing page-padding" aria-labelledby="faq-title"><div><span className="eyebrow">Прежде чем заглянуть</span><h2 id="faq-title">Пара слов<span className="orange">.</span></h2></div><div className="faq-list">{[
        ['Можно посидеть с ноутбуком?', 'Да. В «Рядом» можно поработать, почитать или встретиться за чашкой кофе. Выбирайте удобный столик — и располагайтесь.'],
        ['Что ещё есть, кроме кофе?', 'У нас есть чай, какао, матча-латте и лимонад. А ещё десерты: чизкейк, морковный торт, круассан и печенье.'],
        ['Как работает Telegram-бот?', 'В боте можно посмотреть меню, выбрать напиток по вкусу и оставить вопрос для кофейни. Попробуйте демонстрацию прямо на сайте.'],
      ].map(([question, answer], index) => <div className="faq-row" key={question}><h3><button aria-expanded={faqOpen === index} aria-controls={`faq-${index}`} onClick={() => setFaqOpen(faqOpen === index ? null : index)}>{question}<Plus size={24} className={faqOpen === index ? 'rotated' : ''}/></button></h3><div id={`faq-${index}`} hidden={faqOpen !== index}><p>{answer}</p></div></div>)}</div></section>
      <section className="visit-section page-padding" id="visit" aria-labelledby="visit-title"><div className="visit-heading"><span className="eyebrow">Будем рядом</span><h2 id="visit-title">Увидимся<br/>за чашкой<span>.</span></h2></div><div className="visit-copy"><h3>Пока — в нашем проекте.</h3><p>«Рядом» — концепт кофейни для портфолио BARBOS. У неё пока нет реального адреса и часов работы.</p><p>Но меню, атмосфера и сценарий общения уже здесь. Загляните в демобота — он поможет выбрать напиток и собрать пример обращения.</p><button className="dark-button" onClick={() => setBotOpen(true)}>Попробовать демобота <ChatCircleDots size={24}/></button><span className="visit-note">Без отправки данных и реальных заказов</span></div></section>
    </main>
    <footer className="footer page-padding"><a className="wordmark" href="#top" onClick={e => { e.preventDefault(); jump('top'); }}>рядом</a><span>Кофейня по соседству · концепт</span><a href="/projects/ryadom">Вернуться к кейсу <ArrowUpRight size={18}/></a><button className="icon-button back-top" aria-label="Наверх" onClick={() => jump('top')}><ArrowUp size={23}/></button></footer>
    {selected && <Dialog title={selected.name} onClose={() => setSelected(null)} className="item-dialog"><span className="eyebrow">{categories.find(cat => cat.id === selected.category).label}</span><h2>{selected.name}<span className="orange">.</span></h2><p className="dialog-item-note">{selected.note}</p><div className="item-dialog-meta"><span>{selected.size}</span><strong>{money(selected.price)}</strong></div><h3>Состав</h3><p>{selected.ingredients}</p><p className="concept-note">Пример позиции для концепта. Состав и стоимость уточним при запуске кофейни.</p><button className="primary" onClick={() => setSelected(null)}>Вернуться к меню <ArrowLeft size={20}/></button></Dialog>}
    {botOpen && <CoffeeBot onClose={() => setBotOpen(false)} onMenu={showMenu}/>}
    {photo && <Dialog title="Фотография кофейни" onClose={() => setPhoto(null)} className="photo-dialog"><img src={photo.src} alt={photo.alt}/><p>Визуальный концепт «Рядом» · BARBOS</p></Dialog>}
  </>;
}
