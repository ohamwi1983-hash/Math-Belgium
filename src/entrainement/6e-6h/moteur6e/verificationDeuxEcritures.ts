import {
  angleNumerique,
  argumentZ,
  cosZ,
  formeAlgebrique,
  moduleFacteurNumerique,
  moduleZNumerique,
  multiplierComplexeR3,
  numerateurAlgebrique,
  partiesFacteur,
  moduleCarreFacteur,
  sinZ,
  valeurDouziemeNumerique,
  valeurR3,
} from "../core6e/deuxEcrituresComplexe";
import type { ExerciceDeuxEcritures, Facteur } from "../core6e/deuxEcrituresComplexe";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerAngle, ecartAngulaire } from "./equivalenceExponentielle";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import type { PhaseDeuxEcritures } from "./typesDeuxEcritures";

/**
 * Couche B (6e) — vérification de `6gen94` « Valeurs exactes par deux écritures d'un même
 * complexe ». Toutes les valeurs attendues viennent de `core6e/deuxEcrituresComplexe.ts` (source
 * unique). Champs RÉELS uniquement (évaluateur `expressionExponentielle.ts` : `sqrt`, `√`, `pi`, `π`,
 * fractions, signe « − » acceptés) :
 *
 * - `algebrique` : Re z et Im z, valeurs exactes (égalité numérique à 10⁻⁶ près) ;
 * - `facteurs` : |z₁|, arg z₁, |z₂|, arg z₂ ; `trigo` : |z|, arg z — tout argument est accepté à 2kπ
 *   près (`diagnostiquerAngle`, comme 6gen37), un angle en degrés est refusé sans tentative ;
 * - `identification` : cos θ et sin θ exacts (toute écriture exacte équivalente :
 *   (√3 + 1)/(2√2) comme (√6 + √2)/4).
 *
 * Une valeur seulement ARRONDIE (décimale à 1 % près de la valeur exacte, sans racine ni π) est
 * refusée SANS tentative, avec un message qui demande la valeur exacte.
 */

const TOLERANCE_EXACTE = 1e-6;

type TypeChamp = "reel" | "angle";

interface ChampAttendu {
  type: TypeChamp;
  valeur: number;
}

/** Valeurs attendues, champ par champ (même ordre que `champsEcran`). */
export function champsAttendus(e: ExerciceDeuxEcritures, phase: PhaseDeuxEcritures): ChampAttendu[] {
  switch (phase) {
    case "algebrique": {
      const z = formeAlgebrique(e);
      return [
        { type: "reel", valeur: valeurR3(z.re) },
        { type: "reel", valeur: valeurR3(z.im) },
      ];
    }
    case "facteurs":
      return [
        { type: "reel", valeur: moduleFacteurNumerique(e.z1) },
        { type: "angle", valeur: angleNumerique(e.z1.t) },
        { type: "reel", valeur: moduleFacteurNumerique(e.z2) },
        { type: "angle", valeur: angleNumerique(e.z2.t) },
      ];
    case "trigo":
      return [
        { type: "reel", valeur: moduleZNumerique(e) },
        { type: "angle", valeur: angleNumerique(argumentZ(e)) },
      ];
    case "identification":
      return [
        { type: "reel", valeur: valeurDouziemeNumerique(cosZ(e)) },
        { type: "reel", valeur: valeurDouziemeNumerique(sinZ(e)) },
      ];
  }
}

function lireReel(texte: string): number | null {
  if (texte.trim() === "") return null;
  const v = evaluerValeurExponentielle(texte);
  return v !== null && Number.isFinite(v) ? v : null;
}

function statutChamp(texte: string, attendu: ChampAttendu): StatutVerification {
  if (attendu.type === "angle") return diagnostiquerAngle(texte, attendu.valeur, TOLERANCE_EXACTE).statut;
  const v = lireReel(texte);
  if (v === null) return "parse_error";
  return Math.abs(v - attendu.valeur) <= TOLERANCE_EXACTE ? "correct" : "not_equivalent";
}

/** Statut champ par champ : seuls les champs faux sont marqués. */
export function diagnostiquerChamps(e: ExerciceDeuxEcritures, phase: PhaseDeuxEcritures, valeurs: string[]): StatutVerification[] {
  return champsAttendus(e, phase).map((a, i) => statutChamp(valeurs[i] ?? "", a));
}

