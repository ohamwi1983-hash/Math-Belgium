import type { ExerciceDeuxEnfants, ExerciceMere, ExerciceMontyHall, ExerciceParadoxesProbabilites } from "../core6e/paradoxesProbabilites.types";
import type { PhaseParadoxe } from "../moteur6e/typesParadoxesProbabilites";
import { valeursAttendues } from "../moteur6e/verificationParadoxesProbabilites";

/**
 * Couche C (6e) — textes de `6gen76` « Quand l'intuition se trompe ». SOURCE UNIQUE des consignes,
 * aides, options et réponses attendues : l'écran, le récapitulatif, l'adaptateur de feuilles
 * (`generateurs6e/paradoxesProbabilites/exportEvaluation.ts`) en dérivent.
 *
 * Règles permanentes appliquées : aucune formule écrite au clavier dans une aide (la formule va
 * dans `latex`), « − » typographique, virgule décimale `{,}`, jamais de prose en mode math (les
 * mots restent hors des formules, `\mathrm{GG}` n'est qu'un nom d'issue), aides sans la réponse.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface ChampDef {
  label: string;
  placeholder: string;
}

export interface AideAvecLatex {
  texte: string;
  latex?: string;
}

/** Option d'un écran à choix fermé — texte mêlé de formules (fractions), d'où des fragments. */
export interface OptionParadoxe {
  id: string;
  fragments: FragmentConsigne[];
}

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ============================================================================
// Écriture des nombres.
// ============================================================================

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/** Fraction simplifiée en LaTeX (`\dfrac`), entier si le dénominateur se simplifie en 1. */
export function fractionLatex(num: number, den: number, style: "d" | "t" = "d"): string {
  const g = pgcd(num, den);
  const n = num / g;
  const d = den / g;
  return d === 1 ? `${n}` : `\\${style === "d" ? "dfrac" : "frac"}{${n}}{${d}}`;
}

/** Arrondi au millième, virgule décimale LaTeX. */
export function millieme(v: number): string {
  return v.toFixed(3).replace(".", "{,}");
}

/** Arrondi au millième en texte (« 0,518 »). */
export function milliemeTexte(v: number): string {
  return v.toFixed(3).replace(".", ",");
}

/** `\approx 0{,}267` seulement si la fraction n'a pas d'écriture décimale courte et exacte. */
function approximation(num: number, den: number): string {
  const v = num / den;
  return Math.abs(Math.round(v * 1000) / 1000 - v) < 1e-12 ? "" : `\\approx ${millieme(v)}`;
}

// ============================================================================
// Deux enfants : issues, lettres et accords.
// ============================================================================

function lettre(e: ExerciceDeuxEnfants): "G" | "F" {
  return e.sexe === "garcon" ? "G" : "F";
}

export const UNIVERS_DEUX_ENFANTS = ["GG", "GF", "FG", "FF"] as const;

/** Issues compatibles avec l'information (première lettre = aîné). */
export function issuesCompatibles(e: ExerciceDeuxEnfants): string[] {
  const s = lettre(e);
  return UNIVERS_DEUX_ENFANTS.filter((issue) => (e.information === "auMoinsUn" ? issue.includes(s) : e.rang === "aine" ? issue[0] === s : issue[1] === s));
}

export function issueFavorable(e: ExerciceDeuxEnfants): string {
  return lettre(e) + lettre(e);
}

function pluriel(e: ExerciceDeuxEnfants): string {
  return e.sexe === "garcon" ? "garçons" : "filles";
}

function unSexe(e: ExerciceDeuxEnfants): string {
  return e.sexe === "garcon" ? "un garçon" : "une fille";
}

function autreSexe(e: ExerciceDeuxEnfants): string {
  return e.sexe === "garcon" ? "une fille" : "un garçon";
}

/** « au moins un des deux enfants est un garçon », « l'aînée est une fille », « le cadet est un garçon »… */
export function informationTexte(e: ExerciceDeuxEnfants): string {
  if (e.information === "auMoinsUn") return `au moins un des deux enfants est ${unSexe(e)}`;
  return `${qui(e)} est ${unSexe(e)}`;
}

/** « l'aîné », « l'aînée », « le cadet », « la cadette » (accord avec le sexe annoncé). */
function qui(e: ExerciceDeuxEnfants): string {
  const f = e.sexe === "fille";
  return e.rang === "aine" ? (f ? "l'aînée" : "l'aîné") : f ? "la cadette" : "le cadet";
}

function listeIssuesLatex(issues: readonly string[]): string {
  return `\\{${issues.map((i) => `\\mathrm{${i}}`).join("\\,;\\,")}\\}`;
}

