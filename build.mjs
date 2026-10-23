// Builds the site from the content files in /data into /dist.
// No dependencies: Vercel runs `node build.mjs`. Edit content in /data (or via Pages CMS), not here.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = dirname(new URL(import.meta.url).pathname);
const OUT = join(ROOT, 'dist');
const load = (f) => JSON.parse(readFileSync(join(ROOT, 'data', f), 'utf8'));

const site = load('settings.json');
const home = load('home.json');
const about = load('about.json');
const experience = load('experience.json');
const services = load('services.json');
const cases = load('case-studies.json');
const creds = load('credentials.json');
const contact = load('contact.json');

const year = new Date().getFullYear();
const siteUrl = (site.siteUrl || '').replace(/\/$/, '');

// ---------- helpers ----------
const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const paras = (s = '') => String(s).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  .map((p) => `<p>${esc(p)}</p>`).join('\n');
const list = (arr) => (Array.isArray(arr) ? arr : []);
const initials = (name) => name.split(/\s+/).filter((w) => w.length > 1).slice(-2).map((w) => w[0]).join('');
const studyPath = (s) => `/case-studies/${s.slug}`;

const icon = {
  arrow: '<svg viewBox="0 0 20 20" aria-hidden="true" class="ic"><path d="M4 10h11m-4-4 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  download: '<svg viewBox="0 0 20 20" aria-hidden="true" class="ic"><path d="M10 3v9m-4-4 4 4 4-4M4 15.5h12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  linkedin: '<svg viewBox="0 0 20 20" aria-hidden="true" class="ic"><path fill="currentColor" d="M4.2 7.4h2.6V16H4.2zM5.5 3.4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm3 4h2.5v1.2c.4-.7 1.3-1.4 2.7-1.4 2.8 0 3.3 1.8 3.3 4.2V16h-2.6v-4c0-1 0-2.2-1.4-2.2s-1.6 1-1.6 2.1V16H8.5z"/></svg>',
  mail: '<svg viewBox="0 0 20 20" aria-hidden="true" class="ic"><path d="M3 5.5h14v9H3zM3.5 6l6.5 5 6.5-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  moon: '<svg viewBox="0 0 20 20" aria-hidden="true" class="ic"><path d="M15.5 12.5A6 6 0 0 1 7.5 4.5a6 6 0 1 0 8 8z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  sun: '<svg viewBox="0 0 20 20" aria-hidden="true" class="ic"><circle cx="10" cy="10" r="3.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 2.5v2m0 11v2m7.5-7.5h-2m-11 0h-2m12.8-5.3-1.4 1.4m-7.8 7.8-1.4 1.4m10.6 0-1.4-1.4M6.1 6.1 4.7 4.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
};

const nav = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/experience', 'Experience'],
  ['/services', 'Services'],
  ['/case-studies', 'Case Studies'],
  ['/credentials', 'Credentials'],
];

const buttons = ({ cv = true, contactBtn = true, linkedin = true, primary = 'cv' } = {}) => `
  <div class="btns">
    ${cv && site.cv ? `<a class="btn ${primary === 'cv' ? 'btn-primary' : ''}" href="${esc(site.cv)}" download>${icon.download}Download CV</a>` : ''}
    ${contactBtn ? `<a class="btn ${primary === 'contact' ? 'btn-primary' : ''}" href="/contact">${icon.mail}Contact</a>` : ''}
    ${linkedin && site.linkedin ? `<a class="btn" href="${esc(site.linkedin)}" target="_blank" rel="noopener">${icon.linkedin}LinkedIn</a>` : ''}
  </div>`;

const photo = (cls = '') => site.photo
  ? `<img class="photo ${cls}" src="${esc(site.photo)}" alt="Portrait of ${esc(site.name)}" width="480" height="600">`
  : `<div class="photo photo-placeholder ${cls}" role="img" aria-label="Photo of ${esc(site.name)} coming soon"><span>${esc(initials(site.name))}</span></div>`;

