import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceIntersectionParallele } from "../../core/intersectionParallele.types";
import { figureCorrige } from "../../ui/figureEspaceLotH";
import { droite, face, figureIP, plan, seg } from "../../ui/formatIntersectionParallele";

/**
 * Corrigé détaillé « comme au tableau » de gen134 (partagé par l'adaptateur et l'appli, une lettre
 * par écran). Chaque ligne « Calcul » est une relation d'appartenance ou de parallélisme en KaTeX,
 * justifiée en texte ; aucun calcul chiffré. Figure de la construction sous le résultat final.
 */

type E = ExerciceIntersectionParallele;
const T = texte;
/** Nom de point pour KaTeX (K′ → K'). */
const k = (s: string) => s.replace(/′/g, "'");
const dL = (d: [string, string]) => `(${k(d[0])}${k(d[1])})`;
const pL = (p: readonly string[]) => `(${p.map(k).join("")})`;

function etapesFaces(e: E): EtapeCorrection[] {
  const f = e.faces!;
  const F0 = face(e.face0);
  const F1 = face(e.face1);
  const R = e.points[2]!;
  const L = f.pointLeurre;
  return [
    utilise("a", [T("Un point de l'intersection d'un plan et d'une face appartient à la fois au plan et à la face (cours, point 5).")]),
    calcul("a", [ligne("R\\in(PQR)", "R est un des points qui nomment le plan"), ligne(`R\\in[${R.arete.join("")}]`, `R est sur une arête de la face ${F1}`)]),
    resultat("a", [T(`L'intersection du plan (PQR) et de la face ${F1} passe par R.`)]),
    piege("a", [T(`P et Q sont dans le plan (PQR), mais pas dans la face ${F1} : ils sont sur la face ${F0}.`)]),

    utilise("b", [T("Propriété 1 (cours, point 5) : si un plan coupe deux plans parallèles, les deux droites d'intersection sont parallèles.")]),
    calcul("b", [
      ligne(`(${F0})\\parallel(${F1})`, `faces opposées ${e.genre === "cube" ? "du cube" : "du pavé"}`),
      ligne(`(PQR)\\cap(${F0})=(PQ)`, `P et Q sont dans le plan (PQR) et dans la face ${F0}`),
      ligne(`(PQR)\\cap(${F1})\\parallel(PQ)`, "propriété 1"),
    ]),
    resultat("b", [T(`Dans la face ${F1}, on trace la parallèle à (PQ) menée par R.`)]),
    piege("b", [T(`La droite (R${L}) est dans le plan (PQR), mais elle traverse le solide : ce n'est pas un côté de la section.`)]),

    utilise("c", [T(`La section ne sort pas de la face ${F1} : la parallèle s'arrête sur une arête de cette face (cours, point 5).`)]),
    calcul("c", [ligne(`S\\in[${f.areteS.join("")}]`, `la parallèle à (PQ) menée par R rencontre l'arête ${seg(f.areteS)} de la face ${F1}`)]),
    { ...resultat("c", [T(`Le plan (PQR) coupe la face ${F1} suivant le segment [RS], parallèle à [PQ].`)]), figureHtml: figureCorrige(figureIP(e, "papier", 3)) },
    verification("c", [T("Sur le dessin, [RS] est parallèle à [PQ] : la perspective cavalière conserve le parallélisme.")]),
    piege("c", [T(`Un croisement, sur le dessin, avec une arête d'une autre face n'est pas le point S : ces droites sont gauches.`)]),
  ];
}

/** « Le plan (ABG) contient aussi H, car (GH) est parallèle à (AB) » : le quatrième sommet de la section. */
function quatriemeSommet(sec: string[], noms: readonly string[]): FragmentConsigne[] {
  const manquant = sec.find((n) => !noms.includes(n));
  if (!manquant) return [];
  const i = sec.indexOf(manquant);
  // Section b, c, c′, b′ : côtés parallèles à l'axe (b ; b′) = (0 ; 3) et (c ; c′) = (1 ; 2).
  const partenaire = sec[[3, 2, 1, 0][i]!]!;
  const autre = i === 0 || i === 3 ? [sec[1]!, sec[2]!] : [sec[0]!, sec[3]!];
  return [T(`Le plan ${plan(noms)} contient aussi ${manquant} : (${partenaire}${manquant}) est parallèle à (${autre[0]}${autre[1]}). `)];
}

