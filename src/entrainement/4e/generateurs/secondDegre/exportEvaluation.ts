import type { Exercice } from "../../core/generateur.types";
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
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { exerciceSimplifie, necessiteSimplification } from "../../moteur/simplificationEquation";
import { formatEnonceAffichage } from "../../ui/formatEquation";
import {
  consigneEtapeSecondDegre,
  correctionDetailleeSecondDegre,
  formeFactoriseeSecondDegre,
  methodeCorrigeSecondDegre,
  phasesSecondDegre,
  solutionsSecondDegreLatex,
} from "./corrigeDetaille";
import { formeRacineEvidente } from "../../moteur/methodeSecondDegre";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSecondDegre, type VarianteSecondDegreId } from "./index";
import { profilSecondDegre, LIBELLE_CAS_SECOND_DEGRE, PARAMETRES_SECOND_DEGRE } from "../profilsEvaluation4eCh2Ch3";

/**
 * Adaptateur `AdaptateurFeuilleExercices<Exercice>` pour gen1 ("Résoudre une équation du second
 * degré — méthode la plus rapide", écran générique `AppMethodeRapide.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Contrairement à gen7 (nombre de questions fixe) ou à 6gen4 (toujours 1 question), gen1 a un
 * nombre d'étapes RÉELLEMENT variable selon l'instance tirée (voir `moteur/session.ts`,
 * `phaseInitiale`/`phaseApresSimplification`/`phaseApresIsolement`) :
 *   1. "simplification" — seulement si pgcd(|a|,|b|,|c|) > 1 (`necessiteSimplification`).
 *   2. "isolement" — seulement si l'énoncé affiché n'est pas déjà "...=0" ET catégorie ≠
 *      mise_en_evidence (`necessiteIsolement`, dupliquée localement ci-dessous : non exportée par
 *      `moteur/session.ts`, jamais touché — voir consigne de la tâche).
 *   3. "developper" — seulement pour cas_general/produit_remarquable dont la forme de surface
 *      isolée garde un produit non développé (`necessiteDeveloppement`, même remarque).
 *   4. "reconnaissance" — sauf pour mise_en_evidence_generalisee (`necessiteReconnaissance`).
 *   5. "champ1" (Δ ou factorisation) — toujours.
 *   6. "champ2"/zéros — toujours.
 * Ces étapes viennent désormais directement de `moteur/session.ts::phasesExercice` (exportée, même
 * source que la barre de progression), via `corrigeDetaille.ts` (corrigé « comme au tableau »,
 * partagé avec l'écran). Sur papier, ces étapes ne sont PAS des sous-questions : l'énoncé imprimé
 * (`enoncePapier`) ne garde que l'équation et la consigne globale ; les étapes titrent le corrigé
 * détaillé (voir `.claude/rules/feuilles-evaluations.md`).
 *
 * Variante irrationnelle (`exercice.irrationnel`, ~50% pour les 4 familles 1-4) : toujours générée
 * avec `formeAffichage="canonique"` et `a=1` (jamais de simplification/isolement/développement
 * nécessaires pour elle, voir commentaires de `moteur/session.ts`/`moteur/simplificationEquation.ts`)
 * — les prédicats ci-dessous, purs et sans branche dédiée à `irrationnel`, la traitent donc
 * correctement sans changement : seules "reconnaissance", "champ1" et "zéros" ont lieu, exactement
 * comme à l'écran.
 */

/** Réplique locale de `moteur/session.ts::necessiteIsolement` (non exportée). */
function necessiteIsolement(exercice: Exercice): boolean {
  const dejaEgaleAZero = exercice.formeAffichage === "canonique" || exercice.formeAffichage === "composee";
  return !dejaEgaleAZero && exercice.categorie !== "mise_en_evidence";
}

/** Virgule décimale dans une formule LaTeX (`1.5` → `1{,}5`). */
function virguleLatex(chaine: string): string {
  return chaine.replace(/(\d)\.(\d)/g, "$1{,}$2");
}

/** Écrans de l'appli (`moteur/session.ts`) : "zeros" = l'écran `champ2`. */
type PhaseSecondDegre = "simplification" | "isolement" | "developper" | "reconnaissance" | "champ1" | "zeros";

interface EtapeResolution {
  phase: PhaseSecondDegre;
  /** Consigne de l'écran correspondant — sert de titre d'étape au corrigé (jamais imprimée dans l'énoncé). */
  consigne: FragmentConsigne[];
}

