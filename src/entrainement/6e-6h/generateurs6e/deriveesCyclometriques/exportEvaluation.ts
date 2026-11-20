import type { ExerciceDeriveesCyclometriques } from "../../core6e/deriveesCyclometriques.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { CONSIGNE_GENERALE, consigneEcranDerivee } from "../../ui6e/formatDeriveesCyclometriques";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDeriveesCyclometriques } from "./index";
import { correctionDetailleeDeriveesCyclometriques as correction, fonctionDeriveeLatex, lettresLectureDerivees, resultatsEcransDerivees, sequenceDeriveesCyclometriques } from "./corrigeDetaille";
import { profilDeriveesCyclometriques } from "../profilsEvaluationCyclometriques";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDeriveesCyclometriques>` pour `6gen4` (dérivées
 * des fonctions cyclométriques) — feuille d'exercices et évaluation.
 *
 * `construireEnonce` : une question par ÉCRAN (consignes de l'appli, `consigneEcranDerivee`) —
 * titres « Étape n — … » du corrigé. Papier : la fonction et la consigne globale. Plus
 * `regroupable` : un exercice a 2 à 4 étapes, dont les titres viennent des questions d'écran (le
 * regroupement a)/b)/c) n'admet qu'une question par instance).
 */

type E = ExerciceDeriveesCyclometriques;

function construireEnonce(e: E): SectionExercice {
  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(fonctionDeriveeLatex(e))],
    questions: sequenceDeriveesCyclometriques(e).map((phase) => ({ consigne: consigneEcranDerivee(e, phase) })),
  };
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(fonctionDeriveeLatex(e)), texte(" Simplifie le résultat.")], questions: [] } };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const r = resultatsEcransDerivees(e);
  return [latex(r[r.length - 1])];
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  const r = resultatsEcransDerivees(e);
  const n = r.length;
  const L = "abcd";
  const criteres: CritereBareme[] = r.map((res, i) => ({
    sousQuestion: L[i],
    critere: [texte(i === n - 1 ? "Résultat final : " : "Dérivée intermédiaire : "), latex(res)],
    points: i === n - 1 ? 4 - (n - 1) : 1,
  }));
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: [
      { description: [texte("Oublier le facteur u′ de la règle de la chaîne")], cout: "−1" },
      ...(e.famille === "A" && e.arcfonction === "arccos" ? [{ description: [texte("Oublier le signe − de la dérivée de arccos")], cout: "−1" }] : []),
    ],
    reponsesAcceptees: [[texte("Toute écriture équivalente de f′(x)")]],
  };
}

/**
 * Niveau 1–7 — méthode 0 (dérivation directe, la règle se lit sur la forme de f) ou 1 (choisir et
 * enchaîner produit / quotient / chaîne : B, C, D, E ; identité à reconnaître : D, F) ; piège dans les
 * données : arccos (signe −), structure trompeuse (G : k / arc(v) contre arc(k / v), E : opération
 * extérieure), quotient avec identité cachée (D). Lecture : u′ d'une fonction linéaire (B, a).
 */
function criteresDifficulte(e: E): CriteresDifficulte {
  const methode: 0 | 1 = e.famille === "A" ? 0 : 1;
  const piege: 0 | 1 = e.famille === "G" || e.famille === "E" || e.famille === "D" || ("arcfonction" in e && e.arcfonction === "arccos" && e.famille === "A") ? 1 : 0;
  return { ...etapesDuCorrige(correction(e), lettresLectureDerivees(e)), methode, piege, nombres: 0 };
}

export const adaptateurEvaluationDeriveesCyclometriques: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilDeriveesCyclometriques,
  titreDocument: "Dérivées de fonctions cyclométriques — Évaluation",
  nomFichierBase: "derivees-cyclometriques",
  genererInstance: genererExerciceDeriveesCyclometriques,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correction,
  bareme,
  enoncePapier,
};
