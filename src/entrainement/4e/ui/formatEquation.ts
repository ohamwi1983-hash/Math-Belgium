import type { Enonce, Exercice, FormeAffichage } from "../core/generateur.types";

/**
 * Membre gauche ax²+bx+c en LaTeX (termes nuls omis) — réutilisé par formatInequation.ts. a=0
 * (chemin linéaire, prompt-4-chemin-lineaire.md) omet entièrement le terme en x² — jamais "0x²" —
 * plutôt que de le traiter comme un terme nul ordinaire, car b devient alors le premier terme et
 * doit porter son propre signe (comme termeA le fait normalement).
 */
export function formatMembreGauche({ a, b, c }: Enonce): string {
  if (a === 0) {
    const termeB = formatTerme(b, "x", true);
    const termeC = c !== 0 ? ` ${c > 0 ? "+" : "-"} ${Math.abs(c)}` : "";
    return `${termeB}${termeC}`;
  }
  const termeA = formatTerme(a, "x^2", true);
  const termeB = b !== 0 ? ` ${b > 0 ? "+" : "-"} ${formatTerme(Math.abs(b), "x", false)}` : "";
  const termeC = c !== 0 ? ` ${c > 0 ? "+" : "-"} ${Math.abs(c)}` : "";
  return `${termeA}${termeB}${termeC}`;
}

/** Formatage LaTeX de ax² + bx + c = 0, valable pour n'importe quelles valeurs de a,b,c. */
export function formatEnonceLatex(enonce: Enonce): string {
  return `${formatMembreGauche(enonce)} = 0`;
}

function formatTerme(valeur: number, variable: string, premier: boolean): string {
  const abs = Math.abs(valeur);
  const signe = premier && valeur < 0 ? "-" : "";
  return abs === 1 ? `${signe}${variable}` : `${signe}${abs}${variable}`;
}

interface TermeSigne {
  valeur: number;
  /** "x^2", "x", ou "" pour un terme constant */
  suffixe: string;
}

/**
 * Formate une somme de termes signés selon la même convention que formatEnonceLatex (premier
 * terme collé à son signe, suivants séparés par " + "/" - ") ; les termes nuls sont omis.
 * Utilisé pour composer les côtés gauche/droit des formes d'affichage réarrangées.
 *
 * `estSuite` (défaut `false`, comportement historique inchangé) : quand `true`, TOUS les termes
 * — y compris le premier non nul — sont traités comme des continuations d'une somme déjà
 * commencée (connecteur "+"/"-" explicite systématique, jamais le signe collé sans connecteur) —
 * utilisé pour distribuer un signe devant une expression déjà affichée ailleurs (ex. `f(x) = base
 * + k(x)`, "Caractéristiques algébriques d'une fonction de référence", niveau 2), jamais pour
 * composer une expression autonome (`estSuite=false`, l'usage historique de cette fonction).
 * Renvoie `""` (jamais `"0"`) si tous les termes sont nuls, pour ne jamais laisser un "+ 0" ou un
 * "0" isolé après une expression déjà affichée.
 */
export function formatSommeTermes(termes: TermeSigne[], estSuite = false): string {
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return estSuite ? "" : "0";

  const parties = nonNuls.map((terme, index) => {
    const abs = Math.abs(terme.valeur);
    const corps = terme.suffixe === "" ? `${abs}` : formatTerme(abs, terme.suffixe, false);
    if (index === 0 && !estSuite) return terme.valeur < 0 ? `-${corps}` : corps;
    return `${terme.valeur < 0 ? "-" : "+"} ${corps}`;
  });

  return parties.join(" ");
}

/** ax²+bx = -c */
function formatIsoleeConstante({ a, b, c }: Enonce): string {
  const gauche = formatSommeTermes([{ valeur: a, suffixe: "x^2" }, { valeur: b, suffixe: "x" }]);
  const droite = formatSommeTermes([{ valeur: -c, suffixe: "" }]);
  return `${gauche} = ${droite}`;
}

