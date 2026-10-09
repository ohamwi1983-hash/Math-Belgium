import type { Exercice, VarianteIrrationnelle } from "../../core/generateur.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  enonceSimplifie,
  exerciceSimplifie,
  facteurCommun,
  necessiteSimplification,
} from "../../moteur/simplificationEquation";
import {
  estSolutionUnique,
  formatEnonceAffichage,
  formatEnonceLatex,
  formatEquationIsoleeNonDeveloppee,
  formatRacineIrrationnelleLatex,
  formatTermesZerosAttendusLatex,
} from "../../ui/formatEquation";
import { libelleCategorie } from "../../ui/categorieLabels";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSecondDegre, type VarianteSecondDegreId } from "./index";

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
 * instance tirée, exactement la même liste de questions a) b) c)… que ce que l'élève verrait à
 * l'écran pour cette instance précise — jamais un gabarit à nombre de questions fixe.
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

/**
 * Construit, dans l'ORDRE réel de l'écran, les paragraphes d'une résolution RÉDIGÉE et ENTIÈREMENT
 * JUSTIFIÉE pour CETTE instance (voir commentaire de tête) — un seul exercice ouvert sur la copie
 * ("Résous cette équation"), jamais de sous-questions guidées a)/b)/c) : chaque paragraphe reprend
 * le même enchaînement logique que l'écran interactif (simplification → isolement → développement →
 * reconnaissance → Δ/factorisation → solutions), mais rédigé comme un manuel scolaire justifierait
 * chaque étape, plutôt qu'une réponse brute à une question fermée. `exerciceTravail` est déjà la
 * forme sur laquelle isolement/développement/reconnaissance/champ1/zéros travaillent réellement —
 * l'énoncé réduit une fois la simplification confirmée, exactement comme `exerciceCourant` côté
 * session (`soumettreReponseSimplification`), jamais l'énoncé de surface d'origine.
 */
