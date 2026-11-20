import type { ExerciceComposeePoint, FonctionExterieure, FonctionInterieure, Ordre, VarianteComposeePoint } from "../../core5e/composeePoint";
import { radicande, valeurExt, valeurInt, valeurOrdreInverse } from "../../core5e/composeePoint";

/**
 * Couche A — générateur de `5gen60` « Composée en un point ». `Math.random()` seul (le `?code=`
 * rejoue le tirage). Ordre du tirage : VERDICT d'abord (« n'existe pas » 40 %, jamais fixé par
 * `forme`), ordre f∘g / g∘f (50/50), puis les nombres jusqu'à ce que la valeur intermédiaire tombe
 * du bon côté du domaine de la fonction extérieure.
 * - Valeur intermédiaire entière, |m| ≤ 12 ; a entier de −4 à 4.
 * - Bord du domaine (radicande nul) recherché : racine « existe » 20 % (√0 = 0 existe), racine au
 *   dénominateur « n'existe pas » 40 % (√0 = 0 au dénominateur : le piège ≥ / >). Inverse « n'existe
 *   pas » = valeur intermédiaire égale à la valeur interdite.
 * - Valeur finale exacte lisible : radicande ≤ 30 ; racine au dénominateur : radicande carré parfait
 *   (1, 4, 9, 16, 25) dans 75 % des cas.
 * - L'ordre inversé (extérieure appliquée d'abord) donne un autre résultat que le bon (sinon le
 *   piège ne se verrait pas), et la valeur intermédiaire diffère de a.
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

export const PART_N_EXISTE_PAS = 0.4;

function tirerInterieure(): FonctionInterieure {
  const r = Math.random();
  if (r < 0.32) return { genre: "affine", m: parmi([-3, -2, -1, 2, 3]), b: entier(-6, 6) };
  if (r < 0.62) return { genre: "carre", s: Math.random() < 0.75 ? 1 : -1, b: entier(-6, 6) };
  if (r < 0.82) return { genre: "abs", p: entier(-2, 2), b: entier(-4, 4) };
  return { genre: "racine", p: entier(-3, 8) };
}

function tirerExterieure(v: VarianteComposeePoint): FonctionExterieure {
  if (v === "racine") {
    const s: 1 | -1 = Math.random() < 0.65 ? 1 : -1;
    return { genre: "racine", s, k: s === 1 ? parmi([1, 1, 2, 3]) : 1, p: entier(-6, 6) };
  }
  if (v === "inverse") return { genre: "inverse", c: parmi([1, 2, 3, 4, 6, -1, -2, -3]), p: entier(-6, 6) };
  return { genre: "racineDen", c: parmi([1, 2, 3, 4, 6, -2]), s: Math.random() < 0.65 ? 1 : -1, p: entier(-6, 6) };
}

const CARRES = [1, 4, 9, 16, 25];

function convient(e: ExerciceComposeePoint, bordVoulu: boolean): boolean {
  const { ext, m, a } = e;
  if (Math.abs(m) > 12 || m === a) return false;
  const r = radicande(ext, m);
  const ok = valeurExt(ext, m) !== null;
  if (ok !== e.existe) return false;
  if (ext.genre !== "inverse" && (r === 0) !== bordVoulu) return false;
  if (ok) {
    if (Math.abs(r) > 30) return false;
    if (ext.genre === "racineDen" && Math.random() < 0.75 && !CARRES.includes(r)) return false;
    if (ext.genre === "racine" && !bordVoulu && Math.random() < 0.5 && !CARRES.includes(r)) return false;
  } else if (ext.genre !== "inverse" && r < -20) return false;
  const inv = valeurOrdreInverse(e);
  const bon = valeurExt(ext, m);
  if (inv !== null && bon !== null && Math.abs(inv - bon) < 1e-9) return false;
  return true;
}

export function construire(variante: VarianteComposeePoint, existeForce?: boolean): ExerciceComposeePoint {
  const existe = existeForce ?? Math.random() >= PART_N_EXISTE_PAS;
  const ordre: Ordre = Math.random() < 0.5 ? "fg" : "gf";
  const bordVoulu = variante === "racine" ? existe && Math.random() < 0.2 : variante === "racineDen" ? !existe && Math.random() < 0.4 : false;
  for (;;) {
    const ext = tirerExterieure(variante);
    const int = tirerInterieure();
    const a = entier(-4, 4);
    const m = valeurInt(int, a);
    if (m === null || !Number.isInteger(m)) continue;
    const e: ExerciceComposeePoint = { variante, ordre, ext, int, a, m, existe };
    if (convient(e, bordVoulu)) return e;
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteComposeePoint; label: string }[] = [
  { id: "racine", label: "Seconde fonction : une racine carrée" },
  { id: "inverse", label: "Seconde fonction : une fraction c/(x − p)" },
  { id: "racineDen", label: "Seconde fonction : une racine au dénominateur" },
];

export function construireAvecVarianteId(id: string): ExerciceComposeePoint {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceComposeePoint(): ExerciceComposeePoint {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
