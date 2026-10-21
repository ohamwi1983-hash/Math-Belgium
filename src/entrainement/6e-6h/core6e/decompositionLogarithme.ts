/**
 * Couche core (6e) — moteur de décomposition PARTAGÉ pour `6gen13` ("Propriétés du logarithme",
 * refonte totale : 5 caractéristiques — produit, quotient, puissance, racine, changement de base —
 * combinées de 1 à 4 à la fois, décomposées couche par couche, un écran par caractéristique).
 *
 * PARTAGÉ entre `moteur6e/verificationProprietesLogarithme.ts` (fonctions de référence numériques
 * par étape) et `ui6e/formatProprietesLogarithme.ts` (rendu LaTeX par étape) — contrairement à la
 * petite duplication habituelle (CLAUDE.md, "pas de moteur de session unifié") assumée ailleurs sur
 * la plateforme pour une formule triviale à 1 ligne : ici l'algorithme de pelage couche par couche
 * fait plusieurs dizaines de lignes et doit rester identique des deux côtés (une divergence entre
 * la référence de vérification et l'affichage casserait la correction elle-même) — dupliquer serait
 * une source de bug, pas un confort.
 *
 * ## Principe de construction/décomposition
 *
 * Une expression composée est un ARBRE (`Noeud`) construit de l'INTÉRIEUR vers l'EXTÉRIEUR à partir
 * d'un ordre aléatoire des caractéristiques d'ARGUMENT (produit/quotient/puissance/racine — le
 * changement de base n'en fait jamais partie, voir plus bas) : `produit`/`quotient` sont BINAIRES et
 * introduisent une NOUVELLE variable (N puis P, dans cet ordre, au plus une fois chacune) ; `puissance`/
 * `racine` sont UNAIRES et enveloppent simplement le nœud courant. Jamais de branchement (le membre
 * droit d'un produit/quotient est TOUJOURS une variable seule, jamais une sous-expression) — ça
 * garantit qu'à tout moment il n'existe qu'UN SEUL "reste" à décomposer, jamais deux fronts
 * parallèles, condition nécessaire pour qu'"une étape = une caractéristique" ait un sens.
 *
 * La décomposition (vue élève) va dans le sens INVERSE de la construction : on pèle la couche la
 * plus EXTÉRIEURE en premier. Peler un produit/quotient extrait IMMÉDIATEMENT son terme de droite
 * (toujours une variable seule → directement résolu en m/n/q, jamais besoin d'une étape de plus) et
 * laisse le membre gauche comme nouveau "reste" ; peler une puissance/racine met à jour un
 * COEFFICIENT courant (fraction exacte, jamais un décimal arrondi) et laisse l'intérieur comme
 * nouveau "reste". Tant que le "reste" n'est pas encore une variable seule, sa valeur logarithmique
 * est représentée par la variable libre générique "r" (jamais encore substituable en m/n/q) — même
 * principe de vérification par échantillonnage à variables libres déjà établi par
 * `verificationProprietesLogarithme.ts` pour m/n, simplement étendu à m/n/q/r/c (c = log_b(a) pour
 * le changement de base, voir plus bas).
 *
 * Le changement de base, quand il fait partie de la combinaison, est TOUJOURS la DERNIÈRE étape
 * algébrique (juste avant l'écran numérique final) — jamais une couche de l'arbre : une fois
 * l'argument totalement décomposé (reste = null), le résultat V (déjà en m/n/q, plus aucun "r")
 * représente log_a(expression d'origine) ; la formule log_b(X) = log_a(X)·log_b(a) donne alors
 * directement log_b(expression d'origine) = V·c, où c = log_b(a) est une constante DONNÉE (comme m
 * et n, jamais résolue davantage — même convention que la base a elle-même, jamais numériquement
 * calculée).
 */

export type Caracteristique = "produit" | "quotient" | "puissance" | "racine" | "changementBase";

/** Les 4 caractéristiques qui transforment l'ARGUMENT du logarithme (jamais la base) — tout
 * `Caracteristique` sauf `changementBase`. */
export type CaracteristiqueArgument = Exclude<Caracteristique, "changementBase">;

export const CARACTERISTIQUES_ARGUMENT: readonly CaracteristiqueArgument[] = ["produit", "quotient", "puissance", "racine"];
export const TOUTES_CARACTERISTIQUES: readonly Caracteristique[] = [...CARACTERISTIQUES_ARGUMENT, "changementBase"];

