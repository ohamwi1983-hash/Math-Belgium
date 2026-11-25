import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { texte } from "../../../export/corrigeTableau";
import type { Exercice104, Variante104 } from "../../core6e/etoilesBarres";
import { pLibre } from "../../core6e/etoilesBarres";
import { consigne104, consigneGlobale104, phases104, reponse104Frag, situation104 } from "../../ui6e/formatEtoilesBarres";
import { CL, comb, mil } from "../../ui6e/nombresCombinatoireLotH";
import { CATALOGUE_104, construireAvecVariante104, genererExercice104 } from "./index";
import { correctionDetaillee104 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen104` « Étoiles et barres ». Énoncé papier = situation (avec sa question)
 * + consigne globale « … par la méthode des étoiles et des barres » ; les trois écrans (cases et
 * objets, codage, calcul) deviennent les étapes du corrigé. Aucun `calcul` dans le profil : la
 * calculatrice ne modélise pas la situation (décision du 24/11). Aucun cas particulier, aucun verdict ;
 * `forme` = variante (« au moins un » ajoute une étape de raisonnement). Regroupement a), b), c) :
 * entrée `6gen104` de `REGROUPEMENTS` (ligne = la situation, consigne commune).
 */

type E = Exercice104;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];
const LETTRES = ["a", "b", "c"];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation104(e)), questions: phases104().map((p) => ({ consigne: fr(consigne104(e, p)) })) };
}

const reponseBreve = (e: E): FragmentConsigne[] => fr(reponse104Frag(e, "calcul"));

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: fr(situation104(e)), questions: [{ consigne: fr(consigneGlobale104()) }] }, etapesParQuestion: [LETTRES], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: phases104().flatMap((p, i) => [t(i > 0 ? " ; " : ""), ...fr(reponse104Frag(e, p))]) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Méthode 1 : reconnaître Γ (choisir parmi les groupements du cours). Piège dans les DONNÉES :
  // « au moins un par case » (contrainte à retirer d'abord). Entiers exacts → nombres 0.
  return { ...etapesDuCorrige(correctionDetaillee104(e), []), methode: 1, piege: e.variante === "auMoinsUn" ? 1 : 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const libre = pLibre(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t(e.variante === "auMoinsUn" ? "Cases et objets restants (un objet déjà placé par case) : " : "Cases et objets identifiés : "), ...fr(reponse104Frag(e, "np"))], points: 1 },
      { sousQuestion: "b", critere: [t("Codage en étoiles et barres : "), ...fr(reponse104Frag(e, "codage"))], points: 1 },
      { sousQuestion: "c", critere: [t("Formule et calcul : "), ...fr(reponse104Frag(e, "calcul"))], points: 2 },
    ],
    erreursFrequentes: [
      { description: [t("Combinaison sans répétition "), { type: "latex", valeur: `${CL(e.n, libre)}=${mil(comb(e.n, libre))}` }], cout: "0 pt sur l'étape 3" },
      { description: [t("Une barre de trop (n barres au lieu de n − 1)")], cout: "−1" },
      ...(e.variante === "auMoinsUn" ? [{ description: [t("Objet obligatoire de chaque case oublié (cases vides comptées)")], cout: "moitié des points de l'étape 3" }] : []),
    ],
    reponsesAcceptees: [[t("Le résultat sous forme de calcul exact ("), { type: "latex", valeur: CL("n+p-1", "p") }, t(", quotient de factorielles)")]],
  };
}

export function profil104(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluation104: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Étoiles et barres — Évaluation",
  nomFichierBase: "etoiles-et-barres",
  genererInstance: genererExercice104,
  catalogueVariantes: CATALOGUE_104,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante104(id as Variante104),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee104,
  bareme,
  enoncePapier,
  profilInstance: profil104,
};
