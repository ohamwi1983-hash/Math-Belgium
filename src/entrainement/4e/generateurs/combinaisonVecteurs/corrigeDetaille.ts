import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceCombinaisonVecteurs } from "../../core/combinaisonVecteurs.types";
import { formatCoefficientsReduitsLatex, formatConvertiLatex, formatDistribueLatex, formatEquationReduiteLatex, formatExpressionLatex, formatReponseColonneLatex, idsConcernesRegroupementLatex } from "../../ui/formatCombinaisonVecteurs";
import { COURS_ADDITION_REPERE, COURS_MULTIPLICATION_REPERE, COURS_OPPOSES, col, finaliserCorrigeVecteurs, lignesComposantes, plusQ, q, qp, sansDoublons, sub, type V } from "../../ui/corrigeVecteurs1";

/**
 * Corrigé détaillé « comme au tableau » de gen22 « Composantes de combinaisons linéaires » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN : « a » réduction (distribuer,
 * \vec{BA} = −\vec{AB}, regrouper — expressions de `ui/formatCombinaisonVecteurs.ts`, les mêmes que
 * l'écran), « b » composantes (une composante à la fois). Partagé par l'adaptateur et l'appli.
 */

/** Membre de droite d'une égalité « \vec{t} = … » produite par l'écran. */
function droite(egalite: string): string {
  return egalite.slice(egalite.indexOf("=") + 1).replace(/\s+/g, "");
}

function composantesDe(e: ExerciceCombinaisonVecteurs, id: string): V {
  if (id === "AB" && e.points) return sub(e.points.B, e.points.A);
  return e.vecteursLibres.find((v) => v.nom === id)!.composantes;
}

function lignesAxe(e: ExerciceCombinaisonVecteurs, axe: "x" | "y", bases: { id: string; c: number; v: V }[]): LigneCalcul[] {
  const t = e.resultatNom;
  const termes = bases.map((b, i) => {
    const val = qp(b.v[axe]);
    const abs = Math.abs(b.c);
    const corps = abs === 1 ? val : `${q(abs)}\\cdot ${val}`;
    return i === 0 ? `${b.c < 0 ? "-" : ""}${corps}` : `${b.c < 0 ? "-" : "+"}${corps}`;
  });
  const produits = bases.map((b) => b.c * b.v[axe]);
  const somme = produits.reduce((a, p) => a + p, 0);
  const sommeLatex = produits.map((p, i) => (i === 0 ? q(p) : plusQ(p) || "+0")).join("");
  return sansDoublons([
    ligne(`${axe}_${t}=${termes.join("")}`, axe === "x" ? "premières composantes, chacune multipliée par son coefficient" : "secondes composantes, chacune multipliée par son coefficient"),
    ligne(`=${sommeLatex}`),
    ligne(`=${q(somme)}`),
  ]);
}

export function correctionDetailleeCombinaisonVecteurs(e: ExerciceCombinaisonVecteurs): EtapeCorrection[] {
  const t = `\\vec{${e.resultatNom}}`;
  const depart = formatExpressionLatex(e).replace(/\s+/g, "");
  const distribue = droite(formatDistribueLatex(e));
  const converti = droite(formatConvertiLatex(e));
  const reduit = formatCoefficientsReduitsLatex(e);
  const aParentheses = e.groupes.some((g) => g.termes.length > 1);
  const lignesA: LigneCalcul[] = [ligne(depart, "expression de l'énoncé")];
  if (aParentheses) lignesA.push(ligne(`=${distribue}`, "on distribue chaque coefficient sur les termes de sa parenthèse"));
  if (e.points && converti !== distribue) lignesA.push(ligne(`=${converti}`, [latex("\\vec{BA}=-\\vec{AB}")]));
  lignesA.push(ligne(`=${reduit}`, idsConcernesRegroupementLatex(e).length ? "on regroupe les vecteurs identiques" : "on range les vecteurs dans l'ordre de la base"));

  const bases = e.baseCanonique.filter((id) => e.coefficientsReduits[id] !== 0).map((id) => ({ id, c: e.coefficientsReduits[id], v: composantesDe(e, id) }));
  const avecAB = !!e.points && bases.some((b) => b.id === "AB");
  // « Sans parenthèses » : expression déjà réduite, un seul écran (composantes, lettre « a ») —
  // lot C de l'audit 4e ch. 6 (G6), même séquence que l'appli (`phaseInitiale`).
  const reduction = e.variante !== "plate";
  const lc = reduction ? "b" : "a";
  const etapesReduction: EtapeCorrection[] = [
    utilise("a", [
      texte(`Un coefficient devant une parenthèse multiplie chacun de ses termes ; `),
      ...(e.points ? [latex("\\vec{BA}=-\\vec{AB}"), texte(` : vecteurs opposés ${COURS_OPPOSES} ; `)] : []),
      texte("on additionne ensuite les coefficients d'un même vecteur."),
    ]),
    calcul("a", sansDoublons(lignesA)),
    resultat("a", [latex(formatEquationReduiteLatex(e).replace(/\s+/g, ""))]),
    piege(
      "a",
      e.points
        ? [latex("\\vec{BA}=-\\vec{AB}"), texte(" : oublier ce changement de signe fausse le regroupement des termes en "), latex("\\vec{AB}"), texte(".")]
        : [texte("Le coefficient devant une parenthèse multiplie tous ses termes, et un signe « − » devant un groupe change le signe de chacun d'eux.")],
    ),
  ];
  const etapes: EtapeCorrection[] = [
    ...(reduction ? etapesReduction : []),
    utilise(lc, [
      texte(`En repère, k fois un vecteur multiplie chaque composante par k ${COURS_MULTIPLICATION_REPERE}, et une somme se calcule composante par composante ${COURS_ADDITION_REPERE}`),
      ...(avecAB ? [texte(" ; "), latex("\\vec{AB}"), texte(" a pour composantes extrémité − origine.")] : [texte(".")]),
    ]),
  ];
  if (avecAB) etapes.push(calcul(lc, lignesComposantes("AB", e.points!.A, e.points!.B), [], "Composantes de AB"));
  etapes.push(
    calcul(lc, [ligne(`${t}=${reduit}`, reduction ? "expression réduite (étape 1)" : "expression de l'énoncé, déjà réduite"), ...lignesAxe(e, "x", bases), ...lignesAxe(e, "y", bases)], [], "Composantes"),
    resultat(lc, [latex(formatReponseColonneLatex(e).replace(/\s+/g, ""))]),
    verification(lc, [texte("Ligne par ligne, le résultat est la combinaison des colonnes : ")], [
      ligne(`${t}=${bases.map((b, i) => `${i === 0 ? (b.c < 0 ? "-" : "") : b.c < 0 ? "-" : "+"}${Math.abs(b.c) === 1 ? "" : q(Math.abs(b.c))}${col(b.v)}`).join("")}=${col(e.reponse)}`, "même vecteur"),
    ]),
    piege(lc, [texte("Un coefficient négatif s'applique aux deux composantes : une composante négative multipliée par un coefficient négatif donne un nombre positif.")]),
  );
  return finaliserCorrigeVecteurs(etapes);
}
