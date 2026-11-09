import { LEVELS } from './levels.js'; import { initStates, solve, graph } from './engine.js';
LEVELS.forEach((f, i) => { const L = f(); const S = initStates(L); const G = graph(L, S); const sol = solve(L, S, L.start);
  console.log(i + 1, L.name, 'cells', G.cells.size, sol ? sol.map(s => (s.act === 'goal' ? 'GOAL' : s.act === 'plate' ? 'plate' : 'g' + s.act) + '@' + s.walkTo).join(' ') : 'UNSOLVABLE'); });
