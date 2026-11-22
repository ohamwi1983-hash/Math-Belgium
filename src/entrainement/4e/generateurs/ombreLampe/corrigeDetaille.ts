import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceOmbreLampe, ExerciceOmbreLampeCube, SommetBoite } from "../../core/ombreLampe.types";
import { texteConclusion } from "../../ui/formatOmbreLampe";
import { figureCorrigee } from "./figure";
import { COURS_DEUX_PLANS, COURS_OMBRE, COURS_PLAN, finaliserEspace2, nomL } from "../../ui/corrigeEspace2";

/**
 * Corrigé détaillé « comme au tableau » de gen106 « Ombre à la lampe : projection centrale » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN ; chaque point construit est à
 * l'intersection de deux droites : le rayon issu de la lampe L (qui passe par le sommet), et la trace
 * au sol du plan vertical qui contient l'objet et le mât (droite qui joint le pied L₀ au pied de
 * l'objet) — ou, sur un mur vertical, la verticale du pied du mur. Les pieds des poteaux, qui ne sont
 * pas nommés sur la figure, sont notés A₀, B₀, E₀. Figure de la construction complète en `figureHtml`
 * (passée par l'adaptateur, qui la dessine).
 */

type E = ExerciceOmbreLampe;

const pied = (id: string) => `${id}_0`;

const UTILISE_TRACE = `Les rayons d'une lampe partent tous de la lampe L : ils ne sont pas parallèles ${COURS_OMBRE}. Un objet vertical et le mât vertical de la lampe sont parallèles : ils déterminent un plan vertical ${COURS_PLAN}, qui contient le rayon passant par le sommet de l'objet ; sur le sol, ce plan laisse la droite qui joint le pied L₀ de la lampe au pied de l'objet.`;
const UTILISE_RAYON = `L'ombre d'un point est sur le rayon issu de L qui passe par ce point ${COURS_OMBRE} ; sur le sol, elle est aussi sur la trace qui part de L₀ et passe par le pied de l'objet : elle est à l'intersection de ces deux droites.`;

/** Plan vertical de l'objet et du mât, puis sa trace au sol (raisonnement de l'étape « demi-droite »). */
function lignesTrace(id: string, sommet: string, piedNom: string): LigneCalcul[] {
  return [
    ligne(`(${sommet}${piedNom})\\parallel(LL_0)`, "objet vertical et mât vertical : parallèles"),
    ligne(`(L${sommet})\\subset(LL_0${piedNom})`, `le rayon qui passe par le sommet ${id} reste dans ce plan vertical`),
    ligne(`(LL_0${piedNom})\\cap\\text{sol}=(L_0${piedNom})`, "trace au sol du plan vertical"),
  ];
}

/** Point d'ombre d'un sommet : rayon issu de L, trace au sol, intersection. */
function lignesOmbre(id: string, sommet: string, piedNom: string): LigneCalcul[] {
  const o = `${nomL(id)}'`;
  return [
    ligne(`${o}\\in(L${sommet})`, "rayon issu de la lampe"),
    ligne(`${o}\\in(L_0${piedNom})`, "trace au sol du plan vertical"),
    ligne(`\\{${o}\\}=(L${sommet})\\cap(L_0${piedNom})`, "intersection des deux droites"),
  ];
}

