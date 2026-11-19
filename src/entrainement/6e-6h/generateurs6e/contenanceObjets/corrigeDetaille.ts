import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceContenanceObjets } from "../../core6e/contenanceObjets.types";
import { contenanceUnite, evaluerPolynomeExact, frac, primitivePolynome, rayonProfil, uniteContenance, valeur, volumeCm3, volumeSecond } from "../../core6e/contenanceObjetsCalcul";
import { PHASES_CONTENANCE } from "../../moteur6e/typesContenanceObjets";
import type { PhaseContenance } from "../../moteur6e/typesContenanceObjets";
import { aideNiveau1, carreLatex, fLatex, fracLatex, formatReponseAttenduePhaseLatex, hauteurLatex, multiplePiLatex, nombreLatex, paroiEpaisse, primitiveLatex, verdictComparaison } from "../../ui6e/formatContenanceObjets";
import { figureCorrigeSvg } from "../../ui6e/figureContenanceObjets";
import { COURS_VOLUMES } from "../../ui6e/corrigeIntegrales2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen83` (contenance d'objets de révolution) — règle
 * `.claude/rules/feuilles-evaluations.md`. Cinq étapes = cinq écrans : a) modèle (méthode des
 * disques), b) bornes et carré du profil développé ligne à ligne, c) primitive entre crochets,
 * F(b) − F(a), multiple de π, d) conversion, e) transfert (hauteur de liquide, nombre de récipients
 * ou comparaison). Valeurs exactes tirées du moteur (`contenanceObjetsCalcul.ts`) et réponses de
 * l'écran (`formatReponseAttenduePhaseLatex`).
 */

type E = ExerciceContenanceObjets;
const t = texte;
const f = latex;
const LETTRES = "abcde";
const n = (x: number, d = 2) => nombreLatex(x, d);
const CM3 = "\\text{ cm}^3";

function par(x: string): string {
  return x.startsWith("-") ? `(${x})` : x;
}

function phraseAide(e: E, phase: PhaseContenance, renvoi = ""): FragmentConsigne[] {
  const a = aideNiveau1(e, phase);
  const fin = renvoi ? ` ${renvoi}.` : ".";
  return a.latex ? [t(`${a.texte.replace(/\s*:$/, "")} : `), f(a.latex), t(fin)] : [t(a.texte.replace(/\.$/, "") + fin)];
}

// ============================================================================
// b) Bornes et carré du profil.
// ============================================================================

function lignesBornes(e: E): { texte: FragmentConsigne[]; lignes: LigneCalcul[] } {
  const T = n(e.hauteurTotale, 1);
  const hc = n(e.horsCavite, 1);
  if (e.objet === "tonneau") {
    return {
      texte: [t("x part du milieu du tonneau, qui s'étend d'une demi-hauteur de chaque côté.")],
      lignes: [ligne(`a=-\\dfrac{${T}}{2}`, "demi-hauteur, côté gauche"), ligne(`=${n(e.a)}`), ligne(`b=\\dfrac{${T}}{2}`, "demi-hauteur, côté droit"), ligne(`=${n(e.b)}`)],
    };
  }
  if (e.objet === "flacon") {
    const h = e.b - e.a;
    return {
      texte: [t("x part du centre du réservoir ; le réservoir mesure la hauteur totale moins le bouchon et s'étend de part et d'autre de l'origine.")],
      lignes: [ligne(`${T}-${hc}=${n(h)}`, "hauteur du réservoir"), ligne(`a=-\\dfrac{${n(h)}}{2}`), ligne(`=${n(e.a)}`), ligne(`b=\\dfrac{${n(h)}}{2}`), ligne(`=${n(e.b)}`)],
    };
  }
  const quoi = e.objet === "verre" ? "le pied" : "le fond";
  return {
    texte: [t(`x part du fond intérieur ; la partie qui contient le liquide mesure la hauteur totale moins ${quoi}.`)],
    lignes: [ligne("a=0", "fond intérieur"), ligne(`b=${T}-${hc}`, `hauteur totale moins ${quoi}`), ligne(`=${n(e.b)}`)],
  };
}

