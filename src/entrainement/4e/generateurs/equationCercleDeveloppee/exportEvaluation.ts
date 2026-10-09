import type { ExerciceEquationCercleDeveloppee } from "../../core/equationCercleDeveloppee.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  CONSIGNE_COMPLETION,
  CONSIGNE_GENERALE_CENTRE_RAYON,
  CONSIGNE_REGROUPEMENT,
  formatCentreAttenduLatex,
  formatCompletionLatex,
  formatEquationDeveloppeeLatex,
  formatEquationReduiteLatex,
  formatRayonAttenduLatex,
  formatRegroupementLatex,
  segmentsConsigneCentreRayon,
} from "../../ui/formatEquationCercleDeveloppee";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationCercleDeveloppee } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationCercleDeveloppee>` pour gen50 (Centre et
 * rayon d'un cercle depuis l'équation développée, `AppEquationCercleDeveloppee.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Écran → question : `AppEquationCercleDeveloppee.tsx`/`moteur/sessionEquationCercleDeveloppee.ts`
 * enchaîne 3 phases FIXES, toujours dans le même ordre (`PhaseEquationCercleDeveloppee` —
 * "regroupement", "completion", "centreRayon", voir `moteur/typesEquationCercleDeveloppee.ts`), les
 * 3 affichant la MÊME équation développée fixe (`formatEquationDeveloppeeLatex`) précédée de la
 * MÊME consigne d'ensemble `CONSIGNE_GENERALE_CENTRE_RAYON` ("Détermine le centre et le rayon du
 * cercle d'équation :"). Ceci devient ici, comme pour `simplification/exportEvaluation.ts` (même
 * structure "3 écrans successifs par instance"), UNE question papier PAR ÉCRAN plutôt qu'une seule
 * consigne fourre-tout : a) regroupement/factorisation du coefficient commun
 * (`CONSIGNE_REGROUPEMENT`), b) complétion du carré sur chaque groupe (`CONSIGNE_COMPLETION`),
 * c) identification du centre et du rayon (`segmentsConsigneCentreRayon`, qui varie SELON LA
 * VARIANTE — précision "forme exacte ou valeur décimale arrondie au centième" ajoutée uniquement
 * pour `"irrationnel"`, voir son commentaire de tête dans `ui/formatEquationCercleDeveloppee.ts`).
 * L'énoncé fixe (équation développée) est levé une seule fois en tête d'exercice
 * (`enteteFragments`), jamais répété dans chaque question — contrairement à l'écran interactif qui
 * le réaffiche par pur confort de navigation entre 3 pages séparées, inutile sur une feuille
 * imprimée où tout est visible d'un coup.
 *
 * PAS `regroupable` : (1) 3 questions par instance, jamais 1 seule — la 1ʳᵉ condition du mécanisme
 * échoue déjà à elle seule (voir `AdaptateurFeuilleExercices.regroupable`,
 * `export/genererFeuilleExercices.ts`) ; (2) la consigne de la question c) n'est de toute façon PAS
 * générique — elle dépend de la variante tirée (`segmentsConsigneCentreRayon`, note supplémentaire
 * pour `"irrationnel"` uniquement), pas juste des valeurs numériques.
 *
 * Aucune zone de réponse vierge (`reponse: { type: "lignes", nombre: 0 }` sur les 3 questions,
 * même décision documentée que `comparaisonSeries`/`normeDistance`/`applicationPhysique`/
 * `exportEvaluation.ts`) : chaque question demande un développement algébrique (regroupement,
 * complétion, division par le coefficient commun) dont la longueur varie trop d'un exercice à
 * l'autre pour qu'un nombre de lignes fixe soit pertinent — l'élève travaille sur feuille/copie
 * séparée, comme pour ces autres générateurs à développement libre.
 *
 * Aucun cas dégénéré "pas un vrai cercle" à gérer ici (contrairement à ce qu'on pourrait croire par
 * analogie avec d'autres générateurs de cercle) : la construction de `generateurs/equationCercleDeveloppee/index.ts`
 * PART du centre/rayon (`Q` un entier STRICTEMENT positif, `rayonCarre = R/4` avec
 * `R = A²+B²+4Q ≥ 4Q ≥ 4 > 0`) puis dérive l'équation développée — jamais l'inverse. `rayonCarre`
 * est donc TOUJOURS strictement positif par construction, quelle que soit la variante : aucune
 * branche de correction à prévoir pour un rayon carré négatif/nul.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`exercice.centre`, `exercice.rayonCarre`, `exercice.rayon`), jamais recalculée indépendamment
 * ici, et réutilise directement les formateurs déjà utilisés côté écran interactif
 * (`ui/formatEquationCercleDeveloppee.ts` — `formatRegroupementLatex`/`formatCompletionLatex`,
 * déjà les réponses de référence affichées en révélation après échec aux écrans 1/2 ;
 * `formatEquationReduiteLatex`/`formatCentreAttenduLatex`/`formatRayonAttenduLatex`, déjà utilisés
 * pour l'aide niveau 2 et la révélation de l'écran 3) plutôt que d'en resynthétiser de nouvelles.
 * Pour la variante `"irrationnel"`, une valeur décimale approchée du rayon (arrondie au centième)
 * est ajoutée entre parenthèses en plus de la forme exacte — `diagnostiquerRayon`
 * (`moteur/verificationEquationCercleDeveloppee.ts`) accepte les deux, cohérent avec la note ajoutée
 * à la consigne de la question c) pour cette même variante.
 */

