/**
 * 5gen31 (étudier une fonction) — lot B, règles communes : aides à deux niveaux (niveau 1 = méthode du
 * cours, niveau 2 posé pour CETTE fonction, jamais la réponse), messages ciblés par écran (dérivée du
 * terme constant gardée, signe de (1/v)′, f′ au lieu de f pour une ordonnée, côtés d'une asymptote
 * verticale échangés, fraction gardée dans l'asymptote oblique, décalage vertical oublié, racine double
 * comptée comme extremum, flèches ou concavité qui ne suivent pas le signe). Refus sans tentative :
 * moteur (`refusSaisieEtudierFonction`).
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceEtudierFonction } from "../core5e/etudierFonction.types";
import type { EcranEtudierFonction } from "../moteur5e/typesEtudierFonction";
import type { ReponseTableauEtudierFonction, ValeurReponseSlotLimite } from "../moteur5e/verificationEtudierFonction";
import {
  decalageVertical,
  deriveeF,
  deriveeSecondeF,
  exclusionsCE,
  listeSlotsLimites,
  pointsClesEtudierFonction,
  racinesFPrime,
  racinesFSeconde,
  tableauFPrimeAttendu,
  tableauFSecondeAttendu,
  valeurF,
} from "../moteur5e/verificationEtudierFonction";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { AideTrig } from "./aidesTrigonometrie";
import { formatFDeXLatex, formatFPrimeDeXLatex, formatRacineLatex } from "./formatEtudierFonction";
import { l, t } from "./retoursDerivees";

const aide = (texte: FragmentConsigne[], formules: string[] = []): AideTrig => ({ texte, formules });

function denominateur(e: number): string {
  return e === 0 ? "x" : e > 0 ? `x-${e}` : `x+${-e}`;
}

/** Valeur test « au milieu » de chaque intervalle délimité par les zéros et les valeurs exclues. */
function valeursTest(marqueurs: number[]): number[] {
  const m = [...new Set(marqueurs.map((x) => Math.round(x * 1e9) / 1e9))].sort((a, b) => a - b);
  if (m.length === 0) return [0];
  const out = [Math.floor(m[0]) - 1];
  for (let i = 0; i + 1 < m.length; i++) {
    const milieu = (m[i] + m[i + 1]) / 2;
    const entier = Math.round(milieu);
    out.push(entier > m[i] && entier < m[i + 1] ? entier : Math.round(milieu * 2) / 2);
  }
  out.push(Math.ceil(m[m.length - 1]) + 1);
  return out;
}

function nombreL(x: number): string {
  return `${x}`.replace(".", "{,}");
}

