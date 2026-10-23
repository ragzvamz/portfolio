# avraghuvamshi.com

Personal portfolio site for A V Raghu Vamshi.

## How it works

- **Content** lives in the JSON files in `data/`. Edit it through **Pages CMS** (app.pagescms.org → sign in with GitHub → open this repository), not in code.
- **Images and the CV** live in `public/uploads/`. Upload them through Pages CMS.
- **Build:** `node build.mjs` turns the content into the finished pages in `dist/`. It has no dependencies.
- **Hosting:** Vercel runs the build on every change saved to GitHub (settings in `vercel.json`).

## Common updates

| Change | Where in Pages CMS |
| --- | --- |
| New role, promotion or highlight | Experience → Roles |
| New certification or award | Credentials |
| New case study | Case studies → add an item (give it a unique web address) |
| Replace the CV | Site settings → CV |
| Add the headshot | Site settings → Headshot |
| Turn on the contact form | Site settings → Web3Forms access key |

Design changes (layout, colours, new pages) are made in `build.mjs` and `assets/site.css`.
