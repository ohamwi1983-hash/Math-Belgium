/**
 * Couche présentation (5e) — consignes/labels/aides pour 5gen15 ("Suites géométriques, formule
 * générale et termes"). REFONTE (`prompt5gen15refontefamillesbonus.md`, miroir direct de
 * `formatSuiteArithmetique.ts`, 5gen14) : `texteAideNiveau1` retourne désormais du LaTeX PUR sur
 * TOUTE phase de ce générateur (défaut transversal corrigé, pas seulement sur les 3 nouvelles
 * familles — auparavant du texte brut, ex. "uₙ = u₁ × q^(n-1).", rendu en `<p>` plutôt que
 * `<Katex>` sur les 7 sites de rendu du générateur).
 *
 * "principal" garde sa duplication B1/B2 (`statutQ==="double"`) — `brancheActive` extrait la BONNE
 * branche (u1,q) pour toute phase suffixée, jamais recalculée depuis `donnees` directement.
 *
 * Labels indexés TOUJOURS en LaTeX réel avec indice EXPLICITEMENT accolé (`u_{100}`, jamais
 * `u_100`), rendus via `<Katex>` + `field-label-minuscule` côté composants.
 */
import type {
  BrancheSuiteGeometrique,
  ExerciceAlgebriqueRangN,
  ExerciceAlgebriqueSommeSn,
  ExerciceAlgebriqueSommeSnB,
  ExerciceAlgebriqueTermeGeneral,
  ExercicePrincipalSuiteGeometrique,
  ExerciceSuiteGeometrique,
  FractionQ,
  TermeLineaire,
  TermeLineaireFractionQ,
} from "../core5e/suitesGeometriques.types";
import { additionnerFractionQ, entierVersFractionQ, multiplierFractionQ, sommeGeometriqueFinieQ, sommeInfinieExisteQ, sommeInfinieQ, termeGeometriqueQ } from "../generateurs5e/suitesGeometriques/fraction";
import { ordreComplet } from "../moteur5e/typesSuiteGeometrique";
import type { PhaseSuiteGeometrique } from "../moteur5e/typesSuiteGeometrique";

function u(indice: number | string): string {
  return `u_{${indice}}`;
}
function s(indice: number | string): string {
  return `S_{${indice}}`;
}

function commePrincipal(exercice: ExerciceSuiteGeometrique): ExercicePrincipalSuiteGeometrique {
  if (exercice.famille !== "principal") throw new Error("commePrincipal : famille hors 'principal'");
  return exercice;
}

function commeAlgebrique(exercice: ExerciceSuiteGeometrique): ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn {
  if (exercice.famille !== "algebriqueTermeGeneral" && exercice.famille !== "algebriqueSommeSn") throw new Error("commeAlgebrique : famille hors 'algebriqueTermeGeneral'/'algebriqueSommeSn'");
  return exercice;
}

function commeSommeSnB(exercice: ExerciceSuiteGeometrique): ExerciceAlgebriqueSommeSnB {
  if (exercice.famille !== "algebriqueSommeSn" || exercice.sousCas !== "B") throw new Error("commeSommeSnB : famille/sousCas hors 'algebriqueSommeSn'/'B'");
  return exercice;
}

/** Réplique locale (jamais importée depuis `moteur5e/sessionSuiteGeometrique.ts` — module frère,
 * même minuscule primitive dupliquée plutôt que couplée entre couches présentation/session). */
function brancheActive(exercice: ExercicePrincipalSuiteGeometrique, phase: PhaseSuiteGeometrique): BrancheSuiteGeometrique {
  const index = phase.endsWith("B2") ? 1 : 0;
  return exercice.branches[index];
}

function estDouble(exercice: ExerciceSuiteGeometrique): boolean {
  return exercice.famille === "principal" && exercice.statutQ === "double";
}

function suffixeBranche(phase: PhaseSuiteGeometrique): string {
  if (phase.endsWith("B1")) return " (1ère suite, q>0)";
  if (phase.endsWith("B2")) return " (2e suite, q<0)";
  return "";
}

// ============================================================================
// Formatage numérique/algébrique — fraction irréductible, jamais de décimal (CLAUDE.md). Toute
// valeur ici est une `FractionQ` EXACTE (`prompt5gen155gen16arithmetiqueexacte.md`, arithmétique
// `generateurs5e/suitesGeometriques/fraction.ts`) — jamais reconstruite depuis un flottant, donc
// jamais de filet de sécurité/borne de dénominateur à justifier : l'affichage est fidèle par
// construction, quel que soit le dénominateur atteint.
// ============================================================================

