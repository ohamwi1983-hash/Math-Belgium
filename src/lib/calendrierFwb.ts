/**
 * Calendrier scolaire de la Fédération Wallonie-Bruxelles (enseignement obligatoire : fondamental
 * et secondaire), une entrée par année scolaire. Données en code (pas en base) : le calendrier est
 * le même pour tous les professeurs, fixé par arrêté du Gouvernement, publié plusieurs années à
 * l'avance.
 *
 * SOURCES OFFICIELLES (consultées le 21/11/2026) :
 * - page « Calendrier scolaire » d'enseignement.be : https://www.enseignement.be/calendrier-scolaire
 *   (2026-2027, 2027-2028 et 2028-2029, détail texte + PDF + .ics) ;
 * - PDF officiels (même site, dossier
 *   https://www.enseignement.be/fileadmin/portail_age/uploads/menu_courtoisie/calendrier_scolaire/) :
 *   `2024_Cal_Obli_2526.pdf` (2025-2026, toujours en ligne alors que la page ne liste plus l'année
 *   écoulée), `2026_Cal_Obli_2627.pdf`, `2026_Cal_Obli_2728.pdf`, `2026_Cal_Obli_2829.pdf`, et
 *   `2025_Cal_Obli_2627.ics` (agenda 2026-2027) ;
 * - pour 2026-2027 aussi : circulaire n° 9753 du 24/06/2026 « Rentrée scolaire 2026-2027… », point
 *   3.2 (https://gallilex.cfwb.be/sites/default/files/circulaires/2026-06/53253_0000.pdf), qui
 *   renvoie à l'arrêté du Gouvernement du 17/10/2025.
 * Les jours de congé ci-dessous sont ceux surlignés « jours de congé » sur les PDF (mardi gras
 * compris quand il tombe hors du congé de détente : 9 février 2027, 13 février 2029). Coquille de la
 * page web pour 2028-2029 (« du lundi 25 décembre 2029 ») : le PDF officiel montre bien le
 * 25 décembre 2028 → 7 janvier 2029.
 *
 * Une année absente du tableau (2029-2030 et suivantes au moment d'écrire ces lignes) n'est PAS
 * devinée : `etatJour` renvoie `inconnu` (jour de semaine compté comme jour de classe possible) et
 * l'interface affiche « calendrier à confirmer ». Ajouter une année = recopier son PDF officiel ici,
 * avec la source et la date de consultation, `verifie: true`.
 */

export interface CongeFwb {
  /** Premier jour (`AAAA-MM-JJ`), inclus. */
  du: string
  /** Dernier jour, inclus (week-ends compris pour les vacances). */
  au: string
  libelle: string
}

export interface AnneeScolaireFwb {
  annee: string
  /** Premier jour de classe (rentrée). */
  debut: string
  /** Dernier jour de classe (veille des vacances d'été). */
  fin: string
  /** Vrai seulement si les dates ont été recopiées d'une source officielle. */
  verifie: boolean
  source: string
  conges: CongeFwb[]
}

const PDF = 'https://www.enseignement.be/fileadmin/portail_age/uploads/menu_courtoisie/calendrier_scolaire/'

