import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceAireExcentriciteConique } from "../../core6e/aireExcentriciteConique.types";
import type { PhaseAireExcentriciteConique } from "../../moteur6e/typesAireExcentriciteConique";
import { phasesPourExercice } from "../../moteur6e/typesAireExcentriciteConique";
import { estCarreParfait, latexQ, latexRacine } from "../../moteur6e/algebreLieux";
import { FORMAT_6GEN60 } from "../../ui6e/formatAireExcentriciteConique";
import { fx } from "../../ui6e/corrigeCombinatoire";
import { formatPapier } from "../../ui6e/corrigeLieux";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { conditionB, correctionDetailleeAireExcentriciteConique } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAireExcentriciteConique } from "./index";

/**
 * Adaptateur papier de `6gen60` (aire du triangle focal, excentricité, 6e ch. 10, § 2–3, processus 3
 * TRANSFÉRER) — refonte du lot E de l'audit, sur l'adaptateur commun du ch. 7. Énoncés TIRÉS (lots B et C) ;
 * énoncé papier en prose complète, UNE consigne sans méthode (plus de « utilise |PF| + |PF′| = 2a », de
 * « traduis par une relation entre a, b, c ») ; valeurs exactes (aire et excentricité en racines
 * simplifiées). Le cosinus de l'angle est une étape du corrigé, pas une question.
 *
 * Profil : `forme` = A ou B-sous-type ; cas particuliers `angleDroit` (A : cos θ = 0, sin θ = 1) et
 * `excentriciteRationnelle` (B : e² carré parfait, aucune racine — dont « k carré parfait » des
 * directrices). Aucun `calcul` (traduire une condition, composer loi des cosinus et aire : la calculatrice
 * ne le fait pas, règle du 24/11) ; décimales acceptées quand elle est autorisée (barème).
 */

type E = ExerciceAireExcentriciteConique;
type F = FragmentConsigne[];

const BASE = "Une ellipse d'équation $\\dfrac{x^2}{a^2}+\\dfrac{y^2}{b^2}=1$ $(a>b>0)$ a pour foyers $F(c\\,;0)$ et $F'(-c\\,;0)$.";

export function situationPapier60(e: E): F {
  if (e.famille === "A") return fx(`On donne l'ellipse $\\dfrac{x^2}{${e.a * e.a}}+\\dfrac{y^2}{${e.b * e.b}}=1$, de foyers $F$ et $F'$, et un point $P$ de cette ellipse tel que $|PF|=${latexQ(e.k)}\\,|PF'|$.`);
  if (e.sousType === "abscisseFoyerParallele") return fx(`${BASE} Le point $P$ de l'ellipse, d'ordonnée positive, a la même abscisse que $F$, et ${conditionB(e)}.`);
  if (e.sousType === "angleSommetNonFocal") return fx(`${BASE} Le point $B(0\\,;b)$ est un sommet de l'axe non focal, et ${conditionB(e)}.`);
  return fx(`${BASE} On sait que ${conditionB(e)}.`);
}

export function consignePapier60(e: E): string {
  if (e.famille === "A") return "Détermine les rayons focaux $|PF|$ et $|PF'|$, puis l'aire du triangle $FPF'$. Donne des valeurs exactes.";
  return "Détermine l'excentricité $e$ de cette ellipse. Donne sa valeur exacte.";
}

function reponseBreve(e: E): F {
  if (e.famille === "A") return fx(`$|PF|=${latexQ(e.pf)}$, $|PF'|=${latexQ(e.pfp)}$ ; aire du triangle $FPF'$ : $${latexRacine(e.aire2)}$.`);
  return fx(`$e=${latexRacine(e.e2)}$.`);
}

