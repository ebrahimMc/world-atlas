function createAtlasGlobe({card,t,faName,showCards}) {
 const view = document.getElementById('atlas-view');
 const panel = document.getElementById('atlas-globe');
 const stage = document.getElementById('globe-stage');
 const status = document.getElementById('globe-status');
 const tools = document.getElementById('globe-tools');
 const select = document.getElementById('globe-country');
 const details = document.getElementById('globe-details');
 const announce = document.getElementById('globe-announcement');
 const grid = document.getElementById('grid');
 const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
 const colors = {Africa:'#8ba891',Americas:'#7cabb8',Asia:'#c0aa83',Europe:'#a5adb9',Oceania:'#b4948a'};
 const selectionColor = '#bc94ff';
 const baseView = {lat:23,lng:19,altitude:2.04};
 const minAltitude = .16;
 const maxAltitude = 3.35;
 const scripts = ['assets/vendor/globe.gl-2.46.2.min.js','assets/globe-geography.js'];

 const allCountries = new Map(COUNTRIES.map(country => [country.code,country]));
 let globe, geography, matches = new Map();
 let selected = '', mode = 'globe', loadState = 'idle', visible = false;
 let lastQuery, lastRegion;

 const name = country => t(country.name,faName(country));
 const duration = () => reducedMotion.matches ? 0 : 320;

 function labels() {
  view.setAttribute('aria-label',t('Atlas view','نمای اطلس'));
  view.querySelector('[data-view="globe"]').textContent = t('3D globe','کرهٔ سه‌بعدی');
  view.querySelector('[data-view="cards"]').textContent = t('Country cards','کارت کشورها');
  document.getElementById('globe-country-label').textContent = t('Find a country on the globe','انتخاب کشور روی کره');
  document.getElementById('globe-guide').textContent = t(
   'Drag to rotate · Scroll or pinch to zoom',
   'برای چرخاندن بکشید · برای زوم از چرخ ماوس یا دو انگشت استفاده کنید',
  );
  details.setAttribute('aria-label',t('Country details','اطلاعات کشور'));
  tools.setAttribute('aria-label',t('Globe controls','کنترل‌های کره'));
  document.getElementById('globe-zoom-in').setAttribute('aria-label',t('Zoom in','بزرگ‌نمایی'));
  document.getElementById('globe-zoom-out').setAttribute('aria-label',t('Zoom out','کوچک‌نمایی'));
  document.getElementById('globe-reset').setAttribute('aria-label',t('Reset globe view','بازگشت به نمای اولیه'));
  status.textContent = loadState === 'failed'
   ? t('3D globe unavailable. Choose a country from the list.', 'کرهٔ سه‌بعدی در دسترس نیست. کشور را از فهرست انتخاب کنید.')
   : t('Loading the globe…','در حال بارگذاری کره…');
 }

 function showDetails() {
  const country = matches.get(selected);
  select.value = selected;
  details.innerHTML = country ? card(country) : '';
 }

 function color(code) {
  if (code && code === selected) return selectionColor;
  if (matches.has(code)) return colors[allCountries.get(code).region];
  return allCountries.has(code) ? '#36576a' : '#496273';
 }

 function refreshMap() {
  if (!globe) return;
  globe.polygonCapColor(shape => color(shape.code))
   .polygonStrokeColor(shape => shape.code && shape.code === selected ? '#f0e4ff' : '#183849')
   .pointColor(point => color(point.code));
 }

 function focusCountry(code) {
  const anchor = geography?.anchors[code];
  if (!globe || !anchor) return;
  globe.pointOfView({
   lat:Math.max(-85,Math.min(85,anchor.lat)),
   lng:anchor.lng,
   altitude:anchor.marker ? .46 : 1.64,
  },duration());
 }

 function choose(code, fromMap = false) {
  if (code && !matches.has(code)) return;
  selected = code;
  showDetails();
  refreshMap();
  if (!code) return;
  announce.textContent = name(matches.get(code));
  if (!fromMap) focusCountry(code);
  if (fromMap && matchMedia('(max-width: 760px)').matches) {
   details.querySelector('.card').focus({preventScroll:true});
   details.scrollIntoView({block:'start',behavior:reducedMotion.matches ? 'instant' : 'smooth'});
  }
 }

 function loadScript(src) {
  return new Promise((resolve,reject) => {
   const script = document.createElement('script');
   script.src = src;
   script.onload = resolve;
   script.onerror = reject;
   document.head.append(script);
  });
 }

 function resize() {
  if (!globe || panel.hidden || !stage.clientWidth) return;
  globe.width(stage.clientWidth).height(stage.clientHeight);
 }

 function syncAnimation() {
  if (!globe) return;
  if (visible && mode === 'globe') globe.resumeAnimation();
  else globe.pauseAnimation();
 }

 function mapUnavailable() {
  loadState = 'failed';
  globe?.pauseAnimation();
  globe = undefined;
  stage.replaceChildren();
  stage.classList.add('is-unavailable');
  status.hidden = false;
  tools.hidden = true;
  document.getElementById('globe-guide').hidden = true;
  labels();
 }

 async function loadGlobe() {
  if (loadState !== 'idle') return;
  loadState = 'loading';
  try {
   await Promise.all(scripts.map(loadScript));
   geography = globalThis.atlasGlobeGeography;
   globe = new globalThis.Globe(stage,{animateIn:false,waitForGlobeReady:false})
    .backgroundColor('rgba(0,0,0,0)')
    .atmosphereColor('#83c4df').atmosphereAltitude(.13)
    .showGraticules(true)
    .polygonAltitude(.003)
    .polygonCapCurvatureResolution(3)
    .polygonSideColor(() => '#294556')
    .polygonsTransitionDuration(0)
    .polygonsData(geography.shapes)
    .polygonLabel(shape => matches.has(shape.code) ? name(matches.get(shape.code)) : '')
    .onPolygonClick(shape => {
     if (shape.code) choose(shape.code,true);
    })
    .pointAltitude(.012).pointRadius(.62)
    .pointsTransitionDuration(0)
    .pointsData(Object.values(geography.anchors).filter(point => point.marker))
    .pointLabel(point => matches.has(point.code) ? name(matches.get(point.code)) : '')
    .onPointClick(point => choose(point.code,true))
    .showPointerCursor((type,datum) => matches.has(datum?.code));
   globe.globeMaterial().color.set('#203f56');
   const controls = globe.controls();
   controls.enablePan = false;
   controls.enableZoom = true;
   controls.zoomSpeed = .8;
   controls.minDistance = globe.getGlobeRadius() * (1 + minAltitude);
   controls.maxDistance = globe.getGlobeRadius() * (1 + maxAltitude);
   globe.renderer().setPixelRatio(Math.min(devicePixelRatio,1.5));
   globe.renderer().domElement.addEventListener('webglcontextlost',mapUnavailable,{once:true});
   globe.pointOfView(baseView);
   refreshMap();
   resize();
   if (selected) focusCountry(selected);
   loadState = 'ready';
   tools.hidden = false;
   status.hidden = true;
   syncAnimation();
  } catch {
   mapUnavailable();
  }
 }

 function zoom(factor) {
  const altitude = globe.pointOfView().altitude;
  globe.pointOfView({altitude:Math.max(minAltitude,Math.min(maxAltitude,altitude*factor))});
 }

 function drawView() {
  const showGlobe = mode === 'globe';
  panel.hidden = !showGlobe;
  grid.hidden = showGlobe;
  document.getElementById('load-area').classList.toggle('atlas-cards-only',showGlobe);
  document.getElementById('end-note').classList.toggle('atlas-cards-only',showGlobe);
  view.querySelectorAll('button').forEach(button => {
   button.setAttribute('aria-pressed',String(button.dataset.view === mode));
  });
  if (showGlobe) resize();
  syncAnimation();
 }

 view.addEventListener('click',event => {
  const button = event.target.closest('button[data-view]');
  if (!button || mode === button.dataset.view) return;
  mode = button.dataset.view;
  drawView();
  if (mode === 'cards') showCards();
 });
 select.addEventListener('change',() => choose(select.value));
 document.getElementById('globe-zoom-in').addEventListener('click',() => zoom(.72));
 document.getElementById('globe-zoom-out').addEventListener('click',() => zoom(1/.72));
 document.getElementById('globe-reset').addEventListener('click',() => globe.pointOfView(baseView,duration()));

 new ResizeObserver(resize).observe(stage);
 new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  if (visible) loadGlobe();
  syncAnimation();
 },{rootMargin:'160px'}).observe(stage);

 view.hidden = false;
 drawView();
 return {
  showsCards: () => mode === 'cards',
  update(countries,{query,activeRegion}) {
   const filtersChanged = query !== lastQuery || activeRegion !== lastRegion;
   lastQuery = query;
   lastRegion = activeRegion;
   matches = new Map(countries.map(country => [country.code,country]));
   if (!matches.has(selected)) selected = '';
   const soleResult = query && filtersChanged && countries.length === 1;
   if (soleResult) selected = countries[0].code;
   const prompt = countries.length ? t('Select a country','یک کشور انتخاب کنید') : t('No countries found','کشوری پیدا نشد');
   select.replaceChildren(new Option(prompt,''),...countries.map(country => new Option(name(country),country.code)));
   select.disabled = !countries.length;
   labels();
   showDetails();
   if (filtersChanged) refreshMap();
   if (soleResult) focusCountry(selected);
  },
 };
}
