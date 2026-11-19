import type { Exercice } from "../../core/generateur.types";
import type { ExerciceSimplification, PolynomeLineaire } from "../../core/simplification.types";
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
import type { PhaseSimplification } from "../../moteur/typesSimplification";
import { consigneEtapeSimplification, correctionDetailleeSimplification, lettrePhaseSimplification, phasesSimplification } from "./corrigeDetaille";
import { latex, texte } from "../../../export/fragmentsDocx";
import { libelleCategorie } from "../../ui/categorieLabels";
import { formatFormeFactoriseeDepuisRacines } from "../../ui/formatEquation";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatFraction, formatFractionSimplifiee, formatPolynome, formatPolynomeMisEnEvidence } from "../../ui/formatSimplification";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSimplification } from "./index";

/**
 * Corrigé détaillé et barème : UNE étape par écran (`moteur/session*.ts::phasesExercice`), corrigé
 * « comme au tableau » dans `corrigeDetaille.ts` (partagé avec l'appli) ; le regroupement en
 * questions décrit plus bas ne vaut plus que pour l'ancien corrigé en paragraphes
 * (`construireCorrection`).
 *
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSimplification>` pour gen3 (Simplifier une
 * fraction rationnelle, `AppSimplification.tsx`) — voir `generateurs/analyseFonction/exportWord.ts`
 * pour le mécanisme générique de référence.
 *
 * PAS `regroupable` : contrairement à `6gen4` (une seule question générique par instance),
 * `AppSimplification.tsx`/`moteur/sessionSimplification.ts` fait travailler l'élève en 2 à 9 écrans
 * successifs par instance (réduction éventuelle, reconnaissance de méthode, factorisation, CE côté
 * dénominateur, puis le même trio côté numérateur si celui-ci est aussi un P2, puis la
 * simplification finale — voir le commentaire de tête de `sessionSimplification.ts` pour le détail
 * exact des 3 enchaînements selon `exercice.type`). Ces écrans sont donc regroupés ici en 3
 * questions papier COHÉRENTES (dénominateur, numérateur, simplification finale) plutôt qu'une par
 * micro-écran — même principe de consolidation que `analyseFonction/exportWord.ts`, qui regroupe
 * déjà reconnaissance+factorisation+racines de gen7 en une seule question e). La consigne de
 * chaque question dépend en outre du type de fraction (P2/P2, P1/P2, P2/P1 — un côté P1 n'a ni
 * méthode à reconnaître ni racines à donner, juste une éventuelle mise en évidence), donc jamais
 * GÉNÉRIQUE au sens de `AdaptateurFeuilleExercices.regroupable`.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues de l'instance, jamais recalculée
 * indépendamment : réutilise directement les formateurs déjà utilisés côté écran interactif
 * (`ui/formatSimplification.ts` — `formatPolynome`/`formatPolynomeMisEnEvidence` pour le brut/la
 * mise en évidence, `formatFractionSimplifiee` pour la réponse de référence de l'étape
 * "Simplification", déjà celle affichée en révélation après échec) et `ui/formatEquation.ts`
 * (`formatFormeFactoriseeDepuisRacines`, déjà la forme factorisée générique interne à
 * `formatSimplification.ts`) plutôt que d'en reconstruire une nouvelle. La nécessité de réduire un
 * côté (facteur numérique commun) se déduit simplement en comparant sa forme brute
 * (`formatPolynome`) à sa forme mise en évidence (`formatPolynomeMisEnEvidence`) — jamais en
 * réimportant `necessiteSimplification`/`necessiteMiseEnEvidenceP1` de `src/moteur`, qui
 * dupliquerait une dépendance déjà évitée par les adaptateurs existants (voir leurs imports, tous
 * limités à `ui`/`ui6e`).
 */

function estPolynomeLineaire(poly: Exercice | PolynomeLineaire): poly is PolynomeLineaire {
  return "k" in poly;
}

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

/** Racines distinctes triées — une seule valeur si racine double, jamais dupliquée. */
function racinesDistinctes(racines: [number, number]): number[] {
  return racines[0] === racines[1] ? [racines[0]] : [...racines].sort((a, b) => a - b);
}

