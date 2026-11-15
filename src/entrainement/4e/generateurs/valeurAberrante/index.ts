import type { ContexteAberrant, ExerciceValeurAberrante, Justification, Verdict } from "../../core/valeurAberrante.types";
import { CONTEXTES, decimales, medianeSansAmbiguite, moyenne, rangMediane, trier, type ContexteDef, type Plage } from "../../moteur/modeleValeurAberrante";

/**
 * Générateur de gen110 — « Moyenne ou médiane ? La valeur aberrante ». Tout le hasard passe par
 * `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR
 * code d'une feuille rouvre le MÊME exercice.
 *
 * Le VERDICT (médiane / les deux se valent) est tiré à pile ou face AVANT la construction : la
 * boucle de rejet ne peut pas biaiser sa fréquence, et il n'entre jamais dans `forme` (profil.ts).
 *
 * Garanties (vérifiées par tirages massifs, scratchpad gen110) :
 * - la valeur retirée à l'écran b (la plus grande, ou la plus petite pour les notes) est UNIQUE ;
 * - moyennes (série complète et série sans cette valeur) exactes, au plus 2 décimales ;
 * - médiane sans ambiguïté : dans la série d'effectif pair, les deux valeurs centrales sont égales ;
 * - verdict « médiane » : la valeur extrême est séparée des autres d'au moins leur étendue, la
 *   retirer déplace la moyenne d'au moins 30 % de cette étendue (la médiane, elle, ne bouge pas), et
 *   la moyenne de la série complète dépasse au moins 75 % des autres valeurs (au-dessus de presque
 *   toutes pour une valeur extrême haute, en dessous pour une basse) ;
 * - verdict « les deux se valent » : aucune valeur isolée (écart entre les deux plus grandes — ou
 *   les deux plus petites — au plus 30 % de l'étendue des autres), moyenne et médiane à au plus
 *   12 % de l'étendue l'une de l'autre, et retirer la valeur la plus éloignée déplace la moyenne
 *   d'au plus 10 % de l'étendue ;
 * - l'ordre de l'énoncé n'est pas rangé, et sa valeur du milieu n'est pas la médiane (le piège
 *   « médiane sans trier » donne une autre réponse, reconnue à la vérification).
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: readonly T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

function tirer(p: Plage): number {
  return p.min + p.pas * entier(0, Math.round((p.max - p.min) / p.pas));
}

/** Prénoms commençant par une consonne : « les notes de Léa » (jamais « de Emma »). */
const PRENOMS = ["Léa", "Noah", "Zoé", "Lucas", "Manon", "Hugo", "Chloé", "Nathan", "Sara", "Louis", "Yasmine", "Théo", "Julie", "Sacha"];

const JUSTIFICATIONS: Justification[] = ["extreme", "aucune", "moyenne-toujours", "mediane-toujours"];

/** Étendue des valeurs autres que la plus éloignée, écart de celle-ci aux autres, déplacement de la
 * moyenne quand on la retire, écart moyenne–médiane de la série complète. */
export interface Mesures {
  etendueAutres: number;
  ecartIsole: number;
  deplacementMoyenne: number;
  ecartMoyenneMediane: number;
  /** Part des autres valeurs que la moyenne complète « dépasse » (sous elle pour `haut`, au-dessus pour `bas`). */
  partDepassee: number;
}

export function mesurer(valeurs: readonly number[], sens: "haut" | "bas"): Mesures {
  const t = trier(valeurs);
  const autres = sens === "haut" ? t.slice(0, -1) : t.slice(1);
  const extreme = sens === "haut" ? t[t.length - 1]! : t[0]!;
  const voisine = sens === "haut" ? autres[autres.length - 1]! : autres[0]!;
  return {
    etendueAutres: autres[autres.length - 1]! - autres[0]!,
    ecartIsole: Math.abs(extreme - voisine),
    deplacementMoyenne: Math.abs(moyenne(valeurs) - moyenne(autres)),
    ecartMoyenneMediane: Math.abs(moyenne(valeurs) - t[rangMediane(t.length) - 1]!),
    partDepassee: autres.filter((v) => (sens === "haut" ? v < moyenne(valeurs) : v > moyenne(valeurs))).length / autres.length,
  };
}