export function aidesEtudierFonction(e: ExerciceEtudierFonction, ecran: EcranEtudierFonction): AideTrig[] {
  switch (ecran) {
    case "domaine": {
      const n1 = aide([t("Une fraction n'existe que si son dénominateur est non nul : cherche les valeurs de x qui annulent un dénominateur.")]);
      if (e.famille === "rationnelleAO") return [n1, aide([t("Ici, le seul dénominateur est "), l(denominateur(e.e)), t(" : résous l'équation ci-dessous.")], [`${denominateur(e.e)}=0`])];
      const nyau = e.noyau;
      const k = nyau.type === "polynomiale" ? 0 : nyau.k;
      const ee = nyau.type === "polynomiale" ? 0 : nyau.e;
      return [n1, aide([t("Ici, le dénominateur s'annule quand le carré vaut l'opposé de la constante :")], [`(${denominateur(ee)})^2${k < 0 ? `-${-k}` : `+${k}`}=0\\iff(${denominateur(ee)})^2=${-k}`])];
    }
    case "limites": {
      const n1 = aide([t("Près d'une valeur exclue, le numérateur garde un signe fixe : le signe du dénominateur juste avant et juste après décide de +∞ ou −∞. En −∞ et +∞, garde le terme qui domine.")]);
      const slots = listeSlotsLimites(e);
      const va = slots.find((s) => s.kind === "va");
      const formules: string[] = [];
      if (va && va.kind === "va") formules.push(`x\\to ${va.position}^-\\ :\\ ${denominateur(va.position)}\\to 0^-`);
      if (e.famille === "rationnelleAO") {
        formules.push(`\\lim_{x\\to\\pm\\infty}\\dfrac{${e.c}}{${denominateur(e.e)}}=0`);
        return [n1, aide([t("Écris f(x) comme une partie affine plus une fraction : la fraction tend vers 0 en ±∞, la courbe se rapproche de la droite de la partie affine. Près de la valeur exclue :")], formules)];
      }
      if (e.noyau.type === "polynomiale") {
        formules.push(`f(x)\\ \\text{se comporte comme}\\ ${e.noyau.a === 1 ? "" : e.noyau.a === -1 ? "-" : e.noyau.a}x^3\\ \\text{en}\\ \\pm\\infty`);
        return [n1, aide([t("Un polynôme se comporte en ±∞ comme son terme de plus haut degré : regarde le signe de "), l("x^3"), t(" et du coefficient.")], formules)];
      }
      formules.push(`\\lim_{x\\to\\pm\\infty}\\left[(${denominateur(e.noyau.e)})^2${e.noyau.k < 0 ? `-${-e.noyau.k}` : `+${e.noyau.k}`}\\right]=+\\infty`);
      return [n1, aide([t("Le dénominateur tend vers +∞ en ±∞, donc la fraction tend vers 0 ; n'oublie pas la constante ajoutée à la fraction."), ...(va ? [t(" Près de chaque valeur exclue, étudie le signe du dénominateur :")] : [])], formules)];
    }
    case "calculerFPrime":
    case "calculerFSeconde": {
      const seconde = ecran === "calculerFSeconde";
      const n1 = aide([t(seconde ? "Dérive f′(x) avec les mêmes règles qu'à l'écran précédent (terme à terme, quotient, " : "Repère la forme de f (somme de termes, quotient c/v, partie affine plus fraction), puis applique les règles ("), l("(x^n)'=nx^{n-1}"), t(", "), l("\\left(\\frac{c}{v}\\right)'=-\\frac{c\\,v'}{v^2}"), t(").")]);
      if (e.famille === "rationnelleAO") {
        return [n1, aide([t(seconde ? "Ici f′(x) est une constante plus une fraction en " : "Ici f(x) est une partie affine plus une fraction en "), l(denominateur(e.e)), t(" : la constante disparaît, et pour la fraction :")], [seconde ? `\\left(\\dfrac{1}{(${denominateur(e.e)})^2}\\right)'=-\\dfrac{2}{(${denominateur(e.e)})^3}` : `\\left(\\dfrac{1}{${denominateur(e.e)}}\\right)'=-\\dfrac{1}{(${denominateur(e.e)})^2}`])];
      }
      const nyau = e.noyau;
      if (nyau.type === "polynomiale") {
        return [n1, aide([t(seconde ? "Ici f′(x) est un trinôme : dérive chaque terme, la constante disparaît. Point de départ :" : "Ici f(x) est un polynôme du 3e degré : dérive chaque terme, le terme constant disparaît. Point de départ :")], [seconde ? formatFPrimeDeXLatex(e) : formatFDeXLatex(e)])];
      }
      return [n1, aide([t(seconde ? "Ici f′(x) est un quotient u/v : u′v − uv′ sur v², avec v = D(x)², et simplifie par D(x). Dénominateur de f :" : "Ici f(x) est (à une constante près) de la forme c/v, avec :")], [`v(x)=(${denominateur(nyau.e)})^2${nyau.k < 0 ? `-${-nyau.k}` : `+${nyau.k}`},\\quad v'(x)=2(${denominateur(nyau.e)})`])];
    }
    case "tableauFPrime":
    case "tableauFSeconde": {
      const prime = ecran === "tableauFPrime";
      const n1 = aide([
        t(prime ? "Un zéro de f′ n'est un extremum que si f′ change de signe autour de lui : f′ > 0 ⇒ f croissante (↗), f′ < 0 ⇒ f décroissante (↘)." : "Ne confonds pas variations (f′) et concavité (f″) : f″ > 0 ⇒ convexe (∪), f″ < 0 ⇒ concave (∩). Un zéro de f″ n'est un point d'inflexion que si f″ change de signe."),
      ]);
      const racines = prime ? racinesFPrime(e) : racinesFSeconde(e);
      const exclues = exclusionsCE(e);
      const tests = valeursTest([...racines.map((r) => (r.exact ? r.valeur.num / r.valeur.den : r.centre + r.signe * Math.sqrt(r.radicande))), ...exclues]);
      const nom = prime ? "f'" : "f''";
      return [
        n1,
        aide(
          [
            t(racines.length === 0 ? `Ici ${prime ? "f′" : "f″"} ne s'annule pas` : `Ici ${prime ? "f′" : "f″"} s'annule en `),
            ...(racines.length === 0 ? [] : [l(racines.map((r) => formatRacineLatex(r)).join("\\,;\\,"))]),
            ...(exclues.length ? [t(" et n'existe pas en "), l(exclues.join("\\,;\\,"))] : []),
            t(" : calcule son signe en une valeur de chaque intervalle, par exemple :"),
          ],
          [tests.map((x) => `${nom}(${nombreL(x)})`).join(",\\ ")],
        ),
      ];
    }
    case "coordonnees": {
      const n1 = aide([t("L'ordonnée d'un point de la courbe s'obtient en remplaçant x par son abscisse dans f(x) — pas dans f′(x) ni f″(x). Donne la valeur exacte.")]);
      const irr = pointsClesEtudierFonction(e).find((p) => p.racine && !p.racine.exact);
      if (irr && irr.racine && !irr.racine.exact) {
        const { centre, radicande } = irr.racine;
        return [n1, aide([t("Avec une abscisse de la forme "), l(`${centre === 0 ? "" : centre}\\pm\\sqrt{${radicande}}`), t(", utilise les égalités ci-dessous, puis regroupe les termes sans racine et les termes en racine :")], [`(x${centre === 0 ? "" : centre > 0 ? `-${centre}` : `+${-centre}`})^2=${radicande},\\quad \\dfrac{1}{\\sqrt{${radicande}}}=\\dfrac{\\sqrt{${radicande}}}{${radicande}}`])];
      }
      const p0 = pointsClesEtudierFonction(e)[0];
      return [n1, aide([t("Par exemple, pour le premier point, remplace x par son abscisse dans :")], [formatFDeXLatex(e).replace(/^f\(x\)=/, `f\\left(${p0 && p0.racine ? formatRacineLatex(p0.racine) : "0"}\\right)\\ \\text{avec}\\ f(x)=`)])];
    }
    default:
      return [];
  }
}

