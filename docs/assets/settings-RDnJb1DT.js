var se=Object.defineProperty;var ae=(s,e,t)=>e in s?se(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var I=(s,e,t)=>ae(s,typeof e!="symbol"?e+"":e,t);import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css             */import{a as ne,e as ie,i as oe}from"./settings-persistence-oeVD-_gz.js";import{h6 as $,h7 as z,h8 as R,h9 as P,ha as k,dH as F,hb as x,hc as A,hd as le,he as Y,gB as de,h1 as ce,a as r,hf as re,h0 as ge,hg as H,hh as Q,s as L,t as S,e as u,fj as B,hi as N,hj as ve,hk as ue,hl as he,dG as pe,au as X,hm as fe,bE as me,hn as we}from"./panels-DgLmQ4s4.js";import"./d3-DE1H7FhT.js";import"./i18n-qlunRAMb.js";class ye{constructor(){I(this,"pendingSecrets",new Map);I(this,"validatedKeys",new Map);I(this,"validationMessages",new Map)}captureUnsavedInputs(e){e.querySelectorAll("input[data-secret]").forEach(n=>{var o;const l=n.dataset.secret;if(!l)return;const d=n.value.trim();if(!d||d===$)return;if(z.has(l)&&!this.pendingSecrets.has(l)){const g=((o=R().secrets[l])==null?void 0:o.value)||"";if(d===g)return}this.pendingSecrets.set(l,d);const c=P(l,d);c.valid||(this.validatedKeys.set(l,!1),this.validationMessages.set(l,c.hint||"Invalid format"))});const t=e.querySelector("select[data-model-select]"),i=e.querySelector("input[data-model-manual]"),a=(i&&!i.classList.contains("hidden-input")?i.value.trim():t==null?void 0:t.value)||"";a&&!this.pendingSecrets.has("OLLAMA_MODEL")&&(this.pendingSecrets.set("OLLAMA_MODEL",a),this.validatedKeys.set("OLLAMA_MODEL",!0))}hasPendingChanges(){return this.pendingSecrets.size>0}getMissingRequiredSecrets(){const e=[];for(const t of k){if(!F(t.id))continue;const i=x(t);if(i.some(n=>this.pendingSecrets.has(n)))for(const n of i)!A(n).valid&&!this.pendingSecrets.has(n)&&e.push(n)}return e}getValidationErrors(){const e=[];for(const[t,i]of this.pendingSecrets){const a=P(t,i);a.valid||e.push(`${t}: ${a.hint||"Invalid format"}`)}return e}async verifyPendingSecrets(){const e=[],t=Object.fromEntries(this.pendingSecrets.entries()),i=[];for(const[a,n]of this.pendingSecrets){const l=P(a,n);l.valid?i.push([a,n]):(this.validatedKeys.set(a,!1),this.validationMessages.set(a,l.hint||"Invalid format"),e.push(`${a}: ${l.hint||"Invalid format"}`))}if(i.length>0){const a=await Promise.race([Promise.all(i.map(async([n,l])=>{const d=await le(n,l,t);return{key:n,result:d}})),new Promise(n=>setTimeout(()=>n(i.map(([l])=>({key:l,result:{valid:!0,message:"Saved (verification timed out)"}}))),15e3))]);for(const{key:n,result:l}of a)this.validatedKeys.set(n,l.valid),l.valid?this.validationMessages.delete(n):(this.validationMessages.set(n,l.message||"Verification failed"),e.push(`${n}: ${l.message||"Verification failed"}`))}return e}async commitVerifiedSecrets(){for(const[e,t]of this.pendingSecrets)this.validatedKeys.get(e)!==!1&&(await Y(e,t),this.pendingSecrets.delete(e),this.validatedKeys.delete(e),this.validationMessages.delete(e))}setPending(e,t){this.pendingSecrets.set(e,t)}getPending(e){return this.pendingSecrets.get(e)}hasPending(e){return this.pendingSecrets.has(e)}deletePending(e){this.pendingSecrets.delete(e),this.validatedKeys.delete(e),this.validationMessages.delete(e)}setValidation(e,t,i){this.validatedKeys.set(e,t),i?this.validationMessages.set(e,i):this.validationMessages.delete(e)}getValidationState(e){return{validated:this.validatedKeys.get(e),message:this.validationMessages.get(e)}}destroy(){this.pendingSecrets.clear(),this.validatedKeys.clear(),this.validationMessages.clear()}}let E="overview",v,W=null;function w(s,e="ok"){const t=document.getElementById("settingsActionStatus");t&&(t.textContent=s,t.classList.remove("ok","error"),t.classList.add(e))}async function j(s,e){const t=await N(s);if(t){w(`${e}: ${t}`,"ok");return}w(r("modals.settingsWindow.invokeFail",{command:s}),"error")}function D(){N("close_settings_window").then(()=>{},()=>window.close())}function be(){return we()||""}let T=null;async function _(s,e){if(!T)try{T=await N("get_local_api_token")}catch{}const t=new Headers(e==null?void 0:e.headers);return T&&t.set("Authorization",`Bearer ${T}`),fetch(`${be()}${s}`,{...e,headers:t})}const V={overview:'<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 00-1.38-3.56A8.03 8.03 0 0118.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 015.08 16zm2.95-8H5.08a7.987 7.987 0 014.33-3.56A15.65 15.65 0 008.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 01-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>',ai:'<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1s-2.73 7.08 0 9.79 7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.49 12.65 0L21 3v7.12zM12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8h1.5z"/></svg>',economy:'<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>',markets:'<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"/></svg>',security:'<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>',tracking:'<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',debug:'<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z"/></svg>'};function Z(s){let e=0;for(const t of s.features)B(t)&&e++;return{ready:e,total:s.features.length}}function J(){let s=0;for(const e of k)B(e.id)&&s++;return{ready:s,total:k.length}}function C(){const s=document.getElementById("sidebarNav");if(!s)return;const e=[],t=J(),i=t.ready===t.total?"dot-ok":t.ready>0?"dot-partial":"dot-warn";e.push(`
    <button class="settings-nav-item${E==="overview"?" active":""}" data-section="overview" role="tab" aria-selected="${E==="overview"}">
      ${V.overview}
      <span class="settings-nav-label">Overview</span>
      <span class="settings-nav-dot ${i}"></span>
    </button>
  `),e.push('<div class="settings-nav-sep"></div>');for(const a of H){const{ready:n,total:l}=Z(a),d=n===l?"dot-ok":n>0?"dot-partial":"dot-warn";e.push(`
      <button class="settings-nav-item${E===a.id?" active":""}" data-section="${a.id}" role="tab" aria-selected="${E===a.id}">
        ${V[a.id]||""}
        <span class="settings-nav-label">${u(a.label)}</span>
        <span class="settings-nav-count">${n}/${l}</span>
        <span class="settings-nav-dot ${d}"></span>
      </button>
    `)}e.push('<div class="settings-nav-sep"></div>'),e.push(`
    <button class="settings-nav-item${E==="debug"?" active":""}" data-section="debug" role="tab" aria-selected="${E==="debug"}">
      ${V.debug}
      <span class="settings-nav-label">Debug &amp; Logs</span>
    </button>
  `),L(s,S(e.join(""),"legacy direct innerHTML migration"))}function O(s){const e=document.getElementById("contentArea");e&&(W&&(W(),W=null),E=s,C(),e.classList.add("fade-out"),e.classList.remove("fade-in"),requestAnimationFrame(()=>{if(s==="overview")Le(e);else if(s==="debug")Ee(e);else{const t=H.find(i=>i.id===s);t&&$e(e,t)}requestAnimationFrame(()=>{e.classList.remove("fade-out"),e.classList.add("fade-in")})}))}function Le(s){const{ready:e,total:t}=J(),i=t>0?e/t*100:0,a=2*Math.PI*40,n=a-i/100*a,l=e===t?"var(--settings-green)":e>0?"var(--settings-blue)":"var(--settings-yellow)",d=A("WORLDMONITOR_API_KEY"),c=d.present?"Active":"Not set",o=d.present?"ok":"warn",g=H.map(p=>{const{ready:f,total:h}=Z(p);return`<button class="settings-ov-cat ${f===h?"ov-cat-ok":f>0?"ov-cat-partial":"ov-cat-warn"}" data-section="${p.id}">
      <span class="settings-ov-cat-label">${u(p.label)}</span>
      <span class="settings-ov-cat-count">${f}/${h} ready</span>
    </button>`}).join("");L(s,S(`
    <div class="settings-overview">
      <div class="settings-ov-progress">
        <svg class="settings-ov-ring" viewBox="0 0 100 100" width="120" height="120">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8"/>
          <circle cx="50" cy="50" r="40" fill="none" stroke="${l}" stroke-width="8"
            stroke-linecap="round" stroke-dasharray="${a}" stroke-dashoffset="${n}"
            transform="rotate(-90 50 50)" style="transition:stroke-dashoffset 0.6s ease"/>
        </svg>
        <div class="settings-ov-ring-text">
          <span class="settings-ov-ring-num">${e}</span>
          <span class="settings-ov-ring-label">of ${t} ready</span>
        </div>
      </div>
      <div class="settings-ov-cats">${g}</div>
    </div>

    <div class="settings-ov-license">
      <section class="wm-section">
        <h2 class="wm-section-title">${r("modals.settingsWindow.worldMonitor.apiKey.title")}</h2>
        <p class="wm-section-desc">${r("modals.settingsWindow.worldMonitor.apiKey.description")}</p>
        <div class="wm-key-row">
          <div class="wm-input-wrap">
            <input type="password" class="wm-input" data-wm-key-input
              placeholder="${r("modals.settingsWindow.worldMonitor.apiKey.placeholder")}"
              autocomplete="off" spellcheck="false"
              ${d.present?`value="${$}"`:""} />
            <button type="button" class="wm-toggle-vis" data-wm-toggle title="Show/hide">&#x1f441;</button>
          </div>
          <span class="wm-badge ${o}">${c}</span>
        </div>
      </section>

      <div class="wm-divider"><span>${r("modals.settingsWindow.worldMonitor.dividerOr")}</span></div>

      <section class="wm-section">
        <h2 class="wm-section-title">${r("modals.settingsWindow.worldMonitor.register.title")}</h2>
        <p class="wm-section-desc">${r("modals.settingsWindow.worldMonitor.register.description")}</p>
        <div class="wm-register-row">
          <button type="button" class="wm-submit-btn" data-wm-open-pro>
            ${r("modals.settingsWindow.worldMonitor.register.submitBtn")}
          </button>
        </div>
      </section>
    </div>
  `,"legacy direct innerHTML migration")),Se(s)}function Se(s){var e,t,i;(e=s.querySelector("[data-wm-toggle]"))==null||e.addEventListener("click",()=>{const a=s.querySelector("[data-wm-key-input]");a&&(a.type=a.type==="password"?"text":"password")}),(t=s.querySelector("[data-wm-key-input]"))==null||t.addEventListener("input",a=>{const n=a.target;n.value.startsWith($)&&(n.value=n.value.slice($.length))}),(i=s.querySelector("[data-wm-open-pro]"))==null||i.addEventListener("click",()=>{const a="https://worldmonitor.app/pro";X("open_url",{url:a}).catch(()=>window.open(a,"_blank"))}),s.querySelectorAll(".settings-ov-cat[data-section]").forEach(a=>{a.addEventListener("click",()=>{const n=a.dataset.section;n&&O(n)})})}function $e(s,e){const i=e.features.map(a=>k.find(n=>n.id===a)).filter(Boolean).map(a=>{const n=F(a.id),l=B(a.id),d=x(a),c=!l&&d.every(m=>A(m).valid||v.hasPending(m)&&v.getValidationState(m).validated!==!1),o=l?"ready":c?"staged":"needs",g=l?"ok":c?"staged":"warn",p=l?"Ready":c?"Staged":"Needs keys",f=d.map(m=>ee(m,a.id)).join(""),h=l||c?"":`<p class="settings-feat-fallback">${u(a.fallback)}</p>`;return`
      <div class="settings-feat ${o}" data-feature-id="${a.id}">
        <div class="settings-feat-header" data-feat-toggle-expand="${a.id}">
          <label class="settings-feat-toggle-label" data-click-stop>
            <div class="settings-feat-switch">
              <input type="checkbox" data-toggle="${a.id}" ${n?"checked":""} />
              <span class="settings-feat-slider"></span>
            </div>
          </label>
          <div class="settings-feat-info">
            <span class="settings-feat-name">${u(a.name)}</span>
            <span class="settings-feat-desc">${u(a.description)}</span>
          </div>
          <span class="settings-feat-pill ${g}">${p}</span>
          <span class="settings-feat-chevron">&#x25B8;</span>
        </div>
        <div class="settings-feat-body">
          ${f}
          ${h}
        </div>
      </div>
    `}).join("");L(s,S(`
    <div class="settings-section-header">
      <h2>${u(e.label)}</h2>
    </div>
    <div class="settings-feat-list">${i}</div>
  `,"legacy direct innerHTML migration")),te(s)}function ee(s,e){var y,b;const t=A(s),i=v.hasPending(s),{validated:a,message:n}=v.getValidationState(s),l=Q[s]||s,d=ve[s],c=z.has(s),o=d&&!t.present&&!i,g=i?a===!1?"Invalid":"Staged":t.present?t.valid?"Valid":"Looks invalid":"Missing",p=i?a===!1?"warn":"staged":t.valid?"ok":"warn",f=i?a===!1?"invalid":"valid-staged":"",h=i&&a===!1?n||"Invalid value":null;if(s==="OLLAMA_MODEL"){const M=i?v.getPending(s)||"":((y=R().secrets[s])==null?void 0:y.value)||"";return`
      <div class="settings-secret-row">
        <div class="settings-secret-label">${u(l)}</div>
        <span class="settings-secret-status ${p}">${u(g)}</span>
        <select data-model-select data-feature="${e}" class="${f}">
          ${M?`<option value="${u(M)}" selected>${u(M)}</option>`:'<option value="" selected disabled>Loading models...</option>'}
        </select>
        <input type="text" data-model-manual data-feature="${e}" class="${f} hidden-input"
          placeholder="Or type model name" autocomplete="off"
          ${M?`value="${u(M)}"`:""}>
        ${h?`<span class="settings-secret-hint">${u(h)}</span>`:""}
      </div>
    `}const m=o?`<a href="#" data-signup-url="${d}" class="settings-secret-link">Get key</a>`:"";return`
    <div class="settings-secret-row">
      <div class="settings-secret-label">${u(l)}</div>
      <span class="settings-secret-status ${p}">${u(g)}</span>
      <div class="settings-input-wrapper${o?" has-suffix":""}">
        <input type="${c?"text":"password"}" data-secret="${s}" data-feature="${e}"
          placeholder="${i?"Staged":"Enter value..."}" autocomplete="off" class="${f}"
          ${i?`value="${c?u(v.getPending(s)||""):$}"`:c&&t.present?`value="${u(((b=R().secrets[s])==null?void 0:b.value)||"")}"`:""}>
        ${m}
      </div>
      ${h?`<span class="settings-secret-hint">${u(h)}</span>`:""}
    </div>
  `}function te(s){s.querySelectorAll("[data-feat-toggle-expand]").forEach(t=>{t.addEventListener("click",i=>{if(i.target.closest("[data-click-stop]"))return;const a=t.closest(".settings-feat");a==null||a.classList.toggle("expanded")})}),s.querySelectorAll("input[data-toggle]").forEach(t=>{t.addEventListener("change",()=>{const i=t.dataset.toggle;i&&(ue(i,t.checked),he(i,t.checked),C())})}),s.querySelectorAll("input[data-secret]").forEach(t=>{t.addEventListener("input",()=>{var n;const i=t.dataset.secret;if(!i)return;v.hasPending(i)&&t.value.startsWith($)&&(t.value=t.value.slice($.length)),v.setValidation(i,!0),t.classList.remove("valid-staged","invalid");const a=(n=t.closest(".settings-secret-row"))==null?void 0:n.querySelector(".settings-secret-hint");a&&a.remove()}),t.addEventListener("blur",()=>{var o;const i=t.dataset.secret;if(!i)return;const a=t.value.trim();if(!a){v.hasPending(i)&&(v.deletePending(i),O(E));return}if(a===$)return;v.setPending(i,a);const n=P(i,a);n.valid?v.setValidation(i,!0):v.setValidation(i,!1,n.hint||"Invalid format"),z.has(i)?t.value=a:(t.type="password",t.value=$),t.classList.remove("valid-staged","invalid"),t.classList.add(n.valid?"valid-staged":"invalid");const l=(o=t.closest(".settings-secret-row"))==null?void 0:o.querySelector(".settings-secret-status");l&&(l.textContent=n.valid?"Staged":"Invalid",l.className=`settings-secret-status ${n.valid?"staged":"warn"}`);const d=t.closest(".settings-secret-row"),c=d==null?void 0:d.querySelector(".settings-secret-hint");if(c&&c.remove(),!n.valid&&n.hint){const g=document.createElement("span");g.className="settings-secret-hint",g.textContent=n.hint,d==null||d.appendChild(g)}if(q(t.dataset.feature),i==="OLLAMA_API_URL"&&n.valid){const g=s.querySelector("select[data-model-select]");g&&U(g)}C()})}),s.querySelectorAll("a[data-signup-url]").forEach(t=>{t.addEventListener("click",i=>{i.preventDefault();const a=t.dataset.signupUrl;a&&(pe()?X("open_url",{url:a}).catch(()=>window.open(a,"_blank")):window.open(a,"_blank"))})});const e=s.querySelector("select[data-model-select]");e&&(e.addEventListener("change",()=>{const t=e.value;t&&(v.setPending("OLLAMA_MODEL",t),v.setValidation("OLLAMA_MODEL",!0),e.classList.remove("invalid"),e.classList.add("valid-staged"),q("aiOllama"),C())}),U(e))}function q(s){const e=document.querySelector(`.settings-feat[data-feature-id="${s}"]`);if(!e)return;const t=k.find(c=>c.id===s);if(!t)return;const i=B(s),a=x(t),n=!i&&a.every(c=>A(c).valid||v.hasPending(c)&&v.getValidationState(c).validated!==!1),l=e.classList.contains("expanded");e.className=`settings-feat ${i?"ready":n?"staged":"needs"}${l?" expanded":""}`;const d=e.querySelector(".settings-feat-pill");d&&(d.className=`settings-feat-pill ${i?"ok":n?"staged":"warn"}`,d.textContent=i?"Ready":n?"Staged":"Needs keys")}async function U(s){var l,d,c;const e=R(),t=v.getPending("OLLAMA_API_URL")||((l=e.secrets.OLLAMA_API_URL)==null?void 0:l.value)||"";if(!t){L(s,S('<option value="" disabled selected>Set Ollama URL first</option>',"legacy direct innerHTML migration"));return}const i=v.getPending("OLLAMA_MODEL")||((d=e.secrets.OLLAMA_MODEL)==null?void 0:d.value)||"",a=await fe(t);if(a.length===0){const o=(c=s.parentElement)==null?void 0:c.querySelector("input[data-model-manual]");o&&(s.style.display="none",o.classList.remove("hidden-input"),o.dataset.listenerAttached||(o.dataset.listenerAttached="1",o.addEventListener("blur",()=>{const g=o.value.trim();g&&(v.setPending("OLLAMA_MODEL",g),v.setValidation("OLLAMA_MODEL",!0),o.classList.remove("invalid"),o.classList.add("valid-staged"),q("aiOllama"),C())})));return}L(s,S((i?"":'<option value="" selected disabled>Select a model...</option>')+a.map(o=>`<option value="${u(o)}" ${o===i?"selected":""}>${u(o)}</option>`).join(""),"legacy direct innerHTML migration"))}function Ee(s){var t,i,a,n;L(s,S(`
    <div class="settings-section-header">
      <h2>Debug &amp; Logs</h2>
    </div>
    <div class="debug-actions">
      <button id="openLogsBtn" type="button">Open Logs Folder</button>
      <button id="openSidecarLogBtn" type="button">Open API Log</button>
    </div>
    <section class="debug-data-section">
      <h3>Data Management</h3>
      <div class="debug-data-actions">
        <button type="button" class="settings-btn settings-btn-secondary" id="exportSettingsBtn">
          ${r("components.settings.exportSettings")}
        </button>
        <button type="button" class="settings-btn settings-btn-secondary" id="importSettingsBtn">
          ${r("components.settings.importSettings")}
        </button>
        <input type="file" id="importSettingsInput" accept=".json" style="display: none;" />
      </div>
    </section>
    <section class="settings-diagnostics" id="diagnosticsSection">
      <header class="diag-header">
        <h2>Diagnostics</h2>
        <div class="diag-toggles">
          <label><input type="checkbox" id="verboseApiLog"> Verbose Sidecar Log</label>
          <label><input type="checkbox" id="fetchDebugLog"> Frontend Fetch Debug</label>
        </div>
      </header>
      <div class="diag-traffic-bar">
        <h3>API Traffic <span id="trafficCount"></span></h3>
        <div class="diag-traffic-controls">
          <label><input type="checkbox" id="autoRefreshLog" checked> Auto</label>
          <button id="refreshLogBtn" type="button">Refresh</button>
          <button id="clearLogBtn" type="button">Clear</button>
        </div>
      </div>
      <div id="trafficLog" class="diag-traffic-log"></div>
    </section>
  `,"legacy direct innerHTML migration")),(t=s.querySelector("#openLogsBtn"))==null||t.addEventListener("click",()=>{j("open_logs_folder",r("modals.settingsWindow.openLogs"))}),(i=s.querySelector("#openSidecarLogBtn"))==null||i.addEventListener("click",()=>{j("open_sidecar_log_file",r("modals.settingsWindow.openApiLog"))}),(a=s.querySelector("#exportSettingsBtn"))==null||a.addEventListener("click",()=>{ie()});const e=s.querySelector("#importSettingsInput");(n=s.querySelector("#importSettingsBtn"))==null||n.addEventListener("click",()=>{e==null||e.click()}),e==null||e.addEventListener("change",async l=>{var c;const d=(c=l.target.files)==null?void 0:c[0];if(d){try{const o=await oe(d);w(r("components.settings.importSuccess",{count:String(o.keysImported)}),"ok")}catch(o){o instanceof DOMException?o.name==="QuotaExceededError"||o.name==="NS_ERROR_DOM_QUOTA_REACHED"?w(r("components.settings.importFailed")+": storage limit reached","error"):o.name==="SecurityError"?w(r("components.settings.importFailed")+": storage blocked","error"):w(`${r("components.settings.importFailed")}: ${o.message||o.name}`,"error"):o instanceof Error&&o.message?w(`${r("components.settings.importFailed")}: ${o.message}`,"error"):w(r("components.settings.importFailed"),"error")}e.value=""}}),Me()}function Me(){const s=document.getElementById("verboseApiLog"),e=document.getElementById("fetchDebugLog"),t=document.getElementById("autoRefreshLog"),i=document.getElementById("refreshLogBtn"),a=document.getElementById("clearLogBtn"),n=document.getElementById("trafficLog"),l=document.getElementById("trafficCount");e&&(e.checked=localStorage.getItem("wm-debug-log")==="1",e.addEventListener("change",()=>{localStorage.setItem("wm-debug-log",e.checked?"1":"0")}));async function d(){if(s)try{const h=await(await _("/api/local-debug-toggle")).json();s.checked=h.verboseMode}catch{}}s==null||s.addEventListener("change",async()=>{try{const h=await(await _("/api/local-debug-toggle",{method:"POST"})).json();s&&(s.checked=h.verboseMode),w(h.verboseMode?r("modals.settingsWindow.verboseOn"):r("modals.settingsWindow.verboseOff"),"ok")}catch{w(r("modals.settingsWindow.sidecarError"),"error")}}),d();async function c(){if(n)try{const m=(await(await _("/api/local-traffic-log")).json()).entries||[];if(l&&(l.textContent=`(${m.length})`),m.length===0){L(n,S(`<p class="diag-empty">${r("modals.settingsWindow.noTraffic")}</p>`,"legacy direct innerHTML migration"));return}const y=m.slice().reverse().map(b=>{var K;const M=((K=b.timestamp.split("T")[1])==null?void 0:K.replace("Z",""))||b.timestamp;return`<tr class="diag-${b.status<300?"ok":b.status<500?"warn":"err"}"><td>${u(M)}</td><td>${b.method}</td><td title="${u(b.path)}">${u(b.path)}</td><td>${b.status}</td><td>${b.durationMs}ms</td></tr>`}).join("");L(n,S(`<table class="diag-table"><thead><tr><th>${r("modals.settingsWindow.table.time")}</th><th>${r("modals.settingsWindow.table.method")}</th><th>${r("modals.settingsWindow.table.path")}</th><th>${r("modals.settingsWindow.table.status")}</th><th>${r("modals.settingsWindow.table.duration")}</th></tr></thead><tbody>${y}</tbody></table>`,"legacy direct innerHTML migration"))}catch{L(n,S(`<p class="diag-empty">${r("modals.settingsWindow.sidecarUnreachable")}</p>`,"legacy direct innerHTML migration"))}}i==null||i.addEventListener("click",()=>void c()),a==null||a.addEventListener("click",async()=>{try{await _("/api/local-traffic-log",{method:"DELETE"})}catch{}n&&L(n,S(`<p class="diag-empty">${r("modals.settingsWindow.logCleared")}</p>`,"legacy direct innerHTML migration")),l&&(l.textContent="(0)")});let o=null;function g(){p(),o=me(()=>c(),{intervalMs:3e3,pauseWhenHidden:!0,refreshOnVisible:!0,runImmediately:!0,jitterFraction:0})}function p(){o&&(o.stop(),o=null)}t==null||t.addEventListener("change",()=>{t.checked?g():p()}),g(),W=p}function G(s,e){const t=u(s),i=u(e);if(!i)return t;const a=new RegExp(`(${i.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`,"gi");return t.replace(a,"<mark>$1</mark>")}function ke(s){const e=document.getElementById("contentArea");if(!e)return;if(!s.trim()){O(E);return}const t=s.toLowerCase(),i=[];for(const n of H)for(const l of n.features){const d=k.find(o=>o.id===l);if(!d)continue;[d.name,d.description,...x(d).map(o=>Q[o]||o)].join(" ").toLowerCase().includes(t)&&i.push({feature:d,catLabel:n.label})}if(i.length===0){L(e,S(`<div class="settings-search-empty"><p>No features match "${u(s)}"</p></div>`,"legacy direct innerHTML migration"));return}const a=i.map(({feature:n,catLabel:l})=>{const d=F(n.id),c=B(n.id),o=x(n),g=!c&&o.every(y=>A(y).valid||v.hasPending(y)&&v.getValidationState(y).validated!==!1),p=c?"ready":g?"staged":"needs",f=c?"ok":g?"staged":"warn",h=c?"Ready":g?"Staged":"Needs keys",m=o.map(y=>ee(y,n.id)).join("");return`
      <div class="settings-feat ${p} expanded" data-feature-id="${n.id}">
        <div class="settings-feat-header" data-feat-toggle-expand="${n.id}">
          <label class="settings-feat-toggle-label" data-click-stop>
            <div class="settings-feat-switch">
              <input type="checkbox" data-toggle="${n.id}" ${d?"checked":""} />
              <span class="settings-feat-slider"></span>
            </div>
          </label>
          <div class="settings-feat-info">
            <span class="settings-feat-name">${G(n.name,s)}</span>
            <span class="settings-feat-desc">${G(n.description,s)}</span>
          </div>
          <span class="settings-feat-pill ${f}">${h}</span>
          <span class="settings-feat-chevron">&#x25B8;</span>
        </div>
        <div class="settings-feat-body">
          <div class="settings-feat-cat-tag">${u(l)}</div>
          ${m}
        </div>
      </div>
    `}).join("");L(e,S(`
    <div class="settings-section-header">
      <h2>Search results for "${u(s)}"</h2>
    </div>
    <div class="settings-feat-list">${a}</div>
  `,"legacy direct innerHTML migration")),te(e)}async function Ae(){var l,d,c;await de(),ce(),ne(),document.title=r("modals.settingsWindow.shellTitle");const s=document.querySelector(".settings-header-title");s&&(s.textContent=r("modals.settingsWindow.shellTitle"));const e=document.getElementById("settingsSearch");e&&(e.placeholder=r("modals.settingsWindow.shellSearchPlaceholder"));const t=document.getElementById("cancelBtn");t&&(t.textContent=r("modals.settingsWindow.shellCancel"));const i=document.getElementById("okBtn");i&&(i.textContent=r("modals.settingsWindow.shellSaveClose"));try{await re()}catch{}requestAnimationFrame(()=>{document.documentElement.classList.remove("no-transition")}),await ge(),v=new ye,O("overview"),(l=document.getElementById("sidebarNav"))==null||l.addEventListener("click",o=>{const g=o.target.closest("[data-section]");g!=null&&g.dataset.section&&O(g.dataset.section)});const a=document.getElementById("settingsSearch");let n;a==null||a.addEventListener("input",()=>{clearTimeout(n),n=setTimeout(()=>ke(a.value),200)}),(d=document.getElementById("okBtn"))==null||d.addEventListener("click",()=>{(async()=>{try{const o=document.querySelector("[data-wm-key-input]"),g=o==null?void 0:o.value.trim(),p=!!(g&&g!==$&&g.length>0),f=document.getElementById("contentArea");f&&v.captureUnsavedInputs(f);const h=v.hasPendingChanges();if(!h&&!p){D();return}if(p&&g&&await Y("WORLDMONITOR_API_KEY",g),h){w(r("modals.settingsWindow.validating"),"ok");const m=v.getMissingRequiredSecrets();if(m.length>0){w(`Missing required: ${m.join(", ")}`,"error");return}const y=await v.verifyPendingSecrets();if(y.length>0){w(r("modals.settingsWindow.verifyFailed",{errors:y.join(", ")}),"error");return}await v.commitVerifiedSecrets()}w(r("modals.settingsWindow.saved"),"ok"),D()}catch(o){console.error("[settings] save error:",o),w(r("modals.settingsWindow.failed",{error:String(o)}),"error")}})()}),(c=document.getElementById("cancelBtn"))==null||c.addEventListener("click",()=>{D()}),window.addEventListener("beforeunload",()=>{v.destroy()})}localStorage.setItem("wm-settings-open","1");window.addEventListener("beforeunload",()=>localStorage.removeItem("wm-settings-open"));Ae();
