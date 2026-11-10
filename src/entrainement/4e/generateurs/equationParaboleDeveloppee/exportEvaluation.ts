import type { ExerciceEquationParaboleDeveloppee } from "../../core/equationParaboleDeveloppee.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, ErreurFrequente, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  CONSIGNE_CARACTERISTIQUES,
  formatCompletionLatex,
  formatDirectriceLatex,
  formatEquationDeveloppeeLatex,
  formatFoyerLatex,
  formatRegroupementLatex,
  formatSommetLatex,
  segmentsConsigneCompletion,
  segmentsConsigneRegroupement,
} from "../../ui/formatEquationParaboleDeveloppee";
import { formatSommeTermes } from "../../ui/formatEquation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationParaboleDeveloppee } from "./index";
import { PARAMETRES_PARABOLE_DEVELOPPEE, profilEquationParaboleDeveloppee } from "../profilsEvaluation4eCh7Coniques";

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
 *
 * **Feuille d'exercices / évaluation (refonte papier)** : l'énoncé papier est l'équation et la
 * consigne globale (sommet, foyer, p, directrice) ; les 3 écrans (regroupement, complétion du carré,
 * caractéristiques) deviennent les étapes 1 à 3 du corrigé détaillé. Aucune place de réponse.
 * Tirage équilibré : `profilsEvaluation4eCh7Coniques.ts` (coordonnées du sommet, coefficient a).
 */

function construireEnonceEquationParaboleDeveloppee(instance: ExerciceEquationParaboleDeveloppee): SectionExercice {
  return {
    enteteFragments: [texte("On considère l'équation développée suivante d'une parabole :"), latex(formatEquationDeveloppeeLatex(instance))],
    questions: [{ consigne: segmentsConsigneRegroupement(instance) }, { consigne: segmentsConsigneCompletion(instance) }, { consigne: [texte(CONSIGNE_CARACTERISTIQUES)] }],
  };
}

/** Énoncé papier : l'équation et la consigne globale (les 3 écrans deviennent les étapes du
 * corrigé). */
function enoncePapierEquationParaboleDeveloppee(instance: ExerciceEquationParaboleDeveloppee): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        texte("Détermine le sommet S, le foyer F, le paramètre p et l'équation de la directrice d de la parabole d'équation "),
        latex(formatEquationDeveloppeeLatex(instance)),
        texte("."),
      ],
      questions: [],
    },
  };
}

function construireCorrectionEquationParaboleDeveloppee(instance: ExerciceEquationParaboleDeveloppee): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [texte("Forme réduite : "), latex(formatCompletionLatex(instance)), texte(".")] },
    { type: "paragraphe", fragments: caracteristiques(instance) },
  ];
}

function variables(instance: ExerciceEquationParaboleDeveloppee): { carre: "x" | "y"; autre: "x" | "y"; sCarre: number; sAutre: number } {
  const vertical = instance.variante === "vertical";
  return { carre: vertical ? "x" : "y", autre: vertical ? "y" : "x", sCarre: vertical ? instance.sommet.x : instance.sommet.y, sAutre: vertical ? instance.sommet.y : instance.sommet.x };
}

function binome(variable: string, valeur: number): string {
  if (valeur === 0) return variable;
  return valeur > 0 ? `${variable} - ${valeur}` : `${variable} + ${-valeur}`;
}

function carreBinome(variable: string, valeur: number): string {
  return valeur === 0 ? `${variable}^2` : `(${binome(variable, valeur)})^2`;
}

function caracteristiques(instance: ExerciceEquationParaboleDeveloppee): FragmentConsigne[] {
  return [
    latex(`S${formatSommetLatex(instance.sommet)}`),
    texte(", "),
    latex(`p = ${instance.p}`),
    texte(", "),
    latex(`F${formatFoyerLatex(instance.foyer)}`),
    texte(", directrice "),
    latex(formatDirectriceLatex(instance)),
    texte("."),
  ];
}

