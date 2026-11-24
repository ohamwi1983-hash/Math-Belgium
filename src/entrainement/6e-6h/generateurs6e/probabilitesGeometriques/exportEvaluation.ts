import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceProbaGeo, VarianteProbaGeo } from "../../core6e/probabilitesGeometriques";
import { phasesProbaGeo } from "../../core6e/probabilitesGeometriques";
import { consigne, consigneGlobale, situation, reponse } from "../../ui6e/formatProbabilitesGeometriques";
import { figureProbaGeo } from "../../ui6e/figureProbabilitesGeometriques";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceProbaGeo } from "./index";
import { correctionDetailleeProbaGeo } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen162` « Probabilités géométriques ». Énoncé papier = situation + figure
 * (zone grisée décrite par l'énoncé, « ? » pour le rayon cherché de `cibleInverse`) + consigne
 * globale ; les écrans (aire totale, aire de la zone, probabilité ou rayon) deviennent les étapes du
 * corrigé. Réponses exactes (fractions, π) : aucun profil `calcul` (la calculatrice ne modélise pas la
 * situation ; décision du 24/11). Cas particulier : la zone de la cible est le disque central (une
 * seule aire, `disque-central`). `forme` = variante + sous-type structurel (dans / hors, type de
 * condition sur le segment, rencontre ou non) — rien n'est un verdict ici, l'événement est donné.
 * Regroupement a), b), c) écarté : situation et figure propres à chaque instance.
 */

type E = ExerciceProbaGeo;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation(e)), enteteHtml: figureProbaGeo(e), questions: phasesProbaGeo(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const fin = phasesProbaGeo(e).at(-1)!;
  return fr(reponse(e, fin));
}

function enoncePapier(e: E): EnoncePapier {
  const lettres = phasesProbaGeo(e).map((_, i) => "abc"[i]!);
  return {
    section: { enteteFragments: fr(situation(e)), enteteHtml: figureProbaGeo(e), questions: [{ consigne: fr(consigneGlobale(e)) }] },
    etapesParQuestion: [lettres],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: phasesProbaGeo(e).flatMap((p, i) => [t(`${i > 0 ? " ; " : ""}`), ...fr(reponse(e, p))]) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Méthode 1 : choisir le rapport (aires ou longueurs) et la décomposition de la zone ; la figure et
  // l'événement sont donnés. Piège dans les DONNÉES : zone « hors » de la forme dessinée (complément),
  // segment « loin des deux extrémités » ou « plus long morceau » (deux côtés). Valeurs exactes →
  // nombres 0.
  const piege = ((e.variante === "carreDisque" || e.variante === "rectangleQuart") && e.hors) || (e.variante === "segment" && e.type !== "entre") ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeProbaGeo(e), []), methode: 1, piege, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  const ph = phasesProbaGeo(e);
  const lettres = ph.map((_, i) => "abc"[i]!);
  const criteres: BaremeExercice["criteres"] =
    ph.length === 2
      ? [
          { sousQuestion: lettres[0], critere: [t("Partie favorable du segment identifiée et mesurée : "), ...fr(reponse(e, ph[0]!))], points: 2 },
          { sousQuestion: lettres[1], critere: [t("Quotient longueur favorable / longueur totale, simplifié : "), ...fr(reponse(e, ph[1]!))], points: 2 },
        ]
      : [
          { sousQuestion: lettres[0], critere: [t("Aire totale : "), ...fr(reponse(e, ph[0]!))], points: 1 },
          { sousQuestion: lettres[1], critere: [t(e.variante === "cibleInverse" ? "Aire nécessaire (P fois l'aire de la cible) : " : "Aire de la zone : "), ...fr(reponse(e, ph[1]!))], points: 1.5 },
          { sousQuestion: lettres[2], critere: [t(e.variante === "cibleInverse" ? "Équation résolue, racine positive : " : "Quotient des aires, valeur exacte simplifiée : "), ...fr(reponse(e, ph[2]!))], points: 1.5 },
        ];
  const erreurs: ErreurFrequente[] = [{ description: [t("Valeur approchée donnée au lieu de la valeur exacte demandée")], cout: "−0,5" }];
  if (e.variante === "cible" || e.variante === "cibleInverse") erreurs.push({ description: [t("Rapport des rayons au lieu du rapport des aires")], cout: "0 pt sur la dernière étape" });
  if ((e.variante === "carreDisque" || e.variante === "rectangleQuart") && e.hors) erreurs.push({ description: [t("Probabilité de la forme dessinée au lieu de la zone qui l'entoure (complément oublié)")], cout: "moitié des points de la dernière étape" });
  if (e.variante === "segment" && e.type !== "entre") erreurs.push({ description: [t("Une seule des deux parties du segment comptée")], cout: "moitié des points de la première étape" });
  if (e.variante === "rendezVous") erreurs.push({ description: [t("Un seul des deux triangles compté, ou événement contraire oublié")], cout: "moitié des points de l'étape concernée" });
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[t("Toute écriture exacte équivalente (fraction non réduite, décimal exact, forme factorisée)")]],
  };
}

const SOUS_TYPE = (e: E): string => {
  switch (e.variante) {
    case "carreDisque":
    case "rectangleQuart":
      return e.hors ? "hors" : "dans";
    case "segment":
      return e.type;
    case "rendezVous":
      return e.rencontre ? "rencontre" : "pas";
    default:
      return "";
  }
};

export function profilProbaGeo(e: E): ProfilInstance {
  const st = SOUS_TYPE(e);
  return { casParticulier: e.variante === "cible" && e.r1 === 0 ? "disque-central" : null, forme: st ? `${e.variante}|${st}` : e.variante };
}

export const adaptateurEvaluationProbaGeo: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Probabilités géométriques — Évaluation",
  nomFichierBase: "probabilites-geometriques",
  genererInstance: genererExerciceProbaGeo,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante(id as VarianteProbaGeo),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeProbaGeo,
  bareme,
  enoncePapier,
  profilInstance: profilProbaGeo,
  libelleCasParticulier: "Cible : la zone est le disque central (une seule aire)",
};
