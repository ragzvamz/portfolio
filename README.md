# avraghuvamshi.com

Personal portfolio of **A V Raghu Vamshi**, AI product leader with 16 years taking enterprise platforms from strategy to scale across Energy and Financial Services.

**Live site:** [avraghuvamshi.com](https://avraghuvamshi.com) · **LinkedIn:** [linkedin.com/in/avraghuvamshi](https://www.linkedin.com/in/avraghuvamshi)

## Why this site exists

A CV gives a recruiter 30 seconds of facts. This site is the longer answer: who I am, what I've delivered, how I approach problems, and where I can help. I treat it as a product with three users in mind:

| User | What they need | Where the site answers it |
| --- | --- | --- |
| Recruiters and hiring managers | Fit for a senior role, fast | Home (proof numbers), Experience, Credentials, CV download |
| Leaders exploring AI adoption | Whether I can help with their problem | Services, Case Studies |
| Me, as the owner | Updates without touching code | Content editor (Pages CMS) |

## How it was built

I built the site in an afternoon by working with an AI assistant (Claude): I supplied the content and requirements, reviewed each design decision, and checked the result at desktop and phone sizes.

- **Content is separated from code.** Every word, number and list lives in JSON files in `data/`. A small build script, `build.mjs`, turns them into static pages. There is no framework to maintain.
- **Updates need no code.** [Pages CMS](https://pagescms.org) gives me form-based editing on top of the repository (configured in `.pages.yml`). Each save is a Git commit, so every change is versioned and reversible.
- **Every change publishes itself.** [Vercel](https://vercel.com) rebuilds and deploys the site within about a minute of any commit.
- **Running cost is the domain only.** Hosting, the content editor, the contact form ([Web3Forms](https://web3forms.com)) and analytics all run on free tiers.

```
Content edit (Pages CMS) or design change ──► GitHub ──► Vercel build ──► avraghuvamshi.com
```

## Design decisions

- **Editorial, not "developer portfolio".** Serif headings, a warm neutral palette and one accent colour, aimed at business readers rather than engineers.
- **Proof first.** The home page leads with three outcomes (60%, 4x, 260K+) before any narrative.
- **One structure for every case study:** business problem, solution, outcome, so readers can compare them quickly.
- **Accessible and fast.** Mobile-first layout, light and dark modes, keyboard-friendly navigation, respect for reduced-motion settings, and no heavy scripts.
- **Privacy-aware.** The public CV omits my phone number; visitors reach me through the contact form or LinkedIn.

## Repository map

| Path | Purpose |
| --- | --- |
| `data/` | All site content (edited through Pages CMS) |
| `public/uploads/` | CV and images |
| `build.mjs` | Turns content into pages, sitemap and robots.txt |
| `assets/` | Styles and small scripts (theme toggle, menu, contact form) |
| `.pages.yml` | Content editor configuration |
| `vercel.json` | Build and hosting settings |

## Rights

© A V Raghu Vamshi. All rights reserved.

This repository is public so that people can see how the site is built. The content, case studies, CV and visual design are **not licensed for reuse**. Please don't copy or republish them, in whole or in part, without my written permission.
