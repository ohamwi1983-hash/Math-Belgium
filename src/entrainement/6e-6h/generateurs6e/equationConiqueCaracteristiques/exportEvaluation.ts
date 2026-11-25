import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { DonneeC, ExerciceEquationConiqueCaracteristiques } from "../../core6e/equationConiqueCaracteristiques.types";
import type { PhaseEquationConiqueCaracteristiques } from "../../moteur6e/typesEquationConiqueCaracteristiques";
import { phasesPourExercice } from "../../moteur6e/typesEquationConiqueCaracteristiques";
import { latexPoint, latexQ, latexRacine, q } from "../../moteur6e/algebreLieux";
import { foyersConique, latexConique } from "../../moteur6e/algebreConiques";
import { FORMAT_6GEN59 } from "../../ui6e/formatEquationConiqueCaracteristiques";
import { fx } from "../../ui6e/corrigeCombinatoire";
import { formatPapier } from "../../ui6e/corrigeLieux";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { correctionDetailleeEquationConiqueCaracteristiques } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, GROUPES_VERDICT_6GEN59, construireAvecVarianteId, genererExerciceEquationConiqueCaracteristiques } from "./index";

/**
 * Adaptateur papier de `6gen59` (équation d'une conique depuis ses caractéristiques, 6e ch. 10, § 1–2,
 * processus 2 APPLIQUER) — refonte du lot E de l'audit, sur l'adaptateur commun du ch. 7. Énoncé papier
 * = la conique décrite en une phrase (centre, axes, sommet, foyer, point, asymptotes ou deux
 * caractéristiques nommées en toutes lettres) + UNE consigne (« Détermine la nature de cette conique,
 * puis une équation. » quand la nature est à trouver — même axe, famille C —, sinon « Détermine une
 * équation de … ») ; plus d'avertissement « c'est la position du foyer, jamais celle de S… » (axes
 * perpendiculaires, audit I2), plus de « (e < 1 : ellipse…) ». Parabole y² = 2px, p = dist(F ; d)
 * (décision 1) ; parabole par un point : axe de symétrie donné.
 *
 * Profil : `forme` = famille et sous-type (sans la nature, verdict : groupes à verdict « même axe » et
 * les cinq paires de C, critères FIXES) ; cas particulier `sommetOrigine` (B : parabole de sommet O).
 * Aucun `calcul` (établir une équation, règle du 24/11).
 */

type E = ExerciceEquationConiqueCaracteristiques;
type F = FragmentConsigne[];

const axeTexte = (axe: "x" | "y") => (axe === "x" ? "l'axe des abscisses" : "l'axe des ordonnées");
const CENTRE = "de centre $O$, dont les axes de symétrie sont les axes du repère,";

function donneeC(d: DonneeC, e: Extract<E, { famille: "C" }>): string {
  switch (d) {
    case "deuxC":
      return `sa distance focale vaut $2c=${2 * e.c}$`;
    case "deuxA":
      return `la distance entre ses deux sommets de l'axe focal vaut $2a=${2 * e.a}$`;
    case "excentricite":
      return `son excentricité vaut $e=${latexQ(q(e.c, e.a))}$`;
    case "distanceDirectrices":
      return `la distance entre ses deux directrices vaut $${latexQ(q(2 * e.a * e.a, e.c))}$`;
  }
}

export function situationPapier59(e: E): F {
  switch (e.famille) {
    case "A":
      if (e.sousType === "memeAxe") return fx(`Une conique ${CENTRE} a pour sommet $S${latexPoint(e.S)}$ et pour foyer $F${latexPoint(e.F)}$, tous deux sur son axe focal.`);
      if (e.sousType === "axesPerpendiculaires") return fx(`Une ellipse ${CENTRE} a pour foyer $F${latexPoint(e.F)}$ ; le point $S${latexPoint(e.S)}$ est un sommet de son axe non focal.`);
      return fx(`Une ellipse ${CENTRE} a pour sommets $S${latexPoint(e.S)}$ et $S'${latexPoint(e.Sp)}$.`);
    case "B":
      return e.donnee === "foyer" ? fx(`Une parabole a pour sommet $S${latexPoint(e.S)}$ et pour foyer $F${latexPoint(e.F)}$.`) : fx(`Une parabole de sommet $S${latexPoint(e.S)}$, dont l'axe de symétrie est parallèle à ${axeTexte(e.conique.axe)}, passe par le point $P${latexPoint(e.P!)}$.`);
    case "C":
      return fx(`Une conique de centre $O$ a pour axe focal ${axeTexte(e.conique.axe)} ; ${donneeC(e.donnees[0], e)} et ${donneeC(e.donnees[1], e)}.`);
    case "D": {
      const pente = e.conique.axe === "x" ? latexQ(q(e.b, e.a)) : latexQ(q(e.a, e.b));
      const asym = `$y=\\pm ${pente === "1" ? "" : pente}x$`;
      if (e.donnee === "sommet") return fx(`Une hyperbole ${CENTRE} a pour asymptotes les droites ${asym} et pour sommet $S${latexPoint(e.conique.axe === "x" ? { x: q(e.a), y: q(0) } : { x: q(0), y: q(e.a) })}$.`);
      if (e.donnee === "foyer") return fx(`Une hyperbole ${CENTRE} a pour asymptotes les droites ${asym} et pour foyer $F${foyersConique(e.conique)[0].latex}$.`);
      return fx(`Une hyperbole ${CENTRE} d'axe focal ${axeTexte(e.conique.axe)}, a pour asymptotes les droites ${asym} ; sa distance focale vaut $2c=${latexRacine(q(4 * (e.a * e.a + e.b * e.b)))}$.`);
    }
  }
}

