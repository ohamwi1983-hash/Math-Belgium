/**
 * Retours de saisie de 5gen5 « Problèmes-contexte » (audit 5e ch. 1, lot B) :
 * - `lireNombre5e` : nombre saisi (virgule, fraction « 7/2 », « − – — », milliers espacés ; NaN si
 *   illisible) — remplace `Number(texte.replace(",", "."))`, qui rendait une fraction illisible ;
 * - `aidesContexte` : DEUX niveaux d'aide par écran (16 écrans), KaTeX, jamais la réponse finale ;
 * - `cibleContexte` : message ciblé sur une erreur typique (coût unitaire pris pour le coût total,
 *   coût fixe oublié, intersection lue au lieu du minimum, x³ sans racine cubique…) ;
 * - `texteIllisibleContexte` : message d'illisible adapté au champ (nombre, expression, équation).
 * La détection de l'illisible est celle du moteur (`estSaisieIllisible`), jamais une seconde règle.
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceProblemeContexte, ExerciceScenarioAConteneur, ExerciceScenarioAStockCommande, ExerciceScenarioB, ExerciceScenarioC } from "../core5e/problemesContexte.types";
import type { PhaseProblemeContexte } from "../moteur5e/typesProblemesContexte";
import { estSaisieIllisible } from "../moteur5e/sessionProblemesContexte";
import type {
  ReponseEvaluationB,
  ReponseLectureC,
  ReponseResolutionB,
  ReponseSystemeB,
  ReponseTableauA,
} from "../moteur5e/verificationProblemesContexte";
import { beneficeAttenduC, coutMoyenAttenduC, coutTotalTableauC } from "../moteur5e/verificationProblemesContexte";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import { coeffA, coeffB, coutTotalTheorique } from "../generateurs5e/problemesContexte/scenarioB";
import type { AideTrig } from "./aidesTrigonometrie";
import { MESSAGES_ILLISIBLE_FONCTIONS, fragmentsRiches, l, t } from "./retoursFonctions1";
import {
  TEXTE_AIDE_BENEFICE_C_1,
  TEXTE_AIDE_COUT_MOYEN_C_1,
  TEXTE_AIDE_EGALITE_AIRES_A_1,
  TEXTE_AIDE_EVALUATION_B_1,
  TEXTE_AIDE_GENERALISATION_A_1,
  TEXTE_AIDE_INTERSECTION_SIMPLE_A_1,
  TEXTE_AIDE_RESOLUTION_B_1,
  TEXTE_AIDE_SEUIL_C_1,
  formatTermeFormuleBLatex,
  formatTermesSystemeBLatex,
  latexAideEgaliteAiresA2,
  latexCoutTotalB,
  latexFormuleFB,
  nombreLatex,
  texteAideGeneralisationA2F,
  texteAideGeneralisationA2G,
  texteAideGeneralisationA2H,
  texteAideGeneralisationSimpleA1,
  texteAideLectureC1,
  texteAideReconnaissanceC1,
  texteAideSystemeB1,
  volumeKPiLatex,
} from "./formatProblemesContexte";

/** Valeurs RETENUES par continuité (rayon lu, a et b) — attendus des écrans suivants. */
export interface RetenusAides {
  xOptimalRetenu?: number | null;
  aRetenu?: number | null;
  bRetenu?: number | null;
}

/** Nombre saisi (NaN si illisible). */
export function lireNombre5e(texte: string): number {
  return parserNombreOuFraction(texte) ?? Number.NaN;
}

export function texteIllisibleContexte(phase: PhaseProblemeContexte): string {
  if (phase === "systeme") return MESSAGES_ILLISIBLE_FONCTIONS.equationAB;
  if (phase === "generalisation" || phase === "generalisationSimple" || phase === "formule" || phase === "reconnaissance") return MESSAGES_ILLISIBLE_FONCTIONS.expression;
  return MESSAGES_ILLISIBLE_FONCTIONS.nombre;
}

export function illisibleContexte(phase: PhaseProblemeContexte, exercice: ExerciceProblemeContexte, reponse: unknown): boolean {
  return estSaisieIllisible(phase, exercice, reponse);
}

const rt = fragmentsRiches;
type ExA1 = ExerciceScenarioAConteneur;
type ExA2 = ExerciceScenarioAStockCommande;

