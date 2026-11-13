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
import type { ExerciceComposerForces } from "../../core/composerForces.types";
import {
  angleCap,
  angleInterieur,
  angleSommetPetit,
  deviation,
  estCap,
  intensiteAvecTheta,
  intensiteResultante,
  sommetPetit,
  triangleUtile,
} from "../../moteur/modeleComposerForces";
import {
  angleCapNom,
  angleDonneCapNom,
  angleInterieurNom,
  angleLatex,
  angleNom,
  angleSommetPetitNom,
  consignesEcrans,
  deviationNom,
  enonceFragments,
  intensiteLatex,
  intensiteNom,
  nomGrand,
  nomParallelogramme,
  nomResultante,
  questionsPapier,
  uniteTexte,
  vecteur,
} from "../../ui/formatComposerForces";
import { construireFigureComposerForces } from "../../ui/figureComposerForces";
import { nombreFrLatex } from "../../ui/nombreFr";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceComposerForces } from "./index";
import { profilComposerForces } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen80. Énoncé papier = situation + figure (« ? »
 * sur les inconnues) + les VRAIES questions : l'intensité seule, ou a) l'intensité et b) la
 * direction, ou (cap) a) l'angle entre le cap et la route et b) la vitesse obtenue. Les écrans
 * d'apprentissage (choix du triangle, angle intérieur…) deviennent les étapes a, b, c, d du corrigé,
 * la première avec la figure du triangle utilisé et de son angle intérieur (`figureHtml`).
 * Valeurs exactes gardées en mémoire de calculatrice : seules les valeurs AFFICHÉES sont arrondies.
 */

const D2R = Math.PI / 180;

function figureEnonce(e: ExerciceComposerForces): string {
  return construireFigureComposerForces(e, { theme: "papier" });
}

