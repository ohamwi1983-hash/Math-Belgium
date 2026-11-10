import type {
  ExerciceOrthogonalite,
  ExerciceOrthogonaliteParametre,
  ExerciceOrthogonaliteTest,
  ExerciceOrthogonaliteTriangle,
  ExerciceOrthogonaliteTriangleParametre,
  Sommet,
} from "../../core/orthogonalite.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { nombreFrLatex } from "../../ui/nombreFr";
import { profilOrthogonalite } from "../profilsEvaluation4eCh6";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  formatComposantesLatex,
  formatComposantesLinLatex,
  formatComposantesLinMatriceLatex,
  formatComposantesMatriceLatex,
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
      { consigne: [texte("Donne la relation d'orthogonalité entre ces vecteurs, sous la forme d'une équation en x.")] },
      { consigne: [texte("Résous cette équation pour déterminer x.")] },
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
      },
      {
        consigne: [texte("Calcule le critère d'orthogonalité en "), latex(labelA), texte(", en "), latex(labelB), texte(", puis en "), latex(labelC), texte(".")],
      },
      {
        consigne: [texte("Ce triangle est-il rectangle ? Si oui, précise en quel sommet.")],
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
      },
      {
        consigne: [texte("Réduis le critère d'orthogonalité en "), latex(labelA), texte(", en "), latex(labelB), texte(", puis en "), latex(labelC), texte(" à une équation.")],
      },
      {
        consigne: [texte("Résous la seule équation résolvable, puis conclus : ce triangle est-il rectangle ? Si oui, en quel sommet ?")],
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

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Les écrans (composantes, critères, résolution, conclusion) sont des étapes d'APPRENTISSAGE :
// l'énoncé papier garde les données et la question globale ; les écrans deviennent les étapes du
// corrigé. Orthogonaux ou non / rectangle ou non (et en quel sommet) est un VERDICT : jamais un cas
// particulier du tirage.

const METHODE_ORTHO: FragmentConsigne[] = [
  texte("Deux vecteurs sont orthogonaux si et seulement si "),
  latex("x_{\\vec u}\\cdot x_{\\vec v} + y_{\\vec u}\\cdot y_{\\vec v} = 0"),
  texte("."),
];

function enoncePapier(instance: ExerciceOrthogonalite): EnoncePapier {
  const donnees = latex(formatEnonceLatex(instance));
  if (instance.variante === "test") {
    return { section: { enteteFragments: [texte("On donne les vecteurs "), donnees, texte(". Les vecteurs "), latex(`\\vec{${instance.v1Nom}}`), texte(" et "), latex(`\\vec{${instance.v2Nom}}`), texte(" sont-ils orthogonaux ? Justifie par un calcul.")], questions: [] } };
  }
  if (instance.variante === "parametre") {
    return { section: { enteteFragments: [texte("On donne les vecteurs "), donnees, texte(". Détermine la valeur du réel "), latex("x"), texte(" pour laquelle "), latex(`\\vec{${instance.v1Nom}}`), texte(" et "), latex(`\\vec{${instance.v2Nom}}`), texte(" sont orthogonaux.")], questions: [] } };
  }
  const { labelA, labelB, labelC } = instance;
  if (instance.variante === "triangle") {
    return { section: { enteteFragments: [texte("On donne les points "), donnees, texte(". Le triangle "), latex(`${labelA}${labelB}${labelC}`), texte(" est-il rectangle ? Si oui, précise en quel sommet. Justifie par des calculs.")], questions: [] } };
  }
  return { section: { enteteFragments: [texte("On donne les points "), donnees, texte(". Détermine la valeur du réel "), latex("x"), texte(" pour laquelle le triangle "), latex(`${labelA}${labelB}${labelC}`), texte(" est rectangle, et précise en quel sommet.")], questions: [] } };
}

function conclusionTriangle(instance: ExerciceOrthogonaliteTriangle): string {
  return instance.sommetRectangle === null ? "Le triangle n'est pas rectangle." : `Le triangle est rectangle en ${labelSommet(instance, instance.sommetRectangle)}.`;
}

function reponseBreve(instance: ExerciceOrthogonalite): FragmentConsigne[] {
  if (instance.variante === "test") return [texte("Critère : "), latex(nombreFrLatex(instance.critere)), texte(instance.orthogonaux ? " ; les vecteurs sont orthogonaux." : " ; les vecteurs ne sont pas orthogonaux.")];
  if (instance.variante === "parametre") return [latex(`x = ${nombreFrLatex(instance.solutionX)}`)];
  if (instance.variante === "triangle") return [texte(conclusionTriangle(instance))];
  return [latex(`x = ${nombreFrLatex(instance.solutionX)}`), texte(` ; triangle rectangle en ${labelSommet(instance, instance.sommetFixe)}.`)];
}

function composantesTroisVecteurs(instance: ExerciceOrthogonaliteTriangle | ExerciceOrthogonaliteTriangleParametre): FragmentConsigne[] {
  const { labelA, labelB, labelC } = instance;
  const f = (cle: "vecteurAB" | "vecteurAC" | "vecteurBC") =>
    instance.variante === "triangle" ? formatComposantesMatriceLatex(instance[cle]) : formatComposantesLinMatriceLatex(instance[cle]);
  return [
    latex(`\\vec{${labelA}${labelB}} = ${f("vecteurAB")}`),
    texte(", "),
    latex(`\\vec{${labelA}${labelC}} = ${f("vecteurAC")}`),
    texte(" et "),
    latex(`\\vec{${labelB}${labelC}} = ${f("vecteurBC")}`),
  ];
}

function correctionDetaillee(instance: ExerciceOrthogonalite): EtapeCorrection[] {
  if (instance.variante === "test") {
    return [
      { label: "Méthode", sousQuestion: "a", fragments: METHODE_ORTHO },
      { label: "Calcul", sousQuestion: "a", fragments: [latex(`${formuleSubstitueeTestLatex(instance)} = ${nombreFrLatex(instance.critere)}`)] },
      { label: "Conclusion", sousQuestion: "a", fragments: [texte(instance.orthogonaux ? "Le critère est nul : les vecteurs sont orthogonaux." : "Le critère n'est pas nul : les vecteurs ne sont pas orthogonaux.")] },
      { label: "Piège", sousQuestion: "a", fragments: [texte("On multiplie les composantes de même rang (première avec première, seconde avec seconde) et on ADDITIONNE les deux produits.")] },
    ];
  }
  if (instance.variante === "parametre") {
    return [
      { label: "Méthode", sousQuestion: "a", fragments: METHODE_ORTHO },
      { label: "Relation", sousQuestion: "a", fragments: [latex(`${formuleSubstitueeParametreLatex(instance)} = 0`), texte(", soit "), latex(formatEquationReduiteParametreLatex(instance))] },
      { label: "Résolution", sousQuestion: "b", fragments: [latex(`x = ${nombreFrLatex(instance.solutionX)}`)] },
      { label: "Piège", sousQuestion: "b", fragments: [texte("En isolant x, le terme constant change de signe en passant dans l'autre membre ; on divise ensuite par le coefficient de x, avec son signe.")] },
    ];
  }
  const { labelA, labelB, labelC } = instance;
  if (instance.variante === "triangle") {
    const { critereA, critereB, critereC } = instance;
    return [
      { label: "Méthode", sousQuestion: "a", fragments: [texte("Le triangle est rectangle en un sommet si les deux côtés issus de ce sommet sont orthogonaux : on teste les trois sommets.")] },
      { label: "Calcul", sousQuestion: "a", fragments: composantesTroisVecteurs(instance) },
      { label: "Calcul", sousQuestion: "b", fragments: [texte(`En ${labelA} : `), latex(`${formuleSubstitueeSommetTriangleLatex(instance, "A")} = ${nombreFrLatex(critereA)}`)] },
      { label: "Calcul", sousQuestion: "b", fragments: [texte(`En ${labelB} : `), latex(`${formuleSubstitueeSommetTriangleLatex(instance, "B")} = ${nombreFrLatex(critereB)}`)] },
      { label: "Calcul", sousQuestion: "b", fragments: [texte(`En ${labelC} : `), latex(`${formuleSubstitueeSommetTriangleLatex(instance, "C")} = ${nombreFrLatex(critereC)}`)] },
      {
        label: "Conclusion",
        sousQuestion: "c",
        fragments: [
          texte(
            instance.sommetRectangle === null
              ? "Aucun des trois critères n'est nul : le triangle n'est pas rectangle."
              : `Le critère en ${labelSommet(instance, instance.sommetRectangle)} est nul : le triangle est rectangle en ${labelSommet(instance, instance.sommetRectangle)}.`,
          ),
        ],
      },
      { label: "Piège", sousQuestion: "b", fragments: [texte("Au sommet testé, les deux vecteurs doivent PARTIR de ce sommet (en B : BA et BC, pas AB et BC) ; sinon le signe d'un produit change.")] },
    ];
  }
  const { sommetFixe, reductionA, reductionB, reductionC, solutionX } = instance;
  const reductions: Record<Sommet, string> = { A: formatReductionLatex(reductionA), B: formatReductionLatex(reductionB), C: formatReductionLatex(reductionC) };
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Le triangle est rectangle en un sommet si les deux côtés issus de ce sommet sont orthogonaux : on écrit la condition en chacun des trois sommets.")] },
    { label: "Calcul", sousQuestion: "a", fragments: composantesTroisVecteurs(instance) },
    ...(["A", "B", "C"] as Sommet[]).map(
      (som): EtapeCorrection => ({
        label: "Calcul",
        sousQuestion: "b",
        fragments: [texte(`En ${labelSommet(instance, som)} : `), latex(`${formuleSubstitueeSommetTriangleParametreLatex(instance, som)} = 0`), texte(", soit "), latex(reductions[som])],
      }),
    ),
    {
      label: "Résolution",
      sousQuestion: "c",
      fragments: [
        texte(`Seule l'équation du sommet ${labelSommet(instance, sommetFixe)} est du premier degré ; les deux autres, du second degré, n'ont aucune solution réelle. `),
        latex(reductions[sommetFixe]),
        texte(" donne "),
        latex(`x = ${nombreFrLatex(solutionX)}`),
        texte("."),
      ],
    },
    { label: "Conclusion", sousQuestion: "c", fragments: [texte(`Pour cette valeur, le triangle est rectangle en ${labelSommet(instance, sommetFixe)}.`)] },
    { label: "Piège", sousQuestion: "b", fragments: [texte("Les composantes contiennent x : développer complètement chaque produit avant de réduire, sans oublier le terme en x² qui apparaît quand deux composantes en x se multiplient.")] },
  ];
}