// ============================================================================
// Aides (2 niveaux).
// ============================================================================

function aidesA1(phase: PhaseProblemeContexte, e: ExA1, r: RetenusAides): AideTrig[] {
  const V = volumeKPiLatex(e);
  switch (phase) {
    case "tableau":
      return [
        { texte: [t("Contenance d'un cylindre, aire des deux bases et aire latérale (périmètre × hauteur) :")], formules: ["V=\\pi r^2 h \\qquad A_{\\text{bases}}=2\\pi r^2 \\qquad A_{\\text{lat}}=2\\pi r\\cdot h"] },
        { texte: [t("Ici, isole d'abord h pour chaque rayon, puis calcule les aires avec h non arrondi :")], formules: [`h=\\dfrac{V}{\\pi r^2}=\\dfrac{${V}}{\\pi r^2}`] },
      ];
    case "generalisation":
      return [{ texte: rt(TEXTE_AIDE_GENERALISATION_A_1) }, { texte: [...rt(texteAideGeneralisationA2H()), t(" "), ...rt(texteAideGeneralisationA2F()), t(" "), ...rt(texteAideGeneralisationA2G())] }];
    case "egaliteAires":
      return [{ texte: rt(TEXTE_AIDE_EGALITE_AIRES_A_1) }, { texte: [t("Ici, l'équation devient (il reste une racine cubique à prendre) :")], formules: [latexAideEgaliteAiresA2(e)] }];
    case "graphique":
      return [
        { texte: [t("Le minimum d'une fonction se lit au point le plus bas de sa courbe : son abscisse est la valeur de x cherchée.")] },
        { texte: [t("Ici, c'est la courbe verte de "), l("f+g"), t(" (pas le croisement des courbes de "), l("f"), t(" et de "), l("g"), t(") : lis l'abscisse de son point le plus bas sur une ligne de la grille.")] },
      ];
    case "justification": {
      const x = r.xOptimalRetenu ?? e.xOptimal;
      return [
        { texte: [t("La hauteur se déduit de la contenance :")], formules: ["h(x)=\\dfrac{V}{\\pi x^2}"] },
        { texte: [t("Ici, avec le rayon lu à l'écran précédent :")], formules: [`h(${x})=\\dfrac{${V}}{\\pi\\cdot ${x}^2}`] },
      ];
    }
    default:
      return [];
  }
}

function aidesA2(phase: PhaseProblemeContexte, e: ExA2): AideTrig[] {
  const [r1, r2] = e.releves as [{ x: number; f: number; g: number }, { x: number; f: number; g: number }];
  switch (phase) {
    case "generalisationSimple":
      return [
        { texte: rt(texteAideGeneralisationSimpleA1(e)) },
        { texte: [t("Ici, avec les deux relevés :")], formules: [`a=\\dfrac{${nombreLatex(r2.f)}-${nombreLatex(r1.f)}}{${r2.x}-${r1.x}}\\qquad k=${r1.x}\\times ${nombreLatex(r1.g)}`] },
      ];
    case "intersectionSimple":
      return [{ texte: rt(TEXTE_AIDE_INTERSECTION_SIMPLE_A_1) }, { texte: [t("Ici, après multiplication par x (positif) :")], formules: [`${e.a === 1 ? "" : e.a}x^2+${e.b}x-${e.k}=0`] }];
    case "extremumSimple":
      return [
        { texte: [t("Le coût total minimal se lit au point le plus bas de la courbe du coût total.")] },
        { texte: [t("Ici, c'est la courbe verte de "), l("f+g"), t(" — pas le croisement des courbes de "), l("f"), t(" et de "), l("g"), t(" : lis l'abscisse de son point le plus bas sur une ligne de la grille.")] },
      ];
    default:
      return [];
  }
}

