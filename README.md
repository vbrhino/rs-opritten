# RS Opritten & Terrassen — Website

Website voor RS Opritten & Terrassen (Steven Roelandt).  
Live: [www.rsoprittenenterrassen.be](https://www.rsoprittenenterrassen.be)

## Technologie

Plain HTML/CSS/JS — geen build stap, geen dependencies.  
Push naar `main` branch = live op GitHub Pages.

## Structuur

```
├── index.html          → Hoofdpagina (alle secties)
├── css/style.css       → Stijlen
├── js/main.js          → Interactiviteit, i18n, galerij
├── lang/               → Vertalingen (nl.json, fr.json, en.json)
├── data/
│   ├── projects.json   → Galerij/portfolio data
│   └── reviews.json    → Klantreviews
├── img/
│   ├── hero/           → Hero achtergrondafbeeldingen
│   ├── projects/       → Projectfoto's (per project-ID)
│   └── team/           → Teamfoto's
├── CNAME               → Custom domain
├── robots.txt          → SEO
├── sitemap.xml         → SEO
└── LICENSE             → Eigendomslicentie
```

## Beheer — Projecten toevoegen

### 1. Foto's toevoegen

Maak een map aan in `img/projects/` met een uniek ID:
```
img/projects/oprit-gent-2025/
├── before-1.jpg        (optioneel)
├── after-1.jpg         (verplicht: minstens 1 'after')
├── after-2.jpg         (optioneel: meerdere after-foto's)
└── after-3.jpg
```

Tip: gebruik beschrijvende namen. Before-foto's zijn optioneel — projecten zonder before tonen gewoon de resultaatfoto's.

### 2. Project registreren in data/projects.json

Voeg een nieuw object toe aan de array:
```json
{
  "id": "oprit-gent-2025",
  "category": "opritten",
  "title": {
    "nl": "Oprit in natuursteen — Gent",
    "fr": "Allée en pierre naturelle — Gand",
    "en": "Natural stone driveway — Ghent"
  },
  "description": {
    "nl": "Korte beschrijving van het project.",
    "fr": "Brève description du projet.",
    "en": "Short project description."
  },
  "date": "2025-04",
  "featured": false,
  "images": {
    "before": ["before-1.jpg"],
    "after": ["after-1.jpg", "after-2.jpg", "after-3.jpg"]
  }
}
```

Categorieën: `opritten`, `terrassen`, `tuinaanleg`, `onderhoud`, `afsluitingen`

### 3. Push

```bash
git add . && git commit -m "Project oprit-gent-2025 toegevoegd" && git push
```

## Beheer — Reviews toevoegen

Bewerk `data/reviews.json`:
```json
{
  "name": "Naam Klant",
  "location": "Gemeente",
  "service": {
    "nl": "Type werk",
    "fr": "Type de travaux",
    "en": "Type of work"
  },
  "text": {
    "nl": "Review tekst...",
    "fr": "Texte de l'avis...",
    "en": "Review text..."
  },
  "rating": 5
}
```

## Beheer — Teksten aanpassen

Alle teksten zitten in `lang/nl.json`, `lang/fr.json`, `lang/en.json`.  
Pas de waarden aan en push.

## Contactformulier

Momenteel via `mailto:` link. Om een echte formulier-verzending te activeren:
1. Maak een Google Apps Script endpoint (zie rdigital-voorbeeld)
2. Vervang de `mailto:` logica in `js/main.js` door een `fetch()` naar het endpoint

## Lokaal testen

Open `index.html` met een lokale server:
```bash
python3 -m http.server 8000
# of
npx serve .
```

Let op: `file://` werkt niet door fetch() calls naar JSON bestanden.
