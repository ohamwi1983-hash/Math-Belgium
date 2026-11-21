import type { AdaptateurFeuilleExercices, FragmentConsigne, PrecisionRegroupement, RegroupementInstance, SectionExercice } from "./genererFeuilleExercices";

/**
 * Regroupement a), b), c) des exercices d'un même générateur qui ont la même consigne générale
 * (décision de l'utilisateur : « pour des économies de place et une certaine cohérence, regroupe dans
 * les feuilles d'exercices, de remédiation, d'évaluation et d'examen tous les exercices au sein d'un
 * même générateur qui ont la même consigne générale, comme pour les vrai ou faux »).
 *
 * Ce module remplit le champ `AdaptateurFeuilleExercices.regroupement` à partir de l'énoncé PAPIER
 * réel de l'instance (jamais une seconde source) : l'énoncé imprimé (`enoncePapier`, sinon
 * `construireEnonce`) est sérialisé — formules entre « $ », consigne d'une question unique après un
 * saut de ligne — puis découpé par l'expression régulière de la table `REGROUPEMENTS` : la LIGNE (les
 * données de l'instance : l'équation, « f(x) = … », « cercle d'équation … ») est recopiée telle
 * qu'elle est imprimée, la consigne commune est écrite à la forme « chaque » (« Résous chaque
 * équation par la méthode la plus rapide. »), et une précision propre à certaines variantes (« Donne
 * le rayon en valeur exacte. ») est repérée par un groupe nommé `p_<id>`. Un énoncé que le motif ne
 * reconnaît pas, un énoncé à figure (`enteteHtml`) ou à plusieurs questions (vraies questions a) b) c)
 * d'un problème) → `null` : l'instance reste un exercice ordinaire, rendu inchangé.
 *
 * Ajouter un générateur : une entrée dans `REGROUPEMENTS` (relire son énoncé papier sur TOUTES ses
 * variantes ; le motif doit reconnaître chacune — sinon elle n'est simplement jamais regroupée).
 * Écartés et raisons : `.claude/rules/feuilles-evaluations.md`, section « Regroupement a), b), c) ».
 */

type Groupes = Record<string, string | undefined>;

export interface FormeRegroupement {
  /** Motif sur l'énoncé papier sérialisé (formules entre « $ », espaces insécables lus comme des
   * espaces, apostrophe typographique lue « ' », « \n » avant la consigne d'une question unique). */
  motif: RegExp;
  /** Consigne commune (mini-syntaxe : formules entre « $ ») ; fonction : construite depuis les
   * groupes nommés du motif (partie de la consigne propre à une variante). `null` = pas de regroupement. */
  consigne: string | ((g: Groupes) => string | null);
  /** Ligne (mini-syntaxe) ; défaut : le groupe `ligne`. */
  ligne?: (g: Groupes) => string;
}

export interface SpecRegroupement {
  formes: FormeRegroupement[];
  /** Précisions fusionnables : le groupe nommé `p_<id>` du motif, non vide, active la précision `id`. */
  precisions?: Record<string, { texte: string; pluriel?: string }>;
}

/* ----------------------------------------------------------------------------------------------
 * Sérialisation de l'énoncé papier
 * -------------------------------------------------------------------------------------------- */

const lisible = (t: string) => t.replace(/[   ]/g, " ").replace(/’/g, "'");

/** Énoncé papier d'une instance, sérialisé — `null` s'il a une figure, plusieurs questions, ou un
 * texte qui contient « $ » (jamais vu : la sérialisation serait ambiguë). */
export function enoncePapierSerialise(section: SectionExercice): string | null {
  if (section.enteteHtml) return null;
  if (section.questions.length > 1) return null;
  const morceaux = [section.enteteFragments ?? [], ...section.questions.map((q) => q.consigne)];
  const textes: string[] = [];
  for (const fragments of morceaux) {
    let s = "";
    for (const f of fragments) {
      if (f.type === "latex") s += `$${f.valeur}$`;
      else if (f.valeur.includes("$")) return null;
      else s += lisible(f.valeur);
    }
    textes.push(s.trim());
  }
  return textes.filter((t) => t.length > 0).join("\n");
}

/** Mini-syntaxe « texte $formule$ texte » → fragments (texte vide retiré, bords sans espaces). */
export function fragmentsDepuis(miniSyntaxe: string): FragmentConsigne[] {
  const morceaux = miniSyntaxe.split("$");
  const fragments: FragmentConsigne[] = [];
  morceaux.forEach((m, i) => {
    if (i % 2 === 1) fragments.push({ type: "latex", valeur: m });
    else if (m.length > 0) fragments.push({ type: "texte", valeur: m });
  });
  const premier = fragments[0];
  if (premier?.type === "texte") premier.valeur = premier.valeur.replace(/^\s+/, "");
  const dernier = fragments[fragments.length - 1];
  if (dernier?.type === "texte") dernier.valeur = dernier.valeur.replace(/\s+$/, "");
  return fragments.filter((f) => f.type === "latex" || f.valeur.length > 0);
}

/** Première lettre en minuscule (« Détermine … » → « détermine … »), pour une consigne précédée de
 * « Dans chaque cas, ». */
export function minusculeInitiale(t: string): string {
  return t.length === 0 ? t : t[0].toLocaleLowerCase("fr") + t.slice(1);
}

