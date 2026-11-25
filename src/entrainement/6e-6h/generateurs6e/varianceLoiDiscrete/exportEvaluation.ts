import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, latex, texte } from "../../../export/corrigeTableau";
import type { Exercice110, Variante110 } from "../../core6e/varianceLoiDiscrete";
import { phases110 } from "../../core6e/varianceLoiDiscrete";
import { consigne110, consigneGlobale110, reponse110, situation110, tableauLatex110 } from "../../ui6e/formatVarianceLoiDiscrete";
import { fr, texteAvantFormule } from "../../ui6e/outilsVariablesAleatoiresLotH1";
import { CATALOGUE_110, construireAvecVariante110, genererExercice110 } from "./index";
import { correctionDetaillee110 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen110` « Variance et écart-type d'une loi discrète ». Énoncé papier =
 * situation + tableau de la loi (KaTeX) + consigne globale ; les écrans deviennent les étapes du
 * corrigé. Profils : `calcul` → `calcul: 'exacte'` (décision du 24/11 : la Casio Graph Math+ donne
 * directement la moyenne et l'écart-type d'une liste pondérée ; σ est un décimal exact, faisable sans
 * calculatrice) ; `risque` → aucun `calcul` (comparer et décider : tiré « interdite » ET « autorisée »).
 * Le jeu le plus risqué est tiré DANS la variante (jamais dans `forme`, jamais cas particulier) ;
 * niveau et durée constants pour les deux verdicts (même structure). Regroupement a), b), c) écarté :
 * contexte et tableau propres à chaque instance (comme gen34).
 */

type E = Exercice110;
const t = texte;

const entete = (e: E): FragmentConsigne[] => [...fr(texteAvantFormule(situation110(e))), latex(tableauLatex110(e))];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: entete(e), questions: phases110(e).map((p) => ({ consigne: fr(consigne110(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const ph = phases110(e).filter((p) => p !== "esperances");
  return ph.flatMap((p, i) => [...(i > 0 ? [t(" ; ")] : []), ...fr(reponse110(e, p))]);
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: entete(e), questions: [{ consigne: fr(consigneGlobale110(e)) }] },
    etapesParQuestion: [phases110(e).map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // `calcul` : formules imposées par la consigne (méthode 0) ; piège dans les DONNÉES : une valeur
  // négative (carré d'un négatif). `risque` : choisir le critère de comparaison (méthode 1) ; aucune
  // donnée piège ; même structure pour les deux verdicts.
  if (e.variante === "calcul") return { ...etapesDuCorrige(correctionDetaillee110(e), []), methode: 0, piege: e.loi.valeurs[0]! < 0 ? 1 : 0, nombres: 0 };
  return { ...etapesDuCorrige(correctionDetaillee110(e), []), methode: 1, piege: 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  const ph = phases110(e);
  const pts = e.variante === "calcul" ? [1, 1, 1, 1] : [1, 2, 1];
  const libelles: Record<string, string> = {
    esperance: "Espérance (somme pondérée) : ",
    carres: "E(X²) (valeurs au carré, pondérées) : ",
    variance: "Variance par la formule de König : ",
    ecartType: "Écart-type (racine de la variance) : ",
    esperances: "Espérances des deux jeux : ",
    variances: "Variances des deux jeux (König) : ",
    verdict: "Conclusion justifiée par les variances : ",
  };
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, i) => ({ sousQuestion: lettreEtape(i), critere: [t(libelles[p]!), ...fr(reponse110(e, p))], points: pts[i]! })),
    erreursFrequentes: [
      { description: [t("Moyenne simple des valeurs au lieu de la moyenne pondérée")], cout: "0 pt sur l'espérance" },
      { description: [t("Carré de l'espérance oublié dans la formule de König")], cout: "0 pt sur la variance" },
      ...(e.variante === "calcul" ? [{ description: [t("Variance donnée comme écart-type (racine oubliée)")], cout: "0 pt sur l'écart-type" }] : [{ description: [t("Jeu choisi d'après le plus grand gain possible, sans calcul de variance")], cout: "0 pt sur la conclusion" }]),
    ],
    reponsesAcceptees: [[t("Toute écriture exacte équivalente (fraction ou décimal) ; l'écart-type à la place de la variance pour comparer les jeux")]],
  };
}

export function profil110(e: E): ProfilInstance {
  return e.variante === "calcul" ? { casParticulier: null, calcul: "exacte" } : { casParticulier: null };
}

export const adaptateurEvaluation110: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Variance et écart-type — Évaluation",
  nomFichierBase: "variance-ecart-type",
  genererInstance: genererExercice110,
  catalogueVariantes: CATALOGUE_110,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante110(id as Variante110),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee110,
  bareme,
  enoncePapier,
  profilInstance: profil110,
};
