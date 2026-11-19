import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceTriangleQuelconque } from "../../core/triangleQuelconque.types";
import { donneesFormuleAire, valeurAire } from "../../moteur/verificationTriangleQuelconque";
import { valeurAffichee } from "../../ui/formatTriangleQuelconque";
import { nombreFrLatex } from "../../ui/nombreFr";
import {
  COURS_TRIANGLE,
  angleDonne,
  angleMemoire,
  coteMemoire,
  donnee,
  finaliserCorrigeTriangles,
  lignesAire,
  lignesAlKashiAngle,
  lignesAlKashiCote,
  lignesLoiSinusCote,
  lignesSommeAngles,
  nb,
  rel,
  relSubst,
  u,
  u2,
  type Val,
} from "../../ui/corrigeTriangles";

/**
 * Corrigé détaillé « comme au tableau » de gen19 (triangle quelconque) — règle
 * `.claude/rules/feuilles-evaluations.md`. Deux étapes = deux écrans de l'appli : a) la donnée
 * manquante (loi des sinus pour AC, Al-Kashi isolée en cos A, ou Al-Kashi pour BC), b) l'aire du même
 * triangle (½ · côté · côté · sinus de l'angle compris, couple de `donneesFormuleAire`, comme l'écran).
 * Valeurs : `instance.triangle` (résolu à la génération) ; la valeur trouvée en a) est réutilisée en
 * b) avec sa valeur exacte (mémoire), écrite arrondie comme à l'écran (`valeurAffichee`). Partagé par
 * l'adaptateur papier et l'appli (`AppTriangleQuelconque.tsx`).
 */

type E = ExerciceTriangleQuelconque;

const SEGMENT = { a: "BC", b: "AC", c: "AB" } as const;

/** Valeur affichée à l'écran (côté au centième, angle au dixième), en LaTeX avec son unité. */
function valeurEcran(e: E, lettre: "a" | "b" | "c" | "A" | "B" | "C"): string {
  const n = nombreFrLatex(valeurAffichee(e, lettre));
  return lettre === lettre.toLowerCase() ? `${n}${u(e.unite)}` : `${n}^\\circ`;
}

/** Valeur substituée : donnée de l'énoncé (exacte) ou valeur calculée à l'étape a) (mémoire). */
function val(e: E, lettre: "a" | "b" | "c" | "A" | "B" | "C"): Val {
  const v = e.triangle[lettre];
  const calculee = lettre === e.donneeManquante || (e.configuration === "loiSinus" && lettre === "C");
  if (lettre === lettre.toUpperCase()) return calculee && lettre !== "C" ? angleMemoire(v) : angleDonne(v);
  return calculee ? coteMemoire(v) : donnee(v);
}

/** Écran « donnée manquante » du résultat : « AC ≈ 13,32 cm » / « A ≈ 54,3° ». */
function resultatDonneeManquante(e: E): string {
  const l = e.donneeManquante;
  const nom = l === "A" || l === "B" || l === "C" ? l : SEGMENT[l];
  const v = e.triangle[l];
  const d = l === l.toLowerCase() ? 2 : 1;
  return `${nom} ${rel(v, d)} ${valeurEcran(e, l)}`;
}

function etapeDonneeManquante(e: E): EtapeCorrection[] {
  const t = e.triangle;
  switch (e.configuration) {
    case "loiSinus": {
      const grand = t.B > t.A ? "AC > BC" : t.B < t.A ? "AC < BC" : "AC = BC";
      return [
        utilise("a", [texte(`Deux angles et le côté opposé à l'un d'eux : loi des sinus ${COURS_TRIANGLE}, chaque côté avec le sinus de l'angle qui lui fait face : `), latex("\\dfrac{BC}{\\sin A}=\\dfrac{AC}{\\sin B}")]),
        calcul("a", lignesLoiSinusCote({ x: "AC", X: "B", k: "BC", K: "A", vk: val(e, "a"), vX: val(e, "B"), vK: val(e, "A"), resultat: t.b, unite: e.unite })),
        resultat("a", [latex(resultatDonneeManquante(e))]),
        verification("a", [texte("Le plus grand des deux angles fait face au plus grand côté : "), latex(`B ${t.B > t.A ? ">" : t.B < t.A ? "<" : "="} A`), texte(" et "), latex(grand), texte(".")]),
        piege("a", [texte("Chaque côté va avec l'angle qui lui fait face : BC avec A, AC avec B — et la calculatrice doit être en degrés.")]),
      ];
    }
    case "alKashi":
      return [
        utilise("a", [
          texte(`Trois côtés connus : loi des cosinus (Al-Kashi) ${COURS_TRIANGLE}, écrite avec le côté opposé à l'angle cherché, puis isolée en `),
          latex("\\cos A"),
          texte(" : "),
          latex("BC^2=AC^2+AB^2-2\\cdot AC\\cdot AB\\cdot\\cos A"),
        ]),
        calcul("a", lignesAlKashiAngle({ X: "A", x: "BC", p: "AC", q: "AB", vx: val(e, "a"), vp: val(e, "b"), vq: val(e, "c"), angle: t.A })),
        resultat("a", [texte("Angle "), latex(resultatDonneeManquante(e))]),
        verification("a", [
          ...(t.A > 90
            ? [texte("Le cosinus est négatif : l'angle A est obtus, et il fait bien face au plus grand côté, "), latex("BC"), texte(".")]
            : [texte("Le cosinus est positif : l'angle A est aigu.")]),
        ]),
        piege("a", [texte("Le côté opposé à A, BC, est celui qu'on retranche ; ne pas oublier la touche "), latex("\\cos^{-1}"), texte(" pour passer de "), latex("\\cos A"), texte(" à A.")]),
      ];
    case "alKashiCote":
      return [
        utilise("a", [texte(`Deux côtés et l'angle compris entre eux : loi des cosinus (Al-Kashi) ${COURS_TRIANGLE} : `), latex("BC^2=AC^2+AB^2-2\\cdot AC\\cdot AB\\cdot\\cos A")]),
        calcul("a", lignesAlKashiCote({ x: "BC", p: "AC", q: "AB", X: "A", vp: val(e, "b"), vq: val(e, "c"), vX: val(e, "A"), resultat: t.a, unite: e.unite })),
        resultat("a", [latex(resultatDonneeManquante(e))]),
        ...(t.A > 90 ? [verification("a", [texte("L'angle A est obtus : le côté BC qui lui fait face est le plus grand, "), latex(`BC > AC`), texte(" et "), latex("BC > AB"), texte(".")])] : []),
        piege("a", [
          texte("Ne pas oublier le terme "),
          latex("-2\\cdot AC\\cdot AB\\cdot\\cos A"),
          texte(t.A > 90 ? " : ici le cosinus est négatif, ce terme s'ajoute. Puis la racine carrée, calculatrice en degrés." : ", ni la racine carrée à la fin ; calculatrice en degrés."),
        ]),
      ];
  }
}

