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
 * reconnaît pas ou à plusieurs questions (vraies questions a) b) c) d'un problème) → `null` :
 * l'instance reste un exercice ordinaire, rendu inchangé. Générateurs à GRAPHIQUE (entrée
 * `figure: true`) : la figure de l'énoncé papier (`enteteHtml`) devient celle de la ligne
 * (`figureHtml`, recopiée telle quelle), la ligne de texte peut être vide (gen10 : la courbe est la
 * seule donnée) ; sans `figure: true`, un énoncé à figure n'est jamais regroupé.
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
  /** Générateur à graphique : consigne et ligne quand toutes les lignes du groupe ont la même figure
   * (imprimée une seule fois, sous la consigne). */
  figureCommune?: { consigne: (g: Groupes) => string; ligne: (g: Groupes) => string };
}

export interface SpecRegroupement {
  formes: FormeRegroupement[];
  /** Précisions fusionnables : le groupe nommé `p_<id>` du motif, non vide, active la précision `id`. */
  precisions?: Record<string, { texte: string; pluriel?: string }>;
  /** Générateur à graphique : l'énoncé papier peut avoir une figure (`enteteHtml`), qui devient la
   * figure de la ligne ; la ligne de texte peut alors être vide. */
  figure?: boolean;
}

/* ----------------------------------------------------------------------------------------------
 * Sérialisation de l'énoncé papier
 * -------------------------------------------------------------------------------------------- */

const lisible = (t: string) => t.replace(/[   ]/g, " ").replace(/’/g, "'");

/** Énoncé papier d'une instance, sérialisé — `null` s'il a une figure (sauf `avecFigure` : générateur
 * à graphique, la figure est rendue à part), plusieurs questions, ou un texte qui contient « $ »
 * (jamais vu : la sérialisation serait ambiguë). */
export function enoncePapierSerialise(section: SectionExercice, avecFigure = false): string | null {
  if (section.enteteHtml && !avecFigure) return null;
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

/** Découpe un énoncé papier sérialisé selon une spécification (fonction pure, testée seule).
 * `figureHtml` : figure de l'énoncé papier (générateur à graphique), recopiée dans la ligne. */
export function decouperEnonce(spec: SpecRegroupement, enonce: string, figureHtml?: string): RegroupementInstance | null {
  for (const forme of spec.formes) {
    const m = forme.motif.exec(enonce);
    if (!m) continue;
    const g: Groupes = m.groups ?? {};
    const consigne = typeof forme.consigne === "string" ? forme.consigne : forme.consigne(g);
    if (consigne === null) continue;
    // Générateur à graphique : la ligne de texte peut être vide (la figure est la donnée).
    const ligne = (forme.ligne ? forme.ligne(g) : g.ligne) ?? (spec.figure ? "" : undefined);
    if (ligne === undefined || (!ligne && !(spec.figure && figureHtml))) continue;
    const precisions: PrecisionRegroupement[] = [];
    for (const [nom, valeur] of Object.entries(g)) {
      if (!nom.startsWith("p_") || !valeur) continue;
      const id = nom.slice(2);
      const p = spec.precisions?.[id];
      if (!p) continue;
      precisions.push({ id, fragments: fragmentsDepuis(p.texte), ...(p.pluriel ? { pluriel: fragmentsDepuis(p.pluriel) } : {}) });
    }
    return {
      consigne: fragmentsDepuis(consigne),
      ligne: fragmentsDepuis(ligne),
      ...(precisions.length > 0 ? { precisions } : {}),
      ...(spec.figure && figureHtml ? { figureHtml } : {}),
      ...(spec.figure && figureHtml && forme.figureCommune
        ? { figureCommune: { consigne: fragmentsDepuis(forme.figureCommune.consigne(g)), ligne: fragmentsDepuis(forme.figureCommune.ligne(g)) } }
        : {}),
    };
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
      const enonce = enoncePapierSerialise(section, !!spec.figure);
      return enonce === null ? null : decouperEnonce(spec, enonce, section.enteteHtml);
    },
  };
}

