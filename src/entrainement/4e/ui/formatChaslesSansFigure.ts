import type { ExerciceChaslesSansFigure, ExerciceCoefficients, ExerciceDemontrer, ExerciceInserer, ExerciceReduire } from "../core/chaslesSansFigure.types";
import { coefficientsPoints, egales, estNulle, lireTermes, pointsCites, saisieLatex, substituer, termesLatex, termesReduits, type CoefficientsPoints, type TermeVecteur } from "../moteur/expressionChasles";
import type { ChampPersonnalise, EcranTSD } from "./ecransTransfertSecondDegre";
import { l, t, type Fr } from "./outilsAnalytiqueLotG";

/**
 * Textes, écrans et réponses de gen130 « Chasles sans figure » — SOURCE UNIQUE (écran, aides,
 * papier, corrigé). Notation du cours (§ 6) : vecteurs \vec{AB}, relation de Chasles
 * \vec{AB} + \vec{BC} = \vec{AC}, opposé −\vec{AB} = \vec{BA}, vecteur nul \vec{0}.
 */

type E = ExerciceChaslesSansFigure;
export const vec = (k: number, de: string, vers: string): TermeVecteur => ({ k, de, vers });
export const TL = termesLatex;
export const V = (de: string, vers: string) => `\\vec{${de}${vers}}`;

/** Terme écrit avec un coefficient positif (vecteur retourné si besoin) : −CB → BC. */
export const positif = (x: TermeVecteur): TermeVecteur => (x.k < 0 ? vec(-x.k, x.vers, x.de) : x);

/** Points de l'exercice. */
export function pointsExercice(e: E): string[] {
  if (e.variante === "reduire") return e.chaine;
  if (e.variante === "coefficients") return [e.X, e.Y, e.Z];
  if (e.variante === "demontrer") return [e.P, e.Q, e.R, e.S];
  return e.sousForme === "milieu" ? [e.A, e.B, e.I, e.M] : [e.A, e.B, e.I];
}

/** Hypothèse de la variante « insérer » : le point I (milieu ou point défini) en fonction de A, B. */
export function hypotheses(e: ExerciceInserer): Record<string, CoefficientsPoints> {
  const s = e.a + e.b;
  return { [e.I]: { [e.A]: e.a / s, [e.B]: e.b / s } };
}

// ---------------------------------------------------------------------------------------------
// Résultats (une seule fonction pour l'écran, le papier et le corrigé)
// ---------------------------------------------------------------------------------------------

/** Résultat d'une réduction : un seul terme à coefficient positif, ou le vecteur nul. */
export function unSeulVecteur(c: CoefficientsPoints, points: string[]): TermeVecteur[] {
  const non = points.filter((p) => Math.abs(c[p] ?? 0) > 1e-12);
  if (non.length === 0) return [];
  const arrivee = non.find((p) => c[p]! > 0)!;
  const depart = non.find((p) => c[p]! < 0)!;
  return [vec(c[arrivee]!, depart, arrivee)];
}

export function resultatReduire(e: ExerciceReduire): TermeVecteur[] {
  return e.ferme ? [] : [vec(1, e.chaine[0]!, e.chaine[e.chaine.length - 1]!)];
}

export function resultatCoefficients(e: ExerciceCoefficients): TermeVecteur[] {
  const r = e.k + e.c;
  if (r === 0) return [];
  return r > 0 ? [vec(r, e.X, e.Z)] : [vec(-r, e.Z, e.X)];
}

/** Démontrer : vecteur attendu à l'écran b. */
export function vecteurDemontrer(e: ExerciceDemontrer): TermeVecteur {
  if (e.sousForme === "difference") return vec(1, e.P, e.R);
  return e.insere === "S" ? vec(1, e.R, e.Q) : vec(1, e.P, e.S);
}

/** Ligne juste de l'écran a de « démontrer » (membre droit de la première ligne). */
export function premiereLigneJuste(e: ExerciceDemontrer): TermeVecteur[] {
  const { P, Q, R, S } = e;
  if (e.sousForme === "difference") return [vec(1, P, Q), vec(1, Q, R)];
  return e.insere === "S" ? [vec(1, P, S), vec(1, S, Q), vec(1, R, S)] : [vec(1, P, Q), vec(1, R, Q), vec(1, Q, S)];
}

