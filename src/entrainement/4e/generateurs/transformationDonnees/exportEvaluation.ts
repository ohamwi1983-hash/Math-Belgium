import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceTransformationDonnees } from "../../core/transformationDonnees.types";
import {
  CONSIGNE_GENERALE,
  aCarre,
  calculEcart,
  calculPosition,
  calculVariance,
  conclusionBreve,
  contexte,
  ecrans,
  indicateursTexte,
  nombreLatex,
  phrasesConclusion,
  populationTexte,
  tableauIndicateursHtml,
  traductionTransformation,
  transformationTexte,
  uniteVariance,
  valeurAvecUnite,
} from "../../ui/formatTransformationDonnees";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTransformationDonnees } from "./index";
import { profilTransformationDonnees } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen108. Énoncé papier = population, tableau des
 * indicateurs de départ, transformation (mots du contexte) et deux VRAIES questions : a) les cinq
 * nouveaux indicateurs (étapes 1 à 3 de l'écran : y = a·x + b, position, dispersion) ; b) une phrase
 * qui explique l'effet de la transformation (étape 4). Séries équilibrées : `profil.ts`.
 */

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function donneesHtml(e: ExerciceTransformationDonnees): string {
  return (
    `<p class="paragraphe">${echapper(populationTexte(e))}</p>` +
    `<div class="paragraphe">${tableauIndicateursHtml(e)}</div>` +
    `<p class="paragraphe"><strong>${echapper(transformationTexte(e))}</strong></p>`
  );
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceTransformationDonnees): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE)],
    enteteHtml: donneesHtml(e),
    questions: ecrans(e).map((ecran) => ({ consigne: ecran.type === "choix" ? [texte("Décris l'effet de cette transformation sur la série.")] : ecran.consigne })),
  };
}

function enoncePapier(e: ExerciceTransformationDonnees): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(CONSIGNE_GENERALE)],
      enteteHtml: donneesHtml(e),
      questions: [
        { consigne: [texte("Détermine la moyenne, la médiane, l'étendue, la variance et l'écart-type de la nouvelle série, avec leur unité. Justifie à l'aide de la transformation écrite sous la forme "), latex("y = a\\,x + b"), texte(".")] },
        { consigne: [texte("Explique en une phrase l'effet de cette transformation sur la moyenne et sur la dispersion de la série.")] },
      ],
    },
    etapesParQuestion: [["a", "b", "c"], ["d"]],
    reponseBreve: [texte(`a) ${indicateursTexte(e)}. b) ${conclusionBreve(e).charAt(0).toUpperCase()}${conclusionBreve(e).slice(1)}`)],
  };
}

function reponseBreve(e: ExerciceTransformationDonnees): FragmentConsigne[] {
  return [texte(`${indicateursTexte(e).charAt(0).toUpperCase()}${indicateursTexte(e).slice(1)}.`)];
}

function piege(e: ExerciceTransformationDonnees): EtapeCorrection {
  const c = contexte(e);
  const y = e.arrivee;
  const x = e.depart;
  switch (e.forme) {
    case "constante":
      return {
        label: "Piège",
        sousQuestion: "c",
        fragments: [texte(`Ne pas ${e.b > 0 ? "ajouter" : "retirer"} ${nombreTexte(Math.abs(e.b))} à l'écart-type : on obtiendrait ${valeurAvecUnite(x.ecartType + e.b, c.uniteY)}, alors que décaler toutes les valeurs du même nombre ne change aucun écart entre elles.`)],
      };
    case "pourcentage":
    case "facteur":
      return {
        label: "Piège",
        sousQuestion: "c",
        fragments: [
          texte("La variance est une moyenne de carrés d'écarts : elle est multipliée par "),
          latex(`a^2 = ${nombreLatex(aCarre(e))}`),
          texte(`, pas par ${nombreTexte(e.a)} — sinon on trouverait ${valeurAvecUnite(Math.round(e.a * x.variance * 1e9) / 1e9, uniteVariance(c.uniteY))} au lieu de ${valeurAvecUnite(y.variance, uniteVariance(c.uniteY))}.`),
          ...(e.pourcentage !== null ? [texte(` Et une ${e.pourcentage > 0 ? "hausse" : "baisse"} de ${nombreTexte(Math.abs(e.pourcentage))} % multiplie par ${nombreTexte(e.a)}, pas par ${nombreTexte(Math.abs(e.pourcentage) / 100)}.`)] : []),
        ],
      };
    case "direct":
      return {
        label: "Piège",
        sousQuestion: "c",
        fragments: [texte(`Le « + ${nombreTexte(e.b)} » ne touche ni l'étendue ni l'écart-type : l'écart-type vaut ${valeurAvecUnite(y.ecartType, c.uniteY)}, pas ${valeurAvecUnite(Math.round((y.ecartType + e.b) * 1e9) / 1e9, c.uniteY)}.`)],
      };
    case "avant":
      return {
        label: "Piège",
        sousQuestion: "a",
        fragments: [
          texte(`La constante ${nombreTexte(e.constante!)} est ajoutée avant la multiplication : `),
          latex(`b = ${nombreLatex(e.a)} \\times ${nombreLatex(e.constante!)} = ${nombreLatex(e.b)}`),
          texte(`, pas ${nombreTexte(e.constante!)}. Avec `),
          latex(`b = ${nombreLatex(e.constante!)}`),
          texte(`, la moyenne serait fausse (${valeurAvecUnite(Math.round((e.a * x.moyenne + e.constante!) * 1e9) / 1e9, c.uniteY)}).`),
        ],
      };
    case "negatif":
      return {
        label: "Piège",
        sousQuestion: "c",
        fragments: [
          texte("Ici "),
          latex("a = -1"),
          texte(" : l'écart-type est multiplié par "),
          latex("|a| = 1"),
          texte(" — il ne change pas et ne devient surtout pas négatif. La variance est multipliée par "),
          latex("a^2 = 1"),
          texte("."),
        ],
      };
  }
}

