import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceCercles } from "../../core6e/cercles.types";
import type { PhaseCercles } from "../../moteur6e/typesCercles";
import { phasesPourExercice } from "../../moteur6e/typesCercles";
import { latexCercle, latexQ, latexRacine } from "../../moteur6e/algebreLieux";
import { FORMAT_6GEN55 } from "../../ui6e/formatCercles";
import { fx } from "../../ui6e/corrigeCombinatoire";
import { formatPapier, ld, nomPt } from "../../ui6e/corrigeLieux";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { correctionDetailleeCercles } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCercles } from "./index";

/**
 * Adaptateur papier de `6gen55` (cercles, 6e ch. 9, § 2, processus 2 APPLIQUER) — refonte du lot E de
 * l'audit : énoncé papier = les données (« On donne … ») + UNE consigne sans méthode ni formule (plus de
 * « (x − a)² + (y − b)² = r² », de centre pondéré, de « applique Pythagore »), « le » cercle tangent aux
 * trois droites remplacé par le cercle inscrit OU l'exinscrit nommé, sommets nommés par les côtés ;
 * B : « tous les cercles », le nombre (0, 1 ou 2) est à trouver. Les écrans deviennent les étapes du
 * corrigé, qui donne toujours l'équation du cercle et sa figure.
 *
 * Profil : `forme` = famille (G : inscrit / exinscrit) ; cas particuliers `origineSurCercle` (A : F = 0)
 * et `triangleRectangle` (E, G inscrit : r = (b + c − a)/2 se lit aussi) ; le nombre de cercles de B
 * n'est jamais dans le profil (verdict, niveau et durée constants). Aucun `calcul` : établir une
 * médiatrice, un centre, une équation de cercle n'est pas donné par la calculatrice (règle du 24/11).
 */

type E = ExerciceCercles;
type F = FragmentConsigne[];

const EXACT = " Donne des valeurs exactes.";

export function situationPapier55(e: E): F {
  switch (e.famille) {
    case "A":
      return fx(`On donne les points $${nomPt("A", e.A)}$, $${nomPt("B", e.B)}$ et $${nomPt("C", e.C)}$.`);
    case "B":
      return fx(`On donne les points $${nomPt("A", e.A)}$, $${nomPt("B", e.B)}$ et le rayon $r=${latexRacine(e.r2)}$.`);
    case "C":
      return fx(`On donne les points $${nomPt("A", e.A)}$, $${nomPt("B", e.B)}$ et la droite $d\\,:\\ ${ld(e.d)}$.`);
    case "D":
      return fx(`On donne les points $${nomPt("A", e.A)}$ et $${nomPt("T", e.T)}$.`);
    case "E":
      return fx(`On donne les points $${nomPt("A", e.triangle.A)}$, $${nomPt("B", e.triangle.B)}$ et $${nomPt("C", e.triangle.C)}$.`);
    case "F":
      return fx(`On donne le point $${nomPt("\\Omega", e.centre)}$, la droite $d\\,:\\ ${ld(e.d)}$ et la longueur $L=${e.L}$.`);
    case "G":
      return fx(`On donne les droites $(AB)\\,:\\ ${ld(e.AB)}$, $(BC)\\,:\\ ${ld(e.BC)}$ et $(CA)\\,:\\ ${ld(e.CA)}$.`);
  }
}

const ANGLE = { A: "\\widehat{A}", B: "\\widehat{B}", C: "\\widehat{C}" };

export function consignePapier55(e: E): string {
  switch (e.famille) {
    case "A":
      return "Détermine une équation du cercle qui passe par $A$, $B$ et $C$, puis son centre et son rayon." + EXACT;
    case "B":
      return "Détermine tous les cercles de rayon $r$ qui passent par $A$ et $B$ : donne le centre et une équation de chacun." + EXACT;
    case "C":
      return "Détermine une équation du cercle qui passe par $A$ et $B$ et dont le centre est sur $d$." + EXACT;
    case "D":
      return `Détermine une équation du cercle tangent à l'axe des ${e.axe === "abscisses" ? "abscisses" : "ordonnées"} en $T$ et qui passe par $A$.` + EXACT;
    case "E":
      return "Détermine le centre et le rayon du cercle inscrit dans le triangle $ABC$." + EXACT;
    case "F":
      return "Détermine une équation du cercle de centre $\\Omega$ qui découpe sur $d$ une corde de longueur $L$." + EXACT;
    case "G":
      return e.mode === "inscrit"
        ? "Ces trois droites forment le triangle $ABC$. Détermine le centre et le rayon du cercle inscrit dans ce triangle." + EXACT
        : `Ces trois droites forment le triangle $ABC$. Détermine le centre et le rayon du cercle exinscrit situé dans l'angle $${ANGLE[e.sommet]}$ (tangent aux trois droites, hors du triangle).` + EXACT;
  }
}

