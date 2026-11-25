import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExercicePointsDroitesRemarquablesTriangle } from "../../core6e/pointsDroitesRemarquablesTriangle.types";
import type { PhasePointsDroitesRemarquablesTriangle } from "../../moteur6e/typesPointsDroitesRemarquablesTriangle";
import { phasesPourExercice } from "../../moteur6e/typesPointsDroitesRemarquablesTriangle";
import { latexQ } from "../../moteur6e/algebreLieux";
import type { Q } from "../../moteur6e/algebreLieux";
import { FORMAT_6GEN54 } from "../../ui6e/formatPointsDroitesRemarquablesTriangle";
import { fx } from "../../ui6e/corrigeCombinatoire";
import { formatPapier, ld, lp, nomPt } from "../../ui6e/corrigeLieux";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { correctionDetailleePointsDroites } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePointsDroitesRemarquablesTriangle } from "./index";

/**
 * Adaptateur papier de `6gen54` (constructions analytiques dans le triangle, 6e ch. 9, § 1, processus 2
 * APPLIQUER) — refonte du lot E de l'audit : énoncé papier = données en prose (« On donne … ») + UNE
 * consigne sans méthode ni formule (plus de « via I = (BC·A + AB·C)/(AB + BC) ») ; C donne le
 * paramétrage C(t) de d (audit E3) ; E « Détermine toutes les droites… » (le nombre — 2, 1 ou une
 * infinité — est à trouver, plus de propositions absentes, audit E4) ; H : la source, le miroir et le
 * point d'incidence (plus de « deux points Ad et Bd », audit E12). Les écrans deviennent les étapes du
 * corrigé, figure sous le dernier résultat ; G : les deux orientations du carré acceptées (audit I6).
 *
 * Profil : `forme` = famille (G : sous-type) ; cas particulier `droiteAxe` ((AB), d ou le miroir
 * parallèle à un axe : perpendiculaire immédiate) en C, F et H — le triangle isocèle en B n'est jamais
 * tiré (I serait le milieu, le piège du théorème de la bissectrice tomberait). E : le nombre de droites
 * est un VERDICT (niveau et durée constants, jamais dans le profil). Aucun `calcul` (règle du 24/11).
 */

type E = ExercicePointsDroitesRemarquablesTriangle;
type F = FragmentConsigne[];

function paramLatex(x0: Q, u: number): string {
  const base = latexQ(x0);
  if (u === 0) return base;
  const terme = u === 1 ? "t" : u === -1 ? "-t" : `${u}t`;
  if (x0.n === 0n) return terme;
  return `${base}${u > 0 ? "+" : ""}${terme}`;
}

export function situationPapier54(e: E): F {
  switch (e.famille) {
    case "A":
      return fx(`On donne $${nomPt("A'", e.Ap)}$, $${nomPt("B'", e.Bp)}$ et $${nomPt("C'", e.Cp)}$, milieux respectifs des côtés $[BC]$, $[CA]$ et $[AB]$ d'un triangle $ABC$.`);
    case "B":
      return fx(`On donne le triangle $ABC$ : $${nomPt("A", e.A)}$, $${nomPt("B", e.B)}$, $${nomPt("C", e.C)}$.`);
    case "C":
      return fx(`On donne $${nomPt("A", e.A)}$, $${nomPt("B", e.B)}$, $k=${e.k}$ et la droite $d\\,:\\ ${ld(e.d)}$, paramétrée par $C(t)=\\left(${paramLatex(e.P0.x, e.u.x)}\\,;${paramLatex(e.P0.y, e.u.y)}\\right)$, $t\\in\\mathbb{R}$.`);
    case "D":
      return fx(`Dans le triangle $ABC$, on donne $${nomPt("A", e.A)}$, la médiane issue de $B$ : $${ld(e.medianeB)}$, et la médiane issue de $C$ : $${ld(e.medianeC)}$.`);
    case "E":
      return fx(`On donne les points $${nomPt("P", e.P)}$, $${nomPt("A", e.A)}$ et $${nomPt("B", e.B)}$.`);
    case "F":
      return fx(`On donne les points $${nomPt("A", e.A)}$, $${nomPt("B", e.B)}$ et $${nomPt("P", e.P)}$.`);
    case "G":
      return e.sousType === "sommetDiagonale"
        ? fx(`Un massif carré $ABCD$ est dessiné sur un plan (unité : 1 m). On connaît le sommet $${nomPt("A", e.A)}$ et la diagonale $(BD)\\,:\\ ${ld(e.droiteBD)}$.`)
        : fx(`Une dalle carrée $ABCD$ est dessinée sur un plan (unité : 1 dm). On connaît son centre $${nomPt("P", e.P)}$ et la droite $(AB)\\,:\\ ${ld(e.droiteAB)}$, qui porte un de ses côtés.`);
    case "H":
      return e.contexte === "miroir"
        ? fx(`Un rayon lumineux issu de la source $${nomPt("P", e.P)}$ frappe un miroir plan, représenté par la droite $d\\,:\\ ${ld(e.d)}$, au point $${nomPt("M", e.M)}$.`)
        : fx(`Une boule de billard part de $${nomPt("P", e.P)}$ et rebondit sur la bande $d\\,:\\ ${ld(e.d)}$ au point $${nomPt("M", e.M)}$ ; sans effet, elle rebondit comme un rayon lumineux sur un miroir.`);
  }
}

