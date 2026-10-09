import type { ExerciceVolumeA, ExerciceVolumeB, ExerciceVolumeC, ExerciceVolumeD, ExerciceVolumesRevolution, TermeDeveloppe } from "../core6e/volumesRevolution.types";
import type { PhaseVolumesRevolution, ResultatExerciceVolumesRevolution } from "../moteur6e/typesVolumesRevolution";
import { phasesPourExercice } from "../moteur6e/typesVolumesRevolution";
import { carreTermes } from "../generateurs6e/volumesRevolution/polynome";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen27`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatCalculAires.ts` (6gen26).
 *
 * **Vigilance signe orphelin (bug déjà rencontré et corrigé sur 6gen23, fix généralisé par
 * 6gen26)** : DEUX SEULES fonctions assemblent un terme signé complet — `termeVolumeLatex`
 * (développement) et `primitiveTermeVolumeLatex` (primitive) — TOUJOURS signe+magnitude ENSEMBLE,
 * jamais un helper "signe seul" utilisé nu ailleurs dans ce fichier. Testé par une régression
 * dédiée dès le premier jet (`formatVolumesRevolution.test.ts`, "aucun signe/groupe vide dans le
 * LaTeX généré", des centaines de tirages aléatoires sur les 4 familles).
 *
 * Couche ui ↔ Couche A libre (CLAUDE.md) : `carreTermes` (`generateurs6e/volumesRevolution/
 * polynome.ts`) est réutilisée pour l'aide niveau 2 de la famille C (afficher sup(x)²/inf(x)²
 * séparément), jamais réimplémentée.
 */

export type TypeChamp = "texte" | "choix";

export interface OptionChoix {
  valeur: string;
  label: string;
}

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
  options?: OptionChoix[];
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

// ============================================================================
// Petits formateurs numériques/LaTeX partagés.
// ============================================================================

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

/** Magnitude (toujours POSITIVE) d'une fraction irréductible num/den — jamais le signe, voir
 * `termeVolumeLatex`/`primitiveTermeVolumeLatex` pour l'assemblage sign+magnitude complet. */
function magnitudeFractionLatex(num: number, den: number): string {
  let n = Math.abs(num);
  let d = Math.abs(den);
  if (n === 0) return "0";
  const g = pgcd(n, d);
  n /= g;
  d /= g;
  return d === 1 ? `${n}` : `\\dfrac{${n}}{${d}}`;
}

/** Arrondi à 3 décimales pour affichage (récapitulatif/aide) — jamais utilisé pour la vérification
 * (qui reste exacte, tolérance `moteur6e/`). */
function valeurArrondie(x: number): number {
  return Math.round(x * 1000) / 1000;
}

/** Valeur numérique approchée en LaTeX, toujours préfixée `\approx` : les volumes de ce générateur
 * contiennent systématiquement un facteur π, jamais représentable exactement par une fraction
 * décimale. */
function nombreLatex(x: number): string {
  return `\\approx ${valeurArrondie(x)}`;
}

/** Terme signé COMPLET (signe + magnitude) du DÉVELOPPEMENT — jamais le signe seul (voir en-tête
 * de fichier). Couvre les 4 formes `TermeA` réellement produites par ce générateur
 * (puissance/constante/expX/cosX) + les 2 formes additionnelles `expRate2`/`cosRate2`. */
function termeVolumeLatex(t: TermeDeveloppe, premier: boolean): string {
  const abs = Math.abs(t.coef);
  const s = t.coef < 0 ? (premier ? "-" : " - ") : premier ? "" : " + ";
  switch (t.type) {
    case "constante":
      return `${s}${abs}`;
    case "puissance": {
      const corps = t.n === 1 ? "x" : `x^{${t.n}}`;
      return `${s}${abs === 1 ? "" : abs}${corps}`;
    }
    case "expX":
      return `${s}${abs === 1 ? "" : abs}e^{x}`;
    case "expRate2":
      return `${s}${abs === 1 ? "" : abs}e^{2x}`;
    case "cosX":
      return `${s}${abs === 1 ? "" : abs}\\cos(x)`;
    case "cosRate2":
      return `${s}${abs === 1 ? "" : abs}\\cos(2x)`;
    default:
      // Formes `TermeA` jamais produites par CE générateur (invX/baseX/arctanTerme/arcsinTerme) —
      // gardé uniquement pour l'exhaustivité du switch TypeScript (`TermeDeveloppe` ⊇ `TermeA`).
      return `${s}${abs}`;
  }
}

