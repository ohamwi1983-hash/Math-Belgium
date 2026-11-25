import type { AdaptateurFeuilleExercices, BaremeExercice, CritereBareme, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceMethodeGeneratrices } from "../../core6e/methodeGeneratrices.types";
import type { PhaseMethodeGeneratrices } from "../../moteur6e/typesMethodeGeneratrices";
import { phasesPourExercice } from "../../moteur6e/typesMethodeGeneratrices";
import { FORMAT_6GEN57 } from "../../ui6e/formatMethodeGeneratrices";
import { fx } from "../../ui6e/corrigeCombinatoire";
import { formatPapier } from "../../ui6e/corrigeLieux";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { correctionDetailleeMethodeGeneratrices } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceMethodeGeneratrices } from "./index";

/**
 * Adaptateur papier de `6gen57` (méthode des génératrices, 6e ch. 9, § 5, processus 3 TRANSFÉRER) —
 * refonte du lot E de l'audit : la configuration en prose (plus de données jointes par des virgules ni
 * de question coupée à l'impression, audit E1), sans la technique d'élimination ni « cette famille ne
 * comporte pas de parasite » ; consigne globale « Détermine une équation du lieu, puis précise la partie
 * réellement décrite » ; les écrans (génératrices, élimination, statuts, restriction) deviennent les
 * étapes du corrigé, la figure du lieu sous la dernière.
 *
 * Profil : `forme` = la configuration (A, B, C, D1, D2, E) ; E par soustraction ou par produit en
 * croix : même énoncé papier (la méthode est celle de l'élève). Aucun cas particulier, aucun `calcul`
 * (traduire, éliminer, interpréter : règle du 24/11). Regroupement a), b), c) : écarté (Transférer,
 * configuration de trois phrases propre à l'instance, comme 6gen52).
 */

type E = ExerciceMethodeGeneratrices;
type F = FragmentConsigne[];

export const CONSIGNE_6GEN57 = "Détermine une équation du lieu cherché, puis précise la partie de ce lieu réellement décrite.";

export function situationPapier57(e: E): F {
  const d = e.donnees;
  switch (d.famille) {
    case "A":
      return fx(`$ABCD$ est un rectangle : $A(0\\,;0)$, $B(${d.b}\\,;0)$, $C(${d.b}\\,;${d.d})$, $D(0\\,;${d.d})$. Pour $\\alpha\\in\\,\\mathopen{]}0\\,;${d.d}\\mathclose{[}$, on place $Z(0\\,;\\alpha)$ sur $[AD]$ et $Y(${d.b}\\,;\\alpha)$ sur $[BC]$. On cherche le lieu du point d'intersection des droites $(AY)$ et $(BZ)$ quand $\\alpha$ varie.`);
    case "B":
      return fx(`$ABC$ est un triangle : $B(0\\,;0)$, $C(${d.c}\\,;0)$, $A(0\\,;${d.a})$. Pour $\\alpha\\in\\,\\mathopen{]}0\\,;${d.a}\\mathclose{[}$, la droite d'équation $y=\\alpha$ coupe $[AB]$ en $D$ et $[AC]$ en $E$. On cherche le lieu du point d'intersection des droites $(BE)$ et $(CD)$ quand $\\alpha$ varie.`);
    case "C":
      return fx(
        `On donne $A(${d.h}\\,;0)$ et $B(${d.h + d.k}\\,;0)$. Par $A$ passe la droite $a$ qui fait l'angle $\\alpha$ avec l'axe des abscisses ; par $B$ passe la droite $b$ qui fait l'angle $2\\alpha$ (angles orientés, mesurés de l'axe des abscisses vers la droite), avec $\\alpha\\in\\,\\mathopen{]}0^\\circ\\,;90^\\circ\\mathclose{[}$. On pose $t=\\tan\\alpha$ ; on rappelle que $\\tan 2\\alpha=\\dfrac{2t}{1-t^2}$. On cherche le lieu du point d'intersection de $a$ et $b$ quand $\\alpha$ varie.`,
      );
    case "D":
      return d.sousCas === 1
        ? fx(`On donne $B(0\\,;0)$ et $C(${d.c}\\,;0)$. Le sommet $A(\\alpha\\,;${d.h})$ du triangle $ABC$ parcourt la droite d'équation $y=${d.h}$ ($\\alpha\\in\\mathbb{R}$) ; $M$ et $N$ sont les milieux de $[AB]$ et $[AC]$. On cherche le lieu du centre de gravité $G$ du triangle, intersection des médianes $(BN)$ et $(CM)$, quand $\\alpha$ varie.`)
        : fx(`On donne $B(${d.b}\\,;0)$ et $C(${d.c}\\,;0)$. Le sommet $A(0\\,;\\alpha)$ du triangle $ABC$ parcourt l'axe des ordonnées privé de l'origine ($\\alpha\\neq0$) ; $M$ et $N$ sont les milieux de $[AB]$ et $[AC]$. On cherche le lieu du centre de gravité $G$ du triangle, intersection des médianes $(BN)$ et $(CM)$, quand $\\alpha$ varie.`);
    case "E":
      return fx(`On donne $A(${d.p}\\,;0)$ et $B(${d.r}\\,;0)$. Le point $C(0\\,;\\alpha)$ parcourt l'axe des ordonnées privé de l'origine ($\\alpha\\neq0$). La droite $a$ est la perpendiculaire à $(AC)$ passant par $A$, la droite $b$ la perpendiculaire à $(BC)$ passant par $B$. On cherche le lieu du point d'intersection de $a$ et $b$ quand $\\alpha$ varie.`);
  }
}

