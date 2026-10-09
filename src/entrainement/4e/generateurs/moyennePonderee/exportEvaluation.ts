import type {
  ExerciceMoyennePonderee,
  ExerciceMoyennePondereeClasses,
  ExerciceMoyennePondereeDiscrete,
} from "../../core/moyennePonderee.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, QuestionExercice, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  CONSIGNE_SOMMES,
  LABEL_MOYENNE_BARRE,
  LABEL_SOMME_N,
  LABEL_SOMME_XN,
  consigneCentres,
  consigneQuotient,
  formatClasseTexte,
  formatEnonceTexte,
} from "../../ui/formatMoyennePonderee";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceMoyennePonderee } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceMoyennePonderee>` pour gen32 (Moyenne pondérée,
 * `AppMoyennePonderee.tsx`/`moteur/sessionMoyennePonderee.ts`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * **Écran → question papier (dépend de la variante, `moteur/sessionMoyennePonderee.ts::phaseInitiale`) :**
 * - variante `"classes"` (3 écrans : `centres` → `sommes` → `quotient`) → 3 questions a) b) c) :
 *   a) centre de chaque classe, b) sommes intermédiaires Σ(xᵢ·nᵢ)/Σnᵢ, c) moyenne x̄.
 * - variante `"discrete"` (2 écrans, l'écran `centres` n'existe pas pour cette variante — les xᵢ
 *   sont déjà donnés) → 2 questions a) b) : a) sommes intermédiaires, b) moyenne x̄.
 * Consignes RÉUTILISÉES telles quelles depuis `ui/formatMoyennePonderee.ts` (`consigneCentres`,
 * `CONSIGNE_SOMMES`, `consigneQuotient`) — déjà le texte exact affiché à l'écran pour ces mêmes
 * consignes, jamais réécrites indépendamment ici (`consigneQuotient` retourne un `ConsigneSegmentee`
 * — avant/latex/après — converti en `FragmentConsigne[]` par `consigneQuotientFragments` ci-dessous,
 * simple changement de contrat texte, pas une nouvelle formulation).
 *
 * PAS `regroupable` : ni la condition "exactement une question par instance" (2 ou 3 selon la
 * variante, jamais 1) ni "consigne générique indépendante des valeurs tirées" (`consigneQuotient`/
 * `consigneCentres` mentionnent `exercice.contexte.unite`, propre à chaque instance) ne sont
 * remplies — voir la doc de `AdaptateurFeuilleExercices.regroupable` dans `genererFeuilleExercices.ts`.
 *
 * **Le tableau de données initial (xᵢ/nᵢ, ou classes) est une donnée FIXE affichée en permanence à
 * l'écran** (`EnonceMoyennePonderee.tsx`, avant chaque phase) — jamais reconstruite par l'élève,
 * contrairement à "Tableau de fréquences". Elle est donc affichée ici dans `enteteFragments`
 * (`formatDonneesDiscretesTexte`/`formatDonneesClassesTexte`, une liste "valeur (effectif n)"
 * séparée par des points-virgules, même principe que la liste brute de
 * `tableauFrequences/exportEvaluation.ts`) plutôt qu'en `enteteHtml` : ce dernier est réservé aux
 * contenus NON représentables en `FragmentConsigne` (graphiques SVG, voir la doc de `SectionExercice`
 * dans `genererFeuilleExercices.ts`) et surtout IGNORÉ par le pipeline docx
 * (`genererFeuilleExercices.ts::construireBlocCorrection`) — un tableau de données que l'élève doit
 * absolument voir pour répondre ne peut pas dépendre d'un pipeline qui l'ignore silencieusement.
 *
 * **Aucune zone de réponse vierge** (`QuestionExercice.reponse` omis partout, spec de la tâche) —
 * l'élève répond sur une feuille à part.
 *
 * **Correction RESYNTHÉTISÉE depuis les valeurs déjà connues de l'instance** (`instance.n`,
 * `instance.sommeXN`, `instance.moyenne`, `classe.centre`), jamais recalculée indépendamment ici :
 * même donnée que celle vérifiée par `moteur/verificationMoyennePonderee.ts` côté écran. Rendue en
 * deux `BlocCorrection` de type `"tableau"` (voir `tableauFrequences/exportEvaluation.ts`/
 * `analyseFonction/exportWord.ts` pour le même patron — grandeurs en LIGNES, données tirées en
 * COLONNES, l'orientation la plus lisible sur une feuille imprimée pour ce type de tableau) : un
 * premier pour les centres de classe (variante `"classes"` uniquement), un second pour les produits
 * xᵢ·nᵢ ligne par ligne — puis deux paragraphes texte pour les sommes totales et le quotient final.
 * Rappel du piège "estimation" (voir `core/moyennePonderee.types.ts`) explicité dans la dernière
 * phrase pour la variante `"classes"` uniquement (la variante `"discrete"` donne une moyenne EXACTE).
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

/** Ligne à un index donné, sous la forme générique (x, n) — x est la valeur (variante "discrete")
 * ou le centre déjà connu (variante "classes") — même principe que `ligneAt`/`lignes` de
 * `components/EtapeSommesMoyennePonderee.tsx` (dupliqué ici, pas importé : `exportEvaluation.ts`
 * n'importe jamais `src/moteur/`/`src/components/`, même convention que les autres adaptateurs). */
function donneesLignes(instance: ExerciceMoyennePonderee): { x: number; n: number }[] {
  if (instance.variante === "discrete") {
    return instance.lignes.map((ligne) => ({ x: ligne.valeur, n: ligne.effectif }));
  }
  return instance.classes.map((classe) => ({ x: classe.centre, n: classe.effectif }));
}

function formatDonneesDiscretesTexte(instance: ExerciceMoyennePondereeDiscrete): string {
  return instance.lignes.map((ligne) => `${formatNombre(ligne.valeur)} (effectif ${formatNombre(ligne.effectif)})`).join(" ; ");
}

function formatDonneesClassesTexte(instance: ExerciceMoyennePondereeClasses): string {
  return instance.classes.map((classe, i) => `${formatClasseTexte(instance, i)} (effectif ${formatNombre(classe.effectif)})`).join(" ; ");
}

/** `consigneQuotient` (`ui/formatMoyennePonderee.ts`) retourne un `ConsigneSegmentee`
 * (avant/latex/après, patron JSX) — simple changement de contrat vers `FragmentConsigne[]`, jamais
 * une reformulation du texte lui-même. */
function consigneQuotientFragments(instance: ExerciceMoyennePonderee): FragmentConsigne[] {
  const consigne = consigneQuotient(instance);
  return [texte(consigne.avant), latex(consigne.latex), texte(consigne.apres)];
}

function construireEnonceMoyennePonderee(instance: ExerciceMoyennePonderee): SectionExercice {
  const donneesTexte = instance.variante === "discrete" ? formatDonneesDiscretesTexte(instance) : formatDonneesClassesTexte(instance);

  const questions: QuestionExercice[] = [];
  if (instance.variante === "classes") {
    questions.push({ consigne: [texte(consigneCentres(instance))] });
  }
  questions.push({ consigne: [texte(CONSIGNE_SOMMES)] });
  questions.push({ consigne: consigneQuotientFragments(instance) });

  return {
    enteteFragments: [texte(`${formatEnonceTexte(instance)} `), texte(donneesTexte), texte(".")],
    questions,
  };
}

function construireCorrectionMoyennePonderee(instance: ExerciceMoyennePonderee): BlocCorrection[] {
  const blocs: BlocCorrection[] = [];
  let indexLettre = 0;
  const prochaineLettre = (): string => `${LETTRES[indexLettre++] ?? String(indexLettre)}) `;

  if (instance.variante === "classes") {
    blocs.push({ type: "paragraphe", fragments: [texte(`${prochaineLettre()}Centre de chaque classe :`)] });
    blocs.push({
      type: "tableau",
      libellesLignes: ["Classe", "Effectif", "Centre"],
      valeursParLigne: [
        instance.classes.map((_, i) => formatClasseTexte(instance, i)),
        instance.classes.map((classe) => formatNombre(classe.effectif)),
        instance.classes.map((classe) => formatNombre(classe.centre)),
      ],
    });
  }

  const donnees = donneesLignes(instance);
  blocs.push({ type: "paragraphe", fragments: [texte(`${prochaineLettre()}Sommes intermédiaires :`)] });
  blocs.push({
    type: "tableau",
    libellesLignes: [instance.variante === "classes" ? "Centre" : "Valeur", "Effectif", "Produit"],
    valeursParLigne: [
      donnees.map((ligne) => formatNombre(ligne.x)),
      donnees.map((ligne) => formatNombre(ligne.n)),
      donnees.map((ligne) => formatNombre(ligne.x * ligne.n)),
    ],
  });
  blocs.push({
    type: "paragraphe",
    fragments: [latex(LABEL_SOMME_N), texte(` = ${formatNombre(instance.n)}    `), latex(LABEL_SOMME_XN), texte(` = ${formatNombre(instance.sommeXN)}.`)],
  });

  const messageEstimation =
    instance.variante === "classes"
      ? " Attention : les valeurs exactes à l'intérieur de chaque classe sont inconnues — cette moyenne n'est donc qu'une ESTIMATION, jamais une valeur exacte."
      : "";
  blocs.push({
    type: "paragraphe",
    fragments: [
      texte(prochaineLettre()),
      latex(
        `${LABEL_MOYENNE_BARRE} = \\dfrac{${LABEL_SOMME_XN}}{${LABEL_SOMME_N}} = \\dfrac{${formatNombre(instance.sommeXN)}}{${formatNombre(instance.n)}} = ${formatNombre(instance.moyenne)}`,
      ),
      texte(` ${instance.contexte.unite}.${messageEstimation}`),
    ],
  });

  return blocs;
}

export const adaptateurEvaluationMoyennePonderee: AdaptateurFeuilleExercices<ExerciceMoyennePonderee> = {
  titreDocument: "Moyenne pondérée — Évaluation",
  nomFichierBase: "moyenne-ponderee",
  genererInstance: genererExerciceMoyennePonderee,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceMoyennePonderee,
  construireCorrection: construireCorrectionMoyennePonderee,
};