/* ----------------------------------------------------------------------------------------------
 * Table des générateurs regroupés (énoncé papier « consigne + données », sans vraies questions ;
 * générateurs à graphique : entrées `fig(…)` en fin de table). `M` = une formule.
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

/** Générateur à graphique : une figure par ligne (`figure: true`). */
const fig = (...formes: FormeRegroupement[]): SpecRegroupement => ({ figure: true, formes });
/** Formule sans le point (ou la virgule `{,}`) final écrit DANS la formule (« $f(x)<0.$ »). */
const sansPointFinal = (m: string | undefined) => (m ?? "").replace(/(?:\.|\{,\})\$$/, "$");
/** « Lis sur le graphique » → « Lis sur chaque graphique » (première occurrence de chaque tournure). */
function surChaque(q: string | undefined): string {
  let t = q ?? "";
  for (const [a, b] of [
    ["sur le graphique", "sur chaque graphique"],
    ["Par lecture du graphique", "Par lecture de chaque graphique"],
    ["sur la figure", "sur chaque figure"],
  ] as const)
    t = t.replace(a, b);
  return t;
}

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
  gen98: {
    formes: [
      { motif: re(String.raw`On donne les cercles (?<ligne>${M} et ${M})\.\n(?<q>Détermine .+)`), consigne: dansChaqueCas },
      { motif: re(String.raw`On donne le cercle (?<ligne>${M} et la parabole ${M})\.\n(?<q>Détermine .+)`), consigne: dansChaqueCas, ligne: (g) => `Cercle ${g.ligne}` },
    ],
  },
  gen96: { formes: [{ motif: re(String.raw`On donne le point (?<ligne>${M} et la droite ${M})\.\n(?<q>Détermine .+)`), consigne: dansChaqueCas, ligne: (g) => `Point ${g.ligne}` }] },
  // gen131 : « On considère le lieu des points M(x ; y) <description>. » + une consigne commune à toutes
  // les variantes ; la description du lieu est la ligne.
  gen131: {
    formes: [
      {
        motif: re(String.raw`On considère le lieu des points \$M\(x\\,;\\,y\)\$ (?<ligne>.+)\.\nReconnais ce lieu et détermine son équation \(ou ses équations\)\.`),
        consigne: "Reconnais chacun des lieux de points $M(x\\,;\\,y)$ ci-dessous et détermine son équation (ou ses équations).",
        ligne: (g) => `Points ${g.ligne}`,
      },
    ],
  },
  // gen130 : « réduire » et « simplifier » partagent la même consigne ; « démontrer » a la sienne
  // (les points cités restent hors de la ligne) ; « insérer » (données propres) n'est jamais regroupé.
  gen130: {
    formes: [
      {
        motif: re(String.raw`Réduis (?<ligne>${M}) à un seul vecteur \(multiplié au besoin par un nombre\) ou au vecteur nul\.`),
        consigne: "Réduis chaque expression à un seul vecteur (multiplié au besoin par un nombre) ou au vecteur nul.",
      },
      { motif: re(String.raw`Démontre que (?<ligne>${M}), quels que soient les points [^.]+\.`), consigne: "Démontre chaque égalité vectorielle, quels que soient les points qui y figurent." },
    ],
  },
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
  // gen92 : « On donne le cercle Γ ≡ … et son point P(…). » / « la droite d ≡ … et le cercle Γ ≡ … » /
  // « le point C(…) et la droite d ≡ … », puis la consigne de la variante (une consigne par variante).
  gen92: {
    formes: [
      {
        motif: re(String.raw`On donne (?:le cercle|la droite|le point) (?<a>${M}) et (?:son point|le cercle|la droite) (?<b>${M})\.\n(?<q>.+)`),
        consigne: dansChaqueCas,
        ligne: (g) => `${g.a} et ${g.b}`,
      },
    ],
  },
  // gen93 : « On donne les points A(…), B(…) [et C(…) | et la droite d ≡ …]. » + consigne de la variante.
  gen93: { formes: [{ motif: re(String.raw`On donne les points (?<ligne>.+)\.\n(?<q>Détermine une équation du cercle .+)`), consigne: dansChaqueCas }] },
  // gen94 : « On donne le triangle ABC de sommets A(…), B(…) et C(…). » + consigne de la variante.
  gen94: { formes: [{ motif: re(String.raw`On donne le triangle ABC de sommets (?<ligne>.+)\.\n(?<q>.+)`), consigne: dansChaqueCas }] },
  // gen95 : « On considère la famille de droites dₘ ≡ … (m réel) [et la droite d ≡ … | et le point P(…)]. »
  gen95: {
    formes: [
      {
        motif: re(String.raw`On considère la famille de droites (?<f>${M}) \(m réel\)(?: et (?<x>la droite ${M}|le point ${M}))?\.\n(?<q>Détermine la ou les valeurs de m .+)`),
        consigne: dansChaqueCas,
        ligne: (g) => (g.x ? `${g.f} et ${g.x}` : `${g.f}`),
      },
    ],
  },
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
  "5gen64": simple(String.raw`Calcule la valeur exacte de la limite suivante : (?<ligne>${M})\.`, "Calcule la valeur exacte de chaque limite."),
  "5gen21": {
    formes: [
      { motif: re(String.raw`On considère la fonction (?<ligne>${M})\.\n(?<q>.+)`), consigne: (g) => `Pour chaque fonction f : ${minusculeInitiale(g.q ?? "")}` },
      // Famille « position » (lots B–D) : la fonction ET la droite asymptote donnée forment la ligne.
      {
        motif: re(String.raw`On considère la fonction (?<f>${M}) et la droite (?<d>${M}), asymptote (?<n>oblique|horizontale) de sa courbe\.\n(?<q>Étudie la position .+)`),
        consigne: (g) => `Pour chaque fonction f et sa droite asymptote d : ${minusculeInitiale(g.q ?? "")}`,
        ligne: (g) => `${g.f} ; ${g.d} (asymptote ${g.n})`,
      },
    ],
  },
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
  // Lot C (5e ch. 5) : f′ peut être donnée (« ; sa dérivée est … ») ; familles « pente donnée » et
  // « point extérieur » (la pente ou le point vont dans la ligne).
  "5gen28": {
    formes: [
      {
        motif: re(String.raw`On considère la fonction (?<fx>${M})(?: ; sa dérivée est (?<fp>${M}))?\.?\nDétermine l'équation de la tangente à la courbe de f au point d'abscisse (?<x>x = \S+?)\.(?<p_exactes> Donne des valeurs exactes \(racines carrées acceptées\)\.)?`),
        consigne: "Pour chaque fonction f, détermine l'équation de la tangente à la courbe de f au point d'abscisse indiqué.",
        ligne: (g) => `${g.fx}${g.fp ? ` (${g.fp})` : ""}, au point d'abscisse ${g.x}`,
      },
      {
        motif: re(String.raw`On considère la fonction (?<fx>${M})(?: ; sa dérivée est (?<fp>${M}))?\.?\n(?<q>Détermine les points de la courbe de f où la tangente est horizontale.+)`),
        consigne: (g) => `Pour chaque fonction f, ${minusculeInitiale(g.q ?? "")}`,
        ligne: (g) => `${g.fx}${g.fp ? ` (${g.fp})` : ""}`,
      },
      {
        motif: re(String.raw`On considère la fonction (?<fx>${M})(?: ; sa dérivée est (?<fp>${M}))?\.?\nDétermine les points de la courbe de f où la tangente a pour pente (?<m>\S+?), puis l'équation de la tangente en chacun de ces points\.`),
        consigne: "Pour chaque fonction f, détermine les points de la courbe de f où la tangente a la pente indiquée, puis l'équation de la tangente en chacun de ces points.",
        ligne: (g) => `${g.fx}${g.fp ? ` (${g.fp})` : ""}, pente ${g.m}`,
      },
      {
        motif: re(String.raw`On considère la fonction (?<fx>${M})(?: ; sa dérivée est (?<fp>${M}))?\.?\nLe point (?<P>P\(.+?\)) n'est pas sur la courbe de f\. Détermine les équations des tangentes à la courbe de f qui passent par P\.`),
        consigne: "Pour chaque fonction f, détermine les équations des tangentes à la courbe de f qui passent par le point P indiqué (P n'est pas sur la courbe).",
        ligne: (g) => `${g.fx}${g.fp ? ` (${g.fp})` : ""}, ${g.P}`,
      },
    ],
    precisions: { exactes: { texte: "Donne des valeurs exactes (racines carrées acceptées)." } },
  },
  "5gen29": {
    formes: [
      {
        motif: re(
          String.raw`On considère la fonction f ; (?<intro>sa dérivée f[′'] est donnée|ses dérivées f[′'] et f(?:″|'') sont données) : (?<ligne>${M})\n(?<q>.+?)(?: (?:(?<p_exactes>Donne des valeurs exactes\.)|(?<p_abscisses>Donne les abscisses en valeur exacte ; les valeurs de f peuvent être arrondies au centième\.)))?`,
        ),
        consigne: (g) => `Dans chaque cas, on considère la fonction f ; ${g.intro}. ${g.q}`,
      },
    ],
    precisions: {
      exactes: { texte: "Donne des valeurs exactes." },
      abscisses: { texte: "Donne les abscisses en valeur exacte ; les valeurs de f peuvent être arrondies au centième." },
    },
  },
  // 5e ch. 5, nouveaux générateurs 5gen68–5gen70 (5gen70 : vraies questions a) b) c) — écarté).
  "5gen68": {
    formes: [
      {
        motif: re(String.raw`Estime (?<n>${M}) sans calculatrice, à l'aide de l'approximation affine de la fonction (?<fx>${M})(?<rad> \(x en radians\))? près d'un nombre bien choisi\. La calculatrice affiche (?<c>${M}) : calcule l'erreur commise, à deux chiffres significatifs\.`),
        consigne: "Estime chaque nombre sans calculatrice, à l'aide de l'approximation affine de la fonction indiquée près d'un nombre bien choisi, puis calcule l'erreur commise, à deux chiffres significatifs, à l'aide de la valeur affichée par la calculatrice.",
        ligne: (g) => `${g.n}, avec ${g.fx}${g.rad ? " (x en radians)" : ""} ; calculatrice : ${g.c}`,
      },
    ],
  },
  "5gen69": {
    formes: [
      {
        motif: re(String.raw`On cherche une fonction (?<forme>${M}) dont la courbe admet (?<ligne>.+?)\. (?<q>Détermine a, b, c et d, .+)`),
        consigne: (g) => `Dans chaque cas, on cherche une fonction ${g.forme} dont la courbe vérifie les conditions données. ${g.q}`,
        ligne: (g) => (g.ligne ?? "").replace(/^./, (c) => c.toUpperCase()).replace(/, et qui passe par (les points|le point) /, " ; $1 "),
      },
    ],
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
  // 6gen160 : seule la variante « valeurs » (données sans figure ni contexte) se regroupe.
  "6gen160": simple(String.raw`\$A\$ et \$B\$ sont deux événements tels que (?<ligne>.+)\.\nLes événements \$A\$ et \$B\$ sont-ils indépendants, incompatibles, ou ni l'un ni l'autre \? Justifie par un calcul\.`, "Dans chaque cas, les événements $A$ et $B$ ont les probabilités indiquées. Sont-ils indépendants, incompatibles, ou ni l'un ni l'autre ? Justifie par un calcul."),
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

  /* ----------- Générateurs à graphique : une figure par ligne (`figure: true`, lot 2) ----------- */
  /* 4e */
  gen8: fig({
    motif: re(String.raw`Le graphique ci-dessous représente une parabole, obtenue en transformant la parabole de référence (?<ref>${M})\. Détermine l'équation de cette parabole sous la forme (?<forme>${M})\.`),
    consigne: (g) => `Chaque graphique ci-dessous représente une parabole, obtenue en transformant la parabole de référence ${g.ref}. Détermine l'équation de chaque parabole sous la forme ${g.forme}.`,
    ligne: () => "",
  }),
  gen10: fig({
    motif: re(String.raw`Le graphique ci-dessous représente une fonction f obtenue en transformant l'une des fonctions de référence (?<refs>.+?)\. Détermine l'équation de f, sous sa forme la plus simple\.`),
    consigne: (g) => `Chaque graphique ci-dessous représente une fonction f obtenue en transformant l'une des fonctions de référence ${g.refs}. Détermine, dans chaque cas, l'équation de f, sous sa forme la plus simple.`,
    ligne: () => "",
  }),
  gen12: fig({
    // La valeur demandée (« sa valeur en x = 7 ») est propre à l'instance : elle passe dans la ligne.
    motif: re(String.raw`Le graphique ci-dessous représente une fonction f (?<leg>\(.+?\))\.\n(?<q1>Lis sur le graphique les caractéristiques de f : .+?, sa valeur en )(?<x>${M})(?<q2> \(si elle existe\) .+)`),
    consigne: (g) => `Chaque graphique ci-dessous représente une fonction f ${g.leg}. ${surChaque(g.q1)}l'abscisse indiquée${g.q2}`,
    ligne: (g) => `valeur en ${g.x}`,
  }),
  gen71: fig(
    {
      motif: re(String.raw`Une fonction f est obtenue en transformant une fonction de référence (?<t>\(translations, symétrie, étirement vertical\))\. Elle possède les caractéristiques suivantes\.\n(?<q>Trouve une expression de f et justifie ta démarche\.)`),
      consigne: (g) => `Dans chaque cas, une fonction f est obtenue en transformant une fonction de référence ${g.t} ; elle possède les caractéristiques indiquées. ${g.q}`,
      ligne: () => "",
    },
    {
      motif: re(String.raw`Une seule des quatre courbes ci-dessous respecte toutes les conditions suivantes\.\n(?<q>Laquelle \? Justifie .+)`),
      consigne: (g) => `Dans chaque cas, une seule des quatre courbes respecte toutes les conditions indiquées. ${g.q}`,
      ligne: () => "",
    },
  ),
  gen72: fig({
    motif: re(String.raw`On ne connaît de la fonction f que son domaine et son ensemble image\. Son graphique subit successivement les transformations ci-dessous, dans cet ordre ; on note g la fonction obtenue\.\n(?<q>Détermine le domaine et l'ensemble image de g\. .+)`),
    consigne: (g) => `Dans chaque cas, on ne connaît de la fonction f que son domaine et son ensemble image. Son graphique subit successivement les transformations indiquées, dans cet ordre ; on note g la fonction obtenue. ${g.q}`,
    ligne: () => "",
  }),
  gen117: fig({
    motif: re(String.raw`On a tracé la parabole (?<P>${M}) d'équation (?<eqP>${M}) \(trait plein\)(?<droite> et la droite (?<d>${M}) d'équation (?<eqd>${M}) \(pointillés\))?\. Résous graphiquement l'inéquation (?<ineq>${M})\.?\n(?<q>.+)`),
    consigne: (g) =>
      g.droite
        ? `On a tracé, dans chaque cas, la parabole ${g.P} d'équation ${g.eqP} (trait plein) et une droite ${g.d} (pointillés). Résous graphiquement chaque inéquation. ${g.q}`
        : `On a tracé, dans chaque cas, la parabole ${g.P} d'équation ${g.eqP} (trait plein). Résous graphiquement chaque inéquation. ${g.q}`,
    ligne: (g) => (g.droite && !/g\(x\)/.test(g.eqd ?? "") ? `${sansPointFinal(g.ineq)}, avec ${g.d} : ${g.eqd}` : sansPointFinal(g.ineq)),
  }),
  gen122: fig({
    motif: re(String.raw`Le point (?<M>${M}) est l'image de l'angle (?<t>${M}) \((?<int>${M})\) sur le cercle trigonométrique\. (?<s>Les lignes du quadrillage .+?)\n(?<q>Lis sur la figure .+)`),
    consigne: (g) => `Sur chaque figure, le point ${g.M} est l'image d'un angle ${g.t} (${g.int}) sur le cercle trigonométrique. ${g.s} ${surChaque(g.q)}`,
    ligne: () => "",
  }),
  gen123: fig({
    motif: re(String.raw`On a tracé la parabole d'équation (?<eq>${M})\. (?<s>Son sommet, .+?)\n(?<q>Lis sur le graphique .+)`),
    consigne: (g) => `On a tracé, dans chaque cas, la parabole d'équation ${g.eq}. ${g.s} ${surChaque(g.q)}`,
    ligne: () => "",
  }),
  gen124: fig({
    motif: re(String.raw`Voici un tableau de valeurs d'une fonction (?<f>${M}) (?<s>\(les valeurs de ${M} vont de 1 en 1\))\.\n(?<q>Calcule les différences premières.+)`),
    consigne: (g) => `Voici, dans chaque cas, un tableau de valeurs d'une fonction ${g.f} ${g.s}. ${g.q}`,
    ligne: () => "",
  }),
  gen125: (() => {
    const fin = String.raw` Détermine son équation, sous forme développée\.`;
    const consigne = "Détermine l'équation de chaque parabole, sous forme développée.";
    return fig(
      { motif: re(String.raw`Une parabole a pour sommet (?<S>${M}) et passe par le point (?<P>${M})\.${fin}`), consigne, ligne: (g) => `sommet ${g.S}, passe par le point ${g.P}` },
      { motif: re(String.raw`Une parabole coupe l'axe des x en (?<a>${M}) et en (?<b>${M}), et passe par le point (?<P>${M})\.${fin}`), consigne, ligne: (g) => `coupe l'axe des x en ${g.a} et en ${g.b}, passe par le point ${g.P}` },
      { motif: re(String.raw`On a tracé une parabole ; (?<s>le point ${M} marqué est sur un nœud du quadrillage)\.${fin}`), consigne, ligne: (g) => `parabole tracée ; ${g.s}` },
      { motif: re(String.raw`Une parabole passe par les points (?<pts>.+?)\.${fin}`), consigne, ligne: (g) => `passe par les points ${g.pts}` },
    );
  })(),
  gen128: fig({
    motif: re(String.raw`Voici quatre équations et leurs quatre paraboles, dans le désordre : (?<liste>.+?)\n(?<q>.+)`),
    consigne: (g) => `Dans chaque cas, voici quatre équations et leurs quatre paraboles, dans le désordre. ${g.q}`,
    ligne: (g) => sansPointFinal(g.liste),
  }),
  gen23: fig({
    // Exception « réponse graphique » (décision 2, audit 4e ch. 6) : la construction se trace sur la
    // figure de l'énoncé, jointe à la feuille.
    motif: re(String.raw`On donne les points (?<pts>${M}) ci-dessous\. Construis le vecteur (?<v>${M}) à partir du point de ton choix\. Trace ta construction sur la figure de l'énoncé, que tu joins à ta feuille\.`),
    consigne: "Construis chaque vecteur à partir du point de ton choix. Trace chaque construction sur sa figure, que tu joins à ta feuille.",
    ligne: (g) => `${g.v}, avec ${g.pts}`,
  }),
  gen27: fig({
    motif: re(String.raw`On considère la figure ci-dessous \((?<desc>[^)]+)\)\. Réduis l'expression suivante en un seul vecteur, désigné par deux points de la figure : (?<e>${M})\.`),
    consigne: "Réduis chaque expression en un seul vecteur, désigné par deux points de sa figure.",
    ligne: (g) => `${g.e} (${g.desc})`,
    // Même figure pour toutes les lignes (même hexagone…) : une seule figure, décrite une fois.
    figureCommune: { consigne: (g) => `On considère la figure ci-dessous (${g.desc}). Réduis chaque expression en un seul vecteur, désigné par deux points de la figure.`, ligne: (g) => g.e ?? "" },
  }),
  gen43: fig(
    {
      motif: re(String.raw`Détermine une équation cartésienne de la droite représentée ci-dessous \(sous la forme de ton choix\)\.`),
      consigne: "Détermine une équation cartésienne de chaque droite représentée ci-dessous (sous la forme de ton choix).",
      ligne: () => "",
    },
    { motif: re(String.raw`Détermine des équations paramétriques de la droite représentée ci-dessous\.`), consigne: "Détermine des équations paramétriques de chaque droite représentée ci-dessous.", ligne: () => "" },
  ),
  gen49: fig({
    motif: re(String.raw`Le graphique ci-dessous représente un cercle ; le point marqué P appartient à ce cercle\. Détermine l'équation cartésienne de ce cercle, sous la forme non développée (?<f>${M})\.`),
    consigne: (g) => `Chaque graphique ci-dessous représente un cercle ; le point marqué P appartient à ce cercle. Détermine l'équation cartésienne de chaque cercle, sous la forme non développée ${g.f}.`,
    ligne: () => "",
  }),
  gen51: fig({
    motif: re(String.raw`Le graphique ci-dessous représente une parabole, son foyer F et sa directrice d\. Détermine l'équation de cette parabole sous la forme réduite (?<f>${M}) \(selon son axe\)\.`),
    consigne: (g) => `Chaque graphique ci-dessous représente une parabole, son foyer F et sa directrice d. Détermine l'équation de chaque parabole sous la forme réduite ${g.f} (selon son axe).`,
    ligne: () => "",
  }),
  gen53: fig({
    motif: re(String.raw`On donne (?<donnees>le foyer .+? d'une parabole(?: et trois points .+? de ${M})?)\. (?<q>Construis au compas .+)`),
    consigne: (g) => `Dans chaque cas, on donne ${g.donnees}. ${g.q}`,
    ligne: () => "",
  }),
  gen82: fig(
    {
      motif: re(String.raw`Sur la figure \([^)]+\) : (?<l>.+?)\.\n(?<q>Écris .+)`),
      consigne: (g) => `Dans chaque cas, ${minusculeInitiale(g.q ?? "")}`,
      ligne: (g) => g.l ?? "",
    },
    { motif: re(String.raw`On donne (?<ligne>.+?)\.\n(?<q>.+)`), consigne: dansChaqueCas },
  ),
  gen83: fig(
    {
      motif: re(String.raw`On donne le point O et les vecteurs (?<uv>${M} et ${M}) ci-dessous\. Trace le vecteur (?<v>${M}) à partir du point O\. Trace ta construction sur la figure de l'énoncé, que tu joins à ta feuille\.`),
      consigne: (g) => `Dans chaque cas, on donne le point O et les vecteurs ${g.uv}. Trace le vecteur indiqué à partir du point O, sur la figure de l'énoncé, que tu joins à ta feuille.`,
      ligne: (g) => g.v ?? "",
    },
    {
      motif: re(String.raw`On donne les points A, B et C ci-dessous\. Place le point M tel que (?<r>${M})\. Trace ta construction sur la figure de l'énoncé, que tu joins à ta feuille\.`),
      consigne: "Dans chaque cas, on donne les points A, B et C. Place le point M tel que la relation indiquée soit vraie, sur la figure de l'énoncé, que tu joins à ta feuille.",
      ligne: (g) => g.r ?? "",
    },
    {
      motif: re(String.raw`Donne les composantes des vecteurs (?<uv>${M} et ${M}) tracés ci-dessous \(un carreau = une unité\)\.`),
      consigne: (g) => `Donne les composantes des vecteurs ${g.uv} tracés sur chaque figure (un carreau = une unité).`,
      ligne: () => "",
    },
  ),
  /* 5e */
  "5gen4": fig({
    motif: re(String.raw`Voici les graphes des fonctions f et g\. Les graphes ci-dessous (?<s>sont complets : .+?\))\. Calcule, si elles existent, les valeurs suivantes : (?<ligne>.+)\.`),
    consigne: (g) => `Dans chaque cas, voici les graphes de deux fonctions f et g. Les graphes ${g.s}. Calcule, si elles existent, les valeurs indiquées.`,
  }),
  "5gen9": fig({
    motif: re(String.raw`Le graphique ci-dessous représente une fonction sinusoïdale (?<f>${M}), avec (?<c>${M} et ${M})\.\n(?<q>Lis sur le graphique .+)`),
    consigne: (g) => `Chaque graphique ci-dessous représente une fonction sinusoïdale ${g.f}, avec ${g.c}. ${surChaque(g.q)}`,
    ligne: () => "",
  }),
  "5gen12": fig(
    {
      motif: re(String.raw`Détermine l'aire du (?<quoi>secteur balayé|segment circulaire)(?<s>.*?)\. Données : (?<ligne>${M})\. Donne l'aire arrondie à l'unité\.`),
      consigne: (g) => `Détermine l'aire de chaque ${g.quoi}${g.s}. Donne les aires arrondies à l'unité.`,
    },
    {
      motif: re(String.raw`Deux cercles de rayons r₁ et r₂ se coupent : (?<s>.+?)\. Détermine l'aire de la lentille (?<l>\(.+?\))\. Données : (?<ligne>${M})\. Donne l'aire arrondie à l'unité\.`),
      consigne: (g) => `Dans chaque cas, deux cercles de rayons r₁ et r₂ se coupent : ${g.s}. Détermine l'aire de la lentille ${g.l}. Donne les aires arrondies à l'unité.`,
    },
  ),
  "5gen22": fig({
    motif: re(String.raw`Le graphique ci-dessous représente une fonction f (?<leg>\(.+?\))\.\n(?<q>Lis sur le graphique .+)`),
    consigne: (g) => `Chaque graphique ci-dessous représente une fonction f ${g.leg}. ${surChaque(g.q)}`,
    ligne: () => "",
  }),
  "5gen30": fig({
    motif: re(String.raw`Le graphique ci-dessous représente une fonction f (?<leg>\(.+?\))\.\n(?<q>Par lecture du graphique : .+)`),
    consigne: (g) => `Chaque graphique ci-dessous représente une fonction f ${g.leg}. ${surChaque(g.q)}`,
    ligne: () => "",
  }),
  "5gen51": fig({
    motif: re(String.raw`On donne l'angle (?<t>${M}) \(en radians\)\. Le cercle trigonométrique est quadrillé aux valeurs remarquables\.\nRamène \k<t> dans (?<suite>.+)`),
    consigne: (g) => String.raw`Pour chaque angle $\theta$ (en radians) — le cercle trigonométrique est quadrillé aux valeurs remarquables —, ramène $\theta$ dans ${g.suite}`,
    ligne: (g) => g.t ?? "",
  }),
  "5gen52": fig({
    motif: re(String.raw`On donne (?<f>${M}) à représenter sur (?<i>${M})\n(?<q>.+? puis prolonge la courbe sur )\k<i>`),
    consigne: (g) => `Pour chaque fonction, ${minusculeInitiale(g.q ?? "")}l'intervalle indiqué.`,
    ligne: (g) => `${sansPointFinal(g.f)} à représenter sur ${sansPointFinal(g.i)}`,
  }),
  "5gen53": fig({
    motif: re(String.raw`Voici quatre expressions et leurs quatre courbes, dans le désordre : (?<liste>.+?)\n(?<q>.+)`),
    consigne: (g) => `Dans chaque cas, voici quatre expressions et leurs quatre courbes, dans le désordre. ${g.q}`,
    ligne: (g) => sansPointFinal(g.liste),
  }),
  "5gen65": fig(
    {
      motif: re(String.raw`Une fonction f de la forme (?<forme>${M}) admet (?<ligne>l'asymptote verticale d'équation ${M}, l'asymptote (?:horizontale|oblique) d'équation ${M}, et son graphe passe par le point ${M})\. (?<q>Détermine .+)`),
      consigne: (g) => `Dans chaque cas, une fonction f de la forme ${g.forme} admet les asymptotes indiquées et son graphe passe par le point donné. ${g.q}`,
      ligne: (g) => (g.ligne ?? "").replace(/^l'asymptote verticale d'équation /, "asymptote verticale ").replace(/, l'asymptote (horizontale|oblique) d'équation /, ", asymptote $1 ").replace(/, et son graphe passe par le point /, ", point "),
    },
    {
    motif: re(String.raw`Le graphique ci-dessous représente une fonction f de la forme (?<forme>${M}) (?<p>\(.+?\))\. (?<q>Détermine f\(x\).+)`),
    consigne: (g) => `Chaque graphique ci-dessous représente une fonction f de la forme ${g.forme} ${g.p}. Pour chacune, ${minusculeInitiale(g.q ?? "")}`,
    ligne: () => "",
    },
  ),
  "5gen63": fig({
    motif: re(String.raw`Les graphes de f et de g ci-dessous sont complets (?<p>\(.+?\))\. À l'aide de la droite (?<d>${M}), détermine (?<v>${M}) s'il existe ; justifie ta réponse\.`),
    consigne: (g) => `Dans chaque cas, les graphes de f et de g sont complets ${g.p}. À l'aide de la droite ${g.d}, détermine le nombre indiqué s'il existe ; justifie ta réponse.`,
    ligne: (g) => g.v ?? "",
  }),
  /* 6e */
  "6gen5": fig({
    motif: re(String.raw`On considère la fonction (?<ligne>${M})\. Indique lequel des graphiques représente f, (?<s>puis justifie .+)`),
    consigne: (g) => `Pour chaque fonction f, indique lequel des graphiques la représente, ${g.s}`,
  }),
  "6gen8": fig(
    {
      motif: re(String.raw`On considère la fonction (?<ligne>${M})\. Indique lequel des graphiques A à D représente (?<s>f.\. Justifie à partir de f.\(x\)\.)`),
      consigne: (g) => `Pour chaque fonction f, indique lequel des graphiques A à D représente ${g.s}`,
    },
    {
      motif: re(String.raw`On considère la fonction (?<ligne>${M})\. (?<s>Calcule f.\(x\), puis indique lequel des graphiques A à D représente f.\. Justifie\.)`),
      consigne: (g) => `Pour chaque fonction f, ${minusculeInitiale(g.s ?? "")}`,
    },
  ),
  "6gen11": fig({
    motif: re(String.raw`On considère la fonction (?<ligne>${M})\.\nÉtudie la fonction f : (?<s>.+)`),
    consigne: (g) => `Étudie chaque fonction f : ${g.s}`,
  }),
  "6gen18": fig({
    motif: re(String.raw`Le graphique est celui de (?<f>${M}), où a et b sont des nombres entiers\. Retrouve a et b à partir du graphique, puis écris l'expression de f\(x\)\. Sur le graphique : (?<ligne>.+)\.`),
    consigne: (g) => `Chaque graphique est celui d'une fonction ${g.f}, où a et b sont des nombres entiers. Dans chaque cas, retrouve a et b à partir du graphique, puis écris l'expression de f(x).`,
  }),
  "6gen20": fig({
    motif: re(String.raw`On considère la fonction (?<ligne>${M}), dont le graphique est donné \(f\), et quatre graphiques A à D\.\n(?<q>Indique lequel .+)`),
    consigne: (g) => `Pour chaque fonction f, dont le graphique est donné (f), et ses quatre graphiques A à D : ${minusculeInitiale(g.q ?? "")}`,
  }),
  "6gen21": fig({
    motif: re(String.raw`On considère la fonction suivante : (?<ligne>${M})\nÉtudie la fonction f : (?<s>.+)`),
    consigne: (g) => `Étudie chaque fonction f : ${g.s}`,
  }),
  "6gen77": fig(
    {
      motif: re(String.raw`La courbe ci-dessous représente une fonction (?<f>${M}) sur (?<I>${M}) (?<u>\(une case du quadrillage mesure une unité\))\. Sans chercher de primitive, calcule (?<int>${M}) à l'aide d'aires de figures simples\. Donne la valeur exacte\.`),
      consigne: (g) => `Chaque courbe ci-dessous représente une fonction ${g.f} ${g.u}. Sans chercher de primitive, calcule chaque intégrale à l'aide d'aires de figures simples. Donne les valeurs exactes.`,
      ligne: (g) => `${g.int} (${g.f} tracée sur ${g.I})`,
    },
    {
      motif: re(String.raw`La courbe ci-dessous représente une fonction (?<f>${M}) sur (?<I>${M}) (?<u>\(une case du quadrillage mesure une unité\))\. Sans chercher de primitive, compare l'intégrale (?<int>${M}) et l'aire de la région comprise entre la courbe de ${M}, l'axe des abscisses et les droites ${M} et ${M}\. (?<s>Calcule ces deux nombres \(valeurs exactes\)\.)`),
      consigne: (g) => `Chaque courbe ci-dessous représente une fonction ${g.f} ${g.u}. Sans chercher de primitive, compare, dans chaque cas, l'intégrale indiquée et l'aire de la région comprise entre la courbe de ${g.f}, l'axe des abscisses et les droites verticales menées par ses bornes. ${g.s}`,
      ligne: (g) => `${g.int} (${g.f} tracée sur ${g.I})`,
    },
  ),
  "6gen85": fig(
    {
      motif: re(String.raw`Le graphique ci-dessous est celui d'une fonction (?<f>${M}), (?<ou>où .+? sont inconnus)\. Détermine (?<q>.+)`),
      consigne: (g) => `Chaque graphique ci-dessous est celui d'une fonction ${g.f}, ${g.ou}. Pour chaque graphique, détermine ${g.q}`,
      ligne: () => "",
    },
    {
      motif: re(String.raw`Les courbes 1 à 4 ci-dessous représentent les fonctions A à D suivantes (?<p>\(asymptotes verticales en pointillés\)) : (?<ligne>.+?)\. (?<q>Associe chaque courbe à son expression, en justifiant\.)`),
      consigne: (g) => `Dans chaque cas, les courbes 1 à 4 représentent les fonctions A à D indiquées ${g.p}. ${g.q}`,
    },
  ),
  "6gen148": fig({
    motif: re(String.raw`La courbe ci-dessous représente la fonction (?<f>${M}), (?<ou>où .+? sont des nombres réels) ; la droite en pointillés est son asymptote\. Les points de la courbe d'abscisses (?<abs>.+?) sont sur des nœuds du quadrillage\. (?<q>Donne .+)`),
    consigne: (g) => `Chaque courbe ci-dessous représente une fonction ${g.f}, ${g.ou} ; la droite en pointillés est son asymptote. Pour chaque courbe, ${minusculeInitiale(g.q ?? "")}`,
    ligne: (g) => `points de la courbe d'abscisses ${g.abs} sur des nœuds du quadrillage`,
  }),
  "6gen158": fig({
    motif: re(String.raw`La courbe ci-dessous représente (?<f>${M}), (?<ou>où .+? est réel)\. (?<s>Les lignes verticales du quadrillage .+? ; les points marqués sont des nœuds)\. (?<q>Lis .+)`),
    consigne: (g) => `Chaque courbe ci-dessous représente la fonction f indiquée, ${g.ou}. ${g.s}. Pour chaque courbe, ${minusculeInitiale(g.q ?? "")}`,
    ligne: (g) => g.f ?? "",
  }),
  // 6e ch. 7, lot H (6gen100–6gen104) : la situation (ou l'équation, l'égalité, le mot) est la ligne.
  "6gen100": simple(String.raw`(?<ligne>[^\n]+)\nReconnais le type de groupement en répondant aux trois questions du cours .+, puis calcule le nombre demandé\.`, "Pour chaque situation, reconnais le type de groupement en répondant aux trois questions du cours (l'ordre compte-t-il ? la répétition est-elle permise ? tous les éléments sont-ils utilisés ?), puis calcule le nombre demandé."),
  "6gen101": { formes: [{ motif: re(String.raw`Résous l'équation (?<ligne>${M}), d'inconnue naturelle \$(?<x>[nk])\$\.`), consigne: (g) => `Résous chaque équation, d'inconnue naturelle $${g.x}$.` }] },
  // 6gen102 : seule la variante « identité » (une égalité à juger) se regroupe.
  "6gen102": simple(String.raw`On considère l'égalité (?<ligne>${M})\.\nCette égalité est-elle vraie ou fausse \? Justifie sans calculatrice, par une propriété du cours\.`, "Chaque égalité est-elle vraie ou fausse ? Justifie sans calculatrice, par une propriété du cours."),
  // 6gen103 : seule la variante « anagrammes » se regroupe (« le mot … » garde ses capitales sur papier).
  "6gen103": {
    formes: [
      {
        motif: re(String.raw`Une anagramme d'un mot [^\n]+\nCombien d'anagrammes le mot (?<w>[A-Z]+) a-t-il \? Justifie ton calcul\.`),
        consigne: "Une anagramme d'un mot est un mot (ayant un sens ou non) écrit avec toutes ses lettres et différent de lui. Combien d'anagrammes chaque mot a-t-il ? Justifie tes calculs.",
        ligne: (g) => `le mot ${g.w}`,
      },
    ],
  },
  "6gen104": simple(String.raw`(?<ligne>[^\n]+)\nCalcule ce nombre en justifiant par la méthode des étoiles et des barres\.`, "Dans chaque situation, calcule le nombre demandé en justifiant par la méthode des étoiles et des barres."),
};
