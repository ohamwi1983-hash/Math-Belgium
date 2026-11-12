import type { ValeurExacte } from "../core6e/cyclometrique.types";
import type { ExerciceRacinesA, ExerciceRacinesB, ExerciceRacinesC, ExerciceRacinesNiemes, RacineExacte } from "../core6e/racinesNiemes.types";
import type { IdRelationRacineUnite } from "../moteur6e/verificationRacinesNiemes";
import { OPTIONS_RELATION_C } from "../moteur6e/verificationRacinesNiemes";
import type { PhaseRacinesNiemes } from "../moteur6e/typesRacinesNiemes";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen39`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatFormeTrigonometrique.ts` (6gen37), jamais importé
 * par un autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide** (bug déjà rencontré et corrigé sur 6gen23/6gen26/
 * 6gen34/6gen37, documenté par CLAUDE.md) : `assembleRacineLatex` ci-dessous est la SEULE fonction
 * qui assemble un "a+bi" pour l'AFFICHAGE (jamais pour la vérification, qui compare toujours
 * `re.numerique`/`im.numerique` — voir `moteur6e/verificationRacinesNiemes.ts`) — assemble TOUJOURS
 * signe+magnitude ENSEMBLE, jamais un signe nu. Couverture de régression :
 * `formatRacinesNiemes.test.ts`, "signe orphelin", scanne le LaTeX rendu sur de nombreux tirages
 * aléatoires des 3 familles à la recherche d'un `++`/`+-`/`--`/groupe `{}` vide.
 */

export type TypeChamp = "texte" | "choix";

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

/** Texte brut mêlé à du LaTeX inline court — même contrat que `ui/formatEquationDroite.ts`/
 * `ui6e/formatProprietesLogarithme.ts` (dupliqué ici à dessein, convention CLAUDE.md) ; rendu via
 * `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

// ============================================================================
// Assemblage "a+bi" pour l'AFFICHAGE — voir en-tête de fichier.
// ============================================================================

function estZeroExact(v: ValeurExacte): boolean {
  return v.numerique === 0;
}
function estNegatifExact(v: ValeurExacte): boolean {
  return v.latex.startsWith("-");
}
function magnitudeExacte(v: ValeurExacte): string {
  return estNegatifExact(v) ? v.latex.slice(1) : v.latex;
}

export function assembleRacineLatex(re: ValeurExacte, im: ValeurExacte): string {
  const reZero = estZeroExact(re);
  const imZero = estZeroExact(im);
  if (reZero && imZero) return "0";
  const reTexte = reZero ? "" : `${estNegatifExact(re) ? "-" : ""}${magnitudeExacte(re)}`;
  if (imZero) return reTexte;
  const imMagnitude = magnitudeExacte(im);
  const imTexteMagnitude = imMagnitude === "1" ? "" : imMagnitude;
  if (reZero) return `${estNegatifExact(im) ? "-" : ""}${imTexteMagnitude}i`;
  return `${reTexte}${estNegatifExact(im) ? "-" : "+"}${imTexteMagnitude}i`;
}

/** `w=r(\cosθ+i\sinθ)` — module `r` entier, jamais "1" nu devant la parenthèse. */
function formatWTrig(r: number, angleLatex: string): string {
  // θ = 0 : w est le réel r — « w = 1 » et non « w = (cos(0) + i sin(0)) » (audit 6e ch. 5, point 38).
  if (angleLatex === "0") return `${r}`;
  const prefixe = r === 1 ? "" : `${r}`;
  return `${prefixe}\\left(\\cos(${angleLatex})+i\\sin(${angleLatex})\\right)`;
}

/** Argument affiché : exact s'il est remarquable, sinon arrondi à 0,01 avec la virgule (famille B —
 * `calculerArgument` renvoie alors un repli décimal, q = 10⁶, au point décimal). */
function estArgumentDecimal(angle: { q: number }): boolean {
  return angle.q === 1e6;
}
function decimalVirgule(v: number, decimales = 2): string {
  return v.toFixed(decimales).replace(".", "{,}");
}
function argumentLatex(angle: { q: number; latex: string; numerique: number }): string {
  return estArgumentDecimal(angle) ? decimalVirgule(angle.numerique) : angle.latex;
}
function egaliteArgument(angle: { q: number; latex: string; numerique: number }): string {
  return estArgumentDecimal(angle) ? `\\theta\\approx ${argumentLatex(angle)}` : `\\theta=${angle.latex}`;
}