// ============================================================================
// Consigne générale et données.
// ============================================================================

function consigneMere(e: ExerciceMere): FragmentConsigne[] {
  return [
    t(`En 1654, le chevalier de Méré comparait deux paris. Pari 1 : obtenir au moins un 6 en lançant 4 fois un dé. Pari 2 : obtenir au moins un double six en lançant ${e.kLancersDouble} fois deux dés. On note `),
    l("A_1"),
    t(" l'événement « gagner le pari 1 » et "),
    l("A_2"),
    t(" l'événement « gagner le pari 2 ». Un pari est favorable au joueur si sa probabilité de gain dépasse "),
    l("\\frac{1}{2}"),
    t(". Méré raisonnait par proportionnalité :"),
  ];
}

function consigneMonty(e: ExerciceMontyHall): FragmentConsigne[] {
  const n = e.nPortes;
  const fin = n === 3 ? " ou de changer pour la dernière porte encore fermée." : ` ou d'en changer : tu prendrais alors, au hasard, l'une des ${n - 2} autres portes encore fermées.`;
  return [
    t(`Jeu télévisé : derrière l'une de ${n} portes fermées se trouve une voiture, derrière chacune des autres une chèvre. Tu choisis la porte ${e.porteChoisie}. L'animateur, qui sait où est la voiture, ouvre alors une autre porte que la tienne, derrière laquelle il y a une chèvre (il peut toujours le faire) : ici la porte ${e.porteOuverte}. Il te propose de garder ta porte${fin} On note `),
    l("V"),
    t(" l'événement « la voiture est derrière la porte choisie au départ », "),
    l("G"),
    t(" « gagner en gardant » et "),
    l("C"),
    t(" « gagner en changeant »."),
  ];
}

function consigneEnfants(e: ExerciceDeuxEnfants): FragmentConsigne[] {
  return [
    t(`Une famille a deux enfants. Chaque enfant est un garçon ou une fille avec la même probabilité, indépendamment de l'autre. On apprend ${e.information === "auMoinsUn" ? "qu'" : "que "}${informationTexte(e)}. On note `),
    l("A"),
    t(" cet événement et "),
    l("B"),
    t(` l'événement « les deux enfants sont des ${pluriel(e)} ». On cherche `),
    l("P(B\\mid A)"),
    t("."),
  ];
}

export function consigneGenerale(e: ExerciceParadoxesProbabilites): FragmentConsigne[] {
  switch (e.famille) {
    case "mere":
      return consigneMere(e);
    case "montyHall":
      return consigneMonty(e);
    case "deuxEnfants":
      return consigneEnfants(e);
  }
}

/** Raisonnement (faux) de Méré, affiché sous la consigne — le piège à confronter. */
export function blocDonnees(e: ExerciceParadoxesProbabilites): string[] {
  if (e.famille !== "mere") return [];
  const k = e.kLancersDouble;
  return [`4\\times\\dfrac{1}{6}=\\dfrac{2}{3}\\qquad ${k}\\times\\dfrac{1}{36}=${fractionLatex(k, 36)}`];
}

// ============================================================================
// Écrans.
// ============================================================================

export function libellePhase(e: ExerciceParadoxesProbabilites, phase: PhaseParadoxe): string {
  switch (phase) {
    case "prediction":
      return "Ta prédiction";
    case "modeliser":
      return e.famille === "mere" ? "Événements contraires" : e.famille === "montyHall" ? "Arbre de l'animateur" : "Univers restreint";
    case "calculer":
      return e.famille === "mere" ? "Probabilités de gain" : e.famille === "montyHall" ? "Garder ou changer" : "Probabilité cherchée";
    case "conclure":
      return "Conclusion";
  }
}

const PRECISION = " (valeur exacte ou arrondie au millième)";

