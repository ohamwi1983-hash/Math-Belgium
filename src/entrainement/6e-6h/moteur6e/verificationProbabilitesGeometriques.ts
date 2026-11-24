import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceProbaGeo, PhaseProbaGeo } from "../core6e/probabilitesGeometriques";
import { aireForme, favorable, totale, valeurAttendue, valeurPi } from "../core6e/probabilitesGeometriques";
import { lireValeur } from "./lectureCycloLotG";
import { MESSAGE_APPROCHEE } from "../ui6e/formatProbabilitesGeometriques";

/**
 * Vérification de `6gen162`. La saisie est LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative) : évaluateur du 6e (fractions, π ou « pi », √, « − – — », virgule), unité finale
 * (« cm² », « cm2 », « min² », « cm »), préfixe « P = », « A = », « r = », pourcentage (« 43,75 % »).
 * Valeur exacte attendue (π et fractions) à 1e-9 près ; une écriture DÉCIMALE proche (à 1 %) mais
 * différente est une valeur approchée : message, AUCUNE tentative. Messages ciblés : π oublié,
 * périmètre au lieu d'aire, rayon non élevé au carré, rapport des rayons, différence des rayons au
 * carré, disque entier au lieu de la couronne / du quart, une seule extrémité du segment, un seul
 * triangle, événement contraire oublié, rayon = P × R.
 */

