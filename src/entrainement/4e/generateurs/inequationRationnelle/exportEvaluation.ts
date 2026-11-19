import type { ExerciceInequationRationnelle, ReglagesInequationRationnelle } from "../../core/inequationRationnelle.types";
import type { PhaseInequationRationnelle } from "../../moteur/sessionInequationRationnelle";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatEnonceOriginalComplet } from "../../ui/formatInequationRationnelle";
import { formatSolutionEnsembleProduitLatex } from "../../ui/formatSolutionEnsembleProduit";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurInequationRationnelle, type VarianteInequationRationnelleId } from "./index";
import {
  consigneEcranInequationRationnelle,
  correctionDetailleeInequationRationnelle,
  ecransInequationRationnelle,
  lettresLectureInequationRationnelle,
} from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceInequationRationnelle>` pour gen6 (Inéquations
 * rationnelles) — méthode des feuilles : `.claude/rules/feuilles-evaluations.md`.
 *
 * 8 niveaux/variantes aux formes très différentes (`core/inequationRationnelle.types.ts`) et un
 * nombre d'écrans qui varie avec l'instance (réduction, factorisation après Δ…) : PAS de
 * `regroupable`. Énoncé papier : l'inéquation seule (« Résous dans ℝ »). Les écrans de l'appli
 * (`ecransInequationRationnelle`, même séquence que `ordrePhases` de l'appli) sont les étapes du
 * corrigé, une lettre par écran ; corrigé détaillé « comme au tableau » dans `corrigeDetaille.ts`
 * (partagé avec l'appli), valeurs RESYNTHÉTISÉES depuis les champs de l'instance (`grille`,
 * `solution`, `racines`, `numerateur.solution`…), jamais recalculées indépendamment.
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function enonceOriginal(exercice: ExerciceInequationRationnelle): FragmentConsigne[] {
  return [texte("Résous dans "), latex("\\mathbb{R}"), texte(" l'inéquation suivante : "), latex(`\\displaystyle ${formatEnonceOriginalComplet(exercice)}`)];
}

function construireEnonceInequationRationnelle(exercice: ExerciceInequationRationnelle): SectionExercice {
  return { enteteFragments: enonceOriginal(exercice), questions: ecransInequationRationnelle(exercice).map((phase) => ({ consigne: consigneEcranInequationRationnelle(exercice, phase) })) };
}

function enoncePapierInequationRationnelle(exercice: ExerciceInequationRationnelle): EnoncePapier {
  return { section: { enteteFragments: [...enonceOriginal(exercice), texte(".")], questions: [] } };
}

/** Ancien corrigé (paragraphes) — les résultats du corrigé détaillé, une seule source. */
function construireCorrectionInequationRationnelle(exercice: ExerciceInequationRationnelle): BlocCorrection[] {
  return correctionDetailleeInequationRationnelle(exercice)
    .filter((l) => l.type === "resultat")
    .map((l): BlocCorrection => ({ type: "paragraphe", fragments: [texte(`${l.sousQuestion}) `), ...l.fragments] }));
}

function reponseBreveInequationRationnelle(exercice: ExerciceInequationRationnelle): FragmentConsigne[] {
  return [latex(`S = ${formatSolutionEnsembleProduitLatex(exercice.solution)}`)];
}

/**
 * Niveau (grille commune) : un écran = une étape, écrans de choix de la méthode = lectures. Méthode
 * 1 dès qu'un polynôme du second degré est à factoriser (choisir la technique), 0 pour les niveaux 1
 * et 2 (premier degré seul, démarche imposée). Piège dans les données : valeur interdite qui reste
 * exclue malgré une inégalité large, facteur commun simplifié (sa valeur reste interdite), dénominateur
 * au carré.
 */
function criteresInequationRationnelle(exercice: ExerciceInequationRationnelle): CriteresDifficulte {
  const premierDegre = exercice.niveau === "niveau1" || exercice.niveau === "niveau2";
  const large = exercice.symbole === "≤" || exercice.symbole === "≥";
  const piege = large || exercice.niveau === "facteurCommun" || exercice.niveau === "denominateurCarre";
  return {
    ...etapesDuCorrige(correctionDetailleeInequationRationnelle(exercice), lettresLectureInequationRationnelle(exercice)),
    methode: premierDegre ? 0 : 1,
    piege: piege ? 1 : 0,
  };
}

/** Poids de chaque écran dans le barème (ramenés à 4 par instance). */
function poids(phase: PhaseInequationRationnelle): number {
  if (phase === "combiner" || phase === "grille") return 1;
  if (phase === "simplifierFraction") return 0.75;
  if (/Reduction$|^reduction$|Reconnaissance$|^reconnaissance$|Factorisation$|^factorisation$/.test(phase)) return 0.25;
  return 0.5;
}

function baremeInequationRationnelle(exercice: ExerciceInequationRationnelle): BaremeExercice {
  const ecrans = ecransInequationRationnelle(exercice);
  const corrige = correctionDetailleeInequationRationnelle(exercice);
  const somme = ecrans.reduce((t, p) => t + poids(p), 0);
  const criteres: CritereBareme[] = ecrans.map((phase, i) => {
    const res = corrige.find((l) => l.sousQuestion === LETTRES[i] && l.type === "resultat");
    const critere = phase === "grille" ? [texte("Tableau de signes complet, valeurs interdites marquées")] : [...(res?.fragments ?? []), ...(phase === "intervalle" ? [texte(" (crochets justes)")] : [])];
    return { sousQuestion: LETTRES[i], critere, points: Math.round((poids(phase) * 400) / somme) / 100 };
  });
  const lettre = (p: PhaseInequationRationnelle) => {
    const i = ecrans.indexOf(p);
    return i >= 0 ? LETTRES[i] : undefined;
  };
  const lIntervalle = lettre("intervalle");
  const lIsoler = lettre("isoler");
  const lFacto = lettre("champ1") ?? lettre("simplifierFraction");
  const erreurs: ErreurFrequente[] = [];
  if (lIsoler) erreurs.push({ description: [texte("Multiplication des deux membres par le dénominateur (son signe dépend de x)")], cout: `0 pt sur ${lIsoler})` });
  erreurs.push({ description: [texte("Valeur interdite incluse dans S (crochet fermé en une racine du dénominateur)")], cout: `−1 sur ${lIntervalle})` });
  if (exercice.niveau === "facteurCommun") erreurs.push({ description: [texte("Valeur interdite du facteur commun oubliée après simplification")], cout: `−1 sur ${lIntervalle})` });
  if (lFacto) erreurs.push({ description: [texte("Erreur de signe dans une factorisation")], cout: `−0,5 sur ${lFacto})` });
  return {
    reponseFinale: reponseBreveInequationRationnelle(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Ensemble décrit par des inégalités, valeurs interdites exclues")], [texte("Facteurs rangés dans un autre ordre dans le tableau")]],
  };
}

/**
 * Réglages par défaut de la fabrique — reprend exactement `REGLAGES_NIVEAU` de
 * `AppInequationRationnelle.tsx` (tous les niveaux actifs, répartition équilibrée). La fabrique est
 * sans état (`choisirNiveau` ne fait que tirer) : l'appli recrée la même pour rouvrir un code.
 */
export const REGLAGES_PAR_DEFAUT: ReglagesInequationRationnelle = {
  niveauxActifs: ["niveau1", "niveau2", "niveau3", "niveau4", "denominateurCarre", "facteurCommun", "sansFacteurCommun", "cubique"],
  repartition: "equilibre",
};
const genererInstance = creerGenerateurInequationRationnelle(REGLAGES_PAR_DEFAUT);

export const adaptateurEvaluationInequationRationnelle: AdaptateurFeuilleExercices<ExerciceInequationRationnelle> = {
  titreDocument: "Inéquations rationnelles — Évaluation",
  nomFichierBase: "inequations-rationnelles",
  genererInstance,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteInequationRationnelleId),
  construireEnonce: construireEnonceInequationRationnelle,
  construireCorrection: construireCorrectionInequationRationnelle,
  criteresDifficulte: criteresInequationRationnelle,
  reponseBreve: reponseBreveInequationRationnelle,
  correctionDetaillee: correctionDetailleeInequationRationnelle,
  bareme: baremeInequationRationnelle,
  enoncePapier: enoncePapierInequationRationnelle,
};
