import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceViserCible } from "../../core/viserCible.types";
import { coefficientK, composanteConnue, conditionInverse, critere, fraction, solutionM, vecteurAC, verdictDirect, verdictInverse } from "../../moteur/modeleViserCible";
import { ecransDe } from "../../moteur/sessionViserCible";
import {
  AC,
  CONTEXTES,
  FORMULE_CRITERE,
  U,
  acLatex,
  colonneLatex,
  conditionIsoleeLatex,
  conditionReduiteLatex,
  conditionSubstitueeLatex,
  consigneEcran,
  critereSubstitueLatex,
  enonceFragments,
  variablesEnLatex,
  facteurLatex,
  fractionLatex,
  kLatex,
  phraseConclusionDirecte,
  libelleConclusionInverse,
  nombreLatex,
  questionPapier,
  uResoluLatex,
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

function figureCorrige(e: ExerciceViserCible): string {
  return construireFigureViserCible(e, { theme: "papier", corrige: true });
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

function majuscule(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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

function etapesCommunes(e: ExerciceViserCible): EtapeCorrection[] {
  const ac = vecteurAC(e);
  return [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [
        texte("La trajectoire est la demi-droite d'origine A dirigée par "),
        latex(U),
        texte(" : un point M est atteint si, et seulement si, "),
        latex(`\\vec{AM} = k \\cdot ${U}`),
        texte(" avec "),
        latex("k > 0"),
        texte(". On compare donc à "),
        latex(U),
        texte(" le vecteur qui va du départ à la cible."),
      ],
    },
    { label: "Conclusion", sousQuestion: "a", fragments: [texte("Vecteur à comparer : "), latex(AC), texte(" (pas "), latex("\\vec{CA}"), texte(", qui décrit le trajet à l'envers).")] },
    {
      label: "Calcul",
      sousQuestion: "b",
      fragments: [
        latex(`${AC}${colonneLatex(`${nombreLatex(e.C.x)} - ${facteurLatex(e.A.x)}`, `${nombreLatex(e.C.y)} - ${facteurLatex(e.A.y)}`)} = ${colonneLatex(nombreLatex(ac.x), nombreLatex(ac.y))}`),
      ],
    },
  ];
}

const METHODE_CRITERE: FragmentConsigne[] = [
  texte("Critère du cours : "),
  latex(U),
  texte(" et "),
  latex(AC),
  texte(" sont colinéaires si, et seulement si, "),
  latex(`${FORMULE_CRITERE} = 0`),
  texte("."),
];

function correctionDirecte(e: ExerciceViserCible): EtapeCorrection[] {
  const ac = vecteurAC(e);
  const c = critere(e);
  const v = verdictDirect(e);
  const etapes: EtapeCorrection[] = [...etapesCommunes(e), { label: "Méthode", sousQuestion: "c", fragments: METHODE_CRITERE }];
  if (c !== 0) {
    etapes.push(
      { label: "Calcul", sousQuestion: "c", fragments: [latex(`${critereSubstitueLatex(e)} = ${nombreLatex(e.u.x * ac.y)} - ${facteurLatex(e.u.y * ac.x)} = ${nombreLatex(c)}`)] },
      { label: "Conclusion", sousQuestion: "c", fragments: [texte("Le critère vaut "), latex(`${nombreLatex(c)} \\neq 0`), texte(" : "), latex(U), texte(" et "), latex(AC), texte(" ne sont pas colinéaires.")] },
    );
  } else {
    etapes.push(
      { label: "Calcul", sousQuestion: "c", fragments: [latex(`${critereSubstitueLatex(e)} = ${nombreLatex(e.u.x * ac.y)} - ${facteurLatex(e.u.y * ac.x)} = 0`), texte(" : colinéaires.")] },
      {
        label: "Calcul",
        sousQuestion: "c",
        fragments: [
          texte("Coefficient : "),
          latex(`x_{AC} = k \\cdot x_u`),
          texte(" donne "),
          latex(`k = \\dfrac{${nombreLatex(ac.x)}}{${nombreLatex(e.u.x)}} = ${kLatex(e)}`),
          texte(" (même résultat avec "),
          latex(`\\dfrac{${nombreLatex(ac.y)}}{${nombreLatex(e.u.y)}}`),
          texte(")."),
        ],
      },
      { label: "Conclusion", sousQuestion: "c", fragments: [latex(`${AC} = ${kLatex(e)} \\cdot ${U}`), texte(" avec "), latex(v === "touche" ? "k > 0" : "k < 0"), texte(".")] },
    );
  }
  const raison: FragmentConsigne[] =
    v === "cote"
      ? [texte("Le critère n'est pas nul : C n'est pas sur la droite du lancer. ")]
      : v === "touche"
        ? [texte("Le critère est nul et "), latex("k > 0"), texte(" : C est devant A, dans le sens de "), latex(U), texte(". ")]
        : [texte("Le critère est nul, mais "), latex("k < 0"), texte(" : "), latex(AC), texte(" et "), latex(U), texte(" sont de sens contraires. ")];
  etapes.push({ label: "Conclusion", sousQuestion: "d", fragments: [...raison, texte(majuscule(phraseConclusionDirecte(e, v)))], figureHtml: figureCorrige(e) });
  etapes.push(piegeDirect(e));
  return etapes;
}

function piegeDirect(e: ExerciceViserCible): EtapeCorrection {
  const v = verdictDirect(e);
  const ctx = CONTEXTES[e.situation];
  if (v === "derriere") {
    return {
      label: "Piège",
      sousQuestion: "d",
      fragments: [
        texte("Le critère nul ne suffit pas : il dit seulement que C est sur la DROITE du lancer. Le signe de k tranche : ici "),
        latex(`k = ${kLatex(e)} < 0`),
        texte(`, ${ctx.mobile} part à l'opposé ${ctx.deCible}.`),
      ],
    };
  }
  if (v === "cote") {
    const ac = vecteurAC(e);
    const devant = ac.x * e.u.x + ac.y * e.u.y > 0;
    return {
      label: "Piège",
      sousQuestion: "c",
      fragments: devant
        ? [
            texte("Sur la figure, C semble presque sur la trajectoire : l'œil ne suffit pas. Le critère vaut "),
            latex(nombreLatex(critere(e))),
            texte(", pas 0 : la trajectoire passe à moins d'une unité de C, sans l'atteindre."),
          ]
        : [
            texte("Sur la figure, C semble sur la droite du lancer, derrière A : on croirait à « bonne droite, mauvais sens ». Le critère vaut "),
            latex(nombreLatex(critere(e))),
            texte(", pas 0 : C n'est même pas sur cette droite, il en est à moins d'une unité."),
          ],
    };
  }
  const kCA = fraction(-coefficientK(e)!.num, coefficientK(e)!.den);
  return {
    label: "Piège",
    sousQuestion: "a",
    fragments: [
      texte("Comparer "),
      latex("\\vec{CA}"),
      texte(" au lieu de "),
      latex(AC),
      texte(" donnerait "),
      latex(`k = ${fractionLatex(kCA)} < 0`),
      texte(" et ferait conclure à tort au « mauvais sens » : le vecteur part toujours du départ A."),
    ],
  };
}

function correctionInverse(e: ExerciceViserCible): EtapeCorrection[] {
  const ac = vecteurAC(e);
  const { alpha, beta } = conditionInverse(e);
  const m = solutionM(e);
  const possible = verdictInverse(e) === "possible";
  const ctx = CONTEXTES[e.situation];
  const cleK = e.inconnue === "x" ? "y" : "x";
  const c = composanteConnue(e);
  const etapes: EtapeCorrection[] = [
    ...etapesCommunes(e),
    { label: "Méthode", sousQuestion: "c", fragments: METHODE_CRITERE },
    { label: "Calcul", sousQuestion: "c", fragments: [latex(conditionSubstitueeLatex(e)), texte(", soit "), latex(conditionReduiteLatex(e)), texte(".")] },
    {
      label: "Calcul",
      sousQuestion: "d",
      fragments: [latex(conditionIsoleeLatex(e)), texte(", donc "), latex(`m = \\dfrac{${nombreLatex(-beta)}}{${nombreLatex(alpha)}} = ${nombreLatex(m)}`), texte(".")],
    },
    { label: "Conclusion", sousQuestion: "d", fragments: [texte("Avec "), latex(`m = ${nombreLatex(m)}`), texte(" : "), latex(uResoluLatex(e)), texte(", colinéaire à "), latex(acLatex(e)), texte(".")] },
    {
      label: "Calcul",
      sousQuestion: "e",
      fragments: [
        texte("Sens : "),
        latex(cleK === "x" ? "x_{AC} = k \\cdot x_u" : "y_{AC} = k \\cdot y_u"),
        texte(" donne "),
        latex(`k = \\dfrac{${nombreLatex(cleK === "x" ? ac.x : ac.y)}}{${nombreLatex(c)}} = ${kLatex(e)}`),
        texte("."),
      ],
    },
  ];
  if (possible) {
    etapes.push({
      label: "Conclusion",
      sousQuestion: "e",
      fragments: [latex("k > 0"), texte(" : C est devant A, dans le sens de "), latex(U), texte(". "), ...libelleConclusionInverse(e, "possible"), texte(" Il faut "), latex(`m = ${nombreLatex(m)}`), texte(".")],
      figureHtml: figureCorrige(e),
    });
    etapes.push({
      label: "Piège",
      sousQuestion: "e",
      fragments: [texte("Trouver m ne suffit pas : il faut encore vérifier le sens. Avec une composante imposée de signe contraire, la même équation aurait donné une direction qui part à l'opposé de C.")],
    });
  } else {
    etapes.push({
      label: "Conclusion",
      sousQuestion: "e",
      fragments: [
        latex("k < 0"),
        texte(" : avec "),
        latex(`m = ${nombreLatex(m)}`),
        texte(`, ${ctx.mobile} part sur la droite (AC), mais à l'opposé ${ctx.deCible}. C'est la seule valeur qui rend `),
        latex(U),
        texte(" colinéaire à "),
        latex(AC),
        texte(` : aucune valeur de m ne convient (il faudrait que la composante imposée, `),
        latex(nombreLatex(c)),
        texte(", change de signe)."),
      ],
      figureHtml: figureCorrige(e),
    });
    etapes.push({
      label: "Piège",
      sousQuestion: "e",
      fragments: [texte("Répondre "), latex(`m = ${nombreLatex(m)}`), texte(" sans vérifier le sens : "), latex(U), texte(" et "), latex(AC), texte(" sont bien colinéaires, mais de sens contraires.")],
    });
  }
  return etapes;
}

function correctionDetaillee(e: ExerciceViserCible): EtapeCorrection[] {
  return (e.sens === "directe" ? correctionDirecte(e) : correctionInverse(e)).map((etape) => ({ ...etape, fragments: variablesEnLatex(etape.fragments) }));
}

function construireCorrection(e: ExerciceViserCible): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.label === "Conclusion")
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

function difficulte(e: ExerciceViserCible): 1 | 2 | 3 {
  return e.sens === "directe" ? 2 : 3;
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
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 7,
};
