import type {
  ExerciceFormeCanoniqueFonctionReference,
  FamilleReference,
  ReponseCanoniqueFR,
  ReponseEhChSoy,
  ReponseEvCvSoxFR,
  ReponseThFR,
  ReponseTvFR,
} from "../core/formeCanoniqueFonctionsReference.types";
import { parserNombreOuFraction } from "./verificationAnalyseFonction";
import { normaliserExposantsUnicode } from "./expressionAlgebrique";
import type { StatutVerification } from "./statutVerification";

/**
 * Vérification pour "Forme canonique et transformations — fonctions de référence" (chapitre 2).
 * Contrairement à "Transformations graphiques — fonctions de référence" (10e exercice), AUCUNE
 * vérification par échantillonnage numérique global ici (section 3 de la spec) : chaque étape se
 * vérifie structurellement + algébriquement, comme "Forme canonique et transformations" (9e
 * exercice, dont `analyserFormeCanoniqueComplete` sert de modèle direct, généralisé ici à 6
 * familles).
 *
 * PIÈCE ALGÉBRIQUE CENTRALE — pourquoi 4 familles se réduisent à UN SEUL coefficient combiné
 * (`FonctionSimple`) tandis que 2 familles (racines) en exigent DEUX séparés (`FonctionDouble`) :
 *
 * f(x) = SOX·(EV/CV)·g(SOY·(CH/EH)·(x-TH)) + TV
 *
 * Extraire le facteur SOY·(CH/EH) hors de g(...) revient à calculer g(k·v) = k^n · g(v) où n est le
 * degré/l'ordre de g. Pour g(u)=u² et g(u)=u³ (carre, cube), n est un ENTIER — k^n reste toujours
 * RATIONNEL pour k rationnel (aucune racine à calculer), donc SOY·(CH/EH) se combine sans perte à
 * SOX·(EV/CV) en un unique coefficient rationnel `A`. Pour g(u)=|u| (valeur_absolue), |k·v|=|k|·|v|
 * — même conclusion (k rationnel ⟹ |k| rationnel). Pour g(u)=1/u (inverse), 1/(k·v)=(1/k)·(1/v) —
 * l'inverse d'un rationnel reste rationnel, même conclusion. **Mais** pour g(u)=√u ou g(u)=∛u
 * (racine_carree, racine_cubique), extraire k hors de g nécessite de calculer g(k) = √k ou ∛k —
 * la racine n-ième d'un rapport de petits entiers (CH/EH ∈ [1,5]) n'est RATIONNELLE que dans des cas
 * très restrictifs (essentiellement CH=EH), donc généralement IRRATIONNELLE : combiner CH/EH/SOY à
 * SOX/EV/CV en un seul coefficient produirait une cible que l'élève ne pourrait jamais saisir
 * exactement. Ces 2 familles gardent donc le coefficient interne (SOY·CH/EH, à l'intérieur de la
 * racine) et le coefficient externe (SOX·EV/CV, à l'extérieur) structurellement séparés à toutes
 * les étapes — jamais fusionnés.
 */

const TOLERANCE = 1e-9;

// ---------------------------------------------------------------------------------------------
// Analyseurs structurels (texte libre -> nombres), généralisant analyserFormeCanoniqueComplete de
// "Forme canonique et transformations" (verificationFormeCanoniqueTransformations.ts) à 6 familles.
// ---------------------------------------------------------------------------------------------

/**
 * Un "*" final sert de simple séparateur explicite entre le coefficient et le groupe qui suit
 * (ex. "3*" devant "(x-2)" ou "sqrt(...)") — dépouillé une seule fois, jamais un facteur à
 * multiplier. Ce qui reste peut ensuite contenir un ou plusieurs "*" internes formant un vrai
 * produit de facteurs (ex. "3*1" pour un élève qui explicite 3×1) : chacun est alors évalué et
 * multiplié, jamais concaténé tel quel — l'ancienne version supprimait le "*" par un simple
 * remplacement de chaîne, ce qui transformait silencieusement "3*1" en la chaîne "31"
 * (AUDIT-robustesse-verification-champs-libres.md, bug 2 : résultat numériquement faux, sans
 * aucun message d'erreur).
 */
