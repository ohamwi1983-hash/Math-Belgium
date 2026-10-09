import type { ValeurExacte } from "../core6e/cyclometrique.types";
import type { ExerciceRacinesA, ExerciceRacinesB, ExerciceRacinesC, ExerciceRacinesNiemes, RacineExacte } from "../core6e/racinesNiemes.types";
import type { IdRelationRacineUnite } from "../moteur6e/verificationRacinesNiemes";
import { OPTIONS_RELATION_C } from "../moteur6e/verificationRacinesNiemes";
import type { PhaseRacinesNiemes, ResultatExerciceRacinesNiemes } from "../moteur6e/typesRacinesNiemes";
import { phasesPourExercice } from "../moteur6e/typesRacinesNiemes";

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
  const prefixe = r === 1 ? "" : `${r}`;
  return `${prefixe}\\left(\\cos(${angleLatex})+i\\sin(${angleLatex})\\right)`;
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
function formatModuleRadical(a: number, b: number): string {
  const carre = a * a + b * b;
  const racineEntiere = Math.round(Math.sqrt(carre));
  if (racineEntiere * racineEntiere === carre) return `${racineEntiere}`;
  return `\\sqrt{${carre}}`;
}

function formatListeRacinesLatex(racines: RacineExacte[], symbole: string): string[] {
  return racines.map((r, i) => `${symbole}_{${i}}=${assembleRacineLatex(r.re, r.im)}`);
}

const LIBELLE_RELATION_C: Record<IdRelationRacineUnite, string> = {
  correct: "z=w\\cdot\\zeta_k",
  somme: "z=w+\\zeta_k",
  sansW: "z=\\zeta_k",
};

export { LIBELLE_RELATION_C, OPTIONS_RELATION_C };

// ============================================================================
// Famille A — Racines n-ièmes, cas propre.
// ============================================================================

export function consigneGeneraleA(): string {
  return "Calcule les n racines n-ièmes du nombre complexe w, sachant que son module et son argument sont remarquables (le résultat final se convertit toujours en forme a+bi).";
}
export function blocDonneesA(e: ExerciceRacinesA): string[] {
  return [`w=${formatWTrig(e.r, e.angle.latex)}`, `n=${e.n}`];
}
export function consigneEcranA(phase: PhaseRacinesNiemes): string {
  if (phase === "aEcran1") return "Calcule le module r et l'argument θ de w.";
  if (phase === "aEcran2") return "Calcule le module commun des n racines (r^{1/n}) et pose la formule générale de leur argument, avec k comme paramètre entier (k=0,...,n-1).";
  return "Liste les n racines (k=0,...,n-1), converties en forme a+bi : donne la partie réelle et la partie imaginaire de chacune, séparément.";
}
export function etatActuelA(e: ExerciceRacinesA, phase: PhaseRacinesNiemes): string[] | null {
  const rThetaConfirmes = `r=${e.r}\\text{, }\\theta=${e.angle.latex}\\text{ (confirmés)}`;
  if (phase === "aEcran2") return [rThetaConfirmes];
  // Écran 3 : cumule r/θ (écran 1) ET le module/argument des racines (écran 2), du plus ancien au
  // plus récent — jamais seulement l'écran immédiatement précédent (audit transversal "état actuel
  // cumulatif").
  if (phase === "aEcran3") return [rThetaConfirmes, `\\text{Module des racines confirmé : }${e.kModule}\\text{, }\\quad\\theta_k=\\frac{${e.angle.latex}+2k\\pi}{${e.n}}\\text{ (confirmée)}`];
  return null;
}
export function champsA(phase: PhaseRacinesNiemes): ChampDef[] {
  if (phase === "aEcran1") return [{ type: "texte", label: "r =", placeholder: "ex : 4" }, { type: "texte", label: "θ =", placeholder: "ex : pi/3" }];
  if (phase === "aEcran2") return [{ type: "texte", label: "Module des racines =", placeholder: "ex : 2" }, { type: "texte", label: "θ_k (en k) =", placeholder: "ex : (pi/3+2*k*pi)/3" }];
  return [];
}
export function niveauAideMaxA(phase: PhaseRacinesNiemes): number {
  return phase === "aEcran2" ? 2 : 0;
}
export function aideNiveau1A(phase: PhaseRacinesNiemes): AideAvecLatex {
  if (phase !== "aEcran2") return AUCUNE_AIDE;
  return { texte: "Les n racines n-ièmes ont TOUTES le même module (r^{1/n}), et leurs arguments sont régulièrement espacés de 2π/n sur le cercle trigonométrique.", latex: null };
}
export function aideNiveau2A(e: ExerciceRacinesA, phase: PhaseRacinesNiemes): AideAvecLatex {
  if (phase !== "aEcran2") return AUCUNE_AIDE;
  return { texte: "Module des racines déjà donné (formule de l'argument non posée) :", latex: `${e.kModule}` };
}

// ============================================================================
// Famille B — Racines n-ièmes, cas général.
// ============================================================================