/** Formate une `FractionQ` réduite en LaTeX — entier si `den===1`, sinon fraction (le signe est
 * toujours porté par le numérateur, voir `core5e/suitesGeometriques.types.ts`). Remplace l'ancien
 * duo `formatValeurExacteLatex`/`formatQLatex` (reconstruction par recherche bornée depuis un
 * flottant, source du bug `q=-0.6666...`/`u3=3.111...107` — voir le prompt cité ci-dessus). */
function fractionQVersLatex(f: FractionQ): string {
  if (f.den === 1) return `${f.num}`;
  return f.num < 0 ? `-\\dfrac{${-f.num}}{${f.den}}` : `\\dfrac{${f.num}}{${f.den}}`;
}

/** `q` élevé à une puissance ENTIÈRE (exposant symbolique ou numérique) — toujours entre parenthèses
 * (fraction ou signe négatif compris), jamais une valeur pré-calculée en décimal : évite tout besoin
 * de calculer `q^exposant` numériquement pour l'AFFICHAGE (seule la vérification interne, tolérante
 * aux flottants, calcule cette valeur). */
function formatQPuissanceLatex(q: FractionQ, exposant: number | string): string {
  return `\\left(${fractionQVersLatex(q)}\\right)^{${exposant}}`;
}

function jetonLatex(v: FractionQ): string {
  const rendu = fractionQVersLatex(v);
  return v.num < 0 ? `(${rendu})` : rendu;
}

function formatTermeLatex(t: TermeLineaire): string {
  const termeA = t.a === 1 ? "x" : t.a === -1 ? "-x" : `${t.a}x`;
  const termeB = t.b === 0 ? "" : t.b > 0 ? `+${t.b}` : `${t.b}`;
  return `${termeA}${termeB}`;
}

/** Miroir de `formatTermeLatex` pour `TermeLineaireFractionQ` (`b` fractionnaire — famille bonus A
 * uniquement, `un`, voir `core5e/suitesGeometriques.types.ts`). */
function formatTermeLatexQ(t: TermeLineaireFractionQ): string {
  const termeA = t.a === 1 ? "x" : t.a === -1 ? "-x" : `${t.a}x`;
  if (t.b.num === 0) return termeA;
  const rendu = fractionQVersLatex(t.b);
  return t.b.num > 0 ? `${termeA}+${rendu}` : `${termeA}${rendu}`;
}

// ============================================================================
// Consigne générale + bloc de données.
// ============================================================================

export function consigneGenerale(exercice: ExerciceSuiteGeometrique): string {
  switch (exercice.famille) {
    case "principal":
      return "Détermine tous les termes de cette suite géométrique à partir des données fournies.";
    case "algebriqueTermeGeneral":
      return "uₚ et uₙ, donnés en fonction de x, sont les termes d'une suite géométrique de raison q. Détermine leurs valeurs.";
    case "algebriqueSommeSn":
      return exercice.sousCas === "B"
        ? "La somme Sₙ des n premiers termes d'une suite géométrique, donnée en fonction de x, dépend de u₁, q et n (tous connus). Détermine sa valeur, puis x."
        : "La somme Sₙ des n premiers termes d'une suite géométrique dépend de u₁ et q. Certaines de ces grandeurs sont données en fonction de x. Détermine leurs valeurs.";
    case "algebriqueRangN":
      return "u₁ et q sont donnés. Détermine le rang n pour lequel cette suite atteint la valeur k.";
  }
}