function analyserCoefSeul(coefTexte: string): number | null {
  const nettoye = coefTexte.trim();
  if (nettoye === "" || nettoye === "+") return 1;
  if (nettoye === "-") return -1;

  const sansSeparateurFinal = nettoye.endsWith("*") ? nettoye.slice(0, -1) : nettoye;
  if (sansSeparateurFinal === "" || sansSeparateurFinal === "+") return 1;
  if (sansSeparateurFinal === "-") return -1;

  let produit = 1;
  for (const facteurTexte of sansSeparateurFinal.split("*")) {
    const facteur = parserNombreOuFraction(facteurTexte.trim());
    if (facteur === null) return null;
    produit *= facteur;
  }
  return produit;
}

/** Extrait `{coef, p}` d'un texte `coef(x±p)` (avec parenthèses) ou `coefx` (bare, p=0 implicite) —
 * la même grammaire que la partie "avant ^2" d'`analyserFormeCanoniqueComplete`, généralisée pour
 * être réutilisable comme argument d'un autre wrapper (sqrt/cbrt) plutôt que seulement avant "^2".
 *
 * Une division finale par une constante (ex. "x/3", "(x-2)/3") est traitée AVANT le reste de la
 * grammaire, en divisant le coefficient obtenu pour ce qui précède le "/" — une façon d'écrire un
 * coefficient fractionnaire tout aussi valide que "coef*(x±p)", mais qu'aucune des branches
 * ci-dessous ne reconnaît nativement (cas rapporté par Omar : EH=3, CH=1 donne un coefficient 1/3,
 * naturellement tapé "x/3" plutôt que "(1/3)x" — AUDIT-robustesse-verification-champs-libres.md,
 * bug 3). `[^/()]+$` exclut toute parenthèse du diviseur pour ne jamais capturer le "/" interne
 * d'une fraction déjà gérée ailleurs (ex. "2/3(x-1)", où le "/" appartient au coefficient AVANT
 * la parenthèse, pas à une division de l'expression entière — cette regex ne matche alors pas du
 * tout, la branche `matchParen` ci-dessous prend le relais comme avant ce correctif). */
function analyserCoefEtDecalage(texteBrut: string): { coef: number; p: number } | null {
  const texte = texteBrut.trim();

  const matchDivision = /^(.+)\/([^/()]+)$/.exec(texte);
  if (matchDivision) {
    const diviseur = parserNombreOuFraction(matchDivision[2]);
    if (diviseur === null || diviseur === 0) return null;
    const reste = analyserCoefEtDecalage(matchDivision[1]);
    if (!reste) return null;
    return { coef: reste.coef / diviseur, p: reste.p };
  }

  const matchParen = /^(.*)\(x([+-])([^()]+)\)$/.exec(texte);
  if (matchParen) {
    const pBrut = parserNombreOuFraction(matchParen[3]);
    if (pBrut === null) return null;
    const p = matchParen[2] === "-" ? pBrut : -pBrut;
    const coef = analyserCoefSeul(matchParen[1]);
    if (coef === null) return null;
    return { coef, p };
  }
  // "x±p" nu (sans parenthèses) : coefficient implicite 1 — cas courant quand ce texte est lui-même
  // l'argument d'un wrapper englobant (sqrt/cbrt), qui fournit déjà son propre groupement.
  const matchBare = /^x([+-])(.+)$/.exec(texte);
  if (matchBare) {
    const pBrut = parserNombreOuFraction(matchBare[2]);
    if (pBrut === null) return null;
    return { coef: 1, p: matchBare[1] === "-" ? pBrut : -pBrut };
  }
  if (texte.endsWith("x") && !texte.includes("(") && !texte.includes(")")) {
    const coef = analyserCoefSeul(texte.slice(0, -1));
    if (coef === null) return null;
    return { coef, p: 0 };
  }
  return null;
}

/** Index de la parenthèse fermante correspondant à la parenthèse ouvrante en `indexOuvrante` (en
 * comptant la profondeur) — jamais un simple `indexOf(")", ...)` naïf, qui trouverait la première
 * fermante rencontrée y compris celle d'un groupe imbriqué (ex. `sqrt(2/3(x+1))`, où la fermante de
 * `(x+1)` précède celle du `sqrt(` englobant). -1 si aucune fermante correspondante. */
