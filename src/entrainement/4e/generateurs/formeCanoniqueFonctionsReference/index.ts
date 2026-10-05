import type {
  ExerciceFormeCanoniqueFonctionReference,
  FamilleReference,
  FormeDepart,
  GenerateurExerciceFormeCanoniqueFonctionReference,
} from "../../core/formeCanoniqueFonctionsReference.types";

export const FAMILLES: FamilleReference[] = ["carre", "cube", "racine_carree", "racine_cubique", "inverse", "valeur_absolue"];

/**
 * Catalogue de métadonnées `{id,label}` (convention RETROFIT-variantes-generateurs.md) — mêmes 6
 * familles et mêmes libellés que le dixième exercice (`generateurs/fonctionsReference/index.ts`),
 * dupliqués plutôt qu'importés : ce fichier duplique déjà `FAMILLES` lui-même pour la même raison
 * (voir CLAUDE.md, section de cet exercice — les deux tableaux doivent rester synchronisés à la
 * main), donc dupliquer le catalogue aussi plutôt que de créer une dépendance générateur→générateur
 * asymétrique avec le seul autre tableau du fichier qui reste, lui, local.
 */
export interface VarianteFormeCanoniqueFonctionReference {
  id: FamilleReference;
  label: string;
}

export const CATALOGUE_VARIANTES: VarianteFormeCanoniqueFonctionReference[] = [
  { id: "carre", label: "Carré (x²)" },
  { id: "cube", label: "Cube (x³)" },
  { id: "racine_carree", label: "Racine carrée (√x)" },
  { id: "racine_cubique", label: "Racine cubique (∛x)" },
  { id: "inverse", label: "Inverse (1/x)" },
  { id: "valeur_absolue", label: "Valeur absolue (|x|)" },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Coefficient interne combiné SOY·(CH/EH), élevé à l'effet propre à la famille — dupliqué depuis
 * `src/moteur/verificationFormeCanoniqueFonctionsReference.ts` plutôt qu'importé (règle
 * d'architecture non négociable : `src/generateurs/` n'importe jamais `src/moteur/`, voir
 * CLAUDE.md) ; petites fonctions pures, même principe de duplication assumée que
 * `ajusterAuRatio`/`coteFactorise` ailleurs dans le projet.
 */
function coefficientInterneSimple(famille: "carre" | "cube" | "valeur_absolue" | "inverse", ch: number, eh: number, soy: boolean): number {
  const rapport = ch / eh;
  const signeSoy = soy ? -1 : 1;
  switch (famille) {
    case "carre":
      return rapport * rapport;
    case "cube":
      return signeSoy * rapport * rapport * rapport;
    case "valeur_absolue":
      return rapport;
    case "inverse":
      return signeSoy / rapport;
  }
}

function coefficientCompletSimple(
  famille: "carre" | "cube" | "valeur_absolue" | "inverse",
  ch: number,
  eh: number,
  ev: number,
  cv: number,
  sox: boolean,
  soy: boolean,
): number {
  const signeSox = sox ? -1 : 1;
  return signeSox * (ev / cv) * coefficientInterneSimple(famille, ch, eh, soy);
}

function coefficientInterneDouble(ch: number, eh: number, soy: boolean): number {
  return (soy ? -1 : 1) * (ch / eh);
}

/**
 * Construit la "forme de départ" (table section 1 de la spec) — TOUJOURS dérivée des mêmes
 * TH/TV/CH/EH/EV/CV/SOX/SOY que le reste de l'exercice, jamais de coefficients bruts tirés
 * indépendamment (voir core/formeCanoniqueFonctionsReference.types.ts pour la justification
 * complète — correctif de cohérence, `prompt-coherenceexerciceetcastrivial.md`) : selon ce que la
 * technique de simplification de la famille peut structurellement récupérer sans introduire
 * d'irrationalité ni perdre de signe, la cible visée est soit le coefficient PLEINEMENT combiné +
 * TV (`carre`/`inverse`), soit le seul coefficient interne + TH (`cube`/`racine_carree`/
 * `racine_cubique`/`valeur_absolue`).
 */
