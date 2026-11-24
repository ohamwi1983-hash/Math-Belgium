/**
 * 5gen32 (optimisation géométrique) — lot B : aides à deux niveaux (`texteAideNiveau1/2`, niveau 2
 * posé pour l'instance), messages ciblés par écran (π oublié, une seule marge, demi-cercle oublié,
 * un seul coin retiré, une seule projection, un seul disque, aire de la base au lieu du volume, F
 * recopiée, signe de (k/x)′, facteur −2 de la chaîne, racine négative ou x = c/2 gardée, α en radians,
 * F au lieu de F′, valeurs échangées, coût calculé sur le volume) et message sous la réponse révélée
 * d'un choix fermé faux (une seule tentative). Refus de l'illisible : moteur
 * (`refusSaisieOptimisation`).
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceOptimisation } from "../core5e/optimisationGeometrique.types";
import type { EcranOptimisation } from "../moteur5e/typesOptimisationGeometrique";
import {
  alphaOptTrapeze,
  conclusionReelle,
  deriveeParDifferenceFinie,
  diagnostiquerEcran,
  justificationCorrecteId,
  pointsTest,
  valeurFOptimisation,
  valeurNumeriqueAvecPi,
  versVariableX,
  xOptimal,
} from "../moteur5e/verificationOptimisationGeometrique";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { AideTrig } from "./aidesTrigonometrie";
import { texteAideNiveau1, texteAideNiveau2 } from "./formatOptimisationGeometrique";
import { aideDepuis, l, PREFIXE_CHOIX_FERME, t } from "./retoursDerivees";

export function aidesOptimisation(e: ExerciceOptimisation, phase: EcranOptimisation): AideTrig[] {
  const n1 = texteAideNiveau1(e, phase);
  const n2 = texteAideNiveau2(e, phase);
  return [aideDepuis(n1.texte, n1.latex), ...(n2 ? [aideDepuis(n2.texte, n2.latex)] : [])];
}

function sansPrefixe(s: string): string {
  return s.includes("=") ? s.slice(s.lastIndexOf("=") + 1) : s;
}

function valeurEn(s: string, x: number, radians: boolean): number | null {
  try {
    let expr = versVariableX(sansPrefixe(s).replace(/[−–—]/g, "-"));
    if (radians) expr = expr.replace(/(?<![a-zA-Z])(sin|cos)\s*\(\s*x\s*\)/g, (_m, fn: string) => `(${fn === "sin" ? Math.sin(x) : Math.cos(x)})`);
    const v = evaluerExpressionGenerale(expr, x);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

function nombre(s: string): number | null {
  return valeurEn(s, 0, false);
}

const proche = (v: number | null, c: number, tol = 1e-3) => v !== null && Math.abs(v - c) <= tol * Math.max(1, Math.abs(c));

/** La saisie vaut-elle g(x) sur plusieurs points du domaine ? */
function egale(e: ExerciceOptimisation, s: string, g: (x: number) => number): boolean {
  const opt = e.famille === "cubique" ? 1 : xOptimal(e);
  const xs = e.famille === "trapeze" ? [0.4, 0.8, 1.2] : [0.5, 0.8, 1.3].map((f) => f * opt);
  return xs.every((x) => proche(valeurEn(s, x, e.famille === "trapeze"), g(x)));
}