/** ax² = -bx-c */
function formatIsoleeCarre({ a, b, c }: Enonce): string {
  const gauche = formatSommeTermes([{ valeur: a, suffixe: "x^2" }]);
  const droite = formatSommeTermes([{ valeur: -b, suffixe: "x" }, { valeur: -c, suffixe: "" }]);
  return `${gauche} = ${droite}`;
}

/**
 * x(x+b) = -c — uniquement pertinent quand a=1 (appelant responsable de cette contrainte). b=0
 * (toujours le cas pour binome_conjugue) : "x(x)" n'est jamais un produit lisible, "x^2" seul.
 */
function formatProduitEgaleConstante({ b, c }: Enonce): string {
  const gauche = b === 0 ? "x^2" : `x(x ${b > 0 ? "+" : "-"} ${Math.abs(b)})`;
  const droite = formatSommeTermes([{ valeur: -c, suffixe: "" }]);
  return `${gauche} = ${droite}`;
}

function formatFacteurXPlusP(p: number): string {
  return p >= 0 ? `x + ${p}` : `x - ${Math.abs(p)}`;
}

/** (x+p)² = mx+mp — le membre de droite développé, (x+p) n'apparaît jamais explicitement à droite. */
function formatCarreEgaleExpression(p: number, m: number): string {
  const gauche = `(${formatFacteurXPlusP(p)})^2`;
  const droite = formatSommeTermes([{ valeur: m, suffixe: "x" }, { valeur: m * p, suffixe: "" }]);
  return `${gauche} = ${droite}`;
}

/**
 * (x+p)² + k(x+p) = 0, avec k = -m — le binôme reste groupé, visible des deux côtés. Le
 * coefficient ±1 devant le second facteur ne doit jamais s'afficher explicitement
 * (prompt-generateurs123groupe.md, point 2 : "-1(x-1)" doit s'afficher "-(x-1)", jamais moins
 * pertinent qu'omettre un "1x" — |k|=1 est atteignable ici car m est tiré non nul dans [-6,6]).
 */
function formatComposee(p: number, m: number): string {
  const facteur = formatFacteurXPlusP(p);
  const k = -m;
  const signe = k >= 0 ? "+" : "-";
  const magnitude = Math.abs(k) === 1 ? "" : String(Math.abs(k));
  return `(${facteur})^2 ${signe} ${magnitude}(${facteur}) = 0`;
}

function formatTermeRacine(coeffAbs: number, k: number): string {
  return coeffAbs === 1 ? `\\sqrt{${k}}` : `${coeffAbs}\\sqrt{${k}}`;
}

/**
 * Valeur exacte d'une racine irrationnelle (coefficient rationnel de √k, jamais la valeur
 * décimale approchée — prompt-generateurs123groupe.md, point 7). `coefficient` est l'une des
 * deux entrées de `VarianteIrrationnelle.racinesCoefficients` ; 0 rendu nu (racine rationnelle
 * pure, ex. mise_en_evidence dont une racine vaut toujours 0).
 */
export function formatRacineIrrationnelleLatex(coefficient: number, k: number): string {
  if (coefficient === 0) return "0";
  const signe = coefficient < 0 ? "-" : "";
  return `${signe}${formatTermeRacine(Math.abs(coefficient), k)}`;
}

