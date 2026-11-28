/**
 * « ● Enregistrer » (P5, maquette validée du 28/11/2026) — parties PURES : chapitres horodatés pour YouTube, titre,
 * description, nom du fichier, jugement du niveau sonore, choix du micro proposé d'office. La vidéo reste sur
 * l'appareil du professeur : rien n'est envoyé à aucun serveur (le site ne publie rien lui-même).
 */

export interface ChapitreVideo {
  /** Secondes depuis le début de la vidéo (pauses retirées). */
  t: number
  titre: string
}

/** Règles de YouTube : la liste commence à 00:00, au moins 3 chapitres, chacun d'au moins 10 s. */
export const CHAPITRES_MIN = 3
export const DUREE_CHAPITRE_MIN = 10

/**
 * Chapitres d'après les étapes réellement montrées (moment où on y est arrivé) : une étape revue plus tard redevient un
 * chapitre ; deux passages consécutifs sur la même étape sont fusionnés ; un passage de moins de 10 s est fondu dans le
 * précédent (sauf le premier, qui reste à 00:00 et prend le titre du suivant s'il est trop court). Si la liste ne
 * respecte pas les règles de YouTube (moins de 3 chapitres), AUCUN chapitre (YouTube les refuserait).
 */
export function chapitresYouTube(passages: ChapitreVideo[], duree: number): ChapitreVideo[] {
  const tries = passages.filter((p) => p.t >= 0 && p.t <= duree).sort((a, b) => a.t - b.t)
  if (!tries.length) return []
  const fusion: ChapitreVideo[] = []
  for (const p of tries) {
    const dernier = fusion[fusion.length - 1]
    if (dernier && dernier.titre === p.titre) continue
    fusion.push({ ...p })
  }
  fusion[0] = { ...fusion[0], t: 0 }
  // Chapitres trop courts : fondus dans le précédent (le premier garde 00:00 et prend le titre du suivant).
  let change = true
  while (change && fusion.length > 1) {
    change = false
    for (let i = 0; i < fusion.length; i++) {
      const fin = i + 1 < fusion.length ? fusion[i + 1].t : duree
      if (fin - fusion[i].t >= DUREE_CHAPITRE_MIN) continue
      if (i === 0) {
        fusion.splice(1, 1, { ...fusion[1], t: 0 })
        fusion.shift()
      } else fusion.splice(i, 1)
      change = true
      break
    }
    // Deux voisins devenus identiques après une fusion : un seul.
    for (let i = fusion.length - 1; i > 0; i--) if (fusion[i].titre === fusion[i - 1].titre) fusion.splice(i, 1)
  }
  if (fusion.length < CHAPITRES_MIN) return []
  if (fusion.some((c, i) => (i + 1 < fusion.length ? fusion[i + 1].t : duree) - c.t < DUREE_CHAPITRE_MIN)) return []
  return fusion
}

