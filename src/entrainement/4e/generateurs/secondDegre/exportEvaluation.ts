import type { Exercice, VarianteIrrationnelle } from "../../core/generateur.types";
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
import {
  enonceSimplifie,
  exerciceSimplifie,
  facteurCommun,
  necessiteSimplification,
} from "../../moteur/simplificationEquation";
import {
  formatEnonceAffichage,
  formatEnonceLatex,
  formatEquationIsoleeNonDeveloppee,
  formatRacineIrrationnelleLatex,
  formatTermesZerosAttendusLatex,
} from "../../ui/formatEquation";
import { libelleCategorie } from "../../ui/categorieLabels";
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
 * `construireEnonce`/`construireCorrection` répliquent donc ces mêmes 4 prédicats (littéralement
 * recopiés depuis `moteur/session.ts`, qui reste la seule source de vérité pour leur DÉFINITION ;
 * la correction elle-même ne dérive jamais indépendamment une valeur mathématique — chaque bloc de
 * correction relit une valeur déjà calculée par le générateur ou déjà formatée par une fonction du
 * projet déjà utilisée côté écran, `ui/formatEquation.ts`/`ui/categorieLabels.ts` : mêmes fonctions
 * que `ui/etatActuel.ts`/`ui/recapitulatif.ts`/`ResultatPanel.tsx`) pour construire, pour CHAQUE
 * instance tirée, exactement la même liste d'étapes que ce que l'élève verrait à l'écran pour cette
 * instance précise — jamais un gabarit à nombre d'étapes fixe. Sur papier, ces étapes ne sont PAS
 * des sous-questions : l'énoncé imprimé (`enoncePapier`) ne garde que l'équation et la consigne
 * globale ; les étapes titrent le corrigé détaillé (voir `.claude/rules/feuilles-evaluations.md`).
 *
 * Variante irrationnelle (`exercice.irrationnel`, ~50% pour les 4 familles 1-4) : toujours générée
 * avec `formeAffichage="canonique"` et `a=1` (jamais de simplification/isolement/développement
 * nécessaires pour elle, voir commentaires de `moteur/session.ts`/`moteur/simplificationEquation.ts`)
 * — les prédicats ci-dessous, purs et sans branche dédiée à `irrationnel`, la traitent donc
 * correctement sans changement : seules "reconnaissance", "champ1" et "zéros" ont lieu, exactement
 * comme à l'écran.
 */

/** Réplique locale de `moteur/session.ts::dejaEgaleAZero` (non exportée). */
function dejaEgaleAZero(exercice: Exercice): boolean {
  return exercice.formeAffichage === "canonique" || exercice.formeAffichage === "composee";
}

/** Réplique locale de `moteur/session.ts::necessiteIsolement` (non exportée). */
function necessiteIsolement(exercice: Exercice): boolean {
  return !dejaEgaleAZero(exercice) && exercice.categorie !== "mise_en_evidence";
}

/** Réplique locale de `moteur/session.ts::necessiteDeveloppement` (non exportée). */
function necessiteDeveloppement(exercice: Exercice): boolean {
  return (
    (exercice.categorie === "cas_general" || exercice.categorie === "produit_remarquable") &&
    exercice.formeAffichage === "produit_egale_constante"
  );
}

/** Réplique locale de `moteur/session.ts::necessiteReconnaissance` (non exportée). */
function necessiteReconnaissance(exercice: Exercice): boolean {
  return exercice.categorie !== "mise_en_evidence_generalisee";
}

/** Réplique locale de `AppMethodeRapide.tsx::demandeFormeGeneraleDirecte` (non exportée). */
function demandeFormeGeneraleDirecte(exercice: Exercice): boolean {
  const c = exercice.categorie;
  if (c !== "cas_general" && c !== "produit_remarquable") return false;
  return exercice.formeAffichage !== "produit_egale_constante";
}

/** Parenthèse toujours présente, quel que soit le signe — pour une substitution LaTeX jamais
 * ambiguë ("- -5" ou "--5"), même convention que les substitutions numériques déjà utilisées
 * ailleurs dans le projet (voir `ui/formatEquation.ts`). */
function parenthese(valeur: number): string {
  return `(${formatNombreAffiche(valeur)})`;
}