function reponseBreve(e: E): F {
  switch (e.famille) {
    case "A":
      return fx(`$x^2+y^2${e.D ? (e.D > 0 ? `+${e.D}x` : `${e.D}x`) : ""}${e.E ? (e.E > 0 ? `+${e.E}y` : `${e.E}y`) : ""}${e.F ? (e.F > 0 ? `+${e.F}` : `${e.F}`) : ""}=0$ ; centre $${nomPt("\\Omega", e.centre)}$, rayon $${latexRacine(e.r2)}$.`);
    case "B":
      if (e.verdict === 0) return fx("Aucun cercle (le rayon est plus petit que la moitié de $AB$).");
      if (e.verdict === 1) return fx(`Un seul cercle : $${latexCercle(e.centres[0], e.r2)}$ (de diamètre $[AB]$).`);
      return fx(`Deux cercles : $${latexCercle(e.centres[0], e.r2)}$ et $${latexCercle(e.centres[1], e.r2)}$.`);
    case "C":
    case "D":
    case "F":
      return fx(`$${latexCercle(e.centre, e.r2)}$.`);
    case "E":
    case "G":
      return fx(`Centre $${nomPt(e.famille === "G" && e.mode === "exinscrit" ? "J" : "I", e.centre)}$, rayon $${latexQ(e.r)}$.`);
  }
}

function bareme(e: E): BaremeExercice {
  const l = lettresEcrans(phasesPourExercice, e);
  const c = (i: number, critere: string, points: number) => ({ sousQuestion: l[i], critere: fx(critere), points });
  const acceptees = [fx("L'équation du cercle sous forme développée ou centre-rayon ; les valeurs exactes sous toute écriture équivalente (fraction, racine simplifiée ou non)")];
  switch (e.famille) {
    case "A":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [c(0, "Système des trois équations en $D$, $E$, $F$", 1), c(1, `Résolution : $D=${e.D}$, $E=${e.E}$, $F=${e.F}$`, 1.5), c(2, `Centre $${nomPt("\\Omega", e.centre)}$ et rayon $${latexRacine(e.r2)}$`, 1.5)],
        erreursFrequentes: [{ description: fx("Centre lu avec les signes de $D$ et $E$ (au lieu de $-\\frac{D}{2}$, $-\\frac{E}{2}$)"), cout: "0,5 pt sur l'étape 3" }, { description: fx("$r^2$ donné comme rayon"), cout: "0,5 pt sur l'étape 3" }],
        reponsesAcceptees: acceptees,
      };
    case "B":
      if (e.verdict === 0)
        return {
          reponseFinale: reponseBreve(e),
          criteres: [c(0, "Comparaison de $r$ à $\\frac{AB}{2}$ (carrés calculés)", 2.5), c(0, "Conclusion : aucun cercle, justifiée", 1.5)],
          erreursFrequentes: [{ description: fx("Deux centres « calculés » sans vérifier l'existence (calcul impossible ignoré)"), cout: "0 pt sur la conclusion" }],
          reponsesAcceptees: [fx("La conclusion par un système sans solution (équation du second degré à discriminant négatif)")],
        };
      return {
        reponseFinale: reponseBreve(e),
        criteres: [c(0, `Nombre de cercles justifié : ${e.verdict === 2 ? "deux" : "un seul"}`, 1), c(1, `Médiatrice de $[AB]$ : $${ld(e.mediatrice)}$`, 1), c(2, e.verdict === 2 ? `Les deux centres et les deux équations` : "Le centre (milieu de $[AB]$) et l'équation", 2)],
        erreursFrequentes: [{ description: fx("Un seul des deux cercles donné"), cout: "1 pt sur l'étape 3" }],
        reponsesAcceptees: [fx("Toute méthode exacte (système médiatrice et cercle de centre $A$, Pythagore) ; l'équation sous forme développée ou centre-rayon")],
      };
    case "C":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [c(0, `Médiatrice de $[AB]$ : $${ld(e.mediatrice)}$`, 1), c(1, `Centre $${nomPt("\\Omega", e.centre)}$`, 1.5), c(2, `Équation $${latexCercle(e.centre, e.r2)}$`, 1.5)],
        erreursFrequentes: [{ description: fx("$r$ au lieu de $r^2$ au second membre"), cout: "0,5 pt sur l'étape 3" }],
        reponsesAcceptees: acceptees,
      };
    case "D":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [c(0, "Centre sur la perpendiculaire à l'axe en $T$, équation $\\Omega A^2=k^2$", 1.5), c(1, `$k=${latexQ(e.k)}$, centre $${nomPt("\\Omega", e.centre)}$`, 1.5), c(2, `Équation $${latexCercle(e.centre, e.r2)}$`, 1)],
        erreursFrequentes: [{ description: fx("Rayon négatif (écrit $k$ au lieu de $|k|$)"), cout: "0,5 pt sur l'étape 2" }],
        reponsesAcceptees: acceptees,
      };
    case "E":
    case "G": {
      const nom = e.famille === "G" && e.mode === "exinscrit" ? "J" : "I";
      const t = e.triangle;
      const crit = [
        ...(e.famille === "G" ? [c(0, `Sommets $${nomPt("A", t.A)}$, $${nomPt("B", t.B)}$, $${nomPt("C", t.C)}$`, 1)] : []),
        c(e.famille === "G" ? 1 : 0, `Côtés $a=${t.a}$, $b=${t.b}$, $c=${t.c}$`, e.famille === "G" ? 0.5 : 1),
        c(e.famille === "G" ? 2 : 1, `Centre $${nomPt(nom, e.centre)}$`, e.famille === "G" ? 1.5 : 1.5),
        c(e.famille === "G" ? 3 : 2, `Rayon $r=${latexQ(e.r)}$`, e.famille === "G" ? 1 : 1.5),
      ];
      return {
        reponseFinale: reponseBreve(e),
        criteres: crit,
        erreursFrequentes: [{ description: fx("Centre de gravité (moyenne simple des sommets) donné comme centre"), cout: "0 pt sur le centre" }, ...(nom === "J" ? [{ description: fx("Formules du cercle inscrit appliquées à l'exinscrit"), cout: "0 pt sur le centre et le rayon" }] : [])],
        reponsesAcceptees: [fx("Le centre obtenu par l'intersection de deux bissectrices ; le rayon comme distance du centre à un côté")],
      };
    }
    case "F":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [c(0, `Distance de $\\Omega$ à $d$ : $${latexRacine(e.dist2)}$`, 1.5), c(1, `$r^2=${latexQ(e.r2)}$ (Pythagore avec $\\frac{L}{2}$)`, 1.5), c(2, `Équation $${latexCercle(e.centre, e.r2)}$`, 1)],
        erreursFrequentes: [{ description: fx("$L$ au lieu de $\\frac{L}{2}$ dans Pythagore"), cout: "0,5 pt sur l'étape 2" }],
        reponsesAcceptees: acceptees,
      };
  }
}