export function egaliteL(e: ExerciceDemontrer): string {
  return `${TL(e.gauche)}=${TL(e.droite)}`;
}

/** a·MA + b·MB (variante « point »). */
export function sommePointL(e: ExerciceInserer): string {
  return TL([vec(e.a, e.I, e.A), vec(e.b, e.I, e.B)]);
}

export function resultatInserer(e: ExerciceInserer): TermeVecteur[] {
  if (e.sousForme === "milieu") return [vec(2, e.M, e.I)];
  return [vec(e.b / (e.a + e.b), e.A, e.B)];
}

/** Écran a de « insérer » : la somme après insertion. */
export function insertionInserer(e: ExerciceInserer): TermeVecteur[] {
  if (e.sousForme === "milieu") return [vec(2, e.M, e.I), vec(1, e.I, e.A), vec(1, e.I, e.B)];
  return [vec(e.a + e.b, e.I, e.A), vec(e.b, e.A, e.B)];
}

// ---------------------------------------------------------------------------------------------
// Énoncé, consignes
// ---------------------------------------------------------------------------------------------

export function questionPapier(e: E): Fr {
  if (e.variante === "reduire" || e.variante === "coefficients") return [t("Réduis "), l(TL(e.termes)), t(" à un seul vecteur (multiplié au besoin par un nombre) ou au vecteur nul.")];
  if (e.variante === "demontrer") return [t("Démontre que "), l(egaliteL(e)), t(`, quels que soient les points ${[e.P, e.Q, e.R, e.S].sort().join(", ").replace(/, (\w)$/, " et $1")}.`)];
  if (e.sousForme === "milieu") return [t("Exprime "), l(`${V(e.M, e.A)}+${V(e.M, e.B)}`), t(" en fonction de "), l(V(e.M, e.I)), t(".")];
  return [t("Exprime "), l(V(e.A, e.I)), t(" en fonction de "), l(V(e.A, e.B)), t(".")];
}

/** Données (avant la question) : seulement pour « insérer ». */
export function enteteFragments(e: E): Fr {
  if (e.variante !== "inserer") return [];
  if (e.sousForme === "milieu") return [l(e.I), t(" est le milieu du segment "), l(`[${e.A}${e.B}]`), t(" et "), l(e.M), t(" est un point quelconque.")];
  return [l(e.A), t(" et "), l(e.B), t(" sont deux points distincts, et le point "), l(e.I), t(" vérifie "), l(`${sommePointL(e)}=\\vec{0}`), t(".")];
}

/** Bloc de données de l'écran. */
export function donneesEcran(e: E): Fr {
  if (e.variante === "reduire" || e.variante === "coefficients") return [t("Expression à réduire : "), l(TL(e.termes))];
  if (e.variante === "demontrer") return [t("À démontrer, pour tous points : "), l(egaliteL(e))];
  return [...enteteFragments(e), t(" "), ...questionPapier(e)];
}

export function consigneGenerale(e: E): string {
  if (e.variante === "reduire" || e.variante === "coefficients") return "Réduis l'expression avec la relation de Chasles, sans figure : un seul vecteur (multiplié au besoin par un nombre) ou le vecteur nul.";
  if (e.variante === "demontrer") return "Démontre l'égalité : transforme un membre avec la relation de Chasles jusqu'à obtenir l'autre.";
  return "Insère un point avec la relation de Chasles, puis utilise l'hypothèse de l'énoncé.";
}

export const TITRES: Record<E["variante"], [string, string]> = {
  reduire: ["Retourner les vecteurs retranchés", "Réordonner et télescoper"],
  coefficients: ["Regrouper les termes de même coefficient", "Réduire l'expression"],
  demontrer: ["La première ligne", "Arriver à l'autre membre"],
  inserer: ["Insérer un point", "Utiliser l'hypothèse"],
};

