import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceDerivabilite } from "../../core5e/derivabilite";
import { unilaterale, verdict } from "../../core5e/derivabilite";
import { consigne, consigneGenerale, definitionL, phases, reponse } from "../../ui5e/formatDerivabilite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDerivabilite } from "./index";
import { correctionDetailleeDerivabilite } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen75` « Dérivable ou non en a ? » (version modeste). Énoncé papier = f et
 * UNE consigne globale, la même pour tous les verdicts (« Étudie la continuité puis la dérivabilité
 * de f en a (nombres dérivés à gauche et à droite). Si f est dérivable en a, donne une équation de la
 * tangente ; sinon, précise pourquoi (point anguleux, tangente verticale, discontinuité). ») ; les
 * étapes vont au corrigé. Pas de regroupement a), b), c) : la consigne porte la valeur de a et, pour
 * la racine, le domaine (données propres à l'instance) ; le groupe à verdict mêlerait de toute façon
 * des énoncés de forme différente.
 */

type E = ExerciceDerivabilite;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), questions: phases(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const out: FragmentConsigne[] = [...fr(reponse(e, "continuite")), t(" ; "), ...(unilaterale(e) ? [] : [...fr(reponse(e, "gauche")), t(" ; ")]), ...fr(reponse(e, "droite")), t(" ; "), ...fr(reponse(e, "verdict"))];
  if (verdict(e) === "derivable") out.push(t(" Tangente : "), ...fr(reponse(e, "tangente")));
  return out;
}

function enoncePapier(e: E): EnoncePapier {
  const dom: FragmentConsigne[] = e.variante === "racine" ? [t(" (définie sur "), f(`[${e.a}\\,;+\\infty\\mathclose{[}`), t(")")] : [];
  return {
    section: {
      enteteFragments: [
        t("On considère la fonction f définie par "),
        f(definitionL(e)),
        ...dom,
        t(". Étudie la continuité puis la dérivabilité de f en "),
        f(`a=${e.a}`),
        t(" (nombres dérivés à gauche et à droite). Si f est dérivable en "),
        f(`${e.a}`),
        t(", donne une équation de la tangente en ce point ; sinon, précise pourquoi (point anguleux, tangente verticale, discontinuité)."),
      ],
      questions: [],
    },
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Critères CONSTANTS pour tous les verdicts et toutes les familles (groupe à verdict : le niveau et
 * la durée ne doivent rien trahir) : quatre étapes qui transforment (continuité, deux taux, verdict ;
 * la tangente, propre au verdict « dérivable », n'est pas comptée à part), méthode 1 (choisir le bon
 * morceau, traiter |h|), piège 1 (f continue mais pas dérivable, ou saut), nombres exacts. */
function criteresDifficulte(_e: E): CriteresDifficulte {
  return { etapesTransformation: 4, etapesLecture: 0, methode: 1, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const derivable = verdict(e) === "derivable";
  const cote = unilaterale(e) ? "b" : "c";
  const lv = unilaterale(e) ? "c" : "d";
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Continuité : "), ...fr(reponse(e, "continuite"))], points: 1 },
      ...(unilaterale(e) ? [] : [{ sousQuestion: "b", critere: [t("Nombre dérivé à gauche : "), ...fr(reponse(e, "gauche"))], points: 0.75 }]),
      { sousQuestion: cote, critere: [t("Nombre dérivé à droite : "), ...fr(reponse(e, "droite"))], points: unilaterale(e) ? 1.5 : 0.75 },
      { sousQuestion: lv, critere: [t("Conclusion justifiée : "), ...fr(reponse(e, "verdict"))], points: derivable ? 1 : 1.5 },
      ...(derivable ? [{ sousQuestion: "e", critere: [t("Tangente : "), ...fr(reponse(e, "tangente"))], points: 0.5 }] : []),
    ],
    erreursFrequentes: [
      { description: [t("« Dérivable » conclu parce que f est continue")], cout: "0 pt sur la conclusion" },
      { description: [t("Limite infinie du taux prise pour un nombre dérivé")], cout: "0 pt sur la conclusion" },
      { description: [t("Mauvais morceau utilisé d'un côté de a (ou |h| = h pour h < 0)")], cout: "moitié des points de l'étape" },
    ],
    reponsesAcceptees: [[t("Taux non simplifié mais juste ; conclusion rédigée en phrase équivalente")]],
  };
}

/** `forme` constante : la famille de la fonction annonce le verdict (groupe à verdict) ; tout est
 * exact (pas de `calcul`), aucun cas particulier (un verdict n'en est jamais un). */
export function profilDerivabilite(_e: E): ProfilInstance {
  return { casParticulier: null, forme: "derivabilite" };
}

export const adaptateurEvaluationDerivabilite: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Dérivable ou non en a ? — Évaluation",
  nomFichierBase: "derivable-ou-non",
  genererInstance: genererExerciceDerivabilite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDerivabilite,
  bareme,
  enoncePapier,
  profilInstance: profilDerivabilite,
  groupesVerdict: [{ id: "groupe_derivabilite", label: "Dérivable, point anguleux, tangente verticale ou pas continue (tiré au hasard)", variantes: ["morceauxDerivable", "morceauxAnguleux", "morceauxDiscontinu", "absolue", "racine"] }],
};
