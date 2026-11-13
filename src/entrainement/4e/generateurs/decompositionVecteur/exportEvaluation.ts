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
import type { ExerciceComposantes, ExerciceDecompositionVecteur, ExerciceGraphique } from "../../core/decompositionVecteur.types";
import { combinaison, det, estDemiEntier, lignesSysteme, nettoyer, pointDe } from "../../moteur/modeleDecompositionVecteur";
import {
  U,
  V,
  W,
  combinaisonLatex,
  composantesLatex,
  consignesEcrans,
  enonceFragments,
  facteurLatex,
  nombreLatex,
  planResolution,
  questionPapier,
  sommeTermes,
  systemeOptionLatex,
  termeSansSigneSigne,
  vecteurPoints,
} from "../../ui/formatDecompositionVecteur";
import { construireFigureDecomposition } from "../../ui/figureDecompositionVecteur";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDecompositionVecteur } from "./index";
import { LIBELLE_CAS_DECOMPOSITION_VECTEUR, profilDecompositionVecteur } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen82. Énoncé papier = données (+ figure pour la
 * famille graphique) + la consigne globale (« Écris u sous la forme av + bw… », « Détermine a et
 * b… », « La décomposition est-elle possible ? Si oui… ») ; les écrans d'apprentissage deviennent les
 * étapes a, b, c du corrigé, la première avec la figure de la construction (`figureHtml`).
 * Séries équilibrées : `profil.ts`.
 */