function formatNombreAffiche(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * Valeur de b à substituer dans la formule résolvante, toujours entre parenthèses. Pour une
 * variante IRRATIONNELLE, `enonce.b` ne porte que la valeur DÉCIMALE APPROCHÉE de b = B√k (utile
 * ailleurs, ex. calculs internes) — jamais la valeur à afficher, convention déjà posée par
 * `formatEnonceIrrationnelle` ("jamais la valeur décimale approchée"). La reconstruire ici sous
 * forme exacte (B√k) est donc indispensable : substituer le décimal romprait cette convention ET
 * désaccorderait visuellement cette étape de l'énoncé affiché juste au-dessus (qui, lui, montre
 * déjà b sous forme exacte).
 */
function formatBPourSubstitution(enonce: Exercice["enonce"], irrationnel?: VarianteIrrationnelle): string {
  if (irrationnel) return `(${formatRacineIrrationnelleLatex(irrationnel.B, irrationnel.k)})`;
  return parenthese(enonce.b);
}

/**
 * Substitution complète du discriminant, chiffres à chiffres — Δ = b²-4ac avec a/b/c remplacés
 * entre parenthèses puis le résultat final, jamais seulement la valeur de Δ toute faite (c'est
 * tout l'intérêt d'une résolution « hyper détaillée » : montrer le calcul, pas seulement son
 * résultat). `delta` est toujours déjà connu sur l'instance (`exercice.solution.delta`), jamais
 * recalculé indépendamment — seule la MISE EN FORME de la substitution est reconstruite ici.
 * `delta` reste toujours un rationnel exact, y compris pour une variante irrationnelle (Δ =
 * k·Δ_base, voir `VarianteIrrationnelle`) : seule la substitution de b a besoin d'une forme exacte
 * différente de son affichage décimal habituel, jamais Δ lui-même.
 */
function formatSubstitutionDelta(enonce: Exercice["enonce"], delta: number, bAffiche: string): string {
  return `\\Delta = b^2 - 4ac = ${bAffiche}^2 - 4 \\cdot ${parenthese(enonce.a)} \\cdot ${parenthese(enonce.c)} = ${formatNombreAffiche(delta)}`;
}

/**
 * Substitution complète de la formule résolvante, pour les deux racines distinctes (Δ > 0).
 * `r1`/`r2` sont déjà le résultat final tout formaté (`formatTermesZerosAttendusLatex`, LaTeX
 * prêt à l'affichage — un entier/décimal simple en forme rationnelle, une expression B√k en forme
 * irrationnelle) : jamais reconverti en `number` ici. Un aller-retour par `Number(...)` sur une
 * expression irrationnelle (ex. `"6\\sqrt{10}"`) ne peut produire que `NaN` — bug réel trouvé en
 * production (corrigé une fourche de racines du second degré, un "= NaN" apparaissait dans le
 * corrigé imprimé pour chaque variante irrationnelle) puisqu'une chaîne pareille n'est tout
 * simplement pas un nombre JavaScript valide.
 */
function formatSubstitutionRacinesDistinctes(enonce: Exercice["enonce"], delta: number, bAffiche: string, r1: string, r2: string): string {
  const denominateur = `2 \\cdot ${parenthese(enonce.a)}`;
  return (
    `x_1 = \\dfrac{-b - \\sqrt{\\Delta}}{2a} = \\dfrac{-${bAffiche} - \\sqrt{${formatNombreAffiche(delta)}}}{${denominateur}} = ${r1}` +
    ` \\quad \\text{et} \\quad ` +
    `x_2 = \\dfrac{-b + \\sqrt{\\Delta}}{2a} = \\dfrac{-${bAffiche} + \\sqrt{${formatNombreAffiche(delta)}}}{${denominateur}} = ${r2}`
  );
}

/** Substitution complète de la formule résolvante, racine double (Δ = 0) — même principe que
 * `formatSubstitutionRacinesDistinctes` ci-dessus pour `r` (déjà formaté, jamais reconverti). */
function formatSubstitutionRacineDouble(enonce: Exercice["enonce"], bAffiche: string, r: string): string {
  return `x = \\dfrac{-b}{2a} = \\dfrac{-${bAffiche}}{2 \\cdot ${parenthese(enonce.a)}} = ${r}`;
}