function bareme(e: E): BaremeExercice {
  const l = lettresEcrans(phasesPourExercice, e);
  const c = (i: number, critere: string, points: number) => ({ sousQuestion: l[i], critere: fx(critere), points });
  const decimales = fx("Si la calculatrice est autorisée, la valeur décimale arrondie au centième est acceptée.");
  if (e.famille === "A")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [c(0, `Rayons focaux par $|PF|+|PF'|=2a$ : $|PF|=${latexQ(e.pf)}$, $|PF'|=${latexQ(e.pfp)}$`, 1.5), c(1, `$\\cos\\theta=${latexQ(e.cos)}$ par la loi des cosinus ($|FF'|^2=4c^2$)`, 1.25), c(2, `Aire $${latexRacine(e.aire2)}$ (sinus positif, facteur $\\frac{1}{2}$)`, 1.25)],
      erreursFrequentes: [
        { description: fx("$|PF'|=2a$ ou $|PF|=a$ (la somme des deux rayons vaut $2a$)"), cout: "0 pt sur l'étape 1 ; la suite est corrigée avec les valeurs de l'élève" },
        { description: fx("$|FF'|=c$ au lieu de $2c$ dans la loi des cosinus"), cout: "0,5 pt sur l'étape 2" },
        { description: fx("Facteur $\\frac{1}{2}$ oublié dans l'aire"), cout: "0,5 pt sur l'étape 3" },
      ],
      reponsesAcceptees: [fx("L'aire par $b^2\\tan\\frac{\\theta}{2}$ ou par la hauteur issue de $P$ ; racines simplifiées ou non"), decimales],
    };
  return {
    reponseFinale: reponseBreve(e),
    criteres: [c(0, "Condition traduite par une relation juste entre $a$, $b$, $c$ (ou $e$)", 2), c(1, `Excentricité $e=${latexRacine(e.e2)}$ ($b^2=a^2-c^2$, $e=\\frac{c}{a}$)`, 2)],
    erreursFrequentes: [{ description: fx("$e^2$ donné pour $e$"), cout: "0,5 pt sur l'étape 2" }, { description: fx("Relation toujours vraie (ne traduit pas la condition)"), cout: "0 pt sur l'étape 1" }],
    reponsesAcceptees: [fx("Toute relation équivalente (en $a$, $b$, $c$ ou en $e$) ; $e$ écrit $\\frac{1}{\\sqrt{k}}$ ou $\\frac{\\sqrt{k}}{k}$"), decimales],
  };
}

function criteres(e: E): CriteresDifficulte {
  if (e.famille === "A") return { ...etapesDuCorrige(correctionDetailleeAireExcentriciteConique(e), []), methode: 1, piege: 0, nombres: 0 };
  // B : l'élève construit la relation à partir d'une condition géométrique (méthode 2).
  return { etapesTransformation: 2, etapesLecture: 0, methode: 2, piege: 0, nombres: 0, sansCharge: true };
}

export function profilAireExcentriciteConique(e: E): ProfilInstance {
  if (e.famille === "A") return { casParticulier: e.cos.n === 0n ? "angleDroit" : null, forme: "A" };
  return { casParticulier: estCarreParfait(e.e2) ? "excentriciteRationnelle" : null, forme: `B-${e.sousType}` };
}

export const adaptateurEvaluationAireExcentriciteConique: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseAireExcentriciteConique>({
  titreDocument: "Aire focale et excentricité — Évaluation",
  nomFichierBase: "aire-excentricite-conique",
  genererInstance: genererExerciceAireExcentriciteConique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: formatPapier(FORMAT_6GEN60),
  phases: phasesPourExercice,
  situation: situationPapier60,
  questions: (e) => [{ consigne: fx(consignePapier60(e)), etapes: lettresEcrans(phasesPourExercice, e) }],
  reponseBreve,
  correction: correctionDetailleeAireExcentriciteConique,
  bareme,
  criteres,
  profil: profilAireExcentriciteConique,
  libelleCasParticulier: "Inclure un cas particulier (angle droit en P ; excentricité rationnelle)",
});