export function consigneEcran(e: ExerciceParadoxesProbabilites, phase: PhaseParadoxe): FragmentConsigne[] {
  switch (phase) {
    case "prediction": {
      const question =
        e.famille === "mere" ? "quel pari te semble le plus avantageux ?" : e.famille === "montyHall" ? "que vaut-il mieux faire ?" : "que vaut, selon toi, la probabilité cherchée ?";
      return [t(`Avant tout calcul, fie-toi à ton intuition : ${question} Cette prédiction n'est pas notée (une seule réponse) ; on la confrontera au calcul à la fin.`)];
    }
    case "modeliser":
      if (e.famille === "mere") {
        return [
          t("Passe par l'événement contraire : le contraire de « au moins un » est « aucun ». Calcule "),
          l("P(\\overline{A_1})"),
          t(", la probabilité de n'obtenir aucun 6 en 4 lancers, et "),
          l("P(\\overline{A_2})"),
          t(`, celle de n'obtenir aucun double six en ${e.kLancersDouble} lancers${PRECISION}.`),
        ];
      }
      if (e.famille === "montyHall") {
        return [
          t("Modélise par un arbre ce que sait l'animateur. Donne "),
          l("P(V)"),
          t(", puis la probabilité de gagner en changeant quand la voiture n'est pas derrière ta porte, "),
          l("P(C\\mid\\overline{V})"),
          t(`${PRECISION}.`),
        ];
      }
      return [
        t("Note chaque issue par le sexe de l'aîné puis celui du cadet (G pour garçon, F pour fille) : les quatre issues "),
        l(listeIssuesLatex(UNIVERS_DEUX_ENFANTS)),
        t(" sont équiprobables. Restreins cet univers à l'information reçue : donne le nombre d'issues compatibles avec "),
        l("A"),
        t(", puis le nombre d'entre elles qui réalisent "),
        l("B"),
        t("."),
      ];
    case "calculer":
      if (e.famille === "mere") return [t("Déduis-en la probabilité de gagner chaque pari, "), l("P(A_1)"), t(" et "), l("P(A_2)"), t(`${PRECISION}.`)];
      if (e.famille === "montyHall") return [t("Calcule la probabilité de gagner la voiture en gardant ta porte, "), l("P(G)"), t(", puis en changeant, "), l("P(C)"), t(`${PRECISION}.`)];
      return [t("Calcule "), l("P(B\\mid A)"), t(`${PRECISION}.`)];
    case "conclure":
      return [t("Conclus (une seule réponse possible), puis compare avec ta prédiction, rappelée ci-dessous.")];
  }
}

export function champsEcran(e: ExerciceParadoxesProbabilites, phase: "modeliser" | "calculer"): ChampDef[] {
  const placeholder = "ex. 0,125 ou (1/2)^3";
  switch (e.famille) {
    case "mere":
      return phase === "modeliser"
        ? [
            { label: "Aucun 6 en 4 lancers", placeholder },
            { label: `Aucun double six en ${e.kLancersDouble} lancers`, placeholder },
          ]
        : [
            { label: "Gagner le pari 1", placeholder },
            { label: "Gagner le pari 2", placeholder },
          ];
    case "montyHall":
      return phase === "modeliser"
        ? [
            { label: "Voiture derrière ta porte", placeholder: "ex. 1/7" },
            { label: "Gagner en changeant, si elle n'y est pas", placeholder: "ex. 1/7" },
          ]
        : [
            { label: "Gagner en gardant", placeholder: "ex. 2/7" },
            { label: "Gagner en changeant", placeholder: "ex. 2/7" },
          ];
    case "deuxEnfants":
      return phase === "modeliser"
        ? [
            { label: "Issues compatibles avec A", placeholder: "ex. 7" },
            { label: "Issues qui réalisent B", placeholder: "ex. 7" },
          ]
        : [{ label: "Probabilité cherchée", placeholder: "ex. 2/7" }];
  }
}

// ============================================================================
// Options des écrans à choix fermé.
// ============================================================================

export function optionsPrediction(e: ExerciceParadoxesProbabilites): OptionParadoxe[] {
  const libelles =
    e.famille === "mere"
      ? ["Les deux paris se valent", "Le pari 1", "Le pari 2"]
      : e.famille === "montyHall"
        ? ["Garder ma porte", "Changer de porte", "C'est pareil"]
        : ["Une chance sur 2", "Une chance sur 3", "Une chance sur 4"];
  return libelles.map((libelle, i) => ({ id: `p${i}`, fragments: [t(libelle)] }));
}

