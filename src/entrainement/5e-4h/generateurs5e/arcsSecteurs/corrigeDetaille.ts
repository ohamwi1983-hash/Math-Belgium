import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceArcSecteur, ExerciceModeConversion, ExerciceModeDeuxVersTrois, QuantiteArcSecteur } from "../../core5e/arcsSecteurs.types";
import { quantitesManquantes } from "../../moteur5e/typesArcsSecteurs";
import {
  departRadiansExact,
  formatValeurCibleConversionLatex,
  formatValeurQuantiteLatex,
  formulesDisponibles,
  LABELS_LATEX,
  quantitesConnuesJusqua,
  relationCibleConversionLatex,
  type FormuleArcSecteur,
} from "../../ui5e/formatArcsSecteurs";
import {
  COURS_ARCS,
  FORMULE_DEG_VERS_RAD,
  FORMULE_RAD_VERS_DEG,
  approche,
  finaliserCorrige,
  jf,
  lignesArrondi,
  lignesDegresVersRadians,
  lignesProduitPi,
  lignesQuotientPiParEntier,
  lignesQuotientPiParPi,
  lignesRadiansDecimauxVersDegres,
  lignesRadiansVersDegres,
  piQ,
  q,
  sansDoublons,
  type Q,
} from "../../ui5e/corrigeTrigonometrie1";

/**
 * Corrigé détaillé « comme au tableau » de 5gen6 (arcs et secteurs) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par ÉCRAN : la grandeur de chaque écran, dans
 * l'ordre des dépendances (`quantitesManquantes`), calculée avec la formule de l'aide de niveau 2
 * (`formulesDisponibles(…)[0]`, première ligne = sa substitution `latexSubstitue`), puis une
 * opération par ligne en valeurs EXACTES (multiples de π) ; « Résultat » = la réponse de l'écran
 * (`formatValeurQuantiteLatex`, arrondi au centième quand elle n'est pas entière). Conversion pure :
 * un écran. SANS `docx` : importé par l'adaptateur ET par `App5gen6.tsx` (étape échouée).
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";
const t = texte;
const f = latex;

/** Valeurs exactes de l'instance : θ en radians, s et A en multiples rationnels de π. */
function valeursQ(e: ExerciceModeDeuxVersTrois): { deg: number; r: number; theta: Q; s: Q; A: Q } {
  const { thetaDeg: deg, r } = e.valeurs;
  return { deg, r, theta: q(deg, 180), s: q(r * deg, 180), A: q(r * r * deg, 360) };
}

/** Formule réellement utilisée à l'écran de `quantite` (celle de l'aide de niveau 2). */
export function formuleDeLEtape(e: ExerciceModeDeuxVersTrois, quantite: QuantiteArcSecteur): FormuleArcSecteur {
  return formulesDisponibles(quantite, quantitesConnuesJusqua(e, quantite))[0]!;
}

const cle = (quantite: QuantiteArcSecteur, formule: FormuleArcSecteur) => `${quantite}<-${[...formule.requiert].sort().join(",")}`;

/** Étape où l'on utilise θ en radians dans s = rθ, A = ½r²θ (ou leurs réciproques) : place du piège
 * « θ en degrés ». `null` si aucune étape ne le fait. */
export function etapeAvecThetaRadians(e: ExerciceModeDeuxVersTrois): number | null {
  const manquantes = quantitesManquantes(e);
  const i = manquantes.findIndex((x) => x !== "thetaDeg" && x !== "thetaRad" && formuleDeLEtape(e, x).requiert.includes("thetaRad"));
  return i >= 0 ? i : null;
}

