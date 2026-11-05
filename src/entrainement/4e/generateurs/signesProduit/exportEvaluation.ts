import type { ExerciceSignesProduit, FacteurLineaire, FacteurSignesProduit, ValeurCellule } from "../../core/signesProduit.types";
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
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatEnonceSignesProduitLatex, formatFacteurLatex, formatFormeFactoriseeSignesProduit, formatLineaireDeveloppe } from "../../ui/formatSignesProduit";
import { formatSolutionEnsembleProduitLatex } from "../../ui/formatSolutionEnsembleProduit";
import { libelleCategorie } from "../../ui/categorieLabels";
import { ordreLignesGrille } from "./grille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSignesProduit, type VarianteSignesProduitId } from "./index";
import { tableauSignesLatex } from "./tableauSignesLatex";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSignesProduit>` pour gen5 (signe d'un produit de
 * plusieurs facteurs) — méthode des feuilles : `.claude/rules/feuilles-evaluations.md`.
 *
 * Énoncé papier (`enoncePapier`) : l'inéquation et la consigne globale de l'appli (« Résous cette
 * inéquation en étudiant le signe de chacun de ses facteurs »), sans sous-question. Les étapes de
 * l'écran — une par facteur, dans l'ordre de `exercice.facteurs` (racine d'un facteur du 1er degré,
 * factorisation d'un facteur du 2nd degré, signe d'un facteur irréductible), puis le tableau de
 * signes et l'ensemble-solution — sont les étapes du corrigé (`construireEnonce`, lettres a, b, …).
 *
 * Le tableau de signes du corrigé a une ligne par facteur BRUT de l'énoncé (jamais sa forme
 * monique), reconstituée en multipliant les lignes de `exercice.grille.lignes` qui lui appartiennent
 * (`ordreLignesGrille`) — jamais un calcul de signe indépendant.
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function nombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : String(Math.round(valeur * 100) / 100).replace(".", "{,}");
}

/** "+"×"+"="+" et "-"×"-"="+", "+"×"-"="-", tout "0" absorbe — même règle que la ligne produit de
 * `construireGrille` (grille.ts), appliquée aux seules lignes d'UN facteur brut. */
function combinerSignes(a: ValeurCellule, b: ValeurCellule): ValeurCellule {
  if (a === "0" || b === "0") return "0";
  return a === b ? "+" : "-";
}

function lignesParFacteurBrut(exercice: ExerciceSignesProduit): ValeurCellule[][] {
  const refs = ordreLignesGrille(exercice.facteurs);
  const groupes: ValeurCellule[][][] = exercice.facteurs.map(() => []);
  refs.forEach((ref, i) => groupes[ref.facteurIndex].push(exercice.grille.lignes[i]));
  const nbColonnes = exercice.grille.produit.length;
  return groupes.map((lignesDuFacteur) =>
    Array.from({ length: nbColonnes }, (_, colonne) => lignesDuFacteur.reduce<ValeurCellule>((acc, ligne) => combinerSignes(acc, ligne[colonne]), "+")),
  );
}

function tableauLatex(exercice: ExerciceSignesProduit): string {
  const lignes = lignesParFacteurBrut(exercice).map((valeurs, i) => ({ libelle: formatFacteurLatex(exercice.facteurs[i]), valeurs }));
  return tableauSignesLatex(exercice.racines, lignes, { libelle: "\\text{produit}", valeurs: exercice.grille.produit });
}

const CONSIGNE_GLOBALE = "Résous l'inéquation suivante en étudiant le signe de chacun de ses facteurs : ";

const RETENIR: Record<ExerciceSignesProduit["symbole"], string> = {
  "<": "On garde les zones où le produit est strictement négatif (racines exclues).",
  ">": "On garde les zones où le produit est strictement positif (racines exclues).",
  "≤": "On garde les zones où le produit est négatif, et les racines où il s'annule.",
  "≥": "On garde les zones où le produit est positif, et les racines où il s'annule.",
};

/** Une étape du corrigé : sa consigne (titre « Étape n — … »), ses lignes, son critère et son poids. */
interface Etape {
  consigne: FragmentConsigne[];
  lignes: { label: string; fragments: FragmentConsigne[] }[];
  critere: FragmentConsigne[];
  poids: number;
}

function etapeFacteur(facteur: FacteurSignesProduit, poids: number): Etape {
  const f = formatFacteurLatex(facteur);
  if (facteur.type === "lineaire") {
    const { k, p } = facteur.polynome;
    return {
      consigne: [texte("Détermine la racine du facteur "), latex(f), texte(".")],
      lignes: [
        { label: "Calcul", fragments: [latex(`${formatLineaireDeveloppe(k, p)} = 0 \\iff x = ${nombre(p)}`)] },
        {
          label: "Signe",
          fragments: [texte(`Coefficient de x ${k > 0 ? "positif" : "négatif"} : le facteur est ${k > 0 ? "négatif" : "positif"} avant `), latex(`x = ${nombre(p)}`), texte(` et ${k > 0 ? "positif" : "négatif"} après.`)],
        },
      ],
      critere: [texte("Racine de "), latex(f), texte(" : "), latex(`x = ${nombre(p)}`)],
      poids,
    };
  }
  if (facteur.type === "quadratique_irreductible") {
    const { a, b, c } = facteur.enonce;
    const delta = b * b - 4 * a * c;
    const signe = facteur.signe === "+" ? "positif" : "négatif";
    return {
      consigne: [texte("Détermine le signe du facteur "), latex(f), texte(".")],
      lignes: [
        { label: "Calcul", fragments: [latex(`\\Delta = ${b === 0 ? "" : `${b < 0 ? `(${nombre(b)})` : nombre(b)}^2 `}- 4 \\cdot ${a < 0 ? `(${nombre(a)})` : nombre(a)} \\cdot ${c < 0 ? `(${nombre(c)})` : nombre(c)} = ${nombre(delta)} < 0`)] },
        { label: "Conclusion", fragments: [texte(`Aucune racine : le facteur garde le signe de son coefficient dominant, il est toujours ${signe}.`)] },
      ],
      critere: [latex(f), texte(` toujours ${signe} (`), latex("\\Delta < 0"), texte(")")],
      poids,
    };
  }
  const { categorie, enonce, solution } = facteur.exercice;
  const [r1, r2] = [...solution.racines].sort((x, y) => x - y);
  const forme = formatFormeFactoriseeSignesProduit(enonce, solution.racines);
  const racines = r1 === r2 ? `x = ${nombre(r1)} \\text{ (racine double)}` : `x = ${nombre(r1)} \\text{ et } x = ${nombre(r2)}`;
  return {
    consigne: [texte("Factorise le facteur "), latex(f), texte(" et donne ses racines.")],
    lignes: [
      { label: "Méthode", fragments: [texte(`${libelleCategorie(categorie)} : `), latex(`${f} = ${forme}`)] },
      {
        label: "Conclusion",
        fragments:
          r1 === r2
            ? [latex(racines), texte(" : un carré est positif ou nul, ce facteur s'annule en "), latex(`x = ${nombre(r1)}`), texte(" sans changer de signe.")]
            : [latex(racines), texte(".")],
      },
    ],
    critere: [texte("Factorisation de "), latex(f), texte(" et racines : "), latex(racines)],
    poids,
  };
}

function etapes(exercice: ExerciceSignesProduit): Etape[] {
  const poidsFacteur = 1.5 / exercice.facteurs.length;
  return [
    ...exercice.facteurs.map((f) => etapeFacteur(f, poidsFacteur)),
    {
      consigne: [texte("Dresse le tableau de signes du produit.")],
      lignes: [
        { label: "Méthode", fragments: [texte("Une ligne par facteur ; dans chaque colonne, le signe du produit est le produit des signes (règle des signes).")] },
        { label: "Tableau", fragments: [latex(tableauLatex(exercice))] },
      ],
      critere: [texte("Tableau de signes complet : une ligne par facteur, ligne du produit juste")],
      poids: 1.5,
    },
    {
      consigne: [texte("Donne l'ensemble des solutions de l'inéquation.")],
      lignes: [
        { label: "Méthode", fragments: [texte(RETENIR[exercice.symbole])] },
        { label: "Conclusion", fragments: [latex(`S = ${formatSolutionEnsembleProduitLatex(exercice.solution)}`)] },
      ],
      critere: [latex(`S = ${formatSolutionEnsembleProduitLatex(exercice.solution)}`), texte(" (crochets justes)")],
      poids: 1,
    },
  ];
}

/** Piège unique, le plus pertinent pour l'instance. */
function piege(exercice: ExerciceSignesProduit): FragmentConsigne[] {
  const carre = exercice.facteurs.find((f) => f.type === "quadratique_factorisable" && f.exercice.solution.racines[0] === f.exercice.solution.racines[1]);
  if (carre) return [texte("En une racine double, le produit s'annule mais ne change PAS de signe : ne pas alterner les signes de part et d'autre.")];
  const lineaireNegatif = exercice.facteurs.find((f): f is FacteurLineaire => f.type === "lineaire" && f.polynome.k < 0);
  if (lineaireNegatif) return [texte("Un facteur du premier degré à coefficient de x négatif est positif AVANT sa racine : ne pas recopier « − puis + » par réflexe.")];
  if (exercice.facteurs.some((f) => f.type === "quadratique_irreductible")) return [texte("Un facteur sans racine (Δ < 0) a une ligne entière du même signe, sans 0 : il ne crée aucune colonne.")];
  return [texte(exercice.symbole === "<" || exercice.symbole === ">" ? "Inégalité stricte : les racines (produit nul) sont exclues, crochets ouverts." : "Inégalité large : les racines (produit nul) font partie des solutions, crochets fermés.")];
}

function construireEnonceSignesProduit(exercice: ExerciceSignesProduit): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GLOBALE), latex(formatEnonceSignesProduitLatex(exercice))],
    questions: etapes(exercice).map((e) => ({ consigne: e.consigne })),
  };
}

function enoncePapierSignesProduit(exercice: ExerciceSignesProduit): EnoncePapier {
  return { section: { enteteFragments: [texte(CONSIGNE_GLOBALE), latex(formatEnonceSignesProduitLatex(exercice)), texte(".")], questions: [] } };
}

function correctionDetailleeSignesProduit(exercice: ExerciceSignesProduit): EtapeCorrection[] {
  const liste = etapes(exercice);
  const lignes: EtapeCorrection[] = liste.flatMap((e, i) => e.lignes.map((l) => ({ ...l, sousQuestion: LETTRES[i] })));
  const iTableau = liste.length - 2;
  lignes.push({ label: "Piège", sousQuestion: LETTRES[iTableau], fragments: piege(exercice) });
  return lignes;
}

/** Ancien corrigé (paragraphes) — dérivé du corrigé détaillé, une seule source. */
function construireCorrectionSignesProduit(exercice: ExerciceSignesProduit): BlocCorrection[] {
  return etapes(exercice).flatMap((e): BlocCorrection[] => e.lignes.map((l) => ({ type: "paragraphe", fragments: [texte(`${l.label} : `), ...l.fragments] })));
}

function reponseBreveSignesProduit(exercice: ExerciceSignesProduit): FragmentConsigne[] {
  return [latex(`S = ${formatSolutionEnsembleProduitLatex(exercice.solution)}`)];
}

function difficulteSignesProduit(exercice: ExerciceSignesProduit): 1 | 2 | 3 {
  const factorisable = exercice.facteurs.some((f) => f.type === "quadratique_factorisable");
  const carre = exercice.facteurs.some((f) => f.type === "quadratique_factorisable" && f.exercice.solution.racines[0] === f.exercice.solution.racines[1]);
  const score = exercice.facteurs.length + (factorisable ? 1 : 0) + (carre ? 1 : 0);
  return score <= 2 ? 1 : score === 3 ? 2 : 3;
}

function baremeSignesProduit(exercice: ExerciceSignesProduit): BaremeExercice {
  const liste = etapes(exercice);
  const lTableau = LETTRES[liste.length - 2];
  const lSolution = LETTRES[liste.length - 1];
  const criteres: CritereBareme[] = liste.map((e, i) => ({ sousQuestion: LETTRES[i], critere: e.critere, points: e.poids }));
  const erreurs: ErreurFrequente[] = [];
  if (exercice.facteurs.some((f) => f.type === "lineaire" && f.polynome.k < 0)) {
    erreurs.push({ description: [texte("Signe d'un facteur du premier degré inversé (coefficient de x négatif)")], cout: `−1 sur ${lTableau})` });
  }
  if (exercice.facteurs.some((f) => f.type === "quadratique_irreductible")) {
    erreurs.push({ description: [texte("Facteur sans racine oublié dans le tableau, ou supposé changer de signe")], cout: `0 pt sur ${lTableau})` });
  }
  if (exercice.facteurs.some((f) => f.type === "quadratique_factorisable" && f.exercice.solution.racines[0] === f.exercice.solution.racines[1])) {
    erreurs.push({ description: [texte("Racine double traitée comme une racine simple (changement de signe)")], cout: `−1 sur ${lTableau})` });
  }
  erreurs.push({ description: [texte("Crochets mal choisis : racines incluses avec une inégalité stricte, ou exclues avec une inégalité large")], cout: `−0,5 sur ${lSolution})` });
  return {
    reponseFinale: reponseBreveSignesProduit(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Ensemble décrit par des inégalités (ex. « x ≤ … ou x ≥ … »)")], [texte("Facteurs rangés dans un autre ordre dans le tableau")]],
  };
}

export const adaptateurEvaluationSignesProduit: AdaptateurFeuilleExercices<ExerciceSignesProduit> = {
  titreDocument: "Signe d'un produit de plusieurs facteurs — Évaluation",
  nomFichierBase: "signes-produit",
  genererInstance: genererExerciceSignesProduit,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteSignesProduitId),
  construireEnonce: construireEnonceSignesProduit,
  construireCorrection: construireCorrectionSignesProduit,
  difficulte: difficulteSignesProduit,
  reponseBreve: reponseBreveSignesProduit,
  correctionDetaillee: correctionDetailleeSignesProduit,
  bareme: baremeSignesProduit,
  enoncePapier: enoncePapierSignesProduit,
  dureeMinutes: 8,
  // La consigne mentionne l'inéquation tirée : jamais `regroupable`.
};
