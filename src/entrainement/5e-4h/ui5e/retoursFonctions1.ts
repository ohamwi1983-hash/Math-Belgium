/**
 * Retours de saisie du 5e ch. 1 « Fonctions : rappels et compléments » (audit 5e ch. 1, lot B),
 * sur le modèle du 5e ch. 2 (`aidesTrigonometrie.ts`, `RetourSaisieTrig.tsx`) :
 * - messages d'ILLISIBLE par nature de champ (aucune tentative consommée) ;
 * - aides à DEUX niveaux (`AideTrig` : une phrase terminée par « : », puis la formule en KaTeX) —
 *   niveau 1 = la propriété du cours, niveau 2 = son application à l'instance ; jamais la réponse
 *   finale, jamais de notation clavier ni de majuscules d'insistance ;
 * - messages CIBLÉS sur une erreur typique du cours trahie par la dernière réponse fausse (`null` :
 *   aucune erreur reconnue, message générique « Incorrect — tentative n/3 »).
 *
 * 5gen1 (domaine), 5gen2 (décomposition), 5gen3 (composer f et g), 5gen4 (composée lue sur un
 * graphique). Les aides et messages de 5gen5 sont dans `aidesProblemesContexte.ts`.
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { EnsembleReelGuide, ExerciceDomaineDefinition, SlotCE } from "../core5e/domaineDefinition.types";
import type { ExerciceDecompositionFonction } from "../core5e/decompositionFonction.types";
import type { CompositionDirigee } from "../core5e/composerFonctions.types";
import type { CourbeGraphique, ExerciceComposeeGraphique, QuestionComposeeGraphique } from "../core5e/composeeGraphique.types";
import type { ReponseCE } from "../moteur5e/verificationDomaineDefinition";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import { normaliserLigneDecomposition } from "../moteur5e/verificationDecompositionFonction";
import type { AideTrig } from "./aidesTrigonometrie";
import { formatEnsembleReelLatex, formatSlotConditionLatex, formatValeurLatex } from "./formatDomaineDefinition";

export const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
export const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

/** Texte « riche » (`$…$` = KaTeX) → fragments. */
export function fragmentsRiches(texte: string): FragmentConsigne[] {
  return texte
    .split("$")
    .map((morceau, i) => (i % 2 === 1 ? l(morceau) : t(morceau)))
    .filter((f) => f.valeur !== "");
}

// ============================================================================
// Messages d'illisible (par nature de champ).
// ============================================================================

const FIN = " Cette saisie ne compte pas comme une tentative.";

export type ChampFonctions = "nombre" | "seuil" | "expression" | "decomposition" | "equationAB";

export const MESSAGES_ILLISIBLE_FONCTIONS: Record<ChampFonctions, string> = {
  nombre: "Nombre non reconnu : écris un nombre, par exemple −3, 7/2 ou 2,5." + FIN,
  seuil: "Seuil non reconnu : choisis le comparateur et écris le nombre, par exemple −3, 7/2 ou 2,5." + FIN,
  expression: "Expression non reconnue : vérifie les parenthèses, les signes et la place de x (racine : sqrt(…) ou √)." + FIN,
  decomposition: "Une des lignes n'est pas reconnue : vérifie les parenthèses, les signes et la place de x dans chaque fonction." + FIN,
  equationAB: "Équation non reconnue : écris un membre, le signe =, puis l'autre membre, avec les inconnues a et b." + FIN,
};

// ============================================================================
// Ensembles de réels : appartenance et message ciblé générique.
// ============================================================================

function contient(e: EnsembleReelGuide, x: number): boolean {
  if (e.forme === "reel") return true;
  if (e.forme === "prive_points") return !e.points.some((p) => Math.abs(p - x) < 1e-9);
  return e.morceaux.some((m) => {
    const apresInf = m.inf === null || x > m.inf + 1e-9 || (m.infInclus && Math.abs(x - m.inf) < 1e-9);
    const avantSup = m.sup === null || x < m.sup - 1e-9 || (m.supInclus && Math.abs(x - m.sup) < 1e-9);
    return apresInf && avantSup;
  });
}

