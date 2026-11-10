import type { Exercice } from "../../core/generateur.types";
import type {
  ExerciceCas4a,
  ExerciceCas4b,
  ExerciceEquationRationnelle,
} from "../../core/equationRationnelle.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { latex, texte } from "../../../export/fragmentsDocx";
import { libelleCategorie } from "../../ui/categorieLabels";
import { formatEnonceLatex, formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "../../ui/formatEquation";
import {
  formatEquationRationnelleLatex,
  formatEquationRationnelleLatexApresSimplification,
  formatFractionGaucheFactorisee,
} from "../../ui/formatEquationRationnelle";
import { formatEquationDenominateur, formatEquationNumerateur } from "../../ui/formatSimplification";
import { racinesDistinctes } from "../../moteur/verificationEquationRationnelle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationRationnelle, type VarianteEquationRationnelleId } from "./index";
import { profilEquationRationnelle, LIBELLE_CAS_EQUATION_RATIONNELLE } from "../profilsEvaluation4eCh2Ch3";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationRationnelle>` pour gen4 ("L'inconnue au
 * dénominateur", équations rationnelles) — voir `generateurs/analyseFonction/exportWord.ts` pour le
 * mécanisme générique de référence.
 *
 * Le déroulé écran (`AppEquationRationnelle.tsx`/`moteur/sessionEquationRationnelle.ts`) enchaîne
 * jusqu'à 13 phases fines (ce → [simplifier*] → isolement → [reconnaissance] → champ1 → champ2 →
 * racinesEtrangeres, avec un premier passage entier dédié à `fractionGauche` pour les cas 4a/4b) —
 * bien trop granulaire pour une copie papier. Ces phases sont regroupées ici en **3 questions**
 * fidèles au geste mathématique réel de l'élève, jamais un découpage inventé :
 * a) poser la/les condition(s) d'existence (phase "ce") ;
 * b) résoudre l'équation — simplifier/factoriser/isoler/résoudre (toutes les phases "simplifier*",
 *    "isolement", "reconnaissance", "champ1", "champ2" ne sont, sur copie, qu'une seule démarche
 *    rédigée continue, jamais des cases séparées) ;
 * c) rejeter les éventuelles racines étrangères et conclure (phase "racinesEtrangeres").
 * Plusieurs constructions, donc pas de consigne générique indépendante des valeurs tirées, et
 * plusieurs questions par instance : `regroupable` n'est PAS activé (voir sa doc dans
 * `export/genererFeuilleExercices.ts`, qui l'exclut explicitement pour ce cas).
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues de l'instance tirée (jamais recalculée
 * indépendamment) : `equationIsolee.solution.{racines,delta,formeFactorisee}`,
 * `fractionGauche.numerateur/denominateur.solution` (cas 4a/4b) et `exercice.ce`. Pour la
 * construction `deux_fractions_lineaires`, sous-variantes (a)/(b) (`equationIsolee.enonce.a===0`,
 * "chemin linéaire" — voir `generateurs/equationRationnelle/construireSousVarianteA.ts`),
 * `solution.formeFactorisee` est ABSENT même si `categorie !== "cas_general"` : la résolution est
 * donc toujours dérivée de `enonce.a` (linéaire vs quadratique) et `solution.racines`/`delta`
 * directement, jamais de `solution.formeFactorisee` seul (voir `fragmentsResolution` ci-dessous),
 * exactement comme `formatFractionGaucheFactorisee`/`formatFormeFactoriseeDepuisRacines` le font déjà
 * ailleurs dans ce générateur pour la même raison (`cas_general` n'a jamais de `formeFactorisee`).
 */

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

function estCas4(exercice: ExerciceEquationRationnelle): exercice is ExerciceCas4a | ExerciceCas4b {
  return exercice.construction === "p2_sur_p1" || exercice.construction === "p1_sur_p2";
}

/** Le P2 embarqué dans fractionGauche (numérateur pour "p2_sur_p1", dénominateur pour "p1_sur_p2"). */
function p2DeFractionGauche(exercice: ExerciceCas4a | ExerciceCas4b): Exercice {
  return exercice.construction === "p2_sur_p1"
    ? (exercice.fractionGauche.numerateur as Exercice)
    : (exercice.fractionGauche.denominateur as Exercice);
}

/**
 * Démarche + solution(s) d'un `Exercice` (equationIsolee, ou le P2 embarqué dans fractionGauche
 * pour les cas 4a/4b) — jamais recalculée : `racines`/`delta`/`formeFactorisee` sont déjà connus
 * sur l'instance tirée. Trois branches, génériques sur n'importe laquelle des 4 techniques réelles
 * plus le cas dégénéré linéaire (a=0, chemin linéaire de `deux_fractions_lineaires`) :
 * - a=0 : équation du premier degré, aucune méthode de factorisation à nommer ;
 * - cas_general : pas de `formeFactorisee` (jamais fourni pour cette catégorie) → Δ puis racines ;
 * - sinon : `formeFactorisee` s'il est présent, sinon reconstruit depuis `enonce`/`racines` via
 *   `formatFormeFactoriseeDepuisRacines` (même filet que `formatFractionGaucheFactorisee` ailleurs
 *   dans ce fichier) — couvre le chemin linéaire mise_en_evidence_generalisee (a=0, déjà traité par
 *   la branche précédente) et reste défensif si jamais un autre cas sans `formeFactorisee` apparaît.
 */
function fragmentsResolution(exercice: Exercice): FragmentConsigne[] {
  const racines = racinesDistinctes(exercice.solution.racines);
  const texteRacines =
    racines.length === 1
      ? `une racine double x = ${formatNombre(racines[0])}`
      : `deux solutions x = ${formatNombre(Math.min(...racines))} et x = ${formatNombre(Math.max(...racines))}`;

  if (exercice.enonce.a === 0) {
    return [
      texte("Équation du premier degré : "),
      latex(`${formatMembreGauche(exercice.enonce)} = 0`),
      texte(` — ${texteRacines}.`),
    ];
  }

  if (exercice.categorie === "cas_general") {
    const delta = exercice.solution.delta ?? 0;
    return [
      texte(`Méthode : ${libelleCategorie(exercice.categorie)}. `),
      latex(`\\Delta = ${formatNombre(delta)}`),
      texte(` — ${texteRacines}.`),
    ];
  }

  const formeFactorisee = exercice.solution.formeFactorisee ?? formatFormeFactoriseeDepuisRacines(exercice.enonce, exercice.solution.racines);
  return [
    texte(`Méthode : ${libelleCategorie(exercice.categorie)}. `),
    latex(`${formeFactorisee} = 0`),
    texte(` — ${texteRacines}.`),
  ];
}

/** Condition(s) d'existence — directement `exercice.ce`, jamais redérivée. */
function paragrapheCE(instance: ExerciceEquationRationnelle): FragmentConsigne[] {
  const pluriel = instance.ce.length > 1;
  const fragments: FragmentConsigne[] = [
    texte(`On commence par déterminer la${pluriel ? "s" : ""} condition${pluriel ? "s" : ""} d'existence (CE) de cette équation : le${pluriel ? "s" : ""} dénominateur${pluriel ? "s" : ""} s'annule${pluriel ? "nt" : ""} en `),
  ];
  instance.ce.forEach((valeur, index) => {
    if (index > 0) fragments.push(texte(" et en "));
    fragments.push(latex(`x = ${formatNombre(valeur)}`));
  });
  fragments.push(texte(`, donc l${pluriel ? "es" : "a"} condition${pluriel ? "s" : ""} d'existence ${pluriel ? "sont" : "est"} `));
  instance.ce.forEach((valeur, index) => {
    if (index > 0) fragments.push(texte(" et "));
    fragments.push(latex(`x \\neq ${formatNombre(valeur)}`));
  });
  fragments.push(texte("."));
  return fragments;
}

