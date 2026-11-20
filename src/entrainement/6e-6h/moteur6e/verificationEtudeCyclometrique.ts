import type { ExerciceEtudeCyclo } from "../core6e/etudeCyclometrique";
import { fPrime, kArcRacine, zerosDerivee } from "../core6e/etudeCyclometrique";
import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { PhaseEtudeCyclo } from "../ui6e/formatEtudeCyclometrique";
import { ID_JUSTE, domaine, valeursDemandees } from "../ui6e/formatEtudeCyclometrique";
import { diagnostiquerEnsemble, estApprocheeDe, expressionVaut, lireInfini, lireListe, listeApprochee, statutExact, statutExpressionX, statutListe } from "./lectureCycloLotG";

/**
 * Vérification de `6gen157` (statut à 3 valeurs). Domaine : intervalles exacts (crochets justes, ±∞
 * ouverts). Dérivée : toute expression équivalente (comparée en quatre points du domaine de
 * dérivabilité). Zéros : ensemble de valeurs exactes, ou « aucune ». Valeurs du tableau : exactes
 * (π, √, fractions, arcsin…) ou ±∞ ; une écriture décimale approchée est signalée sans perte de
 * tentative (`approchee`).
 */

type E = ExerciceEtudeCyclo;

export function pointsTest(e: E): number[] {
  switch (e.variante) {
    case "arc-racine":
      return [-0.83, -0.3, 0.2, 0.71];
    case "arctan-inverse":
      return [-2.1, -0.4, 0.6, 1.7];
    default:
      return [-2.3, -0.7, 0.4, 1.9];
  }
}

function statutValeur(brut: string, attendue: number): StatutVerification {
  const inf = lireInfini(brut);
  if (inf !== null) return inf === attendue ? "correct" : "not_equivalent";
  if (!Number.isFinite(attendue)) return statutExact(brut, 0) === "parse_error" ? "parse_error" : "not_equivalent";
  return statutExact(brut, attendue);
}

export function diagnostiquer(e: E, phase: PhaseEtudeCyclo, v: string[]): StatutVerification[] {
  switch (phase) {
    case "domaine":
      return [diagnostiquerEnsemble(v, domaine(e)).statut];
    case "derivee":
      return [statutExpressionX(v[0], (x) => fPrime(e, x), pointsTest(e))];
    case "zeros":
      return [statutListe(v[0], zerosDerivee(e).map((z) => z.v))];
    case "variations":
      return [v[0] === ID_JUSTE ? "correct" : "not_equivalent"];
    case "valeurs":
      return valeursDemandees(e).map((d, i) => statutValeur(v[i] ?? "", d.attendue.v));
  }
}

export function approchee(e: E, phase: PhaseEtudeCyclo, v: string[]): string | null {
  if (diagnostiquer(e, phase, v).every((s) => s === "correct")) return null;
  const MSG = "Valeur approchée : la question demande la valeur exacte (avec π, √ ou une fraction). Cette saisie ne compte pas comme une tentative.";
  if (phase === "domaine") return diagnostiquerEnsemble(v, domaine(e)).raison === "approchee" ? MSG : null;
  if (phase === "zeros") return listeApprochee(v[0], zerosDerivee(e).map((z) => z.v)) ? MSG : null;
  if (phase === "valeurs") return valeursDemandees(e).some((d, i) => Number.isFinite(d.attendue.v) && estApprocheeDe(v[i] ?? "", d.attendue.v)) ? MSG : null;
  return null;
}

