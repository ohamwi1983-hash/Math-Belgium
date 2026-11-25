import type { ExerciceLieuxGeometriquesParametres, PhaseLieuxGeometriquesParametres } from "../core6e/lieuxGeometriquesParametres.types";
import { latexDroite, latexQ, lireEquation, lireNombre, lirePoint, polyDroite, proportionnels, qNum } from "../moteur6e/algebreLieux";
import { f } from "./fragmentsCombinatoire";
import type { ChampCombi, FormatCombinatoire } from "./fragmentsCombinatoire";
import { champEquationUI, champListeDroitesUI, champListePointsUI, champNombreUI, champPointUI, lp } from "./textesLieux";
import { figureLieux } from "./figureLieux";
import type { ObjetsLieux } from "./figureLieux";

/**
 * Textes de `6gen56` (6e ch. 9, § 4 et § 6 ; audit, lots B et C). Les textes propres au sous-type
 * (données, consignes, aides, explications) sont écrits par le générateur avec les vrais nombres
 * (plus de « X−P≥0,\ Y−Q≥0 », de « CONSTANTE C (X^EXPOSANTX…) », de « k=9/1 ») ; ce format les
 * distribue par écran. Options des choix fermés : la même liste pour toutes les instances d'une
 * famille, sans justification qui désigne la bonne.
 */

type E = ExerciceLieuxGeometriquesParametres;
type P = PhaseLieuxGeometriquesParametres;

const LIBELLES: Record<P, string> = {
  nature: "Nature du lieu",
  droites: "Droites",
  sommets: "Sommets",
  equation: "Équation du lieu",
  centreR: "Centre et second membre",
  restriction: "Partie décrite",
};

function etiquetteChoix(options: { valeur: string; label: string }[] | undefined, valeur: string | undefined): string {
  const o = options?.find((x) => x.valeur === valeur);
  if (!o) return "";
  return o.label
    .split("$")
    .map((m, i) => (i % 2 ? m : m === "" ? "" : `\\text{${m}}`))
    .join("");
}

export const FORMAT_6GEN56: FormatCombinatoire<E, P> = {
  consigneGenerale: (e) => f(e.consigne),
  donnees: (e) => e.donnees.map((l) => f(l)),
  consigneEcran: (e, p) => f(e.consignes[p] ?? ""),
  champs(e, p): ChampCombi[] {
    switch (p) {
      case "nature":
        return [{ type: "choix", label: "", options: e.natures ?? [] }];
      case "restriction":
        return [{ type: "choix", label: "", options: e.restrictions ?? [] }];
      case "droites":
        return [champListeDroitesUI("Droites")];
      case "sommets":
        return [champListePointsUI("Points")];
      case "equation":
        return [champEquationUI("Équation")];
      case "centreR":
        return [champPointUI("$\\Omega$"), champNombreUI("$R$")];
    }
  },
  aides: (e, p) => e.aides[p] ?? [],
  reponseAttendue(e, p) {
    switch (p) {
      case "nature":
        return [etiquetteChoix(e.natures, e.nature)];
      case "restriction":
        return [etiquetteChoix(e.restrictions, e.restriction)];
      case "droites":
        return (e.droites ?? []).map(latexDroite);
      case "sommets":
        return (e.sommets ?? []).map(lp);
      case "equation":
        return [e.equationLatex ?? ""];
      case "centreR":
        return [`\\Omega${lp(e.centre!)}`, `R=${latexQ(e.R!)}`];
    }
  },
  explication: (e, p) => (e.explications[p] ?? []).map((l) => f(l)),
  libellePhase: (_e, p) => LIBELLES[p],
  messageCible(e, p, valeurs) {
    const lignes = (valeurs[0] ?? "").split("\n").filter((l) => l.trim());
    if (p === "droites" && e.droites && lignes.length === 1 && e.droites.length === 2) {
      try {
        const lue = lireEquation(lignes[0], ["x", "y"]).poly;
        if (e.droites.some((d) => proportionnels(lue, polyDroite(d)))) return f(e.sousType === "B_bissectrices" ? "Celle-ci est juste, mais il en manque une : $|u|=|v|$ donne $u=v$ ou $u=-v$." : "Celle-ci est juste, mais il en manque une : la valeur absolue donne deux cas.");
      } catch {
        return null;
      }
    }
    if (p === "sommets" && e.sommets && e.sousType === "A_losange" && lignes.length === 4) {
      try {
        const p0 = lirePoint(lignes[0]);
        const k = (qNum(e.sommets[0].x) - qNum(e.sommets[2].x)) / 2;
        const cx = qNum(e.sommets[1].x);
        const cy = qNum(e.sommets[0].y);
        if (Math.abs(Math.abs(p0.x.valeur - cx) - k) < 1e-9 && Math.abs(Math.abs(p0.y.valeur - cy) - k) < 1e-9) return f("Ce sont les sommets d'un carré aux côtés parallèles aux axes : ici les sommets sont là où l'une des deux valeurs absolues s'annule.");
      } catch {
        return null;
      }
    }
    if (p === "centreR" && e.centre && e.R) {
      try {
        const R = lireNombre(valeurs[1]).valeur;
        const vraiR = qNum(e.R);
        if (vraiR > 0 && Math.abs(R - Math.sqrt(vraiR)) < 1e-9 && Math.abs(R - vraiR) > 1e-9) return f("On demande $R$, le second membre (le carré du rayon), pas le rayon.");
        const c = lirePoint(valeurs[0]);
        if (Math.abs(c.x.valeur + qNum(e.centre.x)) < 1e-9 && Math.abs(c.y.valeur + qNum(e.centre.y)) < 1e-9 && (qNum(e.centre.x) !== 0 || qNum(e.centre.y) !== 0)) return f("Attention aux signes : dans $(x-x_0)^2$, on soustrait l'abscisse du centre.");
      } catch {
        return null;
      }
    }
    return null;
  },
};

/** Figure : configuration, puis le lieu quand le DERNIER écran est clos (il trahirait la réponse). */
export function figure6gen56(e: E, closes: readonly P[]): string {
  const fini = e.phases.every((p) => closes.includes(p));
  const c = e.configuration;
  const l = fini ? e.lieu : {};
  const o: ObjetsLieux = {
    points: [...(l.points ?? []), ...(c.points ?? [])],
    droites: [...(c.droites ?? []), ...(l.droites ?? [])],
    segments: [...(c.segments ?? []), ...(l.segments ?? [])],
    polygones: [...(c.polygones ?? []), ...(l.polygones ?? [])],
    cercles: [...(l.cercles ?? [])],
    courbes: [...(l.courbes ?? [])],
    demiDroites: [...(l.demiDroites ?? [])],
    bandes: [...(l.bandes ?? [])],
    // Fenêtre : celle de la configuration tant que le lieu est caché (sa taille ne doit rien trahir).
    inclure: [...(c.inclure ?? []), ...(l.inclure ?? []), ...(l.polygones ?? []).flatMap((pg) => pg.pts), ...(l.points ?? []).map((p) => p.p), ...(l.cercles ?? []).flatMap((ce) => [{ x: ce.c.x - ce.r, y: ce.c.y - ce.r }, { x: ce.c.x + ce.r, y: ce.c.y + ce.r }])],
    fenetre: e.lieu.fenetre,
  };
  return figureLieux(o);
}

