import type { ExerciceEtudeComplete, ExerciceEtudeCompleteBonus, ExerciceEtudeCompletePipeline } from "../../core5e/etudeComplete.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeEtudeComplete, lettrePhaseEtudeComplete } from "./corrigeDetaille";
import { ordreComplet, type PhaseEtudeComplete } from "../../moteur5e/typesEtudeComplete";
import {
  formatFonctionLatex,
  formatPenteOrdonnee,
  formatProprietesConstructionInverseTexte,
  formatReponseAttenduePhaseLatex,
} from "../../ui5e/formatEtudeComplete";
import { profilEtudeComplete } from "../profilsEvaluationLimites24";
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
  return `\\operatorname{dom} f=\\mathbb{R}\\setminus\\{${exercice.exclusions.map((e) => e.position).join("\\,;\\,")}\\}`;
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

/** Niveau 1–7 : les asymptotes verticales et l'asymptote horizontale / oblique sont des écrans de
 * pure décision (les limites sont déjà calculées) ; méthode 1 (étude : choisir les techniques), 2
 * pour la construction inverse (l'élève construit la fonction) ; piège dans les DONNÉES : point vide
 * (forme 0/0 qui n'est pas une asymptote) ou racine double (limites de même signe). */
function criteresDifficulteEtudeComplete(exercice: ExerciceEtudeComplete): CriteresDifficulte {
  const corrige = correctionDetailleeEtudeComplete(exercice);
  if (exercice.mode === "constructionInverse") return { ...etapesDuCorrige(corrige, []), methode: 2, piege: 0 };
  const lecture = [lettrePhaseEtudeComplete(exercice, "av"), lettrePhaseEtudeComplete(exercice, "asymptoteInfini")];
  const piege = exercice.exclusions.some((x) => x.type === "pointVide" || x.type === "vaDouble") ? 1 : 0;
  return { ...etapesDuCorrige(corrige, lecture), methode: 1, piege };
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
  criteresDifficulte: criteresDifficulteEtudeComplete,
  reponseBreve: (e) => (e.mode === "constructionInverse" ? [texte("Par exemple "), latex(exempleConstructionInverseLatex(e)), texte(".")] : reponseBreveEtude(e)),
  correctionDetaillee: correctionDetailleeEtudeComplete,
  bareme: (e) => (e.mode === "constructionInverse" ? baremeConstructionInverse(e) : baremeEtude(e)),
  enoncePapier: (e) => (e.mode === "constructionInverse" ? enoncePapierConstructionInverse(e) : enoncePapierEtude(e)),
  profilInstance: profilEtudeComplete,
};
