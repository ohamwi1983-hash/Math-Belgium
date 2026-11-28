/*
 * Données d'exemple du faux client (`faux-supabase.js`), NON importées par l'application.
 * Heure de référence : vendredi 27/11/2026, 10 h 00 (Europe/Bruxelles) — le script Playwright fige l'horloge.
 * Un professeur, une école, trois classes (6e B, 5e A, 4e C), un horaire, des séances sur deux chapitres
 * consécutifs de 6e (« Fonctions exponentielles » puis « Fonctions logarithmes »), une interro au FORMAT D'AVANT
 * (5e A, chapitre seul + étapes, générateurs « tous ») et un devoir (4e C) déjà annoncés, deux pages des élèves.
 */
export const MAINTENANT = '2026-11-27T10:00:00+01:00'
export const UID = '11111111-1111-4111-8111-111111111111'
export const ECOLE = 'e0000000-0000-4000-8000-000000000001'
export const C6B = 'c0000000-0000-4000-8000-0000000006b0'
export const C5A = 'c0000000-0000-4000-8000-0000000005a0'
export const C4C = 'c0000000-0000-4000-8000-0000000004c0'
export const EV_5A = 'a0000000-0000-4000-8000-000000000001'
export const S_DEVOIR = 'b0000000-0000-4000-8000-0000000000d1'
export const S_ANNONCE_5A = 'b0000000-0000-4000-8000-0000000000a5'
export const S_6B_MARDI = 'b0000000-0000-4000-8000-0000000006b5'
export const CODE_6B = 'K7Q4MX'
export const CODE_5A = 'B3C5DE'

const ancien = '2026-09-01T08:00:00+02:00'
const HEURES = { 1: ['08:25', '09:15'], 2: ['09:15', '10:05'], 3: ['10:20', '11:10'], 4: ['11:10', '12:00'], 5: ['12:50', '13:40'], 6: ['13:40', '14:30'] }

function seance(id, classe, date, h, niveau, chapitre, parties, extra = {}) {
  return {
    id,
    proprietaire: UID,
    classe_id: classe,
    date_seance: date,
    heure_debut: HEURES[h][0],
    heure_fin: HEURES[h][1],
    numero_heure: h,
    numero_heure_fin: null,
    niveau,
    chapitre,
    parties,
    generateurs: [],
    devoir: '',
    remarque: '',
    devoir_pour: null,
    devoir_generateurs: [],
    objectif: '',
    competences: [],
    evaluation_type: null,
    evaluation_parties: [],
    evaluation_evenement: null,
    evaluation_generateurs: [],
    evaluation_competences: [],
    cree_le: `${date}T12:00:00+01:00`,
    modifie_le: `${date}T12:00:00+01:00`,
    ...extra,
  }
}

const cases = [
  // 6e B : lundi H4, mardi H1, vendredi H3 (comme la maquette)
  [1, 4, C6B], [2, 1, C6B], [5, 3, C6B],
  // 5e A : lundi H1, mardi H2, jeudi H1, vendredi H1
  [1, 1, C5A], [2, 2, C5A], [4, 1, C5A], [5, 1, C5A],
  // 4e C : lundi H3, mercredi H1, jeudi H2, vendredi H4
  [1, 3, C4C], [3, 1, C4C], [4, 2, C4C], [5, 4, C4C],
].map(([jour, heure, classe], i) => ({ id: `h0000000-0000-4000-8000-${String(i).padStart(12, '0')}`, proprietaire: UID, ecole_id: ECOLE, jour, heure, classe_id: classe, semaine: null, cree_le: ancien }))