function difficulteEquationParaboleDeveloppee(instance: ExerciceEquationParaboleDeveloppee): 1 | 2 | 3 {
  const { sCarre } = variables(instance);
  if (instance.a !== 1 && sCarre !== 0) return 3;
  return 2;
}

function reponseBreveEquationParaboleDeveloppee(instance: ExerciceEquationParaboleDeveloppee): FragmentConsigne[] {
  return caracteristiques(instance);
}

function correctionDetailleeEquationParaboleDeveloppee(instance: ExerciceEquationParaboleDeveloppee): EtapeCorrection[] {
  const { a, p } = instance;
  const { carre, autre, sCarre, sAutre } = variables(instance);
  const vertical = instance.variante === "vertical";
  const prefixe = a === 1 ? "" : String(a);
  // Second membre après regroupement : −bAutre·autre + c = 2ap·autre + c.
  const secondMembre = formatSommeTermes([
    { valeur: -instance.bAutre, suffixe: autre },
    { valeur: instance.c, suffixe: "" },
  ]);
  const apresCompletion = formatSommeTermes([
    { valeur: 2 * a * p, suffixe: autre },
    { valeur: instance.c + a * sCarre * sCarre, suffixe: "" },
  ]);
  const apresDivision = formatSommeTermes([
    { valeur: 2 * p, suffixe: autre },
    { valeur: -2 * p * sAutre, suffixe: "" },
  ]);

  const lignes: EtapeCorrection[] = [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [texte(`Seul ${carre} est au carré : l'axe de la parabole est ${vertical ? "vertical" : "horizontal"}. On garde les termes en ${carre} dans le premier membre et on passe le reste dans le second.`)],
    },
    {
      label: "Calcul",
      sousQuestion: "a",
      fragments: [texte(a === 1 ? "Regroupement : " : `Regroupement, puis mise en évidence du coefficient ${a} : `), latex(formatRegroupementLatex(instance)), texte(".")],
    },
  ];
  if (sCarre !== 0) {
    lignes.push(
      { label: "Méthode", sousQuestion: "b", fragments: [texte("On complète le carré : "), latex(`${carre}^2+b${carre}=\\left(${carre}+\\dfrac{b}{2}\\right)^2-\\left(\\dfrac{b}{2}\\right)^2`), texte(".")] },
      {
        label: "Calcul",
        sousQuestion: "b",
        fragments: [latex(`${a === 1 ? "" : `${a}\\left[`}${carreBinome(carre, sCarre)} - ${Math.abs(sCarre)}^2${a === 1 ? "" : "\\right]"} = ${secondMembre}`), texte(", d'où "), latex(`${prefixe}${carreBinome(carre, sCarre)} = ${apresCompletion}`), texte(".")],
      },
    );
  } else {
    lignes.push({ label: "Calcul", sousQuestion: "b", fragments: [texte(`Pas de terme du premier degré en ${carre} : le carré est déjà complet, `), latex(`${prefixe}${carre}^2 = ${secondMembre}`), texte(".")] });
  }
  lignes.push(
    {
      label: "Calcul",
      sousQuestion: "b",
      fragments: [
        ...(a === 1 ? [] : [texte(`On divise par ${a} : `), latex(`${carreBinome(carre, sCarre)} = ${apresDivision}`), texte(", ")]),
        texte("on met en évidence le coefficient de " + autre + " : "),
        latex(formatCompletionLatex(instance)),
        texte(", donc "),
        latex(`2p = ${2 * p}`),
        texte("."),
      ],
    },
    {
      label: "Lecture",
      sousQuestion: "c",
      fragments: [texte("Par comparaison avec "), latex(vertical ? "(x-x_S)^2=2p(y-y_S)" : "(y-y_S)^2=2p(x-x_S)"), texte(" : "), latex(`S${formatSommetLatex(instance.sommet)}`), texte(" et "), latex(`p = ${p}`), texte(".")],
    },
    {
      label: "Calcul",
      sousQuestion: "c",
      fragments: [
        texte("Le foyer est à "),
        latex("\\dfrac{p}{2}"),
        texte(" du sommet le long de l'axe, la directrice à "),
        latex("\\dfrac{p}{2}"),
        texte(" de l'autre côté : "),
        latex(`F${formatFoyerLatex(instance.foyer)}`),
        texte(" et "),
        latex(`d : ${formatDirectriceLatex(instance)}`),
        texte("."),
      ],
    },
    {
      label: "Piège",
      sousQuestion: "c",
      fragments:
        p < 0
          ? [texte("p est négatif : le foyer est du côté des " + autre + " décroissants ("), latex(`${vertical ? "y_F" : "x_F"} = ${vertical ? instance.foyer.y : instance.foyer.x}`), texte(") et la directrice de l'autre côté du sommet.")]
          : [texte("Le coefficient de la forme réduite est "), latex("2p"), texte(" : "), latex(`2p = ${2 * p}`), texte(" donne "), latex(`p = ${p}`), texte(", et non "), latex(`p = ${2 * p}`), texte(".")],
    },
  );
  return lignes;
}