/**
 * Forme exacte des zéros d'un exercice, jamais la valeur décimale approchée
 * (prompt-generateurs123groupe.md, point 7) — pour une variante irrationnelle, reconstruit chaque
 * zéro depuis `irrationnel.racinesCoefficients`/`k` (déjà exacts) plutôt que `solution.racines`
 * (les vraies valeurs flottantes, ex. "2.449489742783178" au lieu de "√6"). Utilisée par le
 * panneau de résultat (révélation "Solutions attendues" après échec) — vit ici plutôt que dans le
 * composant lui-même pour ne pas mélanger export de composant et export de fonction dans le même
 * fichier (règle react-refresh d'oxlint, only-export-components — même principe que
 * mafsGraphPartage.tsx/useLargeurConteneur.ts).
 *
 * Racine double (prompt-generateurs123vague2.md, générateur 1, point 4) : les deux valeurs
 * stockées sont identiques (une seule vraie solution, dupliquée pour remplir la paire fixe
 * `[number, number]`/`racinesCoefficients` du contrat) — n'affiche cette valeur qu'une seule
 * fois, jamais "-5 ; -5", tant côté rationnel qu'irrationnel.
 */
export function formatZerosAttendusLatex(exercice: Exercice): string {
  if (exercice.irrationnel) {
    const { racinesCoefficients, k } = exercice.irrationnel;
    const [c1, c2] = racinesCoefficients;
    if (c1 === c2) return formatRacineIrrationnelleLatex(c1, k);
    return racinesCoefficients.map((c) => formatRacineIrrationnelleLatex(c, k)).join("\\quad ; \\quad ");
  }
  const [r1, r2] = exercice.solution.racines;
  if (r1 === r2) return String(r1);
  return exercice.solution.racines.join("\\quad ; \\quad ");
}

/**
 * Version "bloc fitter" de `formatZerosAttendusLatex` (`promptblocfittertousgenerateurs.md`) — un
 * tableau d'1 ou 2 fragments (racine double : 1 seul fragment, comme la fonction d'origine) plutôt
 * qu'une chaîne `\quad ; \quad`-jointe, pour un retour à la ligne propre entre les 2 racines sur
 * mobile étroit — notamment pour une racine irrationnelle (`k\sqrt{n}`), potentiellement large.
 */
export function formatTermesZerosAttendusLatex(exercice: Exercice): string[] {
  if (exercice.irrationnel) {
    const { racinesCoefficients, k } = exercice.irrationnel;
    const [c1, c2] = racinesCoefficients;
    if (c1 === c2) return [formatRacineIrrationnelleLatex(c1, k)];
    return racinesCoefficients.map((c) => formatRacineIrrationnelleLatex(c, k));
  }
  const [r1, r2] = exercice.solution.racines;
  if (r1 === r2) return [String(r1)];
  return exercice.solution.racines.map(String);
}

/**
 * Vrai ssi l'exercice n'a qu'une seule solution distincte (racine double) — les deux valeurs
 * stockées dans le contrat sont alors identiques (voir formatZerosAttendusLatex ci-dessus).
 * Pilote le singulier/pluriel du libellé de révélation ("Solution attendue" vs "Solutions
 * attendues", prompt-generateurs123vague2.md, générateur 1, point 4).
 */
export function estSolutionUnique(exercice: Exercice): boolean {
  if (exercice.irrationnel) {
    const [c1, c2] = exercice.irrationnel.racinesCoefficients;
    return c1 === c2;
  }
  const [r1, r2] = exercice.solution.racines;
  return r1 === r2;
}

/**
 * x² + B√k·x + c = 0 : rendu canonique-radical d'une variante irrationnelle (voir
 * VarianteIrrationnelle). c est toujours rationnel exact (= Ck) ; seul b = B√k est irrationnel,
 * donc affiché symboliquement via B et k plutôt que la valeur décimale approchée de enonce.b.
 */
function formatEnonceIrrationnelle(c: number, B: number, k: number): string {
  const termeB = B !== 0 ? ` ${B > 0 ? "+" : "-"} ${formatTermeRacine(Math.abs(B), k)}x` : "";
  const termeC = c !== 0 ? ` ${c > 0 ? "+" : "-"} ${Math.abs(c)}` : "";
  return `x^2${termeB}${termeC} = 0`;
}