function trouverFermanteCorrespondante(texte: string, indexOuvrante: number): number {
  let profondeur = 0;
  for (let i = indexOuvrante; i < texte.length; i++) {
    if (texte[i] === "(") profondeur++;
    else if (texte[i] === ")") {
      profondeur--;
      if (profondeur === 0) return i;
    }
  }
  return -1;
}

/** Ce qui suit un wrapper fermé : `""` (q=0) ou `±q`. */
function analyserResidu(apres: string): number | null {
  if (apres === "") return 0;
  const match = /^([+-])(.+)$/.exec(apres);
  if (!match) return null;
  const qBrut = parserNombreOuFraction(match[2]);
  if (qBrut === null) return null;
  return match[1] === "-" ? -qBrut : qBrut;
}

export type FamilleSimple = "carre" | "cube" | "valeur_absolue" | "inverse";
export type FamilleDouble = "racine_carree" | "racine_cubique";

export interface FonctionSimple {
  a: number;
  p: number;
  q: number;
}

/** `A(x±p)^2±q`, `A(x±p)^3±q`, `A|x±p|±q` (ou `A*abs(x±p)±q`), `A/(x±p)±q` — un seul coefficient
 * externe, jamais de coefficient séparé à l'intérieur du wrapper (voir le docstring en tête de
 * fichier : ces 4 familles se réduisent toujours à un coefficient combiné unique). */
export function analyserFormeSimple(texteBrut: string, famille: FamilleSimple): FonctionSimple | null {
  const texte = normaliserExposantsUnicode(texteBrut.replace(/\s+/g, ""));

  if (famille === "carre" || famille === "cube") {
    const exposant = famille === "carre" ? "^2" : "^3";
    const index = texte.indexOf(exposant);
    if (index === -1) return null;
    const resultat = analyserCoefEtDecalage(texte.slice(0, index));
    if (!resultat) return null;
    const q = analyserResidu(texte.slice(index + exposant.length));
    if (q === null) return null;
    return { a: resultat.coef, p: resultat.p, q };
  }

  if (famille === "valeur_absolue") {
    const matchBarres = /^(.*)\|x([+-])([^|]+)\|(.*)$/.exec(texte);
    if (matchBarres) {
      const coef = analyserCoefSeul(matchBarres[1]);
      const pBrut = parserNombreOuFraction(matchBarres[3]);
      const q = analyserResidu(matchBarres[4]);
      if (coef === null || pBrut === null || q === null) return null;
      return { a: coef, p: matchBarres[2] === "-" ? pBrut : -pBrut, q };
    }
    const indexOuvrante = texte.indexOf("abs(");
    if (indexOuvrante === -1) return null;
    const coef = analyserCoefSeul(texte.slice(0, indexOuvrante));
    const indexFermante = trouverFermanteCorrespondante(texte, indexOuvrante + 3);
    if (coef === null || indexFermante === -1) return null;
    const decalage = analyserDecalageSeul(texte.slice(indexOuvrante + 4, indexFermante));
    const q = analyserResidu(texte.slice(indexFermante + 1));
    if (decalage === null || q === null) return null;
    return { a: coef, p: decalage, q };
  }

  // inverse : A/(x±p)±q
  const indexOuvrante = texte.indexOf("/(");
  if (indexOuvrante === -1) return null;
  const coef = analyserCoefSeul(texte.slice(0, indexOuvrante));
  const indexFermante = trouverFermanteCorrespondante(texte, indexOuvrante + 1);
  if (coef === null || indexFermante === -1) return null;
  const decalage = analyserDecalageSeul(texte.slice(indexOuvrante + 2, indexFermante));
  const q = analyserResidu(texte.slice(indexFermante + 1));
  if (decalage === null || q === null) return null;
  return { a: coef, p: decalage, q };
}

function analyserDecalageSeul(texte: string): number | null {
  if (texte === "x") return 0;
  const match = /^x([+-])(.+)$/.exec(texte);
  if (!match) return null;
  const pBrut = parserNombreOuFraction(match[2]);
  if (pBrut === null) return null;
  return match[1] === "-" ? pBrut : -pBrut;
}

export interface FonctionDouble {
  outer: number;
  inner: number;
  p: number;
  q: number;
}

