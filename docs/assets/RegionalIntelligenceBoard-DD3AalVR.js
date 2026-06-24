var C=Object.defineProperty;var M=(t,r,i)=>r in t?C(t,r,{enumerable:!0,configurable:!0,writable:!0,value:i}):t[r]=i;var g=(t,r,i)=>M(t,typeof r!="symbol"?r+"":r,i);import{e as o,iq as j,q as S,r as D,a8 as E,i as k,aI as N,ir as H,s as f,t as x,a$ as F,aU as O,aQ as q,b1 as U}from"./panels-DvH657xE.js";import"./d3-DE1H7FhT.js";import"./i18n-qlunRAMb.js";const R=[{id:"mena",label:"Middle East & North Africa"},{id:"east-asia",label:"East Asia & Pacific"},{id:"europe",label:"Europe & Central Asia"},{id:"north-america",label:"North America"},{id:"south-asia",label:"South Asia"},{id:"latam",label:"Latin America & Caribbean"},{id:"sub-saharan-africa",label:"Sub-Saharan Africa"}],P="mena";function I(t,r){return t===r}function W(t){var r,i;return[_(t.narrative),V(t),G(t.balance),K(t.actors),Z(t.scenarioSets),J(t.transmissionPaths),X(((r=t.triggers)==null?void 0:r.active)??[],((i=t.narrative)==null?void 0:i.watchItems)??[]),Y(t)].join("")}function d(t,r,i=""){return`
    <div class="rib-section" style="margin-bottom:12px;padding:10px 12px;border:1px solid var(--border);border-radius:4px;background:rgba(255,255,255,0.02);${i}">
      <div class="rib-section-title" style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-dim);margin-bottom:8px">${o(t)}</div>
      ${r}
    </div>
  `}function b(t,r){const i=((r==null?void 0:r.text)??"").trim();if(!i)return"";const e=((r==null?void 0:r.evidenceIds)??[]).filter(a=>a.length>0),n=e.length>0?`<span style="font-size:10px;color:var(--text-dim);margin-left:6px">[${o(e.slice(0,4).join(", "))}]</span>`:"";return`
    <div class="rib-narrative-row" style="margin-bottom:8px">
      <div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-dim);margin-bottom:2px">${o(t)}${n}</div>
      <div style="font-size:12px;line-height:1.5">${o(i)}</div>
    </div>
  `}function _(t){if(!t)return"";const r=[b("Situation",t.situation),b("Balance Assessment",t.balanceAssessment),b("Outlook — 24h",t.outlook24h),b("Outlook — 7d",t.outlook7d),b("Outlook — 30d",t.outlook30d)].join("");return r?d("Narrative",r):""}function V(t){const r=t.regime,i=(r==null?void 0:r.label)??"unknown",e=(r==null?void 0:r.previousLabel)??"",n=(r==null?void 0:r.transitionDriver)??"",s=e&&e!==i?`<div style="font-size:11px;color:var(--text-dim);margin-top:2px">Was: ${o(e)}${n?` · ${o(n)}`:""}</div>`:"",p=`
    <div class="rib-regime-label" style="font-size:15px;font-weight:600;text-transform:capitalize">${o(i.replace(/_/g," "))}</div>
    ${s}
  `;return d("Regime",p)}function h(t,r,i){const e=Math.max(0,Math.min(1,r))*100;return`
    <div style="display:grid;grid-template-columns:110px 40px 1fr;gap:8px;align-items:center;margin-bottom:4px">
      <div style="font-size:11px;color:var(--text-dim)">${o(t)}</div>
      <div style="font-size:11px;font-variant-numeric:tabular-nums">${r.toFixed(2)}</div>
      <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden">
        <div style="height:100%;width:${e.toFixed(1)}%;background:var(${i})"></div>
      </div>
    </div>
  `}function G(t){if(!t)return d("Balance Vector",'<div style="font-size:11px;color:var(--text-dim)">Unavailable</div>');const r=[h("Coercive",t.coercivePressure,"--danger"),h("Fragility",t.domesticFragility,"--danger"),h("Capital",t.capitalStress,"--danger"),h("Energy Vuln",t.energyVulnerability,"--danger")].join(""),i=[h("Alliance",t.allianceCohesion,"--accent"),h("Maritime",t.maritimeAccess,"--accent"),h("Energy Lev",t.energyLeverage,"--accent")].join(""),e=t.netBalance,n=Math.max(-1,Math.min(1,e)),a=Math.abs(n)*50,s=n>=0?"right":"left",p=n>=0?"var(--accent)":"var(--danger)",u=`
    <div style="display:grid;grid-template-columns:110px 40px 1fr;gap:8px;align-items:center;margin-top:6px;padding-top:6px;border-top:1px dashed rgba(255,255,255,0.1)">
      <div style="font-size:11px;color:var(--text-dim);font-weight:600">Net Balance</div>
      <div style="font-size:11px;font-variant-numeric:tabular-nums;font-weight:600">${e.toFixed(2)}</div>
      <div style="position:relative;height:6px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden">
        <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.3)"></div>
        <div style="position:absolute;${s}:50%;top:0;bottom:0;width:${a.toFixed(1)}%;background:${p}"></div>
      </div>
    </div>
  `,l=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div>
        <div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;margin-bottom:4px">Pressures</div>
        ${r}
      </div>
      <div>
        <div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;margin-bottom:4px">Buffers</div>
        ${i}
      </div>
    </div>
    ${u}
  `;return d("Balance Vector",l)}function K(t){if(!t||t.length===0)return d("Actors",'<div style="font-size:11px;color:var(--text-dim)">No actor data</div>');const i=[...t].sort((e,n)=>(n.leverageScore??0)-(e.leverageScore??0)).slice(0,5).map(e=>{const n=e.delta>0?`+${e.delta.toFixed(2)}`:e.delta.toFixed(2),a=e.delta>0?"var(--danger)":e.delta<0?"var(--accent)":"var(--text-dim)",s=(e.leverageDomains??[]).slice(0,3).join(", ");return`
      <div style="display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;padding:4px 0;border-bottom:1px dashed rgba(255,255,255,0.06)">
        <div>
          <div style="font-size:12px;font-weight:500">${o(e.name||e.actorId)}</div>
          <div style="font-size:10px;color:var(--text-dim);text-transform:capitalize">${o(e.role||"actor")}${s?` · ${o(s)}`:""}</div>
        </div>
        <div style="font-size:11px;font-variant-numeric:tabular-nums">${(e.leverageScore??0).toFixed(2)}</div>
        <div style="font-size:10px;color:${a};font-variant-numeric:tabular-nums;min-width:38px;text-align:right">${o(n)}</div>
      </div>
    `}).join("");return d("Actors",i)}function Z(t){if(!t||t.length===0)return d("Scenarios",'<div style="font-size:11px;color:var(--text-dim)">No scenario data</div>');const r={"24h":0,"7d":1,"30d":2},i=[...t].sort((s,p)=>(r[s.horizon]??99)-(r[p.horizon]??99)),e={base:"var(--text-dim)",escalation:"var(--danger)",containment:"var(--accent)",fragmentation:"var(--warning, #e0a020)"},n=i.map(s=>{const u=[...s.lanes??[]].sort((l,c)=>c.probability-l.probability).map(l=>{const c=Math.round((l.probability??0)*100),v=e[l.name]??"var(--text-dim)";return`
        <div style="margin-bottom:3px">
          <div style="display:flex;justify-content:space-between;font-size:11px;text-transform:capitalize">
            <span>${o(l.name)}</span>
            <span style="font-variant-numeric:tabular-nums">${c}%</span>
          </div>
          <div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${c}%;background:${v}"></div>
          </div>
        </div>
      `}).join("");return`
      <div>
        <div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;margin-bottom:6px">${o(s.horizon)}</div>
        ${u}
      </div>
    `}).join(""),a=`<div style="display:grid;grid-template-columns:repeat(${i.length},1fr);gap:12px">${n}</div>`;return d("Scenarios",a)}function Q(t){switch((t??"").toLowerCase()){case"critical":return"var(--danger)";case"high":return"var(--danger)";case"medium":return"var(--warning, #e0a020)";case"low":return"var(--text-dim)";default:return"var(--text-dim)"}}function J(t){if(!t||t.length===0)return d("Transmission Paths",'<div style="font-size:11px;color:var(--text-dim)">No active transmissions</div>');const i=[...t].sort((e,n)=>(n.confidence??0)-(e.confidence??0)).slice(0,5).map(e=>{const n=Q(e.severity),a=e.corridorId?` via ${o(e.corridorId)}`:"",s=Math.round((e.confidence??0)*100),p=e.latencyHours>0?` · ${e.latencyHours}h`:"";return`
      <div style="padding:4px 0;border-bottom:1px dashed rgba(255,255,255,0.06);display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center">
        <div>
          <div style="font-size:11px;font-weight:500">${o(e.mechanism||"mechanism")}${a}</div>
          <div style="font-size:10px;color:var(--text-dim)">${o(e.start||"")} → ${o(e.end||"")}${p}</div>
        </div>
        <div style="font-size:10px;font-variant-numeric:tabular-nums;color:${n};text-transform:uppercase">${o(e.severity||"unspec")} · ${s}%</div>
      </div>
    `}).join("");return d("Transmission Paths",i)}function X(t,r){const i=(t??[]).map(a=>`
    <div style="padding:3px 0;font-size:11px">
      <span style="color:var(--danger);font-weight:600">●</span>
      ${o(a.id)}${a.description?` — <span style="color:var(--text-dim)">${o(a.description)}</span>`:""}
    </div>
  `).join(""),e=(r??[]).filter(a=>(a.text??"").trim().length>0).map(a=>`
    <div style="padding:3px 0;font-size:11px">
      <span style="color:var(--text-dim)">▸</span>
      ${o(a.text)}
    </div>
  `).join("");if(!i&&!e)return d("Watchlist",'<div style="font-size:11px;color:var(--text-dim)">No active triggers or watch items</div>');const n=[];return i&&n.push(`<div style="margin-bottom:6px"><div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;margin-bottom:2px">Active Triggers</div>${i}</div>`),e&&n.push(`<div><div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;margin-bottom:2px">Watch Items</div>${e}</div>`),d("Watchlist",n.join(""))}function Y(t){const r=t.meta;if(!r)return"";const i=Math.round((r.snapshotConfidence??0)*100),e=t.generatedAt?`${new Date(t.generatedAt).toISOString().replace("T"," ").slice(0,16)}Z`:"—",n=r.narrativeProvider?`${o(r.narrativeProvider)}/${o(r.narrativeModel||"unknown")}`:"no narrative";return`
    <div style="display:flex;flex-wrap:wrap;gap:12px;padding:6px 2px 0;font-size:10px;color:var(--text-dim)">
      <span>generated ${o(e)}</span>
      <span>confidence ${i}%</span>
      <span>scoring v${o(r.scoringVersion||"")}</span>
      <span>geo v${o(r.geographyVersion||"")}</span>
      <span>narrative: ${n}</span>
    </div>
  `}function tt(t){return t?new Date(t).toISOString().replace("T"," ").slice(0,16)+"Z":"—"}function et(t){if(!t||t.length===0)return d("Regime History",'<div style="font-size:11px;color:var(--text-dim)">No regime transitions recorded yet</div>');const r=t.slice(0,20).map(i=>{const e=i.previousLabel?o(i.previousLabel.replace(/_/g," ")):"none",n=o((i.label??"").replace(/_/g," ")),a=i.transitionDriver?` · ${o(i.transitionDriver)}`:"",s=tt(i.transitionedAt);return`
      <div style="display:grid;grid-template-columns:130px 1fr;gap:8px;padding:3px 0;border-bottom:1px dashed rgba(255,255,255,0.06)">
        <div style="font-size:10px;color:var(--text-dim);font-variant-numeric:tabular-nums">${o(s)}</div>
        <div style="font-size:11px"><span style="color:var(--text-dim)">${e}</span> → <span style="font-weight:500;text-transform:capitalize">${n}</span>${a}</div>
      </div>
    `}).join("");return d("Regime History",r)}function it(t){if(!t||!t.situationRecap)return d("Weekly Brief",'<div style="font-size:11px;color:var(--text-dim)">No weekly brief available yet</div>');const r=t.periodStart?new Date(t.periodStart).toISOString().split("T")[0]??"?":"?",i=t.periodEnd?new Date(t.periodEnd).toISOString().split("T")[0]??"?":"?",e=t.provider?`${o(t.provider)}/${o(t.model||"?")}`:"",n=(t.keyDevelopments??[]).filter(s=>s.length>0).slice(0,5).map(s=>`<div style="padding:2px 0;font-size:11px"><span style="color:var(--text-dim)">▸</span> ${o(s)}</div>`).join(""),a=`
    <div style="font-size:10px;color:var(--text-dim);margin-bottom:6px">${o(r)} — ${o(i)}${e?` · ${e}`:""}</div>
    ${t.situationRecap?`<div style="font-size:12px;line-height:1.5;margin-bottom:8px">${o(t.situationRecap)}</div>`:""}
    ${t.regimeTrajectory?`
      <div style="margin-bottom:6px">
        <div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;margin-bottom:2px">Regime Trajectory</div>
        <div style="font-size:11px;line-height:1.4">${o(t.regimeTrajectory)}</div>
      </div>
    `:""}
    ${n?`
      <div style="margin-bottom:6px">
        <div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;margin-bottom:2px">Key Developments</div>
        ${n}
      </div>
    `:""}
    ${t.riskOutlook?`
      <div>
        <div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;margin-bottom:2px">Risk Outlook</div>
        <div style="font-size:11px;line-height:1.4">${o(t.riskOutlook)}</div>
      </div>
    `:""}
  `;return d("Weekly Brief",a)}const B=new O(q(),{fetch:U});class st extends j{constructor(){super({id:"regional-intelligence",title:"Regional Intelligence",infoTooltip:"Canonical regional intelligence brief: regime label, 7-axis balance vector, top actors, scenario lanes, transmission paths, and watchlist. One snapshot per region, refreshed every 6 hours.",premium:"locked"});g(this,"selector");g(this,"body");g(this,"currentRegion",P);g(this,"latestSequence",0);g(this,"lastHadPremium",!1);g(this,"authUnsubscribe",null);this.selector=S("select",{className:"rib-region-selector","aria-label":"Region"});for(const e of R){const n=document.createElement("option");n.value=e.id,n.textContent=e.label,e.id===P&&(n.selected=!0),this.selector.appendChild(n)}this.selector.addEventListener("change",()=>{this.currentRegion=this.selector.value,this.loadCurrent()});const i=S("div",{className:"rib-controls"},this.selector);this.body=S("div",{className:"rib-body"}),D(this.content,S("div",{className:"rib-shell"},i,this.body)),this.lastHadPremium=E(),k()?this.loadStaticFirst():(this.renderLoading(),this.loadCurrent()),this.authUnsubscribe=N(()=>{const e=E();e&&!this.lastHadPremium?(this.lastHadPremium=!0,this.loadCurrent()):!e&&this.lastHadPremium&&(this.lastHadPremium=!1,this.renderEmpty())})}async loadRegion(i){this.currentRegion=i,this.selector.value=i,await this.loadCurrent()}destroy(){var i;(i=this.authUnsubscribe)==null||i.call(this),this.authUnsubscribe=null,this.latestSequence+=1,super.destroy()}async loadStaticFirst(){const i=await H(this.currentRegion);i?f(this.body,x(i,"legacy direct innerHTML migration")):this.renderLoading(),this.loadCurrent()}async loadCurrent(){if(F){this.renderEmpty();return}if(!E()){this.renderEmpty();return}this.latestSequence+=1;const i=this.latestSequence,e=this.currentRegion;(!k()||!this.body.querySelector(".rib-static-fallback"))&&this.renderLoading();let n,a=e,s=null;try{const l=await B.getRegionalSnapshot({regionId:e});if(!I(i,this.latestSequence))return;n=l.snapshot}catch(l){if(!I(i,this.latestSequence))return;if(k()){const c=await H(e);if(c){f(this.body,x(c,"legacy direct innerHTML migration"));return}}this.renderError(l instanceof Error?l.message:String(l));return}if(!(n!=null&&n.regionId)){const l=R.map(m=>m.id).filter(m=>m!==e),c=4e3,v=await new Promise(m=>{if(l.length===0){m(null);return}let y=!1,$=l.length;const w=z=>{y||(y=!0,m(z))},T=setTimeout(()=>w(null),c);for(const z of l)B.getRegionalSnapshot({regionId:z}).then(L=>{var A;if((A=L.snapshot)!=null&&A.regionId){clearTimeout(T),w({snapshot:L.snapshot,id:z});return}--$===0&&(clearTimeout(T),w(null))}).catch(()=>{--$===0&&(clearTimeout(T),w(null))})});if(!I(i,this.latestSequence))return;v&&(n=v.snapshot,a=v.id,s=e)}if(!(n!=null&&n.regionId)){if(k()){const l=await H(e);if(l){f(this.body,x(l,"legacy direct innerHTML migration"));return}}this.renderEmpty();return}this.renderBoard(n,null,null,s);const p=B.getRegimeHistory({regionId:a,limit:20}).catch(()=>null),u=B.getRegionalBrief({regionId:a}).catch(()=>null);Promise.allSettled([p,u]).then(([l,c])=>{if(!I(i,this.latestSequence))return;const v=l.status==="fulfilled"?l.value:null,m=v&&!v.upstreamUnavailable?v.transitions??[]:null,y=c.status==="fulfilled"?c.value:null,$=y&&!y.upstreamUnavailable?y.brief:null;this.renderBoard(n,m,$,s)})}renderLoading(){f(this.body,x('<div class="rib-status" style="padding:16px;color:var(--text-dim);font-size:12px">Loading regional intelligence…</div>',"legacy direct innerHTML migration"))}renderEmpty(){f(this.body,x('<div class="rib-status" style="padding:16px;color:var(--text-dim);font-size:12px">Regional intelligence is being refreshed. Try selecting another region above.</div>',"legacy direct innerHTML migration"))}renderError(i){f(this.body,x(`<div class="rib-status rib-status-error" style="padding:16px;color:var(--danger);font-size:12px">We couldn't load this region right now: ${o(i)}</div>`,"legacy direct innerHTML migration"))}renderBoard(i,e,n,a){var p,u;let s="";if(a){const l=((p=R.find(v=>v.id===a))==null?void 0:p.label)??a,c=((u=R.find(v=>v.id===i.regionId))==null?void 0:u.label)??i.regionId;s+=`<div class="rib-fallback-notice" style="padding:10px 16px;margin:0 0 8px;background:var(--bg-elevated,rgba(255,255,255,0.04));border-left:3px solid var(--warning,#d4a015);font-size:12px;color:var(--text-dim);line-height:1.5">${o(l)} is being refreshed — showing ${o(c)} in the meantime.</div>`}s+=W(i),e!=null&&(s+=et(e)),n!==null&&(s+=it(n)),f(this.body,x(s,"legacy direct innerHTML migration"))}}export{st as RegionalIntelligenceBoard};