export function consignePapier54(e: E): string {
  switch (e.famille) {
    case "A":
      return "Détermine les coordonnées des sommets $A$, $B$ et $C$.";
    case "B":
      return "La bissectrice de l'angle $\\widehat{ABC}$ coupe $[AC]$ en $I$. Détermine les coordonnées de $I$.";
    case "C":
      return "Détermine les points $C$ de $d$ tels que l'aire du triangle $ABC$ soit égale à $k$.";
    case "D":
      return "Détermine les coordonnées de $B$ et de $C$, puis une équation de chacun des trois côtés.";
    case "E":
      return "Détermine toutes les droites qui passent par $P$ et qui sont à égale distance de $A$ et de $B$ (une équation de chacune, s'il y en a un nombre fini).";
    case "F":
      return "Détermine les coordonnées du symétrique $Q$ de $P$ par rapport à la droite $(AB)$.";
    case "G":
      return e.sousType === "sommetDiagonale" ? "Détermine les coordonnées des sommets $B$, $C$ et $D$." : "Détermine les coordonnées des quatre sommets.";
    case "H":
      return e.contexte === "miroir" ? "Détermine une équation de la droite qui porte le rayon réfléchi." : "Détermine une équation de la droite que suit la boule après le rebond.";
  }
}

function reponseBreve(e: E): F {
  switch (e.famille) {
    case "A":
      return fx(`$${nomPt("A", e.A)}$, $${nomPt("B", e.B)}$, $${nomPt("C", e.C)}$.`);
    case "B":
      return fx(`$${nomPt("I", e.I)}$.`);
    case "C":
      return fx(`$${nomPt("C_1", e.C[0])}$ et $${nomPt("C_2", e.C[1])}$.`);
    case "D":
      return fx(`$${nomPt("B", e.B)}$, $${nomPt("C", e.C)}$ ; $(AB)\\,:\\ ${ld(e.AB)}$, $(BC)\\,:\\ ${ld(e.BC)}$, $(CA)\\,:\\ ${ld(e.CA)}$.`);
    case "E":
      if (e.position === "milieu") return fx("Une infinité : toutes les droites passant par $P$ ($P$ est le milieu de $[AB]$).");
      if (e.position === "surAB") return fx(`Une seule : $(AB)\\,:\\ ${ld(e.droites[0])}$.`);
      return fx(`Deux : $${ld(e.droites[0])}$ et $${ld(e.droites[1])}$.`);
    case "F":
      return fx(`$${nomPt("Q", e.Q)}$.`);
    case "G":
      return e.sousType === "sommetDiagonale" ? fx(`$${nomPt("C", e.C)}$ ; $B$ et $D$ : $${lp(e.B)}$ et $${lp(e.D)}$ (dans un ordre ou dans l'autre).`) : fx(`$${lp(e.A)}$, $${lp(e.B)}$, $${lp(e.C)}$, $${lp(e.D)}$.`);
    case "H":
      return fx(`$${ld(e.rayonReflechi)}$.`);
  }
}

