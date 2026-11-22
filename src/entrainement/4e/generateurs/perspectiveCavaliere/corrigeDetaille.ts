import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExercicePerspectiveCavaliere } from "../../core/perspectiveCavaliere.types";
import { origineMesure } from "../../moteur/verificationPerspectiveCavaliere";
import { aretesCacheesTexte, figurePapierCorrige, nombre, reponseEcran } from "../../ui/formatCavaliere";
import { COURS_CAVALIERE, decL, droiteL, finaliserEspace2, fracL, segL } from "../../ui/corrigeEspace2";
import { faceVue } from "./index";

/**
 * Corrigé détaillé « comme au tableau » de gen104 « Dessiner en perspective cavalière » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN : a) la première fuyante (longueur
 * dessinée = profondeur ÷ 2, angle de 45°, décalages horizontal et vertical p·√2/4 calculés exactement,
 * vérification par Pythagore) ; b) les autres sommets (fuyantes parallèles et de même longueur) ou, pour
 * la pyramide, le quatrième sommet, le centre O (diagonales) et S (hauteur verticale en vraie
 * grandeur) ; c) les arêtes cachées : chaque arête est l'intersection de deux faces, cachée quand les
 * deux le sont (faces vues calculées comme le générateur, `faceVue`). Figure complète en `figureHtml`.
 */

type E = ExercicePerspectiveCavaliere;

const FACES: Record<E["variante"], string[][]> = {
  pave: [
    ["A", "B", "C", "D"],
    ["E", "F", "G", "H"],
    ["A", "B", "F", "E"],
    ["D", "C", "G", "H"],
    ["A", "D", "H", "E"],
    ["B", "C", "G", "F"],
  ],
  prisme: [
    ["A", "B", "C"],
    ["D", "E", "F"],
    ["A", "B", "E", "D"],
    ["B", "C", "F", "E"],
    ["C", "A", "D", "F"],
  ],
  pyramide: [
    ["A", "B", "C", "D"],
    ["A", "B", "S"],
    ["B", "C", "S"],
    ["C", "D", "S"],
    ["D", "A", "S"],
  ],
};

/** Longueur réelle p en LaTeX, et sa moitié (fraction ou décimal exact). */
function moitieL(p: number): string {
  return p % 2 === 0 ? `${p / 2}` : decL(p / 2, 1);
}

/** Décalage p·√2/4 simplifié : « \dfrac{3\sqrt{2}}{2} », « \sqrt{2} », « 2\sqrt{2} ». */
function decalageL(p: number): string {
  const f = fracL(p, 4);
  const m = /^\\dfrac\{(\d+)\}\{(\d+)\}$/.exec(f);
  if (m) return `\\dfrac{${m[1] === "1" ? "" : m[1]}\\sqrt{2}}{${m[2]}}`;
  return `${f === "1" ? "" : f}\\sqrt{2}`;
}

function etapeFuyante(e: E): EtapeCorrection[] {
  const o = origineMesure(e, e.premier).nom;
  const p = e.profondeur;
  const nom = `${o}${e.premier}`;
  const lignes: LigneCalcul[] = [
    ligne(`\\text{sur le dessin, }${nom}=\\dfrac{${p}}{2}`, `fuyante : profondeur réelle ${nombre(p)} cm, réduite de moitié`),
    ligne(`=${moitieL(p)}\\text{ cm}`),
    ligne(`\\text{angle avec l'horizontale}=45^\\circ`, "vers la droite et vers le haut"),
    ligne(`\\Delta x=${moitieL(p)}\\cdot\\cos 45^\\circ`, `décalage horizontal de ${e.premier} depuis ${o}`),
    ligne(`=${moitieL(p)}\\cdot\\dfrac{\\sqrt{2}}{2}`, [latex("\\cos 45^\\circ=\\dfrac{\\sqrt{2}}{2}")]),
    ligne(`=${decalageL(p)}`, "on simplifie"),
    ligne(`\\approx ${decL((p * Math.SQRT2) / 4)}\\text{ cm}`, `même décalage vers le haut : Δy = Δx`),
  ];
  return [
    utilise("a", [
      texte(`Perspective cavalière ${COURS_CAVALIERE} : la face avant reste en vraie grandeur ; une arête en profondeur (une fuyante) se dessine à 45° de l'horizontale, vers la droite et vers le haut, et réduite de moitié.`),
    ]),
    calcul("a", lignes),
    resultat("a", [texte(reponseEcran(e, 0))]),
    verification("a", [texte(`Le point ${e.premier} ne tombe sur aucun nœud du quadrillage ; la fuyante a bien la longueur voulue :`)], [
      ligne(`\\sqrt{\\Delta x^2+\\Delta y^2}=\\sqrt{${fracL(p * p, 8)}+${fracL(p * p, 8)}}`, "Pythagore sur le quadrillage"),
      ligne(`=\\sqrt{${fracL(p * p, 4)}}`),
      ligne(`=${moitieL(p)}`, "longueur dessinée de la fuyante"),
    ]),
    piege("a", [texte("Compter « un carreau en diagonale » par centimètre ne réduit pas de moitié : la diagonale d'un carreau mesure √2 ≈ 1,4 cm. On mesure la longueur le long de la fuyante, à la règle.")]),
  ];
}

