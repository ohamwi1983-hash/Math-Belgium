import { chaineLinearisation, coordX, coordY, defContexte, inverseModele, logsAttendus, TOLERANCE_LOG } from "../core6e/linearisationDonnees";
import type { ExerciceLinearisation, Intervalle, ModeleDonnees } from "../core6e/linearisationDonnees";
import type { StatutVerification } from "../moteur/statutVerification";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import type { PhaseLinearisation } from "./typesLinearisation";

/**
 * Couche B (6e) — vérification de `6gen89` « Linéariser des données ». Toute valeur numérique est
 * lue par `evaluerValeurExponentielle` (décimal avec virgule ou point, expression avec ln, e,
 * fractions…), l'unité du contexte éventuellement recopiée à la fin est ignorée. Elle est juste si
 * elle tombe dans l'intervalle accepté de `chaineLinearisation` (arrondis acceptés des étapes
 * précédentes propagés + demi-unité de la précision annoncée) ; un logarithme, à un demi-millième
 * près.
 *
 * `messagePiege` reconnaît les erreurs classiques (log décimal au lieu de ln, pente inversée ou
 * calculée sur les mesures brutes, signe de p, k = p au lieu de eᵖ, a = m au lieu de eᵐ, écart au
 * lieu de la température…) et les signale — sans jamais donner la valeur attendue.
 */

/** Identifiants des trois options du choix (= modèle). */
export const OPTIONS_CHOIX: ModeleDonnees[] = ["affine", "exponentiel", "puissance"];

/** Lecture d'un nombre : `null` si illisible. L'unité du contexte, recopiée à la fin, est retirée. */
export function lireNombre(texte: string, unite?: string): number | null {
  let brut = texte.trim();
  if (unite) {
    const variantes = [unite, unite.replace("°", "° "), unite.replace("°C", "degrés"), unite.replace("°C", "C")];
    for (const u of variantes) {
      if (u && brut.toLowerCase().endsWith(u.toLowerCase())) {
        brut = brut.slice(0, brut.length - u.length).trim();
        break;
      }
    }
  }
  if (brut === "") return null;
  return evaluerValeurExponentielle(brut);
}

function dans(v: number, iv: Intervalle): boolean {
  return v >= iv.min - 1e-9 && v <= iv.max + 1e-9;
}

function statutIntervalle(texte: string, iv: Intervalle, unite?: string): StatutVerification {
  const v = lireNombre(texte, unite);
  if (v === null) return "parse_error";
  return dans(v, iv) ? "correct" : "not_equivalent";
}

/** Unité de la grandeur demandée à l'écran « prévision ». */
export function unitePrevision(e: ExerciceLinearisation): string {
  const def = defContexte(e.contexte);
  return e.typePrevision === "valeur" ? def.uniteY : def.uniteX;
}

/** Statut champ par champ (`[statut]` pour l'écran à choix). */
export function diagnostiquerChamps(e: ExerciceLinearisation, phase: PhaseLinearisation, valeurs: string[]): StatutVerification[] {
  const c = chaineLinearisation(e);
  switch (phase) {
    case "choix":
      return [valeurs[0] === e.modele ? "correct" : "not_equivalent"];
    case "logs":
      return logsAttendus(e).map((cible, i) => statutIntervalle(valeurs[i] ?? "", { min: cible - TOLERANCE_LOG, max: cible + TOLERANCE_LOG }));
    case "pente":
      return [statutIntervalle(valeurs[0] ?? "", c.accepte.m)];
    case "ordonnee":
      return [statutIntervalle(valeurs[0] ?? "", c.accepte.p)];
    case "modele":
      return [statutIntervalle(valeurs[0] ?? "", c.accepte.k), statutIntervalle(valeurs[1] ?? "", c.accepte.parametre)];
    case "prevision":
      return [statutIntervalle(valeurs[0] ?? "", c.accepte.prevision, unitePrevision(e))];
  }
}

