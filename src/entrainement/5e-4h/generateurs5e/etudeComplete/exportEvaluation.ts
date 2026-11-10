import type { ExerciceEtudeComplete, ExerciceEtudeCompleteBonus, ExerciceEtudeCompletePipeline } from "../../core5e/etudeComplete.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgFonction, type ViewBoxSvg } from "../../../export/svgGraph";
import { ordreComplet, type PhaseEtudeComplete } from "../../moteur5e/typesEtudeComplete";
import {
  formatDenominateurLatex,
  formatFonctionLatex,
  formatFormeExclusionLatex,
  formatLabelLimiteDroiteLatex,
  formatLabelLimiteGaucheLatex,
  formatPenteOrdonnee,
  formatProprietesConstructionInverseTexte,
  formatReponseAttenduePhaseLatex,
} from "../../ui5e/formatEtudeComplete";
import { profilEtudeComplete } from "../profilsEvaluationLimites24";
import { polyEval } from "./poly";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEtudeComplete } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEtudeComplete>` pour 5gen24 (« Étude complète »,
 * chapitre 4 de 5e « Limites et asymptotes ») — feuille d'exercices et évaluation, selon
 * `.claude/rules/feuilles-evaluations.md`.
 *
 * - **Énoncé papier** (`enoncePapier`) = la fonction + UNE consigne globale (« Étudie la fonction f :
 *   domaine, nature de chaque valeur exclue, limites aux bornes, asymptotes… »). Aucune sous-question,
 *   aucune place de réponse ; JAMAIS une phrase qui révèle une réponse (l'ancien énoncé citait « la
 *   valeur exclue en x = −5 (point vide) » et « l'exclusion réelle x = −3 », réponses de a)). Seule la
 *   recherche du point de recoupement, quand l'instance en a un, est annoncée (« la courbe recoupe son
 *   asymptote horizontale ou oblique ») : sans cette phrase, l'élève ne saurait pas qu'elle est demandée.
 * - **Étapes** (`construireEnonce`) = un écran du générateur par étape, dans l'ordre de l'écran
 *   (`ordreComplet`) : elles deviennent les titres « Étape n — consigne » du corrigé détaillé.
 * - **Corrigé détaillé** tiré des MÊMES fonctions que l'écran (`formatReponseAttenduePhaseLatex`,
 *   `formatFormeExclusionLatex`, `formatPenteOrdonnee`…) ; le résultat d'une étude complète se résume
 *   par un GRAPHE (courbe, asymptotes en pointillés, point retiré, point de recoupement), montré à la
 *   dernière étape (`figureHtml`).
 * - **Variante bonus « construction inverse »** : les deux propriétés + la consigne ; le corrigé donne
 *   UNE réponse canonique (L + 1/(x − r), ou ax + b + 1/(x − r)) et sa vérification — toute fonction
 *   rationnelle qui vérifie les propriétés est acceptée.
 * - **Tirage équilibré** : `profilInstance` (`../profilsEvaluationLimites24.ts`) — la structure de
 *   l'exercice est la même d'une série à l'autre ; aucun cas particulier.
 */

const LETTRES = "abcdefghijklmnop";

/** Nombre écrit dans une phrase : vrai signe moins. */
function nombreTexte(v: number): string {
  return `${v}`.replace("-", "−");
}

function lettresParPhase(exercice: ExerciceEtudeCompletePipeline): Map<PhaseEtudeComplete, string> {
  return new Map(ordreComplet(exercice).map((p, i) => [p, LETTRES[i] ?? String(i + 1)]));
}

function asymptoteInfiniLatex(exercice: ExerciceEtudeCompletePipeline): string {
  const infini = exercice.infini;
  if (infini.type === "horizontale") return `\\text{AH : } y=${infini.limite}`;
  if (infini.type === "oblique") return `\\text{AO : } y=${formatPenteOrdonnee(infini.pente, infini.ordonnee)}`;
  return "\\text{ni AH ni AO}";
}

function avLatex(exercice: ExerciceEtudeCompletePipeline): string {
  const vas = exercice.exclusions.filter((e) => e.type !== "pointVide");
  return vas.length > 0 ? `\\text{AV : } ${vas.map((e) => `x=${e.position}`).join(",\\ ")}` : "\\text{aucune AV}";
}

function domaineLatex(exercice: ExerciceEtudeCompletePipeline): string {
  return `\\mathrm{dom}\\, f = \\mathbb{R} \\setminus ${formatReponseAttenduePhaseLatex(exercice, "domaine")[0]}`;
}

function pointVideLatex(exercice: ExerciceEtudeCompletePipeline): string | null {
  const p = exercice.exclusions.find((e) => e.type === "pointVide");
  return p ? `(${p.position}\\,;\\,${formatReponseAttenduePhaseLatex(exercice, "pointVideLimite")[0]})` : null;
}

// ============================================================================
// Étapes (une par écran) — titres « Étape n — consigne » du corrigé.
// ============================================================================

function consigneEtape(exercice: ExerciceEtudeCompletePipeline, phase: PhaseEtudeComplete): FragmentConsigne[] {
  switch (phase) {
    case "domaine":
      return [texte("Détermine le domaine de définition de f.")];
    case "typeLimite":
      return [texte("Pour chaque valeur exclue, détermine la forme obtenue en remplaçant x par cette valeur dans f(x).")];
    case "pointVideSimplification":
      return [texte("Factorise le numérateur et le dénominateur, puis simplifie le facteur commun.")];
    case "pointVideLimite": {
      const p = exercice.exclusions.find((e) => e.type === "pointVide");
      return [texte("Calcule la limite de f en "), latex(`x=${p?.position}`), texte(" à l'aide de la forme simplifiée.")];
    }
    case "limitesGD1":
    case "limitesGD2": {
      const excl = phase === "limitesGD1" ? exercice.exclusions[0] : exercice.exclusions[1];
      return [texte("Détermine les limites de f à gauche et à droite de "), latex(`x=${excl.position}`), texte(".")];
    }
    case "av":
      return [texte("Donne l'équation de chaque asymptote verticale.")];
    case "infini":
      return [texte("Détermine les limites de f en "), latex("-\\infty"), texte(" et en "), latex("+\\infty"), texte(".")];
    case "coefDirecteur":
      return [texte("Calcule "), latex("a=\\lim\\limits_{x\\to\\pm\\infty} \\dfrac{f(x)}{x}"), texte(".")];
    case "coefB":
      return [texte("Calcule "), latex("b=\\lim\\limits_{x\\to\\pm\\infty} \\big(f(x)-ax\\big)"), texte(".")];
    case "asymptoteInfini":
      return [texte("Donne l'équation de l'asymptote horizontale ou oblique, ou indique qu'il n'y en a pas.")];
    case "casSpecial":
      return [texte("Détermine le point où la courbe de f recoupe son asymptote.")];
    default:
      return [];
  }
}

function construireEnonceEtude(exercice: ExerciceEtudeCompletePipeline): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fonction "), latex(formatFonctionLatex(exercice)), texte(".")],
    questions: ordreComplet(exercice).map((phase) => ({ consigne: consigneEtape(exercice, phase) })),
  };
}

/** Consigne globale du papier — la même pour toutes les instances, sauf l'annonce du recoupement. */
function consigneGlobale(exercice: ExerciceEtudeCompletePipeline): string {
  const base =
    " Étudie cette fonction : détermine son domaine de définition et la nature de chaque valeur exclue (asymptote verticale ou point retiré), ses limites aux bornes du domaine, puis toutes ses asymptotes (verticales, horizontale ou oblique).";
  return exercice.casSpecial ? `${base} La courbe de f recoupe son asymptote horizontale ou oblique : détermine les coordonnées de ce point.` : base;
}

function enoncePapierEtude(exercice: ExerciceEtudeCompletePipeline): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte("On considère la fonction "), latex(formatFonctionLatex(exercice)), texte("."), texte(consigneGlobale(exercice))],
      questions: [],
    },
  };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

function lignesPhase(exercice: ExerciceEtudeCompletePipeline, phase: PhaseEtudeComplete, l: string): EtapeCorrection[] {
  switch (phase) {
    case "domaine":
      return [
        { label: "Méthode", sousQuestion: l, fragments: [texte("Les valeurs exclues sont celles qui annulent le dénominateur, écrit sous forme factorisée : "), latex(`${formatDenominateurLatex(exercice)}=0`), texte(".")] },
        { label: "Conclusion", sousQuestion: l, fragments: [latex(domaineLatex(exercice))] },
      ];
    case "typeLimite":
      return [
        { label: "Méthode", sousQuestion: l, fragments: [texte("Si le numérateur s'annule aussi, c'est la forme "), latex("\\frac{0}{0}"), texte(" (point vide, à simplifier) ; sinon c'est la forme "), latex("\\frac{k}{0}"), texte(" avec "), latex("k\\neq 0"), texte(" (limite infinie, asymptote verticale).")] },
        {
          label: "Conclusion",
          sousQuestion: l,
          fragments: exercice.exclusions.flatMap((e, i) => [...(i > 0 ? [texte(" ; ")] : []), latex(`x=${e.position}`), texte(" : "), latex(formatFormeExclusionLatex(e.type === "pointVide"))]).concat([texte(".")]),
        },
      ];
    case "pointVideSimplification": {
      const p = exercice.exclusions.find((e) => e.type === "pointVide");
      return [{ label: "Calcul", sousQuestion: l, fragments: [latex(`f(x)=${formatReponseAttenduePhaseLatex(exercice, "pointVideSimplification")[0]}`), texte(" pour "), latex(`x\\neq ${p?.position}`), texte(".")] }];
    }
    case "pointVideLimite": {
      const p = exercice.exclusions.find((e) => e.type === "pointVide");
      return [
        { label: "Calcul", sousQuestion: l, fragments: [latex(`\\lim\\limits_{x\\to ${p?.position}} f(x)=${formatReponseAttenduePhaseLatex(exercice, "pointVideLimite")[0]}`), texte(" (on remplace x dans la forme simplifiée).")] },
        { label: "Conclusion", sousQuestion: l, fragments: [texte("La limite est finie : pas d'asymptote verticale en "), latex(`x=${p?.position}`), texte(". La courbe a un point retiré "), latex(pointVideLatex(exercice) as string), texte(", hors du domaine.")] },
      ];
    }
    case "limitesGD1":
    case "limitesGD2": {
      const excl = phase === "limitesGD1" ? exercice.exclusions[0] : exercice.exclusions[1];
      const inf = (s: 1 | -1 | undefined) => (s === 1 ? "+\\infty" : "-\\infty");
      return [
        {
          label: "Méthode",
          sousQuestion: l,
          fragments: [
            texte(
              excl.type === "vaDouble"
                ? "Racine double du dénominateur : il garde le même signe des deux côtés, le signe de f est celui du reste de l'expression."
                : "Racine simple du dénominateur : il change de signe en passant cette valeur, on étudie le signe de f juste avant et juste après.",
            ),
          ],
        },
        {
          label: "Conclusion",
          sousQuestion: l,
          fragments:
            excl.type === "vaDouble"
              ? [latex(`\\lim\\limits_{x\\to ${excl.position}} f(x)=${inf(excl.signeGauche)}`), texte(" (des deux côtés).")]
              : [latex(`${formatLabelLimiteGaucheLatex(excl.position)}${inf(excl.signeGauche)}`), texte(" et "), latex(`${formatLabelLimiteDroiteLatex(excl.position)}${inf(excl.signeDroit)}`), texte(".")],
        },
      ];
    }
    case "av":
      return [{ label: "Conclusion", sousQuestion: l, fragments: [latex(avLatex(exercice)), texte(exercice.exclusions.some((e) => e.type === "pointVide") ? " (le point vide ne donne pas d'asymptote)." : ".")] }];
    case "infini": {
      const t = exercice.infini.type;
      const degre = (c: number[]) => c.reduce((d, v, i) => (v !== 0 ? i : d), 0);
      const degN = degre(exercice.coeffsN);
      const degD = degre(exercice.coeffsD);
      const methode =
        t !== "horizontale"
          ? "Degré du numérateur supérieur à celui du dénominateur : la limite à l'infini est infinie (signe du quotient des termes de plus haut degré)."
          : degN < degD
            ? "Degré du numérateur inférieur à celui du dénominateur : la limite à l'infini est 0."
            : "Degrés égaux : la limite à l'infini est le rapport des coefficients des termes de plus haut degré.";
      const [moins, plus] = formatReponseAttenduePhaseLatex(exercice, "infini")[0].split("\\ /\\ ");
      return [
        { label: "Méthode", sousQuestion: l, fragments: [texte(methode)] },
        { label: "Conclusion", sousQuestion: l, fragments: [latex(`\\lim\\limits_{x\\to -\\infty} f(x)=${moins}`), texte(" et "), latex(`\\lim\\limits_{x\\to +\\infty} f(x)=${plus}`), texte(".")] },
      ];
    }
    case "coefDirecteur": {
      const infini = exercice.infini;
      if (infini.type === "oblique") {
        return [{ label: "Calcul", sousQuestion: l, fragments: [latex(`a=\\lim\\limits_{x\\to\\pm\\infty} \\dfrac{f(x)}{x}=${infini.pente}`), texte(" : fini et non nul, une asymptote oblique est possible.")] }];
      }
      const [moins, plus] = formatReponseAttenduePhaseLatex(exercice, "coefDirecteur")[0].split("\\ /\\ ");
      return [{ label: "Calcul", sousQuestion: l, fragments: [latex(`\\lim\\limits_{x\\to -\\infty} \\dfrac{f(x)}{x}=${moins}`), texte(" et "), latex(`\\lim\\limits_{x\\to +\\infty} \\dfrac{f(x)}{x}=${plus}`), texte(" : infini, donc pas d'asymptote oblique.")] }];
    }
    case "coefB": {
      const infini = exercice.infini;
      if (infini.type !== "oblique") return [];
      const moinsAx = infini.pente === 1 ? "-x" : infini.pente === -1 ? "+x" : infini.pente > 0 ? `-${infini.pente}x` : `+${-infini.pente}x`;
      return [{ label: "Calcul", sousQuestion: l, fragments: [latex(`b=\\lim\\limits_{x\\to\\pm\\infty} \\big(f(x)${moinsAx}\\big)=${infini.ordonnee}`), texte(".")] }];
    }
    case "asymptoteInfini":
      return [{ label: "Conclusion", sousQuestion: l, fragments: [latex(asymptoteInfiniLatex(exercice)), texte(exercice.infini.type === "aucune" ? " : limites infinies et coefficient a infini." : ", en −∞ et en +∞.")] }];
    case "casSpecial": {
      const cs = exercice.casSpecial;
      if (!cs) return [];
      const expr = exercice.infini.type === "horizontale" ? `${exercice.infini.limite}` : exercice.infini.type === "oblique" ? formatPenteOrdonnee(exercice.infini.pente, exercice.infini.ordonnee) : "";
      return [
        { label: "Méthode", sousQuestion: l, fragments: [texte("On résout l'équation "), latex(`f(x)=${expr}`), texte(" : on égale f à l'expression de l'asymptote.")] },
        { label: "Conclusion", sousQuestion: l, fragments: [texte("La courbe recoupe son asymptote au point "), latex(formatReponseAttenduePhaseLatex(exercice, "casSpecial")[0]), texte(".")] },
      ];
    }
    default:
      return [];
  }
}

function piegeEtude(exercice: ExerciceEtudeCompletePipeline): FragmentConsigne[] {
  if (exercice.exclusions.some((e) => e.type === "pointVide")) {
    return [texte("Une valeur qui annule numérateur et dénominateur (forme "), latex("\\frac{0}{0}"), texte(") n'est pas une asymptote verticale : après simplification, la limite est finie.")];
  }
  if (exercice.exclusions.some((e) => e.type === "vaDouble")) {
    return [texte("En une racine double du dénominateur, les limites à gauche et à droite ont le même signe.")];
  }
  if (exercice.infini.type === "oblique") {
    return [texte("b se calcule par "), latex("\\lim\\big(f(x)-ax\\big)"), texte(" : ce n'est pas l'ordonnée à l'origine de f.")];
  }
  return [texte("En une racine simple du dénominateur, les limites à gauche et à droite sont de signes opposés : étudie le signe des deux côtés.")];
}

function correctionDetailleeEtude(exercice: ExerciceEtudeCompletePipeline): EtapeCorrection[] {
  const lettres = lettresParPhase(exercice);
  const ordre = ordreComplet(exercice);
  const lignes = ordre.flatMap((phase) => lignesPhase(exercice, phase, lettres.get(phase) as string));
  const derniere = lettres.get(ordre[ordre.length - 1]) as string;
  lignes.push({ label: "Graphique", sousQuestion: derniere, fragments: [texte("Allure de la courbe, avec ses asymptotes en pointillés.")], figureHtml: construireSvgEtudeComplete(exercice) });
  lignes.push({ label: "Piège", fragments: piegeEtude(exercice) });
  return lignes;
}

function reponseBreveEtude(exercice: ExerciceEtudeCompletePipeline): FragmentConsigne[] {
  const fr: FragmentConsigne[] = [latex(domaineLatex(exercice)), texte(" ; "), latex(avLatex(exercice)), texte(" ; "), latex(asymptoteInfiniLatex(exercice))];
  const pv = pointVideLatex(exercice);
  if (pv) fr.push(texte(" ; point retiré "), latex(pv));
  if (exercice.casSpecial) fr.push(texte(" ; recoupement en "), latex(formatReponseAttenduePhaseLatex(exercice, "casSpecial")[0]));
  fr.push(texte("."));
  return fr;
}

function baremeEtude(exercice: ExerciceEtudeCompletePipeline): BaremeExercice {
  const lettres = lettresParPhase(exercice);
  const pointVide = exercice.exclusions.some((e) => e.type === "pointVide");
  const recoupement = !!exercice.casSpecial;
  // Poids : somme 4, aucun critère sous 0,5 (sinon il s'arrondit à 0 au demi-point).
  const poids = pointVide && recoupement ? { dom: 1, pv: 0.5, av: 1, inf: 1, rec: 0.5 } : pointVide ? { dom: 1, pv: 1, av: 1, inf: 1, rec: 0 } : recoupement ? { dom: 1, pv: 0, av: 1, inf: 1.5, rec: 0.5 } : { dom: 1, pv: 0, av: 1.5, inf: 1.5, rec: 0 };
  const criteres: CritereBareme[] = [
    { sousQuestion: lettres.get("typeLimite"), critere: [texte("Domaine et nature de chaque valeur exclue")], points: poids.dom },
  ];
  if (pointVide) criteres.push({ sousQuestion: lettres.get("pointVideLimite"), critere: [texte("Simplification et limite au point vide (point retiré, pas d'asymptote)")], points: poids.pv });
  criteres.push({ sousQuestion: lettres.get("av"), critere: [texte("Limites à gauche et à droite, équation de chaque asymptote verticale")], points: poids.av });
  criteres.push({ sousQuestion: lettres.get("asymptoteInfini"), critere: [texte(exercice.infini.type === "oblique" ? "Limites à l'infini, a et b, équation de l'asymptote oblique" : exercice.infini.type === "horizontale" ? "Limites à l'infini et équation de l'asymptote horizontale" : "Limites à l'infini, coefficient a infini, aucune asymptote horizontale ni oblique")], points: poids.inf });
  if (recoupement) criteres.push({ sousQuestion: lettres.get("casSpecial"), critere: [texte("Coordonnées du point de recoupement")], points: poids.rec });

  const erreurs: ErreurFrequente[] = [];
  if (pointVide) erreurs.push({ description: [texte("Annoncer une asymptote verticale au point vide")], cout: "0 pt sur les asymptotes verticales" });
  if (exercice.exclusions.some((e) => e.type === "vaDouble")) erreurs.push({ description: [texte("Limites de signes opposés en une racine double")], cout: "moitié des points des limites latérales" });
  if (exercice.infini.type === "oblique") erreurs.push({ description: [texte("Prendre pour b l'ordonnée à l'origine de f au lieu de "), latex("\\lim\\big(f(x)-ax\\big)")], cout: "0 pt sur b" });
  if (exercice.infini.type === "horizontale") erreurs.push({ description: [texte("Asymptote horizontale donnée par le rapport des termes constants au lieu des termes de plus haut degré")], cout: "0 pt sur l'asymptote horizontale" });
  erreurs.push({ description: [texte("Oublier une valeur exclue du domaine (factorisation incomplète du dénominateur)")], cout: "0 pt sur le domaine" });

  return {
    reponseFinale: reponseBreveEtude(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Limites infinies écrites "), latex("+\\infty"), texte(" / "), latex("-\\infty"), texte(" avec la justification du signe ; domaine écrit en intervalles")]],
  };
}

function difficulteEtude(exercice: ExerciceEtudeCompletePipeline): 1 | 2 | 3 {
  const simple = exercice.exclusions.length === 1 && exercice.infini.type !== "oblique" && !exercice.casSpecial;
  return simple ? 2 : 3;
}

// ============================================================================
// Graphe du corrigé — courbe, asymptotes en pointillés, point retiré, point de recoupement.
// ============================================================================

const LARGEUR_SVG = 440;
const HAUTEUR_SVG = 300;
/** Même marge que `export/svgGraph.ts` (constante non exportée) : repère identique pour les ajouts. */
const MARGE_SVG = 10;
const COULEUR_COURBE = "#1971c2";
const COULEUR_ASYMPTOTE = "#d9480f";

function evaluerF(exercice: ExerciceEtudeCompletePipeline, x: number): number {
  return polyEval(exercice.coeffsN, x) / polyEval(exercice.coeffsD, x);
}

function fenetre(exercice: ExerciceEtudeCompletePipeline): ViewBoxSvg {
  const abscisses = [...exercice.exclusions.map((e) => e.position), ...(exercice.casSpecial ? [exercice.casSpecial.x] : []), 0];
  let xMin = Math.min(...abscisses) - 4;
  let xMax = Math.max(...abscisses) + 4;
  if (xMax - xMin < 12) {
    const c = (xMin + xMax) / 2;
    xMin = c - 6;
    xMax = c + 6;
  }
  const ys: number[] = [];
  for (let i = 0; i <= 400; i++) {
    const x = xMin + ((xMax - xMin) * i) / 400;
    if (exercice.exclusions.some((e) => Math.abs(x - e.position) < 0.4)) continue;
    const y = evaluerF(exercice, x);
    if (Number.isFinite(y)) ys.push(y);
  }
  ys.sort((a, b) => a - b);
  const q = (p: number) => ys[Math.min(ys.length - 1, Math.max(0, Math.floor(p * (ys.length - 1))))] ?? 0;
  const reperes = [q(0.12), q(0.88), 0];
  if (exercice.infini.type === "horizontale") reperes.push(exercice.infini.limite);
  if (exercice.casSpecial) reperes.push(exercice.casSpecial.y);
  const pv = exercice.exclusions.find((e) => e.type === "pointVide");
  if (pv && pv.valeurPointVide !== undefined) reperes.push(pv.valeurPointVide);
  let yMin = Math.min(...reperes);
  let yMax = Math.max(...reperes);
  if (yMax - yMin < 8) {
    const c = (yMin + yMax) / 2;
    yMin = c - 4;
    yMax = c + 4;
  }
  if (yMax - yMin > 40) {
    const c = Math.max(Math.min((yMin + yMax) / 2, 20), -20);
    yMin = c - 20;
    yMax = c + 20;
  }
  const marge = (yMax - yMin) * 0.12;
  return { xMin, xMax, yMin: yMin - marge, yMax: yMax + marge };
}

function texteSvg(x: number, y: number, contenu: string, ancre: "start" | "end" | "middle", couleur: string): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="10" fill="${couleur}" text-anchor="${ancre}" stroke="#ffffff" stroke-width="2.5" paint-order="stroke" font-family="Archivo, Arial, Helvetica, sans-serif">${contenu}</text>`;
}

