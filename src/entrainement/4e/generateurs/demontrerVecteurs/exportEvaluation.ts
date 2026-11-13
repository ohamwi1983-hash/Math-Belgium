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
import type { Coefficients, ExerciceDemontrerVecteurs, PointDefini, VecteurNomme } from "../../core/demontrerVecteurs.types";
import { cMoins, coefficientColinearite, coefficientsVecteur, estNul, positions, q, valeur } from "../../moteur/modeleDemontrerVecteurs";
import {
  aDemontrerFragments,
  baseAdapteeLatex,
  baseLatex,
  combinaisonLatex,
  conclusionFragments,
  consignesEcrans,
  dansBaseLatex,
  enonceFragments,
  positionNonReduite,
  rationnelLatex,
  rationnelParentheses,
  relationColineariteLatex,
  uLatex,
  vLatex,
  vecLatex,
} from "../../ui/formatDemontrerVecteurs";
import { construireFigureDemontrerVecteurs } from "../../ui/figureDemontrerVecteurs";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDemontrerVecteurs } from "./index";
import { profilDemontrerVecteurs } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen85. Énoncé papier = figure de base + relations
 * qui définissent E et F + figure + « Démontre que … » (ce qu'il faut démontrer, JAMAIS la méthode —
 * décision de l'utilisateur). Les quatre écrans (base, expressions, coefficient k, conclusion)
 * deviennent les étapes a, b, c, d du corrigé ; la figure avec les deux vecteurs utiles va dans le
 * corrigé (`figureHtml`). Séries équilibrées : `profil.ts`.
 */

function figureEnonce(e: ExerciceDemontrerVecteurs): string {
  return construireFigureDemontrerVecteurs(e, { theme: "papier" });
}

function figureCorrige(e: ExerciceDemontrerVecteurs): string {
  return construireFigureDemontrerVecteurs(e, { theme: "papier", vecteurs: true });
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceDemontrerVecteurs): SectionExercice {
  return {
    enteteFragments: [...enonceFragments(e), texte(" "), ...aDemontrerFragments(e)],
    enteteHtml: figureEnonce(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceDemontrerVecteurs): EnoncePapier {
  return {
    section: {
      enteteFragments: enonceFragments(e),
      enteteHtml: figureEnonce(e),
      questions: [{ consigne: aDemontrerFragments(e) }],
    },
    etapesParQuestion: [["a", "b", "c", "d"]],
  };
}

function reponseBreve(e: ExerciceDemontrerVecteurs): FragmentConsigne[] {
  return conclusionFragments(e, "juste");
}

/** Combinaison entre parenthèses quand elle a plusieurs termes ou commence par un signe moins
 * (substitution dans le corrigé). */
function entreParentheses(e: ExerciceDemontrerVecteurs, c: Coefficients): string {
  const l = dansBaseLatex(e, c);
  return (!estNul(c.x) && !estNul(c.y)) || l.startsWith("-") ? `\\left(${l}\\right)` : l;
}

/** Sommets non triviaux utilisés (C ; le trapèze rappelle aussi DC = t·AB). */
function rappelSommets(e: ExerciceDemontrerVecteurs, utiles: Set<string>): EtapeCorrection[] {
  if (e.figure === "triangle" || !utiles.has("C")) return [];
  const formule = e.figure === "parallelogramme" ? "\\vec{AC} = \\vec{AB} + \\vec{BC} = \\vec{AB} + \\vec{AD}" : `\\vec{AC} = \\vec{AD} + \\vec{DC} = ${dansBaseLatex(e, positions(e).C!)}`;
  return [{ label: "Calcul", sousQuestion: "b", fragments: [texte("Sommet C : "), latex(formule), texte(".")] }];
}

/** Membres d'une chaîne d'égalités, sans deux membres consécutifs identiques. */
function sansRepetition(membres: string[]): string {
  const liste = membres.flatMap((m) => m.split(" = "));
  return liste.filter((m, i) => i === 0 || m !== liste[i - 1]).join(" = ");
}

/** Position d'un point défini : Chasles, substitution, réduction. */
function etapePoint(e: ExerciceDemontrerVecteurs, d: PointDefini): EtapeCorrection {
  const p = positions(e);
  const direction = cMoins(p[d.vers]!, p[d.de]!);
  const kAbs = q(Math.abs(d.k.n), d.k.d);
  const coef = valeur(kAbs) === 1 ? "" : rationnelLatex(kAbs);
  const terme = `${coef}${entreParentheses(e, direction)}`;
  const substitue = d.origine === "A" ? `${d.k.n < 0 ? "-" : ""}${terme}` : `${entreParentheses(e, p[d.origine]!)} ${d.k.n < 0 ? "-" : "+"} ${terme}`;
  return {
    label: "Calcul",
    sousQuestion: "b",
    fragments: [texte(`Point ${d.nom} : `), latex(sansRepetition([positionNonReduite(d), substitue, dansBaseLatex(e, p[d.nom]!)])), texte(".")],
  };
}

function etapeVecteur(e: ExerciceDemontrerVecteurs, vec: VecteurNomme, figure?: string): EtapeCorrection {
  const p = positions(e);
  const resultat = dansBaseLatex(e, coefficientsVecteur(e, vec));
  let membres: string[];
  if (vec.de === "A") membres = [vecLatex(vec), resultat];
  else if (vec.vers === "A") membres = [vecLatex(vec), `-\\vec{A${vec.de}}`, `-${entreParentheses(e, p[vec.de]!)}`, resultat];
  else
    membres = [
      vecLatex(vec),
      `\\vec{${vec.de}A} + \\vec{A${vec.vers}}`,
      `-\\vec{A${vec.de}} + \\vec{A${vec.vers}}`,
      `-${entreParentheses(e, p[vec.de]!)} + ${entreParentheses(e, p[vec.vers]!)}`,
      resultat,
    ];
  // Pas deux fois le même membre (point ou sommet déjà exprimé en un seul terme).
  const formule = sansRepetition(membres);
  const intro = vec.de === "A" ? "Vecteur utile : " : "Par Chasles : ";
  return { label: "Calcul", sousQuestion: "b", fragments: [texte(intro), latex(formule), texte(".")], ...(figure ? { figureHtml: figure } : {}) };
}

function piege(e: ExerciceDemontrerVecteurs): EtapeCorrection {
  const c = e.cible;
  switch (c.type) {
    case "alignes":
      return {
        label: "Piège",
        sousQuestion: "d",
        fragments: [texte(`Des vecteurs colinéaires seuls donnent des droites parallèles ; c'est le point commun ${c.points[0]} des deux vecteurs qui donne l'alignement.`)],
      };
    case "paralleles":
      return {
        label: "Piège",
        sousQuestion: "d",
        fragments: [texte(`Colinéaires ne veut pas dire alignés : les droites (${c.droite1.join("")}) et (${c.droite2.join("")}) n'ont aucun point commun, elles sont parallèles et distinctes.`)],
      };
    default: {
      const vec = [e.w, e.v].find((x) => x.de !== "A" && x.vers !== "A");
      if (!vec) return { label: "Piège", sousQuestion: "d", fragments: [texte("L'ordre des points compte dans l'égalité de deux vecteurs.")] };
      return {
        label: "Piège",
        sousQuestion: "b",
        fragments: [texte("Chasles mal enchaîné : "), latex(`\\vec{${vec.de}A} = -\\vec{A${vec.de}}`), texte(", et pas "), latex(`\\vec{A${vec.de}}`), texte(" — sinon le signe d'un coefficient est faux.")],
      };
    }
  }
}

function correctionDetaillee(e: ExerciceDemontrerVecteurs): EtapeCorrection[] {
  const col = e.bases.find((b) => b.id === "colineaire")!;
  const utiles = new Set([e.w.de, e.w.vers, e.v.de, e.v.vers]);
  const definisUtiles = e.definis.filter((d) => utiles.has(d.nom));
  // C sert aussi quand un point défini est construit à partir de C.
  const avecC = new Set(utiles);
  for (const d of definisUtiles) [d.origine, d.de, d.vers].forEach((n) => avecC.add(n));
  const w = coefficientsVecteur(e, e.w);
  const v = coefficientsVecteur(e, e.v);
  const k = coefficientColinearite(e);
  return [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [
        texte("On travaille dans la base "),
        latex(baseAdapteeLatex(e)),
        texte(" : deux vecteurs non colinéaires, de même origine A, portés par les côtés ; les relations de l'énoncé s'y traduisent directement. "),
        latex(baseLatex(col)),
        texte(" n'est pas une base : ses deux vecteurs sont colinéaires."),
      ],
    },
    ...rappelSommets(e, avecC),
    ...definisUtiles.map((d) => etapePoint(e, d)),
    etapeVecteur(e, e.w),
    etapeVecteur(e, e.v, figureCorrige(e)),
    {
      label: "Calcul",
      sousQuestion: "c",
      fragments: [
        texte("Coefficients proportionnels, avec le même nombre k pour les deux : "),
        latex(`${rationnelLatex(v.x)} = ${rationnelLatex(k)} \\times ${rationnelParentheses(w.x)}`),
        texte(" et "),
        latex(`${rationnelLatex(v.y)} = ${rationnelLatex(k)} \\times ${rationnelParentheses(w.y)}`),
        texte("."),
      ],
    },
    { label: "Conclusion", sousQuestion: "c", fragments: [latex(relationColineariteLatex(e)), texte(".")] },
    { label: "Conclusion", sousQuestion: "d", fragments: conclusionFragments(e, "juste") },
    piege(e),
  ];
}

function construireCorrection(e: ExerciceDemontrerVecteurs): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [latex(`${vecLatex(e.w)} = ${combinaisonLatex(coefficientsVecteur(e, e.w), uLatex(), vLatex(e))}`), texte(" et "), latex(`${vecLatex(e.v)} = ${combinaisonLatex(coefficientsVecteur(e, e.v), uLatex(), vLatex(e))}`), texte(".")] },
    { type: "paragraphe", fragments: conclusionFragments(e, "juste") },
  ];
}