/** Exposant/indice de racine — toujours dans {2,3,4} (convention héritée de la version précédente). */
export type ExposantLog = 2 | 3 | 4;

export type NomVariable = "M" | "N" | "P";
/** Nom de la valeur logarithmique CONNUE associée à une variable d'argument — `m`=log_a(M),
 * `n`=log_a(N), `q`=log_a(P). Jamais confondu avec `p` (exposant de puissance) ni `k` (indice de
 * racine), qui ne sont JAMAIS des valeurs logarithmiques. */
export type NomValeurConnue = "m" | "n" | "q";

function valeurConnueDeVariable(nom: NomVariable): NomValeurConnue {
  return nom === "M" ? "m" : nom === "N" ? "n" : "q";
}

export type Noeud =
  | { kind: "var"; nom: NomVariable }
  | { kind: "produit"; gauche: Noeud; droite: Noeud }
  | { kind: "quotient"; gauche: Noeud; droite: Noeud }
  | { kind: "puissance"; interieur: Noeud; p: ExposantLog }
  | { kind: "racine"; interieur: Noeud; k: ExposantLog };

/** Fraction EXACTE (jamais un décimal arrondi) — les coefficients accumulés en chaîne (ex.
 * puissance 3 puis racine 2 → 3/2) doivent s'afficher proprement (`\dfrac{3}{2}`), jamais comme un
 * décimal potentiellement non exact (ex. puissance 2 puis racine 3 → 2/3, périodique). */
export interface Fraction {
  num: number;
  den: number;
}

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

function simplifier(f: Fraction): Fraction {
  const diviseur = pgcd(Math.abs(f.num), Math.abs(f.den)) || 1;
  const signe = f.den < 0 ? -1 : 1;
  return { num: (signe * f.num) / diviseur, den: (signe * f.den) / diviseur };
}

export const UNITE: Fraction = { num: 1, den: 1 };

export function multiplierFraction(f: Fraction, n: number): Fraction {
  return simplifier({ num: f.num * n, den: f.den });
}

export function diviserFraction(f: Fraction, n: number): Fraction {
  return simplifier({ num: f.num, den: f.den * n });
}

export function valeurFraction(f: Fraction): number {
  return f.num / f.den;
}

export interface TermeResolu {
  nom: NomValeurConnue;
  coefficient: Fraction;
}

/** État de la décomposition à un instant donné : les termes déjà complètement extraits (en m/n/q,
 * signe et coefficient inclus), et ce qu'il reste à décomposer (`null` une fois tout résolu). */
export interface EtatDecomposition {
  termes: TermeResolu[];
  reste: Noeud | null;
  coefficientReste: Fraction;
}

/** Si `reste` est déjà une variable seule, l'extrait IMMÉDIATEMENT comme terme résolu — ça ne
 * compte JAMAIS comme une étape séparée, c'est la fin naturelle du pelage précédent (ou l'état
 * initial, pour un arbre réduit à une seule variable — cas des combinaisons sans aucune
 * caractéristique d'argument, ex. "changement de base" seul). */
function finaliserSiVariableSeule(etat: EtatDecomposition): EtatDecomposition {
  if (etat.reste && etat.reste.kind === "var") {
    const termes = [...etat.termes, { nom: valeurConnueDeVariable(etat.reste.nom), coefficient: etat.coefficientReste }];
    return { termes, reste: null, coefficientReste: UNITE };
  }
  return etat;
}

export function etatInitial(arbre: Noeud): EtatDecomposition {
  return finaliserSiVariableSeule({ termes: [], reste: arbre, coefficientReste: UNITE });
}

/** Pèle la couche la plus extérieure de `etat.reste` — une seule caractéristique d'argument par
 * appel. Lève si `reste` est `null` (plus rien à peler, voir `calculerEtatsArgument`). */
