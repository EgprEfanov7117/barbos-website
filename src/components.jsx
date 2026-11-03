import { useEffect, useRef, useState } from 'react';
import { ArrowRightIcon, ArrowUpRightIcon, CheckIcon, CopyIcon, PaperPlaneTiltIcon, XIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { money } from './data';

export const asset = (name) => '/assets/' + name;
export const Arrow = ({ diagonal = false, ...props }) => diagonal ? <ArrowUpRightIcon aria-hidden="true" weight="regular" {...props} /> : <ArrowRightIcon aria-hidden="true" weight="regular" {...props} />;

export function Scramble({ text, children, as: Tag = 'span', className = '' }) {
  const [value, setValue] = useState(text);
  const timer = useRef(null);
  useEffect(() => () => clearInterval(timer.current), []);
  const run = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    clearInterval(timer.current);
    let step = 0;
    const alphabet = 'НОВАРИ01/×';
    timer.current = setInterval(() => {
      step += 1;
      setValue([...text].map((c, i) => c === ' ' || i < step / 1.5 ? c : alphabet[Math.floor(Math.random() * alphabet.length)]).join(''));
      if (step >= text.length * 1.5) { clearInterval(timer.current); setValue(text); }
    }, 28);
  };
  return <Tag className={className} onMouseEnter={run} onFocus={run}><span aria-hidden="true">{value}</span><span className="sr-only">{text}</span>{children}</Tag>;
}

export function ProjectWheel({ onClick }) {
  return <button className="project-wheel" onClick={onClick} aria-label="Обсудить проект">
    <img src={asset('project-wheel.png')} alt="" className="wheel-art" />
    <span className="wheel-center">Обсудить<br />проект <Arrow diagonal /></span>
  </button>;
}

export function Media({ name, alt, className = '', onOpen, caption, eager = true }) {
  return <figure className={'artwork ' + className}>
    <button type="button" className="media-button" aria-label={'Рассмотреть: ' + alt} onClick={() => onOpen?.({ name, alt, caption })}>
      <img src={asset(name)} alt={alt} loading={eager ? 'eager' : 'lazy'} />
    </button>
    {caption && <figcaption>{caption}</figcaption>}
  </figure>;
}

export function Lightbox({ media, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    if (media) ref.current?.showModal();
    else if (ref.current?.open) ref.current.close();
  }, [media]);
  return <dialog className="lightbox" ref={ref} onClose={onClose} onClick={e => { if (e.target === ref.current) onClose(); }} aria-label="Просмотр концепта">
    <button className="icon-button lightbox-close" onClick={onClose} aria-label="Закрыть просмотр"><XIcon size={28} /></button>
    {media && <><img src={asset(media.name)} alt={media.alt} /><p>{media.caption || media.alt}</p></>}
  </dialog>;
}

export function BotDemo({ compact = false }) {
  const [stage, setStage] = useState('start');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [draft, setDraft] = useState('');
  const send = e => {
    e.preventDefault();
    if (!draft.trim()) return;
    if (stage === 'name') { setName(draft.trim()); setStage('contact'); }
    else if (stage === 'contact') { setContact(draft.trim()); setStage('done'); }
    setDraft('');
  };
  const reset = () => { setStage('start'); setName(''); setContact(''); setDraft(''); };
  return <div className={'bot-demo ' + (compact ? 'compact' : '')}>
    <div className="bot-header"><span className="bot-avatar"><PaperPlaneTiltIcon weight="fill" /></span><span>Кофейня<small>демонстрационный бот</small></span><button className="icon-button" onClick={reset} aria-label="Начать сценарий заново"><ArrowCounterClockwiseIcon /></button></div>
    <div className="bot-messages" aria-live="polite">
      <div className="bubble">Здравствуйте!<br />Чем помочь?</div>
      <div className="bot-actions"><button onClick={() => setStage('menu')}>Меню <Arrow size={16} /></button><button onClick={() => setStage('name')}>Оставить заявку <Arrow size={16} /></button></div>
      {stage === 'start' && <div className="bubble">Оставьте контакт для ответа.</div>}
      {stage === 'menu' && <div className="bubble">Здесь бот показывает готовый ответ на вопрос клиента.<button className="bubble-link" onClick={() => setStage('name')}>Перейти к заявке <Arrow size={16} /></button></div>}
      {stage === 'name' && <div className="bubble">Как к вам обращаться?</div>}
      {name && <div className="bubble user-bubble">{name}</div>}
      {(stage === 'contact' || stage === 'done') && <div className="bubble">Оставьте контакт для ответа.</div>}
      {contact && <div className="bubble user-bubble">{contact}</div>}
      {stage === 'done' && <div className="bubble">Спасибо, {name}! Сценарий завершён. Это пример — данные никуда не отправлены.<button className="bubble-link" onClick={reset}>Попробовать ещё раз</button></div>}
    </div>
    {(stage === 'name' || stage === 'contact') && <form className="bot-input" onSubmit={send}><input aria-label={stage === 'name' ? 'Имя для примера бота' : 'Контакт для примера бота'} placeholder={stage === 'name' ? 'Ваше имя' : 'Telegram или email'} value={draft} onChange={e => setDraft(e.target.value)} autoComplete="off" /><button aria-label="Ответить боту"><PaperPlaneTiltIcon /></button></form>}
    <p className="bot-note">Пример сценарного бота</p>
  </div>;
}