/** Message ciblé sur une erreur trahie par la réponse fausse (jamais la réponse). */
export function piege(e: E, phase: PhaseEtudeCyclo, v: string[]): Frag[] | null {
  const pts = pointsTest(e);
  switch (phase) {
    case "domaine": {
      const r = diagnostiquerEnsemble(v, domaine(e)).raison;
      if (r === "infini-ferme") return [tx("Un intervalle est toujours ouvert en "), lx("-\\infty"), tx(" et en "), lx("+\\infty"), tx(".")];
      if (r === "crochet") return [tx("Les bornes sont justes ; vérifie les crochets : la borne appartient-elle au domaine ?")];
      if (r === "nombre" && e.variante === "arctan-inverse") return [tx("Une seule valeur est interdite : le domaine est formé de deux intervalles.")];
      return null;
    }
    case "derivee": {
      const s = v[0];
      const vaut = (g: (x: number) => number) => expressionVaut(s, g, pts);
      switch (e.variante) {
        case "arctan-droite": {
          const k = e.d.kn / e.d.kd;
          if (vaut((x) => k / (1 + x * x))) return [tx("La dérivée de "), lx("-x"), tx(" est "), lx("-1"), tx(" : il manque un terme.")];
          if (k !== 1 && vaut((x) => 1 / (1 + x * x) - 1)) return [tx("Le coefficient de "), lx("\\arctan x"), tx(" reste devant sa dérivée.")];
          return null;
        }
        case "x-arctan": {
          const k = e.k;
          if (k !== 1 && vaut((x) => Math.atan(x / k) + x / (1 + (x * x) / (k * k)))) return [tx("Règle de la chaîne : la dérivée de "), lx(`\\dfrac{x}{${k}}`), tx(" est "), lx(`\\dfrac{1}{${k}}`), tx(".")];
          if (vaut((x) => x / k / (1 + (x * x) / (k * k))) || vaut((x) => 1 / k / (1 + (x * x) / (k * k)))) return [tx("Règle du produit : "), lx("(uv)'=u'v+uv'"), tx(" — il manque un des deux termes.")];
          return null;
        }
        case "arc-racine": {
          const k = kArcRacine(e.d);
          const a = e.d.arc === "arcsin" ? 1 : -1;
          if (vaut((x) => (a + k * x) / Math.sqrt(1 - x * x))) return [tx("La dérivée de "), lx("\\sqrt{1-x^{2}}"), tx(" est "), lx("\\dfrac{-x}{\\sqrt{1-x^{2}}}"), tx(" : attention au signe.")];
          if (vaut((x) => (-a - k * x) / Math.sqrt(1 - x * x))) return [tx(e.d.arc === "arcsin" ? "La dérivée de arcsin est positive : " : "La dérivée de arccos porte un signe − : "), lx(e.d.arc === "arcsin" ? "\\dfrac{1}{\\sqrt{1-x^{2}}}" : "-\\dfrac{1}{\\sqrt{1-x^{2}}}"), tx(".")];
          if (vaut((x) => a / Math.sqrt(1 - x * x) + k / (2 * Math.sqrt(1 - x * x)))) return [tx("Règle de la chaîne : "), lx("(\\sqrt{u})'=\\dfrac{u'}{2\\sqrt{u}}"), tx(" avec "), lx("u'=-2x"), tx(".")];
          return null;
        }
        case "arctan-inverse": {
          const k = e.k;
          if (vaut((x) => 1 / (1 + (k * k) / (x * x)))) return [tx("Règle de la chaîne : multiplie par la dérivée de "), lx("u=\\dfrac{k}{x}"), tx(", qui vaut "), lx("-\\dfrac{k}{x^{2}}"), tx(".")];
          if (vaut((x) => k / (x * x + k * k))) return [tx("Attention au signe : "), lx("\\left(\\dfrac{k}{x}\\right)'=-\\dfrac{k}{x^{2}}"), tx(".")];
          return null;
        }
      }
      return null;
    }
    case "zeros": {
      const l = lireListe(v[0]);
      if (l === null) return null;
      const z = zerosDerivee(e).map((x) => x.v);
      if (l === "aucune") return e.variante === "x-arctan" ? [tx("Calcule "), lx("f'(0)"), tx(".")] : null;
      if (e.variante === "arctan-inverse" && l.some((x) => x === 0)) return [tx("0 n'est pas dans le domaine de "), lx("f"), tx(" ; et le numérateur de "), lx("f'(x)"), tx(" est-il nul ?")];
      if (z.length === 2 && l.length === 1 && z.some((x) => Math.abs(x - l[0]) < 1e-9)) return [tx("L'équation "), lx("x^{2}=c"), tx(" ("), lx("c>0"), tx(") a deux solutions opposées.")];
      if (l.some((x) => Math.abs(x) > 1) && e.variante === "arc-racine") return [tx("Une solution doit appartenir au domaine de dérivabilité "), lx("]-1\\,;\\,1["), tx(".")];
      return null;
    }
    case "variations":
      return null;
    case "valeurs": {
      const ds = valeursDemandees(e);
      if (e.variante === "arctan-droite" && statutExact(v[0] ?? "", ds[1].attendue.v) === "correct") return [tx("Le maximum local est atteint en "), lx(`x=${e.d.c.l}`), tx(" (f′ y passe de + à −) ; vérifie le signe.")];
      if (e.variante === "arctan-inverse" && statutValeur(v[0] ?? "", ds[1].attendue.v) === "correct" && statutValeur(v[1] ?? "", ds[0].attendue.v) === "correct") return [tx("Les limites à gauche et à droite de 0 sont inversées : regarde le signe de "), lx("\\dfrac{k}{x}"), tx(" quand "), lx("x<0"), tx(".")];
      return null;
    }
  }
}

/** Explication d'un choix faux (écran « variations »). */
export function explicationChoix(e: E, phase: PhaseEtudeCyclo): string {
  if (phase !== "variations") return "";
  if (e.variante === "arctan-inverse") return "f′ garde le même signe sur chaque intervalle du domaine, mais f n'est pas monotone sur leur réunion ℝ₀ : on étudie chaque intervalle séparément.";
  return "Le signe de f′ change à chacun de ses zéros : on lit les variations intervalle par intervalle du domaine.";
}