function lignesCarre(e: E): LigneCalcul[] {
  const p = e.profil;
  const carre = `=${carreLatex(e)}`;
  switch (p.type) {
    case "racine": {
      const k = Math.round(Math.sqrt(p.a));
      return k * k === p.a
        ? [ligne(`[f(x)]^2=\\left(${k}\\sqrt{x}\\right)^2`, "on élève le profil au carré"), ligne(`=${k}^2\\times x`, "le carré porte sur le coefficient et sur la racine"), ligne(carre)]
        : [ligne(`[f(x)]^2=\\left(\\sqrt{${p.a}x}\\right)^2`, "on élève le profil au carré"), ligne(carre, "le carré annule la racine")];
    }
    case "parabole":
    case "bombe": {
      const c = p.type === "parabole" ? p.r : p.R;
      const s = p.type === "parabole" ? "+" : "-";
      return [
        ligne(`[f(x)]^2=\\left(${fLatex(e)}\\right)^2`, "on élève le profil au carré"),
        ligne(`=${c}^2${s}2\\times ${c}\\times\\dfrac{x^2}{${p.n}}+\\left(\\dfrac{x^2}{${p.n}}\\right)^2`, `(p ${s === "+" ? "+" : "−"} q)² = p² ${s === "+" ? "+" : "−"} 2pq + q²`),
        ligne(carre),
      ];
    }
    case "ellipse": {
      const k = frac(p.b, p.a);
      return [
        ligne(`[f(x)]^2=\\left(${fLatex(e)}\\right)^2`, "on élève le profil au carré"),
        ligne(`=${par(fracLatex(frac(k.num * k.num, k.den * k.den)))}\\left(${p.a * p.a}-x^2\\right)`, "le carré porte sur le coefficient et sur la racine"),
        ligne(carre, "on distribue"),
      ];
    }
    case "droite": {
      const m = frac(p.R - p.r, p.h);
      return [
        ligne(`[f(x)]^2=\\left(${fLatex(e)}\\right)^2`, "on élève le profil au carré"),
        ligne(`=${p.r}^2+2\\times ${p.r}\\times ${fracLatex(m)}x+\\left(${fracLatex(m)}x\\right)^2`, "(p + q)² = p² + 2pq + q²"),
        ligne(carre),
      ];
    }
  }
}

function lignesProfilPot(e: E): LigneCalcul[] {
  const p = e.profil;
  if (p.type !== "droite") return [];
  return [
    ligne(`r=\\dfrac{${2 * p.r}}{2}`, "rayon du fond : la moitié du diamètre"),
    ligne(`=${p.r}`),
    ligne(`R=\\dfrac{${2 * p.R}}{2}`, "rayon de l'ouverture"),
    ligne(`=${p.R}`),
    ligne(`f(x)=${p.r}+\\dfrac{${p.R}-${p.r}}{${p.h}}\\,x`, "le rayon varie de façon affine de r à R sur la profondeur h"),
    ligne(`=${fLatex(e)}`),
  ];
}

// ============================================================================
// c) Calcul de l'intégrale.
// ============================================================================

function lignesCalculer(e: E): LigneCalcul[] {
  const P = primitivePolynome(e.carre);
  const Fb = evaluerPolynomeExact(P, frac(Math.round(e.b * 1000), 1000));
  const Fa = evaluerPolynomeExact(P, frac(Math.round(e.a * 1000), 1000));
  return [
    ligne(`V=\\pi\\displaystyle\\int_{${n(e.a)}}^{${n(e.b)}}\\left(${carreLatex(e)}\\right)dx`, "étape 2"),
    ligne(`=\\pi\\left[${primitiveLatex(e)}\\right]_{${n(e.a)}}^{${n(e.b)}}`, "primitive terme à terme"),
    ligne(`=\\pi\\left(${fracLatex(Fb)}-${par(fracLatex(Fa))}\\right)`, "F(b) − F(a)"),
    ligne(`=${multiplePiLatex(e.volumeSurPi)}${CM3}`),
    ligne(`\\approx ${n(volumeCm3(e), 1)}${CM3}`),
  ];
}

// ============================================================================
// e) Transfert.
// ============================================================================