/** Message ciblé (champs à 3 tentatives) — null : message générique. */
export function cibleOptimisation(e: ExerciceOptimisation, phase: EcranOptimisation, r: Record<string, string>): FragmentConsigne[] | null {
  const statuts = diagnostiquerEcran(e, phase, r);
  const faux = (id: string) => statuts[id] !== undefined && statuts[id] !== "correct";
  switch (phase) {
    case "lien":
      if (e.famille === "cylindre" && faux("h") && egale(e, r.h ?? "", (x) => (e.coeffV * Math.PI) / (x * x))) return [t("Le volume vaut "), l("V=\\pi x^2h"), t(" : divise aussi par π.")];
      if (e.famille === "margesA" && faux("y") && egale(e, r.y ?? "", (x) => (e.T as number) / (x + e.mh) - e.mv)) return [t("Il y a une marge de chaque côté : "), l("2m_h"), t(" en largeur et "), l("2m_v"), t(" en hauteur.")];
      if (e.famille === "fenetreA" && faux("h") && egale(e, r.h ?? "", (x) => (valeurNumeriqueAvecPi(e.P!) - 2 * x) / 2)) return [t("Le périmètre extérieur compte aussi le demi-cercle, de longueur "), l("\\pi r"), t(".")];
      if (e.famille === "boite" && faux("b") && egale(e, r.b ?? "", (x) => e.c - x)) return [t("On retire un carré à CHAQUE bout du côté du carton : deux fois x.")];
      if (e.famille === "trapeze" && faux("B") && egale(e, r.B ?? "", (x) => e.b + e.l * Math.cos(x))) return [t("La grande base dépasse le fond d'une projection de CHAQUE côté : "), l(`2\\cdot ${e.l}\\cos\\alpha`), t(".")];
      return null;
    case "construire":
      if (e.famille === "boite" && egale(e, r.F ?? "", (x) => (e.c - 2 * x) ** 2)) return [t("C'est l'aire de la base : le volume la multiplie par la hauteur x.")];
      if (e.famille === "cylindre" && egale(e, r.F ?? "", (x) => Math.PI * x * x + (2 * e.coeffV * Math.PI) / x)) return [t("Une boîte fermée a DEUX disques (fond et couvercle) : "), l("2\\pi x^2"), t(".")];
      return null;
    case "deriver": {
      if (e.famille === "cubique") return null;
      const s = r.Fprime ?? "";
      if (egale(e, s, (x) => valeurFOptimisation(e, x))) return [t("Tu as recopié F : il faut la dériver.")];
      if (e.famille === "boite" && egale(e, s, (x) => (e.c - 2 * x) ** 2 + 2 * x * (e.c - 2 * x))) return [t("La dérivée de "), l(`(${e.c}-2x)^2`), t(" est "), l(`2(${e.c}-2x)\\cdot(-2)`), t(" : n'oublie pas le facteur −2.")];
      const kSurX = e.famille === "cylindre" ? 2 * e.coeffV * Math.PI : e.famille === "margesB" ? 2 * e.mh * (e.A as number) : e.famille === "fenetreB" ? valeurNumeriqueAvecPi(e.A!) : 0;
      if (kSurX !== 0 && egale(e, s, (x) => (deriveeParDifferenceFinie(e, x) ?? 0) + (2 * kSurX) / (x * x))) return [t("Attention au signe : "), l("\\left(\\dfrac{k}{x}\\right)'=-\\dfrac{k}{x^2}"), t(".")];
      return null;
    }
    case "resoudre": {
      if (e.famille === "trapeze") {
        const a = nombre(r.alpha ?? "");
        if (faux("alpha") && proche(a, alphaOptTrapeze(e), 0.02)) return [t("C'est α en radians : on le demande en degrés (calculatrice en degrés pour "), l("\\arccos u"), t(").")];
        return null;
      }
      if (e.famille === "cubique") return null;
      const id = e.famille === "fenetreA" || e.famille === "fenetreB" ? "r" : "x";
      const v = nombre(r[id] ?? "");
      if (e.famille === "boite" && proche(v, e.c / 2)) return [l(`x=${e.c / 2}`), t(" annule F′, mais la base serait nulle : la boîte serait plate. Garde l'autre solution.")];
      if (v !== null && v < 0) return [t("Une longueur est positive : garde la solution positive.")];
      return null;
    }
    case "justifier": {
      if (e.famille === "cubique") return null;
      const pts = pointsTest(e);
      const vAvant = nombre(r.deriveeAvant ?? "");
      if (faux("deriveeAvant") && proche(vAvant, valeurFOptimisation(e, pts.avant), 0.01)) return [t("C'est la valeur de F : on demande celle de F′ en ce point.")];
      return null;
    }
    case "conclure": {
      const ids = Object.keys(statuts);
      if (ids.length === 2 && ids.every(faux)) {
        const [a, b] = ids;
        const va = nombre(r[a] ?? "");
        const vb = nombre(r[b] ?? "");
        const ra = diagnostiquerEcran(e, phase, { ...r, [a]: r[b] ?? "", [b]: r[a] ?? "" });
        if (va !== null && vb !== null && Object.values(ra).every((st) => st === "correct")) return [t("Les deux valeurs sont échangées : relis le libellé de chaque champ.")];
      }
      return null;
    }
    case "application":
      return null;
    default:
      return null;
  }
}

/** Message sous la réponse révélée quand un choix fermé faux a clos l'écran (une seule tentative). */
export function messageChoixOptimisation(e: ExerciceOptimisation, phase: EcranOptimisation, r: Record<string, string>): string | null {
  if (phase === "resoudre" && r.justification !== undefined && r.justification !== justificationCorrecteId(e))
    return `${PREFIXE_CHOIX_FERME} ${e.famille === "boite" ? `x = ${e.c / 2} donne une base nulle : la boîte serait plate, cette valeur est hors du domaine.` : "La solution rejetée est négative : une longueur ne peut pas être négative."}`;
  if (phase === "justifier" && r.conclusion !== undefined && r.conclusion !== conclusionReelle(e))
    return `${PREFIXE_CHOIX_FERME} ${conclusionReelle(e) === "max" ? "F′ passe de + à − : F croît puis décroît, c'est un maximum." : "F′ passe de − à + : F décroît puis croît, c'est un minimum."}`;
  return null;
}
