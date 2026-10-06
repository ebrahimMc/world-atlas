# World Atlas

A bilingual English/Persian, responsive, self-contained atlas of 195 countries with flags, capitals, key cities and currencies.

## Use

Open `index.html` in a browser. No build, installation, API key or internet connection is needed for browsing the atlas. `world-countries-atlas.html` is an identical standalone download.

- Search country names, capitals, cities and currency names or codes.
- Filter by region and sort A–Z or Z–A.
- Load additional countries with “Show more countries”.
- Search and filter selections are retained in the URL so hosted views can be shared.

## Design

Ocean navy, sand and earth accents appear only in the header and footer. The directory uses neutral surfaces and controls. National flags retain their original colors. Responsive layouts support phones, tablets and desktop screens, with keyboard navigation and accessible labels.

## Persian version

Use the فارسی / English switch in the header. The Persian view uses RTL layout and embedded Vazirmatn, including offline use. Interface text, country names and currency names are localized; capitals and cities retain their source spelling. Hosted Persian entry: `?lang=fa`. Searches accept Persian and English country and currency names.

Vazirmatn: https://github.com/rastikerdar/vazirmatn, licensed under SIL OFL 1.1; see `Vazirmatn-OFL.txt`. The license is also embedded in the HTML.

## Data and attribution

All 195 country records and original source notes were preserved from the supplied September 2026 atlas. This design update does not independently refresh or verify geographic or currency facts.

Country data: https://github.com/mledoze/countries

City data: https://www.geonames.org/ (CC BY 4.0)

Scope: 193 United Nations members and two observer states. See the atlas’s About section for editorial notes and source links.

## GitHub Pages

Publish `index.html` at the root of a public repository, then choose **Settings → Pages → Deploy from a branch → main → /(root)**. GitHub Pages supports this static site on GitHub Free for public repositories. No paid hosting or domain is required.