function etapesDirection(e: E): EtapeCorrection[] {
  const d = e.direction!;
  const [p1, p2] = d.plans;
  const [t1, t2] = d.traces0;
  const [u1, u2] = d.traces1;
  const [c1, c2] = d.cotesAxe;
  const F0 = face(e.face0);
  const F1 = face(e.face1);
  const intro = [...quatriemeSommet(d.sections[0], p1), ...quatriemeSommet(d.sections[1], p2)];
  const estDirection = (c: [string, string]) => c.join("") === d.direction.join("") || c.join("") === [...d.direction].reverse().join("");
  const memeDirection = (c: [string, string], p: readonly string[]) =>
    `${c[0]} et ${c[1]} sont dans le plan ${plan(p)}${estDirection(c) ? "" : ` ; ${droite(c)} est parallèle à l'arête ${droite(d.direction)}`}`;
  const justificationParallele = estDirection(c1)
    ? `${droite(c2)} est parallèle à l'arête ${droite(c1)}`
    : estDirection(c2)
      ? `${droite(c1)} est parallèle à l'arête ${droite(c2)}`
      : `toutes deux parallèles à l'arête ${droite(d.direction)}`;
  return [
    utilise("a", [T("Un point commun à deux plans : la rencontre de deux droites, une de chaque plan, tracées dans une même face (cours, point 5).")]),
    calcul(
      "a",
      [
        ligne(`${dL(t1)}\\subset${pL(p1)}`, `${t1[0]} et ${t1[1]} sont dans le plan ${plan(p1)}`),
        ligne(`${dL(t2)}\\subset${pL(p2)}`, `${t2[0]} et ${t2[1]} sont dans le plan ${plan(p2)}`),
        ligne(`${dL(t1)}\\cap${dL(t2)}=\\{K\\}`, `deux droites de la face ${F0}, non parallèles`),
      ],
      intro,
    ),
    resultat("a", [T(`K, rencontre de ${droite(t1)} et ${droite(t2)} dans la face ${F0}, est un point commun aux deux plans.`)]),
    piege("a", [T("Deux droites qui se croisent sur le dessin sans être dans une même face sont souvent gauches : leur croisement n'est pas un point commun.")]),

    utilise("b", [T("Théorème du toit (cours, point 8) : si deux plans sécants contiennent deux droites parallèles, leur droite d'intersection est parallèle à ces droites.")]),
    calcul("b", [
      ligne(`${dL(c1)}\\subset${pL(p1)}`, memeDirection(c1, p1)),
      ligne(`${dL(c2)}\\subset${pL(p2)}`, memeDirection(c2, p2)),
      ligne(`${dL(c1)}\\parallel${dL(c2)}`, justificationParallele),
    ]),
    resultat("b", [T(`La droite d'intersection des deux plans est parallèle à ${droite(d.direction)}.`)]),
    piege("b", [T(`${droite(t1)} n'est que dans le plan ${plan(p1)} : sa direction ne convient pas pour l'autre plan.`)]),

    utilise("c", [T(`La droite d'intersection passe par K et elle est parallèle à ${droite(d.direction)} : elle traverse le solide jusqu'à la face ${F1}.`)]),
    calcul("c", [ligne(`K'\\in(${F1})`, `la parallèle à ${droite(d.direction)} menée par K perce la face ${F1} en K′`)]),
    { ...resultat("c", [T(`Les plans ${plan(p1)} et ${plan(p2)} se coupent suivant la droite (KK′).`)]), figureHtml: figureCorrige(figureIP(e, "papier", 3)) },
    verification("c", [T(`K′ est aussi la rencontre de ${droite(u1)} et ${droite(u2)}, dans la face ${F1} : c'est un second point commun aux deux plans.`)]),
    piege("c", [T("Le point où la droite croise une arête sur le dessin n'est pas K′ : la droite et cette arête ne sont pas dans une même face.")]),
  ];
}

export function correctionDetailleeIntersectionParallele(e: E): EtapeCorrection[] {
  return e.variante === "faces-paralleles" ? etapesFaces(e) : etapesDirection(e);
}