export function formatTermesDonneesLatex(exercice: ExerciceSuiteGeometrique): string[] {
  switch (exercice.famille) {
    case "principal": {
      const { donnees } = exercice;
      switch (donnees.combo) {
        case "direct":
          return [`${u(1)}=${fractionQVersLatex(donnees.u1)}`, `q=${fractionQVersLatex(donnees.q)}`];
        case "u1_up":
          return [`${u(1)}=${fractionQVersLatex(donnees.u1)}`, `${u(donnees.up.indice)}=${fractionQVersLatex(donnees.up.valeur)}`];
        case "q_up":
          return [`q=${fractionQVersLatex(donnees.q)}`, `${u(donnees.up.indice)}=${fractionQVersLatex(donnees.up.valeur)}`];
        case "up_um":
          return [`${u(donnees.up.indice)}=${fractionQVersLatex(donnees.up.valeur)}`, `${u(donnees.um.indice)}=${fractionQVersLatex(donnees.um.valeur)}`];
      }
      break;
    }
    case "algebriqueTermeGeneral":
      return [`${u(exercice.p)}=${formatTermeLatex(exercice.up)}`, `${u(exercice.n)}=${formatTermeLatexQ(exercice.un)}`, `q=${fractionQVersLatex(exercice.q)}`];
    case "algebriqueSommeSn": {
      const e = exercice;
      if (e.sousCas === "A") return [`${u(1)}=${formatTermeLatex(e.u1)}`, `q=${fractionQVersLatex(e.q)}`, `${s(e.n)}=${fractionQVersLatex(e.k)}`];
      return [`${u(1)}=${e.u1}`, `q=${fractionQVersLatex(e.q)}`, `${s(e.n)}=${formatTermeLatexQ(e.sn)}`];
    }
    case "algebriqueRangN":
      return [`${u(1)}=${exercice.u1}`, `q=${fractionQVersLatex(exercice.q)}`, `k=${exercice.k}`];
  }
}

// ============================================================================
// Label / consigne par phase.
// ============================================================================

export function labelPhase(exercice: ExerciceSuiteGeometrique, phase: PhaseSuiteGeometrique): string {
  if (phase === "trouverU1" || phase === "trouverU1B1" || phase === "trouverU1B2") return `${u(1)}=`;
  if (phase === "formuleGenerale" || phase === "formuleGeneraleB1" || phase === "formuleGeneraleB2") return `${u("n")}=`;
  if (phase === "termeEloigne" || phase === "termeEloigneB1" || phase === "termeEloigneB2") {
    const e = commePrincipal(exercice);
    return `${u(e.indiceTermeEloigne)}=`;
  }
  if (phase === "sommeSn" || phase === "sommeSnB1" || phase === "sommeSnB2") {
    const e = commePrincipal(exercice);
    return `${s(e.indiceSn)}=`;
  }
  if (phase === "resoudreXAlgebrique") return "x=";
  if (phase === "calculerSn") {
    const e = commeSommeSnB(exercice);
    return `${s(e.n)}=`;
  }
  if (phase === "resoudreRangN") return "n=";
  return "";
}

export function labelsTermesProches(exercice: ExercicePrincipalSuiteGeometrique): string[] {
  return exercice.indicesTermesProches.map((n) => `${u(n)}=`);
}

/** Labels de l'écran "calculerTermesAlgebrique" — dispatch par famille/sous-cas : famille A → up/un
 * (2 champs), famille B sous-cas A → u1 (1 seul champ). Jamais atteinte pour le sous-cas B (pas de
 * cet écran, voir `ORDRE_SOMME_SN_B`). */
export function labelsCalculerTermesAlgebrique(exercice: ExerciceSuiteGeometrique): string[] {
  if (exercice.famille === "algebriqueTermeGeneral") return [`${u(exercice.p)}=`, `${u(exercice.n)}=`];
  if (exercice.famille === "algebriqueSommeSn" && exercice.sousCas === "A") return [`${u(1)}=`];
  return [];
}

export const LIBELLE_PHASE_SUITE_GEOMETRIQUE: Record<PhaseSuiteGeometrique, string> = {
  trouverQ: "Trouver la raison q",
  trouverU1: "Trouver le premier terme u₁",
  trouverU1B1: "Trouver u₁ (1ère suite)",
  trouverU1B2: "Trouver u₁ (2e suite)",
  formuleGenerale: "Formule générale uₙ",
  formuleGeneraleB1: "Formule générale uₙ (1ère suite)",
  formuleGeneraleB2: "Formule générale uₙ (2e suite)",
  termesProches: "Termes consécutifs",
  termesProchesB1: "Termes consécutifs (1ère suite)",
  termesProchesB2: "Termes consécutifs (2e suite)",
  termeEloigne: "Terme éloigné",
  termeEloigneB1: "Terme éloigné (1ère suite)",
  termeEloigneB2: "Terme éloigné (2e suite)",
  sommeSn: "Somme Sn",
  sommeSnB1: "Somme Sn (1ère suite)",
  sommeSnB2: "Somme Sn (2e suite)",
  sommeInfinie: "Somme infinie S∞",
  sommeInfinieB1: "Somme infinie S∞ (1ère suite)",
  sommeInfinieB2: "Somme infinie S∞ (2e suite)",
  poserEquationAlgebrique: "Poser l'équation",
  resoudreXAlgebrique: "Résoudre pour x",
  calculerTermesAlgebrique: "Calculer les grandeurs algébriques",
  calculerSn: "Calculer Sn",
  poserEquationRangN: "Poser l'équation",
  resoudreRangN: "Résoudre pour n",
};