// ---------- layout ----------
function page({ path, title, description, body, current }) {
  const fullTitle = path === '/' ? `${site.name} — ${site.role}` : `${title} — ${site.name}`;
  const desc = description || site.seoDescription;
  const url = `${siteUrl}${path === '/' ? '/' : path}`;
  const navHtml = nav.map(([href, label]) =>
    `<li><a href="${href}"${current === href ? ' aria-current="page"' : ''}>${label}</a></li>`).join('');
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(siteUrl)}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#f6f3ee" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#11161d" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/assets/site.css">
<script>try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Person', name: site.fullName, alternateName: site.name,
    jobTitle: site.role, url: siteUrl, sameAs: [site.linkedin].filter(Boolean),
    address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressCountry: 'IN' },
  })}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="${esc(site.name)}, home"><span class="brand-mark">${esc(initials(site.name))}</span><span class="brand-name">${esc(site.name)}</span></a>
    <nav class="site-nav" aria-label="Main">
      <ul id="nav-list">${navHtml}</ul>
    </nav>
    <div class="header-actions">
      <button class="icon-btn theme-toggle" type="button" aria-label="Switch colour theme">${icon.moon}${icon.sun}</button>
      <a class="btn btn-primary btn-sm" href="/contact"${current === '/contact' ? ' aria-current="page"' : ''}>Contact</a>
      <button class="icon-btn menu-toggle" type="button" aria-expanded="false" aria-controls="nav-list" aria-label="Open menu"><span></span><span></span></button>
    </div>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap footer-inner">
    <div>
      <p class="footer-name">${esc(site.name)}</p>
      <p class="muted">${esc(site.role)} · ${esc(site.location)}</p>
    </div>
    <ul class="footer-links">
      <li><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>
      ${site.linkedin ? `<li><a href="${esc(site.linkedin)}" target="_blank" rel="noopener">LinkedIn</a></li>` : ''}
      ${site.cv ? `<li><a href="${esc(site.cv)}" download>Download CV</a></li>` : ''}
    </ul>
    <p class="muted small">© ${year} ${esc(site.name)}</p>
  </div>
</footer>
<script src="/assets/site.js" defer></script>
<script defer src="/_vercel/insights/script.js"></script>
</body>
</html>`;
}

const pageHead = (eyebrow, title, intro) => `
<section class="page-head">
  <div class="wrap">
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h1>${esc(title)}</h1>
    ${intro ? `<p class="lede">${esc(intro)}</p>` : ''}
  </div>
</section>`;

const studyCard = (s) => `
<a class="card study-card reveal" href="${studyPath(s)}">
  <p class="study-meta">${esc(s.company)}</p>
  <h3>${esc(s.title)}</h3>
  <p class="muted">${esc(s.summary)}</p>
  <p class="study-metric"><span class="num">${esc(s.metric)}</span> <span>${esc(s.metricLabel)}</span></p>
  <span class="more">Read case study ${icon.arrow}</span>
</a>`;

// ---------- pages ----------
const pages = [];

// Home
pages.push({
  path: '/', current: '/', title: 'Home',
  body: `
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">${esc(home.eyebrow)}</p>
      <h1 class="display">${esc(home.headline)}</h1>
      <p class="lede">${esc(home.subheadline)}</p>
      ${buttons()}
    </div>
    <div class="hero-photo">${photo()}</div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="section-title">Proof, in three numbers</h2>
    <div class="metrics">
      ${list(home.metrics).map((m) => `
      <article class="metric reveal">
        <p class="metric-company">${esc(m.company)}</p>
        <p class="metric-value">${esc(m.value)}</p>
        <p class="metric-label">${esc(m.label)}</p>
        <p class="muted small">${esc(m.detail)}</p>
      </article>`).join('')}
    </div>
  </div>
</section>