/** Options canoniques de la conclusion : l'option 0 est la seule correcte. */
function optionsConclusionCanoniques(e: ExerciceParadoxesProbabilites): FragmentConsigne[][] {
  switch (e.famille) {
    case "mere":
      return e.kLancersDouble === 24
        ? [[t("Seul le pari 1 est favorable au joueur")], [t("Les deux paris ont la même probabilité de gain")], [t("Seul le pari 2 est favorable au joueur")], [t("Les deux paris sont favorables au joueur")]]
        : [
            [t("Les deux paris sont favorables, et le pari 1 est le meilleur")],
            [t("Les deux paris sont favorables, et le pari 2 est le meilleur")],
            [t("Seul le pari 1 est favorable au joueur")],
            [t("Aucun des deux paris n'est favorable au joueur")],
          ];
    case "montyHall": {
      const n = e.nPortes;
      return [
        [t("Changer : on gagne avec une probabilité de "), l(fractionLatex(n - 1, n * (n - 2), "t"))],
        [t("Garder : on gagne avec une probabilité de "), l(fractionLatex(1, n, "t"))],
        [t("C'est indifférent : chaque porte encore fermée a une probabilité de "), l(fractionLatex(1, n - 1, "t"))],
        [t("Changer : on gagne avec une probabilité de "), l(fractionLatex(1, n - 1, "t"))],
      ];
    }
    case "deuxEnfants": {
      const s = lettre(e);
      const ss = issueFavorable(e);
      const compat = issuesCompatibles(e);
      const autre = autreSexe(e);
      if (e.information === "auMoinsUn") {
        return [
          [l("\\frac{1}{3}"), t(` : parmi les trois issues équiprobables ${compat.join(", ")}, seule ${ss} convient`)],
          [l("\\frac{1}{2}"), t(` : il reste deux compositions, deux ${pluriel(e)} ou ${unSexe(e)} et ${autre}`)],
          [l("\\frac{1}{4}"), t(` : ${ss} est une issue sur quatre`)],
          [l("\\frac{2}{3}"), t(` : deux issues sur trois contiennent ${autre}`)],
        ];
      }
      return [
        [l("\\frac{1}{2}"), t(` : il reste ${compat.join(" et ")}, équiprobables`)],
        [l("\\frac{1}{3}"), t(` : comme avec « au moins ${s === "G" ? "un garçon" : "une fille"} », il reste trois issues`)],
        [l("\\frac{1}{4}"), t(` : ${ss} est une issue sur quatre`)],
        [l("\\frac{3}{4}"), t(` : trois issues sur quatre contiennent ${unSexe(e)}`)],
      ];
    }
  }
}

/** Options de la conclusion DANS L'ORDRE D'AFFICHAGE (`ordreConclusion`), id = indice canonique. */
export function optionsConclusion(e: ExerciceParadoxesProbabilites): OptionParadoxe[] {
  const canoniques = optionsConclusionCanoniques(e);
  return e.ordreConclusion.map((i) => ({ id: String(i), fragments: canoniques[i] }));
}

/** Conclusion correcte (option canonique 0). */
export function conclusionCorrecte(e: ExerciceParadoxesProbabilites): FragmentConsigne[] {
  return optionsConclusionCanoniques(e)[0];
}

export function fragmentsOption(options: OptionParadoxe[], id: string | null): FragmentConsigne[] {
  return options.find((o) => o.id === id)?.fragments ?? [];
}

// ============================================================================
// Réponses attendues (LaTeX).
// ============================================================================

export function formatReponseAttenduePhaseLatex(e: ExerciceParadoxesProbabilites, phase: "modeliser" | "calculer"): string[] {
  const v = valeursAttendues(e, phase);
  switch (e.famille) {
    case "mere": {
      const k = e.kLancersDouble;
      return phase === "modeliser"
        ? [`P(\\overline{A_1})=\\left(\\dfrac{5}{6}\\right)^{4}\\approx ${millieme(v[0])}`, `P(\\overline{A_2})=\\left(\\dfrac{35}{36}\\right)^{${k}}\\approx ${millieme(v[1])}`]
        : [`P(A_1)=1-\\left(\\dfrac{5}{6}\\right)^{4}\\approx ${millieme(v[0])}`, `P(A_2)=1-\\left(\\dfrac{35}{36}\\right)^{${k}}\\approx ${millieme(v[1])}`];
    }
    case "montyHall": {
      const n = e.nPortes;
      if (phase === "modeliser") return [`P(V)=${fractionLatex(1, n)}`, `P(C\\mid\\overline{V})=${fractionLatex(1, n - 2)}`];
      const produit = n === 3 ? `${fractionLatex(n - 1, n)}\\times 1` : `${fractionLatex(n - 1, n)}\\times ${fractionLatex(1, n - 2)}`;
      return [`P(G)=P(V)=${fractionLatex(1, n)}`, `P(C)=${produit}=${fractionLatex(n - 1, n * (n - 2))}${approximation(n - 1, n * (n - 2))}`];
    }
    case "deuxEnfants": {
      const compat = issuesCompatibles(e);
      if (phase === "modeliser") return [`A=${listeIssuesLatex(compat)},\\ \\#A=${compat.length}`, `B=\\{\\mathrm{${issueFavorable(e)}}\\},\\ \\#B=1`];
      return [`P(B\\mid A)=\\dfrac{\\#B}{\\#A}=${fractionLatex(1, compat.length)}${approximation(1, compat.length)}`];
    }
  }
}

