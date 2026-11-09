import { useRef, useState } from 'react';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { Arrow, asset, Media } from './components';

const folder = 'portfolio/ryadom/';
const campaign = [
  ['Нежность в паре', 'Капучино и чизкейк'],
  ['Утро рядом', 'Фильтр-кофе и круассан'],
  ['Тёплый повод зайти', 'Какао и шоколадное печенье'],
];

const portfolio = {
  ryadom: { title: 'Рядом', label: 'Кофейня по соседству · концепт', description: 'Лендинг, сценарий бота и шесть рекламных материалов — в одной стилистике.', cover: folder + 'landing-cover.jpg', alt: 'Первый экран лендинга кофейни Рядом' },
  povod: { title: 'Повод', label: 'Цветочная мастерская · концепт', description: 'Ключевой визуал, обложка и три информационных поста для Telegram.', cover: 'portfolio/povod/02-pinned-cover.png', alt: 'Обложка мастерской Повод: Букеты для ваших историй' },
};

export function PortfolioCard({ onNavigate, project = 'ryadom' }) {
  const item = portfolio[project];
  return <a className="portfolio-card" href={'/projects/' + project} onClick={onNavigate}>
    <div className="portfolio-cover"><img src={asset(item.cover)} alt={item.alt} loading="lazy" /></div>
    <div className="portfolio-card-body"><div><span className="case-eyebrow">{item.label}</span><h3>{item.title}</h3></div><p>{item.description}</p><span className="portfolio-card-link">Смотреть проект <Arrow diagonal /></span></div>
  </a>;
}