/** Somme de `TermeDeveloppe` en LaTeX — `"0"` si vide (jamais une chaîne vide, qui produirait un
 * groupe KaTeX vide). */
function sommeVolumeLatex(termes: TermeDeveloppe[]): string {
  if (termes.length === 0) return "0";
  return termes.map((t, i) => termeVolumeLatex(t, i === 0)).join("");
}

/** Développement PARTIEL — tous les termes sauf le dernier, suivi de "…" (aide niveau 2, familles
 * A/B) : jamais le développement complet (ce serait donner la réponse), jamais un terme unique
 * incompréhensible pour un développement à 1 seul terme (auquel cas la somme entière est montrée,
 * rien à cacher). */
function developpementPartielLatex(developpe: TermeDeveloppe[]): string {
  if (developpe.length <= 1) return sommeVolumeLatex(developpe);
  return `${sommeVolumeLatex(developpe.slice(0, -1))} + \\ldots`;
}

/** Terme signé COMPLET (signe + magnitude) de la PRIMITIVE d'un `TermeDeveloppe` — jamais le signe
 * seul. La primitive de chaque forme est une fraction éventuellement non entière
 * (`magnitudeFractionLatex`), jamais stockée en décimal (CLAUDE.md). */
function primitiveTermeVolumeLatex(t: TermeDeveloppe, premier: boolean): string {
  let num: number;
  let den: number;
  let corps: string;
  switch (t.type) {
    case "constante":
      num = t.coef;
      den = 1;
      corps = "x";
      break;
    case "puissance": {
      const n = t.n as number;
      num = t.coef;
      den = n + 1;
      corps = n + 1 === 1 ? "x" : `x^{${n + 1}}`;
      break;
    }
    case "expX":
      num = t.coef;
      den = 1;
      corps = "e^{x}";
      break;
    case "expRate2":
      num = t.coef;
      den = 2;
      corps = "e^{2x}";
      break;
    case "cosX":
      num = t.coef;
      den = 1;
      corps = "\\sin(x)";
      break;
    case "cosRate2":
      num = t.coef;
      den = 2;
      corps = "\\sin(2x)";
      break;
    default:
      num = t.coef;
      den = 1;
      corps = "";
  }
  const negatif = num < 0 !== den < 0;
  const s = negatif ? (premier ? "-" : " - ") : premier ? "" : " + ";
  const magnitude = magnitudeFractionLatex(num, den);
  return magnitude === "1" ? `${s}${corps}` : `${s}${magnitude}${corps}`;
}

/** Primitive complète (constante nulle) d'une somme de `TermeDeveloppe`, en LaTeX. */
function sommePrimitiveVolumeLatex(termes: TermeDeveloppe[]): string {
  if (termes.length === 0) return "0";
  return termes.map((t, i) => primitiveTermeVolumeLatex(t, i === 0)).join("");
}

const OPTIONS_ORDRE: OptionChoix[] = [
  { valeur: "fSurG", label: "f(x) ≥ g(x)" },
  { valeur: "gSurF", label: "g(x) ≥ f(x)" },
];

// ============================================================================
// Famille A — Volume par rotation d'une courbe seule, bornes données.
// ============================================================================

function fLatexA(exercice: ExerciceVolumeA): string {
  return sommeVolumeLatex(exercice.termes);
}

