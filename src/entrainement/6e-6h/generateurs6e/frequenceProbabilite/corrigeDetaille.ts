import type { ExerciceFrequenceProbabilite } from "../../core6e/frequenceProbabilite.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { phasesPourExercice } from "../../moteur6e/typesFrequenceProbabilite";
import type { PhaseFrequenceProbabilite } from "../../moteur6e/typesFrequenceProbabilite";
import { casModele, couplesDeSomme, ecartRelatif, effectifAttendu, effectifEvenement, frequenceObservee, probabiliteModele, probabiliteNaiveB, seuilRelatif, utiliseModeleEcran4, verdictAttendu } from "../../moteur6e/verificationFrequenceProbabilite";
import { decimal, entierLatex, entierTexte, reponseAttendueFragments } from "../../ui6e/formatFrequenceProbabilite";
import { svgDiagrammeFrequences, svgGrilleSommes } from "../../ui6e/figuresFrequenceProbabilite";
import { COURS_ENSEMBLES, calcul, finaliser, latex, ligne, pgcd, piege, resultat, texte, utiliseCours } from "../../ui6e/corrigeProbabilites";

/**
 * Corrigé détaillé « comme au tableau » de `6gen75` (Fréquence et probabilité) — partagé par
 * l'adaptateur papier et le générateur interactif (étape révélée). Une lettre par écran (a–d).
 * L'écart relatif est calculé avec les valeurs EXACTES (fractions), jamais avec la fréquence
 * arrondie ; sa comparaison au seuil suit le verdict exact du moteur (`verdictAttendu`).
 */

type Ex = ExerciceFrequenceProbabilite;
type Fragments = FragmentConsigne[];
const LETTRES = "abcd";
const COURS = COURS_ENSEMBLES;
const ent = (n: number) => entierLatex(n);

export function lettreEcranFrequenceProbabilite(e: Ex, phase: PhaseFrequenceProbabilite): string {
  return LETTRES[phasesPourExercice(e).indexOf(phase)];
}

function reponse(e: Ex, phase: PhaseFrequenceProbabilite): Fragments {
  return reponseAttendueFragments(e, phase).map((f) => (f.type === "texte" ? texte(f.valeur) : latex(f.valeur)));
}

function frac(n: number, d: number): string {
  const g = pgcd(n, d);
  return d / g === 1 ? ent(n / g) : `\\dfrac{${ent(n / g)}}{${ent(d / g)}}`;
}

/** « gauche = n/d », simplifiée si elle diffère. */
function lignesFrac(gauche: string, n: number, d: number, justification: string | Fragments): LigneCalcul[] {
  const lignes = [ligne(`${gauche}=\\dfrac{${ent(n)}}{${ent(d)}}`, justification)];
  if (pgcd(n, d) > 1) lignes.push(ligne(`=${frac(n, d)}`, `on simplifie par ${pgcd(n, d)}`));
  return lignes;
}

/** Écart relatif |f − p| / p calculé avec les fractions exactes, puis comparé au seuil. */
function lignesEcart(e: Ex, pNum: number, pDen: number, conforme: boolean): LigneCalcul[] {
  const c = effectifEvenement(e);
  const p = pNum / pDen;
  const r = ecartRelatif(frequenceObservee(e), p);
  const seuil = seuilRelatif(e.n);
  const pL = frac(pNum, pDen);
  return [
    ligne(`\\dfrac{|f-p|}{p}=\\dfrac{\\left|${frac(c, e.n)}-${pL}\\right|}{${pL}}`, "valeurs exactes"),
    ligne(`\\approx ${decimal(r, 4)}`, "calculatrice"),
    ligne(`${decimal(r, 4)}${conforme ? "\\leq " : ">"}${decimal(seuil, 2)}`, `seuil de ${Math.round(seuil * 100)} % pour ${entierTexte(e.n)} essais`),
  ];
}

