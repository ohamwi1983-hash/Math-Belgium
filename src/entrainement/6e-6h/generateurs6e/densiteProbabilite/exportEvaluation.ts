import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice113, Variante113 } from "../../core6e/densiteProbabilite";
import { phases113 } from "../../core6e/densiteProbabilite";
import { consigne113, consigneGlobale113, figure113, reponse113, situation113 } from "../../ui6e/formatDensiteProbabilite";
import { fr } from "../../ui6e/outilsVariablesAleatoiresLotH1";
import { CATALOGUE_113, construireAvecVariante113, genererExercice113 } from "./index";
import { correctionDetaillee113 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen113` « Densité de probabilité ». Énoncé papier = situation + densité
 * tracée (figure : abscisses entières, hauteurs k et 2k sur les lignes du quadrillage — tout ce qu'on
 * lit tombe sur une intersection ; aucune zone grisée) ou formule + consigne globale ; les écrans
 * deviennent les étapes du corrigé (zone grisée dans le corrigé des probabilités). Aucun `calcul`
 * (trouver k est l'objet ; décision du 24/11) ; aucun cas particulier ; `forme` = variante + forme de
 * la courbe (tracé) ou fonction g (formule) — données de l'énoncé, aucun verdict. Regroupement a), b),
 * c) écarté : figure ou formule ET consigne qui nomme les intervalles de l'instance.
 */

type E = Exercice113;
const t = texte;

function section(e: E, questions: SectionExercice["questions"]): SectionExercice {
  const fig = figure113(e);
  return { enteteFragments: fr(situation113(e)), ...(fig ? { enteteHtml: fig } : {}), questions };
}

function construireEnonce(e: E): SectionExercice {
  return section(e, phases113(e).map((p) => ({ consigne: fr(consigne113(e, p)) })));
}

function reponseBreve(e: E): FragmentConsigne[] {
  return phases113(e).flatMap((p, i) => [...(i > 0 ? [t(" ; ")] : []), ...fr(reponse113(e, p))]);
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: section(e, [{ consigne: fr(consigneGlobale113(e)) }]),
    etapesParQuestion: [phases113(e).map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Tracé : découper l'aire en figures simples (méthode 1) ; formule : calcul imposé par la définition
  // (méthode 0). Aucun piège propre aux données ; valeurs exactes.
  return { ...etapesDuCorrige(correctionDetaillee113(e), []), methode: e.variante === "trace" ? 1 : 0, piege: 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  const ph = phases113(e);
  const lib: Record<string, string> = {
    k: e.variante === "trace" ? "Aire totale en fonction de k, égale à 1 : " : "Intégrale de f égale à 1, primitive correcte : ",
    intervalle: e.variante === "trace" ? "Aire entre les bornes (hauteurs lues) : " : "Intégrale entre a et b : ",
    queue: "Aire de la partie demandée : ",
    esperance: "Intégrale de x f(x) : ",
  };
  const pts = [1.5, 1.5, 1];
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, i) => ({ sousQuestion: lettreEtape(i), critere: [t(lib[p]!), ...fr(reponse113(e, p))], points: pts[i]! })),
    erreursFrequentes: [
      { description: [t("Aire totale prise pour k (inverse oublié)")], cout: "0 pt sur k ; la suite est corrigée avec la valeur de l'élève" },
      { description: [t("Valeur de f prise pour une probabilité")], cout: "0 pt sur l'étape concernée" },
      ...(e.variante === "formule" ? [{ description: [t("Espérance = milieu de l'intervalle, sans calcul")], cout: "0 pt sur l'espérance" }] : [{ description: [t("Facteur k oublié dans une aire")], cout: "moitié des points de l'étape concernée" }]),
    ],
    reponsesAcceptees: [[t("Toute écriture exacte équivalente (fraction non réduite, décimal exact)")]],
  };
}

export function profil113(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante === "trace" ? `trace|${e.forme}` : `formule|${e.g}` };
}

export const adaptateurEvaluation113: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Densité de probabilité — Évaluation",
  nomFichierBase: "densite-probabilite",
  genererInstance: genererExercice113,
  catalogueVariantes: CATALOGUE_113,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante113(id as Variante113),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee113,
  bareme,
  enoncePapier,
  profilInstance: profil113,
};