export function consignesEcrans(e: E): Fr[] {
  if (e.variante === "reduire") {
    return [
      [t("Remplace chaque vecteur précédé de « − » par son opposé : récris l'expression avec des « + » seulement.")],
      [t("Réordonne les vecteurs pour qu'ils se relaient, puis réduis : écris le résultat (un seul vecteur, ou 0 pour le vecteur nul).")],
    ];
  }
  if (e.variante === "coefficients") {
    return [
      [t("Regroupe les deux termes de même coefficient (au signe près) et réduis-les : à quoi est égal "), l(TL(e.groupe)), t(" ?")],
      [t("Réduis maintenant l'expression complète : un seul vecteur, multiplié au besoin par un nombre (ou 0 pour le vecteur nul).")],
    ];
  }
  if (e.variante === "demontrer") {
    return [
      [t("Quelle première ligne de la démonstration est correcte ?")],
      e.sousForme === "echange"
        ? [t("Réordonne : deux des trois vecteurs de cette ligne se relaient. Réduis-les : quel vecteur obtiens-tu ?")]
        : [t("Réduis chacun des deux membres : quel vecteur obtiens-tu des deux côtés ?")],
    ];
  }
  if (e.sousForme === "milieu") {
    return [
      [t("Insère "), l(e.I), t(" dans "), l(V(e.M, e.A)), t(" et dans "), l(V(e.M, e.B)), t(" (relation de Chasles) : écris la somme obtenue.")],
      [t("Utilise le fait que "), l(e.I), t(" est le milieu de "), l(`[${e.A}${e.B}]`), t(" : exprime "), l(`${V(e.M, e.A)}+${V(e.M, e.B)}`), t(" en fonction de "), l(V(e.M, e.I)), t(".")],
    ];
  }
  return [
    [t("Insère "), l(e.A), t(" dans "), l(V(e.I, e.B)), t(" et regroupe : écris "), l(sommePointL(e)), t(" avec seulement "), l(V(e.I, e.A)), t(" et "), l(V(e.A, e.B)), t(".")],
    [t("Déduis-en "), l(V(e.A, e.I)), t(" en fonction de "), l(V(e.A, e.B)), t(".")],
  ];
}

// ---------------------------------------------------------------------------------------------
// Propositions de l'écran a de « démontrer » (0 = la juste)
// ---------------------------------------------------------------------------------------------

export interface Proposition {
  droite: TermeVecteur[];
  explication: string;
}

export function propositionsDemontrer(e: ExerciceDemontrer): Proposition[] {
  const { P, Q, R, S } = e;
  if (e.sousForme === "difference") {
    return [
      { droite: premiereLigneJuste(e), explication: "" },
      { droite: [vec(1, P, Q), vec(1, R, Q)], explication: `Retrancher $${V(R, Q)}$, c'est ajouter son opposé $${V(Q, R)}$ : le sens change, pas seulement le signe.` },
      { droite: [vec(1, R, P)], explication: `$${V(P, Q)}+${V(Q, R)}=${V(P, R)}$ : la réduction donne $${V(P, R)}$, pas son opposé $${V(R, P)}$.` },
      { droite: [vec(1, Q, P), vec(1, Q, R)], explication: `Seul le vecteur retranché change de sens : $${V(P, Q)}$ reste $${V(P, Q)}$.` },
    ];
  }
  const juste = premiereLigneJuste(e);
  if (e.insere === "S") {
    return [
      { droite: juste, explication: "" },
      { droite: [vec(1, P, S), vec(1, Q, S), vec(1, R, S)], explication: `Pour insérer S dans $${V(P, Q)}$, on passe par S : $${V(P, Q)}=${V(P, S)}+${V(S, Q)}$, pas $${V(P, S)}+${V(Q, S)}$.` },
      { droite: [vec(1, P, S)], explication: `$${V(P, Q)}$ et $${V(R, S)}$ ne se relaient pas (Q n'est pas R) : on ne peut pas les télescoper.` },
      { droite: [vec(1, P, R), vec(1, Q, S)], explication: "Ce n'est pas la relation de Chasles : on ne peut pas échanger les points de départ et d'arrivée." },
    ];
  }
  return [
    { droite: juste, explication: "" },
    { droite: [vec(1, P, Q), vec(1, R, Q), vec(1, S, Q)], explication: `Pour insérer Q dans $${V(R, S)}$, on passe par Q : $${V(R, S)}=${V(R, Q)}+${V(Q, S)}$, pas $${V(R, Q)}+${V(S, Q)}$.` },
    { droite: [vec(1, P, S)], explication: `$${V(P, Q)}$ et $${V(R, S)}$ ne se relaient pas (Q n'est pas R) : on ne peut pas les télescoper.` },
    { droite: [vec(1, P, R), vec(1, Q, S)], explication: "Ce n'est pas la relation de Chasles : on ne peut pas échanger les points de départ et d'arrivée." },
  ];
}