export const CALENDRIER_FWB: AnneeScolaireFwb[] = [
  {
    annee: '2025-2026',
    debut: '2025-08-25',
    fin: '2026-07-03',
    verifie: true,
    source: `${PDF}2024_Cal_Obli_2526.pdf (consulté le 21/11/2026)`,
    conges: [
      { du: '2025-09-27', au: '2025-09-27', libelle: 'Fête de la Communauté française' },
      { du: '2025-10-20', au: '2025-11-02', libelle: 'Vacances d’automne (Toussaint)' },
      { du: '2025-11-11', au: '2025-11-11', libelle: 'Jour de l’Armistice' },
      { du: '2025-12-22', au: '2026-01-04', libelle: 'Vacances d’hiver (Noël)' },
      { du: '2026-02-16', au: '2026-03-01', libelle: 'Vacances de détente (Carnaval)' },
      { du: '2026-04-06', au: '2026-04-06', libelle: 'Lundi de Pâques' },
      { du: '2026-04-27', au: '2026-05-10', libelle: 'Vacances de printemps (Pâques)' },
      { du: '2026-05-14', au: '2026-05-14', libelle: 'Jeudi de l’Ascension' },
      { du: '2026-05-25', au: '2026-05-25', libelle: 'Lundi de Pentecôte' },
    ],
  },
  {
    annee: '2026-2027',
    debut: '2026-08-24',
    fin: '2027-07-02',
    verifie: true,
    source: `https://www.enseignement.be/calendrier-scolaire, ${PDF}2026_Cal_Obli_2627.pdf, circulaire 9753 du 24/06/2026 (consultés le 21/11/2026)`,
    conges: [
      { du: '2026-09-27', au: '2026-09-27', libelle: 'Fête de la Communauté française' },
      { du: '2026-10-19', au: '2026-11-01', libelle: 'Vacances d’automne (Toussaint)' },
      { du: '2026-11-02', au: '2026-11-02', libelle: 'Fête des morts' },
      { du: '2026-11-11', au: '2026-11-11', libelle: 'Jour de l’Armistice' },
      { du: '2026-12-21', au: '2027-01-03', libelle: 'Vacances d’hiver (Noël)' },
      { du: '2027-02-09', au: '2027-02-09', libelle: 'Mardi gras' },
      { du: '2027-02-22', au: '2027-03-07', libelle: 'Vacances de détente (Carnaval)' },
      { du: '2027-03-29', au: '2027-03-29', libelle: 'Lundi de Pâques' },
      { du: '2027-04-26', au: '2027-05-09', libelle: 'Vacances de printemps (Pâques)' },
      { du: '2027-05-17', au: '2027-05-17', libelle: 'Lundi de Pentecôte' },
    ],
  },
  {
    annee: '2027-2028',
    debut: '2027-08-30',
    fin: '2028-07-07',
    verifie: true,
    source: `https://www.enseignement.be/calendrier-scolaire, ${PDF}2026_Cal_Obli_2728.pdf (consultés le 21/11/2026)`,
    conges: [
      { du: '2027-09-27', au: '2027-09-27', libelle: 'Fête de la Communauté française' },
      { du: '2027-10-25', au: '2027-11-07', libelle: 'Vacances d’automne (Toussaint)' },
      { du: '2027-11-11', au: '2027-11-11', libelle: 'Jour de l’Armistice' },
      { du: '2027-12-27', au: '2028-01-09', libelle: 'Vacances d’hiver (Noël)' },
      { du: '2028-02-28', au: '2028-03-12', libelle: 'Vacances de détente (Carnaval)' },
      { du: '2028-04-17', au: '2028-04-17', libelle: 'Lundi de Pâques' },
      { du: '2028-05-01', au: '2028-05-14', libelle: 'Vacances de printemps (Pâques)' },
      { du: '2028-05-25', au: '2028-05-25', libelle: 'Jeudi de l’Ascension' },
      { du: '2028-06-05', au: '2028-06-05', libelle: 'Lundi de Pentecôte' },
    ],
  },
  {
    annee: '2028-2029',
    debut: '2028-08-28',
    fin: '2029-07-06',
    verifie: true,
    source: `https://www.enseignement.be/calendrier-scolaire, ${PDF}2026_Cal_Obli_2829.pdf (consultés le 21/11/2026)`,
    conges: [
      { du: '2028-09-27', au: '2028-09-27', libelle: 'Fête de la Communauté française' },
      { du: '2028-10-23', au: '2028-11-05', libelle: 'Vacances d’automne (Toussaint)' },
      { du: '2028-12-25', au: '2029-01-07', libelle: 'Vacances d’hiver (Noël)' },
      { du: '2029-02-13', au: '2029-02-13', libelle: 'Mardi gras' },
      { du: '2029-02-26', au: '2029-03-11', libelle: 'Vacances de détente (Carnaval)' },
      { du: '2029-04-02', au: '2029-04-02', libelle: 'Lundi de Pâques' },
      { du: '2029-04-30', au: '2029-05-13', libelle: 'Vacances de printemps (Pâques)' },
      { du: '2029-05-21', au: '2029-05-21', libelle: 'Lundi de Pentecôte' },
    ],
  },
]

/* ------------------------------------------------------------------------------- dates ISO */

function utc(iso: string): Date | null {
  const r = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return r ? new Date(Date.UTC(Number(r[1]), Number(r[2]) - 1, Number(r[3]))) : null
}

