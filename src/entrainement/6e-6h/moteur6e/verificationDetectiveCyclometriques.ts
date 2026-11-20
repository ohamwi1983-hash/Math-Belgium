import type { ExerciceDetectiveCyclo } from "../core6e/detectiveCyclometriques.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui6e/ecransExp.types";
import { decoderLigne, tx } from "../ui6e/ecransExp.types";
import { copie } from "./modeleDetectiveCyclometriques";
import type { IntervalleCyclo, ValeurDetectiveCyclo } from "./modeleDetectiveCyclometriques";
import type { PhaseDetectiveCyclo } from "../ui6e/formatDetectiveCyclometriques";
import { numeroLigneFausse } from "../ui6e/formatDetectiveCyclometriques";
import { egal, estApprochee, lireEnsemble, lireFonction, lireLimite, lireNombre, memesEnsembles, memesFonctions } from "./lectureValeurExp";

/**
 * Vérification de `6gen152` : ligne et description comparées à leur identifiant ; écran 3 comparé
 * NUMÉRIQUEMENT (fonction en cinq points de son domaine, ensemble sans ordre, intervalle borne à borne
 * et crochet par crochet — bornes avec π, fractions). Une saisie qui reprend la valeur fausse de la
 * copie reçoit le message ciblé du scénario (jamais la réponse) ; une valeur décimale approchée
 * d'une valeur exacte est arrêtée sans tentative.
 */

type E = ExerciceDetectiveCyclo;

function lireIntervalleSaisi(valeurs: string[]): { g: number; d: number; gf: boolean; df: boolean } | null | "plusieurs" {
  if (valeurs.length !== 1) {
    for (const v of valeurs) {
      const l = decoderLigne(v);
      if (lireLimite(l.gauche) === null || lireLimite(l.droite) === null) return null;
    }
    return "plusieurs";
  }
  const l = decoderLigne(valeurs[0]);
  const g = lireLimite(l.gauche);
  const d = lireLimite(l.droite);
  if (g === null || d === null) return null;
  return { g, d, gf: l.ouvrant === "[", df: l.fermant === "]" };
}

function statutIntervalle(valeurs: string[], iv: IntervalleCyclo): StatutVerification {
  const x = lireIntervalleSaisi(valeurs);
  if (x === null) return "parse_error";
  if (x === "plusieurs") return "not_equivalent";
  const ok = egal(x.g, iv.gauche) && egal(x.d, iv.droite) && x.gf === iv.gaucheFermee && x.df === iv.droiteFermee;
  return ok ? "correct" : "not_equivalent";
}

function statutValeur(v: ValeurDetectiveCyclo, saisie: string): StatutVerification {
  if (v.genre === "fonction") {
    const f = lireFonction(saisie, "x");
    if (!f) return "parse_error";
    return memesFonctions(f, v.fonction!, v.points!) ? "correct" : "not_equivalent";
  }
  if (v.genre === "ensemble") {
    const s = lireEnsemble(saisie);
    if (s === null) return "parse_error";
    return memesEnsembles(s, v.ensemble!) ? "correct" : "not_equivalent";
  }
  const x = lireNombre(saisie);
  if (x === null) return "parse_error";
  return egal(x, v.nombre!) ? "correct" : "not_equivalent";
}

export function diagnostiquer(e: E, phase: PhaseDetectiveCyclo, valeurs: string[]): StatutVerification[] {
  if (phase === "ligne") return [valeurs[0] === `L${numeroLigneFausse(e)}` ? "correct" : "not_equivalent"];
  if (phase === "erreur") return [valeurs[0] === e.variante ? "correct" : "not_equivalent"];
  const c = copie(e);
  if (c.valeurs[0].genre === "intervalle") return [statutIntervalle(valeurs, c.valeurs[0].intervalle!)];
  return c.valeurs.map((v, i) => statutValeur(v, valeurs[i] ?? ""));
}

export function approchee(e: E, phase: PhaseDetectiveCyclo, valeurs: string[]): string | null {
  if (phase !== "correction") return null;
  const c = copie(e);
  for (let i = 0; i < c.valeurs.length; i++) {
    const v = c.valeurs[i];
    if (v.genre === "nombre" && estApprochee(valeurs[i] ?? "", v.nombre!)) return "Ta valeur est une valeur approchée : on demande la valeur exacte (fraction, racine, π). Cela ne compte pas comme une tentative.";
  }
  return null;
}

export function piege(e: E, phase: PhaseDetectiveCyclo, valeurs: string[]): Frag[] | null {
  const c = copie(e);
  if (phase === "ligne") {
    const k = Number((valeurs[0] ?? "").slice(1)) - 1;
    if (k > c.ligneFausse) return [tx(`La ligne ${k + 1} découle correctement d'une ligne précédente : l'erreur est plus haut.`)];
    if (k < c.ligneFausse) return [tx(`La ligne ${k + 1} est juste : relis la règle employée par les lignes suivantes.`)];
    return null;
  }
  if (phase === "erreur") return null;
  const v0 = c.valeurs[0];
  if (v0.genre === "intervalle") {
    const x = lireIntervalleSaisi(valeurs);
    if (x === null || x === "plusieurs") return null;
    const iv = v0.intervalle!;
    if (e.variante === "arctan" && egal(x.g, iv.gauche) && egal(x.d, iv.droite) && (x.gf || x.df)) return c.piege;
    if (e.variante === "sens" && egal(x.g, iv.droite) && egal(x.d, iv.gauche)) return c.piege;
    return null;
  }
  if (v0.genre === "ensemble") {
    const s = lireEnsemble(valeurs[0] ?? "");
    if (s && c.ensembleCopie && memesEnsembles(s, c.ensembleCopie)) return c.piege;
    return null;
  }
  for (let i = 0; i < c.valeurs.length; i++) {
    const v = c.valeurs[i];
    if (v.genre === "fonction" && c.fonctionCopie) {
      const f = lireFonction(valeurs[i] ?? "", "x");
      if (f && memesFonctions(f, c.fonctionCopie, v.points!)) return c.piege;
    }
    if (v.genre === "nombre") {
      const cv = c.valeursCopie[i];
      const x = lireNombre(valeurs[i] ?? "");
      if (cv !== undefined && !Number.isNaN(cv) && x !== null && egal(x, cv)) return c.piege;
    }
  }
  return null;
}
