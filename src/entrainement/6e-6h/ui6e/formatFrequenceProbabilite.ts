import type { ExerciceFrequenceProbabilite } from "../core6e/frequenceProbabilite.types";
import type { PhaseFrequenceProbabilite } from "../moteur6e/typesFrequenceProbabilite";
import {
  SEUILS,
  casModele,
  diagnostiquerEcran,
  ecartRelatif,
  effectifAttendu,
  effectifEvenement,
  frequenceObservee,
  probabiliteModele,
  probabiliteNaiveB,
  seuilRelatif,
  utiliseModeleEcran4,
  verdictAttendu,
} from "../moteur6e/verificationFrequenceProbabilite";
import { svgGrilleSommes } from "./figuresFrequenceProbabilite";

/**
 * Couche ui (6e) — textes de `6gen75` « Fréquence et probabilité » : consignes, tableaux de données,
 * champs, options des choix fermés, aides (deux niveaux, jamais la réponse), réponses attendues.
 * Toutes les grandeurs viennent de `moteur6e/verificationFrequenceProbabilite.ts` ; l'adaptateur
 * papier réutilise ces MÊMES fonctions.
 *
 * Conventions : virgule décimale (« {,} » en KaTeX), signe « − », aucune prose en mode
 * mathématique (les mots restent dans les fragments texte), aucune formule tapée au clavier dans les
 * aides (la formule va dans `latex`).
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

const txt = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const ltx = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export interface AideFrequence {
  texte: string;
  latex: string | null;
  /** Figure SVG autonome affichée sous l'aide (grille des 36 couples, SANS surlignage). */
  figureHtml?: string;
}

export interface ChampDef {
  label: string;
  placeholder: string;
}

export interface OptionChoix {
  id: string;
  label: string;
}

/** Tableau en lecture seule (texte brut) : chaque ligne est une ligne d'en-tête ou de valeurs. */
export interface TableauFrequence {
  titre?: string;
  lignes: { entete: boolean; cellules: string[] }[];
}

// ---------------------------------------------------------------------------------------------
// Nombres
// ---------------------------------------------------------------------------------------------

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/** Entier avec espace des milliers (texte : espace insécable). */
export function entierTexte(v: number): string {
  return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** Entier avec espace fine des milliers (KaTeX). */
export function entierLatex(v: number): string {
  return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, "\\,");
}

export function fractionLatex(num: number, den: number): string {
  return `\\dfrac{${entierLatex(num)}}{${entierLatex(den)}}`;
}

/** « 3/6 = 1/2 » si la fraction se simplifie, sinon « 5/36 ». */
function fractionEtSimplifiee(num: number, den: number): string {
  const g = pgcd(num, den);
  return g > 1 ? `${fractionLatex(num, den)}=${fractionLatex(num / g, den / g)}` : fractionLatex(num, den);
}

/** Décimal arrondi à `d` décimales, virgule française (KaTeX si `latex`). */
export function decimal(v: number, d: number, latex = true): string {
  const s = (Math.round(v * 10 ** d) / 10 ** d).toFixed(d).replace(/\.?0+$/, "");
  return s.replace(".", latex ? "{,}" : ",");
}

/** Une valeur est-elle un décimal exact à au plus `d` décimales ? */
function decimalExact(v: number, d: number): boolean {
  return Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-9;
}

export function pourcentEntier(v: number): number {
  return Math.round(v * 100);
}

function fractionModeleLatex(ex: ExerciceFrequenceProbabilite): string {
  const cas = casModele(ex);
  if (cas) {
    const g = pgcd(cas.favorables, cas.total);
    return fractionLatex(cas.favorables / g, cas.total / g);
  }
  if (ex.famille === "C") return fractionLatex(ex.affirmation.num, ex.affirmation.den);
  return "";
}

// ---------------------------------------------------------------------------------------------
// Libellés
// ---------------------------------------------------------------------------------------------