function figureCorrige(e: ExerciceComposerForces): string {
  return construireFigureComposerForces(e, { theme: "papier", triangle: true, angleTriangle: true, resolue: true });
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceComposerForces): SectionExercice {
  return {
    enteteFragments: enonceFragments(e),
    enteteHtml: figureEnonce(e),
    questions: consignesEcrans(e, "papier").map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceComposerForces): EnoncePapier {
  const etapes: string[][] = e.question === "intensite" ? [["a", "b", "c"]] : e.question === "direction" ? [["a", "b", "c"], ["d"]] : [["a", "b"], ["c", "d"]];
  return {
    section: {
      enteteFragments: enonceFragments(e),
      enteteHtml: figureEnonce(e),
      questions: questionsPapier(e).map((consigne) => ({ consigne })),
    },
    etapesParQuestion: etapes,
  };
}

function resultatIntensite(e: ExerciceComposerForces): FragmentConsigne[] {
  return [latex(`${intensiteNom(e, "R")} \\approx ${intensiteLatex(intensiteResultante(e))}`), texte(uniteTexte(e))];
}

function reponseBreve(e: ExerciceComposerForces): FragmentConsigne[] {
  if (e.question === "intensite") return resultatIntensite(e);
  if (e.question === "direction") return [...resultatIntensite(e), texte(" ; "), latex(`${deviationNom(e)} \\approx ${angleLatex(deviation(e))}`)];
  return [texte("angle entre le cap et la route : "), latex(`${angleCapNom(e)} \\approx ${angleLatex(angleCap(e))}`), texte(" ; "), ...resultatIntensite(e)];
}

function correctionDirecte(e: ExerciceComposerForces): EtapeCorrection[] {
  const g = e.sommetGrand;
  const p = sommetPetit(e);
  const tri = triangleUtile(e);
  const [G, P] = [e.grand, e.petit].map((n) => nombreFrLatex(n));
  const interieur = angleInterieur(e);
  const r2 = e.grand ** 2 + e.petit ** 2 - 2 * e.grand * e.petit * Math.cos(interieur * D2R);
  const etapes: EtapeCorrection[] = [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [
        texte(`${nomResultante(e).replace(/^./, (c) => c.toUpperCase())} `),
        latex(vecteur(e, "R")),
        texte(` est la diagonale [OC] du parallélogramme ${nomParallelogramme(e)}. En reportant `),
        latex(vecteur(e, "2")),
        texte(" à l'extrémité de "),
        latex(vecteur(e, "1")),
        texte(" ("),
        latex(`\\vec{${g}C} = \\vec{O${p}}`),
        texte(`), on obtient le triangle ${tri}, de côtés `),
        latex(`O${g} = ${G}`),
        texte(", "),
        latex(`${g}C = ${P}`),
        texte(" et "),
        latex(`OC = ${intensiteNom(e, "R")}`),
        texte("."),
      ],
      figureHtml: figureCorrige(e),
    },
    { label: "Conclusion", sousQuestion: "a", fragments: [texte(`Triangle à résoudre : ${tri}.`)] },
    {
      label: "Calcul",
      sousQuestion: "b",
      fragments: [
        texte("Deux angles consécutifs d'un parallélogramme sont supplémentaires : "),
        latex(`${angleInterieurNom(e)} = 180° - ${angleNom(p, "O", g)} = 180° - ${e.angle}° = ${interieur}°`),
        texte("."),
      ],
    },
    {
      label: "Méthode",
      sousQuestion: "c",
      fragments: [texte(`Al-Kashi dans le triangle ${tri}, avec l'angle en ${g}, opposé à OC : `), latex(`OC^2 = O${g}^2 + ${g}C^2 - 2 \\cdot O${g} \\cdot ${g}C \\cdot \\cos ${angleInterieurNom(e)}`)],
    },
    {
      label: "Calcul",
      sousQuestion: "c",
      fragments: [
        latex(`${intensiteNom(e, "R")}^2 = ${G}^2 + ${P}^2 - 2 \\cdot ${G} \\cdot ${P} \\cdot \\cos ${interieur}° \\approx ${nombreFrLatex(Math.round(r2 * 100) / 100)}`),
        texte(", donc "),
        latex(`${intensiteNom(e, "R")} \\approx ${intensiteLatex(intensiteResultante(e))}`),
        texte(`${uniteTexte(e)}.`),
      ],
    },
    { label: "Conclusion", sousQuestion: "c", fragments: [texte(`Intensité de ${nomResultante(e)} : `), ...resultatIntensite(e), texte(".")] },
  ];
  if (e.question === "direction") {
    const sinus = (e.petit * Math.sin(interieur * D2R)) / intensiteResultante(e);
    etapes.push(
      {
        label: "Méthode",
        sousQuestion: "d",
        fragments: [texte(`Loi des sinus dans le triangle ${tri} : l'angle en O est opposé au côté ${g}C : `), latex(`\\dfrac{\\sin ${deviationNom(e)}}{${g}C} = \\dfrac{\\sin ${angleInterieurNom(e)}}{OC}`)],
      },
      {
        label: "Calcul",
        sousQuestion: "d",
        fragments: [
          latex(`\\sin ${deviationNom(e)} = \\dfrac{${P} \\cdot \\sin ${interieur}°}{${intensiteLatex(intensiteResultante(e))}} \\approx ${nombreFrLatex(Math.round(sinus * 10000) / 10000)}`),
          texte(" (valeur exacte de OC gardée en mémoire), donc "),
          latex(`${deviationNom(e)} \\approx ${angleLatex(deviation(e))}`),
          texte("."),
        ],
      },
      {
        label: "Contrôle",
        sousQuestion: "d",
        fragments: [
          texte("L'angle cherché est opposé à "),
          latex(`${g}C = ${P}`),
          texte(", plus petit que "),
          latex(`O${g} = ${G}`),
          texte(" : il n'est pas le plus grand angle du triangle, donc il est aigu, et l'arc sinus donne directement la bonne valeur."),
        ],
      },
      { label: "Conclusion", sousQuestion: "d", fragments: [texte("Angle entre "), latex(vecteur(e, "R")), texte(` et ${nomGrand(e)} `), latex(vecteur(e, "1")), texte(" : "), latex(`${deviationNom(e)} \\approx ${angleLatex(deviation(e))}`), texte(".")] },
    );
  }
  etapes.push({
    label: "Piège",
    sousQuestion: "b",
    fragments: [
      texte(`L'angle de ${e.angle}° est l'angle ENTRE les deux vecteurs, en O : ce n'est pas un angle du triangle ${tri}. Le mettre dans Al-Kashi donnerait `),
      latex(`\\sqrt{${G}^2 + ${P}^2 - 2 \\cdot ${G} \\cdot ${P} \\cdot \\cos ${e.angle}°} \\approx ${intensiteLatex(intensiteAvecTheta(e))}`),
      texte(", la longueur de l'autre diagonale [AB]."),
    ],
  });
  return etapes;
}

