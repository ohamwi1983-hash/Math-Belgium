import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte, lettreEtape } from "../../../export/corrigeTableau";
import type { Exercice100, Type100 } from "../../core6e/quelleFormule";
import { TYPES_100, phases100 } from "../../core6e/quelleFormule";
import { consigne100, consigneGlobale100, nomType, recap100, reponse100, situation100 } from "../../ui6e/formatQuelleFormule";
import { CATALOGUE_100, construireAvecVariante100, genererExercice100 } from "./index";
import { correctionDetaillee100 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen100` « Quelle formule ? ». Énoncé papier = situation (avec sa question) +
 * consigne globale (les trois questions du cours, le type, le calcul) ; les écrans deviennent les
 * étapes du corrigé. Le TYPE est le verdict : jamais dans `forme`, jamais cas particulier ; les
 * variantes portent le nom du type → un groupe à verdict les réunit dans le panneau d'évaluation.
 * Niveau et durée CONSTANTS quel que soit le type (critères fixes : 3 étapes — les trois questions du
 * cours comptent pour une décision —, méthode 1, sans charge)
 * — le nombre d'écrans (4 ou 5) ne doit pas trahir le verdict. Aucun `calcul` (reconnaître le
 * groupement est l'objet ; la calculatrice ne le fait pas). Regroupement a), b), c) : entrée `6gen100`
 * de `REGROUPEMENTS` (consigne commune, ligne = la situation).
 */

type E = Exercice100;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation100(e)), questions: phases100(e).map((p) => ({ consigne: fr(consigne100(e, p)) })) };
}

const reponseBreve = (e: E): FragmentConsigne[] => [t(`${nomType(e.type)} : `), ...fr(reponse100(e, "calcul"))];

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(situation100(e)), questions: [{ consigne: fr(consigneGlobale100()) }] },
    etapesParQuestion: [phases100(e).map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: phases100(e).flatMap((p, i) => [t(i > 0 ? " ; " : ""), ...fr(recap100(e, p))]) }];
}

function criteresDifficulte(): CriteresDifficulte {
  // Méthode 1 : choisir parmi les groupements du cours (c'est l'objet de l'exercice). Aucun piège
  // dans les données propre à un type (le piège A / C est le même partout). Entiers → nombres 0.
  return { etapesTransformation: 3, etapesLecture: 0, methode: 1, piege: 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const ph = phases100(e);
  const q = ph.length === 5 ? 0.5 : 0.5;
  const criteres: BaremeExercice["criteres"] = ph.map((p, i) => {
    const sq = lettreEtape(i);
    if (p === "type") return { sousQuestion: sq, critere: [t("Type de groupement reconnu : "), ...fr(reponse100(e, p))], points: 1 };
    if (p === "calcul") return { sousQuestion: sq, critere: [t("Formule du type et calcul : "), ...fr(reponse100(e, p))], points: ph.length === 5 ? 1.5 : 2 };
    return { sousQuestion: sq, critere: [t(p === "ordre" ? "Ordre : " : p === "repetition" ? "Répétition : " : "Tous utilisés : "), ...fr(recap100(e, p)), t(", justifié")], points: q };
  });
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: [
      { description: [t("Arrangement et combinaison confondus (l'ordre compte ou non)")], cout: "0 pt sur le type et le calcul" },
      { description: [t("Répétition ignorée (ou supposée à tort)")], cout: "0 pt sur le calcul" },
      ...(e.type === "circulaire" ? [{ description: [t("Disposition en cercle traitée comme un alignement (n! au lieu de (n − 1)!)")], cout: "moitié des points du calcul" }] : []),
      ...(e.type === "permRep" ? [{ description: [t("Éléments identiques non divisés (n! seul)")], cout: "moitié des points du calcul" }] : []),
    ],
    reponsesAcceptees: [[t("Le résultat sous forme de calcul exact (factorielles, puissance, coefficient)")]],
  };
}

export function profil100(_e: E): ProfilInstance {
  return { casParticulier: null };
}

export const adaptateurEvaluation100: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Quelle formule ? — Évaluation",
  nomFichierBase: "quelle-formule",
  genererInstance: genererExercice100,
  catalogueVariantes: CATALOGUE_100,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante100(id as Type100),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee100,
  bareme,
  enoncePapier,
  profilInstance: profil100,
  groupesVerdict: [{ id: "groupe_type", label: "Type de groupement tiré au hasard", variantes: [...TYPES_100] }],
};