/** Paragraphes de résolution — simplification/factorisation éventuelles puis élimination des
 * dénominateurs et résolution de l'équation obtenue, dans le même ordre que l'écran interactif. */
function paragraphesResolution(instance: ExerciceEquationRationnelle): FragmentConsigne[][] {
  if (estCas4(instance)) {
    const p2 = p2DeFractionGauche(instance);
    const labelP2 = instance.construction === "p2_sur_p1" ? "le numérateur" : "le dénominateur";
    const expressionP2 = instance.construction === "p2_sur_p1" ? formatEquationNumerateur(p2) : formatEquationDenominateur(p2);
    return [
      [
        texte(`On factorise d'abord ${labelP2} de la fraction de gauche, `),
        latex(expressionP2),
        texte(" : "),
        ...fragmentsResolution(p2),
      ],
      [
        texte("La fraction de gauche se simplifie donc en "),
        latex(formatFractionGaucheFactorisee(instance)),
        texte(", ce qui donne l'équation "),
        latex(formatEquationRationnelleLatexApresSimplification(instance)),
        texte(". En éliminant le dénominateur restant et en regroupant les termes, on obtient : "),
        latex(formatEnonceLatex(instance.equationIsolee.enonce)),
        texte("."),
      ],
      fragmentsResolution(instance.equationIsolee),
    ];
  }

  const paragraphes: FragmentConsigne[][] = [];
  if (instance.fractionsSimplifiables.length > 0) {
    paragraphes.push([
      texte("On simplifie d'abord les fractions réductibles, ce qui donne : "),
      latex(formatEquationRationnelleLatexApresSimplification(instance)),
      texte("."),
    ]);
    paragraphes.push([
      texte("En éliminant le(s) dénominateur(s) et en regroupant les termes, on obtient : "),
      latex(formatEnonceLatex(instance.equationIsolee.enonce)),
      texte("."),
    ]);
  } else {
    paragraphes.push([
      texte("En éliminant le(s) dénominateur(s) et en regroupant les termes, on obtient : "),
      latex(formatEnonceLatex(instance.equationIsolee.enonce)),
      texte("."),
    ]);
  }
  paragraphes.push(fragmentsResolution(instance.equationIsolee));
  return paragraphes;
}

