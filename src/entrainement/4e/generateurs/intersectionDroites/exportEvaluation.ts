import type { ExerciceIntersectionDroites, LigneIntersection } from "../../core/intersectionDroites.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatFractionIrreductible } from "../../ui/formatFraction";
import {
  CONSIGNE_GENERALE_INTERSECTION,
  formatAidePointNiveau2Latex,
  formatEnonceLatex,
  formatPointLatex,
  formatVecteurLatex,
  segmentsConsigneDiagnostic,
  segmentsConsignePoint,
  texteAidePointNiveau1,
  texteConclusionAttendue,
  texteReponsePointAttendue,
} from "../../ui/formatIntersectionDroites";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntersectionDroites } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceIntersectionDroites>` pour gen48 (Intersection
 * entre deux droites, chapitre "Géométrie analytique plane", `AppIntersectionDroites.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Écran → question (`AppIntersectionDroites.tsx`/`moteur/sessionIntersectionDroites.ts`, 2 phases
 * possibles, JAMAIS toujours traversées — voir le commentaire de tête de `sessionIntersectionDroites.ts`) :
 * - `diagnostic` (`EtapeDiagnosticIntersectionDroites.tsx`, TOUJOURS présent) — 3 boutons catégoriels
 *   (sécantes / parallèles distinctes / confondues) → question papier a), consigne reprise de
 *   `segmentsConsigneDiagnostic()` précédée de `CONSIGNE_GENERALE_INTERSECTION` (affichée sur les 2
 *   écrans à l'écran, ici factorisée une seule fois en tête de la première question).
 * - `point` (`EtapePointIntersectionDroites.tsx`, UNIQUEMENT si `conclusion === "secantes"` — sinon
 *   la session clôt l'exercice directement après le diagnostic, aucun second écran) → question
 *   papier b), consigne reprise de `segmentsConsignePoint()` (déjà spécifique par variante).
 *
 * PAS `regroupable` : le nombre de questions par instance est STRUCTURELLEMENT variable — 1 question
 * si `conclusion !== "secantes"`, 2 si `conclusion === "secantes"` — alors que
 * `AdaptateurFeuilleExercices.regroupable` exige TOUJOURS une seule question par instance (condition
 * 1, voir `export/genererFeuilleExercices.ts`). Cette variation dépend en outre de `conclusion`
 * (tirée indépendamment de `variante` dans `construireAvecVarianteId`), pas de la variante forçable
 * elle-même : même en fixant `variante`, `/admin` de Math-Belgium ne peut pas savoir à l'avance
 * combien de questions une instance donnée produira. Même décision, pour une raison analogue
 * (nombre de questions hétérogène selon l'instance), que `simplification/exportEvaluation.ts` et
 * `colinearite/exportEvaluation.ts`.
 *
 * Aucune zone de réponse vierge (`reponse: { type: "lignes", nombre: 0 }`, même décision documentée
 * que `quelAngle/exportEvaluation.ts`/`comparaisonSeries/exportEvaluation.ts`) : l'élève rédige
 * librement sa réponse sur la copie, jamais contraint par un nombre de lignes imprimées.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée, en
 * réutilisant directement les fonctions déjà utilisées côté écran interactif
 * (`ui/formatIntersectionDroites.ts` — `texteConclusionAttendue`, `texteReponsePointAttendue`,
 * `texteAidePointNiveau1`, `formatAidePointNiveau2Latex`, `segmentsConsigneDiagnostic`/
 * `segmentsConsignePoint`) plutôt que d'en reconstruire de nouvelles. Différence assumée avec les
 * AIDES progressives de l'écran diagnostic (`segmentsAideDiagnosticNiveau1`/
 * `formatAideDiagnosticNiveau2Latex`, volontairement NON réutilisées ici) : ces aides sont conçues
 * pour ne révéler qu'UNE SEULE donnée brute à la fois (ex. `m_1` seul, jamais `m_2`), l'élève devant
 * calculer l'autre côté lui-même — une correction papier doit au contraire dérouler la comparaison
 * COMPLÈTE des deux côtés (voir `fragmentsCalculColinearite` ci-dessous), donc une resynthèse dédiée
 * plutôt qu'un simple replay des fragments d'aide. Le verdict colinéaire/non-colinéaire de cette
 * resynthèse suit STRICTEMENT `instance.colineaires` (jamais une ré-égalité `===` recalculée
 * localement sur des pentes flottantes, qui pourrait diverger par un arrondi binaire even quand
 * `instance.colineaires` — calculé par produit en croix sur des entiers, exact — dit le contraire) ;
 * seules les VALEURS affichées (pentes, vecteurs, critère) sont recalculées indépendamment, jamais
 * la conclusion verbale elle-même. Quand `instance.colineaires` est vrai, `fragmentsTestAppartenance`
 * distingue ensuite parallèles-distinctes de confondues en testant si un point de `d1`
 * (`instance.d1.point`, garanti sur `d1` par construction — voir `construireLigneIntersection`,
 * `generateurs/intersectionDroites/index.ts`) appartient à `d2` via l'équation implicite de `d2`
 * (`instance.d2.implicite`, TOUJOURS calculable quelle que soit `forme` — voir la doc de
 * `LigneIntersection`, `core/intersectionDroites.types.ts`) — un test indépendant de
 * `instance.conclusion`, jamais une simple relecture de ce champ.
 */

// ============================================================================
// Petits formateurs locaux, dupliqués depuis `ui/formatIntersectionDroites.ts` (fonctions privées,
// non exportées) — mêmes principes exacts (fraction irréductible pour toute pente potentiellement
// non entière, jamais de notation décimale), même convention de duplication déjà établie ailleurs
// sur le projet pour ces wrappers trop petits pour justifier une extraction partagée.
// ============================================================================

function formatMagnitudeFractionLatex(abs: number): string {
  const texteFraction = formatFractionIrreductible(abs);
  const [numerateur, denominateur] = texteFraction.split("/");
  return denominateur === undefined ? numerateur! : `\\frac{${numerateur}}{${denominateur}}`;
}

function formatValeurFractionLatex(valeur: number): string {
  return valeur < 0 ? `-${formatMagnitudeFractionLatex(-valeur)}` : formatMagnitudeFractionLatex(valeur);
}

/** Pente d'une droite depuis son vecteur directeur — toujours finie ici (composantes toujours non
 * nulles par construction, voir `generateurs/intersectionDroites/index.ts::tirerVecteur`). */
function penteDeLigne(ligne: LigneIntersection): number {
  return ligne.vecteur.y / ligne.vecteur.x;
}

/** Repère laquelle des deux droites est réellement paramétrique dans l'instance — jamais supposée
 * être `d1` (même précaution que `ligneParametrique`/`ligneCartesienne`, privées dans
 * `ui/formatIntersectionDroites.ts`). */
function ligneParametriqueDe(instance: ExerciceIntersectionDroites): { ligne: LigneIntersection; indice: 1 | 2 } {
  return instance.d1.forme === "parametrique" ? { ligne: instance.d1, indice: 1 } : { ligne: instance.d2, indice: 2 };
}

function ligneCartesienneDe(instance: ExerciceIntersectionDroites): { ligne: LigneIntersection; indice: 1 | 2 } {
  return instance.d1.forme === "parametrique" ? { ligne: instance.d2, indice: 2 } : { ligne: instance.d1, indice: 1 };
}

// ============================================================================
// Question a) — Diagnostic (sécantes / parallèles distinctes / confondues).
// ============================================================================

/** Comparaison COMPLÈTE (les deux côtés, jamais un seul comme les aides progressives de l'écran),
 * différenciée par variante — même critère que `segmentsAideDiagnosticNiveau1`/
 * `formatAideDiagnosticNiveau2Latex` (`ui/formatIntersectionDroites.ts`), mais jamais un simple
 * replay de ces fragments (voir le commentaire de tête du fichier). Le verdict verbal final suit
 * `instance.colineaires`, jamais une ré-égalité locale sur les pentes affichées. */
function fragmentsCalculColinearite(instance: ExerciceIntersectionDroites): FragmentConsigne[] {
  const { colineaires } = instance;

  if (instance.variante === "cart_cart") {
    const m1 = penteDeLigne(instance.d1);
    const m2 = penteDeLigne(instance.d2);
    return [
      texte("Pentes : "),
      latex(`m_1 = ${formatValeurFractionLatex(m1)}`),
      texte(", "),
      latex(`m_2 = ${formatValeurFractionLatex(m2)}`),
      texte(colineaires ? " — pentes égales." : " — pentes différentes."),
    ];
  }

  if (instance.variante === "param_param") {
    const u1 = instance.d1.vecteur;
    const u2 = instance.d2.vecteur;
    const critere = u1.x * u2.y - u1.y * u2.x;
    return [
      texte("Vecteurs directeurs "),
      latex(`\\vec{u_1}${formatVecteurLatex(u1)}`),
      texte(" et "),
      latex(`\\vec{u_2}${formatVecteurLatex(u2)}`),
      texte(" — critère de colinéarité "),
      latex(`(${u1.x})\\cdot(${u2.y}) - (${u1.y})\\cdot(${u2.x}) = ${critere}`),
      texte(colineaires ? ", nul." : ", non nul."),
    ];
  }

  // Variante mixte (param_cart) — compare la pente de la droite cartésienne au rapport y/x du
  // vecteur directeur de la droite paramétrique, quel que soit l'indice réel de chacune (`d1`/`d2`).
  const { ligne: param, indice: iParam } = ligneParametriqueDe(instance);
  const { ligne: cart, indice: iCart } = ligneCartesienneDe(instance);
  const mCart = penteDeLigne(cart);
  const mParam = penteDeLigne(param);
  return [
    texte("Comparaison : "),
    latex(`m_${iCart} = ${formatValeurFractionLatex(mCart)}`),
    texte(", "),
    latex(`\\dfrac{y_{\\vec{u_${iParam}}}}{x_{\\vec{u_${iParam}}}} = ${formatValeurFractionLatex(mParam)}`),
    texte(colineaires ? " — égaux." : " — différents."),
  ];
}

/** Uniquement appelée quand `instance.colineaires` est vrai — distingue parallèles distinctes de
 * confondues en testant si un point de `d1` appartient à `d2` (voir le commentaire de tête du
 * fichier pour la justification géométrique complète). */
function fragmentsTestAppartenance(instance: ExerciceIntersectionDroites): FragmentConsigne[] {
  const { a, b, c } = instance.d2.implicite;
  const p1 = instance.d1.point;
  const evaluation = a * p1.x + b * p1.y + c;
  const appartient = evaluation === 0;
  return [
    texte(" Un point de "),
    latex("d_1"),
    texte(", "),
    latex(formatPointLatex(p1)),
    texte(", appartient-il à "),
    latex("d_2"),
    texte(" ? "),
    latex(`(${a})\\cdot(${p1.x}) + (${b})\\cdot(${p1.y}) + (${c}) = ${evaluation}`),
    texte(appartient ? " — nul : ce point appartient aussi à d₂." : " — non nul : ce point n'appartient pas à d₂."),
  ];
}

function fragmentsCorrectionDiagnostic(instance: ExerciceIntersectionDroites): FragmentConsigne[] {
  const fragments: FragmentConsigne[] = [texte("a) "), ...fragmentsCalculColinearite(instance)];

  if (instance.colineaires) {
    fragments.push(texte(" Les vecteurs directeurs sont colinéaires."), ...fragmentsTestAppartenance(instance));
  } else {
    fragments.push(texte(" Les vecteurs directeurs ne sont pas colinéaires."));
  }

  fragments.push(texte(` ${texteConclusionAttendue(instance)}`));
  return fragments;
}

// ============================================================================
// Question b) — Point d'intersection (uniquement si `conclusion === "secantes"`).
// ============================================================================

function fragmentsCorrectionPoint(instance: ExerciceIntersectionDroites): FragmentConsigne[] {
  // Non-null : appelée uniquement quand `conclusion === "secantes"` (voir
  // `construireCorrectionIntersectionDroites`), la seule condition sous laquelle
  // `texteReponsePointAttendue` renvoie autre chose que `null`.
  const reponse = texteReponsePointAttendue(instance)!;
  return [texte(`b) ${texteAidePointNiveau1(instance)} `), latex(formatAidePointNiveau2Latex(instance)), texte(`. En résolvant : ${reponse}.`)];
}

// ============================================================================
// Point d'entrée unique du contrat `AdaptateurFeuilleExercices`.
// ============================================================================

function construireEnonceIntersectionDroites(instance: ExerciceIntersectionDroites): SectionExercice {
  const questions: SectionExercice["questions"] = [
    {
      consigne: [texte(`${CONSIGNE_GENERALE_INTERSECTION} `), ...segmentsConsigneDiagnostic()],
      reponse: { type: "lignes", nombre: 0 },
    },
  ];

  if (instance.conclusion === "secantes") {
    questions.push({ consigne: segmentsConsignePoint(instance), reponse: { type: "lignes", nombre: 0 } });
  }

  return {
    enteteFragments: [texte("On donne les droites suivantes :"), latex(formatEnonceLatex(instance))],
    questions,
  };
}

function construireCorrectionIntersectionDroites(instance: ExerciceIntersectionDroites): BlocCorrection[] {
  const blocs: BlocCorrection[] = [{ type: "paragraphe", fragments: fragmentsCorrectionDiagnostic(instance) }];

  if (instance.conclusion === "secantes") {
    blocs.push({ type: "paragraphe", fragments: fragmentsCorrectionPoint(instance) });
  }

  return blocs;
}

export const adaptateurEvaluationIntersectionDroites: AdaptateurFeuilleExercices<ExerciceIntersectionDroites> = {
  titreDocument: "Intersection de deux droites — Évaluation",
  nomFichierBase: "intersection-deux-droites",
  genererInstance: genererExerciceIntersectionDroites,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceIntersectionDroites,
  construireCorrection: construireCorrectionIntersectionDroites,
};