/** « Ce qu'on utilise » de chaque formule (cours, § 1). */
function ceQuOnUtilise(k: string): FragmentConsigne[] {
  switch (k) {
    case "thetaRad<-thetaDeg":
      return [t("Conversion des degrés en radians : "), f(FORMULE_DEG_VERS_RAD), t(` ${COURS_ARCS}.`)];
    case "thetaDeg<-thetaRad":
      return [t("Conversion des radians en degrés : "), f(FORMULE_RAD_VERS_DEG), t(` ${COURS_ARCS}.`)];
    case "thetaRad<-l,r":
      return [t("Longueur d'arc "), f("s=r\\theta"), t(" (θ en radians), d'où "), f("\\theta_{rad}=\\dfrac{s}{r}"), t(` ${COURS_ARCS}.`)];
    case "thetaRad<-A,r":
      return [t("Aire du secteur "), f("A=\\dfrac{1}{2}r^2\\theta"), t(" (θ en radians), d'où "), f("\\theta_{rad}=\\dfrac{2A}{r^2}"), t(` ${COURS_ARCS}.`)];
    case "r<-l,thetaRad":
      return [t("Longueur d'arc "), f("s=r\\theta"), t(" (θ en radians), d'où "), f("r=\\dfrac{s}{\\theta_{rad}}"), t(` ${COURS_ARCS}.`)];
    case "r<-A,thetaRad":
      return [t("Aire du secteur "), f("A=\\dfrac{1}{2}r^2\\theta"), t(" (θ en radians) : on isole d'abord "), f("r^2=\\dfrac{2A}{\\theta_{rad}}"), t(`, puis on prend la racine carrée ${COURS_ARCS}.`)];
    case "r<-A,l":
      return [t("Les deux formules "), f("s=r\\theta"), t(" et "), f("A=\\dfrac{1}{2}r^2\\theta"), t(" donnent "), f("A=\\dfrac{1}{2}rs"), t(", d'où "), f("r=\\dfrac{2A}{s}"), t(` ${COURS_ARCS}.`)];
    case "l<-r,thetaRad":
      return [t("Longueur d'arc, θ en radians : "), f("s=r\\theta"), t(` ${COURS_ARCS}.`)];
    case "l<-A,r":
      return [t("Aire du secteur "), f("A=\\dfrac{1}{2}rs"), t(" (car "), f("s=r\\theta"), t("), d'où "), f("s=\\dfrac{2A}{r}"), t(` ${COURS_ARCS}.`)];
    case "A<-r,thetaRad":
      return [t("Aire du secteur, θ en radians : "), f("A=\\dfrac{1}{2}r^2\\theta"), t(` ${COURS_ARCS}.`)];
    case "A<-l,r":
      return [t("Aire du secteur avec la longueur de l'arc : "), f("A=\\dfrac{1}{2}rs"), t(" (car "), f("s=r\\theta"), t(`) ${COURS_ARCS}.`)];
  }
  return [];
}

/** « 4^2=16 » en justification. */
const carre = (r: number) => jf("on calcule ", { l: `${r}^2=${r * r}` });

