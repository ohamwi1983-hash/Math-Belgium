import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeViserCible } from "./corrigeDetaille";
import type { ExerciceViserCible } from "../../core/viserCible.types";
import { critere, solutionM, verdictDirect, verdictInverse } from "../../moteur/modeleViserCible";
import { ecransDe } from "../../moteur/sessionViserCible";
import {
  AC,
  U,
  consigneEcran,
  critereSubstitueLatex,
  enonceFragments,
  variablesEnLatex,
  kLatex,
  nombreLatex,
  questionPapier,
} from "../../ui/formatViserCible";
import { construireFigureViserCible } from "../../ui/figureViserCible";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceViserCible } from "./index";
import { profilViserCible } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen89. Énoncé papier = situation + figure (sans
 * flèche en sens inverse : u⃗ est inconnu) + la question en contexte. Les écrans d'apprentissage
 * (vecteur à comparer, composantes, test ou condition, m, conclusion) deviennent les étapes du
 * corrigé ; la conclusion montre la trajectoire prolongée (`figureHtml`). Séries équilibrées :
 * `profil.ts` (situation + sens ; l'issue reste tirée au hasard).
 */

function figureEnonce(e: ExerciceViserCible): string {
  return construireFigureViserCible(e, { theme: "papier" });
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceViserCible): SectionExercice {
  return {
    enteteFragments: enonceFragments(e),
    enteteHtml: figureEnonce(e),
    questions: ecransDe(e).map((type) => ({ consigne: consigneEcran(e, type) })),
  };
}

const LETTRES = "abcde";

function enoncePapier(e: ExerciceViserCible): EnoncePapier {
  return {
    section: {
      enteteFragments: enonceFragments(e),
      enteteHtml: figureEnonce(e),
      questions: [{ consigne: questionPapier(e) }],
    },
    etapesParQuestion: [ecransDe(e).map((_, i) => LETTRES[i]!)],
  };
}

function reponseBreve(e: ExerciceViserCible): FragmentConsigne[] {
  if (e.sens === "directe") {
    const v = verdictDirect(e);
    if (v === "cote") return [texte("Non : "), latex(`${critereSubstitueLatex(e)} = ${nombreLatex(critere(e))} \\neq 0`), texte(", la trajectoire passe à côté.")];
    if (v === "touche") return [texte("Oui : "), latex(`${AC} = ${kLatex(e)} \\cdot ${U}`), texte(" avec "), latex("k > 0"), texte(".")];
    return [texte("Non : "), latex(`${AC} = ${kLatex(e)} \\cdot ${U}`), texte(" avec "), latex("k < 0"), texte(" — bonne droite, mauvais sens.")];
  }
  const m = latex(`m = ${nombreLatex(solutionM(e))}`);
  if (verdictInverse(e) === "possible") return [m, texte(" (alors "), latex(`${AC} = ${kLatex(e)} \\cdot ${U}`), texte(", "), latex("k > 0"), texte(").")];
  return [texte("Aucune valeur : "), m, texte(" rend "), latex(U), texte(" colinéaire à "), latex(AC), texte(", mais "), latex(`k = ${kLatex(e)} < 0`), texte(".")];
}

function correctionDetaillee(e: ExerciceViserCible): EtapeCorrection[] {
  return correctionDetailleeViserCible(e);
}

function criteresDifficulte(e: ExerciceViserCible): CriteresDifficulte {
  // Le verdict (touchée / à côté / derrière ; m convient ou non) ne doit pas se lire : piège 0, sansCharge (le bloc k n’existe que si les vecteurs sont colinéaires). Méthode 1 : critère de colinéarité PUIS signe de k, à choisir (énoncé papier sans méthode).
  return { ...etapesDuCorrige(correctionDetailleeViserCible(e)), sansCharge: true, methode: 1, piege: 0, nombres: 0 };
}

function construireCorrection(e: ExerciceViserCible): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.type === "resultat")
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
}

