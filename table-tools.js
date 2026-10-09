(() => {
  const states = {
    friendly: {filters: {}, sort: null, rows: []},
    existing: {filters: {}, sort: null, rows: []}
  };
  const columns = {
    friendly: [null, 'coord', 'player', 'spear', 'sword', 'archer', 'heavy', 'weight'],
    existing: [null, 'coord', 'player', 'spear', 'sword', 'archer', 'heavy', 'surplusWeight', 'weight']
  };
  const value = (kind, row, key) => kind === 'existing' && ['spear', 'sword', 'archer', 'heavy'].includes(key) ? row.surplus[key] : row[key];
  const numeric = key => !['coord', 'player'].includes(key);
  function matches(amount, filter) {
    if(filter.mode === 'gt') return amount > filter.number;
    if(filter.mode === 'gte') return amount >= filter.number;
    if(filter.mode === 'lt') return amount < filter.number;
    if(filter.mode === 'lte') return amount <= filter.number;
    if(filter.mode === 'eq') return amount === filter.number;
    if(filter.mode === 'between') return amount >= filter.number && amount <= filter.upper;
    return true;
  }
  function apply(kind, rows) {
    const state = states[kind];
    const result = rows.filter(row => Object.entries(state.filters).every(([key, filter]) => {
      const v = value(kind, row, key);
      if(key === 'player') return filter.players.includes(v || '');
      if(key === 'coord') return String(v).includes(filter.text);
      return matches(Number(v) || 0, filter);
    }));
    if(state.sort) {
      const {key, direction} = state.sort;
      result.sort((a, b) => {
        const av = value(kind, a, key), bv = value(kind, b, key);
        const diff = numeric(key) ? (Number(av) || 0) - (Number(bv) || 0) : String(av || '').localeCompare(String(bv || ''), 'it', {numeric:true});
        return direction * diff;
      });
    }
    return result;
  }
  function redraw(kind) {
    if(kind === 'friendly') renderTroopTable(true);
    else renderExistingBunkers();
  }
  function update(kind, all, visible) {
    const state = states[kind];
    state.rows = all;
    const status = document.getElementById(kind + 'TableStatus');
    status.replaceChildren();
    const text = document.createElement('span');
    text.textContent = `${visible.length.toLocaleString('it-IT')} di ${all.length.toLocaleString('it-IT')} villaggi`;
    status.append(text);
    if(Object.keys(state.filters).length || state.sort) {
      const reset = document.createElement('button');
      reset.type = 'button'; reset.textContent = 'Rimuovi filtri e ordine';
      reset.addEventListener('click', () => {state.filters = {}; state.sort = null; redraw(kind);});
      status.append(reset);
    }
    document.querySelectorAll(`#${kind}Table th[data-column]`).forEach(th => {
      const key = th.dataset.column;
      const active = Boolean(state.filters[key]);
      const sorted = state.sort?.key === key;
      th.setAttribute('aria-sort', sorted ? (state.sort.direction === 1 ? 'ascending' : 'descending') : 'none');
      const button = th.querySelector('button');
      button.classList.toggle('filterActive', active);
      button.textContent = `${button.dataset.label} ${sorted ? (state.sort.direction === 1 ? '↑' : '↓') : '▾'}${active ? ' •' : ''}`;
    });
  }
  function element(tag, text, parent) {
    const e = document.createElement(tag);
    if(text !== undefined) e.textContent = text;
    parent?.append(e);
    return e;
  }
  function action(parent, text, fn) {
    const button = element('button', text, parent); button.type = 'button';
    button.addEventListener('click', fn); return button;
  }
  function openMenu(kind, key, label) {
    const state = states[kind], filter = state.filters[key];
    const dialog = document.createElement('dialog');
    dialog.className = 'columnMenu';
    dialog.setAttribute('aria-label', `Ordina e filtra: ${label}`);
    element('h3', label, dialog);
    const order = element('div', undefined, dialog); order.className = 'columnMenuActions';
    const finish = () => {dialog.close(); redraw(kind);};
    action(order, numeric(key) ? 'Dal più piccolo al più grande' : 'Da A a Z', () => {state.sort = {key, direction:1}; finish();});
    action(order, numeric(key) ? 'Dal più grande al più piccolo' : 'Da Z a A', () => {state.sort = {key, direction:-1}; finish();});
    const form = element('form', undefined, dialog);
    let getFilter;
    if(key === 'player') {
      const searchLabel = element('label', 'Cerca player', form);
      const search = element('input', undefined, searchLabel); search.type = 'search'; search.className = 'input';
      const tools = element('div', undefined, form); tools.className = 'columnMenuActions';
      const list = element('div', undefined, form); list.className = 'playerFilterList';
      const players = [...new Set(state.rows.map(row => row.player || ''))].sort((a,b) => a.localeCompare(b, 'it'));
      const checks = players.map(player => {
        const label = element('label', undefined, list);
        const check = element('input', undefined, label); check.type = 'checkbox';
        check.checked = !filter || filter.players.includes(player);
        element('span', player || '(senza player)', label);
        return {player, label, check};
      });
      search.addEventListener('input', () => checks.forEach(row => {row.label.hidden = !row.player.toLocaleLowerCase().includes(search.value.toLocaleLowerCase());}));
      action(tools, 'Seleziona tutti', () => checks.forEach(row => {row.check.checked = true;}));
      action(tools, 'Deseleziona tutti', () => checks.forEach(row => {row.check.checked = false;}));
      getFilter = () => {
        const selected = checks.filter(row => row.check.checked).map(row => row.player);
        return selected.length === players.length ? null : {players:selected};
      };
    } else if(key === 'coord') {
      const label = element('label', 'Contiene', form);
      const input = element('input', undefined, label); input.className = 'input'; input.value = filter?.text || '';
      getFilter = () => input.value.trim() ? {text:input.value.trim()} : null;
    } else {
      const label = element('label', 'Mostra valori', form);
      const mode = element('select', undefined, label); mode.className = 'input';
      for(const [v, t] of [['between','Compreso tra'],['lte','Minore o uguale a'],['gte','Maggiore o uguale a']]) {
        const option = element('option', t, mode); option.value = v;
      }
      mode.value = filter?.mode || 'between';
      const first = element('label', 'Valore', form);
      const input = element('input', undefined, first); input.className = 'input'; input.type = 'number'; input.min = '0'; input.step = '1'; input.value = filter?.number ?? '';
      const second = element('label', 'Fino a', form);
      const upper = element('input', undefined, second); upper.className = 'input'; upper.type = 'number'; upper.min = '0'; upper.step = '1'; upper.value = filter?.upper ?? '';
      const sync = () => {first.hidden = mode.value === 'all'; second.hidden = mode.value !== 'between'; input.required = mode.value !== 'all'; upper.required = mode.value === 'between';};
      mode.addEventListener('change', sync); sync();
      getFilter = () => {
        if(mode.value === 'all') return null;
        upper.setCustomValidity('');
        if(mode.value === 'between' && Number(upper.value) < Number(input.value)) {upper.setCustomValidity('Il secondo valore deve essere almeno pari al primo.'); upper.reportValidity(); return undefined;}
        return {mode:mode.value, number:Number(input.value), upper:Number(upper.value)};
      };
      upper.addEventListener('input', () => upper.setCustomValidity(''));
      input.addEventListener('input', () => upper.setCustomValidity(''));
    }
    const buttons = element('div', undefined, form); buttons.className = 'columnMenuActions';
    const submit = element('button', 'Applica filtro', buttons); submit.type = 'submit';
    action(buttons, 'Rimuovi filtro', () => {delete state.filters[key]; finish();});
    action(buttons, 'Chiudi', () => dialog.close());
    form.addEventListener('submit', event => {
      event.preventDefault();
      const next = getFilter();
      if(next === undefined) return;
      if(next) state.filters[key] = next; else delete state.filters[key];
      finish();
    });
    dialog.addEventListener('close', () => dialog.remove());
    document.body.append(dialog); dialog.showModal();
  }
  window.tableTools = {apply, update, resetAll: () => Object.values(states).forEach(state => {state.filters = {}; state.sort = null;})};
  document.addEventListener('DOMContentLoaded', () => {
    for(const kind of Object.keys(states)) {
      const table = document.getElementById(kind + 'Table');
      [...table.querySelectorAll('thead th')].forEach((th, index) => {
        const key = columns[kind][index]; if(!key) return;
        const label = th.textContent.trim(); th.textContent = ''; th.dataset.column = key;
        const button = action(th, label + ' ▾', () => openMenu(kind, key, label));
        button.dataset.label = label; button.className = 'columnMenuTrigger'; button.setAttribute('aria-label', `Ordina e filtra: ${label}`); button.setAttribute('aria-haspopup', 'dialog');
      });
      redraw(kind);
    }
  });
})();