/** Lignes de calcul (première ligne = substitution de l'aide de niveau 2), et ligne(s) de vérification. */
function lignesFormule(e: ExerciceModeDeuxVersTrois, quantite: QuantiteArcSecteur, formule: FormuleArcSecteur): { lignes: LigneCalcul[]; verif: { intro: FragmentConsigne[]; lignes: LigneCalcul[] } | null } {
  const { deg, r, theta, s, A } = valeursQ(e);
  const sub = formule.latexSubstitue(e).replace(/\s+/g, " ");
  const k = cle(quantite, formule);
  const premiere = (j: string | FragmentConsigne[]) => ligne(sub, j);
  switch (k) {
    case "thetaRad<-thetaDeg":
      return { lignes: lignesDegresVersRadians(deg), verif: { intro: [t("Retour aux degrés :")], lignes: [ligne(`${piQ(theta)}\\times\\dfrac{180}{\\pi}=${deg}`, "c'est bien le nombre de degrés donné ✓")] } };
    case "thetaDeg<-thetaRad":
      return { lignes: lignesRadiansVersDegres(theta), verif: null };
    case "thetaRad<-l,r":
      return {
        lignes: [premiere("on remplace s et r"), ...lignesQuotientPiParEntier(s, r)],
        verif: { intro: [t("On recalcule s avec l'angle trouvé :")], lignes: [ligne(`r\\theta=${r}\\times ${piQ(theta)}`), ...lignesProduitPi(q(r), theta).slice(-1).map((l) => ({ ...l, justification: "c'est bien s ✓" }))] },
      };
    case "thetaRad<-A,r": {
      const deuxA = q(2 * A.n, A.d);
      return {
        lignes: sansDoublons([
          premiere("on remplace A et r"),
          ligne(`=\\dfrac{${piQ(deuxA, true)}}{${r * r}}`, jf("on calcule ", { l: `2\\times ${piQ(A, true)}` }, " et ", { l: `${r}^2` })),
          ...lignesQuotientPiParEntier(deuxA, r * r),
        ]),
        verif: { intro: [t("On recalcule A avec l'angle trouvé :")], lignes: [ligne(`\\dfrac{1}{2}r^2\\theta=\\dfrac{1}{2}\\times ${r * r}\\times ${piQ(theta)}`), ligne(`=${piQ(A)}`, "c'est bien A ✓")] },
      };
    }
    case "r<-l,thetaRad":
      return {
        lignes: [premiere("on remplace s et θ"), ...lignesQuotientPiParPi(s, theta)],
        verif: { intro: [t("On recalcule s avec le rayon trouvé :")], lignes: [ligne(`r\\theta=${r}\\times ${piQ(theta)}`), ...lignesProduitPi(q(r), theta).slice(-1).map((l) => ({ ...l, justification: "c'est bien s ✓" }))] },
      };
    case "r<-A,thetaRad": {
      const deuxA = q(2 * A.n, A.d);
      return {
        lignes: sansDoublons([
          ligne(`r^2=\\dfrac{2A}{\\theta_{rad}}`, jf("on isole ", { l: "r^2" }, " dans ", { l: "A=\\frac{1}{2}r^2\\theta" })),
          ligne(`=\\dfrac{2\\times ${piQ(A, true)}}{${piQ(theta, true)}}`, "on remplace A et θ"),
          ligne(`=\\dfrac{${piQ(deuxA, true)}}{${piQ(theta, true)}}`, jf("on calcule ", { l: `2\\times ${piQ(A, true)}` })),
          ...lignesQuotientPiParPi(deuxA, theta),
          ligne(`r=\\sqrt{${r * r}}`, "r est une longueur : la racine carrée positive"),
          ligne(`=${r}`),
        ]),
        verif: { intro: [t("On recalcule A avec le rayon trouvé :")], lignes: [ligne(`\\dfrac{1}{2}r^2\\theta=\\dfrac{1}{2}\\times ${r * r}\\times ${piQ(theta)}`), ligne(`=${piQ(A)}`, "c'est bien A ✓")] },
      };
    }
    case "r<-A,l": {
      const deuxA = q(2 * A.n, A.d);
      return {
        lignes: sansDoublons([
          premiere("on remplace A et s"),
          ligne(`=\\dfrac{${piQ(deuxA, true)}}{${piQ(s, true)}}`, jf("on calcule ", { l: `2\\times ${piQ(A, true)}` })),
          ...lignesQuotientPiParPi(deuxA, s),
        ]),
        verif: { intro: [t("On recalcule A avec le rayon trouvé :")], lignes: [ligne(`\\dfrac{1}{2}rs=\\dfrac{1}{2}\\times ${r}\\times ${piQ(s)}`), ligne(`=${piQ(A)}`, "c'est bien A ✓")] },
      };
    }
    case "l<-r,thetaRad":
      return { lignes: [premiere("on remplace r et θ"), ...lignesProduitPi(q(r), theta)], verif: null };
    case "l<-A,r": {
      const deuxA = q(2 * A.n, A.d);
      return {
        lignes: sansDoublons([
          premiere("on remplace A et r"),
          ligne(`=\\dfrac{${piQ(deuxA, true)}}{${r}}`, jf("on calcule ", { l: `2\\times ${piQ(A, true)}` })),
          ...lignesQuotientPiParEntier(deuxA, r),
        ]),
        verif: null,
      };
    }
    case "A<-r,thetaRad": {
      const r2 = r * r;
      const demi = q(r2, 2);
      return {
        lignes: sansDoublons([
          premiere("on remplace r et θ"),
          ligne(`=\\dfrac{1}{2}\\times ${r2}\\times ${piQ(theta)}`, carre(r)),
          ligne(`=${demi.d === 1 ? demi.n : `\\dfrac{${r2}}{2}`}\\times ${piQ(theta)}`, demi.d === 1 ? jf("on calcule ", { l: `\\frac{1}{2}\\times ${r2}=${demi.n}` }) : "on multiplie par ½"),
          ...lignesProduitPi(demi, theta),
        ]),
        verif: null,
      };
    }
    case "A<-l,r": {
      const demi = q(r, 2);
      return {
        lignes: sansDoublons([premiere("on remplace r et s"), ...(demi.d === 1 ? [ligne(`=${demi.n}\\times ${piQ(s)}`, jf("on calcule ", { l: `\\frac{1}{2}\\times ${r}=${demi.n}` }))] : [ligne(`=\\dfrac{${r}}{2}\\times ${piQ(s)}`, "on multiplie par ½")]), ...lignesProduitPi(demi, s)]),
        verif: null,
      };
    }
  }
  return { lignes: [ligne(sub)], verif: null };
}

