import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { LABEL_UTILISE, calcul, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceLectureSolide, PlanLu } from "../../core/lectureSolide.types";
import { figureCorrige } from "../../ui/figureEspaceLotH";
import {
  LIBELLES_POSITIONS,
  etiquetteDeformee,
  figureCachees,
  figureFaces,
  figureLongueur,
  figurePaire,
  figurePlan,
  nombreFr,
  nomArete,
  nomDroite,
  nomFaceLue,
  nomPlanLu,
} from "../../ui/formatLectureSolide";

/**
 * Corrigé détaillé « comme au tableau » de gen133 (partagé par l'adaptateur et l'appli, une lettre
 * par écran — « positions » : une lettre par paire, l'appli les montre toutes sous son écran unique).
 * Chaque ligne « Calcul » est une lecture justifiée (le nom en KaTeX, la raison en texte) ; jamais de
 * calcul chiffré, sauf le doublement d'une fuyante.
 */

type E = ExerciceLectureSolide;
const T = texte;

function etapesDessin(e: E): EtapeCorrection[] {
  const tetra = e.genre === "tetraedre";
  const vraies = e.faces.filter((f) => f.vraieGrandeur);
  const deformees = e.faces.filter((f) => !f.vraieGrandeur);
  const cachees = e.aretes.filter((a) => a.cachee);
  const L = e.longueur;
  const a = nomArete(L.arete);
  const lignesFaces: LigneCalcul[] = [
    ...vraies.map((f) => ligne(`\\text{${nomFaceLue(f.sommets)}}`, `${f.role}, parallèle à la feuille : vraie grandeur`)),
    ...deformees.map((f) => ligne(`\\text{${nomFaceLue(f.sommets)}}`, `${f.role} : elle contient une fuyante, ${tetra ? "triangle déformé" : "parallélogramme"}`)),
  ];
  return [
    utilise("a", [T("Perspective cavalière (cours, § 1) : les faces parallèles à la feuille sont en vraie grandeur ; une face qui contient une fuyante est déformée (un rectangle devient un parallélogramme).")]),
    calcul("a", lignesFaces, [], "Lecture"),
    {
      ...resultat("a", [T(`Vraie grandeur : ${vraies.map((f) => nomFaceLue(f.sommets)).join(", ")}. ${majuscule(etiquetteDeformee(e))}${deformees.length > 1 ? "s" : ""} : ${deformees.map((f) => nomFaceLue(f.sommets)).join(", ")}.`)]),
      figureHtml: figureCorrige(figureFaces(e, "papier", true)),
    },
    piege("a", [T(tetra ? "La face avant est la seule sans fuyante : les trois autres faces passent toutes par la fuyante [AD]." : "La face arrière aussi est en vraie grandeur : elle est superposable à la face avant.")]),

    utilise("b", [T("Les fuyantes partent vers la droite et vers le haut : on voit le solide de face, d'en haut et par la droite (cours, § 1). Une arête est cachée quand aucune face vue ne la borde.")]),
    calcul(
      "b",
      cachees.map((x) => ligne(`[${x.sommets.join("")}]`, `ses faces (${facesDe(e, x.sommets).join(", ")}) sont cachées : pointillés`)),
      [],
      "Lecture",
    ),
    { ...resultat("b", [T(`Arêtes cachées : ${cachees.map((x) => nomArete(x.sommets)).join(", ")}.`)]), figureHtml: figureCorrige(figureCachees(e, "papier")) },
    piege("b", [T("Une arête de l'arrière n'est pas forcément cachée : si une face vue (le dessus ou la droite) la borde, elle reste en trait plein.")]),

    utilise("c", [T("Perspective cavalière (cours, § 1) : une fuyante est dessinée à la moitié de sa vraie longueur ; les horizontales et les verticales des faces parallèles à la feuille sont en vraie grandeur.")]),
    calcul(
      "c",
      L.fuyante
        ? [ligne(`${a.replace(/[[\]]/g, "")}_{\\text{dessin}}=${nombreFr(L.dessinee).replace(",", "{,}")}\\ \\text{cm}`, `${a} est une fuyante (tracée à 45°)`), ligne(`${a.replace(/[[\]]/g, "")}=2\\cdot ${nombreFr(L.dessinee).replace(",", "{,}")}=${nombreFr(L.vraie).replace(",", "{,}")}\\ \\text{cm}`, "on double la longueur dessinée")]
        : [ligne(`${a.replace(/[[\]]/g, "")}_{\\text{dessin}}=${nombreFr(L.dessinee).replace(",", "{,}")}\\ \\text{cm}`, `${a} est ${estVerticale(e) ? "verticale" : "horizontale"}, dans une face parallèle à la feuille`), ligne(`${a.replace(/[[\]]/g, "")}=${nombreFr(L.vraie).replace(",", "{,}")}\\ \\text{cm}`, "vraie grandeur : elle se lit directement")],
    ),
    { ...resultat("c", [T(`${a} mesure ${nombreFr(L.vraie)} cm.`)]), figureHtml: figureCorrige(figureLongueur(e, "papier", true)) },
    verification("c", [T(L.fuyante ? `${nombreFr(L.vraie)} cm réduits de moitié donnent bien ${nombreFr(L.dessinee)} cm sur le dessin.` : `Une arête en vraie grandeur garde sur le dessin sa longueur réelle, ${nombreFr(L.vraie)} cm.`)]),
    piege("c", [T(L.fuyante ? "La longueur d'une fuyante ne se lit jamais directement sur le dessin : elle y paraît deux fois plus courte." : "Seules les fuyantes sont réduites : une arête horizontale ou verticale de face ne se double pas.")]),
  ];
}