/** Racines étrangères + ensemble-solution — statut dérivé de `instance.ce`, jamais présupposé. */
function paragraphesRacinesEtrangeres(instance: ExerciceEquationRationnelle): FragmentConsigne[][] {
  const distinctes = racinesDistinctes(instance.equationIsolee.solution.racines);
  const decisions = distinctes.map((racine) => ({
    racine,
    rejetee: instance.ce.some((valeur) => Math.abs(valeur - racine) < 1e-6),
  }));

  const detail: FragmentConsigne[] = [
    texte(
      distinctes.length > 1
        ? "Il reste à vérifier que chaque solution trouvée respecte bien la condition d'existence, et à rejeter toute racine étrangère : "
        : "Il reste à vérifier que la solution trouvée respecte bien la condition d'existence, et à la rejeter si c'est une racine étrangère : ",
    ),
  ];
  decisions.forEach(({ racine, rejetee }, index) => {
    if (index > 0) detail.push(texte(" ; "));
    detail.push(latex(`x = ${formatNombre(racine)}`));
    detail.push(texte(rejetee ? " est à rejeter (elle viole la CE)" : " est valide"));
  });
  detail.push(texte("."));

  const valides = decisions.filter((d) => !d.rejetee).map((d) => d.racine);
  const ensemble = valides.length === 0 ? "\\varnothing" : `\\{${valides.map(formatNombre).join("\\ ;\\ ")}\\}`;

  return [
    detail,
    [texte("L'ensemble des solutions de l'équation est donc "), latex(`S = ${ensemble}`), texte(".")],
  ];
}

function construireParagraphesResolution(instance: ExerciceEquationRationnelle): FragmentConsigne[][] {
  return [paragrapheCE(instance), ...paragraphesResolution(instance), ...paragraphesRacinesEtrangeres(instance)];
}

function construireCorrectionEquationRationnelle(instance: ExerciceEquationRationnelle): BlocCorrection[] {
  return construireParagraphesResolution(instance).map((fragments) => ({ type: "paragraphe", fragments }));
}

// ============================================================================
// Feuilles enrichies (voir .claude/rules/feuilles-evaluations.md) : étapes du corrigé, énoncé
// papier (énoncé + consigne globale, sans sous-questions), réponse brève, corrigé détaillé, barème.
// Étapes = gestes de l'élève : CE, [simplifier], éliminer les dénominateurs, résoudre, vérifier
// et conclure — les mêmes regroupements que le commentaire de tête, valeurs de l'instance.
// ============================================================================