function bornes(e: EnsembleReelGuide): number[] {
  if (e.forme === "prive_points") return e.points;
  if (e.forme === "intervalles") return e.morceaux.flatMap((m) => [m.inf, m.sup]).filter((v): v is number => v !== null);
  return [];
}

/**
 * Message ciblé pour un ENSEMBLE faux (domaine, résolution d'une condition), par comparaison
 * point par point avec l'ensemble attendu :
 * - même ensemble aux bornes près : crochet fermé sur une valeur interdite, ou ouvert sur une
 *   valeur permise ;
 * - exact contraire (hors bornes) : sens de l'inégalité non changé en divisant par un négatif ;
 * - ensemble trop grand : une condition oubliée (réunion au lieu d'intersection) ;
 * - ensemble trop petit : des réels permis retirés.
 */
export function cibleEnsemble(saisi: EnsembleReelGuide, attendu: EnsembleReelGuide): FragmentConsigne[] | null {
  const bs = [...new Set([...bornes(saisi), ...bornes(attendu)].map((b) => Math.round(b * 1e9) / 1e9))];
  const interieurs: number[] = [];
  for (let x = -40; x <= 40; x += 0.25) interieurs.push(x);
  for (const b of bs) interieurs.push(b - 1e-4, b + 1e-4);
  const horsBornes = interieurs.filter((x) => !bs.some((b) => Math.abs(b - x) < 1e-7));
  const diffInterieur = horsBornes.filter((x) => contient(saisi, x) !== contient(attendu, x));
  if (diffInterieur.length === 0) {
    const enTrop = bs.find((b) => contient(saisi, b) && !contient(attendu, b));
    if (enTrop !== undefined) {
      return [t("Ton ensemble contient "), l(`x=${formatValeurLatex(enTrop)}`), t(" : cette valeur est interdite (elle annule un dénominateur, ou rend un radicande nul sous une racine placée au dénominateur). Crochet ouvert, ou valeur retirée.")];
    }
    const manquante = bs.find((b) => !contient(saisi, b) && contient(attendu, b));
    if (manquante !== undefined) {
      return [t("Ton ensemble exclut "), l(`x=${formatValeurLatex(manquante)}`), t(" : cette valeur vérifie pourtant la condition (inégalité large). Relis le crochet.")];
    }
    return null;
  }
  if (horsBornes.every((x) => contient(saisi, x) !== contient(attendu, x))) {
    return [t("Ton ensemble est exactement le contraire de celui attendu : en divisant par un nombre négatif, as-tu changé le sens de l'inégalité ?")];
  }
  const tropGrand = horsBornes.every((x) => !contient(attendu, x) || contient(saisi, x));
  if (tropGrand) return [t("Ton ensemble contient des réels interdits : garde toutes les conditions à la fois (leur intersection, pas leur réunion).")];
  const tropPetit = horsBornes.every((x) => contient(attendu, x) || !contient(saisi, x));
  if (tropPetit) return [t("Ton ensemble oublie des réels permis : une valeur exclue ne retire qu'un point, et une inégalité large garde sa borne.")];
  return null;
}

// ============================================================================
// 5gen1 — domaine de définition.
// ============================================================================

function slotsDe(e: ExerciceDomaineDefinition): SlotCE[] {
  return e.famille === "pasDeCE" ? [] : e.slots;
}

const AIDE_PROPRIETES_CE: AideTrig = {
  texte: [t("Une division n'existe que si le dénominateur est non nul ; une racine d'indice pair n'existe que si le radicande est positif ou nul ; une racine d'indice impair et une valeur absolue existent pour tout réel :")],
  formules: ["\\dfrac{A}{B}\\ \\text{existe} \\iff B\\neq 0 \\qquad \\sqrt{A}\\ \\text{existe} \\iff A\\geq 0"],
};