function correctionCap(e: ExerciceComposerForces): EtapeCorrection[] {
  const g = e.sommetGrand;
  const p = sommetPetit(e);
  const tri = triangleUtile(e);
  const [G, P] = [e.grand, e.petit].map((n) => nombreFrLatex(n));
  const gamma = angleCap(e);
  const sinus = (e.petit * Math.sin(e.angle * D2R)) / e.grand;
  const angleP = angleSommetPetit(e);
  const courant = e.situation === "avion" ? "vent" : "courant";
  return [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [
        texte(`${nomResultante(e).replace(/^./, (c) => c.toUpperCase())} `),
        latex(vecteur(e, "R")),
        texte(` est la diagonale [OC], portée par la route voulue. En reportant `),
        latex(vecteur(e, "1")),
        texte(" à l'extrémité de "),
        latex(vecteur(e, "2")),
        texte(" ("),
        latex(`\\vec{${p}C} = \\vec{O${g}}`),
        texte(`), on obtient le triangle ${tri}, de côtés `),
        latex(`O${p} = ${P}`),
        texte(", "),
        latex(`${p}C = ${G}`),
        texte(" et "),
        latex(`OC = ${intensiteNom(e, "R")}`),
        texte(" ; son angle en O est l'angle donné, "),
        latex(`${angleDonneCapNom(e)} = ${e.angle}°`),
        texte("."),
      ],
      figureHtml: figureCorrige(e),
    },
    { label: "Conclusion", sousQuestion: "a", fragments: [texte(`Triangle à résoudre : ${tri}.`)] },
    {
      label: "Méthode",
      sousQuestion: "b",
      fragments: [
        texte(`On connaît deux côtés et l'angle en O, opposé à ${p}C : la loi des sinus donne l'angle en C, opposé à O${p} : `),
        latex(`\\dfrac{\\sin ${angleCapNom(e)}}{O${p}} = \\dfrac{\\sin ${angleDonneCapNom(e)}}{${p}C}`),
      ],
    },
    {
      label: "Calcul",
      sousQuestion: "b",
      fragments: [latex(`\\sin ${angleCapNom(e)} = \\dfrac{${P} \\cdot \\sin ${e.angle}°}{${G}} \\approx ${nombreFrLatex(Math.round(sinus * 10000) / 10000)}`), texte(", donc "), latex(`${angleCapNom(e)} \\approx ${angleLatex(gamma)}`), texte(".")],
    },
    {
      label: "Contrôle",
      sousQuestion: "b",
      fragments: [texte("L'angle en C est opposé à "), latex(`O${p} = ${P}`), texte(", plus petit que "), latex(`${p}C = ${G}`), texte(" : il est aigu, l'arc sinus donne la bonne valeur.")],
    },
    {
      label: "Conclusion",
      sousQuestion: "b",
      fragments: [texte("Le cap doit faire un angle d'environ "), latex(angleLatex(gamma)), texte(` avec la route voulue, tourné de l'autre côté de la route par rapport au ${courant}.`)],
    },
    {
      label: "Calcul",
      sousQuestion: "c",
      fragments: [texte("Somme des angles du triangle : "), latex(`${angleSommetPetitNom(e)} = 180° - ${e.angle}° - ${angleLatex(gamma)} \\approx ${angleLatex(angleP)}`), texte(".")],
    },
    {
      label: "Méthode",
      sousQuestion: "d",
      fragments: [texte(`Loi des sinus : OC est opposé à l'angle en ${p} : `), latex(`\\dfrac{OC}{\\sin ${angleSommetPetitNom(e)}} = \\dfrac{${p}C}{\\sin ${angleDonneCapNom(e)}}`)],
    },
    {
      label: "Calcul",
      sousQuestion: "d",
      fragments: [
        latex(`${intensiteNom(e, "R")} = \\dfrac{${G} \\cdot \\sin ${angleLatex(angleP)}}{\\sin ${e.angle}°} \\approx ${intensiteLatex(intensiteResultante(e))}`),
        texte(`${uniteTexte(e)} (angles exacts gardés en mémoire).`),
      ],
    },
    { label: "Conclusion", sousQuestion: "d", fragments: [texte(`Intensité de ${nomResultante(e)} sur la route : `), ...resultatIntensite(e), texte(".")] },
    {
      label: "Piège",
      sousQuestion: "b",
      fragments: [
        texte(`Ici, l'angle connu (entre le ${courant} et la route) part de O, comme la résultante : c'est directement l'angle en O du triangle ${tri}. C'est l'angle entre les deux vecteurs qui est inconnu : on ne peut pas commencer par Al-Kashi, la loi des sinus vient d'abord.`),
      ],
    },
  ];
}

