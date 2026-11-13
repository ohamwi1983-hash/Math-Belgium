import type { ExerciceDeuxPositions, OptionReponse, Precision, TypeInfoPositions } from "../../core/texteTriangle.types";
import { resoudreDeuxPositions } from "../../moteur/modeleTexteTriangle";
import { choisir, entier, fr, frArrondi, melanger } from "./outils";

/**
 * « Deux positions possibles » (cas ambigu en contexte, famille validée par l'utilisateur). Un poste
 * R connaît la distance RB du mobile ; un poste P, à distance connue RP de R, voit le mobile dans une
 * direction qui fait un angle connu avec la direction de R (angle en P, NON compris entre RP et RB).
 * Toujours deux positions sur cette visée (RP · sin P < RB < RP) : l'élève calcule les deux angles
 * candidats en B, les deux distances PB, puis tranche grâce à une information de l'énoncé (distance
 * au poste P, ou angle vu depuis R). L'existence de deux positions fait partie de la situation : ce
 * n'est jamais un verdict à deviner.
 */

const KM_DIXIEME: Precision = { decimales: 1, texte: "au dixième de kilomètre près" };

interface ContexteDeuxPositions {
  noms: { R: string; P: string; B: string };
  libelles: { R: string; P: string; B: string };
  rp: [number, number];
  texte: (rp: string, angle: number, rb: string) => string;
  question: string;
  /** « Le bateau est à environ … du phare » */
  sujet: string;
  complement: string;
}

const CONTEXTES: ContexteDeuxPositions[] = [
  {
    noms: { R: "R", P: "P", B: "B" },
    libelles: { R: "le radar", P: "le phare", B: "le bateau" },
    rp: [12, 24],
    texte: (rp, angle, rb) =>
      `Un phare P et une station radar R se trouvent sur la côte, à ${rp} km l'un de l'autre. Le gardien du phare aperçoit un bateau B dans une direction qui fait un angle de ${angle}° avec la direction du radar. ` +
      `Le radar, lui, ne mesure que la distance du bateau : RB = ${rb} km. Avec ces seules données, le bateau peut se trouver à deux endroits de la visée du gardien.`,
    question: `À quelle distance du phare se trouve le bateau ? Donne la distance PB ${KM_DIXIEME.texte}.`,
    sujet: "Le bateau",
    complement: "du phare",
  },
  {
    noms: { R: "R", P: "P", B: "F" },
    libelles: { R: "la tour R", P: "la tour P", B: "la fumée" },
    rp: [8, 18],
    texte: (rp, angle, rb) =>
      `Deux tours de guet R et P surveillent une forêt ; elles sont distantes de ${rp} km. Depuis la tour P, une garde aperçoit une fumée F dans une direction qui fait un angle de ${angle}° avec la direction de la tour R. ` +
      `Depuis la tour R, un télémètre laser indique que la fumée est à ${rb} km. Avec ces seules données, la fumée peut se trouver à deux endroits de la visée de la garde.`,
    question: `À quelle distance de la tour P se trouve la fumée ? Donne la distance PF ${KM_DIXIEME.texte}.`,
    sujet: "La fumée",
    complement: "de la tour P",
  },
];

function informations(ctx: ContexteDeuxPositions, type: TypeInfoPositions, seuil: number): { texte: string; justification: string } {
  const { R, P, B } = ctx.noms;
  switch (type) {
    case "distanceMax":
      return { texte: `On sait de plus que ${ctx.libelles.B} se trouve à moins de ${seuil} km ${ctx.complement}.`, justification: `à moins de ${seuil} km ${ctx.complement}` };
    case "distanceMin":
      return { texte: `On sait de plus que ${ctx.libelles.B} se trouve à plus de ${seuil} km ${ctx.complement}.`, justification: `à plus de ${seuil} km ${ctx.complement}` };
    case "angleMin":
      return {
        texte: `On sait de plus que, depuis ${R}, l'angle entre la direction de ${P} et celle de ${B} est supérieur à ${seuil}°.`,
        justification: `pour laquelle l'angle en ${R} est supérieur à ${seuil}°`,
      };
    case "angleMax":
      return {
        texte: `On sait de plus que, depuis ${R}, l'angle entre la direction de ${P} et celle de ${B} est inférieur à ${seuil}°.`,
        justification: `pour laquelle l'angle en ${R} est inférieur à ${seuil}°`,
      };
  }
}

