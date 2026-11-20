import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceIdentites } from "../../core6e/identitesCyclometriques.types";
import {
  arcDe,
  dansImage,
  exterieure,
  IMAGE_L,
  k12De,
  lignesComparaison,
  lignesDomaine,
  lignesRamener,
  lignesSigne,
  lignesSimplification,
  lignesValeur,
  phiK12,
  thetaL,
  toujoursPositif,
  valeurTrigArc,
} from "../../moteur6e/modeleIdentitesCyclometriques";
import { lx, tx } from "../../ui6e/ecransExp.types";
import type { Frag } from "../../ui6e/ecransExp.types";
import { expressionL, reponse } from "../../ui6e/formatIdentitesCyclometriques";
import { qL, qP, radL, trigAngleL, trigExact } from "../../ui6e/nombresRecip";

/**
 * Corrigé détaillé « comme au tableau » de `6gen153`, une lettre par écran : a) le verdict de
 * l'écran 1 (θ comparé aux bornes de l'image au même dénominateur ; position de α puis signe ;
 * conditions d'existence), b) la valeur (valeur remarquable, angle de même sinus / cosinus /
 * tangente ramené dans l'image ; identité substituée puis racine simplifiée ; forme en x). Même
 * source que l'écran (modèle et textes de `formatIdentitesCyclometriques.ts`).
 */

const fr = (f: Frag[]): FragmentConsigne[] => f as FragmentConsigne[];
const t = tx;
const l = lx;
const NOM = { sin: "sinus", cos: "cosinus", tan: "tangente" } as const;

export function correctionDetailleeIdentites(e: ExerciceIdentites): EtapeCorrection[] {
  if (e.variante === "arcTrig") {
    const dedans = dansImage(e.fn, k12De(e));
    const { lignes } = lignesRamener(e);
    const phi = phiK12(e);
    const v = trigExact(e.fn, phi)!;
    return [
      utilise("a", fr([t(`Image de arc${e.fn} (cours, § 2) : `), l(IMAGE_L[e.fn]), t(". On compare "), l(`\\theta=${thetaL(e)}`), t(" à ses bornes.")])),
      calcul("a", lignesComparaison(e)),
      resultat("a", fr(reponse(e, "verdict"))),
      utilise("b", fr(dedans ? [t(`Pour un angle de l'image, arc${e.fn} défait ${e.fn} : `), l(`\\arc${e.fn}(\\${e.fn}\\theta)=\\theta`), t(" (cours, § 2).")] : [l("A"), t(` est l'angle de l'image qui a le même ${NOM[e.fn]} que `), l("\\theta"), t(" (cours, § 2) : on cherche un angle associé, puis on le ramène dans l'image.")])),
      calcul("b", lignes),
      resultat("b", fr(reponse(e, "valeur"))),
      verification("b", fr([t("L'angle trouvé est dans l'image et a la même valeur :")]), [ligne(`${trigAngleL(e.fn, phi, 12)}=${radL(v)}`)]),
      piege("b", fr(dedans ? [t("Croire que la composée « ne fait rien » est juste ici, mais seulement parce que "), l("\\theta"), t(" est dans l'image.")] : [t("Écrire "), l(`${expressionL(e)}=${thetaL(e)}`), t(" : l'arcfonction ne renvoie jamais un angle hors de son image.")])),
    ];
  }
  if (e.variante === "trigArc") {
    const f = arcDe(e.couple);
    const g = exterieure(e.couple);
    const val = valeurTrigArc(e);
    const { utilise: u, lignes } = lignesValeur(e);
    const verif =
      f === "tan"
        ? null
        : g === "tan"
          ? null
          : ligne(`\\left(${radL(val)}\\right)^{2}+${qP(e.a)}^{2}=1`);
    return [
      utilise("a", fr([t(`Image de arc${f} (cours, § 2) : `), l(IMAGE_L[f]), t(` ; le signe ${g === "tan" ? "de la tangente" : `du ${NOM[g]}`} se lit sur cette partie du cercle.`)])),
      calcul("a", lignesSigne(e)),
      resultat("a", fr(reponse(e, "verdict"))),
      utilise("b", fr([t("On pose "), l(`\\alpha=\\arc${f}\\left(${qL(e.a)}\\right)`), t(" : "), l(`\\${f}\\alpha=${qL(e.a)}`), t(". "), ...u])),
      calcul("b", lignes),
      resultat("b", fr(reponse(e, "valeur"))),
      ...(verif ? [verification("b", fr([t("cos² + sin² = 1 :")]), [verif])] : []),
      piege("b", fr(toujoursPositif(e.couple) && e.a.n < 0 ? [t("Mettre un signe « − » parce que "), l("a<0"), t(` : le ${NOM[g]} d'un angle de l'image de arc${f} est toujours positif.`)] : [t("Oublier la racine, ou mal choisir son signe : c'est la position de l'angle dans l'image qui le fixe.")])),
    ];
  }
  const { utilise: u, lignes } = lignesSimplification(e);
  return [
    utilise("a", fr([t(`Domaine de arc${arcDe(e.couple)} (cours, § 2)${exterieure(e.couple) === "tan" ? " ; une tangente est un quotient : dénominateur non nul." : "."}`)])),
    calcul("a", lignesDomaine(e)),
    resultat("a", fr(reponse(e, "verdict"))),
    utilise("b", fr(u)),
    calcul("b", lignes),
    resultat("b", fr(reponse(e, "valeur"))),
    piege("b", fr([t("Écrire "), l(`(${e.k}x)^{2}=${e.k}x^{2}`), t(" : le carré porte sur le coefficient aussi.")])),
  ];
}
