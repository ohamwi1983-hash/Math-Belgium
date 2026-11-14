/**
 * Adaptateur feuilles d'exercices / évaluations de `gen53` (construction de la parabole au compas
 * et à l'équerre). Énoncé papier = figure sans grille (F, d oblique, et H₁, H₂, H₃ pour la méthode
 * de la médiatrice) + consigne globale qui nomme la méthode ; les étapes (axe, sommet, trois couples
 * ou trois points, tracé) vont dans le corrigé. `forme` = méthode : la même dans toutes les séries.
 */
import type { ExerciceConstructionParabole } from "../../core/constructionParabole.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { svgConstructionParabole } from "../../ui/figureConstructionParabole";
import { fr } from "../../ui/formatConstructionParabole";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceConstructionParabole } from "./index";

type E = ExerciceConstructionParabole;

function enteteEnonce(e: E): FragmentConsigne[] {
  return e.methode === "cercle"
    ? fr("On donne le foyer $F$ et la directrice $d$ d'une parabole.")
    : fr("On donne le foyer $F$ et la directrice $d$ d'une parabole, ainsi que trois points $H_1$, $H_2$ et $H_3$ de $d$.");
}

function questions(e: E): FragmentConsigne[][] {
  const debut = [
    fr("Construis à l'équerre l'axe de la parabole ; il coupe $d$ en $K$."),
    fr("Construis au compas le sommet $S$, milieu de $[KF]$."),
  ];
  const fin = [fr("Trace la parabole.")];
  if (e.methode === "cercle") {
    const ordinal = ["un premier", "un deuxième", "un troisième"];
    return [
      ...debut,
      ...ordinal.map((o, i) =>
        fr(`Par la méthode du cercle et de la parallèle, construis ${o} couple de points de la parabole${i > 0 ? ", avec une autre ouverture de compas" : ""}.`),
      ),
      ...fin,
    ];
  }
  return [
    ...debut,
    ...[1, 2, 3].map((i) => fr(`Par la méthode de la médiatrice, construis le point de la parabole qui se projette en $H_${i}$ sur $d$, puis son symétrique par rapport à l'axe.`)),
    ...fin,
  ];
}