function correctionDetaillee(e: ExerciceComposerForces): EtapeCorrection[] {
  return estCap(e) ? correctionCap(e) : correctionDirecte(e);
}

function construireCorrection(e: ExerciceComposerForces): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.label === "Conclusion")
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
}

function bareme(e: ExerciceComposerForces): BaremeExercice {
  const erreurs = [
    { description: [texte("Unité absente ou fausse")], cout: "−0,5 pt" },
    { description: [texte("Calculatrice en radians")], cout: "moitié des points de l'étape concernée" },
  ];
  if (estCap(e)) {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Triangle utile repéré (report de la vitesse propre, angle connu en O)")], points: 0.5 },
        { sousQuestion: "b", critere: [texte("Angle entre le cap et la route par la loi des sinus")], points: 1.5 },
        { sousQuestion: "c", critere: [texte("Troisième angle du triangle")], points: 0.5 },
        { sousQuestion: "d", critere: [texte("Intensité de la vitesse sur la route (loi des sinus), avec l'unité")], points: 1.5 },
      ],
      erreursFrequentes: [
        { description: [texte("Rapports de la loi des sinus inversés (côté et angle qui ne se font pas face)")], cout: "0 pt sur l'étape concernée" },
        { description: [texte("Angle donné remplacé par son supplémentaire (180° moins l'angle) alors qu'il est déjà un angle du triangle")], cout: "0 pt sur les étapes b à d (pas de double sanction ensuite)" },
        ...erreurs,
      ],
      reponsesAcceptees: [[texte("Écart d'environ 1 % dû aux arrondis intermédiaires")], [texte("Résultat juste à partir d'un angle intermédiaire faux : points de méthode accordés (pas de double sanction)")]],
    };
  }
  const criteres =
    e.question === "intensite"
      ? [
          { sousQuestion: "a", critere: [texte("Triangle utile repéré (report d'un vecteur, résultante comme côté)")], points: 1 },
          { sousQuestion: "b", critere: [texte("Angle intérieur : 180° moins l'angle entre les vecteurs")], points: 1 },
          { sousQuestion: "c", critere: [texte("Al-Kashi correctement appliqué, intensité avec l'unité")], points: 2 },
        ]
      : [
          { sousQuestion: "a", critere: [texte("Triangle utile repéré (report d'un vecteur, résultante comme côté)")], points: 0.5 },
          { sousQuestion: "b", critere: [texte("Angle intérieur : 180° moins l'angle entre les vecteurs")], points: 1 },
          { sousQuestion: "c", critere: [texte("Al-Kashi correctement appliqué, intensité avec l'unité")], points: 1.5 },
          { sousQuestion: "d", critere: [texte("Direction par la loi des sinus")], points: 1 },
        ];
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: [
      { description: [texte("Angle entre les vecteurs mis directement dans Al-Kashi (longueur de l'autre diagonale)")], cout: "0 pt sur les étapes b et c" },
      ...(e.question === "direction" ? [{ description: [texte("Angle pris avec l'autre vecteur")], cout: "moitié des points de l'étape d" }] : []),
      ...erreurs,
    ],
    reponsesAcceptees: [[texte("Écart d'environ 1 % dû aux arrondis intermédiaires")], [texte("Formule de la résultante du chapitre 6 avec un « + » et l'angle entre les vecteurs (équivalente)")]],
  };
}

function difficulte(e: ExerciceComposerForces): 1 | 2 | 3 {
  return e.question === "cap" ? 3 : 2;
}

export const adaptateurEvaluationComposerForces: AdaptateurFeuilleExercices<ExerciceComposerForces> = {
  profilInstance: profilComposerForces,
  calculatriceIndispensable: true,
  titreDocument: "Composer deux forces ou deux vitesses — Évaluation",
  nomFichierBase: "composer-forces-vitesses",
  genererInstance: genererExerciceComposerForces,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
};
