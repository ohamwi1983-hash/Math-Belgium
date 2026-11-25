import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice115, Variante115 } from "../../core6e/loiUniformeContinue";
import { phases115 } from "../../core6e/loiUniformeContinue";
import { consigne115, consigneGlobale115, reponse115, situation115 } from "../../ui6e/formatLoiUniformeContinue";
import { fr } from "../../ui6e/outilsVariablesAleatoiresLotH1";
import { CATALOGUE_115, construireAvecVariante115, genererExercice115 } from "./index";
import { correctionDetaillee115 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen115` « Loi uniforme continue ». Énoncé papier = situation + consigne
 * globale (densité, probabilité, E, V, σ ; ou a et b, puis une probabilité) ; les écrans deviennent
 * les étapes du corrigé. Aucun `calcul` (appliquer les formules du cours, ou les inverser ; la
 * calculatrice ne donne pas directement la réponse — décision du 24/11) ; σ exact (√) accepté sur
 * papier. Aucun cas particulier ; `forme` = variante + type d'événement (intervalle intérieur, qui
 * déborde, au moins, au plus) — donnée de l'énoncé, aucun verdict. Regroupement a), b), c) écarté :
 * contexte et consigne qui nomme l'événement propres à l'instance.
 */

type E = Exercice115;
const t = texte;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation115(e)), questions: phases115(e).map((p) => ({ consigne: fr(consigne115(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return phases115(e)
    .filter((p) => p !== "longueur")
    .flatMap((p, i) => [...(i > 0 ? [t(" ; ")] : []), ...fr(reponse115(e, p))]);
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(situation115(e)), questions: [{ consigne: fr(consigneGlobale115(e)) }] },
    etapesParQuestion: [phases115(e).map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Direct : formules du cours (méthode 0) ; piège dans les DONNÉES : l'intervalle qui déborde de
  // [a ; b]. Inverse : remonter des indicateurs aux bornes (méthode 1). σ arrondi → nombres 1.
  if (e.variante === "direct") return { ...etapesDuCorrige(correctionDetaillee115(e), []), methode: 0, piege: e.evenement!.type === "deborde" ? 1 : 0, nombres: 1 };
  return { ...etapesDuCorrige(correctionDetaillee115(e), []), methode: 1, piege: 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  const ph = phases115(e);
  const lib: Record<string, string> = {
    densite: "Densité : ",
    proba: "Probabilité par les longueurs : ",
    esperance: "Espérance : ",
    dispersion: "Variance et écart-type : ",
    longueur: "Longueur b − a tirée de la variance : ",
    bornes: "Bornes a et b : ",
    probaInv: "Probabilité : ",
  };
  const pts = e.variante === "direct" ? [0.5, 1.5, 0.5, 1.5] : [1.5, 1.5, 1];
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, i) => ({ sousQuestion: lettreEtape(i), critere: [t(lib[p]!), ...fr(reponse115(e, p))], points: pts[i]! })),
    erreursFrequentes:
      e.variante === "direct"
        ? [
            { description: [t("Intervalle qui déborde gardé tel quel (au lieu de l'intersection avec [a ; b])")], cout: "moitié des points de la probabilité" },
            { description: [t("Variance "), latex("\\dfrac{b-a}{12}"), t(", sans le carré")], cout: "0 pt sur la variance" },
          ]
        : [
            { description: [t("Racine carrée oubliée : "), latex("(b-a)^2"), t(" pris pour "), latex("b-a")], cout: "0 pt sur la longueur" },
            { description: [t("Bornes à une longueur entière de l'espérance au lieu d'une demi-longueur")], cout: "0 pt sur les bornes" },
          ],
    reponsesAcceptees: [[t("Toute écriture exacte équivalente (fraction ou décimal exact) ; σ(X) exact (racine) ou arrondi au centième")]],
  };
}

export function profil115(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante === "direct" ? `direct|${e.evenement!.type}` : "inverse" };
}

export const adaptateurEvaluation115: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Loi uniforme continue — Évaluation",
  nomFichierBase: "loi-uniforme-continue",
  genererInstance: genererExercice115,
  catalogueVariantes: CATALOGUE_115,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante115(id as Variante115),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee115,
  bareme,
  enoncePapier,
  profilInstance: profil115,
};