function etapeTransfert(e: E, sq: string): EtapeCorrection[] {
  const res = { ...resultat(sq, reponseTransfert(e)), figureHtml: figureCorrigeSvg(e) };
  if (e.transfert === "hauteur") {
    const h = e.b - e.a;
    if (e.fraction && e.profil.type === "racine") {
      const a = e.profil.a;
      const exact = hauteurLatex(e).replace(/^t/, "").replace(/\\text\{ cm\}$/, "");
      return [
        utilise(sq, [t("Le liquide occupe le solide de 0 à t ; on égale son volume à la fraction de la contenance "), t(COURS_VOLUMES + ".")]),
        calcul(sq, [
          ligne(`V(t)=\\pi\\displaystyle\\int_0^{t}${a}x\\,dx`, "méthode des disques de 0 à t"),
          ligne(`=\\dfrac{${a}\\pi t^2}{2}`, "primitive, valeur en 0 nulle"),
          ligne(`\\dfrac{${a}\\pi t^2}{2}=${fracLatex(e.fraction)}\\times\\dfrac{${a}\\pi\\times ${h}^2}{2}`, "le liquide remplit cette fraction de la contenance"),
          ligne(`t^2=${fracLatex(e.fraction)}\\times ${h}^2`, [t("on divise par "), f(`\\dfrac{${a}\\pi}{2}`)]),
          ligne(`t${exact}`, "t > 0"),
        ]),
        res,
        piege(sq, [t("Croire la hauteur proportionnelle au volume (la coupe s'élargit vers le haut).")]),
      ];
    }
    const cm3 = e.objet === "pot" ? e.quantite * 1000 : e.quantite * 10;
    const conv = e.objet === "pot" ? `${n(e.quantite, 1)}\\text{ L}=${n(cm3, 0)}${CM3}` : `${n(e.quantite, 0)}\\text{ cL}=${n(cm3, 0)}${CM3}`;
    return [
      utilise(sq, [...phraseAide(e, "transfert", COURS_VOLUMES)]),
      calcul(sq, [
        ligne(conv, e.objet === "pot" ? "1 L = 1 000 cm³" : "1 cL = 10 cm³"),
        ligne(`V(t)=\\pi\\displaystyle\\int_0^{t}\\left(${carreLatex(e)}\\right)dx`, "méthode des disques de 0 à t"),
        ligne(`=\\pi\\left(${primitiveLatex(e, "t")}\\right)`, "F(t) − F(0), avec F(0) = 0"),
        ligne(`\\pi\\left(${primitiveLatex(e, "t")}\\right)=${n(cm3, 0)}`, "le contenu occupe le solide de 0 à t"),
        ligne(`t\\approx ${n(e.hauteurLiquide, 1)}`, "résolution à la calculatrice"),
      ]),
      res,
      piege(sq, [t("Oublier de convertir la quantité versée en cm³ avant de résoudre.")]),
    ];
  }
  if (e.transfert === "nombre") {
    const V = volumeCm3(e);
    const s = e.source?.cm3 ?? 1;
    const contenu = e.objet === "vase" || e.objet === "tonneau";
    const Vr = Math.round(V * 10) / 10;
    const q = contenu ? Vr / s : s / Vr;
    return [
      utilise(sq, phraseAide(e, "transfert", COURS_VOLUMES)),
      calcul(sq, [
        ligne(contenu ? `\\dfrac{${n(V, 1)}}{${n(s, 0)}}\\approx ${n(q, 2)}` : `\\dfrac{${n(s, 0)}}{${n(V, 1)}}\\approx ${n(q, 2)}`, "les deux volumes en cm³"),
        ligne(`n=${e.nombre}`, e.arrondi === "ceil" ? "le dernier récipient, même incomplet, est nécessaire : entier supérieur" : "seuls les récipients pleins comptent : partie entière"),
      ]),
      res,
      piege(sq, [t(e.arrondi === "ceil" ? "Arrondir à l'entier inférieur : le vase ne serait pas plein." : "Arrondir à l'entier le plus proche : le dernier récipient ne serait pas plein.")]),
    ];
  }
  const d = e.second!;
  const rho = frac(Math.round(d.diametre * 10), 20);
  const V2 = e.secondSurPi ?? frac(0);
  const signe = valeur(e.volumeSurPi) > valeur(V2) ? ">" : "<";
  return [
    utilise(sq, phraseAide(e, "transfert", COURS_VOLUMES)),
    calcul(sq, [
      ligne(`\\rho=\\dfrac{${n(d.diametre, 1)}}{2}`, "rayon : la moitié du diamètre"),
      ligne(`=${fracLatex(rho)}`),
      ligne(`V_2=${d.forme === "cone" ? "\\dfrac{1}{3}" : ""}\\pi\\left(${fracLatex(rho)}\\right)^2\\times ${n(d.hauteur, 1)}`, d.forme === "cone" ? "volume d'un cône" : "volume d'un cylindre"),
      ligne(`=${multiplePiLatex(V2)}`),
      ligne(`\\approx ${n(volumeSecond(e), 1)}${CM3}`),
      ligne(`${multiplePiLatex(e.volumeSurPi)}${signe}${multiplePiLatex(V2)}`, "contenance (étape 3) comparée à V₂ : π se simplifie"),
    ]),
    res,
    piege(sq, [t("Prendre le diamètre pour le rayon : le volume du second récipient serait multiplié par 4.")]),
  ];
}

function reponseTransfert(e: E): FragmentConsigne[] {
  const formules = [f(formatReponseAttenduePhaseLatex(e, "transfert").join(",\\quad "))];
  if (e.transfert === "comparer") return [...formules, t(" — "), ...verdictComparaison(e)];
  return formules;
}