/** Statut global : `parse_error` prioritaire, puis `not_equivalent`. */
export function diagnostiquerEcran(e: ExerciceLinearisation, phase: PhaseLinearisation, valeurs: string[]): StatutVerification {
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export function verifierEcran(e: ExerciceLinearisation, phase: PhaseLinearisation, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}

// ============================================================================
// Pièges reconnus.
// ============================================================================

/** Égalité « à l'arrondi près » : 0,6 % relatif ou 0,002 absolu. */
function proche(v: number, cible: number): boolean {
  return Number.isFinite(cible) && Math.abs(v - cible) <= Math.max(0.002, 0.006 * Math.abs(cible));
}

function messageLog(v: number, mesure: number, juste: number, autre: number | null): string | null {
  if (proche(v, juste)) return null;
  if (proche(v, Math.log10(mesure))) return "ce nombre est le logarithme décimal (log) ; la linéarisation se fait ici avec le logarithme népérien ln.";
  if (proche(v, mesure)) return "ce nombre est la mesure elle-même : il faut en prendre le logarithme népérien.";
  if (autre !== null && proche(v, autre)) return "ce logarithme est celui de l'autre grandeur de la même ligne.";
  return null;
}

function majusculeInitiale(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Message ciblé sur une erreur classique, `null` si rien de reconnaissable (ou réponse juste). */
export function messagePiege(e: ExerciceLinearisation, phase: PhaseLinearisation, valeurs: string[], libelles: string[] = []): string | null {
  const c = chaineLinearisation(e);
  const def = defContexte(e.contexte);
  const [i, j] = e.lignes;
  const lire = (k: number, unite?: string) => lireNombre(valeurs[k] ?? "", unite);

  if (phase === "logs") {
    const messages: string[] = [];
    const lignes = e.modele === "puissance" ? [i, i, j, j] : [i, j];
    const attendus = logsAttendus(e);
    attendus.forEach((juste, k) => {
      const v = lire(k);
      if (v === null) return;
      const ligne = lignes[k];
      const surX = e.modele === "puissance" && k % 2 === 0;
      const mesure = surX ? e.xs[ligne] : e.ys[ligne];
      const autre = e.modele === "puissance" ? Math.log(surX ? e.ys[ligne] : e.xs[ligne]) : null;
      const m = messageLog(v, mesure, juste, autre);
      if (m) messages.push(libelles[k] ? `${libelles[k]} : ${m}` : majusculeInitiale(m));
    });
    return messages.length > 0 ? messages.join(" ") : null;
  }

  if (phase === "pente") {
    const v = lire(0);
    if (v === null || proche(v, c.m)) return null;
    const dX = c.X[1] - c.X[0];
    const dY = c.Y[1] - c.Y[0];
    if (proche(v, dX / dY)) return "Tu as divisé l'écart des abscisses par celui des ordonnées : la pente est le quotient de l'écart des ORDONNÉES par l'écart des abscisses.";
    if (proche(v, -c.m)) return "Le signe est faux : regarde si la grandeur transformée augmente ou diminue d'une ligne à l'autre.";
    const brute = (e.ys[j] - e.ys[i]) / (e.xs[j] - e.xs[i]);
    if (e.modele !== "affine" && proche(v, brute)) return "Cette pente est calculée sur les mesures brutes : dans la représentation qui aligne les points, l'ordonnée est ln de la mesure.";
    if (e.modele === "puissance" && proche(v, dY / (e.xs[j] - e.xs[i]))) return "En log-log, l'abscisse aussi est transformée : utilise ln de x, pas x.";
    if (e.modele === "exponentiel" && proche(v, dY / (Math.log(e.xs[j]) - Math.log(e.xs[i])))) return "Pour un modèle exponentiel, l'abscisse reste x (représentation semi-logarithmique) : seule l'ordonnée passe au logarithme.";
    return null;
  }

  if (phase === "ordonnee") {
    const v = lire(0);
    if (v === null || proche(v, c.p)) return null;
    if (proche(v, c.Y[0] + c.m * c.X[0]) || proche(v, c.Y[1] + c.m * c.X[1])) return "Erreur de signe : l'ordonnée à l'origine s'obtient en RETIRANT m fois l'abscisse à l'ordonnée d'un point de la droite.";
    if ((proche(v, c.Y[0]) && Math.abs(c.X[0]) > 1e-9) || (proche(v, c.Y[1]) && Math.abs(c.X[1]) > 1e-9)) return "Ce nombre est l'ordonnée d'un point du tableau ; l'ordonnée à l'origine correspond à une abscisse NULLE.";
    return null;
  }

  if (phase === "modele") {
    const messages: string[] = [];
    const k = lire(0);
    if (k !== null && !proche(k, c.k) && proche(k, c.p)) messages.push(`${libelles[0] ?? "k"} : ce nombre est p ; k est le nombre dont le logarithme népérien vaut p.`);
    const a = lire(1);
    if (a !== null && !proche(a, c.parametre)) {
      if (e.modele === "exponentiel" && proche(a, c.m)) messages.push(`${libelles[1] ?? "a"} : ce nombre est la pente m ; ln(a) = m, donc a est le nombre dont le logarithme vaut m.`);
      if (e.modele === "puissance" && proche(a, Math.exp(c.m))) messages.push(`${libelles[1] ?? "n"} : en log-log, l'exposant n est la pente elle-même, sans exponentielle.`);
    }
    return messages.length > 0 ? messages.join(" ") : null;
  }

  if (phase === "prevision") {
    const v = lire(0, unitePrevision(e));
    if (v === null || proche(v, c.prevision)) return null;
    if (e.typePrevision === "valeur") {
      if (e.ambiante > 0 && proche(v, c.yPrevision)) return `Ce nombre est l'écart ${def.varYTexte} à la température de la pièce ; on demande la température elle-même.`;
      if (proche(v, coordY(e.modele, c.yPrevision))) return "Ce nombre est encore la valeur transformée (le logarithme) : reviens à la grandeur avec l'exponentielle.";
      return null;
    }
    // Seuil.
    if (e.ambiante > 0) {
      const sansAmbiante = inverseModele(e.modele, c.k, c.parametre, e.cible);
      if (proche(v, sansAmbiante)) return `Le modèle donne l'écart ${def.varYTexte} à la température de la pièce, pas la température : vise l'écart correspondant.`;
    }
    if (e.modele === "puissance" && proche(v, coordX(e.modele, c.xPrevision))) return "Ce nombre est ln de l'abscisse cherchée : reviens à l'abscisse avec l'exponentielle.";
    return null;
  }
  return null;
}
