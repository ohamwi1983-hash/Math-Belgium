import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice126 } from "../../core6e/tangentesPositionCercle";
import { phases126 } from "../../core6e/tangentesPositionCercle";
import { consigne126, consigneGlobale126, reponse126, situation126 } from "../../ui6e/formatTangentesPositionCercle";
import { fr } from "../../ui6e/outilsLieuxLotH1";
import { CATALOGUE_126, construireAvecVariante126, genererExercice126 } from "./index";
import { correctionDetaillee126 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen126` « Tangentes et position relative droite–cercle ». Énoncé papier =
 * cercle (et droite ou point) + consigne globale ; les écrans deviennent les étapes du corrigé (figure :
 * droite et points communs, tangente(s) et points de contact). La POSITION (variante `position`) et la
 * tangente verticale sont des verdicts : jamais dans `forme` (= la variante), jamais cas particulier ;
 * critères identiques pour toutes les issues. Aucun `calcul` (la démarche est évaluée, décision du
 * 24/11). Regroupement a), b), c) : entrée `6gen126` de `REGROUPEMENTS` (une forme par variante, ligne
 * = le cercle et la droite / le point).
 */

type E = Exercice126;
const t = texte;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation126(e)), questions: phases126(e).map((p) => ({ consigne: fr(consigne126(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return phases126(e).flatMap((p, i) => [...(i > 0 ? [t(" ; ")] : []), ...fr(reponse126(e, p))]);
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(situation126(e)), questions: [{ consigne: fr(consigneGlobale126(e)) }] },
    etapesParQuestion: [phases126(e).map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // position, tangente en T : procédure du cours (méthode 0) ; depuis P : condition de tangence à
  // traduire et droite verticale à tester (méthode 1, piège 1 pour TOUS les tirages — la verticale ne
  // doit pas se lire dans le niveau).
  const ext = e.variante === "tangentesExterieur";
  return { ...etapesDuCorrige(correctionDetaillee126(e), []), methode: ext ? 1 : 0, piege: ext ? 1 : 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const ph = phases126(e);
  const lib: Record<string, string> = {
    centreRayon: "Centre et rayon (carrés complétés) : ",
    centre: "Centre (carrés complétés) : ",
    distance: "Distance du centre à la droite : ",
    position: "Comparaison avec r et conclusion : ",
    tangente: "Vecteur normal ΩT et équation : ",
    longueur: "Pythagore dans ΩTP : ",
    tangentes: "Condition de tangence, deux tangentes : ",
  };
  const pts = ph.length === 3 ? [1.5, 1.5, 1] : e.variante === "tangentePoint" ? [1.5, 2.5] : [1, 3];
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, i) => ({ sousQuestion: lettreEtape(i), critere: [t(lib[p]!), ...fr(reponse126(e, p))], points: pts[i]! })),
    erreursFrequentes: [
      { description: [t("Signe du centre faux ou r² pris pour r")], cout: "0 pt sur le centre ou le rayon ; la suite est corrigée avec les valeurs de l'élève" },
      ...(e.variante === "position" ? [{ description: [t("Valeur absolue ou racine du dénominateur oubliée")], cout: "moitié des points de la distance" }] : []),
      ...(e.variante === "tangentesExterieur" ? [{ description: [t("Tangente verticale oubliée (une seule pente trouvée)")], cout: "moitié des points des tangentes" }] : []),
      ...(e.variante === "tangentePoint" ? [{ description: [t("ΩT pris comme vecteur directeur")], cout: "0 pt sur l'équation" }] : []),
    ],
    reponsesAcceptees: [[t("Toute équation proportionnelle (forme y = mx + p comprise pour une droite non verticale) ; valeurs exactes équivalentes")]],
  };
}

export function profil126(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluation126: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Tangentes et position relative droite–cercle — Évaluation",
  nomFichierBase: "tangentes-position-cercle",
  genererInstance: genererExercice126,
  catalogueVariantes: CATALOGUE_126,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante126(id),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee126,
  bareme,
  enoncePapier,
  profilInstance: profil126,
};
