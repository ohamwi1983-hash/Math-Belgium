import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceIntersectionsConiques } from "../../core6e/intersectionsConiques.types";
import type { PhaseIntersectionsConiques } from "../../moteur6e/typesIntersectionsConiques";
import { phasesPourExercice } from "../../moteur6e/typesIntersectionsConiques";
import { latexPoint, latexSomme, q, qAdd, qMul, qNum } from "../../moteur6e/algebreLieux";
import { latexConique } from "../../moteur6e/algebreConiques";
import { polyCercleB } from "../../moteur6e/verificationIntersectionsConiques";
import { FORMAT_6GEN61 } from "../../ui6e/formatIntersectionsConiques";
import { fx } from "../../ui6e/corrigeCombinatoire";
import { formatPapier } from "../../ui6e/corrigeLieux";
import { racinesRationnelles, yMK } from "../../ui6e/corrigeConiques";
import { eqPoly } from "../../ui6e/textesConiques";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { correctionDetailleeIntersectionsConiques } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, GROUPES_VERDICT_6GEN61, construireAvecVarianteId, genererExerciceIntersectionsConiques } from "./index";

/**
 * Adaptateur papier de `6gen61` (intersection d'une conique et d'une droite, 6e ch. 10, § 4, processus 2
 * APPLIQUER) — refonte du lot E de l'audit, sur l'adaptateur commun du ch. 7. Énoncé papier en PROSE
 * (formules courtes en ligne : plus de données coupées à 680 px, audit E11) : la conique est donnée par
 * son centre, ses axes, un sommet et un foyer SANS sa nature (l'élève décide ellipse ou hyperbole, audit
 * I2), le cercle par un de ses points ; la droite par deux points, une médiatrice ou une hauteur ; UNE
 * consigne « … s'il y en a » (le nombre de points communs est le verdict). Famille B : la consigne dit
 * ce qu'il faut montrer, sans la combinaison λC₁ + μC₂. Les écrans deviennent les étapes du corrigé.
 *
 * Profil : `forme` = famille, cercle ou conique, et sous-type de droite (jamais le nombre de points) ;
 * cas particulier `droiteHorizontale` (m = 0 : substitution immédiate). Nombre de points = verdict :
 * groupes à verdict, critères FIXES (A : quatre étapes sans charge, niveau et durée identiques pour
 * 0, 1 ou 2 points). Aucun `calcul` (établir la conique et la droite d'abord, règle du 24/11).
 */

type E = ExerciceIntersectionsConiques;
type F = FragmentConsigne[];

const lp = latexPoint;

export function situationPapier61(e: E): F {
  if (e.famille === "B") {
    const c1 = `y=${latexSomme([
      [q(1), "x^2"],
      [q(e.b1), "x"],
      [q(e.c1), ""],
    ])}`;
    const c2 = `${latexSomme([
      [q(e.A2), "x^2"],
      [q(e.B2), "y^2"],
      [q(e.D2), "x"],
      [q(e.E2), "y"],
      [q(e.F2), ""],
    ])}=0`;
    return fx(`On donne la parabole $C_1\\,:\\ ${c1}$ et l'ellipse $C_2\\,:\\ ${c2}$, qui ont plusieurs points communs.`);
  }
  const conique = e.nature === "cercle" ? `$\\Gamma$ est le cercle de centre $O$ qui passe par $S${lp(e.S)}$.` : `$\\Gamma$ est la conique de centre $O$, dont les axes de symétrie sont les axes du repère, qui a pour sommet $S${lp(e.S)}$ et pour foyer $F${lp(e.F!)}$.`;
  const droite = e.sousTypeDroite === "deuxPoints" ? `$d$ est la droite $(AB)$, avec $A${lp(e.A)}$ et $B${lp(e.B)}$.` : e.sousTypeDroite === "mediatrice" ? `$d$ est la médiatrice du segment $[AB]$, avec $A${lp(e.A)}$ et $B${lp(e.B)}$.` : `$d$ est la hauteur issue de $C$ du triangle $ABC$, avec $A${lp(e.A)}$, $B${lp(e.B)}$ et $C${lp(e.C!)}$.`;
  return fx(`${conique} ${droite}`);
}

export function consignePapier61(e: E): string {
  if (e.famille === "B") return "Montre, sans résoudre le système, que les points communs à $C_1$ et $C_2$ sont sur un même cercle, dont tu donneras une équation, le centre et le rayon.";
  return "Détermine les points communs à $\\Gamma$ et à $d$, s'il y en a. Donne des valeurs exactes.";
}

function pointsCommuns(e: Extract<E, { famille: "A" }>) {
  return racinesRationnelles(e.eq).map((x) => ({ x, y: qAdd(qMul(e.m, x), e.k) }));
}

