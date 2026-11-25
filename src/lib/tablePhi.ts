/**
 * Table de la loi normale centrée réduite — Φ(z) = P(Z ≤ z), Z ∼ 𝒩(0 ; 1).
 *
 * SEULE source de la table du site (décision de l'utilisateur, 18/11/2026, 6e ch. 8) :
 * - le cours l'affiche en entier (bloc `tablePhi` du chapitre « Variables aléatoires », § 6) ;
 * - les générateurs l'affichent à l'écran, consultable (`components/TablePhi.tsx`) ;
 * - le papier l'imprime UNE fois, en annexe, quand une question du document en a besoin
 *   (`tablePhiHtml`, enveloppé par `entrainement/export/annexesPapier.ts::annexeTableNormale`).
 * Toutes les valeurs affichées ou attendues viennent d'ici : une réponse « lue dans la table » est
 * comparée à `phiTable`, jamais à un Φ exact que l'élève ne peut pas lire.
 *
 * Convention de lecture (enseignée au § 6 du cours) :
 * - la table donne Φ(z) pour z ≥ 0, de 0,00 à 3,49 : ligne = unités et dixième de z, colonne =
 *   centième ; Φ(z) est arrondi à 4 décimales ;
 * - z est d'abord arrondi au centième le plus proche (`arrondirZ`) ;
 * - z < 0 : symétrie, Φ(−z) = 1 − Φ(z) (`phiTable` le fait) ;
 * - z > 3,49 : Φ(z) ≈ 1 (on écrit 0,9998 ou plus — `phiTable` rend la valeur de la dernière case) ;
 * - sens inverse (on connaît p = Φ(z), on cherche z) : la case dont la valeur est la plus proche de p ;
 *   à égalité entre deux cases (p = 0,95 entre 0,9495 et 0,9505), les deux z sont acceptés et on
 *   peut prendre leur milieu (1,645) — `lectureInverse` rend les deux.
 */

/** Unités et dixième de z, une valeur par ligne de la table : 0,0 ; 0,1 ; … ; 3,4. */
export const LIGNES_TABLE_PHI: readonly number[] = Array.from({ length: 35 }, (_, i) => i / 10)

/** Centième de z, une valeur par colonne : 0,00 ; 0,01 ; … ; 0,09. */
export const COLONNES_TABLE_PHI: readonly number[] = Array.from({ length: 10 }, (_, j) => j / 100)

/** Plus grand z de la table (3,49). */
export const Z_MAX_TABLE = 3.49

/** Fonction erreur par sa série entière, précise à 1e-12 pour |x| ≤ 4 (|z| ≤ 5,6). */
function erf(x: number): number {
  if (x === 0) return 0
  if (x > 6) return 1
  if (x < -6) return -1
  const x2 = x * x
  let terme = x
  let somme = x
  for (let n = 1; n < 400; n++) {
    terme *= -x2 / n
    const ajout = terme / (2 * n + 1)
    somme += ajout
    if (Math.abs(ajout) < 1e-17 * Math.abs(somme)) break
  }
  return (2 / Math.sqrt(Math.PI)) * somme
}

/** Φ(z) EXACT (à 1e-12 près), pour les calculs internes (corrigés, vérifications). Jamais ce qu'on
 * attend d'un élève qui lit la table : voir `phiTable`. */
export function phiExact(z: number): number {
  if (z > 8) return 1
  if (z < -8) return 0
  return 0.5 * (1 + erf(z / Math.SQRT2))
}

/** z arrondi au centième le plus proche (moitiés vers l'extérieur, comme à la main). */
export function arrondirZ(z: number): number {
  const s = z < 0 ? -1 : 1
  return (s * Math.round(Math.abs(z) * 100 + 1e-9)) / 100
}

const TABLE: number[][] = LIGNES_TABLE_PHI.map((l) =>
  COLONNES_TABLE_PHI.map((c) => Math.round(phiExact(Math.round((l + c) * 100) / 100) * 10000) / 10000),
)

/** Valeur imprimée dans la case (ligne `i`, colonne `j`) : Φ(i/10 + j/100) à 4 décimales. */
export function valeurCase(i: number, j: number): number {
  return TABLE[i][j]
}

/** Case de la table qui correspond à z ≥ 0 (z arrondi au centième), ou `null` si z > 3,49. */
export function caseDe(z: number): { ligne: number; colonne: number } | null {
  const c = Math.round(Math.abs(arrondirZ(z)) * 100)
  if (c > 349) return null
  return { ligne: Math.floor(c / 10), colonne: c % 10 }
}

/**
 * Valeur LUE dans la table pour z (arrondi au centième) : la case elle-même si 0 ≤ z ≤ 3,49,
 * 1 − case(−z) si z < 0 (symétrie), la dernière case si |z| > 3,49 (Φ ≈ 1, ou ≈ 0 pour z négatif).
 * Résultat arrondi à 4 décimales.
 */