/** Consigne de l'écran "poserEquationAlgebrique" — famille A : relation générale entre 2 termes.
 * Famille B, sous-cas A : Sn=k directement (u1/q substitués). Sous-cas B : Sn(x) doit être égalée à
 * la valeur DÉJÀ TROUVÉE à l'écran "calculerSn" précédent. */
function consignePoserEquationAlgebrique(exercice: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn): string {
  if (exercice.famille === "algebriqueTermeGeneral") return "Donne l'équation qui permet de déterminer la valeur de x.";
  if (exercice.sousCas === "B") return "Donne l'équation qui permet de déterminer la valeur de x, sachant que Sₙ est la valeur trouvée à l'écran précédent (voir ci-dessous).";
  return "Donne l'équation qui permet de déterminer la valeur de x.";
}

/** Valeur LaTeX (véritable syntaxe, destinée à `<Katex>`) accompagnant `consignePoserEquationAlgebrique`
 * pour le sous-cas B ("algebriqueSommeSn") — jamais injectée dans la phrase française (voir
 * `consignePoserEquationAlgebrique` : bug d'origine, backslash LaTeX affiché en texte brut).
 * `null` pour toute autre famille/sous-cas : rien à afficher. */
export function consignePoserEquationAlgebriqueValeurLatex(exercice: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn): string | null {
  if (exercice.famille === "algebriqueSommeSn" && exercice.sousCas === "B") return `S_n=${fractionQVersLatex(exercice.k)}`;
  return null;
}

export function consignePhase(exercice: ExerciceSuiteGeometrique, phase: PhaseSuiteGeometrique): string {
  const suffixe = suffixeBranche(phase);
  if (phase === "trouverQ") {
    const double = estDouble(exercice) || (exercice.famille === "principal" && exercice.k !== null && exercice.k % 2 === 0);
    return double
      ? "Détermine la ou les valeurs possibles de la raison q (pense à la parité de l'exposant : il peut y avoir 1 ou 2 solutions)."
      : "Détermine la raison q.";
  }
  if (phase === "trouverU1" || phase === "trouverU1B1" || phase === "trouverU1B2") return `Détermine le premier terme u₁${suffixe}.`;
  if (phase === "formuleGenerale" || phase === "formuleGeneraleB1" || phase === "formuleGeneraleB2") {
    return `Exprime la formule générale uₙ, avec u₁ et q substitués${suffixe} (utilise "n" comme variable).`;
  }
  if (phase === "termesProches" || phase === "termesProchesB1" || phase === "termesProchesB2") return `Calcule ces termes consécutifs${suffixe} (arrondis au centième près).`;
  if (phase === "termeEloigne" || phase === "termeEloigneB1" || phase === "termeEloigneB2") return `Calcule ce terme éloigné${suffixe} (arrondis au centième près).`;
  if (phase === "sommeSn" || phase === "sommeSnB1" || phase === "sommeSnB2") return `Calcule cette somme${suffixe} (arrondis au centième près).`;
  if (phase === "sommeInfinie" || phase === "sommeInfinieB1" || phase === "sommeInfinieB2") {
    return `Cette suite admet-elle une somme infinie${suffixe} ? Si oui, calcule-la (arrondis au centième près).`;
  }
  if (phase === "poserEquationAlgebrique") return consignePoserEquationAlgebrique(commeAlgebrique(exercice));
  if (phase === "resoudreXAlgebrique") return "Résous l'équation pour x.";
  if (phase === "calculerTermesAlgebrique") return "En déduire les valeurs numériques, maintenant que x est connu (substitue x dans chaque expression).";
  if (phase === "calculerSn") return "Calcule la valeur de Sₙ (u₁, q et n sont tous connus).";
  if (phase === "poserEquationRangN") return "Pose l'équation traduisant uₙ=k (valeurs dans le bloc de données).";
  if (phase === "resoudreRangN") return "Résous, trouve n par réduction à la même base (un rang est toujours un entier positif, aucun arrondi accepté).";
  return "";
}

