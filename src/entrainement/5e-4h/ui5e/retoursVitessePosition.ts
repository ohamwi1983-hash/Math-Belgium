/**
 * 5gen35 (vitesse et position) — lot B : aides à deux niveaux (niveau 2 posé pour l'instance),
 * messages ciblés (s recopiée, v donnée pour a, racine négative gardée, ÷ 3,6 au lieu de × 3,6,
 * distance totale au lieu de D₂, t₂ seul pour le temps total) et message sous la réponse révélée du
 * choix « pourquoi rejeter ». Refus de l'illisible : moteur (`saisieIllisibleVitessePosition`).
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceVitessePosition } from "../core5e/vitessePosition.types";
import type { EcranVitessePosition } from "../moteur5e/typesVitessePosition";
import { valeurPosition, valeurVitesseExacte } from "../moteur5e/verificationVitessePosition";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { AideTrig } from "./aidesTrigonometrie";
import { texteAideNiveau1, texteAideNiveau2 } from "./formatVitessePosition";
import { aideDepuis, PREFIXE_CHOIX_FERME, t } from "./retoursDerivees";

export function aidesVitessePosition(e: ExerciceVitessePosition, ecran: EcranVitessePosition): AideTrig[] {
  const n1 = texteAideNiveau1(ecran);
  const n2 = texteAideNiveau2(ecran, e);
  return [aideDepuis(n1.texte, n1.latex), aideDepuis(n2.texte, n2.latex)];
}

function lire(s: string, x = 0): number | null {
  try {
    const v = evaluerExpressionGenerale(s.replace(/[−–—]/g, "-").replace(/^[^=]*=/, "").replace(/(?<![a-zA-Z])t(?![a-zA-Z])/g, "x"), x);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

const proche = (v: number | null, c: number, tol = 0.051) => v !== null && Math.abs(v - c) <= tol;

export function cibleVitessePosition(e: ExerciceVitessePosition, ecran: EcranVitessePosition, valeurs: string[]): FragmentConsigne[] | null {
  const v0 = valeurs[0] ?? "";
  const vCible = valeurVitesseExacte(e, e.tCible);
  switch (ecran) {
    case "derivee":
      if ([1.5, 3.2, 4.7].every((x) => proche(lire(v0, x), valeurPosition(e, x), 1e-6))) return [t("C'est la position s(t) : la vitesse est sa dérivée, v(t) = s′(t).")];
      return null;
    case "acceleration":
      if ([1.5, 3.2].every((x) => proche(lire(v0, x), valeurVitesseExacte(e, x), 1e-6))) return [t("C'est la vitesse : l'accélération est sa dérivée, a(t) = v′(t).")];
      return null;
    case "resoudre":
      return null;
    case "vitessePointe":
      if (proche(lire(v0), valeurVitesseExacte(e, e.racineRejetee))) return [t("Tu as pris la solution rejetée (négative) : la durée retenue est la solution positive.")];
      if (proche(lire(v0), valeurPosition(e, e.tCible))) return [t("C'est la position s(t) : on demande la vitesse v(t) à cet instant.")];
      return null;
    case "conversion":
      if (proche(lire(v0), vCible / 3.6)) return [t("Pour passer des m/s aux km/h, on MULTIPLIE par 3,6 (1 m/s = 3,6 km/h).")];
      return null;
    case "segmentConstant":
      if (e.variante === "B" && proche(lire(v0), e.D / vCible)) return [t("À vitesse constante, on ne parcourt que la distance qui reste, "), t("D₂ = D − D₁"), t(".")];
      return null;
    case "tempsTotal":
      if (e.variante === "B" && proche(lire(v0), e.D2 / vCible)) return [t("C'est la durée du second segment seulement : ajoute celle du premier.")];
      return null;
    default:
      return null;
  }
}

/** Message sous la réponse révélée du choix « pourquoi rejeter l'autre solution » (une seule tentative). */
export function messageRejetVitessePosition(): string {
  return `${PREFIXE_CHOIX_FERME} Une durée écoulée depuis le départ ne peut pas être négative : c'est pour cela qu'on rejette la solution négative.`;
}
