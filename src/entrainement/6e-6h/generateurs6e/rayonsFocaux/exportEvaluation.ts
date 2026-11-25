import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice136 } from "../../core6e/rayonsFocaux";
import { phases136 } from "../../core6e/rayonsFocaux";
import { consigne136, consigneGlobale136, reponse136, situation136 } from "../../ui6e/formatRayonsFocaux";
import { fr } from "../../ui6e/outilsLieuxLotH1";
import { CATALOGUE_136, construireAvecVariante136, genererExercice136 } from "./index";
import { correctionDetaillee136 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen136` « Rayons focaux et triangle focal » (Appliquer). Énoncé papier =
 * ellipse, foyers (et P ou l'angle) + consigne globale qui ne dit jamais si P existe ; écrans → étapes
 * du corrigé. L'existence est un verdict tiré dans la variante : jamais dans `forme`, jamais cas
 * particulier ; critères FIXES pour la variante `aire` (deux étapes, méthode 1, piège 1, `sansCharge`)
 * — sinon l'absence de l'écran « aire » trahirait le verdict au niveau de la feuille. Aucun `calcul`
 * (raisonnement sur les rayons focaux ; la calculatrice ne donne pas l'aire exacte). Regroupement :
 * variante `rayons` (ligne = l'ellipse et le point P) ; `aire` écartée (consigne propre à l'angle).
 */

type E = Exercice136;
const t = texte;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation136(e)), questions: phases136(e).map((p) => ({ consigne: fr(consigne136(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return phases136(e).flatMap((p, i) => [...(i > 0 ? [t(" ; ")] : []), ...fr(reponse136(e, p))]);
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(situation136(e)), questions: [{ consigne: fr(consigneGlobale136(e)) }] },
    etapesParQuestion: [phases136(e).map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  if (e.variante === "aire") return { etapesTransformation: 2, etapesLecture: 1, methode: 1, piege: 1, nombres: 0, sansCharge: true };
  return { ...etapesDuCorrige(correctionDetaillee136(e), ["a"]), methode: 0, piege: 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const ph = phases136(e);
  const lib: Record<string, string> = { excentricite: "Excentricité : ", rayonF: "Rayon |PF| = a − ex : ", rayonFp: "Rayon |PF′| = a + ex : ", cosMax: "Angle maximal en B (loi des cosinus) : ", existence: "Comparaison et conclusion : ", aire: "Aire du triangle focal : " };
  const pts = e.variante === "rayons" ? [1, 1.5, 1.5] : e.existe ? [1.5, 1, 1.5] : [2, 2];
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, i) => ({ sousQuestion: lettreEtape(i), critere: [t(lib[p]!), ...fr(reponse136(e, p))], points: pts[i]! })),
    erreursFrequentes:
      e.variante === "rayons"
        ? [{ description: [t("Rayons échangés (a + ex pour le foyer d'abscisse positive)")], cout: "moitié des points des rayons" }]
        : [
            { description: [t("Cosinus comparés dans le mauvais sens")], cout: "0 pt sur la conclusion" },
            { description: [t("b²·tan θ au lieu de b²·tan(θ/2)")], cout: "moitié des points de l'aire" },
          ],
    reponsesAcceptees: [[t("Valeurs exactes équivalentes (fraction, √3/3 ou 1/√3)")]],
  };
}

export function profil136(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluation136: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Rayons focaux et triangle focal — Évaluation",
  nomFichierBase: "rayons-focaux",
  genererInstance: genererExercice136,
  catalogueVariantes: CATALOGUE_136,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante136(id),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee136,
  bareme,
  enoncePapier,
  profilInstance: profil136,
};
