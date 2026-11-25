import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice127 } from "../../core6e/natureLieu";
import { phases127 } from "../../core6e/natureLieu";
import { consigne127, consigneGlobale127, nomCourt, reponseElements, situation127 } from "../../ui6e/formatNatureLieu";
import { fr } from "../../ui6e/outilsLieuxLotH1";
import { CATALOGUE_127, construireAvecVariante127, genererExercice127 } from "./index";
import { correctionDetaillee127 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen127` « Quelle est la nature du lieu ? » (Connaître). Énoncé papier = la
 * condition + consigne globale (nature, éléments caractéristiques s'il y en a, justifier) — aucune
 * liste d'options ; le corrigé traduit la condition et trace le lieu. La NATURE est le verdict : jamais
 * dans `forme` (= la famille), jamais cas particulier ; critères FIXES (deux étapes, piège 1 : un seuil,
 * une somme / différence ou un k = 1 est toujours à examiner) — même niveau et même durée pour toutes
 * les natures, vide compris. Aucun `calcul`. Regroupement a), b), c) : entrée `6gen127` de
 * `REGROUPEMENTS` (consigne commune, ligne = la condition).
 */

type E = Exercice127;
const t = texte;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation127(e)), questions: phases127(e).map((p) => ({ consigne: fr(consigne127(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const n = nomCourt(e.nature);
  return e.nature === "vide" ? [t("Lieu vide")] : [t(`${n.charAt(0).toUpperCase()}${n.slice(1)} : `), ...fr(reponseElements(e))];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(situation127(e)), questions: [{ consigne: fr(consigneGlobale127()) }] },
    etapesParQuestion: [phases127(e).map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(): CriteresDifficulte {
  return { etapesTransformation: 2, etapesLecture: 0, methode: 0, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const vide = e.nature === "vide";
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: lettreEtape(0), critere: [t(`Nature (${nomCourt(e.nature)}), justifiée par la traduction de la condition`)], points: vide ? 4 : 2 },
      ...(vide ? [] : [{ sousQuestion: lettreEtape(1), critere: [t("Éléments caractéristiques : "), ...fr(reponseElements(e))], points: 2 }]),
    ],
    erreursFrequentes: [
      { description: [t("Seuil mal calculé (AB² au lieu de AB²/2, 4c au lieu de 4c², écart des parallèles)")], cout: "0 pt sur la nature" },
      { description: [t("Sommets du losange pris aux quatre combinaisons p ± k, q ± k")], cout: "0 pt sur les éléments" },
      { description: [t("Nature juste sans justification")], cout: "moitié des points de la nature" },
    ],
    reponsesAcceptees: [[t("Toute équation proportionnelle ; sommets ou droites dans n'importe quel ordre ; valeurs exactes équivalentes")]],
  };
}

export function profil127(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.famille };
}

export const adaptateurEvaluation127: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Nature d'un lieu géométrique — Évaluation",
  nomFichierBase: "nature-lieu",
  genererInstance: genererExercice127,
  catalogueVariantes: CATALOGUE_127,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante127(id),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee127,
  bareme,
  enoncePapier,
  profilInstance: profil127,
};
