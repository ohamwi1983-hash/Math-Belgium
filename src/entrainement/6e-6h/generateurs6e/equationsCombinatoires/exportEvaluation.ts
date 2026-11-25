import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice101, Variante101 } from "../../core6e/equationsCombinatoires";
import { phases101, racines101 } from "../../core6e/equationsCombinatoires";
import { consigne101, consigneGlobale101, recap101, reponse101 } from "../../ui6e/formatEquationsCombinatoires";
import { mil } from "../../ui6e/nombresCombinatoireLotH";
import { CATALOGUE_101, construireAvecVariante101, genererExercice101 } from "./index";
import { correctionDetaillee101 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen101` « Factorielles et équations combinatoires ». Énoncé papier =
 * l'équation et son inconnue (« Résous l'équation …, d'inconnue naturelle n. ») ; les écrans
 * (polynôme, racines, valeur admissible ; ou propriété, solution) deviennent les étapes du corrigé.
 * Aucun `calcul` (l'application Équations de la calculatrice résout le second degré, pas la
 * modélisation), aucun cas particulier, aucun verdict (la racine à rejeter est toujours là) ;
 * `forme` = variante. Regroupement a), b), c) : entrée `6gen101` de `REGROUPEMENTS` (« Résous chaque
 * équation, d'inconnue naturelle n. », ligne = l'équation).
 */

type E = Exercice101;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGlobale101(e)), questions: phases101(e).map((p) => ({ consigne: fr(consigne101(e, p)) })) };
}

const reponseBreve = (e: E): FragmentConsigne[] => fr(reponse101(e, phases101(e).at(-1)!));

function enoncePapier(e: E): EnoncePapier {
  return { section: { questions: [{ consigne: fr(consigneGlobale101(e)) }] }, etapesParQuestion: [phases101(e).map((_, i) => lettreEtape(i))], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: phases101(e).flatMap((p, i) => [t(i > 0 ? " ; " : ""), ...fr(recap101(e, p))]) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Méthode 0 : procédure du cours (réécrire, résoudre, trier) ; symétrie : 1 (reconnaître la
  // propriété). Piège dans les DONNÉES : la solution négative à rejeter (variantes polynomiales).
  const sym = e.variante === "symetrie";
  return { ...etapesDuCorrige(correctionDetaillee101(e), []), methode: sym ? 1 : 0, piege: sym ? 0 : 1, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  if (e.variante === "symetrie")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Symétrie reconnue, indices complémentaires : "), ...fr(reponse101(e, "propriete"))], points: 2 },
        { sousQuestion: "b", critere: [t("Solution : "), ...fr(reponse101(e, "valeur"))], points: 2 },
      ],
      erreursFrequentes: [{ description: [t("« Aucune solution » parce que les indices sont différents")], cout: "0 pt" }],
      reponsesAcceptees: [],
    };
  const [r1] = racines101(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Membre de gauche simplifié en polynôme : "), ...fr(reponse101(e, "polynome"))], points: 1.5 },
      { sousQuestion: "b", critere: [t("Équation du second degré résolue : "), ...fr(reponse101(e, "racines"))], points: 1.5 },
      { sousQuestion: "c", critere: [t("Solution négative rejetée, justifiée : "), ...fr(reponse101(e, "admissible"))], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Solution "), { type: "latex", valeur: `n=${mil(r1)}` }, t(" gardée")], cout: "0 pt sur l'étape 3" },
      ...(e.variante === "combinaison" || e.variante === "mixte" ? [{ description: [t("Division par 2! oubliée")], cout: "moitié des points des étapes 1 et 2" }] : []),
    ],
    reponsesAcceptees: [[t("Toute écriture équivalente du polynôme (factorisée ou développée)")]],
  };
}

export function profil101(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluation101: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Équations combinatoires — Évaluation",
  nomFichierBase: "equations-combinatoires",
  genererInstance: genererExercice101,
  catalogueVariantes: CATALOGUE_101,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante101(id as Variante101),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee101,
  bareme,
  enoncePapier,
  profilInstance: profil101,
};
