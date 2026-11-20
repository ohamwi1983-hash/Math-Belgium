import type { CourbeEntiere, ExerciceComposeeDiagonale, VarianteComposeeDiagonale } from "../../core5e/composeeDiagonale";
import { dansDomaine, finCourbe, valeurCourbe } from "../../core5e/composeeDiagonale";

export type IdVarianteComposeeDiagonale = VarianteComposeeDiagonale;

/**
 * Couche A — générateur de `5gen63`. `Math.random()` seul (le `?code=` rejoue le tirage).
 * Courbes : domaine [c ; d] entier (c ∈ [−5 ; −1], d ∈ [1 ; 5], longueur 4 à 8 : le graphe s'arrête
 * DANS la fenêtre [−6 ; 6]), valeurs entières dans [−5 ; 5] aux abscisses entières, pentes −2 à 2
 * (jamais un segment posé sur y = x, pas plus de deux paliers), extrémités creuses 20 % du temps
 * (tirées AVANT le verdict : leur présence ne trahit rien). Verdict « existe » tiré 50/50 ; sinon
 * v = I(a) hors du domaine de l'extérieure (sur une extrémité creuse dans ≈ 30 % des cas où il y en
 * a une). Lectures non ambiguës : v ≠ a, et pour « existe » O(v) ≠ v, O(v) ≠ O(a), O(v) ≠ I(v).
 */

const ent = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

export const PART_EXISTE = 0.5;

function courbe(): CourbeEntiere {
  for (;;) {
    const debut = ent(-5, -1);
    const fin = ent(Math.max(1, debut + 4), Math.min(5, debut + 8));
    if (fin - debut < 4) continue;
    const valeurs = [ent(-5, 5)];
    let paliers = 0;
    let bon = true;
    for (let x = debut + 1; x <= fin; x++) {
      const pente = parmi([-2, -1, -1, 0, 1, 1, 2]);
      const y = valeurs[valeurs.length - 1] + pente;
      if (y < -5 || y > 5) {
        bon = false;
        break;
      }
      if (pente === 0) paliers++;
      // Segment posé sur la diagonale : illisible.
      if (pente === 1 && valeurs[valeurs.length - 1] === x - 1) {
        bon = false;
        break;
      }
      valeurs.push(y);
    }
    if (!bon || paliers > 2) continue;
    return { debut, valeurs, ouverteG: Math.random() < 0.2, ouverteD: Math.random() < 0.2 };
  }
}

/** Les deux courbes ne se confondent pas (au plus deux abscisses entières communes en même point). */
function distinctes(f: CourbeEntiere, g: CourbeEntiere): boolean {
  let communs = 0;
  for (let x = -6; x <= 6; x++) {
    const a = valeurCourbe(f, x);
    const b = valeurCourbe(g, x);
    if (a !== null && a === b) communs++;
  }
  return communs <= 2;
}

function construire(variante: VarianteComposeeDiagonale): ExerciceComposeeDiagonale {
  const existe = Math.random() < PART_EXISTE;
  for (;;) {
    const f = courbe();
    const g = courbe();
    if (!distinctes(f, g)) continue;
    const I = variante === "gof" ? f : g;
    const O = variante === "fog" ? f : variante === "gof" ? g : f;
    const Iv = variante === "ff" ? f : I;
    const candidats: { a: number; v: number; w: number | null; extremite: boolean }[] = [];
    for (let a = I.debut; a <= finCourbe(I); a++) {
      const v = valeurCourbe(variante === "ff" ? f : I, a);
      if (v === null || v === a) continue;
      const w = valeurCourbe(O, v);
      if ((w !== null) !== existe) continue;
      if (existe) {
        const oa = valeurCourbe(O, a);
        const iv = valeurCourbe(Iv, v);
        if (w === v || w === oa || (variante !== "ff" && w === iv)) continue;
      } else if (v < -5 || v > 5) continue;
      const extremite = !existe && ((v === O.debut && O.ouverteG) || (v === finCourbe(O) && O.ouverteD));
      candidats.push({ a, v, w, extremite });
    }
    if (candidats.length === 0) continue;
    const parExtremite = candidats.filter((c) => c.extremite);
    const choix = parExtremite.length && Math.random() < 0.3 ? parmi(parExtremite) : parmi(candidats.filter((c) => !c.extremite).length ? candidats.filter((c) => !c.extremite) : candidats);
    if (!dansDomaine(variante === "ff" ? f : I, choix.a)) continue;
    return {
      variante,
      f,
      g,
      a: choix.a,
      v: choix.v,
      existe,
      w: choix.w,
      cleCollecteur: `${variante}/${existe ? "existe" : choix.extremite ? "rond-vide" : "hors-domaine"}`,
    };
  }
}

export const CATALOGUE_VARIANTES: { id: IdVarianteComposeeDiagonale; label: string }[] = [
  { id: "fog", label: "(f∘g)(a)" },
  { id: "gof", label: "(g∘f)(a)" },
  { id: "ff", label: "(f∘f)(a)" },
];

export function construireAvecVarianteId(id: IdVarianteComposeeDiagonale): ExerciceComposeeDiagonale {
  return construire(id);
}

export function genererExerciceComposeeDiagonale(): ExerciceComposeeDiagonale {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}