export function donnees() {
  return {
    utilisateur: { id: UID, email: 'prof.essai@exemple.be' },
    tables: {
      profils: [{ id: UID, nom_affiche: 'M. Essai', est_admin: false, actif: true, repartition: null }],
      ecoles: [{ id: ECOLE, proprietaire: UID, nom: 'Athénée d’essai', adresse: 'Rue des Essais 1, 1000 Bruxelles', par_defaut: true, logo: null, cree_le: ancien }],
      classes: [
        { id: C6B, proprietaire: UID, ecole_id: ECOLE, nom: '6e B', niveau: '6e-6h', cree_le: ancien },
        { id: C5A, proprietaire: UID, ecole_id: ECOLE, nom: '5e A', niveau: '5e-4h', cree_le: ancien },
        { id: C4C, proprietaire: UID, ecole_id: ECOLE, nom: '4e C', niveau: '4e', cree_le: ancien },
      ],
      carnet_reglages: [{ proprietaire: UID, format_horaire: 'numero', duree_heure: 50, seuil_avertissement: 3, rubriques: null, competences_transversales: null, ordre_chapitres: null, ordre_sans_numero: false }],
      horaires_ecoles: [
        {
          ecole_id: ECOLE,
          proprietaire: UID,
          debut: '08:25',
          duree_heure: 50,
          nombre_heures: 6,
          pauses: [
            { apres: 2, duree: 15, type: 'recreation' },
            { apres: 4, duree: 50, type: 'midi' },
          ],
          heures_mercredi: null,
          exceptions: [],
          heure_zero: false,
        },
      ],
      horaire_cases: cases,
      periodes_bulletin: [{ id: 'p0000000-0000-4000-8000-000000000002', proprietaire: UID, ecole_id: ECOLE, annee_scolaire: '2026-2027', numero: 2, remise: '2026-12-18' }],
      evenements: [
        // Interro au format d'AVANT (annoncée le 24/11 par « Noter la séance ») : intitulé vide, chapitre seul.
        { id: EV_5A, proprietaire: UID, ecole_id: ECOLE, type: 'interrogation', intitule: '', du: '2026-12-03', au: '2026-12-03', journee_entiere: false, heure_debut: 1, heure_fin: 1, toutes_classes: false, accompagne: false, classe_id: C5A, chapitre: '5e-4h/suites', cree_le: '2026-11-24T12:00:00+01:00' },
      ],
      evenements_classes: [],
      seances: [
        // 6e B — « Fonctions exponentielles » (chapitre précédent, fini cette semaine), puis « Fonctions logarithmes ».
        seance('b0000000-0000-4000-8000-0000000006b1', C6B, '2026-11-12', 3, '6e-6h', 'fonctions-exponentielles', ['equations', 'inequations']),
        seance('b0000000-0000-4000-8000-0000000006b2', C6B, '2026-11-16', 4, '6e-6h', 'fonctions-exponentielles', ['etude']),
        seance('b0000000-0000-4000-8000-0000000006b3', C6B, '2026-11-23', 4, '6e-6h', 'fonctions-exponentielles', ['problemes']),
        seance('b0000000-0000-4000-8000-0000000006b4', C6B, '2026-11-25', 2, '6e-6h', 'fonctions-logarithmes', ['proprietes/definition-l-exposant-qu-il-faut-donner-a-a']),
        seance(S_6B_MARDI, C6B, '2026-11-26', 3, '6e-6h', 'fonctions-logarithmes', ['equations'], { remarque: 'Bonne participation' }),
        // 5e A — suites, et la séance qui a annoncé l'interro (format d'avant : étapes du chapitre, générateurs « tous »).
        seance('b0000000-0000-4000-8000-0000000005a1', C5A, '2026-11-20', 1, '5e-4h', 'suites', ['suites-arithmetiques']),
        seance(S_ANNONCE_5A, C5A, '2026-11-24', 2, '5e-4h', 'suites', ['suites-geometriques'], { evaluation_type: 'annonce', evaluation_parties: ['suites-arithmetiques', 'suites-geometriques'], evaluation_evenement: EV_5A }),
        // 4e C — le devoir donné (séance d'annonce SANS matière vue : elle partira avec le devoir).
        seance('b0000000-0000-4000-8000-0000000004c1', C4C, '2026-11-23', 3, '4e', 'fonction-second-degre', ['etudier']),
        seance(S_DEVOIR, C4C, '2026-11-26', 2, '4e', 'fonction-second-degre', [], { devoir: 'Exercices 4 et 5 page 32', devoir_pour: '2026-12-02', devoir_generateurs: ['gen7'] }),
      ],
      pages_classe: [
        { classe_id: C6B, proprietaire: UID, code: CODE_6B, code_cree_le: ancien, publier_interros: true, publier_devoirs: true, publier_matiere: true, publier_heure: true, publier_nom: false, contenu: {}, publie_le: null },
        { classe_id: C5A, proprietaire: UID, code: CODE_5A, code_cree_le: ancien, publier_interros: true, publier_devoirs: true, publier_matiere: true, publier_heure: false, publier_nom: false, contenu: {}, publie_le: null },
      ],
      plans: [],
    },
  }
}