function optionsConfiguration(ctx: ContexteDeuxPositions): OptionReponse[] {
  const { R, P, B } = ctx.noms;
  return melanger([
    { texte: `On connaît ${R}${P}, ${R}${B} et l'angle en ${P}, qui n'est pas compris entre ces deux côtés ; on cherche ${P}${B}.`, correcte: true },
    { texte: `On connaît ${R}${P}, ${R}${B} et l'angle compris entre ces deux côtés ; on cherche ${P}${B}.`, correcte: false },
    { texte: `On connaît ${R}${P}, ${P}${B} et l'angle compris entre ces deux côtés ; on cherche ${R}${B}.`, correcte: false },
    { texte: `On connaît ${R}${P} et deux angles du triangle ; on cherche ${P}${B}.`, correcte: false },
  ]);
}

export function construireDeuxPositions(parAngle: boolean = Math.random() < 0.5): ExerciceDeuxPositions {
  const ctx = choisir(CONTEXTES);
  for (;;) {
    const RP = entier(ctx.rp[0], ctx.rp[1]);
    const angleP = entier(25, 45);
    const hauteur = RP * Math.sin((angleP * Math.PI) / 180);
    const RB = entier(Math.ceil((hauteur + 0.8) * 2), Math.floor((RP - 1) * 2)) / 2;
    if (!(RB > hauteur && RB < RP)) continue;
    const res = resoudreDeuxPositions(RP, RB, angleP);
    const [b1] = res.candidats;
    const [r1, r2] = res.anglesR;
    const [pb1, pb2] = res.distances;
    if (b1 > 76 || r2 < 10 || pb1 - pb2 < 3) continue;
    const plusGrand = Math.random() < 0.5;
    let type: TypeInfoPositions;
    let seuil: number;
    if (parAngle) {
      const candidatsSeuil = [] as number[];
      for (let y = 5 * Math.ceil((r2 + 3) / 5); y <= r1 - 3; y += 5) candidatsSeuil.push(y);
      if (candidatsSeuil.length === 0) continue;
      seuil = choisir(candidatsSeuil);
      type = plusGrand ? "angleMin" : "angleMax";
    } else {
      const bas = Math.ceil(pb2 + 0.6);
      const haut = Math.floor(pb1 - 0.6);
      if (haut < bas) continue;
      seuil = entier(bas, haut);
      type = plusGrand ? "distanceMin" : "distanceMax";
    }
    const retenue: 0 | 1 = type === "distanceMin" || type === "angleMin" ? 0 : 1;
    const info = informations(ctx, type, seuil);
    const autre: 0 | 1 = retenue === 0 ? 1 : 0;
    const d = (i: 0 | 1) => frArrondi(res.distances[i], 1);
    const options = melanger([
      { texte: `${ctx.sujet} est à environ ${d(retenue)} km ${ctx.complement} : c'est la seule des deux positions ${info.justification}.`, correcte: true },
      { texte: `${ctx.sujet} est à environ ${d(autre)} km ${ctx.complement} : c'est la seule des deux positions ${info.justification}.`, correcte: false },
      { texte: "Les deux positions restent possibles : l'énoncé ne permet pas de trancher.", correcte: false },
    ]);
    return {
      variante: "deuxPositions",
      contexte: `${ctx.texte(fr(RP), angleP, fr(RB))} ${info.texte}`,
      question: ctx.question,
      triangle: `${ctx.noms.R}${ctx.noms.P}${ctx.noms.B}`,
      points: [
        { nom: ctx.noms.R, x: 0, y: 0 },
        { nom: ctx.noms.P, x: RP, y: 0 },
      ],
      avecNord: false,
      unite: "km",
      precision: KM_DIXIEME,
      options,
      noms: ctx.noms,
      libelles: ctx.libelles,
      RP,
      RB,
      angleP,
      candidats: res.candidats,
      anglesR: res.anglesR,
      distances: res.distances,
      info: { type, seuil, texte: info.texte },
      retenue,
      optionsConfiguration: optionsConfiguration(ctx),
    };
  }
}
