import type { ExerciceLireNuage } from "../core5e/lireNuage";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseLireNuage } from "../ui5e/formatLireNuage";
import { bonneOption, indiceNuage } from "../ui5e/formatLireNuage";

/**
 * Vérification de `5gen76` : tous les écrans sont des choix fermés (UNE tentative, jugés ✗ / ✓). Message
 * ciblé (affiché avec la réponse révélée) sur l'erreur du cours que trahit le choix : droite forcée dans un
 * arc, exponentielle prise pour une droite, tendance vue dans un nuage sans forme, intensité surestimée ou
 * sous-estimée, signe de r contraire au sens du nuage. Jamais sur une réponse juste.
 */

type E = ExerciceLireNuage;

export function diagnostiquer(e: E, p: PhaseLireNuage, valeurs: string[]): StatutVerification[] {
  return [valeurs[0] === bonneOption(e, p) ? "correct" : "not_equivalent"];
}

const RANG = { faible: 1, moyenne: 2, forte: 3, nulle: 0 } as const;

export function piege(e: E, p: PhaseLireNuage, valeurs: string[]): Frag[] | null {
  const v = valeurs[0] ?? "";
  if (v === bonneOption(e, p)) return null;
  if (p === "forme") {
    if (e.forme === "arc" && v === "affine") return [tx("Une droite ne peut pas suivre un nuage qui monte puis redescend (ou l'inverse) : forcer une droite dans un arc est le piège classique.")];
    if (e.forme === "decolle" && v === "affine") return [tx("Le nuage monte de plus en plus vite : la pente de la fin est bien plus grande que celle du début, ce n'est pas une droite.")];
    if (e.forme === "aucune") return [tx("Les points sont dispersés sans aucune allure régulière : on ne peut ajuster aucune courbe.")];
    if (e.forme === "affine" && v !== "aucune") return [tx("Les points restent proches d'un même trait droit, d'un bout à l'autre du nuage.")];
    if (v === "aucune") return [tx("Les points suivent une allure régulière : il y a bien une relation entre x et y.")];
    if (e.forme === "arc") return [tx("Le nuage monte puis redescend (ou l'inverse) : une exponentielle ne change jamais de sens de variation.")];
    if (e.forme === "decolle") return [tx("Le nuage ne redescend pas : il monte de plus en plus vite, c'est l'allure d'une exponentielle.")];
    return [tx("Regarde l'allure générale du nuage, d'un bout à l'autre.")];
  }
  if (p === "sens") {
    if (e.sens === "montePuisDescend") return [tx("Regarde le nuage en entier : il change de sens en son milieu.")];
    if (e.sens === "aucun") return [tx("Sans forme, le nuage n'a aucune tendance.")];
    return [tx(`Parcours le nuage de gauche à droite : dans l'ensemble, il ${e.sens === "croissant" ? "monte" : "descend"}.`)];
  }
  if (p === "sensCorr") return [tx("Le nuage " + (e.positif ? "monte" : "descend") + " de gauche à droite : la corrélation est " + (e.positif ? "positive." : "négative."))];
  if (p === "intensite") {
    const choisi = RANG[v as keyof typeof RANG];
    const juste = RANG[e.intensite!];
    if (choisi === undefined) return null;
    return choisi > juste ? [tx("Tu surestimes l'intensité : les points s'écartent nettement de la droite.")] : [tx("Tu sous-estimes l'intensité : les points restent assez proches d'une droite.")];
  }
  const i = indiceNuage(p);
  const r = e.valeursR![e.bonnes![i]!]!;
  const k = Number(v.slice(1));
  const choisi = e.valeursR![k];
  if (choisi === undefined) return null;
  if (Math.sign(choisi) !== Math.sign(r) && Math.abs(r) > 0.2) return [tx(`Le nuage ${i + 1} ${r > 0 ? "monte" : "descend"} : son coefficient est ${r > 0 ? "positif" : "négatif"}.`)];
  return Math.abs(choisi) > Math.abs(r) ? [tx(`Le sens est juste, mais le nuage ${i + 1} est plus dispersé : `), lx("|r|"), tx(" est plus petit.")] : [tx(`Le sens est juste, mais le nuage ${i + 1} est plus serré autour d'une droite : `), lx("|r|"), tx(" est plus grand.")];
}