// ============================================================================
// Aides — niveau 1 (méthode, TOUJOURS du LaTeX pur — jamais de texte brut, voir en-tête de fichier),
// niveau 2 (formule/valeurs substituées, jamais le résultat).
// ============================================================================

export function texteAideNiveau1(exercice: ExerciceSuiteGeometrique, phase: PhaseSuiteGeometrique): string {
  if (phase === "trouverQ") return "q^{k}=\\dfrac{u_m}{u_p}\\quad(k=\\text{écart des indices}).\\ \\text{Si }k\\text{ est pair, }q\\text{ a 2 valeurs opposées.}";
  if (phase === "trouverU1" || phase === "trouverU1B1" || phase === "trouverU1B2") return "u_1=\\dfrac{u_p}{q^{p-1}}";
  if (phase.startsWith("formuleGenerale")) return "u_n=u_1\\times q^{n-1}";
  if (phase.startsWith("termesProches") || phase.startsWith("termeEloigne")) return "\\text{Substitue l'indice dans }u_n=u_1\\times q^{n-1}";
  if (phase.startsWith("sommeSn")) return "S_n=u_1\\times\\dfrac{1-q^n}{1-q}\\ \\text{si }q\\neq1,\\ \\text{sinon }S_n=n\\times u_1";
  if (phase.startsWith("sommeInfinie")) return "S_\\infty=\\dfrac{u_1}{1-q}\\ \\text{existe SEULEMENT si }|q|<1\\text{ strictement}";
  if (phase === "poserEquationAlgebrique" || phase === "resoudreXAlgebrique" || phase === "calculerTermesAlgebrique") {
    const e = commeAlgebrique(exercice);
    if (e.famille === "algebriqueTermeGeneral") return "u_n=q^{n-p}\\times u_p\\quad(\\text{distribue }q^{n-p}\\text{ sur TOUTE l'expression de }u_p)";
    if (e.sousCas === "B") return `S_n(x)=${fractionQVersLatex(e.k)}`;
    return "S_n=u_1\\times\\dfrac{q^n-1}{q-1}\\quad(\\text{ne divise pas par }q^n\\text{ directement : c'est }\\dfrac{q^n-1}{q-1}\\text{ qui multiplie }u_1)";
  }
  if (phase === "calculerSn") return "S_n=u_1\\times\\dfrac{q^n-1}{q-1}\\quad(u_1,\\ q\\text{ et }n\\text{ sont tous connus})";
  if (phase === "poserEquationRangN" || phase === "resoudreRangN") return "u_n=u_1\\times q^{n-1}=k\\quad(\\text{réduis }k/u_1\\text{ à une puissance de }q\\text{ AVANT de comparer les exposants})";
  return "";
}

export function texteAideNiveau2(exercice: ExerciceSuiteGeometrique, phase: PhaseSuiteGeometrique): string {
  if (phase === "trouverU1" || phase === "trouverU1B1" || phase === "trouverU1B2") {
    const e = commePrincipal(exercice);
    const { q } = brancheActive(e, phase);
    if (e.donnees.combo === "q_up") return `${u(1)}=\\dfrac{${fractionQVersLatex(e.donnees.up.valeur)}}{${formatQPuissanceLatex(q, e.donnees.up.indice - 1)}}`;
    if (e.donnees.combo === "up_um") return `${u(1)}=\\dfrac{${fractionQVersLatex(e.donnees.up.valeur)}}{${formatQPuissanceLatex(q, e.donnees.up.indice - 1)}}`;
    return "";
  }
  if (phase.startsWith("formuleGenerale") || phase.startsWith("termesProches") || phase.startsWith("termeEloigne")) {
    const e = commePrincipal(exercice);
    const { u1, q } = brancheActive(e, phase);
    return `${u("n")}=${fractionQVersLatex(u1)}\\times ${formatQPuissanceLatex(q, "n-1")}`;
  }
  if (phase.startsWith("sommeSn")) {
    const e = commePrincipal(exercice);
    const { u1, q } = brancheActive(e, phase);
    return `${s(e.indiceSn)}=${fractionQVersLatex(u1)}\\times\\dfrac{1-${formatQPuissanceLatex(q, e.indiceSn)}}{1-${fractionQVersLatex(q)}}`;
  }
  if (phase.startsWith("sommeInfinie")) {
    const e = commePrincipal(exercice);
    const { u1, q } = brancheActive(e, phase);
    return `S_\\infty=\\dfrac{${fractionQVersLatex(u1)}}{1-${fractionQVersLatex(q)}}`;
  }
  return "";
}

