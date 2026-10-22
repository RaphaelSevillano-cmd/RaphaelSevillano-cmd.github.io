# Raphael Jammal A. Sevillano — Web Portfolio

A responsive, searchable personal portfolio website built for **CEEL 301 (Web Portfolio Development)** at City College of Calamba.

**Live site:** https://raphaelsevillano-cmd.github.io/

## Pages

| Page | File |
|---|---|
| Home | `index.html` |
| About | `about.html` |
| Skills | `skills.html` |
| Experience | `experience.html` |
| Projects (search and filter) | `projects.html` |
| Education | `education.html` |
| Contact | `contact.html` |
| CV | PDF in `assets/`, linked from Home and About |

Each project opens a details popup (overview, problem, solution, features, screenshots, role, and technologies).

## Features

- Responsive layout for desktop, tablet, and mobile, with a hamburger menu on small screens
- Project search and filtering by name, technology, category, and year, updating without a page reload
- Dark and light mode, saved in the browser with `localStorage`
- Downloadable CV (PDF) and a View Online option
- Contact form with a hidden honeypot field for spam protection, delivered through Formspree
- SEO: page titles, meta descriptions, canonical URLs, Open Graph tags, `robots.txt`, and `sitemap.xml`
- Accessibility: semantic headings, alt text, labeled form fields, keyboard focus indicators, and reduced-motion support

## Technologies

HTML5, CSS3, and vanilla JavaScript, with Google Fonts (Space Grotesk and Inter). No frameworks or build step.

## Folder structure

```
index.html, about.html, skills.html, experience.html,
projects.html, education.html, contact.html
robots.txt
sitemap.xml
css/style.css
js/main.js            site behavior (theme, menu, project search, popup, contact form)
js/projects-data.js   all project content
assets/               CV (PDF) and images
```

## Updating the projects

All project content lives in one file: `js/projects-data.js`. To add a project, copy an existing entry, give it a new unique `id`, and fill in the fields. The home page, the Projects page, the search and filters, and the details popup update automatically. Leave `liveUrl` or `githubUrl` as `""` if the project has no link, and its button will not appear.

## Running locally

1. Download or clone this repository.
2. Open the folder in VS Code and open `index.html` in a browser. The **Live Server** extension also works.

## Deployment (GitHub Pages)

1. Create a GitHub account and click **New repository**.
2. Name the repository `<username>.github.io`, choose **Public**, and click **Create repository**.
3. Click **uploading an existing file** and drag in the contents of the project folder, with `index.html` at the top level of the repository. Click **Commit changes**.
4. Go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then branch `main` and folder `/ (root)`, and click **Save**.
5. After one or two minutes the site is live at `https://<username>.github.io/`. HTTPS is enabled automatically.
6. To update the site later, open a file in the repository, click the pencil icon, edit it, and click **Commit changes**. The site refreshes in about two minutes.

## Contact form setup (Formspree)

1. Create a free account at https://formspree.io and create a new form.
2. Copy the form endpoint (`https://formspree.io/f/<form-id>`).
3. Put it in the `action` attribute of the form in `contact.html`.
4. Confirm the email that Formspree sends on the first submission, then send a test message.

## SEO files

- `robots.txt` allows search engines to crawl the site and points to the sitemap.
- `sitemap.xml` lists every page. Submit it in Google Search Console after verifying the site.

## Testing checklist

- [ ] Public URL opens over HTTPS
- [ ] Every menu link works, including the mobile menu
- [ ] About, Skills, Experience, Education, and Projects display correctly
- [ ] Project search and filters work
- [ ] The details popup opens for every project and images load
- [ ] CV downloads and opens in a new tab
- [ ] Contact form sends a message
- [ ] Social links open the correct profiles
- [ ] Layout is correct on mobile, tablet, and desktop
- [ ] Dark mode works and stays after a refresh
- [ ] No console errors
- [ ] `robots.txt` and `sitemap.xml` open in the browser

## Author

Raphael Jammal A. Sevillano — BS Information Technology student, City College of Calamba
Email: rasevillano@ccc.edu.ph · GitHub: https://github.com/RaphaelSevillano-cmd
