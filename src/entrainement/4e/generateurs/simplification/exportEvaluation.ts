import type { Exercice } from "../../core/generateur.types";
import type { ExerciceSimplification, PolynomeLineaire } from "../../core/simplification.types";
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
import { libelleCategorie } from "../../ui/categorieLabels";
import { formatFormeFactoriseeDepuisRacines } from "../../ui/formatEquation";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatFraction, formatFractionProgressive, formatFractionSimplifiee, formatPolynome, formatPolynomeMisEnEvidence } from "../../ui/formatSimplification";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSimplification } from "./index";

/**
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

/** Étapes du raisonnement (titres « Étape n » du corrigé). */
function construireEnonceSimplification(instance: ExerciceSimplification): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fraction rationnelle "), latex(fractionNommee(instance)), texte(".")],
    questions: [
      { consigne: [texte("Factorise le dénominateur "), latex(`D(x) = ${formatPolynome(instance.denominateur)}`), texte(".")] },
      { consigne: [texte("Écris les conditions d'existence de la fraction.")] },
      { consigne: [texte("Factorise le numérateur "), latex(`N(x) = ${formatPolynome(instance.numerateur)}`), texte(".")] },
      { consigne: [texte("Simplifie la fraction.")] },
    ],
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

/** Facteur (x − p) écrit proprement, signe compris. */
function facteurLatex(p: number): string {
  if (p === 0) return "x";
  return `(x ${p < 0 ? "+" : "-"} ${formatNombre(Math.abs(p))})`;
}

/** Lignes du corrigé pour un côté de la fraction (étape « factoriser »). */
function etapesCote(poly: Exercice | PolynomeLineaire, nom: "D" | "N", lettre: string): EtapeCorrection[] {
  const brut = formatPolynome(poly);
  const reduit = formatPolynomeMisEnEvidence(poly);
  const etapes: EtapeCorrection[] = [];
  if (estPolynomeLineaire(poly)) {
    etapes.push({ label: "Méthode", sousQuestion: lettre, fragments: [texte("Premier degré : on met le coefficient de x en évidence.")] });
    etapes.push({ label: "Conclusion", sousQuestion: lettre, fragments: [latex(`${nom}(x) = ${reduit}`)] });
    return etapes;
  }
  if (brut !== reduit) {
    etapes.push({ label: "Réduction", sousQuestion: lettre, fragments: [texte("On met d'abord le facteur numérique commun en évidence : "), latex(`${nom}(x) = ${reduit}`)] });
  }
  if (poly.categorie === "cas_general") {
    const racines = racinesDistinctes(poly.solution.racines);
    etapes.push({ label: "Méthode", sousQuestion: lettre, fragments: [texte("Aucune méthode rapide : on calcule le discriminant.")] });
    etapes.push({
      label: "Calcul",
      sousQuestion: lettre,
      fragments: [
        latex(`\\Delta = ${formatNombre(poly.solution.delta ?? 0)}`),
        texte(racines.length > 1 ? ", racines " : ", racine double "),
        latex(racines.map((r) => `x = ${formatNombre(r)}`).join(" \\text{ et } ")),
      ],
    });
  } else {
    etapes.push({ label: "Méthode", sousQuestion: lettre, fragments: [texte(`${libelleCategorie(poly.categorie)}.`)] });
  }
  etapes.push({ label: "Conclusion", sousQuestion: lettre, fragments: [latex(`${nom}(x) = ${formeFactoriseeCote(poly)}`)] });
  return etapes;
}

