import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { ChoixIndicateur, ExerciceValeurAberrante, Justification } from "../core/valeurAberrante.types";
import { nombreTexteFr } from "../moteur/contextesTransformationDonnees";
import { arrondi9, contexteDef, indicateursComplets, indicateursSansExtreme, valeurRetiree, valeursRestantes, type Indicateurs } from "../moteur/modeleValeurAberrante";
import { nombreLatex, type Champ, type PiegeChamp } from "./formatTransformationDonnees";

/**
 * Textes de gen110 (« Moyenne ou médiane ? La valeur aberrante ») — écran ET papier : une seule
 * source. Formules en LaTeX, virgule décimale, signe moins typographique, unité du contexte après
 * chaque valeur. Médiane : règle du seuil du chapitre (rang ⌊n/2⌋ + 1, voir le modèle).
 *
 * Rien dans l'énoncé, les titres, les consignes ni les aides des écrans a et b ne trahit le
 * verdict : on retire TOUJOURS la plus grande valeur (la plus petite pour les notes), qu'elle soit
 * isolée ou non.
 */

export const NOMBRE_ECRANS = 3;

// ---------------------------------------------------------------------------------------------
// Nombres et énoncé
// ---------------------------------------------------------------------------------------------

/** Unités qui prennent la marque du singulier sous 2 (« 0,5 point », « 1 jour »). */
const SINGULIERS: Record<string, string> = { points: "point", jours: "jour" };

function avecUnite(v: number, unite: string): string {
  if (unite.startsWith("/")) return `${nombreTexteFr(v)}${unite}`;
  return `${nombreTexteFr(v)} ${Math.abs(v) < 2 && SINGULIERS[unite] ? SINGULIERS[unite] : unite}`;
}

/** « 2 650 € », « 12,5/20 », « 1 jour ». */
export function valeurTexte(e: ExerciceValeurAberrante, v: number): string {
  return avecUnite(v, contexteDef(e).unite);
}

/** Écart entre deux valeurs : « 825 € », « 0,5 point ». */
export function ecartTexte(e: ExerciceValeurAberrante, d: number): string {
  const c = contexteDef(e);
  return avecUnite(d, c.uniteEcart ?? c.unite);
}

/** Unité après un nombre déjà écrit : « € » précédé d'une espace, « /20 » collé. */
export function uniteApres(e: ExerciceValeurAberrante): string {
  const u = contexteDef(e).unite;
  return u.startsWith("/") ? u : ` ${u}`;
}

/** Saisie nettoyée d'une unité « /20 » ou « sur 20 » recopiée (une note), avant la lecture du nombre. */
export function saisieSansUnite(e: ExerciceValeurAberrante, s: string): string {
  if (contexteDef(e).unite !== "/20") return s;
  return s.replace(/\s*(\/|sur)\s*20\s*$/i, "");
}

/** « 2 650 ; 2 250 ; … » (sans unité). */
export function listeTexte(valeurs: readonly number[]): string {
  return valeurs.map((v) => nombreTexteFr(v)).join(" ; ");
}

export function plusGrande(e: ExerciceValeurAberrante): boolean {
  return contexteDef(e).sens === "haut";
}

/** « la plus grande valeur » / « la plus petite valeur ». */
export function laValeurRetiree(e: ExerciceValeurAberrante): string {
  return plusGrande(e) ? "la plus grande valeur" : "la plus petite valeur";
}

export function recit(e: ExerciceValeurAberrante): string {
  return contexteDef(e).recit(e.valeurs.length, e.prenom);
}

/** Titre de la liste : « Valeurs (en €) ». */
export function titreListe(e: ExerciceValeurAberrante): string {
  return `Valeurs (${contexteDef(e).uniteListe})`;
}

export function consigneGenerale(e: ExerciceValeurAberrante): string {
  return `Calcule la moyenne et la médiane de cette série, puis recalcule-les sans ${laValeurRetiree(e)}, et décide quel indicateur représente le mieux la série. Donne des valeurs exactes : aucun arrondi n'est nécessaire.`;
}