/** Aides de l'écran « CE » (2 niveaux). */
export function aidesCE5gen1(e: ExerciceDomaineDefinition): AideTrig[] {
  if (e.famille === "pasDeCE") {
    const op = e.raison === "racineImpaire" ? "une racine d'indice impair" : "une valeur absolue";
    return [AIDE_PROPRIETES_CE, { texte: [t(`Ici, la seule opération délicate est ${op}, appliquée à `), l(e.argumentLatex), t(". Quels réels a-t-on le droit d'y mettre ?")] }];
  }
  const slots = slotsDe(e);
  if (e.aucuneCE) {
    return [
      AIDE_PROPRIETES_CE,
      { texte: [t("Repère l'expression qui pourrait poser problème, "), l(slots[0]?.latex ?? "f(x)"), t(", puis demande-toi si elle peut réellement prendre une valeur interdite (s'annuler, devenir négative) pour un réel x : regarde son signe ou son discriminant.")] },
    ];
  }
  const morceaux: FragmentConsigne[] = [t("Ici, f(x) contient ")];
  slots.forEach((s, i) => {
    if (i > 0) morceaux.push(t(" et "));
    morceaux.push(t(s.role === "denominateur" ? "un dénominateur " : "un radicande "), l(s.latex));
  });
  const racineAuDenominateur = e.famille === "racineSurFraction" && e.structure === "nSurRacineD";
  morceaux.push(t(racineAuDenominateur ? " : la racine est elle-même au dénominateur, elle doit donc être à la fois définie et non nulle." : " : écris une condition pour chacun."));
  return [AIDE_PROPRIETES_CE, { texte: morceaux }];
}

/** Message ciblé de l'écran « CE » (choix fermés : affiché sous la réponse révélée). */
export function cibleCE5gen1(e: ExerciceDomaineDefinition, r: ReponseCE): FragmentConsigne[] | null {
  const slots = slotsDe(e);
  if (e.famille === "pasDeCE" && !r.aucuneCE) {
    return [t(e.raison === "racineImpaire" ? "Une racine d'indice impair existe pour tout réel (" : "Une valeur absolue existe pour tout réel ("), l(e.raison === "racineImpaire" ? "\\sqrt[3]{-8}=-2" : "|-3|=3"), t(") : aucune condition d'existence.")];
  }
  if (e.aucuneCE) return r.aucuneCE ? null : [t("Cette condition est toujours vraie : l'expression ne prend jamais de valeur interdite. Elle n'élimine aucun réel.")];
  if (r.aucuneCE) return [t("Cherche une division (son dénominateur doit être non nul) ou une racine d'indice pair (son radicande doit être positif ou nul).")];
  const ids = new Set(slots.map((s) => s.id));
  if (r.lignes.some((ligne) => !ids.has(ligne.slotId))) return [t("Une condition porte sur la mauvaise expression : c'est le dénominateur (pas le numérateur) qui doit être non nul, et le radicande qui doit être positif ou nul.")];
  for (const s of slots) {
    const symboles = r.lignes.filter((ligne) => ligne.slotId === s.id).map((ligne) => ligne.symbole);
    if (symboles.length === 0) return [t("Il manque une condition : chaque dénominateur et chaque radicande donne la sienne.")];
    if (s.symboleAttendu === ">" && symboles.length === 1 && symboles[0] === "≥") {
      return [t("La racine est au dénominateur : son radicande doit être positif ou nul (racine définie) et non nul (division possible), donc strictement positif :"), l(` ${formatSlotConditionLatex(s)}`), t(".")];
    }
    if (s.symboleAttendu === "≥" && symboles.includes("≠")) return [t("Un radicande doit être positif ou nul : « non nul » ne suffit pas (une racine d'un nombre négatif n'existe pas).")];
    if (s.symboleAttendu === "≠" && symboles.some((x) => x !== "≠")) return [t("Un dénominateur doit seulement être non nul : il peut être négatif.")];
  }
  return null;
}

/** Aides de l'écran « résolution » (fraction sous racine : tableau de signes ; racine sur fraction :
 * deux conditions indépendantes). */