/** Barème : les vecteurs (AC, CA, u) et les lettres k, m des libellés passent en KaTeX. */
function enLatex(fragments: FragmentConsigne[]): FragmentConsigne[] {
  return variablesEnLatex(fragments).flatMap((f) => {
    if (f.type !== "texte") return [f];
    return f.valeur
      .split(/(?<=^|[\s(])(AC|CA|u)(?=[\s,.:;)]|$)/)
      .filter((x) => x !== "")
      .map((x) => (x === "AC" || x === "CA" || x === "u" ? latex(`\\vec{${x}}`) : texte(x)));
  });
}

function bareme(e: ExerciceViserCible): BaremeExercice {
  const b = baremeBrut(e);
  return {
    ...b,
    criteres: b.criteres.map((c) => ({ ...c, critere: enLatex(c.critere) })),
    erreursFrequentes: b.erreursFrequentes?.map((x) => ({ ...x, description: enLatex(x.description) })),
    reponsesAcceptees: b.reponsesAcceptees?.map(enLatex),
  };
}

function baremeBrut(e: ExerciceViserCible): BaremeExercice {
  const communs = [
    { description: [texte("Composantes de AC calculées « origine moins extrémité » (celles de CA)")], cout: "0 pt sur b) ; sens faux ensuite, pas de double sanction" },
    { description: [texte("Conclusion lue sur la figure, sans calcul")], cout: "0 pt sur la conclusion" },
  ];
  if (e.sens === "directe") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Vecteur AC comparé à u (départ vers cible)")], points: 0.5 },
        { sousQuestion: "b", critere: [texte("Composantes de AC")], points: 1 },
        { sousQuestion: "c", critere: [texte("Critère de colinéarité calculé et interprété ; coefficient k s'ils sont colinéaires")], points: 1.5 },
        { sousQuestion: "d", critere: [texte("Conclusion dans le contexte, justifiée par le critère et le signe de k")], points: 1 },
      ],
      erreursFrequentes: [
        { description: [texte("Critère nul : conclure « touche » sans regarder le signe de k")], cout: "0 pt sur d)" },
        ...communs,
        { description: [texte("k inversé ("), latex(`${U} = k \\cdot ${AC}`), texte(" au lieu de "), latex(`${AC} = k \\cdot ${U}`), texte(")")], cout: "−0,5 pt sur c)" },
      ],
      reponsesAcceptees: [[texte("Critère calculé dans l'autre ordre ("), latex("x_{AC} \\cdot y_u - y_{AC} \\cdot x_u"), texte(", l'opposé)")], [texte("k donné sous forme décimale")], [texte("Sens justifié par le signe de composantes correspondantes de AC et de u")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Condition traduite : AC colinéaire à u, et de même sens")], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Composantes de AC")], points: 0.5 },
      { sousQuestion: "c", critere: [texte("Condition de colinéarité écrite avec m")], points: 1 },
      { sousQuestion: "d", critere: [texte("Équation résolue : valeur de m")], points: 1 },
      { sousQuestion: "e", critere: [texte("Sens vérifié (signe de k) et conclusion dans le contexte")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Donner la valeur de m sans vérifier le sens")], cout: "0 pt sur e)" },
      ...communs,
      { description: [texte("Erreur de signe en isolant m")], cout: "−0,5 pt sur d)" },
    ],
    reponsesAcceptees: [[texte("Condition écrite dans un autre ordre ou multipliée par un nombre non nul")], [texte("Sens justifié par le signe de composantes correspondantes de AC et de u")]],
  };
}

export const adaptateurEvaluationViserCible: AdaptateurFeuilleExercices<ExerciceViserCible> = {
  profilInstance: profilViserCible,
  titreDocument: "Viser une cible : trajectoires rectilignes — Évaluation",
  nomFichierBase: "viser-cible-trajectoires",
  genererInstance: genererExerciceViserCible,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
};