function etapeAire(e: E): EtapeCorrection[] {
  const t = e.triangle;
  const { cote1, cote2, angleCompris } = donneesFormuleAire(e);
  const aire = valeurAire(e);
  const blocs: EtapeCorrection[] = [];
  if (e.configuration === "loiSinus") {
    blocs.push(
      calcul(
        "b",
        lignesSommeAngles({ inconnu: "C", autres: ["A", "B"], valeurs: [angleDonne(t.A), angleDonne(t.B)], resultat: t.C }),
        [texte("L'angle compris entre BC et AC est C, au sommet commun :")],
        "Angle compris",
      ),
    );
  }
  const vp = val(e, cote1);
  const vq = val(e, cote2);
  const vX = val(e, angleCompris);
  const lignesA: LigneCalcul[] = lignesAire({ p: SEGMENT[cote1], q: SEGMENT[cote2], X: angleCompris, vp, vq, vX, aire, unite: e.unite });
  blocs.push(calcul("b", lignesA, [], "Aire"));
  // Même arrondi que l'écran (`formatAire` : au centième).
  const resultatAire = `\\mathcal{A} ${rel(aire, 2)} ${nb(aire, 2)}${u2(e.unite)}`;
  const etapes: EtapeCorrection[] = [
    utilise("b", [
      texte(`Aire d'un triangle : demi-produit de deux côtés par le sinus de l'angle compris entre eux ${COURS_TRIANGLE} : `),
      latex(`\\mathcal{A}=\\dfrac{1}{2}\\cdot ${SEGMENT[cote1]}\\cdot ${SEGMENT[cote2]}\\cdot\\sin ${angleCompris}`),
    ]),
    ...blocs,
    resultat("b", [latex(resultatAire)]),
  ];
  if (e.configuration !== "loiSinus") {
    // Héron avec les trois côtés : le même nombre par une autre formule.
    const p = (t.a + t.b + t.c) / 2;
    const vals = [val(e, "a"), val(e, "b"), val(e, "c")];
    const r = relSubst(...vals);
    etapes.push(
      verification(
        "b",
        [texte("Par la formule de Héron, avec les trois côtés :")],
        [
          ligne(`p=\\dfrac{BC+AC+AB}{2}`, "demi-périmètre"),
          ligne(`${r}\\dfrac{${vals.map((x) => nb(x.v, x.d)).join("+")}}{2}`),
          ligne(`${rel(p, 2)}${nb(p, 2)}`),
          ligne(`\\mathcal{A}=\\sqrt{p\\,(p-BC)(p-AC)(p-AB)}`, "formule de Héron"),
          ligne(`${rel(aire, 2)}${nb(aire, 2)}${u2(e.unite)}`, "même aire"),
        ],
      ),
    );
  }
  etapes.push(
    piege("b", [
      texte(
        e.configuration === "loiSinus"
          ? "L'angle de la formule est celui COMPRIS entre les deux côtés utilisés : C, entre BC et AC — pas l'angle A ou B donné. L'aire s'exprime en unité au carré."
          : "L'angle de la formule est celui COMPRIS entre les deux côtés utilisés : A, entre AC et AB. L'aire s'exprime en unité au carré.",
      ),
    ]),
  );
  return etapes;
}

export function correctionDetailleeTriangleQuelconque(e: E): EtapeCorrection[] {
  return finaliserCorrigeTriangles([...etapeDonneeManquante(e), ...etapeAire(e)]);
}
