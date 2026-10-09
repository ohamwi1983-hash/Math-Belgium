import type { ExerciceEquationParaboleDeveloppee } from "../../core/equationParaboleDeveloppee.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  CONSIGNE_CARACTERISTIQUES,
  CONSIGNE_COMPLETION,
  formatCompletionLatex,
  formatDirectriceLatex,
  formatEquationDeveloppeeLatex,
  formatFoyerLatex,
  formatRegroupementLatex,
  formatSommetLatex,
  segmentsConsigneRegroupement,
} from "../../ui/formatEquationParaboleDeveloppee";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationParaboleDeveloppee } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationParaboleDeveloppee>` pour gen52 (Sommet,
 * foyer, p et directrice d'une parabole depuis l'équation développée, `AppEquationParaboleDeveloppee.tsx`)
 * — voir `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * NOTE — le prompt qui a lancé ce portage supposait 4 variantes d'orientation ; le contrat réel
 * (`CATALOGUE_VARIANTES`, `generateurs/equationParaboleDeveloppee/index.ts`) n'en expose que 2,
 * `"vertical"`/`"horizontal"` (même `OrientationParabole` que gen51, `core/equationParabole.types.ts`)
 * — repris ici tel quel, sans en inventer d'autres.
 *
 * Écran → question papier — `AppEquationParaboleDeveloppee.tsx`/`sessionEquationParaboleDeveloppee.ts`
 * fait traverser l'élève par 3 écrans FIXES, toujours dans le même ordre (jamais de saut
 * conditionnel, les 2 variantes suivant la même séquence) : "regroupement" (séparer les termes en
 * la variable au carré des autres et mettre en évidence les coefficients), "completion"
 * (compléter le carré pour obtenir `(variable-sommet)²=2p(autre variable-sommet)`), puis
 * "caracteristiques" (S, F, p signé ET directrice, les 4 dans UN SEUL écran/UNE seule note — voir
 * `verifierCaracteristiques`). Repris ici tels quels en 3 questions a)/b)/c), même principe de
 * consolidation qu'`analyseFonction/exportWord.ts`/`simplification/exportEvaluation.ts` : une
 * question papier par écran logique, jamais par micro-interaction.
 *
 * PAS `regroupable` : 3 questions par instance (pas 1), et la consigne de la question a)
 * (`segmentsConsigneRegroupement`) est elle-même ADAPTATIVE — elle nomme explicitement la variable
 * au carré de l'instance ("Sépare les termes en x..." ou "...en y...", selon `exercice.variante`)
 * — donc jamais une consigne GÉNÉRIQUE indépendante des valeurs tirées au sens de
 * `AdaptateurFeuilleExercices.regroupable` (voir son commentaire dans `genererFeuilleExercices.ts`).
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`exercice.sommet/foyer/p/directrice`, déjà construits sens direct par le générateur — voir
 * l'en-tête de `generateurs/equationParaboleDeveloppee/index.ts`), jamais recalculée
 * indépendamment : réutilise directement les formateurs déjà utilisés côté écran interactif
 * (`ui/formatEquationParaboleDeveloppee.ts` — `formatRegroupementLatex`/`formatCompletionLatex`
 * pour les 2 premières formes intermédiaires de référence, déjà celles utilisées par la garde de
 * vérification structurelle ; `formatSommetLatex`/`formatFoyerLatex`/`formatDirectriceLatex` pour
 * l'écran 3) plutôt que d'en reconstruire une nouvelle. Les 3 aides progressives de ce générateur
 * (`TEXTE_AIDE_REGROUPEMENT_NIVEAU1`, `texteAideRegroupementNiveau2`, `segmentsAideCompletionNiveau1`,
 * `texteAideCompletionNiveau2`, `formatAideCaracteristiquesNiveau1Latex`/`Niveau2Latex`) sont des
 * indices PARTIELS pensés pour un élève bloqué en cours de résolution (ex. "2p = ...", la formule
 * générale de F) — jamais des étapes de résolution complètes à concaténer telles quelles ; la
 * correction ci-dessous rédige donc sa propre phrase de synthèse autour des 3 formes de référence
 * plutôt que de citer ces textes d'aide.
 */

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

function construireEnonceEquationParaboleDeveloppee(instance: ExerciceEquationParaboleDeveloppee): SectionExercice {
  return {
    enteteFragments: [texte("On considère l'équation développée suivante d'une parabole :"), latex(formatEquationDeveloppeeLatex(instance))],
    questions: [
      { consigne: segmentsConsigneRegroupement(instance), reponse: { type: "lignes", nombre: 3 } },
      { consigne: [texte(CONSIGNE_COMPLETION)], reponse: { type: "lignes", nombre: 3 } },
      { consigne: [texte(CONSIGNE_CARACTERISTIQUES)], reponse: { type: "lignes", nombre: 4 } },
    ],
  };
}

function construireCorrectionEquationParaboleDeveloppee(instance: ExerciceEquationParaboleDeveloppee): BlocCorrection[] {
  const { sommet, foyer, p } = instance;

  return [
    {
      type: "paragraphe",
      fragments: [texte("a) On met en évidence le coefficient a et sépare les 2 variables : "), latex(formatRegroupementLatex(instance)), texte(".")],
    },
    {
      type: "paragraphe",
      fragments: [texte("b) En complétant le carré : "), latex(formatCompletionLatex(instance)), texte(".")],
    },
    {
      type: "paragraphe",
      fragments: [
        texte("c) On lit directement le sommet S"),
        latex(formatSommetLatex(sommet)),
        texte(" dans la forme complétée ci-dessus. Le foyer F"),
        latex(formatFoyerLatex(foyer)),
        texte(` se déduit du décalage le long de l'axe (moitié de p) ; le paramètre p (signé) vaut ${formatNombre(p)} ; la droite directrice a pour équation `),
        latex(formatDirectriceLatex(instance)),
        texte(" (symétrique de F par rapport à S le long de l'axe)."),
      ],
    },
  ];
}

export const adaptateurEvaluationEquationParaboleDeveloppee: AdaptateurFeuilleExercices<ExerciceEquationParaboleDeveloppee> = {
  titreDocument: "Sommet, foyer, p et directrice d'une parabole depuis l'équation développée — Évaluation",
  nomFichierBase: "equation-parabole-developpee",
  genererInstance: genererExerciceEquationParaboleDeveloppee,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceEquationParaboleDeveloppee,
  construireCorrection: construireCorrectionEquationParaboleDeveloppee,
  // 3 questions par instance (regroupement, complétion, caractéristiques), consigne a) adaptative
  // selon l'orientation (nomme la variable au carré) — jamais 1 question à consigne générique :
  // voir le commentaire de tête.
};
