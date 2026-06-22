import{a as o,bP as y,bU as C,S as E,a8 as r,ab as L,o as g,a9 as f,dF as P,s as w,t as A,e as p,a7 as b,aa as T,ac as k,ad as _,ae as $,bA as F}from"./panels-C7vyjkdk.js";import"./d3-DE1H7FhT.js";import"./i18n-qlunRAMb.js";function D(i,e){if(i==="runtime-config")return o("modals.runtimeConfig.title");const l=`panels.${i.replace(/-([a-z])/g,(m,c)=>c.toUpperCase())}`,d=o(l);return d===l?e:d}function j(){var c;const i=document.getElementById("app");if(!i)return;document.title=`${o("header.settings")} - World Monitor`;const e=y(E.panels,C),v=new Set(Object.keys(r));for(const s of Object.keys(e))!v.has(s)&&s!=="runtime-config"&&delete e[s];const l=new Set(L[g]??[]);for(const s of Object.keys(r))s in e||(e[s]={...f(s,g),enabled:l.has(s)});const d=P();function m(){const S=Object.entries(e).filter(([t])=>(t!=="runtime-config"||d)&&(!t.startsWith("cw-")||b())).map(([t,n])=>{const a=r[t]?f(t,g):n;return`
        <div class="panel-toggle-item ${n.enabled?"active":""}" data-panel="${p(t)}">
          <div class="panel-toggle-checkbox">${n.enabled?"✓":""}</div>
          <span class="panel-toggle-label">${p(D(t,a.name??n.name))}</span>
        </div>
      `}).join(""),u=document.getElementById("panelToggles");u&&(w(u,A(S,"legacy direct innerHTML migration")),u.querySelectorAll(".panel-toggle-item").forEach(t=>{t.addEventListener("click",()=>{const n=t.dataset.panel,a=e[n];if(a){const h=r[n]?f(n,g):a;if(!a.enabled&&!T(n,h,b())||!a.enabled&&!b()&&k(n)&&_(e)>=$)return;a.enabled=!a.enabled,F(E.panels,e),m()}})}))}w(i,A(`
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
  `,"legacy direct innerHTML migration")),(c=document.getElementById("settingsWindowClose"))==null||c.addEventListener("click",()=>{window.close()}),m()}export{j as initSettingsWindow};