export function diagnostiquerEcran(e: ExerciceDeuxEcritures, phase: PhaseDeuxEcritures, valeurs: string[]): StatutVerification {
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export function verifierEcran(e: ExerciceDeuxEcritures, phase: PhaseDeuxEcritures, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}

// ============================================================================
// Contrôle AVANT soumission — aucun de ces messages ne consomme de tentative.
// ============================================================================

const SANS_TENTATIVE = " Cette saisie ne compte pas comme une tentative.";

/** Saisie sans racine ni π : une valeur exacte irrationnelle ne peut pas s'écrire ainsi. */
function sansSymboleExact(texte: string): boolean {
  return !/sqrt|√|pi|π/i.test(texte);
}

function estArrondi(texte: string, attendu: ChampAttendu): boolean {
  if (!sansSymboleExact(texte)) return false;
  const v = lireReel(texte);
  if (v === null) return false;
  const ecart = attendu.type === "angle" ? Math.abs(ecartAngulaire(v, attendu.valeur)) : Math.abs(v - attendu.valeur);
  return ecart > TOLERANCE_EXACTE && ecart <= 0.01 * Math.max(1, Math.abs(attendu.valeur));
}

/** Message qui ARRÊTE la soumission (saisie illisible, angle en degrés, valeur arrondie), `null` sinon. */
export function controleAvantSoumission(e: ExerciceDeuxEcritures, phase: PhaseDeuxEcritures, valeurs: string[]): string | null {
  const attendus = champsAttendus(e, phase);
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) {
    if (phase === "algebrique" && valeurs.some((v) => /(^|[^a-z])i([^a-z]|$)/i.test(v))) {
      return "Écris chaque partie sans i : la partie réelle dans la première case, le nombre qui multiplie i dans la seconde." + SANS_TENTATIVE;
    }
    if (phase === "identification" && valeurs.some((v) => /cos|sin/i.test(v))) {
      return "Calcule la valeur exacte au lieu de recopier cos(…) ou sin(…)." + SANS_TENTATIVE;
    }
    return "Saisie non reconnue — écris une valeur exacte, par exemple (√3 + 1)/4, √2/2 ou −5π/12 (√ peut s'écrire sqrt, π peut s'écrire pi)." + SANS_TENTATIVE;
  }
  if (phase === "identification" && valeurs.some((v) => /cos|sin/i.test(v))) {
    return "Calcule la valeur exacte au lieu de recopier cos(…) ou sin(…)." + SANS_TENTATIVE;
  }
  for (let i = 0; i < attendus.length; i++) {
    const a = attendus[i];
    if (a.type === "angle" && diagnostiquerAngle(valeurs[i], a.valeur, TOLERANCE_EXACTE).degres) {
      return "Exprime l'angle en radians (par exemple 45° s'écrit π/4)." + SANS_TENTATIVE;
    }
    if (statuts[i] !== "correct" && estArrondi(valeurs[i], a)) {
      return a.type === "angle"
        ? "Cet angle n'est qu'une valeur approchée : donne sa valeur EXACTE, avec π (par exemple 3π/4)." + SANS_TENTATIVE
        : "Cette valeur n'est qu'un arrondi : donne la valeur EXACTE, avec des racines carrées (par exemple √2/2)." + SANS_TENTATIVE;
    }
  }
  return null;
}

// ============================================================================
// Pièges reconnus (jamais la valeur attendue).
// ============================================================================

function proche(a: number | null, b: number): boolean {
  return a !== null && Math.abs(a - b) <= TOLERANCE_EXACTE;
}

function memeAngle(a: number | null, b: number): boolean {
  return a !== null && Math.abs(ecartAngulaire(a, b)) <= TOLERANCE_EXACTE;
}

function piegeAlgebrique(e: ExerciceDeuxEcritures, re: number | null, im: number | null): string | null {
  const z = formeAlgebrique(e);
  const zr = valeurR3(z.re);
  const zi = valeurR3(z.im);
  if (proche(re, zi) && proche(im, zr) && Math.abs(zr - zi) > TOLERANCE_EXACTE) return "Tu as inversé la partie réelle et la partie imaginaire.";
  const a = partiesFacteur(e.z1);
  const b = partiesFacteur(e.z2);
  if (e.variante === "quotient") {
    const n = numerateurAlgebrique(e);
    if (proche(re, valeurR3(n.re)) && proche(im, valeurR3(n.im))) return "Le numérateur est juste, mais il faut encore diviser par le dénominateur, devenu réel après la multiplication par le conjugué.";
    const N = moduleCarreFacteur(e.z2);
    const faux = multiplierComplexeR3(a, b);
    if (proche(re, valeurR3(faux.re) / N) && proche(im, valeurR3(faux.im) / N)) return "Multiplie par le CONJUGUÉ du dénominateur (même partie réelle, partie imaginaire opposée), pas par le dénominateur lui-même.";
    if (proche(re, valeurR3(faux.re)) && proche(im, valeurR3(faux.im))) return "Pour un quotient, multiplie le numérateur et le dénominateur par le conjugué du dénominateur : tu as calculé un produit.";
  } else {
    // i² remplacé par +1 au lieu de −1.
    const reFaux = valeurR3(a.re) * valeurR3(b.re) + valeurR3(a.im) * valeurR3(b.im);
    if (proche(re, reFaux)) return "Attention : i² = −1, donc le produit des deux parties imaginaires change de signe.";
  }
  if (proche(re, zr) && proche(im, -zi)) return "La partie réelle est juste ; revois le signe de la partie imaginaire.";
  if (proche(re, -zr) && proche(im, zi)) return "La partie imaginaire est juste ; revois le signe de la partie réelle.";
  return null;
}

