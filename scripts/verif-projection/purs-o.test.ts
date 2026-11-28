// Tests des parties PURES du chantier O (NON importé par l'application) :
//   npx esbuild scripts/verif-projection/purs-o.test.ts --bundle --platform=node --format=esm --loader:.css=empty --outfile=<tmp>/purs.mjs && node <tmp>/purs.mjs [video.webm]
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { chapitresYouTube, descriptionVideo, horodatage, microParDefaut, nomFichierVideo, teteAvecDuree, titreVideo, jugerNiveau } from '../../src/lib/projection/enregistrement'
import { beneficiaires, calculerScores, equipesAJour, equipesAuHasard, lireListe, listeDepuisTexte, podium, pointsPositifs, proposer, reglagesDefaut, texteListe, tirerEleve } from '../../src/lib/participation'
import { clePageExercice, decouperCorrige, pageDuPas, pageExerciceDepuis, validerExercices } from '../../src/lib/projection/exerciceTableau'

let n = 0
function test(nom: string, f: () => void) {
  f()
  console.log(`ok ${++n} — ${nom}`)
}

// ---------- P5 ----------
test('chapitres YouTube : 00:00, au moins 3, chacun ≥ 10 s ; sinon aucun', () => {
  const c = chapitresYouTube([{ t: 3, titre: 'A' }, { t: 20, titre: 'B' }, { t: 40, titre: 'C' }], 70)
  assert.deepEqual(c.map((x) => [x.t, x.titre]), [[0, 'A'], [20, 'B'], [40, 'C']])
  assert.deepEqual(chapitresYouTube([{ t: 0, titre: 'A' }, { t: 20, titre: 'B' }], 60), [])
  // passage de 4 s fondu dans le précédent
  const d = chapitresYouTube([{ t: 0, titre: 'A' }, { t: 20, titre: 'B' }, { t: 24, titre: 'C' }, { t: 40, titre: 'D' }], 80)
  assert.deepEqual(d.map((x) => x.titre), ['A', 'C', 'D'])
  // dernier chapitre trop court : retiré, il en reste moins de 3 → aucun
  assert.deepEqual(chapitresYouTube([{ t: 0, titre: 'A' }, { t: 20, titre: 'B' }, { t: 55, titre: 'C' }], 60), [])
  // retours sur une étape : fusion des voisins identiques
  const e = chapitresYouTube([{ t: 0, titre: 'A' }, { t: 15, titre: 'B' }, { t: 30, titre: 'B' }, { t: 45, titre: 'A' }], 70)
  assert.deepEqual(e.map((x) => x.titre), ['A', 'B', 'A'])
})
test('horodatage, titre, description, nom de fichier ASCII', () => {
  assert.equal(horodatage(134), '02:14')
  assert.equal(horodatage(3734), '1:02:14')
  assert.equal(titreVideo('Les coniques', ['Excentricité et réduction', 'Foyers et directrices']), 'Les coniques — excentricité et réduction · foyers et directrices')
  const desc = descriptionVideo('6e (6 h)', [{ t: 0, titre: 'A' }, { t: 20, titre: 'B' }, { t: 40, titre: 'C' }], 'math-belgium.vercel.app/6e-6h/coniques')
  assert.match(desc, /^Cours de mathématiques, 6e \(6 h\), Fédération Wallonie-Bruxelles\.\n\n00:00 A\n00:20 B\n00:40 C\n\nLe cours complet : /)
  assert.equal(nomFichierVideo('Les coniques — été', new Date(2026, 10, 27)), 'Les coniques - ete - 2026-11-27.webm')
})
test('micro proposé : dernier choisi, sinon externe, sinon le premier réel', () => {
  const m = [{ deviceId: 'default', label: 'Par défaut - Micro intégré' }, { deviceId: 'a', label: 'Micro intégré' }, { deviceId: 'b', label: 'Micro USB Rode' }]
  assert.equal(microParDefaut(m, null), 'b')
  assert.equal(microParDefaut(m, 'a'), 'a')
  assert.equal(microParDefaut(m, 'x'), 'b')
  assert.equal(microParDefaut(m.slice(0, 2), null), 'a')
})
test('niveau sonore jugé', () => {
  assert.equal(jugerNiveau(0.0001, 0.001), 'silence')
  assert.equal(jugerNiveau(0.01, 0.1), 'faible')
  assert.equal(jugerNiveau(0.1, 0.5), 'bon')
  assert.equal(jugerNiveau(0.3, 0.99), 'sature')
})
const video = process.argv[2]
if (video) {
  test('WebM : durée ajoutée dans Info (relue), sans toucher au reste', () => {
    const o = new Uint8Array(readFileSync(video))
    const tete = o.subarray(0, 65536)
    const deja = teteAvecDuree(tete, 1)
    if (deja === null) {
      // Le fichier enregistré par l'application porte déjà sa durée : on vérifie qu'elle est là.
      const hex = Buffer.from(tete).toString('hex')
      assert.ok(hex.includes('4489'), 'Duration présente')
      return
    }
    const t = teteAvecDuree(tete, 42_000)!
    assert.equal(t.length, tete.length + 11 + 7)
    const hex = Buffer.from(t).toString('hex')
    const i = hex.indexOf('448988')
    assert.ok(i > 0)
    assert.equal(Buffer.from(t).readDoubleBE(i / 2 + 3), 42_000)
    assert.equal(teteAvecDuree(t, 1), null)
  })
}