export function aidesResolution5gen1(e: ExerciceDomaineDefinition): AideTrig[] {
  if (e.famille === "fractionSousRacine") {
    const zeros = e.racines.map((r) => formatValeurLatex(r)).join("\\,;\\,");
    return [
      {
        texte: [t("Dans un tableau de signes, une ligne change de signe à chaque zéro simple ; le quotient suit la règle des signes et n'existe pas là où le dénominateur s'annule (double barre) :")],
        formules: ["\\dfrac{+}{+}=+ \\qquad \\dfrac{+}{-}=- \\qquad \\dfrac{-}{-}=+"],
      },
      { texte: [t("Ici, les zéros à placer dans l'ordre sont "), l(zeros === "" ? "\\text{aucun}" : zeros), t(" ; remplis la ligne de "), l(e.numerateurLatex), t(", celle de "), l(e.denominateurLatex), t(", puis le quotient.")] },
    ];
  }
  if (e.famille === "racineSurFraction") {
    const [rad, den] = e.slots;
    return [
      { texte: [t("Résous chaque condition séparément : une inégalité (si tu divises par un nombre négatif, le sens change), puis la valeur qui annule le dénominateur :")], formules: ["-2x\\geq -6 \\iff x\\leq 3"] },
      { texte: [t("Ici : isole x dans "), l(formatSlotConditionLatex(rad)), t(", puis cherche le x qui annule "), l(den?.latex ?? ""), t(".")] },
    ];
  }
  return [];
}

/** Aides de l'écran « domaine » (2 niveaux ; fraction sous racine : le surlignage du tableau reste
 * affiché au niveau 2). */
export function aidesDomf5gen1(e: ExerciceDomaineDefinition): AideTrig[] {
  const niveau1: AideTrig = {
    texte: [t("Le domaine contient les réels x qui vérifient toutes les conditions d'existence à la fois (intersection) :")],
    formules: ["\\operatorname{dom}f=\\{x\\in\\mathbb{R} \\mid \\text{toutes les conditions sont vraies}\\}"],
  };
  if (e.famille === "pasDeCE" || e.aucuneCE) {
    return [niveau1, { texte: [t("Reprends la conclusion de l'écran précédent : y a-t-il un seul réel x à retirer ?")] }];
  }
  if (e.famille === "fractionSousRacine") {
    return [niveau1, { texte: [t("Les colonnes du tableau où le quotient est positif ou nul sont surlignées : garde-les, sans les valeurs où le dénominateur s'annule (double barre).")] }];
  }
  const slots = slotsDe(e);
  const radicande = slots.find((s) => s.role === "radicande");
  if (!radicande) {
    return [niveau1, { texte: [t("Une seule sorte de condition ici : des valeurs exclues. Trouve les x qui annulent "), l(slots[0]?.latex ?? ""), t(", puis écris ℝ privé de ces valeurs.")] }];
  }
  return [
    niveau1,
    {
      texte: [
        t("Résous "),
        l(formatSlotConditionLatex(radicande)),
        t(" : une borne où la condition est large (≥) est incluse (crochet fermé) ; une valeur qui annule un dénominateur est exclue (crochet ouvert)."),
      ],
    },
  ];
}

// ============================================================================
// 5gen2 — décomposition.
// ============================================================================

const LETTRES = ["g", "h", "i", "j", "k", "l", "m", "n"];

function composer(lignes: string[], x: number): number {
  let v = x;
  for (const ligne of lignes) v = evaluerExpressionGenerale(normaliserLigneDecomposition(ligne), v);
  return v;
}

function memeChaine(lignes: string[], reference: (x: number) => number): boolean {
  let comparaisons = 0;
  try {
    for (let x = -6; x <= 6; x += 0.5) {
      const a = composer(lignes, x);
      const b = reference(x);
      if (!Number.isFinite(a) && !Number.isFinite(b)) continue;
      if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
      if (Math.abs(a - b) > 1e-6 * Math.max(1, Math.abs(b))) return false;
      comparaisons++;
    }
  } catch {
    return false;
  }
  return comparaisons >= 8;
}