function criteres(e: E): CriteresDifficulte {
  // B : le nombre de cercles est le verdict — critères FIXES (trois étapes sans charge, piège 1 : un cas
  // qui n'en est pas un) pour que niveau et durée ne le trahissent pas.
  if (e.famille === "B") return { etapesTransformation: 3, etapesLecture: 0, methode: 1, piege: 1, nombres: 0, sansCharge: true };
  const base = etapesDuCorrige(correctionDetailleeCercles(e), []);
  return { ...base, methode: 1, piege: e.famille === "G" && e.mode === "exinscrit" ? 1 : 0, nombres: 0 };
}

function estRectangle(t: { a: number; b: number; c: number }): boolean {
  const [x, y, z] = [t.a, t.b, t.c].sort((m, n) => m - n);
  return x * x + y * y === z * z;
}

export function profilCercles(e: E): ProfilInstance {
  const forme = e.famille === "G" ? `G-${e.mode}` : e.famille;
  if (e.famille === "A" && e.F === 0) return { casParticulier: "origineSurCercle", forme };
  if ((e.famille === "E" || (e.famille === "G" && e.mode === "inscrit")) && estRectangle(e.triangle)) return { casParticulier: "triangleRectangle", forme };
  return { casParticulier: null, forme };
}

export const adaptateurEvaluationCercles: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseCercles>({
  titreDocument: "Cercles — Évaluation",
  nomFichierBase: "cercles",
  genererInstance: genererExerciceCercles,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: formatPapier(FORMAT_6GEN55),
  phases: phasesPourExercice,
  situation: situationPapier55,
  questions: (e) => [{ consigne: fx(consignePapier55(e)), etapes: lettresEcrans(phasesPourExercice, e) }],
  reponseBreve,
  correction: correctionDetailleeCercles,
  bareme,
  criteres,
  profil: profilCercles,
  libelleCasParticulier: "Inclure un cas particulier (cercle passant par l'origine, triangle rectangle)",
});