function etapesPoteau(e: Extract<E, { variante: "poteau" }>, figure: string): EtapeCorrection[] {
  const a = e.poteau.id;
  const x = e.exemple.id;
  return [
    utilise("a", [texte(UTILISE_TRACE)]),
    calcul("a", lignesTrace(a, a, pied(a)), [texte(`On note ${a}₀ le pied du poteau ${a} et ${x}₀ celui du poteau ${x}.`)]),
    resultat("a", [texte(`L'ombre du poteau ${a} est sur la demi-droite du sol issue de ${a}₀, portée par la droite (L₀${a}₀), du côté opposé à L₀.`)]),
    verification("a", [texte(`L'ombre donnée de ${x} suit la même règle :`)], [ligne(`${x}'\\in(L_0${pied(x)})`, `l'ombre de ${x} est portée par la droite qui joint L₀ à son pied`)]),
    piege("a", [texte(`Tracer l'ombre de ${a} parallèle à celle de ${x}, comme au soleil : avec une lampe, les ombres ne sont pas parallèles, leurs droites se coupent au pied L₀ de la lampe.`)]),
    utilise("b", [texte(UTILISE_RAYON)]),
    calcul("b", [...lignesOmbre(a, a, pied(a)), ligne(`\\text{ombre du poteau}=[${pied(a)}${a}']`, "du pied du poteau à l'ombre de son sommet")]),
    { ...resultat("b", [texte(texteConclusion(e))]), figureHtml: figure },
  ];
}

function nomSommetL(s: SommetBoite): [string, string] {
  return [nomL(s.id), nomL(s.idPied)];
}

function etapesCube(e: ExerciceOmbreLampeCube, figure: string): EtapeCorrection[] {
  const [s1, s2] = e.projetes;
  const [h1, p1] = nomSommetL(s1);
  const [h2, p2] = nomSommetL(s2);
  const nom = e.estCube ? "cube" : "pavé";
  const autres: LigneCalcul[] = e.autres.map((s) => {
    const [h, p] = nomSommetL(s);
    return ligne(`\\{${h}'\\}=(L${h})\\cap(L_0${p})`, "même construction");
  });
  return [
    utilise("a", [texte(`${UTILISE_RAYON} Le pied d'un sommet du haut est le sommet du bas situé juste en dessous.`)]),
    calcul("a", [ligne(`(${h1}${p1})\\parallel(LL_0)`, "arête verticale et mât : un même plan vertical"), ...lignesOmbre(s1.id, h1, p1)]),
    resultat("a", [texte(`${s1.id}′ est le point de rencontre du rayon (L${s1.id}) et de la trace au sol (L₀${s1.idPied}).`)]),
    piege("a", [texte(`Faire passer la trace au sol par le pied d'un autre sommet : la trace part de L₀ et passe par ${s1.idPied}, le sommet juste en dessous de ${s1.id}.`)]),
    utilise("b", [texte(`Même construction pour ${s2.id} ; puis les ombres des autres sommets du haut, et le contour extérieur de l'ombre du ${nom} (base et ombres reliées).`)]),
    calcul("b", [ligne(`(${h2}${p2})\\parallel(LL_0)`, "arête verticale et mât : un même plan vertical"), ...lignesOmbre(s2.id, h2, p2)]),
    ...(autres.length ? [calcul("b", autres, [], "Autres sommets")] : []),
    { ...resultat("b", [texte(`${s2.id}′ est le point de rencontre du rayon (L${s2.id}) et de la trace au sol (L₀${s2.idPied}). ${texteConclusion(e)}`)]), figureHtml: figure },
    piege("b", [texte(`Tracer le rayon issu de ${s2.id} parallèle à celui de ${s1.id}, comme au soleil : tous les rayons partent de L.`)]),
  ];
}