/** Étapes = écrans réels de l'instance (`moteur/session.ts::phasesExercice`), dans l'ordre. */
function etapesResolution(instance: Exercice): EtapeResolution[] {
  return phasesSecondDegre(instance).map((phase) => ({ phase: phase === "champ2" ? "zeros" : phase, consigne: consigneEtapeSecondDegre(instance, phase) }));
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function enonceLatex(instance: Exercice): string {
  return virguleLatex(formatEnonceAffichage(instance.enonce, instance.formeAffichage, instance.parametresAffichage, instance.irrationnel));
}

/** Étapes d'apprentissage (une par écran) : titres du corrigé, jamais imprimées dans l'énoncé
 * (voir `enoncePapierSecondDegre`). */
function construireEnonceSecondDegre(instance: Exercice): SectionExercice {
  return {
    enteteFragments: [texte("Résous l'équation suivante : "), latex(enonceLatex(instance))],
    questions: etapesResolution(instance).map((e) => ({ consigne: e.consigne })),
  };
}

function enoncePapierSecondDegre(instance: Exercice): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte("Résous l'équation suivante par la méthode la plus rapide : "), latex(enonceLatex(instance)), texte(".")],
      questions: [],
    },
  };
}

/** Ancien corrigé (pipelines historiques) : les résultats de chaque étape, en paragraphes. */
function construireCorrectionSecondDegre(instance: Exercice): BlocCorrection[] {
  return correctionDetailleeSecondDegre(instance)
    .filter((e) => e.type === "resultat")
    .map((e): BlocCorrection => ({ type: "paragraphe", fragments: e.fragments }));
}

function solutionsLatex(instance: Exercice): string {
  return solutionsSecondDegreLatex(instance);
}

function reponseBreveSecondDegre(instance: Exercice): FragmentConsigne[] {
  return [latex(solutionsLatex(instance))];
}

const POIDS_PHASE: Record<PhaseSecondDegre, number> = {
  simplification: 0.5,
  isolement: 0.5,
  developper: 0.5,
  reconnaissance: 0.5,
  champ1: 1,
  zeros: 1,
};

const CRITERE_PHASE: Record<PhaseSecondDegre, string> = {
  simplification: "Équation divisée par le plus grand commun diviseur des coefficients",
  isolement: "Tous les termes ramenés dans un même membre",
  developper: "Développement correct (forme ax² + bx + c = 0)",
  reconnaissance: "Méthode la plus rapide reconnue",
  champ1: "",
  zeros: "Solutions correctes",
};

/** Critère de l'écran « champ 1 » selon la méthode du corrigé (racine évidente, Δ ou factorisation). */
function critereChamp1(travail: Exercice): FragmentConsigne[] {
  const methode = methodeCorrigeSecondDegre(travail);
  if (methode === "racine_evidente") return [texte("Racine évidente repérée et factorisation correcte : "), latex(`${formeRacineEvidente(travail.enonce)}=0`)];
  if (travail.categorie === "cas_general") return [texte("Discriminant correctement calculé : "), latex(`\\Delta=${travail.solution.delta ?? 0}`)];
  return [texte("Factorisation correcte : "), latex(`${formeFactoriseeSecondDegre(travail)}=0`)];
}