export function phiTable(z: number): number {
  const za = arrondirZ(z)
  const c = caseDe(za)
  const v = c ? TABLE[c.ligne][c.colonne] : TABLE[34][9]
  return za < 0 ? Math.round((1 - v) * 10000) / 10000 : v
}

/**
 * Lecture À L'ENVERS : z (au centième) dont la case est la plus proche de p. Pour p < 0,5, on lit
 * 1 − p puis on change le signe (symétrie). Rend un z, ou deux à égalité exacte (p = 0,95 →
 * [1,64 ; 1,65]), par ordre croissant. `null` si p ∉ ]0 ; 1[.
 */
export function lectureInverse(p: number): number[] | null {
  if (!(p > 0 && p < 1)) return null
  const negatif = p < 0.5
  const q = negatif ? 1 - p : p
  let meilleur = Infinity
  let zs: number[] = []
  for (let i = 0; i < LIGNES_TABLE_PHI.length; i++) {
    for (let j = 0; j < COLONNES_TABLE_PHI.length; j++) {
      const ecart = Math.round(Math.abs(TABLE[i][j] - q) * 1e6) // en millionièmes : égalités exactes
      const z = (i * 10 + j) / 100
      if (ecart < meilleur) {
        meilleur = ecart
        zs = [z]
      } else if (ecart === meilleur) {
        zs.push(z)
      }
    }
  }
  // Plusieurs cases de MÊME valeur (fin de table : 0,9999…) : on garde la première.
  const valeurs = new Set(zs.map((z) => phiTable(z)))
  if (valeurs.size === 1) zs = [zs[0]]
  const res = negatif ? zs.map((z) => -z).reverse() : zs
  return res
}

/** « 0,9332 » : écriture française à 4 décimales (texte brut, hors KaTeX). */
export function formatProba4(v: number): string {
  return v.toFixed(4).replace('.', ',')
}

/** « 1,23 » / « −0,50 » : écriture française de z au centième (signe moins typographique). */
export function formatZ(z: number): string {
  const t = Math.abs(z).toFixed(2).replace('.', ',')
  return z < 0 ? `−${t}` : t
}

/**
 * Table complète en HTML AUTONOME (styles en ligne : rendu identique dans le cours exporté, une
 * annexe papier ou une page sans la feuille de style du site). Deux demi-tableaux côte à côte
 * (z de 0,00 à 1,79 et de 1,80 à 3,49) pour tenir sur une page A4 en portrait.
 * `surligner` : z à mettre en évidence (case, et en-têtes de sa ligne et de sa colonne).
 */
export function tablePhiHtml(options: { surligner?: number; enDeuxParties?: boolean } = {}): string {
  const { surligner, enDeuxParties = true } = options
  const cible = surligner === undefined ? null : caseDe(surligner)
  const bord = 'border:1px solid #9aa4ae'
  const th = `${bord};padding:2px 4px;background:#eef1f4;font-weight:600;text-align:center`
  const td = `${bord};padding:2px 4px;text-align:center`
  const fort = 'background:#fde7c8;font-weight:700'
  const partie = (debut: number, fin: number) => {
    const entete = `<tr><th style="${th}">z</th>${COLONNES_TABLE_PHI.map(
      (c, j) => `<th style="${th}${cible && cible.colonne === j ? `;${fort}` : ''}">${formatZ(c)}</th>`,
    ).join('')}</tr>`
    const lignes = LIGNES_TABLE_PHI.slice(debut, fin + 1)
      .map((l, k) => {
        const i = debut + k
        return `<tr><th style="${th}${cible && cible.ligne === i ? `;${fort}` : ''}">${l.toFixed(1).replace('.', ',')}</th>${COLONNES_TABLE_PHI.map(
          (_, j) => `<td style="${td}${cible && cible.ligne === i && cible.colonne === j ? `;${fort}` : ''}">${formatProba4(TABLE[i][j])}</td>`,
        ).join('')}</tr>`
      })
      .join('')
    return `<table class="table-phi" style="border-collapse:collapse;font-family:'IBM Plex Mono',Consolas,monospace;font-size:8.5pt;line-height:1.25;margin:0 auto">${entete}${lignes}</table>`
  }
  const legende =
    `<p style="font-size:9pt;margin:0 0 6px">Φ(z) = P(Z ≤ z) pour Z ∼ 𝒩(0 ; 1). Ligne : unités et dixième de z ; colonne : centième. ` +
    `Exemple : Φ(1,23) se lit ligne 1,2, colonne 0,03. Pour z &lt; 0 : Φ(−z) = 1 − Φ(z). Au-delà de 3,49 : Φ(z) ≈ 1.</p>`
  if (!enDeuxParties) return `${legende}${partie(0, 34)}`
  return `${legende}<div style="display:flex;gap:10px;justify-content:center;align-items:flex-start;flex-wrap:wrap">${partie(0, 17)}${partie(18, 34)}</div>`
}
