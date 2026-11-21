/**
 * Document « Examen » (décisions de l'utilisateur, maquette X3 « Sans page de garde ») — fonctions
 * PURES, partagées par le panneau de conception, le pipeline (`lib/evaluationLocal.ts`), les
 * documents HTML / Word et la remédiation (`lib/evaluationRemediation.ts`) : un seul calcul des
 * parties, de la numérotation, de la mise à l'échelle des points et de l'horaire, donc jamais deux
 * versions qui se contredisent. Aucun import de React, de KaTeX ni du DOM (testable avec esbuild).
 *
 * - Organisation : « par chapitre » (une partie par chapitre du plan, dans l'ordre du plan ; chaque
 *   question porte son PROCESSUS en étiquette) ou « par processus » (I Connaître, II Appliquer,
 *   III Transférer, seulement celles qui ont des questions ; chaque question porte son CHAPITRE).
 *   Numérotation CONTINUE d'une partie à l'autre.
 * - Vrai/faux : toujours UNE question (règle existante). Par chapitre, si ses affirmations viennent
 *   de plusieurs chapitres, elle forme sa propre partie « Vrai ou faux », placée EN PREMIER (c'est
 *   une question « Connaître », comme dans l'ordre par processus de l'évaluation) ; sinon elle va
 *   dans la partie de son chapitre.
 * - Total fixé : les points des questions d'une partie sont mis à l'échelle (demi-points, somme
 *   exacte, jamais 0 pt) ; total libre : points tels quels.
 */

export type OrganisationExamen = "chapitre" | "processus";

/** Total de l'examen : libre (points tels quels) ou fixé PAR PARTIE (clé = `PartieExamen.cle`). */
export type TotalExamen = { mode: "libre" } | { mode: "fixe"; parPartie: Record<string, number> };

export interface ChapitreExamen {
  slug: string;
  titre: string;
  /** Titre court (étiquette des questions, tableau des points). */
  titreCourt: string;
}

/** Ce que l'ordonnancement doit savoir d'une question (item rendu, élément de plan…). */
export interface QuestionOrdonnable {
  processus: 1 | 2 | 3;
  /** Chapitres d'origine (un seul, sauf la question vrai/faux regroupée). */
  chapitres: string[];
}

export interface PartieExamen<T> {
  /** Clé stable : « chapitre:<slug> », « vraiFaux », « processus:<n> », « autres ». */
  cle: string;
  /** Numéro romain (« I », « II »…). */
  romain: string;
  titre: string;
  titreCourt: string;
  questions: { element: T; numero: number }[];
}

export const NOM_PROCESSUS_EXAMEN: Record<1 | 2 | 3, string> = { 1: "Connaître", 2: "Appliquer", 3: "Transférer" };

const ROMAINS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function romain(n: number): string {
  return ROMAINS[n - 1] ?? String(n);
}

/** Titres courts des chapitres (étiquettes « LOGARITHMES »…) ; repli : titre sans article, coupé
 * avant « et », « & » ou « : ». */
const TITRES_COURTS: Record<string, string> = {
  "fonction-second-degre": "Fonction du second degré",
  "equations-inequations-second-degre": "Équations du second degré",
  "caracteristiques-fonctions-reference": "Fonctions de référence",
  "statistique-descriptive": "Statistique",
  "cercle-trigonometrique-triangles": "Trigonométrie",
  "calcul-vectoriel": "Vecteurs",
  "geometrie-analytique-plane": "Géométrie analytique",
  "geometrie-dans-espace": "Géométrie dans l'espace",
  "fonctions-composees": "Fonctions",
  trigonometrie: "Trigonométrie",
  suites: "Suites",
  "limites-asymptotes": "Limites",
  "derivees-applications": "Dérivées",
  "fonctions-reciproques-cyclometriques": "Fonctions réciproques",
  "fonctions-exponentielles": "Exponentielles",
  "fonctions-logarithmes": "Logarithmes",
  "primitives-integrales": "Intégrales",
  "nombres-complexes": "Nombres complexes",
  probabilites: "Probabilités",
  "analyse-combinatoire": "Combinatoire",
  "variables-aleatoires": "Variables aléatoires",
  "lieux-geometriques": "Lieux géométriques",
  coniques: "Coniques",
};