export function peler(etat: EtatDecomposition): EtatDecomposition {
  const noeud = etat.reste;
  if (!noeud) throw new Error("peler : rien à décomposer (reste déjà résolu)");
  if (noeud.kind === "var") throw new Error("peler : noeud déjà terminal (devrait avoir été finalisé)");

  if (noeud.kind === "puissance") {
    return finaliserSiVariableSeule({ termes: etat.termes, reste: noeud.interieur, coefficientReste: multiplierFraction(etat.coefficientReste, noeud.p) });
  }
  if (noeud.kind === "racine") {
    return finaliserSiVariableSeule({ termes: etat.termes, reste: noeud.interieur, coefficientReste: diviserFraction(etat.coefficientReste, noeud.k) });
  }
  // produit / quotient : le membre droit est TOUJOURS une variable seule (par construction), donc
  // toujours immédiatement résolu — jamais besoin de `finaliserSiVariableSeule` sur LUI, seulement
  // sur le nouveau `reste` (le membre gauche, qui peut encore être composé).
  const droite = noeud.droite as Extract<Noeud, { kind: "var" }>;
  const signe = noeud.kind === "produit" ? 1 : -1;
  const termes: TermeResolu[] = [...etat.termes, { nom: valeurConnueDeVariable(droite.nom), coefficient: multiplierFraction(etat.coefficientReste, signe) }];
  return finaliserSiVariableSeule({ termes, reste: noeud.gauche, coefficientReste: etat.coefficientReste });
}

/** Toute la séquence d'états de la décomposition de l'ARGUMENT, de l'état initial (après
 * finalisation immédiate si l'arbre est déjà réduit à une variable) jusqu'à l'état final
 * (`reste === null`) — longueur = 1 + (nombre de caractéristiques d'argument dans la combinaison). */
export function calculerEtatsArgument(arbre: Noeud): EtatDecomposition[] {
  const etats: EtatDecomposition[] = [etatInitial(arbre)];
  while (etats[etats.length - 1].reste !== null) {
    etats.push(peler(etats[etats.length - 1]));
  }
  return etats;
}

// ---------------------------------------------------------------------------------------------
// Rendu LaTeX
// ---------------------------------------------------------------------------------------------

function arbreVersLatexInterieur(noeud: Noeud): string {
  switch (noeud.kind) {
    case "var":
      return noeud.nom;
    case "produit":
      return `${arbreVersLatexInterieur(noeud.gauche)}\\cdot ${arbreVersLatexInterieur(noeud.droite)}`;
    case "quotient":
      return `\\dfrac{${arbreVersLatexInterieur(noeud.gauche)}}{${arbreVersLatexInterieur(noeud.droite)}}`;
    case "puissance": {
      const interieur = arbreVersLatexInterieur(noeud.interieur);
      const base = noeud.interieur.kind === "var" ? interieur : `\\left(${interieur}\\right)`;
      return `${base}^{${noeud.p}}`;
    }
    case "racine":
      return `\\sqrt[${noeud.k}]{${arbreVersLatexInterieur(noeud.interieur)}}`;
  }
}

/** `\log_a(...)` de l'arbre ENTIER, en notation M/N/P (jamais encore substituée) — l'expression
 * "demandée", affichée une fois en haut de l'exercice, inchangée durant toute sa résolution. */
export function arbreVersLatexLogA(noeud: Noeud): string {
  return `\\log_a\\!\\left(${arbreVersLatexInterieur(noeud)}\\right)`;
}

function formatFractionLatex(f: Fraction): string {
  return f.den === 1 ? `${f.num}` : `\\dfrac{${f.num}}{${f.den}}`;
}

/** Un terme "±coefficient·nom" — gère le cas coefficient=±1 (jamais "1\\cdot m", juste "m"). */
function formatTermeLatex(coefficient: Fraction, nom: string): { signe: "+" | "-"; corps: string } {
  const signe: "+" | "-" = coefficient.num < 0 ? "-" : "+";
  const abs: Fraction = { num: Math.abs(coefficient.num), den: coefficient.den };
  const corps = abs.num === 1 && abs.den === 1 ? nom : `${formatFractionLatex(abs)}\\cdot ${nom}`;
  return { signe, corps };
}

/** Assemble une liste de termes signés en expression LaTeX (jamais de "+" en tête). Lève si la
 * liste est vide (ne devrait jamais arriver : un état a toujours au moins un terme OU un reste). */
function joindreTermes(parties: { signe: "+" | "-"; corps: string }[]): string {
  if (parties.length === 0) return "0";
  return parties.map((p, i) => (i === 0 ? (p.signe === "-" ? `-${p.corps}` : p.corps) : ` ${p.signe} ${p.corps}`)).join("");
}

/** État de décomposition → LaTeX, en notation m/n/q (termes résolus) + éventuellement "r" (reste
 * encore à décomposer, voir l'en-tête de fichier). C'est la forme que l'ÉLÈVE doit saisir : jamais
 * `\log_a(...)` pour une partie déjà résolue (dès qu'un terme est extrait, il passe en m/n/q). */
