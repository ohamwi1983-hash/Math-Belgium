import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { ExerciceTransformationDonnees, IndicateursSerie } from "../core/transformationDonnees.types";
import { contexteParId, nombreTexteFr, type ContexteTransformation } from "../moteur/contextesTransformationDonnees";

/**
 * Textes de gen108 (écran ET papier : une seule source). Formules toujours en LaTeX, jamais au
 * clavier ; virgule décimale ; signe moins typographique ; unités du contexte partout (variance :
 * unité au carré, comme dans le cours). Notations : x pour la série de départ, y = a·x + b pour la
 * nouvelle série (x̄ → ȳ, σ_x → σ_y, V_x → V_y).
 */

export const NOMBRE_ECRANS = 4;
export const TITRES_ECRANS = ["La transformation", "Moyenne et médiane", "Étendue, variance et écart-type", "La conclusion"];

export const CONSIGNE_GENERALE =
  "Les indicateurs de la série de départ sont déjà calculés. Sans recalculer les valeurs une à une, détermine ceux de la nouvelle série grâce à la transformation subie par chaque valeur. Donne des valeurs exactes : aucun arrondi n'est nécessaire.";

export function contexte(e: ExerciceTransformationDonnees): ContexteTransformation {
  return contexteParId(e.contexte);
}

// ---------------------------------------------------------------------------------------------
// Nombres
// ---------------------------------------------------------------------------------------------

/** Nombre pour KaTeX : virgule `{,}`, espace fine des milliers (à partir de 10 000), « − ». */
export function nombreLatex(valeur: number): string {
  return nombreTexteFr(valeur).replace(",", "{,}").replace(/ /g, "\\,").replace("−", "-");
}

/** Facteur dans un produit : parenthèses autour d'un négatif. */
function facteur(n: number): string {
  return n < 0 ? `(${nombreLatex(n)})` : nombreLatex(n);
}

export function uniteVariance(unite: string): string {
  return `${unite}²`;
}

/** « 2 505 € », « 13,1 points », « 48 400 €² ». */
export function valeurAvecUnite(valeur: number, unite: string): string {
  return `${nombreTexteFr(valeur)} ${unite}`;
}

// ---------------------------------------------------------------------------------------------
// Énoncé : récit, transformation, tableau des indicateurs
// ---------------------------------------------------------------------------------------------

export function populationTexte(e: ExerciceTransformationDonnees): string {
  return contexte(e).population(e.n);
}

export function transformationTexte(e: ExerciceTransformationDonnees): string {
  return contexte(e).transformation(e);
}

export interface LigneIndicateur {
  libelle: FragmentConsigne[];
  /** Libellé en texte brut (tableau HTML du papier). */
  libelleTexte: string;
  valeur: string;
}

export function lignesIndicateurs(e: ExerciceTransformationDonnees): LigneIndicateur[] {
  const c = contexte(e);
  const x = e.depart;
  return [
    { libelle: [texte("Moyenne "), latex("\\bar{x}")], libelleTexte: "Moyenne x̄", valeur: valeurAvecUnite(x.moyenne, c.uniteX) },
    { libelle: [texte("Médiane")], libelleTexte: "Médiane", valeur: valeurAvecUnite(x.mediane, c.uniteX) },
    { libelle: [texte("Étendue")], libelleTexte: "Étendue", valeur: valeurAvecUnite(x.etendue, c.uniteX) },
    { libelle: [texte("Variance "), latex("V_x")], libelleTexte: "Variance Vₓ", valeur: valeurAvecUnite(x.variance, uniteVariance(c.uniteX)) },
    { libelle: [texte("Écart-type "), latex("\\sigma_x")], libelleTexte: "Écart-type σₓ", valeur: valeurAvecUnite(x.ecartType, c.uniteX) },
  ];
}

const TD = 'style="border:1px solid #b9bec7;padding:3px 10px;text-align:left"';
const TH = 'style="border:1px solid #b9bec7;padding:3px 10px;text-align:left;font-weight:600"';

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Tableau HTML des indicateurs de départ (papier). */
export function tableauIndicateursHtml(e: ExerciceTransformationDonnees): string {
  const corps = lignesIndicateurs(e)
    .map((l) => `<tr><th ${TH}>${echapper(l.libelleTexte)}</th><td ${TD}>${echapper(l.valeur)}</td></tr>`)
    .join("");
  return `<table style="border-collapse:collapse;margin:6px 0"><caption style="caption-side:top;text-align:left;font-weight:bold;padding-bottom:3px;">Série de départ</caption>${corps}</table>`;
}

