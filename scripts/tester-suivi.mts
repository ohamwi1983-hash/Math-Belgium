// Tests de la détection d'un exercice terminé (`observerProgression`, `src/lib/suiviEssais.ts`) et du
// verdict d'un essai, sans navigateur : `node --experimental-strip-types scripts/tester-suivi.mts`.
import assert from 'node:assert/strict'
import { observerProgression, verdict } from '../src/lib/suiviEssais.ts'

let n = 0
function test(nom: string, f: () => void) {
  f()
  console.log(`ok ${++n} — ${nom}`)
}
function suivre() {
  const notes: string[] = []
  return { o: observerProgression((e) => notes.push(e)), notes }
}

test('verdict : raté dès un écran révélé, sinon avec aide, sinon réussi', () => {
  assert.equal(verdict('oor'), 'rate')
  assert.equal(verdict('oao'), 'aide')
  assert.equal(verdict('ooo'), 'reussi')
})

test('dernier écran gardé « en cours » : noté au verdict, une seule fois', () => {
  const { o, notes } = suivre()
  o.segments(['courante', 'a-venir', 'a-venir'])
  o.segments(['revele', 'courante', 'a-venir'])
  o.verdict(false) // écran 2 clos, pas le dernier : rien
  o.segments(['revele', 'aide', 'courante'])
  o.verdict(true)
  o.verdict(true)
  assert.deepEqual(notes, ['rar'])
  // Nouvel exercice
  o.segments(['courante', 'a-venir'])
  o.segments(['correcte', 'courante'])
  o.aide()
  o.verdict(false)
  assert.deepEqual(notes, ['rar', 'oa'])
})

test('générateur qui clôt tous les segments : noté, puis pas une seconde fois au verdict', () => {
  const { o, notes } = suivre()
  o.segments(['correcte', 'courante'])
  o.segments(['correcte', 'correcte'])
  o.verdict(false)
  o.segments(null)
  o.segments(['correcte', 'correcte'])
  assert.deepEqual(notes, ['oo'])
})

test('« sans objet » ignoré ; l’aide d’un écran précédent ne déborde pas sur le suivant', () => {
  const { o, notes } = suivre()
  o.segments(['courante', 'a-venir', 'a-venir'])
  o.aide()
  o.segments(['correcte', 'courante', 'a-venir'])
  o.segments(['correcte', 'sans-objet', 'courante'])
  o.verdict(false)
  assert.deepEqual(notes, ['oo'])
})

test('un seul écran : chaque verdict compte (les puces ne changent pas d’un exercice à l’autre)', () => {
  const { o, notes } = suivre()
  o.segments(['courante'])
  o.verdict(true)
  o.verdict(false)
  assert.deepEqual(notes, ['r', 'o'])
})

test('sans puces publiées : chaque verdict est un exercice d’un écran', () => {
  const { o, notes } = suivre()
  o.aide()
  o.verdict(false)
  o.verdict(true)
  assert.deepEqual(notes, ['a', 'r'])
})

console.log(`\n${n} tests réussis.`)