/** Fractions lisibles sur papier. */
function papier(l: string): string {
  return l.replace(/\\frac/g, "\\dfrac");
}

type EtapeEquationRationnelle = "ce" | "simplifier" | "eliminer" | "resoudre" | "conclure";

function etapesDe(instance: ExerciceEquationRationnelle): EtapeEquationRationnelle[] {
  const simplifier = estCas4(instance) || instance.fractionsSimplifiables.length > 0;
  return simplifier ? ["ce", "simplifier", "eliminer", "resoudre", "conclure"] : ["ce", "eliminer", "resoudre", "conclure"];
}

function lettreDe(instance: ExerciceEquationRationnelle, etape: EtapeEquationRationnelle): string {
  return "abcde"[etapesDe(instance).indexOf(etape)];
}

function consigneEtape(instance: ExerciceEquationRationnelle, etape: EtapeEquationRationnelle): FragmentConsigne[] {
  switch (etape) {
    case "ce":
      return [texte("Écris les conditions d'existence de l'équation.")];
    case "simplifier":
      if (estCas4(instance)) {
        return [texte(`Factorise ${instance.construction === "p2_sur_p1" ? "le numérateur" : "le dénominateur"} de la fraction de gauche, puis simplifie-la.`)];
      }
      return [texte("Simplifie les fractions réductibles.")];
    case "eliminer":
      return [texte("Élimine les dénominateurs et ramène l'équation à une équation sans fraction.")];
    case "resoudre":
      return [texte("Résous l'équation obtenue.")];
    case "conclure":
      return [texte("Vérifie chaque solution avec les conditions d'existence et donne l'ensemble des solutions.")];
  }
}

/** Étapes du raisonnement (titres « Étape n » du corrigé). */
function construireEnonceEquationRationnelle(instance: ExerciceEquationRationnelle): SectionExercice {
  return {
    enteteFragments: [texte("On considère l'équation "), latex(papier(formatEquationRationnelleLatex(instance))), texte(".")],
    questions: etapesDe(instance).map((etape) => ({ consigne: consigneEtape(instance, etape) })),
  };
}

function enoncePapierEquationRationnelle(instance: ExerciceEquationRationnelle): EnoncePapier {
  return {
    section: { enteteFragments: [texte("Résous dans ℝ l'équation "), latex(papier(formatEquationRationnelleLatex(instance))), texte(".")], questions: [] },
  };
}

function decisionsRacines(instance: ExerciceEquationRationnelle): { racine: number; rejetee: boolean }[] {
  return racinesDistinctes(instance.equationIsolee.solution.racines).map((racine) => ({
    racine,
    rejetee: instance.ce.some((valeur) => Math.abs(valeur - racine) < 1e-6),
  }));
}

function ensembleSolutionsLatex(instance: ExerciceEquationRationnelle): string {
  const valides = decisionsRacines(instance).filter((d) => !d.rejetee).map((d) => d.racine).sort((a, b) => a - b);
  return valides.length === 0 ? "S = \\varnothing" : `S = \\{${valides.map(formatNombre).join("\\ ;\\ ")}\\}`;
}

function ceLatex(instance: ExerciceEquationRationnelle): string {
  return instance.ce.map((valeur) => `x \\neq ${formatNombre(valeur)}`).join(" \\text{ et } ");
}

/** Lignes « Méthode / Calcul / Conclusion » de la résolution d'un `Exercice` (équation obtenue, ou
 * P2 de la fraction de gauche à factoriser) — tout en LaTeX, valeurs de l'instance. */