/** (x - r) ou (x + |r|) selon le signe de r — jamais appelé avec r=0 (voir formatFacteurSeul). */
export function formatFacteurRacine(r: number): string {
  return r > 0 ? `x - ${r}` : `x + ${Math.abs(r)}`;
}

/** (x - r) parenthésé, ou "x" nu si r=0 — jamais "(x - 0)" — pour composer un produit de facteurs. */
export function formatFacteurSeul(r: number): string {
  return r === 0 ? "x" : `(${formatFacteurRacine(r)})`;
}

/** Contenu négé de formatFacteurRacine (sans les parenthèses) : "r - x" ou "-x - |r|" — jamais appelé avec r=0. */
function formatFacteurRacineNegatif(r: number): string {
  return r > 0 ? `${r} - x` : `-x - ${Math.abs(r)}`;
}

/**
 * Forme factorisée générique a(x-r1)(x-r2), a(x-r)^2 (racine double) — dérivée directement de
 * enonce.a et des racines connues, toujours maximale (a est le facteur commun complet, les
 * binômes restent moniques), indépendante de la catégorie ou de solution.formeFactorisee (absente
 * pour cas_general — c'est précisément pourquoi cette fonction existe : reconstituer la forme de
 * référence pour la nouvelle étape "Factorisation" de cette catégorie, prompt-corrections-moteur-
 * partage.md point 3, et pour le bloc "état actuel", point 1). Racines triées par ordre
 * décroissant pour un rendu "(x - grand)(x + |petit|)" conforme à la convention déjà utilisée par
 * binome_conjugue/produit_remarquable — sauf si l'une des deux racines est 0, auquel cas le
 * facteur "x" nu passe en tête ("ax(x-r)", jamais "(x-r)x" ni "(x-0)"), conforme à la convention
 * déjà utilisée par mise_en_evidence.
 *
 * a=-1 avec une racine nulle : jamais "-x(...)" — voir moteur/simplificationEquation.ts (réplique
 * locale de cette fonction), même correctif, même raison (x caché derrière une négation externe,
 * rejeté par estUnProduitAvecXExplicite côté vérification) : "x(-x - r)" plutôt que "-x(x + r)".
 */
export function formatFormeFactoriseeDepuisRacines(enonce: Enonce, racines: [number, number]): string {
  const [r1, r2] = [...racines].sort((a, b) => b - a);
  const { a } = enonce;

  if (r1 === r2) {
    const prefixe = a === 1 ? "" : a === -1 ? "-" : String(a);
    return r1 === 0 ? `${prefixe}x^2` : `${prefixe}(${formatFacteurRacine(r1)})^2`;
  }
  const [premier, second] = r2 === 0 ? [r2, r1] : [r1, r2];
  if (a === -1 && premier === 0) {
    return `x(${formatFacteurRacineNegatif(second)})`;
  }
  const prefixe = a === 1 ? "" : a === -1 ? "-" : String(a);
  return `${prefixe}${formatFacteurSeul(premier)}${formatFacteurSeul(second)}`;
}

/**
 * Point d'entrée pour le rendu de l'énoncé selon la forme d'affichage tirée par le générateur
 * (indépendante de la catégorie). N'affecte que le texte montré : la vérification des réponses
 * reste toujours basée sur enonce/solution, jamais sur cette présentation.
 *
 * Variante irrationnelle : toujours rendue en forme canonique-radical (x²+B√kx+c=0), quelle que
 * soit formeAffichage — ces exercices sont toujours générés avec formeAffichage="canonique" et
 * ne passent jamais par isolée/produit=constante (voir necessiteIsolement dans le moteur).
 */