function etapesMur(e: Extract<E, { variante: "mur" }>, figure: string): EtapeCorrection[] {
  const a = e.poteau.id;
  const p = pied(a);
  return [
    utilise("a", [texte(UTILISE_TRACE)]),
    calcul("a", [...lignesTrace(a, a, p), ligne(`M\\in(L_0${p})`, "l'ombre au sol suit cette trace"), ligne(`\\{M\\}=(L_0${p})\\cap\\text{pied du mur}`, "elle s'arrête au pied du mur")], [texte(`On note ${a}₀ le pied du poteau ${a}.`)]),
    resultat("a", [texte(`M est le point où la droite (L₀${a}₀), prolongée au-delà de ${a}₀, rencontre le pied du mur ; sur le sol, l'ombre va de ${a}₀ à M.`)]),
    piege("a", [texte("Tracer l'ombre droit vers le mur (perpendiculaire au mur) : elle suit la droite qui part de L₀ et passe par le pied du poteau.")]),
    utilise("b", [texte(`Deux plans sécants se coupent suivant une droite ${COURS_DEUX_PLANS} ; deux plans verticaux, suivant une verticale : le plan du poteau et du mât coupe le mur suivant la verticale de M. L'ombre du sommet est sur cette verticale ET sur le rayon issu de L ${COURS_OMBRE}.`)]),
    calcul("b", [
      ligne(`(LL_0${p})\\cap\\text{mur}=\\text{verticale de }M`, "intersection de deux plans verticaux"),
      ligne(`${a}'\\in\\text{verticale de }M`, "sur le mur, l'ombre monte verticalement"),
      ligne(`${a}'\\in(L${a})`, "rayon issu de la lampe"),
      ligne(`\\{${a}'\\}=(L${a})\\cap\\text{verticale de }M`, "intersection des deux droites"),
    ]),
    { ...resultat("b", [texte(texteConclusion(e))]), figureHtml: figure },
    piege("b", [texte("Continuer l'ombre sur le sol au-delà du mur, ou la faire monter en biais : sur le mur, l'ombre monte verticalement à partir de M et s'arrête sur le rayon issu de L.")]),
  ];
}

function etapesLampe(e: Extract<E, { variante: "lampe" }>, figure: string): EtapeCorrection[] {
  const [a, b] = e.poteaux.map((x) => x.id) as [string, string];
  return [
    utilise("a", [texte(`${UTILISE_TRACE} Le pied L₀ de la lampe est donc sur le prolongement de chaque ombre, au-delà du pied de son poteau.`)]),
    calcul(
      "a",
      [
        ligne(`L_0\\in(${a}'${pied(a)})`, `ombre de ${a} prolongée au-delà de son pied`),
        ligne(`L_0\\in(${b}'${pied(b)})`, `ombre de ${b} prolongée au-delà de son pied`),
        ligne(`\\{L_0\\}=(${a}'${pied(a)})\\cap(${b}'${pied(b)})`, "intersection des deux droites"),
      ],
      [texte(`On note ${a}₀ et ${b}₀ les pieds des poteaux ${a} et ${b}.`)],
    ),
    resultat("a", [texte(`L₀ est le point de rencontre des prolongements des deux ombres, au-delà des pieds des poteaux.`)]),
    piege("a", [texte("Prolonger les ombres dans le mauvais sens (au-delà de A′ et B′), ou confondre le pied de la lampe (sur le sol) avec la lampe elle-même.")]),
    utilise("b", [texte(`Chaque rayon part de la lampe, passe par le sommet d'un poteau et arrive à l'ombre de ce sommet ${COURS_OMBRE} : la lampe est sur chacune de ces droites.`)]),
    calcul("b", [
      ligne(`L\\in(${a}'${a})`, `rayon qui passe par le sommet ${a}`),
      ligne(`L\\in(${b}'${b})`, `rayon qui passe par le sommet ${b}`),
      ligne(`\\{L\\}=(${a}'${a})\\cap(${b}'${b})`, "intersection des deux rayons prolongés"),
    ]),
    { ...resultat("b", [texte(texteConclusion(e))]), figureHtml: figure },
    verification("b", [texte("La lampe est bien au sommet du mât :")], [ligne("L\\in\\text{verticale de }L_0", "L à la verticale de son pied")]),
  ];
}

export function correctionDetailleeOmbreLampe(e: E, figure: string = figureCorrigee(e)): EtapeCorrection[] {
  const etapes =
    e.variante === "poteau" ? etapesPoteau(e, figure) : e.variante === "cube" ? etapesCube(e, figure) : e.variante === "mur" ? etapesMur(e, figure) : etapesLampe(e, figure);
  return finaliserEspace2(etapes.map((x) => (x.figureHtml === "" ? { ...x, figureHtml: undefined } : x)));
}
