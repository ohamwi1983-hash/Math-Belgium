import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceTangentesConique } from "../../core6e/tangentesConique.types";
import type { PhaseTangentesConique } from "../../moteur6e/typesTangentesConique";
import { phasesPourExercice } from "../../moteur6e/typesTangentesConique";
import { latexDroite, latexPoint, latexQ, qMul, qNeg, qSub } from "../../moteur6e/algebreLieux";
import { latexConique, racineQ } from "../../moteur6e/algebreConiques";
import type { Conique } from "../../moteur6e/algebreConiques";
import { FORMAT_6GEN62 } from "../../ui6e/formatTangentesConique";
import { fx } from "../../ui6e/corrigeCombinatoire";
import { formatPapier } from "../../ui6e/corrigeLieux";
import { yMK } from "../../ui6e/corrigeConiques";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { contactsE, correctionDetailleeTangentesConique } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, GROUPES_VERDICT_6GEN62, construireAvecVarianteId, genererExerciceTangentesConique } from "./index";

/**
 * Adaptateur papier de `6gen62` (tangentes à une conique, 6e ch. 10, § 5, processus 2 APPLIQUER) —
 * refonte du lot E de l'audit, sur l'adaptateur commun du ch. 7. Énoncé papier = les données
 * (« On donne … », valeurs exactes en fractions) + UNE consigne sans méthode (plus de « par la dérivée
 * ou par la forme dédoublée », de « condition de tangence », de « P est à l'intérieur ») : B « s'il y en
 * a », C « s'il y en a », E « qui ne coupe pas Γ ». Les écrans deviennent les étapes du corrigé (pente,
 * condition sur k, équation en m, système en α et β…), qui donne toujours l'équation des tangentes et la
 * FIGURE (conique, droite donnée, tangentes, points de contact).
 *
 * Profil : `forme` = famille (A : nature de la conique ; D : nature et axe focal) ; aucun cas particulier
 * (aucun raccourci) ; le nombre de tangentes (B) et la position de P (C) sont des verdicts — groupes à
 * verdict, critères FIXES (niveau et durée identiques dans les deux issues). Aucun `calcul` (règle du
 * 24/11 : établir une tangente n'est pas donné par la calculatrice) ; décimales acceptées quand la
 * calculatrice est autorisée (décision 2, barème).
 */

type E = ExerciceTangentesConique;
type F = FragmentConsigne[];

const NOM: Record<Conique["type"], string> = { ellipse: "l'ellipse", hyperbole: "l'hyperbole", parabole: "la parabole", cercle: "le cercle" };

function formeD(e: Extract<E, { famille: "D" }>): string {
  if (e.conique.type === "ellipse") return "\\dfrac{x^2}{\\alpha}+\\dfrac{y^2}{\\beta}=1";
  return e.conique.axe === "x" ? "\\dfrac{x^2}{\\alpha}-\\dfrac{y^2}{\\beta}=1" : "\\dfrac{y^2}{\\beta}-\\dfrac{x^2}{\\alpha}=1";
}

export function situationPapier62(e: E): F {
  const gamma = `$\\Gamma\\,:\\ ${latexConique(e.conique)}$`;
  switch (e.famille) {
    case "A":
      return fx(`On donne ${NOM[e.conique.type]} ${gamma} et son point $P${latexPoint(e.P)}$.`);
    case "B":
      return fx(`On donne l'hyperbole ${gamma} et la droite $d\\,:\\ ${yMK(e.d.m, e.d.k)}$.`);
    case "C":
      return fx(`On donne l'ellipse ${gamma} et le point $P${latexPoint(e.P)}$.`);
    case "D":
      return fx(`On donne le point $P${latexPoint(e.P)}$ et la droite $d\\,:\\ ${yMK(e.d.m, e.d.k)}$.`);
    case "E":
      return fx(`On donne ${NOM[e.conique.type]} ${gamma} et la droite $d\\,:\\ ${yMK(e.d.m, e.d.k)}$, qui ne coupe pas $\\Gamma$.`);
  }
}

export function consignePapier62(e: E): string {
  switch (e.famille) {
    case "A":
      return "Détermine une équation de la tangente à $\\Gamma$ au point $P$.";
    case "B":
      return "Détermine les tangentes à $\\Gamma$ parallèles à $d$, s'il y en a.";
    case "C":
      return "Détermine les tangentes à $\\Gamma$ qui passent par $P$, s'il y en a.";
    case "D":
      return `Détermine ${e.conique.type === "ellipse" ? "l'ellipse" : "l'hyperbole"} d'équation $${formeD(e)}$ $(\\alpha>0,\\ \\beta>0)$ qui passe par $P$ et qui est tangente à $d$.`;
    case "E":
      return "Détermine le point de $\\Gamma$ le plus proche de $d$.";
  }
}