// ---------- P6 ----------
test('liste collée : lignes, virgules, numéros de tête, doublons numérotés', () => {
  assert.deepEqual(lireListe('1. Amina\n2) Lucas ; Yanis,\tChloé\n\nAmina'), ['Amina', 'Lucas', 'Yanis', 'Chloé', 'Amina (2)'])
  assert.deepEqual(listeDepuisTexte('numéros : 24'), { mode: 'numeros', noms: [], nombre: 24 })
  assert.equal(texteListe({ mode: 'noms', noms: ['A', 'B'], nombre: 0 }), 'A\nB')
})
const ELEVES = 'Amina, Lucas, Yanis, Chloé, Noah, Inès, Mehdi, Léa, Adam, Sofia, Louis, Nour, Elif, Mathis, Zoé, Rayan, Emma, Ilyas, Julie, Kenza, Arthur, Maëlle, Samuel, Aya'.split(', ')
test('équipes : 5 d’office pour 24, tailles égales à un près, mises à jour avec la liste', () => {
  const r = reglagesDefaut(ELEVES, new Date(2026, 10, 28))
  assert.equal(r.affichage, 'equipes')
  assert.equal(r.equipes.length, 5)
  assert.equal(r.penalite, false)
  assert.equal(r.idee, true)
  const tailles = r.equipes.map((e) => e.membres.length).sort()
  assert.deepEqual(tailles, [4, 5, 5, 5, 5])
  const a = equipesAJour(r.equipes, [...ELEVES.filter((e) => e !== 'Amina'), 'Zacharie'])
  assert.equal(a.flatMap((e) => e.membres).length, 24)
  assert.ok(a.flatMap((e) => e.membres).includes('Zacharie') && !a.flatMap((e) => e.membres).includes('Amina'))
  assert.equal(equipesAuHasard(ELEVES, 6).length, 6)
})
test('scores : pénalité jamais dans le projeté, équipe entière, aujourd’hui, participé', () => {
  const r = { equipes: [{ nom: 'X', couleur: '', membres: ['Amina', 'Lucas'] }, { nom: 'Y', couleur: '', membres: ['Yanis'] }] }
  const hier = new Date(2026, 10, 27, 10).getTime()
  const auj = new Date(2026, 10, 28, 10).getTime()
  const pts = [
    { t: hier, e: 'Amina', v: 1 as const, genre: 'reponse' as const },
    { t: auj, e: 'Amina', v: 1 as const, genre: 'idee' as const },
    { t: auj, e: 'Lucas', v: -1 as const, genre: 'penalite' as const },
    { t: auj, e: null, eq: 1, v: 1 as const, genre: 'reponse' as const },
  ]
  const s = calculerScores(['Amina', 'Lucas', 'Yanis'], r, pts, auj)
  assert.deepEqual(s.equipes, [2, 1])
  assert.equal(s.eleves.get('Lucas'), -1)
  assert.equal(s.totalAujourdhui, 2)
  assert.equal(s.totalPeriode, 3)
  assert.deepEqual([...s.participe], ['Amina'])
})
test('podium : 3 marches au plus, ex aequo ensemble, jamais un score nul', () => {
  const m = podium(new Map([['Inès', 9], ['Yanis', 8], ['Chloé', 7], ['Adam', 7], ['Léa', 2], ['Noah', 0]]))
  assert.deepEqual(m.map((x) => [x.rang, x.noms.join(', '), x.points]), [[1, 'Inès', 9], [2, 'Yanis', 8], [3, 'Adam, Chloé', 7]])
  assert.deepEqual(podium(new Map([['A', 0]])), [])
  assert.deepEqual(pointsPositifs([{ t: 0, e: 'A', v: -1, genre: 'penalite' }]), new Map())
})
test('bénéficiaires : équipes des 3 premiers rangs', () => {
  const r = { ...reglagesDefaut(['A', 'B', 'C', 'D'], new Date()), equipes: [{ nom: 'X', couleur: '', membres: ['A'] }, { nom: 'Y', couleur: '', membres: ['B'] }, { nom: 'Z', couleur: '', membres: ['C'] }, { nom: 'W', couleur: '', membres: ['D'] }] }
  const pts = ['A', 'A', 'B', 'C', 'C', 'C'].map((e) => ({ t: Date.now(), e, v: 1 as const, genre: 'reponse' as const }))
  assert.deepEqual(beneficiaires(r, ['A', 'B', 'C', 'D'], pts, Date.now()).equipes, [0, 1, 2])
})
test('« Interroger quelqu’un » : ceux qui n’ont pas participé ont 3 fois plus de chances', () => {
  const eleves = ['A', 'B', 'C', 'D']
  const participe = new Set(['A', 'B'])
  let graine = 1
  const alea = () => ((graine = (graine * 16807) % 2147483647) - 1) / 2147483646
  const compte: Record<string, number> = {}
  for (let i = 0; i < 40000; i++) {
    const e = tirerEleve(eleves, participe, [], alea)!
    compte[e] = (compte[e] ?? 0) + 1
  }
  const rapport = (compte.C + compte.D) / (compte.A + compte.B)
  assert.ok(rapport > 2.8 && rapport < 3.2, `rapport ${rapport}`)
  assert.notEqual(tirerEleve(eleves, participe, ['A', 'B', 'C'], alea), 'A')
})
test('recherche au clavier : premières lettres, accents ignorés', () => {
  assert.deepEqual(proposer(ELEVES, 'ma'), ['Maëlle', 'Mathis'])
  assert.deepEqual(proposer(ELEVES, 'ine'), ['Inès'])
  assert.deepEqual(proposer(['1', '2', '12'], '1'), ['1', '12'])
})