export function CasePage({ back, onMedia }) {
  const [format, setFormat] = useState('posts');
  const tabs = useRef([]);
  function tabKey(event, index) {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = 1 - index;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 1;
    else return;
    event.preventDefault(); setFormat(next ? 'stories' : 'posts'); tabs.current[next]?.focus();
  }
  return <article className="project-case ryadom-case container">
    <a className="case-back" href="/#concepts" onClick={back}><ArrowLeftIcon aria-hidden="true" size={17} />Портфолио</a>
    <header className="case-intro"><h1>Рядом</h1><div className="case-summary"><span className="case-eyebrow">Кофейня по соседству · концепт</span><p>Лендинг, сценарий бота<br className="case-desktop-break" /> и рекламные креативы.</p><a href="/demos/ryadom/" className="text-link">Смотреть лендинг <Arrow diagonal /></a></div></header>
    <Media name={folder + 'landing-cover.jpg'} alt="Лендинг кофейни Рядом: Загляните. Останьтесь." className="case-hero" onOpen={onMedia} />
    <section className="case-editorial case-task" aria-labelledby="case-task-title"><div className="case-section-label">Задача</div><div><h2 id="case-task-title">Показать место,<br />куда хочется зайти.</h2><p>Кофейня у дома, в которую заглядывают за кофе, десертом и хорошим разговором. На сайте — почувствовать атмосферу, посмотреть меню и выбрать напиток.</p><p>Мы объединили сайт, сценарий общения и рекламу в один образ. Тёплый свет, дерево, керамика, крупный шрифт и оранжевый акцент.</p></div></section>
    <section className="case-visual" aria-labelledby="case-visual-title"><div className="case-visual-copy"><span className="case-eyebrow">Визуальное решение</span><h2 id="case-visual-title">Тепло.<br />Просто.<br />Рядом.</h2><p>Светлая основа даёт фотографиям пространство. Прямая типографика помогает быстро прочитать главное. AI-визуалы интерьера и продуктов поддерживают общую атмосферу.</p></div><Media name={folder + 'cafe-hands.png'} alt="Капучино в руках бариста на солнечном деревянном столе" className="case-atmosphere" onOpen={onMedia} eager={false} /></section>
    <section className="case-editorial" aria-labelledby="case-site-title"><div className="case-section-label">Лендинг</div><div><h2 id="case-site-title">От первого взгляда<br />к любимому вкусу.</h2><p>Знакомим с кофейней, показываем атмосферу и ведём к меню. Три категории, подробности каждой позиции, ответы на вопросы — всё работает и на телефоне.</p><ul className="case-detail-list"><li><span>01</span>Первый экран с интерьером и приглашением</li><li><span>02</span>Меню с составом, объёмом и стоимостью</li><li><span>03</span>Ответы на вопросы перед визитом</li></ul><a className="text-link" href="/demos/ryadom/">Открыть рабочий лендинг <Arrow diagonal /></a></div></section>
    <section className="case-bot" aria-labelledby="case-bot-title"><div className="case-bot-screen"><Media name={folder + 'bot-demo.jpg'} alt="Демонстрация сценарного бота кофейни Рядом с четырьмя ветками диалога" onOpen={onMedia} eager={false} /></div><div className="case-bot-copy"><span className="case-eyebrow">Сценарий общения</span><h2 id="case-bot-title">Поможет<br />определиться.</h2><p>Посмотреть меню, выбрать напиток по вкусу, узнать о кофейне или собрать вопрос администратору. Четыре готовые ветки диалога.</p><a href="/demos/ryadom/?bot=1" className="button button-outline">Попробовать демобота <Arrow diagonal /></a><p className="case-small">Интерактивная демонстрация на сайте. Данные никуда не отправляются. Подключение Telegram-бота — отдельный этап.</p></div></section>
    <section className="case-campaign" aria-labelledby="case-campaign-title"><div className="case-campaign-heading"><div><span className="case-eyebrow">Рекламный комплект</span><h2 id="case-campaign-title">Один характер.<br />Три повода зайти.</h2></div><p>Три сочетания напитков и десертов.<br />Каждое — в формате поста и истории.</p></div><div className="case-campaign-toolbar"><div className="case-format-tabs" role="tablist" aria-label="Формат рекламных материалов">{[['posts', 'Посты'], ['stories', 'Истории']].map(([id, label], i) => <button ref={node => tabs.current[i] = node} key={id} id={'case-tab-' + id} role="tab" aria-selected={format === id} aria-controls="case-campaign-panel" tabIndex={format === id ? 0 : -1} onClick={() => setFormat(id)} onKeyDown={event => tabKey(event, i)}>{label}</button>)}</div><span>{format === 'posts' ? '4:5' : '9:16'} · нажмите, чтобы рассмотреть</span></div><div id="case-campaign-panel" role="tabpanel" aria-labelledby={'case-tab-' + format} className={'case-campaign-grid ' + format} tabIndex={0}>{campaign.map(([title, description], i) => <div className="case-campaign-item" key={title}><Media name={folder + format + '-' + String(i + 1).padStart(2, '0') + '.png'} alt={title + ' — ' + description + ', ' + (format === 'posts' ? 'пост' : 'история')} caption={title} onOpen={onMedia} eager={false} /><p>{description}</p></div>)}</div></section>
    <section className="case-editorial case-result" aria-labelledby="case-result-title"><div className="case-section-label">Результат</div><div><h2 id="case-result-title">Идея стала<br />целым проектом.</h2><dl className="case-deliverables"><div><dt>Сайт</dt><dd>Адаптивный интерактивный лендинг</dd></div><div><dt>Сценарий бота</dt><dd>Четыре ветки с демонстрацией</dd></div><div><dt>AI-визуалы</dt><dd>Интерьер, напитки и десерты</dd></div><div><dt>Реклама</dt><dd>Три сюжета · шесть материалов</dd></div></dl><p className="case-small">«Рядом» — демонстрационный проект BARBOS. Кофейня вымышленная, меню и цены — примеры. Рекламная кампания не запускалась. Результат кейса — готовые материалы и работающий прототип.</p><a href="/#concepts" className="text-link" onClick={back}><ArrowLeftIcon aria-hidden="true" size={18} />К портфолио</a></div></section>
  </article>;
}