function bareme(e: E): BaremeExercice {
  const l = lettresEcrans(phasesPourExercice, e);
  const c = (i: number, critere: string, points: number) => ({ sousQuestion: l[i], critere: fx(critere), points });
  const droites = fx("Toute équation de droite équivalente (multipliée par un nombre non nul, ou sous la forme $y=mx+p$)");
  switch (e.famille) {
    case "A":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [c(0, `Sommet $${nomPt("A", e.A)}$ (parallélogramme des milieux)`, 2), c(1, `Sommets $${nomPt("B", e.B)}$ et $${nomPt("C", e.C)}$`, 2)],
        erreursFrequentes: [{ description: fx("Mauvais milieux additionnés (un sommet pris pour un autre)"), cout: "1 pt par sommet faux" }],
        reponsesAcceptees: [fx("La résolution par système (milieux de deux côtés) au lieu du parallélogramme")],
      };
    case "B":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [c(0, `Longueurs $AB=${e.AB}$ et $BC=${e.BC}$`, 1.5), c(1, `Théorème de la bissectrice appliqué : $${nomPt("I", e.I)}$`, 2.5)],
        erreursFrequentes: [{ description: fx("Milieu de $[AC]$ donné pour $I$"), cout: "0 pt sur l'étape 2" }, { description: fx("Rapport inversé ($I$ plus près du sommet du plus grand côté)"), cout: "1 pt sur l'étape 2" }],
        reponsesAcceptees: [fx("$I$ obtenu par $I=\\dfrac{BC\\cdot A+AB\\cdot C}{AB+BC}$")],
      };
    case "C":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [c(0, `Aire en fonction de $t$ : $\\frac{1}{2}\\left|${e.K}${e.M < 0 ? "" : "+"}${e.M}t\\right|$`, 1.5), c(1, "Les deux valeurs de $t$", 1.5), c(2, "Les deux points $C$", 1)],
        erreursFrequentes: [{ description: fx("Une seule des deux équations de la valeur absolue"), cout: "1,5 pt (étapes 2 et 3)" }],
        reponsesAcceptees: [fx("L'expression $K+Mt$ ou son opposée ; les deux points dans n'importe quel ordre")],
      };
    case "D":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [c(0, `Sommet $${nomPt("B", e.B)}$`, 1.25), c(1, `Sommet $${nomPt("C", e.C)}$`, 1.25), c(2, "Équations des trois côtés", 1.5)],
        erreursFrequentes: [{ description: fx("$B$ placé sur la médiane issue de $C$ (au lieu du milieu de $[AB]$)"), cout: "0 pt sur l'étape concernée" }],
        reponsesAcceptees: [droites],
      };
    case "E":
      if (e.position === "milieu")
        return {
          reponseFinale: reponseBreve(e),
          criteres: [c(0, "$P$ reconnu comme milieu de $[AB]$, conclusion : une infinité de droites, justifiée", 4)],
          erreursFrequentes: [{ description: fx("Deux droites « calculées » sans remarquer que $P$ est le milieu"), cout: "0 pt" }],
          reponsesAcceptees: [fx("La justification par la symétrie de centre $P$ (qui échange $A$ et $B$)")],
        };
      return {
        reponseFinale: reponseBreve(e),
        criteres: [c(0, `Caractérisation (parallèle à $(AB)$ ou passe par le milieu) et position de $P$ : ${e.position === "surAB" ? "une seule droite" : "deux droites"}`, 2), c(1, e.position === "surAB" ? "Équation de $(AB)$" : "Les équations des deux droites", 2)],
        erreursFrequentes: [{ description: fx("Parallèle à $(AB)$ oubliée"), cout: "1 pt sur l'étape 2" }],
        reponsesAcceptees: [droites],
      };
    case "F":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [c(0, `Perpendiculaire à $(AB)$ par $P$ : $${ld(e.perpendiculaire)}$`, 1), c(1, `Pied $${nomPt("H", e.H)}$`, 1.5), c(2, `Symétrique $${nomPt("Q", e.Q)}$`, 1.5)],
        erreursFrequentes: [{ description: fx("$Q=2P-H$ au lieu de $2H-P$"), cout: "0 pt sur l'étape 3" }],
        reponsesAcceptees: [droites],
      };
    case "G":
      return e.sousType === "sommetDiagonale"
        ? {
            reponseFinale: reponseBreve(e),
            criteres: [c(0, `Centre $${nomPt("O", e.O)}$`, 1.5), c(1, `Sommet $${nomPt("C", e.C)}$`, 1), c(2, `Sommets $B$ et $D$ : $${lp(e.B)}$ et $${lp(e.D)}$`, 1.5)],
            erreursFrequentes: [{ description: fx("Un seul des deux sommets de la diagonale $(BD)$"), cout: "0,75 pt sur l'étape 3" }],
            reponsesAcceptees: [fx(`Les deux orientations du carré : $B${lp(e.B)}$ et $D${lp(e.D)}$, ou l'inverse`)],
          }
        : {
            reponseFinale: reponseBreve(e),
            criteres: [c(0, `Milieu $${nomPt("M", e.M)}$ du côté porté par $(AB)$`, 1.5), c(1, `Sommets du côté : $${lp(e.A)}$ et $${lp(e.B)}$`, 1.5), c(2, `Sommets opposés : $${lp(e.C)}$ et $${lp(e.D)}$`, 1)],
            erreursFrequentes: [{ description: fx("Sommets opposés pris symétriques par rapport à $M$ au lieu de $P$"), cout: "0 pt sur l'étape 3" }],
            reponsesAcceptees: [fx("Les quatre sommets nommés dans n'importe quel ordre qui fait le tour du carré")],
          };
    case "H":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [c(0, `Symétrique de la source : $${nomPt("P'", e.Pp)}$`, 2), c(1, `Droite $(P'M)$ : $${ld(e.rayonReflechi)}$`, 2)],
        erreursFrequentes: [{ description: fx("Droite $(PM)$ du rayon incident, ou le miroir, donnée comme rayon réfléchi"), cout: "0 pt sur l'étape 2" }],
        reponsesAcceptees: [droites],
      };
  }
}