export function consigneGeneraleA(): string {
  return "On effectue une rotation de la courbe de f, sur l'intervalle [a;b] donné, autour de l'axe des abscisses. Le volume du solide obtenu vaut V = π∫[a;b] f(x)² dx. On calcule ce volume étape par étape.";
}
export function blocDonneesA(exercice: ExerciceVolumeA): string[] {
  return [`f(x)=${fLatexA(exercice)}`, `a=${exercice.a}\\text{, }b=${exercice.b}`];
}
export function consigneEcranA(phase: PhaseVolumesRevolution): string {
  if (phase === "aEcran1") return "Développe et simplifie f(x)² (utilise l'identité cos²x=(1+cos2x)/2 si f est trigonométrique).";
  if (phase === "aEcran2") return "Calcule la primitive de l'expression développée de f(x)², confirmée à l'étape précédente.";
  return "Évalue cette primitive entre a et b, puis multiplie par π, pour obtenir le volume V.";
}
export function etatActuelA(exercice: ExerciceVolumeA, phase: PhaseVolumesRevolution): string[] | null {
  if (phase === "aEcran2") return [`f(x)^2=${sommeVolumeLatex(exercice.developpe)}`];
  if (phase === "aEcran3") return [`f(x)^2=${sommeVolumeLatex(exercice.developpe)}`, `\\text{Primitive}=${sommePrimitiveVolumeLatex(exercice.developpe)}`];
  return null;
}
export function champsA(phase: PhaseVolumesRevolution): ChampDef[] {
  if (phase === "aEcran1") return [{ type: "texte", label: "f(x)² développée et simplifiée =", placeholder: "ex : x^2+4x+4" }];
  if (phase === "aEcran2") return [{ type: "texte", label: "Primitive de f(x)² =", placeholder: "ex : x^3/3+2x^2+4x" }];
  return [{ type: "texte", label: "V =", placeholder: "ex : 7*pi/3" }];
}
export function niveauAideMaxA(phase: PhaseVolumesRevolution): number {
  return phase === "aEcran1" ? 2 : 0;
}
export function aideNiveau1A(phase: PhaseVolumesRevolution): AideAvecLatex {
  if (phase === "aEcran1") return { texte: "Il faut TOUJOURS développer f(x)² avant de chercher une primitive — jamais intégrer un carré non développé directement, sauf s'il correspond déjà à une forme composée reconnue.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2A(exercice: ExerciceVolumeA, phase: PhaseVolumesRevolution): AideAvecLatex {
  if (phase === "aEcran1") return { texte: "Développement partiellement effectué :", latex: developpementPartielLatex(exercice.developpe) };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille B — Volume par rotation, bornes à trouver.
// ============================================================================

export function consigneGeneraleB(): string {
  return "On effectue une rotation de la courbe de f, sur l'intervalle délimité par ses racines (aucune borne n'est donnée dans l'énoncé), autour de l'axe des abscisses. Le volume du solide obtenu vaut V = π∫ f(x)² dx.";
}
export function blocDonneesB(exercice: ExerciceVolumeB): string[] {
  return [`f(x)=${sommeVolumeLatex(exercice.termes)}`];
}
export function consigneEcranB(phase: PhaseVolumesRevolution): string {
  if (phase === "bEcran1") return "Trouve les racines de f — ce sont les bornes du volume (aucune borne n'est donnée dans l'énoncé).";
  if (phase === "bEcran2") return "Développe et simplifie f(x)², à partir des racines confirmées à l'étape précédente.";
  if (phase === "bEcran3") return "Calcule la primitive de l'expression développée de f(x)², confirmée à l'étape précédente.";
  return "Évalue cette primitive entre les racines, puis multiplie par π, pour obtenir le volume V.";
}
export function etatActuelB(exercice: ExerciceVolumeB, phase: PhaseVolumesRevolution): string[] | null {
  const racines = `r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`;
  if (phase === "bEcran2") return [racines];
  if (phase === "bEcran3") return [racines, `f(x)^2=${sommeVolumeLatex(exercice.developpe)}`];
  if (phase === "bEcran4") return [racines, `f(x)^2=${sommeVolumeLatex(exercice.developpe)}`, `\\text{Primitive}=${sommePrimitiveVolumeLatex(exercice.developpe)}`];
  return null;
}
export function champsB(phase: PhaseVolumesRevolution): ChampDef[] {
  if (phase === "bEcran2") return [{ type: "texte", label: "f(x)² développée et simplifiée =", placeholder: "ex : x^4-8x^3+22x^2-24x+9" }];
  if (phase === "bEcran3") return [{ type: "texte", label: "Primitive de f(x)² =", placeholder: "ex : x^5/5-2x^4" }];
  if (phase === "bEcran4") return [{ type: "texte", label: "V =", placeholder: "ex : 16*pi/15" }];
  return []; // bEcran1 : géré par le composant add-as-needed dédié, jamais par champsEcran.
}
export function niveauAideMaxB(phase: PhaseVolumesRevolution): number {
  return phase === "bEcran2" ? 2 : 0;
}
export function aideNiveau1B(phase: PhaseVolumesRevolution): AideAvecLatex {
  if (phase === "bEcran2") return aideNiveau1A("aEcran1");
  return AUCUNE_AIDE;
}
export function aideNiveau2B(exercice: ExerciceVolumeB, phase: PhaseVolumesRevolution): AideAvecLatex {
  if (phase === "bEcran2") return { texte: "Développement partiellement effectué :", latex: developpementPartielLatex(exercice.developpe) };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille C — Volume entre une courbe et une droite.
// ============================================================================

/** `termesSup`/`termesInf` (choisis selon `ordre`) — utilisés par l'aide niveau 2 (sup(x)²/inf(x)²
 * affichés séparément) ET disponibles pour tout futur besoin d'affichage distinct de f/g. */
function termesSupInf(exercice: ExerciceVolumeC): { sup: ExerciceVolumeC["termesF"]; inf: ExerciceVolumeC["termesF"] } {
  return exercice.ordre === "fSurG" ? { sup: exercice.termesF, inf: exercice.termesG } : { sup: exercice.termesG, inf: exercice.termesF };
}

export function consigneGeneraleC(): string {
  return "On effectue une rotation, autour de l'axe des abscisses, du domaine compris entre la courbe de f et la droite g. Le volume du solide obtenu vaut V = π∫[a;b] (sup(x)²−inf(x)²) dx, où sup désigne la fonction au-dessus de l'autre sur l'intervalle.";
}
export function blocDonneesC(exercice: ExerciceVolumeC): string[] {
  return [`f(x)=${sommeVolumeLatex(exercice.termesF)}`, `g(x)=${sommeVolumeLatex(exercice.termesG)}`];
}
export function consigneEcranC(phase: PhaseVolumesRevolution): string {
  if (phase === "cEcran1") return "Trouve les points d'intersection de f et g — ce sont les bornes du volume.";
  if (phase === "cEcran2") return "Détermine laquelle des 2 courbes est au-dessus de l'autre sur l'intervalle.";
  if (phase === "cEcran3") return "Pose V=π∫[a;b](sup(x)²−inf(x)²)dx et développe, à partir de l'ordre confirmé à l'étape précédente.";
  return "Calcule la primitive puis évalue-la entre les bornes, en multipliant par π, à partir de la forme développée confirmée.";
}
export function etatActuelC(exercice: ExerciceVolumeC, phase: PhaseVolumesRevolution): string[] | null {
  const bornes = `r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`;
  if (phase === "cEcran2") return [bornes];
  if (phase === "cEcran3") {
    const ordreLatex = exercice.ordre === "fSurG" ? "f(x)\\geq g(x)" : "g(x)\\geq f(x)";
    return [bornes, `\\text{Ordre confirmé : }${ordreLatex}`];
  }
  if (phase === "cEcran4") {
    const ordreLatex = exercice.ordre === "fSurG" ? "f(x)\\geq g(x)" : "g(x)\\geq f(x)";
    return [bornes, `\\text{Ordre confirmé : }${ordreLatex}`, `\\text{sup}(x)^2-\\text{inf}(x)^2=${sommeVolumeLatex(exercice.developpe)}`];
  }
  return null;
}
export function champsC(phase: PhaseVolumesRevolution): ChampDef[] {
  if (phase === "cEcran2") return [{ type: "choix", label: "Quelle courbe est au-dessus sur l'intervalle ?", options: OPTIONS_ORDRE }];
  if (phase === "cEcran3") return [{ type: "texte", label: "sup(x)²−inf(x)² développée =", placeholder: "ex : 1-x^4" }];
  if (phase === "cEcran4") return [{ type: "texte", label: "V =", placeholder: "ex : 16*pi/15" }];
  return []; // cEcran1 : composant add-as-needed dédié.
}
export function niveauAideMaxC(phase: PhaseVolumesRevolution): number {
  return phase === "cEcran3" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseVolumesRevolution): AideAvecLatex {
  if (phase === "cEcran3") return { texte: "Le volume entre deux courbes utilise TOUJOURS (sup²−inf²), jamais (sup−inf)² — ce ne sont pas la même expression.", latex: "\\text{sup}(x)^2-\\text{inf}(x)^2 \\;\\neq\\; (\\text{sup}(x)-\\text{inf}(x))^2" };
  return AUCUNE_AIDE;
}
export function aideNiveau2C(exercice: ExerciceVolumeC, phase: PhaseVolumesRevolution): AideAvecLatex {
  if (phase !== "cEcran3") return AUCUNE_AIDE;
  const { sup, inf } = termesSupInf(exercice);
  const supCarre = sommeVolumeLatex(carreTermes(sup));
  const infCarre = sommeVolumeLatex(carreTermes(inf));
  return { texte: "sup(x)² et inf(x)², séparément — la différence n'est pas encore faite :", latex: `\\text{sup}(x)^2=${supCarre}\\text{, }\\text{inf}(x)^2=${infCarre}` };
}

// ============================================================================
// Famille D — Comparaison à un cylindre englobant.
// ============================================================================

/** Coefficient de f(x)=k√x — omis quand k=1 (jamais "1√x"), même convention que tous les autres
 * coefficients de magnitude 1 de ce fichier (`termeVolumeLatex`/`primitiveTermeVolumeLatex`). */
function kLatexD(exercice: ExerciceVolumeD): string {
  const magnitude = magnitudeFractionLatex(exercice.kNum, exercice.kDen);
  return magnitude === "1" ? "" : magnitude;
}

export function consigneGeneraleD(): string {
  return "On effectue une rotation, autour de l'axe des abscisses, de la courbe de f(x)=k√x sur [0;L] (un paraboloïde). On compare son volume à celui du cylindre englobant, de rayon f(L) et de hauteur L.";
}
export function blocDonneesD(exercice: ExerciceVolumeD): string[] {
  return [`f(x)=${kLatexD(exercice)}\\sqrt{x}`, `\\text{Intervalle : }[0\\text{ ; }${exercice.L}]`];
}
export function consigneEcranD(phase: PhaseVolumesRevolution): string {
  if (phase === "dEcran1") return "Calcule le volume du paraboloïde : V = π∫[0;L] k²x dx.";
  if (phase === "dEcran2") return "Calcule le volume du cylindre englobant (rayon = f(L) = k√L, hauteur = L).";
  return "Calcule le rapport des deux volumes confirmés aux étapes précédentes — que remarques-tu ?";
}
export function etatActuelD(exercice: ExerciceVolumeD, phase: PhaseVolumesRevolution): string[] | null {
  if (phase === "dEcran2") return [`V_{parabo}${nombreLatex(exercice.volumeParaboloide)}`];
  if (phase === "dEcran3") return [`V_{parabo}${nombreLatex(exercice.volumeParaboloide)}`, `V_{cyl}${nombreLatex(exercice.volumeCylindre)}`];
  return null;
}
export function champsD(phase: PhaseVolumesRevolution): ChampDef[] {
  if (phase === "dEcran1") return [{ type: "texte", label: "V(paraboloïde) =", placeholder: "ex : 8*pi" }];
  if (phase === "dEcran2") return [{ type: "texte", label: "V(cylindre) =", placeholder: "ex : 16*pi" }];
  return [{ type: "texte", label: "Rapport V(paraboloïde) / V(cylindre) =", placeholder: "ex : 1/2" }];
}
export function niveauAideMaxD(phase: PhaseVolumesRevolution): number {
  return phase === "dEcran3" ? 2 : 0;
}
export function aideNiveau1D(phase: PhaseVolumesRevolution): AideAvecLatex {
  if (phase === "dEcran3") return { texte: "Divise le volume du paraboloïde par celui du cylindre.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2D(exercice: ExerciceVolumeD, phase: PhaseVolumesRevolution): AideAvecLatex {
  if (phase === "dEcran3") return { texte: "Les 2 volumes trouvés aux étapes précédentes, côte à côte (la division n'est pas encore faite) :", latex: `V_{parabo}${nombreLatex(exercice.volumeParaboloide)}\\text{, }V_{cyl}${nombreLatex(exercice.volumeCylindre)}` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceVolumesRevolution): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
    case "D":
      return consigneGeneraleD();
  }
}

export function blocDonnees(exercice: ExerciceVolumesRevolution): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
  }
}

export function consigneEcran(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD(phase);
  }
}