export function construireFormeDepart(
  famille: FamilleReference,
  params: {
    th: number;
    tv: number;
    ch: number;
    eh: number;
    ev: number;
    cv: number;
    sox: boolean;
    soy: boolean;
  },
): FormeDepart {
  const { th: p, tv: q, ch, eh, ev, cv, sox, soy } = params;
  switch (famille) {
    case "carre": {
      const a = coefficientCompletSimple("carre", ch, eh, ev, cv, sox, soy);
      return { type: "carre", a, b: -2 * a * p, c: a * p * p + q };
    }
    case "cube": {
      // b^3 doit égaler coefficientInterneSimple("cube", ...) = signeSoy·rapport^3 — b = signeSoy·
      // rapport le vérifie exactement (racine cubique exacte d'une puissance 3ᵉ d'un rationnel,
      // jamais besoin de Math.cbrt qui introduirait une imprécision flottante inutile ici).
      const b = coefficientInterneDouble(ch, eh, soy);
      return { type: "cube", a: -b * p, b };
    }
    case "racine_carree": {
      // Le coefficient reste À L'INTÉRIEUR de la racine (jamais extrait comme un facteur carré
      // parfait externe) : c'est exactement ce que l'étape 3 (TH) attend ensuite comme fonction
      // intermédiaire g(SOY·(CH/EH)·(x-TH)) — la "simplification" de cette étape consiste à
      // factoriser le coefficient commun du binôme sous la racine pour en déduire TH, pas à en
      // extraire une racine.
      const a = coefficientInterneDouble(ch, eh, soy);
      return { type: "racine_carree", a, b: -a * p };
    }
    case "racine_cubique": {
      const a = coefficientInterneDouble(ch, eh, soy);
      return { type: "racine_cubique", a, b: -a * p };
    }
    case "inverse": {
      // (ax+b)/(cx+d) = Q + [K/c]/(x-p) après mise en évidence de (cx+d)=c(x-p) — le coefficient du
      // reste vaut K/c, pas K : on compense en fixant K = cible·c pour que le reste retrouvé après
      // division égale exactement `cible` (coefficientCompletSimple), pas cible/c.
      const cible = coefficientCompletSimple("inverse", ch, eh, ev, cv, sox, soy);
      const c = randomInt(1, 3);
      const d = -c * p;
      const K = cible * c;
      const a = q * c;
      const b = q * d + K;
      return { type: "inverse", a, b, c, d };
    }
    case "valeur_absolue": {
      // coefficientInterneSimple("valeur_absolue", ...) = ch/eh, toujours positif — |a| le retrouve
      // directement en choisissant a = ch/eh (positif) sans perte d'information.
      const a = coefficientInterneSimple("valeur_absolue", ch, eh, soy);
      return { type: "valeur_absolue", a, b: -a * p };
    }
  }
}

/**
 * CH/EH tirés par exclusivité mutuelle (un seul des deux non-neutre à la fois, comme "fonctions de
 * référence") — mais jamais tous deux neutres simultanément (`prompt-coherenceexerciceetcastrivial.md`,
 * correctif 2) : sans cette exclusion, le coefficient interne SOY·(CH/EH) vaudrait ±1, rendant la
 * forme de départ déjà sous forme canonique dès l'étape 1 (rien à simplifier, l'élève n'aurait qu'à
 * recopier l'énoncé).
 */
function tirerChEh(): { ch: number; eh: number } {
  let ch = 1;
  let eh = 1;
  do {
    ch = 1;
    eh = 1;
    if (Math.random() < 0.5) {
      ch = randomInt(1, 5);
    } else {
      eh = randomInt(1, 5);
    }
  } while (ch === 1 && eh === 1);
  return { ch, eh };
}

/**
 * Joue le rôle de `construireAvecVarianteId` pour ce générateur (convention RETROFIT-variantes-
 * generateurs.md) — renommée et exportée depuis `construireAvecFamilleEtParametres` (jusque-là
 * privée à ce fichier, seule fonction du générateur 11 à ne pas suivre le patron déjà établi par
 * `generateurs/fonctionsReference/index.ts::construireAvecFamille`, dixième exercice, sur lequel
 * elle est désormais alignée nom pour nom, `th`/`tv` devenant un `overrides?` optionnel plutôt que
 * deux paramètres positionnels obligatoires). Seul appelant interne à ce fichier avant ce
 * changement (`genererExerciceFormeCanoniqueFonctionReference` ci-dessous), donc aucun risque de
 * régression externe à ajuster sa signature.
 */
export function construireAvecFamille(
  famille: FamilleReference,
  overrides?: { th?: number; tv?: number },
): ExerciceFormeCanoniqueFonctionReference {
  const th = overrides?.th ?? randomInt(-5, 5);
  const tv = overrides?.tv ?? randomInt(-5, 5);
  const { ch, eh } = tirerChEh();

  let ev = 1;
  let cv = 1;
  if (Math.random() < 0.5) {
    ev = randomInt(1, 5);
  } else {
    cv = randomInt(1, 5);
  }

  const sox = Math.random() < 0.5;
  const soy = Math.random() < 0.5;

  const formeDepart = construireFormeDepart(famille, { th, tv, ch, eh, ev, cv, sox, soy });

  return { famille, th, tv, ch, eh, ev, cv, sox, soy, formeDepart };
}

/**
 * Implémentation de la Couche A (section 1-3 de la spec). TH et TV sont toujours tirés en premier,
 * indépendamment, entiers signés dans [-5,5]. CH/EH (jamais tous deux neutres, voir `tirerChEh`) et
 * EV/CV sont chacun tirés par exclusivité mutuelle — mais, contrairement à "fonctions de référence"
 * (10e exercice), SANS contrainte "un seul canal actif à la fois" entre les deux paires (section 3
 * de la spec) : les deux paires peuvent être simultanément non-neutres. SOX/SOY tirés
 * indépendamment. `formeDepart` est ensuite dérivée de ces 8 valeurs (voir `construireFormeDepart`)
 * — jamais l'inverse.
 */
export const genererExerciceFormeCanoniqueFonctionReference: GenerateurExerciceFormeCanoniqueFonctionReference = () => {
  const famille = FAMILLES[randomInt(0, FAMILLES.length - 1)];
  return construireAvecFamille(famille);
};