// ---------- P1 ----------
test('pages du corrigé : découpage sans coupure, page de la ligne montrée', () => {
  const d = decouperCorrige([100, 100, 100, 100, 100], 250, 400)
  assert.deepEqual(d, [0, 2])
  assert.equal(pageDuPas(d, 0), 0)
  assert.equal(pageDuPas(d, 2), 1)
  assert.equal(pageDuPas(d, 3), 2)
  assert.deepEqual(decouperCorrige([900, 50], 300, 400), [0, 1])
  assert.equal(clePageExercice('x1'), 'x:x1')
  assert.equal(clePageExercice('x1', 2), 'x:x1:2')
})
test('pages d’exercice gardées : lecture tolérante', () => {
  assert.equal(pageExerciceDepuis({ id: 'a', gen: '6gen9', code: 'pasuncode' }), null)
  const p = pageExerciceDepuis({ id: 'a', gen: '6gen9', code: 'K7Q4MX', n: 2, pas: 3, page: 1, reponse: 1 })
  assert.deepEqual(p, { id: 'a', gen: '6gen9', code: 'K7Q4MX', n: 2, pas: 3, page: 1, reponse: true, chercher: null })
  assert.deepEqual(Object.keys(validerExercices({ 'd:1': [p, { id: 3 }], 'd:2': [] })), ['d:1'])
})
console.log(`${n} tests réussis`)
