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
import type { ExerciceEquilibreForces } from "../../core/equilibreForces.types";
import { angleF3, f1, f2, f3, intensiteArrondie, intensiteExacteDemandee, normeCarreeF3, resultante, simplifierRacine, sommeIntensites } from "../../moteur/modeleEquilibreForces";
import {
  NORME3,
  OPTIONS_CONDITION_LATEX,
  SOMME12,
  V1,
  V2,
  V3,
  angleLatex,
  colonne,
  colonneTexte,
  dixieme,
  consignesEcrans,
  enonceFragments,
  intensiteAttendueLatex,
  nb,
  questionsPapier,
  racineLatex,
  sensTexte,
} from "../../ui/formatEquilibreForces";
import { construireFigureCorrigePapier, construireFigureForces } from "../../ui/figureEquilibreForces";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceEquilibreForces } from "./index";
import { LIBELLE_CAS_EQUILIBRE_FORCES, profilEquilibreForces } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen90. Énoncé papier = situation + figure (« ? »
 * pour la force inconnue) + les VRAIES questions : a) les composantes de F₃, b) son intensité,
 * c) (variante « direction ») l'angle avec l'axe x. Les écrans d'apprentissage (condition
 * d'équilibre, résultante) deviennent les étapes a, b du corrigé ; l'étape c montre F₃ tracée et le
 * polygone des forces fermé (`figureHtml`). Séries équilibrées : `profil.ts`.
 */

function figureEnonce(e: ExerciceEquilibreForces): string {
  return construireFigureForces(e, { theme: "papier" });
}

