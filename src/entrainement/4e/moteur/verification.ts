import type { Categorie, Enonce, Exercice } from "../core/generateur.types";
import {
  diagnostiquerBinomeConjugue,
  diagnostiquerFormeCanonique,
  diagnostiquerFormeReduite,
  diagnostiquerMiseEnEvidence,
  diagnostiquerMiseEnEvidenceGeneralisee,
  diagnostiquerProduitRemarquable,
} from "./expressionAlgebrique";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import { enonceSimplifie } from "./simplificationEquation";
import type { StatutVerification } from "./statutVerification";
import type { ReponseZeros } from "./types";

const TOLERANCE_RACINES_EXACTES = 1e-9;
const TOLERANCE_RACINES_ARRONDIES = 0.005;
const TOLERANCE_DELTA = 1e-9;

/**
 * Comparaison exacte si racinesExactes, sinon tolérance ±0,005 (section 4). Ordre indifférent.
 * Variante irrationnelle : les emplacements du gabarit attendent le coefficient rationnel de
 * √k (pas la valeur réelle irrationnelle de la racine) — comparaison exacte contre ce rationnel.
 */
export function verifierRacines(saisies: [number, number], exercice: Exercice): boolean {
  const attendu = exercice.irrationnel
    ? [...exercice.irrationnel.racinesCoefficients].sort((a, b) => a - b)
    : [...exercice.solution.racines].sort((a, b) => a - b);
  const tolerance = exercice.irrationnel || exercice.solution.racinesExactes
    ? TOLERANCE_RACINES_EXACTES
    : TOLERANCE_RACINES_ARRONDIES;
  const obtenu = [...saisies].sort((a, b) => a - b);
  return Math.abs(attendu[0] - obtenu[0]) <= tolerance && Math.abs(attendu[1] - obtenu[1]) <= tolerance;
}

/**
 * Étape "zéros" (prompt-generateurs123groupe.md, points 5 et 6) — remplace verifierRacines pour
 * ce seul générateur (`verifierRacines` ci-dessus reste inchangée, encore utilisée telle quelle
 * par les exercices 3/4/5/6). Compare toujours à `exercice.solution.racines` (jamais aux
 * coefficients rationnels de `irrationnel`, contrairement à `verifierRacines`) : depuis que le
 * champ accepte l'expression complète sous forme libre (`6*sqrt(5)`), la valeur saisie est déjà
 * la vraie valeur irrationnelle une fois évaluée, comparable directement à la racine réelle.
 * `reponse.aucun` n'est jamais correct ici (aucune des 5 catégories de ce générateur n'a Δ<0).
 * Accepte, pour une racine double, une seule valeur ou deux valeurs identiques (point 5).
 */
export function verifierZeros(reponse: ReponseZeros, exercice: Exercice): boolean {
  if (reponse.aucun) return false;

  const [r1, r2] = [...exercice.solution.racines].sort((a, b) => a - b);
  const tolerance =
    exercice.irrationnel || exercice.solution.racinesExactes ? TOLERANCE_RACINES_EXACTES : TOLERANCE_RACINES_ARRONDIES;

  if (reponse.valeurs.length === 1) {
    if (Math.abs(r1 - r2) > tolerance) return false;
    return Math.abs(reponse.valeurs[0] - r1) <= tolerance;
  }

  if (reponse.valeurs.length === 2) {
    const [o1, o2] = [...reponse.valeurs].sort((a, b) => a - b);
    return Math.abs(r1 - o1) <= tolerance && Math.abs(r2 - o2) <= tolerance;
  }

  return false;
}

/**
 * Remplace chaque appel de fonction (sqrt/racine/cbrt/abs...) présent dans une expression par sa
 * valeur décimale entre parenthèses (prompt-generateurs123groupe.md, point 6) — permet de déléguer
 * ensuite toute la vérification structurelle réelle (x facteur explicite, motif binôme
 * conjugué/carré parfait) à `expressionAlgebrique.ts` (polynomial-only, aucune notion de racine),
 * jamais réimplémentée ici : cette fonction ne fait qu'évaluer numériquement chaque appel via
 * `evaluerExpressionGenerale` (le moteur de vérification symbolique standard du projet), puis
 * laisse le texte substitué — purement numérique + x — à un vérificateur déjà existant et déjà
 * testé. Les appels ne sont jamais imbriqués ici (un seul √k par gabarit irrationnel), un motif
 * non récursif suffit. Lève si un appel ne s'évalue pas (identifiant inconnu, argument invalide),
 * propagé par l'appelant comme "parse_error".
 */
function substituerAppelsRadicaux(texte: string): string {
  return texte.replace(/[a-zA-Z]+\([^()]*\)/g, (correspondance) => `(${evaluerExpressionGenerale(correspondance, 0)})`);
}

/**
 * Champ 1 d'une variante irrationnelle (mise_en_evidence/binome_conjugue/produit_remarquable
 * uniquement — cas_general n'a pas de gabarit, voir plus bas) : depuis
 * prompt-generateurs123groupe.md, point 6, un vrai champ libre remplace l'ancien gabarit à
 * emplacement(s) numérique(s) "□√k" — l'élève écrit la factorisation complète, radicaux compris
 * (ex. "x(x+6*sqrt(5))=0"), sous n'importe quelle forme équivalente. `enonce` porte déjà la vraie
 * valeur irrationnelle (ex. b = B√k) : substituer les radicaux puis déléguer à
 * expressionAlgebrique.ts revient donc à comparer directement contre cette valeur réelle, sans
 * jamais passer par le rationnel `VarianteIrrationnelle.champPrincipal` (qui ne sert plus qu'à
 * détecter la présence d'un gabarit, voir son commentaire dans core/generateur.types.ts).
 */