function reponseBreve(e: E): F {
  switch (e.famille) {
    case "A":
      return fx(`$${yMK(e.pente, qSub(e.P.y, qMul(e.pente, e.P.x)))}$ (soit $${latexDroite(e.tangente)}$).`);
    case "B": {
      if (e.verdict === 0) return fx("Aucune tangente à $\\Gamma$ n'est parallèle à $d$.");
      const K = racineQ(e.k2);
      return fx(`Deux tangentes : $${yMK(e.d.m, K)}$ et $${yMK(e.d.m, qNeg(K))}$.`);
    }
    case "C":
      if (e.verdict === 0) return fx("Aucune tangente ne passe par $P$ ($P$ est à l'intérieur de l'ellipse).");
      return fx(`Deux tangentes : $${yMK(e.tangentes[0].m, e.tangentes[0].k)}$ et $${yMK(e.tangentes[1].m, e.tangentes[1].k)}$.`);
    case "D":
      return fx(`$${latexConique(e.conique)}$.`);
    case "E": {
      const { T, proche } = contactsE(e);
      return fx(`Le point $${latexPoint(T[proche])}$.`);
    }
  }
}

const DECIMALES = fx("Si la calculatrice est autorisée, les valeurs décimales exactes ou arrondies au centième sont acceptées.");

function bareme(e: E): BaremeExercice {
  const l = lettresEcrans(phasesPourExercice, e);
  const c = (i: number, critere: string, points: number) => ({ sousQuestion: l[i], critere: fx(critere), points });
  const formes = fx("Équation d'une droite sous toute forme équivalente ($y=mx+k$, $ax+by+c=0$, forme dédoublée non simplifiée) ; les tangentes dans un ordre quelconque ; toute méthode exacte (dérivée, forme dédoublée, discriminant nul)");
  switch (e.famille) {
    case "A":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [c(0, `Pente de la tangente en $P$ : $m=${latexQ(e.pente)}$`, 1.5), c(1, `Équation de la tangente : $${yMK(e.pente, qSub(e.P.y, qMul(e.pente, e.P.x)))}$`, 2.5)],
        erreursFrequentes: [
          { description: fx("Pente de signe opposé (mauvaise branche dérivée)"), cout: "0 pt sur l'étape 1 ; l'étape 2 est corrigée avec la pente de l'élève" },
          ...(e.conique.type === "parabole" ? [{ description: fx("Tangente $y\\,y_P=2p(x+x_P)$ au lieu de $p(x+x_P)$"), cout: "1 pt sur l'étape 2" }] : []),
        ],
        reponsesAcceptees: [formes, DECIMALES],
      };
    case "B":
      if (e.verdict === 0)
        return {
          reponseFinale: reponseBreve(e),
          criteres: [c(0, `Condition de tangence : $k^2=${latexQ(e.k2)}$`, 2), c(1, "Conclusion justifiée : $k^2<0$, aucune tangente", 2)],
          erreursFrequentes: [{ description: fx("Condition de l'ellipse ($+b^2$) ou de l'autre axe focal utilisée"), cout: "0 pt sur l'étape 1" }, { description: fx("$k^2<0$ pris pour une erreur de calcul, sans conclusion"), cout: "0 pt sur l'étape 2" }],
          reponsesAcceptees: [fx("La conclusion par une équation en $x$ dont le discriminant ne s'annule jamais ; la comparaison de la pente de $d$ à celle des asymptotes, justifiée")],
        };
      return {
        reponseFinale: reponseBreve(e),
        criteres: [c(0, "Condition de tangence sur $k$", 1.5), c(1, "Deux valeurs de $k$ (car $k^2>0$)", 1), c(2, "Les deux tangentes", 1.5)],
        erreursFrequentes: [{ description: fx("Condition de l'ellipse ($+b^2$) ou de l'autre axe focal utilisée"), cout: "0 pt sur l'étape 1" }, { description: fx("Une seule tangente donnée ($k$ positif seulement)"), cout: "0,5 pt sur l'étape 3" }],
        reponsesAcceptees: [formes, DECIMALES],
      };
    case "C":
      if (e.verdict === 0)
        return {
          reponseFinale: reponseBreve(e),
          criteres: [c(0, "Équation en $m$ (condition de tangence avec $k=y_P-m\\,x_P$)", 2), c(1, "Discriminant négatif : aucune tangente, conclusion justifiée", 2)],
          erreursFrequentes: [{ description: fx("$\\Delta<0$ pris pour une erreur de calcul"), cout: "0 pt sur l'étape 2" }],
          reponsesAcceptees: [fx("La conclusion « $P$ est à l'intérieur de l'ellipse », justifiée par $\\frac{x_P^2}{a^2}+\\frac{y_P^2}{b^2}<1$ ; toute équation en $m$ proportionnelle")],
        };
      return {
        reponseFinale: reponseBreve(e),
        criteres: [c(0, "Équation en $m$ (condition de tangence avec $k=y_P-m\\,x_P$)", 1.5), c(1, "Discriminant positif : deux tangentes", 1), c(2, "Les deux tangentes", 1.5)],
        erreursFrequentes: [{ description: fx("$k=y_P+m\\,x_P$ (signe)"), cout: "1 pt sur l'étape 1" }, { description: fx("Une seule tangente donnée"), cout: "0,5 pt sur l'étape 3" }],
        reponsesAcceptees: [formes, fx("Toute équation en $m$ proportionnelle"), DECIMALES],
      };
    case "D":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [c(0, "Système en $\\alpha$ et $\\beta$ ($P$ sur la conique, $d$ tangente)", 1.5), c(0, "Résolution et choix de la solution avec $\\alpha>0$ et $\\beta>0$", 1.5), c(1, `Équation : $${latexConique(e.conique)}$`, 1)],
        erreursFrequentes: [{ description: fx("Condition de tangence de l'ellipse utilisée pour une hyperbole (ou l'inverse)"), cout: "0 pt sur la résolution" }, { description: fx("Solution avec un dénominateur négatif gardée"), cout: "1 pt sur la résolution" }],
        reponsesAcceptees: [fx("Toute équation proportionnelle (dénominateurs chassés) ; une méthode par le discriminant de l'équation en $x$")],
      };
    case "E":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [c(0, "Tangentes parallèles à $d$ et leurs deux points de contact", 2.5), c(1, "Comparaison des distances à $d$ et point le plus proche", 1.5)],
        erreursFrequentes: [{ description: fx("Point de contact de la mauvaise tangente gardé (valeurs absolues oubliées)"), cout: "1 pt sur l'étape 2" }],
        reponsesAcceptees: [fx("La comparaison des distances des deux points à $d$ (formule de la distance d'un point à une droite)"), DECIMALES],
      };
  }
}