function criteres(e: E): CriteresDifficulte {
  // E : le nombre de droites est le verdict — critères FIXES (deux étapes sans charge, piège 1 : un cas
  // qui n'en est pas un) pour que niveau et durée ne le trahissent pas.
  if (e.famille === "E") return { etapesTransformation: 2, etapesLecture: 0, methode: 1, piege: 1, nombres: 0, sansCharge: true };
  const base = etapesDuCorrige(correctionDetailleePointsDroites(e), []);
  const methode = e.famille === "A" || e.famille === "F" ? 0 : 1;
  return { ...base, methode, piege: e.famille === "B" ? 1 : 0, nombres: 0 };
}

const axe = (d: { a: bigint; b: bigint }) => d.a === 0n || d.b === 0n;

export function profilPointsDroites(e: E): ProfilInstance {
  const forme = e.famille === "G" ? `G-${e.sousType}` : e.famille;
  const cas = (e.famille === "C" && axe(e.d)) || (e.famille === "F" && axe(e.droiteAB)) || (e.famille === "H" && axe(e.d)) ? "droiteAxe" : null;
  return { casParticulier: cas, forme };
}

export const adaptateurEvaluationPointsDroitesRemarquablesTriangle: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhasePointsDroitesRemarquablesTriangle>({
  titreDocument: "Constructions analytiques dans le triangle — Évaluation",
  nomFichierBase: "constructions-analytiques-triangle",
  genererInstance: genererExercicePointsDroitesRemarquablesTriangle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: formatPapier(FORMAT_6GEN54),
  phases: phasesPourExercice,
  situation: situationPapier54,
  questions: (e) => [{ consigne: fx(consignePapier54(e)), etapes: lettresEcrans(phasesPourExercice, e) }],
  reponseBreve,
  correction: correctionDetailleePointsDroites,
  bareme,
  criteres,
  profil: profilPointsDroites,
  libelleCasParticulier: "Inclure un cas particulier (droite parallèle à un axe)",
});