export function ligneProposition(e: ExerciceDemontrer, p: Proposition): string {
  return `${TL(e.gauche)}=${TL(p.droite)}`;
}

// ---------------------------------------------------------------------------------------------
// Lecture et jugement d'une saisie
// ---------------------------------------------------------------------------------------------

interface Attente {
  points: string[];
  cible: CoefficientsPoints;
  hyp?: Record<string, CoefficientsPoints>;
  /** Réponse attendue : un seul vecteur (ou le vecteur nul). */
  unSeul?: boolean;
  messageUnSeul?: string;
  /** Écran « des + seulement ». */
  sansMoins?: boolean;
  /** Vecteurs permis dans l'écriture (insérer : passer par I ; n'utiliser que MA et AB…). */
  permis?: (x: TermeVecteur) => boolean;
  messagePermis?: string;
  pieges: { coef: CoefficientsPoints; message: string }[];
  messageSiFaux: string;
}

const opposees = (c: CoefficientsPoints): CoefficientsPoints => Object.fromEntries(Object.entries(c).map(([p, k]) => [p, -k]));

export function diagnostiquerVecteurs(saisie: string, at: Attente): { etat: "correct" | "faux" | "piege" | "parse_error" | "forme"; message?: string } {
  const termes = lireTermes(saisie);
  if (!termes) return { etat: "parse_error" };
  const inconnus = pointsCites(termes).filter((p) => !at.points.includes(p));
  if (inconnus.length) return { etat: "faux", message: `Le point ${inconnus[0]} ne figure pas dans l'exercice : n'utilise que ${[...at.points].sort().join(", ").replace(/, (\w)$/, " et $1")}.` };
  const sub = (c: CoefficientsPoints) => (at.hyp ? substituer(c, at.hyp) : c);
  const c = sub(coefficientsPoints(termes));
  const cible = sub(at.cible);
  if (egales(c, cible)) {
    if (at.permis && !termes.every((x) => x.de === "" || at.permis!(x))) return { etat: "forme", message: at.messagePermis ?? "C'est juste, mais pas sous la forme demandée." };
    if (at.sansMoins && termes.some((x) => x.k < 0)) return { etat: "forme", message: "C'est juste, mais il reste un signe « − » : remplace chaque vecteur retranché par son opposé." };
    if (at.unSeul) {
      const red = termesReduits(termes);
      if (red.length > 1) return { etat: "forme", message: at.messageUnSeul ?? "C'est juste, mais réduis jusqu'à un seul vecteur." };
      if (red.length === 1 && red[0]!.k < 0) return { etat: "forme", message: `C'est juste, mais écris-le sans signe « − » : $-${V(red[0]!.de, red[0]!.vers)}=${V(red[0]!.vers, red[0]!.de)}$.` };
    }
    return { etat: "correct" };
  }
  if (!estNulle(cible) && egales(c, opposees(cible))) return { etat: "piege", message: "Ton résultat va dans le mauvais sens : c'est l'opposé de la réponse. Vérifie les vecteurs que tu as retournés." };
  for (const p of at.pieges) if (egales(c, sub(p.coef))) return { etat: "piege", message: p.message };
  return { etat: "faux", message: at.messageSiFaux };
}

const AIDE_SAISIE = "Nomme chaque vecteur par ses deux points (AB, CD…), sans flèche ; 0 pour le vecteur nul ; un coefficient devant : 2AB, 1/3AB.";

function champ(id: string, libelle: Fr, at: Attente): ChampPersonnalise {
  return { type: "personnalise", id, libelle, aideSaisie: AIDE_SAISIE, apercuLatex: saisieLatex, affichee: saisieLatex, verifier: (s) => diagnostiquerVecteurs(s, at) };
}

/** Coefficients de points d'une liste de termes. */
export const cp = (termes: TermeVecteur[]) => coefficientsPoints(termes);