// ============================================================================
// Bloc "état actuel" — récapitule, à partir du 2e écran de la séquence RÉELLEMENT traversée
// (`ordreComplet(exercice)`), les valeurs déjà CONFIRMÉES plus tôt dans CETTE séquence — jamais la
// saisie brute de l'élève, toujours dérivé PUREMENT de `exercice` (même convention "état actuel" que
// le reste du projet).
//
// Cas particulier "double" (famille "principal") : les 2 valeurs de q trouvées à l'écran "trouverQ"
// sont COMMUNES aux 2 branches (affichées ensemble, "q=X ou q=Y"), tandis que u₁/la formule générale
// restent SPÉCIFIQUES à la branche de l'écran courant.
// ============================================================================

function formatQConfirmeLatex(exercice: ExercicePrincipalSuiteGeometrique): string {
  if (exercice.statutQ === "double") {
    return `q=${fractionQVersLatex(exercice.branches[0].q)} \\text{ ou } q=${fractionQVersLatex(exercice.branches[1].q)}`;
  }
  return `q=${fractionQVersLatex(exercice.branches[0].q)}`;
}

function formatU1ConfirmeLatex(exercice: ExercicePrincipalSuiteGeometrique, phase: PhaseSuiteGeometrique): string {
  const { u1 } = brancheActive(exercice, phase);
  return `${u(1)}=${fractionQVersLatex(u1)}`;
}

function formatFormuleGeneraleConfirmeeLatex(exercice: ExercicePrincipalSuiteGeometrique, phase: PhaseSuiteGeometrique): string {
  const { u1, q } = brancheActive(exercice, phase);
  return `${u("n")}=${fractionQVersLatex(u1)}\\times ${formatQPuissanceLatex(q, "n-1")}`;
}

function formatTermesEtatActuelPrincipalLatex(exercice: ExercicePrincipalSuiteGeometrique, phase: PhaseSuiteGeometrique): string[] {
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(phase);
  if (index <= 0) return [];
  const precedentes = ordre.slice(0, index);

  const suffixe = phase.endsWith("B1") ? "B1" : phase.endsWith("B2") ? "B2" : "";
  const phaseTrouverU1 = (suffixe === "" ? "trouverU1" : `trouverU1${suffixe}`) as PhaseSuiteGeometrique;
  const phaseFormuleGenerale = (suffixe === "" ? "formuleGenerale" : `formuleGenerale${suffixe}`) as PhaseSuiteGeometrique;

  const termes: string[] = [];
  if (precedentes.includes("trouverQ")) termes.push(formatQConfirmeLatex(exercice));
  if (precedentes.includes(phaseTrouverU1)) termes.push(formatU1ConfirmeLatex(exercice, phase));
  if (precedentes.includes(phaseFormuleGenerale)) termes.push(formatFormuleGeneraleConfirmeeLatex(exercice, phase));
  return termes;
}

// Blocs élémentaires réutilisés à la fois par l'état actuel (accumulation progressive) et la
// réponse attendue du panneau de révélation (voir plus bas) — jamais dupliqués littéralement à 2
// endroits, pour ne jamais risquer de divergence entre les deux.

/** Équation posée à l'écran "poserEquationAlgebrique" une fois confirmée — famille A : up(x)/un(x)
 * substitués ALGÉBRIQUEMENT, `q^(n-p)` gardé SYMBOLIQUE (jamais pré-calculé en décimal — q peut être
 * fractionnaire, voir doc de tête de `generateurs5e/suitesGeometriques/algebrique.ts`). Famille B :
 * u1/Sn substitués selon le sous-cas — sous-cas A : `q^n` gardé symbolique dans la fraction
 * `(q^n-1)/(q-1)` ; sous-cas B : Sn(x)=k (k déjà connu depuis l'écran "calculerSn"). */
function formatEquationAlgebriqueConfirmeeLatex(exercice: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn): string {
  if (exercice.famille === "algebriqueTermeGeneral") {
    const { up, un, p, n, q } = exercice;
    return `${formatTermeLatexQ(un)}=${formatQPuissanceLatex(q, n - p)}\\times\\left(${formatTermeLatex(up)}\\right)`;
  }
  if (exercice.sousCas === "A") {
    const { u1, q, n, k } = exercice;
    return `\\left(${formatTermeLatex(u1)}\\right)\\times\\dfrac{${formatQPuissanceLatex(q, n)}-1}{${jetonLatex(q)}-1}=${fractionQVersLatex(k)}`;
  }
  const { sn, k } = exercice;
  return `${formatTermeLatexQ(sn)}=${fractionQVersLatex(k)}`;
}