/** Quadrant de (a ; b), en LaTeX (aide de la famille B). */
function quadrantLatex(a: number, b: number): string {
  if (a > 0 && b > 0) return "\\text{quadrant } 1\\ (a>0,\\ b>0)";
  if (a < 0 && b > 0) return "\\text{quadrant } 2\\ (a<0,\\ b>0)";
  if (a < 0 && b < 0) return "\\text{quadrant } 3\\ (a<0,\\ b<0)";
  if (a > 0 && b < 0) return "\\text{quadrant } 4\\ (a>0,\\ b<0)";
  return "\\text{sur un axe } (a=0\\text{ ou }b=0)";
}

/** `a+bi` depuis 2 entiers plats — famille B (données uniquement, jamais un champ à taper). */
function formatABPlain(a: number, b: number): string {
  if (a === 0 && b === 0) return "0";
  const aTexte = a === 0 ? "" : `${a}`;
  if (b === 0) return aTexte;
  const bSigne = b < 0 ? "-" : "+";
  const bMagnitude = Math.abs(b) === 1 ? "" : `${Math.abs(b)}`;
  if (a === 0) return `${b < 0 ? "-" : ""}${bMagnitude}i`;
  return `${aTexte}${bSigne}${bMagnitude}i`;
}

/** Module `r=√(a²+b²)` affiché en radical EXACT (jamais un décimal) — famille B, où `r` n'est pas
 * garanti entier/remarquable (voir en-tête `generateurs6e/racinesNiemes/familleB.ts`). */
/** √(a² + b²) simplifié : √20 → 2√5 (audit 6e ch. 5, point B). */
function formatModuleRadical(a: number, b: number): string {
  const carre = a * a + b * b;
  let facteur = 1;
  let reste = carre;
  for (let d = Math.floor(Math.sqrt(carre)); d >= 2; d--) {
    if (carre % (d * d) === 0) {
      facteur = d;
      reste = carre / (d * d);
      break;
    }
  }
  if (reste === 1) return `${facteur}`;
  return facteur === 1 ? `\\sqrt{${reste}}` : `${facteur}\\sqrt{${reste}}`;
}

function formatListeRacinesLatex(racines: RacineExacte[], symbole: string): string[] {
  return racines.map((r, i) => `${symbole}_{${i}}=${assembleRacineLatex(r.re, r.im)}`);
}

/** Placeholders hors des tirages (audit 6e ch. 5, point 11) : r = 7 et √7 ne sont jamais des modules
 * tirés (7 n'est ni une puissance ni une somme de deux carrés), 2π/5 n'est jamais un argument tiré,
 * atan(7) supposerait b = 7 > 6 ; ni « * », ni point décimal. */
const PH_ANGLE = "ex : 2pi/5";

const LIBELLE_RELATION_C: Record<IdRelationRacineUnite, string> = {
  correct: "z=w\\cdot\\zeta_k",
  somme: "z=w+\\zeta_k",
  sansW: "z=\\zeta_k",
};

export { LIBELLE_RELATION_C, OPTIONS_RELATION_C };

// ============================================================================
// Famille A — Racines n-ièmes, cas propre.
// ============================================================================