/**
 * Forme factorisée complète d'un côté (numérateur ou dénominateur) : pour un P2, délègue à
 * `formatFormeFactoriseeDepuisRacines` (indépendante de `categorie`/`solution.formeFactorisee`,
 * absente pour cas_general — même principe que `formatFractionProgressive` côté écran) ; pour un
 * P1, la mise en évidence EST la forme factorisée (rien au-delà à factoriser).
 */
function formeFactoriseeCote(poly: Exercice | PolynomeLineaire): string {
  return estPolynomeLineaire(poly) ? formatPolynomeMisEnEvidence(poly) : formatFormeFactoriseeDepuisRacines(poly.enonce, poly.solution.racines);
}

/**
 * Conditions d'existence de la fraction — les racines du dénominateur (un P1 n'en a qu'une,
 * `p` ; un P2 en a 1 ou 2 selon racine double) : même source que l'étape "denomChamp2"/"ceDirecte"
 * (`sessionSimplification.ts` — "les racines du dénominateur constituent les CE de la fraction").
 */
function conditionsExistence(denominateur: Exercice | PolynomeLineaire): number[] {
  return estPolynomeLineaire(denominateur) ? [denominateur.p] : racinesDistinctes(denominateur.solution.racines);
}

function formatCE(valeurs: number[]): string {
  return valeurs.map((v) => `x \\neq ${formatNombre(v)}`).join(" \\text{ et } ");
}

/**
 * Bloc de correction d'un côté de la fraction (dénominateur OU numérateur) : forme brute, mise en
 * évidence si un facteur numérique commun existe (brut ≠ mis en évidence), puis — seulement pour
 * un P2 — méthode de factorisation reconnue, forme factorisée et racine(s).
 */
function fragmentsCoteCorrige(poly: Exercice | PolynomeLineaire, nomFonction: "D" | "N"): FragmentConsigne[] {
  const brut = formatPolynome(poly);
  const reduit = formatPolynomeMisEnEvidence(poly);
  const fragments: FragmentConsigne[] = [latex(`${nomFonction}(x) = ${brut}`)];

  if (brut !== reduit) {
    fragments.push(texte(" — mis en évidence : "), latex(`${nomFonction}(x) = ${reduit}`));
  }

  if (!estPolynomeLineaire(poly)) {
    const racines = racinesDistinctes(poly.solution.racines);
    fragments.push(
      texte(` — méthode : ${libelleCategorie(poly.categorie)}. Forme factorisée : `),
      latex(`${nomFonction}(x) = ${formeFactoriseeCote(poly)}`),
      texte(racines.length > 1 ? " — racines : " : " — racine : "),
      latex(racines.map((r) => `x = ${formatNombre(r)}`).join(" \\text{ ou } ")),
    );
  }

  return fragments;
}

// ============================================================================
// Feuilles enrichies (voir .claude/rules/feuilles-evaluations.md) : étapes du corrigé, énoncé
// papier (énoncé + consigne globale, sans sous-questions), réponse brève, corrigé détaillé, barème.
// Les 4 étapes regroupent les écrans de l'appli par geste (factoriser le dénominateur, CE,
// factoriser le numérateur, simplifier) ; toutes les valeurs viennent des formateurs de l'écran.
// ============================================================================

/** Fraction lisible sur papier (\dfrac) ; une fraction de dénominateur 1 (ou −1) s'écrit sans
 * barre — `formatFractionSimplifiee` (partagé avec l'écran) garde « …/1 » quand le facteur commun
 * emporte tout le dénominateur. */
function fractionPapier(l: string): string {
  const m = /^\\frac\{(.*)\}\{(-?)1\}$/.exec(l);
  if (m) return m[2] === "-" ? `-\\left(${m[1]}\\right)` : m[1];
  return l.replace(/\\frac/g, "\\dfrac");
}

function simplifieePapier(instance: ExerciceSimplification): string {
  return fractionPapier(formatFractionSimplifiee(instance));
}

/** « F(x) = … » — l'énoncé et le corrigé nomment la fraction. */
function fractionNommee(instance: ExerciceSimplification): string {
  return `F(x) = ${fractionPapier(formatFraction(instance))}`;
}

