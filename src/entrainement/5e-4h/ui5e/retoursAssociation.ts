/**
 * 5gen25 — textes de la JUSTIFICATION (lot C) : consigne (écran et papier), aides à deux niveaux (niveau
 * 2 posé pour l'élément justifié, jamais la réponse) et message ciblé (abscisses de f′ lues sur le
 * mauvais graphique, f_k recopiée au lieu d'être dérivée), message sous un choix fermé faux.
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceAssociation } from "../core5e/association.types";
import { diagnostiquerJustification, specJustification } from "../moteur5e/justificationAssociation";
import type { AideTrig } from "./aidesTrigonometrie";
import { aideDepuis, PREFIXE_CHOIX_FERME, t } from "./retoursDerivees";

export function consigneJustificationAssociation(e: ExerciceAssociation): string {
  const k = specJustification(e).item + 1;
  switch (e.famille) {
    case "grapheDerivee":
      return `Justifie l'association de $f_${k}$ (graphique n° ${k}) : lis sur son graphique les abscisses de ses extremums, qui sont les zéros de $f'$ (à défaut, celle de son point d'inflexion), puis son sens de variation et le signe de $f'$ qui en découle.`;
    case "grapheVerbal":
      return `Justifie l'association de $f_${k}$ (graphique n° ${k}) : lis sur son graphique les abscisses de ses extremums — à défaut, celle de son point d'inflexion —, son sens de variation, puis l'endroit où la courbe coupe l'axe des ordonnées.`;
    case "symbolique":
      return `Justifie l'association de $f_${k}$ en la dérivant.`;
    case "grapheDeriveeAvancee":
      return `Justifie ta réponse pour $f_${k}$ (graphique n° ${k}) : que se passe-t-il pour sa dérivée au point particulier de la courbe ?`;
    case "grapheDeriveeVariee":
    case "grapheVerbalVarie": {
      const deux = specJustification(e).champs.filter((c) => c.kind === "nombre").length === 2;
      const sommets = deux ? "les abscisses de ses deux sommets" : "l'abscisse de son sommet";
      return e.famille === "grapheDeriveeVariee"
        ? `Justifie l'association de $f_${k}$ (graphique n° ${k}) : lis sur son graphique ${sommets}, ${deux ? "qui sont les zéros" : "qui est le zéro"} de $f'$, puis son sens de variation et le signe de $f'$ qui en découle.`
        : `Justifie l'association de $f_${k}$ (graphique n° ${k}) : lis sur son graphique ${sommets}, son sens de variation, puis l'endroit où la courbe coupe l'axe des ordonnées.`;
    }
  }
}

export function aidesJustificationAssociation(e: ExerciceAssociation): AideTrig[] {
  const spec = specJustification(e);
  const k = spec.item + 1;
  switch (e.famille) {
    case "grapheDerivee":
    case "grapheVerbal":
      return [
        aideDepuis("Un extremum de f est un sommet de la courbe (bosse ou creux) : f′ y vaut 0 et change de signe. Là où f croît, f′ est positive ; là où elle décroît, f′ est négative."),
        aideDepuis(`Sur le graphique n° ${k}, repère la bosse et le creux (ou, sans sommet, l'endroit où la courbure change) et lis leur abscisse sur l'axe horizontal, au demi-carreau près.${e.famille === "grapheVerbal" ? " f(0) se lit là où la courbe coupe l'axe vertical." : ""}`),
      ];
    case "symbolique":
      return [
        aideDepuis("Repère la structure de f (puissance, produit, puissance d'un binôme), puis applique la règle du cours :", "(x^n)'=nx^{n-1}\\qquad (uv)'=u'v+uv'\\qquad \\left(u^n\\right)'=n\\,u'\\,u^{n-1}"),
        aideDepuis(`La fonction à dériver :`, `f_${k}(x)=${(e as Extract<ExerciceAssociation, { famille: "symbolique" }>).fLatex[spec.item]}`),
      ];
    case "grapheDeriveeVariee":
    case "grapheVerbalVarie":
      return [
        aideDepuis("Un sommet de f (bosse ou creux) est un zéro de f′ où f′ change de signe. Là où f croît, f′ est positive ; là où elle décroît, f′ est négative."),
        aideDepuis(
          `Sur le graphique n° ${k}, repère ${spec.champs.filter((c) => c.kind === "nombre").length === 2 ? "la bosse et le creux" : "le sommet"} : ${spec.champs.filter((c) => c.kind === "nombre").length === 2 ? "leurs abscisses tombent" : "son abscisse tombe"} sur une ligne verticale du quadrillage.${e.famille === "grapheVerbalVarie" ? " f(0) se lit là où la courbe coupe l'axe vertical." : ""}`,
        ),
      ];
    case "grapheDeriveeAvancee":
      return [
        aideDepuis("La dérivée n'existe pas en un coin (deux pentes différentes), en un point à tangente verticale ou en rebroussement (pente infinie), ni là où f n'est pas continue (saut, trou, asymptote)."),
        aideDepuis(`Sur le graphique n° ${k}, regarde la courbe juste à gauche et juste à droite du point particulier : les deux pentes, la continuité.`),
      ];
  }
}

export function cibleJustificationAssociation(e: ExerciceAssociation, r: Record<string, string>): FragmentConsigne[] | null {
  const spec = specJustification(e);
  const st = diagnostiquerJustification(spec, r);
  if (spec.famille === "symbolique" && st.fp !== "correct") return [t("Dérive f terme à terme (ou avec la règle de la puissance d'un binôme) : ce n'est pas f elle-même.")];
  if ((st.x1 && st.x1 !== "correct") || (st.x2 && st.x2 !== "correct")) return [t("Lis les abscisses des sommets sur le graphique de f (numéroté), pas sur celui de f′.")];
  return null;
}

export function messageChoixJustification(e: ExerciceAssociation): string {
  return e.famille === "grapheDeriveeAvancee"
    ? `${PREFIXE_CHOIX_FERME} Coin = deux pentes différentes (f′ saute) ; tangente verticale ou rebroussement = pente infinie ; saut, trou ou asymptote = f pas continue.`
    : e.famille === "grapheVerbal" || e.famille === "grapheVerbalVarie"
      ? `${PREFIXE_CHOIX_FERME} Là où la courbe monte, f est croissante ; là où elle descend, décroissante. f(0) se lit là où la courbe coupe l'axe vertical : au-dessus de l'origine, en dessous, ou exactement à l'origine.`
      : `${PREFIXE_CHOIX_FERME} Là où la courbe monte, f est croissante et f′ positive ; là où elle descend, décroissante et f′ négative.`;
}
