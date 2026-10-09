import type { ExerciceSignesProduit, FacteurLineaire, FacteurSignesProduit, ValeurCellule } from "../../core/signesProduit.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatFormeFactoriseeDepuisRacines } from "../../ui/formatEquation";
import { formatEnonceSignesProduitLatex, formatFacteurLatex, formatLineaireDeveloppe } from "../../ui/formatSignesProduit";
import { formatSolutionEnsembleProduit } from "../../ui/formatSolutionEnsembleProduit";
import { libelleCategorie } from "../../ui/categorieLabels";
import { ordreLignesGrille } from "./grille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSignesProduit, type VarianteSignesProduitId } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSignesProduit>` pour gen5 (Signe d'un produit de
 * plusieurs facteurs) — voir `generateurs/analyseFonction/exportWord.ts` pour le mécanisme
 * générique de référence.
 *
 * Écran interactif (`AppSignesProduit.tsx`) : une longue séquence d'étapes guidées — une par
 * facteur (racine d'un facteur linéaire ; méthode + factorisation + racines d'un facteur
 * factorisable ; méthode + signe d'un facteur irréductible), puis le tableau de signes complet,
 * puis l'ensemble-solution. Sur papier, cette séquence est condensée en AU PLUS 4 questions
 * lettrées, dans le même ordre logique (jamais réinventé) : (a) racines des facteurs du 1er degré
 * [omise si aucun], (b) factorisation/signe des facteurs du 2nd degré [omise si aucun], (c) tableau
 * de signes complet, (d) ensemble-solution — jamais un nombre FIXE de questions (2 à 4 selon la
 * composition de l'instance, voir CATALOGUE_VARIANTES), donc jamais `regroupable` (qui exige
 * exactement 1 question par instance, voir `genererFeuilleExercices.ts`).
 *
 * Piège évité — étiquettes de lignes du tableau : `ui/formatSignesProduit.ts::formatLigneLabel`
 * (utilisé à l'écran) affiche la forme MONIQUE "x - r" de chaque racine, ce qui RÉVÈLE la racine
 * directement dans le tableau vierge de la question (c) — une fuite de la réponse à la question
 * (a)/(b), impossible à l'écran (étapes séquentielles verrouillées) mais réelle sur une feuille où
 * toutes les questions sont visibles simultanément. Chaque ligne du tableau ci-dessous correspond
 * donc à un facteur BRUT tel qu'il apparaît dans l'énoncé (`formatFacteurLatex`, jamais sa forme
 * monique factorisée), et sa correction est REconstituée en multipliant les lignes déjà correctes
 * de `exercice.grille.lignes` (jamais un nouveau calcul de signe indépendant) — voir
 * `combinerLignesFacteur` ci-dessous.
 */

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

/** Version texte pur (jamais rendue par KaTeX — voir `ZoneReponse`/`BlocCorrection` "tableau",
 * qui n'affichent jamais leurs libellés/valeurs autrement qu'en texte échappé) de la forme donnée
 * d'un facteur, telle qu'affichée dans l'énoncé — seul "x^2" (LaTeX) doit être converti en "x²". */
function texteFacteur(facteur: FacteurSignesProduit): string {
  return formatFacteurLatex(facteur).replace(/\^2/g, "²");
}

function estQuadratique(facteur: FacteurSignesProduit): facteur is Exclude<FacteurSignesProduit, FacteurLineaire> {
  return facteur.type !== "lineaire";
}

/** "+"×"+"="+" et "-"×"-"="+", "+"×"-"="-", tout "0" absorbe — même règle que la ligne produit de
 * `construireGrille` (grille.ts), appliquée ici à un sous-ensemble de lignes (celles d'UN SEUL
 * facteur brut) plutôt qu'à toutes les lignes de la grille. */
function combinerSignes(a: ValeurCellule, b: ValeurCellule): ValeurCellule {
  if (a === "0" || b === "0") return "0";
  return a === b ? "+" : "-";
}

/**
 * Une ligne de signe par facteur BRUT de `exercice.facteurs` (jamais par sous-ligne p0/p1/p2 —
 * voir commentaire de tête) : reconstituée en multipliant, colonne par colonne, les lignes
 * `exercice.grille.lignes` qui appartiennent à ce facteur (`ordreLignesGrille` donne leur
 * correspondance `facteurIndex`, jamais recalculée indépendamment).
 */
function lignesParFacteurBrut(exercice: ExerciceSignesProduit): ValeurCellule[][] {
  const refs = ordreLignesGrille(exercice.facteurs);
  const groupes: ValeurCellule[][][] = exercice.facteurs.map(() => []);
  refs.forEach((ref, i) => groupes[ref.facteurIndex].push(exercice.grille.lignes[i]));
  const nbColonnes = exercice.grille.produit.length;
  return groupes.map((lignesDuFacteur) =>
    Array.from({ length: nbColonnes }, (_, colonne) =>
      lignesDuFacteur.reduce<ValeurCellule>((acc, ligne) => combinerSignes(acc, ligne[colonne]), "+"),
    ),
  );
}

function libellesLignesTableau(instance: ExerciceSignesProduit): string[] {
  return ["x", ...instance.facteurs.map(texteFacteur), "Signe du produit"];
}

/** Nombre de lignes laissées à l'élève — assez généreux pour une résolution rédigée complète. */
function nombreLignesReponse(instance: ExerciceSignesProduit): number {
  return Math.max(10, instance.facteurs.length * 3 + 4);
}

function construireEnonceSignesProduit(instance: ExerciceSignesProduit): SectionExercice {
  return {
    enteteFragments: [
      texte("Résous l'inéquation suivante à l'aide d'un tableau de signes. Indique et justifie toutes les étapes de ta démarche : "),
      latex(formatEnonceSignesProduitLatex(instance)),
    ],
    questions: [
      {
        consigne: [texte("Développe ici ta résolution complète, étape par étape.")],
        reponse: { type: "lignes", nombre: nombreLignesReponse(instance) },
      },
    ],
  };
}

/**
 * Résolution rédigée et justifiée, un seul exercice ouvert sur la copie — jamais de sous-questions
 * a)/b)/c)/d) comme avant : étude de chaque facteur (racines des facteurs du premier degré,
 * factorisation/signe des facteurs du second degré), tableau de signes, puis ensemble-solution,
 * dans le même ordre logique que l'écran interactif (voir commentaire de tête), mais enchaînés
 * comme un manuel scolaire le ferait plutôt qu'une suite de réponses brèves à des questions
 * fermées séparées.
 */
function construireCorrectionSignesProduit(instance: ExerciceSignesProduit): BlocCorrection[] {
  const blocs: BlocCorrection[] = [];

  const lineaires = instance.facteurs.filter((f): f is FacteurLineaire => f.type === "lineaire");
  const quadratiques = instance.facteurs.filter(estQuadratique);

  if (lineaires.length > 0) {
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(
          lineaires.length > 1
            ? "On commence par annuler chaque facteur du premier degré : "
            : "On commence par annuler le facteur du premier degré : ",
        ),
        ...lineaires.flatMap((facteur, i): FragmentConsigne[] => {
          const texteBrut = formatLineaireDeveloppe(facteur.polynome.k, facteur.polynome.p);
          const suffixe = i < lineaires.length - 1 ? " ; " : ".";
          return [latex(`${texteBrut} = 0 \\Longrightarrow x = ${formatNombre(facteur.polynome.p)}`), texte(suffixe)];
        }),
      ],
    });
  }

  quadratiques.forEach((facteur) => {
    if (facteur.type === "quadratique_irreductible") {
      blocs.push({
        type: "paragraphe",
        fragments: [
          texte("Pour le facteur du second degré "),
          latex(formatFacteurLatex(facteur)),
          texte(`, le discriminant est négatif : ce facteur est irréductible dans ℝ, et toujours ${facteur.signe === "+" ? "positif" : "négatif"}.`),
        ],
      });
    } else {
      const { categorie, enonce, solution } = facteur.exercice;
      const [r1, r2] = [...solution.racines].sort((a, b) => a - b);
      const formeFactorisee = categorie === "cas_general" ? formatFormeFactoriseeDepuisRacines(enonce, solution.racines) : (solution.formeFactorisee as string);
      blocs.push({
        type: "paragraphe",
        fragments: [
          texte("Pour le facteur du second degré "),
          latex(formatFacteurLatex(facteur)),
          texte(`, on utilise la méthode « ${libelleCategorie(categorie)} » : `),
          latex(`= ${formeFactorisee}`),
          texte(`, ce qui donne les racines x = ${formatNombre(r1)} et x = ${formatNombre(r2)}.`),
        ],
      });
    }
  });

  blocs.push({
    type: "paragraphe",
    fragments: [texte("On reporte tous ces résultats dans un tableau de signes, en multipliant le signe de chaque facteur à chaque colonne :")],
  });

  const nbColonnesInterieur = instance.grille.produit.length;
  const ligneXMilieu = Array.from({ length: nbColonnesInterieur }, (_, i) => (i % 2 === 1 ? formatNombre(instance.racines[(i - 1) / 2]) : ""));
  const ligneX = ["−∞", ...ligneXMilieu, "+∞"];
  const lignesFacteurs = lignesParFacteurBrut(instance).map((ligne) => ["", ...ligne, ""]);
  const ligneProduit = ["", ...instance.grille.produit, ""];

  blocs.push({
    type: "tableau",
    libellesLignes: libellesLignesTableau(instance),
    valeursParLigne: [ligneX, ...lignesFacteurs, ligneProduit],
  });

  blocs.push({
    type: "paragraphe",
    fragments: [
      texte("Le tableau donne directement l'ensemble des solutions de l'inéquation : "),
      latex(`S = ${formatSolutionEnsembleProduit(instance.solution)}`),
      texte("."),
    ],
  });

  return blocs;
}

export const adaptateurEvaluationSignesProduit: AdaptateurFeuilleExercices<ExerciceSignesProduit> = {
  titreDocument: "Signe d'un produit de plusieurs facteurs — Évaluation",
  nomFichierBase: "signes-produit",
  genererInstance: genererExerciceSignesProduit,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteSignesProduitId),
  construireEnonce: construireEnonceSignesProduit,
  construireCorrection: construireCorrectionSignesProduit,
  // Une seule question ouverte par instance (voir commentaire de tête) : pas de sous-questions
  // lettrées, mais `regroupable` reste exclu car la consigne mentionne l'inéquation tirée
  // (`latex(...)` dans `enteteFragments`), jamais une consigne générique indépendante de l'instance.
};