const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function estVerticale(e: E): boolean {
  const [a, b] = e.longueur.arete;
  return Math.abs(e.solide.sommets[a]!.z - e.solide.sommets[b]!.z) > 1e-6;
}

function facesDe(e: E, arete: [string, string]): string[] {
  return e.solide.faces.filter((f) => f.includes(arete[0]) && f.includes(arete[1])).map((f) => nomFaceLue(f));
}

function etapePlan(e: E, p: PlanLu, sq: string): EtapeCorrection[] {
  const plan = nomPlanLu(p);
  const lignes: LigneCalcul[] = p.dans.map((n) => ligne(`${n}\\in${plan}`, p.raisons[n]!));
  const exclus = p.candidats.filter((n) => !p.dans.includes(n));
  return [
    utilise(sq, [T("Un point appartient à un plan s'il est sur une droite de ce plan : la droite qui joint deux points du plan, ou la parallèle à une droite du plan menée par un de ses points (cours, § 2).")]),
    calcul(sq, lignes, p.face ? [T(`Le plan ${plan} est celui de la face ${p.face}.`)] : [], "Lecture"),
    { ...resultat(sq, [T(`Points du plan ${plan}, autres que ${p.noms.join(", ")} : ${p.dans.join(", ")}.`)]), figureHtml: figureCorrige(figurePlan(e, "papier", p, true)) },
    verification(sq, [T(`Les autres points (${exclus.join(", ")}) ne sont sur aucune droite du plan : le plan les laisse d'un côté ou de l'autre.`)]),
    piege(sq, [T("Un point qui semble à l'intérieur du triangle sur le dessin n'est pas forcément dans le plan : il peut être devant ou derrière.")]),
  ];
}

function etapesPositions(e: E): EtapeCorrection[] {
  return e.paires.flatMap((p, i) => {
    const sq = "abcd"[i]!;
    const nom: FragmentConsigne[] = [T(`${nomDroite(p.d1)} et ${nomDroite(p.d2)}`)];
    const rel = p.position === "paralleles" ? `${nomDroite(p.d1)}\\parallel ${nomDroite(p.d2)}` : `${nomDroite(p.d1)},\\ ${nomDroite(p.d2)}`;
    return [
      utilise(sq, [T("Deux droites distinctes sont coplanaires (parallèles ou sécantes) ou gauches : cherche un plan qui contient leurs quatre points (cours, § 3).")]),
      calcul(sq, [ligne(rel, p.raison)], [], "Lecture"),
      { ...resultat(sq, [...nom, T(` : ${LIBELLES_POSITIONS[p.position]}.`)]), ...(p.croisementDessin ? { figureHtml: figureCorrige(figurePaire(e, "papier", i)) } : {}) },
      piege(
        sq,
        p.position === "gauches"
          ? [T(p.croisementDessin ? "Ces deux droites se croisent sur le dessin, mais elles sont gauches : le croisement n'est qu'un effet de la perspective." : "Deux droites qui ne se coupent pas ne sont pas forcément parallèles : il faut aussi un plan commun.")]
          : p.position === "paralleles"
            ? [T("Deux droites parallèles sont toujours coplanaires, même quand elles semblent appartenir à deux faces différentes.")]
            : [T("Le point commun peut tomber hors du solide : prolonge les droites, le plan est infini.")],
      ),
    ];
  });
}

export function correctionDetailleeLectureSolide(e: E): EtapeCorrection[] {
  if (e.variante === "dessin") return etapesDessin(e);
  if (e.variante === "appartenance") return e.plans.flatMap((p, i) => etapePlan(e, p, "abc"[i]!));
  return etapesPositions(e);
}

/** Corrigé pour l'appli : « positions » n'a qu'UN écran — ses quatre paires (a–d) vont sous l'écran a. */
export function correctionEcranLectureSolide(e: E): EtapeCorrection[] {
  const c = correctionDetailleeLectureSolide(e);
  if (e.variante !== "positions") return c;
  // Un seul « Ce qu'on utilise » et des pièges sans doublon sous l'écran unique.
  const vus = new Set<string>();
  return c
    .filter((x) => {
      if (x.label !== LABEL_UTILISE && x.type !== "piege") return true;
      const cle = `${x.label}|${x.fragments.map((f) => f.valeur).join("")}`;
      if (vus.has(cle)) return false;
      vus.add(cle);
      return true;
    })
    .map((x) => ({ ...x, sousQuestion: "a" }));
}