function lire(s: string, x = 0): number | null {
  try {
    const v = evaluerExpressionGenerale(s.replace(/[−–—]/g, "-").replace(/^[^=]*=/, ""), x);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

const proche = (v: number | null, c: number) => v !== null && Math.abs(v - c) < 1e-6 * Math.max(1, Math.abs(c));
const POINTS_TEST = [0.37, 1.61, -2.23, 3.7];

function egaleFonction(s: string, g: (x: number) => number, exclues: number[]): boolean {
  const xs = POINTS_TEST.filter((x) => exclues.every((v) => Math.abs(x - v) > 0.2));
  return xs.length >= 2 && xs.every((x) => proche(lire(s, x), g(x)));
}

/** Message ciblé (champs à 3 tentatives) — null : message générique. */
export function cibleEtudierFonction(e: ExerciceEtudierFonction, ecran: EcranEtudierFonction, valeurs: string[]): FragmentConsigne[] | null {
  const exclues = exclusionsCE(e);
  const v0 = valeurs[0] ?? "";
  switch (ecran) {
    case "calculerFPrime": {
      if (egaleFonction(v0, (x) => valeurF(e, x), exclues)) return [t("Tu as recopié f(x) : il faut la dériver.")];
      if (e.famille === "etudeLocale" && e.noyau.type === "polynomiale" && e.noyau.d !== 0 && egaleFonction(v0, (x) => deriveeF(e, x) + (e.famille === "etudeLocale" && e.noyau.type === "polynomiale" ? e.noyau.d : 0), exclues))
        return [t("Le terme constant a pour dérivée 0 : il disparaît.")];
      if (e.famille !== "etudeLocale" || e.noyau.type !== "polynomiale") {
        const a = e.famille === "rationnelleAO" ? e.a : 0;
        if (egaleFonction(v0, (x) => 2 * a - deriveeF(e, x), exclues)) return [t("Attention au signe : "), l("\\left(\\frac{1}{v}\\right)'=-\\frac{v'}{v^2}"), t(", avec un signe moins.")];
      }
      return null;
    }
    case "calculerFSeconde": {
      if (egaleFonction(v0, (x) => deriveeF(e, x), exclues)) return [t("C'est f′(x) : on demande sa dérivée, f″(x).")];
      if (egaleFonction(v0, (x) => -deriveeSecondeF(e, x), exclues)) return [t("Le signe est inversé : reprends le signe de la dérivée du dénominateur (règle du quotient, ou "), l("\\left(\\frac{1}{v}\\right)'=-\\frac{v'}{v^2}"), t(").")];
      return null;
    }
    case "coordonnees": {
      const points = pointsClesEtudierFonction(e);
      const vs = valeurs.map((v) => lire(v));
      if (points.length && points.every((p, i) => proche(vs[i], deriveeF(e, p.x))) && points.some((p) => !proche(vs[0], p.y))) return [t("Tu as remplacé x dans f′(x) (qui vaut 0 en un extremum) : l'ordonnée se calcule avec f(x).")];
      if (points.length && points.every((p, i) => proche(vs[i], p.x)) && points.some((p) => !proche(p.x, p.y))) return [t("Ce sont les abscisses : on demande les ordonnées "), l("f(x_0)"), t(".")];
      const faux = points.findIndex((p, i) => !proche(vs[i], p.y));
      if (faux >= 0 && proche(vs[faux], -points[faux].y)) return [t(`Le signe de l'ordonnée n° ${faux + 1} est changé : reprends le calcul de f(x₀), puissances et signes compris.`)];
      return null;
    }
    case "limites": {
      const slots = listeSlotsLimites(e);
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const v = valeurs[i];
        if (slot.kind === "infiniOblique" && typeof v === "string" && egaleFonction(v, (x) => valeurF(e, x), exclues)) return [t("L'asymptote oblique est la partie affine seule : la fraction tend vers 0 en ±∞.")];
        if (slot.kind === "infiniHorizontale" && typeof v === "string" && decalageVertical(e) !== 0 && proche(lire(v), 0)) return [t("La fraction tend vers 0, mais la constante ajoutée reste : "), l(`y=${decalageVertical(e)}`), t(" n'est pas y = 0.")];
      }
      return null;
    }
    default:
      return null;
  }
}

/** Message sous la réponse révélée de l'écran « limites » (choix ±∞ : une seule tentative). */
export function cibleLimitesEtudierFonction(e: ExerciceEtudierFonction, reponses: ValeurReponseSlotLimite[]): FragmentConsigne[] {
  const slots = listeSlotsLimites(e);
  const vaFaux = slots.map((s, i) => (s.kind === "va" && reponses[i] !== s.cible ? s : null)).filter((s) => s !== null);
  if (vaFaux.length > 0) {
    const s = vaFaux[0];
    if (s && s.kind === "va") {
      const paire = slots.findIndex((o) => o.kind === "va" && o.position === s.position && o.cote !== s.cote);
      const iS = slots.indexOf(s);
      if (paire >= 0 && reponses[iS] === (slots[paire] as { cible: 1 | -1 }).cible && reponses[paire] === s.cible && s.cible !== (slots[paire] as { cible: 1 | -1 }).cible)
        return [t("Les côtés gauche et droit sont échangés : à gauche de "), l(`${s.position}`), t(", "), l(`${denominateur(s.position)}<0`), t(" ; à droite, "), l(`${denominateur(s.position)}>0`), t(".")];
      return [t("Près de "), l(`x=${s.position}`), t(" : le numérateur garde son signe, c'est le signe du dénominateur (juste avant, juste après) qui décide de +∞ ou −∞.")];
    }
  }
  const infFaux = slots.find((s, i) => s.kind === "infiniSigne" && reponses[i] !== s.cible);
  if (infFaux) return [t("En ±∞, un polynôme a le signe de son terme de plus haut degré : "), l("x^3"), t(" est négatif en −∞ et positif en +∞, multiplié par le coefficient.")];
  return cibleEtudierFonction(e, "limites", reponses.map((r) => (typeof r === "string" ? r : ""))) ?? [t("Reprends chaque limite : signe du dénominateur près des valeurs exclues, terme dominant en ±∞.")];
}

/** Message sous la réponse révélée d'un tableau (choix fermés : une seule tentative). */
export function cibleTableauEtudierFonction(e: ExerciceEtudierFonction, mode: "fprime" | "fseconde", reponse: ReponseTableauEtudierFonction): FragmentConsigne[] {
  const attendu = mode === "fprime" ? tableauFPrimeAttendu(e) : tableauFSecondeAttendu(e);
  const signesJustes = attendu.signes.every((s, i) => reponse.signes[i] === s);
  const zones = attendu.colonnes.map((c, i) => (c.type === "zone" ? i : -1)).filter((i) => i >= 0);
  const inverse = (s: string | null) => (s === "+" ? "-" : s === "-" ? "+" : s);
  if (!signesJustes && zones.every((i) => reponse.signes[i] === inverse(attendu.signes[i]))) return [t(`Tous les signes sont inversés : reprends le signe de ${mode === "fprime" ? "f′" : "f″"} en une valeur test de chaque intervalle.`)];
  if (!signesJustes) {
    const point = attendu.colonnes.findIndex((c, i) => c.type !== "zone" && reponse.signes[i] !== attendu.signes[i]);
    if (point >= 0) return [t(attendu.colonnes[point].type === "exclusion" ? "En une valeur exclue, la dérivée n'existe pas : on écrit ∄ (une double barre), pas 0." : "En un zéro de la dérivée, on écrit 0 dans la ligne des signes.")];
    return [t(`Un des signes de ${mode === "fprime" ? "f′" : "f″"} est faux : calcule-le en une valeur test de chaque intervalle.`)];
  }
  if (mode === "fprime") {
    const ni = attendu.colonnes.findIndex((c, i) => c.type === "racine" && attendu.ligne2[i] === "ni_lun_ni_lautre" && reponse.ligne2[i] !== "ni_lun_ni_lautre");
    if (ni >= 0) return [t("f′ s'annule sans changer de signe (racine double) : ce n'est ni un maximum ni un minimum.")];
    return [t("Les signes sont justes : les flèches suivent le signe (+ ↗, − ↘), et un extremum se lit là où le signe change (+ puis − : maximum ; − puis + : minimum).")];
  }
  return [t("Les signes sont justes : la concavité suit le signe de f″ (+ ∪, − ∩) ; un point d'inflexion est un zéro où f″ change de signe.")];
}