/** Une ligne illisible (rien n'est évalué) : la saisie n'est pas transmise. */
export function decompositionIllisible(lignes: string[]): boolean {
  return lignes.some((ligne) => {
    try {
      let lue = false;
      for (const x of [0.5, 1, 2, 3, 7]) {
        try {
          evaluerExpressionGenerale(normaliserLigneDecomposition(ligne), x);
          lue = true;
          break;
        } catch {
          // essai suivant
        }
      }
      return !lue;
    } catch {
      return true;
    }
  });
}

/** Message ciblé : ordre inversé, ou chaîne arrêtée avant la dernière opération. */
export function cibleDecomposition(e: ExerciceDecompositionFonction, lignes: string[]): FragmentConsigne[] | null {
  const f = (x: number) => evaluerExpressionGenerale(e.fFormule, x);
  if (lignes.length >= 2 && memeChaine([...lignes].reverse(), f)) {
    return [t("Tes fonctions sont dans l'ordre inverse : la première ligne, "), l(`${LETTRES[0]}(x)`), t(", est celle qu'on applique en premier à x (la plus intérieure).")];
  }
  if (e.couches.length >= 2) {
    const debut = e.couches.slice(0, -1).map((c) => c.propreFormule);
    if (memeChaine(lignes, (x) => composer(debut, x))) {
      return [t("Ta chaîne s'arrête trop tôt : elle reconstruit seulement "), l(e.couches[e.couches.length - 1].argumentLatex), t(". Il manque la dernière opération, appliquée à tout ce qui précède.")];
    }
  }
  return null;
}

// ============================================================================
// 5gen3 — composer f et g.
// ============================================================================

function nomExterieure(dir: CompositionDirigee): "f" | "g" {
  return dir.nomInterieure === "f" ? "g" : "f";
}

/** Formule saisie : l'élève a-t-il composé dans l'autre sens (g(f(x)) au lieu de f(g(x))) ? */
export function cibleFormuleComposee(dir: CompositionDirigee, autre: CompositionDirigee | null, texte: string): FragmentConsigne[] | null {
  const ext = nomExterieure(dir);
  const int = dir.nomInterieure;
  const formuleInverse = autre?.formule ?? dir.interieure.formule.replace(/x/g, `(${dir.exterieure.formule})`);
  let n = 0;
  try {
    for (let x = -6; x <= 6; x += 0.37) {
      const a = evaluerExpressionGenerale(texte, x);
      const b = evaluerExpressionGenerale(formuleInverse, x);
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      if (Math.abs(a - b) > 1e-6 * Math.max(1, Math.abs(b))) return null;
      n++;
    }
  } catch {
    return null;
  }
  if (n < 6) return null;
  return [t("Tu as composé dans l'autre sens : "), l(`(${ext}\\circ ${int})(x)=${ext}\\big(${int}(x)\\big)`), t(` — on remplace chaque x de ${ext}(x) par ${int}(x), et non l'inverse.`)];
}

/** Domaine saisi : condition 2 oubliée (domaine de l'intérieure seul), ou message générique. */
export function cibleDomaineComposee(dir: CompositionDirigee, saisi: EnsembleReelGuide): FragmentConsigne[] | null {
  const memeQue = (a: EnsembleReelGuide, b: EnsembleReelGuide) => {
    for (let x = -40; x <= 40; x += 0.125) if (contient(a, x) !== contient(b, x)) return false;
    return true;
  };
  const int = dir.nomInterieure;
  const ext = nomExterieure(dir);
  if (!memeQue(dir.interieure.domaine, dir.domaine) && memeQue(saisi, dir.interieure.domaine)) {
    return [t(`Tu as gardé seulement le domaine de ${int} : il faut aussi que `), l(`${int}(x)`), t(` appartienne au domaine de ${ext} (deuxième condition).`)];
  }
  if (!memeQue(dir.exterieure.domaine, dir.domaine) && memeQue(saisi, dir.exterieure.domaine)) {
    return [t(`Tu as recopié le domaine de ${ext} : c'est `), l(`${int}(x)`), t(`, et non x, qui doit appartenir au domaine de ${ext}.`)];
  }
  return cibleEnsemble(saisi, dir.domaine);
}

// ============================================================================
// 5gen4 — composée lue sur un graphique.
// ============================================================================