<section class="section section-tint">
  <div class="wrap">
    <div class="paths">
      ${list(home.paths).map((p) => `
      <a class="path reveal" href="${esc(p.link)}">
        <h2>${esc(p.title)}</h2>
        <p class="muted">${esc(p.text)}</p>
        <span class="more">${esc(p.label)} ${icon.arrow}</span>
      </a>`).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <h2 class="section-title">Selected case studies</h2>
      <a class="more" href="/case-studies">All case studies ${icon.arrow}</a>
    </div>
    <div class="grid-3">${list(cases.studies).slice(0, 3).map(studyCard).join('')}</div>
  </div>
</section>`,
});

// About
pages.push({
  path: '/about', current: '/about', title: 'About',
  description: `About ${site.name}: background, interests and what drives my work in technology and product.`,
  body: `${pageHead('About', 'Beyond the CV', about.intro)}
<section class="section">
  <div class="wrap about-grid">
    <div class="about-photo">${photo('photo-sm')}</div>
    <div class="prose">
      <h2>Background</h2>
      ${paras(about.background)}
    </div>
  </div>
</section>
<section class="section section-tint">
  <div class="wrap">
    <h2 class="section-title">Interests</h2>
    <div class="grid-2">
      ${list(about.interests).map((i) => `
      <article class="card reveal">
        <h3>${esc(i.title)}</h3>
        ${paras(i.text)}
      </article>`).join('')}
    </div>
  </div>
</section>`,
});

// Experience
pages.push({
  path: '/experience', current: '/experience', title: 'Experience',
  description: `${site.name}'s expertise, career history across Shell, PwC, Nous, Cognizant and Balmer Lawrie, and education.`,
  body: `${pageHead('Experience', 'Expertise, experience & education', experience.intro)}
<section class="section">
  <div class="wrap">
    <h2 class="section-title">Expertise</h2>
    <div class="grid-4">
      ${list(experience.expertise).map((e) => `
      <article class="card reveal">
        <h3>${esc(e.area)}</h3>
        <p class="muted small">${esc(e.items)}</p>
      </article>`).join('')}
    </div>
  </div>
</section>
<section class="section section-tint">
  <div class="wrap">
    <div class="section-head">
      <h2 class="section-title">Experience</h2>
      ${site.cv ? `<a class="more" href="${esc(site.cv)}" download>Download CV ${icon.download}</a>` : ''}
    </div>
    <ol class="timeline">
      ${list(experience.roles).map((r) => `
      <li class="tl-item reveal">
        <div class="tl-when">${esc(r.period)}</div>
        <div class="tl-body">
          <h3>${esc(r.role)}</h3>
          <p class="tl-company">${esc(r.company)}</p>
          <ul class="bullets">${list(r.highlights).map((h) => `<li>${esc(h.text)}</li>`).join('')}</ul>
        </div>
      </li>`).join('')}
    </ol>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <h2 class="section-title">Education</h2>
    <div class="grid-2">
      ${list(experience.education).map((e) => `
      <article class="card reveal">
        <h3>${esc(e.degree)}</h3>
        <p class="muted">${esc(e.institution)}${e.score ? ` · ${esc(e.score)}` : ''}</p>
      </article>`).join('')}
    </div>
  </div>
</section>`,
});

// Services
pages.push({
  path: '/services', current: '/services', title: 'Services',
  description: `How ${site.name} can help: product planning, roadmap, strategy, development and deployment, plus research and analysis for AI adoption.`,
  body: `${pageHead('Services', 'How I can help', services.intro)}
${list(services.groups).map((g, gi) => `
<section class="section${gi % 2 ? ' section-tint' : ''}">
  <div class="wrap services-grid">
    <div>
      <p class="eyebrow">For</p>
      <h2 class="section-title">${esc(g.audience)}</h2>
      <p class="muted">${esc(g.summary)}</p>
    </div>
    <ul class="service-list">
      ${list(g.services).map((s) => `
      <li class="reveal"><span class="service-name">${esc(s.name)}</span>${s.detail ? `<span class="muted small">${esc(s.detail)}</span>` : ''}</li>`).join('')}
    </ul>
  </div>
</section>`).join('')}
<section class="section cta-band">
  <div class="wrap cta-inner">
    <h2>Have a role or a problem in mind?</h2>
    ${buttons({ cv: false, linkedin: true, primary: 'contact' })}
  </div>
</section>`,
});

// Case studies index
pages.push({
  path: '/case-studies', current: '/case-studies', title: 'Case Studies',
  description: `Case studies by ${site.name}: Gen AI agents, risk visualisation, data integration, quality platforms and enterprise apps.`,
  body: `${pageHead('Case Studies', 'Selected work', cases.intro)}
<section class="section">
  <div class="wrap grid-3">${list(cases.studies).map(studyCard).join('')}</div>
</section>`,
});

// Case study pages
list(cases.studies).forEach((s, i, all) => {
  const prev = all[i - 1];
  const next = all[i + 1];
  pages.push({
    path: studyPath(s), current: '/case-studies', title: s.title,
    description: `${s.title}: ${s.summary}`,
    body: `
<section class="page-head">
  <div class="wrap">
    <p class="eyebrow"><a href="/case-studies">Case Studies</a> · ${esc(s.company)}</p>
    <h1>${esc(s.title)}</h1>
    <p class="lede">${esc(s.summary)}</p>
  </div>
</section>
<section class="section">
  <div class="wrap study-grid">
    <aside class="study-aside">
      <div class="card">
        <p class="metric-value">${esc(s.metric)}</p>
        <p class="metric-label">${esc(s.metricLabel)}</p>
        <dl class="facts"><dt>Organisation</dt><dd>${esc(s.company)}</dd></dl>
      </div>
    </aside>
    <article class="prose study-body">
      <h2>Business problem</h2>${paras(s.problem)}
      <h2>Solution</h2>${paras(s.solution)}
      <h2>Outcome</h2>${paras(s.outcome)}
      ${list(s.takeaways).length ? `<div class="takeaways"><h3>Key takeaways</h3><ul>${list(s.takeaways).map((t) => `<li>${esc(t.text || t)}</li>`).join('')}</ul></div>` : ''}
    </article>
  </div>
  <nav class="wrap study-nav" aria-label="More case studies">
    ${prev ? `<a href="${studyPath(prev)}"><span class="muted small">Previous</span>${esc(prev.title)}</a>` : '<span></span>'}
    ${next ? `<a class="next" href="${studyPath(next)}"><span class="muted small">Next</span>${esc(next.title)}</a>` : ''}
  </nav>
</section>`,
  });
});

