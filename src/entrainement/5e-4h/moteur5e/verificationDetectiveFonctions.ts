import type { ExerciceDetectiveFonctions } from "../core5e/detectiveFonctions.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseDetectiveFonctions } from "../ui5e/formatDetectiveFonctions";
import { numeroLigneFausse } from "../ui5e/formatDetectiveFonctions";
import { copie, DESCRIPTION_CORRECTE } from "./modeleDetectiveFonctions";
import { egaux, lireEnsemble } from "./ensemblesReels";
import { lireValeur } from "./lectureValeurTrigo";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Vérification de `5gen58`. Ligne et description comparées à leur identifiant ; écran 3 LU avant
 * tout verdict puis comparé : ensemble borne à borne et crochet par crochet (`lireEnsemble`),
 * expression en cinq points (`evaluerExpressionGenerale`, préfixe « (f∘g)(x) = » recopié ignoré),
 * nombre (`lireValeur`). Une saisie qui reprend le résultat de la copie reçoit le message ciblé.
 */

type E = ExerciceDetectiveFonctions;
const POINTS = [-1.3, -0.4, 0.3, 0.9, 1.7];

/** Expression saisie → fonction ; `null` si illisible. */
export function lireExpression(texte: string): ((x: number) => number) | null {
  let s = normaliserSigneMoins(texte).trim();
  s = s.replace(/^.*=/, "").trim().replace(/,/g, ".");
  if (s === "" || /[a-wyzA-WYZ]/.test(s.replace(/sqrt|abs|racine/g, ""))) return null;
  try {
    const v = evaluerExpressionGenerale(s, 0.37);
    if (!Number.isFinite(v)) return null;
    return (x: number) => evaluerExpressionGenerale(s, x);
  } catch {
    return null;
  }
}

const memes = (f: (x: number) => number, g: (x: number) => number) => POINTS.every((x) => Math.abs(f(x) - g(x)) < 1e-7 * Math.max(1, Math.abs(g(x))));

export function diagnostiquer(e: E, p: PhaseDetectiveFonctions, valeurs: string[]): StatutVerification[] {
  if (p === "ligne") return [valeurs[0] === `L${numeroLigneFausse(e)}` ? "correct" : "not_equivalent"];
  if (p === "erreur") return [valeurs[0] === DESCRIPTION_CORRECTE[e.variante] ? "correct" : "not_equivalent"];
  const v = copie(e).valeur;
  const saisie = valeurs[0] ?? "";
  if (v.genre === "ensemble") {
    const l = lireEnsemble(saisie);
    if (!l) return ["parse_error"];
    return [l.defauts.length === 0 && egaux(l.ensemble, v.ensemble!) ? "correct" : "not_equivalent"];
  }
  if (v.genre === "expression") {
    const f = lireExpression(saisie);
    if (!f) return ["parse_error"];
    return [memes(f, v.fonction!) ? "correct" : "not_equivalent"];
  }
  if (nExistePas(saisie)) return ["not_equivalent"];
  const x = lireValeur(saisie);
  if (x === null) return ["parse_error"];
  return [Math.abs(x - v.nombre!) < 1e-9 ? "correct" : "not_equivalent"];
}

export function piege(e: E, p: PhaseDetectiveFonctions, valeurs: string[]): Frag[] | null {
  const c = copie(e);
  if (p === "ligne") {
    const k = Number((valeurs[0] ?? "").slice(1)) - 1;
    if (k > c.ligneFausse) return [tx(`La ligne ${k + 1} découle correctement d'une ligne précédente : l'erreur est plus haut.`)];
    if (k < c.ligneFausse) return [tx(`La ligne ${k + 1} est juste : relis la règle employée par les lignes suivantes.`)];
    return null;
  }
  if (p === "erreur") return null;
  const saisie = valeurs[0] ?? "";
  const v = c.valeur;
  if (v.genre === "ensemble") {
    const l = lireEnsemble(saisie);
    if (!l) return null;
    if (l.defauts.includes("infiniFerme")) return [tx("Du côté de "), lx("\\infty"), tx(", le crochet est toujours ouvert.")];
    if (c.copieEnsemble && egaux(l.ensemble, c.copieEnsemble)) return c.piege;
    return null;
  }
  if (v.genre === "expression") {
    const f = lireExpression(saisie);
    return f && c.copieFonction && memes(f, c.copieFonction) ? c.piege : null;
  }
  return nExistePas(saisie) ? c.piege : null;
}

/** « n'existe pas » saisi dans le champ numérique (portion, la conclusion de la copie) : réponse
 * LISIBLE et fausse, avec le message ciblé. */
export function nExistePas(texte: string): boolean {
  return /n'?\s*existe\s+pas|impossible|∄/i.test(normaliserSigneMoins(texte).replace(/[’`]/g, "'"));
}
