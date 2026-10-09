import type {
  ExerciceOrthogonalite,
  ExerciceOrthogonaliteParametre,
  ExerciceOrthogonaliteTest,
  ExerciceOrthogonaliteTriangle,
  ExerciceOrthogonaliteTriangleParametre,
  Sommet,
} from "../../core/orthogonalite.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  formatComposantesLatex,
  formatComposantesLinLatex,
  formatEnonceLatex,
  formatEquationReduiteParametreLatex,
  formatReductionLatex,
  formuleSubstitueeParametreLatex,
  formuleSubstitueeSommetTriangleLatex,
  formuleSubstitueeSommetTriangleParametreLatex,
  formuleSubstitueeTestLatex,
  libelleRectangleEn,
} from "../../ui/formatOrthogonalite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceOrthogonalite } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceOrthogonalite>` pour gen25 (Orthogonalité et
 * théorème de Pythagore généralisé — chapitre "Calcul vectoriel", `AppOrthogonalite.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * **Écran → question, dispatch par variante** (`moteur/typesOrthogonalite.ts::SEQUENCES`, lu avant
 * d'écrire ce fichier) — les 4 variantes traversent des séquences d'écrans FIXES et totalement
 * DISJOINTES (aucune phase partagée), donc `construireEnonce`/`construireCorrection` dispatchent
 * entièrement sur `instance.variante`, sans aucune logique commune entre les 4 branches :
 *
 * - **"test"** (1 écran, `EtapeTestOrthogonalite.tsx`) → **1 question** : "Calcule le critère
 *   d'orthogonalité entre ces deux vecteurs, puis indique s'ils sont orthogonaux." — reprend en un
 *   seul énoncé papier le double champ de l'écran (critère numérique + conclusion Oui/Non).
 * - **"parametre"** (2 écrans, réduction → résolution) → **2 questions a/b**, dans le même ordre :
 *   (a) la relation d'orthogonalité réduite (`EtapeReductionParametreOrthogonalite.tsx`,
 *   `CONSIGNE_REDUCTION_PARAMETRE_ORTHOGONALITE`), jamais la valeur de x elle-même ; (b) la
 *   résolution de cette équation (`EtapeResolutionParametreOrthogonalite.tsx`) — même principe que
 *   `simplification/exportEvaluation.ts`, qui regroupe des écrans séquentiellement liés en questions
 *   papier a)/b)/c) plutôt qu'un micro-écran chacun.
 * - **"triangle"** (5 écrans : construction → testSommetA/B/C → conclusion) → **3 questions a/b/c** :
 *   (a) les 3 vecteurs AB⃗/AC⃗/BC⃗ (fusion des 3 champs de `EtapeConstructionTriangleOrthogonalite.tsx`
 *   en une seule consigne, comme à l'écran) ; (b) les 3 critères d'orthogonalité en A, B, C (fusion
 *   des 3 écrans quasi identiques `EtapeTestSommetOrthogonalite.tsx` — même composant générique sur
 *   `sommet` à l'écran — en une seule question papier, plutôt que 3 questions redondantes) ; (c) la
 *   conclusion en 2 temps de `EtapeConclusionTriangleOrthogonalite.tsx` (rectangle ou non ; si oui,
 *   en quel sommet), posée comme une seule consigne papier.
 * - **"triangleParametre"** (5 écrans : constructionAvecX → reductionSommetA/B/C →
 *   identificationResolution) → **3 questions a/b/c**, même principe de fusion que "triangle" :
 *   (a) les 3 vecteurs symboliques (en x) ; (b) les 3 équations réduites (degré 1 pour le sommet
 *   fixe, degré 2 pour les 2 sommets mobiles — voir `core/orthogonalite.types.ts` pour la
 *   justification géométrique complète) ; (c) la résolution de la SEULE équation résolvable
 *   (`EtapeIdentificationResolutionOrthogonalite.tsx`, "Résous la seule équation résolvable.") puis
 *   la même conclusion en 2 temps qu'en "triangle".
 *
 * **PAS `regroupable`** — la doc de `AdaptateurFeuilleExercices.regroupable`
 * (`export/genererFeuilleExercices.ts`) exige un générateur qui produit TOUJOURS une seule question
 * par instance, à consigne générique constante. C'est déjà faux structurellement dès la 2e variante :
 * "parametre"/"triangle"/"triangleParametre" produisent 2 ou 3 questions par instance, jamais 1 seul
 * (seule "test" qualifierait isolément — 1 question, consigne fixe indépendante des valeurs tirées,
 * les noms u/v étant toujours constants, voir le commentaire de tête de `generateurs/orthogonalite/
 * index.ts` — mais `regroupable` est un seul indicateur pour TOUT l'adaptateur, pas par variante :
 * il ne peut donc jamais s'activer ici tant que "parametre"/"triangle"/"triangleParametre" restent
 * dans le même catalogue).
 *
 * **Aucune zone de réponse vierge** (`reponse: { type: "lignes", nombre: 0 }` sur toutes les
 * questions) — même décision documentée que `triangleQuelconque`/`quelAngle`/`cercleTrigonometrique`
 * (même chapitre/projet) : l'élève répond sur une feuille à part, jamais sur la copie imprimée.
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues et correctes de chaque instance tirée
 * (`critere`/`orthogonaux`, `solutionX`, `critereA/B/C`/`sommetRectangle`, `reductionA/B/C`/
 * `solutionX`, selon la variante — jamais recalculées indépendamment ici), en réutilisant
 * directement les fonctions de formatage déjà utilisées côté écran interactif
 * (`ui/formatOrthogonalite.ts` — `formuleSubstitueeTestLatex`/`formuleSubstitueeParametreLatex`/
 * `formuleSubstitueeSommetTriangleLatex`/`formuleSubstitueeSommetTriangleParametreLatex` pour la
 * formule substituée non calculée de chaque critère, `formatEquationReduiteParametreLatex`/
 * `formatReductionLatex` pour l'équation réduite, `libelleRectangleEn` pour le libellé de
 * conclusion) plutôt que d'en resynthétiser de nouvelles. `formatEnonceLatex` (dispatch déjà
 * existant sur les 4 variantes) sert tel quel de bloc de données (`enteteFragments`) pour les 4
 * branches — jamais besoin du découpage "bloc fitter" en plusieurs fragments
 * (`formatTermesEnonceTriangleLatex`/`formatTermesEnonceTriangleParametreLatex`, réservé au risque
 * de débordement MOBILE de l'écran interactif, sans équivalent sur une page imprimée).
 */

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

function labelSommet(exercice: { labelA: string; labelB: string; labelC: string }, sommet: Sommet): string {
  return sommet === "A" ? exercice.labelA : sommet === "B" ? exercice.labelB : exercice.labelC;
}

function paragraphe(lettre: string, fragments: FragmentConsigne[]): BlocCorrection {
  return { type: "paragraphe", fragments: [texte(`${lettre}) `), ...fragments] };
}

// ============================================================================
// Variante "test"
// ============================================================================

function construireEnonceTest(instance: ExerciceOrthogonaliteTest): SectionExercice {
  return {
    enteteFragments: [latex(formatEnonceLatex(instance))],
    questions: [
      {
        consigne: [texte("Calcule le critère d'orthogonalité entre "), latex(`\\vec{${instance.v1Nom}}`), texte(" et "), latex(`\\vec{${instance.v2Nom}}`), texte(", puis indique si ces deux vecteurs sont orthogonaux.")],
        reponse: { type: "lignes", nombre: 0 },
      },
    ],
  };
}

function construireCorrectionTest(instance: ExerciceOrthogonaliteTest): BlocCorrection[] {
  return [
    {
      type: "paragraphe",
      fragments: [
        texte("Critère d'orthogonalité : "),
        latex(`${formuleSubstitueeTestLatex(instance)} = ${formatNombre(instance.critere)}`),
        texte(instance.orthogonaux ? " — nul, donc les vecteurs sont orthogonaux." : " — non nul, donc les vecteurs ne sont pas orthogonaux."),
      ],
    },
  ];
}

// ============================================================================
// Variante "parametre"
// ============================================================================

function construireEnonceParametre(instance: ExerciceOrthogonaliteParametre): SectionExercice {
  return {
    enteteFragments: [latex(formatEnonceLatex(instance))],
    questions: [
      { consigne: [texte("Donne la relation d'orthogonalité entre ces vecteurs, sous la forme d'une équation en x.")], reponse: { type: "lignes", nombre: 0 } },
      { consigne: [texte("Résous cette équation pour déterminer x.")], reponse: { type: "lignes", nombre: 0 } },
    ],
  };
}

function construireCorrectionParametre(instance: ExerciceOrthogonaliteParametre): BlocCorrection[] {
  return [
    paragraphe("a", [latex(`${formuleSubstitueeParametreLatex(instance)} = 0`), texte(", soit "), latex(formatEquationReduiteParametreLatex(instance))]),
    paragraphe("b", [latex(`x = ${formatNombre(instance.solutionX)}`), texte(".")]),
  ];
}

// ============================================================================
// Variante "triangle"
// ============================================================================

function construireEnonceTriangle(instance: ExerciceOrthogonaliteTriangle): SectionExercice {
  const { labelA, labelB, labelC } = instance;
  return {
    enteteFragments: [texte("On considère le triangle "), latex(`${labelA}${labelB}${labelC}`), texte(" suivant :"), texte(" "), latex(formatEnonceLatex(instance))],
    questions: [
      {
        consigne: [texte("Calcule les composantes des vecteurs "), latex(`\\vec{${labelA}${labelB}}`), texte(", "), latex(`\\vec{${labelA}${labelC}}`), texte(" et "), latex(`\\vec{${labelB}${labelC}}`), texte(".")],
        reponse: { type: "lignes", nombre: 0 },
      },
      {
        consigne: [texte("Calcule le critère d'orthogonalité en "), latex(labelA), texte(", en "), latex(labelB), texte(", puis en "), latex(labelC), texte(".")],
        reponse: { type: "lignes", nombre: 0 },
      },
      {
        consigne: [texte("Ce triangle est-il rectangle ? Si oui, précise en quel sommet.")],
        reponse: { type: "lignes", nombre: 0 },
      },
    ],
  };
}

function construireCorrectionTriangle(instance: ExerciceOrthogonaliteTriangle): BlocCorrection[] {
  const { labelA, labelB, labelC, vecteurAB, vecteurAC, vecteurBC, critereA, critereB, critereC, sommetRectangle } = instance;

  const blocs: BlocCorrection[] = [
    paragraphe("a", [
      latex(`\\vec{${labelA}${labelB}} = ${formatComposantesLatex(vecteurAB)}`),
      texte(", "),
      latex(`\\vec{${labelA}${labelC}} = ${formatComposantesLatex(vecteurAC)}`),
      texte(", "),
      latex(`\\vec{${labelB}${labelC}} = ${formatComposantesLatex(vecteurBC)}`),
    ]),
    paragraphe("b", [
      latex(`\\text{Critère en ${labelA}} = ${formuleSubstitueeSommetTriangleLatex(instance, "A")} = ${formatNombre(critereA)}`),
      texte(" ; "),
      latex(`\\text{Critère en ${labelB}} = ${formuleSubstitueeSommetTriangleLatex(instance, "B")} = ${formatNombre(critereB)}`),
      texte(" ; "),
      latex(`\\text{Critère en ${labelC}} = ${formuleSubstitueeSommetTriangleLatex(instance, "C")} = ${formatNombre(critereC)}`),
    ]),
  ];

  blocs.push(
    paragraphe(
      "c",
      sommetRectangle === null
        ? [texte("Aucun des 3 critères n'est nul : le triangle n'est pas rectangle.")]
        : [texte(`Le critère en ${labelSommet(instance, sommetRectangle)} est nul : le triangle est rectangle. `), texte(libelleRectangleEn(sommetRectangle, instance)), texte(".")],
    ),
  );

  return blocs;
}

// ============================================================================
// Variante "triangleParametre"
// ============================================================================

function construireEnonceTriangleParametre(instance: ExerciceOrthogonaliteTriangleParametre): SectionExercice {
  const { labelA, labelB, labelC } = instance;
  return {
    enteteFragments: [texte("On considère le triangle "), latex(`${labelA}${labelB}${labelC}`), texte(" suivant :"), texte(" "), latex(formatEnonceLatex(instance))],
    questions: [
      {
        consigne: [
          texte("Calcule les composantes (en fonction de x) des vecteurs "),
          latex(`\\vec{${labelA}${labelB}}`),
          texte(", "),
          latex(`\\vec{${labelA}${labelC}}`),
          texte(" et "),
          latex(`\\vec{${labelB}${labelC}}`),
          texte("."),
        ],
        reponse: { type: "lignes", nombre: 0 },
      },
      {
        consigne: [texte("Réduis le critère d'orthogonalité en "), latex(labelA), texte(", en "), latex(labelB), texte(", puis en "), latex(labelC), texte(" à une équation.")],
        reponse: { type: "lignes", nombre: 0 },
      },
      {
        consigne: [texte("Résous la seule équation résolvable, puis conclus : ce triangle est-il rectangle ? Si oui, en quel sommet ?")],
        reponse: { type: "lignes", nombre: 0 },
      },
    ],
  };
}

function construireCorrectionTriangleParametre(instance: ExerciceOrthogonaliteTriangleParametre): BlocCorrection[] {
  const { labelA, labelB, labelC, vecteurAB, vecteurAC, vecteurBC, sommetFixe, reductionA, reductionB, reductionC, solutionX } = instance;
  const reductions: Record<Sommet, string> = { A: formatReductionLatex(reductionA), B: formatReductionLatex(reductionB), C: formatReductionLatex(reductionC) };

  const blocs: BlocCorrection[] = [
    paragraphe("a", [
      latex(`\\vec{${labelA}${labelB}} = ${formatComposantesLinLatex(vecteurAB)}`),
      texte(", "),
      latex(`\\vec{${labelA}${labelC}} = ${formatComposantesLinLatex(vecteurAC)}`),
      texte(", "),
      latex(`\\vec{${labelB}${labelC}} = ${formatComposantesLinLatex(vecteurBC)}`),
    ]),
    paragraphe("b", [
      latex(`\\text{Critère en ${labelA}} : ${formuleSubstitueeSommetTriangleParametreLatex(instance, "A")} = 0`),
      texte(", soit "),
      latex(reductions.A),
      texte(" ; "),
      latex(`\\text{Critère en ${labelB}} : ${formuleSubstitueeSommetTriangleParametreLatex(instance, "B")} = 0`),
      texte(", soit "),
      latex(reductions.B),
      texte(" ; "),
      latex(`\\text{Critère en ${labelC}} : ${formuleSubstitueeSommetTriangleParametreLatex(instance, "C")} = 0`),
      texte(", soit "),
      latex(reductions.C),
    ]),
    paragraphe("c", [
      texte(`Seule l'équation du sommet ${labelSommet(instance, sommetFixe)} est de degré 1 (les 2 autres, de degré 2, n'ont aucune solution réelle) : elle est donc la seule résolvable. `),
      latex(`${reductions[sommetFixe]}`),
      texte(` donne x = ${formatNombre(solutionX)}. Le triangle est donc rectangle. `),
      texte(libelleRectangleEn(sommetFixe, instance)),
      texte("."),
    ]),
  ];

  return blocs;
}

// ============================================================================
// Dispatch + export
// ============================================================================

function construireEnonceOrthogonalite(instance: ExerciceOrthogonalite): SectionExercice {
  if (instance.variante === "test") return construireEnonceTest(instance);
  if (instance.variante === "parametre") return construireEnonceParametre(instance);
  if (instance.variante === "triangle") return construireEnonceTriangle(instance);
  return construireEnonceTriangleParametre(instance);
}

function construireCorrectionOrthogonalite(instance: ExerciceOrthogonalite): BlocCorrection[] {
  if (instance.variante === "test") return construireCorrectionTest(instance);
  if (instance.variante === "parametre") return construireCorrectionParametre(instance);
  if (instance.variante === "triangle") return construireCorrectionTriangle(instance);
  return construireCorrectionTriangleParametre(instance);
}

export const adaptateurEvaluationOrthogonalite: AdaptateurFeuilleExercices<ExerciceOrthogonalite> = {
  titreDocument: "Orthogonalité et théorème de Pythagore généralisé — Évaluation",
  nomFichierBase: "orthogonalite-pythagore-generalise",
  genererInstance: genererExerciceOrthogonalite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceOrthogonalite,
  construireCorrection: construireCorrectionOrthogonalite,
  // PAS regroupable : 1 à 3 questions selon la variante, jamais uniformément 1 seule — voir le
  // commentaire de tête.
};