export function consigneGeneraleA(): FragmentConsigne[] {
  return [texte("Calcule les n racines n-ièmes du nombre complexe w, dont le module et l'argument sont remarquables, puis écris-les sous la forme "), latex("a+bi"), texte(".")];
}
export function blocDonneesA(e: ExerciceRacinesA): string[] {
  return [`w=${formatWTrig(e.r, e.angle.latex)}`, `n=${e.n}`];
}
export function consigneEcranA(phase: PhaseRacinesNiemes): FragmentConsigne[] {
  if (phase === "aEcran1") return [texte("Calcule le module r et un argument θ de w, en radians.")];
  if (phase === "aEcran2")
    return [texte("Calcule le module commun des n racines, "), latex("\\sqrt[n]{r}"), texte(", et écris leur argument en fonction de l'entier k, pour "), latex("k=0,\\ldots,n-1"), texte(".")];
  return [texte("Écris les n racines sous la forme "), latex("a+bi"), texte(" : partie réelle et partie imaginaire de chacune, dans n'importe quel ordre, en valeur exacte ou arrondie à 0,01 près.")];
}
export function etatActuelA(e: ExerciceRacinesA, phase: PhaseRacinesNiemes): string[] | null {
  const rThetaConfirmes = `r=${e.r}\\text{, }\\theta=${e.angle.latex}\\text{ (confirmés)}`;
  if (phase === "aEcran2") return [rThetaConfirmes];
  // Écran 3 : cumule r/θ (écran 1) ET le module/argument des racines (écran 2), du plus ancien au
  // plus récent — jamais seulement l'écran immédiatement précédent (audit transversal "état actuel
  // cumulatif").
  if (phase === "aEcran3") return [rThetaConfirmes, `\\text{module des racines : }${e.kModule}`, `\\theta_k=\\frac{${e.angle.latex}+2k\\pi}{${e.n}}\\text{ (confirmés)}`];
  return null;
}
export function champsA(phase: PhaseRacinesNiemes): ChampDef[] {
  if (phase === "aEcran1") return [{ type: "texte", label: "r =", placeholder: "ex : 7" }, { type: "texte", label: "θ =", placeholder: PH_ANGLE }];
  if (phase === "aEcran2") return [{ type: "texte", label: "Module des racines =", placeholder: "ex : 7" }, { type: "texte", label: "θₖ (en fonction de k) =", placeholder: "ex : (2pi/5+2k pi)/7" }];
  return [];
}
export function niveauAideMaxA(phase: PhaseRacinesNiemes): number {
  return phase === "aEcran2" ? 2 : 0;
}
export function aideNiveau1A(phase: PhaseRacinesNiemes): AideAvecLatex {
  if (phase !== "aEcran2") return AUCUNE_AIDE;
  return { texte: "Les n racines ont toutes le même module, et leurs arguments sont régulièrement espacés sur le cercle :", latex: "|z_k|=\\sqrt[n]{r}\\qquad\\text{écart entre deux arguments : }\\dfrac{2\\pi}{n}" };
}
export function aideNiveau2A(e: ExerciceRacinesA, phase: PhaseRacinesNiemes): AideAvecLatex {
  if (phase !== "aEcran2") return AUCUNE_AIDE;
  return { texte: "Module des racines (la formule de l'argument reste à écrire) :", latex: `\\sqrt[${e.n}]{${e.r}}=${e.kModule}` };
}

// ============================================================================
// Famille B — Racines n-ièmes, cas général.
// ============================================================================

export function consigneGeneraleB(): FragmentConsigne[] {
  return [texte("Détermine les n racines n-ièmes du nombre complexe w, dont le module et l'argument ne sont pas nécessairement remarquables.")];
}
export function blocDonneesB(e: ExerciceRacinesB): string[] {
  return [`w=${formatABPlain(e.a, e.b)}`, `n=${e.n}`];
}
export function consigneEcranB(phase: PhaseRacinesNiemes): FragmentConsigne[] {
  if (phase === "bEcran1")
    return [texte("Calcule le module r et un argument θ de w, en radians (calculatrice) : valeur exacte ou arrondie à 0,01 près — attention au quadrant.")];
  return [
    texte("Donne le module commun des n racines et leur argument en fonction de l'entier k ("),
    latex("k=0,\\ldots,n-1"),
    texte("), en valeur exacte ou arrondie à 0,01 près. Cette forme est la réponse finale : pas de conversion en "),
    latex("a+bi"),
    texte("."),
  ];
}
export function etatActuelB(e: ExerciceRacinesB, phase: PhaseRacinesNiemes): string[] | null {
  if (phase !== "bEcran2") return null;
  return [`r=${formatModuleRadical(e.a, e.b)}\\text{, }${egaliteArgument(e.angle)}\\text{ (confirmés)}`];
}
export function champsB(phase: PhaseRacinesNiemes): ChampDef[] {
  if (phase === "bEcran1") return [{ type: "texte", label: "r =", placeholder: "ex : sqrt(7)" }, { type: "texte", label: "θ =", placeholder: "ex : atan(7)" }];
  return [{ type: "texte", label: "Module des racines =", placeholder: "ex : 7^(1/8)" }, { type: "texte", label: "θₖ (en fonction de k) =", placeholder: "ex : (atan(7)+2k pi)/8" }];
}
export function niveauAideMaxB(phase: PhaseRacinesNiemes): number {
  void phase;
  return 2;
}
/** Écran 1 : aides sur le QUADRANT (audit 6e ch. 5, point B — la touche arctan de la calculatrice
 * donne un angle de ]−π/2 ; π/2[, faux pour a < 0). */