export function ServiceSelector({ services, initial, direction, choose, onMedia }) {
  const [activeId, setActiveId] = useState(initial);
  const [addon, setAddon] = useState(false);
  const refs = useRef([]);
  const current = services.find(s => s.id === activeId) || services[0];
  const pick = id => { setActiveId(id); setAddon(false); };
  const keyboard = (event, index) => {
    let target;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') target = (index + 1) % services.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') target = (index - 1 + services.length) % services.length;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = services.length - 1;
    if (target !== undefined) { event.preventDefault(); pick(services[target].id); refs.current[target]?.focus(); }
  };
  const total = current.price === null ? null : current.price + (current.addon === 'voice' && addon ? 2000 : 0);
  return <section className="services-section container" id="services">
    <h2 className="selector-heading">Выбери своё решение</h2>
    <p className="selector-intro">Выберите услугу — посмотрите, для какой задачи она подходит и что входит в стоимость.</p>
    <div className="service-selector">
      <div className="service-tabs" role="tablist" aria-label="Услуги" aria-orientation="vertical">
        {services.map((service, i) => <button key={service.id} role="tab" ref={el => refs.current[i] = el} id={'tab-' + service.id} aria-controls="service-details" aria-selected={activeId === service.id} tabIndex={activeId === service.id ? 0 : -1} className={'service-tab ' + (activeId === service.id ? 'active' : '')} onKeyDown={e => keyboard(e, i)} onClick={() => pick(service.id)}>
          <span className="tab-name">{service.label}<Arrow /></span><span className="tab-price">{service.price === null ? 'После оценки задачи' : money(service.price)}</span><span className="tab-time">{service.price === null ? '' : service.time}</span>
        </button>)}
      </div>
      <div className="service-details" role="tabpanel" id="service-details" aria-labelledby={'tab-' + current.id} key={current.id}>
        <div className="service-copy"><h3>{current.name}</h3><p className="service-result">{current.result}</p><p className="service-fit"><strong>Подойдёт, если</strong> {current.fit}</p><ul>{current.scope.map(item => <li key={item}>{item}</li>)}</ul>
          {current.caseStudy && <a className="text-link service-case-link" href={current.caseStudy.href}>Посмотреть концепт «{current.caseStudy.name}»<Arrow diagonal /></a>}
          <div className="service-cost"><strong>{total === null ? 'После оценки задачи' : money(total)}</strong><span>{current.time}</span>{current.addon === 'voice' && addon && <small>15 000 ₽ + AI-озвучка 2 000 ₽</small>}</div>
          <button className="button button-outline" onClick={() => choose({ ...current, direction, addon: addon ? current.addon : null, total })}>{current.id === 'updates' ? 'Описать задачу' : 'Обсудить проект'}<Arrow diagonal /></button>
        </div>
        <div className={'service-visual ' + (current.imageClass || '')}>
          {current.bot ? <BotDemo compact /> : <Media name={current.image} alt={current.alt} onOpen={onMedia} caption={current.caption || (direction === 'development' ? 'КОНЦЕПТ / КОФЕЙНЯ' : 'КОНЦЕПТ / ЦВЕТОЧНАЯ МАСТЕРСКАЯ')} />}
        </div>
        {current.addon && <label className="service-addon"><span className="checkbox-wrap"><input type="checkbox" checked={addon} onChange={e => setAddon(e.target.checked)} /><CheckIcon /></span><span><strong>{current.addon === 'cms' ? 'Самостоятельное редактирование — платная опция' : 'Дополнительно: AI-озвучка +2 000 ₽'}</strong>{current.addon === 'cms' && <><span>Тексты, фото и услуги через панель управления. Настройка и инструкция.</span><small>Индивидуальный расчёт.</small></>}</span></label>}
      </div>
    </div>
    <p className="terms-note">Предварительные сроки подтвердим после согласования задачи и даты старта.</p>
  </section>;
}

