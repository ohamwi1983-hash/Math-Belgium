// Tests de la logique PURE du plan de révision (`src/lib/planRevision.ts`), sans navigateur ni
// dépendance : `node --experimental-strip-types scripts/tester-plan-revision.mts` (Node ≥ 22.6).
// Couvre : dates (mois, années, changement d'heure), plan sur 7 jours, jour libre, jours ratés (report
// sans accumulation, jamais plus de 10 min de plus), peu de temps, beaucoup d'étapes, interro demain,
// interro aujourd'hui / passée, cartes qui reviennent (lendemain, 3 jours, une semaine).
import assert from 'node:assert/strict'
import {
  ajouterJours,
  construirePlan,
  ecartJours,
  estJour,
  jourSemaine,
  cochesAutomatiques,
  grouperTaches,
  MAX_TACHES_JOUR,
  planDeBase,
  SURPLUS_MAX,
  type EtapePlan,
  type ReglagesPlan,
} from '../src/lib/planRevision.ts'

let n = 0
function test(nom: string, f: () => void) {
  f()
  n++
  console.log(`ok ${n} — ${nom}`)
}

const etape = (i: number, extra: Partial<EtapePlan> = {}): EtapePlan => ({
  cle: `suites#s${i}`,
  numero: i,
  titre: `Étape ${i}`,
  generateurs: [{ id: `5gen${13 + i}`, titre: `Générateur ${i}` }],
  cartes: 4,
  cartesARevoir: 0,
  aRetravailler: false,
  ...extra,
})

const reglages = (extra: Partial<ReglagesPlan> = {}): ReglagesPlan => ({
  debut: '2026-11-25',
  interro: '2026-12-02',
  minutesParJour: 20,
  jourLibre: null,
  etapes: [etape(1), etape(2)],
  ...extra,
})

const minutes = (j: { taches: { minutes: number }[] }) => j.taches.reduce((s, t) => s + t.minutes, 0)

test('dates : fin de mois, fin d’année, année bissextile, changement d’heure', () => {
  assert.equal(ajouterJours('2026-11-30', 1), '2026-12-01')
  assert.equal(ajouterJours('2026-12-31', 1), '2027-01-01')
  assert.equal(ajouterJours('2028-02-28', 1), '2028-02-29')
  assert.equal(ajouterJours('2026-03-28', 2), '2026-03-30') // passage à l'heure d'été (29 mars)
  assert.equal(ajouterJours('2026-10-24', 2), '2026-10-26') // passage à l'heure d'hiver (25 oct.)
  assert.equal(ecartJours('2026-11-25', '2026-12-03'), 8)
  assert.equal(jourSemaine('2026-11-25'), 3) // mercredi
  assert.ok(estJour('2026-02-28'))
  assert.ok(!estJour('2026-02-30'))
  assert.ok(!estJour('25/11/2026'))
})

test('plan sur 7 jours : une étape par jour, mélange, évaluation blanche l’avant-veille, veille = cartes', () => {
  const base = planDeBase(reglages())
  assert.equal(base.length, 8) // 7 jours + l'interro
  assert.deepEqual(
    base.map((j) => j.role),
    ['apprendre', 'apprendre', 'melange', 'melange', 'melange', 'blanche', 'veille', 'interro'],
  )
  assert.equal(base[5].jour, '2026-11-30') // avant-veille du mercredi 2 décembre
  assert.ok(base[5].taches.some((t) => t.type === 'blanche' && t.minutes === 20))
  assert.deepEqual(base[6].taches.map((t) => t.type), ['cartesRevoir'])
  assert.equal(base[7].taches.length, 0)
  // Aucun jour au-delà du temps choisi + 10 min (la blanche fait 20 min à elle seule).
  for (const j of base) if (j.role !== 'blanche') assert.ok(minutes(j) <= 20 + SURPLUS_MAX, `${j.jour} : ${minutes(j)} min`)
})

