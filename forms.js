(() => {
  const { $, $$, esc, store, toast } = App;
  const KEY = 'chitchat.messages.v1';
  let mode = 'general';

  function setMode(m) {
    mode = m;
    $$('.seg button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
    $$('.dist').forEach(f => f.classList.toggle('is-hidden', m !== 'distributor'));
    $('#topicBox').classList.toggle('is-hidden', m === 'distributor');
    $('#sendLbl').textContent = m === 'distributor' ? 'Send distributor enquiry' : 'Send message';
    $('#m').placeholder = m === 'distributor' ? 'Tell us about your business and the area you want to cover…' : 'How can we help?';
  }
  $('.seg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { setMode(b.dataset.mode); history.replaceState && 0; } });
  if (location.hash === '#distributor') { setMode('distributor'); setTimeout(() => $('#distributor').scrollIntoView({ behavior: 'smooth' }), 700); } else setMode('general');
  addEventListener('hashchange', () => { if (location.hash === '#distributor') setMode('distributor'); });

  $('#p').addEventListener('input', e => (e.target.value = e.target.value.replace(/[^\d+]/g, '')));
  const rules = {
    n: v => v.length >= 2, e: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), p: v => /^[6-9]\d{9}$/.test(v.replace(/^\+?91(?=\d{10}$)/, '')),
    m: v => v.length >= 10, c: v => v.length >= 2
  };
  const mark = (id, ok) => $('#' + id).closest('.field').classList.toggle('bad', !ok);
  $('#cf').addEventListener('input', e => { const r = rules[e.target.id]; if (r && e.target.closest('.field').classList.contains('bad') && r(e.target.value.trim())) mark(e.target.id, true); });

  $('#cf').addEventListener('submit', e => {
    e.preventDefault();
    const ids = ['n', 'e', 'p', 'm'].concat(mode === 'distributor' ? ['c'] : []);
    let first = null;
    ids.forEach(id => { const ok = rules[id]($('#' + id).value.trim()); mark(id, ok); if (!ok && !first) first = $('#' + id); });
    if (first) { first.focus(); toast('Please fix the highlighted fields.', { type: 'error' }); return; }
    const msg = {
      id: 'MSG' + Date.now().toString(36).toUpperCase(), at: Date.now(), type: mode, name: $('#n').value.trim(), email: $('#e').value.trim(), phone: $('#p').value.trim(),
      ...(mode === 'distributor' ? { city: $('#c').value.trim(), business: $('#b').value, volume: $('#v').value } : { topic: $('#t').value }), message: $('#m').value.trim()
    };
    store.set(KEY, [msg, ...store.get(KEY, [])].slice(0, 50));
    $('#cf').classList.add('is-hidden'); $('.seg').classList.add('is-hidden');
    $('#sent').classList.remove('is-hidden');
    $('#sentMsg').textContent = `Thanks ${msg.name.split(' ')[0]}, we've received your ${mode === 'distributor' ? 'distributor enquiry' : 'message'} (ref ${msg.id}) and will reply to ${msg.email} within one working day.`;
  });
  $('#again').addEventListener('click', () => {
    $('#cf').reset(); $('#cf').classList.remove('is-hidden'); $('.seg').classList.remove('is-hidden'); $('#sent').classList.add('is-hidden'); $$('.field.bad').forEach(f => f.classList.remove('bad'));
  });
})();