/** `outer*sqrt(inner*(x±p))±q` / `outer*cbrt(inner*(x±p))±q` — coefficient externe (avant le
 * wrapper) ET interne (dans l'argument du wrapper) séparés, voir le docstring en tête de fichier.
 * `inner`/`p` par défaut à `1`/`0` quand l'argument est juste `x` ou `x±p` (coefficient interne
 * implicite 1) — c'est ce qui permet à cette même fonction de servir aussi bien à l'étape 1
 * (coefficient externe = k, interne = 1 implicite) qu'aux étapes 2+ (externe = 1 implicite au
 * départ, interne = SOY·CH/EH). */
export function analyserFormeDouble(texteBrut: string, famille: FamilleDouble): FonctionDouble | null {
  const texte = texteBrut.replace(/\s+/g, "");
  const motif = famille === "racine_carree" ? "sqrt(" : "cbrt(";
  const indexOuvrante = texte.indexOf(motif);
  if (indexOuvrante === -1) return null;
  const outer = analyserCoefSeul(texte.slice(0, indexOuvrante));
  const indexFermante = trouverFermanteCorrespondante(texte, indexOuvrante + motif.length - 1);
  if (outer === null || indexFermante === -1) return null;
  const interieur = analyserCoefEtDecalage(texte.slice(indexOuvrante + motif.length, indexFermante));
  if (!interieur) return null;
  const q = analyserResidu(texte.slice(indexFermante + 1));
  if (q === null) return null;
  return { outer, inner: interieur.coef, p: interieur.p, q };
}

function estFamilleDouble(famille: FamilleReference): famille is FamilleDouble {
  return famille === "racine_carree" || famille === "racine_cubique";
}

function estFamilleSimple(famille: FamilleReference): famille is FamilleSimple {
  return !estFamilleDouble(famille);
}

function prochesFonctionSimple(a: FonctionSimple, b: FonctionSimple): boolean {
  return Math.abs(a.a - b.a) < TOLERANCE && Math.abs(a.p - b.p) < TOLERANCE && Math.abs(a.q - b.q) < TOLERANCE;
}

function prochesFonctionDouble(a: FonctionDouble, b: FonctionDouble): boolean {
  return (
    Math.abs(a.outer - b.outer) < TOLERANCE &&
    Math.abs(a.inner - b.inner) < TOLERANCE &&
    Math.abs(a.p - b.p) < TOLERANCE &&
    Math.abs(a.q - b.q) < TOLERANCE
  );
}

/**
 * Statut à 3 valeurs (convention CLAUDE.md) : `analyserFormeSimple`/`analyserFormeDouble`
 * calculent déjà en interne la distinction "structure non reconnue" (`null`) vs "reconnue avec ces
 * valeurs" — récupérée ici directement plutôt que recalculée (AUDIT-comparaison-reponses.md),
 * même principe que `diagnostiquerFormeCanoniqueComplete` (verificationFormeCanoniqueTransformations.ts,
 * neuvième exercice, dont ce module généralise l'analyseur à 6 familles).
 */
export function diagnostiquerFonctionFamille(
  famille: FamilleReference,
  texte: string,
  cible: FonctionSimple | FonctionDouble,
): StatutVerification {
  if (estFamilleDouble(famille)) {
    const parsee = analyserFormeDouble(texte, famille);
    if (parsee === null) return "parse_error";
    return prochesFonctionDouble(parsee, cible as FonctionDouble) ? "correct" : "not_equivalent";
  }
  const parsee = analyserFormeSimple(texte, famille);
  if (parsee === null) return "parse_error";
  return prochesFonctionSimple(parsee, cible as FonctionSimple) ? "correct" : "not_equivalent";
}

/** Vérifie un texte contre une cible, en dispatchant sur la nature (simple/double) de la famille —
 * réutilisée telle quelle par les étapes 2 à 5, chacune fournissant sa propre cible calculée par
 * `cible*`. */
export function verifierFonctionFamille(
  famille: FamilleReference,
  texte: string,
  cible: FonctionSimple | FonctionDouble,
): boolean {
  return diagnostiquerFonctionFamille(famille, texte, cible) === "correct";
}

