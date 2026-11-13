import type {
  ConditionPortrait,
  EnsemblePortrait,
  FonctionTransformee,
  SensVariation,
} from "../core/portraitRobotFonction.types";
import type { FamilleReference } from "../core/fonctionsReference.types";

/**
 * Modèle mathématique de « Le portrait-robot d'une fonction » (gen71) : une fonction de référence
 * transformée f(x) = a·g(x − h) + k, ses caractéristiques EXACTES (domaine, ensemble image,
 * asymptote, extremum, centre de symétrie, parité, sens de variation sur un intervalle) et le
 * prédicat `respecte(condition, f)`. Ce prédicat est l'unique source de vérité : le générateur
 * s'en sert pour garantir l'unicité (famille A) et « exactement une condition violée » par courbe
 * écartée (famille C), les tests massifs aussi, l'écran et le papier n'en recalculent jamais une
 * seconde version.
 */

const EPS = 1e-9;

export function referenceEn(famille: FamilleReference, u: number): number | null {
  switch (famille) {
    case "carre":
      return u * u;
    case "cube":
      return u * u * u;
    case "racine_carree":
      return u < -EPS ? null : Math.sqrt(Math.max(0, u));
    case "racine_cubique":
      return Math.cbrt(u);
    case "inverse":
      return Math.abs(u) < EPS ? null : 1 / u;
    case "valeur_absolue":
      return Math.abs(u);
  }
}

export function evaluerFonction(f: FonctionTransformee, x: number): number | null {
  const g = referenceEn(f.famille, x - f.h);
  return g === null ? null : f.a * g + f.k;
}

export function domaineFonction(f: FonctionTransformee): EnsemblePortrait {
  if (f.famille === "racine_carree") return { type: "demi", borne: f.h, vers: "plus" };
  if (f.famille === "inverse") return { type: "Rprive", valeur: f.h };
  return { type: "R" };
}

export function imageFonction(f: FonctionTransformee): EnsemblePortrait {
  switch (f.famille) {
    case "carre":
    case "valeur_absolue":
    case "racine_carree":
      return { type: "demi", borne: f.k, vers: f.a > 0 ? "plus" : "moins" };
    case "cube":
    case "racine_cubique":
      return { type: "R" };
    case "inverse":
      return { type: "Rprive", valeur: f.k };
  }
}

export function ensemblesEgaux(e1: EnsemblePortrait, e2: EnsemblePortrait): boolean {
  if (e1.type !== e2.type) return false;
  if (e1.type === "Rprive" && e2.type === "Rprive") return Math.abs(e1.valeur - e2.valeur) < EPS;
  if (e1.type === "demi" && e2.type === "demi") return e1.vers === e2.vers && Math.abs(e1.borne - e2.borne) < EPS;
  return true;
}

/** Asymptote horizontale : seulement pour la famille inverse (y = k). */
export function asymptoteHorizontale(f: FonctionTransformee): number | null {
  return f.famille === "inverse" ? f.k : null;
}

export function extremumFonction(f: FonctionTransformee): { nature: "minimum" | "maximum"; valeur: number; en: number } | null {
  if (f.famille === "carre" || f.famille === "valeur_absolue" || f.famille === "racine_carree") {
    return { nature: f.a > 0 ? "minimum" : "maximum", valeur: f.k, en: f.h };
  }
  return null;
}

/** Centre de symétrie du graphique : (h ; k) pour les familles impaires (cube, racine cubique, inverse). */
export function centreSymetrie(f: FonctionTransformee): { x: number; y: number } | null {
  if (f.famille === "cube" || f.famille === "racine_cubique" || f.famille === "inverse") return { x: f.h, y: f.k };
  return null;
}

export function pariteFonction(f: FonctionTransformee): "paire" | "impaire" | null {
  if ((f.famille === "carre" || f.famille === "valeur_absolue") && Math.abs(f.h) < EPS) return "paire";
  const c = centreSymetrie(f);
  if (c && Math.abs(c.x) < EPS && Math.abs(c.y) < EPS) return "impaire";
  return null;
}

/** Sens de variation STRICT de f sur [u ; v] (f définie sur tout l'intervalle), sinon `null`. */
export function sensSur(f: FonctionTransformee, u: number, v: number): SensVariation | null {
  let sensReference: SensVariation | null;
  switch (f.famille) {
    case "carre":
    case "valeur_absolue":
      sensReference = v <= f.h + EPS ? "decroissante" : u >= f.h - EPS ? "croissante" : null;
      break;
    case "cube":
    case "racine_cubique":
      sensReference = "croissante";
      break;
    case "racine_carree":
      sensReference = u >= f.h - EPS ? "croissante" : null;
      break;
    case "inverse":
      sensReference = f.h < u - EPS || f.h > v + EPS ? "decroissante" : null;
      break;
  }
  if (sensReference === null) return null;
  if (f.a > 0) return sensReference;
  return sensReference === "croissante" ? "decroissante" : "croissante";
}

export function respecte(condition: ConditionPortrait, f: FonctionTransformee): boolean {
  switch (condition.type) {
    case "domaine":
      return ensemblesEgaux(domaineFonction(f), condition.ensemble);
    case "image":
      return ensemblesEgaux(imageFonction(f), condition.ensemble);
    case "asymptoteH": {
      const k = asymptoteHorizontale(f);
      return k !== null && Math.abs(k - condition.k) < EPS;
    }
    case "point": {
      const y = evaluerFonction(f, condition.x);
      return y !== null && Math.abs(y - condition.y) < 1e-7;
    }
    case "extremum": {
      const e = extremumFonction(f);
      if (!e || e.nature !== condition.nature || Math.abs(e.valeur - condition.valeur) > EPS) return false;
      return condition.en === null || Math.abs(e.en - condition.en) < EPS;
    }
    case "centre": {
      const c = centreSymetrie(f);
      return c !== null && Math.abs(c.x - condition.x) < EPS && Math.abs(c.y - condition.y) < EPS;
    }
    case "parite":
      return pariteFonction(f) === condition.parite;
    case "monotonie":
      return sensSur(f, condition.u, condition.v) === condition.sens;
  }
}

export function egalesFonctions(f1: FonctionTransformee, f2: FonctionTransformee): boolean {
  return f1.famille === f2.famille && Math.abs(f1.a - f2.a) < EPS && Math.abs(f1.h - f2.h) < EPS && Math.abs(f1.k - f2.k) < EPS;
}
