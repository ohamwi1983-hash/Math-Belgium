import type { Exercice } from "../../core/generateur.types";

/** "" si a=1, "-" si a=-1 (jamais "-1"), sinon le nombre littéral — même convention que formatSimplification.ts. */
function prefixeCoefficient(a: number): string {
  if (a === 1) return "";
  if (a === -1) return "-";
  return String(a);
}

/** "x - r" ou "x + |r|" selon le signe de r. */
function formatFacteurRacine(r: number): string {
  return r >= 0 ? `x - ${r}` : `x + ${Math.abs(r)}`;
}

/**
 * a·x·(x-r) — pour a>0, coefficient devant "x" (convention déjà utilisée par
 * secondDegre/categories/miseEnEvidence.ts). Pour a<0, le signe est absorbé dans le second facteur
 * ("x(ax - ar)") plutôt que de préfixer "x" d'une négation ("-x(x-r)") : verifierMiseEnEvidence
 * (expressionAlgebrique.ts) exige "x" comme facteur explicite au sens structurel (pas seulement
 * numérique), et une négation en tête du facteur "x" le masque à cette détection — comportement
 * intentionnel du module partagé (voir son test "refuse un facteur x caché derrière une
 * négation"), donc c'est ici, à la génération, qu'il faut l'éviter, jamais dans le module partagé.
 * `a` n'est jamais 1 ni -1 pour rien ni r=0 dans cette branche (r est la racine non nulle par
 * construction de l'appelant) donc aucun cas particulier supplémentaire n'est nécessaire.
 */
function formeFactoriseeMiseEnEvidence(a: number, r: number): string {
  if (a > 0) {
    return `${prefixeCoefficient(a)}x(${formatFacteurRacine(r)})`;
  }
  const constante = -a * r;
  const termeX = a === -1 ? "-x" : `${a}x`;
  return `x(${termeX} ${constante > 0 ? "+" : "-"} ${Math.abs(constante)})`;
}

/**
 * Construit un `Exercice` (contrat de l'exercice 1) à partir d'un coefficient dominant `a` et de
 * deux racines r1,r2 (égales ou non), en **classifiant la catégorie a posteriori** plutôt qu'en la
 * choisissant a priori — exception délibérée au principe "technique choisie avant construction"
 * de secondDegre/index.ts : cette équation provient d'une élimination de dénominateurs
 * (constructions `deux_denominateurs` et `deux_fractions_lineaires` sous-variante (c)), sa
 * catégorie est une propriété émergente des paramètres, pas un choix. `deux_denominateurs`
 * garantit r1≠r2 en amont (voir construireDeuxDenominateurs.ts) donc n'atteint jamais la branche
 * `produit_remarquable` ci-dessous en pratique, mais la sous-variante (c) du cas 3 peut
 * légitimement tomber sur une racine double (elle ne l'exclut pas) — la fonction doit donc rester
 * complète plutôt que de lever sur ce cas.
 */
export function construireExerciceClassifie(a: number, r1: number, r2: number): Exercice {
  const b = -a * (r1 + r2);
  const c = a * r1 * r2;
  const enonce = { a, b, c };

  if (r1 === r2) {
    return {
      categorie: "produit_remarquable",
      enonce,
      solution: {
        formeFactorisee: `${prefixeCoefficient(a)}(${formatFacteurRacine(r1)})^2`,
        racines: [r1, r1],
        racinesExactes: true,
      },
      formeAffichage: "canonique",
    };
  }

  const racines: [number, number] = r1 < r2 ? [r1, r2] : [r2, r1];

  if (c === 0) {
    const r = r1 === 0 ? r2 : r1;
    return {
      categorie: "mise_en_evidence",
      enonce,
      solution: {
        formeFactorisee: formeFactoriseeMiseEnEvidence(a, r),
        racines,
        racinesExactes: true,
      },
      formeAffichage: "canonique",
    };
  }

  if (b === 0) {
    const r = Math.abs(r1);
    return {
      categorie: "binome_conjugue",
      enonce,
      solution: {
        formeFactorisee: `${prefixeCoefficient(a)}(x - ${r})(x + ${r})`,
        racines,
        racinesExactes: true,
      },
      formeAffichage: "canonique",
    };
  }

  const delta = b * b - 4 * a * c;
  return {
    categorie: "cas_general",
    enonce,
    solution: { delta, racines, racinesExactes: true },
    formeAffichage: "canonique",
  };
}

/**
 * "(rGrand)(rPetit)" — aucun motif entre les deux racines (contrairement à mise_en_evidence/
 * binome_conjugue/produit_remarquable), donc pas de forme canonique imposée par la catégorie
 * elle-même. Contrairement à formeFactoriseeMiseEnEvidence, aucune absorption de signe n'est
 * nécessaire ici même si a<0 : verifierMiseEnEvidenceGeneralisee (expressionAlgebrique.ts) extrait
 * les racines par évaluation numérique de chaque facteur (comme binome_conjugue/produit_remarquable),
 * jamais via le test structurel strict "x littéral" qui posait problème pour mise_en_evidence —
 * confirmé empiriquement avant implémentation (voir construireExerciceClassifie.test.ts).
 */
function formeFactoriseeMiseEnEvidenceGeneralisee(a: number, r1: number, r2: number): string {
  const [rGrand, rPetit] = r1 > r2 ? [r1, r2] : [r2, r1];
  const facteur = (r: number) => (r === 0 ? "x" : `(${formatFacteurRacine(r)})`);
  return `${prefixeCoefficient(a)}${facteur(rGrand)}${facteur(rPetit)}`;
}

/**
 * Construit un `Exercice` toujours classé `mise_en_evidence_generalisee`, jamais classifié a
 * posteriori (contrairement à `construireExerciceClassifie`) — utilisé par la construction
 * `deux_fractions_lineaires` sous-variantes (a) et (b) (prompt-2-cas3-degre1.md), qui doivent
 * sauter l'étape de reconnaissance (voir `necessiteReconnaissance`,
 * src/moteur/sessionEquationRationnelle.ts, qui teste exactement cette catégorie — même
 * convention que la famille 5 de l'exercice "méthode la plus rapide"). Exige r1≠r2 : les deux
 * sous-variantes appelantes garantissent déjà des racines distinctes par construction.
 */
export function construireExerciceMiseEnEvidenceGeneralisee(a: number, r1: number, r2: number): Exercice {
  if (r1 === r2) {
    throw new Error("construireExerciceMiseEnEvidenceGeneralisee : deux racines distinctes sont requises");
  }

  const b = -a * (r1 + r2);
  const c = a * r1 * r2;
  const racines: [number, number] = r1 < r2 ? [r1, r2] : [r2, r1];

  return {
    categorie: "mise_en_evidence_generalisee",
    enonce: { a, b, c },
    solution: {
      formeFactorisee: formeFactoriseeMiseEnEvidenceGeneralisee(a, r1, r2),
      racines,
      racinesExactes: true,
    },
    formeAffichage: "canonique",
  };
}