function propriete(e: ExerciceDemontrerVecteurs): string {
  switch (e.cible.type) {
    case "alignes":
      return "vecteurs colinéaires ET point commun";
    case "paralleles":
      return "vecteurs colinéaires, droites distinctes";
    case "milieu":
      return "deux vecteurs égaux bout à bout";
    case "parallelogramme":
      return "deux côtés opposés représentant le même vecteur, dans l'ordre des sommets";
  }
}

function bareme(e: ExerciceDemontrerVecteurs): BaremeExercice {
  const type = e.cible.type;
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Base adaptée : deux vecteurs non colinéaires (de préférence de même origine, sur les côtés)")], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Les deux vecteurs utiles exprimés dans la base, par la relation de Chasles")], points: 1.5 },
      { sousQuestion: "c", critere: [texte("Coefficients proportionnels : k trouvé et vérifié sur les deux coefficients")], points: 1 },
      { sousQuestion: "d", critere: [texte(`Conclusion qui cite la propriété (${propriete(e)})`)], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Chasles mal enchaîné (un vecteur XA remplacé par AX au lieu de −AX) : signe d'un coefficient faux")], cout: "0,5 pt par vecteur" },
      { description: [texte("Proportionnalité testée sur un seul coefficient")], cout: "0,5 pt" },
      type === "alignes" || type === "paralleles"
        ? { description: [texte("Parallélisme et alignement confondus (point commun oublié ou inventé)")], cout: "0 pt sur la conclusion" }
        : { description: [texte("Ordre des points ou des sommets inversé dans la conclusion")], cout: "0,5 pt" },
    ],
    reponsesAcceptees: [[texte("Toute autre base adaptée correctement utilisée (calculs justes), et k écrit sous forme décimale exacte")]],
  };
}

function difficulte(e: ExerciceDemontrerVecteurs): 2 | 3 {
  const w = coefficientsVecteur(e, e.w);
  const v = coefficientsVecteur(e, e.v);
  const fractions = [w.x, w.y, v.x, v.y].some((r) => r.d !== 1);
  return fractions || e.figure === "trapeze" ? 3 : 2;
}

export const adaptateurEvaluationDemontrerVecteurs: AdaptateurFeuilleExercices<ExerciceDemontrerVecteurs> = {
  profilInstance: profilDemontrerVecteurs,
  titreDocument: "Démontrer avec des vecteurs — Évaluation",
  nomFichierBase: "demontrer-avec-des-vecteurs",
  genererInstance: genererExerciceDemontrerVecteurs,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 10,
};
