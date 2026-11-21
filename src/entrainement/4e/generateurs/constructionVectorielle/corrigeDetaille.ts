import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceConstructionVectorielle } from "../../core/constructionVectorielle.types";
import { COURS_MULTIPLICATION_REPERE, COURS_VECTEUR, COURS_MULTIPLIER, coefVec, col, finaliserCorrigeVecteurs, lignesComposantes, lignesCritereColinearite, lignesMultiple, nT, sub, vec } from "../../ui/corrigeVecteurs1";
import { construireSvgConstructionVectorielle } from "./figure";

/**
 * Corrigé détaillé « comme au tableau » de gen23 « Construction graphique de vecteurs » (un écran,
 * lettre « a ») — règle `.claude/rules/feuilles-evaluations.md`. La réponse est un TRACÉ : la figure
 * du corrigé (`figureHtml`, vecteur demandé tracé depuis un point d'ancrage) accompagne le résultat.
 * Partagé par l'adaptateur et l'appli (`AppConstructionVectorielle.tsx`).
 */

/** « 6 carreaux vers la droite et 3 vers le bas » (composante nulle omise). */
function deplacementTexte(v: { x: number; y: number }): string {
  const parts: string[] = [];
  const n = (k: number) => `${nT(Math.abs(k))} ${Math.abs(k) > 1 ? "carreaux" : "carreau"}`;
  if (v.x !== 0) parts.push(`${n(v.x)} vers la ${v.x > 0 ? "droite" : "gauche"}`);
  if (v.y !== 0) parts.push(`${n(v.y)} vers le ${v.y > 0 ? "haut" : "bas"}`);
  return parts.join(" et ");
}

export function correctionDetailleeConstructionVectorielle(e: ExerciceConstructionVectorielle): EtapeCorrection[] {
  const l = "a";
  const { coefficient: k, labelA: a, labelB: b } = e;
  const nomAB = `${a}${b}`;
  const ab = sub(e.pointB, e.pointA);
  const demande = `${coefVec(k)}${vec(nomAB)}`;
  const abs = Math.abs(k);
  return finaliserCorrigeVecteurs([
    utilise(l, k === 1 ? [texte("Un vecteur se trace depuis n'importe quel point : seuls comptent sa direction, son sens et sa longueur, donnés par ses composantes "), texte(`${COURS_VECTEUR}.`)] : [
      latex(demande),
      texte(` a la même direction que `),
      latex(vec(nomAB)),
      texte(`, ${k > 0 ? "le même sens (coefficient positif)" : "le sens opposé (coefficient négatif)"} et ${abs === 1 ? "la même longueur" : `une longueur ${nT(abs)} fois plus grande`} ${COURS_MULTIPLIER} ; en repère, chaque composante est multipliée par ${nT(k)} ${COURS_MULTIPLICATION_REPERE}.`),
    ]),
    calcul(l, lignesComposantes(nomAB, e.pointA, e.pointB), [], `Composantes de ${nomAB}`),
    ...(k === 1 ? [] : [calcul(l, lignesMultiple(demande, k, ab), [], "Vecteur demandé")]),
    {
      ...resultat(l, [latex(`${demande}=${col(e.cibleComposantes)}`), texte(` : depuis le point choisi, on avance de ${deplacementTexte(e.cibleComposantes)} (flèche orange, tracée ici depuis un point quelconque).`)]),
      figureHtml: `<div style="max-width:8cm;margin:0 auto">${construireSvgConstructionVectorielle(e, true)}</div>`,
    },
    ...(k === 1 ? [] : [verification(l, [texte("Même direction que "), latex(vec(nomAB)), texte(" : le critère de colinéarité est nul.")], lignesCritereColinearite(ab, e.cibleComposantes))]),
    piege(
      l,
      k < 0
        ? [texte("Le coefficient est négatif : la flèche va dans le sens opposé à celui de "), latex(vec(nomAB)), texte(".")]
        : [texte("Un vecteur n'a pas de position propre : il n'est pas obligatoire de partir de "), latex(a), texte(" ; seuls la direction, le sens et la longueur comptent.")],
    ),
  ]);
}