function etapeSommets(e: E): EtapeCorrection[] {
  const o1 = origineMesure(e, e.premier).nom;
  const ref = droiteL(o1, e.premier);
  const refLong = `${o1}${e.premier}`;
  const fuyante = (n: string): LigneCalcul[] => {
    const o = origineMesure(e, n).nom;
    return [ligne(`${droiteL(o, n)}\\parallel ${ref}`, "fuyantes : toutes parallèles"), ligne(`${o}${n}=${refLong}`, `même longueur dessinée (${nombre(e.profondeur / 2)} cm)`)];
  };
  if (e.variante === "pyramide") {
    const c = e.completes[0]!;
    return [
      utilise("b", [
        texte(`Perspective cavalière ${COURS_CAVALIERE} : les fuyantes sont parallèles et de même longueur dessinée ; le parallélisme et les milieux sont conservés ; une hauteur verticale garde sa vraie grandeur.`),
      ]),
      calcul("b", [
        ...fuyante(c),
        ligne("(AC)\\cap(BD)=\\{O\\}", "centre de la base : rencontre des diagonales du parallélogramme ABCD dessiné"),
        ligne("(OS)\\perp(AB)", "hauteur verticale, [AB] horizontale"),
        ligne(`OS=${nombre(e.hauteur).replace(",", "{,}")}\\text{ cm}`, "hauteur en vraie grandeur (elle n'est pas une fuyante)"),
      ]),
      resultat("b", [texte(reponseEcran(e, 1))]),
      piege("b", [texte("Le pied de la hauteur est le centre O de la base, pas le milieu de [AB] ; et la hauteur, verticale, n'est pas réduite.")]),
    ];
  }
  return [
    utilise("b", [texte(`Perspective cavalière ${COURS_CAVALIERE} : des arêtes parallèles restent parallèles sur le dessin, et toutes les fuyantes ont la même longueur dessinée.`)]),
    calcul("b", e.suivants.flatMap(fuyante)),
    resultat("b", [texte(`${reponseEcran(e, 1)} La face arrière, reliée par ces fuyantes, est superposable à la face avant.`)]),
  ];
}

function etapeAretes(e: E): EtapeCorrection[] {
  const espace = Object.fromEntries(e.sommets.map((s) => [s.nom, s.espace]));
  const faces = FACES[e.variante].map((f) => ({ f, nom: f.join(""), vue: faceVue(espace, f) }));
  const bordent = (a: string, b: string) => faces.filter((x) => x.f.includes(a) && x.f.includes(b));
  const cachees = e.aretes.filter((a) => a.cachee);
  const lignes: LigneCalcul[] = cachees.map((a) => {
    const [f1, f2] = bordent(a.a, a.b);
    return ligne(`${segL(a.a, a.b)}=${f1!.nom}\\cap ${f2!.nom}`, "arête de deux faces cachées : cachée");
  });
  // Contraste : une arête vue qui part du sommet arrière en bas à gauche (D) ou, à défaut, du contour.
  const vue = e.aretes.find((a) => !a.cachee && (a.a === "D" || a.b === "D")) ?? e.aretes.find((a) => !a.cachee)!;
  const [g1, g2] = bordent(vue.a, vue.b);
  const faceVueNom = [g1, g2].find((x) => x?.vue)!.nom;
  lignes.push(ligne(`${segL(vue.a, vue.b)}=${g1!.nom}\\cap ${g2!.nom}`, `la face ${faceVueNom} est vue : arête vue`));
  const vues = faces.filter((x) => x.vue).map((x) => x.nom).join(", ");
  const autres = faces.filter((x) => !x.vue).map((x) => x.nom).join(", ");
  return [
    utilise("c", [texte(`Une arête est cachée quand TOUTES les faces qui la bordent sont cachées ${COURS_CAVALIERE}. Les fuyantes montent vers la droite : on voit la face avant, le dessus et la face de droite ; on voit la face de gauche seulement si elle monte moins vite que les fuyantes.`)]),
    calcul("c", lignes, [texte(`Faces vues : ${vues}. Faces cachées : ${autres}.`)]),
    { ...resultat("c", [texte(`Arêtes cachées, en pointillés : ${aretesCacheesTexte(e)}. Toutes les autres arêtes sont en trait plein.`)]), figureHtml: figurePapierCorrige(e) },
    piege("c", [texte("Une arête cachée se trace en pointillés, jamais en trait plein ; une arête du contour extérieur du dessin est toujours vue.")]),
  ];
}

export function correctionDetailleePerspectiveCavaliere(e: E): EtapeCorrection[] {
  return finaliserEspace2([...etapeFuyante(e), ...etapeSommets(e), ...etapeAretes(e)]);
}