// ---------------------------------------------------------------------------------------------
// y = a·x + b
// ---------------------------------------------------------------------------------------------

/** a·x + b réduit, en LaTeX (« 1{,}8\,x + 32 », « x - 1{,}5 », « -x + 20 », « 60\,x »). */
export function affineLatex(a: number, b: number, variable = "x"): string {
  const terme = a === 1 ? variable : a === -1 ? `-${variable}` : `${nombreLatex(a)}\\,${variable}`;
  if (b === 0) return terme;
  return `${terme} ${b > 0 ? "+" : "-"} ${nombreLatex(Math.abs(b))}`;
}

export function equationLatex(e: ExerciceTransformationDonnees): string {
  return `y = ${affineLatex(e.a, e.b)}`;
}

/** Image d'un indicateur de position par y = a·x + b, non calculée : « 1{,}8 \times 11{,}2 + 32 ». */
export function imageNonCalculee(e: ExerciceTransformationDonnees, x: number): string {
  if (e.a === 1) return `${nombreLatex(x)} ${e.b >= 0 ? "+" : "-"} ${nombreLatex(Math.abs(e.b))}`;
  if (e.a === -1) return `${nombreLatex(e.b)} - ${nombreLatex(x)}`;
  const produit = `${facteur(e.a)} \\times ${nombreLatex(x)}`;
  if (e.b === 0) return produit;
  return `${produit} ${e.b > 0 ? "+" : "-"} ${nombreLatex(Math.abs(e.b))}`;
}

