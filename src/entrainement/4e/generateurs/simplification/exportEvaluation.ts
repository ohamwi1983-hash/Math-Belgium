import type { Exercice } from "../../core/generateur.types";
import type { ExerciceSimplification, PolynomeLineaire } from "../../core/simplification.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { libelleCategorie } from "../../ui/categorieLabels";
import { formatFormeFactoriseeDepuisRacines } from "../../ui/formatEquation";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatFraction, formatFractionSimplifiee, formatPolynome, formatPolynomeMisEnEvidence } from "../../ui/formatSimplification";
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

/** Nombre de lignes laissées à l'élève — assez généreux pour une résolution rédigée complète. */
function nombreLignesReponse(nombreParagraphes: number): number {
  return Math.max(10, nombreParagraphes * 2 + 2);
}

function construireEnonceSimplification(instance: ExerciceSimplification): SectionExercice {
  const nombreParagraphes = construireParagraphesResolution(instance).length;
  return {
    enteteFragments: [
      texte("Simplifie au maximum la fraction rationnelle suivante. Indique et justifie toutes les étapes de ta démarche : "),
      latex(formatFraction(instance)),
    ],
    questions: [
      {
        consigne: [texte("Développe ici ta résolution complète, étape par étape.")],
        reponse: { type: "lignes", nombre: nombreLignesReponse(nombreParagraphes) },
      },
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
  // Une seule question ouverte par instance (voir commentaire de tête) : pas de sous-questions
  // lettrées, mais `regroupable` reste exclu car la consigne mentionne la fraction tirée
  // (`latex(...)` dans `enteteFragments`), jamais une consigne générique indépendante de l'instance.
};