function baremeSecondDegre(instance: Exercice): BaremeExercice {
  const etapes = etapesResolution(instance);
  const travail = necessiteSimplification(instance) ? exerciceSimplifie(instance) : instance;
  const criteres: CritereBareme[] = etapes.map((e, i) => ({
    sousQuestion: LETTRES[i],
    critere:
      e.phase === "champ1"
        ? critereChamp1(travail)
        : e.phase === "zeros"
          ? [texte(`${CRITERE_PHASE.zeros} : `), latex(solutionsLatex(instance))]
          : [texte(CRITERE_PHASE[e.phase])],
    points: POIDS_PHASE[e.phase],
  }));
  const iChamp1 = etapes.findIndex((e) => e.phase === "champ1");
  const iZeros = etapes.findIndex((e) => e.phase === "zeros");
  const erreurs: ErreurFrequente[] = [];
  switch (travail.categorie) {
    case "mise_en_evidence":
    case "mise_en_evidence_generalisee":
      erreurs.push({ description: [texte("Division par le facteur commun : une solution perdue")], cout: `0 pt sur ${LETTRES[iZeros]})` });
      break;
    case "binome_conjugue":
      erreurs.push({ description: [texte("Une seule solution donnée (la solution négative oubliée)")], cout: `moitié des points sur ${LETTRES[iZeros]})` });
      break;
    case "produit_remarquable":
      erreurs.push({ description: [texte("Identité remarquable mal reconnue (signe du double produit)")], cout: `0 pt sur ${LETTRES[iChamp1]})` });
      break;
    case "cas_general":
      erreurs.push({ description: [texte("Carré de b écrit négatif dans Δ")], cout: `0 pt sur ${LETTRES[iChamp1]}), suite notée sans double pénalité` });
      if ((travail.solution.delta ?? 0) < 0) erreurs.push({ description: [texte("Δ < 0 lu comme « une solution » ou « deux solutions »")], cout: `0 pt sur ${LETTRES[iZeros]})` });
      else erreurs.push({ description: [texte("Formule résolvante sans diviser par 2a")], cout: `0 pt sur ${LETTRES[iZeros]})` });
      break;
    case "irreductible":
      erreurs.push({ description: [texte("Différence de deux carrés écrite à tort (a et c sont de même signe) : solutions inventées")], cout: `0 pt sur ${LETTRES[iZeros]})` });
      break;
  }
  if (necessiteIsolement(travail)) erreurs.push({ description: [texte("Erreur de signe en changeant un terme de membre")], cout: "0 pt sur l'étape, suite notée sans double pénalité" });
  return {
    reponseFinale: [latex(solutionsLatex(instance))],
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      ...(methodeCorrigeSecondDegre(travail) === "racine_evidente" ? [[texte("Racine évidente ou discriminant : les deux méthodes sont justes (tous les points, reconnaissance comprise).")]] : []),
      [texte("Méthode correcte autre que la plus rapide (par exemple le discriminant à la place d'une factorisation) : tous les points de résolution, pas ceux de la reconnaissance.")],
      [texte("Solutions sous forme de fraction ou de décimal exact")],
    ],
  };
}

/** Critères du niveau (grille commune, `export/niveauDifficulte.ts`) : étapes = écrans du corrigé —
 * le choix de la méthode est une DÉCISION (tests sur a, b, c, racine évidente), il compte comme une
 * étape, plus comme une lecture (lot E de l'audit) ; méthode = choisir la plus rapide parmi celles
 * du cours ; piège dans les données : le cas caché (famille 5, ne pas développer ni diviser par la
 * parenthèse), « ax² = bx » (tentation de diviser par x) et « b = 0, a et c de même signe » (ce
 * n'est pas une différence de deux carrés). */
function criteresDifficulteSecondDegre(instance: Exercice): CriteresDifficulte {
  const piege = instance.categorie === "mise_en_evidence_generalisee" || instance.categorie === "irreductible" || (instance.categorie === "mise_en_evidence" && instance.formeAffichage === "isolee_carre") ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeSecondDegre(instance), []), methode: 1, piege };
}

/** Décision 4 de l'utilisateur (audit 4e ch. 2) : la méthode EST le verdict de la reconnaissance —
 * choisir « binôme conjugué » ou « aucune solution » dans le panneau d'évaluation donnerait la
 * réponse. Une seule rangée « Méthode à reconnaître » ; la variante de chaque question est tirée par
 * `construirePlan`, équilibrée d'une série à l'autre. La mise en évidence généralisée (forme de
 * l'énoncé visible, pas un verdict) reste une rangée à part. Générateur et feuille : intacts. */
const GROUPES_VERDICT: { id: string; label: string; variantes: VarianteSecondDegreId[] }[] = [
  { id: "groupe_methode", label: "Méthode à reconnaître (mise en évidence, binôme conjugué, produit remarquable, cas général ou aucune solution, au hasard)", variantes: ["mise_en_evidence", "binome_conjugue", "produit_remarquable", "cas_general", "aucune_solution"] },
];

export const adaptateurEvaluationSecondDegre: AdaptateurFeuilleExercices<Exercice> = {
  profilInstance: profilSecondDegre,
  libelleCasParticulier: LIBELLE_CAS_SECOND_DEGRE,
  parametresAuChoix: PARAMETRES_SECOND_DEGRE,
  titreDocument: "Résoudre une équation du second degré — Évaluation",
  nomFichierBase: "second-degre-methode-rapide",
  genererInstance: genererExerciceSecondDegre,
  catalogueVariantes: CATALOGUE_VARIANTES,
  groupesVerdict: GROUPES_VERDICT,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteSecondDegreId),
  construireEnonce: construireEnonceSecondDegre,
  construireCorrection: construireCorrectionSecondDegre,
  criteresDifficulte: criteresDifficulteSecondDegre,
  reponseBreve: reponseBreveSecondDegre,
  correctionDetaillee: correctionDetailleeSecondDegre,
  bareme: baremeSecondDegre,
  enoncePapier: enoncePapierSecondDegre,
};