function criteres(e: E): CriteresDifficulte {
  // B et C : l'issue (deux tangentes ou aucune) est le verdict — critères FIXES (trois étapes sans
  // charge, piège 1 : une issue « aucune » possible) pour que niveau et durée ne la trahissent pas.
  if (e.famille === "B" || e.famille === "C") return { etapesTransformation: 3, etapesLecture: 0, methode: 1, piege: 1, nombres: 0, sansCharge: true };
  const base = etapesDuCorrige(correctionDetailleeTangentesConique(e), []);
  return { ...base, methode: 1, piege: e.famille === "D" ? 1 : 0, nombres: 0 };
}

export function profilTangentesConique(e: E): ProfilInstance {
  if (e.famille === "A") return { casParticulier: null, forme: `A-${e.conique.type}` };
  if (e.famille === "D") return { casParticulier: null, forme: `D-${e.conique.type}${e.conique.type === "hyperbole" ? `-${e.conique.axe}` : ""}` };
  return { casParticulier: null, forme: e.famille };
}

export const adaptateurEvaluationTangentesConique: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseTangentesConique>({
  titreDocument: "Tangentes à une conique — Évaluation",
  nomFichierBase: "tangentes-conique",
  genererInstance: genererExerciceTangentesConique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: formatPapier(FORMAT_6GEN62),
  phases: phasesPourExercice,
  situation: situationPapier62,
  questions: (e) => [{ consigne: fx(consignePapier62(e)), etapes: lettresEcrans(phasesPourExercice, e) }],
  reponseBreve,
  correction: correctionDetailleeTangentesConique,
  bareme,
  criteres,
  profil: profilTangentesConique,
  groupesVerdict: GROUPES_VERDICT_6GEN62,
});