// Credentials
pages.push({
  path: '/credentials', current: '/credentials', title: 'Credentials',
  description: `${site.name}'s certifications, awards and education.`,
  body: `${pageHead('Credentials', 'Certifications & recognition', creds.intro)}
<section class="section">
  <div class="wrap">
    <h2 class="section-title">Certifications</h2>
    <ul class="cred-grid">
      ${list(creds.certifications).map((c) => `<li class="card reveal"><span class="cred-issuer">${esc(c.issuer)}</span><span class="cred-name">${esc(c.name)}</span></li>`).join('')}
    </ul>
  </div>
</section>
<section class="section section-tint">
  <div class="wrap">
    <h2 class="section-title">Recognition</h2>
    <ul class="award-list">
      ${list(creds.awards).map((a) => `<li class="reveal"><span class="cred-issuer">${esc(a.org)}</span><span class="cred-name">${esc(a.name)}</span></li>`).join('')}
    </ul>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <h2 class="section-title">Education</h2>
    <div class="grid-2">
      ${list(experience.education).map((e) => `
      <article class="card reveal"><h3>${esc(e.degree)}</h3><p class="muted">${esc(e.institution)}${e.score ? ` · ${esc(e.score)}` : ''}</p></article>`).join('')}
    </div>
  </div>
</section>`,
});

// Contact
const form = site.web3formsKey ? `
<form class="contact-form card" action="https://api.web3forms.com/submit" method="POST" data-web3forms>
  <input type="hidden" name="access_key" value="${esc(site.web3formsKey)}">
  <input type="hidden" name="subject" value="New message from ${esc(siteUrl.replace(/^https?:\/\//, ''))}">
  <input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
  <div class="field"><label for="f-name">Name</label><input id="f-name" name="name" required autocomplete="name"></div>
  <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" required autocomplete="email"></div>
  <div class="field"><label for="f-org">Organisation <span class="muted">(optional)</span></label><input id="f-org" name="organisation" autocomplete="organization"></div>
  <div class="field"><label for="f-msg">Message</label><textarea id="f-msg" name="message" rows="5" required></textarea></div>
  <button class="btn btn-primary" type="submit">Send message</button>
  <p class="form-status small" role="status" aria-live="polite"></p>
</form>` : '';

pages.push({
  path: '/contact', current: '/contact', title: 'Contact',
  description: `Contact ${site.name} about roles, projects or AI adoption.`,
  body: `${pageHead('Contact', "Let's talk", contact.intro)}
<section class="section">
  <div class="wrap contact-grid${form ? '' : ' no-form'}">
    <div class="contact-ways">
      <a class="contact-way card" href="mailto:${esc(site.email)}">${icon.mail}<span><span class="muted small">Email</span>${esc(site.email)}</span></a>
      ${site.linkedin ? `<a class="contact-way card" href="${esc(site.linkedin)}" target="_blank" rel="noopener">${icon.linkedin}<span><span class="muted small">LinkedIn</span>linkedin.com/in/avraghuvamshi</span></a>` : ''}
      ${site.cv ? `<a class="contact-way card" href="${esc(site.cv)}" download>${icon.download}<span><span class="muted small">CV</span>Download PDF</span></a>` : ''}
      <p class="muted small">${esc(contact.responseNote)}</p>
    </div>
    ${form}
  </div>
</section>`,
});

// 404
const notFound = page({
  path: '/404', title: 'Page not found',
  body: `${pageHead('404', 'Page not found', 'The page you were looking for has moved or does not exist.')}
<section class="section"><div class="wrap">${buttons({ cv: false, linkedin: false, primary: 'contact' })}<p><a class="more" href="/">Back to home ${icon.arrow}</a></p></div></section>`,
});

// ---------- write ----------
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(ROOT, 'public'), OUT, { recursive: true });
cpSync(join(ROOT, 'assets'), join(OUT, 'assets'), { recursive: true });

for (const p of pages) {
  const dir = p.path === '/' ? OUT : join(OUT, p.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), page(p));
}
writeFileSync(join(OUT, '404.html'), notFound);

const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${siteUrl}${p.path === '/' ? '/' : p.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);

if (!existsSync(join(OUT, 'og.png'))) console.warn('Note: public/og.png is missing (link-preview image).');
console.log(`Built ${pages.length + 1} pages into dist/`);