function lignesResolution(exercice: Exercice, lettre: string, quoi: "resoudre" | "factoriser"): EtapeCorrection[] {
  const racines = racinesDistinctes(exercice.solution.racines);
  const conclusion = racines.length === 1 ? `x = ${formatNombre(racines[0])}` : racines.map((r) => `x = ${formatNombre(r)}`).join(" \\text{ ou } ");
  const lignes: EtapeCorrection[] = [];
  if (exercice.enonce.a === 0) {
    lignes.push({ label: "Méthode", sousQuestion: lettre, fragments: [texte("Équation du premier degré : on isole x.")] });
  } else if (exercice.categorie === "cas_general") {
    lignes.push({ label: "Méthode", sousQuestion: lettre, fragments: [texte("Aucune méthode rapide : on calcule le discriminant.")] });
    lignes.push({ label: "Calcul", sousQuestion: lettre, fragments: [latex(`\\Delta = ${formatNombre(exercice.solution.delta ?? 0)}`)] });
  } else {
    const forme = exercice.solution.formeFactorisee ?? formatFormeFactoriseeDepuisRacines(exercice.enonce, exercice.solution.racines);
    lignes.push({ label: "Méthode", sousQuestion: lettre, fragments: [texte(`${libelleCategorie(exercice.categorie)}.`)] });
    lignes.push({ label: "Calcul", sousQuestion: lettre, fragments: [latex(`${forme} = 0`)] });
  }
  if (quoi === "resoudre") {
    lignes.push({ label: "Conclusion", sousQuestion: lettre, fragments: [latex(conclusion), texte(racines.length === 1 && exercice.enonce.a !== 0 ? " (racine double)" : "")] });
  }
  return lignes;
}

function lignesSimplifier(instance: ExerciceEquationRationnelle, lettre: string): EtapeCorrection[] {
  if (estCas4(instance)) {
    const p2 = p2DeFractionGauche(instance);
    const expressionP2 = instance.construction === "p2_sur_p1" ? formatEquationNumerateur(p2) : formatEquationDenominateur(p2);
    return [
      { label: "Expression", sousQuestion: lettre, fragments: [latex(expressionP2)] },
      ...lignesResolution(p2, lettre, "factoriser"),
      { label: "Conclusion", sousQuestion: lettre, fragments: [texte("La fraction de gauche devient "), latex(papier(formatFractionGaucheFactorisee(instance))), texte(", d'où "), latex(papier(formatEquationRationnelleLatexApresSimplification(instance)))] },
    ];
  }
  return [
    { label: "Méthode", sousQuestion: lettre, fragments: [texte("On simplifie par le facteur commun de chaque fraction réductible (sous les CE).")] },
    { label: "Conclusion", sousQuestion: lettre, fragments: [latex(papier(formatEquationRationnelleLatexApresSimplification(instance)))] },
  ];
}

function correctionDetailleeEquationRationnelle(instance: ExerciceEquationRationnelle): EtapeCorrection[] {
  const lettre = (etape: EtapeEquationRationnelle) => lettreDe(instance, etape);
  const decisions = decisionsRacines(instance);
  const lignes: EtapeCorrection[] = [
    { label: "Méthode", sousQuestion: lettre("ce"), fragments: [texte("Un dénominateur ne peut pas être nul : on exclut les valeurs qui annulent un dénominateur.")] },
    { label: "Conclusion", sousQuestion: lettre("ce"), fragments: [texte("CE : "), latex(ceLatex(instance))] },
  ];
  if (etapesDe(instance).includes("simplifier")) lignes.push(...lignesSimplifier(instance, lettre("simplifier")));
  lignes.push(
    { label: "Méthode", sousQuestion: lettre("eliminer"), fragments: [texte("On multiplie les deux membres par le dénominateur commun (non nul sous les CE), puis on regroupe tout dans un membre.")] },
    { label: "Conclusion", sousQuestion: lettre("eliminer"), fragments: [latex(formatEnonceLatex(instance.equationIsolee.enonce))] },
    ...lignesResolution(instance.equationIsolee, lettre("resoudre"), "resoudre"),
  );
  const verification: FragmentConsigne[] = [];
  decisions.forEach(({ racine, rejetee }, index) => {
    if (index > 0) verification.push(texte(" ; "));
    verification.push(latex(`x = ${formatNombre(racine)}`), texte(rejetee ? " est rejetée (elle annule un dénominateur)" : " respecte les CE"));
  });
  verification.push(texte("."));
  lignes.push({ label: "Vérification", sousQuestion: lettre("conclure"), fragments: verification });
  lignes.push({ label: "Conclusion", sousQuestion: lettre("conclure"), fragments: [latex(ensembleSolutionsLatex(instance))] });
  const rejetees = decisions.filter((d) => d.rejetee);
  if (rejetees.length > 0) {
    lignes.push({
      label: "Piège",
      sousQuestion: lettre("conclure"),
      fragments: [latex(`x = ${formatNombre(rejetees[0].racine)}`), texte(" vérifie l'équation sans fractions, mais annule un dénominateur de l'équation de départ : c'est une racine étrangère, à rejeter.")],
    });
  }
  return lignes;
}