// ============================================================================
// Aides (jamais la réponse).
// ============================================================================

export function aideNiveau1(e: ExerciceParadoxesProbabilites, phase: PhaseParadoxe): AideAvecLatex {
  switch (phase) {
    case "prediction":
      return { texte: "" };
    case "modeliser":
      if (e.famille === "mere") return { texte: "« Au moins un 6 » se compte mal directement ; son contraire « aucun 6 » veut dire « pas de 6 » à chaque lancer. Les lancers sont indépendants : on multiplie les probabilités, lancer par lancer." };
      if (e.famille === "montyHall") return { texte: "Au moment de ton choix, toutes les portes ont la même probabilité de cacher la voiture. Ce que fait ensuite l'animateur ne déplace pas la voiture." };
      return { texte: "Barre, dans la liste des quatre issues, celles qui contredisent l'information reçue : les issues restantes forment le nouvel univers." };
    case "calculer":
      if (e.famille === "mere") return { texte: "On revient de l'événement contraire à l'événement lui-même :", latex: "P(A)=1-P(\\overline{A})" };
      if (e.famille === "montyHall") return { texte: "En gardant, tu ne gagnes que si la voiture était derrière ta porte dès le départ : l'ouverture d'une porte par l'animateur n'y change rien." };
      return { texte: "Dans l'univers restreint, les issues restantes sont encore équiprobables : divise le nombre d'issues qui réalisent B par le nombre d'issues compatibles avec A." };
    case "conclure":
      if (e.famille === "mere") return { texte: "Un pari est favorable au joueur quand sa probabilité de gain dépasse :", latex: "\\dfrac{1}{2}=0{,}5" };
      if (e.famille === "montyHall") return { texte: "Compare les deux probabilités que tu viens de calculer : la meilleure stratégie est celle qui a la plus grande." };
      return { texte: "Reprends la probabilité que tu viens de calculer, puis cherche la justification qui correspond aux issues que tu as gardées." };
  }
}

export function aideNiveau2(e: ExerciceParadoxesProbabilites, phase: PhaseParadoxe): AideAvecLatex {
  switch (phase) {
    case "prediction":
      return { texte: "" };
    case "modeliser":
      if (e.famille === "mere") return { texte: "Pour n essais indépendants qui réussissent chacun avec la probabilité p, la probabilité de n'avoir aucun succès est la suivante (un double six a, lui, une chance sur 36 à chaque lancer de deux dés) :", latex: "(1-p)^{n}" };
      if (e.famille === "montyHall") {
        return e.nPortes === 3
          ? { texte: "Si la voiture n'est pas derrière ta porte, l'animateur est obligé d'ouvrir l'unique autre porte à chèvre : regarde ce qui se cache alors derrière la dernière porte fermée." }
          : { texte: "Si la voiture n'est pas derrière ta porte, elle n'est pas non plus derrière la porte ouverte : elle est derrière l'une des portes que tu peux prendre en changeant. Compte-les." };
      }
      return {
        texte:
          e.information === "auMoinsUn"
            ? `« Au moins ${unSexe(e)} » n'exclut qu'une seule issue : celle qui n'en contient aucun${e.sexe === "fille" ? "e" : ""}.`
            : `L'information porte sur ${qui(e)} : elle fixe la ${e.rang === "aine" ? "première" : "deuxième"} lettre de chaque issue.`,
      };
    case "calculer":
      if (e.famille === "mere") return { texte: "À la calculatrice, calcule d'abord la puissance, puis soustrais le résultat de 1 ; garde au moins trois décimales." };
      if (e.famille === "montyHall") return { texte: "En changeant, tu ne peux gagner que sur la branche où la voiture n'est pas derrière ta porte : multiplie les probabilités le long de cette branche de l'arbre." };
      return { texte: "C'est une probabilité conditionnelle ; en termes de probabilités, elle s'écrit :", latex: "P(B\\mid A)=\\dfrac{P(A\\cap B)}{P(A)}" };
    case "conclure":
      if (e.famille === "mere") return { texte: "Compare chacune des deux probabilités de gain à ce seuil, puis compare-les entre elles." };
      if (e.famille === "montyHall") return { texte: "Une stratégie se juge par sa probabilité de gain, lue sur l'arbre, et non par le nombre de portes encore fermées." };
      return { texte: "Une justification n'est valable que si elle compte des issues équiprobables, écrites avec l'aîné en premier." };
  }
}