function aidesB(phase: PhaseProblemeContexte, e: ExerciceScenarioB, r: RetenusAides): AideTrig[] {
  const a = r.aRetenu ?? e.aArrondiAttendu;
  const b = r.bRetenu ?? e.bArrondiAttendu;
  switch (phase) {
    case "systeme":
      return [
        { texte: rt(texteAideSystemeB1()), formules: [latexCoutTotalB(e.modele)] },
        { texte: [t("Ici, pour le premier relevé, le coût total vaut :")], formules: [`\\text{cu}(${e.point1.x})\\times ${e.point1.x}=${nombreLatex(e.point1.coutUnitaire)}\\times ${e.point1.x}`] },
      ];
    case "resolution":
      return [{ texte: rt(TEXTE_AIDE_RESOLUTION_B_1) }, { texte: [t("Ici, le système à résoudre :")], formules: formatTermesSystemeBLatex(e) }];
    case "formule":
      return [
        { texte: [t("Remplace a et b par tes valeurs de l'écran précédent dans la forme du coût total :")], formules: [latexFormuleFB(e.modele)] },
        { texte: [t("Ici :")], formules: [`a=${nombreLatex(a)}\\qquad b=${nombreLatex(b)}`] },
      ];
    case "evaluation": {
      const f = formatTermeFormuleBLatex(a, b, e.modele).replace(/^f\(x\)=/, "");
      return [
        { texte: rt(TEXTE_AIDE_EVALUATION_B_1) },
        { texte: [t("Ici, pour la première valeur :")], formules: [`f(${e.xEval1})=${f.replace(/x/g, `(${e.xEval1})`)}`] },
      ];
    }
    default:
      return [];
  }
}

function aidesC(phase: PhaseProblemeContexte, e: ExerciceScenarioC): AideTrig[] {
  switch (phase) {
    case "lecture":
      return [{ texte: [t("Le coût total additionne le coût fixe et les deux parties qui dépendent de x :")], formules: ["\\text{CT}(x)=\\text{CF}+\\text{CV}(x)+\\text{CP}(x)"] }, { texte: rt(texteAideLectureC1(e)) }];
    case "coutMoyen":
      return [{ texte: [t("Le coût moyen est le coût total partagé entre les unités produites :")], formules: ["\\text{CM}=\\dfrac{\\text{CT}(x)}{x}"] }, { texte: rt(TEXTE_AIDE_COUT_MOYEN_C_1) }];
    case "reconnaissance":
      return [
        { texte: [t("Une partie proportionnelle est une droite passant par l'origine ; une racine croît de plus en plus lentement, une puissance de plus en plus vite.")] },
        { texte: rt(texteAideReconnaissanceC1(e)) },
      ];
    case "benefice":
      return [{ texte: [t("Le bénéfice est la différence entre ce qu'on gagne et ce qu'on dépense :")], formules: ["\\text{B}(x)=\\text{CA}(x)-\\text{CT}(x)"] }, { texte: rt(TEXTE_AIDE_BENEFICE_C_1) }];
    case "seuil":
      return [
        { texte: rt(TEXTE_AIDE_SEUIL_C_1) },
        { texte: [t("Avant le seuil, la courbe rose ("), l("\\text{CA}"), t(") est sous la verte ("), l("\\text{CT}"), t(") ; après, au-dessus. Lis l'abscisse du croisement sur une ligne de la grille.")] },
      ];
    default:
      return [];
  }
}

export function aidesContexte(phase: PhaseProblemeContexte, e: ExerciceProblemeContexte, r: RetenusAides = {}): AideTrig[] {
  if (e.scenario === "A") return e.combo === "kInverseXAxCarre" ? aidesA1(phase, e, r) : aidesA2(phase, e);
  if (e.scenario === "B") return aidesB(phase, e, r);
  return aidesC(phase, e);
}

// ============================================================================
// Messages ciblés.
// ============================================================================

const proche = (v: number, cible: number, tol = 0.6) => Number.isFinite(v) && Math.abs(v - cible) <= tol;

/** Coefficients (constante, a, b) d'une équation linéaire en a, b (gauche − droite), ou null. */
function equationLineaire(texte: string): { c0: number; ca: number; cb: number } | null {
  const i = texte.indexOf("=");
  if (i < 0) return null;
  try {
    const diff = (a: number, b: number) => evaluerExpressionGenerale(texte.slice(0, i), 0, { a, b }) - evaluerExpressionGenerale(texte.slice(i + 1), 0, { a, b });
    const c0 = diff(0, 0);
    const res = { c0, ca: diff(1, 0) - c0, cb: diff(0, 1) - c0 };
    return [res.c0, res.ca, res.cb].every(Number.isFinite) ? res : null;
  } catch {
    return null;
  }
}

