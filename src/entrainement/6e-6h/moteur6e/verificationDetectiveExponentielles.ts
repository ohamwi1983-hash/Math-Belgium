import type { ExerciceDetectiveExp } from "../core6e/detectiveExponentielles.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui6e/ecransExp.types";
import { decoderLigne, tx } from "../ui6e/ecransExp.types";
import { copie, DESCRIPTION_CORRECTE } from "./modeleDetectiveExponentielles";
import type { IntervalleAttendu, ValeurDetective } from "./modeleDetectiveExponentielles";
import type { PhaseDetectiveExp } from "../ui6e/formatDetectiveExponentielles";
import { numeroLigneFausse } from "../ui6e/formatDetectiveExponentielles";
import { egal, estApprochee, lireEnsemble, lireFonction, lireLimite, lireNombre, memesEnsembles, memesFonctions, MESSAGE_APPROCHEE, statutLimite, statutNombre } from "./lectureValeurExp";

/**
 * Vérification de 6gen144 : ligne et description comparées à leur identifiant ; écran 3 comparé
 * NUMÉRIQUEMENT (fonction en cinq points, ensemble sans ordre, intervalle borne à borne et crochet
 * par crochet, limite avec ±∞). Une saisie qui reprend la valeur fausse de la copie reçoit le
 * message ciblé du scénario (jamais la réponse).
 */

type E = ExerciceDetectiveExp;
const POINTS = [-1.3, -0.4, 0.3, 0.9, 1.7];

function statutIntervalle(valeurs: string[], iv: IntervalleAttendu): StatutVerification {
  if (valeurs.length !== 1) {
    for (const v of valeurs) {
      const l = decoderLigne(v);
      if (lireLimite(l.gauche) === null || lireLimite(l.droite) === null) return "parse_error";
    }
    return "not_equivalent";
  }
  const l = decoderLigne(valeurs[0]);
  const g = lireLimite(l.gauche);
  const d = lireLimite(l.droite);
  if (g === null || d === null) return "parse_error";
  const okBornes = egal(g, iv.gauche) && egal(d, iv.droite);
  const okCrochets = (l.ouvrant === "[") === iv.gaucheFermee && (l.fermant === "]") === iv.droiteFermee;
  return okBornes && okCrochets ? "correct" : "not_equivalent";
}

function statutValeur(v: ValeurDetective, saisie: string): StatutVerification {
  if (v.genre === "fonction") {
    const f = lireFonction(saisie, "x");
    if (!f) return "parse_error";
    return memesFonctions(f, v.fonction!, POINTS) ? "correct" : "not_equivalent";
  }
  if (v.genre === "ensemble") {
    const s = lireEnsemble(saisie);
    if (s === null) return "parse_error";
    return memesEnsembles(s, v.ensemble!) ? "correct" : "not_equivalent";
  }
  if (v.genre === "limite") return statutLimite(saisie, v.nombre!);
  return statutNombre(saisie, v.nombre!);
}

export function diagnostiquer(e: E, phase: PhaseDetectiveExp, valeurs: string[]): StatutVerification[] {
  if (phase === "ligne") return [valeurs[0] === `L${numeroLigneFausse(e)}` ? "correct" : "not_equivalent"];
  if (phase === "erreur") return [valeurs[0] === DESCRIPTION_CORRECTE[e.variante] ? "correct" : "not_equivalent"];
  const c = copie(e);
  if (c.valeurs[0].genre === "intervalle") return [statutIntervalle(valeurs, c.valeurs[0].intervalle!)];
  return c.valeurs.map((v, i) => statutValeur(v, valeurs[i] ?? ""));
}

export function approchee(e: E, phase: PhaseDetectiveExp, valeurs: string[]): string | null {
  if (phase !== "correction") return null;
  const c = copie(e);
  for (let i = 0; i < c.valeurs.length; i++) {
    const v = c.valeurs[i];
    if ((v.genre === "nombre" || v.genre === "limite") && v.exacte && Number.isFinite(v.nombre!) && estApprochee(valeurs[i] ?? "", v.nombre!)) return MESSAGE_APPROCHEE;
  }
  return null;
}

export function piege(e: E, phase: PhaseDetectiveExp, valeurs: string[]): Frag[] | null {
  const c = copie(e);
  if (phase === "ligne") {
    const k = Number((valeurs[0] ?? "").slice(1)) - 1;
    if (k > c.ligneFausse) return [tx(`La ligne ${k + 1} découle correctement d'une ligne précédente : l'erreur est plus haut.`)];
    if (k < c.ligneFausse) return [tx(`La ligne ${k + 1} est juste : relis la règle employée par les lignes suivantes.`)];
    return null;
  }
  if (phase === "erreur") return null;
  // Écran 3 : saisie qui reprend la copie
  if (c.valeurs[0].genre === "intervalle") {
    const l = decoderLigne(valeurs[0] ?? "");
    const g = lireLimite(l.gauche);
    const d = lireLimite(l.droite);
    const iv = c.valeurs[0].intervalle!;
    const memeCote = g !== null && d !== null && ((iv.gauche === -Infinity && g !== -Infinity) || (iv.droite === Infinity && d !== Infinity));
    return memeCote ? c.piege : null;
  }
  if (e.scenario === "R") {
    const s = lireEnsemble(valeurs[0] ?? "");
    if (s && s.some((x) => egal(x, -e.donnees.j))) return c.piege;
    return null;
  }
  if (e.scenario === "P1" || e.scenario === "P2") {
    const s = lireEnsemble(valeurs[0] ?? "");
    const copieS = e.scenario === "P1" ? c.valeursCopie : [e.donnees.r1, e.donnees.r2];
    if (s && s.length > 0 && s.every((x) => copieS.some((y) => egal(x, y)))) return c.piege;
    return null;
  }
  for (let i = 0; i < c.valeurs.length; i++) {
    const cv = c.valeursCopie[i];
    if (cv === undefined || Number.isNaN(cv)) continue;
    const x = c.valeurs[i].genre === "limite" ? lireLimite(valeurs[i] ?? "") : lireNombre(valeurs[i] ?? "");
    if (x !== null && egal(x, cv)) return c.piege;
  }
  // fonctions : dérivée de la copie (sans ln a, ou sans le signe)
  if (e.scenario === "L" || e.scenario === "S") {
    const f = lireFonction(valeurs[0] ?? "", "x");
    const d = e.donnees;
    const fc = e.scenario === "L" ? (x: number) => d.c * d.m * d.a ** (d.m * x - d.m * d.x0) : (x: number) => d.c * d.k * Math.exp(-d.k * x);
    if (f && memesFonctions(f, fc, POINTS)) return c.piege;
  }
  return null;
}
