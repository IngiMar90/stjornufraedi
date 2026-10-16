# Stjörnufræði – Leiðangur um sólkerfið

Gagnvirkt íslenskt kennsluforrit fyrir grunnskóla. Keyrir sem venjulegur vefur án bakenda, innskráningar eða uppsetningar pakka. Plánetumyndir frá NASA og samstarfsaðilum eru geymdar með forritinu. Stjörnubakgrunnur og kennslulíkön eru SVG/CSS. Engin ytri letur eða myndasöfn eru sótt við notkun. Sjá [myndheimildir](assets/CREDITS.md).

## Efni

- **Plánetubók:** upplýsingar um átta plánetur, röð, stærð, meðal­fjarlægð frá sólu, umferðartíma og einkenni. Stutt grunnsýn og valfrjáls **Nánar** lestur á íslensku fyrir hverja plánetu. Ítartextar í `planet-details.js` eru sjálfstæðar samantektir á einföldu máli með heimildarhlekk á NASA. Hægt er að lesa ítartextann sérstaklega upp.
- **Raðaðu plánetunum:** sól vinstra megin og átta sporbrautir með merktum lendingarpunktum. Draga og sleppa með mús, snertingu eða penna; einnig má velja plánetu og lendingarpunkt með hnöppum eða lyklaborði. Allar átta sporbrautirnar sjást, en aðeins fyrstu 4/6/8 eru virkar eftir stigi. Á litlum skjá má fletta myndinni til hliðar.
- **Hvaða pláneta er þetta?** Greina plánetu á geimmynd. Heitið kemur ekki fram á myndinni í spurningunni.
- **Geimspæjarinn:** lesskilningur og ályktun út frá vísbendingum.
- **Plánetufjölskyldur:** bergplánetur og risaplánetur á stigi 1; bergplánetur, gasrisar og ísrisar á stigum 2–3.
- **Stór eða smá?** Samanburður á þvermáli. Hlutföll mynda hjálpa á stigum 1–2; á stigi 3 eru myndir jafn stórar og tölurnar ráða.
- **Hvað veit ég um pláneturnar?** 36 fjölvalsspurningar úr plánetubókinni, 12 á hverju stigi. Tíu spurningar eru valdar af handahófi í lotu, án endurtekningar innan lotu. Stig 1–2 nota grunnupplýsingar en stig 3 líka Nánar textana. 2/3/4 svarmöguleikar eftir stigi, jöfn dreifing á staðsetningu réttra svara, vísbendingar, útskýringar og svarlykill lotunnar í lokin.
- **Dagur og nótt:** snúa líkani með sleða í undirbúningi og finna hvort merktur staður á miðbaug er í birtu eða skugga í æfingunni.

Hvert verkefni hefur útskýringu → sýnidæmi → sjálfstæða æfingu. Engin tímamörk. Röng svör gefa tækifæri til að reyna aftur. Stærðir og fjarlægðir eru einfaldaðar nema sérstaklega sé tekið fram að útlínur stærðarhringja sýni rétt innbyrðis hlutföll þvermáls. Geimmyndir geta verið samsettar eða með auknum litaskilum. Stjörnuhiminninn er skrautbakgrunnur og blikkar ekki.

## Erfiðleikastig og árangur

| Atriði | 1. Fyrstu skref | 2. Á geimferð | 3. Geimsérfræðingur |
| --- | --- | --- | --- |
| Röðun frá sólu | Fyrstu 4 plánetur | Fyrstu 6 plánetur | Allar 8 plánetur |
| Plánetugreining / geimspæjari | 2 valkostir | 3 valkostir | 4 valkostir |
| Vísbendingar geimspæjara | 2 í upphafi | 1 í upphafi | 1 í upphafi |
| Flokkun | Berg / risi | Berg / gasrisi / ísrisi | Berg / gasrisi / ísrisi |
| Stærð | Skýr stærðarmunur á myndum | Myndir og þvermál | Þvermál, myndir jafn stórar |
| Dagur og nótt | 2 svör | 2 svör | 2 svör |
| Hvað veit ég um pláneturnar? | 10 spurningar, 2 svör | 10 spurningar, 3 svör | 10 spurningar, 4 svör; Nánar efni |

Ein stjarna fæst fyrir að ljúka lotu, tvær fyrir ≥60% rétt í fyrstu tilraun án vísbendingar og þrjár fyrir allt rétt í fyrstu tilraun án vísbendingar. Röðun telur hvert sæti. Sæti sem vísbending leiddi í ljós telur ekki sem rétt án hjálpar. Besta stjörnugjöf hvers verkefnis á hverju stigi ræður heildinni (hámark 63).