export function aideNiveau1B(phase: PhaseRacinesNiemes): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "La calculatrice donne un angle compris entre −π/2 et π/2 : il ne convient que si a > 0 ; sinon, ajoute ou retire π :", latex: "\\theta=\\arctan\\frac{b}{a}\\ \\text{si } a>0\\qquad\\theta=\\arctan\\frac{b}{a}\\pm\\pi\\ \\text{si } a<0" };
  return { texte: "Les n racines ont toutes le même module, et leurs arguments sont régulièrement espacés sur le cercle :", latex: "|z_k|=\\sqrt[n]{r}\\qquad\\text{écart entre deux arguments : }\\dfrac{2\\pi}{n}" };
}
export function aideNiveau2B(e: ExerciceRacinesB, phase: PhaseRacinesNiemes): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Position du point (a ; b) — l'argument reste à calculer :", latex: quadrantLatex(e.a, e.b) };
  return { texte: "Module des racines et écart entre deux arguments (la formule reste à écrire) :", latex: `\\sqrt[${e.n}]{${formatModuleRadical(e.a, e.b)}}\\qquad\\frac{2\\pi}{${e.n}}` };
}

// ============================================================================
// Famille C — zⁿ=wⁿ, astuce racine de l'unité.
// ============================================================================

export function consigneGeneraleC(): FragmentConsigne[] {
  return [texte("Résous l'équation "), latex("z^n=w^n"), texte(" en reconnaissant que "), latex("z/w"), texte(" doit être une racine n-ième de l'unité (jamais en calculant directement "), latex("w^n"), texte(").")];
}
export function blocDonneesC(e: ExerciceRacinesC): string[] {
  return [`w=${formatWTrig(e.r, e.angle.latex)}`, `z^{${e.n}}=w^{${e.n}}`];
}
export function consigneEcranC(phase: PhaseRacinesNiemes): FragmentConsigne[] {
  if (phase === "cEcran1")
    return [texte("Si "), latex("z^n=w^n"), texte(" alors "), latex("(z/w)^n=1"), texte(" : reconnais la relation qui en découle entre z, w et une racine n-ième de l'unité "), latex("\\zeta_k"), texte(".")];
  if (phase === "cEcran2")
    // Bug trouvé par audit : ce fragment contenait auparavant du vrai code source LaTeX
    // ("\\cos(2kπ/n)+i\\sin(2kπ/n)") affiché comme texte brut — les antislashs s'affichaient
    // littéralement à l'écran au lieu d'un rendu KaTeX. Même source LaTeX, désormais un fragment
    // `latex` réellement rendu par `<Katex>` via `RenduFragments`.
    return [texte("Donne les n racines n-ièmes de l'unité "), latex("\\zeta_k=\\cos\\frac{2k\\pi}{n}+i\\sin\\frac{2k\\pi}{n}"), texte(", pour "), latex("k=0,\\ldots,n-1"), texte(" : partie réelle et partie imaginaire séparées, dans n'importe quel ordre, valeur exacte ou arrondie à 0,01 près.")];
  return [texte("Multiplie w par chaque racine de l'unité confirmée pour obtenir les n solutions "), latex("z_k=w\\cdot\\zeta_k"), texte(", sous la forme "), latex("a+bi"), texte(" (dans n'importe quel ordre, valeur exacte ou arrondie à 0,01 près).")];
}
export function etatActuelC(e: ExerciceRacinesC, phase: PhaseRacinesNiemes): string[] | null {
  const relationConfirmee = `\\text{relation confirmée : }${LIBELLE_RELATION_C.correct}`;
  if (phase === "cEcran2") return [relationConfirmee];
  // Écran 3 : cumule la relation z=w·ζ_k (écran 1) ET la liste des racines de l'unité (écran 2), du
  // plus ancien au plus récent — jamais seulement l'écran immédiatement précédent (audit transversal
  // "état actuel cumulatif").
  if (phase === "cEcran3") return [relationConfirmee, ...formatListeRacinesLatex(e.zetas, "\\zeta").map((f) => `${f}\\text{ (confirmé)}`)];
  return null;
}
export function champsC(phase: PhaseRacinesNiemes): ChampDef[] {
  void phase;
  return [];
}
export function niveauAideMaxC(phase: PhaseRacinesNiemes): number {
  return phase === "cEcran1" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseRacinesNiemes): AideAvecLatex {
  if (phase !== "cEcran1") return AUCUNE_AIDE;
  return { texte: "Divise les deux membres par wⁿ (w ≠ 0) :", latex: "z^{n}=w^{n}\\ \\Rightarrow\\ \\left(\\dfrac{z}{w}\\right)^{n}=1" };
}
/** Ne donne PAS la relation (audit 6e ch. 5, point 37 : l'ancienne aide 2 l'affichait) — pose
 * seulement l'inconnue intermédiaire ; isoler z reste à faire. */