export function Contact({ selected, setSelected, telegramNotice, clearTelegram, nameRef, requestId, requestedDirection, title, onTelegram }) {
  const [mode, setMode] = useState('complex');
  const [values, setValues] = useState({ name: '', contact: '', task: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('form');
  const [copied, setCopied] = useState(false);
  const pendingRequest = useRef(null);
  const receipt = useRef(null);
  const [sendError, setSendError] = useState('');
  const [website, setWebsite] = useState('');
  useEffect(() => { pendingRequest.current?.abort(); pendingRequest.current = null; setStatus('form'); setCopied(false); setErrors({}); setSendError(''); }, [requestId]);
  useEffect(() => () => pendingRequest.current?.abort(), []);
  useEffect(() => { if (requestedDirection) setMode(requestedDirection); }, [requestId, requestedDirection]);
  useEffect(() => { if (selected) { pendingRequest.current?.abort(); pendingRequest.current = null; setMode(selected.direction); setStatus('form'); setSendError(''); } }, [selected]);
  const change = e => { setValues(v => ({ ...v, [e.target.name]: e.target.value })); setErrors(v => ({ ...v, [e.target.name]: '' })); setCopied(false); };
  const summary = selected ? [
    `${selected.name} — ${selected.total === null ? 'после оценки' : money(selected.total)}`,
    selected.addon === 'cms' ? 'Редактирование: отдельный индивидуальный расчёт' : selected.addon === 'voice' ? 'AI-озвучка включена в сумму (+2 000 ₽)' : '',
  ].filter(Boolean).join(' · ') : 'Индивидуальная задача';
  const send = async e => {
    e.preventDefault();
    if (pendingRequest.current) return;
    const next = {};
    const address = values.contact.trim();
    const isTelegram = /^@?[a-zA-Z][a-zA-Z0-9_]{3,31}$/.test(address);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address);
    const digitCount = (address.match(/\d/g) || []).length;
    const isPhone = /^\+?[\d ()-]+$/.test(address) && digitCount >= 7 && digitCount <= 15;
    if (!values.name.trim()) next.name = 'Как к вам обращаться?';
    if (!address) next.contact = 'Оставьте Telegram или email.';
    else if (!isTelegram && !isEmail && !isPhone) next.contact = 'Проверьте контакт: например, @username или name@example.com.';
    setErrors(next);
    if (Object.keys(next).length) { document.getElementById(next.name ? 'contact-name' : 'contact-address')?.focus(); return; }
    setCopied(false);
    setSendError('');
    const payload = { name: values.name.trim(), contact: address, task: values.task.trim(), direction: mode, serviceId: selected?.id || null, addon: selected?.addon || null, website };
    const fingerprint = JSON.stringify(payload);
    if (receipt.current?.fingerprint !== fingerprint) receipt.current = { fingerprint, id: crypto.randomUUID() };
    const controller = new AbortController();
    pendingRequest.current = controller;
    setStatus('sending');
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, requestId: receipt.current.id }), signal: controller.signal });
      const result = await response.json();
      if (pendingRequest.current !== controller) return;
      if (!response.ok || result.ok !== true) {
        setSendError(result.message || 'Не удалось отправить заявку. Попробуйте ещё раз.');
        setStatus('error');
        return;
      }
      setStatus('success');
    } catch {
      if (pendingRequest.current !== controller) return;
      setSendError('Не удалось подтвердить отправку. Проверьте соединение и попробуйте ещё раз — данные сохранены.');
      setStatus('error');
    } finally {
      clearTimeout(timeout);
      if (pendingRequest.current === controller) pendingRequest.current = null;
    }
  };
  const copy = async () => {
    const content = `NOVARY — заявка\nИмя: ${values.name}\nКонтакт: ${values.contact}\nНаправление: ${mode === 'development' ? 'Разработка' : mode === 'creative' ? 'Дизайн и креативы' : 'Комплекс'}\n${summary}\nЗадача: ${values.task || 'Обсудить на встрече'}`;
    try { await navigator.clipboard.writeText(content); setCopied(true); } catch { setCopied(false); }
  };
  return <section className="contact-section container" id="contact">
    <div className="contact-intro"><h2>Обсудим<br />{title === 'task' ? 'вашу задачу.' : 'ваш проект.'}</h2><p>Одна услуга или комплекс — расскажите, что нужно вашему бизнесу.</p></div>
    <div className="contact-form-area">
      {status === 'success' ? <div className="form-success" role="status"><CheckIcon size={32} /><h3>Заявка отправлена.</h3><p>{values.name}, спасибо! Получили вашу задачу и свяжемся по указанному контакту.</p><div className="request-summary"><strong>{summary}</strong><span>{values.contact}</span>{values.task && <p>{values.task}</p>}</div><button className="button button-light" onClick={copy}><CopyIcon />{copied ? 'Скопировано' : 'Скопировать заявку'}</button><button className="text-button" onClick={() => setStatus('form')}>Вернуться к форме</button></div> : <form noValidate onSubmit={send} aria-busy={status === 'sending'}>
        {telegramNotice && <div className="form-notice" role="status">Укажите ваш @username в форме — сможем ответить вам в Telegram.<button className="icon-button" aria-label="Закрыть уведомление" onClick={clearTelegram} type="button"><XIcon /></button></div>}
        {sendError && <div className="form-notice" role="alert">{sendError}</div>}
        <label className="form-trap" aria-hidden="true">Сайт компании<input name="website" value={website} onChange={e => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" /></label>
        {selected && <div className="chosen-package"><span>Выбрано: {summary}</span><button type="button" disabled={status === 'sending'} className="icon-button" onClick={() => setSelected(null)} aria-label="Убрать выбранный пакет"><XIcon /></button></div>}
        <div className="form-row"><label className="input-label"><span className="sr-only">Имя</span><input disabled={status === 'sending'} maxLength={120} id="contact-name" ref={nameRef} name="name" autoComplete="given-name" placeholder="Имя" value={values.name} onChange={change} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'error-name' : undefined} />{errors.name && <span id="error-name" className="field-error">{errors.name}</span>}</label><label className="input-label"><span className="sr-only">Telegram или email</span><input disabled={status === 'sending'} maxLength={160} id="contact-address" name="contact" autoComplete="email" placeholder="Telegram или email" value={values.contact} onChange={change} aria-invalid={!!errors.contact} aria-describedby={errors.contact ? 'error-contact' : undefined} />{errors.contact && <span id="error-contact" className="field-error">{errors.contact}</span>}</label></div>
        <label className="input-label"><span className="sr-only">Что нужно сделать?</span><textarea disabled={status === 'sending'} maxLength={1800} name="task" rows={3} placeholder="Что нужно сделать?" aria-describedby="task-hint" value={values.task} onChange={change} /></label>
        <p className="task-hint" id="task-hint">Расскажите о бизнесе и задаче. Если пока не знаете, какие услуги нужны, поможем определить состав.</p>
        <fieldset><legend>Интересует</legend><div className="direction-options">{[['development', 'Разработка'], ['creative', 'Дизайн и креативы'], ['complex', 'Комплекс']].map(([id, text]) => <label key={id}><span className="checkbox-wrap"><input disabled={status === 'sending'} type="radio" name="direction" value={id} checked={mode === id} onChange={() => { setMode(id); if (selected && selected.direction !== id) setSelected(null); }} /><CheckIcon /></span>{text}</label>)}</div></fieldset>
        {mode === 'complex' && <p className="complex-hint">Комплекс — несколько услуг для одной задачи. Состав, стоимость и сроки согласуем после обсуждения.</p>}
        <div className="form-actions"><button className="button button-orange" disabled={status === 'sending'}>{status === 'sending' ? 'Отправляем…' : status === 'error' ? 'Повторить отправку' : 'Обсудить проект'}<Arrow diagonal /></button><button type="button" className="text-link contact-telegram" onClick={onTelegram}>Написать в Telegram</button><span className="demo-label">Отправляя заявку, вы передаёте нам контакт для ответа.</span></div>
      </form>}
    </div>
    <ProjectWheel onClick={() => { pendingRequest.current?.abort(); pendingRequest.current = null; setStatus('form'); setSendError(''); setCopied(false); requestAnimationFrame(() => nameRef.current?.focus()); }} />
  </section>;
}