function reponseBreve(e: E): F {
  return [...fx(`Après élimination : $${e.elimineLatex}$ ; lieu : `), ...fx(e.restrictionLatex), ...fx(".")];
}

function bareme(e: E): BaremeExercice {
  const l = lettresEcrans(phasesPourExercice, e);
  const deux = e.morceaux.length === 2;
  const statut = (i: number): CritereBareme => ({
    sousQuestion: l[2 + i],
    critere: fx(`Statut du morceau $${e.morceaux[i].latex}$ justifié : ${e.morceaux[i].statut}`),
    points: deux ? 0.5 : 1,
  });
  const yFacteur = e.facteurs >= 2 && e.morceaux[0].latex === "y=0";
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: l[0], critere: fx(`Équations des génératrices : $${e.noms[0]}\\,:\\ ${e.generatricesLatex[0]}$ et $${e.noms[1]}\\,:\\ ${e.generatricesLatex[1]}$`), points: 1 },
      { sousQuestion: l[1], critere: fx(`Élimination du paramètre et factorisation : $${e.elimineLatex}$`), points: 1 },
      statut(0),
      ...(deux ? [statut(1)] : []),
      { sousQuestion: l[l.length - 1], critere: [...fx("Partie réellement décrite : "), ...fx(e.restrictionLatex)], points: 1 },
    ],
    erreursFrequentes: [
      ...(yFacteur ? [{ description: fx("Division par $y$ : le facteur $y$ (morceau $y=0$) a disparu"), cout: "moitié des points de l'étape 2" }] : []),
      ...(e.morceaux.length === 2 ? [{ description: fx("Morceau singulier ou parasite gardé dans le lieu"), cout: "0 pt sur le statut de ce morceau" }] : []),
      { description: fx("Restriction oubliée (droite ou cercle entier donné comme lieu)"), cout: "0 pt sur la dernière étape" },
    ],
    reponsesAcceptees: [fx("Toute équation proportionnelle (génératrices, équation du lieu), développée ou factorisée ; une autre méthode d'élimination correcte, avec le statut des morceaux qu'elle fait apparaître")],
  };
}

function criteres(e: E): CriteresDifficulte {
  // Transférer : l'élève construit les génératrices lui-même (méthode 2) ; le piège (morceau singulier
  // ou parasite, bornes exclues) est dans la configuration, constant.
  return { ...etapesDuCorrige(correctionDetailleeMethodeGeneratrices(e), []), methode: 2, piege: 1, nombres: 0 };
}

export function profilMethodeGeneratrices(e: E): ProfilInstance {
  const d = e.donnees;
  return { casParticulier: null, forme: d.famille === "D" ? `D${d.sousCas}` : d.famille };
}

export const adaptateurEvaluationMethodeGeneratrices: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseMethodeGeneratrices>({
  titreDocument: "Méthode des génératrices — Évaluation",
  nomFichierBase: "methode-generatrices",
  genererInstance: genererExerciceMethodeGeneratrices,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: formatPapier(FORMAT_6GEN57),
  phases: phasesPourExercice,
  situation: situationPapier57,
  questions: (e) => [{ consigne: fx(CONSIGNE_6GEN57), etapes: lettresEcrans(phasesPourExercice, e) }],
  reponseBreve,
  correction: correctionDetailleeMethodeGeneratrices,
  bareme,
  criteres,
  profil: profilMethodeGeneratrices,
});