test('cartes qui reviennent : le lendemain, 3 jours, une semaine (avant la veille)', () => {
  const base = planDeBase(reglages({ interro: '2026-12-10' }))
  const revues = base.flatMap((j) => j.taches.filter((t) => t.type === 'cartes' && t.etape === 'suites#s1').map((t) => [j.jour, t.revue]))
  assert.deepEqual(revues, [
    ['2026-11-25', 1],
    ['2026-11-26', 2],
    ['2026-11-28', 3],
    ['2026-12-02', 4],
  ])
})

test('jour libre : aucun travail ce jour-là, revue décalée au jour suivant', () => {
  const base = planDeBase(reglages({ jourLibre: 6, interro: '2026-12-10' })) // samedi libre
  const samedi = base.find((j) => j.jour === '2026-11-28')!
  assert.equal(samedi.role, 'libre')
  assert.equal(samedi.taches.length, 0)
  const revue3 = base.find((j) => j.taches.some((t) => t.etape === 'suites#s1' && t.revue === 3))!
  assert.equal(revue3.jour, '2026-11-29') // dimanche, au lieu du samedi libre
})

test('jour raté : report sur les jours suivants, jamais plus de 10 min de plus, rien ne s’accumule', () => {
  const r = reglages()
  const base = planDeBase(r)
  // Mercredi 25 et jeudi 26 : rien n'est coché. On est vendredi 27.
  const plan = construirePlan(r, '2026-11-27', [])
  const mer = plan.jours.find((j) => j.jour === '2026-11-25')!
  assert.equal(mer.statut, 'rate')
  assert.ok(mer.reports.length > 0)
  for (const j of plan.jours) {
    if (j.jour < '2026-11-27' || j.role === 'interro') continue
    const avant = minutes(base.find((b) => b.jour === j.jour)!)
    assert.ok(minutes(j) <= avant + SURPLUS_MAX, `${j.jour} : ${minutes(j)} min au lieu de ${avant} (+${SURPLUS_MAX} au plus)`)
  }
  // Les exercices reportés le sont un par un.
  assert.ok(plan.jours.some((j) => j.taches.some((t) => t.reporteeDe === '2026-11-25' && t.type === 'exercices' && t.nombre === 1)))
  // La veille ne reçoit pas d'exercice reporté.
  const veille = plan.jours.find((j) => j.role === 'veille')!
  assert.ok(veille.taches.every((t) => t.type === 'cartesRevoir' || t.type === 'cartes'))
})

test('jour raté puis rattrapé : la tâche reportée cochée ailleurs compte pour le jour d’origine', () => {
  const r = reglages()
  const p1 = construirePlan(r, '2026-11-26', [])
  const reportee = p1.jours.find((j) => j.jour === '2026-11-26')!.taches.find((t) => t.reporteeDe === '2026-11-25')!
  assert.ok(reportee)
  const p2 = construirePlan(r, '2026-11-27', [reportee.id])
  const mer = p2.jours.find((j) => j.jour === '2026-11-25')!
  assert.ok(mer.statut === 'partiel' || mer.statut === 'fait')
  assert.ok(!p2.jours.some((j) => j.taches.some((t) => t.id === reportee.id && !t.faite)))
})

test('jour fait : statut « fait », aucun report', () => {
  const r = reglages()
  const base = planDeBase(r)
  const ids = base[0].taches.map((t) => t.id)
  const plan = construirePlan(r, '2026-11-26', ids)
  assert.equal(plan.jours[0].statut, 'fait')
  assert.equal(plan.jours[0].reports.length, 0)
  assert.ok(plan.jours[0].taches.every((t) => t.faite))
})

test('cartes revues un jour suivant : les cartes manquées de la veille comptent comme vues', () => {
  const r = reglages()
  const base = planDeBase(r)
  const cartesJ2 = base[1].taches.find((t) => t.type === 'cartes' && t.etape === 'suites#s1')!
  assert.equal(cartesJ2.revue, 2)
  const plan = construirePlan(r, '2026-11-27', [cartesJ2.id])
  const cartesJ1 = plan.jours[0].taches.find((t) => t.type === 'cartes' && t.etape === 'suites#s1')!
  assert.ok(cartesJ1.faite)
})

