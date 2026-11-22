import type { DroiteTracee, EquationDonnee, ExerciceLireDroite, FormeEquation, Pt, RoleDroite, VarianteLireDroite } from "../../core/lireDroite.types";
import { choisir, entier, melanger } from "../../ui/outilsAnalytiqueLotG";

/**
 * Générateur de gen132 « Lire une droite : associer droites et équations ». Tout le hasard passe par
 * `Math.random` (`genererAvecCode` : le QR code rouvre le MÊME exercice, mêmes ordres).
 *
 * - Association : une droite de base y = mx + p et ses leurres — pente opposée (−m ; p), ordonnée à
 *   l'origine opposée (m ; −p), composantes du vecteur directeur échangées (1/m ; p) ; variante « axe » :
 *   la base, UN de ces leurres, et les droites y = p et x = p (la confusion horizontale / verticale).
 *   |m| ≠ 1 et p ≠ 0 : les quatre droites sont distinctes. Les quatre formes d'écriture sont
 *   réparties au hasard, jamais une forme impossible (une verticale n'a pas de y = mx + p, une
 *   horizontale pas de x = ny + q).
 * - Fenêtre [−5 ; 5] ; ordonnées à l'origine, points de départ des paramétriques et marches de
 *   l'escalier sur des nœuds du quadrillage.
 * - Écran (e) : pente entière ou fractionnaire selon la variante (« axe » : au hasard).
 * - Écran (f) : droite g verticale ou horizontale à pile ou face (la réponse : jamais dans `forme`).
 */

export const CATALOGUE_VARIANTES: { id: VarianteLireDroite; label: string }[] = [
  { id: "entiere", label: "Pentes entières" },
  { id: "fractionnaire", label: "Pentes fractionnaires" },
  { id: "axe", label: "Avec des droites parallèles aux axes" },
];

/** Pente num/den : entière (|m| = 2 ou 3) ou fractionnaire (dénominateur 2 ou 3, |m| ≠ 1). */
function pente(type: "entiere" | "fractionnaire"): { num: number; den: number } {
  const s = Math.random() < 0.5 ? -1 : 1;
  if (type === "entiere") return { num: s * choisir([2, 3]), den: 1 };
  return s > 0 ? choisir([{ num: 1, den: 2 }, { num: 3, den: 2 }, { num: 1, den: 3 }, { num: 2, den: 3 }]) : choisir([{ num: -1, den: 2 }, { num: -3, den: 2 }, { num: -1, den: 3 }, { num: -2, den: 3 }]);
}

/** Inverse (composantes échangées) : (den ; num) → pente den/num, ramenée à un dénominateur positif. */
function inverse(m: { num: number; den: number }): { num: number; den: number } {
  const s = m.num < 0 ? -1 : 1;
  return { num: s * m.den, den: Math.abs(m.num) };
}

const dans = (P: Pt) => Math.abs(P.x) <= 5 && Math.abs(P.y) <= 5;

/** Point de départ (nœud, de préférence hors de l'axe Oy) et vecteur directeur d'une écriture paramétrique. */
function parametrage(d: DroiteTracee): { P0: Pt; dir: Pt } {
  const s = Math.random() < 0.5 ? -1 : 1;
  if (d.type === "horizontale") return { P0: { x: choisir([-2, -1, 1, 2]), y: d.k }, dir: { x: s, y: 0 } };
  if (d.type === "verticale") return { P0: { x: d.k, y: choisir([-2, -1, 1, 2]) }, dir: { x: 0, y: s } };
  const candidats = [-1, 1].map((j) => ({ x: d.den * j, y: d.p + d.num * j })).filter(dans);
  const P0 = candidats.length > 0 ? choisir(candidats) : { x: 0, y: d.p };
  return { P0, dir: { x: s * d.den, y: s * d.num } };
}

function possible(d: DroiteTracee, f: FormeEquation): boolean {
  if (d.type === "verticale" && f === "explicite-y") return false;
  if (d.type === "horizontale" && f === "explicite-x") return false;
  return true;
}

const FORMES: FormeEquation[] = ["implicite", "explicite-y", "explicite-x", "parametrique"];

export function genererLireDroite(variante: VarianteLireDroite): ExerciceLireDroite {
  const typePente = variante === "fractionnaire" ? "fractionnaire" : variante === "entiere" ? "entiere" : Math.random() < 0.5 ? "entiere" : "fractionnaire";
  const m = pente(typePente);
  const p = (Math.random() < 0.5 ? -1 : 1) * entier(1, 3);
  const inv = inverse(m);
  const familles: { d: DroiteTracee; role: RoleDroite }[] = [
    { d: { type: "oblique", ...m, p }, role: "base" },
    { d: { type: "oblique", num: -m.num, den: m.den, p }, role: "pente-opposee" },
    { d: { type: "oblique", ...m, p: -p }, role: "p-oppose" },
    { d: { type: "oblique", ...inv, p }, role: "composantes-echangees" },
  ];
  let droites: { d: DroiteTracee; role: RoleDroite }[];
  if (variante === "axe") {
    droites = [familles[0]!, choisir(familles.slice(1)), { d: { type: "horizontale", k: p }, role: "horizontale" }, { d: { type: "verticale", k: p }, role: "verticale" }];
  } else droites = familles;
  // Formes : une par équation, jamais impossible.
  let formes: FormeEquation[];
  for (;;) {
    formes = melanger(FORMES);
    if (droites.every((x, i) => possible(x.d, formes[i]!))) break;
  }
  const equations: EquationDonnee[] = melanger(droites.map((x, i) => ({ droite: x.d, role: x.role, forme: formes[i]!, ...parametrage(x.d) })));
  const ordre = melanger([0, 1, 2, 3]);
  // Droite d de l'écran (e) : distincte des quatre, marche de l'escalier sur un nœud.
  let lecture: { num: number; den: number; p: number };
  for (;;) {
    const ml = variante === "axe" ? pente(Math.random() < 0.5 ? "entiere" : "fractionnaire") : pente(typePente);
    const pl = (Math.random() < 0.5 ? -1 : 1) * entier(1, 3);
    if (!dans({ x: ml.den, y: pl + ml.num })) continue;
    if (droites.some((x) => x.d.type === "oblique" && x.d.num * ml.den === ml.num * x.d.den && x.d.p === pl)) continue;
    lecture = { ...ml, p: pl };
    break;
  }
  return {
    variante,
    equations,
    ordre,
    lecture,
    impossible: { type: Math.random() < 0.5 ? "verticale" : "horizontale", k: (Math.random() < 0.5 ? -1 : 1) * entier(1, 4) },
    ordreFormes: melanger([0, 1, 2, 3, 4]),
  };
}

export function construireAvecVariante(id: string): ExerciceLireDroite {
  const v = CATALOGUE_VARIANTES.find((c) => c.id === id);
  return v ? genererLireDroite(v.id) : genererExerciceLireDroite();
}

export function genererExerciceLireDroite(): ExerciceLireDroite {
  return genererLireDroite(choisir(CATALOGUE_VARIANTES.map((c) => c.id)));
}
