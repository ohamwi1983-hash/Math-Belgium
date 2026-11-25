import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, latex, texte } from "../../../export/corrigeTableau";
import type { Exercice112, Variante112 } from "../../core6e/fonctionRepartition";
import { phases112 } from "../../core6e/fonctionRepartition";
import { consigne112, consigneGlobale112, reponse112, situation112, tableauLatex112 } from "../../ui6e/formatFonctionRepartition";
import { fr, texteAvantFormule } from "../../ui6e/outilsVariablesAleatoiresLotH1";
import { CATALOGUE_112, construireAvecVariante112, genererExercice112 } from "./index";
import { correctionDetaillee112 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen112` « Fonction de répartition ». Énoncé papier = loi (tableau KaTeX) ou
 * les deux fonctions candidates + consigne globale (qui nomme les probabilités demandées) ; les écrans
 * deviennent les étapes du corrigé (graphique en escalier dans le corrigé de l'étape 1). Le numéro de
 * la fonction valide est le verdict : tiré dans la variante, jamais dans `forme`, jamais cas
 * particulier ; même structure (niveau, durée) pour les deux numéros. Aucun `calcul` (appliquer les
 * propriétés de F ; décision du 24/11). Regroupement a), b), c) écarté : la consigne embarque les
 * événements propres à l'instance (et la loi ou les deux fonctions).
 */

type E = Exercice112;
const t = texte;

function entete(e: E): FragmentConsigne[] {
  return e.variante === "escalier" ? [...fr(texteAvantFormule(situation112(e))), latex(tableauLatex112(e))] : fr(situation112(e));
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: entete(e), questions: phases112(e).map((p) => ({ consigne: fr(consigne112(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return phases112(e).flatMap((p, i) => [...(i > 0 ? [t(" ; ")] : []), ...(p === "choix" ? [latex(`F=F_${e.numeroValide}`)] : fr(reponse112(e, p)))]);
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: entete(e), questions: [{ consigne: fr(consigneGlobale112(e)) }] },
    etapesParQuestion: [phases112(e).map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Escalier : formules du cours (méthode 0) ; piège dans les DONNÉES : la borne stricte ou large de
  // l'intervalle et du complément (toujours présente). Continue : décider quelle fonction convient
  // (méthode 1), aucun piège propre à l'instance ; critères identiques quel que soit le numéro valide.
  if (e.variante === "escalier") return { ...etapesDuCorrige(correctionDetaillee112(e), []), methode: 0, piege: 1, nombres: 0, sansCharge: true };
  return { etapesTransformation: 4, etapesLecture: 0, methode: 1, piege: 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const ph = phases112(e);
  const pts = e.variante === "escalier" ? [1.5, 1.5, 1] : [1, 1, 1, 1];
  const lib: Record<string, string> = {
    repartition: "Valeurs de F (cumuls) : ",
    intervalle: "Intervalle par F(b) − F(a), bornes correctement traitées : ",
    queue: "Complément : ",
    choix: "Fonction de répartition reconnue et justifiée : ",
    proba: "Probabilité par F : ",
    intervalleC: "Intervalle par F(b) − F(a) : ",
    densite: "Densité f = F′ : ",
  };
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, i) => ({ sousQuestion: lettreEtape(i), critere: [t(lib[p]!), ...(p === "choix" ? [latex(`F=F_${e.numeroValide}`)] : fr(reponse112(e, p)))], points: pts[i]! })),
    erreursFrequentes:
      e.variante === "escalier"
        ? [
            { description: [t("Probabilités P(X = x) données au lieu des cumuls")], cout: "0 pt sur l'étape 1" },
            { description: [t("Borne incluse ou exclue à tort (en discret, P(X = a) n'est pas nulle)")], cout: "moitié des points de l'étape concernée" },
          ]
        : [
            { description: [t("Choix sans justification (croissance, valeurs 0 et 1)")], cout: "moitié des points de l'étape 1" },
            { description: [t("Complément oublié ou F(b) seul")], cout: "0 pt sur l'étape concernée" },
            { description: [t("F recopiée au lieu de sa dérivée")], cout: "0 pt sur la densité" },
          ],
    reponsesAcceptees: [[t("Toute écriture exacte équivalente (fraction ou décimal) ; toute expression équivalente de f")]],
  };
}

export function profil112(_e: E): ProfilInstance {
  return { casParticulier: null };
}

export const adaptateurEvaluation112: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Fonction de répartition — Évaluation",
  nomFichierBase: "fonction-repartition",
  genererInstance: genererExercice112,
  catalogueVariantes: CATALOGUE_112,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante112(id as Variante112),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee112,
  bareme,
  enoncePapier,
  profilInstance: profil112,
};