// ---------------------------------------------------------------------------------------------
// Cibles par étape (calculées depuis les vraies valeurs de l'exercice, jamais depuis la saisie).
// ---------------------------------------------------------------------------------------------

/** Coefficient interne combiné SOY·(CH/EH), élevé à la puissance/l'effet propre à la famille (voir
 * le docstring en tête de fichier) — uniquement pour les 4 familles "simples". */
function coefficientInterneSimple(exercice: { famille: FamilleSimple; ch: number; eh: number; soy: boolean }): number {
  const rapport = exercice.ch / exercice.eh;
  const signeSoy = exercice.soy ? -1 : 1;
  switch (exercice.famille) {
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

function coefficientCompletSimple(exercice: ExerciceFormeCanoniqueFonctionReference & { famille: FamilleSimple }): number {
  const signeSox = exercice.sox ? -1 : 1;
  return signeSox * (exercice.ev / exercice.cv) * coefficientInterneSimple(exercice);
}

function coefficientInterneDouble(exercice: { ch: number; eh: number; soy: boolean }): number {
  return (exercice.soy ? -1 : 1) * (exercice.ch / exercice.eh);
}

function cibleFamille(
  exercice: ExerciceFormeCanoniqueFonctionReference,
  p: number,
  outerNeutre: boolean,
  q: number,
): FonctionSimple | FonctionDouble {
  if (estFamilleDouble(exercice.famille)) {
    const outer = outerNeutre ? 1 : (exercice.sox ? -1 : 1) * (exercice.ev / exercice.cv);
    return { outer, inner: coefficientInterneDouble(exercice), p, q };
  }
  const exerciceSimple = exercice as ExerciceFormeCanoniqueFonctionReference & { famille: FamilleSimple };
  const a = outerNeutre ? coefficientInterneSimple(exerciceSimple) : coefficientCompletSimple(exerciceSimple);
  return { a, p, q };
}

/** Étape 2 (EH, CH, SOY) : ni TH ni EV/CV/SOX/TV encore appliqués. Exportée (en plus d'être
 * utilisée par `verifierEhChSoy`) pour que les composants d'étape 3+ puissent légender la trace
 * confirmée de cette étape avec sa vraie expression. */
export function cibleEtape2(exercice: ExerciceFormeCanoniqueFonctionReference): FonctionSimple | FonctionDouble {
  return cibleFamille(exercice, 0, true, 0);
}

/** Étape 3 (TH) : EH/CH/SOY déjà confirmés, EV/CV/SOX/TV encore neutres. Exportée pour les mêmes
 * raisons que `cibleEtape2` (légende de la trace confirmée aux étapes 4+). */
export function cibleEtape3(exercice: ExerciceFormeCanoniqueFonctionReference): FonctionSimple | FonctionDouble {
  return cibleFamille(exercice, exercice.th, true, 0);
}

/** Étape 4 (EV, CV, SOX) : TV encore neutre (nul). Exportée pour la même raison (légende de la
 * trace confirmée à l'étape 5). */
export function cibleEtape4(exercice: ExerciceFormeCanoniqueFonctionReference): FonctionSimple | FonctionDouble {
  return cibleFamille(exercice, exercice.th, false, 0);
}

/** Étape 5 (TV) : fonction finale complète, identique à la cible affichée à l'étape 1. */
export function cibleFinale(exercice: ExerciceFormeCanoniqueFonctionReference): FonctionSimple | FonctionDouble {
  return cibleFamille(exercice, exercice.th, false, exercice.tv);
}

// ---------------------------------------------------------------------------------------------
// Étape 1 — Forme canonique : cible TOUJOURS égale à `cibleFinale` du même exercice — c'est la
// propriété de cohérence demandée par `prompt-bugpersistediagnosticapprofondi.md` : la fonction que
// l'élève retrouve à l'étape "Forme canonique" DOIT être exactement celle affichée en boîte
// persistante sur tous les écrans suivants, pas seulement un préfixe partiel.
//
// Diagnostic de la version précédente (`prompt-coherenceexerciceetcastrivial.md`) : elle
// n'accordait ce plein alignement qu'à `carre`/`inverse` (dont la technique — compléter le carré /
// diviser — recompose SOX·EV/CV et TV nativement, à l'intérieur même de l'algèbre) et limitait
// `cube`/`racine_carree`/`racine_cubique`/`valeur_absolue` à `cibleEtape3` (coefficient interne
// SOY·(CH/EH) + TH seulement, SOX/EV/CV/TV ignorés) — au motif erroné qu'combiner SOX·(EV/CV) avec
// SOY·(CH/EH) DANS le wrapper (cube/racine/valeur absolue) exigerait d'en extraire une racine
// n-ième, généralement irrationnelle. C'est vrai — mais SOX·(EV/CV) n'a JAMAIS besoin d'être
// combiné À L'INTÉRIEUR du wrapper : il multiplie le résultat du wrapper tout entier, de l'EXTÉRIEUR
// (`f(x) = SOX·(EV/CV)·g(...) + TV`) — un simple facteur multiplicatif et un terme additif, jamais
// une opération qui introduirait une racine. Rien n'empêche donc de les afficher EXPLICITEMENT,
// en clair, autour de la forme de départ non simplifiée elle-même
// (`K·wrapper(ax+b) + Q`, K = SOX·(EV/CV), Q = TV — voir `formatFormeDepartLatex`,
// `src/ui/formatFormeCanoniqueFonctionsReference.ts`) pour les 4 familles qui ne peuvent pas les
// recomposer nativement par leur seule technique de simplification : l'élève n'a alors plus qu'à
// factoriser l'ARGUMENT du wrapper (retrouver TH et confirmer le coefficient interne, un travail
// authentique) et à reporter K/Q tels quels dans sa réponse finale — jamais à les redériver depuis
// zéro, ce qui serait effectivement impossible sans irrationalité. `carre`/`inverse` restent
// inchangés (K/Q y émergent nativement de compléter-le-carré/diviser, aucun affichage explicite
// nécessaire).
// ---------------------------------------------------------------------------------------------

export function cibleEtape1(exercice: ExerciceFormeCanoniqueFonctionReference): FonctionSimple | FonctionDouble {
  const forme = exercice.formeDepart;
  const signeSox = exercice.sox ? -1 : 1;
  const K = signeSox * (exercice.ev / exercice.cv);
  const Q = exercice.tv;
  switch (forme.type) {
    case "carre": {
      const p = -forme.b / (2 * forme.a);
      const q = forme.c - forme.a * p * p;
      return { a: forme.a, p, q };
    }
    case "cube": {
      const p = -forme.a / forme.b;
      const interne = forme.b * forme.b * forme.b;
      return { a: K * interne, p, q: Q };
    }
    case "racine_carree": {
      const p = -forme.b / forme.a;
      return { outer: K, inner: forme.a, p, q: Q };
    }
    case "racine_cubique": {
      const p = -forme.b / forme.a;
      return { outer: K, inner: forme.a, p, q: Q };
    }
    case "inverse": {
      const p = -forme.d / forme.c;
      const quotient = forme.a / forme.c;
      const reste = (forme.b * forme.c - forme.a * forme.d) / (forme.c * forme.c);
      return { a: reste, p, q: quotient };
    }
    case "valeur_absolue": {
      const p = -forme.b / forme.a;
      const interne = Math.abs(forme.a);
      return { a: K * interne, p, q: Q };
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Fonctions de vérification par étape (Couche B les appelle directement).
// ---------------------------------------------------------------------------------------------

export function diagnostiquerCanoniqueFR(
  exercice: ExerciceFormeCanoniqueFonctionReference,
  reponse: ReponseCanoniqueFR,
): StatutVerification {
  return diagnostiquerFonctionFamille(exercice.famille, reponse.formeCanonique, cibleEtape1(exercice));
}

export function verifierCanoniqueFR(exercice: ExerciceFormeCanoniqueFonctionReference, reponse: ReponseCanoniqueFR): boolean {
  return diagnostiquerCanoniqueFR(exercice, reponse) === "correct";
}

export interface EvaluationEhChSoy {
  eh: boolean;
  ch: boolean;
  soy: boolean;
}

/** Seul le rapport CH/EH compte (comme EV/CV ailleurs dans le projet) — CH et EH sont donc toujours
 * évalués ENSEMBLE, jamais l'un correct et l'autre faux. */
export function evaluerEhChSoy(
  exercice: ExerciceFormeCanoniqueFonctionReference,
  reponse: { eh: number; ch: number; soy: boolean },
): EvaluationEhChSoy {
  const rapportAttendu = exercice.ch / exercice.eh;
  const rapportSaisi = reponse.ch / reponse.eh;
  const rapportCorrect = Math.abs(rapportSaisi - rapportAttendu) < TOLERANCE;
  return { eh: rapportCorrect, ch: rapportCorrect, soy: reponse.soy === exercice.soy };
}

export function diagnostiquerEhChSoy(exercice: ExerciceFormeCanoniqueFonctionReference, reponse: ReponseEhChSoy): StatutVerification {
  const statutForme = diagnostiquerFonctionFamille(exercice.famille, reponse.fonctionIntermediaire, cibleEtape2(exercice));
  if (statutForme === "parse_error") return "parse_error";
  const evaluation = evaluerEhChSoy(exercice, reponse);
  const correct = evaluation.eh && evaluation.ch && evaluation.soy && statutForme === "correct";
  return correct ? "correct" : "not_equivalent";
}

export function verifierEhChSoy(exercice: ExerciceFormeCanoniqueFonctionReference, reponse: ReponseEhChSoy): boolean {
  return diagnostiquerEhChSoy(exercice, reponse) === "correct";
}

export function diagnostiquerThFR(exercice: ExerciceFormeCanoniqueFonctionReference, reponse: ReponseThFR): StatutVerification {
  const statutForme = diagnostiquerFonctionFamille(exercice.famille, reponse.fonctionIntermediaire, cibleEtape3(exercice));
  if (statutForme === "parse_error") return "parse_error";
  const correct = reponse.th === exercice.th && statutForme === "correct";
  return correct ? "correct" : "not_equivalent";
}

export function verifierThFR(exercice: ExerciceFormeCanoniqueFonctionReference, reponse: ReponseThFR): boolean {
  return diagnostiquerThFR(exercice, reponse) === "correct";
}

export interface EvaluationEvCvSoxFR {
  ev: boolean;
  cv: boolean;
  sox: boolean;
}

export function evaluerEvCvSoxFR(
  exercice: ExerciceFormeCanoniqueFonctionReference,
  reponse: { ev: number; cv: number; sox: boolean },
): EvaluationEvCvSoxFR {
  const rapportAttendu = exercice.ev / exercice.cv;
  const rapportSaisi = reponse.ev / reponse.cv;
  const rapportCorrect = Math.abs(rapportSaisi - rapportAttendu) < TOLERANCE;
  return { ev: rapportCorrect, cv: rapportCorrect, sox: reponse.sox === exercice.sox };
}

export function diagnostiquerEvCvSoxFR(exercice: ExerciceFormeCanoniqueFonctionReference, reponse: ReponseEvCvSoxFR): StatutVerification {
  const statutForme = diagnostiquerFonctionFamille(exercice.famille, reponse.fonctionIntermediaire, cibleEtape4(exercice));
  if (statutForme === "parse_error") return "parse_error";
  const evaluation = evaluerEvCvSoxFR(exercice, reponse);
  const correct = evaluation.ev && evaluation.cv && evaluation.sox && statutForme === "correct";
  return correct ? "correct" : "not_equivalent";
}

export function verifierEvCvSoxFR(exercice: ExerciceFormeCanoniqueFonctionReference, reponse: ReponseEvCvSoxFR): boolean {
  return diagnostiquerEvCvSoxFR(exercice, reponse) === "correct";
}

export function diagnostiquerTvFR(exercice: ExerciceFormeCanoniqueFonctionReference, reponse: ReponseTvFR): StatutVerification {
  const statutForme = diagnostiquerFonctionFamille(exercice.famille, reponse.fonctionIntermediaire, cibleFinale(exercice));
  if (statutForme === "parse_error") return "parse_error";
  const correct = reponse.tv === exercice.tv && statutForme === "correct";
  return correct ? "correct" : "not_equivalent";
}

export function verifierTvFR(exercice: ExerciceFormeCanoniqueFonctionReference, reponse: ReponseTvFR): boolean {
  return diagnostiquerTvFR(exercice, reponse) === "correct";
}

export { estFamilleDouble, estFamilleSimple };
