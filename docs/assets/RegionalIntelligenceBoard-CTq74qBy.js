var H=Object.defineProperty;var L=(e,r,i)=>r in e?H(e,r,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[r]=i;var g=(e,r,i)=>L(e,typeof r!="symbol"?r+"":r,i);import{e as o,ih as C,p as z,r as M,a6 as E,aE as j,aX as D,aQ as N,s as w,t as S,aM as O,aZ as F}from"./panels-BaHTj8Ql.js";import"./d3-DE1H7FhT.js";import"./i18n-qlunRAMb.js";const k=[{id:"mena",label:"Middle East & North Africa"},{id:"east-asia",label:"East Asia & Pacific"},{id:"europe",label:"Europe & Central Asia"},{id:"north-america",label:"North America"},{id:"south-asia",label:"South Asia"},{id:"latam",label:"Latin America & Caribbean"},{id:"sub-saharan-africa",label:"Sub-Saharan Africa"}],P="mena";function R(e,r){return e===r}function q(e){var r,i;return[U(e.narrative),W(e),_(e.balance),V(e.actors),Z(e.scenarioSets),K(e.transmissionPaths),Q(((r=e.triggers)==null?void 0:r.active)??[],((i=e.narrative)==null?void 0:i.watchItems)??[]),X(e)].join("")}function d(e,r,i=""){return`
    <div class="rib-section" style="margin-bottom:12px;padding:10px 12px;border:1px solid var(--border);border-radius:4px;background:rgba(255,255,255,0.02);${i}">
      <div class="rib-section-title" style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-dim);margin-bottom:8px">${o(e)}</div>
      ${r}
    </div>
  `}function h(e,r){const i=((r==null?void 0:r.text)??"").trim();if(!i)return"";const t=((r==null?void 0:r.evidenceIds)??[]).filter(a=>a.length>0),n=t.length>0?`<span style="font-size:10px;color:var(--text-dim);margin-left:6px">[${o(t.slice(0,4).join(", "))}]</span>`:"";return`
    <div class="rib-narrative-row" style="margin-bottom:8px">
      <div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-dim);margin-bottom:2px">${o(e)}${n}</div>
      <div style="font-size:12px;line-height:1.5">${o(i)}</div>
    </div>
  `}function U(e){if(!e)return"";const r=[h("Situation",e.situation),h("Balance Assessment",e.balanceAssessment),h("Outlook — 24h",e.outlook24h),h("Outlook — 7d",e.outlook7d),h("Outlook — 30d",e.outlook30d)].join("");return r?d("Narrative",r):""}function W(e){const r=e.regime,i=(r==null?void 0:r.label)??"unknown",t=(r==null?void 0:r.previousLabel)??"",n=(r==null?void 0:r.transitionDriver)??"",s=t&&t!==i?`<div style="font-size:11px;color:var(--text-dim);margin-top:2px">Was: ${o(t)}${n?` · ${o(n)}`:""}</div>`:"",c=`
    <div class="rib-regime-label" style="font-size:15px;font-weight:600;text-transform:capitalize">${o(i.replace(/_/g," "))}</div>
    ${s}
  `;return d("Regime",c)}function x(e,r,i){const t=Math.max(0,Math.min(1,r))*100;return`
    <div style="display:grid;grid-template-columns:110px 40px 1fr;gap:8px;align-items:center;margin-bottom:4px">
      <div style="font-size:11px;color:var(--text-dim)">${o(e)}</div>
      <div style="font-size:11px;font-variant-numeric:tabular-nums">${r.toFixed(2)}</div>
      <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden">
        <div style="height:100%;width:${t.toFixed(1)}%;background:var(${i})"></div>
      </div>
    </div>
  `}function _(e){if(!e)return d("Balance Vector",'<div style="font-size:11px;color:var(--text-dim)">Unavailable</div>');const r=[x("Coercive",e.coercivePressure,"--danger"),x("Fragility",e.domesticFragility,"--danger"),x("Capital",e.capitalStress,"--danger"),x("Energy Vuln",e.energyVulnerability,"--danger")].join(""),i=[x("Alliance",e.allianceCohesion,"--accent"),x("Maritime",e.maritimeAccess,"--accent"),x("Energy Lev",e.energyLeverage,"--accent")].join(""),t=e.netBalance,n=Math.max(-1,Math.min(1,t)),a=Math.abs(n)*50,s=n>=0?"right":"left",c=n>=0?"var(--accent)":"var(--danger)",u=`
    <div style="display:grid;grid-template-columns:110px 40px 1fr;gap:8px;align-items:center;margin-top:6px;padding-top:6px;border-top:1px dashed rgba(255,255,255,0.1)">
      <div style="font-size:11px;color:var(--text-dim);font-weight:600">Net Balance</div>
      <div style="font-size:11px;font-variant-numeric:tabular-nums;font-weight:600">${t.toFixed(2)}</div>
      <div style="position:relative;height:6px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden">
        <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.3)"></div>
        <div style="position:absolute;${s}:50%;top:0;bottom:0;width:${a.toFixed(1)}%;background:${c}"></div>
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
  `;return d("Balance Vector",l)}function V(e){if(!e||e.length===0)return d("Actors",'<div style="font-size:11px;color:var(--text-dim)">No actor data</div>');const i=[...e].sort((t,n)=>(n.leverageScore??0)-(t.leverageScore??0)).slice(0,5).map(t=>{const n=t.delta>0?`+${t.delta.toFixed(2)}`:t.delta.toFixed(2),a=t.delta>0?"var(--danger)":t.delta<0?"var(--accent)":"var(--text-dim)",s=(t.leverageDomains??[]).slice(0,3).join(", ");return`
      <div style="display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;padding:4px 0;border-bottom:1px dashed rgba(255,255,255,0.06)">
        <div>
          <div style="font-size:12px;font-weight:500">${o(t.name||t.actorId)}</div>
          <div style="font-size:10px;color:var(--text-dim);text-transform:capitalize">${o(t.role||"actor")}${s?` · ${o(s)}`:""}</div>
        </div>
        <div style="font-size:11px;font-variant-numeric:tabular-nums">${(t.leverageScore??0).toFixed(2)}</div>
        <div style="font-size:10px;color:${a};font-variant-numeric:tabular-nums;min-width:38px;text-align:right">${o(n)}</div>
      </div>
    `}).join("");return d("Actors",i)}function Z(e){if(!e||e.length===0)return d("Scenarios",'<div style="font-size:11px;color:var(--text-dim)">No scenario data</div>');const r={"24h":0,"7d":1,"30d":2},i=[...e].sort((s,c)=>(r[s.horizon]??99)-(r[c.horizon]??99)),t={base:"var(--text-dim)",escalation:"var(--danger)",containment:"var(--accent)",fragmentation:"var(--warning, #e0a020)"},n=i.map(s=>{const u=[...s.lanes??[]].sort((l,v)=>v.probability-l.probability).map(l=>{const v=Math.round((l.probability??0)*100),p=t[l.name]??"var(--text-dim)";return`
        <div style="margin-bottom:3px">
          <div style="display:flex;justify-content:space-between;font-size:11px;text-transform:capitalize">
            <span>${o(l.name)}</span>
            <span style="font-variant-numeric:tabular-nums">${v}%</span>
          </div>
          <div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${v}%;background:${p}"></div>
          </div>
        </div>
      `}).join("");return`
      <div>
        <div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;margin-bottom:6px">${o(s.horizon)}</div>
        ${u}
      </div>
    `}).join(""),a=`<div style="display:grid;grid-template-columns:repeat(${i.length},1fr);gap:12px">${n}</div>`;return d("Scenarios",a)}function G(e){switch((e??"").toLowerCase()){case"critical":return"var(--danger)";case"high":return"var(--danger)";case"medium":return"var(--warning, #e0a020)";case"low":return"var(--text-dim)";default:return"var(--text-dim)"}}function K(e){if(!e||e.length===0)return d("Transmission Paths",'<div style="font-size:11px;color:var(--text-dim)">No active transmissions</div>');const i=[...e].sort((t,n)=>(n.confidence??0)-(t.confidence??0)).slice(0,5).map(t=>{const n=G(t.severity),a=t.corridorId?` via ${o(t.corridorId)}`:"",s=Math.round((t.confidence??0)*100),c=t.latencyHours>0?` · ${t.latencyHours}h`:"";return`
      <div style="padding:4px 0;border-bottom:1px dashed rgba(255,255,255,0.06);display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center">
        <div>
          <div style="font-size:11px;font-weight:500">${o(t.mechanism||"mechanism")}${a}</div>
          <div style="font-size:10px;color:var(--text-dim)">${o(t.start||"")} → ${o(t.end||"")}${c}</div>
        </div>
        <div style="font-size:10px;font-variant-numeric:tabular-nums;color:${n};text-transform:uppercase">${o(t.severity||"unspec")} · ${s}%</div>
      </div>
    `}).join("");return d("Transmission Paths",i)}function Q(e,r){const i=(e??[]).map(a=>`
    <div style="padding:3px 0;font-size:11px">
      <span style="color:var(--danger);font-weight:600">●</span>
      ${o(a.id)}${a.description?` — <span style="color:var(--text-dim)">${o(a.description)}</span>`:""}
    </div>
  `).join(""),t=(r??[]).filter(a=>(a.text??"").trim().length>0).map(a=>`
    <div style="padding:3px 0;font-size:11px">
      <span style="color:var(--text-dim)">▸</span>
      ${o(a.text)}
    </div>
  `).join("");if(!i&&!t)return d("Watchlist",'<div style="font-size:11px;color:var(--text-dim)">No active triggers or watch items</div>');const n=[];return i&&n.push(`<div style="margin-bottom:6px"><div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;margin-bottom:2px">Active Triggers</div>${i}</div>`),t&&n.push(`<div><div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;margin-bottom:2px">Watch Items</div>${t}</div>`),d("Watchlist",n.join(""))}function X(e){const r=e.meta;if(!r)return"";const i=Math.round((r.snapshotConfidence??0)*100),t=e.generatedAt?`${new Date(e.generatedAt).toISOString().replace("T"," ").slice(0,16)}Z`:"—",n=r.narrativeProvider?`${o(r.narrativeProvider)}/${o(r.narrativeModel||"unknown")}`:"no narrative";return`
    <div style="display:flex;flex-wrap:wrap;gap:12px;padding:6px 2px 0;font-size:10px;color:var(--text-dim)">
      <span>generated ${o(t)}</span>
      <span>confidence ${i}%</span>
      <span>scoring v${o(r.scoringVersion||"")}</span>
      <span>geo v${o(r.geographyVersion||"")}</span>
      <span>narrative: ${n}</span>
    </div>
  `}function J(e){return e?new Date(e).toISOString().replace("T"," ").slice(0,16)+"Z":"—"}function Y(e){if(!e||e.length===0)return d("Regime History",'<div style="font-size:11px;color:var(--text-dim)">No regime transitions recorded yet</div>');const r=e.slice(0,20).map(i=>{const t=i.previousLabel?o(i.previousLabel.replace(/_/g," ")):"none",n=o((i.label??"").replace(/_/g," ")),a=i.transitionDriver?` · ${o(i.transitionDriver)}`:"",s=J(i.transitionedAt);return`
      <div style="display:grid;grid-template-columns:130px 1fr;gap:8px;padding:3px 0;border-bottom:1px dashed rgba(255,255,255,0.06)">
        <div style="font-size:10px;color:var(--text-dim);font-variant-numeric:tabular-nums">${o(s)}</div>
        <div style="font-size:11px"><span style="color:var(--text-dim)">${t}</span> → <span style="font-weight:500;text-transform:capitalize">${n}</span>${a}</div>
      </div>
    `}).join("");return d("Regime History",r)}function ee(e){if(!e||!e.situationRecap)return d("Weekly Brief",'<div style="font-size:11px;color:var(--text-dim)">No weekly brief available yet</div>');const r=e.periodStart?new Date(e.periodStart).toISOString().split("T")[0]??"?":"?",i=e.periodEnd?new Date(e.periodEnd).toISOString().split("T")[0]??"?":"?",t=e.provider?`${o(e.provider)}/${o(e.model||"?")}`:"",n=(e.keyDevelopments??[]).filter(s=>s.length>0).slice(0,5).map(s=>`<div style="padding:2px 0;font-size:11px"><span style="color:var(--text-dim)">▸</span> ${o(s)}</div>`).join(""),a=`
    <div style="font-size:10px;color:var(--text-dim);margin-bottom:6px">${o(r)} — ${o(i)}${t?` · ${t}`:""}</div>
    ${e.situationRecap?`<div style="font-size:12px;line-height:1.5;margin-bottom:8px">${o(e.situationRecap)}</div>`:""}
    ${e.regimeTrajectory?`
      <div style="margin-bottom:6px">
        <div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;margin-bottom:2px">Regime Trajectory</div>
        <div style="font-size:11px;line-height:1.4">${o(e.regimeTrajectory)}</div>
      </div>
    `:""}
    ${n?`
      <div style="margin-bottom:6px">
        <div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;margin-bottom:2px">Key Developments</div>
        ${n}
      </div>
    `:""}
    ${e.riskOutlook?`
      <div>
        <div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;margin-bottom:2px">Risk Outlook</div>
        <div style="font-size:11px;line-height:1.4">${o(e.riskOutlook)}</div>
      </div>
    `:""}
  `;return d("Weekly Brief",a)}const B=new N(O(),{fetch:F});class oe extends C{constructor(){super({id:"regional-intelligence",title:"Regional Intelligence",infoTooltip:"Canonical regional intelligence brief: regime label, 7-axis balance vector, top actors, scenario lanes, transmission paths, and watchlist. One snapshot per region, refreshed every 6 hours.",premium:"locked"});g(this,"selector");g(this,"body");g(this,"currentRegion",P);g(this,"latestSequence",0);g(this,"lastHadPremium",!1);g(this,"authUnsubscribe",null);this.selector=z("select",{className:"rib-region-selector","aria-label":"Region"});for(const t of k){const n=document.createElement("option");n.value=t.id,n.textContent=t.label,t.id===P&&(n.selected=!0),this.selector.appendChild(n)}this.selector.addEventListener("change",()=>{this.currentRegion=this.selector.value,this.loadCurrent()});const i=z("div",{className:"rib-controls"},this.selector);this.body=z("div",{className:"rib-body"}),M(this.content,z("div",{className:"rib-shell"},i,this.body)),this.renderLoading(),this.lastHadPremium=E(),this.loadCurrent(),this.authUnsubscribe=j(()=>{const t=E();t&&!this.lastHadPremium?(this.lastHadPremium=!0,this.loadCurrent()):!t&&this.lastHadPremium&&(this.lastHadPremium=!1,this.renderEmpty())})}async loadRegion(i){this.currentRegion=i,this.selector.value=i,await this.loadCurrent()}destroy(){var i;(i=this.authUnsubscribe)==null||i.call(this),this.authUnsubscribe=null,this.latestSequence+=1,super.destroy()}async loadCurrent(){if(D){this.renderEmpty();return}if(!E()){this.renderEmpty();return}this.latestSequence+=1;const i=this.latestSequence,t=this.currentRegion;this.renderLoading();let n,a=t,s=null;try{const l=await B.getRegionalSnapshot({regionId:t});if(!R(i,this.latestSequence))return;n=l.snapshot}catch(l){if(!R(i,this.latestSequence))return;this.renderError(l instanceof Error?l.message:String(l));return}if(!(n!=null&&n.regionId)){const l=k.map(m=>m.id).filter(m=>m!==t),v=4e3,p=await new Promise(m=>{if(l.length===0){m(null);return}let f=!1,y=l.length;const b=$=>{f||(f=!0,m($))},I=setTimeout(()=>b(null),v);for(const $ of l)B.getRegionalSnapshot({regionId:$}).then(T=>{var A;if((A=T.snapshot)!=null&&A.regionId){clearTimeout(I),b({snapshot:T.snapshot,id:$});return}--y===0&&(clearTimeout(I),b(null))}).catch(()=>{--y===0&&(clearTimeout(I),b(null))})});if(!R(i,this.latestSequence))return;p&&(n=p.snapshot,a=p.id,s=t)}if(!(n!=null&&n.regionId)){this.renderEmpty();return}this.renderBoard(n,null,null,s);const c=B.getRegimeHistory({regionId:a,limit:20}).catch(()=>null),u=B.getRegionalBrief({regionId:a}).catch(()=>null);Promise.allSettled([c,u]).then(([l,v])=>{if(!R(i,this.latestSequence))return;const p=l.status==="fulfilled"?l.value:null,m=p&&!p.upstreamUnavailable?p.transitions??[]:null,f=v.status==="fulfilled"?v.value:null,y=f&&!f.upstreamUnavailable?f.brief:null;this.renderBoard(n,m,y,s)})}renderLoading(){w(this.body,S('<div class="rib-status" style="padding:16px;color:var(--text-dim);font-size:12px">Loading regional intelligence…</div>',"legacy direct innerHTML migration"))}renderEmpty(){w(this.body,S('<div class="rib-status" style="padding:16px;color:var(--text-dim);font-size:12px">Regional intelligence is being refreshed. Try selecting another region above.</div>',"legacy direct innerHTML migration"))}renderError(i){w(this.body,S(`<div class="rib-status rib-status-error" style="padding:16px;color:var(--danger);font-size:12px">We couldn't load this region right now: ${o(i)}</div>`,"legacy direct innerHTML migration"))}renderBoard(i,t,n,a){var c,u;let s="";if(a){const l=((c=k.find(p=>p.id===a))==null?void 0:c.label)??a,v=((u=k.find(p=>p.id===i.regionId))==null?void 0:u.label)??i.regionId;s+=`<div class="rib-fallback-notice" style="padding:10px 16px;margin:0 0 8px;background:var(--bg-elevated,rgba(255,255,255,0.04));border-left:3px solid var(--warning,#d4a015);font-size:12px;color:var(--text-dim);line-height:1.5">${o(l)} is being refreshed — showing ${o(v)} in the meantime.</div>`}s+=q(i),t!=null&&(s+=Y(t)),n!==null&&(s+=ee(n)),w(this.body,S(s,"legacy direct innerHTML migration"))}}export{oe as RegionalIntelligenceBoard};
