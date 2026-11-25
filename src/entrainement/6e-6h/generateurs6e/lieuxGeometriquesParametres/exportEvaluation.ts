import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceLieuxGeometriquesParametres, PhaseLieuxGeometriquesParametres } from "../../core6e/lieuxGeometriquesParametres.types";
import { phasesPourExercice } from "../../moteur6e/typesLieuxGeometriquesParametres";
import { latexCercle, latexDroite, latexQ, latexRacine, qNum } from "../../moteur6e/algebreLieux";
import { FORMAT_6GEN56 } from "../../ui6e/formatLieuxGeometriquesParametres";
import { fx } from "../../ui6e/corrigeCombinatoire";
import { formatPapier, lp } from "../../ui6e/corrigeLieux";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { correctionDetailleeLieux } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, GROUPES_VERDICT_6GEN56, construireAvecVarianteId, genererExerciceLieuxGeometriquesParametres } from "./index";

/**
 * Adaptateur papier de `6gen56` (lieux géométriques et élimination de paramètre, 6e ch. 9, § 4 et § 6,
 * processus 2 APPLIQUER) — refonte du lot E de l'audit : énoncé papier = la donnée (équation,
 * points, droites, carré placé par ses sommets, représentation paramétrique) + UNE consigne propre au
 * sous-type, sans méthode ni indice de seuil (plus de « distingue les cas selon le signe… », de
 * « certains sous-types dépendent d'un seuil… », de « regroupe, divise, complète le carré »), qui ne
 * dit jamais la nature du lieu ; D demande la partie réellement décrite. Les écrans deviennent les
 * étapes du corrigé (équations écrites, plus de nombres nus), figure du lieu sous le dernier résultat.
 *
 * Profil : `forme` = le sous-type (visible dans l'énoncé) ; cas particuliers `m1` (C : coefficient 1
 * devant x² + y², pas de division) et `centreOrigine` (A losange / différence, B carrés des distances à
 * deux perpendiculaires, C, E perpendiculaires : centre en (0 ; 0)) ; JAMAIS un verdict (nature, régime
 * cercle / point / vide, partie décrite). Groupes à verdict inchangés (PA² + PB², Apollonius, carré des
 * distances, parallèles, carré) ; niveau et durée constants dans chaque groupe et dans C et D. Aucun
 * `calcul` (règle du 24/11).
 */

type E = ExerciceLieuxGeometriquesParametres;
type F = FragmentConsigne[];


/** Données en prose : les lignes de données de l'écran, déjà en phrases courtes avec KaTeX en ligne. */
export function situationPapier56(e: E): F {
  const d = e.donnees.join(" ; ");
  switch (e.famille) {
    case "A":
    case "C":
      return fx(`On considère l'équation ${d}.`);
    case "D":
      return fx(`Le point $P(x\\,;y)$ dépend du paramètre $t$ : ${d}.`);
    default:
      return fx(`On donne ${d.replace(/^carré/, "le carré")}.`);
  }
}

export function consignePapier56(e: E): string {
  switch (e.sousType) {
    case "A_paralleles":
    case "A_losange":
    case "A_nonBorne":
      return "Détermine et représente l'ensemble des points $P(x\\,;y)$ dont les coordonnées vérifient cette équation.";
    case "B_bissectrices":
      return "Détermine le lieu des points $P$ situés à égale distance des droites $d_1$ et $d_2$.";
    case "B_droite":
      return "Détermine la nature et une équation du lieu des points $P(x\\,;y)$ tels que $PA^2-PB^2=k$.";
    case "B_cerclePerp":
      return "Détermine la nature du lieu des points $P$ tels que la somme des carrés de leurs distances aux droites $a$ et $b$ vaille $k$. S'il s'agit d'un cercle, donne son centre et son rayon.";
    case "B_seuil2Points":
      return "Détermine la nature du lieu des points $P(x\\,;y)$ tels que $PA^2+PB^2=k$. S'il s'agit d'un cercle, donne son centre et son rayon.";
    case "B_apollonius":
      return "Détermine la nature et une équation du lieu des points $P(x\\,;y)$ tels que $PA^2=k\\cdot PB^2$. S'il s'agit d'un cercle, donne son centre et son rayon.";
    case "B_seuilCarre":
      return "Détermine la nature du lieu des points $P$ tels que la somme des carrés de leurs distances aux quatre droites qui portent les côtés du carré vaille $k$. S'il s'agit d'un cercle, donne son centre et son rayon.";
    case "C":
      return "Détermine la nature de l'ensemble des points $P(x\\,;y)$ dont les coordonnées vérifient cette équation. S'il s'agit d'un cercle, donne son centre et son rayon.";
    case "D_substitution":
    case "D_fractions":
    case "D_ratio":
      return "Détermine une équation cartésienne du lieu de $P$, puis précise la partie de cette courbe réellement décrite quand $t$ parcourt son domaine.";
    case "E_paralleles":
    case "E_perpendiculaires":
    case "E_secantes":
      return "Détermine et représente le lieu des points $P$ dont la somme des distances aux droites $a$ et $b$ vaut $k$.";
    case "E_carre":
      return "Détermine et représente le lieu des points $P$ dont la somme des distances aux quatre droites qui portent les côtés du carré vaut $k$.";
  }
}

