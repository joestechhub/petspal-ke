// Pets Pal KE - prototype interactions + API + i18n EN/SW + SMS mode
const $ = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];
const API = location.port === '4000' ? '' : 'http://localhost:4000';
let LANG = localStorage.getItem('pp_lang') || 'en';

const I18N = {
  en: { topbar: "Westlands · Kilimani · Kileleshwa · Lavington · Karen · South B", login: "Log in", book: "Book now", hero: 'Pet care in Nairobi, <em>with photos every time.</em>', herosub: "Dog walks in Karura, cat sits in Kilimani, a vet at your gate, a taxi with a crate in the boot. Pay by M-Pesa — held in escrow till you say <strong>sawa</strong>.", smsmode: "No smartphone? Use SMS mode — book via *384*55# + SMS updates (works with kabambe)." },
  sw: { topbar: "Westlands · Kilimani · Kileleshwa · Lavington · Karen · South B", login: "Ingia", book: "Book sasa", hero: 'Huduma ya wanyama Nairobi, <em>na picha kila wakati.</em>', herosub: "Kutembeza mbwa Karura, kukaa na paka Kilimani, daktari nyumbani, teksi na crate. Lipa na M-Pesa — inashikiliwa hadi useme <strong>sawa</strong>.", smsmode: "Huna smartphone? Tumia SMS — book kupitia *384*55# + SMS (inafanya na kabambe)." }
};
function applyLang(){
  const d = I18N[LANG]||I18N.en;
  $$('[data-i18n]').forEach(el=>{ const k=el.dataset.i18n; if(d[k]) el.innerHTML=d[k]; });
  document.documentElement.lang = LANG==='sw'?'sw':'en';
  const b=$('#langBtn'); if(b) b.textContent = LANG==='en'?'SW':'EN';
  localStorage.setItem('pp_lang', LANG);
}
async function apiGet(path, fallback){
  try { const r = await fetch(API+path); if(!r.ok) throw 0; return await r.json(); }
  catch { return fallback; }
}

