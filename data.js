export const PLANETS = [
  { id: 'mercury', name: 'Merkúríus', order: 1, diameter: 4879, year: '88 jarðardagar', distance: '58 milljón km', type: 'rock', tag: 'Næst sólinni',
    intro: 'Merkúríus er minnsta plánetan og sú sem er næst sólinni.',
    facts: ['Á yfirborðinu eru margir gígar, líkt og á tunglinu.', 'Það getur verið mjög heitt á daginn en afar kalt á nóttunni.', 'Merkúríus hefur ekkert tungl.'],
    clues: ['Ég er næst sólinni.', 'Ég er minnsta plánetan.', 'Yfirborðið mitt er grátt og þakið gígum.'], source: 'https://science.nasa.gov/mercury/facts/' },
  { id: 'venus', name: 'Venus', order: 2, diameter: 12104, year: '225 jarðardagar', distance: '108 milljón km', type: 'rock', tag: 'Heitasta plánetan',
    intro: 'Venus er heitasta plánetan í sólkerfinu. Þykkur lofthjúpur heldur hitanum inni.',
    facts: ['Venus er svipuð jörðinni að stærð.', 'Þykk ský fela yfirborðið.', 'Venus hefur ekkert tungl.'],
    clues: ['Ég er heitasta plánetan.', 'Ég er önnur frá sólinni.', 'Þykkur lofthjúpur heldur hitanum mínum inni.'], source: 'https://science.nasa.gov/venus/venus-facts/' },
  { id: 'earth', name: 'Jörðin', order: 3, diameter: 12742, year: '365¼ jarðardagar', distance: '150 milljón km', type: 'rock', tag: 'Heimilið okkar',
    intro: 'Jörðin er heimilið okkar og eina plánetan þar sem við vitum að líf er til.',
    facts: ['Höf þekja um 71% af yfirborðinu.', 'Jörðin hefur eitt tungl.', 'Snúningur jarðar veldur því að dagur og nótt skiptast á.'],
    clues: ['Á mér býr fólk.', 'Ég hef eitt tungl og stór höf.', 'Ég er þriðja plánetan frá sólinni.'], source: 'https://science.nasa.gov/earth/facts/' },
  { id: 'mars', name: 'Mars', order: 4, diameter: 6779, year: '687 jarðardagar', distance: '228 milljón km', type: 'rock', tag: 'Rauða plánetan',
    intro: 'Mars er oft kallaður rauða plánetan. Járnoxíð, eins konar ryð, gefur yfirborðinu rauðleitan lit.',
    facts: ['Mars hefur tvö lítil tungl.', 'Vélmenni hafa kannað yfirborðið.', 'Á Mars er Olympus Mons, risastórt eldfjall.'],
    clues: ['Ég er kölluð rauða plánetan.', 'Vélmenni aka um á yfirborðinu mínu.', 'Ég er fjórða plánetan frá sólinni.'], source: 'https://science.nasa.gov/mars/facts/' },
  { id: 'jupiter', name: 'Júpíter', order: 5, diameter: 139820, year: 'Um 12 jarðarár', distance: '778 milljón km', type: 'gas', tag: 'Stærst allra',
    intro: 'Júpíter er stærsta plánetan í sólkerfinu. Hún er gasrisi, að mestu úr vetni og helíni.',
    facts: ['Rauði bletturinn mikli er risastór stormur.', 'Júpíter hefur marga tugi tungla.', 'Júpíter hefur líka hringa en þeir eru mjög daufir.'],
    clues: ['Ég er stærsta plánetan.', 'Á mér er stormur sem kallast Rauði bletturinn mikli.', 'Ég er gasrisi með ljósar og dökkar skýjarákir.'], source: 'https://science.nasa.gov/jupiter/jupiter-facts/' },
  { id: 'saturn', name: 'Satúrnus', order: 6, diameter: 116460, year: 'Um 29 jarðarár', distance: '1.434 milljón km', type: 'gas', tag: 'Fræg fyrir hringina',
    intro: 'Satúrnus er gasrisi með stórt og áberandi hringakerfi.',
    facts: ['Hringarnir eru að mestu úr ísögnum.', 'Satúrnus er næststærsta plánetan.', 'Satúrnus hefur marga tugi tungla.'],
    clues: ['Ég er fræg fyrir stóra og áberandi hringa.', 'Ég er næststærsta plánetan.', 'Ég er sjötta plánetan frá sólinni.'], source: 'https://science.nasa.gov/saturn/facts/' },
  { id: 'uranus', name: 'Úranus', order: 7, diameter: 50724, year: 'Um 84 jarðarár', distance: '2.871 milljón km', type: 'ice', tag: 'Snýst á hliðinni',
    intro: 'Úranus er ísrisi. Snúningsásinn hallar svo mikið að plánetan virðist rúlla á hliðinni.',
    facts: ['Metan í lofthjúpnum gefur henni blágrænan lit.', 'Úranus hefur daufa hringa.', 'Hún er sjöunda plánetan frá sólinni.'],
    clues: ['Ég virðist snúast á hliðinni.', 'Ég er sjöunda plánetan frá sólinni.', 'Ég er blágrænn ísrisi.'], source: 'https://science.nasa.gov/uranus/facts/' },
  { id: 'neptune', name: 'Neptúnus', order: 8, diameter: 49244, year: 'Um 165 jarðarár', distance: '4.495 milljón km', type: 'ice', tag: 'Lengst frá sólinni',
    intro: 'Neptúnus er ísrisi og sú af átta plánetunum sem er lengst frá sólinni.',
    facts: ['Í lofthjúpnum blása gríðarlega sterkir vindar.', 'Neptúnus hefur daufa hringa.', 'Neptúnus er aðeins minni en Úranus.'],
    clues: ['Ég er lengst frá sólinni af átta plánetunum.', 'Það tekur mig um 165 jarðarár að fara hring um sólina.', 'Ég er áttunda plánetan frá sólinni.'], source: 'https://science.nasa.gov/neptune/neptune-facts/' }
];