function formatXAlgebriqueConfirmeLatex(exercice: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn): string {
  return `x=${fractionQVersLatex(exercice.xReel)}`;
}

/** Valeur de S_n trouvée à l'écran "calculerSn" (sous-cas B uniquement), une fois confirmée. */
function formatSnTrouveConfirmeLatex(exercice: ExerciceAlgebriqueSommeSnB): string {
  return `${s(exercice.n)}=${fractionQVersLatex(exercice.k)}`;
}

/** Équation posée à l'écran "poserEquationRangN" une fois confirmée — u1/q NUMÉRIQUES, n reste
 * symbolique (c'est l'inconnue) — `q^(n-1)` gardé symbolique (jamais pré-calculé). */
function formatEquationRangNConfirmeeLatex(exercice: ExerciceAlgebriqueRangN): string {
  const { u1, q, k } = exercice;
  return `${u1}\\times ${formatQPuissanceLatex(q, "n-1")}=${k}`;
}

function formatTermesEtatActuelAlgebriqueLatex(exercice: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn, phase: PhaseSuiteGeometrique): string[] {
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(phase);
  if (index <= 0) return [];
  const precedentes = ordre.slice(0, index);

  const termes: string[] = [];
  if (precedentes.includes("calculerSn")) termes.push(formatSnTrouveConfirmeLatex(exercice as ExerciceAlgebriqueSommeSnB));
  if (precedentes.includes("poserEquationAlgebrique")) termes.push(formatEquationAlgebriqueConfirmeeLatex(exercice));
  if (precedentes.includes("resoudreXAlgebrique")) termes.push(formatXAlgebriqueConfirmeLatex(exercice));
  return termes;
}

function formatTermesEtatActuelRangNLatex(exercice: ExerciceAlgebriqueRangN, phase: PhaseSuiteGeometrique): string[] {
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(phase);
  if (index <= 0) return [];
  const precedentes = ordre.slice(0, index);

  const termes: string[] = [];
  if (precedentes.includes("poserEquationRangN")) termes.push(formatEquationRangNConfirmeeLatex(exercice));
  return termes;
}

/** Point d'entrée unique, dispatché par famille — `null` (rien rendu) tant que rien n'est encore
 * accumulable pour l'écran courant. */
export function formatTermesEtatActuelSuiteGeometrique(exercice: ExerciceSuiteGeometrique, phase: PhaseSuiteGeometrique): string[] | null {
  const termes =
    exercice.famille === "principal"
      ? formatTermesEtatActuelPrincipalLatex(exercice, phase)
      : exercice.famille === "algebriqueRangN"
        ? formatTermesEtatActuelRangNLatex(exercice, phase)
        : formatTermesEtatActuelAlgebriqueLatex(exercice, phase);
  return termes.length > 0 ? termes : null;
}

// ============================================================================
// Réponse attendue par écran — pour l'écran récapitulatif final, remplace l'ancien affichage à
// score fractionnaire par écran par la réponse RÉELLEMENT attendue, toujours dérivée de `exercice`
// — jamais un score. Couvre TOUS les écrans de `ordreComplet(exercice)`.
// ============================================================================

function formatTermesReponseAttenduePrincipalLatex(exercice: ExercicePrincipalSuiteGeometrique, phase: PhaseSuiteGeometrique): string[] {
  if (phase === "trouverQ") {
    return exercice.branches.map((b) => `q=${fractionQVersLatex(b.q)}`);
  }
  if (phase === "trouverU1" || phase === "trouverU1B1" || phase === "trouverU1B2") {
    return [formatU1ConfirmeLatex(exercice, phase)];
  }
  if (phase === "formuleGenerale" || phase === "formuleGeneraleB1" || phase === "formuleGeneraleB2") {
    return [formatFormuleGeneraleConfirmeeLatex(exercice, phase)];
  }
  if (phase === "termesProches" || phase === "termesProchesB1" || phase === "termesProchesB2") {
    const { u1, q } = brancheActive(exercice, phase);
    return exercice.indicesTermesProches.map((n) => `${u(n)}=${fractionQVersLatex(termeGeometriqueQ(u1, q, n))}`);
  }
  if (phase === "termeEloigne" || phase === "termeEloigneB1" || phase === "termeEloigneB2") {
    const { u1, q } = brancheActive(exercice, phase);
    return [`${u(exercice.indiceTermeEloigne)}=${fractionQVersLatex(termeGeometriqueQ(u1, q, exercice.indiceTermeEloigne))}`];
  }
  if (phase === "sommeSn" || phase === "sommeSnB1" || phase === "sommeSnB2") {
    const { u1, q } = brancheActive(exercice, phase);
    return [`${s(exercice.indiceSn)}=${fractionQVersLatex(sommeGeometriqueFinieQ(u1, q, exercice.indiceSn))}`];
  }
  // sommeInfinie / sommeInfinieB1 / sommeInfinieB2 — seule catégorie de phase "principal" restante.
  const { u1, q } = brancheActive(exercice, phase);
  const cible = sommeInfinieExisteQ(q) ? sommeInfinieQ(u1, q) : null;
  return cible === null ? ["\\text{Elle n'existe pas}"] : [`S_\\infty=${fractionQVersLatex(cible)}`];
}