export function etatActuel(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return etatActuelD(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(phase);
    case "B":
      return champsB(phase);
    case "C":
      return champsC(phase);
    case "D":
      return champsD(phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
    case "D":
      return niveauAideMaxD(phase);
  }
}

export function aideNiveau1(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(phase);
    case "B":
      return aideNiveau1B(phase);
    case "C":
      return aideNiveau1C(phase);
    case "D":
      return aideNiveau1D(phase);
  }
}

export function aideNiveau2(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice, phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
    case "D":
      return aideNiveau2D(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseVolumesRevolution, string> = {
  aEcran1: "Étape 1 (développer f²)",
  aEcran2: "Étape 2 (primitive)",
  aEcran3: "Étape 3 (volume V)",
  bEcran1: "Étape 1 (racines)",
  bEcran2: "Étape 2 (développer f²)",
  bEcran3: "Étape 3 (primitive)",
  bEcran4: "Étape 4 (volume V)",
  cEcran1: "Étape 1 (intersections)",
  cEcran2: "Étape 2 (ordre)",
  cEcran3: "Étape 3 (développer sup²−inf²)",
  cEcran4: "Étape 4 (volume V)",
  dEcran1: "Étape 1 (volume paraboloïde)",
  dEcran2: "Étape 2 (volume cylindre)",
  dEcran3: "Étape 3 (rapport)",
};

export const LIBELLE_FAMILLE: Record<ExerciceVolumesRevolution["famille"], string> = {
  A: "A — Volume par rotation, bornes données",
  B: "B — Volume par rotation, bornes à trouver",
  C: "C — Volume entre une courbe et une droite",
  D: "D — Comparaison à un cylindre englobant",
};

function volumeEntreBornes(a: number, b: number, primitiveDeveloppeReference: (x: number) => number): number {
  return Math.PI * (primitiveDeveloppeReference(b) - primitiveDeveloppeReference(a));
}

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): string[] {
  if (exercice.famille === "A") {
    if (phase === "aEcran1") return [sommeVolumeLatex(exercice.developpe)];
    if (phase === "aEcran2") return [`\\text{Primitive}=${sommePrimitiveVolumeLatex(exercice.developpe)}`];
    const v = volumeEntreBornes(exercice.a, exercice.b, exercice.primitiveDeveloppeReference);
    return [`V${nombreLatex(v)}`];
  }
  if (exercice.famille === "B") {
    if (phase === "bEcran1") return [`r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`];
    if (phase === "bEcran2") return [sommeVolumeLatex(exercice.developpe)];
    if (phase === "bEcran3") return [`\\text{Primitive}=${sommePrimitiveVolumeLatex(exercice.developpe)}`];
    const v = volumeEntreBornes(exercice.r1, exercice.r2, exercice.primitiveDeveloppeReference);
    return [`V${nombreLatex(v)}`];
  }
  if (exercice.famille === "C") {
    if (phase === "cEcran1") return [`r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`];
    if (phase === "cEcran2") return [exercice.ordre === "fSurG" ? "f(x)\\geq g(x)" : "g(x)\\geq f(x)"];
    if (phase === "cEcran3") return [sommeVolumeLatex(exercice.developpe)];
    const v = volumeEntreBornes(exercice.r1, exercice.r2, exercice.primitiveDeveloppeReference);
    return [`V${nombreLatex(v)}`];
  }
  // Famille D.
  if (phase === "dEcran1") return [`V_{parabo}${nombreLatex(exercice.volumeParaboloide)}`];
  if (phase === "dEcran2") return [`V_{cyl}${nombreLatex(exercice.volumeCylindre)}`];
  return ["\\dfrac{1}{2}"];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice). */
export function calculerTotalPointsVolumesRevolution(resultat: ResultatExerciceVolumesRevolution): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