function libelleChoix(e: E): string {
  return ((e.restrictions ?? []).find((o) => o.valeur === e.restriction)?.label ?? "").replace(/^./, (c) => c.toLowerCase());
}

function natureBreve(e: E): F {
  const R = e.R;
  if (e.centre && R) {
    const r = qNum(R);
    if (r > 0) return fx(`un cercle, $${latexCercle(e.centre, R)}$ : centre $${lp(e.centre)}$, rayon $${latexRacine(R)}$`);
    if (r === 0) return fx(`un seul point, $${lp(e.centre)}$`);
    return fx("l'ensemble vide");
  }
  return [];
}

function reponseBreve(e: E): F {
  const S = (e.sommets ?? []).map((x) => `$${lp(x)}$`).join(", ");
  const D = (e.droites ?? []).map((x) => `$${latexDroite(x)}$`).join(" et ");
  switch (e.sousType) {
    case "A_paralleles":
    case "B_bissectrices":
      return fx(`Deux droites : ${D}.`);
    case "A_losange":
    case "E_perpendiculaires":
      return fx(`Un carré posé sur une pointe, de sommets ${S}.`);
    case "A_nonBorne":
      return fx(`Quatre demi-droites issues de ${S.replace(", ", " et ")}, portées par les droites ${D.split(" et ").join(" ; ")}.`);
    case "B_droite":
      return fx(`Une droite : $${e.equationLatex}$.`);
    case "B_apollonius":
      return e.verdict === "droite" ? fx(`La médiatrice de $[AB]$ : $${e.equationLatex}$.`) : fx(`Le cercle d'Apollonius $${latexCercle(e.centre!, e.R!)}$ : centre $${lp(e.centre!)}$, rayon $${latexRacine(e.R!)}$.`);
    case "B_cerclePerp":
    case "B_seuil2Points":
    case "B_seuilCarre":
    case "C": {
      const nb = natureBreve(e);
      return [...nb.map((f, i) => (i === 0 && f.type === "texte" ? { ...f, valeur: f.valeur.replace(/^./, (c) => c.toUpperCase()) } : f)), ...fx(".")];
    }
    case "D_substitution":
    case "D_fractions":
    case "D_ratio":
      return fx(`$${e.equationLatex}$ ; le point décrit ${libelleChoix(e)}.`);
    case "E_paralleles":
      return e.verdict === "vide" ? fx("L'ensemble vide.") : e.verdict === "bande" ? fx("La bande pleine entre $a$ et $b$, bords compris.") : fx(`Deux droites : ${D}.`);
    case "E_secantes":
      return fx(`Un parallélogramme de sommets ${S}.`);
    case "E_carre":
      return e.verdict === "vide" ? fx("L'ensemble vide.") : e.verdict === "regionCarre" ? fx("Le carré plein (intérieur et bord).") : fx(`Un octogone de sommets ${S}.`);
  }
}