export function verdictRespecte(valeurs: readonly number[], sens: "haut" | "bas", verdict: Verdict): boolean {
  const m = mesurer(valeurs, sens);
  if (m.etendueAutres <= 0) return false;
  if (verdict === "mediane") return m.ecartIsole >= m.etendueAutres && m.deplacementMoyenne >= 0.3 * m.etendueAutres && m.partDepassee >= 0.75;
  return m.ecartIsole > 0 && m.ecartIsole <= 0.3 * m.etendueAutres && m.ecartMoyenneMediane <= 0.12 * m.etendueAutres && m.deplacementMoyenne <= 0.1 * m.etendueAutres;
}

function serie(c: ContexteDef, verdict: Verdict): number[] | null {
  const n = entier(c.n[0], c.n[1]);
  const valeurs = verdict === "mediane" ? [...Array.from({ length: n - 1 }, () => tirer(c.normal)), tirer(c.extreme)] : Array.from({ length: n }, () => tirer(c.sansExtreme));
  const t = trier(valeurs);
  const autres = c.sens === "haut" ? t.slice(0, -1) : t.slice(1);
  // Valeur retirée unique.
  if (c.sens === "haut" ? t[n - 1] === t[n - 2] : t[0] === t[1]) return null;
  if (!medianeSansAmbiguite(t) || !medianeSansAmbiguite(autres)) return null;
  if (decimales(moyenne(t)) > 2 || decimales(moyenne(autres)) > 2) return null;
  if (!verdictRespecte(t, c.sens, verdict)) return null;
  return valeurs;
}

/** Ordre de l'énoncé : pas rangé (ni dans un sens ni dans l'autre), valeur(s) du milieu ≠ médiane. */
function ordreEnonce(valeurs: number[]): number[] {
  const n = valeurs.length;
  const med = trier(valeurs)[rangMediane(n) - 1]!;
  for (let essai = 0; essai < 200; essai++) {
    const o = melanger(valeurs);
    const milieux = n % 2 === 1 ? [o[(n - 1) / 2]!] : [o[n / 2 - 1]!, o[n / 2]!];
    if (milieux.some((v) => v === med)) continue;
    if (n % 2 === 0 && (milieux[0]! + milieux[1]!) / 2 === med) continue;
    const t = trier(o);
    if (o.every((v, i) => v === t[i]) || o.every((v, i) => v === t[n - 1 - i])) continue;
    return o;
  }
  return melanger(valeurs);
}

export function construireExercice(contexte: ContexteAberrant, verdict: Verdict): ExerciceValeurAberrante {
  const c = CONTEXTES.find((x) => x.id === contexte)!;
  for (;;) {
    const valeurs = serie(c, verdict);
    if (!valeurs) continue;
    return { contexte, verdict, valeurs: ordreEnonce(valeurs), prenom: choisir(PRENOMS), ordreJustifications: melanger(JUSTIFICATIONS) };
  }
}

/** Verdict tiré AVANT la construction, à pile ou face. */
function tirerVerdict(): Verdict {
  return Math.random() < 0.5 ? "mediane" : "les-deux";
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: ContexteAberrant; label: string }[] = CONTEXTES.map((c) => ({ id: c.id, label: c.label }));

export function construireAvecVariante(id: string): ExerciceValeurAberrante {
  const c = CONTEXTES.find((x) => x.id === id);
  if (!c) return genererExerciceValeurAberrante();
  return construireExercice(c.id, tirerVerdict());
}

/** Tirage libre : un contexte au hasard, puis le verdict. */
export function genererExerciceValeurAberrante(): ExerciceValeurAberrante {
  const contexte = choisir(CONTEXTES).id;
  return construireExercice(contexte, tirerVerdict());
}
