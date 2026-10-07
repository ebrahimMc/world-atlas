# World Atlas

A bilingual English/Persian, responsive, self-contained atlas of 195 countries with flags, capitals, key cities, currencies, official languages and official religion/denomination.

## Use

Open `index.html` in a browser. No build, installation, API key or internet connection is needed for browsing the atlas. All data and fonts are embedded in the page.

- Search country names, capitals, cities and currency names or codes, and language names in English or Persian.
- Filter by region and sort A–Z or Z–A.
- Load additional countries with “Show more countries”.
- Search and filter selections are retained in the URL so hosted views can be shared.

## Design

Ocean navy, sand and earth accents appear only in the header and footer. The directory uses neutral surfaces and controls. National flags retain their original colors. Responsive layouts support phones, tablets and desktop screens, with keyboard navigation and accessible labels.

## Persian version

Use the فارسی / English switch in the header. The Persian view uses RTL layout and embedded Vazirmatn, including offline use. Interface text, country names, currency names, official languages and official religion are localized; capitals and cities retain their source spelling. Hosted Persian entry: `?lang=fa`. Searches accept Persian and English country and currency names.

Vazirmatn: https://github.com/rastikerdar/vazirmatn, licensed under SIL OFL 1.1; see `Vazirmatn-OFL.txt`. The license is also embedded in the HTML.

## Data and attribution

All 195 country records and original source notes were preserved from the supplied September 2026 atlas. This design update does not independently refresh or verify geographic or currency facts.

Country data: https://github.com/mledoze/countries

City data: https://www.geonames.org/ (CC BY 4.0)

Scope: 193 United Nations members and two observer states. See the atlas’s About section for editorial notes and source links.

## GitHub Pages

Publish `index.html` at the root of a public repository, then choose **Settings → Pages → Deploy from a branch → main → /(root)**. GitHub Pages supports this static site on GitHub Free for public repositories. No paid hosting or domain is required.

## Official languages and religion

The bilingual additions are maintained in `data/country-facts.json`, keyed by the 195 ISO alpha-2 country codes already in the atlas. Both English and Persian values are embedded; there is no runtime translation service or data request. Re-embed after editing:

```sh
python3 scripts/embed-facts.py
```

The script verifies country coverage, translation completeness, country-level source links and explanations for countries without a nationally designated official language, then updates the embedded payload in `index.html`.

These fields describe national/federal legal status rather than population demographics. Notes distinguish working and de facto languages, regional official status, established churches and constitutionally favored religions. A denomination is named only where the cited framework identifies it. Special cases include Afghanistan's suspended constitution/de facto rule, the UK's constituent nations, Tunisia's 2022 constitution, Syria's 2025 declaration, and Sudan's contested transitional framework. Source editions have different dates and are not all current legal consolidations.

The base language dataset is mledoze/countries, with curated corrections and explicit translations. Country-specific constitutional or legal references and selected government updates appear under **Sources & context** on each card. Recent language corrections include US English (2025), South African Sign Language (2023), New Zealand English (2026), Lesotho's 2025 language amendment, Bolivian Sign Language (2025), Mali's 2023 constitution, Burkina Faso's 2023 amendment and Niger's 2025 charter. Bolivia's 38 languages and the other long lists expand with a native keyboard-accessible disclosure.

## Continent tags

Five stable colors inspired by the Olympic palette form a custom atlas key: Europe blue, Asia yellow, Africa charcoal, Oceania green, Americas red. These colors are not an official Olympic continent assignment. The same colors appear in filters and fixed-width, centered card tags. Text identifies each region independently of color. ISO codes are separate badges with bidirectional isolation in RTL layouts.

Base dataset license: [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/), credited to mledoze/countries. The source license is preserved in `data/LICENSE-mledoze.txt`; the derivative bilingual data in `data/country-facts.json` is made available under ODbL 1.0.