export function aCarre(e: ExerciceTransformationDonnees): number {
  return Math.round(e.a * e.a * 1e9) / 1e9;
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

/** Message court en mini-syntaxe : texte, formules entre « $ » (rendues en KaTeX). */
export function messageFragments(message: string): FragmentConsigne[] {
  return message
    .split("$")
    .map((morceau, i) => (i % 2 === 1 ? latex(morceau) : texte(morceau)))
    .filter((f) => f.valeur !== "");
}

export interface PiegeChamp {
  valeur: number;
  message: string;
}

export interface Champ {
  id: string;
  libelle: FragmentConsigne[];
  /** Unité affichée après le champ (vide pour a et b). */
  unite: string;
  cible: number;
  pieges: PiegeChamp[];
  /** Message quand la valeur est fausse sans correspondre à un piège connu. */
  messageSiFaux?: string;
}

export type Ecran =
  | { type: "choix"; titre: string; consigne: FragmentConsigne[]; options: FragmentConsigne[][]; bonne: number; aides: FragmentConsigne[][]; messageFaux: string }
  | { type: "champs"; titre: string; consigne: FragmentConsigne[]; champs: Champ[]; aides: FragmentConsigne[][]; reponse: FragmentConsigne[] };

/** Pièges sans doublon, jamais égaux à la cible. */
function pieges(cible: number, liste: (PiegeChamp | false)[]): PiegeChamp[] {
  const vus: number[] = [];
  const resultat: PiegeChamp[] = [];
  for (const p of liste) {
    if (!p || !Number.isFinite(p.valeur)) continue;
    const v = Math.round(p.valeur * 1e9) / 1e9;
    if (Math.abs(v - cible) < 1e-9 || vus.some((w) => Math.abs(w - v) < 1e-9)) continue;
    vus.push(v);
    resultat.push({ valeur: v, message: p.message });
  }
  return resultat;
}

const r9 = (x: number) => Math.round(x * 1e9) / 1e9;

// ----------------------------------------------------------------------------------- Écran 1

function aidesTransformation(e: ExerciceTransformationDonnees): FragmentConsigne[][] {
  const premiere = [texte("Repère ce qui MULTIPLIE chaque valeur (c'est "), latex("a"), texte(") et ce qui lui est AJOUTÉ à la fin (c'est "), latex("b"), texte(", négatif si on retire) : "), latex("y = a\\,x + b")];
  switch (e.forme) {
    case "constante":
      return [premiere, [texte("Ici, chaque valeur est gardée telle quelle (multipliée par 1), puis on lui ajoute ou on lui retire un même nombre.")]];
    case "pourcentage":
      return [premiere, [texte(`Une ${e.pourcentage! > 0 ? "hausse" : "baisse"} de `), latex("t"), texte(" % multiplie chaque valeur par : "), latex(e.pourcentage! > 0 ? "1 + \\dfrac{t}{100}" : "1 - \\dfrac{t}{100}")]];
    case "facteur":
      return [premiere, [texte("Cherche ce que devient une valeur 0, puis une valeur 1 : "), latex("x = 0 \\;\\Rightarrow\\; y = b"), texte(" ; "), latex("x = 1 \\;\\Rightarrow\\; y = a + b")]];
    case "direct":
      return [
        premiere,
        e.pourcentage !== null
          ? [texte("La hausse en pourcentage donne le nombre qui multiplie ; la prime ajoutée ensuite donne "), latex("b"), texte(". Une hausse de "), latex("t"), texte(" % multiplie par : "), latex("1 + \\dfrac{t}{100}")]
          : [texte("Le nombre par lequel on multiplie est "), latex("a"), texte(" ; le nombre ajouté APRÈS la multiplication est "), latex("b"), texte(".")],
      ];
    case "avant":
      return [premiere, [texte("La constante "), latex("c"), texte(" est ajoutée AVANT la multiplication : elle est donc multipliée elle aussi. Développe : "), latex("y = a\\,(x + c) = a\\,x + a\\,c")]];
    case "negatif":
      return [
        premiere,
        [
          texte("Fais-le d'abord avec un nombre : pour une valeur de 12, on obtient "),
          latex(`${nombreLatex(e.b)} - 12`),
          texte(". Écris la même chose avec "),
          latex("x"),
          texte(", puis range-la sous la forme "),
          latex("a\\,x + b"),
          texte(" ("),
          latex("a"),
          texte(" peut être négatif)."),
        ],
      ];
  }
}

function piegesA(e: ExerciceTransformationDonnees): PiegeChamp[] {
  const liste: (PiegeChamp | false)[] = [];
  if (e.pourcentage !== null) {
    const t = e.pourcentage;
    const mot = t > 0 ? "hausse" : "baisse";
    liste.push({ valeur: t / 100, message: `Une ${mot} de ${nombreTexteFr(Math.abs(t))} % ne multiplie pas par $${nombreLatex(t / 100)}$ : on garde toute la valeur de départ, et on ${t > 0 ? "y ajoute" : "en retire"} ${nombreTexteFr(Math.abs(t))} %.` });
    liste.push({ valeur: Math.abs(t) / 100, message: `Une ${mot} de ${nombreTexteFr(Math.abs(t))} % ne multiplie pas par $${nombreLatex(Math.abs(t) / 100)}$ : on garde toute la valeur de départ, et on ${t > 0 ? "y ajoute" : "en retire"} ${nombreTexteFr(Math.abs(t))} %.` });
    if (t < 0) liste.push({ valeur: 1 - t / 100, message: "C'est une baisse : chaque valeur devient plus petite, donc $a$ est plus petit que 1." });
    liste.push({ valeur: 1 + Math.abs(t) / 10, message: "Attention à la conversion du pourcentage : $t\ \% = \dfrac{t}{100}$." });
  }
  if (e.forme === "constante") {
    liste.push({ valeur: 0, message: "Avec $a = 0$, toutes les nouvelles valeurs seraient égales : ici, chaque valeur est d'abord gardée telle quelle." });
    liste.push({ valeur: e.b, message: "$a$ est le nombre qui MULTIPLIE chaque valeur ; le nombre ajouté (ou retiré), c'est $b$." });
  }
  if (e.forme === "negatif") liste.push({ valeur: 1, message: "Plus la valeur de départ est grande, plus la nouvelle valeur est petite : le coefficient $a$ est négatif." });
  if (e.forme === "facteur" || e.forme === "direct" || e.forme === "avant") liste.push({ valeur: 1 / e.a, message: "C'est l'inverse du bon coefficient : vérifie si les nouvelles valeurs doivent être plus grandes ou plus petites que celles de départ." });
  if (e.forme === "direct" || e.forme === "avant") liste.push({ valeur: e.b, message: "$a$ est le nombre qui multiplie ; le nombre ajouté, c'est $b$." });
  return pieges(e.a, liste);
}

function piegesB(e: ExerciceTransformationDonnees): PiegeChamp[] {
  const liste: (PiegeChamp | false)[] = [];
  if (e.b < 0) liste.push({ valeur: -e.b, message: "On RETIRE ce nombre à chaque valeur : $b$ est négatif." });
  if (e.forme === "avant") liste.push({ valeur: e.constante!, message: "La constante est ajoutée AVANT la multiplication : elle est multipliée elle aussi." });
  if (e.forme === "negatif") liste.push({ valeur: -e.b, message: `On part de ${nombreTexteFr(e.b)} et on retire la valeur de départ : $b$ est positif.` });
  if (e.b !== 0) liste.push({ valeur: 0, message: "Un nombre est bien ajouté (ou retiré) à chaque valeur : $b$ n'est pas nul." });
  if (e.b !== 0 && e.a !== 1) liste.push({ valeur: e.a, message: "$b$ est le nombre ajouté, pas celui qui multiplie." });
  return pieges(e.b, liste);
}

function ecranTransformation(e: ExerciceTransformationDonnees): Ecran {
  const c = contexte(e);
  return {
    type: "champs",
    titre: TITRES_ECRANS[0]!,
    consigne: [texte("Écris la transformation sous la forme "), latex("y = a\\,x + b"), texte(", où "), latex("x"), texte(` est ${c.descX} et `), latex("y"), texte(` est ${c.descY}. Donne `), latex("a"), texte(" et "), latex("b"), texte(".")],
    champs: [
      { id: "a", libelle: [latex("a =")], unite: "", cible: e.a, pieges: piegesA(e) },
      {
        id: "b",
        libelle: [latex("b =")],
        unite: "",
        cible: e.b,
        pieges: piegesB(e),
        messageSiFaux: e.b === 0 ? "Rien n'est ajouté ni retiré après la multiplication." : undefined,
      },
    ],
    aides: aidesTransformation(e),
    reponse: [latex(equationLatex(e)), texte(", donc "), latex(`a = ${nombreLatex(e.a)}`), texte(" et "), latex(`b = ${nombreLatex(e.b)}`)],
  };
}

// ----------------------------------------------------------------------------------- Écran 2

function piegesPosition(e: ExerciceTransformationDonnees, x: number, nom: string): PiegeChamp[] {
  const cible = r9(e.a * x + e.b);
  const liste: (PiegeChamp | false)[] = [
    e.b !== 0 && { valeur: e.a * x, message: `Tu as multiplié, mais pas ajouté $b$ : la ${nom} suit TOUTE la transformation.` },
    e.a !== 1 && { valeur: x + e.b, message: `Il faut aussi multiplier par $a$ : la ${nom} suit TOUTE la transformation.` },
    { valeur: x, message: `La ${nom} change aussi : chaque valeur de la série a été transformée.` },
    e.forme === "avant" && { valeur: e.a * x + e.constante!, message: "La constante ajoutée avant la multiplication est multipliée elle aussi : utilise $b$, pas la constante du récit." },
    e.pourcentage !== null && { valeur: (x * Math.abs(e.pourcentage)) / 100, message: `C'est seulement la ${e.pourcentage > 0 ? "hausse" : "baisse"} : il faut encore ${e.pourcentage > 0 ? "l'ajouter à" : "la retirer de"} la valeur de départ.` },
    e.forme === "negatif" && { valeur: x - e.b, message: `C'est l'opposé : $y = ${nombreLatex(e.b)} - x$.` },
  ];
  return pieges(cible, liste);
}

function aidesPosition(e: ExerciceTransformationDonnees): FragmentConsigne[][] {
  return [
    [texte("La moyenne et la médiane subissent la même transformation que chaque valeur : "), latex("\\bar{y} = a\\,\\bar{x} + b")],
    [texte("Avec les coefficients de l'étape précédente, pour la moyenne : "), latex(`\\bar{y} = ${imageNonCalculee(e, e.depart.moyenne)}`), texte(" — même démarche pour la médiane.")],
  ];
}

function ecranPosition(e: ExerciceTransformationDonnees): Ecran {
  const c = contexte(e);
  const y = e.arrivee;
  return {
    type: "champs",
    titre: TITRES_ECRANS[1]!,
    consigne: [texte("Calcule la moyenne et la médiane de la nouvelle série.")],
    champs: [
      { id: "moyenne", libelle: [texte("Moyenne "), latex("\\bar{y} =")], unite: c.uniteY, cible: y.moyenne, pieges: piegesPosition(e, e.depart.moyenne, "moyenne") },
      { id: "mediane", libelle: [texte("Médiane =")], unite: c.uniteY, cible: y.mediane, pieges: piegesPosition(e, e.depart.mediane, "médiane") },
    ],
    aides: aidesPosition(e),
    reponse: [texte(`Moyenne : ${valeurAvecUnite(y.moyenne, c.uniteY)} ; médiane : ${valeurAvecUnite(y.mediane, c.uniteY)}`)],
  };
}

// ----------------------------------------------------------------------------------- Écran 3

const MSG_B_ECART = "La constante $b$ décale toutes les valeurs du même montant : elle ne change aucun écart entre les valeurs.";

function piegesEcart(e: ExerciceTransformationDonnees, x: number, nom: "étendue" | "écart-type"): PiegeChamp[] {
  const cible = r9(Math.abs(e.a) * x);
  return pieges(cible, [
    e.b !== 0 && { valeur: Math.abs(e.a) * x + e.b, message: MSG_B_ECART },
    e.b !== 0 && { valeur: e.a * x + e.b, message: MSG_B_ECART },
    e.b !== 0 && { valeur: x + e.b, message: MSG_B_ECART },
    e.a < 0 && { valeur: e.a * x, message: `Un${nom === "étendue" ? "e étendue" : " écart-type"} n'est jamais négati${nom === "étendue" ? "ve" : "f"} : on multiplie par $|a|$.` },
    Math.abs(e.a) !== 1 && { valeur: x, message: "En multipliant chaque valeur par $a$, on multiplie aussi les écarts entre elles." },
    nom === "écart-type" && Math.abs(e.a) !== 1 && { valeur: e.a * e.a * x, message: "C'est la variance qui est multipliée par $a^2$ ; l'écart-type, lui, est multiplié par $|a|$." },
  ]);
}

function piegesVariance(e: ExerciceTransformationDonnees): PiegeChamp[] {
  const v = e.depart.variance;
  const cible = r9(e.a * e.a * v);
  return pieges(cible, [
    Math.abs(e.a) !== 1 && { valeur: Math.abs(e.a) * v, message: "La variance est une moyenne de CARRÉS d'écarts : elle est multipliée par $a^2$, pas par $a$." },
    e.a === -1 && { valeur: -v, message: "Une variance n'est jamais négative : elle est multipliée par $a^2 = 1$." },
    e.b !== 0 && { valeur: e.a * e.a * v + e.b, message: MSG_B_ECART },
    e.b !== 0 && { valeur: v + e.b, message: MSG_B_ECART },
    e.b !== 0 && { valeur: Math.abs(e.a) * v + e.b, message: MSG_B_ECART },
    Math.abs(e.a) !== 1 && { valeur: v, message: "En multipliant chaque valeur par $a$, on agrandit (ou on réduit) les écarts : la variance change." },
  ]);
}

/** « |1{,}8| × 19{,}1 » (ou la valeur seule si |a| = 1). */
function ecartNonCalcule(e: ExerciceTransformationDonnees, x: number): string {
  if (Math.abs(e.a) === 1) return nombreLatex(x);
  return `${e.a < 0 ? `|${nombreLatex(e.a)}|` : nombreLatex(e.a)} \\times ${nombreLatex(x)}`;
}

export function varianceNonCalculee(e: ExerciceTransformationDonnees): string {
  if (e.a === 1) return nombreLatex(e.depart.variance);
  return `${facteur(e.a)}^2 \\times ${nombreLatex(e.depart.variance)}`;
}

function aidesEcarts(e: ExerciceTransformationDonnees): FragmentConsigne[][] {
  return [
    [
      texte("La constante "),
      latex("b"),
      texte(" décale toutes les valeurs du même montant : elle ne change aucun écart. Seul "),
      latex("a"),
      texte(" agit, en valeur absolue — et au carré pour la variance : "),
      latex("E_y = |a| \\times E_x"),
      texte(" ; "),
      latex("V_y = a^2 \\times V_x"),
      texte(" ; "),
      latex("\\sigma_y = |a| \\times \\sigma_x"),
    ],
    Math.abs(e.a) === 1
      ? [
          texte(e.a === 1 ? "Ici, chaque valeur est seulement décalée du même nombre." : "Ici, la série est retournée : "),
          ...(e.a === 1 ? [] : [latex(`y = ${nombreLatex(e.b)} - x`), texte(".")]),
          texte(" Prends deux valeurs, par exemple 10 et 14 : quel est leur écart avant, puis après la transformation ? Les trois indicateurs de dispersion se comportent comme cet écart."),
        ]
      : [
          texte("Ici, avec le coefficient "),
          latex("a"),
          texte(" de l'étape 1 : "),
          latex(`E_y = ${ecartNonCalcule(e, e.depart.etendue)}`),
          texte(" ; "),
          latex(`V_y = ${varianceNonCalculee(e)}`),
          texte(" ; "),
          latex(`\\sigma_y = ${ecartNonCalcule(e, e.depart.ecartType)}`),
          texte(" — il reste à calculer."),
        ],
  ];
}

function ecranEcarts(e: ExerciceTransformationDonnees): Ecran {
  const c = contexte(e);
  const y = e.arrivee;
  return {
    type: "champs",
    titre: TITRES_ECRANS[2]!,
    consigne: [texte("Calcule l'étendue, la variance et l'écart-type de la nouvelle série.")],
    champs: [
      { id: "etendue", libelle: [texte("Étendue =")], unite: c.uniteY, cible: y.etendue, pieges: piegesEcart(e, e.depart.etendue, "étendue") },
      { id: "variance", libelle: [texte("Variance "), latex("V_y =")], unite: uniteVariance(c.uniteY), cible: y.variance, pieges: piegesVariance(e) },
      { id: "ecartType", libelle: [texte("Écart-type "), latex("\\sigma_y =")], unite: c.uniteY, cible: y.ecartType, pieges: piegesEcart(e, e.depart.ecartType, "écart-type") },
    ],
    aides: aidesEcarts(e),
    reponse: [texte(`Étendue : ${valeurAvecUnite(y.etendue, c.uniteY)} ; variance : ${valeurAvecUnite(y.variance, uniteVariance(c.uniteY))} ; écart-type : ${valeurAvecUnite(y.ecartType, c.uniteY)}`)],
  };
}

// ----------------------------------------------------------------------------------- Écran 4

/** Les quatre phrases de conclusion (indice 0 : la juste ; 1 à 3 : idées fausses fréquentes). */
export function phrasesConclusion(e: ExerciceTransformationDonnees): FragmentConsigne[][] {
  const c = contexte(e);
  const a = nombreTexteFr(e.a);
  const a2 = nombreTexteFr(aCarre(e));
  switch (e.forme) {
    case "constante": {
      const ajoute = e.b > 0;
      const q = `${nombreTexteFr(Math.abs(e.b))} ${c.uniteY === c.uniteX ? c.uniteX : ""}`.trim();
      const verbe = ajoute ? "augmentent" : "diminuent";
      return [
        [texte(`On ${ajoute ? "ajoute" : "retire"} ${q} à chaque ${c.singulier} : la moyenne et la médiane ${verbe} de ${q}, mais les écarts entre les valeurs ne changent pas — l'étendue, la variance et l'écart-type restent les mêmes.`)],
        [texte(`On ${ajoute ? "ajoute" : "retire"} ${q} à chaque ${c.singulier} : tous les indicateurs ${verbe} de ${q}, y compris l'étendue et l'écart-type.`)],
        [texte(`La moyenne ${ajoute ? "augmente" : "diminue"} de ${q}, mais la médiane ne change pas : c'est toujours la même donnée qui se trouve au milieu de la série ordonnée.`)],
        [texte(`Aucun indicateur ne change : on a ${ajoute ? "ajouté" : "retiré"} la même quantité à toutes les valeurs, la série garde donc la même forme, le même centre et la même dispersion.`)],
      ];
    }
    case "pourcentage":
      return [
        [texte(`On multiplie chaque ${c.singulier} par ${a} : la moyenne, la médiane, l'étendue et l'écart-type sont eux aussi multipliés par ${a}, et la variance par `), latex(`${nombreLatex(e.a)}^2 = ${nombreLatex(aCarre(e))}`), texte(".")],
        [texte(`La moyenne et la médiane sont multipliées par ${a}, mais l'étendue et l'écart-type restent les mêmes : chaque valeur subit la même transformation.`)],
        [texte(`Tous les indicateurs sont multipliés par ${a}, la variance aussi : chaque indicateur subit exactement la même transformation que chaque ${c.singulier} de la série.`)],
        [texte(`Tous les indicateurs sont multipliés par ${a}, sauf l'étendue : la plus petite et la plus grande valeur restent les mêmes données, donc l'écart entre elles ne bouge pas.`)],
      ];
    case "facteur": {
      const sigmaY = valeurAvecUnite(e.arrivee.ecartType, c.uniteY);
      const sigmaX = valeurAvecUnite(e.depart.ecartType, c.uniteX);
      return [
        [texte(`C'est la même série, exprimée ${c.motUnite} : la moyenne, la médiane, l'étendue et l'écart-type sont multipliés par ${a}, la variance par ${a2} ; la dispersion réelle n'a pas changé.`)],
        [texte(`La moyenne et la médiane sont multipliées par ${a}, mais l'étendue et l'écart-type restent les mêmes : chaque valeur subit la même transformation.`)],
        [texte(`Tous les indicateurs sont multipliés par ${a}, la variance aussi : chaque indicateur subit exactement la même conversion que chaque valeur de la série.`)],
        [texte(`La dispersion a vraiment changé : l'écart-type passe de ${sigmaX} à ${sigmaY}, les valeurs sont donc devenues plus ${e.a > 1 ? "dispersées" : "resserrées"}.`)],
      ];
    }
    case "direct":
    case "avant": {
      const formule = affineLatex(e.a, e.b);
      return [
        [texte("La moyenne et la médiane suivent toute la transformation ("), latex(`\\bar{y} = ${affineLatex(e.a, e.b, "\\bar{x}")}`), texte(`) ; l'étendue et l'écart-type sont seulement multipliés par ${a}, la variance par ${a2} : le nombre ajouté ne change aucun écart.`)],
        [texte("Tous les indicateurs suivent la même formule "), latex(`y = ${formule}`), texte(", l'étendue et l'écart-type compris : chaque indicateur subit exactement ce que subit chaque valeur de la série.")],
        [texte("La moyenne et la médiane suivent la formule "), latex(`y = ${formule}`), texte(`, et l'étendue, l'écart-type et la variance sont tous les trois multipliés par ${a}.`)],
        [texte("La moyenne et la médiane suivent toute la transformation, mais l'étendue, la variance et l'écart-type restent les mêmes : chaque valeur subit la même transformation, donc les écarts entre elles ne changent pas.")],
      ];
    }
    case "negatif": {
      const b = nombreLatex(e.b);
      return [
        [texte("La moyenne et la médiane deviennent "), latex(`${b} - \\bar{x}`), texte(" et "), latex(`${b} - \\text{médiane}`), texte(" ; l'étendue, la variance et l'écart-type ne changent pas : la série est retournée, mais les écarts entre les valeurs restent les mêmes.")],
        [texte("La moyenne et la médiane deviennent "), latex(`${b} - \\bar{x}`), texte(" et "), latex(`${b} - \\text{médiane}`), texte(" ; l'écart-type devient négatif ("), latex("-\\sigma_x"), texte("), puisque chaque valeur est multipliée par −1.")],
        [texte(`Tous les indicateurs deviennent « ${nombreTexteFr(e.b)} moins leur valeur », l'étendue et l'écart-type compris : chaque indicateur subit ce que subit chaque valeur.`)],
        [texte("La moyenne devient "), latex(`${b} - \\bar{x}`), texte(", mais la médiane ne change pas : c'est toujours la même donnée qui se trouve au milieu de la série ordonnée.")],
      ];
    }
  }
}

/** Version courte de la conclusion (réponse brève du papier). */
export function conclusionBreve(e: ExerciceTransformationDonnees): string {
  const a = nombreTexteFr(e.a);
  switch (e.forme) {
    case "constante":
      return "moyenne et médiane décalées du même nombre ; étendue, variance et écart-type inchangés.";
    case "pourcentage":
    case "facteur":
      return `tout est multiplié par ${a} (la variance par ${nombreTexteFr(aCarre(e))}).`;
    case "direct":
    case "avant":
      return `moyenne et médiane suivent toute la transformation ; étendue et écart-type multipliés par ${a}, variance par ${nombreTexteFr(aCarre(e))} ; le nombre ajouté ne change pas la dispersion.`;
    case "negatif":
      return `moyenne et médiane deviennent ${nombreTexteFr(e.b)} moins leur valeur ; étendue, variance et écart-type inchangés.`;
  }
}

function ecranConclusion(e: ExerciceTransformationDonnees): Ecran {
  const phrases = phrasesConclusion(e);
  return {
    type: "choix",
    titre: TITRES_ECRANS[3]!,
    consigne: [texte("Quelle phrase décrit correctement l'effet de cette transformation sur la série ?")],
    options: e.ordrePhrases.map((i) => phrases[i]!),
    bonne: e.ordrePhrases.indexOf(0),
    aides: [
      [texte("Relis tes résultats des étapes 2 et 3 : quels indicateurs ont changé, et de combien ?")],
      [texte("Un nombre ajouté à toutes les valeurs déplace la série sans changer ses écarts ; un nombre qui multiplie toutes les valeurs agrandit ou rétrécit ses écarts.")],
    ],
    messageFaux: "Ce n'était pas la bonne phrase.",
  };
}

export function ecrans(e: ExerciceTransformationDonnees): Ecran[] {
  return [ecranTransformation(e), ecranPosition(e), ecranEcarts(e), ecranConclusion(e)];
}

// ---------------------------------------------------------------------------------------------
// Corrigé (papier) — mêmes formules que les aides
// ---------------------------------------------------------------------------------------------

/** Pourquoi y = a·x + b (étape a du corrigé). */
export function traductionTransformation(e: ExerciceTransformationDonnees): FragmentConsigne[] {
  const c = contexte(e);
  const eq = latex(equationLatex(e));
  const coefs: FragmentConsigne[] = [texte(", donc "), latex(`a = ${nombreLatex(e.a)}`), texte(" et "), latex(`b = ${nombreLatex(e.b)}`), texte(".")];
  const t = e.pourcentage;
  const multPc = t !== null ? latex(`1 ${t > 0 ? "+" : "-"} \\dfrac{${nombreLatex(Math.abs(t))}}{100} = ${nombreLatex(e.a)}`) : null;
  switch (e.forme) {
    case "constante":
      return [texte(`On ${e.b > 0 ? "ajoute" : "retire"} ${valeurAvecUnite(Math.abs(e.b), c.uniteX)} à chaque ${c.singulier}, sans rien multiplier : `), eq, ...coefs];
    case "pourcentage":
      return [texte(`Une ${t! > 0 ? "hausse" : "baisse"} de ${nombreTexteFr(Math.abs(t!))} % multiplie chaque ${c.singulier} par `), multPc!, texte(", et rien n'est ajouté : "), eq, ...coefs];
    case "facteur":
      return [texte(`Changement d'unité (${c.equivalence!(e)}) : on multiplie chaque valeur par ${nombreTexteFr(e.a)}, sans rien ajouter : `), eq, ...coefs];
    case "direct":
      if (t !== null) return [texte(`La hausse de ${nombreTexteFr(t)} % multiplie chaque salaire par `), multPc!, texte(", puis la prime s'ajoute : "), eq, ...coefs];
      return [texte(`On multiplie chaque valeur par ${nombreTexteFr(e.a)}, puis on ajoute ${nombreTexteFr(e.b)} : `), eq, ...coefs];
    case "avant": {
      const mult = t !== null ? [texte(`La hausse de ${nombreTexteFr(t)} % multiplie par `), multPc!, texte(". ")] : [];
      return [
        ...mult,
        texte(`La constante ${nombreTexteFr(e.constante!)} est ajoutée AVANT la multiplication, donc elle est multipliée elle aussi : `),
        latex(`y = ${nombreLatex(e.a)}\\,(x + ${nombreLatex(e.constante!)}) = ${affineLatex(e.a, e.b)}`),
        ...coefs,
      ];
    }
    case "negatif":
      return [texte(`${c.descY.charAt(0).toUpperCase()}${c.descY.slice(1)} vaut ${nombreTexteFr(e.b)} moins la valeur de départ : `), latex(`y = ${nombreLatex(e.b)} - x = ${affineLatex(e.a, e.b)}`), ...coefs];
  }
}

export function calculPosition(e: ExerciceTransformationDonnees, quoi: "moyenne" | "mediane"): string {
  const x = quoi === "moyenne" ? e.depart.moyenne : e.depart.mediane;
  const y = quoi === "moyenne" ? e.arrivee.moyenne : e.arrivee.mediane;
  return `${imageNonCalculee(e, x)} = ${nombreLatex(y)}`;
}

export function calculEcart(e: ExerciceTransformationDonnees, quoi: "etendue" | "ecartType"): string {
  const x = e.depart[quoi];
  const y = e.arrivee[quoi];
  if (Math.abs(e.a) === 1) return nombreLatex(y);
  return `${ecartNonCalcule(e, x)} = ${nombreLatex(y)}`;
}

export function calculVariance(e: ExerciceTransformationDonnees): string {
  if (Math.abs(e.a) === 1) return e.a === 1 ? nombreLatex(e.arrivee.variance) : `(-1)^2 \\times ${nombreLatex(e.depart.variance)} = ${nombreLatex(e.arrivee.variance)}`;
  return `${varianceNonCalculee(e)} = ${nombreLatex(aCarre(e))} \\times ${nombreLatex(e.depart.variance)} = ${nombreLatex(e.arrivee.variance)}`;
}

/** Les cinq nouveaux indicateurs, en texte (réponse brève). */
export function indicateursTexte(e: ExerciceTransformationDonnees, y: IndicateursSerie = e.arrivee): string {
  const u = contexte(e).uniteY;
  return `moyenne ${valeurAvecUnite(y.moyenne, u)} ; médiane ${valeurAvecUnite(y.mediane, u)} ; étendue ${valeurAvecUnite(y.etendue, u)} ; variance ${valeurAvecUnite(y.variance, uniteVariance(u))} ; écart-type ${valeurAvecUnite(y.ecartType, u)}`;
}