/** Ordre de grandeur : V entre les cylindres de même hauteur de plus petit et de plus grand rayon. */
function verificationOrdreGrandeur(e: E, sq: string): EtapeCorrection {
  const rayons = Array.from({ length: 201 }, (_, k) => rayonProfil(e.profil, e.a + ((e.b - e.a) * k) / 200));
  const rmin = Math.min(...rayons);
  const rmax = Math.max(...rayons);
  const h = e.b - e.a;
  const vmin = Math.PI * rmin * rmin * h;
  const vmax = Math.PI * rmax * rmax * h;
  return verification(
    sq,
    [t("Ordre de grandeur : le volume est compris entre ceux des cylindres de hauteur "), f(n(h, 1)), t(" de plus petit et de plus grand rayon du profil ("), f(n(rmin, 2)), t(" et "), f(n(rmax, 2)), t(") :")],
    [ligne(`${n(vmin, 1)}\\leq ${n(volumeCm3(e), 1)}\\leq ${n(vmax, 1)}`, "✓")],
  );
}

// ============================================================================
// Assemblage.
// ============================================================================

export function correctionDetailleeContenanceObjets(e: E): EtapeCorrection[] {
  return PHASES_CONTENANCE.flatMap((phase, i): EtapeCorrection[] => {
    const sq = LETTRES[i]!;
    const reponse = [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))];
    switch (phase) {
      case "modele":
        return [
          utilise(sq, phraseAide(e, "modele", COURS_VOLUMES)),
          calcul(sq, [ligne("S(x)=\\pi[f(x)]^2", "aire du disque de rayon f(x)"), ligne("V=\\displaystyle\\int_a^b S(x)\\,dx", "on additionne les tranches de a à b"), ligne("=\\pi\\displaystyle\\int_a^b [f(x)]^2\\,dx", "méthode des disques")]),
          resultat(sq, reponse),
          piege(sq, [t(paroiEpaisse(e) ? "Prendre des rondelles entre le profil extérieur et f : on obtiendrait le volume de la paroi, pas la contenance." : "Oublier π ou le carré : l'aire d'une tranche est π[f(x)]².")]),
        ];
      case "poser": {
        const b = lignesBornes(e);
        const blocs: EtapeCorrection[] = [calcul(sq, b.lignes, [], "Bornes")];
        if (e.objet === "pot") blocs.push(calcul(sq, lignesProfilPot(e), [t("Les cotes Ø sont des diamètres :")], "Profil"));
        else blocs.push(calcul(sq, lignesCarre(e), [], "Carré du profil"));
        return [
          utilise(sq, [...b.texte, t(e.objet === "pot" ? " Le rayon varie de façon affine du fond à l'ouverture." : " Puis on élève le profil au carré.")]),
          ...blocs,
          resultat(sq, reponse),
          piege(sq, [t(e.objet === "pot" ? "Prendre les diamètres pour des rayons (le volume serait multiplié par 4)." : e.a === 0 ? "Prendre la hauteur totale de l'objet comme borne supérieure." : "Intégrer à partir de 0 alors que x est mesuré depuis le milieu : les bornes sont symétriques.")]),
        ];
      }
      case "calculer":
        return [
          utilise(sq, phraseAide(e, "calculer", COURS_VOLUMES)),
          ...(e.objet === "pot" ? [calcul(sq, lignesCarre(e), [], "Carré du profil")] : []),
          calcul(sq, lignesCalculer(e), [], "Volume"),
          resultat(sq, reponse),
          verificationOrdreGrandeur(e, sq),
          piege(sq, [t("Oublier le facteur π devant l'intégrale.")]),
        ];
      case "convertir": {
        const u = uniteContenance(e);
        const v = volumeCm3(e);
        return [
          utilise(sq, phraseAide(e, "convertir")),
          calcul(sq, [
            ligne(`V\\approx ${n(v, 1)}${CM3}`, "étape 3"),
            ligne(`\\approx\\dfrac{${n(v, 1)}}{${u === "cL" ? "10" : "1\\,000"}}\\text{ ${u}}`, u === "cL" ? "1 cL = 10 cm³" : "1 L = 1 000 cm³"),
            ligne(`\\approx ${n(contenanceUnite(e), u === "cL" ? 1 : 2)}\\text{ ${u}}`),
          ]),
          resultat(sq, reponse),
          piege(sq, [t("Diviser par 100 au lieu de 1 000 : 1 dm³ = 1 000 cm³.")]),
        ];
      }
      case "transfert":
        return etapeTransfert(e, sq);
    }
  });
}