/** Valeur exacte de l'écran, suivie de son arrondi au centième quand elle n'est pas entière. */
export function valeurAvecApprocheLatex(quantite: QuantiteArcSecteur, e: ExerciceModeDeuxVersTrois): string {
  const v = e.valeurs[quantite];
  const approx = Number.isInteger(v) ? "" : ` \\approx ${approche(v, 2)}`;
  return `${LABELS_LATEX[quantite]} = ${formatValeurQuantiteLatex(quantite, e)}${approx}`;
}

function etapesDeuxVersTrois(e: ExerciceModeDeuxVersTrois): EtapeCorrection[] {
  const manquantes = quantitesManquantes(e);
  const etapePiege = etapeAvecThetaRadians(e);
  return manquantes.flatMap((quantite, i): EtapeCorrection[] => {
    const sq = LETTRES[i]!;
    const formule = formuleDeLEtape(e, quantite);
    const { lignes: brutes, verif } = lignesFormule(e, quantite, formule);
    const lignes = sansDoublons(brutes);
    const v = e.valeurs[quantite];
    const etapes: EtapeCorrection[] = [
      utilise(sq, ceQuOnUtilise(cle(quantite, formule))),
      calcul(sq, [...lignes, ...lignesArrondi(v, 2)]),
      resultat(sq, [f(valeurAvecApprocheLatex(quantite, e))]),
    ];
    if (verif) etapes.push(verification(sq, verif.intro, verif.lignes));
    if (etapePiege === i) etapes.push(piege(sq, [t("Dans "), f("s=r\\theta"), t(" et "), f("A=\\dfrac{1}{2}r^2\\theta"), t(", l'angle θ est TOUJOURS en radians, jamais en degrés.")]));
    else if (quantite === "r" && cle(quantite, formule) === "r<-A,thetaRad") etapes.push(piege(sq, [t("Le calcul donne d'abord "), f("r^2"), t(" : ne pas oublier la racine carrée.")]));
    else if (etapePiege === null && quantite === "thetaDeg") etapes.push(piege(sq, [t("Pour revenir aux degrés, on multiplie par "), f("\\dfrac{180}{\\pi}"), t(", pas par "), f("\\dfrac{\\pi}{180}"), t(".")]));
    return etapes;
  });
}

/** Valeur attendue d'une conversion, avec son libellé (« θ (radians) = … », « ≈ » si arrondie). */
export function reponseConversionLatex(e: ExerciceModeConversion): string {
  return `${e.direction === "degVersRad" ? LABELS_LATEX.thetaRad : LABELS_LATEX.thetaDeg} ${relationCibleConversionLatex(e)} ${formatValeurCibleConversionLatex(e)}`;
}

function etapesConversion(e: ExerciceModeConversion): EtapeCorrection[] {
  const sq = "a";
  const versRad = e.direction === "degVersRad";
  let lignes: LigneCalcul[];
  let verif: EtapeCorrection | null = null;
  if (versRad) {
    lignes = lignesDegresVersRadians(e.valeurDepart);
    if (e.type === "exacte") {
      const th = q(e.valeurDepart, 180);
      verif = verification(sq, [t("Retour aux degrés :")], [ligne(`${piQ(th)}\\times\\dfrac{180}{\\pi}=${e.valeurDepart}`, "c'est bien le nombre de degrés donné ✓")]);
    }
  } else if (e.type === "exacte") {
    const { n, d } = departRadiansExact(e);
    lignes = lignesRadiansVersDegres(q(n, d));
    verif = verification(sq, [t("Retour aux radians :")], [ligne(`${e.valeurCible}\\times\\dfrac{\\pi}{180}=${piQ(q(e.valeurCible, 180))}`, "c'est bien l'angle donné ✓")]);
  } else {
    lignes = lignesRadiansDecimauxVersDegres(e.valeurDepart);
  }
  return [
    utilise(sq, versRad ? [t("Conversion des degrés en radians : "), f(FORMULE_DEG_VERS_RAD), t(` ${COURS_ARCS}.`)] : [t("Conversion des radians en degrés : "), f(FORMULE_RAD_VERS_DEG), t(` ${COURS_ARCS}.`)]),
    calcul(sq, lignes),
    resultat(sq, [f(reponseConversionLatex(e))]),
    ...(verif ? [verif] : []),
    piege(sq, [t("Ne pas inverser les deux facteurs : un angle en degrés est un « grand » nombre (360° pour un tour), le même angle en radians est petit ("), f("2\\pi\\approx 6{,}28"), t(" pour un tour).")]),
  ];
}

export function correctionDetailleeArcSecteur(e: ExerciceArcSecteur): EtapeCorrection[] {
  return finaliserCorrige(e.mode === "conversion" ? etapesConversion(e) : etapesDeuxVersTrois(e));
}
