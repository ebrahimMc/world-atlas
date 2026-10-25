const $=id=>document.getElementById(id);
const grid=$('grid'),search=$('search'),sort=$('sort'),regions=$('regions');
const regionNames=['All regions','Africa','Americas','Asia','Europe','Oceania'];
const regionFa={'All regions':'همه کشورها',Africa:'آفریقا',Americas:'قاره آمریکا',Asia:'آسیا',Europe:'اروپا',Oceania:'اقیانوسیه'};
const plain=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ي/g,'ی').replace(/ك/g,'ک').toLowerCase();
const escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let countryNames,currencyNames;
try{countryNames=new Intl.DisplayNames(['fa'],{type:'region'});currencyNames=new Intl.DisplayNames(['fa'],{type:'currency'});}catch{}
const countryNameCache=new Map(),currencyNameCache=new Map();
const faName=c=>{if(!countryNameCache.has(c.code))countryNameCache.set(c.code,countryNames?.of(c.code)||c.name);return countryNameCache.get(c.code);};
const faCurrencyFallback={ZWG:'طلای زیمبابوه (زیگ)',SLE:'لئونه سیرالئون',VES:'بولیوار سوبرانو ونزوئلا',MRU:'اوگوئیای موریتانی',STN:'دوبرای سائوتومه و پرنسیپ',KID:'دلار کیریباتی',TVD:'دلار تووالو'};
const faCurrency=c=>{if(!currencyNameCache.has(c.code)){const n=currencyNames?.of(c.code);currencyNameCache.set(c.code,n&&n!==c.code?n:faCurrencyFallback[c.code]||c.name);}return currencyNameCache.get(c.code);};
const searchable=COUNTRIES.map(c=>({...c,...COUNTRY_FACTS[c.code],haystack:plain([c.name,faName(c),c.code,c.capital,COUNTRY_FACTS[c.code].capitalFa,c.region,regionFa[c.region],...c.cities,...COUNTRY_FACTS[c.code].citiesFa,COUNTRY_REGIONS[c.code].en,COUNTRY_REGIONS[c.code].fa,...c.currencies.flatMap(v=>[v.name,v.code,faCurrency(v)]),...COUNTRY_FACTS[c.code].languages.flatMap(v=>[v.en,v.fa]),COUNTRY_FACTS[c.code].languageNote.en,COUNTRY_FACTS[c.code].languageNote.fa].join(' '))}));
// Sort once per locale; searches only filter the already ordered lists.
const collators={en:new Intl.Collator('en'),fa:new Intl.Collator('fa')};
const sortedCountries={
 en:[...searchable].sort((a,b)=>collators.en.compare(a.name,b.name)),
 fa:[...searchable].sort((a,b)=>collators.fa.compare(faName(a),faName(b)))
};
const regionTotals=Object.fromEntries(regionNames.map(name=>[name,name==='All regions'?COUNTRIES.length:COUNTRIES.filter(c=>c.region===name).length]));
const numberFormats=Object.fromEntries(['en','fa'].map(locale=>[locale,{
 count:new Intl.NumberFormat(locale),share:new Intl.NumberFormat(locale,{maximumFractionDigits:1}),year:new Intl.NumberFormat(locale,{useGrouping:false})
}]));
let activeRegion='All regions',limit=24,lang='en';
const fa=()=>lang==='fa';
const t=(en,faText)=>fa()?faText:en;
const num=n=>numberFormats[lang].count.format(n);
const originalNotes=document.querySelector('.notes-inner').innerHTML;
function readURL(){const p=new URLSearchParams(location.search);search.value=p.get('q')||'';activeRegion=regionNames.includes(p.get('region'))?p.get('region'):'All regions';sort.value=p.get('sort')==='desc'?'desc':'asc';lang=p.get('lang')==='fa'?'fa':'en';}
function saveURL(){try{const u=new URL(location.href);u.search='';if(fa())u.searchParams.set('lang','fa');if(search.value.trim())u.searchParams.set('q',search.value.trim());if(activeRegion!=='All regions')u.searchParams.set('region',activeRegion);if(sort.value==='desc')u.searchParams.set('sort','desc');history.replaceState(null,'',u);}catch{}}
function translate(){
 document.documentElement.lang=lang;document.documentElement.dir=fa()?'rtl':'ltr';
 document.title=t('World Atlas — A pocket guide to the planet','اطلس جهان — راهنمای کوچک سیاره ما');
 document.querySelector('.skip').textContent=t('Skip to countries','رفتن به فهرست کشورها');
 document.querySelector('.brand').lastChild.textContent=t('WORLD ATLAS','اطلس جهان');
 document.querySelector('.brand').setAttribute('aria-label',t('World Atlas home','صفحه اصلی اطلس جهان'));
 document.querySelector('.toplink').textContent=t('About the atlas ↗','درباره اطلس ↖');
 $('language').textContent=t('فارسی','English');$('language').lang=fa()?'en':'fa';$('language').setAttribute('aria-label',t('Switch to Persian','Switch to English'));
 document.querySelector('.eyebrow').textContent=t('A pocket guide to the planet','راهنمای کوچک سیاره ما');
 $('page-title').innerHTML=t('Every country.<br><em>A little closer.</em>','همه کشورها.<br><em>کمی نزدیک‌تر.</em>');
 document.querySelector('.intro').innerHTML=t('Flags, capitals, currencies, official languages and religion.<br>Find a familiar place. Discover somewhere new.','پرچم‌ها، پایتخت‌ها، واحدهای پول، زبان‌های رسمی و دین.<br>جایی آشنا را پیدا کنید؛ جایی تازه را بشناسید.');
 document.querySelector('.hero-aside').setAttribute('aria-label',t('195 countries across 5 regions','۱۹۵ کشور در ۵ منطقه'));
 document.querySelector('.hero-aside p').innerHTML=t('<strong>195</strong> countries<span> / </span><strong>5</strong> regions','<strong>۱۹۵</strong> کشور<span> / </span><strong>۵</strong> منطقه');
 search.placeholder=t('Search the atlas…','جست‌وجو در اطلس…');search.setAttribute('aria-label',t('Search country, capital, city, currency or language','جست‌وجوی کشور، پایتخت، شهر، واحد پول یا زبان'));
 $('clear-search').setAttribute('aria-label',t('Clear search','پاک‌کردن جست‌وجو'));
 document.querySelector('.sort-label').textContent=t('Sort','ترتیب');sort.setAttribute('aria-label',t('Sort countries','مرتب‌سازی کشورها'));
 sort.options[0].text=t('A–Z','الف–ی');sort.options[1].text=t('Z–A','ی–الف');
 regions.setAttribute('aria-label',t('Filter by region','فیلتر بر اساس منطقه'));
 $('reset').textContent=t('Reset filters','پاک‌کردن فیلترها');
 document.querySelector('.kicker').textContent=t('The country directory','فهرست کشورهای جهان');
 $('source-note').hidden=true;$('source-note').textContent='';
 $('source-note').style.marginBottom='0';
 $('load-more').textContent=t('Show more countries ↓','نمایش کشورهای بیشتر ↓');
 document.querySelector('.footer-brand').textContent=t('WORLD ATLAS','اطلس جهان');
 document.querySelector('.footer-right span').textContent=t('For curious minds, everywhere.','برای ذهن‌های کنجکاو، در هر جای جهان.');
 document.querySelector('.footer-right a').textContent=t('Back to top ↑','بازگشت به بالا ↑');
 document.querySelector('.notes-inner').innerHTML=fa()?`<h2 id="about-title">درباره اطلس</h2><div><p>این اطلس شامل ۱۹۳ کشور عضو سازمان ملل متحد و دو دولت ناظر، سریر مقدس و دولت فلسطین، است. «شهرهای مهم» گزیده‌ای از شهرهاست که معمولاً پایتخت و چند مرکز شهری بزرگ را در بر می‌گیرد. برای کشورهای کوچک ممکن است فقط یک شهر درج شده باشد. در صورت نیاز، نقش‌های متفاوت پایتخت‌ها در متن اصلی توضیح داده شده‌اند.</p><p>داده‌های نام کشورها، پایتخت‌ها و واحدهای پول: <a href="https://github.com/mledoze/countries" target="_blank" rel="noopener">mledoze/countries</a>. تصاویر پرچم‌ها از جعبه اطلاعات کشورها در <a href="https://en.wikipedia.org/" target="_blank" rel="noopener">ویکی‌پدیا</a> و فایل‌های ویکی‌مدیا کامانز ذخیره شده‌اند؛ <a href="https://github.com/ebrahimMc/world-atlas#wikipedia-flag-artwork" target="_blank" rel="noopener">منابع و مجوزهای پرچم‌ها</a> در مخزن پروژه آمده‌اند. داده‌های شهرها: <a href="https://www.geonames.org/" target="_blank" rel="noopener">GeoNames</a> با مجوز CC BY 4.0 و اصلاحات تحریریه. دامنه کشورها: <a href="https://www.un.org/en/about-us/member-states" target="_blank" rel="noopener">سازمان ملل متحد</a>. برای پیوند اصلاحات پایتخت گینه استوایی و واحد پول زیمبابوه، نسخه انگلیسی را ببینید. داده‌ها در سپتامبر ۲۰۲۶ گردآوری شده‌اند؛ اطلاعات جغرافیایی و پولی ممکن است تغییر کند. نام فارسی کشورها و واحدهای پول از داده‌های بومی‌سازی مرورگر استفاده می‌کند. نام پایتخت‌ها و شهرهای مهم فارسی‌سازی شده‌اند.</p><p>زبان‌های رسمی، وضعیت ملی یا فدرال را بیان می‌کنند. در بخش دین، دین یا مذهب رسمی نمایش داده می‌شود؛ برای کشورهای بدون دین رسمی، بزرگ‌ترین گرایش دینی جمعیت، از جمله گروه بدون وابستگی دینی، آمده است. برآوردها از داده‌های ۲۰۲۰ مرکز پژوهشی Pew و گزارش‌های آزادی دینی ۲۰۲۳ برای هشت کشور کوچک خارج از آن مجموعه گرفته شده‌اند. بزرگ‌ترین گروه لزوماً اکثریت نیست. منابع در مخزن پروژه نگهداری می‌شوند. منطقه جغرافیایی بر اساس جزئی‌ترین گروه‌بندی منطقه‌ای <a href="https://unstats.un.org/unsd/methodology/m49/overview/" target="_blank" rel="noopener">طبقه‌بندی M49 سازمان ملل</a> نوشته شده است. رنگ قاره‌ها راهنمای اختصاصی اطلس با الهام از پنج رنگ المپیک است.</p></div>`:originalNotes;
}
function drawFilters(){regions.innerHTML=regionNames.map(name=>{const total=regionTotals[name];return `<button type="button" data-region="${name}" aria-pressed="${name===activeRegion}" class="${name===activeRegion?'active':''}">${fa()?regionFa[name]:name==='All regions'?'All countries':name}<span class="region-count" aria-hidden="true">${num(total)}</span></button>`}).join('');}
function languageValue(c){
 const names=c.languages.map(v=>escapeHTML(fa()?v.fa:v.en));
 const initial=names.slice(0,4).map(name=>`<span class="language-chip">${name}</span>`).join('');
 const rest=names.length>4?`<details class="languages-more"><summary>${t(`Show ${names.length-4} more languages`,`نمایش ${num(names.length-4)} زبان دیگر`)}</summary><div class="language-list">${names.slice(4).map(name=>`<span class="language-chip">${name}</span>`).join('')}</div></details>`:'';
 const note=fa()?c.languageNote.fa:c.languageNote.en;
 return `<div class="language-list">${initial||`<span class="language-empty">${t('No nationwide designation','زبان رسمی سراسری تعیین نشده')}</span>`}</div>${rest}${note?`<span class="fact-note">${escapeHTML(note)}</span>`:''}`;
}
function religionValue(c){
 const note=c.religion.note&&(fa()?c.religion.note.fa:c.religion.note.en);
 const noteHTML=note?`<span class="fact-note rel-note">${escapeHTML(note)}</span>`:'';
 if(c.religion.official) return `<div class="rel-head"><span class="rel-name">${escapeHTML(fa()?c.religion.fa:c.religion.en)}</span><span class="rel-badge">${t('State religion','دین رسمی')}</span></div>${noteHTML}`;
 const r=c.populationReligion;
 const fmt=numberFormats[lang].share;
 const year=numberFormats[lang].year.format(r.year);
 const kind=r.share===null?t('Report','گزارش'):r.majority?t('Majority','اکثریت'):t('Largest group','بزرگ‌ترین گروه');
 const bar=r.share===null?'':`<div class="rel-bar" role="img" aria-label="${t(`${fmt.format(r.share)}% of the population`,`${fmt.format(r.share)}٪ جمعیت`)}"><span style="--share:${Math.min(100,r.share)}%"></span></div>`;
 const share=r.share===null?'':`<span class="rel-share">${fmt.format(r.share)}${t('%','٪')}</span>`;
 return `<div class="rel-head"><span class="rel-name">${escapeHTML(fa()?r.fa:r.en)}</span><span class="rel-badge">${t('No state religion','بدون دین رسمی')}</span></div>${bar}<div class="rel-meta">${share}<span>${kind} · ${r.share===null?'':t('estimate ','برآورد ')}${year}</span></div>${noteHTML}`;
}
function currencyName(name,code){
 const i=name.lastIndexOf(' ');
 const tail=`<span class="nowrap">${escapeHTML(name.slice(i+1))} <bdi class="code-inline">${escapeHTML(code)}</bdi></span>`;
 return i<0?tail:`${escapeHTML(name.slice(0,i))} ${tail}`;
}
const CARD_ICONS={pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',money:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M16 10h5v5h-5a2.5 2.5 0 0 1 0-5Z"/>',cities:'<path d="M3 21V9h7v12M10 21V3h8v18M18 21v-8h3v8M1 21h22M6 12v2m0 3v1m8-11v2m0 3v2m0 3v1"/>',language:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z"/>',culture:'<path d="M12 6C9 3 5 4 3 5v15c3-2 6-2 9 0 3-2 6-2 9 0V5c-2-1-6-2-9 1Zm0 0v14"/>'};
function cardIcon(name){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CARD_ICONS[name]}</svg>`;}
// Presentation abbreviations only; the complete capital wording stays searchable and accessible.
const CAPITAL_ROLES={
 'official':'off.','seat of government':'govt.','administrative':'admin.',
 'constitutional':'const.','legislative and royal':'leg. / royal',
 'claimed':'claimed','administrative centre':'admin.',
 'legislative':'leg.','executive and judicial':'exec. / jud.',
 'de facto; no official capital':'de facto',
 'رسمی':'رسمی','مقر دولت':'دولت','اداری':'اداری','قانون اساسی':'ق. اساسی',
 'قانون‌گذاری و سلطنتی':'تقنینی / شاهی','ادعاشده':'ادعایی','مرکز اداری':'اداری',
 'قانون‌گذاری':'تقنینی','اجرایی و قضایی':'اجرایی / قضایی','در عمل؛ بدون پایتخت رسمی':'در عمل'
};
function capitalValue(c){
 const full=fa()?c.capitalFa:c.capital;
 const parts=[...full.matchAll(/([^();؛]+)\s*\(([^)]+)\)/g)];
 if(!parts.length)return escapeHTML(full);
 const entries=parts.map(([,city,role])=>`<span class="capital-entry"><span>${escapeHTML(city.trim())}</span> <span class="capital-role">· ${escapeHTML(CAPITAL_ROLES[role]||role)}</span></span>`).join('');
 return `<span class="capital-summary" tabindex="0" title="${escapeHTML(full)}" aria-label="${escapeHTML(full)}" data-full="${escapeHTML(full)}">${entries}</span>`;
}
function card(c){
 const religionLabel=c.religion.official?t('Official religion / denomination','دین و مذهب رسمی'):c.populationReligion.group==='Religiously_unaffiliated'?t('Predominant affiliation','گرایش غالب مردم'):t('Predominant religion','دین غالب مردم');
 const cities=fa()?c.citiesFa:c.cities;
 return `<article class="card" tabindex="-1" data-code="${c.code}" data-region="${c.region}"><div class="card-top"><div class="flag-stage"><span class="flag-caption" aria-hidden="true">${t('NATIONAL FLAG','پرچم کشور')}</span><span class="flag"><img src="${escapeHTML(FLAG_FILES[c.code])}" alt="${escapeHTML(t('Flag of '+c.name,'پرچم '+faName(c)))}" width="320" height="200" loading="lazy" decoding="async"></span><div class="country-meta"><span class="continent-tag" data-region="${c.region}">${escapeHTML(fa()?regionFa[c.region]:c.region)}</span><span class="region-tag" data-region="${c.region}">${escapeHTML(COUNTRY_REGIONS[c.code][fa()?'fa':'en'])}</span><bdi class="country-code" title="${t('ISO country code','کد ایزوی کشور')}" aria-label="${t('Country code: ','کد کشور: ')}${c.code}">${c.code}</bdi></div></div><div class="identity"><h3>${escapeHTML(fa()?faName(c):c.name)}</h3></div></div><dl class="details"><div class="detail detail-capital"><dt class="label">${cardIcon('pin')}${t('Capital','پایتخت')}</dt><dd class="value${fa()?'':' source-value'}" lang="${fa()?'fa':'en'}">${capitalValue(c)}</dd></div><div class="detail detail-money"><dt class="label">${cardIcon('money')}${t('Currency','واحد پول')}</dt><dd class="value">${c.currencies.map(v=>`<span class="currency"><bdi class="currency-symbol" aria-hidden="true">${escapeHTML(CURRENCY_SYMBOLS[v.code]||v.code)}</bdi><span>${currencyName(fa()?faCurrency(v):v.name,v.code)}</span></span>`).join('')}</dd></div><div class="detail detail-cities"><dt class="label">${cardIcon('cities')}${t('Key cities','شهرهای مهم')}</dt><dd class="value cities${fa()?'':' source-value'}" lang="${fa()?'fa':'en'}">${cities.map(city=>`<span class="city-chip">${escapeHTML(city)}</span>`).join('')}</dd></div><div class="detail detail-culture"><dt class="label">${cardIcon('language')}${t('Official Languages','زبان‌های رسمی')}</dt><dd class="value">${languageValue(c)}</dd></div><div class="detail detail-religion" data-kind="${c.religion.official?'official':'population'}"><dt class="label">${cardIcon('culture')}${religionLabel}</dt><dd class="value">${religionValue(c)}</dd></div></dl></article>`;
}

function animateCards(start){
 const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
 [...grid.children].slice(start).forEach((element,index)=>{
  if(!element.animate||element.getBoundingClientRect().top>innerHeight)return;
  element.animate(reduce?[{opacity:.85},{opacity:1}]:[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:reduce?120:240,delay:reduce?0:Math.min(index,3)*40,fill:'backwards',easing:'cubic-bezier(.23,1,.32,1)'});
 });
}
function render({more=false,updateURL=true,animate=false}={}){
 const query=plain(search.value.trim());
 const escaped=query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const pattern=new RegExp('(^|[^\\p{L}\\p{N}])'+escaped,'u');
 const matches=sortedCountries[lang].filter(c=>(activeRegion==='All regions'||c.region===activeRegion)&&pattern.test(c.haystack));
 if(sort.value==='desc')matches.reverse();
 const shown=matches.slice(0,limit),prior=grid.children.length;
 const filtered=!!query||activeRegion!=='All regions';
 $('directory-title').textContent=query?t('Search results','نتایج جست‌وجو'):activeRegion==='All regions'?t('Explore the world','جهان را کشف کنید'):t(`Explore ${activeRegion}`,`کشورهای ${regionFa[activeRegion]}`);
 $('count').textContent=fa()?`${num(matches.length)} کشور${filtered?' پیدا شد':' برای کشف'}${query?` برای «${search.value.trim()}»`:''}`:`${matches.length} ${matches.length===1?'country':'countries'}${filtered?' found':' to discover'}${query?` for “${search.value.trim()}”`:''}`;
 if(more)grid.insertAdjacentHTML('beforeend',shown.slice(prior).map(card).join(''));
 else grid.innerHTML=shown.length?shown.map(card).join(''):`<div class="empty"><h3>${t('No countries found','کشوری پیدا نشد')}</h3><p>${t('Try a different spelling, a currency code, or another region.','املای دیگری، کد واحد پول یا منطقه‌ای دیگر را امتحان کنید.')}</p><button type="button" class="primary" id="empty-reset">${t('Clear all filters','پاک‌کردن همه فیلترها')}</button></div>`;
 $('clear-search').hidden=!search.value;$('reset').hidden=!filtered&&sort.value==='asc';
 $('load-area').hidden=shown.length>=matches.length;$('progress').textContent=t(`Showing ${shown.length} of ${matches.length} countries`,`نمایش ${num(shown.length)} از ${num(matches.length)} کشور`);
 $('end-note').hidden=!matches.length||shown.length<matches.length;
 $('end-note').textContent=t(`You’re all caught up · ${matches.length} ${matches.length===1?'country':'countries'}`,`همه نتایج نمایش داده شد · ${num(matches.length)} کشور`);
 regions.querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b.dataset.region===activeRegion);b.setAttribute('aria-pressed',String(b.dataset.region===activeRegion));});
 if(animate)animateCards(more?prior:0);
 updateFilterToggle();
 if(updateURL)saveURL();
 if(more&&grid.children[prior])grid.children[prior].focus({preventScroll:true});
}
const filterToggle=$('filter-toggle'),controls=document.querySelector('.controls');
function updateFilterToggle(){
 const count=Number(activeRegion!=='All regions')+Number(sort.value!=='asc');
 $('filter-toggle-label').textContent=t('Filters','فیلترها');
 $('filter-active-count').textContent=num(count);$('filter-active-count').hidden=!count;
 const region=fa()?regionFa[activeRegion]:activeRegion==='All regions'?'All countries':activeRegion;
 filterToggle.setAttribute('aria-label',t(`Filters: ${region}, ${sort.value==='asc'?'A–Z':'Z–A'}`,`فیلترها: ${region}، ${sort.value==='asc'?'الف–ی':'ی–الف'}`));
}
function closeFilters({focus=false}={}){
 if(!matchMedia('(max-width:640px)').matches)return;
 controls.classList.remove('is-open');filterToggle.setAttribute('aria-expanded','false');
 if(focus)filterToggle.focus({preventScroll:true});
}
filterToggle.addEventListener('click',()=>{const open=controls.classList.toggle('is-open');filterToggle.setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&controls.classList.contains('is-open')&&matchMedia('(max-width:640px)').matches){e.preventDefault();e.stopPropagation();closeFilters({focus:true});}},true);
document.addEventListener('click',e=>{if(!controls.contains(e.target))closeFilters();});
function reset(){search.value='';activeRegion='All regions';sort.value='asc';limit=24;render();closeFilters();search.focus();}
regions.addEventListener('click',e=>{const b=e.target.closest('button[data-region]');if(!b)return;activeRegion=b.dataset.region;limit=24;render();closeFilters({focus:true});});
search.addEventListener('input',()=>{limit=24;render();});
search.addEventListener('keydown',e=>{if(e.key==='Escape'){search.value='';limit=24;render();}});
sort.addEventListener('change',()=>{limit=24;render();closeFilters({focus:true});});
$('clear-search').addEventListener('click',()=>{search.value='';limit=24;render();search.focus();});
$('reset').addEventListener('click',reset);
grid.addEventListener('click',e=>{if(e.target.closest('#empty-reset'))reset();});
$('load-more').addEventListener('click',e=>{limit+=24;render({more:true,animate:e.detail>0});});
$('language').addEventListener('click',()=>{lang=fa()?'en':'fa';limit=24;translate();drawFilters();render();});
window.addEventListener('popstate',()=>{readURL();limit=24;translate();drawFilters();render({updateURL:false});});
readURL();translate();drawFilters();render({updateURL:false,animate:true});
