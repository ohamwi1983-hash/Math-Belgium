import type { ExerciceIdC, ExerciceIdentificationConiques } from "../core6e/identificationConiques.types";
import type { Attente } from "./attentesCombinatoire";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { phasesPourExercice } from "./typesIdentificationConiques";
import type { PhaseIdentificationConiques } from "./typesIdentificationConiques";
import { polyAdd, polyConst, polyDroite, polyMul, polyScal, polySub, polyVar, ptNum, q, qNum } from "./algebreLieux";
import type { Poly } from "./algebreLieux";
import { asymptotes, c2Conique, foyersConique } from "./algebreConiques";
import type { Conique } from "./algebreConiques";
import { champEquation, champEquations, champNombre, champPoint, champPoints, MESSAGES_LIEUX } from "./saisieLieux";
import { champEquationForme, MESSAGES_CONIQUES } from "./saisieConiques";
import { polyGeneral } from "../ui6e/textesConiques";

/**
 * Attentes des écrans de `6gen58` (audit du 6e ch. 10, lots B et C) : équations comparées par
 * PROPORTIONNALITÉ exacte (le « − » typographique est lu, audit G2) ; complétion acceptée sous toute
 * forme « deux carrés », coefficients fractionnaires et forme réduite comprises (G10, G11) ; valeurs
 * exactes (racines simplifiées ou non) ; foyers, droites et asymptotes comme des ENSEMBLES.
 */

type E = ExerciceIdentificationConiques;
type P = PhaseIdentificationConiques;

export function polyEnonce(e: Exclude<E, ExerciceIdC>): Poly {
  if (e.famille === "A1") return polyGeneral(e.A, e.B, 0, 0, e.F);
  return polyGeneral(e.A, e.B, e.D, e.E, e.famille === "B" ? e.F : 0);
}

/** C : (v_isolée − k)² − m²(a₂v² + a₁v + a₀) = 0, multiplié par mDen². */
export function polyCarreC(e: ExerciceIdC): Poly {
  const vi = polySub(polyVar(e.variableIsolee), polyConst(q(e.k)));
  const vr = polyVar(e.variableRacine);
  const sous = polyAdd(polyAdd(polyScal(polyMul(vr, vr), q(e.a2)), polyScal(vr, q(e.a1))), polyConst(q(e.a0)));
  return polySub(polyScal(polyMul(vi, vi), q(e.mDen * e.mDen)), polyScal(sous, q(e.mNum * e.mNum)));
}

/** Code de la bonne réponse de l'écran « nature » de la famille C. */
export function codeNatureC(e: ExerciceIdC): string {
  return `${e.nature}${e.signeRacine > 0 ? "Plus" : "Moins"}`;
}

const nb = (x: number): Attente => ({ verif: champNombre(x) });
const racine = (r: { n: bigint; d: bigint }) => Math.sqrt(qNum(r));

function attentesElements(c: Conique, avecCentre: boolean): Attente[] {
  if (c.type !== "ellipse" && c.type !== "hyperbole") return [];
  const r: Attente[] = avecCentre ? [{ verif: champPoint(ptNum(c.centre)) }] : [];
  return [...r, nb(racine(c.a2)), nb(racine(c.b2)), nb(racine(c2Conique(c)))];
}

function attentesFoyers(c: Conique): Attente[] {
  const foyers: Attente = { verif: champPoints(foyersConique(c).map((F) => ({ x: F.x, y: F.y }))) };
  if (c.type === "hyperbole") return [foyers, { verif: champEquations(asymptotes(c).map(polyDroite), { droite: true }) }];
  return [foyers];
}

/** Équation sans racine : un « √ » saisi reçoit le message propre à la famille C. */
function champSansRacine(attendu: Poly) {
  const base = champEquation(attendu);
  return { ...base, refus: (v: string) => {
    const m = base.refus(v);
    return m === MESSAGES_LIEUX.racine ? MESSAGES_CONIQUES.formeSansRacine : m;
  } };
}

export function attentesIdentificationConiques(e: E, p: P): Attente[] {
  switch (p) {
    case "a1Nature":
    case "bNature":
      return [{ choix: e.nature }];
    case "a2Nature":
      return [{ choix: e.famille === "A2" && e.orientation ? e.orientation : "droitesParalleles" }];
    case "cNature":
      return [{ choix: codeNatureC(e as ExerciceIdC) }];
    case "a1Rayon":
      return e.conique?.type === "cercle" ? [nb(racine(e.conique.r2))] : [];
    case "bCentreRayon":
      return e.conique?.type === "cercle" ? [{ verif: champPoint(ptNum(e.conique.centre)) }, nb(racine(e.conique.r2))] : [];
    case "a1Point":
    case "bPoint":
      return [{ verif: champPoint(ptNum(e.point!)) }];
    case "a1Droites":
    case "bDroites":
    case "a2Droites":
      return [{ verif: champEquations(e.droites.map(polyDroite), { droite: true }) }];
    case "a1DemiAxes":
      return attentesElements(e.conique!, false);
    case "bCentreDemiAxes":
      return attentesElements(e.conique!, true);
    case "a1Foyers":
    case "bFoyers":
      return attentesFoyers(e.conique!);
    case "a2P":
      return e.conique?.type === "parabole" ? [nb(qNum(e.conique.p))] : [];
    case "a2FoyerDirectrice": {
      const c = e.conique!;
      if (c.type !== "parabole") return [];
      const F = foyersConique(c)[0];
      const dir = c.axe === "x" ? polyAdd(polyVar("x"), polyConst(q(Math.round((c.sens * qNum(c.p) / 2) * 2), 2))) : polyAdd(polyVar("y"), polyConst(q(Math.round((c.sens * qNum(c.p) / 2) * 2), 2)));
      return [{ verif: champPoint({ x: F.x, y: F.y }) }, { verif: champEquation(dir, { droite: true }) }];
    }
    case "bForme": {
      const b = e as Extract<E, { famille: "B" }>;
      return [{ verif: champEquationForme(polyEnonce(b), "deuxCarres", `${b.A}*(x-(${qNum(b.centre.x)}))^2+(${b.B})*(y-(${qNum(b.centre.y)}))^2=${b.M}`) }];
    }
    case "cCarre":
      return [{ verif: champSansRacine(polyCarreC(e as ExerciceIdC)) }];
    case "cForme": {
      const c = e as ExerciceIdC;
      const ci = (c.nature === "ellipse" ? 1 : -1) * c.mDen * c.mDen;
      return [{ verif: champEquationForme(polyCarreC(c), "deuxCarres", `${c.mNum * c.mNum}*(${c.variableRacine}-(${c.h}))^2+(${ci})*(${c.variableIsolee}-(${c.k}))^2=${c.mNum * c.mNum * c.r * c.r}`) }];
    }
    case "cElements": {
      const c = e.conique!;
      if (c.type !== "ellipse" && c.type !== "hyperbole") return [];
      return [{ verif: champPoint(ptNum(c.centre)) }, nb(racine(c.a2)), nb(racine(c.b2))];
    }
  }
}

const CHOIX: P[] = ["a1Nature", "a2Nature", "bNature", "cNature"];

export const DEFINITION_6GEN58: DefinitionSession<E, P> = {
  phases: phasesPourExercice,
  diagnostiquer: (e, p, v) => diagnostiquerAttentes(attentesIdentificationConiques(e, p), v),
  estChoix: (_e, p) => CHOIX.includes(p),
};
