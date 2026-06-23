import{a as o,bU as L,bZ as h,S as E,aa as r,ad as C,p as g,ab as u,dL as T,s as w,t as S,e as p,a9 as b,ac as P,ae as k,af as $,ag as _,bF as D}from"./panels-BOn_VDzF.js";import{a as F}from"./user-location-DbTNEtT-.js";import"./d3-DE1H7FhT.js";import"./i18n-qlunRAMb.js";function N(i,e){if(i==="runtime-config")return o("modals.runtimeConfig.title");const l=`panels.${i.replace(/-([a-z])/g,(m,c)=>c.toUpperCase())}`,d=o(l);return d===l?e:d}function R(){var c;const i=document.getElementById("app");if(!i)return;document.title=`${o("header.settings")} - ${F()}`;const e=L(E.panels,h),v=new Set(Object.keys(r));for(const s of Object.keys(e))!v.has(s)&&s!=="runtime-config"&&delete e[s];const l=new Set(C[g]??[]);for(const s of Object.keys(r))s in e||(e[s]={...u(s,g),enabled:l.has(s)});const d=T();function m(){const A=Object.entries(e).filter(([t])=>(t!=="runtime-config"||d)&&(!t.startsWith("cw-")||b())).map(([t,n])=>{const a=r[t]?u(t,g):n;return`
        <div class="panel-toggle-item ${n.enabled?"active":""}" data-panel="${p(t)}">
          <div class="panel-toggle-checkbox">${n.enabled?"✓":""}</div>
          <span class="panel-toggle-label">${p(N(t,a.name??n.name))}</span>
        </div>
      `}).join(""),f=document.getElementById("panelToggles");f&&(w(f,S(A,"legacy direct innerHTML migration")),f.querySelectorAll(".panel-toggle-item").forEach(t=>{t.addEventListener("click",()=>{const n=t.dataset.panel,a=e[n];if(a){const y=r[n]?u(n,g):a;if(!a.enabled&&!P(n,y,b())||!a.enabled&&!b()&&k(n)&&$(e)>=_)return;a.enabled=!a.enabled,D(E.panels,e),m()}})}))}w(i,S(`
    <div class="settings-window-shell">
      <div class="settings-window-header">
        <div class="settings-window-header-text">
          <span class="settings-window-title">${p(o("header.settings"))}</span>
          <p class="settings-window-caption">${p(o("header.panelDisplayCaption"))}</p>
        </div>
        <button type="button" class="modal-close" id="settingsWindowClose">×</button>
      </div>
      <div class="panel-toggle-grid" id="panelToggles"></div>
    </div>
  `,"legacy direct innerHTML migration")),(c=document.getElementById("settingsWindowClose"))==null||c.addEventListener("click",()=>{window.close()}),m()}export{R as initSettingsWindow};
