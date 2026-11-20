const layerNames = {
 countries:['Countries','کشورها'], day:['Day and night','شب و روز'], ports:['Ports','بنادر']
};
const formatValue = (v,digits=0) => new Intl.NumberFormat(lang,{maximumFractionDigits:digits}).format(v);
const metricFields = () => [
 ['population',t('Population','جمعیت')],['area',t('Area (km²)','مساحت (km²)')],['density',t('People per km²','نفر در km²')]
];
function metricValue(m,key) {return key==='density' ? m.population/m.area : m[key];}
function formattedMetric(m,key) {
 const value=metricValue(m,key);
 return formatValue(value,key==='density'?1:value<1?2:0);
}
function metricsMarkup(code) {
 const m=COUNTRY_METRICS[code];
 return '<dl class="metric-strip">'+metricFields().map(([key,title])=>
  `<div><dt>${title}${key==='population'?' · '+numberFormats[lang].year.format(m.year):''}</dt><dd>${formattedMetric(m,key)}</dd></div>`
 ).join('')+'</dl>';
}
function compareMetrics(a,b) {
 const fmt=c=>escapeHTML(t(c.name,faName(c)));
 return '<div class="metric-comparison">'+metricFields().map(([key,title])=>{
  const maximum=Math.max(...[a,b].map(c=>metricValue(COUNTRY_METRICS[c.code],key)));
  return `<strong>${title}</strong>`+[a,b].map(c=>{
   const m=COUNTRY_METRICS[c.code];
   return `<div><span>${fmt(c)}</span><b>${formattedMetric(m,key)}</b><i style="--amount:${100*metricValue(m,key)/maximum}%"></i></div>`;
  }).join('');
 }).join('')+'</div>';
}
const clockFormats = new Map();
function clockFormat(locale,zone,offset=false) {
 const key=[locale,zone,offset].join('/');
 if(!clockFormats.has(key)) {
  const options=offset?{timeZoneName:'longOffset'}:{hour:'2-digit',minute:'2-digit',hourCycle:'h23'};
  clockFormats.set(key,new Intl.DateTimeFormat(locale,{...options,timeZone:zone}));
 }
 return clockFormats.get(key);
}
function offsetMinutes(zone,date) {
 const offset=clockFormat('en',zone,true).formatToParts(date).find(p=>p.type==='timeZoneName').value;
 const match=/GMT([+-])(\d+):(\d+)/.exec(offset);
 return match?(match[1]==='-'?-1:1)*(60*Number(match[2])+Number(match[3])):0;
}
function localClock(code,date=new Date()) {
 const m=COUNTRY_METRICS[code];
 const time=clockFormat(lang,m.zone).format(date);
 const minutes=offsetMinutes(m.zone,date)-offsetMinutes('Asia/Tehran',date);
 const hours=Math.floor(Math.abs(minutes)/60);
 const delta=minutes===0?t('Same time as Tehran','هم‌زمان با تهران'):t('vs Tehran','نسبت به تهران')+
  ' <bdi dir="ltr">'+(minutes>0?'+':'−')+num(hours)+':'+num(Math.abs(minutes)%60).padStart(2,num(0))+'</bdi>';
 const capitalFa=COUNTRY_FACTS[code].capitalFa;
 const city=fa() && !/[؛;()]/.test(capitalFa)?capitalFa:m.clockCity;
 return `<bdi>${escapeHTML(city)}</bdi> · <bdi>${time}</bdi> <small>${delta}</small>`;
}
function updateExploreLabels() {
 $('layer-title').textContent=t('Map layer','لایهٔ نقشه');
 for(const option of $('atlas-layer').options) option.textContent=t(...layerNames[option.value]);
 $('dataset-title').textContent=t('Data and methods','منابع و روش محاسبه');
 $('dataset-notes').innerHTML=`<p>${t('Population for 2025 is from the World Bank. Vatican City uses its official 2024 resident count. Density is population divided by total area.','جمعیت ۲۰۲۵ از بانک جهانی و جمعیت ۲۰۲۴ واتیکان از آمار رسمی ساکنان آن است. تراکم از تقسیم جمعیت بر مساحت کل محاسبه شده است.')} <a href="https://data.worldbank.org/indicator/SP.POP.TOTL">World Bank</a> · <a href="https://www.vaticanstate.va/en/state-and-government/general-informations/population.html">Vatican City</a></p>
 <p>${t('Area, ocean access and borders use the country dataset (ODbL). Neighbors are limited to countries in this atlas. Overseas land borders are included.','مساحت، دسترسی به آب‌های آزاد و مرزها از مجموعهٔ دادهٔ کشورهاست. همسایه‌ها به کشورهای این اطلس محدودند و مرزهای زمینی فرادریایی را هم در بر می‌گیرند.')} <a href="https://github.com/mledoze/countries">mledoze</a> · <a href="https://www.canada.ca/en/global-affairs/news/2022/06/boundary-dispute.html">Tartupaluk</a></p>
 <p>${t('City time zones come from GeoNames (CC BY 4.0). Times use the device clock and time-zone rules. Night shading approximates sunset at sea level. Ports are a cartographic selection, with more points at closer zoom.','منطقهٔ زمانی شهرها از GeoNames است. ساعت‌ها با زمان دستگاه و قواعد منطقهٔ زمانی محاسبه می‌شوند. سایهٔ شب تقریبی است. بنادر گزیدهٔ نقشه‌نگاری Natural Earth هستند و با زوم، نقاط بیشتری دیده می‌شود.')} <a href="https://www.geonames.org/">GeoNames</a> · <a href="https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_ports.geojson">Natural Earth</a></p>`;
}
// Approximate apparent solar longitude and subsolar point from Julian days since J2000.
function subsolarPoint(date) {
 const d=date.getTime()/86400000-10957.5, rad=Math.PI/180;
 const anomaly=(357.529+.98560028*d)*rad;
 const lambda=(280.459+.98564736*d+1.915*Math.sin(anomaly)+.020*Math.sin(2*anomaly))*rad;
 const tilt=(23.439-.00000036*d)*rad;
 const ra=Math.atan2(Math.cos(tilt)*Math.sin(lambda),Math.cos(lambda))/rad;
 return {lat:Math.asin(Math.sin(tilt)*Math.sin(lambda))/rad,lng:((ra-280.46061837-360.98564736629*d)%360+540)%360-180};
}
function nightSurface(globe) {
 const mesh=globe.scene().getObjectByProperty('material',globe.globeMaterial());
 if(!mesh?.geometry?.attributes.position) return null;
 const shade=mesh.clone(false);
 shade.material=mesh.material.clone();
 shade.material.transparent=true;
 shade.material.depthWrite=false;
 shade.material.color.set('#06132c');
 shade.material.shininess=0;
 const sun={value:mesh.position.clone()};
 shade.material.onBeforeCompile=shader=>{
  shader.uniforms.sunDirection=sun;
  shader.vertexShader='varying vec3 atlasNormal;\n'+shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\natlasNormal=normalize(position);');
  shader.fragmentShader='uniform vec3 sunDirection; varying vec3 atlasNormal;\n'+shader.fragmentShader.replace('#include <alphamap_fragment>','#include <alphamap_fragment>\ndiffuseColor.a *= 0.68*(1.0-smoothstep(-0.08,0.02,dot(normalize(atlasNormal),sunDirection)));');
 };
 shade.quaternion.identity();
 shade.scale.multiplyScalar(1.019);
 shade.renderOrder=5;
 shade.raycast=()=>{};
 shade.visible=false;
 mesh.parent.add(shade);
 return (enabled,date)=>{
  shade.visible=enabled;
  if(enabled){const {lat,lng}=subsolarPoint(date);const p=globe.getCoords(lat,lng);sun.value.set(p.x,p.y,p.z).normalize();}
 };
}

function attachNight(globe) {
 let update;
 return (enabled,date)=>{
  if(enabled && !update)update=nightSurface(globe);
  update?.(enabled,date);
 };
}