/** « 00:00 », « 02:14 », « 1:02:14 » (format reconnu par YouTube). */
export function horodatage(s: number): string {
  const t = Math.max(0, Math.floor(s))
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const sec = t % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/** Durée lisible : « 23:41 », « 1:02:14 ». */
export function duree(s: number): string {
  const t = Math.max(0, Math.floor(s))
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const sec = String(t % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

/** Titre proposé : « Les coniques — excentricité et réduction · foyers et directrices » (titres courts des étapes montrées, 100 caractères au plus). */
export function titreVideo(chapitre: string, etapes: string[]): string {
  const uniques = [...new Set(etapes.map((e) => e.trim()).filter(Boolean))]
  if (!uniques.length) return chapitre.slice(0, 100)
  const minuscule = (e: string) => (/^[A-ZÀ-Ý][a-zà-ÿ]/.test(e) && !/^[A-Z]{2}/.test(e) ? e[0].toLocaleLowerCase('fr') + e.slice(1) : e)
  const liste = uniques.map(minuscule)
  // « · » entre les étapes : leurs titres contiennent souvent déjà « et » (« Excentricité et réduction »).
  const texte = liste.join(' · ')
  const titre = `${chapitre} — ${texte}`
  return titre.length <= 100 ? titre : `${chapitre} — ${liste[0]}${liste.length > 1 ? '…' : ''}`.slice(0, 100)
}

/** Description : niveau, puis les chapitres horodatés (s'ils respectent les règles), puis le lien vers le cours complet. */
export function descriptionVideo(niveau: string, chapitres: ChapitreVideo[], lienCours: string): string {
  const lignes = [`Cours de mathématiques, ${niveau}, Fédération Wallonie-Bruxelles.`]
  if (chapitres.length) lignes.push('', ...chapitres.map((c) => `${horodatage(c.t)} ${c.titre}`))
  lignes.push('', `Le cours complet : ${lienCours}`)
  return lignes.join('\n')
}

/** « 6e (6h) » → « 6e (6 h) ». */
export const niveauLisible = (n: string) => n.replace(/\((\d+)h\)/, '($1 h)')

/** Nom du fichier en ASCII (un accent ou un tiret long dans `download` fait perdre le nom dans Chromium) : « Les coniques - 2026-11-27.webm ». */
export function nomFichierVideo(chapitre: string, date: Date, extension = 'webm'): string {
  const j = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const ascii = chapitre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[—–−]/g, '-')
    .replace(/[’‘]/g, "'")
    .replace(/œ/g, 'oe')
    .replace(/[^\x20-\x7e]/g, '')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
  return `${ascii || 'projection'} - ${j}.${extension}`
}

/** Poids lisible : « 212 Mo », « 850 ko ». */
export function poids(octets: number): string {
  if (octets >= 1e9) return `${(octets / 1e9).toFixed(1).replace('.', ',')} Go`
  if (octets >= 1e6) return `${Math.round(octets / 1e6)} Mo`
  return `${Math.max(1, Math.round(octets / 1e3))} ko`
}

// ---------- qualité ----------

export type Qualite = '720p' | '1080p'
/** Débits choisis pour ≈ 5 Mo/min (720p) et ≈ 9 Mo/min (1080p), voix comprise (96 kbit/s). */
export const QUALITES: Record<Qualite, { largeur: number; hauteur: number; video: number; libelle: string }> = {
  '720p': { largeur: 1280, hauteur: 720, video: 560_000, libelle: '720p · ≈ 5 Mo/min' },
  '1080p': { largeur: 1920, hauteur: 1080, video: 1_100_000, libelle: '1080p · ≈ 9 Mo/min' },
}
export const DEBIT_VOIX = 96_000

/** Format accepté tel quel par YouTube : WebM (VP9 ou VP8, voix Opus), le premier que le navigateur sait enregistrer. */
export function formatVideo(estSupporte: (t: string) => boolean): string | null {
  for (const t of ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']) if (estSupporte(t)) return t
  return null
}

// ---------- micro ----------

export interface MicroDisponible {
  deviceId: string
  label: string
}

/** Micro proposé d'office : le dernier choisi s'il est branché, sinon un micro externe (USB…), sinon le premier. */
export function microParDefaut(micros: MicroDisponible[], dernier: string | null): string | null {
  if (!micros.length) return null
  if (dernier && micros.some((m) => m.deviceId === dernier)) return dernier
  const reels = micros.filter((m) => m.deviceId !== 'default' && m.deviceId !== 'communications')
  const externe = reels.find((m) => /usb|extern|rode|yeti|blue|shure|focusrite|scarlett|zoom|samson|audio-technica|jabra|headset|casque/i.test(m.label) && !/int[ée]gr|built-in|interne|internal/i.test(m.label))
  return (externe ?? reels[0] ?? micros[0]).deviceId
}

/** Nom lisible d'un micro (« Micro 2 » si le système ne donne pas de nom, avant la première autorisation). */
export function nomMicro(m: MicroDisponible, i: number): string {
  return m.label.replace(/^(Default|Par défaut) - /i, '').trim() || `Micro ${i + 1}`
}

export type JugementNiveau = 'silence' | 'faible' | 'bon' | 'sature'

/**
 * Niveau sonore : `rms` (0–1, moyenne quadratique) et `crete` (0–1) sur une courte fenêtre. Seuils choisis pour une
 * voix parlée à 20–50 cm d'un micro : sous −45 dBFS ≈ silence, sous −32 dBFS trop faible, crête ≥ 0,98 = saturation.
 */
export function jugerNiveau(rms: number, crete: number): JugementNiveau {
  if (crete >= 0.98) return 'sature'
  const db = 20 * Math.log10(Math.max(rms, 1e-6))
  if (db < -45) return 'silence'
  if (db < -32) return 'faible'
  return 'bon'
}

/** Barres allumées du vumètre (0 à 10) : −50 dBFS → 0, −10 dBFS → 10. */
export function barresNiveau(rms: number): number {
  const db = 20 * Math.log10(Math.max(rms, 1e-6))
  return Math.max(0, Math.min(10, Math.round((db + 50) / 4)))
}

export const MESSAGE_NIVEAU: Record<JugementNiveau, string> = {
  silence: 'Aucun son : parle, ou vérifie que le micro est branché et allumé.',
  faible: 'Niveau trop faible : rapproche le micro ou parle plus fort.',
  bon: 'Bon niveau',
  sature: 'Le son sature : éloigne un peu le micro.',
}

/** Voix détectée (pour « couper le silence du début ») : au-dessus de −40 dBFS. */
export const voixDetectee = (rms: number) => 20 * Math.log10(Math.max(rms, 1e-6)) >= -40

// ---------- durée du WebM ----------

/** Entier EBML de longueur variable (identifiant si `garder`, sinon taille sans le bit de longueur). */
function lireVint(o: Uint8Array, i: number, garder: boolean): { valeur: number; longueur: number } | null {
  const premier = o[i]
  if (premier === undefined || premier === 0) return null
  let longueur = 1
  while (longueur <= 8 && !(premier & (0x80 >> (longueur - 1)))) longueur++
  if (longueur > 8 || i + longueur > o.length) return null
  let valeur = garder ? premier : premier & (0xff >> longueur)
  for (let k = 1; k < longueur; k++) valeur = valeur * 256 + o[i + k]
  return { valeur, longueur }
}

/**
 * Le WebM de `MediaRecorder` n'annonce pas sa durée (le lecteur affiche 0:00, certains logiciels ne savent pas
 * avancer). On AJOUTE l'élément `Duration` (0x4489, en millisecondes pour l'échelle d'origine 1 ms) dans `Info`, au
 * début du fichier : quelques octets réécrits, aucun réencodage. `tete` = le début du fichier (les 64 premiers ko
 * suffisent) ; renvoie la tête corrigée, ou null si la structure n'est pas celle attendue (le fichier reste tel quel).
 */
export function teteAvecDuree(tete: Uint8Array, dureeMs: number): Uint8Array<ArrayBuffer> | null {
  const ebml = lireVint(tete, 0, true)
  if (!ebml || ebml.valeur !== 0x1a45dfa3) return null
  const tailleEbml = lireVint(tete, ebml.longueur, false)
  if (!tailleEbml) return null
  let i = ebml.longueur + tailleEbml.longueur + tailleEbml.valeur
  const segment = lireVint(tete, i, true)
  if (!segment || segment.valeur !== 0x18538067) return null
  const tailleSegment = lireVint(tete, i + segment.longueur, false)
  if (!tailleSegment) return null
  i += segment.longueur + tailleSegment.longueur
  while (i < tete.length) {
    const id = lireVint(tete, i, true)
    const taille = id && lireVint(tete, i + id.longueur, false)
    if (!id || !taille) return null
    const debutContenu = i + id.longueur + taille.longueur
    const fin = debutContenu + taille.valeur
    if (id.valeur === 0x1549a966) {
      if (fin > tete.length) return null
      // Déjà une durée : rien à faire.
      for (let j = debutContenu; j < fin; ) {
        const e = lireVint(tete, j, true)
        const t = e && lireVint(tete, j + e.longueur, false)
        if (!e || !t) return null
        if (e.valeur === 0x4489) return null
        j += e.longueur + t.longueur + t.valeur
      }
      const duree = new Uint8Array(11)
      duree.set([0x44, 0x89, 0x88])
      new DataView(duree.buffer).setFloat64(3, dureeMs)
      const contenu = taille.valeur + duree.length
      // Taille de `Info` réécrite sur 8 octets (forme EBML valide, quelle que soit la longueur d'origine).
      const tailleInfo = new Uint8Array(8)
      tailleInfo[0] = 0x01
      for (let k = 7, v = contenu; k >= 1; k--, v = Math.floor(v / 256)) tailleInfo[k] = v % 256
      const res = new Uint8Array(i + id.longueur + 8 + contenu + (tete.length - fin))
      res.set(tete.subarray(0, i + id.longueur), 0)
      res.set(tailleInfo, i + id.longueur)
      res.set(tete.subarray(debutContenu, fin), i + id.longueur + 8)
      res.set(duree, i + id.longueur + 8 + taille.valeur)
      res.set(tete.subarray(fin), i + id.longueur + 8 + contenu)
      return res
    }
    // Élément de taille inconnue avant `Info` : on s'arrête (structure inattendue).
    if (taille.valeur >= 2 ** 56 - 1) return null
    i = fin
  }
  return null
}