function figureCorrige(e: ExerciceEquilibreForces): string {
  return construireFigureCorrigePapier(e);
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceEquilibreForces): SectionExercice {
  return {
    enteteFragments: enonceFragments(e),
    enteteHtml: figureEnonce(e),
    questions: consignesEcrans(e, "papier").map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceEquilibreForces): EnoncePapier {
  return {
    section: {
      enteteFragments: enonceFragments(e),
      enteteHtml: figureEnonce(e),
      questions: questionsPapier(e).map((consigne) => ({ consigne })),
    },
    etapesParQuestion: e.direction ? [["a", "b", "c"], ["d"], ["e"]] : [["a", "b", "c"], ["d"]],
  };
}

function resultatF3(e: ExerciceEquilibreForces): FragmentConsigne {
  return latex(`${V3}${colonne(f3(e))}`);
}

function resultatIntensite(e: ExerciceEquilibreForces): FragmentConsigne[] {
  const exact = intensiteExacteDemandee(e) && simplifierRacine(normeCarreeF3(e)).m !== 1;
  return [latex(intensiteAttendueLatex(e)), texte(exact ? ` N (≈ ${dixieme(intensiteArrondie(e), "texte")} N)` : " N")];
}

function reponseBreve(e: ExerciceEquilibreForces): FragmentConsigne[] {
  const r: FragmentConsigne[] = [resultatF3(e), texte(" ; "), latex(intensiteAttendueLatex(e)), texte(" N")];
  if (e.direction) r.push(texte(" ; "), latex(angleLatex(e)));
  return r;
}

function correctionDetaillee(e: ExerciceEquilibreForces): EtapeCorrection[] {
  const a = f1(e);
  const b = f2(e);
  const r = resultante(e);
  const g = f3(e);
  const n2 = normeCarreeF3(e);
  const { k, m } = simplifierRacine(n2);
  const etapes: EtapeCorrection[] = [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Le système est à l'équilibre : la somme des trois forces est le vecteur nul, "), latex(`${V1} + ${V2} + ${V3} = \\vec{0}`), texte(".")] },
    { label: "Conclusion", sousQuestion: "a", fragments: [texte("En isolant la force inconnue : "), latex(OPTIONS_CONDITION_LATEX.oppose), texte(" — elle est l'opposée de la résultante des deux autres.")] },
  ];
  if (e.situation === "anneau") {
    etapes.push({
      label: "Lecture",
      sousQuestion: "b",
      fragments: [
        texte("Sur le quadrillage : "),
        latex(`${V1}${colonneTexte(`${nb(e.f1.x)} \\cdot ${e.unite}`, `${nb(e.f1.y)} \\cdot ${e.unite}`)} = ${colonne(a)}`),
        texte(" et "),
        latex(`${V2}${colonneTexte(`${nb(e.f2.x)} \\cdot ${e.unite}`, `${nb(e.f2.y)} \\cdot ${e.unite}`)} = ${colonne(b)}`),
        texte(` (nombre de carreaux multiplié par ${e.unite} N).`),
      ],
    });
  }
  etapes.push(
    {
      label: "Calcul",
      sousQuestion: "b",
      fragments: [
        texte("On additionne composante par composante : "),
        latex(`${SOMME12} = ${colonneTexte(`${nb(a.x)} + ${nb(b.x, true)}`, `${nb(a.y)} + ${nb(b.y, true)}`)} = ${colonne(r)}`),
        texte("."),
      ],
    },
    {
      label: "Calcul",
      sousQuestion: "c",
      fragments: [texte("Chaque composante change de signe : "), latex(`${V3} = -(${SOMME12}) = ${colonneTexte(`-(${nb(r.x)})`, `-(${nb(r.y)})`)} = ${colonne(g)}`), texte(".")],
    },
    {
      label: "Conclusion",
      sousQuestion: "c",
      fragments: [resultatF3(e), texte(` : la force cherchée est dirigée ${sensTexte(g)}. Contrôle : le polygone des forces (`), latex(V1), texte(", puis "), latex(V2), texte(", puis "), latex(V3), texte(", bout à bout) se referme.")],
      figureHtml: figureCorrige(e),
    },
  );
  if (e.intensite === "axe") {
    const comp = g.x !== 0 ? g.x : g.y;
    etapes.push(
      { label: "Méthode", sousQuestion: "d", fragments: [texte(`La force cherchée est ${g.x !== 0 ? "horizontale" : "verticale"} : une seule composante n'est pas nulle, son intensité est la valeur absolue de cette composante.`)] },
      { label: "Calcul", sousQuestion: "d", fragments: [latex(`${NORME3} = |${nb(comp)}| = ${nb(Math.abs(comp))}`), texte(" (Pythagore donnerait la même chose : "), latex(`\\sqrt{${nb(comp, true)}^2 + 0^2}`), texte(").")] },
    );
  } else {
    const racine = `${NORME3} = \\sqrt{${nb(g.x, true)}^2 + ${nb(g.y, true)}^2} = \\sqrt{${n2}}`;
    let suite: string;
    if (m === 1) suite = ` = ${nb(k)}`;
    else if (intensiteExacteDemandee(e)) suite = ` = \\sqrt{${k * k} \\cdot ${m}} = ${racineLatex(n2)}`;
    else suite = ` \\approx ${dixieme(intensiteArrondie(e))}`;
    etapes.push(
      { label: "Méthode", sousQuestion: "d", fragments: [texte("L'intensité est la norme du vecteur : "), latex(`\\|\\vec{u}\\| = \\sqrt{x^2 + y^2}`), texte(".")] },
      { label: "Calcul", sousQuestion: "d", fragments: [latex(racine + suite), texte(intensiteExacteDemandee(e) ? "." : " (au dixième de newton).")] },
    );
  }
  etapes.push({ label: "Conclusion", sousQuestion: "d", fragments: [texte("Intensité de la force cherchée : "), ...resultatIntensite(e), texte(".")] });
  if (e.direction) {
    const tan = Math.abs(g.y / g.x);
    const tanArrondi = Math.round(tan * 1000) / 1000;
    etapes.push(
      {
        label: "Méthode",
        sousQuestion: "e",
        fragments: [texte("Dans le triangle rectangle formé par les composantes, le côté opposé à α mesure |y| et le côté adjacent |x| : "), latex(`\\tan\\alpha = \\dfrac{|y|}{|x|}`), texte(".")],
      },
      {
        label: "Calcul",
        sousQuestion: "e",
        fragments: [latex(`\\tan\\alpha = \\dfrac{${nb(Math.abs(g.y))}}{${nb(Math.abs(g.x))}} ${tanArrondi === tan ? "=" : "\\approx"} ${nb(tanArrondi)}`), texte(", donc (touche arc tangente) "), latex(angleLatex(e)), texte(".")],
      },
      { label: "Conclusion", sousQuestion: "e", fragments: [texte(`La force cherchée est dirigée ${sensTexte(g)} et fait un angle d'environ `), latex(`${dixieme(angleF3(e))}°`), texte(" avec l'axe x.")] },
    );
  }
  etapes.push({
    label: "Piège",
    sousQuestion: "c",
    fragments: [
      texte("Ne pas confondre la résultante "),
      latex(`${SOMME12}${colonne(r)}`),
      texte(" et la force d'équilibre : oublier le signe moins donnerait une force qui DOUBLE l'effet des deux autres au lieu de le compenser."),
    ],
  });
  return etapes;
}

function construireCorrection(e: ExerciceEquilibreForces): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.label === "Conclusion")
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
}

