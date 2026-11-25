/**
 * Majuscules d'INSISTANCE sur papier (décision de l'utilisateur, lot A2) : à l'écran, les
 * générateurs, les banques vrai/faux et les questions ouvertes insistent souvent par des mots en
 * capitales (« la formule CONFIRMÉE », « ne change PAS de signe », « TOUJOURS en radians »). Sur
 * une feuille imprimée, ces capitales crient : tout texte imprimé (énoncé, consignes, corrigé,
 * barème, vrai/faux — HTML ET Word) les repasse en minuscules.
 *
 * Règle GLOBALE (pas chapitre par chapitre), appliquée à la conversion des fragments texte pour le
 * papier (`fragmentsVersHtml`, `fragmentsVersRunsDocx`) — donc aussi aux adaptateurs qui ne sont pas
 * enveloppés par `versionPapier`. Jamais dans les formules (seuls les fragments `texte` passent ici).
 *
 * Les majuscules LÉGITIMES ne sont jamais touchées. Mesuré sur un corpus réel (tous les
 * adaptateurs, 30 tirages + 10 par variante, toutes les banques vrai/faux, toutes les questions
 * ouvertes : ~1 million de fragments), elles sont de quatre sortes :
 * - noms de points, droites, plans, polygones, solides : ABC, ABCD, ABCDEFGH, (DEG), angle ROI₁,
 *   SABCD, triangle FPF′… ;
 * - issues et permutations en dénombrement : RBB, VJJ, SSÉÉÉ, PTURSQ, « ABC, ACB, BAC » ;
 * - sigles : SOX/SOY (symétries), SOH-CAH-TOA, ASA/SAS/AAS (cas d'égalité), IPP, PGCD, GPS… ;
 * - chiffres romains : I, II, III, IV, XVIᵉ.
 *
 * Un mot n'est donc mis en minuscules que s'il est sûrement un mot français d'insistance :
 * 1. trois lettres ou plus, toutes en capitales, et pas de sigle (`SIGLES`, qui liste aussi le mot
 *    MISSISSIPI dont on compte les anagrammes) ;
 * 2. puis l'un de :
 *    - mot de la liste fermée `MOTS_COURTS` (PAS, SANS, DEUX, TOUT, UNE, QUE, NON… et GRAND,
 *      TEMPS) : un nom de point de 3–4 lettres (ABE, DEG, ROI, BAC) n'y est pas ;
 *    - sinon, ni chiffre romain, ni moins de trois lettres DIFFÉRENTES (SSÉ, RBB, ÉÉÉÉÉ), et :
 *      il porte un accent (É, È, À, Ê… — un nom de point n'en a jamais), ou c'est un mot de 5 lettres
 *      ou plus dont la forme est celle d'un mot (au moins 2 voyelles et 20 % de voyelles, au plus 4
 *      consonnes de suite, jamais trois lettres consécutives de l'alphabet : ABC, BCD, QRS…,
 *      signature des noms de sommets ABCDE, ABCDS, PQRST) ;
 * 3. et le contexte ne désigne pas un nom : pas collé à un chiffre, un indice, un exposant ou un
 *    prime (ROI₁, AC², FPF′) ; pas juste après « mot », « lettres de », « anagrammes » ; pas voisin
 *    d'une autre suite de capitales qui n'est pas un mot (« ABC, ACB, BAC ») ; pour un mot court
 *    sans accent : ni entouré de parenthèses/crochets (« plan (DEG) »), ni juste après un nom de
 *    figure (« triangle », « angle », « plan »… — `NOMS_AVANT_UN_NOM`) s'il n'a que des lettres
 *    distinctes, sauf s'il ouvre une suite de mots d'insistance (« le carré POUR CHACUNE »).
 * Les petits mots de liaison en capitales (À, EN, LA, DE, UN, QU…) suivent leur voisin
 * transformé (« À LA FOIS » → « à la fois », « QU'UN SEUL » → « qu'un seul ») ; une conjonction
 * seule entre deux mots en minuscules aussi (« rotations ET réflexions »). Un mot en début de
 * phrase garde sa majuscule initiale (« SANS remise » → « Sans remise ») ; un nom propre aussi
 * (« loi de POISSON » → « loi de Poisson », `NOMS_PROPRES`).
 *
 * Mesure (novembre 2026, corpus ci-dessus) : 13 664 mots transformés (562 formes), aucun nom de
 * point, sigle ni chiffre romain touché ; restent en capitales quelques insistances prudemment
 * épargnées (« angle AIGU », « le sommet EST », « un mot DIFFÉRENT », « carré PUIS »).
 */