function bareme(e: E): BaremeExercice {
  const l = lettresEcrans(phasesPourExercice, e);
  const c = (i: number, critere: F, points: number) => ({ sousQuestion: l[i], critere, points });
  const acceptees = [fx("Toute équation équivalente (développée, réduite, multipliée par un nombre non nul) ; les points et les droites dans n'importe quel ordre")];
  const brev = reponseBreve(e);
  const ph = e.phases;
  const crit = (): ReturnType<typeof c>[] => {
    // Poids par écran (somme 4) : la nature, puis les éléments du lieu.
    const poids: Record<string, number> = {};
    if (ph.length === 1) poids[ph[0]] = 4;
    else if (ph.length === 2) [poids[ph[0]], poids[ph[1]]] = [2, 2];
    else [poids[ph[0]], poids[ph[1]], poids[ph[2]]] = [1.5, 1.5, 1];
    const texte: Record<string, F> = {
      nature: fx(`Nature justifiée : ${(e.natures ?? []).find((o) => o.valeur === e.nature)?.label.toLowerCase() ?? ""}`),
      droites: [...fx("Équations : "), ...fx((e.droites ?? []).map((x) => `$${latexDroite(x)}$`).join(" ; "))],
      sommets: [...fx("Points : "), ...fx((e.sommets ?? []).map((x) => `$${lp(x)}$`).join(" ; "))],
      equation: fx(`Équation traduite et réduite : $${e.equationLatex ?? ""}$`),
      centreR: e.centre && e.R ? fx(`$\\Omega${lp(e.centre)}$ et $R=${latexQ(e.R)}$`) : [],
      restriction: [...fx("Partie décrite, justifiée par les valeurs prises : "), ...fx(libelleChoix(e))],
    };
    return ph.map((p, i) => c(i, texte[p], poids[p]));
  };
  const erreurs: Record<string, { description: F; cout: string }[]> = {
    A: [{ description: fx("Un seul cas de la valeur absolue (ou sommets d'un carré aux côtés parallèles aux axes)"), cout: "moitié des points de l'étape concernée" }],
    B: [{ description: fx("Régime mal décidé (cercle au lieu d'un point ou du vide, ou l'inverse)"), cout: "0 pt sur la nature" }],
    C: [{ description: fx("Centre lu sans diviser par le coefficient de $x^2$"), cout: "0,75 pt sur l'étape 1" }],
    D: [{ description: fx("Restriction oubliée : toute la courbe donnée comme lieu"), cout: "0 pt sur la partie décrite" }],
    E: [{ description: fx("Seuil mal placé (comparaison à 0, ou à $4c^2$ au lieu de $4c$)"), cout: "0 pt sur la nature" }],
  };
  return { reponseFinale: brev, criteres: crit(), erreursFrequentes: erreurs[e.famille], reponsesAcceptees: acceptees };
}

/** Écrans par verdict d'un même groupe ou d'une même variante : critères FIXES (niveau et durée ne
 * trahissent pas le verdict). */
function criteres(e: E): CriteresDifficulte {
  const st = e.sousType;
  if (st === "E_paralleles" || st === "E_carre") return { etapesTransformation: 2, etapesLecture: 0, methode: 1, piege: 1, nombres: 0, sansCharge: true };
  if (st === "B_apollonius") return { etapesTransformation: 3, etapesLecture: 0, methode: 1, piege: 1, nombres: 0, sansCharge: true };
  if (st === "B_seuil2Points" || st === "B_seuilCarre" || st === "C") return { etapesTransformation: st === "C" ? 2 : 3, etapesLecture: 0, methode: 1, piege: 1, nombres: 0, sansCharge: true };
  if (e.famille === "D") return { etapesTransformation: 2, etapesLecture: 0, methode: 1, piege: 1, nombres: 0, sansCharge: true };
  const base = etapesDuCorrige(correctionDetailleeLieux(e), []);
  return { ...base, methode: 1, piege: st === "A_nonBorne" ? 1 : 0, nombres: 0 };
}

export function profilLieux(e: E): ProfilInstance {
  const p = e.params;
  const forme = e.sousType;
  if (e.famille === "C" && p.m === 1) return { casParticulier: "m1", forme };
  const origine =
    ((e.sousType === "A_losange" || e.sousType === "A_nonBorne" || e.sousType === "E_perpendiculaires") && p.p === 0 && p.q === 0) || (e.sousType === "B_cerclePerp" && p.x0 === 0 && p.y0 === 0) || (e.famille === "C" && p.h === 0 && p.k === 0);
  return { casParticulier: origine ? "centreOrigine" : null, forme };
}

export const adaptateurEvaluationLieuxGeometriquesParametres: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseLieuxGeometriquesParametres>({
  titreDocument: "Lieux géométriques et élimination de paramètre — Évaluation",
  nomFichierBase: "lieux-geometriques",
  genererInstance: genererExerciceLieuxGeometriquesParametres,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: formatPapier(FORMAT_6GEN56),
  phases: phasesPourExercice,
  situation: situationPapier56,
  questions: (e) => [{ consigne: fx(consignePapier56(e)), etapes: lettresEcrans(phasesPourExercice, e) }],
  reponseBreve,
  correction: correctionDetailleeLieux,
  bareme,
  criteres,
  profil: profilLieux,
  libelleCasParticulier: "Inclure un cas particulier (coefficient 1 devant x² + y², centre à l'origine)",
  groupesVerdict: GROUPES_VERDICT_6GEN56,
});