type E = ExerciceProbaGeo;
type P = PhaseProbaGeo;
const t = tx;
const l = lx;
const UNITE = /\s*(cm\s*(²|2|\^\s*2)?|m\s*(²|2)|min\s*(²|2|\^\s*2)?|minutes?\s*(carrées?)?|u\.?\s*a\.?|unités?\s*d'aire)\s*$/i;

function preparer(brut: string): { texte: string; pourcent: boolean } {
  let s = normaliserSigneMoins(brut).replace(/[’`]/g, "'").trim();
  s = s.replace(/^\s*(P\s*(\([^=]*\))?|A|𝒜|aire|ℓ|l|longueur|r|rayon)\s*=\s*/i, "");
  s = s.replace(UNITE, "").trim();
  const pourcent = /%\s*$/.test(s);
  if (pourcent) s = s.replace(/%\s*$/, "").trim();
  return { texte: s, pourcent };
}

/** Valeur numérique d'une saisie, `null` si illisible. */
export function lireProbaGeo(brut: string): number | null {
  const { texte, pourcent } = preparer(brut);
  if (texte === "") return null;
  const v = lireValeur(texte);
  if (v === null) return null;
  return pourcent ? v / 100 : v;
}

const egal = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));

function estDecimalEcrit(brut: string): boolean {
  return /^-?\d+[.,]\d+$/.test(preparer(brut).texte.replace(/\s/g, ""));
}

export function diagnostiquer(e: E, p: P, valeurs: string[]): StatutVerification[] {
  const v = lireProbaGeo(valeurs[0] ?? "");
  if (v === null) return ["parse_error"];
  return [egal(v, valeurPi(valeurAttendue(e, p))) ? "correct" : "not_equivalent"];
}

/** Écriture décimale proche (à 1 %) d'une valeur exacte qu'elle n'égale pas : message sans tentative. */
export function approchee(e: E, p: P, valeurs: string[]): string | null {
  const brut = valeurs[0] ?? "";
  if (!estDecimalEcrit(brut) && !/%\s*$/.test(brut)) return null;
  const v = lireProbaGeo(brut);
  if (v === null) return null;
  const exact = valeurPi(valeurAttendue(e, p));
  const ecart = Math.abs(v - exact);
  return ecart > 1e-9 * Math.max(1, Math.abs(exact)) && ecart <= 0.01 * Math.max(1, Math.abs(exact)) ? MESSAGE_APPROCHEE : null;
}

/** Valeurs fausses typiques de l'écran et leur message (jamais la réponse). */
function erreursTypiques(e: E, p: P): { valeur: number; message: Frag[] }[] {
  const r: { valeur: number; message: Frag[] }[] = [];
  const disque = e.variante === "cible" || e.variante === "cibleInverse";
  if (p === "totale" && disque) {
    const R = e.R;
    r.push({ valeur: R * R, message: [t("Il manque "), l("\\pi"), t(" : l'aire d'un disque est "), l("\\pi r^2"), t(".")] });
    r.push({ valeur: 2 * Math.PI * R, message: [t("C'est le périmètre du cercle ("), l("2\\pi r"), t("), pas l'aire du disque.")] });
    r.push({ valeur: Math.PI * R, message: [t("Le rayon doit être élevé au carré : "), l("\\pi r^2"), t(".")] });
  }
  if (p === "totale" && e.variante === "rendezVous") r.push({ valeur: e.T, message: [t("C'est le côté du carré ; on demande son aire.")] });
  if (p === "favorable") {
    switch (e.variante) {
      case "cible":
        if (e.r1 > 0) {
          r.push({ valeur: Math.PI * (e.r2 - e.r1) ** 2, message: [t("On ne met pas la différence des rayons au carré : on soustrait les deux aires, "), l("\\pi r_2^2-\\pi r_1^2"), t(".")] });
          r.push({ valeur: Math.PI * e.r2 * e.r2, message: [t("C'est l'aire du grand disque entier : retire le disque intérieur.")] });
        }
        r.push({ valeur: e.r2 * e.r2 - e.r1 * e.r1, message: [t("Il manque "), l("\\pi"), t(" : l'aire d'un disque est "), l("\\pi r^2"), t(".")] });
        break;
      case "carreDisque":
        r.push({ valeur: Math.PI * e.c * e.c, message: [t("Le rayon du disque inscrit est la moitié du côté, pas le côté.")] });
        if (e.hors) r.push({ valeur: valeurPi(aireForme(e)), message: [t("C'est l'aire du disque ; la zone grisée est ce qui reste du carreau autour du disque.")] });
        break;
      case "rectangleQuart":
        r.push({ valeur: Math.PI * e.r * e.r, message: [t("C'est l'aire d'un disque entier : ici, il n'y en a qu'un quart.")] });
        if (e.hors) r.push({ valeur: valeurPi(aireForme(e)), message: [t("C'est l'aire du quart de disque ; la zone grisée est ce qui reste du rectangle.")] });
        break;
      case "segment":
        if (e.type === "loin") r.push({ valeur: e.L - e.a, message: [t("Il faut aussi rester loin de "), l("B"), t(" : retire "), l(`${e.a}`), t(" cm à chaque extrémité.")] });
        if (e.type === "grandMorceau") r.push({ valeur: e.L - e.a, message: [t("Le plus long morceau peut être "), l("[AM]"), t(" ou "), l("[MB]"), t(" : deux parties du segment conviennent.")] });
        break;
      case "rendezVous":
        r.push({ valeur: (e.T - e.t) ** 2 / 2, message: [t("C'est l'aire d'un seul triangle : il y en a deux.")] });
        r.push({ valeur: e.T * e.T - (e.T - e.t) ** 2, message: [t("C'est l'aire de la bande (ils se rencontrent) ; on demande la zone où ils ne se rencontrent pas.")] });
        break;
      case "cibleInverse":
        break;
    }
  }
  if (p === "rayon" && e.variante === "cibleInverse") {
    r.push({ valeur: (e.r * e.r * e.R) / (e.R * e.R), message: [t("Ce sont les aires qui sont proportionnelles, pas les rayons : "), l("\\pi r^2=P\\times\\pi R^2"), t(".")] });
    r.push({ valeur: e.r * e.r, message: [t("C'est "), l("r^2"), t(" : prends encore la racine carrée.")] });
  }
  if (p === "proba") {
    if (e.variante === "cible") r.push({ valeur: (e.r2 - e.r1) / e.R, message: [t("Tu as comparé des rayons : une probabilité géométrique compare des aires (les rayons sont élevés au carré).")] });
    if (e.variante === "rendezVous") {
      const pas = valeurPi(favorable(e)) / valeurPi(totale(e));
      r.push(e.rencontre ? { valeur: pas, message: [t("C'est la probabilité qu'ils ne se rencontrent pas : passe à l'événement contraire.")] } : { valeur: 1 - pas, message: [t("C'est la probabilité qu'ils se rencontrent : les triangles blancs sont les cas où ils ne se rencontrent pas.")] });
    }
    if ((e.variante === "carreDisque" || e.variante === "rectangleQuart") && e.hors) {
      r.push({ valeur: valeurPi(aireForme(e)) / valeurPi(totale(e)), message: [t("C'est la probabilité de tomber dans la forme dessinée ; la zone grisée est ce qui reste autour.")] });
    }
    r.push({ valeur: valeurPi(totale(e)) / Math.max(1e-12, valeurPi(favorable(e))), message: [t("Le quotient est renversé : l'aire favorable va au numérateur (une probabilité est toujours entre 0 et 1).")] });
  }
  return r;
}

export function piege(e: E, p: P, valeurs: string[]): Frag[] | null {
  const v = lireProbaGeo(valeurs[0] ?? "");
  if (v === null) return null;
  const attendu = valeurPi(valeurAttendue(e, p));
  if (egal(v, attendu)) return null;
  for (const x of erreursTypiques(e, p)) if (!egal(x.valeur, attendu) && egal(v, x.valeur)) return x.message;
  if (p === "proba" && (v < 0 || v > 1)) return [t("Une probabilité est toujours comprise entre 0 et 1.")];
  return null;
}