/** Sigles et abréviations légitimes, jamais transformés (même s'ils ressemblaient à un mot). */
const SIGLES = new Set([
  'SOX', 'SOY', 'SOH', 'CAH', 'TOA', 'ASA', 'SAS', 'AAS', 'SSS', 'SSA', 'ALA', 'LAL', 'IPP', 'PGCD', 'PPCM', 'QCM', 'GPS', 'PME',
  // Mot dont on compte les anagrammes (banque de dénombrement) : ses capitales sont ses lettres.
  'MISSISSIPI', 'MISSISSIPPI',
  'ADN', 'ONU', 'TVA', 'PIB', 'CQFD', 'SNCB', 'STIB', 'FWB', 'CEB', 'CESS', 'PISA', 'NASA', 'LED', 'USB', 'PDF', 'URL', 'HTML',
  // Système de navigation (6gen142, hyperboles) : un sigle, pas une insistance (relevé par le lot G).
  'LORAN',
])

/** Mots français courts (3–4 lettres, sans accent) écrits en capitales d'insistance — et les
 * quelques mots plus longs à une seule voyelle (GRAND, TEMPS, STRICT) que la règle de forme
 * écarterait. Liste FERMÉE : un nom de point de 3–4 lettres n'y figure pas (relevé sur le corpus :
 * ROI₁, DEG, BAC, ACE, ABS, CAD, DAC, OAB… sont des noms de points ou des permutations). */
const MOTS_COURTS = new Set([
  'GRAND', 'GRANDS', 'TEMPS', 'STRICT', 'STRICTS', 'CHAMP', 'CHAMPS', 'FORT', 'FORTS',
  'PAS', 'SANS', 'DEUX', 'TOUT', 'TOUS', 'UNE', 'UNS', 'QUE', 'QUI', 'NON', 'OUI', 'SUR', 'SOUS', 'DANS', 'AVEC', 'POUR', 'PAR',
  'PLUS', 'SEUL', 'EST', 'SONT', 'LES', 'DES', 'CES', 'SES', 'CET', 'BAS', 'HAUT', 'NUL', 'NULS', 'RIEN', 'PUIS', 'FOIS', 'TROP',
  'TARD', 'VIDE', 'RANG', 'DEMI', 'AIRE', 'HORS', 'PIED', 'CUBE', 'TAUX', 'FACE', 'REND', 'BASE', 'PART', 'BRUT', 'TYPE', 'SOIT',
  'LOI', 'SAUT', 'PUR', 'PAIR', 'VRAI', 'FAUX', 'FAUT', 'NET', 'AIGU', 'ONT', 'MAIS', 'DONC', 'CAR', 'SAUF', 'BIEN', 'MAL',
  'VERS', 'CHEZ', 'LEUR', 'SON', 'NOS', 'VOS', 'MOT', 'MOTS', 'FIN', 'BUT', 'DUR', 'SURE', 'TEL', 'TELS', 'AUX', 'SIX', 'CENT',
  'ZONE', 'SENS', 'BORD', 'NOUS', 'VOUS', 'ELLE', 'ILS', 'LUI', 'EUX', 'DOIT', 'PEUT', 'VAUT', 'FONT', 'DIT', 'VOIR', 'LIRE',
  'FAIT', 'AXE', 'AXES', 'LONG', 'GROS', 'COTE', 'DOS', 'TOUR', 'JOUR', 'MOIS', 'ANS', 'PRIX', 'BOUT', 'LIEU',
])

/** Petits mots de liaison mis en minuscules quand un mot voisin l'est (« À LA FOIS », « EN PLUS »).
 * Jamais seuls : « CE » (condition d'existence), « A » (point) restent intacts. Une lettre seule
 * (élision D', L', N', QU'…) ne suit son voisin que par l'apostrophe : « le point M SOUS… » garde M. */
const LIAISONS = new Set(['À', 'EN', 'LA', 'LE', 'DE', 'DU', 'UN', 'AU', 'ET', 'OU', 'NE', 'QU', 'IL', 'ON', 'SI', 'SE', 'SA', 'RE'])
const ELISIONS = new Set(['D', 'L', 'N', 'S', 'C', 'J', 'T', 'M', 'QU'])
/** Conjonctions mises en minuscules même seules, quand elles sont entre deux mots en minuscules
 * (« rotations ET réflexions ») — jamais entre deux noms de points (« X ET Y »). */
const CONJONCTIONS = new Set(['ET', 'OU', 'NI', 'EN', 'UN', 'NE'])

/** Noms propres écrits en capitales d'insistance : ils gardent leur majuscule initiale (« loi de
 * POISSON » → « loi de Poisson », jamais « poisson »). */
const NOMS_PROPRES = new Set([
  'POISSON', 'PASCAL', 'GAUSS', 'EULER', 'MOIVRE', 'CHASLES', 'THALÈS', 'PYTHAGORE', 'BERNOULLI', 'LAPLACE', 'VIÈTE', 'NEWTON',
  'LEIBNIZ', 'FERMAT', 'CARDAN', 'BAYES', 'FIBONACCI', 'HÉRON', 'CAUCHY', 'RIEMANN', 'NAPIER', 'NEPER', 'NÉPER',
])