function diagnostiquerFactorisationIrrationnelle(categorie: Categorie, enonce: Enonce, valeurSaisie: string): StatutVerification {
  let substitue: string;
  try {
    substitue = substituerAppelsRadicaux(valeurSaisie);
  } catch {
    return "parse_error";
  }
  switch (categorie) {
    case "mise_en_evidence":
      return diagnostiquerMiseEnEvidence(substitue, enonce);
    case "binome_conjugue":
      return diagnostiquerBinomeConjugue(substitue, enonce);
    case "produit_remarquable":
      return diagnostiquerProduitRemarquable(substitue, enonce);
    case "cas_general":
    case "mise_en_evidence_generalisee":
    case "irreductible":
      return "not_equivalent";
  }
}

/**
 * Champ 1 : "Δ =" pour cas_general, "Factorise l'équation" sinon.
 * Le dispatch se fait uniquement sur le contrat (categorie), jamais sur une règle propre
 * à l'équation du second degré.
 *
 * Variante irrationnelle (categorie ≠ cas_general) : voir diagnostiquerFactorisationIrrationnelle
 * ci-dessus. cas_general garde son champ Δ normal inchangé (Δ reste toujours rationnel).
 *
 * Statut à 3 valeurs (convention CLAUDE.md, voir statutVerification.ts) — délègue directement aux
 * diagnostics d'expressionAlgebrique.ts pour les 4 catégories à champ libre (rationnelles) et à
 * diagnostiquerFactorisationIrrationnelle pour la variante irrationnelle ; la branche à champ
 * purement numérique (Δ de cas_general) reste hors du périmètre "parse_error" — un simple champ
 * numérique (Number()), pas une expression à tokeniser (voir AUDIT-comparaison-reponses.md).
 */
export function diagnostiquerChampPrincipal(exercice: Exercice, valeurSaisie: string): StatutVerification {
  if (exercice.irrationnel && exercice.irrationnel.champPrincipal !== undefined) {
    return diagnostiquerFactorisationIrrationnelle(exercice.categorie, exercice.enonce, valeurSaisie);
  }

  switch (exercice.categorie) {
    case "cas_general": {
      const delta = Number(valeurSaisie.trim().replace(",", "."));
      const correct = Number.isFinite(delta) && Math.abs(delta - (exercice.solution.delta ?? NaN)) < TOLERANCE_DELTA;
      return correct ? "correct" : "not_equivalent";
    }
    case "mise_en_evidence":
      return diagnostiquerMiseEnEvidence(valeurSaisie, exercice.enonce);
    case "binome_conjugue":
      return diagnostiquerBinomeConjugue(valeurSaisie, exercice.enonce);
    case "produit_remarquable":
      return diagnostiquerProduitRemarquable(valeurSaisie, exercice.enonce);
    case "mise_en_evidence_generalisee":
      return diagnostiquerMiseEnEvidenceGeneralisee(valeurSaisie, exercice.enonce);
    case "irreductible":
      throw new Error(
        "diagnostiquerChampPrincipal : jamais appelée pour categorie irreductible (Δ<0, l'étape de factorisation est sautée côté Analyse d'une fonction)",
      );
  }
}

export function verifierChampPrincipal(exercice: Exercice, valeurSaisie: string): boolean {
  return diagnostiquerChampPrincipal(exercice, valeurSaisie) === "correct";
}

/**
 * Étape "isolement" : l'élève doit ramener l'énoncé (affiché sous sa forme de surface) à la
 * forme canonique ax²+bx+c=0, explicitement égalée à 0 — voir diagnostiquerFormeCanonique.
 */
export function diagnostiquerIsolement(exercice: Exercice, valeurSaisie: string): StatutVerification {
  return diagnostiquerFormeCanonique(valeurSaisie, exercice.enonce);
}

export function verifierIsolement(exercice: Exercice, valeurSaisie: string): boolean {
  return diagnostiquerIsolement(exercice, valeurSaisie) === "correct";
}

/**
 * Étape "simplification" (nouvelle, précède désormais l'isolement — voir necessiteSimplification
 * dans simplificationEquation.ts) : l'élève doit réduire l'énoncé à pgcd(|a|,|b|,|c|)=1 —
 * diagnostiquerFormeReduite exige l'égalité exacte des coefficients avec cette forme réduite,
 * contrairement à diagnostiquerIsolement qui accepte n'importe quel multiple.
 */
export function diagnostiquerSimplification(exercice: Exercice, valeurSaisie: string): StatutVerification {
  return diagnostiquerFormeReduite(valeurSaisie, enonceSimplifie(exercice.enonce));
}

export function verifierSimplification(exercice: Exercice, valeurSaisie: string): boolean {
  return diagnostiquerSimplification(exercice, valeurSaisie) === "correct";
}

/**
 * Étape "factorisation" (cas_general uniquement, prompt-corrections-moteur-partage.md point 3) :
 * l'élève écrit a(x-x1)(x-x2) à partir des racines déjà trouvées à l'étape précédente. Réutilise
 * diagnostiquerMiseEnEvidenceGeneralisee (aucun motif de racines imposé entre les deux facteurs,
 * comme pour la famille 5) — même exigence de produit structurel à 2 racines extractibles, jamais
 * une simple recopie de la forme développée.
 */
export function diagnostiquerFactorisationCasGeneral(exercice: Exercice, valeurSaisie: string): StatutVerification {
  return diagnostiquerMiseEnEvidenceGeneralisee(valeurSaisie, exercice.enonce);
}

export function verifierFactorisationCasGeneral(exercice: Exercice, valeurSaisie: string): boolean {
  return diagnostiquerFactorisationCasGeneral(exercice, valeurSaisie) === "correct";
}
