// Referral drafts page. Loaded after app.js and reuses its helpers ($, api, esc, I, view, toast, pages, TITLES).
(() => {
  const L = k => localStorage['ref_' + k] || '', S = (k, v) => localStorage['ref_' + k] = v;
  document.head.insertAdjacentHTML('beforeend', `<style>
    .rf-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.rf-grid label{display:flex;flex-direction:column;gap:5px;font-size:12.5px;font-weight:600;color:var(--mut)}.rf-w{grid-column:1/-1}
    .rf-grid input,.rf-grid textarea,.rf-grid select,.rf textarea{background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:9px 12px;color:var(--tx);font:inherit;font-weight:400;outline:0;width:100%;resize:vertical}
    .rf-grid input:focus,.rf-grid textarea:focus,.rf textarea:focus,.rf-grid select:focus{border-color:var(--pri);box-shadow:inset 0 0 0 1px var(--pri)}
    .rf-list{display:grid;gap:12px;margin-top:14px}.rf{display:flex;flex-direction:column;gap:10px}.rf .pt{justify-content:space-between}
    @media(max-width:700px){.rf-grid{grid-template-columns:1fr}}</style>`);
  for (const sel of ['#nav', '#tabs']) $(sel).insertAdjacentHTML('beforeend', `<a href="#/referral" data-nav="referral">${I.mail}<span>Referrals</span></a>`);
  TITLES.referral = 'Referrals';

  pages.referral = async () => {
    const d = await api('/people?starred=1&limit=10&sort=name');
    view().innerHTML = `<div class="hero"><div><h1>Referral messages</h1><p class="sub">AI drafts for your shortlisted people (up to 10). You review each one and send it yourself on LinkedIn.</p></div></div>
      ${!d.rows.length ? `<div class="card empty">No one shortlisted yet.<br><br><a class="btn pri" href="#/people">Go to People and star some</a></div>` : `
      <div class="card"><div class="rf-grid">
        <label>Your name<input id="rn" value="${esc(L('name'))}"></label>
        <label>Role you want a referral for<input id="rt" value="${esc(L('target'))}" placeholder="e.g. AI Engineer at Google"></label>
        <label class="rf-w">About you (1-3 lines, facts only)<textarea id="ra" rows="3" placeholder="e.g. Software engineer with 2 years of experience building ML features in Python...">${esc(L('about'))}</textarea></label>
        <label>Tone<select id="rtone">${[['friendly', 'Friendly'], ['formal', 'Formal'], ['direct', 'Short and direct']].map(([v, l]) => `<option value="${v}" ${L('tone') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <div style="display:flex;align-items:flex-end"><button class="btn pri" id="rgo">Generate drafts</button></div></div></div>
      <div class="rf-list" id="rl">${d.rows.map(x => `<div class="card rf" data-id="${x.id}"><div class="pt"><div class="pi"><b>${esc(x.name)}</b><small>${esc(x.position) || '-'} | ${esc(x.company) || '-'}</small></div><span class="tag">${esc(x.band)} yrs</span></div>
        <textarea rows="7" placeholder="Click Generate drafts to write this message..."></textarea>
        <div class="acts"><button class="btn sm" data-rcopy>${I.copy}Copy message</button>${x.url ? `<a class="btn sm" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${I.link}Open profile</a>` : ''}<span class="sub" data-cnt></span></div></div>`).join('')}</div>`}`;
    if (!d.rows.length) return;
    const cnt = ta => ta.closest('.rf').querySelector('[data-cnt]').textContent = ta.value.trim() ? ta.value.trim().split(/\s+/).length + ' words' : '';
    $$('#rl textarea').forEach(ta => ta.oninput = () => cnt(ta));
    $('#rl').onclick = async e => { const b = e.target.closest('[data-rcopy]'); if (!b) return; const v = b.closest('.rf').querySelector('textarea').value;
      if (!v.trim()) return toast('Generate a draft first'); try { await navigator.clipboard.writeText(v); toast('Message copied. Paste it into LinkedIn.'); } catch { toast('Copy failed'); } };
    $('#rgo').onclick = async () => {
      const f = { name: $('#rn').value, target: $('#rt').value, about: $('#ra').value }, tone = $('#rtone').value;
      Object.entries(f).forEach(([k, v]) => S(k, v)); S('tone', tone);
      const btn = $('#rgo'); btn.disabled = true; btn.textContent = 'Writing...';
      try {
        const r = await api('/messages/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: d.rows.map(x => x.id), sender: f, tone }) });
        r.drafts.forEach(m => { const ta = $(`.rf[data-id="${m.id}"] textarea`); if (ta) { ta.value = m.message; cnt(ta); } });
        toast('Drafts ready. Review before sending.');
      } catch (e) { toast(e.message); } finally { btn.disabled = false; btn.textContent = 'Generate drafts'; }
    };
  };
  if (location.hash.startsWith('#/referral')) route();
})();