export function formatEnonceAffichage(
  enonce: Enonce,
  formeAffichage: FormeAffichage,
  parametresAffichage?: { p: number; m: number },
  irrationnel?: { B: number; k: number },
): string {
  if (irrationnel) {
    return formatEnonceIrrationnelle(enonce.c, irrationnel.B, irrationnel.k);
  }

  switch (formeAffichage) {
    case "canonique":
      return formatEnonceLatex(enonce);
    case "isolee_constante":
      return formatIsoleeConstante(enonce);
    case "isolee_carre":
      return formatIsoleeCarre(enonce);
    case "produit_egale_constante":
      return formatProduitEgaleConstante(enonce);
    case "carre_egale_expression":
    case "composee":
      if (!parametresAffichage) {
        throw new Error(`formatEnonceAffichage: parametresAffichage requis pour "${formeAffichage}"`);
      }
      return formeAffichage === "carre_egale_expression"
        ? formatCarreEgaleExpression(parametresAffichage.p, parametresAffichage.m)
        : formatComposee(parametresAffichage.p, parametresAffichage.m);
  }
}

/**
 * Équation isolée "non développée" — prompt-generateurs123vague2.md, générateur 1, point 1 :
 * l'isolement ne fait que regrouper les termes du côté droit sur le côté gauche, SANS développer
 * un carré ou un produit déjà présent dans la forme de surface — ex. "(x-5)² = -2x+10" devient
 * "(x-5)² + 2x - 10 = 0", jamais "x²-8x+15=0". Indépendante de la catégorie (`cas_general` et
 * `produit_remarquable`, qui ont besoin de la forme pleinement développée pour respectivement
 * calculer Δ et reconnaître un carré parfait, passent désormais par une étape "développer" dédiée
 * — voir moteur/session.ts::necessiteDeveloppement — plutôt que par un court-circuit ici). Utilisée
 * pour les deux encadrés qui doivent rester synchronisés sur cet écran ("Équation isolée" et "État
 * actuel").
 *
 * Seules deux formes d'affichage ont réellement une structure à préserver
 * (`produit_egale_constante` : x(x+b) ; `carre_egale_expression` : (x+p)², famille 5 uniquement) :
 * `isolee_constante`/`isolee_carre` n'ont jamais de carré/produit non développé dans leur membre
 * gauche (déjà `ax²+bx` ou `ax²` bruts), donc regrouper sans développer y produit exactement la
 * même chaîne que la forme canonique — aucune branche spéciale nécessaire pour ces deux-là.
 * `composee` n'atteint jamais l'isolement (déjà "= 0", voir necessiteIsolement) ; `canonique` non
 * plus (déjà la forme cible).
 */
/** Concatène "base" et "suite" (déjà signée, ex. "+ 5"/"- 3") avec un seul espace, ou "base" seul si suite est vide (terme nul). */
function avecSuite(base: string, suite: string): string {
  return suite === "" ? base : `${base} ${suite}`;
}

export function formatEquationIsoleeNonDeveloppee(exercice: Exercice): string {
  const { enonce, formeAffichage, parametresAffichage } = exercice;
  switch (formeAffichage) {
    case "canonique":
    case "isolee_constante":
    case "isolee_carre":
      return formatEnonceLatex(enonce);
    case "produit_egale_constante": {
      const { b, c } = enonce;
      const gauche = b === 0 ? "x^2" : `x(x ${b > 0 ? "+" : "-"} ${Math.abs(b)})`;
      const termeC = formatSommeTermes([{ valeur: c, suffixe: "" }], true);
      return `${avecSuite(gauche, termeC)} = 0`;
    }
    case "carre_egale_expression": {
      if (!parametresAffichage) {
        throw new Error('formatEquationIsoleeNonDeveloppee: parametresAffichage requis pour "carre_egale_expression"');
      }
      const { p, m } = parametresAffichage;
      const termes = formatSommeTermes([{ valeur: -m, suffixe: "x" }, { valeur: -m * p, suffixe: "" }], true);
      return `${avecSuite(`(${formatFacteurXPlusP(p)})^2`, termes)} = 0`;
    }
    case "composee":
      throw new Error('formatEquationIsoleeNonDeveloppee: jamais appelée pour "composee" (déjà "= 0", isolement sauté)');
  }
}
