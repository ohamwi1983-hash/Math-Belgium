import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceCP } from "../../core6e/courbeParametree";
import { extremites, phases } from "../../core6e/courbeParametree";
import { listeL } from "../../ui6e/outilsLieuxLotH2";
import { CONSIGNE_GLOBALE, conditionJusteL, consigne, consigneGenerale, equationL, LIBELLES_PARTIE } from "../../ui6e/formatCourbeParametree";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceCP } from "./index";
import { correctionDetailleeCP } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen129` « Courbe paramétrée : élimination et restriction ». Énoncé papier =
 * la représentation paramétrique (système et intervalle de t) + consigne globale (éliminer t, puis
 * préciser la partie décrite) ; les écrans deviennent les étapes du corrigé, dont la figure (courbe
 * complète, partie décrite, extrémités). VERDICT = partie décrite (entière, moitié, arc), tiré dans
 * chaque série : jamais dans `forme` (= support), jamais un cas particulier ; niveau et durée CONSTANTS
 * (trois étapes `sansCharge`, méthode 1 — choisir l'identité —, piège 1 constant : la restriction est le
 * piège). Aucun `calcul` (éliminer un paramètre : tiré « interdite » ET « autorisée »).
 */

type E = ExerciceCP;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];
const L = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), questions: phases(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const base = [L(equationL(e)), t(" ; "), t(LIBELLES_PARTIE[e.variante][e.partie].replace(/^./, (c) => c.toLowerCase()))];
  if (e.partie === "entiere") return base;
  return [...base, t(" : "), L(conditionJusteL(e)), t(", extrémités "), L(listeL(extremites(e)))];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(consigneGenerale(e)), questions: [{ consigne: [t(CONSIGNE_GLOBALE)] }] },
    etapesParQuestion: [phases(e).map((_p, i) => "abcd"[i]!)],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(_e: E): CriteresDifficulte {
  return { etapesTransformation: 3, etapesLecture: 0, methode: 1, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const criteres =
    e.partie === "entiere"
      ? [
          { sousQuestion: "b", critere: [t("Paramètre éliminé, équation cartésienne : "), L(equationL(e))], points: 2.5 },
          { sousQuestion: "c", critere: [t("Courbe entière décrite, justifiée par les valeurs prises")], points: 1.5 },
        ]
      : [
          { sousQuestion: "b", critere: [t("Paramètre éliminé, équation cartésienne : "), L(equationL(e))], points: 2 },
          { sousQuestion: "c", critere: [t("Partie décrite : "), t(LIBELLES_PARTIE[e.variante][e.partie].replace(/^./, (c) => c.toLowerCase()))], points: 1 },
          { sousQuestion: "d", critere: [t("Condition et extrémités : "), L(conditionJusteL(e))], points: 1 },
        ];
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: [
      { description: [t("Restriction oubliée : toute la courbe donnée comme lieu")], cout: e.partie === "entiere" ? "—" : "0 pt sur la partie décrite" },
      { description: [t("Identité mal choisie ou mal appliquée (cos(2t) confondu avec cos² t)")], cout: "moitié des points de l'équation" },
    ],
    reponsesAcceptees: [[t("Toute équation équivalente (développée, réduite, multipliée par un nombre non nul) ; toute condition équivalente sur x ou y")]],
  };
}

/** `forme` = support seul (jamais la partie décrite). */
export function profilCP(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationCP: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Courbe paramétrée : élimination et restriction — Évaluation",
  nomFichierBase: "courbe-parametree-elimination-restriction",
  genererInstance: genererExerciceCP,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeCP,
  bareme,
  enoncePapier,
  profilInstance: profilCP,
};