function construireEnonce(e: E): SectionExercice {
  return {
    enteteFragments: enteteEnonce(e),
    enteteHtml: svgConstructionParabole(e, false),
    questions: questions(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: E): EnoncePapier {
  const consigne =
    e.methode === "cercle"
      ? fr("On donne le foyer $F$ et la directrice $d$ d'une parabole. Construis au compas et à l'équerre son axe, son sommet $S$, puis au moins six autres points de la parabole par la méthode du cercle et de la parallèle, avec trois ouvertures de compas différentes. Trace enfin la parabole.")
      : fr("On donne le foyer $F$, la directrice $d$ d'une parabole et trois points $H_1$, $H_2$, $H_3$ de $d$. Construis au compas et à l'équerre son axe, son sommet $S$, puis, par la méthode de la médiatrice, les points de la parabole qui se projettent en $H_1$, $H_2$ et $H_3$ sur $d$, ainsi que leurs symétriques par rapport à l'axe. Trace enfin la parabole.");
  return { section: { enteteFragments: consigne, enteteHtml: svgConstructionParabole(e, false), questions: [] } };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [
    { type: "html", html: svgConstructionParabole(e, true) },
    {
      type: "paragraphe",
      fragments:
        e.methode === "cercle"
          ? fr("Un point $P$ est sur la parabole si et seulement si $PF$ est égale à la distance de $P$ à $d$. Avec une ouverture $r$ plus grande que $KS$, le cercle de centre $F$ et de rayon $r$ coupe la parallèle à $d$ située à la distance $r$, du côté de $F$, en deux points de la parabole.")
          : fr("Un point $P$ est sur la parabole si et seulement si $PF = PH$, où $H$ est son projeté orthogonal sur $d$ : $P$ est à la fois sur la perpendiculaire à $d$ en $H$ et sur la médiatrice de $[FH]$."),
    },
  ];
}

function lignesCorrection(e: E): EtapeCorrection[] {
  const lignes: EtapeCorrection[] = [
    { label: "Axe", sousQuestion: "a", fragments: fr("Un côté de l'angle droit de l'équerre sur $d$, l'autre passant par $F$ : l'axe est la perpendiculaire à $d$ passant par $F$ ; il coupe $d$ en $K$.") },
    { label: "Sommet", sousQuestion: "b", fragments: fr("Même ouverture, plus grande que la moitié de $KF$ : un arc de centre $K$ et un arc de centre $F$ de chaque côté de l'axe. La droite qui joint leurs points d'intersection est la médiatrice de $[KF]$ ; elle coupe l'axe en $S$, avec $SK = SF$.") },
  ];
  if (e.methode === "cercle") {
    ["c", "d", "e"].forEach((lettre, i) => {
      lignes.push({
        label: `Couple ${i + 1}`,
        sousQuestion: lettre,
        fragments: fr(
          `Ouverture $r$${i > 0 ? " différente des précédentes" : ""}, plus grande que $KS$. Pointe en $K$ : l'arc coupe l'axe en $A$, du côté de $F$, à la distance $r$ de $d$. Équerre : la parallèle à $d$ passant par $A$. Même ouverture, pointe en $F$ : le cercle coupe la parallèle en $P$ et $P'$, avec $PF = r$ = distance de $P$ à $d$.`,
        ),
      });
    });
  } else {
    ["c", "d", "e"].forEach((lettre, i) => {
      const h = `H_${i + 1}`;
      lignes.push({
        label: `Point de H${"₁₂₃"[i]}`,
        sousQuestion: lettre,
        fragments: fr(
          `Équerre : la perpendiculaire à $d$ en $${h}$. Compas : médiatrice de $[F${h}]$ (même ouverture, plus grande que la moitié de $F${h}$). Leur intersection $P_${i + 1}$ vérifie $P_${i + 1}F = P_${i + 1}${h}$ = distance de $P_${i + 1}$ à $d$. Son symétrique par rapport à l'axe est aussi sur la parabole.`,
        ),
      });
    });
  }
  lignes.push({
    label: "Tracé",
    sousQuestion: "f",
    fragments: fr("Courbe lisse, sans angle, passant par $S$ et par les six points de proche en proche, symétrique par rapport à l'axe et ouverte du côté de $F$."),
    figureHtml: svgConstructionParabole(e, true),
  });
  return lignes;
}

function reponseBreve(e: E): FragmentConsigne[] {
  return e.methode === "cercle"
    ? fr("Axe : perpendiculaire à $d$ par $F$ ; $S$ milieu de $[KF]$ ; trois couples de points obtenus avec trois ouvertures différentes ; parabole tracée (voir la figure du corrigé).")
    : fr("Axe : perpendiculaire à $d$ par $F$ ; $S$ milieu de $[KF]$ ; trois points sur les perpendiculaires en $H_1$, $H_2$, $H_3$ et sur les médiatrices, et leurs symétriques ; parabole tracée (voir la figure du corrigé).");
}

function bareme(e: E): BaremeExercice {
  const criteres =
    e.methode === "cercle"
      ? ["Premier couple : arc de centre K, parallèle à d, cercle de centre F de même ouverture", "Deuxième couple (autre ouverture)", "Troisième couple (autre ouverture)"]
      : ["Point de H₁ : perpendiculaire en H₁, médiatrice de [FH₁], symétrique", "Point de H₂ et son symétrique", "Point de H₃ et son symétrique"];
  const erreurs =
    e.methode === "cercle"
      ? [
          { description: fr("Distance reportée depuis $F$ au lieu de la directrice (arc de centre $F$ pour placer la parallèle)"), cout: "0 pt sur le couple" },
          { description: fr("Parallèle tracée du côté de $d$ opposé à $F$"), cout: "0 pt sur le couple" },
          { description: fr("Ouverture changée entre l'arc de centre $K$ et le cercle de centre $F$"), cout: "0 pt sur le couple" },
          { description: fr("Ouverture inférieure à $KS$ : aucun point obtenu"), cout: "0 pt sur le couple" },
        ]
      : [
          { description: fr("Perpendiculaire qui ne passe pas par le point $H$ donné"), cout: "0 pt sur le point" },
          { description: fr("Arcs de la médiatrice tracés avec deux ouvertures différentes"), cout: "0 pt sur le point" },
          { description: fr("Symétrique par rapport à l'axe oublié"), cout: "moitié des points du point" },
        ];
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: fr("Axe : perpendiculaire à $d$ passant par $F$, tracée à l'équerre"), points: 0.5 },
      { sousQuestion: "b", critere: fr("Sommet $S$ construit comme milieu de $[KF]$ (médiatrice au compas)"), points: 0.5 },
      { sousQuestion: "c", critere: [{ type: "texte", valeur: criteres[0]! }], points: 0.75 },
      { sousQuestion: "d", critere: [{ type: "texte", valeur: criteres[1]! }], points: 0.75 },
      { sousQuestion: "e", critere: [{ type: "texte", valeur: criteres[2]! }], points: 0.75 },
      { sousQuestion: "f", critere: fr("Courbe lisse par $S$ et les six points, symétrique par rapport à l'axe"), points: 0.75 },
    ],
    erreursFrequentes: [...erreurs, { description: fr("Points reliés par des segments, ou pointe anguleuse au sommet"), cout: "moitié des points du tracé" }],
    reponsesAcceptees:
      e.methode === "cercle"
        ? [fr("Toutes ouvertures distinctes plus grandes que $KS$ (les points obtenus diffèrent du corrigé)")]
        : [fr("Toute ouverture de compas plus grande que la moitié du segment pour chaque médiatrice")],
  };
}

function difficulte(e: E): 1 | 2 | 3 {
  return e.methode === "cercle" ? 2 : 3;
}

function profilInstance(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.methode };
}

export const adaptateurEvaluationConstructionParabole: AdaptateurFeuilleExercices<E> = {
  profilInstance,
  titreDocument: "Construction de la parabole au compas et à l'équerre — Évaluation",
  nomFichierBase: "construction-parabole",
  genererInstance: genererExerciceConstructionParabole,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee: lignesCorrection,
  bareme,
  enoncePapier,
  dureeMinutes: 15,
};