/** `AAAA-MM-JJ` + `n` jours (négatif : en arrière). */
export function ajouterJours(iso: string, n: number): string {
  const d = utc(iso)
  if (!d) return iso
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Jour ISO de la semaine : 1 = lundi … 7 = dimanche (0 si la date est illisible). */
export function jourIso(iso: string): number {
  const d = utc(iso)
  if (!d) return 0
  const j = d.getUTCDay()
  return j === 0 ? 7 : j
}

/* ------------------------------------------------------------------------------- état d'un jour */

export type TypeJour = 'classe' | 'weekend' | 'conge' | 'ete' | 'inconnu'

export interface EtatJour {
  type: TypeJour
  /** Libellé du congé (« Vacances d’hiver (Noël) »), des vacances d'été, ou de l'année inconnue. */
  libelle?: string
  /** Année scolaire concernée (« 2026-2027 »), connue ou déduite. */
  annee: string
  /** Faux si l'année n'est pas dans le tableau (ou pas vérifiée) : « calendrier à confirmer ». */
  verifie: boolean
}

/** Année scolaire « AAAA-AAAA » d'une date : celle qui commence en août / septembre précédent. */
export function anneeScolaireDe(iso: string): string {
  const entree = CALENDRIER_FWB.find((a) => iso >= a.debut && iso <= a.fin)
  if (entree) return entree.annee
  const a = Number(iso.slice(0, 4))
  const m = Number(iso.slice(5, 7))
  return m >= 8 ? `${a}-${a + 1}` : `${a - 1}-${a}`
}

export function etatJour(iso: string): EtatJour {
  const j = jourIso(iso)
  const annee = anneeScolaireDe(iso)
  const entree = CALENDRIER_FWB.find((a) => iso >= a.debut && iso <= a.fin)
  if (j === 6 || j === 7) return { type: 'weekend', annee, verifie: entree?.verifie ?? false }
  if (entree) {
    const conge = entree.conges.find((c) => iso >= c.du && iso <= c.au)
    if (conge) return { type: 'conge', libelle: conge.libelle, annee, verifie: entree.verifie }
    return { type: 'classe', annee, verifie: entree.verifie }
  }
  // Entre deux années connues : vacances d'été.
  const avant = CALENDRIER_FWB.filter((a) => a.fin < iso).sort((x, y) => (x.fin < y.fin ? 1 : -1))[0]
  const apres = CALENDRIER_FWB.filter((a) => a.debut > iso).sort((x, y) => (x.debut < y.debut ? -1 : 1))[0]
  if (avant && apres) return { type: 'ete', libelle: 'Vacances d’été', annee, verifie: avant.verifie && apres.verifie }
  return { type: 'inconnu', libelle: `Calendrier ${annee} à confirmer`, annee, verifie: false }
}

/** Jour où des cours peuvent avoir lieu : jour de classe, ou jour de semaine d'une année inconnue. */
export function estJourDeClasse(iso: string): boolean {
  const t = etatJour(iso).type
  return t === 'classe' || t === 'inconnu'
}

/** Prochain congé (ou vacances d'été) qui commence APRÈS `iso` : utile pour proposer « d'ici le … »
 * (le dernier jour de classe avant ce congé). Les congés d'un jour isolé sont ignorés si
 * `periodesSeulement`. */
export function prochainConge(iso: string, periodesSeulement = true): { conge: CongeFwb; dernierJourDeClasse: string } | null {
  const candidats: CongeFwb[] = []
  for (const a of CALENDRIER_FWB) {
    for (const c of a.conges) if (c.du > iso && (!periodesSeulement || c.au > c.du)) candidats.push(c)
    if (a.fin >= iso) candidats.push({ du: ajouterJours(a.fin, 1), au: ajouterJours(a.fin, 1), libelle: 'Vacances d’été' })
  }
  const conge = candidats.filter((c) => c.du > iso).sort((x, y) => (x.du < y.du ? -1 : 1))[0]
  if (!conge) return null
  let d = ajouterJours(conge.du, -1)
  for (let i = 0; i < 30 && !estJourDeClasse(d); i++) d = ajouterJours(d, -1)
  return { conge, dernierJourDeClasse: d }
}
