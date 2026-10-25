# World Atlas

A bilingual English/Persian, responsive, offline-capable atlas of 195 countries with flags, capitals, key cities, currencies, official languages and official or predominant religion.

## Use

Open `index.html` in a browser. No build, installation, API key or internet connection is needed for browsing the atlas. All data and fonts are embedded in the page. Keep the `assets/flags/` directory beside `index.html`; the flag artwork is served locally.

- Search country names, capitals, cities and currency names or codes, and language names in English or Persian.
- Filter by region and sort A–Z or Z–A.
- Load additional countries with “Show more countries”.
- Search and filter selections are retained in the URL so hosted views can be shared.

## Design

The original neutral `#fafafa` canvas sits behind translucent glass surfaces, with the original ocean navy masthead and cream/sand accents. Cards, controls and floating pills share rounded corners, light edge highlights and backdrop blur. National flags retain their original colors and proportions. Responsive layouts support phones, tablets and desktop screens, with keyboard navigation and accessible labels.

## Persian version

Use the فارسی / English switch in the header. The Persian view uses RTL layout and embedded Vazirmatn, including offline use. Interface text, country names, currency names, official languages and religion are localized; capitals and key cities have curated Persian names. Hosted Persian entry: `?lang=fa`. Searches accept Persian and English country and currency names.

Vazirmatn: https://github.com/rastikerdar/vazirmatn, licensed under SIL OFL 1.1; see `Vazirmatn-OFL.txt`. The license is also embedded in the HTML.

## Data and attribution

All 195 country records and original source notes were preserved from the supplied September 2026 atlas. This design update does not independently refresh or verify geographic or currency facts.

Country data: https://github.com/mledoze/countries

City data: https://www.geonames.org/ (CC BY 4.0)

Scope: 193 United Nations members and two observer states. See the atlas’s About section for editorial notes and source links.

## GitHub Pages

Publish `index.html` and `assets/flags/` at the root of a public repository, then choose **Settings → Pages → Deploy from a branch → main → /(root)**. GitHub Pages supports this static site on GitHub Free for public repositories. No paid hosting or domain is required.

## Official languages and religion

The bilingual additions are maintained in `data/country-facts.json`, keyed by the 195 ISO alpha-2 country codes already in the atlas. Both English and Persian values are embedded; there is no runtime translation service or data request. Re-embed after editing:

```sh
python3 scripts/embed-facts.py
```

The script verifies country coverage, translation completeness, country-level source links and explanations for countries without a nationally designated official language, then updates the embedded payload in `index.html`.

Official languages describe national/federal legal status. Religion retains the legal designation where one exists; for the other 157 countries, the card displays the largest population affiliation with a separate label. Religiously unaffiliated people are included, and a plurality is marked “Largest group” rather than described as a majority. The legal status and population affiliation remain separate fields in the data. Notes distinguish working and de facto languages, regional official status, established churches and constitutionally favored religions. A denomination is named only where the cited framework identifies it. Special cases include Afghanistan's suspended constitution/de facto rule, the UK's constituent nations, Tunisia's 2022 constitution, Syria's 2025 declaration, and Sudan's contested transitional framework. Source editions have different dates and are not all current legal consolidations.

The base language dataset is mledoze/countries, with curated corrections and explicit translations. Country-specific constitutional or legal references and selected government updates are retained in the repository; source disclosures are intentionally omitted from the cards. Recent language corrections include US English (2025), South African Sign Language (2023), New Zealand English (2026), Lesotho's 2025 language amendment, Bolivian Sign Language (2025), Mali's 2023 constitution, Burkina Faso's 2023 amendment and Niger's 2025 charter. Bolivia's 38 languages and the other long lists expand with a native keyboard-accessible disclosure.

## Continent tags

Five stable colors inspired by the Olympic palette form a custom atlas key: Europe blue, Asia yellow, Africa charcoal, Oceania green, Americas red. These colors are not an official Olympic continent assignment. The same colors appear in filters and fixed-width, centered card tags. Text identifies each region independently of color. ISO codes are separate badges with bidirectional isolation in RTL layouts.

Base dataset license: [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/), credited to mledoze/countries. The source license is preserved in `data/LICENSE-mledoze.txt`; the derivative bilingual data in `data/country-facts.json` is made available under ODbL 1.0.

## Predominant population religion