function bareme(instance: ExerciceOrthogonalite): BaremeExercice {
  const signe = { description: [texte("Produits des composantes soustraits au lieu d'être additionnés")], cout: "−1,5" };
  if (instance.variante === "test") {
    return {
      reponseFinale: reponseBreve(instance),
      criteres: [
        { sousQuestion: "a", critere: [texte("Critère substitué : "), latex(formuleSubstitueeTestLatex(instance))], points: 1.5 },
        { sousQuestion: "a", critere: [texte("Valeur du critère : "), latex(nombreFrLatex(instance.critere))], points: 1 },
        { sousQuestion: "a", critere: [texte("Conclusion justifiée par le critère")], points: 1.5 },
      ],
      erreursFrequentes: [signe, { description: [texte("Conclusion sans calcul")], cout: "0 pt" }],
    };
  }
  if (instance.variante === "parametre") {
    return {
      reponseFinale: reponseBreve(instance),
      criteres: [
        { sousQuestion: "a", critere: [texte("Relation d'orthogonalité écrite avec x")], points: 1.5 },
        { sousQuestion: "a", critere: [texte("Équation réduite : "), latex(formatEquationReduiteParametreLatex(instance))], points: 1 },
        { sousQuestion: "b", critere: [texte("Solution : "), latex(`x = ${nombreFrLatex(instance.solutionX)}`)], points: 1.5 },
      ],
      erreursFrequentes: [signe, { description: [texte("Erreur de signe en isolant x")], cout: "−1" }],
    };
  }
  if (instance.variante === "triangle") {
    return {
      reponseFinale: reponseBreve(instance),
      criteres: [
        { sousQuestion: "a", critere: [texte("Composantes des trois vecteurs côtés")], points: 1 },
        { sousQuestion: "b", critere: [texte("Les trois critères calculés (vecteurs issus du sommet testé)")], points: 2 },
        { sousQuestion: "c", critere: [texte("Conclusion : "), ...reponseBreve(instance)], points: 1 },
      ],
      erreursFrequentes: [
        { description: [texte("Vecteurs non issus du sommet testé (signe d'un produit faux)")], cout: "−1" },
        { description: [texte("Un seul sommet testé, conclusion « pas rectangle » non justifiée")], cout: "−1" },
      ],
      reponsesAcceptees: [[texte("Réciproque de Pythagore sur les carrés des longueurs des côtés, si elle est correctement menée")]],
    };
  }
  return {
    reponseFinale: reponseBreve(instance),
    criteres: [
      { sousQuestion: "a", critere: [texte("Composantes des trois vecteurs côtés (en fonction de x)")], points: 1 },
      { sousQuestion: "b", critere: [texte("Conditions d'orthogonalité réduites aux trois sommets")], points: 1.5 },
      { sousQuestion: "c", critere: [texte("Solution : "), latex(`x = ${nombreFrLatex(instance.solutionX)}`)], points: 1 },
      { sousQuestion: "c", critere: [texte(`Sommet de l'angle droit : ${labelSommet(instance, instance.sommetFixe)}`)], points: 0.5 },
    ],
    erreursFrequentes: [
      { description: [texte("Terme en x² oublié en développant")], cout: "−1" },
      { description: [texte("Seul un sommet étudié, sans justifier l'absence de solution aux deux autres")], cout: "−0,5" },
    ],
  };
}

/** ★ test de deux vecteurs ; ★★ paramètre ou triangle ; ★★★ triangle avec paramètre. */
function difficulte(instance: ExerciceOrthogonalite): 1 | 2 | 3 {
  if (instance.variante === "test") return 1;
  return instance.variante === "triangleParametre" ? 3 : 2;
}

export const adaptateurEvaluationOrthogonalite: AdaptateurFeuilleExercices<ExerciceOrthogonalite> = {
  titreDocument: "Orthogonalité et théorème de Pythagore généralisé — Évaluation",
  nomFichierBase: "orthogonalite-pythagore-generalise",
  genererInstance: genererExerciceOrthogonalite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceOrthogonalite,
  construireCorrection: construireCorrectionOrthogonalite,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 5,
  profilInstance: profilOrthogonalite,
  // PAS regroupable : 1 à 3 questions selon la variante, jamais uniformément 1 seule — voir le
  // commentaire de tête.
};