export const TYPES = { rock: 'Bergpláneta', gas: 'Gasrisi', ice: 'Ísrisi', giant: 'Risapláneta' };
export const LEVELS = [
  { id: 1, name: 'Fyrstu skref', text: 'Færri valkostir og meiri stuðningur.' },
  { id: 2, name: 'Á geimferð', text: 'Fleiri plánetur og fleiri valkostir.' },
  { id: 3, name: 'Geimsérfræðingur', text: 'Allt sólkerfið og minni stuðningur.' }
];
export const ACTIVITIES = [
  { id: 'order', icon: '↔', color: 'mint', title: 'Raðaðu plánetunum', text: 'Hver kemur fyrst? Byggðu sólkerfið frá sólinni og út.', skill: 'Röð og fjarlægð',
    lesson: 'Pláneturnar átta ganga um sólina. Röðin frá sólinni er Merkúríus, Venus, Jörðin, Mars, Júpíter, Satúrnus, Úranus og Neptúnus.',
    example: 'Merkúríus er næst sólinni. Hún fer því í fyrsta sætið.', task: 'Veldu plánetu og svo sætið hennar. Þú getur líka dregið plánetu í sæti. Veldu skipað sæti til að taka plánetuna úr því.' },
  { id: 'identify', icon: '◎', color: 'peach', title: 'Hvaða pláneta er þetta?', text: 'Skoðaðu myndina og finndu rétta nafnið.', skill: 'Myndir og heiti',
    lesson: 'Plánetur líta ólíkt út. Jörðin hefur höf og lönd, Mars er rauðleitur og Satúrnus hefur áberandi hringa. Myndirnar eru teknar úr geimnum. Litir og lýsing geta verið ólík milli mynda.',
    example: 'Mynd af plánetu með bláum höfum, löndum og hvítum skýjum sýnir jörðina.', task: 'Skoðaðu myndina og veldu rétt heiti. Bókstafirnir hjálpa þér að finna svarmöguleikana.' },
  { id: 'clues', icon: '✧', color: 'lilac', title: 'Geimspæjarinn', text: 'Lestu vísbendingar. Hvaða pláneta er að tala?', skill: 'Lesskilningur og ályktun',
    lesson: 'Vísbending segir eitthvað sérstakt um plánetu. Hugsaðu um stærð, staðsetningu eða einkenni hennar.',
    example: '„Á mér býr fólk.“ Svarið er Jörðin, heimilið okkar.', task: 'Finndu plánetuna út frá vísbendingunni. Þú getur beðið um fleiri vísbendingar.' },
  { id: 'sort', icon: '▦', color: 'blue', title: 'Plánetufjölskyldur', text: 'Bergpláneta, gasrisi eða ísrisi? Finndu fjölskylduna.', skill: 'Flokkun',
    lesson: 'Merkúríus, Venus, Jörðin og Mars eru bergplánetur. Júpíter og Satúrnus eru gasrisar. Úranus og Neptúnus eru ísrisar. Gasrisar og ísrisar eru saman kallaðir risaplánetur.',
    example: 'Jörðin hefur fast bergyfirborð. Hún er því bergpláneta.', task: 'Veldu réttan flokk fyrir plánetuna. Á fyrsta stigi eru gasrisar og ísrisar saman í flokknum risaplánetur.' },
  { id: 'size', icon: '◉', color: 'gold', title: 'Stór eða smá?', text: 'Berðu saman plánetur og finndu þá stærri.', skill: 'Stærð og samanburður',
    lesson: 'Júpíter er stærst allra plánetanna og Merkúríus minnst. Hér berum við saman þvermál: lengd beint í gegnum miðju plánetunnar.',
    example: 'Júpíter er stærri en jörðin. Ef spurt er hvor er stærri veljum við Júpíter.', task: 'Veldu plánetuna sem hefur meira þvermál. Á fyrstu tveimur stigunum hjálpa myndirnar. Á þriðja stigi lestu þvermálið.' },
  { id: 'day', icon: '◐', color: 'rose', title: 'Dagur og nótt', text: 'Snúðu jörðinni. Hvar er dagur og hvar er nótt?', skill: 'Orsök og afleiðing',
    lesson: 'Sólin lýsir upp þá hlið jarðar sem snýr að henni. Þar er dagur. Hin hliðin er í skugga og þar er nótt. Jörðin snýst og því skiptast dagur og nótt á.',
    example: 'Þegar merkti staðurinn snýr að sólinni er þar dagur. Þegar hann snýr frá sólinni er þar nótt.', task: 'Prófaðu fyrst að snúa jörðinni með sleðanum. Í verkefninu velurðu hvort er dagur eða nótt á merkta staðnum.' }
];

