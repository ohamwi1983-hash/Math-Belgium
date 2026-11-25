import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice111 } from "../../core6e/transformationAffineVA";
import { PHASES_111, eY, sY, vX, vY } from "../../core6e/transformationAffineVA";
import { formeAffine, reponse111 } from "../../ui6e/formatTransformationAffineVA";
import { dl, dlp, dt, fr } from "../../ui6e/outilsVariablesAleatoiresLotH1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen111`, une lettre par écran : traduction de la
 * situation (Y = aX + b), linéarité de l'espérance, V(aX + b) = a²V(X), σ(aX + b) = |a|σ(X) — une
 * substitution, puis un calcul par ligne. Même source que l'écran (`reponse111`).
 */

type E = Exercice111;
const t = tx;
const l = lx;

function traduction(e: E): string {
  switch (e.contexte) {
    case "devise":
      return `chaque euro vaut ${dt(e.a)} dollar : X euros valent ${dt(e.a)} × X dollars.`;
    case "temperature":
      return "l'énoncé donne la conversion : on remplace x par X.";
    case "mise":
      return `gain net = gain brut − mise, soit X − ${dt(-e.b)}.`;
    case "points":
      return `X points rapportent ${dt(e.a)} × X euros, dont on retire la participation de ${dt(-e.b)} €.`;
    case "prime":
      return `la prime part de ${dt(e.b)} € et perd ${dt(-e.a)} € par défaut.`;
    case "reservoir":
      return `il reste ce qu'il y avait au départ (${dt(e.b)} L) moins ce qui a été consommé (X).`;
  }
}

function piegeTraduction(e: E): EtapeCorrection["fragments"] {
  if (e.contexte === "mise") return [t("Ajouter la mise au lieu de la retirer : "), l(`Y=X+${dl(-e.b)}`), t(" est faux.")];
  if (e.a < 0) return [t("Oublier le signe de a : Y diminue quand X augmente, donc a est négatif.")];
  return [t("Échanger a et b : a multiplie X, b est la partie fixe.")];
}

export function correctionDetaillee111(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  const b = e.b === 0 ? "" : e.b < 0 ? dl(e.b) : `+${dl(e.b)}`;
  PHASES_111.forEach((ph, i) => {
    const sq = lettreEtape(i);
    switch (ph) {
      case "coefficients":
        out.push(
          utilise(sq, [t("Traduire la situation : "), t(traduction(e))]),
          resultat(sq, fr(reponse111(e, ph))),
          piege(sq, piegeTraduction(e)),
        );
        break;
      case "esperance":
        out.push(
          utilise(sq, [t("Linéarité de l'espérance (cours, § 1) : "), l("E(aX+b)=a\\,E(X)+b"), t(".")]),
          calcul(sq, [ligne(`E(Y)=${dlp(e.a)}\\times E(X)${b}`, "linéarité"), ligne(`=${dlp(e.a)}\\times ${dlp(e.eX)}${b}`, "on remplace E(X)"), ...(e.b !== 0 ? [ligne(`=${dl(e.a * e.eX)}${b}`)] : []), ligne(`=${dl(eY(e))}`)]),
          resultat(sq, fr(reponse111(e, ph))),
          piege(sq, [t("Oublier b ou oublier a : l'espérance subit exactement la même transformation que les valeurs.")]),
        );
        break;
      case "variance": {
        const lignes =
          e.donnee === "variance"
            ? [ligne(`V(Y)=${dlp(e.a)}^2\\times V(X)`, "b ne change pas la dispersion"), ligne(`=${dlp(e.a)}^2\\times ${dl(vX(e))}`, "on remplace V(X)"), ligne(`=${dl(e.a * e.a)}\\times ${dl(vX(e))}`), ligne(`=${dl(vY(e))}`)]
            : [
                ligne(`V(Y)=${dlp(e.a)}^2\\times V(X)`, "b ne change pas la dispersion"),
                ligne(`=${dlp(e.a)}^2\\times\\sigma(X)^2`, "V(X) est le carré de σ(X)"),
                ligne(`=${dlp(e.a)}^2\\times ${dl(e.sX)}^2`),
                ligne(`=${dl(e.a * e.a)}\\times ${dl(vX(e))}`),
                ligne(`=${dl(vY(e))}`),
              ];
        out.push(
          utilise(sq, [t("Variance d'une transformation affine (cours, § 1) : "), l("V(aX+b)=a^2\\,V(X)"), t(" — le décalage b ne change pas la dispersion.")]),
          calcul(sq, lignes),
          resultat(sq, fr(reponse111(e, ph))),
          piege(sq, [t("Écrire "), l("V(aX+b)=a\\,V(X)+b"), t(" : la variance ne se transforme pas comme l'espérance.")]),
        );
        break;
      }
      case "ecartType":
        out.push(
          utilise(sq, [t("Écart-type (cours, § 1) : racine de la variance, "), l("\\sigma(aX+b)=|a|\\,\\sigma(X)"), t(".")]),
          calcul(sq, [
            ...(e.donnee === "variance" ? [ligne(`\\sigma(X)=\\sqrt{${dl(vX(e))}}=${dl(e.sX)}`, "racine de V(X)")] : []),
            ligne(`\\sigma(Y)=|${dl(e.a)}|\\times\\sigma(X)`),
            ligne(`=${dl(Math.abs(e.a))}\\times ${dl(e.sX)}`),
            ligne(`=${dl(sY(e))}`),
          ]),
          resultat(sq, fr(reponse111(e, ph))),
          verification(sq, [l(`${dl(sY(e))}^2=${dl(sY(e) * sY(e))}`), t(" : on retrouve "), l("V(Y)"), t(".")]),
          piege(sq, e.a < 0 ? [t("Écrire "), l(`\\sigma(Y)=${dl(e.a * e.sX)}`), t(" : un écart-type n'est jamais négatif, on prend "), l("|a|"), t(".")] : [t("Ajouter b à l'écart-type : un décalage ne change pas la dispersion.")]),
        );
        break;
    }
  });
  return out;
}

export { formeAffine };