export function etatVersLatex(etat: EtatDecomposition): string {
  const parties = etat.termes.map((t) => formatTermeLatex(t.coefficient, t.nom));
  if (etat.reste) {
    parties.push(formatTermeLatex(etat.coefficientReste, "r"));
  }
  return joindreTermes(parties);
}

/** Variante "texte élève" (mêmes règles que `etatVersLatex` mais en texte brut `*`/`/`, la syntaxe
 * attendue par l'évaluateur `evaluerExpressionExponentielle`) — sert aux réponses de référence
 * affichées (récapitulatif) et aux textes d'aide, jamais à la vérification elle-même (qui compare
 * numériquement, voir `moteur6e/verificationProprietesLogarithme.ts`). */
export function etatVersTexte(etat: EtatDecomposition): string {
  function formatFractionTexte(f: Fraction): string {
    return f.den === 1 ? `${f.num}` : `(${f.num}/${f.den})`;
  }
  function formatTermeTexte(coefficient: Fraction, nom: string): { signe: "+" | "-"; corps: string } {
    const signe: "+" | "-" = coefficient.num < 0 ? "-" : "+";
    const abs: Fraction = { num: Math.abs(coefficient.num), den: coefficient.den };
    const corps = abs.num === 1 && abs.den === 1 ? nom : `${formatFractionTexte(abs)}*${nom}`;
    return { signe, corps };
  }
  const parties = etat.termes.map((t) => formatTermeTexte(t.coefficient, t.nom));
  if (etat.reste) parties.push(formatTermeTexte(etat.coefficientReste, "r"));
  if (parties.length === 0) return "0";
  return parties.map((p, i) => (i === 0 ? (p.signe === "-" ? `-${p.corps}` : p.corps) : ` ${p.signe} ${p.corps}`)).join("");
}

/** Comme `etatVersLatex`, mais le "reste" encore à décomposer (s'il existe) est rendu en toutes
 * lettres `\log_a(...)` plutôt qu'en "r" — jamais pour la saisie élève (le parser ne comprend pas
 * `\log_a`), uniquement pour la LECTURE humaine d'une aide ou d'un rappel (ex. aide niveau 2 d'un
 * écran algébrique : "une seule propriété appliquée, le reste encore sous forme log"). */
export function etatVersLatexAvecLogPendant(etat: EtatDecomposition): string {
  const parties = etat.termes.map((t) => formatTermeLatex(t.coefficient, t.nom));
  if (etat.reste) {
    parties.push(formatTermeLatex(etat.coefficientReste, arbreVersLatexLogA(etat.reste)));
  }
  return joindreTermes(parties);
}

/** `\log_a(...)` du "reste" encore à décomposer à une étape donnée, en notation M/N/P — c'est
 * l'expression que l'élève doit transformer à CETTE étape précise (distincte de l'expression
 * d'origine affichée en haut, qui elle ne change jamais). `null` si `reste` est déjà `null` (plus
 * rien à décomposer). */
export function resteVersLatexLogA(etat: EtatDecomposition): string | null {
  return etat.reste ? arbreVersLatexLogA(etat.reste) : null;
}

// ---------------------------------------------------------------------------------------------
// Référence numérique (échantillonnage à variables libres m/n/q/r/c — voir
// `moteur6e/verificationProprietesLogarithme.ts` pour l'échantillonnage lui-même)
// ---------------------------------------------------------------------------------------------

export interface VariablesLibres {
  m: number;
  n?: number;
  q?: number;
  r?: number;
  c?: number;
}

/** Évalue un état de décomposition à des valeurs données des variables libres — sert à construire la
 * fonction de référence `(vars) => number` comparée au texte élève (voir
 * `moteur6e/verificationProprietesLogarithme.ts`) : l'exercice étant purement symbolique, `m`/`n`/`q`/
 * `r`/`c` n'ont JAMAIS de "vraie" valeur connue, seulement des points d'échantillonnage fixes. */
export function etatVersValeur(etat: EtatDecomposition, vars: VariablesLibres): number {
  let total = 0;
  for (const t of etat.termes) {
    const v = t.nom === "m" ? vars.m : t.nom === "n" ? (vars.n as number) : (vars.q as number);
    total += valeurFraction(t.coefficient) * v;
  }
  if (etat.reste) {
    total += valeurFraction(etat.coefficientReste) * (vars.r as number);
  }
  return total;
}