/** Découpe un énoncé papier sérialisé selon une spécification (fonction pure, testée seule). */
export function decouperEnonce(spec: SpecRegroupement, enonce: string): RegroupementInstance | null {
  for (const forme of spec.formes) {
    const m = forme.motif.exec(enonce);
    if (!m) continue;
    const g: Groupes = m.groups ?? {};
    const consigne = typeof forme.consigne === "string" ? forme.consigne : forme.consigne(g);
    if (consigne === null) continue;
    const ligne = forme.ligne ? forme.ligne(g) : g.ligne;
    if (!ligne) continue;
    const precisions: PrecisionRegroupement[] = [];
    for (const [nom, valeur] of Object.entries(g)) {
      if (!nom.startsWith("p_") || !valeur) continue;
      const id = nom.slice(2);
      const p = spec.precisions?.[id];
      if (!p) continue;
      precisions.push({ id, fragments: fragmentsDepuis(p.texte), ...(p.pluriel ? { pluriel: fragmentsDepuis(p.pluriel) } : {}) });
    }
    return { consigne: fragmentsDepuis(consigne), ligne: fragmentsDepuis(ligne), ...(precisions.length > 0 ? { precisions } : {}) };
  }
  return null;
}

/** Adaptateur identique, dont `regroupement` découpe l'énoncé papier selon `REGROUPEMENTS[id]`
 * (même enveloppe que les autres champs dans le registre). Sans entrée : adaptateur inchangé. */
export function avecRegroupement<T>(id: string, adaptateur: AdaptateurFeuilleExercices<T>): AdaptateurFeuilleExercices<T> {
  const spec = REGROUPEMENTS[id];
  if (!spec || adaptateur.regroupement) return adaptateur;
  return {
    ...adaptateur,
    regroupement: (instance) => {
      const section = adaptateur.enoncePapier ? adaptateur.enoncePapier(instance).section : adaptateur.construireEnonce(instance);
      const enonce = enoncePapierSerialise(section);
      return enonce === null ? null : decouperEnonce(spec, enonce);
    },
  };
}

/* ----------------------------------------------------------------------------------------------
 * Table des générateurs regroupés (énoncé papier « consigne + données », sans graphique ni vraies
 * questions). `M` = une formule.
 * -------------------------------------------------------------------------------------------- */

const M = String.raw`\$[^$]*\$`;
const re = (source: string) => new RegExp(`^${source}$`, "s");
/** Formule mini-syntaxe. */
const f = (latex: string) => `$${latex}$`;

/** Une seule forme « consigne fixe + une formule ». */
function simple(motif: string, consigne: string): SpecRegroupement {
  return { formes: [{ motif: re(motif), consigne }] };
}

/** « Dans chaque cas, <question> » (la question de l'énoncé, première lettre en minuscule). */
const dansChaqueCas = (g: Groupes) => (g.q ? `Dans chaque cas, ${minusculeInitiale(g.q)}` : null);
/** Remplace un démonstratif (« cette équation ») par « chaque … » — `null` s'il est absent. */
const chaque = (texte: string | undefined, cherche: string, remplace: string) => (texte && texte.includes(cherche) ? texte.replace(cherche, remplace) : null);