export function titresEcrans(e: ExerciceValeurAberrante): string[] {
  return ["Moyenne et médiane", plusGrande(e) ? "Sans la plus grande valeur" : "Sans la plus petite valeur", "L'indicateur le plus représentatif"];
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

export interface OptionChoix<T extends string> {
  id: T;
  fragments: FragmentConsigne[];
}

export type EcranValeurAberrante =
  | { type: "champs"; titre: string; consigne: FragmentConsigne[]; champs: Champ[]; aides: FragmentConsigne[][]; reponse: FragmentConsigne[] }
  | {
      type: "verdict";
      titre: string;
      consigne: FragmentConsigne[];
      indicateurs: OptionChoix<ChoixIndicateur>[];
      justifications: OptionChoix<Justification>[];
      bonIndicateur: ChoixIndicateur;
      bonneJustification: Justification;
      aides: FragmentConsigne[][];
      reponse: FragmentConsigne[];
    };

const r9 = arrondi9;

function pieges(cible: number, liste: (PiegeChamp | false)[]): PiegeChamp[] {
  const vus: number[] = [];
  const resultat: PiegeChamp[] = [];
  for (const p of liste) {
    if (!p || !Number.isFinite(p.valeur)) continue;
    const v = r9(p.valeur);
    if (Math.abs(v - cible) < 1e-9 || vus.some((w) => Math.abs(w - v) < 1e-9)) continue;
    vus.push(v);
    resultat.push({ valeur: v, message: p.message });
  }
  return resultat;
}

const MESSAGE_TRI = "Range d'abord les valeurs dans l'ordre croissant : la médiane se lit sur la liste RANGÉE, pas dans l'ordre de l'énoncé.";
const MESSAGE_MOYENNE_POUR_MEDIANE = "C'est la moyenne : la médiane, elle, est une valeur de la liste rangée, repérée par son rang.";

/** Valeur(s) du milieu d'une liste NON rangée (piège « médiane sans trier »). */
function milieuxNonRanges(valeurs: readonly number[]): number[] {
  const n = valeurs.length;
  if (n % 2 === 1) return [valeurs[(n - 1) / 2]!];
  return [valeurs[n / 2 - 1]!, valeurs[n / 2]!, r9((valeurs[n / 2 - 1]! + valeurs[n / 2]!) / 2)];
}

function champMoyenne(e: ExerciceValeurAberrante, ind: Indicateurs, piegesMoyenne: (PiegeChamp | false)[], id: string): Champ {
  return {
    id,
    libelle: [texte("Moyenne "), latex("\\bar{x}")],
    unite: contexteDef(e).unite,
    cible: ind.moyenne,
    pieges: pieges(ind.moyenne, piegesMoyenne),
    messageSiFaux: `Additionne les ${ind.n} valeurs, puis divise la somme par $${ind.n}$.`,
  };
}

function champMediane(e: ExerciceValeurAberrante, ind: Indicateurs, ordre: readonly number[], id: string): Champ {
  return {
    id,
    libelle: [texte("Médiane")],
    unite: contexteDef(e).unite,
    cible: ind.mediane,
    pieges: pieges(ind.mediane, [...milieuxNonRanges(ordre).map((v) => ({ valeur: v, message: MESSAGE_TRI })), { valeur: ind.moyenne, message: MESSAGE_MOYENNE_POUR_MEDIANE }]),
    messageSiFaux: `Range les ${ind.n} valeurs, puis prends la première dont le rang dépasse strictement $\\dfrac{n}{2} = ${nombreLatex(ind.n / 2)}$.`,
  };
}

/** Réponse d'un écran à champs : « x̄ = 3 731,25 € ; médiane = 2 650 € ». */
export function reponseIndicateurs(e: ExerciceValeurAberrante, ind: Indicateurs): FragmentConsigne[] {
  return [latex(`\\bar{x} = ${nombreLatex(ind.moyenne)}`), texte(`${uniteApres(e)} ; médiane = ${valeurTexte(e, ind.mediane)}`)];
}

/** Aide « seuil » de la médiane : liste rangée + seuil n/2 (le rang reste à trouver). */
function aideMediane(ind: Indicateurs): FragmentConsigne[] {
  return [
    texte(`Médiane : les ${ind.n} valeurs rangées dans l'ordre croissant sont ${listeTexte(ind.triees)}. La médiane est la première valeur dont le rang dépasse strictement le seuil : `),
    latex(`\\dfrac{n}{2} = \\dfrac{${ind.n}}{2} = ${nombreLatex(ind.n / 2)}`),
  ];
}

function ecranA(e: ExerciceValeurAberrante): EcranValeurAberrante {
  const ind = indicateursComplets(e);
  const n = ind.n;
  return {
    type: "champs",
    titre: titresEcrans(e)[0]!,
    consigne: [texte(`Calcule la moyenne et la médiane des ${n} valeurs de la série.`)],
    champs: [
      champMoyenne(
        e,
        ind,
        [
          { valeur: ind.somme / (n - 1), message: `Vérifie l'effectif : la série compte $${n}$ valeurs.` },
          { valeur: ind.somme / (n + 1), message: `Vérifie l'effectif : la série compte $${n}$ valeurs.` },
          { valeur: ind.mediane, message: "C'est la médiane : la moyenne se calcule avec la somme de toutes les valeurs." },
        ],
        "moyenne",
      ),
      champMediane(e, ind, e.valeurs, "mediane"),
    ],
    aides: [[texte(`Moyenne : additionne toutes les valeurs, puis divise la somme par leur nombre, ici ${n} : `), latex(`\\bar{x} = \\dfrac{x_1 + x_2 + \\ldots + x_{${n}}}{${n}}`)], aideMediane(ind)],
    reponse: reponseIndicateurs(e, ind),
  };
}

function ecranB(e: ExerciceValeurAberrante): EcranValeurAberrante {
  const tout = indicateursComplets(e);
  const ind = indicateursSansExtreme(e);
  const x = valeurRetiree(e);
  const n = ind.n;
  const vx = nombreLatex(x);
  return {
    type: "champs",
    titre: titresEcrans(e)[1]!,
    consigne: [texte(`On retire ${laValeurRetiree(e)}, ${valeurTexte(e, x)}. Recalcule la moyenne et la médiane des ${n} valeurs restantes.`)],
    champs: [
      champMoyenne(
        e,
        ind,
        [
          { valeur: tout.moyenne, message: `La moyenne change quand on retire une valeur : recalcule-la avec les $${n}$ valeurs restantes.` },
          { valeur: ind.somme / (n + 1), message: `Il ne reste que $${n}$ valeurs : divise par $${n}$, pas par $${n + 1}$.` },
          { valeur: tout.somme / n, message: `Retire d'abord $${vx}$ de la somme des valeurs.` },
          { valeur: ind.mediane, message: "C'est la médiane : la moyenne se calcule avec la somme des valeurs restantes." },
        ],
        "moyenne-sans",
      ),
      champMediane(e, ind, valeursRestantes(e), "mediane-sans"),
    ],
    aides: [
      [texte(`Moyenne : il reste ${n} valeurs ; leur somme est l'ancienne somme moins la valeur retirée : `), latex(`\\bar{x} = \\dfrac{\\Sigma x_i - ${vx}}{${n}}`)],
      aideMediane(ind),
    ],
    reponse: reponseIndicateurs(e, ind),
  };
}

export const LIBELLES_INDICATEURS: Record<ChoixIndicateur, string> = {
  moyenne: "La moyenne",
  mediane: "La médiane",
  "les-deux": "Les deux se valent",
};

export function texteJustification(e: ExerciceValeurAberrante, j: Justification): string {
  const x = valeurTexte(e, valeurRetiree(e));
  const haut = plusGrande(e);
  switch (j) {
    case "extreme":
      return `${haut ? "La plus grande valeur" : "La plus petite valeur"}, ${x}, est très éloignée des autres : elle tire la moyenne vers le ${haut ? "haut" : "bas"}, alors que la médiane, qui ne dépend que du rang des valeurs, ne bouge presque pas.`;
    case "aucune":
      return `Aucune valeur n'est très éloignée des autres : la moyenne et la médiane sont proches et changent à peine sans ${laValeurRetiree(e)}.`;
    case "moyenne-toujours":
      return "La moyenne utilise toutes les valeurs : elle est donc toujours l'indicateur le plus représentatif.";
    case "mediane-toujours":
      return "La médiane est toujours plus représentative que la moyenne, quelle que soit la série.";
  }
}

export function bonneJustification(e: ExerciceValeurAberrante): Justification {
  return e.verdict === "mediane" ? "extreme" : "aucune";
}

export function questionVerdict(e: ExerciceValeurAberrante): string {
  return contexteDef(e).question(e.prenom);
}

/** « la moyenne passe de 3 731,25 € à 2 550 € (−1 181,25 €) ; la médiane reste 2 650 € ». */
export function comparaisonTexte(e: ExerciceValeurAberrante): string {
  const a = indicateursComplets(e);
  const b = indicateursSansExtreme(e);
  const dm = r9(b.moyenne - a.moyenne);
  const signe = dm > 0 ? "+" : "−";
  const med = a.mediane === b.mediane ? `la médiane reste ${valeurTexte(e, a.mediane)}` : `la médiane passe de ${valeurTexte(e, a.mediane)} à ${valeurTexte(e, b.mediane)}`;
  return `Sans ${valeurTexte(e, valeurRetiree(e))}, la moyenne passe de ${valeurTexte(e, a.moyenne)} à ${valeurTexte(e, b.moyenne)} (${signe}${ecartTexte(e, Math.abs(dm))}) ; ${med}.`;
}

/** Explication montrée une fois l'écran c clos (et reprise dans le corrigé). */
export function explicationVerdict(e: ExerciceValeurAberrante): FragmentConsigne[] {
  const c = contexteDef(e);
  const a = indicateursComplets(e);
  const fin =
    e.verdict === "mediane"
      ? ` La valeur ${valeurTexte(e, valeurRetiree(e))} (${c.cause}) est isolée : elle attire la moyenne, qui ${plusGrande(e) ? "dépasse" : "est sous"} presque toutes les autres valeurs, mais pas la médiane. La médiane (${valeurTexte(e, a.mediane)}) décrit mieux ${c.objet}.`
      : ` Aucune valeur n'est isolée : la moyenne (${valeurTexte(e, a.moyenne)}) et la médiane (${valeurTexte(e, a.mediane)}) sont proches et bougent à peine. Les deux décrivent bien ${c.objet} : elles se valent.`;
  return [texte(comparaisonTexte(e) + fin)];
}

function ecranC(e: ExerciceValeurAberrante): EcranValeurAberrante {
  const a = indicateursComplets(e);
  const b = indicateursSansExtreme(e);
  const uniteListe = contexteDef(e).uniteListe;
  const bon: ChoixIndicateur = e.verdict === "mediane" ? "mediane" : "les-deux";
  return {
    type: "verdict",
    titre: titresEcrans(e)[2]!,
    consigne: [texte(`${questionVerdict(e)} Choisis l'indicateur, puis la justification qui convient.`)],
    indicateurs: (["moyenne", "mediane", "les-deux"] as ChoixIndicateur[]).map((id) => ({ id, fragments: [texte(LIBELLES_INDICATEURS[id])] })),
    justifications: e.ordreJustifications.map((id) => ({ id, fragments: [texte(texteJustification(e, id))] })),
    bonIndicateur: bon,
    bonneJustification: bonneJustification(e),
    aides: [
      [
        texte(`Compare l'effet du retrait de ${valeurTexte(e, valeurRetiree(e))} sur chaque indicateur (valeurs des deux écrans précédents). Moyenne : `),
        latex(`${nombreLatex(a.moyenne)} \\to ${nombreLatex(b.moyenne)}`),
        texte(" ; médiane : "),
        latex(`${nombreLatex(a.mediane)} \\to ${nombreLatex(b.mediane)}`),
        texte(` (${uniteListe}).`),
      ],
      [
        texte(
          "Une valeur très éloignée des autres attire la moyenne, jamais la médiane, qui ne dépend que du rang. Si une seule valeur fait beaucoup bouger la moyenne, la médiane est plus représentative ; si aucune valeur n'est isolée, les deux indicateurs sont proches et se valent.",
        ),
      ],
    ],
    reponse: [texte(`${LIBELLES_INDICATEURS[bon]} — ${texteJustification(e, bonneJustification(e))}`)],
  };
}

export function ecrans(e: ExerciceValeurAberrante): EcranValeurAberrante[] {
  return [ecranA(e), ecranB(e), ecranC(e)];
}

// ---------------------------------------------------------------------------------------------
// Corrigé (papier) : calculs détaillés
// ---------------------------------------------------------------------------------------------

/** « 2 650 + 2 250 + … = 21 450 » (texte : la somme peut être longue, elle se coupe à la ligne). */
export function sommeDetaillee(valeurs: readonly number[]): string {
  return `${valeurs.map((v) => nombreTexteFr(v)).join(" + ")} = ${nombreTexteFr(valeurs.reduce((s, v) => s + v, 0))}`;
}

export function calculMoyenne(e: ExerciceValeurAberrante, ind: Indicateurs, valeurs: readonly number[]): FragmentConsigne[] {
  return [
    texte(`Somme des ${ind.n} valeurs : ${sommeDetaillee(valeurs)}. Moyenne : `),
    latex(`\\bar{x} = \\dfrac{${nombreLatex(ind.somme)}}{${ind.n}} = ${nombreLatex(ind.moyenne)}`),
    texte(`${uniteApres(e)}.`),
  ];
}

export function calculMediane(e: ExerciceValeurAberrante, ind: Indicateurs): FragmentConsigne[] {
  return [
    texte(`Liste rangée : ${listeTexte(ind.triees)}. Seuil `),
    latex(`\\dfrac{n}{2} = ${nombreLatex(ind.n / 2)}`),
    texte(` : la médiane est la ${ind.rang}e valeur, ${valeurTexte(e, ind.mediane)}.`),
  ];
}

export function conclusionVerdict(e: ExerciceValeurAberrante): string {
  return e.verdict === "mediane" ? `La médiane est l'indicateur le plus représentatif (${contexteDef(e).objet}).` : `Les deux se valent : la moyenne et la médiane décrivent toutes deux bien ${contexteDef(e).objet}.`;
}

export function piegeVerdict(e: ExerciceValeurAberrante): FragmentConsigne[] {
  const a = indicateursComplets(e);
  if (e.verdict === "mediane")
    return [
      texte(
        `Croire la moyenne toujours meilleure parce qu'elle « utilise toutes les valeurs » : ici, à cause de ${valeurTexte(e, valeurRetiree(e))}, elle vaut ${valeurTexte(e, a.moyenne)} et ${plusGrande(e) ? "dépasse" : "est sous"} presque toutes les valeurs de la série.`,
      ),
    ];
  return [texte(`Répondre « la médiane » par réflexe : sans valeur isolée, la moyenne (${valeurTexte(e, a.moyenne)}) et la médiane (${valeurTexte(e, a.mediane)}) sont proches ; aucune n'est meilleure que l'autre.`)];
}
