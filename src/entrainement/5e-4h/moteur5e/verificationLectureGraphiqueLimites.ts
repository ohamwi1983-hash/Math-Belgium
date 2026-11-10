/**
 * Couche B (5e) — vérification pour 5gen22 ("Limites et asymptotes, lecture graphique"). N'importe
 * jamais rien de `src/generateurs5e/`.
 *
 * Écran 1 : chaque champ peut attendre soit une valeur FINIE, soit ±∞ — AUCUN champ existant sur la
 * plateforme n'acceptait jusqu'ici ±∞ en texte libre (5gen20/6gen6 le sélectionnent par BOUTON,
 * jamais tapé). `normaliserInfini` reconnaît les formes usuelles ("+∞", "∞", "infini", "inf", "oo",
 * et leurs variantes négatives) AVANT toute tentative de parsing numérique ; un texte qui n'est ni
 * une forme infinie reconnue ni un nombre fini valide reste `"parse_error"`, jamais confondu avec
 * une réponse fausse mais lisible.
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeurArcSecteur } from "./verificationArcsSecteurs";
import type { CibleAsymptote, CibleComportement, ReponseNommerAsymptotes, SlotAsymptote } from "./typesLectureGraphiqueLimites";

const FORMES_INFINI_POSITIF = ["+∞", "∞", "+infini", "infini", "+inf", "inf", "+oo", "oo", "plusl'infini", "plusinfini", "+l'infini", "l'infini"];
const FORMES_INFINI_NEGATIF = ["-∞", "-infini", "-inf", "-oo", "moinsl'infini", "moinsinfini", "-l'infini"];

/** Signes moins typographiques (−, –, —) ramenés au tiret ASCII — l'élève qui tape « −∞ » ou « −3 »
 * avec le vrai signe moins ne doit jamais être refusé (audit 5e ch. 4, point 4). */
function normaliserSignes(texte: string): string {
  return texte.replace(/[\u2212\u2013\u2014]/g, "-");
}