export function shuffle(items, random = Math.random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export function planet(id) { return PLANETS.find(p => p.id === id); }
export function orderPool(level) { return PLANETS.slice(0, level === 1 ? 4 : level === 2 ? 6 : 8); }
export function isDay(angle) { return Math.cos(angle * Math.PI / 180) > 0; }
export function groupFor(p, level) { return level === 1 && p.type !== 'rock' ? 'giant' : p.type; }
export function makeQuestions(kind, level, random = Math.random) {
  const count = level + 1;
  const targets = shuffle(PLANETS, random).slice(0, 5);
  const positions = shuffle(Array.from({ length: count }, (_, i) => i), random);
  if (kind === 'day') return shuffle([0, 45, 135, 180, 225, 315, 60, 120, 240, 300], random).slice(0, 5).map(angle => ({ angle, answer: isDay(angle) ? 'day' : 'night', options: ['day', 'night'] }));
  return targets.map((p, index) => {
    if (kind === 'sort') return { planet: p.id, answer: groupFor(p, level), options: level === 1 ? ['rock', 'giant'] : ['rock', 'gas', 'ice'] };
    if (kind === 'size') {
      const candidates = PLANETS.filter(o => o.id !== p.id && (level !== 1 || Math.max(o.diameter, p.diameter) / Math.min(o.diameter, p.diameter) >= 2));
      const other = shuffle(candidates, random)[0];
      return { planet: p.id, answer: p.diameter > other.diameter ? p.id : other.id, options: shuffle([p.id, other.id], random) };
    }
    const options = shuffle(PLANETS.filter(o => o.id !== p.id), random).slice(0, count - 1).map(o => o.id);
    options.splice(positions[index % count], 0, p.id);
    return { planet: p.id, answer: p.id, options };
  });
}
export function scoreStars(correct, total) { return correct === total ? 3 : correct / total >= 0.6 ? 2 : 1; }
export const STORAGE_KEY = 'stjornufraedi-v1';
export function readProgress(raw) {
  try {
    const p = JSON.parse(raw);
    if (!p || p.version !== 1 || !Array.isArray(p.sessions)) return { version: 1, sessions: [] };
    return { version: 1, sessions: p.sessions.filter(s => s && ACTIVITIES.some(a => a.id === s.kind) && [1, 2, 3].includes(s.level) && Number.isInteger(s.correct) && Number.isInteger(s.total) && s.total > 0 && s.correct >= 0 && s.correct <= s.total && Number.isInteger(s.hints) && s.hints >= 0 && typeof s.date === 'string' && Number.isFinite(Date.parse(s.date))).slice(-300) };
  } catch { return { version: 1, sessions: [] }; }
}
