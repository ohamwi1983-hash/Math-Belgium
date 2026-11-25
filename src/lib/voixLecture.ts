/**
 * Point d'accroche « Écouter » (côté élève, sans compte) — module MINIMAL, que le lot « lecture à voix
 * haute » (planche 08 : lecteur en bas d'écran, phrase surlignée, vitesse, choix de la voix) reprendra.
 *
 * Contrat : tout bouton « Écouter » (loupe d'une formule, « Écouter l'étape » d'un exemple résolu,
 * corrigé des générateurs…) appelle `dire(texte)`, qui émet l'événement
 * `window.dispatchEvent(new CustomEvent('lecture:dire', { detail: { texte } }))`. Un code qui ne veut pas
 * importer ce module peut émettre l'événement lui-même : le résultat est le même.
 *
 * Par défaut, ce module écoute l'événement et le fait lire par la synthèse vocale DU NAVIGATEUR
 * (`speechSynthesis`, voix `fr-BE`, sinon `fr-FR`, sinon toute voix `fr-*`) : rien à installer, rien
 * n'est envoyé. Un lecteur plus complet peut prendre la main en appelant `preventDefault()` sur
 * l'événement (écouteur posé en phase de capture : `addEventListener('lecture:dire', f, true)`).
 *
 * `texte` est du français déjà prêt à dire : pour une formule, la lecture en mots de
 * `lib/lectureFormules.ts::lireFormule` ; pour un morceau de page, `texteParleDe(element)` ci-dessous.
 */

export interface DetailDire {
  texte: string
}

/** Synthèse vocale disponible dans ce navigateur (sinon, ne pas montrer les boutons « Écouter »). */
export function voixDisponible(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
}

/** Demande la lecture à voix haute de `texte` (événement `lecture:dire`). */
export function dire(texte: string) {
  if (typeof window === 'undefined' || !texte.trim()) return
  window.dispatchEvent(new CustomEvent<DetailDire>('lecture:dire', { detail: { texte }, cancelable: true }))
}

/** Arrête la lecture en cours (événement `lecture:taire`). */
export function seTaire() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('lecture:taire', { cancelable: true }))
}

/** Texte à dire pour un morceau de page : le texte visible, chaque formule remplacée par sa lecture en
 * mots (`aria-label` des formules, posé par `Math.tsx` / `KatexAccessible.tsx` / `katexAccessible.ts`),
 * sans ce qui est caché aux lecteurs d'écran (`aria-hidden`, `hidden`) ni les boutons. */
export function texteParleDe(racine: Element): string {
  let t = ''
  const marcher = (n: Node) => {
    if (n.nodeType === Node.TEXT_NODE) {
      t += n.textContent ?? ''
      return
    }
    if (!(n instanceof Element)) return
    if (n.getAttribute('aria-hidden') === 'true' || n.hasAttribute('hidden') || n.matches('button, script, style')) return
    const lu = n.getAttribute('role') === 'img' ? n.getAttribute('aria-label') : null
    if (lu) {
      t += ` ${lu} `
      return
    }
    // Une étiquette de bloc (« isoler r ») se lit comme une phrase à part.
    const bloc = /^(P|DIV|LI|H\d|SPAN)$/.test(n.tagName) && n.classList.contains('pas-tag')
    n.childNodes.forEach(marcher)
    if (bloc || /^(P|DIV|LI|H\d)$/.test(n.tagName)) t += '. '
  }
  marcher(racine)
  return t
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/([.:;!?])(\s*\.)+/g, '$1')
    .replace(/^[\s.]+|[\s.]+$/g, '')
}

// ---------- lecteur par défaut (synthèse vocale du navigateur) ----------

function choisirVoix(): SpeechSynthesisVoice | undefined {
  const voix = window.speechSynthesis.getVoices().filter((v) => /^fr\b|^fr[-_]/i.test(v.lang))
  return voix.find((v) => /fr[-_]BE/i.test(v.lang)) ?? voix.find((v) => /fr[-_]FR/i.test(v.lang)) ?? voix[0]
}

if (typeof window !== 'undefined') {
  window.addEventListener('lecture:dire', (e) => {
    const ev = e as CustomEvent<DetailDire>
    if (ev.defaultPrevented || !voixDisponible()) return
    try {
      const s = window.speechSynthesis
      s.cancel()
      const u = new SpeechSynthesisUtterance(ev.detail.texte)
      const v = choisirVoix()
      u.lang = v?.lang ?? 'fr-BE'
      if (v) u.voice = v
      s.speak(u)
    } catch {
      // synthèse indisponible (voix absente hors ligne…) : le texte reste lisible à l'écran
    }
  })
  window.addEventListener('lecture:taire', (e) => {
    if (e.defaultPrevented || !voixDisponible()) return
    try {
      window.speechSynthesis.cancel()
    } catch {
      // rien à arrêter
    }
  })
}