function correctionDetailleeSimplification(instance: ExerciceSimplification): EtapeCorrection[] {
  const ce = conditionsExistence(instance.denominateur);
  return [
    ...etapesCote(instance.denominateur, "D", "a"),
    { label: "Méthode", sousQuestion: "b", fragments: [texte("La fraction n'existe que si son dénominateur est non nul : on exclut les racines de D(x).")] },
    { label: "Conclusion", sousQuestion: "b", fragments: [texte("CE : "), latex(formatCE(ce))] },
    ...etapesCote(instance.numerateur, "N", "c"),
    {
      label: "Méthode",
      sousQuestion: "d",
      fragments: [
        texte("N(x) et D(x) ont le facteur commun "),
        latex(facteurLatex(instance.racineCommune)),
        texte(" : on simplifie ce facteur (on simplifie des facteurs, jamais des termes)."),
      ],
    },
    { label: "Calcul", sousQuestion: "d", fragments: [latex(`F(x) = ${fractionPapier(formatFractionProgressive(instance, "factorisee", "factorisee"))}`)] },
    { label: "Conclusion", sousQuestion: "d", fragments: [latex(`F(x) = ${simplifieePapier(instance)}`), texte(" pour "), latex(formatCE(ce))] },
    {
      label: "Piège",
      sousQuestion: "d",
      fragments: [
        texte("Les conditions d'existence se lisent AVANT de simplifier : "),
        latex(`x = ${formatNombre(instance.racineCommune)}`),
        texte(" reste interdit même si le facteur commun a disparu de la fraction simplifiée."),
      ],
    },
  ];
}

function reponseBreveSimplification(instance: ExerciceSimplification): FragmentConsigne[] {
  return [texte("CE : "), latex(formatCE(conditionsExistence(instance.denominateur))), texte(" ; "), latex(`F(x) = ${simplifieePapier(instance)}`)];
}

function aCasGeneral(instance: ExerciceSimplification): boolean {
  return [instance.denominateur, instance.numerateur].some((poly) => !estPolynomeLineaire(poly) && poly.categorie === "cas_general");
}

function difficulteSimplification(instance: ExerciceSimplification): 1 | 2 | 3 {
  return instance.type === "P2/P2" || aCasGeneral(instance) ? 3 : 2;
}

/** Poids par étape (somme 4, aucun critère sous 0,5) : un côté du premier degré se factorise en
 * une ligne, un côté du second degré demande la méthode. */
function poidsEtapes(instance: ExerciceSimplification): [number, number, number, number] {
  if (instance.type === "P2/P1") return [0.5, 1, 1.5, 1];
  if (instance.type === "P1/P2") return [1.5, 1, 0.5, 1];
  return [1, 1, 1, 1];
}

function baremeSimplification(instance: ExerciceSimplification): BaremeExercice {
  const [pa, pb, pc, pd] = poidsEtapes(instance);
  const criteres: CritereBareme[] = [
    { sousQuestion: "a", critere: [texte("Dénominateur factorisé : "), latex(`D(x) = ${formeFactoriseeCote(instance.denominateur)}`)], points: pa },
    { sousQuestion: "b", critere: [texte("Conditions d'existence : "), latex(formatCE(conditionsExistence(instance.denominateur)))], points: pb },
    { sousQuestion: "c", critere: [texte("Numérateur factorisé : "), latex(`N(x) = ${formeFactoriseeCote(instance.numerateur)}`)], points: pc },
    { sousQuestion: "d", critere: [texte("Fraction simplifiée : "), latex(`F(x) = ${simplifieePapier(instance)}`)], points: pd },
  ];
  const erreurs: ErreurFrequente[] = [
    {
      description: [texte("Conditions d'existence lues sur la fraction simplifiée (la valeur "), latex(`x = ${formatNombre(instance.racineCommune)}`), texte(" n'est plus exclue)")],
      cout: "0 pt sur b)",
    },
    { description: [texte("Simplification de termes (et non de facteurs) avant d'avoir factorisé")], cout: "0 pt sur d)" },
  ];
  for (const cote of ["denominateur", "numerateur"] as const) {
    const poly = instance[cote];
    if (estPolynomeLineaire(poly) || poly.categorie !== "cas_general") continue;
    erreurs.push({
      description: [texte(`Erreur dans Δ ou dans la formule des racines (${cote === "denominateur" ? "dénominateur" : "numérateur"})`)],
      cout: `0 pt sur ${cote === "denominateur" ? "a" : "c"}), suite notée sans double pénalité`,
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
  difficulte: difficulteSimplification,
  reponseBreve: reponseBreveSimplification,
  correctionDetaillee: correctionDetailleeSimplification,
  bareme: baremeSimplification,
  enoncePapier: enoncePapierSimplification,
  dureeMinutes: 7,
  // `regroupable` exclu : la consigne mentionne la fraction tirée, jamais générique.
};
