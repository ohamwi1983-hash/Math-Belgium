import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceRealiteIllusion } from "../../core/realiteIllusion.types";
import { CONSIGNE_PAPIER, CONSIGNES_ETAPES_PAPIER, ENONCE_PAPIER, figureRI } from "../../ui/formatRealiteIllusion";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceRealiteIllusion } from "./index";
import { correctionDetailleeRealiteIllusion } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen135 « Réalité ou illusion ? » (Transférer).
 * Énoncé papier = une phrase (le solide, sa base, son dessus), la figure SANS prolongement et la
 * consigne du manuel « Ce solide, dont les faces sont supposées planes, peut-il exister ? Justifie. »
 * (aucune méthode) ; les trois écrans (plans, arêtes prolongées, verdict) deviennent les étapes a, b, c
 * du corrigé, figure annotée sous l'étape b. Regroupé a), b), c) avec une figure par ligne
 * (`REGROUPEMENTS.gen135`, `figure: true`) : la consigne est la même pour toutes les instances.
 */

type E = ExerciceRealiteIllusion;

/** Profil : `forme` = variante (dessin à arêtes convergentes ou verticales) ; le verdict n'y est
 * jamais (la série B le tire à nouveau, à parts égales). Aucun cas particulier, pas de `calcul`. */
export function profilRealiteIllusion(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

const enteteHtml = (e: E) => figureRI(e, "papier", 0);

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: [texte(ENONCE_PAPIER)], enteteHtml: enteteHtml(e), questions: CONSIGNES_ETAPES_PAPIER.map((c) => ({ consigne: [texte(c)] })) };
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: [texte(ENONCE_PAPIER)], enteteHtml: enteteHtml(e), questions: [{ consigne: [texte(CONSIGNE_PAPIER)] }] }, etapesParQuestion: [["a", "b", "c"]] };
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.verdict === "existe")
    return [texte(`Il peut exister : les arêtes latérales (AD), (BE) et (CF) prolongées sont ${e.disposition === "concourantes" ? "concourantes en S (tronc de pyramide)" : "parallèles (prisme coupé par un plan)"}.`)];
  return [texte("Il est impossible : (AD), (BE) et (CF), droites d'intersection des faces latérales deux à deux, ne sont ni concourantes ni parallèles sur le dessin.")];
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  const c = (sousQuestion: string, critere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(critere)], points });
  const err = (description: string, cout: string): ErreurFrequente => ({ description: [texte(description)], cout });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      c("a", "Les trois faces latérales nommées, sécantes deux à deux suivant (AD), (BE) et (CF)", 1),
      c("b", "Arêtes latérales prolongées sur la figure et leur position constatée (concourantes, parallèles ou ni l'un ni l'autre)", 1),
      c("c", "Verdict justifié par le théorème des trois plans et la conservation du parallélisme et du point commun par la perspective cavalière", 2),
    ],
    erreursFrequentes: [
      err("Trois plans qui passent par un même sommet (la base et deux faces latérales)", "0 pt sur l'étape 1"),
      err("« On ne peut pas savoir sur un dessin »", "0 pt sur l'étape 3"),
      err("Verdict juste sans citer le théorème des trois plans", "moitié des points sur l'étape 3"),
    ],
    reponsesAcceptees: [[texte("Un raisonnement par l'absurde rédigé autrement (« si le solide existait… »), pourvu qu'il nomme les trois faces latérales et le théorème.")]],
  };
}

/** Niveau : deux étapes qui raisonnent (choisir les trois plans, conclure) et une lecture (prolonger
 * les arêtes sur le dessin) ; méthode 2 (sur papier, rien n'indique le théorème ni les plans : l'élève
 * construit lui-même le modèle « trois faces planes → trois droites ») ; aucun piège dans les données
 * (le dessin « paraît normal » dans les deux verdicts) ; `sansCharge` → constant d'un verdict à l'autre. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeRealiteIllusion(e), ["b"]), methode: 2, piege: 0, nombres: 0, sansCharge: true };
}

export const adaptateurEvaluationRealiteIllusion: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilRealiteIllusion,
  titreDocument: "Réalité ou illusion ? — Évaluation",
  nomFichierBase: "realite-ou-illusion",
  genererInstance: genererExerciceRealiteIllusion,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeRealiteIllusion,
  bareme,
  enoncePapier,
};
