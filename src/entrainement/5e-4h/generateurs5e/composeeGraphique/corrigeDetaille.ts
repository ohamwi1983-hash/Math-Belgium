import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise } from "../../../export/corrigeTableau";
import type { ExerciceComposeeGraphique, QuestionComposeeGraphique } from "../../core5e/composeeGraphique.types";
import { imageChercheeLatex, nomInterne, resultatLatex } from "../../ui5e/formatComposeeGraphique";
import { formatEnsembleReelLatex } from "../../ui5e/formatDomaineDefinition";
import { finaliserCorrige } from "../../ui5e/corrigeTrigonometrie1";
import { COURS_GRAPHIQUE, jf, t, f } from "../../ui5e/corrigeFonctions1";
import { domaineCourbe } from "./courbes";

/**
 * Corrigé détaillé « comme au tableau » de 5gen4 (composée lue sur deux graphiques) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (une question = un écran) : la
 * composée réécrite f(g(a)), une ligne par chose lue (« g(a) = b », lu sur le graphe de g ;
 * « f(b) = c », lu sur le graphe de f) puis la substitution, ou le domaine de l'extérieure lu et
 * « b ∉ dom f ». « Résultat » = la réponse de l'écran (`resultatLatex`). SANS `docx` : importé par
 * l'adaptateur ET par `App5gen4.tsx`.
 */

const LETTRES = "abcdefgh";

const nomExterne = (q: QuestionComposeeGraphique): "f" | "g" => (nomInterne(q.composition) === "f" ? "g" : "f");

/** Réponse de l'écran en fragments : « f(g(−7)) = 3 » ou « f(g(−7)) n'existe pas ». */
export function fragmentsResultat(q: QuestionComposeeGraphique): FragmentConsigne[] {
  const r = resultatLatex(q);
  return r.existe ? [f(r.latex)] : [f(r.latex), t(" n'existe pas")];
}

export const PIEGE_COMPOSEE_GRAPHIQUE =
  "On lit d'abord la fonction intérieure (celle écrite à droite) ; si l'image obtenue sort du domaine de l'extérieure (aucun point de son graphe à cette abscisse), la composée n'existe pas — on ne prolonge jamais la courbe.";

function etapeQuestion(e: ExerciceComposeeGraphique, q: QuestionComposeeGraphique, l: string, avecPiege: boolean): EtapeCorrection[] {
  const int = nomInterne(q.composition);
  const ext = nomExterne(q);
  const b = q.bAttendu;
  const lignes: LigneCalcul[] = [
    ligne(`(${ext}\\circ ${int})(${q.a})=${imageChercheeLatex(q)}`, "définition de la composée : on calcule d'abord l'intérieur"),
    ligne(`${int}(${q.a})=${b}`, jf("lu sur le graphe de ", { l: int }, " : le point d'abscisse ", { l: `${q.a}` }, " a pour ordonnée ", { l: `${b}` })),
  ];
  if (q.resultatExiste && q.resultatAttendu !== null) {
    lignes.push(ligne(`${ext}(${b})=${q.resultatAttendu}`, jf("lu sur le graphe de ", { l: ext }, " : le point d'abscisse ", { l: `${b}` }, " a pour ordonnée ", { l: `${q.resultatAttendu}` })));
    lignes.push(ligne(`${imageChercheeLatex(q)}=${ext}(${b})`, jf("on remplace ", { l: `${int}(${q.a})` }, " par ", { l: `${b}` })));
    lignes.push(ligne(`=${q.resultatAttendu}`));
  } else {
    const [xMin, xMax] = domaineCourbe(ext === "f" ? e.f : e.g);
    const dom = formatEnsembleReelLatex({ forme: "intervalles", points: [], morceaux: [{ inf: xMin, sup: xMax, infInclus: true, supInclus: true }] });
    lignes.push(ligne(`\\operatorname{dom}${ext}=${dom}`, jf("lu sur le graphe de ", { l: ext }, " : il va de l'abscisse ", { l: `${xMin}` }, " à l'abscisse ", { l: `${xMax}` })));
    lignes.push(ligne(`${b}\\notin\\operatorname{dom}${ext}`, jf("le graphe de ", { l: ext }, " n'a aucun point d'abscisse ", { l: `${b}` })));
  }
  return [
    utilise(l, [
      f(`(${ext}\\circ ${int})(${q.a})=${imageChercheeLatex(q)}`),
      t(" : on lit d'abord l'image par "), f(int), t(" (la fonction intérieure, écrite à droite), puis l'image de ce nombre par "), f(ext), t(" — s'il appartient au domaine de "), f(ext), t(` ${COURS_GRAPHIQUE}.`),
    ]),
    calcul(l, lignes),
    resultat(l, fragmentsResultat(q)),
    ...(avecPiege ? [piege(l, [t(PIEGE_COMPOSEE_GRAPHIQUE)])] : []),
  ];
}

export function correctionDetailleeComposeeGraphique(e: ExerciceComposeeGraphique): EtapeCorrection[] {
  const indexPiege = e.questions.findIndex((q) => !q.resultatExiste);
  return finaliserCorrige(e.questions.flatMap((q, i) => etapeQuestion(e, q, LETTRES[i]!, i === indexPiege)));
}