function reponseBreveEquationRationnelle(instance: ExerciceEquationRationnelle): FragmentConsigne[] {
  return [latex(ensembleSolutionsLatex(instance))];
}

function difficulteEquationRationnelle(instance: ExerciceEquationRationnelle): 1 | 2 | 3 {
  return estCas4(instance) || decisionsRacines(instance).some((d) => d.rejetee) ? 3 : 2;
}

const POIDS: Record<EtapeEquationRationnelle, number> = { ce: 1, simplifier: 0.5, eliminer: 1, resoudre: 1, conclure: 1 };

function baremeEquationRationnelle(instance: ExerciceEquationRationnelle): BaremeExercice {
  const etapes = etapesDe(instance);
  const avecSimplification = etapes.includes("simplifier");
  const critere = (etape: EtapeEquationRationnelle): FragmentConsigne[] => {
    switch (etape) {
      case "ce":
        return [texte("Conditions d'existence : "), latex(ceLatex(instance))];
      case "simplifier":
        return [texte("Simplification correcte : "), latex(papier(formatEquationRationnelleLatexApresSimplification(instance)))];
      case "eliminer":
        return [texte("Équation sans fraction : "), latex(formatEnonceLatex(instance.equationIsolee.enonce))];
      case "resoudre":
        return [texte("Résolution de l'équation obtenue")];
      case "conclure":
        return [texte("Vérification des CE et ensemble des solutions : "), latex(ensembleSolutionsLatex(instance))];
    }
  };
  const criteres: CritereBareme[] = etapes.map((etape) => ({
    sousQuestion: lettreDe(instance, etape),
    critere: critere(etape),
    // Avec une étape de simplification, « éliminer » passe à 0,5 pour garder un total de 4.
    points: avecSimplification && etape === "eliminer" ? 0.5 : POIDS[etape],
  }));
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Conditions d'existence oubliées")], cout: `0 pt sur ${lettreDe(instance, "ce")}) et ${lettreDe(instance, "conclure")})` },
    { description: [texte("Un seul membre multiplié par le dénominateur commun")], cout: `0 pt sur ${lettreDe(instance, "eliminer")}), suite notée sans double pénalité` },
  ];
  if (decisionsRacines(instance).some((d) => d.rejetee)) {
    erreurs.push({ description: [texte("Racine étrangère conservée dans l'ensemble des solutions")], cout: `0 pt sur ${lettreDe(instance, "conclure")})` });
  }
  if (instance.equationIsolee.categorie === "cas_general" && instance.equationIsolee.enonce.a !== 0) {
    erreurs.push({ description: [texte("Erreur dans Δ ou dans la formule des racines")], cout: `0 pt sur ${lettreDe(instance, "resoudre")}), suite notée sans double pénalité` });
  }
  return {
    reponseFinale: reponseBreveEquationRationnelle(instance),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Conditions d'existence écrites "), latex("x \\in \\mathbb{R} \\setminus \\{\\ldots\\}")],
      [texte("Équation sans fraction sous une forme équivalente (non réduite, membres échangés)")],
    ],
  };
}

export const adaptateurEvaluationEquationRationnelle: AdaptateurFeuilleExercices<ExerciceEquationRationnelle> = {
  profilInstance: profilEquationRationnelle,
  libelleCasParticulier: LIBELLE_CAS_EQUATION_RATIONNELLE,
  titreDocument: "L'inconnue au dénominateur — Évaluation",
  nomFichierBase: "equation-rationnelle",
  genererInstance: genererExerciceEquationRationnelle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteEquationRationnelleId),
  construireEnonce: construireEnonceEquationRationnelle,
  construireCorrection: construireCorrectionEquationRationnelle,
  difficulte: difficulteEquationRationnelle,
  reponseBreve: reponseBreveEquationRationnelle,
  correctionDetaillee: correctionDetailleeEquationRationnelle,
  bareme: baremeEquationRationnelle,
  enoncePapier: enoncePapierEquationRationnelle,
  dureeMinutes: 8,
  // `regroupable` exclu : la consigne mentionne l'équation tirée, jamais générique.
};