function figureEnonce(e: ExerciceDecompositionVecteur): string | undefined {
  return e.type === "graphique" ? construireFigureDecomposition(e, { theme: "papier" }) : undefined;
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceDecompositionVecteur): SectionExercice {
  return {
    enteteFragments: enonceFragments(e),
    enteteHtml: figureEnonce(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceDecompositionVecteur): EnoncePapier {
  return {
    section: { enteteFragments: enonceFragments(e), enteteHtml: figureEnonce(e), questions: [{ consigne: questionPapier(e) }] },
    etapesParQuestion: [e.type === "composantes" && e.famille === "possible" ? ["a", "b"] : ["a", "b", "c"]],
  };
}

function reponseBreve(e: ExerciceDecompositionVecteur): FragmentConsigne[] {
  if (e.type === "graphique") return [latex(`${U} = ${combinaisonLatex(e.a, e.b)}`)];
  if (!e.possible) return [texte("Impossible : "), latex(`${W} = ${termeSansSigneSigne(e.k!, V)}`), texte(" (colinéaires).")];
  return [latex(`a = ${nombreLatex(e.a!)}`), texte(" et "), latex(`b = ${nombreLatex(e.b!)}`), texte(" : "), latex(`${U} = ${combinaisonLatex(e.a!, e.b!)}`)];
}

// ---------------------------------------------------------------------------------------------
// Famille graphique
// ---------------------------------------------------------------------------------------------

function longueurTexte(m: number): FragmentConsigne[] {
  if (m === 1) return [texte("la même longueur que ")];
  if (m === 0.5) return [texte("la moitié de la longueur de ")];
  if (m === 2) return [texte("le double de la longueur de ")];
  if (m === 3) return [texte("le triple de la longueur de ")];
  return [latex(nombreLatex(m)), texte(" fois la longueur de ")];
}

/** Lecture d'un coefficient (a sur [PM], ou b sur [MQ]). */
function lectureCoefficient(e: ExerciceGraphique, estA: boolean, lettre: string): EtapeCorrection[] {
  const coef = estA ? e.a : e.b;
  const vec = estA ? V : W;
  const nomCoef = estA ? "a" : "b";
  const de = estA ? e.origine : e.pointM;
  const vers = estA ? e.pointM : e.extremite;
  const seg = vecteurPoints(de, vers);
  if (coef === 0) {
    return [
      {
        label: "Calcul",
        sousQuestion: lettre,
        fragments: [texte(`M est confondu avec ${de} : `), latex(`${estA ? vecteurPoints(e.origine, "M") : vecteurPoints("M", e.extremite)} = \\vec{0} = 0${vec}`), texte(".")],
      },
      { label: "Conclusion", sousQuestion: lettre, fragments: [latex(`${nomCoef} = 0`)] },
    ];
  }
  const fr: FragmentConsigne[] = [latex(seg), texte(" a la direction de "), latex(vec), texte(coef > 0 ? ", le même sens, et " : ", le sens contraire, et "), ...longueurTexte(Math.abs(coef)), latex(vec), texte(".")];
  const sens = estA ? e.v : e.w;
  if (e.famille === "quadrillage" || e.famille === "reseau") {
    const p = pointDe(e, de);
    const q = pointDe(e, vers);
    const pas = (n: number) => `${n} ${n > 1 ? "côtés" : "côté"} de case`;
    if (e.famille === "reseau") {
      const l = Math.abs(q.i - p.i) + Math.abs(q.j - p.j);
      const lv = Math.abs(sens.x) + Math.abs(sens.y);
      fr.push(texte(` Sur le réseau, il mesure ${pas(l)}, et `), latex(vec), texte(` en mesure ${lv}.`));
    } else {
      fr.push(
        texte(" Sur le quadrillage : "),
        latex(`${seg}\\begin{pmatrix} ${q.i - p.i} \\\\ ${q.j - p.j} \\end{pmatrix}`),
        texte(" et "),
        latex(`${vec}\\begin{pmatrix} ${sens.x} \\\\ ${sens.y} \\end{pmatrix}`),
        ...(coef === 1
          ? [texte(" (déplacements en cases) : les mêmes déplacements.")]
          : [texte(" (déplacements en cases) : chaque composante est multipliée par "), latex(nombreLatex(coef)), texte(".")]),
      );
    }
  }
  return [
    { label: "Calcul", sousQuestion: lettre, fragments: fr },
    { label: "Conclusion", sousQuestion: lettre, fragments: [latex(`${estA ? vecteurPoints(e.origine, "M") : vecteurPoints("M", e.extremite)} = ${termeSansSigneSigne(coef, vec)}`), texte(", donc "), latex(`${nomCoef} = ${nombreLatex(coef)}`)] },
  ];
}

function correctionGraphique(e: ExerciceGraphique): EtapeCorrection[] {
  const P = e.origine;
  const Q = e.extremite;
  const M = e.pointM;
  const etapes: EtapeCorrection[] = [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [
        texte(`Méthode du parallélogramme en sens inverse : par ${P}, on trace la parallèle à `),
        latex(V),
        texte(` ; par ${Q}, la parallèle à `),
        latex(W),
        texte(`. Elles se coupent en M = ${M}.`),
      ],
      figureHtml: construireFigureDecomposition(e, { theme: "papier", construction: true }),
    },
    {
      label: "Conclusion",
      sousQuestion: "a",
      fragments:
        M === P || M === Q
          ? [texte(`M = ${M} : `), latex(U), texte(` est porté par la seule direction de `), latex(M === P ? W : V), texte(".")]
          : [latex(`${U} = ${vecteurPoints(P, M)} + ${vecteurPoints(M, Q)}`), texte(", avec "), latex(vecteurPoints(P, M)), texte(" de même direction que "), latex(V), texte(" et "), latex(vecteurPoints(M, Q)), texte(" de même direction que "), latex(W), texte(".")],
    },
    ...lectureCoefficient(e, true, "a").map((x) => ({ ...x, sousQuestion: "b" })),
    ...lectureCoefficient(e, false, "c").map((x) => ({ ...x, sousQuestion: "c" })),
    { label: "Conclusion", sousQuestion: "c", fragments: [latex(`${U} = ${combinaisonLatex(e.a, e.b)}`)] },
    piegeGraphique(e),
  ];
  return etapes;
}

function piegeGraphique(e: ExerciceGraphique): EtapeCorrection {
  if (e.a === 0 || e.b === 0) {
    return {
      label: "Piège",
      sousQuestion: e.a === 0 ? "b" : "c",
      fragments: [texte("Un coefficient nul n'est pas une erreur : "), latex(U), texte(" est parallèle à "), latex(e.a === 0 ? W : V), texte(", et "), latex(`${U} = ${combinaisonLatex(e.a, e.b)}`), texte(".")],
    };
  }
  if (e.a < 0 || e.b < 0) {
    const negA = e.a < 0;
    return {
      label: "Piège",
      sousQuestion: negA ? "b" : "c",
      fragments: [
        latex(negA ? vecteurPoints(e.origine, "M") : vecteurPoints("M", e.extremite)),
        texte(" va à contresens de "),
        latex(negA ? V : W),
        texte(" : son coefficient est négatif. Oublier le signe donnerait "),
        latex(`${U} = ${combinaisonLatex(Math.abs(e.a), Math.abs(e.b))}`),
        texte(", faux."),
      ],
    };
  }
  if (e.a === e.b) {
    return {
      label: "Piège",
      sousQuestion: "a",
      fragments: [texte("Mener des PARALLÈLES aux deux directions, pas des perpendiculaires : une projection perpendiculaire ne donne pas un parallélogramme, et "), latex(U), texte(" ne serait pas la somme des deux vecteurs obtenus.")],
    };
  }
  return {
    label: "Piège",
    sousQuestion: "a",
    fragments: [
      texte("Mener des parallèles, pas des perpendiculaires ; et ne pas échanger les directions : le coefficient de "),
      latex(V),
      texte(" se lit sur le côté parallèle à "),
      latex(V),
      texte(". Écrire "),
      latex(`${U} = ${combinaisonLatex(e.b, e.a)}`),
      texte(" serait faux."),
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// Famille composantes
// ---------------------------------------------------------------------------------------------

function equationLatex(l: [number, number, number]): string {
  return `${sommeTermes([
    [l[0], "a"],
    [l[1], "b"],
  ])} = ${nombreLatex(l[2])}`;
}

/** Remplace l'inconnue connue par sa valeur, garde l'autre : « 2a + 3 \times 2 = 10 ». */
function substitution(l: [number, number, number], connue: "a" | "b", valeur: number): string {
  const [ca, cb, c] = l;
  const termeConnu = (coef: number) => `${facteurLatex(coef)} \\times ${facteurLatex(valeur)}`;
  const gauche = connue === "a" ? [termeConnu(ca), sommeTermes([[cb, "b"]])] : [sommeTermes([[ca, "a"]]), termeConnu(cb)];
  const morceaux = gauche.filter((m) => m !== "0");
  return `${morceaux.join(" + ").replace(/\+ -/g, "- ")} = ${nombreLatex(c)}`;
}

/** Résout l'équation l (où `connue` vaut `valeur`) pour l'autre inconnue : fragments de calcul. */
function finirAvec(l: [number, number, number], connue: "a" | "b", valeur: number): FragmentConsigne[] {
  const autre = connue === "a" ? "b" : "a";
  const coefAutre = connue === "a" ? l[1] : l[0];
  const coefConnu = connue === "a" ? l[0] : l[1];
  const reste = nettoyer(l[2] - coefConnu * valeur);
  const sol = nettoyer(reste / coefAutre);
  const lignes = [substitution(l, connue, valeur), `${sommeTermes([[coefAutre, autre]])} = ${nombreLatex(reste)}`, `${autre} = ${nombreLatex(sol)}`];
  const uniques = lignes.filter((x, i) => lignes.indexOf(x) === i);
  return [latex(uniques.join(" \\;\\Longrightarrow\\; "))];
}

function etapesResolution(e: ExerciceComposantes, lettre: string): EtapeCorrection[] {
  const lignes = lignesSysteme(e, "correct") as [[number, number, number], [number, number, number]];
  const plan = planResolution(e);
  const a = e.a!;
  const b = e.b!;
  const etapes: EtapeCorrection[] = [];
  if (plan.type === "directe") {
    const k = plan.equation!;
    const inc = plan.inconnue!;
    const l = lignes[k];
    const coef = inc === "a" ? l[0] : l[1];
    const val = inc === "a" ? a : b;
    etapes.push({
      label: "Calcul",
      sousQuestion: lettre,
      fragments: [texte(`L'équation (${k + 1}) ne contient que ${inc} : `), latex(`${equationLatex(l)} \\;\\Longrightarrow\\; ${inc} = \\dfrac{${nombreLatex(l[2])}}{${nombreLatex(coef)}} = ${nombreLatex(val)}`), texte(".")],
    });
    etapes.push({ label: "Calcul", sousQuestion: lettre, fragments: [texte(`On remplace ${inc} dans l'équation (${2 - k}) : `), ...finirAvec(lignes[1 - k]!, inc, val)] });
  } else {
    const m1 = plan.m1!;
    const m2 = plan.m2!;
    const mult = (l: [number, number, number], m: number): [number, number, number] => [l[0] * m, l[1] * m, l[2] * m];
    const L1 = mult(lignes[0], m1);
    const L2 = mult(lignes[1], m2);
    const add = plan.operation === "addition";
    const A2 = add ? L1[0] + L2[0] : L1[0] - L2[0];
    const R2 = add ? L1[2] + L2[2] : L1[2] - L2[2];
    const nom = (k: number, m: number) => (m === 1 ? `(${k})` : `(${k}) multipliée par ${m}`);
    etapes.push({
      label: "Calcul",
      sousQuestion: lettre,
      fragments: [
        texte(`On élimine b : ${nom(1, m1)} et ${nom(2, m2)} donnent `),
        latex(`${equationLatex(L1)}`),
        texte(" et "),
        latex(`${equationLatex(L2)}`),
        texte(add ? " ; on les additionne : " : " ; on les soustrait : "),
        latex(`${sommeTermes([[A2, "a"]])} = ${nombreLatex(R2)} \\;\\Longrightarrow\\; a = ${nombreLatex(a)}`),
        texte("."),
      ],
    });
    etapes.push({ label: "Calcul", sousQuestion: lettre, fragments: [texte("On remplace a dans l'équation (1) : "), ...finirAvec(lignes[0], "a", a)] });
  }
  etapes.push({ label: "Conclusion", sousQuestion: lettre, fragments: [latex(`a = ${nombreLatex(a)}`), texte(" et "), latex(`b = ${nombreLatex(b)}`), texte(" : "), latex(`${U} = ${combinaisonLatex(a, b)}`)] });
  return etapes;
}

function etapeSysteme(e: ExerciceComposantes, lettre: string): EtapeCorrection {
  return {
    label: "Méthode",
    sousQuestion: lettre,
    fragments: [
      texte("Deux vecteurs égaux ont les mêmes composantes : "),
      latex(`${composantesLatex(e.u)} = a${composantesLatex(e.v)} + b${composantesLatex(e.w)}`),
      texte(" donne le système "),
      latex(systemeOptionLatex(e, "correct")),
      texte(" (équations (1) et (2))."),
    ],
  };
}

function correctionComposantes(e: ExerciceComposantes): EtapeCorrection[] {
  const { av, bw } = combinaison(e);
  return [
    etapeSysteme(e, "a"),
    ...etapesResolution(e, "b"),
    {
      label: "Calcul",
      sousQuestion: "c",
      fragments: [
        latex(`${termeSansSigneSigne(e.a!, V)} = ${composantesLatex(av)}`),
        texte(" et "),
        latex(`${termeSansSigneSigne(e.b!, W)} = ${composantesLatex(bw)}`),
        texte(" ; leur somme : "),
        latex(`\\begin{pmatrix} ${nombreLatex(av.x)} + ${facteurLatex(bw.x)} \\\\ ${nombreLatex(av.y)} + ${facteurLatex(bw.y)} \\end{pmatrix} = ${composantesLatex(e.u)}`),
        texte("."),
      ],
    },
    { label: "Conclusion", sousQuestion: "c", fragments: [texte("On retrouve bien les composantes de "), latex(U), texte(" : la décomposition est juste.")] },
    {
      label: "Piège",
      sousQuestion: "a",
      fragments: [
        texte("Chaque équation n'utilise qu'UNE composante de chacun des trois vecteurs, avec a devant celle de "),
        latex(V),
        texte(" et b devant celle de "),
        latex(W),
        texte(". Écrire "),
        latex(systemeOptionLatex(e, e.ordreSystemes.includes("transpose") ? "transpose" : e.ordreSystemes.find((o) => o !== "correct")!)),
        texte(" serait faux."),
      ],
    },
  ];
}

function correctionPossible(e: ExerciceComposantes): EtapeCorrection[] {
  const p1 = e.v.x * e.w.y;
  const p2 = e.v.y * e.w.x;
  const etapes: EtapeCorrection[] = [
    {
      label: "Calcul",
      sousQuestion: "a",
      fragments: [
        texte("Produits en croix des composantes de "),
        latex(V),
        texte(" et "),
        latex(W),
        texte(" : "),
        latex(`${facteurLatex(e.v.x)} \\times ${facteurLatex(e.w.y)} = ${nombreLatex(p1)}`),
        texte(" et "),
        latex(`${facteurLatex(e.v.y)} \\times ${facteurLatex(e.w.x)} = ${nombreLatex(p2)}`),
        texte(p1 === p2 ? " : égaux, les composantes sont proportionnelles." : " : différents, les composantes ne sont pas proportionnelles."),
      ],
    },
    {
      label: "Conclusion",
      sousQuestion: "a",
      fragments: e.possible
        ? [latex(V), texte(" et "), latex(W), texte(" ne sont pas colinéaires : la décomposition est possible.")]
        : [latex(V), texte(" et "), latex(W), texte(" sont colinéaires : la décomposition est impossible.")],
    },
  ];
  if (e.possible) {
    etapes.push({ ...etapeSysteme(e, "b"), label: "Méthode" }, ...etapesResolution(e, "b"));
  } else {
    const k = e.k!;
    const dvu = det(e.u, e.v);
    etapes.push(
      {
        label: "Calcul",
        sousQuestion: "b",
        fragments: [
          latex(`${nombreLatex(e.w.x)} = ${facteurLatex(k)} \\times ${facteurLatex(e.v.x)}`),
          texte(" et "),
          latex(`${nombreLatex(e.w.y)} = ${facteurLatex(k)} \\times ${facteurLatex(e.v.y)}`),
          texte(" : "),
          latex(`${W} = ${termeSansSigneSigne(k, V)}`),
          texte(". Toute combinaison "),
          latex(`a${V} + b${W}`),
          texte(" est donc colinéaire à "),
          latex(V),
          texte(" ; or "),
          latex(U),
          texte(" ne l'est pas ("),
          latex(`${facteurLatex(e.u.x)} \\times ${facteurLatex(e.v.y)} - ${facteurLatex(e.u.y)} \\times ${facteurLatex(e.v.x)} = ${nombreLatex(dvu)} \\neq 0`),
          texte(")."),
        ],
      },
      { label: "Conclusion", sousQuestion: "b", fragments: [texte("Aucun couple (a ; b) ne convient : "), latex(U), texte(" ne se décompose pas selon "), latex(V), texte(" et "), latex(W), texte(".")] },
    );
  }
  etapes.push({
    label: "Piège",
    sousQuestion: "a",
    fragments: [
      texte("Vérifier d'abord que "),
      latex(V),
      texte(" et "),
      latex(W),
      texte(" ne sont pas colinéaires : s'ils le sont, les deux directions n'en font qu'une, et le système n'a pas une solution unique."),
    ],
  });
  return etapes;
}

function correctionDetaillee(e: ExerciceDecompositionVecteur): EtapeCorrection[] {
  if (e.type === "graphique") return correctionGraphique(e);
  return e.famille === "composantes" ? correctionComposantes(e) : correctionPossible(e);
}

function construireCorrection(e: ExerciceDecompositionVecteur): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.label === "Conclusion")
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
}

function bareme(e: ExerciceDecompositionVecteur): BaremeExercice {
  const erreurSigne: ErreurFrequente = { description: [texte("Coefficient négatif écrit positif (vecteur « à contresens »)")], cout: "0,5 pt par coefficient" };
  const erreurEchange: ErreurFrequente = { description: [texte("Coefficients de v et de w échangés")], cout: "moitié des points des coefficients" };
  if (e.type === "graphique") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Construction : parallèle à v par l'origine de u, parallèle à w par son extrémité, point M")], points: 1.5 },
        { sousQuestion: "b", critere: [texte("Coefficient a, signe compris")], points: 1 },
        { sousQuestion: "c", critere: [texte("Coefficient b, signe compris, et écriture de u = av + bw")], points: 1.5 },
      ],
      erreursFrequentes: [
        erreurSigne,
        erreurEchange,
        { description: [texte("Perpendiculaires tracées au lieu des parallèles")], cout: "0 pt sur la construction" },
      ],
      reponsesAcceptees: [[texte("Coefficients écrits en fraction ou en décimal (0,5 pour la moitié)")]],
    };
  }
  if (e.famille === "composantes") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Système : une équation par composante")], points: 1 },
        { sousQuestion: "b", critere: [texte("Résolution : a et b exacts, étapes montrées")], points: 2 },
        { sousQuestion: "c", critere: [texte("Vérification : av + bw redonne u")], points: 1 },
      ],
      erreursFrequentes: [
        { description: [texte("Système « transposé » (composantes de v dans la même équation)")], cout: "0 pt sur le système, la résolution reste notée" },
        erreurEchange,
        erreurSigne,
      ],
      reponsesAcceptees: [[texte("Toute méthode de résolution correcte (substitution, combinaison)")], [texte("Coefficients écrits en fraction ou en décimal")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Verdict justifié (v et w colinéaires ou non)")], points: 1.5 },
      { sousQuestion: "b", critere: [texte(e.possible ? "a et b exacts, système et résolution montrés" : "k tel que w = kv, et conclusion : u n'est pas colinéaire à v")], points: 2.5 },
    ],
    erreursFrequentes: [
      { description: [texte("Verdict sans justification")], cout: "0,5 pt sur le verdict" },
      { description: [texte("Système résolu sans vérifier la colinéarité")], cout: "1 pt sur le verdict" },
      erreurSigne,
    ],
    reponsesAcceptees: [[texte("Justification par le déterminant (produits en croix) ou par la proportionnalité des composantes")]],
  };
}

function difficulte(e: ExerciceDecompositionVecteur): 1 | 2 | 3 {
  if (e.type === "graphique") {
    if (e.famille === "reseau") return 1;
    if (e.famille === "parallelogramme") return estDemiEntier(e.a) || estDemiEntier(e.b) ? 2 : 1;
    if (e.famille === "quadrillage" && (estDemiEntier(e.a) || estDemiEntier(e.b))) return 3;
    return 2;
  }
  return 2;
}

export const adaptateurEvaluationDecompositionVecteur: AdaptateurFeuilleExercices<ExerciceDecompositionVecteur> = {
  profilInstance: profilDecompositionVecteur,
  libelleCasParticulier: LIBELLE_CAS_DECOMPOSITION_VECTEUR,
  titreDocument: "Décomposer un vecteur selon deux directions — Évaluation",
  nomFichierBase: "decomposer-vecteur",
  genererInstance: genererExerciceDecompositionVecteur,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 5,
};