function reponseBreve(e: E): F {
  if (e.famille === "B") return fx(`Le cercle $${eqPoly(polyCercleB(e))}$ : centre $\\Omega${lp(e.centre)}$, rayon $${e.rayon}$ (avec $\\lambda=${e.lambda}$, $\\mu=1$).`);
  const pts = pointsCommuns(e);
  const g = `$\\Gamma\\,:\\ ${latexConique(e.conique)}$, $d\\,:\\ ${yMK(e.m, e.k)}$ ; `;
  if (e.verdict === 0) return fx(`${g}aucun point commun.`);
  if (e.verdict === 1) return fx(`${g}un seul point commun (tangence) : $${lp(pts[0])}$.`);
  return fx(`${g}deux points communs : $${lp(pts[0])}$ et $${lp(pts[1])}$.`);
}

function bareme(e: E): BaremeExercice {
  const l = lettresEcrans(phasesPourExercice, e);
  const c = (i: number, critere: string, points: number) => ({ sousQuestion: l[i], critere: fx(critere), points });
  if (e.famille === "B")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [c(0, `Combinaison qui égalise les coefficients de $x^2$ et $y^2$ : $\\lambda=${e.lambda}\\mu$, justifiée`, 1.5), c(1, "Équation du cercle développée et réduite", 1.5), c(2, `Centre $\\Omega${lp(e.centre)}$ et rayon $${e.rayon}$`, 1)],
      erreursFrequentes: [{ description: fx("Système résolu sans montrer la propriété (points calculés un à un)"), cout: "1 pt sur l'étape 1 si la conclusion n'est pas justifiée" }, { description: fx("$r^2$ donné comme rayon"), cout: "0,5 pt sur l'étape 3" }],
      reponsesAcceptees: [fx("Tout couple $(\\lambda\\,;\\mu)$ proportionnel ; l'équation du cercle sous forme développée ou centre-rayon")],
    };
  const nb = e.verdict;
  const pts = [c(4, "Points communs exacts, vérifiés", 1)];
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      c(0, `Équation de $\\Gamma$ : $${latexConique(e.conique)}$`, nb === 0 ? 1.25 : 1),
      c(1, `Équation de $d$ : $${yMK(e.m, e.k)}$`, nb === 0 ? 1 : 0.75),
      c(2, "Équation du second degré en $x$ après substitution", nb === 0 ? 1 : 0.75),
      c(3, nb === 0 ? "$\\Delta<0$ : aucun point commun, conclusion justifiée" : nb === 1 ? "$\\Delta=0$ : un seul point commun (tangence)" : "$\\Delta>0$ : deux points communs", nb === 0 ? 0.75 : 0.5),
      ...(nb === 0 ? [] : pts),
    ],
    erreursFrequentes: [
      { description: fx("$a^2$ et $b^2$ échangés, ou nature fausse (comparer $c$ et $a$)"), cout: "0 pt sur l'étape 1 ; la suite est corrigée avec l'équation de l'élève" },
      { description: fx("Médiatrice ou hauteur prise avec un vecteur directeur au lieu d'un vecteur normal"), cout: "0 pt sur l'étape 2" },
      ...(nb === 1 ? [{ description: fx("$\\Delta=0$ lu « aucun point »"), cout: "0 pt sur les étapes 4 et 5" }] : []),
    ],
    reponsesAcceptees: [fx("Toute équation proportionnelle (équation de $\\Gamma$, de $d$, équation en $x$ : le signe de $\\Delta$ n'en dépend pas) ; points dans un ordre quelconque ; résolution par $y$ si la droite s'y prête"), fx("Si la calculatrice est autorisée, les valeurs décimales exactes sont acceptées.")],
  };
}

function criteres(e: E): CriteresDifficulte {
  if (e.famille === "B") return { etapesTransformation: 3, etapesLecture: 0, methode: 2, piege: 0, nombres: 0 };
  // Le nombre de points communs est le verdict : critères FIXES (le verdict « aucun » a un écran de moins).
  return { etapesTransformation: 4, etapesLecture: 0, methode: 1, piege: 1, nombres: 0, sansCharge: true };
}

export function profilIntersectionsConiques(e: E): ProfilInstance {
  if (e.famille === "B") return { casParticulier: null, forme: "B" };
  const forme = `A-${e.nature === "cercle" ? "cercle" : "conique"}-${e.sousTypeDroite}`;
  return { casParticulier: qNum(e.m) === 0 ? "droiteHorizontale" : null, forme };
}

export const adaptateurEvaluationIntersectionsConiques: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseIntersectionsConiques>({
  titreDocument: "Intersection d'une conique et d'une droite — Évaluation",
  nomFichierBase: "intersections-coniques",
  genererInstance: genererExerciceIntersectionsConiques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: formatPapier(FORMAT_6GEN61),
  phases: phasesPourExercice,
  situation: situationPapier61,
  questions: (e) => [{ consigne: fx(consignePapier61(e)), etapes: lettresEcrans(phasesPourExercice, e) }],
  reponseBreve,
  correction: correctionDetailleeIntersectionsConiques,
  bareme,
  criteres,
  profil: profilIntersectionsConiques,
  libelleCasParticulier: "Inclure un cas particulier (droite parallèle à l'axe des abscisses)",
  groupesVerdict: GROUPES_VERDICT_6GEN61,
});
