import type { ExerciceDroiteMayer } from "../core5e/droiteMayer";
import type { Pt } from "../core5e/stat2vLotH1";
import { arrondi, decimales, egal, pointMoyen } from "../core5e/stat2vLotH1";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseDroiteMayer } from "../ui5e/formatDroiteMayer";
import { bAvecPenteArrondie, DECIMALES_G, derniereAbscisse, n, prevision, previsionArrondie } from "../ui5e/formatDroiteMayer";
import type { StatutArrondi } from "./lectureStat2vLotH1";
import { nL } from "../ui5e/ecrituresStat2vLotH1";
import { lireDroiteAffine, lireNb, statutArrondi, statutDroite, vaut } from "./lectureStat2vLotH1";

/**
 * Vérification de `5gen36`. Saisies LUES avant le verdict (illisible → `parse_error`, aucune tentative) ;
 * valeur juste mais moins précise que demandé → « trop arrondie » (`approchee`, aucune tentative).
 * Tolérances : moyennes de groupe exactes ; pente et b à une demi-unité de la précision affichée (b calculé
 * avec la pente NON arrondie) ; G exact ou au centième ; prévision à une demi-unité, avec l'équation exacte
 * OU l'équation arrondie de l'écran précédent. Messages ciblés : données non rangées (premières colonnes
 * du tableau), convention du partage quand n est impair, premier et dernier points au lieu des points
 * moyens, pente des points extrêmes, Δx / Δy, b calculé avec la pente arrondie, coefficients échangés,
 * x̄ et ȳ échangés. Jamais sur une réponse juste.
 */

type E = ExerciceDroiteMayer;

const exact = (brut: string, v: number): StatutArrondi => statutArrondi(brut, v, decimales(v));

function statuts(e: E, p: PhaseDroiteMayer, v: string[]): StatutArrondi[] {
  const { m } = e;
  if (p === "partage") {
    const k = lireNb(v[0] ?? "");
    return [k === null ? "parse_error" : egal(k, m.k) ? "correct" : "not_equivalent", exact(v[1] ?? "", derniereAbscisse(e))];
  }
  if (p === "groupes") return [exact(v[0] ?? "", m.G1.x), exact(v[1] ?? "", m.G1.y), exact(v[2] ?? "", m.G2.x), exact(v[3] ?? "", m.G2.y)];
  if (p === "pente") return [statutArrondi(v[0] ?? "", m.a, e.da)];
  if (p === "equation") return [statutDroite(v[0] ?? "", m.a, m.b, e.da, e.db)];
  if (p === "g") return [statutArrondi(v[0] ?? "", e.G.x, DECIMALES_G), statutArrondi(v[1] ?? "", e.G.y, DECIMALES_G)];
  return [statutArrondi(v[0] ?? "", prevision(e), e.dp, [previsionArrondie(e)])];
}

export function diagnostiquer(e: E, p: PhaseDroiteMayer, v: string[]): StatutVerification[] {
  return statuts(e, p, v).map((s) => (s === "trop" ? "not_equivalent" : s));
}

export function approchee(e: E, p: PhaseDroiteMayer, v: string[]): string | null {
  if (!statuts(e, p, v).includes("trop")) return null;
  if (p === "groupes") return "Valeur arrondie : les coordonnées de G₁ et G₂ se calculent exactement, donne-les sans arrondir. Cette saisie ne compte pas comme une tentative.";
  return "Valeur trop arrondie : respecte la précision demandée dans la consigne. Cette saisie ne compte pas comme une tentative.";
}