export function titreCourtChapitre(slug: string, titre: string): string {
  const connu = TITRES_COURTS[slug];
  if (connu) return connu;
  const sansArticle = titre.replace(/^(La|Le|Les|L')\s*/i, "");
  const coupe = sansArticle.split(/\s+(?:et|&)\s+|\s*:\s*/)[0] ?? sansArticle;
  return coupe.charAt(0).toUpperCase() + coupe.slice(1);
}

/**
 * Parties de l'examen et numérotation continue. `elements` dans l'ordre du plan (ordre des items
 * de `itemsDepuisSerie` : la question vrai/faux au rang du premier vrai/faux) ; tri STABLE.
 * - par processus : exactement l'ordre (et donc la numérotation) de la copie d'évaluation ;
 * - par chapitre : partie « Vrai ou faux » d'abord si le vrai/faux couvre plusieurs chapitres,
 *   puis une partie par chapitre (ordre de `chapitres`), questions rangées par processus.
 */
export function partiesExamen<T>(elements: T[], acces: (t: T) => QuestionOrdonnable, organisation: OrganisationExamen, chapitres: ChapitreExamen[]): PartieExamen<T>[] {
  const brouillons: { cle: string; titre: string; titreCourt: string; elements: T[] }[] = [];
  const parProcessus = (liste: T[]) => ([1, 2, 3] as const).flatMap((p) => liste.filter((e) => acces(e).processus === p));
  if (organisation === "processus") {
    for (const p of [1, 2, 3] as const) {
      const liste = elements.filter((e) => acces(e).processus === p);
      if (liste.length > 0) brouillons.push({ cle: `processus:${p}`, titre: NOM_PROCESSUS_EXAMEN[p], titreCourt: NOM_PROCESSUS_EXAMEN[p], elements: liste });
    }
  } else {
    const multi = elements.filter((e) => acces(e).chapitres.length > 1);
    if (multi.length > 0) brouillons.push({ cle: "vraiFaux", titre: "Vrai ou faux", titreCourt: "Vrai ou faux", elements: parProcessus(multi) });
    const simples = elements.filter((e) => acces(e).chapitres.length <= 1);
    const connus = new Set(chapitres.map((c) => c.slug));
    for (const c of chapitres) {
      const liste = simples.filter((e) => acces(e).chapitres[0] === c.slug);
      if (liste.length > 0) brouillons.push({ cle: `chapitre:${c.slug}`, titre: c.titre, titreCourt: c.titreCourt, elements: parProcessus(liste) });
    }
    const autres = simples.filter((e) => !connus.has(acces(e).chapitres[0] ?? ""));
    if (autres.length > 0) brouillons.push({ cle: "autres", titre: "Autres questions", titreCourt: "Autres", elements: parProcessus(autres) });
  }
  let numero = 0;
  return brouillons.map((b, i) => ({ cle: b.cle, romain: romain(i + 1), titre: b.titre, titreCourt: b.titreCourt, questions: b.elements.map((element) => ({ element, numero: ++numero })) }));
}

/** Étiquette d'une question : son processus (parties par chapitre) ou son chapitre (parties par
 * processus ; deux chapitres au plus nommés, au-delà « Plusieurs chapitres »). */
export function etiquetteQuestion(q: QuestionOrdonnable, organisation: OrganisationExamen, chapitres: ChapitreExamen[]): string {
  if (organisation === "chapitre") return NOM_PROCESSUS_EXAMEN[q.processus];
  const noms = chapitres.filter((c) => q.chapitres.includes(c.slug)).map((c) => c.titreCourt);
  if (noms.length === 0) return "";
  return noms.length <= 2 ? noms.join(" · ") : "Plusieurs chapitres";
}

/** Ligne grise sous le titre d'une partie : ce qu'elle couvre (processus ou chapitres) et ses
 * numéros de questions (« Connaître · Appliquer — questions 1 à 4 »). */
export function lignePartie<T>(partie: PartieExamen<T>, acces: (t: T) => QuestionOrdonnable, organisation: OrganisationExamen, chapitres: ChapitreExamen[]): string {
  const qs = partie.questions;
  let couvre: string[];
  if (organisation === "chapitre") {
    couvre = ([1, 2, 3] as const).filter((p) => qs.some((q) => acces(q.element).processus === p)).map((p) => NOM_PROCESSUS_EXAMEN[p]);
    if (partie.cle === "vraiFaux") couvre = chapitres.filter((c) => qs.some((q) => acces(q.element).chapitres.includes(c.slug))).map((c) => c.titreCourt);
  } else {
    couvre = chapitres.filter((c) => qs.some((q) => acces(q.element).chapitres.includes(c.slug))).map((c) => c.titreCourt);
  }
  const premier = qs[0]?.numero ?? 0;
  const dernier = qs[qs.length - 1]?.numero ?? 0;
  const numeros = qs.length <= 1 ? `question ${premier}` : `questions ${premier} à ${dernier}`;
  return couvre.length > 0 ? `${couvre.join(" · ")} — ${numeros}` : numeros;
}

/* ----------------------------------------------------------------------------------------------
 * Mise à l'échelle des points (total fixé)
 * -------------------------------------------------------------------------------------------- */

/**
 * Points d'une partie ramenés au total voulu : proportionnels, arrondis au DEMI-POINT, jamais 0 pt
 * (au moins 0,5), somme EXACTE — le reste est corrigé sur la plus grosse question ; si cette
 * correction la ferait passer sous 0,5, le surplus est retiré demi-point par demi-point aux autres
 * questions, des plus grosses aux plus petites. `null` si le total est impossible (moins de 0,5 pt
 * par question, ou total non multiple de 0,5).
 */
export function mettreAEchelle(points: number[], total: number): number[] | null {
  const n = points.length;
  if (n === 0) return [];
  const unites = Math.round(total * 2);
  if (!Number.isFinite(total) || Math.abs(unites - total * 2) > 1e-9 || unites < n) return null;
  const somme = points.reduce((s, p) => s + Math.max(0, p), 0);
  const poids = somme > 0 ? points.map((p) => Math.max(0, p)) : points.map(() => 1);
  const sommePoids = somme > 0 ? somme : n;
  const bruts = poids.map((p) => (p / sommePoids) * unites);
  const res = bruts.map((b) => Math.max(1, Math.round(b + 1e-9)));
  // Plus grosse question (au poids d'origine ; à égalité, la première).
  let k = 0;
  bruts.forEach((b, i) => {
    if (b > bruts[k] + 1e-12) k = i;
  });
  res[k] += unites - res.reduce((s, r) => s + r, 0);
  if (res[k] < 1) {
    let deficit = 1 - res[k];
    res[k] = 1;
    const ordre = res.map((_, i) => i).filter((i) => i !== k).sort((a, b) => res[b] - res[a] || a - b);
    while (deficit > 0) {
      let retire = false;
      for (const i of ordre) {
        if (deficit === 0) break;
        if (res[i] > 1) {
          res[i]--;
          deficit--;
          retire = true;
        }
      }
      if (!retire) return null;
    }
  }
  return res.map((u) => u / 2);
}

/**
 * `mettreAEchelle` quand chaque valeur vaut pour PLUSIEURS questions (panneau : « Ajuster au total »
 * — une variante de 3 exercices à 2 pts chacun, un vrai/faux de 4 affirmations à 1 pt) : renvoie les
 * points PAR QUESTION de chaque groupe, avec Σ nombres[k] × res[k] = total EXACTEMENT, mêmes règles
 * (proportionnels, demi-points, jamais 0 pt). Tous les groupes d'une question : `mettreAEchelle`
 * lui-même. Sinon, le reste (en demi-points) est corrigé par les plus petits pas possibles, en
 * commençant par les plus gros groupes ; `null` si le total est impossible (moins de 0,5 pt par
 * question, total non multiple de 0,5, ou reste qu'aucune combinaison des nombres de questions
 * n'absorbe — ex. deux groupes de 2 questions et un total impair de demi-points).
 */
export function mettreAEchelleParGroupes(points: number[], nombres: number[], total: number): number[] | null {
  const n = points.length;
  if (n === 0) return [];
  if (nombres.every((q) => q === 1)) return mettreAEchelle(points, total);
  const unites = Math.round(total * 2);
  const questions = nombres.reduce((s, q) => s + q, 0);
  if (!Number.isFinite(total) || Math.abs(unites - total * 2) > 1e-9 || unites < questions || nombres.some((q) => !(q >= 1))) return null;
  const somme = points.reduce((s, p, k) => s + Math.max(0, p) * nombres[k], 0);
  const poids = somme > 0 ? points.map((p) => Math.max(0, p)) : points.map(() => 1);
  const sommePoids = somme > 0 ? somme : questions;
  const bruts = poids.map((p) => (p / sommePoids) * unites);
  const res = bruts.map((b) => Math.max(1, Math.round(b + 1e-9)));
  let reste = unites - res.reduce((s, r, k) => s + r * nombres[k], 0);
  if (reste === 0) return res.map((u) => u / 2);
  // Plus petite correction : on cherche des pas d_k (|d_k| ≤ 3, res_k + d_k ≥ 1) tels que
  // Σ nombres[k]·d_k = reste, en minimisant Σ |d_k| (programmation dynamique sur le reste).
  const ordre = res.map((_, k) => k).sort((a, b) => bruts[b] - bruts[a] || a - b);
  type Etat = { cout: number; pas: Map<number, number> };
  let etats = new Map<number, Etat>([[0, { cout: 0, pas: new Map() }]]);
  for (const k of ordre) {
    const suivants = new Map<number, Etat>(etats);
    for (const [r, e] of etats) {
      for (let d = -3; d <= 3; d++) {
        if (d === 0 || res[k] + d < 1) continue;
        const r2 = r + d * nombres[k];
        if (Math.abs(r2) > Math.abs(reste) + 3 * Math.max(...nombres)) continue;
        const cout = e.cout + Math.abs(d);
        const actuel = suivants.get(r2);
        if (!actuel || cout < actuel.cout) suivants.set(r2, { cout, pas: new Map([...e.pas, [k, d]]) });
      }
    }
    etats = suivants;
  }
  const solution = etats.get(reste);
  if (!solution) return null;
  for (const [k, d] of solution.pas) res[k] += d;
  reste = unites - res.reduce((s, r, k) => s + r * nombres[k], 0);
  return reste === 0 && res.every((r) => r >= 1) ? res.map((u) => u / 2) : null;
}

/* ----------------------------------------------------------------------------------------------
 * Saisies libres du panneau (jamais de blocage de frappe : lues, jamais filtrées)
 * -------------------------------------------------------------------------------------------- */

export type Lecture<T> = { etat: "vide" } | { etat: "ok"; valeur: T } | { etat: "illisible"; message: string };

const SIGNES_MOINS = /[−–—]/g;

/** Heure de départ : « 08h50 », « 8h50 », « 8:50 », « 8 h 50 », « 8h », « 8.50 ». */
export function lireHeure(texte: string | undefined): Lecture<number> {
  const t = (texte ?? "").trim().toLowerCase();
  if (!t) return { etat: "vide" };
  const m = /^(\d{1,2})\s*(?:h|:|\.)\s*(\d{2})?\s*(?:min)?$/.exec(t);
  if (!m) return { etat: "illisible", message: "Heure illisible : écris par exemple 08h50, 8h50 ou 8:50." };
  const h = Number(m[1]);
  const min = m[2] === undefined ? 0 : Number(m[2]);
  if (h > 23 || min > 59) return { etat: "illisible", message: "Heure impossible : de 0h00 à 23h59." };
  return { etat: "ok", valeur: h * 60 + min };
}

/** Durée : « 60 », « 60 min », « 1h », « 1h30 », « 1 h 30 », « 1 h 30 min », « 1:30 », « 1,5 h »,
 * « 90 minutes », « 2 heures ». Renvoie des minutes (1 à 1 439). */
export function lireDuree(texte: string | undefined): Lecture<number> {
  const t = (texte ?? "").trim().toLowerCase().replace(SIGNES_MOINS, "-");
  if (!t) return { etat: "vide" };
  const message = "Durée illisible : écris par exemple 60, 60 min, 1h, 1h30 ou 1 h 30.";
  let minutes: number | null = null;
  const m = /^(\d+)\s*(?:min|mn|minutes?)?$/.exec(t);
  if (m) minutes = Number(m[1]);
  if (minutes === null) {
    const h = /^(\d+)\s*(?:h|heures?|:)\s*(?:(\d{1,2})\s*(?:min|mn|minutes?)?)?$/.exec(t);
    if (h) {
      const mm = h[2] === undefined ? 0 : Number(h[2]);
      if (mm > 59) return { etat: "illisible", message };
      minutes = Number(h[1]) * 60 + mm;
    }
  }
  if (minutes === null) {
    const d = /^(\d+)[,.](\d+)\s*(?:h|heures?)$/.exec(t);
    if (d) minutes = Math.round(Number(`${d[1]}.${d[2]}`) * 60);
  }
  if (minutes === null) return { etat: "illisible", message };
  if (minutes <= 0 || minutes >= 24 * 60) return { etat: "illisible", message: "Durée impossible : entre 1 minute et 23 h 59." };
  return { etat: "ok", valeur: minutes };
}

/** « 08h50 » (heures sur deux chiffres, « h », minutes sur deux chiffres) ; passage de minuit géré. */
export function heureTexte(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}h${String(m % 60).padStart(2, "0")}`;
}

/** « 45 min », « 1 h », « 1 h 30 », « 2 h 05 ». */
export function dureeTexte(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

/** Horaire imprimé : « 08h50 → 09h50 » si l'heure de départ et la durée sont lisibles. */
export function horaireExamen(heure: string | undefined, duree: string | undefined): { horaire: string | null; duree: string | null } {
  const h = lireHeure(heure);
  const d = lireDuree(duree);
  const dureeLue = d.etat === "ok" ? dureeTexte(d.valeur) : null;
  if (h.etat === "ok" && d.etat === "ok") return { horaire: `${heureTexte(h.valeur)} → ${heureTexte(h.valeur + d.valeur)}`, duree: dureeLue };
  return { horaire: null, duree: dureeLue };
}

/** Total d'une partie saisi en texte libre : « 30 », « 32,5 », « 32.5 », « 30 pts ». */
export function lireTotal(texte: string | undefined): Lecture<number> {
  const t = (texte ?? "").trim().toLowerCase().replace(SIGNES_MOINS, "-");
  if (!t) return { etat: "vide" };
  const m = /^(-?\d+(?:[,.]\d+)?)\s*(?:pts?|points?)?$/.exec(t);
  if (!m) return { etat: "illisible", message: "Total illisible : écris un nombre, par exemple 30 ou 32,5." };
  const v = Number(m[1].replace(",", "."));
  if (v <= 0) return { etat: "illisible", message: "Le total doit être positif." };
  if (Math.abs(v * 2 - Math.round(v * 2)) > 1e-9) return { etat: "illisible", message: "Le total doit être un multiple de 0,5 (demi-points)." };
  return { etat: "ok", valeur: v };
}

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** Session par défaut déduite de la date : « Session de juin 2027 », « Session d'août 2027 ». */
export function sessionParDefaut(dateIso: string): string {
  const m = /^(\d{4})-(\d{2})/.exec(dateIso.trim());
  const mois = m ? MOIS[Number(m[2]) - 1] : undefined;
  if (!m || !mois) return "Session";
  return `Session ${/^[aeiouéèâ]/.test(mois) ? "d'" : "de "}${mois} ${m[1]}`;
}

/** En-tête courant : « Examen de juin 2027 » depuis « Session de juin 2027 » ; autre libellé
 * (« Session d'hiver ») → « Examen · Session d'hiver ». */
export function examenDeSession(session: string): string {
  const s = session.trim();
  const m = /^session\s+(de\s+|d['’]\s*)(.+)$/i.exec(s);
  if (m) return `Examen ${m[1].toLowerCase().startsWith("de") ? "de " : "d'"}${m[2]}`;
  return s ? `Examen · ${s}` : "Examen";
}

/** Consignes supplémentaires : une ligne non vide = une consigne. */
export function lignesConsignes(texte: string | undefined): string[] {
  return (texte ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/** Découpe une consigne en texte / formules `$…$` (un `$` isolé reste du texte). */
export function fragmentsConsigne(ligne: string): { type: "texte" | "latex"; valeur: string }[] {
  const res: { type: "texte" | "latex"; valeur: string }[] = [];
  const re = /\$([^$]+)\$/g;
  let dernier = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(ligne))) {
    if (m.index > dernier) res.push({ type: "texte", valeur: ligne.slice(dernier, m.index) });
    res.push({ type: "latex", valeur: m[1] });
    dernier = m.index + m[0].length;
  }
  if (dernier < ligne.length) res.push({ type: "texte", valeur: ligne.slice(dernier) });
  return res;
}