/** Toutes les façons d'« oublier » de retourner un ou plusieurs vecteurs retranchés (piège). */
function signesOublies(termes: TermeVecteur[]): CoefficientsPoints[] {
  const negatifs = termes.map((x, i) => (x.k < 0 ? i : -1)).filter((i) => i >= 0);
  const sortie: CoefficientsPoints[] = [];
  for (let masque = 1; masque < 1 << negatifs.length; masque++) {
    const modifie = termes.map((x, i) => {
      const j = negatifs.indexOf(i);
      return j >= 0 && masque & (1 << j) ? vec(-x.k, x.de, x.vers) : x;
    });
    sortie.push(cp(modifie));
  }
  return sortie;
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

function ecransReduire(e: ExerciceReduire): EcranTSD[] {
  const points = e.chaine;
  const cible = cp(e.termes);
  const oublis = signesOublies(e.termes).map((coef) => ({ coef, message: "Retrancher un vecteur, c'est ajouter son opposé : $-\\vec{XY}$ devient $+\\vec{YX}$ (on échange les deux lettres), pas $+\\vec{XY}$." }));
  const retranches = e.termes.filter((x) => x.k < 0);
  const depart = e.chaine[0]!;
  return [
    {
      type: "champs",
      titre: TITRES.reduire[0],
      consigne: consignesEcrans(e)[0]!,
      champs: [champ("plus", [t("Expression :")], { points, cible, sansMoins: true, pieges: oublis, messageSiFaux: "Ton expression n'est plus égale à celle de départ : retourne seulement les vecteurs précédés de « − »." })],
      aides: [
        [t("Retrancher un vecteur, c'est ajouter son opposé ; l'opposé d'un vecteur s'obtient en échangeant ses deux lettres : "), l("-\\vec{XY}=\\vec{YX}"), t(".")],
        [t("Ici, les vecteurs précédés de « − » sont "), l(retranches.map((x) => `-${V(x.de, x.vers)}`).join(",\\ ")), t(" : échange leurs deux lettres et remplace « − » par « + ».")],
      ],
      reponse: [l(TL(e.termes.map(positif)))],
    },
    {
      type: "champs",
      titre: TITRES.reduire[1],
      consigne: consignesEcrans(e)[1]!,
      champs: [champ("resultat", [t("Résultat :")], { points, cible, unSeul: true, pieges: oublis, messageSiFaux: "Range les vecteurs pour que chacun commence là où le précédent finit, puis applique la relation de Chasles de proche en proche." })],
      aides: [
        [t("Relation de Chasles : deux vecteurs qui se relaient (l'arrivée du premier est le départ du second) se réduisent à un seul : "), l("\\vec{XY}+\\vec{YZ}=\\vec{XZ}"), t(". Une chaîne qui revient à son point de départ donne le vecteur nul.")],
        [t(`Ici, commence par le vecteur qui part de ${depart}, puis cherche celui qui part de son point d'arrivée, et ainsi de suite.`)],
      ],
      reponse: [l(TL(resultatReduire(e)))],
    },
  ];
}

function ecransCoefficients(e: ExerciceCoefficients): EcranTSD[] {
  const points = [e.X, e.Y, e.Z];
  const groupe = e.groupe;
  const cibleA = cp(groupe);
  const k = e.k;
  const negatif = groupe.find((x) => x.k < 0);
  const t3 = e.troisieme;
  const sur = vec(e.c, e.X, e.Z);
  const fauxSigne = cp([vec(k, e.X, e.Z), vec(-e.c, e.X, e.Z)]);
  return [
    {
      type: "champs",
      titre: TITRES.coefficients[0],
      consigne: consignesEcrans(e)[0]!,
      champs: [champ("groupe", [l(`${TL(groupe)}=`)], { points, cible: cibleA, unSeul: true, pieges: [], messageSiFaux: "Mets le coefficient commun en évidence, puis applique la relation de Chasles à la parenthèse." })],
      aides: [
        [t("Un coefficient commun se met en évidence, puis la relation de Chasles réduit la parenthèse : "), l("k\\,\\vec{XY}+k\\,\\vec{YZ}=k\\,(\\vec{XY}+\\vec{YZ})"), t(".")],
        negatif
          ? [t("Ici, retourne d'abord le vecteur précédé de « − » : "), l(`${TL([negatif])}=${TL([positif(negatif)])}`), t(`, puis mets ${k} en évidence.`)]
          : [t(`Ici, mets ${k} en évidence : `), l(`${k}(${V(groupe[0].de, groupe[0].vers)}+${V(groupe[1].de, groupe[1].vers)})`), t(", puis réduis la parenthèse.")],
      ],
      reponse: [l(TL([vec(k, e.X, e.Z)]))],
    },
    {
      type: "champs",
      titre: TITRES.coefficients[1],
      consigne: consignesEcrans(e)[1]!,
      champs: [
        champ("resultat", [t("Résultat :")], {
          points,
          cible: cp(e.termes),
          unSeul: true,
          pieges: [{ coef: fauxSigne, message: `Attention au signe du dernier terme : ${e.retourneC ? "retourner un vecteur change le signe de son coefficient" : "son coefficient se soustrait"}.` }],
          messageSiFaux: "Remplace les deux termes regroupés par le vecteur trouvé, puis additionne les coefficients d'un même vecteur.",
        }),
      ],
      aides: [
        [t("Remplace les deux termes regroupés par le vecteur trouvé, retourne le dernier vecteur si besoin, puis additionne les coefficients d'un même vecteur : "), l("a\\,\\vec{XZ}+b\\,\\vec{XZ}=(a+b)\\,\\vec{XZ}"), t(".")],
        [t("Ici, les deux premiers donnent "), l(TL([vec(k, e.X, e.Z)])), t(" et le dernier "), l(e.retourneC ? `${TL([t3])}=${TL([sur])}` : TL([t3])), t(" : additionne les coefficients.")],
      ],
      reponse: [l(TL(resultatCoefficients(e)))],
    },
  ];
}

function ecransDemontrer(e: ExerciceDemontrer): EcranTSD[] {
  const props = propositionsDemontrer(e);
  const ordre = e.ordre;
  const points = [e.P, e.Q, e.R, e.S];
  const attendu = vecteurDemontrer(e);
  const ecranA: EcranTSD = {
    type: "choix",
    titre: TITRES.demontrer[0],
    consigne: consignesEcrans(e)[0]!,
    options: ordre.map((i) => [l(ligneProposition(e, props[i]!))]),
    bonne: ordre.indexOf(0),
    aides:
      e.sousForme === "echange"
        ? [
            [t("Pour démontrer une égalité, on transforme un membre jusqu'à obtenir l'autre. La relation de Chasles permet d'insérer un point dans un vecteur : "), l("\\vec{XY}=\\vec{XZ}+\\vec{ZY}"), t(".")],
            [t("Ici, le membre de droite contient "), l(V(e.P, e.S)), t(" et "), l(V(e.R, e.Q)), t(" : cherche la ligne qui fait apparaître l'un d'eux, sans erreur d'enchaînement.")],
          ]
        : [
            [t("Retrancher un vecteur, c'est ajouter son opposé : "), l("-\\vec{XY}=\\vec{YX}"), t(".")],
            [t("Ici, dans le membre de gauche, le vecteur retranché est "), l(V(e.R, e.Q)), t(" : seul celui-là change.")],
          ],
    messageFaux: "Cette ligne n'est pas correcte.",
    explications: ordre.map((i) => props[i]!.explication),
  };
  const droiteComplete = cp(e.droite);
  const ecranB: EcranTSD = {
    type: "champs",
    titre: TITRES.demontrer[1],
    consigne: consignesEcrans(e)[1]!,
    champs: [
      champ("vecteur", [t(e.sousForme === "echange" ? "Vecteur obtenu :" : "Les deux membres valent :")], {
        points,
        cible: cp([attendu]),
        unSeul: true,
        pieges: e.sousForme === "echange" ? [{ coef: droiteComplete, message: "On demande seulement le vecteur obtenu en réduisant les deux vecteurs qui se relaient (l'autre est déjà dans le membre de droite)." }] : [],
        messageSiFaux: e.sousForme === "echange" ? "Deux vecteurs de la ligne se relaient : l'arrivée de l'un est le départ de l'autre. Réduis-les avec Chasles." : "Retourne le vecteur retranché de chaque membre, puis applique la relation de Chasles.",
      }),
    ],
    aides:
      e.sousForme === "echange"
        ? [
            [t("Relation de Chasles : "), l("\\vec{XY}+\\vec{YZ}=\\vec{XZ}"), t(" ; on peut changer l'ordre des termes d'une somme.")],
            [t(`Ici, cherche le vecteur qui arrive en ${e.insere} et celui qui part de ${e.insere}.`)],
          ]
        : [
            [t("Relation de Chasles : "), l("\\vec{XY}+\\vec{YZ}=\\vec{XZ}"), t(".")],
            [t("Ici, à gauche : "), l(`${V(e.P, e.Q)}+${V(e.Q, e.R)}`), t(" ; à droite, retourne aussi "), l(V(e.R, e.S)), t(".")],
          ],
    reponse: [l(TL([attendu]))],
  };
  return [ecranA, ecranB];
}

function ecransInserer(e: ExerciceInserer): EcranTSD[] {
  const points = pointsExercice(e);
  const hyp = hypotheses(e);
  if (e.sousForme === "milieu") {
    const depart = [vec(1, e.M, e.A), vec(1, e.M, e.B)];
    return [
      {
        type: "champs",
        titre: TITRES.inserer[0],
        consigne: consignesEcrans(e)[0]!,
        champs: [
          champ("insertion", [l(`${TL(depart)}=`)], {
            points,
            cible: cp(depart),
            permis: (x) => x.de === e.I || x.vers === e.I,
            messagePermis: `C'est juste, mais chaque vecteur doit passer par ${e.I} : insère ${e.I} dans chacun.`,
            pieges: [{ coef: cp([vec(2, e.M, e.I), vec(1, e.A, e.I), vec(1, e.B, e.I)]), message: `Chasles s'enchaîne : $${V(e.M, e.A)}=${V(e.M, e.I)}+${V(e.I, e.A)}$ (${e.I} au milieu), pas $${V(e.M, e.I)}+${V(e.A, e.I)}$.` }],
            messageSiFaux: `Écris chaque vecteur en passant par ${e.I}, avec la relation de Chasles.`,
          }),
        ],
        aides: [
          [t("La relation de Chasles permet d'insérer n'importe quel point dans un vecteur : "), l("\\vec{XY}=\\vec{XZ}+\\vec{ZY}"), t(".")],
          [t("Ici, écris "), l(V(e.M, e.A)), t(` en passant par ${e.I}, puis `), l(V(e.M, e.B)), t(` en passant par ${e.I}, et additionne.`)],
        ],
        reponse: [l(TL(insertionInserer(e)))],
      },
      {
        type: "champs",
        titre: TITRES.inserer[1],
        consigne: consignesEcrans(e)[1]!,
        champs: [
          champ("resultat", [l(`${TL(depart)}=`)], {
            points,
            cible: cp(depart),
            hyp,
            unSeul: true,
            messageUnSeul: `C'est juste, mais utilise l'hypothèse : ${e.I} est le milieu de [${e.A}${e.B}], donc $${V(e.I, e.A)}+${V(e.I, e.B)}=\\vec{0}$.`,
            pieges: [{ coef: cp([vec(1, e.M, e.I)]), message: `Il y a deux vecteurs $${V(e.M, e.I)}$ dans la somme : n'oublie pas le facteur 2.` }],
            messageSiFaux: `Pars de la somme obtenue à l'écran précédent et remplace $${V(e.I, e.A)}+${V(e.I, e.B)}$.`,
          }),
        ],
        aides: [
          [l(e.I), t(` est le milieu de [${e.A}${e.B}] : les vecteurs `), l(V(e.I, e.A)), t(" et "), l(V(e.I, e.B)), t(" sont opposés, donc "), l(`${V(e.I, e.A)}+${V(e.I, e.B)}=\\vec{0}`), t(".")],
          [t("Ici, regroupe d'abord les deux vecteurs "), l(V(e.M, e.I)), t(" obtenus à l'écran précédent, puis utilise cette somme nulle.")],
        ],
        reponse: [l(TL(resultatInserer(e)))],
      },
    ];
  }
  const depart = [vec(e.a, e.I, e.A), vec(e.b, e.I, e.B)];
  const s = e.a + e.b;
  const echange = e.a !== e.b ? [{ coef: cp([vec(e.a / s, e.A, e.B)]), message: `Tu as échangé les coefficients : ${e.I} est plus près du point qui a le plus gros coefficient.` }] : [];
  return [
    {
      type: "champs",
      titre: TITRES.inserer[0],
      consigne: consignesEcrans(e)[0]!,
      champs: [
        champ("insertion", [l(`${sommePointL(e)}=`)], {
          points,
          cible: cp(depart),
          permis: (x) => (x.de === e.I && x.vers === e.A) || (x.de === e.A && x.vers === e.I) || (x.de === e.A && x.vers === e.B) || (x.de === e.B && x.vers === e.A),
          messagePermis: `C'est juste, mais n'utilise que $${V(e.I, e.A)}$ et $${V(e.A, e.B)}$ : insère ${e.A} dans $${V(e.I, e.B)}$.`,
          pieges: [],
          messageSiFaux: `Remplace $${V(e.I, e.B)}$ par $${V(e.I, e.A)}+${V(e.A, e.B)}$, distribue, puis regroupe.`,
        }),
      ],
      aides: [
        [t("La relation de Chasles permet d'insérer un point dans un vecteur : "), l("\\vec{XY}=\\vec{XZ}+\\vec{ZY}"), t(".")],
        [t("Ici, remplace "), l(V(e.I, e.B)), t(" par "), l(`${V(e.I, e.A)}+${V(e.A, e.B)}`), t(e.b === 1 ? ", puis regroupe les vecteurs " : `, distribue ${e.b}, puis regroupe les vecteurs `), l(V(e.I, e.A)), t(".")],
      ],
      reponse: [l(TL(insertionInserer(e)))],
    },
    {
      type: "champs",
      titre: TITRES.inserer[1],
      consigne: consignesEcrans(e)[1]!,
      champs: [
        champ("resultat", [l(`${V(e.A, e.I)}=`)], {
          points,
          cible: cp(resultatInserer(e)),
          hyp,
          unSeul: true,
          permis: (x) => x.de !== e.I && x.vers !== e.I,
          messagePermis: `Exprime $${V(e.A, e.I)}$ à l'aide de $${V(e.A, e.B)}$ seulement.`,
          pieges: echange,
          messageSiFaux: `Dans l'égalité obtenue, remplace $${V(e.I, e.A)}$ par $-${V(e.A, e.I)}$, puis isole $${V(e.A, e.I)}$.`,
        }),
      ],
      aides: [
        [t("D'après l'écran précédent et l'énoncé, "), l(`${TL(insertionInserer(e))}=\\vec{0}`), t(" ; et "), l(`${V(e.I, e.A)}=-${V(e.A, e.I)}`), t(".")],
        [t("Ici, cela donne "), l(`-${s}${V(e.A, e.I)}+${e.b === 1 ? "" : e.b}${V(e.A, e.B)}=\\vec{0}`), t(" : isole "), l(V(e.A, e.I)), t(".")],
      ],
      reponse: [l(TL(resultatInserer(e)))],
    },
  ];
}

export function ecrans(e: E): EcranTSD[] {
  if (e.variante === "reduire") return ecransReduire(e);
  if (e.variante === "coefficients") return ecransCoefficients(e);
  if (e.variante === "demontrer") return ecransDemontrer(e);
  return ecransInserer(e);
}

/** Réponse finale (papier, « Je vérifie »). */
export function reponseFinale(e: E): Fr {
  if (e.variante === "reduire") return [l(`${TL(e.termes)}=${TL(resultatReduire(e))}`)];
  if (e.variante === "coefficients") return [l(`${TL(e.termes)}=${TL(resultatCoefficients(e))}`)];
  if (e.variante === "demontrer") {
    if (e.sousForme === "difference") return [t("Les deux membres valent "), l(TL([vecteurDemontrer(e)])), t(" : l'égalité est vraie pour tous points.")];
    return [l(`${TL(e.gauche)}=${TL(premiereLigneJuste(e))}=${TL(e.droite)}`)];
  }
  if (e.sousForme === "milieu") return [l(`${V(e.M, e.A)}+${V(e.M, e.B)}=${TL(resultatInserer(e))}`)];
  return [l(`${V(e.A, e.I)}=${TL(resultatInserer(e))}`)];
}