/** Labels associés aux cibles de `calculerTermesAlgebrique` — même dispatch que
 * `labelsCalculerTermesAlgebrique` ci-dessus, réutilisée pour le récapitulatif final. */
function nomsCalculerTermesAlgebrique(exercice: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn): string[] {
  if (exercice.famille === "algebriqueTermeGeneral") return [u(exercice.p), u(exercice.n)];
  if (exercice.sousCas === "A") return [u(1)];
  return [];
}

/** Réplique EXACTE (fractions) de `moteur5e/sessionSuiteGeometrique.ts::ciblesCalculerTermesAlgebrique`
 * — celle-ci retourne des `number` (conversion réservée à la comparaison tolérante avec la saisie
 * de l'élève), jamais réutilisable telle quelle pour l'AFFICHAGE (voir en-tête de fichier). */
function ciblesCalculerTermesAlgebriqueQ(exo: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn): FractionQ[] {
  if (exo.famille === "algebriqueTermeGeneral") {
    const { up, un, xReel } = exo;
    const upSubstitue = additionnerFractionQ(multiplierFractionQ(entierVersFractionQ(up.a), xReel), entierVersFractionQ(up.b));
    const unSubstitue = additionnerFractionQ(multiplierFractionQ(entierVersFractionQ(un.a), xReel), un.b);
    return [upSubstitue, unSubstitue];
  }
  if (exo.sousCas === "A") {
    const { u1, xReel } = exo;
    return [additionnerFractionQ(multiplierFractionQ(entierVersFractionQ(u1.a), xReel), entierVersFractionQ(u1.b))];
  }
  return [];
}

function formatTermesReponseAttendueAlgebriqueLatex(exercice: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn, phase: PhaseSuiteGeometrique): string[] {
  if (phase === "calculerSn") return [formatSnTrouveConfirmeLatex(exercice as ExerciceAlgebriqueSommeSnB)];
  if (phase === "poserEquationAlgebrique") return [formatEquationAlgebriqueConfirmeeLatex(exercice)];
  if (phase === "resoudreXAlgebrique") return [formatXAlgebriqueConfirmeLatex(exercice)];
  // calculerTermesAlgebrique — seule phase restante possible pour cette famille.
  const noms = nomsCalculerTermesAlgebrique(exercice);
  const cibles = ciblesCalculerTermesAlgebriqueQ(exercice);
  return noms.map((nom, i) => `${nom}=${fractionQVersLatex(cibles[i])}`);
}

function formatTermesReponseAttendueRangNLatex(exercice: ExerciceAlgebriqueRangN, phase: PhaseSuiteGeometrique): string[] {
  if (phase === "poserEquationRangN") return [formatEquationRangNConfirmeeLatex(exercice)];
  // resoudreRangN — seule phase restante.
  return [`n=${exercice.n}`];
}

/** Point d'entrée unique, dispatché par famille — voir l'en-tête de section ci-dessus. */
export function formatTermesReponseAttendueSuiteGeometrique(exercice: ExerciceSuiteGeometrique, phase: PhaseSuiteGeometrique): string[] {
  if (exercice.famille === "principal") return formatTermesReponseAttenduePrincipalLatex(exercice, phase);
  if (exercice.famille === "algebriqueRangN") return formatTermesReponseAttendueRangNLatex(exercice, phase);
  return formatTermesReponseAttendueAlgebriqueLatex(exercice, phase);
}