export function correctionDetailleeFrequenceProbabilite(e: Ex): EtapeCorrection[] {
  const [a, b, c, d] = LETTRES.split("");
  const etapes: EtapeCorrection[] = [];
  const eff = effectifEvenement(e);
  // ---- a) probabilité a priori
  if (e.famille === "A") {
    const k = e.evenement.faces.length;
    etapes.push(
      utiliseCours(a, [texte("Dé équilibré : les 6 faces sont équiprobables, "), latex("P(E)=\\dfrac{\\text{nombre de faces favorables}}{6}")], COURS),
      calcul(a, lignesFrac("P(E)", k, 6, `faces ${e.evenement.faces.join(", ")}`)),
      resultat(a, reponse(e, "ecran1")),
      piege(a, [texte("Oublier une face qui réalise E.")]),
    );
  } else if (e.famille === "B") {
    const cas = casModele(e)!;
    const parSomme = e.evenement.sommes.map(couplesDeSomme);
    etapes.push(
      utiliseCours(a, [texte("Deux dés équilibrés : les 36 couples (dé 1 ; dé 2) de la grille sont équiprobables, pas les 11 sommes")], COURS),
      calcul(a, [...(parSomme.length > 1 ? [ligne(`n(E)=${parSomme.join("+")}`, `cases des sommes ${e.evenement.sommes.join(", ")}`), ligne(`=${cas.favorables}`)] : [ligne(`n(E)=${cas.favorables}`, `cases de la somme ${e.evenement.sommes[0]}`)]), ...lignesFrac("P(E)", cas.favorables, 36, "cases sur 36 couples")]),
      { ...resultat(a, reponse(e, "ecran1")), figureHtml: svgGrilleSommes(e.evenement.sommes) },
      piege(a, [texte("Croire les 11 sommes équiprobables et répondre "), latex(frac(e.evenement.sommes.length, 11)), texte(" : ce sont les 36 couples qui sont équiprobables.")]),
    );
  } else {
    etapes.push(
      utiliseCours(a, [texte("Une probabilité se calcule a priori seulement si les issues sont équiprobables ; sinon, on l'estime par une fréquence observée sur un grand nombre d'essais")], COURS),
      calcul(a, [ligne("n(\\Omega)=2", `${e.objet.issue} ou ${e.objet.autreIssue}, mais ${e.objet.sujet} n'est pas symétrique : ces issues ne sont pas équiprobables`)]),
      resultat(a, reponse(e, "ecran1")),
      piege(a, [texte("Répondre « une chance sur deux » parce qu'il y a deux issues : rien ne garantit qu'elles sont équiprobables.")]),
    );
  }
  // ---- b) fréquence observée
  const termes = e.famille === "A" ? e.evenement.faces.map((k) => e.effectifs[k - 1]) : e.famille === "B" ? e.evenement.sommes.map((s) => e.effectifs[s - 2]) : [eff];
  const f = frequenceObservee(e);
  etapes.push(
    utiliseCours(b, [texte("Fréquence observée : "), latex("f=\\dfrac{\\text{effectif de E}}{\\text{nombre d'essais}}")], COURS),
    calcul(b, [
      ...(termes.length > 1 ? [ligne(`n_E=${termes.map(ent).join("+")}`, "effectifs du tableau"), ligne(`=${ent(eff)}`)] : [ligne(`n_E=${ent(eff)}`, "effectif lu dans l'énoncé")]),
      ...lignesFrac("f", eff, e.n, `sur ${entierTexte(e.n)} essais`),
      ligne(Math.abs(f * 1000 - Math.round(f * 1000)) < 1e-9 ? `=${decimal(f, 3)}` : `\\approx ${decimal(f, 3)}`, "valeur décimale"),
    ]),
    resultat(b, reponse(e, "ecran2")),
    piege(b, [texte("Diviser l'effectif par le nombre d'issues au lieu du nombre total d'essais.")]),
  );
  // ---- c) règle de décision
  const verdict = verdictAttendu(e);
  const cas = casModele(e);
  const lignesC: LigneCalcul[] = [];
  if (e.famille === "B") {
    const naive = probabiliteNaiveB(e)!;
    lignesC.push(...lignesEcart(e, cas!.favorables, 36, verdict === "compatible"));
    lignesC.push(...lignesEcart(e, e.evenement.sommes.length, 11, ecartRelatif(f, naive) <= seuilRelatif(e.n)));
  } else if (e.famille === "A") {
    lignesC.push(...lignesEcart(e, cas!.favorables, 6, verdict === "compatible"));
  } else {
    lignesC.push(...lignesEcart(e, e.affirmation.num, e.affirmation.den, verdict === "compatible"));
  }
  etapes.push(
    utiliseCours(c, [texte("Règle de décision : l'écart entre f et p est significatif quand l'écart relatif "), latex("\\dfrac{|f-p|}{p}"), texte(` dépasse le seuil de la règle (${Math.round(seuilRelatif(e.n) * 100)} % pour ${entierTexte(e.n)} essais)`)], COURS),
    calcul(c, lignesC, e.famille === "B" ? [texte("Modèle de la grille, puis sommes équiprobables :")] : []),
    { ...resultat(c, reponse(e, "ecran3")), figureHtml: svgDiagrammeFrequences(e) },
    piege(c, e.famille === "B" ? [texte("Rejeter un modèle parce que la fréquence n'est pas exactement égale à sa probabilité : seule la taille de l'écart relatif compte.")] : [texte(`Conclure « ${e.famille === "A" ? "truqué" : "faux"} » dès que f est différente de p : une fréquence fluctue toujours.`)]),
  );
  // ---- d) effectif attendu
  const modele = utiliseModeleEcran4(e);
  const facteur = modele ? frac(Math.round(probabiliteModele(e) * 3600), 3600) : frac(eff, e.n);
  etapes.push(
    utiliseCours(d, [texte("Effectif attendu sur N essais : "), latex("N\\times p"), texte(modele ? ", avec la probabilité du modèle retenu (valeur exacte)" : ", avec la fréquence observée en fraction exacte (le modèle n'est pas retenu, ou il n'existe pas)")], COURS),
    calcul(d, [ligne(`N\\times ${modele ? "p" : "f"}=${ent(e.nouveauxEssais)}\\times ${facteur}`, modele ? "probabilité du modèle" : "fréquence observée"), ligne(`=${ent(effectifAttendu(e))}`)]),
    resultat(d, reponse(e, "ecran4")),
    piege(d, [texte(modele ? "Utiliser la fréquence observée (ou une probabilité arrondie) alors que le modèle est confirmé." : e.famille === "C" ? "Utiliser la valeur affirmée au lieu de la fréquence observée, ou une fréquence arrondie." : "Utiliser la probabilité du modèle alors qu'il est rejeté, ou une fréquence arrondie.")]),
  );
  return finaliser(etapes);
}