function construireEnonceEquationCercleDeveloppee(instance: ExerciceEquationCercleDeveloppee): SectionExercice {
  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE_CENTRE_RAYON} `), latex(formatEquationDeveloppeeLatex(instance))],
    questions: [
      { consigne: [texte(CONSIGNE_REGROUPEMENT)], reponse: { type: "lignes", nombre: 0 } },
      { consigne: [texte(CONSIGNE_COMPLETION)], reponse: { type: "lignes", nombre: 0 } },
      { consigne: segmentsConsigneCentreRayon(instance), reponse: { type: "lignes", nombre: 0 } },
    ],
  };
}

function construireCorrectionEquationCercleDeveloppee(instance: ExerciceEquationCercleDeveloppee): BlocCorrection[] {
  const blocs: BlocCorrection[] = [];

  blocs.push({
    type: "paragraphe",
    fragments: [texte("a) Regroupement et factorisation du coefficient commun : "), latex(formatRegroupementLatex(instance))],
  });

  blocs.push({
    type: "paragraphe",
    fragments: [texte("b) Complétion du carré, un produit remarquable en x et un en y : "), latex(formatCompletionLatex(instance))],
  });

  const fragmentsCentreRayon: FragmentConsigne[] = [
    texte("c) En divisant chaque membre par le coefficient commun : "),
    latex(formatEquationReduiteLatex(instance)),
    texte(" — donc centre "),
    latex(`o${formatCentreAttenduLatex(instance)}`),
    texte(" et rayon "),
    latex(`R = ${formatRayonAttenduLatex(instance)}`),
  ];
  if (instance.variante === "irrationnel") {
    fragmentsCentreRayon.push(texte(` (≈ ${instance.rayon.toFixed(2)}).`));
  } else {
    fragmentsCentreRayon.push(texte("."));
  }
  blocs.push({ type: "paragraphe", fragments: fragmentsCentreRayon });

  return blocs;
}

export const adaptateurEvaluationEquationCercleDeveloppee: AdaptateurFeuilleExercices<ExerciceEquationCercleDeveloppee> = {
  titreDocument: "Centre et rayon d'un cercle depuis l'équation développée — Évaluation",
  nomFichierBase: "equation-cercle-developpee",
  genererInstance: genererExerciceEquationCercleDeveloppee,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceEquationCercleDeveloppee,
  construireCorrection: construireCorrectionEquationCercleDeveloppee,
  // 3 questions substantielles par instance (regroupement, complétion, centre+rayon), la 3ᵉ à
  // consigne dépendante de la variante (rationnel/irrationnel) — jamais un unique écran générique :
  // voir le commentaire de tête.
};
