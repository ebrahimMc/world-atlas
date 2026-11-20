function createAtlasGlobe({card,t,faName,showCards,countries}) {
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
 const colors = Object.fromEntries([...new Set(countries.map(c => c.region))].map(region =>
  [region, getComputedStyle(document.documentElement).getPropertyValue('--map-' + region).trim()]));
 const selectionColor = '#ffdf48';
 const colorToggle = document.getElementById('map-colors');
 let continentColors = true;
 let relation = '', comparison = '';
 let peers = new Map();
 const baseView = {lat:23,lng:19,altitude:2.04};
 const minAltitude = .16;
 const maxAltitude = 3.35;
 const scripts = ['assets/vendor/globe.gl-2.46.2.min.js','assets/globe-geography.js'];

 const allCountries = new Map(countries.map(country => [country.code,country]));
 let globe, geography, matches = new Map();
 let selected = 'FR', mode = 'globe', loadState = 'idle', visible = false;
 let lastQuery, lastRegion;

 const name = country => t(country.name,faName(country));
 const duration = () => reducedMotion.matches ? 0 : 320;

 const layerSelect = document.getElementById('atlas-layer');
 const layerDetail = document.getElementById('layer-detail');
 let layer='countries',night,port=null,portStep=-1;
 function selectMarkup(id,label,entries,value) {
  return `<label class="explore-select">${label}<select id="${id}">${entries.map(([key,text])=>
   `<option value="${key}" ${key===value?'selected':''}>${escapeHTML(text)}</option>`).join('')}</select></label>`;
 }
 function renderLayer() {
  layerSelect.value=layer;
  if(layer==='ports') {
   layerDetail.innerHTML=selectMarkup('port-pick',t('Locate a port','پیدا کردن بندر'),[['',t('Choose a port','یک بندر انتخاب کنید')],...ATLAS_PORTS.map((p,i)=>[String(i),p.name]).sort((a,b)=>a[1].localeCompare(b[1]))],port===null?'':String(ATLAS_PORTS.indexOf(port)))+
    '<p>'+t('Zoom in for more ports.','برای دیدن بنادر بیشتر زوم کنید.')+'</p>';
   $('port-pick').onchange=e=>pickPort(e.target.value===''?null:ATLAS_PORTS[+e.target.value]);
   if(port)layerDetail.insertAdjacentHTML('beforeend',`<p><bdi>${escapeHTML(port.name)} · ${port.lat.toFixed(2)}°, ${port.lng.toFixed(2)}°</bdi></p>`);
  } else if(layer==='day') {
   layerDetail.textContent=t('Night is shaded. Capital clocks and the sunset boundary update each minute.','نیم‌کرهٔ شب در سایه است. ساعت شهرها و مرز شب و روز هر دقیقه به‌روز می‌شوند.');
   if(selected)layerDetail.insertAdjacentHTML('beforeend',`<p data-clock="${selected}">${localClock(selected)}</p>`);
  } else layerDetail.replaceChildren();
 }
 function pickPort(next) {
  port=next;
  renderLayer();
  if(port && globe)globe.pointOfView({lat:port.lat,lng:port.lng,altitude:.36},duration());
  updatePorts(true);
 }
 function updatePorts(force=false) {
  if(!globe)return;
  const alt=globe.pointOfView().altitude;
  const step=layer!=='ports'?0:alt>1.2?3:alt>.7?5:alt>.35?6:8;
  if(step===portStep&&!force)return;
  portStep=step;
  globe.labelsData(step?ATLAS_PORTS.filter(p=>p.rank<=step||p===port):[])
   .labelText(p=>step>=6||p===port?p.name:'');
 }
 layerSelect.onchange=e=>{
  layer=e.target.value;
  renderLayer();
  refreshMap();
  updatePorts(true);
 };

 function tick() {
  const now=new Date();
  night?.(layer==='day',now);
  for(const el of document.querySelectorAll('[data-clock]'))el.innerHTML=localClock(el.dataset.clock,now);
 }
 setInterval(()=>{if(!document.hidden)tick();},60000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});

 function labels() {
  colorToggle.querySelector('span').textContent = t('Continent colors','رنگ قاره‌ها');
  view.setAttribute('aria-label',t('Atlas view','نمای اطلس'));
  view.querySelector('[data-view="globe"] span').textContent = t('3D globe','کرهٔ سه‌بعدی');
  view.querySelector('[data-view="cards"] span').textContent = t('Country cards','کارت کشورها');
  document.getElementById('globe-country-label').textContent = t('Find a country on the globe','انتخاب کشور روی کره');
  document.getElementById('globe-guide').textContent = t(
   'Drag to rotate · Pinch or scroll to zoom',
   'چرخش با کشیدن · زوم با دو انگشت یا چرخ ماوس',
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

 function shared(a,b,field) {
  if(field==='any')return true;
  if(field==='neighbors')return COUNTRY_METRICS[a.code].borders.includes(b.code);
  const key = field === 'currencies' ? 'code' : 'en';
  return a[field].some(x => b[field].some(y => x[key] === y[key]));
 }

 function showDetails() {
  const country = matches.get(selected);
  if(layer==='day')renderLayer();
  select.value = selected;
  details.innerHTML = country ? card(country) : '';
  if (!country) return;
  const related = document.createElement('div');
  related.className = 'related';
  const fields = [['neighbors',t('Land neighbors','همسایه‌های زمینی')],['any',t('Compare any country','مقایسه با هر کشور')],['currencies',t('Shared currency','پول مشترک')],['languages',t('Shared language','زبان مشترک')]];
  for (const [field,label] of fields) {
   const others = countries.filter(c => c.code !== selected && shared(country,c,field));
   if (!others.length) continue;
   const button = document.createElement('button');
   button.type = 'button';
   button.textContent = label + ' · ' + num(others.length);
   button.setAttribute('aria-pressed',String(relation === field));
   button.onclick = () => {
    relation = relation === field ? '' : field;
    comparison = '';
    peers = new Map(relation ? others.map(c => [c.code,c]) : []);
    showDetails();
    refreshMap();
    if (relation) details.querySelector('.compare-select').focus({preventScroll:true});
    else details.querySelector('.related button')?.focus({preventScroll:true});
   };
   related.append(button);
  }
  if (related.childElementCount) {
   const heading = document.createElement('h4');
   heading.textContent = t('Explore connections','ارتباط با کشورهای دیگر');
   details.append(heading,related);
  }
  if (!relation) return;
  const picker = document.createElement('select');
  picker.className = 'compare-select';
  const prompt = t('Compare with another country','مقایسه با یک کشور دیگر');
  picker.setAttribute('aria-label',prompt);
  picker.add(new Option(prompt,''));
  const ordered = [...peers.values()].sort((a,b) => collators[lang].compare(name(a),name(b)));
  ordered.forEach(c => picker.add(new Option(name(c),c.code)));
  picker.value = comparison;
  picker.onchange = () => compare(picker.value);
  details.append(picker);
  if (comparison) {
   const other = peers.get(comparison);
   const key = relation === 'currencies' ? 'code' : 'en';
   const common = (other[relation] || []).filter(x => country[relation].some(y => x[key] === y[key]));
   const note = document.createElement('p');
   note.className = 'reason';
   note.textContent = common.map(x => relation === 'currencies' ? t(x.name,faCurrency(x)) : t(x.en,x.fa)).join(' · ');
   const pair = document.createElement('div');
   pair.className = 'comparison';
   const first = details.querySelector('.card');
   details.prepend(pair);
   pair.append(first);
   pair.insertAdjacentHTML('beforeend',card(other));
   if(note.textContent)picker.after(note);
   pair.insertAdjacentHTML('afterend',compareMetrics(country,other));
   if(relation==='neighbors') {
    const onward=document.createElement('button');
    onward.textContent=t('Explore ','کاوش در ')+name(other);
    onward.onclick=()=>{reset();choose(other.code);};
    picker.after(onward);
   }
  }
 }
 function compare(code) {
  comparison = code;
  showDetails();
  refreshMap();
  focusCountry(code || selected);
  details.querySelector('.compare-select')?.focus({preventScroll:true});
  announce.textContent = code ? name(peers.get(code)) : '';
 }
 function selectable(code) {
  return relation ? code === selected || peers.has(code) : matches.has(code);
 }
 function color(code) {
  if (code && (code === selected || code === comparison)) return selectionColor;
  if (relation && relation!=='any' && peers.has(code)) return '#39d5bf';
  if ((!relation || relation==='any') && matches.has(code)) return continentColors ? colors[allCountries.get(code).region] : '#82cab4';
  return '#47678a';
 }
 function refreshMap() {
  if (!globe) return;
  const start = geography.anchors[selected];
  const end = geography.anchors[comparison];
  night?.(layer==='day',new Date());
  const arcs=start && end ? [{startLat:start.lat,startLng:start.lng,endLat:end.lat,endLng:end.lng}] : [];
  globe.arcsData(arcs);
  globe.polygonAltitude(shape => shape.code && (shape.code === selected || shape.code === comparison) ? .012 : .003);
  globe.polygonCapColor(shape => color(shape.code))
   .polygonStrokeColor(shape => shape.code && shape.code === selected ? '#76540a' : '#2c4b69')
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
  if (fromMap && relation) {
   if (peers.has(code)) compare(code);
   return;
  }
  if (code && !matches.has(code)) return;
  relation = comparison = '';
  peers.clear();
  selected = code;
  showDetails();
  refreshMap();
  if (!code) return;
  announce.textContent = name(matches.get(code));
  if (!fromMap) focusCountry(code);
  if (fromMap && !reducedMotion.matches && matchMedia('(max-width:760px)').matches) {
   details.animate([{transform:'translateY(6px)',opacity:.7},{transform:'none',opacity:1}],{duration:180});
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
    .atmosphereColor('#57b9ee').atmosphereAltitude(.09)
    .showGraticules(true)
    .arcColor(() => '#fff2a2').arcStroke(.25).arcAltitudeAutoScale(.23)
    .arcsTransitionDuration(0)
    .polygonCapCurvatureResolution(3)
    .polygonSideColor(() => '#294556')
    .polygonsTransitionDuration(0)
    .polygonsData(geography.shapes)
    .polygonLabel(shape => selectable(shape.code) && shape.code ? name(allCountries.get(shape.code)) : '')
    .onPolygonClick(shape => {
     if (shape.code) choose(shape.code,true);
    })
    .labelLat(p=>p.lat).labelLng(p=>p.lng).labelColor(()=>'#ffe397')
    .labelDotRadius(.24).labelSize(.33).labelAltitude(.02).labelsTransitionDuration(0)
    .onLabelClick(p=>pickPort(p))
    .pointAltitude(.012).pointRadius(.62)
    .pointsTransitionDuration(0)
    .pointsData(Object.values(geography.anchors).filter(point => point.marker))
    .pointLabel(point => selectable(point.code) ? name(allCountries.get(point.code)) : '')
    .onPointClick(point => choose(point.code,true))
    .showPointerCursor((type,datum) => selectable(datum?.code));
   const ocean = globe.globeMaterial();
   ocean.color.set('#1867a7');
   ocean.shininess = 22;
   const lights = globe.lights();
   const sky = lights.find(light => light.isAmbientLight);
   const sun = lights.find(light => light.isDirectionalLight);
   if (sky && sun) {
    sky.color.set('#e0eaff');
    sky.intensity = 1.65;
    sun.position.set(-2,3,4);
    sun.intensity = 2.5;
   }
   night=attachNight(globe);
   updatePorts(true);
   const controls = globe.controls();
   controls.enablePan = false;
   controls.enableZoom = true;
   controls.zoomSpeed = .8;
   controls.minDistance = globe.getGlobeRadius() * (1 + minAltitude);
   controls.maxDistance = globe.getGlobeRadius() * (1 + maxAltitude);
   globe.renderer().setPixelRatio(Math.min(devicePixelRatio,1.5));
   globe.renderer().domElement.addEventListener('webglcontextlost',mapUnavailable,{once:true});
   globe.onZoom(({lat,lng}) => {
    updatePorts();
    document.getElementById('coordinates').textContent =
     Math.abs(lat).toFixed(1) + '° ' + (lat < 0 ? 'S' : 'N') + '   /   ' +
     Math.abs(lng).toFixed(1) + '° ' + (lng < 0 ? 'W' : 'E');
   });
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
  panel.hidden = !showGlobe || !matches.size;
  panel.parentElement.classList.toggle('with-map',!panel.hidden);
  grid.hidden = showGlobe && !!matches.size;
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
 colorToggle.onclick = () => {
  continentColors = !continentColors;
  colorToggle.setAttribute('aria-pressed',String(continentColors));
  refreshMap();
 };
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
  openCountry(code) { mode = 'globe'; drawView(); choose(code); },
  showsCards: () => mode === 'cards',
  update(countries,{query,activeRegion}) {
   const filtersChanged = query !== lastQuery || activeRegion !== lastRegion;
   if (filtersChanged) { relation = comparison = ''; peers.clear(); }
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
   renderLayer();
   drawView();
   showDetails();
   announce.textContent = selected ? name(matches.get(selected)) : '';
   if (filtersChanged) { refreshMap();updatePorts(); }
   if (soleResult) focusCountry(selected);
  },
 };
}
