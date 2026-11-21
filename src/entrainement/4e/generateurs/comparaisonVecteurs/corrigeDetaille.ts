import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceComparaisonVecteurs, VecteurFigureCompare } from "../../core/comparaisonVecteurs.types";
import { COURS_COLINEARITE, COURS_COMPARER, COURS_NORME, carre, coefVec, col, finaliserCorrigeVecteurs, fois, nT, q, vec, type Fragments } from "../../ui/corrigeVecteurs1";
import { construireSvgComparaison } from "./figure";
import { egalitesDemandees } from "../../moteur/verificationComparaisonVecteurs";

/**
 * Corrigé détaillé « comme au tableau » de gen28 « Comparaison visuelle de vecteurs sur figure » —
 * règle `.claude/rules/feuilles-evaluations.md`. Deux écrans : « a » sélection (composantes lues sur
 * le quadrillage, puis la propriété testée vecteur par vecteur : norme au carré, critère de
 * colinéarité, signe du coefficient), « b » égalités \vec{v} = k\vec{ref}. Figure du corrigé : les
 * vecteurs retenus en couleur. Partagé par l'adaptateur et l'appli.
 */

const fmtDeplacement = (v: { x: number; y: number }) => {
  const parts: string[] = [];
  if (v.x !== 0) parts.push(`${nT(Math.abs(v.x))} vers la ${v.x > 0 ? "droite" : "gauche"}`);
  if (v.y !== 0) parts.push(`${nT(Math.abs(v.y))} vers le ${v.y > 0 ? "haut" : "bas"}`);
  return `lu : ${parts.join(", ")}`;
};

/** Coefficient k tel que \vec{v} = k\vec{ref} (vecteurs colinéaires). */
function coefficient(v: VecteurFigureCompare, ref: VecteurFigureCompare): number {
  return ref.composantes.x !== 0 ? v.composantes.x / ref.composantes.x : v.composantes.y / ref.composantes.y;
}

/** Mêmes égalités que l'écran « égalité » (une source : le moteur). */
export const egalitesAttendues = egalitesDemandees;

export function egalitesLatex(e: ExerciceComparaisonVecteurs): string {
  const k = (c: number) => (c === 1 ? "" : c === -1 ? "-" : String(c));
  return egalitesAttendues(e)
    .map((x) => `\\vec{${x.label}} = ${k(x.k)}\\vec{${e.labelReference}}`)
    .join(" \\qquad ");
}

const DEFINITION: Record<ExerciceComparaisonVecteurs["propriete"], Fragments> = {
  longueur: [texte("Deux vecteurs ont la même longueur quand leurs normes sont égales — on compare les carrés : "), latex("\\|\\vec{u}\\|^2=x_u^2+y_u^2"), texte(` ${COURS_NORME}, quelles que soient direction et position ${COURS_COMPARER}.`)],
  direction: [texte("Deux vecteurs ont la même direction quand ils sont parallèles, c'est-à-dire colinéaires : critère "), latex("x_u\\cdot y_v-y_u\\cdot x_v=0"), texte(` ${COURS_COLINEARITE}, quels que soient leur sens et leur longueur ${COURS_COMPARER}.`)],
  sens: [texte("Deux vecteurs ont le même sens quand ils sont colinéaires (critère "), latex("x_u\\cdot y_v-y_u\\cdot x_v=0"), texte(") et orientés du même côté : l'un est un multiple positif de l'autre "), texte(`${COURS_COMPARER}.`)],
};