export const REGROUPEMENTS: Record<string, SpecRegroupement> = {
  /* ---------------------------------- 4e ---------------------------------- */
  gen1: simple(String.raw`Résous l'équation suivante par la méthode la plus rapide : (?<ligne>${M})\.`, "Résous chaque équation par la méthode la plus rapide."),
  gen2: simple(String.raw`Résous l'inéquation suivante à l'aide d'un tableau de signes : (?<ligne>${M})\.`, "Résous chaque inéquation à l'aide d'un tableau de signes."),
  gen3: simple(
    String.raw`Simplifie au maximum la fraction rationnelle (?<ligne>${M}), après avoir déterminé ses conditions d'existence\.`,
    "Simplifie au maximum chaque fraction rationnelle, après avoir déterminé ses conditions d'existence.",
  ),
  gen4: simple(String.raw`Résous dans ℝ l'équation (?<ligne>${M})\.`, "Résous dans ℝ chaque équation."),
  gen5: simple(
    String.raw`Résous l'inéquation suivante en étudiant le signe de chacun de ses facteurs : (?<ligne>${M})\.`,
    "Résous chaque inéquation en étudiant le signe de chacun de ses facteurs.",
  ),
  gen6: { formes: [{ motif: re(String.raw`Résous dans (?<R>${M}) l'inéquation suivante : (?<ligne>${M})\.`), consigne: (g) => `Résous dans ${g.R} chaque inéquation.` }] },
  gen7: {
    formes: [{ motif: re(String.raw`On considère la fonction (?<ligne>${M})\. Étudie cette fonction du second degré : (?<s>.+)`), consigne: (g) => `Étudie chaque fonction du second degré : ${g.s}` }],
  },
  gen116: {
    formes: [{ motif: re(String.raw`Résous dans ℝ l'équation \$(?<eq>[^$]*?)(?:\\text\{\.\})?\$\.?`), consigne: "Résous dans ℝ chaque équation.", ligne: (g) => f(g.eq ?? "") }],
  },
  gen115: {
    formes: [
      {
        motif: re(String.raw`(?<debut>m est un nombre réel\. Discute, selon les valeurs de m, le nombre de solutions de )l'équation \(E\)(?<milieu>, d'inconnue x\..*?)\s*\$\{?\(E\)\\ :\\ (?<eq>[^$]*?)\}?\$\.?`),
        consigne: (g) => `${g.debut}chaque équation${g.milieu}`,
        ligne: (g) => f(`{${g.eq}}`),
      },
    ],
  },
  gen13: { formes: [{ motif: re(String.raw`Étudie algébriquement la fonction (?<ligne>${M}) : (?<s>.+)`), consigne: (g) => `Étudie algébriquement chaque fonction : ${g.s}` }] },
  gen14: { formes: [{ motif: re(String.raw`On considère l'angle orienté (?<ligne>${M})\. Situe cet angle (?<s>.+)`), consigne: (g) => `Situe chaque angle orienté ${g.s}` }] },
  gen15: {
    formes: [
      { motif: re(String.raw`On considère l'angle (?<ligne>${M})\. Donne, sans calculatrice, la valeur exacte de (?<s>.+)\.`), consigne: (g) => `Donne, sans calculatrice, la valeur exacte de ${g.s} pour chaque angle.` },
    ],
  },
  gen16: { formes: [{ motif: re(String.raw`On donne (?<ligne>${M}, avec ${M})\. (?<q>Calcule .+)`), consigne: dansChaqueCas }] },
  gen17: {
    formes: [
      {
        motif: re(String.raw`Sachant que (?<donnees>.+), détermine sans calculatrice une valeur approchée de (?<cible>${M}) \(au millième\)\.`),
        consigne: "Détermine sans calculatrice une valeur approchée de chaque nombre (au millième), à l'aide des valeurs données.",
        ligne: (g) => `${g.cible}, sachant que ${g.donnees}`,
      },
    ],
  },
  gen18: {
    formes: [
      {
        motif: re(String.raw`On considère l'équation (?<ligne>${M}), avec (?<int>${M})\. Trouve toutes les valeurs de α satisfaisant cette équation dans cet intervalle\.`),
        consigne: (g) => `Trouve, pour chaque équation, toutes les valeurs de ${g.int} qui la satisfont.`,
      },
    ],
  },
  gen76: simple(String.raw`Calcule, sans calculatrice, la valeur exacte de : (?<ligne>${M})\.?`, "Calcule, sans calculatrice, la valeur exacte de chaque expression."),
  gen78: {
    formes: [{ motif: re(String.raw`Résous l'équation (?<ligne>${M}) pour (?<int>${M})\.(?<p_dixieme> Donne les angles au dixième de degré\.)?`), consigne: (g) => `Résous chaque équation pour ${g.int}.` }],
    precisions: { dixieme: { texte: "Donne les angles au dixième de degré." } },
  },
  gen22: {
    formes: [
      {
        motif: re(String.raw`On donne les vecteurs (?<vec>${M})(?:, ainsi que les points (?<pts>${M}))?\. Calcule les composantes du vecteur (?<t>${M})\.`),
        consigne: String.raw`Calcule, dans chaque cas, les composantes du vecteur $\vec{t}$.`,
        ligne: (g) => `${g.vec}${g.pts ? `, ${g.pts}` : ""} ; ${g.t}`,
      },
    ],
  },
  gen24: { formes: [{ motif: re(String.raw`On donne les (?:vecteurs|points) (?<ligne>${M})\. (?<q>.+)`), consigne: dansChaqueCas }] },
  gen25: { formes: [{ motif: re(String.raw`On donne les (?:vecteurs|points) (?<ligne>${M})\. (?<q>.+)`), consigne: dansChaqueCas }] },
  gen26: {
    formes: [
      {
        // La norme visée est une donnée de l'instance : elle va dans la ligne, pas dans la consigne.
        motif: re(String.raw`On donne le vecteur (?<v>${M}), où \$x\$ est un réel\. Détermine la ou les valeurs de \$x\$ pour lesquelles (?<norme>${M}), s'il en existe\.`),
        consigne: String.raw`Dans chaque cas, détermine la ou les valeurs du réel $x$ pour lesquelles le vecteur a la norme indiquée, s'il en existe.`,
        ligne: (g) => `${g.v} ; ${g.norme}`,
      },
      { motif: re(String.raw`On donne (?:le vecteur|les points) (?<ligne>${M})\. (?<q>.+)`), consigne: dansChaqueCas },
    ],
  },
  gen42: {
    formes: [
      {
        motif: re(String.raw`La droite d passe par (?<d>.+?)\. (?<q>Si c'est possible, .+|Détermine .+)`),
        consigne: (g) => `Pour chaque droite d : ${minusculeInitiale(g.q ?? "")}`,
        ligne: (g) => `d passe par ${g.d}`,
      },
    ],
  },
  gen44: {
    formes: [
      {
        motif: re(String.raw`Trace, dans un repère orthonormé sur ta feuille, la droite d (?:dont des équations paramétriques sont|d'équation) ?:\s*(?<ligne>${M})\.?`),
        consigne: "Trace, dans un repère orthonormé sur ta feuille, chacune des droites suivantes.",
      },
    ],
  },
  gen45: {
    formes: [
      {
        motif: re(String.raw`On donne la droite :\s*(?<d>${M})\n(?<q1>Détermine .+? passant par le point )\$(?<nom>[A-Z])(?<coord>\([^$]*\))\$(?<q2> et .+)`),
        consigne: (g) => `Dans chaque cas, ${minusculeInitiale(g.q1 ?? "")}${f(g.nom ?? "")}${g.q2}`,
        ligne: (g) => `${g.d} ; ${f(`${g.nom}${g.coord}`)}`,
      },
      { motif: re(String.raw`On donne les droites :\s*(?<ligne>${M})\n(?<q>.+)`), consigne: dansChaqueCas },
    ],
  },
  gen46: {
    formes: [{ motif: re(String.raw`On donne la droite d d'(?:équation|équations paramétriques) :\s*(?<ligne>${M})\n(?<q>.+)`), consigne: (g) => `Pour chaque droite d, ${minusculeInitiale(g.q ?? "")}` }],
  },
  gen47: { formes: [{ motif: re(String.raw`On donne :\s*(?<ligne>${M})\n(?<q>.+)`), consigne: dansChaqueCas }] },
  gen48: { formes: [{ motif: re(String.raw`On donne les droites :\s*(?<ligne>${M})\n(?<q>.+)`), consigne: dansChaqueCas }] },
  gen50: {
    formes: [
      {
        motif: re(String.raw`Détermine le centre et le rayon du (?<ligne>cercle d'équation ${M})\.(?<p_exacte> Donne le rayon en valeur exacte\.)?`),
        consigne: "Détermine le centre et le rayon de chaque cercle.",
      },
    ],
    precisions: { exacte: { texte: "Donne le rayon en valeur exacte.", pluriel: "Donne les rayons en valeur exacte." } },
  },
  gen52: simple(
    String.raw`Détermine le sommet S, le foyer F, le paramètre p et l'équation de la directrice d de la (?<ligne>parabole d'équation ${M})\.`,
    "Détermine le sommet S, le foyer F, le paramètre p et l'équation de la directrice d de chaque parabole.",
  ),
  gen11: {
    formes: [{ motif: re(String.raw`On considère la fonction (?<ligne>${M})\.\nDétermine la forme canonique de la fonction(?<s>.*)`), consigne: (g) => `Détermine la forme canonique de chaque fonction${g.s}` }],
  },
  gen30: {
    formes: [
      {
        motif: re(String.raw`Voici la répartition (?<serie>.+?)\.\nConstruis le tableau de fréquences complet de cette série(?<s>.*)`),
        consigne: (g) => `Construis le tableau de fréquences complet de chaque série${g.s}`,
        ligne: (g) => `Répartition ${g.serie}.`,
      },
    ],
  },
  gen113: { formes: [{ motif: re(String.raw`Équation : (?<ligne>${M})\.\n(?<q>.+)`), consigne: (g) => chaque(g.q, "cette équation", "chaque équation") }] },
  gen114: { formes: [{ motif: re(String.raw`Équation : (?<ligne>${M})\.\n(?<q>.+)`), consigne: (g) => chaque(g.q, "cette équation", "chaque équation") }] },
  gen126: {
    formes: [
      {
        motif: re(String.raw`On donne \$(?<fx>[^$]*?)(?:\\text\{\.\})?\$\.?\n(?<q>Écris f .+)`),
        consigne: (g) => `Pour chaque fonction f : ${minusculeInitiale(g.q ?? "")}`,
        ligne: (g) => f(g.fx ?? ""),
      },
    ],
  },

  /* ---------------------------------- 5e ---------------------------------- */
  "5gen1": simple(String.raw`On considère la fonction (?<ligne>${M})\. Détermine son domaine de définition, en justifiant\.`, "Détermine le domaine de définition de chaque fonction, en justifiant."),
  "5gen2": { formes: [{ motif: re(String.raw`On considère la fonction (?<ligne>${M})\. Écris f comme (?<s>.+)`), consigne: (g) => `Écris chaque fonction f comme ${g.s}` }] },
  "5gen3": {
    formes: [
      {
        motif: re(String.raw`Soient les fonctions (?<fg>${M} et ${M})\. Détermine l'expression simplifiée de (?<c>${M}) et son domaine de définition\.`),
        consigne: "Dans chaque cas, détermine l'expression simplifiée de la composée indiquée et son domaine de définition.",
        ligne: (g) => `${g.fg} ; ${g.c}`,
      },
      {
        motif: re(String.raw`Soient les fonctions (?<fg>${M} et ${M})\. Détermine l'expression simplifiée de (?<c>${M} et de ${M}), ainsi que leurs domaines de définition\.`),
        consigne: "Dans chaque cas, détermine l'expression simplifiée des deux composées indiquées, ainsi que leurs domaines de définition.",
        ligne: (g) => `${g.fg} ; ${(g.c ?? "").replace(" et de ", " et ")}`,
      },
    ],
  },
  "5gen6": {
    formes: [
      {
        motif: re(String.raw`Convertis en (?<u>degrés|radians) la mesure d'angle (?<ligne>${M})(?<r> \(en radians\))?\. (?<s>.+)`),
        consigne: (g) => `Convertis en ${g.u} chaque mesure d'angle${g.r ?? ""}. ${g.s}`,
      },
    ],
  },
  "5gen8": {
    formes: [{ motif: re(String.raw`On considère la fonction sinusoïdale (?<ligne>${M})\.\n(?<q>.+)`), consigne: (g) => chaque(g.q, "de cette fonction", "de chaque fonction") }],
  },
  "5gen10": {
    formes: [
      {
        motif: re(
          String.raw`Résous l'équation (?<ligne>${M}), (?<s>d'abord dans .+?)\.(?: Arrondis au centième les valeurs qui ne sont pas (?:(?<p_exactes>exactes)|(?<p_remarquables>des angles remarquables))\.)?`,
        ),
        consigne: (g) => `Résous chaque équation, ${g.s}.`,
      },
    ],
    precisions: {
      exactes: { texte: "Arrondis au centième les valeurs qui ne sont pas exactes." },
      remarquables: { texte: "Arrondis au centième les valeurs qui ne sont pas des angles remarquables." },
    },
  },
  "5gen11": {
    formes: [
      {
        motif: re(
          String.raw`On considère la fonction (?<fx>${M})\. Détermine où f atteint (?<ext>ses minimums|ses maximums|tous ses extremums \(maximums et minimums\)) : d'abord pour tout x réel \(k désigne un entier\), puis dans (?<int>.+?)\.`,
        ),
        consigne: (g) => `Pour chaque fonction f, détermine où f atteint ${g.ext} : d'abord pour tout x réel (k désigne un entier), puis dans l'intervalle indiqué.`,
        ligne: (g) => `${g.fx}, dans ${g.int}`,
      },
    ],
  },
  "5gen16": {
    formes: [
      {
        motif: re(String.raw`On considère la (?<ligne>suite (?:arithmétique|géométrique) définie par ${M})\. Cette suite converge-t-elle ou diverge-t-elle \? (?<s>.+)`),
        consigne: (g) => `Chaque suite converge-t-elle ou diverge-t-elle ? ${g.s}`,
      },
      {
        motif: re(String.raw`On considère la suite définie, (?<n>pour n ≥ 1), par (?<u>${M})\. Étudie la limite de cette suite (?<s>.+)`),
        consigne: (g) => `Étudie la limite de chaque suite ${g.s}`,
        ligne: (g) => `${g.u}, ${g.n}`,
      },
    ],
  },
  "5gen20": { formes: [{ motif: re(String.raw`(?<ligne>${M})\n(?<q>Détermine cette limite.+)`), consigne: (g) => chaque(g.q, "cette limite", "chaque limite") }] },
  "5gen21": { formes: [{ motif: re(String.raw`On considère la fonction (?<ligne>${M})\.\n(?<q>.+)`), consigne: (g) => `Pour chaque fonction f : ${minusculeInitiale(g.q ?? "")}` }] },
  "5gen24": {
    formes: [
      {
        motif: re(String.raw`On considère la fonction (?<fx>${M})\. Étudie cette fonction : (?<s>.+?\(verticales, horizontale ou oblique\)\.)(?<rec> La courbe de f recoupe .+)?`),
        consigne: (g) => `Étudie chaque fonction : ${g.s}`,
        ligne: (g) => (g.rec ? `${g.fx} ; ${minusculeInitiale(g.rec.trim())}` : (g.fx ?? "")),
      },
    ],
  },
  "5gen26": {
    formes: [
      {
        motif: re(String.raw`On considère la fonction (?<fx>${M})\. Calcule le nombre dérivé (?<d>\S+) à partir de sa définition en termes de limite\.`),
        consigne: "Pour chaque fonction, calcule le nombre dérivé indiqué à partir de sa définition en termes de limite.",
        ligne: (g) => `${g.fx} ; ${f(g.d ?? "")}`,
      },
    ],
  },
  "5gen27": simple(String.raw`On considère la fonction (?<ligne>${M})\. Calcule sa dérivée f.?\(x\)\.`, "Calcule la dérivée de chaque fonction."),
  "5gen28": {
    formes: [
      {
        motif: re(String.raw`On considère la fonction (?<fx>${M})\.?\nDétermine l'équation de la tangente à la courbe de f au point d'abscisse (?<x>x = \S+?)\.(?<p_exactes> Donne des valeurs exactes \(racines carrées acceptées\)\.)?`),
        consigne: "Pour chaque fonction f, détermine l'équation de la tangente à la courbe de f au point d'abscisse indiqué.",
        ligne: (g) => `${g.fx}, au point d'abscisse ${g.x}`,
      },
      {
        motif: re(String.raw`On considère la fonction (?<ligne>${M})\.?\n(?<q>Détermine les points de la courbe de f où la tangente est horizontale.+)`),
        consigne: (g) => `Pour chaque fonction f, ${minusculeInitiale(g.q ?? "")}`,
      },
    ],
    precisions: { exactes: { texte: "Donne des valeurs exactes (racines carrées acceptées)." } },
  },
  "5gen29": {
    formes: [
      {
        motif: re(
          String.raw`On considère la fonction f ; (?<intro>sa dérivée f' est donnée|ses dérivées f' et f'' sont données) : (?<ligne>${M})\n(?<q>.+?)(?: (?:(?<p_exactes>Donne des valeurs exactes\.)|(?<p_abscisses>Donne les abscisses en valeur exacte ; les valeurs de f peuvent être arrondies au centième\.)))?`,
        ),
        consigne: (g) => `Dans chaque cas, on considère la fonction f ; ${g.intro}. ${g.q}`,
      },
    ],
    precisions: {
      exactes: { texte: "Donne des valeurs exactes." },
      abscisses: { texte: "Donne les abscisses en valeur exacte ; les valeurs de f peuvent être arrondies au centième." },
    },
  },
  "5gen46": { formes: [{ motif: re(String.raw`On note (?<ligne>${M}, ${M} et ${M})\. (?<q>Pour quelle.+)`), consigne: dansChaqueCas }] },
  "5gen55": {
    formes: [{ motif: re(String.raw`Résous dans (?<int>${M}) l'inéquation (?<ligne>${M})\. (?<s>Donne .+)`), consigne: (g) => `Résous dans ${g.int} chaque inéquation. ${g.s}` }],
  },
  "5gen60": {
    formes: [
      {
        motif: re(String.raw`Soient (?<fg>${M} et ${M})\. Calcule la valeur exacte de (?<c>${M}), ou justifie que ce nombre n'existe pas\.`),
        consigne: "Dans chaque cas, calcule la valeur exacte du nombre indiqué, ou justifie que ce nombre n'existe pas.",
        ligne: (g) => `${g.fg} ; ${g.c}`,
      },
    ],
  },
  "5gen62": { formes: [{ motif: re(String.raw`Soit (?<ligne>${M} et ${M})\. (?<q>Détermine .+)`), consigne: dansChaqueCas }] },

  /* ---------------------------------- 6e ---------------------------------- */
  "6gen1": { formes: [{ motif: re(String.raw`On considère la fonction (?<ligne>${M})\. (?<s>Détermine son domaine\..+)`), consigne: (g) => `Pour chaque fonction f : ${minusculeInitiale(g.s ?? "")}` }] },
  "6gen2": simple(String.raw`Cette expression existe-t-elle \? Si oui, donne sa valeur exacte\. (?<ligne>${M})\.?`, "Chaque expression existe-t-elle ? Si oui, donne sa valeur exacte."),
  "6gen3": simple(String.raw`Résous dans ℝ l'équation (?<ligne>${M}), en justifiant chaque étape\.`, "Résous dans ℝ chaque équation, en justifiant chaque étape."),
  "6gen4": simple(String.raw`Dérive la fonction suivante : (?<ligne>${M})\s*Simplifie le résultat\.`, "Dérive chaque fonction et simplifie le résultat."),
  "6gen157": { formes: [{ motif: re(String.raw`Étudie la fonction (?<ligne>${M}) : (?<s>.+)`), consigne: (g) => `Étudie chaque fonction : ${g.s}` }] },
  "6gen6": simple(String.raw`Calcule la limite suivante : (?<ligne>${M})\s*Justifie chaque étape\.`, "Calcule chaque limite. Justifie chaque étape."),
  "6gen7": simple(String.raw`Détermine le domaine puis calcule la dérivée de la fonction suivante : (?<ligne>${M})\.?`, "Détermine le domaine puis calcule la dérivée de chaque fonction."),
  "6gen9": simple(String.raw`Résous l'équation suivante : (?<ligne>${M})\s*Justifie chaque étape\.`, "Résous chaque équation. Justifie chaque étape."),
  "6gen10": simple(String.raw`Résous l'inéquation suivante : (?<ligne>${M})\.`, "Résous chaque inéquation."),
  "6gen145": { formes: [{ motif: re(String.raw`Calcule (?<ligne>${M}) sans calculatrice\. (?<s>Justifie .+)`), consigne: (g) => `Calcule chaque limite sans calculatrice. ${g.s}` }] },
  "6gen13": {
    formes: [
      {
        motif: re(String.raw`Sachant que (?<don>.+?), exprime en fonction de (?<vars>.+?) l'expression suivante : (?<ligne>${M})\.`),
        consigne: (g) => `Sachant que ${g.don}, exprime chaque expression en fonction de ${g.vars}.`,
      },
      {
        motif: re(String.raw`Sachant que (?<don>.+?), exprime d'abord la première expression (?<s>.+?) : (?<ligne>${M})\.`),
        consigne: (g) => `Sachant que ${g.don}, exprime, dans chaque cas, d'abord la première expression ${g.s}.`,
      },
    ],
  },
  "6gen14": {
    formes: [{ motif: re(String.raw`Résous l'équation suivante : (?<ligne>${M})\.(?<p_millieme> Donne chaque solution en valeur exacte ou arrondie au millième\.)?`), consigne: "Résous chaque équation." }],
    precisions: { millieme: { texte: "Donne chaque solution en valeur exacte ou arrondie au millième." } },
  },
  "6gen15": {
    formes: [
      {
        motif: re(String.raw`Résous l'inéquation logarithmique suivante : (?<ineq>${M})(?:\.|(?<suite>, où .+))`),
        consigne: "Résous chaque inéquation logarithmique.",
        ligne: (g) => `${g.ineq}${g.suite ?? ""}`,
      },
    ],
  },
  "6gen16": { formes: [{ motif: re(String.raw`Soit (?<ligne>${M})\. (?<q>.+)`), consigne: (g) => `Pour chaque fonction f : ${minusculeInitiale(g.q ?? "")}` }] },
  "6gen17": simple(String.raw`Calcule la limite suivante : (?<ligne>${M})\.?`, "Calcule chaque limite."),
  "6gen19": {
    formes: [
      {
        motif: re(String.raw`(?<rappel>Rappel : .+?\.) On donne (?<ligne>${M})\.\n(?<q>.+)`),
        consigne: (g) => `${g.rappel} ${chaque(g.q, "de cette fonction", "de chaque fonction") ?? `Dans chaque cas, ${minusculeInitiale(g.q ?? "")}`}`,
      },
    ],
  },
  "6gen87": {
    formes: [
      {
        motif: re(String.raw`On considère la fonction (?<fx>${M}) et son graphique \$C_f\$\. Détermine l'équation de la tangente à \$C_f\$ au point d'abscisse (?<x>${M})\. (?<s>Donne .+)`),
        consigne: (g) => `Pour chaque fonction f, de graphique $C_f$, détermine l'équation de la tangente à $C_f$ au point d'abscisse $x_0$ indiqué. ${g.s}`,
        ligne: (g) => `${g.fx}, ${g.x}`,
      },
      {
        motif: re(String.raw`On considère la fonction (?<fx>${M}) et son graphique \$C_f\$\. Détermine les équations de toutes les tangentes à \$C_f\$ parallèles à la droite (?<d>${M})\. (?<s>Donne .+)`),
        consigne: (g) => `Pour chaque fonction f, de graphique $C_f$, détermine les équations de toutes les tangentes à $C_f$ parallèles à la droite d indiquée. ${g.s}`,
        ligne: (g) => `${g.fx}, ${g.d}`,
      },
      {
        motif: re(String.raw`On considère la fonction (?<fx>${M}) et son graphique \$C_f\$\. Détermine l'équation de la tangente à \$C_f\$ qui passe par le point (?<p>${M})(?:, origine du repère)?\. (?<s>Donne .+)`),
        consigne: (g) => `Pour chaque fonction f, de graphique $C_f$, détermine l'équation de la tangente à $C_f$ qui passe par le point P indiqué. ${g.s}`,
        ligne: (g) => `${g.fx}, ${g.p}`,
      },
    ],
  },
  "6gen23": {
    formes: [{ motif: re(String.raw`Calcule une primitive F de la fonction f définie par (?<ligne>${M})(?<m> .+?)?\.`), consigne: (g) => `Calcule une primitive F de chaque fonction f${g.m ?? ""}.` }],
  },
  "6gen24": {
    formes: [
      {
        motif: re(String.raw`Détermine la primitive F de la fonction f définie par (?<fx>${M})(?: sur l'intervalle (?<i>${M}))? qui vérifie (?<c>${M})(?<m>, en calculant .+?)?\. (?<s>Donne .+)`),
        consigne: (g) => `Pour chaque fonction f, détermine la primitive F qui vérifie la condition indiquée${g.m ?? ""}. ${g.s}`,
        ligne: (g) => `${g.fx}${g.i ? ` sur ${g.i}` : ""} ; ${g.c}`,
      },
    ],
  },
  "6gen25": {
    formes: [
      {
        motif: re(String.raw`Calcule (?<int>${M}), où (?<fx>${M})(?<m> \(calcule une primitive de f [^)]*\))?\. (?<s>Donne .+)`),
        consigne: (g) => `Calcule chaque intégrale${g.m ?? ""}. ${g.s}`,
        ligne: (g) => `${g.int}, où ${g.fx}`,
      },
      {
        motif: re(String.raw`On considère la fonction f définie par (?<fx>${M})\. Détermine la ou les valeurs du réel m(?<app> appartenant à l'intervalle ${M})? telles que (?<eg>${M})\. (?<s>Donne .+)`),
        consigne: (g) => `Pour chaque fonction f, détermine la ou les valeurs du réel m telles que l'égalité indiquée soit vraie. ${g.s}`,
        ligne: (g) => `${g.fx} ; ${g.eg}${g.app ? `, m${g.app}` : ""}`,
      },
    ],
  },
  "6gen26": {
    formes: [{ motif: re(String.raw`(?<intro>.+?) Données : (?<ligne>.+?)\. (?<outro>(?:Calcule|Détermine) .+)`), consigne: (g) => `Dans chaque cas, ${minusculeInitiale(g.intro ?? "")} ${g.outro}` }],
  },
  "6gen27": {
    formes: [{ motif: re(String.raw`(?<intro>.+?) Données : (?<ligne>.+?)\. (?<outro>(?:Rappel|Calcule|Détermine) .+)`), consigne: (g) => `Dans chaque cas, ${minusculeInitiale(g.intro ?? "")} ${g.outro}` }],
  },
  "6gen28": {
    formes: [
      {
        motif: re(String.raw`(?<intro>.+?) Données : (?<don>.+?)\.(?<sub> Utilise la substitution ${M}\.)? (?<outro>Calcule .+)`),
        consigne: (g) => `Dans chaque cas, ${minusculeInitiale(g.intro ?? "")} ${g.outro}`,
        ligne: (g) => (g.sub ? `${g.don} ; ${minusculeInitiale(g.sub.trim())}` : (g.don ?? "")),
      },
    ],
  },
  "6gen34": simple(String.raw`Calcule et écris le résultat sous la forme \$a\+bi\$ : (?<ligne>${M})\.`, "Calcule et écris chaque résultat sous la forme $a+bi$."),
  "6gen35": {
    formes: [
      { motif: re(String.raw`Soit (?<ligne>\$z=[^$]*\$)\. (?<q>Calcule .+)`), consigne: dansChaqueCas },
      { motif: re(String.raw`Détermine les racines carrées complexes de (?<ligne>${M})\. (?<s>.+)`), consigne: (g) => `Détermine les racines carrées complexes de chaque nombre. ${g.s}` },
      {
        // « A, B, C sont 3 points… » / « A et B sont 2 points… » : le nom de point garde sa majuscule.
        motif: re(String.raw`(?<intro>A(?:, B, C sont 3| et B sont 2) points du plan, donnés par leurs affixes)\. (?<q>.+?) Données : (?<ligne>${M})\.`),
        consigne: (g) => `Dans chaque cas, ${g.intro}. ${g.q}`,
      },
    ],
  },
  "6gen36": {
    formes: [
      {
        motif: re(String.raw`Résous dans ℂ l'équation (?<eq>${M})(?<p_conjugue>, où \$\\bar z\$ désigne le conjugué de \$z\$)?\.(?<rac> Le polynôme admet .+?\.)? Donne les solutions sous la forme \$a\+bi\$\.`),
        consigne: "Résous dans ℂ chaque équation. Donne les solutions sous la forme $a+bi$.",
        ligne: (g) => (g.rac ? `${g.eq} (${minusculeInitiale(g.rac.trim().replace(/\.$/, ""))})` : (g.eq ?? "")),
      },
    ],
    precisions: { conjugue: { texte: String.raw`$\bar z$ désigne le conjugué de $z$.` } },
  },
  "6gen37": { formes: [{ motif: re(String.raw`(?:Soit|On donne) (?<ligne>${M}(?: et ${M})?)\. (?<q>.+)`), consigne: dansChaqueCas }] },
  "6gen38": (() => {
    const fin = String.raw` par le binôme de Newton\. On rappelle la formule de Moivre : .+`;
    const developpe = String.raw`en développant \$\(\\cos\(x\)\+i\\sin\(x\)\)\^\{\k<n>\}\$`;
    const suite = String.raw`en développant $(\cos(x)+i\sin(x))^{n}$ par le binôme de Newton. On rappelle la formule de Moivre : $(\cos(x)+i\sin(x))^{n}=\cos(nx)+i\sin(nx)$.`;
    return {
      formes: [
        {
          motif: re(String.raw`Exprime \$\\cos\((?<n>\d+)x\)\$ et \$\\sin\(\k<n>x\)\$ en fonction de \$\\cos\(x\)\$ et \$\\sin\(x\)\$, ${developpe}${fin}`),
          consigne: String.raw`Exprime $\cos(nx)$ et $\sin(nx)$ en fonction de $\cos(x)$ et $\sin(x)$ pour chaque valeur de n, ${suite}`,
          ligne: (g) => f(`n=${g.n}`),
        },
        {
          motif: re(String.raw`Exprime \$\\cos\((?<n>\d+)x\)\$ en fonction de \$\\cos\(x\)\$ seulement, ${developpe}${fin}`),
          consigne: String.raw`Exprime $\cos(nx)$ en fonction de $\cos(x)$ seulement pour chaque valeur de n, ${suite}`,
          ligne: (g) => f(`n=${g.n}`),
        },
        {
          motif: re(String.raw`Exprime \$\\frac\{\\sin\((?<n>\d+)x\)\}\{\\sin\(x\)\}\$ en fonction de \$\\cos\(x\)\$ seulement, ${developpe}${fin}`),
          consigne: String.raw`Exprime $\frac{\sin(nx)}{\sin(x)}$ en fonction de $\cos(x)$ seulement pour chaque valeur de n, ${suite}`,
          ligne: (g) => f(`n=${g.n}`),
        },
      ],
    };
  })(),
  "6gen40": {
    formes: [
      {
        motif: re(String.raw`Le point P a pour affixe (?<zp>${M})\. Calcule l'affixe de son image P. par (?<t>.+)\.`),
        consigne: "Dans chaque cas, calcule l'affixe de l'image P′ du point P par la transformation indiquée.",
        ligne: (g) => `${g.zp} ; ${g.t}`,
      },
      {
        motif: re(String.raw`On considère la transformation du plan qui associe au point M d'affixe \$z\$ le point M. d'affixe (?<ligne>${M})\. (?<s>Détermine .+)`),
        consigne: (g) => `Dans chaque cas, on considère la transformation du plan qui associe au point M d'affixe $z$ le point M′ d'affixe $z'$ indiquée. ${g.s}`,
      },
    ],
  },
  "6gen93": { formes: [{ motif: re(String.raw`Linéarise (?<ligne>${M}) : écris-la (?<s>.+)`), consigne: (g) => `Linéarise chaque fonction : écris-la ${g.s}` }] },
  "6gen98": {
    formes: [
      {
        motif: re(String.raw`On considère l'ensemble E des points M du plan complexe dont l'affixe \$z\$ vérifie (?<ligne>.+?)\.\n(?<q>.+)`),
        consigne: (g) => `Dans chaque cas, on considère l'ensemble E des points M du plan complexe dont l'affixe $z$ vérifie la condition indiquée. ${g.q}`,
      },
    ],
  },
  "6gen149": {
    formes: [
      {
        motif: re(String.raw`Soit (?<fx>${M})\. Détermine l'équation de la tangente à la courbe de \$f\$ au point d'abscisse (?<x>${M}) (?<s>\(.+\))\.`),
        consigne: (g) => `Pour chaque fonction f, détermine l'équation de la tangente à la courbe de $f$ au point d'abscisse indiqué ${g.s}.`,
        ligne: (g) => `${g.fx}, au point d'abscisse ${g.x}`,
      },
    ],
  },
};
