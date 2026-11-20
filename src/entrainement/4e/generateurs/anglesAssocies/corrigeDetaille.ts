import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceAnglesAssocies, FonctionSinCos, QuadrantAnglesAssocies } from "../../core/anglesAssocies.types";
import { decimal3Latex, formatBlocDemandeLatex, texteAide2, texteAide3Intro } from "../../ui/formatAnglesAssocies";
import { necessiteAide3 } from "../../moteur/verificationAnglesAssocies";
import { COURS_ASSOCIES, COURS_CERCLE, finaliserCorrige } from "../../ui/corrigeCercleTrigo";

/**
 * Corrigé détaillé « comme au tableau » de gen17 (angles associés) — règle
 * `.claude/rules/feuilles-evaluations.md`. Un seul écran (lettre a) : θ écrit avec son angle du
 * premier quadrant (180° − x, 180° + x, 360° − x = −x ou 90° − α), relation des angles associés
 * (signe), passage éventuel au complémentaire (sinus ↔ cosinus), puis la valeur donnée.
 */

type E = ExerciceAnglesAssocies;
type F = FonctionSinCos | "tan";

const SIGNE: Record<QuadrantAnglesAssocies, Record<F, 1 | -1>> = {
  I: { sin: 1, cos: 1, tan: 1 },
  II: { sin: 1, cos: -1, tan: -1 },
  III: { sin: -1, cos: -1, tan: 1 },
  IV: { sin: -1, cos: 1, tan: -1 },
};

const NOM: Record<F, string> = { sin: "le sinus", cos: "le cosinus", tan: "la tangente" };

function cofonction(f: FonctionSinCos): FonctionSinCos {
  return f === "sin" ? "cos" : "sin";
}

/** Relation des angles associés utilisée (justification). */
function relation(q: QuadrantAnglesAssocies, f: F): FragmentConsigne[] {
  const s = SIGNE[q][f] === -1 ? "-" : "";
  if (q === "II") return [texte("angles supplémentaires : "), latex(`\\${f}(180^\\circ-x)=${s}\\${f} x`)];
  if (q === "III") return [texte("angles anti-supplémentaires : "), latex(`\\${f}(180^\\circ+x)=${s}\\${f} x`)];
  return [texte("angles opposés : "), latex(`\\${f}(-x)=${s}\\${f} x`)];
}

function deg(a: number): string {
  return `${a}^\\circ`;
}