For 149 countries without a state religion, the largest of Pew’s seven affiliation categories is selected from its 2020 estimates: [Religious Composition by Country, 2010–2020](https://www.pewresearch.org/religion/feature/religious-composition-by-country-2010-2020/), published in 2025. These are estimates of affiliation, not religious practice or current 2026 census counts. Percentages are rounded to one decimal; majority/plurality is determined before rounding. The selected records are preserved in `data/pew-predominant-2020.csv`. Citation: Hackett et al. (2025), Pew Research Center, doi:10.58094/5shf-2d69.

Andorra, Antigua and Barbuda, Dominica, Saint Kitts and Nevis, Marshall Islands, Nauru, Palau and San Marino are outside that dataset. Their predominant Christianity is supported by country-specific 2023 U.S. Department of State religious freedom reports, cited in the JSON. Cards show “Report 2023” without a percentage; the underlying censuses and estimates have different dates. No denomination is inferred from Pew’s broad categories.

Cards use a navy flag panel with floating continent and ISO pills, a bottom-right geographic-region pill, color-coded capital/currency tiles, city/language chips and a glass religion panel. Long language lists retain keyboard-accessible expansion. Persian and English layouts share the same hierarchy and adapt to narrow screens.

## Persian capitals and key cities

`capitalFa` and `citiesFa` in `data/country-facts.json` contains a curated Persian rendering of every existing capital and key-city field, including multi-capital roles and qualifications. The Persian view uses these RTL values; the English view retains the original strings. Search accepts either language in either view. The embed script checks all 195 translations for Persian text and accidental Latin leftovers. City-list order and all English source strings are preserved.

## Wikipedia flag artwork

The cards display the first flag selected in each English Wikipedia country article's infobox, rather than platform-dependent emoji. All 195 original SVGs are stored in `assets/flags/`, with their native proportions preserved inside the flag tile. This includes nonrectangular Nepal and square Switzerland/Vatican flags. Wikipedia's current infobox selection is used for Afghanistan and Syria.

`data/wikipedia-flags.json` records each country article, Wikipedia revision ID, selected Commons file, original image URL, file-description URL, retrieval date, license, artist/credit metadata and SHA-256. Wikimedia metadata may contain HTML attribution links. Original SVGs are retained unchanged. The original dataset's emoji field is removed from the embedded country records.

To refresh the Wikipedia snapshot (requires internet), then update the offline page:

```sh
python3 scripts/fetch-wikipedia-flags.py
python3 scripts/embed-facts.py
```

The fetch script resolves article names, Wikipedia File markup and Commons redirects. It fails on missing or ambiguous flag fields rather than silently substituting a different flag. Runtime browsing sends no requests to Wikipedia or Commons.

Flag licenses in this snapshot: 194 files are marked public domain by Wikimedia Commons. [Oman's flag](https://commons.wikimedia.org/wiki/File:Flag_of_Oman.svg) is a vector rendering based on [Oman's Royal Decree 53/2004](https://qanoon.om/p/2004/rd2004053/), used under the [Open Government Licence – Oman 1.0](https://www.oman.om/en/home-footer-level/faq/open-government-licence-oman); contributor details are retained in the linked Commons file history. See the manifest for each file's original attribution and source.

## Card design and typography

The original palette is retained: ocean navy `#193d55`, sand `#e4c5a1`, earth `#ae7e59` and the neutral `#fafafa` page background. Dark mode and background color orbs are removed. Glass blur, translucent surfaces and floating pills remain. Helvetica Neue leads the font stack, with the embedded Vazirmatn available for Persian characters.

Card composition takes inspiration from [Alina Levchenko's Travel Information Cards](https://dribbble.com/shots/26179794-Travel-Information-Cards-UX-UI-Design): a strong visual panel and grouped, compact facts. The artwork remains the locally stored Wikipedia flags, with native proportions preserved. No Dribbble artwork is copied into the website.

Capital, currency, cities, languages and religion each have a soft color, explicit text label and icon. Grid rows share equal height across all displayed cards; expanding languages or loading additional countries recomputes the shared height without clipping content. The compact mobile search/Filters row remains intact.

## Geographic regions

`data/country-regions.json` covers all 195 countries with English and Persian labels from the [UN M49 geographic classification](https://unstats.un.org/unsd/methodology/m49/overview/), retrieved 2026-10-25. The most specific intermediate region is used where present (such as South America or East Africa); otherwise the subregion is used (such as Southeast Asia or Southern Europe). Concise English labels retain the same grouping, and source names, M49 codes and source URL are preserved in the JSON. These are UN statistical groupings. The specific region appears in the glass pill at the physical bottom-right of the flag in both languages. The continent appears at the physical bottom-left of the flag; the existing five continent colors and filters are retained. Search accepts the new region labels in either language.

Run `python3 scripts/embed-facts.py` after changing region data. It validates the country set and bilingual coverage, then embeds the region labels beside the country facts and flag paths.

## Motion and accessibility

First-load cards and pointer-initiated Show more results receive a 240ms opacity/8px entrance with up to 120ms stagger and the shared ease-out curve. Buttons provide 130ms press feedback. Search, filters and keyboard-triggered Show more remain immediate. Reduced-motion mode uses a brief opacity change without translation. There is no animation library or runtime network dependency. Controls retain focus rings, mobile form text is at least 16px, and touch targets are at least 44px.

## Compact spacing

Header/hero padding, toolbar gaps, directory spacing, card gutters, title padding, fact-tile padding, chips, source notes and footer spacing use a tighter 4px rhythm. Reserved title heights are removed and fact groups pack toward the top of each card; equal outer card heights remain controlled by the grid. The flag footer retains extra room for long region labels on narrow phones. Interactive touch targets remain at least 44px and mobile form text remains 16px.