/** Étapes = écrans réels de l'instance (titres « Étape n — … » du corrigé, jamais imprimés dans l'énoncé). */
function construireEnonceSimplification(instance: ExerciceSimplification): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fraction rationnelle "), latex(fractionNommee(instance)), texte(".")],
    questions: phasesSimplification(instance).map((phase) => ({ consigne: consigneEtapeSimplification(instance, phase) })),
  };
}

function enoncePapierSimplification(instance: ExerciceSimplification): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        texte("Simplifie au maximum la fraction rationnelle "),
        latex(fractionNommee(instance)),
        texte(", après avoir déterminé ses conditions d'existence."),
      ],
      questions: [],
    },
  };
}

function reponseBreveSimplification(instance: ExerciceSimplification): FragmentConsigne[] {
  return [texte("CE : "), latex(formatCE(conditionsExistence(instance.denominateur))), texte(" ; "), latex(`F(x) = ${simplifieePapier(instance)}`)];
}

/** Critères du niveau (grille commune) : étapes = écrans du corrigé ; comptés comme lectures (1 min,
 * sans niveau) : la reconnaissance de la méthode (un coup d'œil sur a, b, c, comme « identifier la
 * question » de gen70), les conditions d'existence lues sur un dénominateur déjà factorisé (racines visibles) et la CE d'un
 * dénominateur du premier degré ; méthode : choisir les factorisations parmi celles du cours ; piège
 * dans les données : la valeur exclue qui disparaît de la fraction simplifiée (toujours présente). */
function criteresDifficulteSimplification(instance: ExerciceSimplification): CriteresDifficulte {
  const d = instance.denominateur;
  const lecture: string[] = [];
  const phases = phasesSimplification(instance);
  for (const ph of ["denomReconnaissance", "numReconnaissance"] as const) if (phases.includes(ph)) lecture.push(lettrePhaseSimplification(instance, ph));
  if (phases.includes("ceDirecte")) lecture.push(lettrePhaseSimplification(instance, "ceDirecte"));
  if (phases.includes("denomChamp2") && !estPolynomeLineaire(d) && d.categorie !== "cas_general") lecture.push(lettrePhaseSimplification(instance, "denomChamp2"));
  return { ...etapesDuCorrige(correctionDetailleeSimplification(instance), lecture), methode: 1, piege: 1 };
}

/** Poids par étape (somme 4, aucun critère sous 0,5) : un côté du premier degré se factorise en
 * une ligne, un côté du second degré demande la méthode. */
function poidsEtapes(instance: ExerciceSimplification): [number, number, number, number] {
  if (instance.type === "P2/P1") return [0.5, 1, 1.5, 1];
  if (instance.type === "P1/P2") return [1.5, 1, 0.5, 1];
  return [1, 1, 1, 1];
}

/** Lettre de l'écran qui conclut un geste (dernier écran présent parmi `candidates`), ou null. */
function lettreDe(instance: ExerciceSimplification, candidates: PhaseSimplification[]): string | null {
  const phases = phasesSimplification(instance);
  const presentes = candidates.filter((c) => phases.includes(c));
  return presentes.length ? lettrePhaseSimplification(instance, presentes[presentes.length - 1]!) : null;
}