export function consigneGeneraleB(): string {
  return "Détermine les n racines n-ièmes du nombre complexe w, dont le module et l'argument ne sont pas nécessairement remarquables.";
}
export function blocDonneesB(e: ExerciceRacinesB): string[] {
  return [`w=${formatABPlain(e.a, e.b)}`, `n=${e.n}`];
}
export function consigneEcranB(phase: PhaseRacinesNiemes): string {
  if (phase === "bEcran1") return "Calcule le module r et l'argument θ de w (une forme symbolique, ex. arctan(...), est acceptée si la valeur n'est pas remarquable).";
  return "Donne le module commun et l'argument (en fonction du paramètre entier k, k=0,...,n-1) des n racines — la forme trigonométrique/exponentielle générale EST la réponse finale ici, aucune conversion en a+bi n'est exigée ni possible en général.";
}
export function etatActuelB(e: ExerciceRacinesB, phase: PhaseRacinesNiemes): string[] | null {
  if (phase !== "bEcran2") return null;
  return [`r=${formatModuleRadical(e.a, e.b)}\\text{, }\\theta=${e.angle.latex}\\text{ (confirmés)}`];
}
export function champsB(phase: PhaseRacinesNiemes): ChampDef[] {
  if (phase === "bEcran1") return [{ type: "texte", label: "r =", placeholder: "ex : sqrt(5)" }, { type: "texte", label: "θ =", placeholder: "ex : atan(2)" }];
  return [{ type: "texte", label: "Module des racines (en k) =", placeholder: "ex : 5^(1/4)" }, { type: "texte", label: "Argument des racines (en k) =", placeholder: "ex : (atan(2)+2*k*pi)/4" }];
}
export function niveauAideMaxB(phase: PhaseRacinesNiemes): number {
  return phase === "bEcran2" ? 2 : 0;
}
export function aideNiveau1B(phase: PhaseRacinesNiemes): AideAvecLatex {
  if (phase !== "bEcran2") return AUCUNE_AIDE;
  return { texte: "La forme trigonométrique/exponentielle générale (module + argument en fonction de k) EST la réponse finale attendue ici — aucune simplification supplémentaire n'est possible ni exigée.", latex: null };
}
export function aideNiveau2B(e: ExerciceRacinesB, phase: PhaseRacinesNiemes): AideAvecLatex {
  if (phase !== "bEcran2") return AUCUNE_AIDE;
  return { texte: "Module des racines et pas angulaire rappelés (formule complète non assemblée) :", latex: `\\sqrt[${e.n}]{r}\\text{, pas angulaire }=\\frac{2\\pi}{${e.n}}` };
}

// ============================================================================
// Famille C — zⁿ=wⁿ, astuce racine de l'unité.
// ============================================================================

export function consigneGeneraleC(): string {
  return "Résous l'équation zⁿ=wⁿ en reconnaissant que z/w doit être une racine n-ième de l'unité (jamais en calculant directement wⁿ).";
}
export function blocDonneesC(e: ExerciceRacinesC): string[] {
  return [`w=${formatWTrig(e.r, e.angle.latex)}`, `z^{${e.n}}=w^{${e.n}}`];
}
export function consigneEcranC(phase: PhaseRacinesNiemes): string {
  if (phase === "cEcran1") return "Si zⁿ=wⁿ alors (z/w)ⁿ=1 : reconnais la relation qui en découle entre z, w et une racine n-ième de l'unité ζ_k.";
  if (phase === "cEcran2") return "Donne les n racines n-ièmes de l'unité ζ_k=\\cos(2kπ/n)+i\\sin(2kπ/n), pour k=0,...,n-1 (partie réelle et partie imaginaire séparées).";
  return "Multiplie w par chaque racine de l'unité CONFIRMÉE pour obtenir les n solutions z_k=w·ζ_k, converties en forme a+bi.";
}
export function etatActuelC(e: ExerciceRacinesC, phase: PhaseRacinesNiemes): string[] | null {
  const relationConfirmee = `\\text{Relation confirmée : }${LIBELLE_RELATION_C.correct}`;
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
  return { texte: "Si zⁿ=wⁿ, alors (z/w)ⁿ=1 : z/w est donc une racine n-ième de l'unité.", latex: null };
}
export function aideNiveau2C(phase: PhaseRacinesNiemes): AideAvecLatex {
  if (phase !== "cEcran1") return AUCUNE_AIDE;
  return { texte: "Relation qui en découle (ζ_k pas encore déterminé) :", latex: LIBELLE_RELATION_C.correct };
}

// ============================================================================
// Dispatch commun (mirroir 6gen37).
// ============================================================================

export function consigneGenerale(exercice: ExerciceRacinesNiemes): string {
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

export function consigneEcran(exercice: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes): string {
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
  cEcran1: "Étape 1 (relation z=w·ζ_k)",
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
      if (phase === "aEcran1") return [`r=${exercice.r}\\text{, }\\theta=${exercice.angle.latex}`];
      if (phase === "aEcran2") return [`\\text{Module}=${exercice.kModule}\\text{, }\\theta_k=\\frac{${exercice.angle.latex}+2k\\pi}{${exercice.n}}`];
      return formatListeRacinesLatex(exercice.racines, "z");
    case "B":
      if (phase === "bEcran1") return [`r=${formatModuleRadical(exercice.a, exercice.b)}\\text{, }\\theta=${exercice.angle.latex}`];
      return [`\\text{Module}=\\sqrt[${exercice.n}]{r}\\text{, }\\theta_k=\\frac{${exercice.angle.latex}+2k\\pi}{${exercice.n}}`];
    case "C":
      if (phase === "cEcran1") return [LIBELLE_RELATION_C.correct];
      if (phase === "cEcran2") return formatListeRacinesLatex(exercice.zetas, "\\zeta");
      return formatListeRacinesLatex(exercice.racines, "z");
  }
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice : 3 pour A/C, 2 pour B). */
export function calculerTotalPointsRacinesNiemes(resultat: ResultatExerciceRacinesNiemes): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