function proportionnelles(u: { c0: number; ca: number; cb: number }, v: { c0: number; ca: number; cb: number }): boolean {
  const k = Math.abs(v.cb) > 1e-9 ? u.cb / v.cb : Math.abs(v.ca) > 1e-9 ? u.ca / v.ca : Number.NaN;
  if (!Number.isFinite(k) || Math.abs(k) < 1e-9) return false;
  return Math.abs(u.c0 - k * v.c0) < 1e-3 && Math.abs(u.ca - k * v.ca) < 1e-3 && Math.abs(u.cb - k * v.cb) < 1e-3;
}

function memeFonction(texte: string, cible: (x: number) => number): boolean {
  try {
    for (const x of [2, 3, 5, 7]) {
      const v = evaluerExpressionGenerale(texte, x);
      if (!Number.isFinite(v) || Math.abs(v - cible(x)) > 1e-4 * Math.max(1, Math.abs(cible(x)))) return false;
    }
    return true;
  } catch {
    return false;
  }
}

const COUT_UNITAIRE_POUR_TOTAL: FragmentConsigne[] = [t("C'est le coût unitaire : le coût total vaut "), l("\\text{cu}(x)\\times x"), t(".")];

export function cibleContexte(phase: PhaseProblemeContexte, e: ExerciceProblemeContexte, reponse: unknown, r: RetenusAides = {}): FragmentConsigne[] | null {
  if (reponse === null || reponse === undefined) return null;
  if (e.scenario === "A" && e.combo === "kInverseXAxCarre") {
    if (phase === "tableau") {
      const rep = reponse as ReponseTableauA;
      if (rep.some((x, i) => proche(x.aireBases, Math.PI * e.lignesTableau[i]!.r ** 2, 0.6) && !proche(x.aireBases, e.lignesTableau[i]!.aireBasesAttendue))) return [t("Un cylindre a deux bases : leur aire totale vaut "), l("2\\pi r^2"), t(".")];
      if (rep.some((x, i) => proche(x.h, e.volumeCm3 / (Math.PI * 4 * e.lignesTableau[i]!.r ** 2), 0.6) && !proche(x.h, e.lignesTableau[i]!.hAttendu))) return [t("Dans "), l("V=\\pi r^2 h"), t(", r est le rayon, pas le diamètre.")];
      if (rep.some((x, i) => proche(x.aireLaterale, e.lignesTableau[i]!.aireLateraleAttendue / 2, 0.6))) return [t("Le périmètre d'un cercle vaut "), l("2\\pi r"), t(" : aire latérale "), l("2\\pi r\\cdot h"), t(".")];
      return null;
    }
    if (phase === "egaliteAires") {
      const v = reponse as number;
      if (proche(v, e.xOptimal, 0.5) && !proche(v, e.xEgaliteAires, 0.5)) return [t("C'est le rayon qui minimise "), l("f+g"), t(" : ici on cherche celui où les deux aires sont égales.")];
      if (proche(v, e.volumeKPi, 1)) return [t("Tu as trouvé "), l("x^3"), t(" : il reste à prendre la racine cubique.")];
      return null;
    }
    if (phase === "graphique") {
      const v = reponse as number;
      if (proche(v, Math.round(e.xEgaliteAires), 0.5) && !proche(v, e.xOptimal, 0.5)) return [t("C'est là que les courbes de "), l("f"), t(" et de "), l("g"), t(" se croisent : on lit le point le plus bas de la courbe de "), l("f+g"), t(".")];
      return null;
    }
    if (phase === "justification") {
      const x = r.xOptimalRetenu ?? e.xOptimal;
      const v = (reponse as { h: number }).h;
      if (proche(v, x, 0.5)) return [t("C'est le rayon : la hauteur vaut "), l("h(x)=\\dfrac{V}{\\pi x^2}"), t(".")];
      return null;
    }
    return null;
  }
  if (e.scenario === "A") {
    const v = reponse as number;
    if (phase === "intersectionSimple") {
      if (proche(v, e.xExtremum, 0.5) && !proche(v, e.xIntersection, 0.5)) return [t("C'est le lot qui minimise le coût total : ici on cherche celui où "), l("f(x)=g(x)"), t(".")];
      if (Number.isFinite(v) && v < 0) return [t("Une taille de lot est positive : la solution négative de l'équation est rejetée.")];
      return null;
    }
    if (phase === "extremumSimple") {
      if (proche(v, e.xIntersection, 0.5) && !proche(v, e.xExtremum, 0.5)) return [t("C'est là que les deux coûts sont égaux (croisement de "), l("f"), t(" et "), l("g"), t(") : on lit le point le plus bas de la courbe de "), l("f+g"), t(".")];
      return null;
    }
    return null;
  }
  if (e.scenario === "B") {
    const a = r.aRetenu ?? e.aArrondiAttendu;
    const b = r.bRetenu ?? e.bArrondiAttendu;
    if (phase === "systeme") {
      const rep = reponse as ReponseSystemeB;
      for (const [texte, p] of [
        [rep.equation1, e.point1],
        [rep.equation2, e.point2],
      ] as const) {
        const eq = equationLineaire(texte);
        if (!eq) continue;
        const sansX = { c0: -p.coutUnitaire, ca: coeffA(e.modele, p.x), cb: coeffB(e.modele, p.x) };
        if (proportionnelles(eq, sansX)) return [t("Le relevé donne le coût unitaire : multiplie-le par x avant de l'égaler au coût total, "), l("\\text{cu}(x)\\times x"), t(".")];
      }
      return null;
    }
    if (phase === "resolution") {
      const rep = reponse as ReponseResolutionB;
      if (proche(rep.a, e.bArrondiAttendu, 0.01) && proche(rep.b, e.aArrondiAttendu, 0.01) && e.aArrondiAttendu !== e.bArrondiAttendu) return [t("Tu as échangé a et b : relis à quelle inconnue correspond chaque valeur.")];
      return null;
    }
    if (phase === "formule") {
      if (memeFonction(reponse as string, (x) => coutTotalTheorique(e.modele, a, b, x) / x)) return COUT_UNITAIRE_POUR_TOTAL;
      return null;
    }
    if (phase === "evaluation") {
      const rep = reponse as ReponseEvaluationB;
      const cu1 = coutTotalTheorique(e.modele, a, b, e.xEval1) / e.xEval1;
      const f1 = coutTotalTheorique(e.modele, a, b, e.xEval1);
      if (proche(rep.f1, cu1, 0.5) && !proche(rep.f1, f1, 0.5)) return COUT_UNITAIRE_POUR_TOTAL;
      if (proche(rep.f1, 100 * f1, 50) && !proche(rep.f1, f1, 0.5)) return [t("Le résultat est demandé en centaines d'euros : c'est la valeur de "), l("f(x)"), t(" elle-même.")];
      return null;
    }
    return null;
  }
  const c = e;
  if (phase === "lecture") {
    const ct = (reponse as ReponseLectureC).ct;
    const juste = coutTotalTableauC(c, c.xLecture);
    if (proche(ct, juste - c.cf, 0.02) && !proche(ct, juste, 0.02)) return [t("N'oublie pas le coût fixe : "), l("\\text{CT}=\\text{CF}+\\text{CV}+\\text{CP}"), t(".")];
    return null;
  }
  if (phase === "coutMoyen") {
    const v = reponse as number;
    const juste = coutMoyenAttenduC(c);
    if (proche(v, juste / 1000, 0.05) && !proche(v, juste, 1)) return [t("Le tableau est en milliers d'euros : convertis le coût total en euros (× 1 000) avant de diviser.")];
    if (proche(v, juste * c.xLecture, 1) && c.xLecture !== 1) return [t("Il reste à diviser par le nombre d'unités : "), l("\\text{CM}=\\dfrac{\\text{CT}(x)}{x}"), t(".")];
    return null;
  }
  if (phase === "benefice") {
    const v = reponse as number;
    const juste = beneficeAttenduC(c);
    if (proche(v, -juste, 0.02) && Math.abs(juste) > 0.02) return [t("Le bénéfice vaut "), l("\\text{CA}-\\text{CT}"), t(", pas l'inverse : une perte donne un nombre négatif.")];
    if (proche(v, juste + c.cf, 0.02)) return [t("N'oublie pas le coût fixe dans le coût total.")];
    return null;
  }
  return null;
}