/** Mots après lesquels une suite de capitales est un NOM (de point, de figure, de mot à
 * anagrammer…), jamais une insistance. */
const NOMS_AVANT_UN_NOM = new Set([
  'triangle', 'triangles', 'angle', 'angles', 'plan', 'plans', 'droite', 'droites', 'segment', 'segments', 'face', 'faces',
  'carré', 'cube', 'pyramide', 'quadrilatère', 'polygone', 'hexagone', 'pentagone', 'octogone', 'rectangle', 'losange',
  'trapèze', 'parallélogramme', 'tétraèdre', 'prisme', 'parallélépipède', 'solide', 'section', 'terrain', 'panneau', 'point',
  'points', 'sommet', 'sommets', 'côté', 'côtés', 'arête', 'arêtes', 'diagonale', 'vecteur', 'figure', 'repère', 'cercle',
])

/** Mots après lesquels une suite de capitales est toujours un nom, quelle que soit sa longueur. */
const NOMS_DE_MOTS = new Set(['mot', 'mots', 'lettres', 'anagramme', 'anagrammes'])

const VOYELLES = new Set('AEIOUYÀÂÄÉÈÊËÎÏÔÖÙÛÜŸŒÆ')
const ACCENTUEES = /[ÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆ]/
const ROMAIN = /^(?=[IVXLCDM]+$)M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/
/** Lettres d'un mot (accents compris), hors lettres modificatrices (ᵉ, ʳ…). */
const MOT = /[\p{Lu}\p{Ll}]+/gu
/** Caractères qui, collés à un mot, en font un nom (indice, exposant, prime, chiffre). */
const COLLE = /[0-9₀-₉ₐ-ₜ⁰-⁹⁺⁻ᵃ-ᶿ'′″’²³_]/

function estMajuscules(mot: string): boolean {
  return mot === mot.toUpperCase() && mot !== mot.toLowerCase()
}

function troisConsecutives(mot: string): boolean {
  for (let i = 0; i + 2 < mot.length; i++) {
    const a = mot.charCodeAt(i)
    if (a >= 65 && a <= 90 && mot.charCodeAt(i + 1) === a + 1 && mot.charCodeAt(i + 2) === a + 2) return true
  }
  return false
}

/** Le mot (en capitales) a-t-il la forme d'un mot français d'insistance — indépendamment du contexte ? */
export function estMotDInsistance(mot: string): boolean {
  if (mot.length < 3 || !estMajuscules(mot) || SIGLES.has(mot)) return false
  if (MOTS_COURTS.has(mot)) return true
  if (ROMAIN.test(mot) || new Set(mot).size < 3) return false
  if (ACCENTUEES.test(mot)) return true
  if (mot.length <= 4) return false
  const voyelles = [...mot].filter((c) => VOYELLES.has(c)).length
  if (voyelles < 2 || voyelles / mot.length < 0.2) return false
  if (/[^AEIOUY]{5,}/.test(mot)) return false
  return !troisConsecutives(mot)
}

interface Jeton {
  mot: string
  debut: number
  fin: number
}

/**
 * Repasse en minuscules les mots d'insistance d'un fragment de TEXTE (jamais une formule).
 * `debutDePhrase` : le fragment commence une phrase (premier fragment, ou précédé d'un point) — son
 * premier mot transformé garde alors une majuscule initiale.
 */
export function sansMajusculesDInsistance(texte: string, debutDePhrase = true): string {
  if (!/[\p{Lu}]{3}/u.test(texte)) return texte
  const jetons: Jeton[] = [...texte.matchAll(MOT)].map((m) => ({ mot: m[0], debut: m.index!, fin: m.index! + m[0].length }))
  const transforme = Array.from({ length: jetons.length }, () => false)
  const separateur = (i: number, j: number) => texte.slice(jetons[i].fin, jetons[j].debut)
  // Voisin « nom » : une autre suite de capitales (2 lettres ou plus) qui n'est pas un mot,
  // séparée seulement par des espaces, virgules, « et »/« ou » ou un trait d'union.
  const voisinNom = (i: number, j: number) => {
    if (j < 0 || j >= jetons.length) return false
    const v = jetons[j].mot
    if (v.length < 2 || !estMajuscules(v) || estMotDInsistance(v) || LIAISONS.has(v)) return false
    const sep = i < j ? separateur(i, j) : separateur(j, i)
    return /^[\s,;\-–]*((et|ou)\s+)?$/.test(sep)
  }
  /** Mots écartés SEULEMENT parce qu'ils suivent un nom de figure (« le carré POUR CHACUNE ») :
   * repris s'ils ouvrent une suite de mots d'insistance. */
  const apresUnNom = Array.from({ length: jetons.length }, () => false)
  jetons.forEach((j, i) => {
    if (!estMotDInsistance(j.mot)) return
    const avant = texte[j.debut - 1] ?? ''
    const apres = texte[j.fin] ?? ''
    if (COLLE.test(avant) && avant !== "'" && avant !== '’') return // « L'AIRE » : l'apostrophe AVANT est une élision
    if (COLLE.test(apres)) return
    const court = j.mot.length <= 4 && !ACCENTUEES.test(j.mot)
    if (court && /[([]/.test(avant) && /[)\]]/.test(apres)) return
    if (voisinNom(i, i - 1) || voisinNom(i, i + 1)) return
    const precedent = jetons[i - 1]?.mot.toLowerCase()
    if (precedent && /^\s+$/.test(separateur(i - 1, i))) {
      // « le mot BALLON », « les lettres ABC » : toujours un nom ; après un nom de figure, seul un
      // mot court peut être un nom de points (« triangle EST » ≠ « angle ENTRE les vecteurs »), et
      // seulement s'il n'a que des lettres distinctes (des sommets distincts : « points NON
      // alignés », « sommets SANS aucun choix » sont des insistances).
      const avantPrecedent = jetons[i - 2]?.mot.toLowerCase()
      if (NOMS_DE_MOTS.has(precedent) || ((precedent === 'de' || precedent === 'du') && avantPrecedent && NOMS_DE_MOTS.has(avantPrecedent))) return
      if (court && new Set(j.mot).size === j.mot.length && NOMS_AVANT_UN_NOM.has(precedent)) {
        apresUnNom[i] = true
        return
      }
    }
    transforme[i] = true
  })
  for (let i = jetons.length - 2; i >= 0; i--) {
    if (apresUnNom[i] && transforme[i + 1] && /^\s+$/.test(separateur(i, i + 1))) transforme[i] = true
  }
  // Conjonction seule en capitales entre deux mots en minuscules : « rotations ET réflexions ».
  jetons.forEach((j, i) => {
    if (!CONJONCTIONS.has(j.mot) || i === 0 || i === jetons.length - 1) return
    const motMinuscule = (k: number) => /\p{Ll}/u.test(jetons[k].mot) && /^ $/.test(k < i ? separateur(k, i) : separateur(i, k))
    if (motMinuscule(i - 1) && motMinuscule(i + 1)) transforme[i] = true
  })
  if (!transforme.includes(true)) return texte
  // Petits mots de liaison collés (espace, apostrophe, trait d'union) à un mot transformé.
  for (let change = true; change; ) {
    change = false
    jetons.forEach((j, i) => {
      if (transforme[i]) return
      const liaison = LIAISONS.has(j.mot)
      // Élision : la lettre précède son mot, séparée par la seule apostrophe (« D'UNE », « QU'UN »).
      const elision = ELISIONS.has(j.mot) && i + 1 < jetons.length && transforme[i + 1] && /^['’]$/.test(separateur(i, i + 1))
      if (!liaison && !elision) return
      const colle = (k: number) => k >= 0 && k < jetons.length && transforme[k] && /^(\s|['’-]|\s\((ou|et)\s)$/.test(k < i ? separateur(k, i) : separateur(i, k))
      if (elision || colle(i - 1) || colle(i + 1)) {
        transforme[i] = true
        change = true
      }
    })
  }
  let resultat = ''
  let curseur = 0
  jetons.forEach((j, i) => {
    if (!transforme[i]) return
    let remplacement = j.mot.toLowerCase()
    const avant = texte.slice(0, j.debut)
    const enDebut = /^\s*[«"—–-]?\s*$/.test(avant) ? debutDePhrase : /[.!?…]\s*[«"]?\s*$/.test(avant)
    if (enDebut || NOMS_PROPRES.has(j.mot)) remplacement = remplacement.charAt(0).toUpperCase() + remplacement.slice(1)
    resultat += texte.slice(curseur, j.debut) + remplacement
    curseur = j.fin
  })
  return resultat + texte.slice(curseur)
}

/** Version « liste de fragments » : chaque fragment texte est traité, le début de phrase suivant la
 * fin du fragment texte précédent (une formule entre deux ne commence jamais de phrase). */
export function fragmentsSansMajusculesDInsistance<F extends { type: string; valeur: string }>(fragments: F[]): F[] {
  return fragments.map((f, i) => {
    if (f.type !== 'texte') return f
    const precedent = fragments[i - 1]
    const debut = i === 0 || (precedent?.type === 'texte' && /[.!?…]\s*$/.test(precedent.valeur))
    const valeur = sansMajusculesDInsistance(f.valeur, debut)
    return valeur === f.valeur ? f : { ...f, valeur }
  })
}