function baremeSimplification(instance: ExerciceSimplification): BaremeExercice {
  const [pa, pb, pc, pd] = poidsEtapes(instance);
  const lD = lettreDe(instance, ["denomReductionP1", "denomChamp1", "denomFactorisation"]);
  const lCE = lettreDe(instance, ["denomChamp2", "ceDirecte"])!;
  const lN = lettreDe(instance, ["numReductionP1", "numChamp1", "numFactorisation"]);
  const lS = lettrePhaseSimplification(instance, "simplification");
  const criteres: CritereBareme[] = [];
  let report = 0;
  if (lD) criteres.push({ sousQuestion: lD, critere: [texte("Dénominateur factorisé : "), latex(`D(x) = ${formeFactoriseeCote(instance.denominateur)}`)], points: pa });
  else report += pa;
  criteres.push({ sousQuestion: lCE, critere: [texte("Conditions d'existence : "), latex(formatCE(conditionsExistence(instance.denominateur)))], points: pb });
  if (lN) criteres.push({ sousQuestion: lN, critere: [texte("Numérateur factorisé : "), latex(`N(x) = ${formeFactoriseeCote(instance.numerateur)}`)], points: pc });
  else report += pc;
  criteres.push({ sousQuestion: lS, critere: [texte("Fraction simplifiée : "), latex(`F(x) = ${simplifieePapier(instance)}`)], points: pd + report });
  const erreurs: ErreurFrequente[] = [
    {
      description: [texte("Conditions d'existence lues sur la fraction simplifiée (la valeur "), latex(`x = ${formatNombre(instance.racineCommune)}`), texte(" n'est plus exclue)")],
      cout: `0 pt sur ${lCE})`,
    },
    { description: [texte("Simplification de termes (et non de facteurs) avant d'avoir factorisé")], cout: `0 pt sur ${lS})` },
  ];
  for (const cote of ["denominateur", "numerateur"] as const) {
    const poly = instance[cote];
    if (estPolynomeLineaire(poly) || poly.categorie !== "cas_general") continue;
    const l = cote === "denominateur" ? lD : lN;
    erreurs.push({
      description: [texte(`Erreur dans Δ ou dans la formule des racines (${cote === "denominateur" ? "dénominateur" : "numérateur"})`)],
      cout: `0 pt sur ${l}), suite notée sans double pénalité`,
    });
  }
  if ([instance.denominateur, instance.numerateur].some((poly) => formatPolynome(poly) !== formatPolynomeMisEnEvidence(poly))) {
    erreurs.push({ description: [texte("Facteur numérique mis en évidence puis oublié dans la forme factorisée")], cout: "−0,5" });
  }
  return {
    reponseFinale: reponseBreveSimplification(instance),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Conditions d'existence écrites "), latex("x \\in \\mathbb{R} \\setminus \\{\\ldots\\}")],
      [texte("Fraction simplifiée sous une forme équivalente (coefficients non réduits, facteur restant développé)")],
    ],
  };
}

/**
 * Résolution rédigée et justifiée, un seul exercice ouvert sur la copie — jamais de sous-questions
 * a)/b)/c) comme avant : dénominateur, numérateur puis simplification finale, dans le même ordre
 * logique que l'écran interactif (voir commentaire de tête), mais enchaînés comme un manuel
 * scolaire le ferait plutôt qu'une suite de réponses brèves à des questions fermées séparées.
 */
function construireParagraphesResolution(instance: ExerciceSimplification): FragmentConsigne[][] {
  const { denominateur, numerateur, racineCommune } = instance;

  const paragraphes: FragmentConsigne[][] = [];

  paragraphes.push([
    texte("On commence par réduire et factoriser le dénominateur : "),
    ...fragmentsCoteCorrige(denominateur, "D"),
    texte(". Les conditions d'existence de la fraction sont donc "),
    latex(formatCE(conditionsExistence(denominateur))),
    texte("."),
  ]);

  paragraphes.push([texte("On fait de même pour le numérateur : "), ...fragmentsCoteCorrige(numerateur, "N"), texte(".")]);

  paragraphes.push([
    texte("Le numérateur et le dénominateur partagent la racine commune "),
    latex(`x = ${formatNombre(racineCommune)}`),
    texte(", ce qui signifie qu'ils ont en commun le facteur "),
    latex(`(x - ${formatNombre(racineCommune)})`),
    texte(" : ce facteur se simplifie. La fraction réduite est donc "),
    latex(formatFractionSimplifiee(instance)),
    texte(", valable sous les conditions d'existence trouvées ci-dessus."),
  ]);

  return paragraphes;
}

function construireCorrectionSimplification(instance: ExerciceSimplification): BlocCorrection[] {
  return construireParagraphesResolution(instance).map((fragments) => ({ type: "paragraphe", fragments }));
}

export const adaptateurEvaluationSimplification: AdaptateurFeuilleExercices<ExerciceSimplification> = {
  titreDocument: "Simplifier une fraction rationnelle — Évaluation",
  nomFichierBase: "simplification-fraction-rationnelle",
  genererInstance: genererExerciceSimplification,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceSimplification,
  construireCorrection: construireCorrectionSimplification,
  criteresDifficulte: criteresDifficulteSimplification,
  reponseBreve: reponseBreveSimplification,
  correctionDetaillee: correctionDetailleeSimplification,
  bareme: baremeSimplification,
  enoncePapier: enoncePapierSimplification,
  // `regroupable` exclu : la consigne mentionne la fraction tirée, jamais générique.
};