export function aideNiveau2C(phase: PhaseRacinesNiemes): AideAvecLatex {
  if (phase !== "cEcran1") return AUCUNE_AIDE;
  return { texte: "Pose u = z/w : u est l'une des racines n-ièmes de l'unité. Il reste à isoler z dans cette égalité :", latex: "u=\\dfrac{z}{w}=\\zeta_k" };
}

// ============================================================================
// Dispatch commun (mirroir 6gen37).
// ============================================================================

export function consigneGenerale(exercice: ExerciceRacinesNiemes): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
  }
}

export function blocDonnees(exercice: ExerciceRacinesNiemes): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
  }
}

export function consigneEcran(exercice: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(phase);
  }
}

export function etatActuel(exercice: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(phase);
    case "B":
      return champsB(phase);
    case "C":
      return champsC(phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
  }
}

export function aideNiveau1(exercice: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(phase);
    case "B":
      return aideNiveau1B(phase);
    case "C":
      return aideNiveau1C(phase);
  }
}

export function aideNiveau2(exercice: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice, phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseRacinesNiemes, string> = {
  aEcran1: "Étape 1 (module/argument de w)",
  aEcran2: "Étape 2 (module/argument des racines)",
  aEcran3: "Étape 3 (les n racines, forme a+bi)",
  bEcran1: "Étape 1 (module/argument de w)",
  bEcran2: "Étape 2 (formule générale des racines)",
  cEcran1: "Étape 1 (relation entre z, w et ζₖ)",
  cEcran2: "Étape 2 (racines n-ièmes de l'unité)",
  cEcran3: "Étape 3 (les n solutions, forme a+bi)",
};

export const LIBELLE_FAMILLE: Record<ExerciceRacinesNiemes["famille"], string> = {
  A: "A — Racines n-ièmes, cas propre (angles remarquables)",
  B: "B — Racines n-ièmes, cas général",
  C: "C — zⁿ=wⁿ, astuce racine de l'unité",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes): string[] {
  switch (exercice.famille) {
    case "A":
      if (phase === "aEcran1") return [`r=${exercice.r}`, `\\theta=${exercice.angle.latex}`];
      if (phase === "aEcran2") return [`\\sqrt[${exercice.n}]{${exercice.r}}=${exercice.kModule}`, `\\theta_k=\\frac{${exercice.angle.latex}+2k\\pi}{${exercice.n}}`];
      return formatListeRacinesLatex(exercice.racines, "z");
    case "B":
      if (phase === "bEcran1") return [`r=${formatModuleRadical(exercice.a, exercice.b)}`, egaliteArgument(exercice.angle)];
      // r substitué et valeurs chiffrées (audit 6e ch. 5, points B et 39).
      return [
        `\\sqrt[${exercice.n}]{${formatModuleRadical(exercice.a, exercice.b)}}\\approx ${decimalVirgule(Math.pow(exercice.r, 1 / exercice.n))}`,
        `\\theta_k${estArgumentDecimal(exercice.angle) ? "\\approx" : "="}\\frac{${argumentLatex(exercice.angle)}+2k\\pi}{${exercice.n}}`,
      ];
    case "C":
      if (phase === "cEcran1") return [LIBELLE_RELATION_C.correct];
      if (phase === "cEcran2") return formatListeRacinesLatex(exercice.zetas, "\\zeta");
      return formatListeRacinesLatex(exercice.racines, "z");
  }
}