export const LIBELLE_PHASE: Record<PhaseFrequenceProbabilite, string> = {
  ecran1: "Probabilité a priori",
  ecran2: "Fréquence observée",
  ecran3: "Conclusion",
  ecran4: "Effectif attendu",
};

function libelleEvenement(ex: ExerciceFrequenceProbabilite): string {
  if (ex.famille === "C") return `${ex.objet.sujet} retombe ${ex.objet.issue}`;
  return ex.evenement.libelle;
}

function listeFrancaise(valeurs: number[]): string {
  if (valeurs.length === 1) return String(valeurs[0]);
  return `${valeurs.slice(0, -1).join(", ")} et ${valeurs[valeurs.length - 1]}`;
}

function majuscule(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/** Texte de la règle de décision (paliers), réutilisé par la consigne papier. */
export function texteRegleDecision(): string {
  return SEUILS.map((s, i) => `${pourcentEntier(s.seuil)} % ${i === SEUILS.length - 1 ? "au-delà de 1 000 essais" : i === 0 ? "pour moins de 100 essais" : `de ${s.libelle.replace(/^de /, "")} essais`}`).join(", ");
}

// ---------------------------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------------------------

export function consigneGenerale(ex: ExerciceFrequenceProbabilite): FragmentConsigne[] {
  const regle = [
    txt(" Règle de décision : l'écart entre une fréquence "),
    ltx("f"),
    txt(" et une probabilité "),
    ltx("p"),
    txt(" est jugé significatif quand l'écart relatif "),
    ltx("\\dfrac{|f-p|}{p}"),
    txt(" dépasse le seuil du second tableau, qui dépend du nombre d'essais."),
  ];
  switch (ex.famille) {
    case "A":
      return [
        txt("On lance un dé à six faces "),
        ltx(`n=${entierLatex(ex.n)}`),
        txt(" fois et on note la face obtenue ; le tableau donne l'effectif de chaque face. On étudie l'événement E : « "),
        txt(ex.evenement.libelle),
        txt(" »."),
        ...regle,
      ];
    case "B":
      return [
        txt("On lance deux dés à six faces "),
        ltx(`n=${entierLatex(ex.n)}`),
        txt(" fois et on note à chaque fois la somme des deux faces ; le tableau donne l'effectif de chaque somme. On étudie l'événement E : « "),
        txt(ex.evenement.libelle),
        txt(" »."),
        ...regle,
      ];
    case "C":
      return [
        txt(`On lance ${ex.objet.nom} `),
        ltx(`n=${entierLatex(ex.n)}`),
        txt(` fois : ${ex.objet.sujet} retombe soit ${ex.objet.issue}, soit ${ex.objet.autreIssue} ; le tableau donne les effectifs. On note E l'événement « ${libelleEvenement(ex)} ». Un camarade affirme que ${ex.objet.sujet} retombe ${ex.objet.issue} ${ex.affirmation.texte}.`),
        ...regle,
      ];
  }
}

export function tableauEffectifs(ex: ExerciceFrequenceProbabilite): TableauFrequence {
  switch (ex.famille) {
    case "A":
      return {
        lignes: [
          { entete: true, cellules: ["Face", "1", "2", "3", "4", "5", "6"] },
          { entete: false, cellules: ["Effectif", ...ex.effectifs.map(entierTexte)] },
        ],
      };
    case "B":
      // Deux demi-rangées (sommes 2 à 7, puis 8 à 12) : le tableau tient à 390 px sans défiler.
      return {
        lignes: [
          { entete: true, cellules: ["Somme", "2", "3", "4", "5", "6", "7"] },
          { entete: false, cellules: ["Effectif", ...ex.effectifs.slice(0, 6).map(entierTexte)] },
          { entete: true, cellules: ["Somme", "8", "9", "10", "11", "12", ""] },
          { entete: false, cellules: ["Effectif", ...ex.effectifs.slice(6).map(entierTexte), ""] },
        ],
      };
    case "C":
      return {
        lignes: [
          { entete: true, cellules: ["Issue", ex.objet.issue, ex.objet.autreIssue] },
          { entete: false, cellules: ["Effectif", entierTexte(ex.effectif), entierTexte(ex.n - ex.effectif)] },
        ],
      };
  }
}

export function tableauRegle(): TableauFrequence {
  return {
    titre: "Règle de décision",
    lignes: [
      { entete: true, cellules: ["Nombre d'essais", "Seuil d'écart relatif"] },
      ...SEUILS.map((s) => ({ entete: false, cellules: [s.libelle, `${pourcentEntier(s.seuil)} %`] })),
    ],
  };
}

export function consigneEcran(ex: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite): FragmentConsigne[] {
  const N = ltx(`N=${entierLatex(ex.nouveauxEssais)}`);
  switch (phase) {
    case "ecran1":
      if (ex.famille === "A") return [txt("Si le dé est équilibré, quelle est la probabilité de E ? (fraction, ou décimal avec au moins deux chiffres significatifs)")];
      if (ex.famille === "B") return [txt("Si les deux dés sont équilibrés, quelle est la probabilité de E ? (fraction, ou décimal avec au moins deux chiffres significatifs)")];
      return [txt(`Peut-on calculer a priori la probabilité que ${libelleEvenement(ex)} ? (une seule tentative)`)];
    case "ecran2":
      return [txt("Calcule la fréquence observée "), ltx("f"), txt(" de E sur ces "), ltx(`n=${entierLatex(ex.n)}`), txt(" essais. (fraction, ou décimal avec au moins deux chiffres significatifs)")];
    case "ecran3":
      if (ex.famille === "A") return [txt("Compare "), ltx("f"), txt(" à la probabilité "), ltx("p"), txt(" d'un dé équilibré à l'aide de la règle de décision, puis conclus. (une seule tentative)")];
      if (ex.famille === "B") return [txt("Applique la règle de décision au modèle de la grille des 36 couples, puis au modèle des 11 sommes équiprobables : que confirment les résultats ? (une seule tentative)")];
      return [txt("Applique la règle de décision à la valeur affirmée par le camarade : que conclut-on ? (une seule tentative)")];
    case "ecran4": {
      const question = [txt(" nouveaux essais, combien de fois peut-on s'attendre à ce que E se réalise ? (à l'unité près)")];
      if (ex.famille === "C")
        return [txt("On estime la probabilité de E par la fréquence observée "), ltx("f"), txt(" (fraction exacte, sans arrondi). Sur "), N, ...question];
      if (utiliseModeleEcran4(ex))
        return [txt(ex.famille === "A" ? "Le dé est jugé équilibré. Sur " : "Le modèle de la grille est confirmé. Sur "), N, ...question];
      return [
        txt(ex.famille === "A" ? "Le dé semble truqué : on estime donc la probabilité de E par la fréquence observée " : "Les dés semblent truqués : on estime donc la probabilité de E par la fréquence observée "),
        ltx("f"),
        txt(" (fraction exacte, sans arrondi). Sur "),
        N,
        ...question,
      ];
    }
  }
}

/** Placeholder « hors tirage » : le premier candidat qui n'est PAS une réponse acceptée. */
function placeholderHorsTirage(ex: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite, candidats: string[]): string {
  const libre = candidats.find((c) => diagnostiquerEcran(ex, phase, [c]) !== "correct") ?? candidats[0];
  return `ex : ${libre}`;
}

export function champEcran(ex: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite): ChampDef {
  switch (phase) {
    case "ecran1":
      return { label: "P(E) =", placeholder: placeholderHorsTirage(ex, phase, ["3/8", "0,6"]) };
    case "ecran2":
      return { label: "f =", placeholder: placeholderHorsTirage(ex, phase, ["0,05", "0,95", "0,5"]) };
    default:
      return { label: "Effectif attendu", placeholder: placeholderHorsTirage(ex, phase, ["250", "4321"]) };
  }
}

export function optionsChoix(ex: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite): OptionChoix[] {
  if (phase === "ecran1" && ex.famille === "C")
    return [
      { id: "deuxIssues", label: "Oui : une chance sur deux, puisqu'il y a deux façons de retomber." },
      { id: "impossible", label: "Non : rien ne garantit que les deux issues ont la même chance ; on ne peut que l'estimer par une fréquence." },
      { id: "zero", label: `Oui : elle vaut 0, car on ne peut pas prévoir comment ${ex.objet.sujet} va retomber.` },
    ];
  if (ex.famille === "A")
    return [
      { id: "compatible", label: "Écart relatif sous le seuil : les résultats sont compatibles avec un dé équilibré." },
      { id: "incompatible", label: "Écart relatif au-dessus du seuil : le dé semble truqué." },
      { id: "piege", label: "La fréquence n'est pas exactement égale à la probabilité : le dé est forcément truqué." },
    ];
  if (ex.famille === "B")
    return [
      { id: "compatible", label: "Les résultats confirment le modèle de la grille des 36 couples." },
      { id: "piege", label: "Les résultats confirment le modèle des 11 sommes équiprobables." },
      { id: "incompatible", label: "Les résultats ne confirment aucun des deux modèles : les dés semblent truqués." },
    ];
  return [
    { id: "compatible", label: "Écart relatif sous le seuil : l'affirmation est compatible avec les résultats." },
    { id: "incompatible", label: "Écart relatif au-dessus du seuil : les résultats contredisent l'affirmation." },
    { id: "piege", label: "La fréquence n'est pas exactement égale à la valeur affirmée : l'affirmation est forcément fausse." },
  ];
}

export function libelleOption(ex: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite, id: string): string {
  return optionsChoix(ex, phase).find((o) => o.id === id)?.label ?? id;
}

// ---------------------------------------------------------------------------------------------
// Aides (deux niveaux, jamais la réponse)
// ---------------------------------------------------------------------------------------------

export function aideNiveau1(ex: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite): AideFrequence {
  switch (phase) {
    case "ecran1":
      if (ex.famille === "A") return { texte: "Avec un dé équilibré, les six faces ont la même probabilité. Si k faces réalisent E, sa probabilité vaut :", latex: "P(E)=\\dfrac{k}{6}" };
      if (ex.famille === "B")
        return {
          texte: "Attention : les 11 sommes possibles (de 2 à 12) n'ont pas toutes la même chance. Ce sont les 36 couples (dé 1 ; dé 2) qui sont équiprobables ; la grille donne la somme de chacun d'eux.",
          latex: null,
          figureHtml: svgGrilleSommes(null),
        };
      return { texte: "Une probabilité a priori se calcule par équiprobabilité : il faut connaître des issues qui ont toutes la même chance de se produire.", latex: null };
    case "ecran2":
      return { texte: "La fréquence de E est l'effectif de E divisé par le nombre total d'essais :", latex: `f=\\dfrac{\\ldots}{${entierLatex(ex.n)}}` };
    case "ecran3":
      if (ex.famille === "B")
        return {
          texte: "Calcule l'écart relatif de f à la probabilité de chacun des deux modèles (la grille, puis les sommes équiprobables) :",
          latex: `\\dfrac{|f-p|}{p}\\qquad p\\in\\left\\{${fractionModeleLatex(ex)}\\,;\\,${fractionLatex(ex.evenement.sommes.length, 11)}\\right\\}`,
        };
      if (ex.famille === "C") return { texte: "Calcule l'écart relatif entre la fréquence observée f et la valeur affirmée :", latex: `\\dfrac{|f-p_0|}{p_0}\\qquad p_0=${fractionModeleLatex(ex)}` };
      return { texte: "Calcule l'écart relatif entre la fréquence observée f et la probabilité p d'un dé équilibré :", latex: "\\dfrac{|f-p|}{p}" };
    case "ecran4":
      if (ex.famille === "C")
        return {
          texte: "Une affirmation compatible avec les résultats n'est pas démontrée pour autant : la meilleure estimation de la probabilité reste la fréquence observée. L'effectif attendu est :",
          latex: "N\\cdot f",
        };
      if (utiliseModeleEcran4(ex)) return { texte: "Le modèle est confirmé : l'effectif attendu est le nombre d'essais multiplié par la probabilité du modèle :", latex: "N\\cdot p" };
      return { texte: "Le modèle est rejeté : on remplace la probabilité inconnue par la fréquence observée. L'effectif attendu est :", latex: "N\\cdot f" };
  }
}

export function aideNiveau2(ex: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite): AideFrequence {
  switch (phase) {
    case "ecran1":
      if (ex.famille === "A") return { texte: "Liste les faces qui réalisent E (par exemple, pour « obtenir au moins 3 » : les faces 3, 4, 5 et 6), puis compte-les.", latex: null };
      if (ex.famille === "B") return { texte: "Compte les cases de la grille qui réalisent E : la probabilité est ce nombre de cases divisé par le nombre total de couples.", latex: "\\dfrac{\\ldots}{36}" };
      return { texte: `${majuscule(ex.objet.sujet)} n'est pas symétrique : rien ne garantit que les issues « ${ex.objet.issue} » et « ${ex.objet.autreIssue} » ont la même chance. Que reste-t-il pour connaître cette probabilité ?`, latex: null };
    case "ecran2":
      if (ex.famille === "A")
        return { texte: ex.evenement.faces.length === 1 ? `L'effectif de E est celui de la face ${ex.evenement.faces[0]} dans le tableau.` : `Additionne les effectifs des faces ${listeFrancaise(ex.evenement.faces)} dans le tableau.`, latex: null };
      if (ex.famille === "B")
        return { texte: ex.evenement.sommes.length === 1 ? `L'effectif de E est celui de la somme ${ex.evenement.sommes[0]} dans le tableau.` : `Additionne les effectifs des sommes ${listeFrancaise(ex.evenement.sommes)} dans le tableau.`, latex: null };
      return { texte: `L'effectif de E se lit dans le tableau, sous « ${ex.objet.issue} ».`, latex: null };
    case "ecran3":
      return {
        texte: `Une fréquence n'est presque jamais exactement égale à une probabilité : seule compte la taille de l'écart. Pour ${entierTexte(ex.n)} essais, le seuil de la règle vaut :`,
        latex: `${pourcentEntier(seuilRelatif(ex.n))}\\,\\%`,
      };
    case "ecran4":
      if (utiliseModeleEcran4(ex)) return { texte: "Prends la valeur exacte de la probabilité (en fraction), pas une valeur arrondie.", latex: null };
      return { texte: "Garde la fréquence en fraction exacte (effectif sur nombre d'essais) : un arrondi, multiplié par un grand nombre d'essais, fausse le résultat.", latex: null };
  }
}

// ---------------------------------------------------------------------------------------------
// Réponses attendues
// ---------------------------------------------------------------------------------------------

function frequenceLatex(ex: ExerciceFrequenceProbabilite): string {
  const c = effectifEvenement(ex);
  const f = frequenceObservee(ex);
  const g = pgcd(c, ex.n);
  const fraction = g > 1 && ex.n / g < 100 ? `${fractionLatex(c, ex.n)}=${fractionLatex(c / g, ex.n / g)}` : fractionLatex(c, ex.n);
  return `f=${fraction}${decimalExact(f, 3) ? "=" : "\\approx "}${decimal(f, 3)}`;
}

/** Écarts relatifs à afficher (en %), au modèle puis — en B — au modèle naïf. */
export function ecartsPourcent(ex: ExerciceFrequenceProbabilite): { modele: number; naif: number | null; seuil: number } {
  const f = frequenceObservee(ex);
  const naive = probabiliteNaiveB(ex);
  return {
    modele: pourcentEntier(ecartRelatif(f, probabiliteModele(ex))),
    naif: naive === null ? null : pourcentEntier(ecartRelatif(f, naive)),
    seuil: pourcentEntier(seuilRelatif(ex.n)),
  };
}

const comparaison = (ecart: number, seuil: number) => `\\dfrac{|f-p|}{p}\\approx ${ecart}\\,\\%${ecart <= seuil ? "\\leqslant" : ">"}${seuil}\\,\\%`;

/** Conclusion de l'écran 3, en prose. */
export function conclusionTexte(ex: ExerciceFrequenceProbabilite): string {
  const verdict = verdictAttendu(ex);
  if (ex.famille === "A") return verdict === "compatible" ? "les résultats sont compatibles avec un dé équilibré" : "le dé semble truqué";
  if (ex.famille === "B") return verdict === "compatible" ? "les résultats confirment le modèle de la grille" : verdict === "piege" ? "les résultats confirment les sommes équiprobables" : "aucun des deux modèles n'est confirmé : les dés semblent truqués";
  return verdict === "compatible" ? "l'affirmation est compatible avec les résultats" : "les résultats contredisent l'affirmation";
}

export function reponseAttendueFragments(ex: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite): FragmentConsigne[] {
  switch (phase) {
    case "ecran1": {
      const cas = casModele(ex);
      if (!cas) return [txt("Non : les deux issues ne sont pas équiprobables, on ne peut qu'estimer la probabilité par une fréquence.")];
      return [ltx(`P(E)=${fractionEtSimplifiee(cas.favorables, cas.total)}`)];
    }
    case "ecran2":
      return [ltx(frequenceLatex(ex))];
    case "ecran3": {
      const e = ecartsPourcent(ex);
      if (ex.famille === "B" && e.naif !== null)
        return [
          txt("Grille ("),
          ltx(`p=${fractionModeleLatex(ex)}`),
          txt(") : "),
          ltx(comparaison(e.modele, e.seuil)),
          txt(" ; sommes équiprobables ("),
          ltx(`p=${fractionLatex(ex.evenement.sommes.length, 11)}`),
          txt(") : "),
          ltx(comparaison(e.naif, e.seuil)),
          txt(` ; ${conclusionTexte(ex)}.`),
        ];
      return [ltx(`${ex.famille === "C" ? `p=${fractionModeleLatex(ex)},\\quad ` : ""}${comparaison(e.modele, e.seuil)}`), txt(` : ${conclusionTexte(ex)}.`)];
    }
    case "ecran4": {
      const facteur = utiliseModeleEcran4(ex) ? fractionModeleLatex(ex) : fractionLatex(effectifEvenement(ex), ex.n);
      return [ltx(`${entierLatex(ex.nouveauxEssais)}\\times ${facteur}=${entierLatex(effectifAttendu(ex))}`)];
    }
  }
}

/** Réponse attendue en TEXTE BRUT (récapitulatif « Ce qu'on sait déjà » pour les écrans à choix). */
export function reponseAttendueTexte(ex: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite): string | null {
  if (phase === "ecran1" && ex.famille === "C") return "impossible a priori (issues non équiprobables)";
  if (phase === "ecran3") {
    const e = ecartsPourcent(ex);
    const detail = ex.famille === "B" && e.naif !== null ? `écart ≈ ${e.modele} % à la grille, ≈ ${e.naif} % aux sommes équiprobables, seuil ${e.seuil} %` : `écart relatif ≈ ${e.modele} %, seuil ${e.seuil} %`;
    return `${majuscule(conclusionTexte(ex))} (${detail})`;
  }
  return null;
}