function piegeFacteur(f: Facteur, module: number | null, argument: number | null, nom: string): string | null {
  const p = partiesFacteur(f);
  const a = valeurR3(p.re);
  const b = valeurR3(p.im);
  const r = moduleFacteurNumerique(f);
  if (module !== null && !proche(module, r)) {
    if (proche(module, a * a + b * b)) return `Le module de ${nom} est la RACINE CARRÉE de a² + b².`;
    if (proche(module, Math.abs(a) + Math.abs(b))) return `Le module de ${nom} n'est pas la somme des parties : on utilise Pythagore, |z| = √(a² + b²).`;
  }
  if (argument !== null && !memeAngle(argument, angleNumerique(f.t))) {
    if (a < 0 && memeAngle(argument, Math.atan(b / a))) return `L'argument de ${nom} n'est pas dans le bon quadrant : arctan(b/a) donne un angle de ]−π/2 ; π/2[, il faut le corriger de π quand la partie réelle est négative.`;
    if (memeAngle(argument, Math.atan2(a, b))) return `Pour ${nom}, cos θ = a/r (partie réelle) et sin θ = b/r (partie imaginaire) : tu les as échangés.`;
    if (memeAngle(argument, -angleNumerique(f.t))) return `Revois le signe de l'argument de ${nom} : regarde le signe de sa partie imaginaire.`;
  }
  return null;
}

function piegeTrigo(e: ExerciceDeuxEcritures, module: number | null, argument: number | null): string | null {
  const r1 = moduleFacteurNumerique(e.z1);
  const r2 = moduleFacteurNumerique(e.z2);
  const t1 = angleNumerique(e.z1.t);
  const t2 = angleNumerique(e.z2.t);
  const messages: string[] = [];
  const quotient = e.variante === "quotient";
  if (argument !== null && !memeAngle(argument, angleNumerique(argumentZ(e)))) {
    if (memeAngle(argument, quotient ? t1 + t2 : t1 - t2)) messages.push(quotient ? "Un quotient SOUSTRAIT les arguments (c'est le produit qui les additionne)." : "Un produit ADDITIONNE les arguments (c'est le quotient qui les soustrait).");
    else if (quotient && memeAngle(argument, t2 - t1)) messages.push("L'ordre compte : arg(z₁/z₂) = arg z₁ − arg z₂.");
  }
  if (module !== null && !proche(module, moduleZNumerique(e))) {
    if (proche(module, r1 + r2) || proche(module, Math.abs(r1 - r2))) messages.push("Les modules se multiplient (produit) ou se divisent (quotient) : ils ne s'additionnent jamais.");
    else if (proche(module, quotient ? r1 * r2 : r1 / r2)) messages.push(quotient ? "Un quotient DIVISE les modules." : "Un produit MULTIPLIE les modules.");
    else if (quotient && proche(module, r2 / r1)) messages.push("L'ordre compte : |z₁/z₂| = |z₁| / |z₂|.");
  }
  return messages.length > 0 ? messages.join(" ") : null;
}

function piegeIdentification(e: ExerciceDeuxEcritures, c: number | null, s: number | null): string | null {
  const cos = valeurDouziemeNumerique(cosZ(e));
  const sin = valeurDouziemeNumerique(sinZ(e));
  const z = formeAlgebrique(e);
  const r = moduleZNumerique(e);
  if (proche(c, sin) && proche(s, cos)) return "La partie réelle donne le cosinus, la partie imaginaire le sinus : tu les as échangés.";
  const re = valeurR3(z.re);
  const im = valeurR3(z.im);
  if ((proche(c, re) || proche(s, im)) && Math.abs(r - 1) > TOLERANCE_EXACTE) return "N'oublie pas le module : r·cos θ = Re(z), donc cos θ = Re(z)/r (de même pour le sinus).";
  if (proche(c, re * r) || proche(s, im * r)) return "Il faut DIVISER la partie réelle (et la partie imaginaire) par le module, pas multiplier.";
  if (proche(c, -cos) || proche(s, -sin)) return "Revois les signes : cos θ a le signe de Re(z), sin θ celui de Im(z).";
  return null;
}

/** Message ciblé sur une erreur classique, `null` si rien de reconnaissable (ou réponse juste). */
export function messagePiege(e: ExerciceDeuxEcritures, phase: PhaseDeuxEcritures, valeurs: string[]): string | null {
  const lu = (i: number) => lireReel(valeurs[i] ?? "");
  switch (phase) {
    case "algebrique":
      return piegeAlgebrique(e, lu(0), lu(1));
    case "facteurs": {
      const messages = [piegeFacteur(e.z1, lu(0), lu(1), "z₁"), piegeFacteur(e.z2, lu(2), lu(3), "z₂")].filter((m): m is string => m !== null);
      return messages.length > 0 ? messages.join(" ") : null;
    }
    case "trigo":
      return piegeTrigo(e, lu(0), lu(1));
    case "identification":
      return piegeIdentification(e, lu(0), lu(1));
  }
}