function noms(q: QuestionComposeeGraphique): { ext: "f" | "g"; int: "f" | "g" } {
  return q.composition === "fRondG" ? { ext: "f", int: "g" } : { ext: "g", int: "f" };
}

function courbe(e: ExerciceComposeeGraphique, nom: "f" | "g"): CourbeGraphique {
  return nom === "f" ? e.f : e.g;
}

function image(c: CourbeGraphique, x: number): number | null {
  return c.points.find((p) => p.x === x)?.y ?? null;
}

/** Aides (2 niveaux, KaTeX) — elles portent sur la lecture de la valeur intermédiaire ; le niveau 2
 * marque aussi le point sur le graphe de la fonction intérieure. */
export function aidesComposeeGraphique(q: QuestionComposeeGraphique): AideTrig[] {
  const { ext, int } = noms(q);
  return [
    { texte: [t("Une composée se lit de l'intérieur vers l'extérieur : d'abord la fonction appliquée à x, puis l'autre, si son entrée appartient à son domaine :")], formules: [`(${ext}\\circ ${int})(${q.a})=${ext}\\big(${int}(${q.a})\\big)`] },
    { texte: [t("Lis "), l(`${int}(${q.a})`), t(` sur le graphe de ${int} (le point d'abscisse `), l(String(q.a)), t(" est maintenant marqué), puis cherche cette valeur sur l'axe des abscisses du graphe de "), l(ext), t(".")] },
  ];
}

/** Message ciblé (valeur fausse) ; pour le choix « existe / n'existe pas » (une tentative), message
 * affiché sous la réponse révélée. */
export function cibleComposeeGraphique(e: ExerciceComposeeGraphique, q: QuestionComposeeGraphique, reponse: { resultatExiste: boolean; valeur: number | null }): FragmentConsigne[] | null {
  const { ext, int } = noms(q);
  const cExt = courbe(e, ext);
  const xMin = cExt.points[0].x;
  const xMax = cExt.points[cExt.points.length - 1].x;
  const domaineExt = `\\operatorname{dom}${ext}=[${xMin}\\,;\\,${xMax}]`;
  if (reponse.resultatExiste !== q.resultatExiste) {
    if (q.resultatExiste) return [l(`${int}(${q.a})=${q.bAttendu}`), t(" appartient au domaine de "), l(ext), t(" (le graphe complet de "), l(ext), t(" va de "), l(String(xMin)), t(" à "), l(String(xMax)), t(") : la composée existe.")];
    return [l(`${int}(${q.a})=${q.bAttendu}`), t(" n'appartient pas au domaine de "), l(ext), t(" : "), l(domaineExt), t(". Le graphe est complet, "), l(ext), t(" n'est pas définie en cette valeur.")];
  }
  const v = reponse.valeur;
  if (v === null || !q.resultatExiste) return null;
  if (v === q.bAttendu && q.bAttendu !== q.resultatAttendu) return [t("Tu as donné "), l(`${int}(${q.a})`), t(", la valeur intermédiaire : lis ensuite "), l(ext), t(" en cette valeur.")];
  const autreSens = image(courbe(e, int), image(cExt, q.a) ?? Number.NaN);
  if (autreSens !== null && v === autreSens && autreSens !== q.resultatAttendu) return [t("Tu as lu dans l'autre ordre : "), l(`${ext}\\big(${int}(${q.a})\\big)`), t(" commence par "), l(int), t(".")];
  const directe = image(cExt, q.a);
  if (directe !== null && v === directe && directe !== q.resultatAttendu) return [t("Tu as lu "), l(`${ext}(${q.a})`), t(" directement : il faut d'abord calculer "), l(`${int}(${q.a})`), t(".")];
  return null;
}

/** Phrase de l'énoncé : les graphes sont COMPLETS (audit G10) — « n'existe pas » est alors une
 * vraie réponse, distincte de « hors de la portion tracée ». */
export const PHRASE_GRAPHES_COMPLETS = "Les graphes ci-dessous sont complets : chaque fonction n'est définie que sur l'intervalle où elle est tracée (extrémités marquées par un point).";

export { formatEnsembleReelLatex };