export function piege(e: E, p: PhaseDroiteMayer, v: string[]): Frag[] | null {
  const ok = diagnostiquer(e, p, v);
  if (ok.every((s) => s === "correct")) return null;
  const { m } = e;
  const k = m.k;
  const premiers: Pt[] = e.points.slice(0, k);
  const nonRanges = e.variante === "desordre";
  if (p === "partage") {
    const eff = lireNb(v[0] ?? "");
    if (eff !== null && n(e) % 2 === 1 && egal(eff, k + 1)) return [tx(`Convention de l'exercice : n = ${n(e)} est impair, le premier groupe a un point de moins (${k} points).`)];
    if (nonRanges && vaut(v[1] ?? "", Math.max(...premiers.map((q) => q.x))) && ok[1] !== "correct") return [tx("Tu as pris les premières colonnes du tableau : il faut d'abord ranger les données par abscisses croissantes.")];
    return null;
  }
  if (p === "groupes") {
    const Gp = pointMoyen(premiers);
    if (nonRanges && vaut(v[0] ?? "", Gp.x) && !egal(Gp.x, m.G1.x)) return [tx("Ton premier groupe est formé des premières colonnes du tableau, qui n'est pas rangé : range d'abord les données par abscisses croissantes.")];
    const A = m.tries[0]!;
    const B = m.tries[n(e) - 1]!;
    if (vaut(v[0] ?? "", A.x) && vaut(v[1] ?? "", A.y) && vaut(v[2] ?? "", B.x) && vaut(v[3] ?? "", B.y)) return [tx("Ce sont le premier et le dernier point : les points de la droite de Mayer sont les points moyens des deux groupes.")];
    if (vaut(v[0] ?? "", m.G1.y) && vaut(v[1] ?? "", m.G1.x)) return [tx("Abscisse et ordonnée échangées : "), lx("\\bar{x}_1"), tx(" est la moyenne des x.")];
    return null;
  }
  if (p === "pente") {
    const A = m.tries[0]!;
    const B = m.tries[n(e) - 1]!;
    const extremes = (B.y - A.y) / (B.x - A.x);
    if (vaut(v[0] ?? "", arrondi(extremes, e.da)) && !egal(arrondi(extremes, e.da), arrondi(m.a, e.da))) return [tx("C'est la pente du premier et du dernier point : la droite de Mayer passe par "), lx("G_1"), tx(" et "), lx("G_2"), tx(".")];
    if (vaut(v[0] ?? "", arrondi(1 / m.a, e.da + 2)) || vaut(v[0] ?? "", arrondi(1 / m.a, e.da))) return [tx("Tu as divisé la différence des abscisses par celle des ordonnées : "), lx("a=\\dfrac{\\Delta y}{\\Delta x}"), tx(".")];
    if (vaut(v[0] ?? "", arrondi(-m.a, e.da))) return [tx("Le signe est faux : soustrais dans le même ordre en haut et en bas.")];
    return null;
  }
  if (p === "equation") {
    const d = lireDroiteAffine(v[0] ?? "");
    if (!d || d.a === null || d.b === null) return null;
    const aOk = Math.abs(d.a - m.a) <= 0.5 * 10 ** -e.da + 1e-9;
    const bArr = bAvecPenteArrondie(e);
    if (aOk && Math.abs(d.b - bArr) <= 0.005 + 1e-9 && Math.abs(d.b - m.b) > 0.005) return [tx("Ton b a été calculé avec la pente arrondie : l'erreur d'arrondi est multipliée par "), lx(`\\bar{x}_1=${nL(m.G1.x)}`), tx(". Garde la pente en mémoire (non arrondie) pour calculer b.")];
    if (Math.abs(d.a - m.b) < 0.01 && Math.abs(d.b - m.a) < 0.01) return [tx("Pente et ordonnée à l'origine sont échangées : dans "), lx("y=ax+b"), tx(", a multiplie x.")];
    if (aOk) return [tx("La pente est juste, mais ta droite ne passe pas par "), lx("G_1"), tx(" : recalcule b.")];
    return [tx("La pente de ta droite n'est pas celle de "), lx("G_1G_2"), tx(" (écran précédent).")];
  }
  if (p === "g") {
    if (vaut(v[0] ?? "", arrondi(e.G.y, DECIMALES_G)) && vaut(v[1] ?? "", arrondi(e.G.x, DECIMALES_G))) return [tx("Tu as échangé "), lx("\\bar{x}"), tx(" et "), lx("\\bar{y}"), tx(".")];
    const milieu = { x: (m.G1.x + m.G2.x) / 2, y: (m.G1.y + m.G2.y) / 2 };
    if (n(e) % 2 === 1 && vaut(v[0] ?? "", arrondi(milieu.x, DECIMALES_G)) && !egal(milieu.x, e.G.x)) return [tx("C'est le milieu de "), lx("[G_1G_2]"), tx(" : avec des groupes d'effectifs différents, G n'est pas ce milieu. Fais la moyenne de toutes les valeurs.")];
    return null;
  }
  const x0 = e.x0;
  if (vaut(v[0] ?? "", arrondi((x0 - m.b) / m.a, e.dp))) return [tx("Ici x est donné : on calcule "), lx("y=ax+b"), tx(" (sans isoler x).")];
  return null;
}