function nombreTexte(n: number): string {
  return valeurAvecUnite(n, "").trim();
}

function correctionDetaillee(e: ExerciceTransformationDonnees): EtapeCorrection[] {
  const c = contexte(e);
  const u = ` ${c.uniteY}`;
  return [
    { label: "Méthode", sousQuestion: "a", fragments: traductionTransformation(e) },
    { label: "Méthode", sousQuestion: "b", fragments: [texte("La moyenne et la médiane subissent la même transformation que chaque valeur : "), latex("\\bar{y} = a\\,\\bar{x} + b"), texte(".")] },
    {
      label: "Calcul",
      sousQuestion: "b",
      fragments: [texte("Moyenne : "), latex(`\\bar{y} = ${calculPosition(e, "moyenne")}`), texte(`${u} ; médiane : `), latex(calculPosition(e, "mediane")), texte(`${u}.`)],
    },
    {
      label: "Méthode",
      sousQuestion: "c",
      fragments: [texte("La constante "), latex("b"), texte(" ne change aucun écart ; seul "), latex("a"), texte(" agit, en valeur absolue (au carré pour la variance) : "), latex("E_y = |a| \\times E_x,\\quad V_y = a^2 \\times V_x,\\quad \\sigma_y = |a| \\times \\sigma_x"), texte(".")],
    },
    {
      label: "Calcul",
      sousQuestion: "c",
      fragments: [
        texte("Étendue : "),
        latex(`E_y = ${calculEcart(e, "etendue")}`),
        texte(`${u} ; variance : `),
        latex(`V_y = ${calculVariance(e)}`),
        texte(` ${uniteVariance(c.uniteY)} ; écart-type : `),
        latex(`\\sigma_y = ${calculEcart(e, "ecartType")}`),
        texte(`${u}.`),
      ],
    },
    { label: "Conclusion", sousQuestion: "d", fragments: phrasesConclusion(e)[0]! },
    piege(e),
  ];
}

function construireCorrection(e: ExerciceTransformationDonnees): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: reponseBreve(e) },
    { type: "paragraphe", fragments: phrasesConclusion(e)[0]! },
  ];
}

function bareme(e: ExerciceTransformationDonnees): BaremeExercice {
  const erreurs: ErreurFrequente[] = [];
  if (e.b !== 0) erreurs.push({ description: [texte("Constante "), latex("b"), texte(" ajoutée à l'étendue, à la variance ou à l'écart-type")], cout: "−0,5 par indicateur" });
  if (Math.abs(e.a) !== 1) erreurs.push({ description: [texte("Variance multipliée par "), latex("a"), texte(" au lieu de "), latex("a^2")], cout: "−0,5" });
  if (e.pourcentage !== null) erreurs.push({ description: [texte(`Coefficient ${nombreTexte(Math.abs(e.pourcentage) / 100)} au lieu de ${nombreTexte(e.a)} pour un pourcentage`)], cout: "0 pt sur a), b) et c)" });
  if (e.forme === "avant") erreurs.push({ description: [texte(`b = ${nombreTexte(e.constante!)} au lieu de ${nombreTexte(e.b)} (constante non multipliée)`)], cout: "−1 (moyenne et médiane fausses)" });
  if (e.a < 0) erreurs.push({ description: [texte("Écart-type ou étendue négatifs (multipliés par "), latex("a"), texte(" au lieu de "), latex("|a|"), texte(")")], cout: "−0,5" });
  erreurs.push({ description: [texte("Tous les indicateurs recalculés « à l'aveugle » avec la formule complète "), latex("a\\,x + b")], cout: "0 pt sur c) et d)" });
  erreurs.push({ description: [texte("Unité absente ou fausse (la variance est en unité au carré)")], cout: "−0,5 au total" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Transformation écrite sous la forme "), latex("y = a\\,x + b"), texte(" (coefficients justes)")], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Nouvelle moyenne et nouvelle médiane")], points: 1 },
      { sousQuestion: "c", critere: [texte("Nouvelle étendue, variance et écart-type (facteurs "), latex("|a|"), texte(" et "), latex("a^2"), texte(", constante sans effet)")], points: 1.5 },
      { sousQuestion: "d", critere: [texte("Effet sur la position et sur la dispersion expliqué en une phrase")], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Écart-type obtenu comme racine carrée de la nouvelle variance (même valeur)")],
      [texte("Explication équivalente, par exemple « la série est décalée / étirée, ses écarts sont multipliés par |a| »")],
    ],
  };
}

const DIFFICULTE: Record<ExerciceTransformationDonnees["forme"], 1 | 2 | 3> = {
  constante: 1,
  pourcentage: 2,
  facteur: 2,
  direct: 2,
  avant: 3,
  negatif: 3,
};

export const adaptateurEvaluationTransformationDonnees: AdaptateurFeuilleExercices<ExerciceTransformationDonnees> = {
  profilInstance: profilTransformationDonnees,
  titreDocument: "Effet d'une transformation des données — Évaluation",
  nomFichierBase: "transformation-donnees",
  genererInstance: genererExerciceTransformationDonnees,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte: (e) => DIFFICULTE[e.forme],
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 6,
};