test('peu de temps (10 min) : relecture et exercices réduits, jamais au-delà de 20 min', () => {
  const base = planDeBase(reglages({ minutesParJour: 10, etapes: [etape(1, { cartes: 4, aRetravailler: true }), etape(2)] }))
  for (const j of base) if (j.role !== 'blanche') assert.ok(minutes(j) <= 10 + SURPLUS_MAX, `${j.jour} : ${minutes(j)} min`)
  assert.equal(base[0].taches.find((t) => t.type === 'exercices')!.nombre, 1)
})

test('beaucoup d’étapes (12 étapes, 5 jours) : toutes vues, par paquets, une fois chacune', () => {
  const etapes = Array.from({ length: 12 }, (_, i) => etape(i + 1))
  const base = planDeBase(reglages({ etapes, interro: '2026-11-30' }))
  const apprises = base.filter((j) => j.role === 'apprendre').flatMap((j) => j.etapes)
  assert.deepEqual(apprises, etapes.map((e) => e.cle))
  for (const j of base) if (j.role !== 'blanche') assert.ok(minutes(j) <= 20 + SURPLUS_MAX, `${j.jour} : ${minutes(j)} min`)
})

test('interro demain : un seul jour, l’essentiel (cartes « À revoir » + un exercice par étape)', () => {
  const etapes = [etape(1, { cartesARevoir: 2 }), etape(2, { aRetravailler: true }), etape(3)]
  const plan = construirePlan(reglages({ debut: '2026-12-01', interro: '2026-12-02', etapes }), '2026-12-01', [])
  assert.deepEqual(plan.jours.map((j) => j.role), ['essentiel', 'interro'])
  const t = plan.jours[0].taches
  assert.equal(t[0].type, 'cartesRevoir')
  assert.equal(t[0].nombre, 2)
  assert.equal(t[1].etape, 'suites#s2') // l'étape à retravailler d'abord
  assert.ok(t.filter((x) => x.type === 'exercices').every((x) => x.nombre === 1))
  assert.ok(minutes(plan.jours[0]) <= 20 + SURPLUS_MAX)
})

test('interro demain et jour libre demandé : le seul jour reste un jour de travail', () => {
  const base = planDeBase(reglages({ debut: '2026-11-28', interro: '2026-11-29', jourLibre: 6 }))
  assert.equal(base[0].role, 'essentiel')
})

test('interro aujourd’hui ou passée : plan terminé, aucun report', () => {
  const r = reglages()
  const p = construirePlan(r, '2026-12-02', [])
  assert.ok(p.termine)
  assert.equal(p.jours.at(-1)!.statut, 'aujourdhui')
  assert.ok(p.jours.every((j) => j.taches.every((t) => !t.reporteeDe)))
  const apres = construirePlan(r, '2026-12-05', [])
  assert.ok(apres.termine)
  assert.equal(apres.jours.at(-1)!.statut, 'passe')
  const vide = planDeBase(reglages({ debut: '2026-12-02' }))
  assert.deepEqual(vide.map((j) => j.role), ['interro'])
})

test('plusieurs jours ratés à la suite, peu de jours restants : on garde l’essentiel', () => {
  const etapes = [etape(1, { cartesARevoir: 1 }), etape(2), etape(3)]
  const r = reglages({ etapes, minutesParJour: 10 })
  const plan = construirePlan(r, '2026-11-30', []) // 5 jours ratés sur 7
  assert.ok(plan.essentielSeulement)
  const base = planDeBase(r)
  for (const j of plan.jours) {
    if (j.jour < '2026-11-30' || j.role === 'interro') continue
    const b = base.find((x) => x.jour === j.jour)!
    assert.ok(minutes(j) <= minutes(b) + SURPLUS_MAX, `${j.jour} : ${minutes(j)} min`)
  }
  // L'essentiel (cartes) a trouvé une place.
  const reports = plan.jours.flatMap((j) => j.reports)
  assert.ok(reports.some((x) => (x.tache.type === 'cartes' || x.tache.type === 'cartesRevoir') && x.vers !== null))
})

