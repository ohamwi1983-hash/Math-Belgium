import type { StatutVerification } from "../../../../5e-4h/moteur/statutVerification";
import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { Frag } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { EnsembleNb, ExerciceRationnel, PhaseRationnel } from "../core/types";
import { ENSEMBLE_L, nombreDe } from "../ui/format";

/**
 * Couche B — vérification de `56gen14` : un choix fermé par écran (une tentative). Message ciblé
 * après un choix faux (affiché avec la réponse révélée) : piège propre au nombre quand l'élève passe
 * la frontière rationnel / irrationnel, sinon rappel de l'emboîtement ℕ ⊂ ℤ ⊂ ℚ ou du signe.
 */

type E = ExerciceRationnel;
type P = PhaseRationnel;
const IDS: EnsembleNb[] = ["N", "Z", "Q", "I"];

export function diagnostiquer(e: E, p: P, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] as EnsembleNb;
  if (!IDS.includes(v)) return ["parse_error"];
  return [v === nombreDe(e, p).ensemble ? "correct" : "not_equivalent"];
}

export function bonneOption(e: E, p: P): string {
  return nombreDe(e, p).ensemble;
}

const RANG: Record<EnsembleNb, number> = { N: 0, Z: 1, Q: 2, I: 3 };

export function piege(e: E, p: P, valeurs: string[]): Frag[] | null {
  const n = nombreDe(e, p);
  const v = valeurs[0] as EnsembleNb;
  if (!IDS.includes(v) || v === n.ensemble) return null;
  if ((v === "I") !== (n.ensemble === "I")) return n.piege;
  if (RANG[v] > RANG[n.ensemble]) return [tx("Ce nombre est bien dans "), lx(ENSEMBLE_L[v]), tx(", mais "), lx("\\mathbb{N}\\subset\\mathbb{Z}\\subset\\mathbb{Q}"), tx(" : on demande le plus petit ensemble qui le contient.")];
  if (n.ensemble === "Z") return [tx("Ce nombre est négatif : ce n'est pas un naturel.")];
  return [tx("Ce nombre n'est pas un entier : il est dans "), lx("\\mathbb{Q}"), tx(" mais pas dans "), lx("\\mathbb{Z}"), tx(".")];
}