export function consignePapier59(e: E): string {
  if ((e.famille === "A" && e.sousType === "memeAxe") || e.famille === "C") return "Détermine la nature de cette conique, puis une équation de cette conique.";
  if (e.famille === "A") return "Détermine une équation de cette ellipse.";
  if (e.famille === "B") return "Détermine une équation de cette parabole.";
  return "Détermine une équation de cette hyperbole.";
}

function reponseBreve(e: E): F {
  const nat = e.conique.type === "ellipse" ? "Ellipse" : e.conique.type === "hyperbole" ? "Hyperbole" : "Parabole";
  return fx(`${nat} d'équation $${latexConique(e.conique)}$.`);
}

function bareme(e: E): BaremeExercice {
  const l = lettresEcrans(phasesPourExercice, e);
  const c = (i: number, critere: string, points: number) => ({ sousQuestion: l[i], critere: fx(critere), points });
  const eq = `Équation : $${latexConique(e.conique)}$`;
  let criteres;
  switch (e.famille) {
    case "A":
      criteres = e.sousType === "memeAxe" ? [c(0, `Nature justifiée ($c$ comparé à $a$) : ${e.nature === "ellipse" ? "ellipse" : "hyperbole"}`, 1), c(1, "$a$, $c$ et $b^2$", 1.5), c(2, eq, 1.5)] : e.sousType === "axesPerpendiculaires" ? [c(0, `Axe focal : ${axeTexte(e.axeFocal)} (celui du foyer)`, 1), c(1, "$b$, $c$ et $a^2=b^2+c^2$", 1.5), c(2, eq, 1.5)] : [c(0, "$a$ (le plus grand demi-axe) et $b$, axe focal", 2), c(1, eq, 2)];
      break;
    case "B":
      criteres = [c(0, "Forme de l'équation (axe et sens d'ouverture)", 1.5), c(1, `$p=${latexQ(e.conique.p)}$`, 1.5), c(2, eq, 1)];
      break;
    case "C":
      criteres = [c(0, `$a=${e.a}$ et $c=${e.c}$ tirés des données`, 1.5), c(1, "Nature par l'excentricité", 1), c(2, `$b^2$ et ${eq.charAt(0).toLowerCase()}${eq.slice(1)}`, 1.5)];
      break;
    case "D":
      criteres = [c(0, `$a=${e.a}$ et $b=${e.b}$ (pente des asymptotes${e.donnee === "sommet" ? "" : ", $c^2=a^2+b^2$"})`, 2.5), c(1, eq, 1.5)];
      break;
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: [
      { description: fx("$a^2$ et $b^2$ échangés (axe focal mal lu)"), cout: "1 pt sur l'équation" },
      ...(e.conique.type === "parabole" ? [{ description: fx("$p$ confondu avec la distance sommet–foyer ($\\frac{p}{2}$) ou avec le coefficient $2p$"), cout: "0 pt sur le paramètre ; l'équation est corrigée avec la valeur de l'élève" }] : [{ description: fx("$b^2=a^2-c^2$ pour une hyperbole (ou l'inverse)"), cout: "0,5 pt sur l'étape concernée" }]),
    ],
    reponsesAcceptees: [fx("Toute équation proportionnelle (dénominateurs chassés, forme développée)")],
  };
}

function criteres(e: E): CriteresDifficulte {
  // Nature à trouver (même axe, famille C) : critères FIXES, niveau et durée identiques pour les deux natures.
  if ((e.famille === "A" && e.sousType === "memeAxe") || e.famille === "C") return { etapesTransformation: 3, etapesLecture: 0, methode: 1, piege: 0, nombres: 0, sansCharge: true };
  const lecture = e.famille === "A" && e.sousType === "axesPerpendiculaires" ? ["a"] : [];
  return { ...etapesDuCorrige(correctionDetailleeEquationConiqueCaracteristiques(e), lecture), methode: 1, piege: e.famille === "A" && e.sousType === "axesPerpendiculaires" ? 1 : 0, nombres: 0 };
}

export function profilEquationConiqueCaracteristiques(e: E): ProfilInstance {
  switch (e.famille) {
    case "A":
      return { casParticulier: null, forme: `A-${e.sousType}` };
    case "B":
      return { casParticulier: e.S.x.n === 0n && e.S.y.n === 0n ? "sommetOrigine" : null, forme: `B-${e.donnee}` };
    case "C":
      return { casParticulier: null, forme: `C-${e.donnees.join("-")}` };
    case "D":
      return { casParticulier: null, forme: `D-${e.donnee}` };
  }
}

export const adaptateurEvaluationEquationConiqueCaracteristiques: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseEquationConiqueCaracteristiques>({
  titreDocument: "Équation d'une conique depuis ses caractéristiques — Évaluation",
  nomFichierBase: "equation-conique-caracteristiques",
  genererInstance: genererExerciceEquationConiqueCaracteristiques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: formatPapier(FORMAT_6GEN59),
  phases: phasesPourExercice,
  situation: situationPapier59,
  questions: (e) => [{ consigne: fx(consignePapier59(e)), etapes: lettresEcrans(phasesPourExercice, e) }],
  reponseBreve,
  correction: correctionDetailleeEquationConiqueCaracteristiques,
  bareme,
  criteres,
  profil: profilEquationConiqueCaracteristiques,
  libelleCasParticulier: "Inclure un cas particulier (parabole de sommet à l'origine)",
  groupesVerdict: GROUPES_VERDICT_6GEN59,
});