test('étape sans générateur : un exemple résolu à refaire à la place des exercices', () => {
  const base = planDeBase(reglages({ etapes: [etape(1, { generateurs: [], cartes: 0 })] }))
  assert.ok(base[0].taches.some((t) => t.type === 'exemple'))
  assert.ok(!base[0].taches.some((t) => t.type === 'cartes'))
})

test('identifiants stables et uniques', () => {
  const base = planDeBase(reglages({ interro: '2026-12-12', etapes: [etape(1), etape(2), etape(3)] }))
  const ids = base.flatMap((j) => j.taches.map((t) => t.id))
  assert.equal(new Set(ids).size, ids.length)
  assert.deepEqual(planDeBase(reglages({ interro: '2026-12-12', etapes: [etape(1), etape(2), etape(3)] })).flatMap((j) => j.taches.map((t) => t.id)), ids)
})


test('trois tâches concrètes au plus par jour, aucune tâche perdue', () => {
  // Beaucoup d'étapes, peu de jours : plusieurs étapes et générateurs le même jour.
  const etapes = [1, 2, 3, 4, 5, 6].map((i) => etape(i))
  const plan = construirePlan(reglages({ etapes, interro: '2026-11-30', minutesParJour: 30 }), '2026-11-25', [])
  for (const j of plan.jours) {
    const g = grouperTaches(j.taches)
    assert.ok(g.length <= MAX_TACHES_JOUR, `${j.jour} : ${g.length} tâches`)
    assert.deepEqual(g.flatMap((x) => x.ids).sort(), j.taches.map((t) => t.id).sort(), 'aucune tâche perdue')
    assert.equal(g.reduce((s, x) => s + x.minutes, 0), minutes(j))
  }
  // Un jour d'apprentissage d'une étape : relire, exercices, cartes — dans cet ordre.
  const simple = construirePlan(reglages(), '2026-11-25', [])
  const g = grouperTaches(simple.jours[0].taches)
  assert.deepEqual(g.map((x) => x.type), ['relire', 'exercices', 'cartes'])
  assert.equal(g[1].exercices[0].generateur?.id, '5gen14')
})

test('tâche groupée faite quand toutes ses tâches le sont', () => {
  const r = reglages()
  const p0 = construirePlan(r, '2026-11-25', [])
  const g0 = grouperTaches(p0.jours[0].taches)
  const ids = g0.find((x) => x.type === 'exercices')!.ids
  const p1 = construirePlan(r, '2026-11-25', ids)
  const g1 = grouperTaches(p1.jours[0].taches)
  assert.ok(g1.find((x) => x.type === 'exercices')!.faite)
  assert.ok(!g1.find((x) => x.type === 'relire')!.faite)
})

test('cases cochées d’office d’après les exercices terminés ce jour-là', () => {
  const r = reglages({ etapes: [etape(1, { aRetravailler: true }), etape(2)] })
  const p = construirePlan(r, '2026-11-25', [])
  const ex = p.jours[0].taches.find((t) => t.type === 'exercices')!
  assert.equal(ex.nombre, 3)
  // 2 exercices de 5gen14 faits aujourd'hui : 2 sur 3 cochés ; un autre générateur ne compte pas.
  const deux = cochesAutomatiques(p, '2026-11-25', [], (j, g) => (j === '2026-11-25' && g === '5gen14' ? 2 : g === '5gen99' ? 9 : 0))
  assert.deepEqual(deux, [`${ex.id}#0`, `${ex.id}#1`])
  // 3 faits : la tâche entière.
  const trois = cochesAutomatiques(p, '2026-11-25', [], (_j, g) => (g === '5gen14' ? 3 : 0))
  assert.deepEqual(trois, [ex.id])
  // Déjà cochée : rien de plus.
  assert.deepEqual(cochesAutomatiques(p, '2026-11-25', [ex.id], () => 5), [])
  // Exercices d'hier (jour pas coché) : ils comptent pour hier.
  const p2 = construirePlan(r, '2026-11-26', [])
  const hier = cochesAutomatiques(p2, '2026-11-26', [], (j, g) => (j === '2026-11-25' && g === '5gen14' ? 3 : 0))
  assert.ok(hier.includes(ex.id))
})

console.log(`\n${n} tests réussis.`)