export function correctionDetailleeComparaisonVecteurs(e: ExerciceComparaisonVecteurs): EtapeCorrection[] {
  const ref = e.vecteurs.find((v) => v.label === e.labelReference)!;
  const autres = e.vecteurs.filter((v) => v.label !== ref.label);
  const r = ref.composantes;
  const lecture: LigneCalcul[] = e.vecteurs.map((v) => ligne(`${vec(v.label)}=${col(v.composantes)}`, v.label === ref.label ? `${fmtDeplacement(v.composantes)} (vecteur de référence)` : fmtDeplacement(v.composantes)));
  const tests: LigneCalcul[] = [];
  if (e.propriete === "longueur") {
    const n = r.x * r.x + r.y * r.y;
    tests.push(ligne(`\\|${vec(ref.label)}\\|^2=${carre(r.x)}+${carre(r.y)}=${q(n)}`, "référence"));
    for (const v of autres) {
      const m = v.composantes.x ** 2 + v.composantes.y ** 2;
      tests.push(ligne(`\\|${vec(v.label)}\\|^2=${carre(v.composantes.x)}+${carre(v.composantes.y)}=${q(m)}`, m === n ? "même longueur" : "longueur différente"));
    }
  } else {
    for (const v of autres) {
      const c = r.x * v.composantes.y - r.y * v.composantes.x;
      const lig = `${fois(r.x, v.composantes.y)}-${fois(r.y, v.composantes.x)}=${q(c)}`;
      if (c !== 0) tests.push(ligne(lig, [texte("critère de "), latex(vec(ref.label)), texte(", "), latex(vec(v.label)), texte(" non nul : pas parallèles")]));
      else if (e.propriete === "direction") tests.push(ligne(lig, [texte("critère de "), latex(vec(ref.label)), texte(", "), latex(vec(v.label)), texte(" nul : même direction")]));
      else {
        const k = coefficient(v, ref);
        tests.push(ligne(lig, [texte("critère de "), latex(vec(ref.label)), texte(", "), latex(vec(v.label)), texte(" nul, "), latex(`${vec(v.label)}=${coefVec(k)}${vec(ref.label)}`), texte(k > 0 ? " : même sens" : " : sens opposé")]));
      }
    }
  }
  const attendus = e.labelsCorrects.map((l) => vec(l)).join(",\\ ");
  const egalites = egalitesAttendues(e);
  const lignesB: LigneCalcul[] = egalites.map((x) => {
    const v = e.vecteurs.find((w) => w.label === x.label)!;
    return ligne(`${vec(x.label)}=${col(v.composantes)}=${coefVec(x.k)}${col(r)}`, x.k === 1 ? `mêmes composantes que ${ref.label}` : `chaque composante est ${nT(x.k)} fois celle de ${ref.label}`);
  });
  return finaliserCorrigeVecteurs([
    utilise("a", DEFINITION[e.propriete]),
    calcul("a", lecture, [], "Composantes lues sur le quadrillage"),
    calcul("a", tests, [], e.propriete === "longueur" ? "Normes au carré" : "Comparaison avec la référence"),
    {
      ...resultat("a", [texte(`Vecteurs ${e.propriete === "longueur" ? "de même longueur" : e.propriete === "direction" ? "de même direction" : "de même sens"} que `), latex(vec(ref.label)), texte(" (en couleur sur la figure) : "), latex(attendus), texte(".")]),
      figureHtml: construireSvgComparaison(e, e.labelsCorrects),
    },
    piege("a", [
      texte(
        e.propriete === "longueur"
          ? "Même longueur ne veut pas dire même direction : un vecteur « tourné » de même norme convient aussi."
          : e.propriete === "sens"
            ? "Un vecteur parallèle mais orienté dans l'autre sens (k négatif) n'a pas le même sens."
            : "Un vecteur parallèle orienté dans l'autre sens a la même direction : son coefficient k est négatif.",
      ),
    ]),
    utilise("b", [texte("Deux vecteurs colinéaires : chaque composante de l'un est k fois celle de l'autre ; |k| est le rapport des longueurs et le signe de k dit le sens "), texte(`${COURS_COLINEARITE}.`)]),
    calcul("b", lignesB),
    resultat("b", [latex(egalitesLatex(e))]),
    piege("b", [texte("Le signe de k vient du sens : un vecteur orienté dans l'autre sens que "), latex(vec(ref.label)), texte(" a un coefficient négatif.")]),
  ]);
}