const U = (id,w=800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=65`;
const WA_NUMBER = "254743634581";
const waLink = (msg) => "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
const waForService = (service) => waLink(`Hi Pets Pal! I'd like to ask about *${service}*. My estate is ____ and I need it on ____. Is someone available?`);
const waForPal = (pal, service) => waLink(`Hi Pets Pal! I'd like to book *${service || 'pet care'}* with *${pal.name}* (${pal.area}). My estate is ____ and I need it on ____. Please confirm availability + price.`);
const PALS = [
  {id:1,name:"Wanjiku M.",area:"Kilimani · 1.2km",rating:4.9,jobs:96,type:"open",tags:["ID-verified","Dog walking","Daycare"],price:500,unit:"/walk",avail:"Available now",init:"WM",cover:U("photo-1548199973-03cce0bbc87b"),av:U("photo-1543466835-00a7907e9de1",200),phone:"0712 ••• 002"},
  {id:2,name:"Brian O. — Pro Vet",area:"Westlands · 2.4km",rating:5.0,jobs:118,type:"pro",tags:["Licensed vet","Home visits","Vaccination"],price:1500,unit:"/visit",avail:"Today 2pm",init:"BO",cover:U("photo-1576201836106-db1758fd1c97"),av:U("photo-1587300003388-59208cc962cb",200),phone:"0712 ••• 003"},
  {id:3,name:"Aisha N.",area:"Kileleshwa · 900m",rating:4.8,jobs:74,type:"open",tags:["Cat specialist","Sitting"],price:800,unit:"/day",avail:"Available now",init:"AN",cover:U("photo-1514888286974-6c03e2ca1dba"),av:U("photo-1592194996308-7b43878e84a6",200),phone:"0733 ••• 003"},
  {id:4,name:"Kevin K. — Trainer",area:"Lavington · 3.1km",rating:4.9,jobs:88,type:"pro",tags:["K9 trainer","Aggression","Puppy"],price:2500,unit:"/session",avail:"Sat open",init:"KK",cover:U("photo-1587300003388-59208cc962cb"),av:U("photo-1548199973-03cce0bbc87b",200),phone:"0722 ••• 004"},
  {id:5,name:"Grace W.",area:"South B · 4km",rating:4.9,jobs:103,type:"open",tags:["Boarding","Gated home","CCTV"],price:1200,unit:"/night",avail:"2 slots left",init:"GW",cover:U("photo-1548767797-d8c844163c4c"),av:U("photo-1517849845537-4d257902454a",200),phone:"0711 ••• 005"},
  {id:6,name:"Pet Taxi — Dennis",area:"Nairobi · citywide",rating:4.7,jobs:115,type:"open",tags:["Vet runs","JKIA","Crates"],price:600,unit:"base +80/km",avail:"On-demand",init:"DT",cover:U("photo-1537151625747-768eb6cf92b2"),av:U("photo-1601758228041-f3b2795255f1",200),phone:"0740 ••• 006"},
];

function palCard(p){
  const badges = p.tags.map(t=>`<span class="badge ${p.type==='pro'?'pro':''}">${t}</span>`).join('');
  return `<article class="pal" data-type="${p.type}" data-name="${p.name.toLowerCase()}">
    <img class="cover" src="${p.cover}" alt="${p.name} with pets" loading="lazy" onerror="this.style.display='none'">
    <div class="bd">
      <div class="who"><img class="av" src="${p.av}" alt="" loading="lazy" onerror="this.style.display='none'"><div><strong style="font-size:15.5px">${p.name}</strong><div class="meta">${p.area} · ${p.jobs} jobs · ${p.avail}</div></div><span class="stars" style="margin-left:auto">★ ${p.rating.toFixed(1)}</span></div>
      <div>${badges}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
        <span class="price">KES ${p.price.toLocaleString()} <small>${p.unit}</small></span>
        <a class="btn small green" target="_blank" rel="noopener" href="${waForPal(p)}">WhatsApp</a>
      </div>
    </div>
  </article>`;
}
function renderPals(filter="all"){
  const el = $("#palList"); if(!el) return;
  const q = ($("#palSearch")?.value||"").toLowerCase();
  const list = PALS.filter(p => (filter==="all"||p.type===filter) && (!q || p.name.toLowerCase().includes(q) || p.area.toLowerCase().includes(q)));
  el.innerHTML = list.length ? list.map(palCard).join('') : `<div role="status" class="booking"><strong>No pals found.</strong><br><span style="color:#6B6560">Try “Kilimani”, “vet” or clear filters. SOS urgent care is always on: AST Kenya.</span></div>`;
  bindBookButtons();
}

let booking = {step:1, service:"Dog walking", pal:PALS[0]};
function openBooking(palId, service){
  // Brochure site: every booking goes to WhatsApp, never on-site.
  if(palId) booking.pal = PALS.find(p=>p.id===Number(palId))||PALS[0];
  if(service) booking.service = service;
  window.open(waForPal(booking.pal, booking.service), "_blank", "noopener");
}
function renderModal(){ /* retired: bookings happen on WhatsApp */ }
function bindBookButtons(){
  $$("[data-book]").forEach(b=>b.onclick=()=>openBooking(b.dataset.book));
  $$("[data-service]").forEach(b=>b.onclick=()=>openBooking(PALS[0].id, b.dataset.service));
  // plain WhatsApp service links
  $$("[data-wa-service]").forEach(a=>{ a.href = waForService(a.dataset.waService); a.target = "_blank"; a.rel = "noopener"; });
}
function initCalc(){
  const r=$("#jobsRange"), o=$("#earnOut"); if(!r||!o) return;
  const upd=()=>{const j=Number(r.value); const avg=900; const gross=j*4*avg; const net=Math.round(gross*0.85); o.textContent=`KES ${net.toLocaleString()} / month`; $("#jobsLabel").textContent=`${j} jobs / week`;};
  r.oninput=upd; upd();
}
function initTabs(){
  $$(".tab").forEach(t=>t.onclick=()=>{
    $$(".tab").forEach(x=>x.setAttribute("aria-selected","false")); t.setAttribute("aria-selected","true");
    $("#ownerView").hidden = t.dataset.tab!=="owner"; $("#palView").hidden = t.dataset.tab!=="pal";
  });
}
function initReveal(){
  const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }),{threshold:.12});
  $$('.reveal:not(.in)').forEach(el=>io.observe(el));
  // animate hero progress bar on load
  setTimeout(()=>{ const b=$('.progress i'); if(b) b.style.width='62%'; }, 200);
}
document.addEventListener("DOMContentLoaded",()=>{
  applyLang();
  // mark active nav without needing per-page edits
  const f = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  $$('.nav-links a').forEach(a => { if (a.getAttribute('href').toLowerCase() === f) a.classList.add('on'); });
  $('#langBtn') && ($('#langBtn').onclick=()=>{ LANG = LANG==='en'?'sw':'en'; applyLang(); });
  // Backend is optional (local demo only). On static hosting the pill hides itself.
  fetch(API+'/api/health').then(r=>r.json()).then(()=>{ const s=$('#apiStatus'); if(s){ s.textContent='● API online'; s.style.color='#7CFC9A'; } }).catch(()=>{ $$('#apiStatus').forEach(s=>s.remove()); });
  // SMS mode
  const smsMode=$('#smsMode'), panel=$('#smsPanel');
  smsMode && (smsMode.onchange=()=>{ panel.hidden=!smsMode.checked; });
  $('#smsSend') && ($('#smsSend').onclick=async()=>{
    const to=$('#smsTo').value, msg=$('#smsMsg').value, out=$('#smsOut');
    out.textContent='Sending…';
    try { const r=await fetch(API+'/api/v1/sms/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to,msg})}); const j=await r.json(); out.textContent='✅ SMS queued to '+j.data.to+' (mock Africa\'s Talking). Pal replies YES to accept.'; }
    catch { out.textContent='✅ (offline demo) SMS would go to '+to+': “'+msg+'”'; }
  });
  renderPals();
  $("#chipAll") && ($$("#chipAll, #chipOpen, #chipPro").forEach(c=>c.onclick=()=>{
    $$("#chipAll,#chipOpen,#chipPro").forEach(x=>x.classList.replace("primary","ghost"));
    c.classList.replace("ghost","primary"); renderPals(c.dataset.filter);
  }));
  $("#palSearch") && $("#palSearch").addEventListener("input",()=>renderPals(document.querySelector("#chipPro")?.classList.contains("primary")?"pro":"all"));
  $("#searchBtn") && ($("#searchBtn").onclick=()=>{
    const svc = $("#sSvc") ? $("#sSvc").value : "walking";
    location.href = "find-help.html?service=" + encodeURIComponent(svc);
  });
  // prefill from ?service=
  const qs = new URLSearchParams(location.search);
  if (qs.get('service') && $("#sSvc")) $("#sSvc").value = qs.get('service');
  // contact page: build WhatsApp message from the form
  $("#waFormBtn") && ($("#waFormBtn").onclick = () => {
    const name = ($("#cName") || {}).value || "";
    const svc = ($("#cSvc") || {}).value || "pet care";
    const day = ($("#cDay") || {}).value || "";
    const n = Math.max(1, Number((($("#cDays") || {}).value) || 1));
    const time = (($("#cTime") || {}).value) || "";
    const span = day ? (n === 1 ? ` on ${day} (1 day${time ? ` at ${time}` : ''})` : ` from ${day} for ${n} days${time ? ` at ${time} daily` : ''}`) : "";
    const msg = `Hi Pets Pal! I'm ${name || 'a pet owner'}. I'd like to ask about *${svc}*${span}. My estate is ____. Please confirm availability + price.`;
    window.open(waLink(msg), "_blank", "noopener");
  });
  // become page: apply via WhatsApp instead of on-site accounts
  $("#applyBtn") && ($("#applyBtn").onclick = () => {
    const name = ($("#aName") || {}).value || "";
    const phone = ($("#aPhone") || {}).value || "";
    const tier = ($("#aRole") || {}).value || "pal";
    const msg = `Hi Pets Pal! I'd like to apply as a *${tier === 'pro' ? 'Pro specialist' : 'pal'}*. Name: ${name}, phone: ${phone}, area: ____. I have ID + references ready.`;
    window.open(waLink(msg), "_blank", "noopener");
    const out = $("#applyOut"); if (out) out.textContent = "Opening WhatsApp… send the message to apply. Asante!";
  });
  // book page: WhatsApp composer with 1-or-more-days range (service preselected from ?service=)
  const flow = $("#pageFlow");
  if (flow) {
    const svc = qs.get("service") || "walking";
    const map = { walking: "Dog walking", sitting: "Cat / pet sitting", boarding: "Boarding", sos: "Urgent SOS", taxi: "Pet taxi / vet run", vet: "Vet at home", grooming: "Grooming", training: "Training" };
    const base = { walking: 500, sitting: 800, boarding: 1200, sos: 1000, taxi: 600, vet: 1500, grooming: 2000, training: 2500 };
    const unitWord = { walking: "walk", sitting: "day", boarding: "night", sos: "visit", taxi: "trip", vet: "visit", grooming: "session", training: "session" };
    const label = map[svc] || svc;
    const per = base[svc] || 800, uw = unitWord[svc] || "day";
    const fmtD = (iso) => { try { return new Date(iso + "T12:00:00").toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" }); } catch { return iso; } };
    flow.innerHTML = `<h3>${label}</h3>
      <p style="color:var(--muted);font-size:14px">One day or a whole stay — pick your dates. We confirm availability + exact price on WhatsApp. No payment on this site.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="field"><label for="bFrom">From</label><input id="bFrom" type="date" value="2026-10-03"></div>
        <div class="field"><label for="bTo">To <small style="font-weight:400">(same day = 1 ${uw})</small></label><input id="bTo" type="date" value="2026-10-03"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px">
        <div class="field"><label for="bTime">Time <small style="font-weight:400">(each day)</small></label><input id="bTime" type="time" value="10:00"></div>
        <div class="field"><label for="bNote">Estate + pet</label><input id="bNote" placeholder="Kilimani, Max the GSD, 2y"></div>
      </div>
      <div class="booking" id="bSum" style="margin-top:10px" aria-live="polite"></div>
      <a class="btn primary" id="bWa" href="${waForService(label)}" target="_blank" rel="noopener" style="margin-top:12px;width:100%;justify-content:center">Chat on WhatsApp →</a>`;
    const upd = () => {
      const from = (document.getElementById("bFrom") || {}).value || "";
      const to = (document.getElementById("bTo") || {}).value || from;
      const time = (document.getElementById("bTime") || {}).value || "";
      const note = (document.getElementById("bNote") || {}).value || "";
      let days = 1;
      if (from && to) days = Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000) + 1);
      const est = (per * days).toLocaleString();
      const when = from ? (days === 1 ? fmtD(from) + " (1 " + uw + ")" : fmtD(from) + " → " + fmtD(to) + ` (${days} ${uw}s)`) : "";
      const at = time ? ` at ${time}` : "";
      const sum = document.getElementById("bSum");
      if (sum) sum.innerHTML = `<strong>${when}${at}</strong><br><span style="font-size:13px;color:var(--muted)">Guide estimate: </span><span class="kes">KES ${est}</span> <span style="font-size:12px;color:var(--muted)">(KES ${per.toLocaleString()} × ${days} — exact fare confirmed on WhatsApp)</span>`;
      const a = document.getElementById("bWa");
      if (a) a.href = waLink(`Hi Pets Pal! I'd like to ask about *${label}*${when ? ` — ${when}${at}` : ''}${note ? `. ${note}` : ''}. Please confirm availability + price.`);
    };
    ["bFrom","bTo","bTime","bNote"].forEach(id => { const el = document.getElementById(id); if (el) el.oninput = upd; });
    upd();
  }
  $("#menuBtn") && ($("#menuBtn").onclick=()=>$("#navLinks").classList.toggle("open"));
  $("#closeModal") && ($("#closeModal").onclick=()=>$("#bookModal").close());
  // floating WhatsApp button on every page (brochure site — chat is the checkout)
  if (!$("#waFloat")) {
    const wa = document.createElement("a");
    wa.id = "waFloat"; wa.className = "wa-float"; wa.target = "_blank"; wa.rel = "noopener";
    wa.href = waLink("Hi Pets Pal! I'd like to ask about your pet services. 🐾");
    wa.setAttribute("aria-label", "Chat on WhatsApp: 0743 634 581");
    wa.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.8 1.7.3.2.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4 0 .1 0 .7-.3 1.1z"/></svg> 0743 634 581';
    document.body.appendChild(wa);
  }
  // "Powered by AST Kenya" credit in every footer
  $$("footer").forEach(f => {
    if (!f.querySelector(".powered")) {
      const d = document.createElement("div");
      d.className = "powered";
      d.innerHTML = "Powered by <strong>AST Kenya</strong>";
      f.appendChild(d);
    }
  });
  bindBookButtons(); initCalc(); initTabs(); initReveal();
  const yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();
});