function construireParagraphesResolution(instance: Exercice): FragmentConsigne[][] {
  const paragraphes: FragmentConsigne[][] = [];

  const simplificationNecessaire = necessiteSimplification(instance);
  const exerciceTravail = simplificationNecessaire ? exerciceSimplifie(instance) : instance;

  if (simplificationNecessaire) {
    const g = facteurCommun(instance.enonce);
    const enonceReduit = enonceSimplifie(instance.enonce);
    paragraphes.push([
      texte(
        `Les trois coefficients de l'équation ont pour plus grand commun diviseur ${g} : on peut diviser toute l'équation par ${g} sans changer ses solutions. On obtient l'équation équivalente `,
      ),
      latex(formatEnonceAffichage(enonceReduit, instance.formeAffichage, instance.parametresAffichage)),
      texte("."),
    ]);
  }

  const isolementNecessaire = necessiteIsolement(exerciceTravail);
  if (isolementNecessaire) {
    const formeDirecte = demandeFormeGeneraleDirecte(exerciceTravail);
    paragraphes.push([
      texte(
        formeDirecte
          ? "Pour résoudre cette équation, on la réécrit directement sous la forme générale ax² + bx + c = 0 : "
          : "Pour résoudre cette équation, il faut d'abord regrouper tous les termes dans un même membre afin d'obtenir une expression égale à 0 : ",
      ),
      latex(formatEquationIsoleeNonDeveloppee(exerciceTravail)),
      texte("."),
    ]);
  }

  if (necessiteDeveloppement(exerciceTravail)) {
    paragraphes.push([
      texte("Le membre de gauche contient encore un produit : on le développe pour faire apparaître clairement les coefficients a, b et c. On obtient "),
      latex(formatEnonceLatex(exerciceTravail.enonce)),
      texte("."),
    ]);
  }

  const reconnaissanceNecessaire = necessiteReconnaissance(exerciceTravail);
  if (reconnaissanceNecessaire) {
    paragraphes.push([
      texte(
        exerciceTravail.categorie === "cas_general"
          ? "Cette équation ne rentre dans aucun cas de factorisation directe (mise en évidence, binôme conjugué ou produit remarquable) : on utilise donc la formule générale du discriminant."
          : `On observe que cette équation correspond au cas « ${libelleCategorie(exerciceTravail.categorie)} » : c'est la méthode la plus directe pour la résoudre.`,
      ),
    ]);
  }

  // Δ/factorisation puis solutions, toujours fusionnés en une seule conclusion rédigée — jamais
  // deux questions séparées comme à l'écran (fidèle au principe "une résolution continue", voir
  // commentaire de tête).
  if (exerciceTravail.categorie === "cas_general") {
    const delta = exerciceTravail.solution.delta as number;
    const bAffiche = formatBPourSubstitution(exerciceTravail.enonce, exerciceTravail.irrationnel);
    paragraphes.push([
      texte("On calcule le discriminant : "),
      latex(formatSubstitutionDelta(exerciceTravail.enonce, delta, bAffiche)),
      texte("."),
    ]);
    const [r1, r2] = formatTermesZerosAttendusLatex(exerciceTravail);
    if (delta > 0) {
      paragraphes.push([
        texte("Comme Δ > 0, l'équation admet deux solutions distinctes, données par la formule résolvante : "),
        latex(formatSubstitutionRacinesDistinctes(exerciceTravail.enonce, delta, bAffiche, r1, r2)),
        texte("."),
      ]);
    } else if (delta === 0) {
      paragraphes.push([
        texte("Comme Δ = 0, l'équation admet une solution double, donnée par la formule résolvante : "),
        latex(formatSubstitutionRacineDouble(exerciceTravail.enonce, bAffiche, r1)),
        texte("."),
      ]);
    } else {
      paragraphes.push([texte("Comme Δ < 0, cette équation n'admet aucune solution réelle.")]);
    }
  } else {
    paragraphes.push([
      texte(`On factorise l'équation à l'aide de la méthode « ${libelleCategorie(exerciceTravail.categorie)} » : `),
      latex(`${exerciceTravail.solution.formeFactorisee} = 0`),
      texte("."),
    ]);
    paragraphes.push([
      texte(
        "Un produit de facteurs est nul si et seulement si l'un au moins de ses facteurs est nul : on résout donc chaque facteur égalé à zéro, ce qui donne comme "
          + `${estSolutionUnique(exerciceTravail) ? "solution" : "solutions"} : `,
      ),
      ...formatTermesZerosAttendusLatex(exerciceTravail).flatMap((terme, i, tableau): FragmentConsigne[] =>
        i < tableau.length - 1 ? [latex(terme), texte(" ; ")] : [latex(terme)],
      ),
      texte("."),
    ]);
  }

  return paragraphes;
}

/** Nombre de lignes laissées à l'élève — assez généreux pour une résolution rédigée complète, pas
 * seulement une réponse brève par sous-question (voir commentaire de tête). */
function nombreLignesReponse(nombreParagraphes: number): number {
  return Math.max(10, nombreParagraphes * 2 + 2);
}

function construireEnonceSecondDegre(instance: Exercice): SectionExercice {
  const nombreParagraphes = construireParagraphesResolution(instance).length;
  return {
    enteteFragments: [
      texte("Résous l'équation suivante. Indique et justifie toutes les étapes de ta démarche : "),
      latex(formatEnonceAffichage(instance.enonce, instance.formeAffichage, instance.parametresAffichage, instance.irrationnel)),
    ],
    questions: [
      {
        consigne: [texte("Développe ici ta résolution complète, étape par étape.")],
        reponse: { type: "lignes", nombre: nombreLignesReponse(nombreParagraphes) },
      },
    ],
  };
}

function construireCorrectionSecondDegre(instance: Exercice): BlocCorrection[] {
  return construireParagraphesResolution(instance).map((fragments) => ({ type: "paragraphe", fragments }));
}

export const adaptateurEvaluationSecondDegre: AdaptateurFeuilleExercices<Exercice> = {
  titreDocument: "Résoudre une équation du second degré — Évaluation",
  nomFichierBase: "second-degre-methode-rapide",
  genererInstance: genererExerciceSecondDegre,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteSecondDegreId),
  construireEnonce: construireEnonceSecondDegre,
  construireCorrection: construireCorrectionSecondDegre,
  // Une seule question ouverte par instance (voir commentaire de tête) : pas de sous-questions
  // lettrées, mais `regroupable` reste exclu car la consigne mentionne la valeur tirée (`latex(...)`
  // dans `enteteFragments`, jamais une consigne générique indépendante de l'instance).
};