function normaliserInfini(texte: string): 1 | -1 | null {
  const t = normaliserSignes(texte)
    .trim()
    .toLowerCase()
    .replace(/\\infty/g, "∞")
    .replace(/[’`]/g, "'")
    .replace(/\s+/g, "");
  if (FORMES_INFINI_NEGATIF.includes(t)) return -1;
  if (FORMES_INFINI_POSITIF.includes(t)) return 1;
  return null;
}

/** Préfixe d'équation recopié depuis l'étiquette du champ (« x = −2 », « y = 3 », « f(x) = 2x − 3 »,
 * « AV : x = 1 ») — retiré avant l'évaluation : c'est la même réponse (audit 5e ch. 4, décision E). */
export function retirerPrefixeEquation(texte: string): string {
  return normaliserSignes(texte)
    .trim()
    .replace(/^(a[vho]\s*[:≡]\s*)/i, "")
    .replace(/^(x|y|f\s*\(\s*x\s*\))\s*=\s*/i, "")
    .trim();
}

/** Écran "completerLimites" — un champ par comportement visible, cible finie OU infinie. */
export function diagnostiquerCibleComportement(texteBrut: string, cible: CibleComportement): StatutVerification {
  const texte = normaliserSignes(texteBrut);
  const signe = normaliserInfini(texte);
  if (signe !== null) {
    return cible.kind === "infini" && signe === cible.signe ? "correct" : "not_equivalent";
  }
  // Pas une forme infinie reconnue : tenter un nombre fini (cible fictive 0 si la vraie cible est
  // infinie — sa valeur n'importe pas, seul le statut parse_error/non-parse_error compte alors).
  const statut = diagnostiquerValeurArcSecteur(texte, cible.kind === "fini" ? cible.valeur : 0);
  if (statut === "parse_error") return "parse_error";
  if (cible.kind !== "fini") return "not_equivalent"; // nombre fini valide, mais la vraie limite est infinie
  return statut;
}

/** Écran "nommerAsymptotes" — équation d'une AV (valeur de x seule) ou d'une AH (valeur de y
 * seule), champ numérique simple. */
export function diagnostiquerValeurAsymptote(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeurArcSecteur(texte, cible);
}

/** Équation de l'AO (y=pente·x+ordonnee) — équivalence algébrique en x, échantillonnée sur
 * quelques points, même motif que `diagnostiquerQuotient` (5gen21). */
export function diagnostiquerDroiteOblique(texte: string, pente: number, ordonnee: number): StatutVerification {
  try {
    const points = [0, 1, 2, -1, 3, -2];
    for (const x of points) {
      const valeurEntree = evaluerExpressionGenerale(texte, x);
      if (!Number.isFinite(valeurEntree)) return "parse_error";
      if (Math.abs(valeurEntree - (pente * x + ordonnee)) > 1e-4) return "not_equivalent";
    }
    return "correct";
  } catch {
    return "parse_error";
  }
}

export function diagnostiquerCibleAsymptote(texteBrut: string, cible: CibleAsymptote): StatutVerification {
  const texte = retirerPrefixeEquation(texteBrut);
  if (cible.kind === "verticale") return diagnostiquerValeurAsymptote(texte, cible.x);
  if (cible.kind === "horizontale") return diagnostiquerValeurAsymptote(texte, cible.y);
  return diagnostiquerDroiteOblique(texte, cible.pente, cible.ordonnee);
}

// ============================================================================
// Écran "nommerAsymptotes" de 5gen22 (décision G) : l'élève NOMME le type de chaque asymptote et
// donne son équation — lignes libres, dans n'importe quel ordre, ou « aucune asymptote ». Le nombre et
// le type des champs ne révèlent plus la structure du graphique.
// ============================================================================

export interface DiagnosticNommerAsymptotes {
  /** Un statut par ligne de la réponse (appariement glouton : une ligne correcte « consomme » une
   * asymptote attendue de même type). */
  statutsLignes: StatutVerification[];
  /** Réponse entièrement juste (toutes les asymptotes, rien de plus), ou « aucune » à raison. */
  correct: boolean;
  /** L'élève a coché « aucune asymptote » alors qu'il y en a, ou l'inverse : verdict faux, l'écran se
   * clôt sans nouvelle tentative (sinon il se gagnerait par élimination). */
  verdictAucuneFaux: boolean;
  /** Au moins une ligne illisible : pas de tentative consommée, message de syntaxe. */
  illisible: boolean;
}

export function diagnostiquerNommerAsymptotes(reponse: ReponseNommerAsymptotes, slots: SlotAsymptote[]): DiagnosticNommerAsymptotes {
  const aucuneAttendue = slots.length === 0;
  if (reponse.aucune) {
    return { statutsLignes: [], correct: aucuneAttendue, verdictAucuneFaux: !aucuneAttendue, illisible: false };
  }
  const utilises = new Set<number>();
  const statutsLignes = reponse.lignes.map((ligne): StatutVerification => {
    let illisible = true;
    for (let i = 0; i < slots.length; i++) {
      if (utilises.has(i) || slots[i].cible.kind !== ligne.type) continue;
      const statut = diagnostiquerCibleAsymptote(ligne.texte, slots[i].cible);
      if (statut === "correct") {
        utilises.add(i);
        return "correct";
      }
      if (statut !== "parse_error") illisible = false;
    }
    if (!illisible) return "not_equivalent";
    // Aucune asymptote de ce type attendue : lisible ou non selon une cible fictive du même type.
    const fictive: CibleAsymptote = ligne.type === "verticale" ? { kind: "verticale", x: 0 } : ligne.type === "horizontale" ? { kind: "horizontale", y: 0 } : { kind: "oblique", pente: 0, ordonnee: 0 };
    return diagnostiquerCibleAsymptote(ligne.texte, fictive) === "parse_error" ? "parse_error" : "not_equivalent";
  });
  const correct = !aucuneAttendue && reponse.lignes.length === slots.length && statutsLignes.every((s) => s === "correct");
  return { statutsLignes, correct, verdictAucuneFaux: aucuneAttendue, illisible: statutsLignes.includes("parse_error") };
}
