import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice103, Variante103 } from "../../core6e/anagrammesContraintes";
import { nbOccurrences, phases103 } from "../../core6e/anagrammesContraintes";
import { consigne103, consigneGlobale103, recap103, reponse103, situation103 } from "../../ui6e/formatAnagrammesContraintes";
import { CATALOGUE_103, construireAvecVariante103, genererExercice103 } from "./index";
import { correctionDetaillee103 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen103` « Anagrammes et contraintes ». Énoncé papier = situation + question
 * (« Justifie ton calcul. ») ; les écrans deviennent les étapes du corrigé. Aucun `calcul` (compter
 * les lettres et modéliser la contrainte : la calculatrice ne le fait pas), aucun cas particulier,
 * aucun verdict ; `forme` = variante. Regroupement a), b), c) : variante « anagrammes » seulement
 * (entrée `6gen103` de `REGROUPEMENTS`, ligne « le mot X ») ; les autres ont une contrainte propre
 * dans la consigne.
 */

type E = Exercice103;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation103(e)), questions: phases103(e).map((p) => ({ consigne: fr(consigne103(e, p)) })) };
}

const reponseBreve = (e: E): FragmentConsigne[] => fr(reponse103(e, phases103(e).at(-1)!));

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(situation103(e)), questions: [{ consigne: fr(consigneGlobale103(e)) }] },
    etapesParQuestion: [phases103(e).map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: phases103(e).flatMap((p, i) => [t(i > 0 ? " ; " : ""), ...fr(recap103(e, p))]) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Méthode : 0 pour les anagrammes (formule du cours puis − 1), 1 sinon (fixer, bloc, complément).
  // Piège dans les DONNÉES : le mot lui-même (anagrammes), une lettre répétée fixée en tête (son
  // effectif baisse). Entiers exacts → nombres 0.
  const piege = e.variante === "anagrammes" || (e.variante === "commencePar" && nbOccurrences(e.mot, e.lettre!) > 1) ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetaillee103(e), []), methode: e.variante === "anagrammes" ? 0 : 1, piege, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  const ph = phases103(e);
  const poids = ph.length === 2 ? [2, 2] : [1.5, 1.5, 1];
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, i) => ({ sousQuestion: lettreEtape(i), critere: [t(`${consigneCourte(e, p)} : `), ...fr(reponse103(e, p))], points: poids[i]! })),
    erreursFrequentes: [
      { description: [t("Lettres répétées non divisées (n! seul)")], cout: "moitié des points de l'étape" },
      ...(e.variante === "anagrammes" ? [{ description: [t("Mot de départ non retiré (− 1 oublié)")], cout: "0 pt sur l'étape 2" }] : []),
      ...(e.variante === "bloc" ? [{ description: [t("Ordre des voyelles dans le bloc oublié")], cout: "0 pt sur l'étape 3" }] : []),
      ...(e.variante === "jamaisCote" ? [{ description: [t("Nombre de mots où les lettres sont collées donné comme réponse")], cout: "0 pt sur l'étape 3" }] : []),
    ],
    reponsesAcceptees: [[t("Le résultat sous forme de calcul exact (quotient de factorielles, produit, différence)")]],
  };
}

function consigneCourte(e: E, p: ReturnType<typeof phases103>[number]): string {
  switch (p) {
    case "total":
      return "Permutations distinctes des lettres";
    case "anagrammes":
      return "Mot de départ retiré";
    case "fixe":
      return `Première lettre ${e.lettre} fixée, lettres restantes rangées`;
    case "interne":
      return "Ordre des voyelles dans le bloc";
    case "externe":
      return "Bloc et consonnes rangés";
    case "produit":
      return "Produit des deux étapes";
    case "collees":
      return "Lettres collées en un symbole";
    case "jamais":
      return "Complément";
  }
}

export function profil103(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluation103: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Anagrammes et contraintes — Évaluation",
  nomFichierBase: "anagrammes-contraintes",
  genererInstance: genererExercice103,
  catalogueVariantes: CATALOGUE_103,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante103(id as Variante103),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee103,
  bareme,
  enoncePapier,
  profilInstance: profil103,
};