/** Virgule décimale dans une formule LaTeX (`1.5` → `1{,}5`) — les valeurs du générateur peuvent
 * être décimales (racines, Δ réduit), la feuille imprimée n'affiche jamais de point décimal. */
function virguleLatex(chaine: string): string {
  return chaine.replace(/(\d)\.(\d)/g, "$1{,}$2");
}

/** Virgule décimale dans un texte courant (`1.5` → `1,5`). */
function virguleTexte(chaine: string): string {
  return chaine.replace(/(\d)\.(\d)/g, "$1,$2");
}

function avecVirgules(fragments: FragmentConsigne[]): FragmentConsigne[] {
  return fragments.map((f) => (f.type === "latex" ? latex(virguleLatex(f.valeur)) : texte(virguleTexte(f.valeur))));
}

/** Écrans de l'appli (`moteur/session.ts`) : "zeros" = l'écran `champ2`. */
type PhaseSecondDegre = "simplification" | "isolement" | "developper" | "reconnaissance" | "champ1" | "zeros";

interface EtapeResolution {
  phase: PhaseSecondDegre;
  /** Consigne de l'écran correspondant — sert de titre d'étape au corrigé (jamais imprimée dans l'énoncé). */
  consigne: FragmentConsigne[];
  lignes: { label: string; fragments: FragmentConsigne[] }[];
}

function piegeCategorie(exercice: Exercice): FragmentConsigne[] | null {
  switch (exercice.categorie) {
    case "mise_en_evidence":
      return [texte("Ne pas diviser les deux membres par x : on perdrait la solution "), latex("x = 0"), texte(".")];
    case "binome_conjugue":
      return [texte("Une équation du type "), latex("x^2 = k"), texte(" avec k > 0 a DEUX solutions, "), latex("\\sqrt{k}"), texte(" et "), latex("-\\sqrt{k}"), texte(".")];
    case "produit_remarquable":
      return [texte("Un carré parfait égal à 0 donne une seule solution (racine double), pas deux.")];
    case "cas_general":
      return [texte("Dans "), latex("\\Delta = b^2 - 4ac"), texte(", le carré de b est toujours positif : "), latex("(-3)^2 = 9"), texte(", jamais −9.")];
    case "mise_en_evidence_generalisee":
      return [texte("Ne pas diviser les deux membres par la parenthèse commune : on perdrait la solution qui l'annule.")];
    default:
      return null;
  }
}

/**
 * Étapes du raisonnement pour CETTE instance, dans l'ordre réel des écrans (mêmes prédicats que
 * `moteur/session.ts`, voir commentaire de tête) : simplification → isolement → développement →
 * reconnaissance → Δ/factorisation → solutions. Chaque étape porte la consigne de son écran (titre
 * d'étape du corrigé) et sa résolution rédigée. `exerciceTravail` est la forme sur laquelle les
 * écrans suivants travaillent réellement (l'énoncé réduit une fois la simplification confirmée).
 */