function bareme(e: ExerciceEquilibreForces): BaremeExercice {
  const somme = Math.round(sommeIntensites(e) * 10) / 10;
  const criteres = [
    { sousQuestion: "a", critere: [texte("Condition d'équilibre écrite, force cherchée exprimée comme l'opposée de la résultante")], points: 0.5 },
    { sousQuestion: "b", critere: [texte(e.situation === "anneau" ? "Composantes lues sur le quadrillage et converties en N, résultante calculée" : "Résultante des deux forces connues, composante par composante")], points: 1 },
    { sousQuestion: "c", critere: [texte("Composantes de la force cherchée (signes changés)")], points: 1 },
    { sousQuestion: "d", critere: [texte(intensiteExacteDemandee(e) ? "Intensité exacte, simplifiée, avec l'unité" : "Intensité au dixième de newton, avec l'unité")], points: e.direction ? 1 : 1.5 },
  ];
  if (e.direction) criteres.push({ sousQuestion: "e", critere: [texte("Angle avec l'axe x par la tangente")], points: 0.5 });
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: [
      { description: [texte("Force cherchée égale à la résultante (signe moins oublié)")], cout: "0 pt sur l'étape c (pas de double sanction ensuite)" },
      { description: [texte(`Intensités des deux forces connues additionnées au lieu des vecteurs (≈ ${dixieme(somme, "texte")} N au lieu de ≈ ${dixieme(intensiteArrondie(e), "texte")} N)`)], cout: "0 pt sur l'étape d" },
      { description: [texte("Unité absente")], cout: "−0,5 pt" },
      ...(e.direction ? [{ description: [texte("Angle avec l'axe y (complémentaire) au lieu de l'axe x")], cout: "0 pt sur l'étape e" }] : []),
    ],
    reponsesAcceptees: [[texte("Intensité exacte non simplifiée (racine du radicand complet) : moitié des points du critère")], [texte("Résultat juste à partir de composantes fausses : points de méthode accordés (pas de double sanction)")]],
  };
}

function difficulte(e: ExerciceEquilibreForces): 1 | 2 | 3 {
  if (e.intensite === "axe") return 1;
  return e.direction ? 3 : 2;
}

export const adaptateurEvaluationEquilibreForces: AdaptateurFeuilleExercices<ExerciceEquilibreForces> = {
  profilInstance: profilEquilibreForces,
  libelleCasParticulier: LIBELLE_CAS_EQUILIBRE_FORCES,
  titreDocument: "Équilibre de forces en composantes — Évaluation",
  nomFichierBase: "equilibre-forces-composantes",
  genererInstance: genererExerciceEquilibreForces,
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