export function correctionDetailleeAnglesAssocies(e: E): EtapeCorrection[] {
  const f: F = e.variante === "sinCos" ? e.fonctionCible : "tan";
  const { theta, xReference: x, alpha, quadrant: q } = e;
  const signe = SIGNE[q][f];
  const moins = signe === -1 ? "-" : "";
  const valeur = decimal3Latex(e.valeurCible);
  const lignes: LigneCalcul[] = [];
  const co = e.variante === "sinCos" && (q === "I" || necessiteAide3(e));

  if (e.relation === "plus90" && e.variante === "sinCos") {
    // θ = 90° + α : règle du cours (§ 4), sinus et cosinus s'échangent, le cosinus change de signe.
    const cf = cofonction(e.fonctionCible);
    const donnee = cf === "cos" ? e.cosAlpha : e.sinAlpha;
    lignes.push(
      ligne(`\${f} ${deg(theta)}=\${f}(90^\circ+${deg(alpha)})`, `${theta}° = 90° + ${alpha}°`),
      ligne(`=${moins}\${cf} ${deg(alpha)}`, [texte("règle de 90° + θ : "), latex(f === "sin" ? "\sin(90^\circ+x)=\cos x" : "\cos(90^\circ+x)=-\sin x")]),
      ligne(`\approx ${valeur}`, [texte("valeur donnée : "), latex(`\${cf} ${deg(alpha)}\approx ${decimal3Latex(donnee)}`)]),
    );
  } else if (q === "I" && e.variante === "sinCos") {
    // θ = 90° − α : co-fonction directe.
    const cf = cofonction(e.fonctionCible);
    lignes.push(
      ligne(`\\${f} ${deg(theta)}=\\${f}(90^\\circ-${deg(alpha)})`, `${theta}° = 90° − ${alpha}° : angles complémentaires`),
      ligne(`=\\${cf} ${deg(alpha)}`, [texte("complémentaires : "), latex(`\\${f}(90^\\circ-x)=\\${cf} x`)]),
      ligne(`\\approx ${valeur}`, [texte("valeur donnée : "), latex(`\\${cf} ${deg(alpha)}\\approx ${valeur}`)]),
    );
  } else {
    const ecriture = q === "II" ? `180^\\circ-${deg(x)}` : q === "III" ? `180^\\circ+${deg(x)}` : `360^\\circ-${deg(x)}`;
    const ecritureTexte = q === "II" ? `180° − ${x}°` : q === "III" ? `180° + ${x}°` : `360° − ${x}°`;
    lignes.push(ligne(`\\${f} ${deg(theta)}=\\${f}(${ecriture})`, `${theta}° = ${ecritureTexte}`));
    if (q === "IV") lignes.push(ligne(`=\\${f}(-${deg(x)})`, "360° − x et −x donnent le même point du cercle"));
    lignes.push(ligne(`=${moins}\\${f} ${deg(x)}`, relation(q, f)));
    if (co) {
      const cf = cofonction(f as FonctionSinCos);
      lignes.push(
        ligne(`=${moins}\\${f}(90^\\circ-${deg(alpha)})`, `${x}° = 90° − ${alpha}° : angles complémentaires`),
        ligne(`=${moins}\\${cf} ${deg(alpha)}`, [texte("complémentaires : "), latex(`\\${f}(90^\\circ-x)=\\${cf} x`)]),
        ligne(`\\approx ${valeur}`, [texte("valeur donnée : "), latex(`\\${cf} ${deg(alpha)}\\approx ${decimal3Latex(e.variante === "sinCos" ? (cf === "cos" ? e.cosAlpha : e.sinAlpha) : 0)}`)]),
      );
    } else {
      const donnee = e.variante === "tangente" ? e.tanAlpha : f === "sin" ? e.sinAlpha : e.cosAlpha;
      lignes.push(ligne(`\\approx ${valeur}`, [texte("valeur donnée : "), latex(`\\${f} ${deg(x)}\\approx ${decimal3Latex(donnee)}`)]));
    }
  }

  const utiliseFr: FragmentConsigne[] =
    e.relation === "plus90"
      ? [texte(`Angles associés ${COURS_ASSOCIES} : ${texteAide2(e)} Règle de 90° + θ : le sinus devient le cosinus, le cosinus devient l'opposé du sinus.`)]
      : [texte(`Angles associés ${COURS_ASSOCIES} : ${texteAide2(e)}`)];
  if (co && q !== "I") utiliseFr.push(texte(` Puis ${texteAide3Intro(e)} Le sinus de l'un est le cosinus de l'autre.`));
  if (q === "I" && e.variante === "sinCos") utiliseFr.push(texte(" Le sinus de l'un est le cosinus de l'autre."));
  utiliseFr.push(texte(q === "I" || e.relation === "plus90" ? "" : ` Le signe vient du quadrant de θ ${COURS_CERCLE}.`));

  const etapes: EtapeCorrection[] = [
    utilise("a", utiliseFr.filter((fr) => fr.valeur !== "")),
    calcul("a", lignes),
    resultat("a", [latex(`${formatBlocDemandeLatex(e)}\\approx ${valeur}`)]),
    verification("a", [
      latex(deg(theta)),
      texte(` est dans le quadrant ${q}, où ${NOM[f]} est ${signe === 1 ? (f === "tan" ? "positive" : "positif") : f === "tan" ? "négative" : "négatif"} : le signe trouvé est cohérent.`),
    ]),
    piege("a", [
      e.relation === "plus90"
        ? texte(`Avec 90° + α, sinus et cosinus s'échangent : on utilise ${f === "sin" ? "cos" : "sin"} ${alpha}°, pas ${f} ${alpha}°.`)
        : co
        ? texte(`Passer par le complémentaire échange sinus et cosinus : on utilise ${f === "sin" ? "cos" : "sin"} ${alpha}°, pas ${f} ${alpha}°.`)
        : texte(`Le signe vient du quadrant de ${theta}° : la valeur de ${x}° est toujours positive.`),
    ]),
  ];
  return finaliserCorrige(etapes);
}