function etapesResolution(instance: Exercice): EtapeResolution[] {
  const etapes: EtapeResolution[] = [];
  const simplificationNecessaire = necessiteSimplification(instance);
  const exerciceTravail = simplificationNecessaire ? exerciceSimplifie(instance) : instance;

  if (simplificationNecessaire) {
    const g = facteurCommun(instance.enonce);
    const enonceReduit = enonceSimplifie(instance.enonce);
    etapes.push({
      phase: "simplification",
      consigne: [texte("Simplifie l'équation au maximum (coefficients entiers, sans facteur commun).")],
      lignes: [
        {
          label: "Calcul",
          fragments: [
            texte(`Les trois coefficients ont pour plus grand commun diviseur ${g} : on divise toute l'équation par ${g} sans changer ses solutions. On obtient `),
            latex(formatEnonceAffichage(enonceReduit, instance.formeAffichage, instance.parametresAffichage)),
            texte("."),
          ],
        },
      ],
    });
  }

  if (necessiteIsolement(exerciceTravail)) {
    const formeDirecte = demandeFormeGeneraleDirecte(exerciceTravail);
    etapes.push({
      phase: "isolement",
      consigne: [texte(formeDirecte ? "Réécris l'équation sous la forme ax² + bx + c = 0." : "Regroupe tous les termes dans un même membre.")],
      lignes: [
        {
          label: "Calcul",
          fragments: [
            texte(formeDirecte ? "On ramène tout dans le membre de gauche, sous la forme générale : " : "On ramène tous les termes dans le membre de gauche, pour obtenir une expression égale à 0 : "),
            latex(formatEquationIsoleeNonDeveloppee(exerciceTravail)),
            texte("."),
          ],
        },
      ],
    });
  }

  if (necessiteDeveloppement(exerciceTravail)) {
    etapes.push({
      phase: "developper",
      consigne: [texte("Développe pour obtenir la forme ax² + bx + c = 0.")],
      lignes: [
        {
          label: "Calcul",
          fragments: [texte("Le membre de gauche contient encore un produit : on le développe pour faire apparaître a, b et c. "), latex(formatEnonceLatex(exerciceTravail.enonce)), texte(".")],
        },
      ],
    });
  }

  if (necessiteReconnaissance(exerciceTravail)) {
    etapes.push({
      phase: "reconnaissance",
      consigne: [texte("Choisis la méthode la plus rapide pour résoudre cette équation.")],
      lignes: [
        {
          label: "Méthode",
          fragments: [
            texte(
              exerciceTravail.categorie === "cas_general"
                ? "Aucune factorisation directe (mise en évidence, binôme conjugué, produit remarquable) ne s'applique : on utilise la formule du discriminant."
                : `L'équation correspond au cas « ${libelleCategorie(exerciceTravail.categorie)} » : c'est la méthode la plus directe.`,
            ),
          ],
        },
      ],
    });
  }

  const piege = piegeCategorie(exerciceTravail);
  if (exerciceTravail.categorie === "cas_general") {
    const delta = exerciceTravail.solution.delta as number;
    const bAffiche = formatBPourSubstitution(exerciceTravail.enonce, exerciceTravail.irrationnel);
    etapes.push({
      phase: "champ1",
      consigne: [texte("Calcule le discriminant Δ.")],
      lignes: [
        { label: "Calcul", fragments: [latex(formatSubstitutionDelta(exerciceTravail.enonce, delta, bAffiche))] },
        ...(piege ? [{ label: "Piège", fragments: piege }] : []),
      ],
    });
    const [r1, r2] = formatTermesZerosAttendusLatex(exerciceTravail);
    const conclusion: FragmentConsigne[] =
      delta > 0
        ? [texte("Δ > 0 : deux solutions distinctes, par la formule résolvante. "), latex(formatSubstitutionRacinesDistinctes(exerciceTravail.enonce, delta, bAffiche, r1, r2))]
        : delta === 0
          ? [texte("Δ = 0 : une solution double. "), latex(formatSubstitutionRacineDouble(exerciceTravail.enonce, bAffiche, r1))]
          : [texte("Δ < 0 : l'équation n'a aucune solution réelle, "), latex("S = \\varnothing"), texte(".")];
    etapes.push({ phase: "zeros", consigne: [texte("Donne les solutions de l'équation.")], lignes: [{ label: "Conclusion", fragments: conclusion }] });
  } else {
    etapes.push({
      phase: "champ1",
      consigne: [texte("Factorise le membre de gauche.")],
      lignes: [{ label: "Calcul", fragments: [texte(`Méthode « ${libelleCategorie(exerciceTravail.categorie)} » : `), latex(`${exerciceTravail.solution.formeFactorisee} = 0`), texte(".")] }],
    });
    etapes.push({
      phase: "zeros",
      consigne: [texte("Donne les solutions de l'équation.")],
      lignes: [
        { label: "Méthode", fragments: [texte("Un produit de facteurs est nul si et seulement si l'un au moins de ses facteurs est nul : on égale chaque facteur à 0.")] },
        { label: "Conclusion", fragments: [latex(`S = \\left\\{ ${formatTermesZerosAttendusLatex(exerciceTravail).join(" \\,;\\, ")} \\right\\}`)] },
        ...(piege ? [{ label: "Piège", fragments: piege }] : []),
      ],
    });
  }
  return etapes.map((e) => ({ ...e, lignes: e.lignes.map((l) => ({ ...l, fragments: avecVirgules(l.fragments) })) }));
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

/** Ancien corrigé (pipelines Word/PDF historiques) : la même résolution, en paragraphes continus. */
function construireCorrectionSecondDegre(instance: Exercice): BlocCorrection[] {
  return etapesResolution(instance).flatMap((e) => e.lignes.filter((l) => l.label !== "Piège").map((l): BlocCorrection => ({ type: "paragraphe", fragments: l.fragments })));
}

function correctionDetailleeSecondDegre(instance: Exercice): EtapeCorrection[] {
  return etapesResolution(instance).flatMap((e, i) => e.lignes.map((l): EtapeCorrection => ({ label: l.label, sousQuestion: LETTRES[i], fragments: l.fragments })));
}

function solutionsLatex(instance: Exercice): string {
  const travail = necessiteSimplification(instance) ? exerciceSimplifie(instance) : instance;
  if (travail.categorie === "cas_general" && (travail.solution.delta as number) < 0) return "S = \\varnothing";
  return virguleLatex(`S = \\left\\{ ${formatTermesZerosAttendusLatex(travail).join(" \\,;\\, ")} \\right\\}`);
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

function baremeSecondDegre(instance: Exercice): BaremeExercice {
  const etapes = etapesResolution(instance);
  const travail = necessiteSimplification(instance) ? exerciceSimplifie(instance) : instance;
  const criteres: CritereBareme[] = etapes.map((e, i) => ({
    sousQuestion: LETTRES[i],
    critere:
      e.phase === "champ1"
        ? [texte(travail.categorie === "cas_general" ? "Discriminant correctement calculé" : "Factorisation correcte : "), ...(travail.categorie === "cas_general" ? [] : [latex(virguleLatex(`${travail.solution.formeFactorisee} = 0`))])]
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
      erreurs.push({ description: [texte("Formule résolvante sans diviser par 2a")], cout: `0 pt sur ${LETTRES[iZeros]})` });
      break;
  }
  if (necessiteIsolement(travail)) erreurs.push({ description: [texte("Erreur de signe en changeant un terme de membre")], cout: "0 pt sur l'étape, suite notée sans double pénalité" });
  return {
    reponseFinale: [latex(solutionsLatex(instance))],
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Méthode correcte autre que la plus rapide (par exemple le discriminant à la place d'une factorisation) : tous les points de résolution, pas ceux de la reconnaissance.")],
      [texte("Solutions sous forme de fraction ou de décimal exact")],
    ],
  };
}

/** ★ factorisation directe sans préparation ; ★★ discriminant, ou une étape de préparation ;
 * ★★★ variante irrationnelle, ou au moins deux étapes de préparation (simplification, isolement,
 * développement). */
function difficulteSecondDegre(instance: Exercice): 1 | 2 | 3 {
  const etapes = etapesResolution(instance);
  const preparation = etapes.filter((e) => e.phase === "simplification" || e.phase === "isolement" || e.phase === "developper").length;
  if (instance.irrationnel || preparation >= 2) return 3;
  const travail = necessiteSimplification(instance) ? exerciceSimplifie(instance) : instance;
  if (travail.categorie === "cas_general" || preparation === 1) return 2;
  return 1;
}

export const adaptateurEvaluationSecondDegre: AdaptateurFeuilleExercices<Exercice> = {
  profilInstance: profilSecondDegre,
  libelleCasParticulier: LIBELLE_CAS_SECOND_DEGRE,
  parametresAuChoix: PARAMETRES_SECOND_DEGRE,
  titreDocument: "Résoudre une équation du second degré — Évaluation",
  nomFichierBase: "second-degre-methode-rapide",
  genererInstance: genererExerciceSecondDegre,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteSecondDegreId),
  construireEnonce: construireEnonceSecondDegre,
  construireCorrection: construireCorrectionSecondDegre,
  difficulte: difficulteSecondDegre,
  reponseBreve: reponseBreveSecondDegre,
  correctionDetaillee: correctionDetailleeSecondDegre,
  bareme: baremeSecondDegre,
  enoncePapier: enoncePapierSecondDegre,
  dureeMinutes: 5,
};