Kennarasvæði sýnir síðustu 30 lotur og CSV-niðurhal með öllum vistuðum lotum (að hámarki 300). CSV notar UTF-8 BOM og semíkommu fyrir töflureikna. Niðurstöður eru sameiginlegar fyrir vafrann á tækinu; engin nemendanöfn eru geymd. Kennarasvæði er opið án lykilorðs. Sækið og hreinsið niðurstöður þegar skipt er um nemanda.

## Keyra í tölvu

Frá möppu verkefnisins:

```sh
python3 -m http.server 8000
```

Opna `http://localhost:8000`. Einnig má nota hvaða venjulega vefþjón sem er. Ekki opna `index.html` beint með `file://`, því vafrinn þarf að geta hlaðið ES-modules.

Engin `npm install` er nauðsynleg. Node 20 eða nýrra þarf aðeins fyrir prófin:

```sh
npm test
```

GitHub Actions keyrir sömu gagnapróf og JavaScript-setningafræðiskoðun við push og pull request.

### Vafrapróf

Valfrjáls heildarpróf í Chromium:

```sh
npm install --no-save playwright
npx playwright install chromium
node tests/browser.mjs
```

Þau keyra allar æfingar á öllum stigum, röng svör og vísbendingar, röðun með hnöppum og lyklaborði, skjástærðir 360/768/1440 px, stærra letur, plánetubók, CSV, vistun, hreinsun niðurstaðna og notkun án nets. Prófin ræsa eigin tímabundinn vefþjón og prófa undirslóð eins og á GitHub Pages.

## Birta með GitHub Pages

Kóðinn er tilbúinn til hýsingar beint úr rót `main`:

1. Opna **Settings → Pages** í repository.
2. Velja **Deploy from a branch**.
3. Velja **main** og **/(root)** og vista.
4. Bíða þar til Pages staðfestir birtingu.

Væntanlegt vistfang eftir virkjun er `https://ingimar90.github.io/stjornufraedi/`. Að setja kóðann í repository eitt og sér virkjar ekki Pages. Allar eigin skrár nota hlutfallslegar slóðir og virka undir `/stjornufraedi/`.

## Aðgengi og notkun án nets

- Stórir hnappar, skýr fókusrönd, sýnileg textaendurgjöf og ekkert niðurtal.
- AA-hnappur stækkar letur. Fullskjár þar sem vafri styður það.
- Tab til að fara milli hnappa; Enter eða bilslá til að velja. Drag og slepp er aldrei nauðsynlegt.
- Upplestur notar Web Speech API og aðeins íslenska rödd þegar hún er tiltæk á tækinu. Ef rödd vantar kemur skýr tilkynning; forritið skiptir ekki sjálfkrafa yfir í annað tungumál. Upplestur á Chromebook fer eftir röddum sem eru uppsettar.
- Eftir fyrstu heimsókn á HTTPS eða localhost reynir service worker að vista kjarnaskrár. Heimsókn án nets þarf að koma eftir að vistun tókst. Ytri NASA-hlekkir þurfa net og raddir kunna að þurfa net.
- Við breytingar á kjarnaskrám skal uppfæra `CACHE`-útgáfu í `sw.js`. Nýr service worker tekur við þegar fyrri gluggum er lokað. Nýja útgáfan sækir sitt eigið safn kjarnaskráa.
- Vistun notar `localStorage`. Í einkaglugga, við eyðingu vafragagna eða ef vistun er bönnuð geta niðurstöður glatast. Forritið birtir skilaboð ef vistun mistekst.

## Heimildir

NASA Science: [Merkúríus](https://science.nasa.gov/mercury/facts/), [Venus](https://science.nasa.gov/venus/venus-facts/), [Jörðin](https://science.nasa.gov/earth/facts/), [Mars](https://science.nasa.gov/mars/facts/), [Júpíter](https://science.nasa.gov/jupiter/jupiter-facts/), [Satúrnus](https://science.nasa.gov/saturn/facts/), [Úranus](https://science.nasa.gov/uranus/facts/) og [Neptúnus](https://science.nasa.gov/neptune/neptune-facts/). Grunnupplýsingar yfirfarnar við gerð fyrstu útgáfu. Þvermál og umferðartímar eru námundaðir til kennslu.
