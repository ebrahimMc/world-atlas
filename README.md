# World Atlas

A bilingual English/Persian, responsive, self-contained atlas of 195 countries with flags, capitals, key cities, currencies, official languages and official or predominant religion.

## Use

Open `index.html` in a browser. No build, installation, API key or internet connection is needed for browsing the atlas. All data and fonts are embedded in the page.

- Search country names, capitals, cities and currency names or codes, and language names in English or Persian.
- Filter by region and sort A–Z or Z–A.
- Load additional countries with “Show more countries”.
- Search and filter selections are retained in the URL so hosted views can be shared.

## Design

Ocean navy, sand and earth accents appear only in the header and footer. The directory uses neutral surfaces and controls. National flags retain their original colors. Responsive layouts support phones, tablets and desktop screens, with keyboard navigation and accessible labels.

## Persian version

Use the فارسی / English switch in the header. The Persian view uses RTL layout and embedded Vazirmatn, including offline use. Interface text, country names, currency names, official languages and religion are localized; capitals and cities retain their source spelling. Hosted Persian entry: `?lang=fa`. Searches accept Persian and English country and currency names.

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

Official languages describe national/federal legal status. Religion retains the legal designation where one exists; for the other 157 countries, the card displays the largest population affiliation with a separate label. Religiously unaffiliated people are included, and a plurality is marked “Largest group” rather than described as a majority. The legal status and population affiliation remain separate fields in the data. Notes distinguish working and de facto languages, regional official status, established churches and constitutionally favored religions. A denomination is named only where the cited framework identifies it. Special cases include Afghanistan's suspended constitution/de facto rule, the UK's constituent nations, Tunisia's 2022 constitution, Syria's 2025 declaration, and Sudan's contested transitional framework. Source editions have different dates and are not all current legal consolidations.

The base language dataset is mledoze/countries, with curated corrections and explicit translations. Country-specific constitutional or legal references and selected government updates are retained in the repository; source disclosures are intentionally omitted from the cards. Recent language corrections include US English (2025), South African Sign Language (2023), New Zealand English (2026), Lesotho's 2025 language amendment, Bolivian Sign Language (2025), Mali's 2023 constitution, Burkina Faso's 2023 amendment and Niger's 2025 charter. Bolivia's 38 languages and the other long lists expand with a native keyboard-accessible disclosure.

## Continent tags

Five stable colors inspired by the Olympic palette form a custom atlas key: Europe blue, Asia yellow, Africa charcoal, Oceania green, Americas red. These colors are not an official Olympic continent assignment. The same colors appear in filters and fixed-width, centered card tags. Text identifies each region independently of color. ISO codes are separate badges with bidirectional isolation in RTL layouts.

Base dataset license: [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/), credited to mledoze/countries. The source license is preserved in `data/LICENSE-mledoze.txt`; the derivative bilingual data in `data/country-facts.json` is made available under ODbL 1.0.

## Predominant population religion

For 149 countries without a state religion, the largest of Pew’s seven affiliation categories is selected from its 2020 estimates: [Religious Composition by Country, 2010–2020](https://www.pewresearch.org/religion/feature/religious-composition-by-country-2010-2020/), published in 2025. These are estimates of affiliation, not religious practice or current 2026 census counts. Percentages are rounded to one decimal; majority/plurality is determined before rounding. The selected records are preserved in `data/pew-predominant-2020.csv`. Citation: Hackett et al. (2025), Pew Research Center, doi:10.58094/5shf-2d69.

Andorra, Antigua and Barbuda, Dominica, Saint Kitts and Nevis, Marshall Islands, Nauru, Palau and San Marino are outside that dataset. Their predominant Christianity is supported by country-specific 2023 U.S. Department of State religious freedom reports, cited in the JSON. Cards show “Report 2023” without a percentage; the underlying censuses and estimates have different dates. No denomination is inferred from Pew’s broad categories.

Cards use a separate flag tile, stable continent tag and ISO badge, divided fact rows, an emphasized capital and a subtly shaded religion panel. Long language lists retain keyboard-accessible expansion. Persian and English layouts share the same hierarchy and adapt to narrow screens.