function baremeEquationParaboleDeveloppee(instance: ExerciceEquationParaboleDeveloppee): BaremeExercice {
  const { sCarre } = variables(instance);
  const erreurs: ErreurFrequente[] = [
    { description: [texte("p confondu avec "), latex("2p")], cout: "−1" },
    { description: [texte("Foyer et directrice échangés de côté (signe de p ignoré)")], cout: "−1" },
  ];
  if (sCarre !== 0) erreurs.push({ description: [texte("Carré complété sans retrancher "), latex("\\left(\\dfrac{b}{2}\\right)^2"), texte(instance.a === 1 ? "" : ` (ou sans le multiplier par ${instance.a})`)], cout: "−1" });
  return {
    reponseFinale: caracteristiques(instance),
    criteres: [
      { sousQuestion: "a", critere: [texte("Termes regroupés"), texte(instance.a === 1 ? "" : ` et coefficient ${instance.a} mis en évidence`)], points: 1 },
      { sousQuestion: "b", critere: [texte("Forme réduite "), latex(formatCompletionLatex(instance))], points: 1 },
      { sousQuestion: "c", critere: [texte("Sommet "), latex(`S${formatSommetLatex(instance.sommet)}`)], points: 0.5 },
      { sousQuestion: "c", critere: [texte("Paramètre "), latex(`p = ${instance.p}`)], points: 0.5 },
      { sousQuestion: "c", critere: [texte("Foyer "), latex(`F${formatFoyerLatex(instance.foyer)}`)], points: 0.5 },
      { sousQuestion: "c", critere: [texte("Directrice "), latex(formatDirectriceLatex(instance))], points: 0.5 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Toute forme réduite équivalente (coefficient du second membre non factorisé), si S et p en sont correctement déduits")]],
  };
}

export const adaptateurEvaluationEquationParaboleDeveloppee: AdaptateurFeuilleExercices<ExerciceEquationParaboleDeveloppee> = {
  titreDocument: "Sommet, foyer, p et directrice d'une parabole depuis l'équation développée — Évaluation",
  nomFichierBase: "equation-parabole-developpee",
  genererInstance: genererExerciceEquationParaboleDeveloppee,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceEquationParaboleDeveloppee,
  construireCorrection: construireCorrectionEquationParaboleDeveloppee,
  difficulte: difficulteEquationParaboleDeveloppee,
  reponseBreve: reponseBreveEquationParaboleDeveloppee,
  correctionDetaillee: correctionDetailleeEquationParaboleDeveloppee,
  bareme: baremeEquationParaboleDeveloppee,
  enoncePapier: enoncePapierEquationParaboleDeveloppee,
  dureeMinutes: 7,
  profilInstance: profilEquationParaboleDeveloppee,
  parametresAuChoix: PARAMETRES_PARABOLE_DEVELOPPEE,
};
