import type { ChampDetectiveComplexes, DonneesDetectiveComplexes, IdDescriptionComplexes } from "../core6e/detectiveComplexes.types";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { ecartAngulaire } from "./equivalenceExponentielle";
import { evaluerValeurComplexe } from "./expressionComplexe";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import { champsCorrection, descriptionCorrecte, indiceLigneFausse } from "./modeleDetectiveComplexes";
import { prevaliderSaisiesComplexes } from "./saisieComplexe";

/**
 * Vérification de 6gen99. Écran 1 : le numéro de la ligne fausse. Écran 2 : la description de
 * l'erreur. Écran 3 : les valeurs corrigées, lues dans des champs libres (jamais filtrés) :
 * - champ RÉEL : valeur exacte (√, π, fractions, virgule décimale) lue par l'évaluateur du chantier
 *   (`expressionExponentielle.ts`, « √3 », « 2π/3 », « rac(3) » acceptés) ; un préfixe recopié
 *   (« |z| = ») est ignoré. Un ARGUMENT est comparé à 2kπ près ; les arguments des racines n-ièmes
 *   forment un ENSEMBLE (ordre libre) ;
 * - champ COMPLEXE : forme réduite a + bi (contrôles communs du chapitre, `saisieComplexe.ts`).
 * Refusés SANS tentative : saisie illisible, forme non réduite, valeur décimale approchée d'une
 * valeur exacte non décimale, angle en degrés.
 */

export type StatutChampComplexes = "correct" | "faux";

export interface DiagnosticCorrection {
  /** Message d'une saisie qui NE consomme PAS de tentative ; `null` si elle a été vérifiée. */
  nonCompte: string | null;
  statuts: StatutChampComplexes[];
}

const EPS = 1e-6;

export const MESSAGE_ILLISIBLE_REEL =
  "Saisie non reconnue — écris par exemple 6, −2, 2√3, 8/3 ou 2π/3 (virgule décimale acceptée). Cette saisie ne compte pas comme une tentative.";
export const MESSAGE_APPROCHE = "Donne la valeur exacte (avec √, π ou une fraction), pas une valeur arrondie. Cette saisie ne compte pas comme une tentative.";
export const MESSAGE_DEGRES = "Donne l'angle en radians (avec π), pas en degrés. Cette saisie ne compte pas comme une tentative.";

/** Ce qui suit un éventuel préfixe recopié (« |z| = », « z = »). */
function sansPrefixe(texte: string): string {
  return normaliserSigneMoins(texte).replace(/^[^=]*=/, "").trim();
}

export function lireReel(texte: string): number | null {
  const s = sansPrefixe(texte);
  if (s === "") return null;
  const v = evaluerValeurExponentielle(s);
  return v === null || !Number.isFinite(v) ? null : v;
}

function egalReel(v: number, c: Extract<ChampDetectiveComplexes, { genre: "reel" }>): boolean {
  if (c.angle) return Math.abs(ecartAngulaire(v, c.valeur)) <= EPS;
  return Math.abs(v - c.valeur) <= EPS * Math.max(1, Math.abs(c.valeur));
}

function procheReel(v: number, c: Extract<ChampDetectiveComplexes, { genre: "reel" }>): boolean {
  const d = c.angle ? Math.abs(ecartAngulaire(v, c.valeur)) : Math.abs(v - c.valeur);
  return d > EPS && d <= 5e-3 * Math.max(1, Math.abs(c.valeur));
}

function enDegres(v: number, c: Extract<ChampDetectiveComplexes, { genre: "reel" }>): boolean {
  if (!c.angle || c.valeur === 0) return false;
  return Math.abs(ecartAngulaire((v * Math.PI) / 180, c.valeur)) <= 1e-4 && Math.abs(v) > 3.5;
}

/** Saisie décimale (« 3,46 », « 1.73 ») : seule une telle saisie peut être « approchée ». */
const estDecimale = (texte: string) => /\d[.,]\d/.test(texte) && !/[√π]|pi|rac|sqrt/i.test(texte);

/** Statuts champ par champ contre une liste de champs (attendus OU copie). */
function comparer(champs: ChampDetectiveComplexes[], textes: string[]): StatutChampComplexes[] {
  const statuts: StatutChampComplexes[] = champs.map(() => "faux");
  const libres = champs.map((c, i) => (c.genre === "reel" && c.ensemble ? i : -1)).filter((i) => i >= 0);
  const utilises = new Set<number>();
  champs.forEach((c, i) => {
    const texte = textes[i] ?? "";
    if (c.genre === "complexe") {
      const z = evaluerValeurComplexe(sansPrefixe(texte));
      if (z && Math.abs(z.re - c.re) <= EPS && Math.abs(z.im - c.im) <= EPS) statuts[i] = "correct";
      return;
    }
    const v = lireReel(texte);
    if (v === null) return;
    if (!c.ensemble) {
      if (egalReel(v, c)) statuts[i] = "correct";
      return;
    }
    // Ensemble : la valeur doit correspondre à un attendu encore libre.
    const j = libres.find((k) => !utilises.has(k) && egalReel(v, champs[k] as Extract<ChampDetectiveComplexes, { genre: "reel" }>));
    if (j !== undefined) {
      utilises.add(j);
      statuts[i] = "correct";
    }
  });
  return statuts;
}

/** Message d'une saisie qui NE consomme PAS de tentative ; `null` si elle peut être vérifiée. */
export function messageNonCompte(e: DonneesDetectiveComplexes, textes: string[]): string | null {
  const champs = champsCorrection(e);
  for (let i = 0; i < champs.length; i++) {
    const c = champs[i]!;
    const texte = textes[i] ?? "";
    if (c.genre === "complexe") {
      const m = prevaliderSaisiesComplexes([sansPrefixe(texte)]);
      if (m) return m;
      continue;
    }
    const v = lireReel(texte);
    if (v === null) return MESSAGE_ILLISIBLE_REEL;
    const cibles = c.ensemble ? champs.filter((k): k is Extract<ChampDetectiveComplexes, { genre: "reel" }> => k.genre === "reel" && k.ensemble) : [c];
    if (cibles.some((k) => egalReel(v, k))) continue;
    if (cibles.some((k) => enDegres(v, k))) return MESSAGE_DEGRES;
    if (estDecimale(texte) && cibles.some((k) => k.exacteNonDecimale && procheReel(v, k))) return MESSAGE_APPROCHE;
  }
  return null;
}

export function diagnostiquerCorrection(e: DonneesDetectiveComplexes, textes: string[]): DiagnosticCorrection {
  const nonCompte = messageNonCompte(e, textes);
  if (nonCompte) return { nonCompte, statuts: [] };
  return { nonCompte: null, statuts: comparer(champsCorrection(e), textes) };
}

export function verifierLigne(e: DonneesDetectiveComplexes, indice: number): boolean {
  return indice === indiceLigneFausse(e);
}

export function verifierDescription(e: DonneesDetectiveComplexes, choix: IdDescriptionComplexes): boolean {
  return choix === descriptionCorrecte(e);
}

/** Les saisies reprennent les valeurs (fausses) de la copie : l'erreur n'a pas été corrigée. */
export function estResultatCopie(e: DonneesDetectiveComplexes, textes: string[]): boolean {
  const copie = champsCorrection(e, true);
  const bons = comparer(champsCorrection(e), textes);
  if (bons.every((s) => s === "correct")) return false;
  return comparer(copie, textes).every((s) => s === "correct");
}