function construireSvgEtudeComplete(exercice: ExerciceEtudeCompletePipeline): string {
  const vb = fenetre(exercice);
  const etendue = vb.yMax - vb.yMin;
  const evaluer = (x: number): number | null => {
    if (exercice.exclusions.some((e) => Math.abs(x - e.position) < 1e-9)) return null;
    const y = evaluerF(exercice, x);
    // Seuil large : près d'une asymptote verticale, le dernier point tracé doit sortir du cadre (la
    // courbe rejoint le bord, le <svg> coupe le reste) au lieu de s'arrêter au milieu.
    return Number.isFinite(y) && y > vb.yMin - 6 * etendue && y < vb.yMax + 6 * etendue ? y : null;
  };
  const infini = exercice.infini;
  const droite = infini.type === "horizontale" ? (_x: number) => infini.limite : infini.type === "oblique" ? (x: number) => infini.pente * x + infini.ordonnee : null;
  // Point de recoupement : disque seul ici, étiquette ajoutée plus bas (décalée, avec halo) — celle de
  // `construireSvgFonction` se superpose à l'axe quand le point est en x = 0.
  const points = exercice.casSpecial ? [{ x: exercice.casSpecial.x, y: exercice.casSpecial.y }] : [];
  const svg = construireSvgFonction(evaluer, vb, {
    largeur: LARGEUR_SVG,
    hauteur: HAUTEUR_SVG,
    couleurCourbe: COULEUR_COURBE,
    classe: "figure-corrige",
    points,
    courbesSecondaires: droite ? [{ evaluer: droite, couleur: COULEUR_ASYMPTOTE, pointilles: true }] : undefined,
    legende: [
      { texte: "courbe de f", couleur: COULEUR_COURBE },
      { texte: "asymptotes", couleur: COULEUR_ASYMPTOTE, pointilles: true },
    ],
  });
  const zoneX = LARGEUR_SVG - 2 * MARGE_SVG;
  const zoneY = HAUTEUR_SVG - 2 * MARGE_SVG;
  const sx = (x: number) => MARGE_SVG + ((x - vb.xMin) / (vb.xMax - vb.xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG + ((vb.yMax - y) / (vb.yMax - vb.yMin)) * zoneY;
  const ajouts: string[] = [];
  // Raccord fin de la courbe de part et d'autre de chaque asymptote verticale : `construireSvgFonction`
  // échantillonne 240 points, trop peu près d'un pôle « faible » (la courbe s'arrêtait à mi-hauteur).
  const pas = (vb.xMax - vb.xMin) / 240;
  const limiteY = (y: number) => Math.min(Math.max(y, vb.yMin - etendue), vb.yMax + etendue);
  for (const e of exercice.exclusions.filter((x) => x.type !== "pointVide")) {
    for (const cote of [-1, 1]) {
      const pts: string[] = [];
      for (let d = 1.5 * pas; d > 1e-7; d *= 0.8) {
        const y = evaluerF(exercice, e.position + cote * d);
        if (!Number.isFinite(y)) break;
        pts.push(`${sx(e.position + cote * d).toFixed(1)},${sy(limiteY(y)).toFixed(1)}`);
        if (y < vb.yMin - etendue || y > vb.yMax + etendue) break;
      }
      if (pts.length > 1) ajouts.push(`<polyline points="${pts.join(" ")}" fill="none" stroke="${COULEUR_COURBE}" stroke-width="2.2" stroke-linecap="round"/>`);
    }
  }
  // Asymptotes verticales (droites x = r) et leur équation en haut.
  for (const e of exercice.exclusions.filter((x) => x.type !== "pointVide")) {
    const X = sx(e.position);
    ajouts.push(`<line x1="${X.toFixed(1)}" y1="${MARGE_SVG}" x2="${X.toFixed(1)}" y2="${HAUTEUR_SVG - MARGE_SVG}" stroke="${COULEUR_ASYMPTOTE}" stroke-width="1.6" stroke-dasharray="6 4"/>`);
    ajouts.push(texteSvg(X + 4, HAUTEUR_SVG - MARGE_SVG - 6, `x = ${nombreTexte(e.position)}`, "start", COULEUR_ASYMPTOTE));
  }
  // Équation de l'asymptote horizontale / oblique, au bord droit.
  if (droite) {
    const xe = vb.xMax - (vb.xMax - vb.xMin) * 0.03;
    const ye = Math.min(Math.max(droite(xe), vb.yMin + etendue * 0.06), vb.yMax - etendue * 0.06);
    const eq = infini.type === "horizontale" ? `y = ${nombreTexte(infini.limite)}` : infini.type === "oblique" ? `y = ${formatPenteOrdonnee(infini.pente, infini.ordonnee).replace(/-/g, "−")}` : "";
    // Du côté de la droite opposé à la courbe (sinon l'équation chevauche le tracé).
    const fe = evaluerF(exercice, xe);
    const courbeAuDessus = Number.isFinite(fe) && fe > droite(xe);
    ajouts.push(texteSvg(sx(xe), sy(ye) + (courbeAuDessus ? 14 : -6), eq, "end", COULEUR_ASYMPTOTE));
  }
  if (exercice.casSpecial) {
    const { x, y } = exercice.casSpecial;
    ajouts.push(texteSvg(sx(x) + 7, sy(y) + (y >= (droite ? droite(x) : 0) ? -8 : 14), `(${nombreTexte(x)} ; ${nombreTexte(y)})`, "start", COULEUR_COURBE));
  }
  // Point retiré (cercle vide).
  const pv = exercice.exclusions.find((e) => e.type === "pointVide");
  if (pv && pv.valeurPointVide !== undefined) {
    ajouts.push(`<circle cx="${sx(pv.position).toFixed(1)}" cy="${sy(pv.valeurPointVide).toFixed(1)}" r="4" fill="#ffffff" stroke="${COULEUR_COURBE}" stroke-width="1.8"/>`);
  }
  return svg.replace("</svg>", `${ajouts.join("")}</svg>`);
}

// ============================================================================
// Variante bonus — construction inverse.
// ============================================================================

function facteurLatex(r: number): string {
  if (r === 0) return "x";
  return r > 0 ? `x-${r}` : `x+${-r}`;
}

function exempleConstructionInverseLatex(exercice: ExerciceEtudeCompleteBonus): string {
  const { racineDenominateur: r, asymptote } = exercice.proprietes;
  const partie = asymptote.type === "horizontale" ? `${asymptote.limite}` : formatPenteOrdonnee(asymptote.pente, asymptote.ordonnee);
  return `f(x)=${partie}+\\dfrac{1}{${facteurLatex(r)}}`;
}

function construireEnonceConstructionInverse(exercice: ExerciceEtudeCompleteBonus): SectionExercice {
  const [p1, p2] = formatProprietesConstructionInverseTexte(exercice.proprietes);
  return {
    enteteFragments: [texte(`Une fonction rationnelle f vérifie les deux propriétés suivantes. 1. ${p1} 2. ${p2}`)],
    questions: [{ consigne: [texte("Construis une fonction rationnelle f qui vérifie ces deux propriétés.")] }],
  };
}

function enoncePapierConstructionInverse(exercice: ExerciceEtudeCompleteBonus): EnoncePapier {
  const [p1, p2] = formatProprietesConstructionInverseTexte(exercice.proprietes);
  return {
    section: {
      enteteFragments: [texte(`Une fonction rationnelle f vérifie les deux propriétés suivantes. 1. ${p1} 2. ${p2} Construis une telle fonction f, puis justifie qu'elle vérifie les deux propriétés.`)],
      questions: [],
    },
  };
}

function correctionDetailleeConstructionInverse(exercice: ExerciceEtudeCompleteBonus): EtapeCorrection[] {
  const { racineDenominateur: r, asymptote } = exercice.proprietes;
  const partie = asymptote.type === "horizontale" ? `${asymptote.limite}` : formatPenteOrdonnee(asymptote.pente, asymptote.ordonnee);
  return [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [
        texte("On part de l'asymptote demandée et on lui ajoute un terme qui tend vers 0 à l'infini et dont le dénominateur s'annule en "),
        latex(`x=${r}`),
        texte(" : "),
        latex(`\\dfrac{1}{${facteurLatex(r)}}`),
        texte("."),
      ],
    },
    { label: "Réponse", sousQuestion: "a", fragments: [texte("Par exemple "), latex(exempleConstructionInverseLatex(exercice)), texte(" (toute autre fonction rationnelle qui vérifie les deux propriétés est acceptée).")] },
    {
      label: "Vérification",
      sousQuestion: "a",
      fragments: [
        texte("Le dénominateur s'annule en "),
        latex(`x=${r}`),
        texte(" et le numérateur non : f n'y est pas définie (asymptote verticale). Quand "),
        latex("x\\to\\pm\\infty"),
        texte(", "),
        latex(`\\dfrac{1}{${facteurLatex(r)}}\\to 0`),
        texte(", donc "),
        latex(`f(x)-\\big(${partie}\\big)\\to 0`),
        texte(asymptote.type === "horizontale" ? " : asymptote horizontale demandée." : " : asymptote oblique demandée."),
      ],
    },
    { label: "Piège", fragments: [texte("Un terme qui ne tend pas vers 0 à l'infini (par exemple x divisé par un polynôme de même degré) modifie l'asymptote.")] },
  ];
}

function baremeConstructionInverse(exercice: ExerciceEtudeCompleteBonus): BaremeExercice {
  const r = exercice.proprietes.racineDenominateur;
  return {
    reponseFinale: [texte("Par exemple "), latex(exempleConstructionInverseLatex(exercice))],
    criteres: [
      { sousQuestion: "a", critere: [texte("Dénominateur qui s'annule en "), latex(`x=${r}`), texte(" (numérateur non nul en ce point)")], points: 1.5 },
      { sousQuestion: "a", critere: [texte(exercice.proprietes.asymptote.type === "horizontale" ? "Asymptote horizontale demandée (degrés et coefficients dominants)" : "Asymptote oblique demandée (degré du numérateur = degré du dénominateur + 1, a et b justes)")], points: 2 },
      { sousQuestion: "a", critere: [texte("Vérification des deux propriétés")], points: 0.5 },
    ],
    erreursFrequentes: [
      { description: [texte("Numérateur qui s'annule aussi en "), latex(`x=${r}`), texte(" (point vide au lieu d'une asymptote verticale)")], cout: "0 pt sur la première propriété" },
      { description: [texte("Asymptote décalée : terme ajouté qui ne tend pas vers 0")], cout: "0 pt sur la seconde propriété" },
    ],
    reponsesAcceptees: [[texte("Toute fonction rationnelle qui vérifie les deux propriétés, sous forme développée ou non")]],
  };
}

// ============================================================================
// Assemblage — dispatch par mode.
// ============================================================================

function construireEnonceEtudeComplete(exercice: ExerciceEtudeComplete): SectionExercice {
  return exercice.mode === "constructionInverse" ? construireEnonceConstructionInverse(exercice) : construireEnonceEtude(exercice);
}

function correctionDetailleeEtudeComplete(exercice: ExerciceEtudeComplete): EtapeCorrection[] {
  return exercice.mode === "constructionInverse" ? correctionDetailleeConstructionInverse(exercice) : correctionDetailleeEtude(exercice);
}

/** Corrigé « simple » (repli du contrat) : les lignes du corrigé détaillé, puis le graphe. */
function construireCorrectionEtudeComplete(exercice: ExerciceEtudeComplete): BlocCorrection[] {
  const lignes = correctionDetailleeEtudeComplete(exercice);
  const blocs: BlocCorrection[] = lignes.map((e) => ({ type: "paragraphe", fragments: [texte(`${e.label} : `), ...e.fragments] }));
  const figure = lignes.find((e) => e.figureHtml)?.figureHtml;
  if (figure) blocs.push({ type: "html", html: figure });
  return blocs;
}

export const adaptateurEvaluationEtudeComplete: AdaptateurFeuilleExercices<ExerciceEtudeComplete> = {
  titreDocument: "Étude complète — Limites et asymptotes — Évaluation",
  nomFichierBase: "etude-complete-limites-asymptotes",
  genererInstance: genererExerciceEtudeComplete,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceEtudeComplete,
  construireCorrection: construireCorrectionEtudeComplete,
  difficulte: (e) => (e.mode === "constructionInverse" ? 2 : difficulteEtude(e)),
  reponseBreve: (e) => (e.mode === "constructionInverse" ? [texte("Par exemple "), latex(exempleConstructionInverseLatex(e)), texte(".")] : reponseBreveEtude(e)),
  correctionDetaillee: correctionDetailleeEtudeComplete,
  bareme: (e) => (e.mode === "constructionInverse" ? baremeConstructionInverse(e) : baremeEtude(e)),
  enoncePapier: (e) => (e.mode === "constructionInverse" ? enoncePapierConstructionInverse(e) : enoncePapierEtude(e)),
  dureeMinutes: 15,
  profilInstance: profilEtudeComplete,
};
