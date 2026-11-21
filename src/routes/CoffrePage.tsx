import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent as ClavierReact, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import '../components/carnet/carnet.css'
import { MenuActions } from '../components/carnet/MenuActions'
import { Champ } from '../components/compte/Champ'
import { BandeauEspace } from '../components/compte/BandeauEspace'
import { MenuEspace } from '../components/compte/MenuEspace'
import { EnTeteCompte, PageCompte, PageReservee } from '../components/compte/PageReservee'
import '../components/compte/profil.css'
import '../components/compte/coffre.css'
import { cartoucheEffectif } from '../entrainement/export/cartouche'
import {
  chapitresTexte,
  compteType,
  correspondRecherche,
  dateCourte,
  datesTexte,
  liensRemediation,
  NOMS_PROCESSUS,
  nombreTexte,
  ORDRE_TYPES,
  parDateDecroissante,
  pluriel,
  rangerParChapitre,
  rangNiveau,
  resumerPlan,
  texteRecherche,
  TYPES,
  libelleNiveau,
  type ResumePlan,
} from '../lib/coffreResume'
import { estConnecteActif, useCompte } from '../lib/compteContexte'
import { dupliquerPlan, importerPlansLocaux, listerPlans, renommerPlan, supprimerPlanCoffre, type PlanCoffre } from '../lib/compteDonnees'
import { cartoucheDepuisCompte, ecoleParDefaut, erreurTitrePlan, messageErreur, plansLocauxAImporter, routeDuPlan, type PlanLocal, type TypePlan } from '../lib/compteValidation'

const CLE_ENREGISTREES = 'math-belgium-evaluations-enregistrees'
const CLE_RANGEMENT = 'math-belgium-coffre-ranger'

type Rangement = 'recents' | 'chapitre'

/** Enregistrements du navigateur (même lecture que `evaluationLocal.ts::lirePlansEnregistres`,
 * recopiée ici pour ne pas charger tout le pipeline d'export sur cette page). */
function lirePlansLocaux(): PlanLocal[] {
  try {
    const brut = localStorage.getItem(CLE_ENREGISTREES)
    const liste = brut ? (JSON.parse(brut) as PlanLocal[]) : []
    return Array.isArray(liste) ? liste.filter((p) => p?.plan?.version === 1) : []
  } catch {
    return []
  }
}

/** « Ranger par » mémorisé par appareil (commodité ; rien d'important n'en dépend). */
function lireRangement(): Rangement {
  try {
    return localStorage.getItem(CLE_RANGEMENT) === 'chapitre' ? 'chapitre' : 'recents'
  } catch {
    return 'recents'
  }
}

function useTelephone(): boolean {
  const requete = '(max-width: 759px)'
  const [etroit, setEtroit] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(requete).matches)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const m = window.matchMedia(requete)
    const suivre = () => setEtroit(m.matches)
    suivre()
    m.addEventListener('change', suivre)
    return () => m.removeEventListener('change', suivre)
  }, [])
  return etroit
}

/**
 * `/coffre` — refonte du 21/11/2026 (proposition B « Liste et fiche détaillée », maquettes
 * `BListe` / `Telephone`, plus « Ranger par : récents / chapitre ») : menu « Mon espace »
 * (`MenuEspace`), bandeau sombre (comptes par type), import des enregistrements du navigateur,
 * filtres (type, niveau, recherche sans accents), liste compacte et fiche de l'enregistrement choisi
 * (`?id=`) : miniature, étiquettes, contenu lu dans le plan stocké (questions, points, processus),
 * remédiation ↔ évaluation d'origine, Ouvrir dans le panneau / Renommer / Dupliquer / Supprimer
 * (confirmation dans la page). Téléphone : la fiche est un tiroir en bas d'écran.
 */
export function CoffrePage() {
  return (
    <PageCompte titre="Mon coffre" large sansTete>
      <TeteDeRepli />
      <PageReservee>
        <Coffre />
      </PageReservee>
    </PageCompte>
  )
}

/** Titre habituel tant que la page n'est pas prête (le bandeau porte le `<h1>`). */
function TeteDeRepli() {
  const compte = useCompte()
  return estConnecteActif(compte) ? null : <EnTeteCompte titre="Mon coffre" />
}

const classeType = (t: TypePlan) => `coffre-t-${t}`

function Coffre() {
  const compte = useCompte()
  const client = compte.client
  const id = useId()
  const telephone = useTelephone()
  const [params, setParams] = useSearchParams()
  const idUrl = params.get('id')
  const [plans, setPlans] = useState<PlanCoffre[] | null>(null)
  const [erreurChargement, setErreurChargement] = useState<string | null>(null)
  const [locaux] = useState(lirePlansLocaux)
  const [message, setMessage] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [occupe, setOccupe] = useState(false)
  const [filtreType, setFiltreType] = useState<TypePlan | null>(null)
  const [filtreNiveau, setFiltreNiveau] = useState<string | null>(null)
  const [recherche, setRecherche] = useState('')
  const [ranger, setRanger] = useState<Rangement>(lireRangement)
  const [renommage, setRenommage] = useState<{ id: string; titre: string; erreur: string | null } | null>(null)
  const [aSupprimer, setASupprimer] = useState<string | null>(null)
  const [tiroirOuvert, setTiroirOuvert] = useState(false)
  /** Téléphone : focus à placer sur le titre du tiroir dès qu'il s'affiche (la navigation qui pose
   * `?id=` est une transition : le tiroir n'existe pas encore au moment du choix). */
  const focusTiroir = useRef(false)
  /** Ordinateur étroit (liste et fiche l'une sous l'autre) : amener la fiche à l'écran après un choix. */
  const defilerFiche = useRef(false)
  const racine = useRef<HTMLDivElement>(null)

  const recharger = useCallback(async () => {
    if (!client) return
    try {
      setPlans(await listerPlans(client))
      setErreurChargement(null)
    } catch (ex) {
      setErreurChargement(messageErreur(ex))
    }
  }, [client])

  useEffect(() => {
    void recharger()
  }, [recharger])

  const liens = useMemo(() => liensRemediation(plans ?? []), [plans])
  const resumes = useMemo(() => new Map((plans ?? []).map((p) => [p.id, resumerPlan(p.contenu, p.type)])), [plans])
  const textes = useMemo(() => new Map((plans ?? []).map((p) => [p.id, texteRecherche(p)])), [plans])
  const tous = useMemo(() => parDateDecroissante(plans ?? []), [plans])
  const avantType = useMemo(() => tous.filter((p) => (filtreNiveau === null || p.contenu.levelSlug === filtreNiveau) && correspondRecherche(textes.get(p.id) ?? '', recherche)), [tous, filtreNiveau, recherche, textes])
  const visibles = useMemo(() => avantType.filter((p) => filtreType === null || p.type === filtreType), [avantType, filtreType])
  const choisi = visibles.find((p) => p.id === idUrl) ?? (telephone ? null : (visibles[0] ?? null))

  // Téléphone : un nouveau choix ouvre le tiroir réduit et y place le focus (titre).
  const idChoisi = choisi?.id ?? null
  useEffect(() => {
    if (!telephone || !idChoisi || !focusTiroir.current) return
    focusTiroir.current = false
    requestAnimationFrame(() => racine.current?.querySelector<HTMLElement>('.coffre-tiroir [data-titre-fiche]')?.focus({ preventScroll: true }))
  }, [idChoisi, telephone])

  useEffect(() => {
    if (telephone || !idChoisi || !defilerFiche.current) return
    defilerFiche.current = false
    requestAnimationFrame(() => {
      const fiche = racine.current?.querySelector<HTMLElement>('.coffre-fiche')
      const liste = racine.current?.querySelector<HTMLElement>('.coffre-liste')
      if (!fiche || !liste) return
      const empilees = fiche.getBoundingClientRect().top > liste.getBoundingClientRect().top + 10
      if (empilees && fiche.getBoundingClientRect().top > window.innerHeight * 0.6) fiche.scrollIntoView({ block: 'start', behavior: 'smooth' })
    })
  }, [idChoisi, telephone])

  // Téléphone : Échap referme le tiroir (le renommage, la confirmation et le menu « … » gèrent
  // leur propre Échap et ne le laissent pas remonter).
  useEffect(() => {
    if (!telephone || !idChoisi) return
    const echap = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      fermerTiroir(idChoisi)
    }
    document.addEventListener('keydown', echap)
    return () => document.removeEventListener('keydown', echap)
  })

  if (!estConnecteActif(compte) || !client) return null

  function choisir(planId: string | null) {
    setParams(
      (prec) => {
        const p = new URLSearchParams(prec)
        if (planId) p.set('id', planId)
        else p.delete('id')
        return p
      },
      { replace: true },
    )
    if (planId !== idChoisi) {
      setRenommage(null)
      setASupprimer(null)
    }
    if (telephone && planId) {
      if (planId !== idChoisi) {
        setTiroirOuvert(false)
        focusTiroir.current = true
      }
    }
  }

  function fermerTiroir(planId: string) {
    choisir(null)
    setTiroirOuvert(false)
    requestAnimationFrame(() => racine.current?.querySelector<HTMLElement>(`[data-plan="${CSS.escape(planId)}"]`)?.focus())
  }

  /** Sélectionne un enregistrement lié (« voir ») ; s'il est masqué par les filtres, ils sont effacés. */
  function voir(planId: string) {
    if (!visibles.some((p) => p.id === planId)) effacerFiltres()
    choisir(planId)
    if (!telephone) requestAnimationFrame(() => racine.current?.querySelector<HTMLElement>('.coffre-fiche [data-titre-fiche]')?.focus({ preventScroll: false }))
  }

  function effacerFiltres() {
    setFiltreType(null)
    setFiltreNiveau(null)
    setRecherche('')
  }

  function changerRangement(r: Rangement) {
    setRanger(r)
    try {
      localStorage.setItem(CLE_RANGEMENT, r)
    } catch {
      /* stockage indisponible : le choix vaut pour cette visite */
    }
  }

  async function agir<T>(action: () => Promise<T>, succes: string | ((r: T) => string)): Promise<{ ok: true; valeur: T } | { ok: false }> {
    setOccupe(true)
    setErreur(null)
    setMessage(null)
    try {
      const valeur = await action()
      await recharger()
      setMessage(typeof succes === 'function' ? succes(valeur) : succes)
      return { ok: true, valeur }
    } catch (ex) {
      setErreur(messageErreur(ex))
      return { ok: false }
    } finally {
      setOccupe(false)
    }
  }

  const focusDans = (selecteur: string) => requestAnimationFrame(() => racine.current?.querySelector<HTMLElement>(selecteur)?.focus())

  async function validerRenommage(e: FormEvent, plan: PlanCoffre) {
    e.preventDefault()
    if (!renommage) return
    const err = erreurTitrePlan(renommage.titre)
    if (err) {
      setRenommage({ ...renommage, erreur: err })
      focusDans('.coffre-renommage input')
      return
    }
    const r = await agir(() => renommerPlan(client!, plan.id, renommage.titre), `Enregistrement renommé : « ${renommage.titre.trim()} ».`)
    if (r.ok) {
      setRenommage(null)
      focusDans('[data-action="renommer"]')
    }
  }

  async function dupliquer(plan: PlanCoffre) {
    const r = await agir(() => dupliquerPlan(client!, plan), (copie) => `Enregistrement dupliqué : « ${copie.titre} ».`)
    if (r.ok) choisir(r.valeur.id)
  }

  async function supprimer(plan: PlanCoffre) {
    const suivant = visibles[visibles.findIndex((p) => p.id === plan.id) + 1] ?? visibles.find((p) => p.id !== plan.id) ?? null
    const r = await agir(() => supprimerPlanCoffre(client!, plan.id), `« ${plan.titre} » supprimé de ton coffre.`)
    if (!r.ok) return
    setASupprimer(null)
    setTiroirOuvert(false)
    if (telephone || !suivant) choisir(null)
    else choisir(suivant.id)
    focusDans(suivant ? `[data-plan="${CSS.escape(suivant.id)}"]` : '.coffre-recherche')
  }

  const aImporter = plans ? plansLocauxAImporter(locaux, plans) : []
  const comptesTypes = ORDRE_TYPES.map((t) => ({ type: t, total: tous.filter((p) => p.type === t).length, filtre: avantType.filter((p) => p.type === t).length })).filter((c) => c.total > 0)
  const niveaux = [...new Set(tous.map((p) => p.contenu.levelSlug))].sort((a, b) => rangNiveau(a) - rangNiveau(b))
  const filtresActifs = filtreType !== null || filtreNiveau !== null || recherche.trim() !== ''
  const cartouche = cartoucheEffectif(cartoucheDepuisCompte(compte.profil, ecoleParDefaut(compte.ecoles)))
  const surtitreMiniature = [cartouche.ecoleNom, cartouche.professeur].filter(Boolean).join(' · ')

  const propsFiche = (plan: PlanCoffre) => ({
    plan,
    resume: resumes.get(plan.id)!,
    surtitre: surtitreMiniature,
    origine: (() => {
      const o = liens.origine.get(plan.id)
      return o ? (tous.find((p) => p.id === o) ?? null) : null
    })(),
    remediations: (liens.remediations.get(plan.id) ?? []).map((rid) => tous.find((p) => p.id === rid)).filter((p): p is PlanCoffre => !!p),
    titreId: `${id}-fiche`,
    occupe,
    renommage: renommage?.id === plan.id ? renommage : null,
    confirmation: aSupprimer === plan.id,
    onVoir: voir,
    onOuvrir: () => choisir(plan.id),
    onRenommer: () => {
      setASupprimer(null)
      setRenommage({ id: plan.id, titre: plan.titre, erreur: null })
    },
    onSaisieRenommage: (titre: string) => setRenommage((r) => (r ? { ...r, titre } : r)),
    onValiderRenommage: (e: FormEvent) => void validerRenommage(e, plan),
    onAnnulerRenommage: () => {
      setRenommage(null)
      focusDans('[data-action="renommer"]')
    },
    onDupliquer: () => void dupliquer(plan),
    onSupprimer: () => {
      setRenommage(null)
      setASupprimer(plan.id)
    },
    onAnnulerSuppression: () => {
      setASupprimer(null)
      focusDans('[data-action="supprimer"]')
    },
    onConfirmerSuppression: () => void supprimer(plan),
  })

  const ligneListe = (plan: PlanCoffre, mode: Rangement, liee = false) => {
    const resume = resumes.get(plan.id)!
    const meta =
      mode === 'recents'
        ? [TYPES[plan.type].singulier, resume.niveau, chapitresTexte(resume.chapitres)]
        : [TYPES[plan.type].singulier, resume.chapitres.length > 1 && !liee ? chapitresTexte(resume.chapitres) : '', contenuCourt(resume)]
    const actif = choisi?.id === plan.id
    return (
      <button
        type="button"
        className={`coffre-ligne ${classeType(plan.type)}${actif ? ' actif' : ''}${liee ? ' liee' : ''}`}
        data-plan={plan.id}
        aria-current={actif ? 'true' : undefined}
        onClick={() => {
          if (!actif) defilerFiche.current = true
          choisir(plan.id)
        }}
      >
        <span className="coffre-point" aria-hidden="true" />
        <span className="coffre-ligne-texte">
          <span className="coffre-ligne-titre">{plan.titre}</span>
          <span className="coffre-ligne-meta">{meta.filter(Boolean).join(' · ')}</span>
        </span>
        <time className="coffre-date" dateTime={plan.modifie_le}>
          {dateCourte(plan.modifie_le)}
        </time>
        <span className="coffre-chevron" aria-hidden="true">
          ›
        </span>
      </button>
    )
  }

  const liste =
    visibles.length === 0 ? (
      <div className="coffre-aucun" role="status">
        <p>Aucun enregistrement ne correspond {recherche.trim() ? `à « ${recherche.trim()} »` : 'à ces filtres'}.</p>
        <button type="button" className="carnet-bouton" onClick={effacerFiltres}>
          Effacer les filtres
        </button>
      </div>
    ) : ranger === 'recents' ? (
      <ul className="coffre-lignes">
        {visibles.map((p) => (
          <li key={p.id}>{ligneListe(p, 'recents')}</li>
        ))}
      </ul>
    ) : (
      <div className="coffre-groupes">
        {rangerParChapitre(visibles, liens).map((niveau) => (
          <section key={niveau.slug} className="coffre-groupe-niveau" aria-labelledby={`${id}-n-${niveau.slug}`}>
            <h3 id={`${id}-n-${niveau.slug}`}>
              {niveau.libelle} <span className="coffre-groupe-compte">{pluriel(niveau.nombre, 'enregistrement')}</span>
            </h3>
            {niveau.chapitres.map((g) => (
              <div key={g.cle} className="coffre-groupe-chapitre">
                <h4>
                  {g.numero !== null && <span className="coffre-groupe-numero">{g.numero}</span>}
                  {g.titre}
                </h4>
                <ul className="coffre-lignes">
                  {g.entrees.map(({ plan, liees }) => (
                    <li key={plan.id}>
                      {ligneListe(plan, 'chapitre')}
                      {liees.length > 0 && (
                        <ul className="coffre-lignes coffre-liees" aria-label={`Remédiation${liees.length > 1 ? 's' : ''} de « ${plan.titre} »`}>
                          {liees.map((r) => (
                            <li key={r.id}>{ligneListe(r, 'chapitre', true)}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>
    )

  const nombre = plans?.length ?? 0

  return (
    <div className="coffre" ref={racine}>
      <MenuEspace>
        <div className={`coffre-contenu${telephone && choisi ? ' avec-tiroir' : ''}`}>
          <BandeauEspace
            titreId={`${id}-titre`}
            titre="Mon coffre"
            classe="coffre-bandeau"
            classeIcone="coffre-icone"
            icone={<IconeCoffre />}
            apresTitre={
              <p className="coffre-bandeau-sous-titre">
                {plans === null ? 'Tes enregistrements suivent ton compte sur tous tes appareils' : `${nombre === 0 ? 'Aucun enregistrement' : pluriel(nombre, 'enregistrement')} · ${nombre > 1 ? 'suivent' : 'suit'} ton compte sur tous tes appareils`}
              </p>
            }
            etiquettePastilles="Enregistrements par type"
            pastilles={comptesTypes.map((c) => (
              <li key={c.type} className={`profil-bandeau-ecole ${classeType(c.type)}`}>
                <span className="coffre-point" aria-hidden="true" />
                {compteType(c.type, c.total)}
              </li>
            ))}
          />

          {(message || erreur) && (
            <p className={`profil-message ${erreur ? 'compte-erreur-champ' : 'compte-message'}`} role={erreur ? 'alert' : 'status'}>
              {erreur ?? message}
            </p>
          )}

          {aImporter.length > 0 && (
            <section className="coffre-import" aria-labelledby={`${id}-import`}>
              <h2 id={`${id}-import`} className="carnet-sr">
                Enregistrements de ce navigateur
              </h2>
              <p>
                <strong>
                  {pluriel(aImporter.length, 'enregistrement')} de ce navigateur
                </strong>{' '}
                {aImporter.length > 1 ? 'ne sont' : "n'est"} pas encore dans ton coffre.<span className="coffre-large"> {aImporter.length > 1 ? 'Ils restent' : 'Il reste'} aussi dans le navigateur.</span>
              </p>
              <button
                type="button"
                className="carnet-bouton"
                disabled={occupe || plans === null}
                onClick={() => void agir(() => importerPlansLocaux(client, locaux, plans ?? []), `${aImporter.length} enregistrement${aImporter.length > 1 ? 's importés' : ' importé'} dans ton coffre.`)}
              >
                <span className="coffre-large">Importer dans mon coffre</span>
                <span className="coffre-court">Importer</span>
              </button>
            </section>
          )}

          {plans === null && !erreurChargement ? (
            <p className="compte-chargement" role="status" aria-live="polite">
              Chargement du coffre…
            </p>
          ) : plans === null ? (
            <div className="compte-encadre compte-erreur" role="alert">
              <p>{erreurChargement}</p>
              <p>
                <button type="button" className="carnet-bouton" onClick={() => void recharger()}>
                  Réessayer
                </button>
              </p>
            </div>
          ) : plans.length === 0 ? (
            <section className="profil-carte coffre-vide" aria-labelledby={`${id}-vide`}>
              <div className="profil-carte-corps">
                <h2 id={`${id}-vide`}>Ton coffre est vide</h2>
                <p>
                  Génère un document dans le panneau de conception, puis clique sur « Enregistrer dans mon coffre » : il suivra ton compte sur tous tes appareils et se
                  rechargera à l'identique (mêmes exercices).
                </p>
                <div className="profil-actions">
                  <Link className="carnet-bouton principal" to="/exercice">
                    Préparer une feuille d'exercices
                  </Link>
                  <Link className="carnet-bouton" to="/evaluation">
                    Préparer une évaluation ou un examen
                  </Link>
                </div>
              </div>
            </section>
          ) : (
            <>
              {erreurChargement && (
                <p className="profil-message compte-erreur-champ" role="alert">
                  {erreurChargement}{' '}
                  <button type="button" className="profil-lien-bouton" onClick={() => void recharger()}>
                    Réessayer
                  </button>
                </p>
              )}
              <div className="coffre-filtres">
                <div className="coffre-pastilles" role="group" aria-label="Type d'enregistrement">
                  <button type="button" className="coffre-pastille" aria-pressed={filtreType === null} onClick={() => setFiltreType(null)}>
                    Tout <b>{avantType.length}</b>
                  </button>
                  {comptesTypes.map((c) => (
                    <button key={c.type} type="button" className={`coffre-pastille ${classeType(c.type)}`} aria-pressed={filtreType === c.type} onClick={() => setFiltreType(filtreType === c.type ? null : c.type)}>
                      <span className="coffre-point" aria-hidden="true" />
                      <span className="coffre-large">{TYPES[c.type].pluriel}</span>
                      <span className="coffre-court">{TYPES[c.type].court}</span> <b>{c.filtre}</b>
                    </button>
                  ))}
                  {niveaux.length > 1 && (
                    <>
                      <span className="coffre-separateur" aria-hidden="true" />
                      {niveaux.map((n) => (
                        <button
                          key={n}
                          type="button"
                          className="coffre-pastille niveau"
                          aria-pressed={filtreNiveau === n}
                          aria-label={libelleNiveau(n)}
                          onClick={() => setFiltreNiveau(filtreNiveau === n ? null : n)}
                        >
                          {n.split('-')[0]}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <div className="coffre-grille">
                <section className="coffre-liste" aria-labelledby={`${id}-liste`}>
                  <h2 id={`${id}-liste`} className="carnet-sr">
                    Mes enregistrements
                  </h2>
                  <div className="coffre-outils">
                    <input
                      type="search"
                      className="coffre-recherche"
                      placeholder={telephone ? 'Chercher un titre, un chapitre…' : 'Chercher…'}
                      aria-label="Chercher dans le coffre (titre, chapitre)"
                      value={recherche}
                      onChange={(e) => setRecherche(e.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <label className="coffre-ranger">
                      <span>Ranger par</span>
                      <select value={ranger} onChange={(e) => changerRangement(e.target.value === 'chapitre' ? 'chapitre' : 'recents')}>
                        <option value="recents">récents</option>
                        <option value="chapitre">chapitre</option>
                      </select>
                    </label>
                  </div>
                  <p className="carnet-sr" aria-live="polite">
                    {filtresActifs ? `${pluriel(visibles.length, 'enregistrement affiché', 'enregistrements affichés')} sur ${nombre}` : ''}
                  </p>
                  {liste}
                </section>

                {!telephone && choisi && <Fiche {...propsFiche(choisi)} />}
              </div>

              {telephone && choisi && (
                <Tiroir
                  {...propsFiche(choisi)}
                  ouvert={tiroirOuvert}
                  onBasculer={() => setTiroirOuvert((o) => !o)}
                  onFermer={() => fermerTiroir(choisi.id)}
                  onRenommerTiroir={() => {
                    setTiroirOuvert(true)
                    setASupprimer(null)
                    setRenommage({ id: choisi.id, titre: choisi.titre, erreur: null })
                  }}
                  onSupprimerTiroir={() => {
                    setTiroirOuvert(true)
                    setRenommage(null)
                    setASupprimer(choisi.id)
                  }}
                />
              )}
            </>
          )}
        </div>
      </MenuEspace>
    </div>
  )
}

/** « 7 questions · 40 pts » (feuille d'exercices : « 3 questions · 9 exercices »). */
function contenuCourt(r: ResumePlan): string {
  const q = pluriel(r.questions.length, 'question')
  if (r.sansPoints) return `${q} · ${pluriel(r.exercices, 'exercice')}`
  return `${q} · ${nombreTexte(r.totalFixe ?? r.points)} pts`
}

interface ProprietesFiche {
  plan: PlanCoffre
  resume: ResumePlan
  surtitre: string
  origine: PlanCoffre | null
  remediations: PlanCoffre[]
  titreId: string
  occupe: boolean
  renommage: { titre: string; erreur: string | null } | null
  confirmation: boolean
  onVoir: (id: string) => void
  onOuvrir: () => void
  onRenommer: () => void
  onSaisieRenommage: (titre: string) => void
  onValiderRenommage: (e: FormEvent) => void
  onAnnulerRenommage: () => void
  onDupliquer: () => void
  onSupprimer: () => void
  onAnnulerSuppression: () => void
  onConfirmerSuppression: () => void
}

const lienPanneau = (plan: PlanCoffre) => `${routeDuPlan(plan.type)}?plan=${encodeURIComponent(plan.id)}`

function PastilleType({ type }: { type: TypePlan }) {
  return (
    <span className={`coffre-pastille-type ${classeType(type)}`}>
      <span className="coffre-point" aria-hidden="true" />
      {TYPES[type].singulier}
    </span>
  )
}

/** Fiche de l'enregistrement choisi (colonne de droite, ou tiroir ouvert sur téléphone). */
function Fiche(p: ProprietesFiche & { dansTiroir?: boolean }) {
  const { plan, resume } = p
  const annuler = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (p.confirmation) annuler.current?.focus()
  }, [p.confirmation])

  const etiquettes = [
    resume.niveau,
    ...(resume.chapitres.length <= 2 ? resume.chapitres.map((c) => chapitresTexte([c])) : [chapitresTexte(resume.chapitres)]),
    resume.series.length > 1 ? `Séries ${resume.series.join(', ')}` : '',
    resume.calculatrice ? `Calculatrice ${resume.calculatrice === 'interdite' ? 'interdite' : 'autorisée'}` : '',
    plan.contenu.entete.typeDocument === 'examen' && plan.contenu.entete.session?.trim() ? plan.contenu.entete.session.trim() : '',
    plan.contenu.entete.versionAmenagee ? 'Version aménagée' : '',
  ].filter(Boolean)
  const totalProcessus = resume.parProcessus.reduce((t, n) => t + n, 0)
  const remediation = plan.contenu.remediation

  const echapDans = (e: ClavierReact, annulerAction: () => void) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      annulerAction()
    }
  }

  return (
    <section className={`coffre-fiche ${classeType(plan.type)}${p.dansTiroir ? ' dans-tiroir' : ''}`} aria-labelledby={p.titreId}>
      <div className="coffre-fiche-tete">
        <Miniature surtitre={p.surtitre} titre={plan.titre} />
        <div className="coffre-fiche-infos">
          <PastilleType type={plan.type} />
          {p.renommage ? (
            <form className="coffre-renommage" noValidate onSubmit={p.onValiderRenommage} onKeyDown={(e) => echapDans(e, p.onAnnulerRenommage)}>
              <h2 id={p.titreId} className="carnet-sr" data-titre-fiche tabIndex={-1}>
                Renommer « {plan.titre} »
              </h2>
              <Champ label="Nouveau titre" valeur={p.renommage.titre} onChange={p.onSaisieRenommage} erreur={p.renommage.erreur} autoFocus autoComplete="off" />
              <div className="profil-actions">
                <button type="submit" className="carnet-bouton principal" disabled={p.occupe}>
                  Enregistrer le titre
                </button>
                <button type="button" className="carnet-bouton" onClick={p.onAnnulerRenommage}>
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <h2 id={p.titreId} className="coffre-fiche-titre" data-titre-fiche tabIndex={-1}>
              {plan.titre}
            </h2>
          )}
          {etiquettes.length > 0 && (
            <ul className="coffre-etiquettes" aria-label="Caractéristiques">
              {etiquettes.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          <p className="coffre-dates">{datesTexte(plan.cree_le, plan.modifie_le)}</p>
        </div>
      </div>

      <div className="coffre-fiche-bloc">
        <div className="coffre-fiche-ligne-titre">
          <h3 className="coffre-etiquette-bloc">Contenu</h3>
          <span className="coffre-mono">
            {pluriel(resume.questions.length, 'question')}
            {resume.sansPoints ? ` · ${pluriel(resume.exercices, 'exercice')}` : ` · ${nombreTexte(resume.totalFixe ?? resume.points)} pts`}
          </span>
        </div>
        {remediation && (
          <p className="coffre-note">
            {remediation.questions.length > 1 ? `Questions ${listeNumeros(remediation.questions)}` : `Question ${remediation.questions[0] ?? '?'}`} de l'évaluation d'origine ·{' '}
            {pluriel(remediation.exercicesParQuestion, 'exercice')} par question
          </p>
        )}
        {resume.totalFixe !== null && Math.abs(resume.totalFixe - resume.points) > 0.001 && (
          <p className="coffre-note">Total fixé par partie : les points des questions ci-dessous ({nombreTexte(resume.points)} pts) sont mis à l'échelle à l'impression.</p>
        )}
        {totalProcessus > 0 ? (
          <>
            <div className="coffre-barre" aria-hidden="true">
              {resume.parProcessus.map((n, i) => (n > 0 ? <span key={i} className={`coffre-p${i + 1}`} style={{ flexGrow: n }} /> : null))}
            </div>
            <ul className="coffre-legende" aria-label="Répartition par processus">
              {resume.parProcessus.map((n, i) =>
                n > 0 ? (
                  <li key={i} className={`coffre-p${i + 1}`}>
                    <span className="coffre-point" aria-hidden="true" />
                    {NOMS_PROCESSUS[(i + 1) as 1 | 2 | 3]} · {n}
                  </li>
                ) : null,
              )}
            </ul>
            <ol className="coffre-questions" aria-label="Questions (série A)">
              {resume.questions.map((q, i) => (
                <li key={i} className={`coffre-p${q.processus}`}>
                  <span className="coffre-numero" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="coffre-q-titre">
                    <span className="carnet-sr">Question {i + 1}, {NOMS_PROCESSUS[q.processus]} : </span>
                    {q.titre}
                    {q.nombre > 1 && <span className="coffre-q-nombre"> · {q.nature === 'vraiFaux' ? pluriel(q.nombre, 'affirmation') : pluriel(q.nombre, 'exercice')}</span>}
                  </span>
                  {!resume.sansPoints && <span className="coffre-mono coffre-q-points">{nombreTexte(q.points)} pts</span>}
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p className="coffre-note">Aucune question enregistrée dans ce plan.</p>
        )}
      </div>

      {(p.origine || p.remediations.length > 0 || remediation) && (
        <div className="coffre-fiche-bloc coffre-liee">
          {remediation &&
            (p.origine ? (
              <LigneLiee type={p.origine.type} onVoir={() => p.onVoir(p.origine!.id)} titreVoir={p.origine.titre}>
                Évaluation d'origine : <strong>{p.origine.titre}</strong>
              </LigneLiee>
            ) : (
              <LigneLiee type="evaluation">
                Évaluation d'origine : <strong>{remediation.titreSource}</strong> (pas dans ton coffre)
              </LigneLiee>
            ))}
          {p.remediations.map((r) => (
            <LigneLiee key={r.id} type="remediation" onVoir={() => p.onVoir(r.id)} titreVoir={r.titre}>
              Liée : <strong>{r.titre}</strong>
              {r.contenu.remediation?.questions.length ? ` (${r.contenu.remediation.questions.length > 1 ? 'questions' : 'question'} ${listeNumeros(r.contenu.remediation.questions)})` : ''}
            </LigneLiee>
          ))}
        </div>
      )}

      <div className="coffre-fiche-actions">
        {p.confirmation ? (
          <div className="profil-confirmation coffre-confirmation" role="group" aria-labelledby={`${p.titreId}-conf`} onKeyDown={(e) => echapDans(e, p.onAnnulerSuppression)}>
            <p id={`${p.titreId}-conf`} className="profil-confirmation-titre">
              Supprimer « {plan.titre} » de ton coffre ?
            </p>
            <p>
              Il disparaît de tous tes appareils ; les enregistrements de ce navigateur ne sont pas touchés.
              {p.remediations.length > 0 ? ` ${p.remediations.length > 1 ? 'Les remédiations liées restent' : 'La remédiation liée reste'} dans ton coffre.` : ''}
            </p>
            <div className="profil-actions">
              <button ref={annuler} type="button" className="carnet-bouton" onClick={p.onAnnulerSuppression}>
                Annuler
              </button>
              <button type="button" className="carnet-bouton coffre-danger-plein" disabled={p.occupe} onClick={p.onConfirmerSuppression}>
                Supprimer définitivement
              </button>
            </div>
          </div>
        ) : (
          <div className="profil-actions">
            <Link className="carnet-bouton principal" to={lienPanneau(plan)} onClick={p.onOuvrir}>
              Ouvrir dans le panneau
            </Link>
            <button type="button" className="carnet-bouton" data-action="renommer" disabled={p.occupe || !!p.renommage} onClick={p.onRenommer}>
              Renommer
            </button>
            <button type="button" className="carnet-bouton" disabled={p.occupe} onClick={p.onDupliquer}>
              Dupliquer
            </button>
            <button type="button" className="carnet-bouton coffre-danger" data-action="supprimer" disabled={p.occupe} onClick={p.onSupprimer}>
              Supprimer…
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

function LigneLiee({ type, onVoir, titreVoir, children }: { type: TypePlan; onVoir?: () => void; titreVoir?: string; children: ReactNode }) {
  return (
    <p className={`coffre-liee-ligne ${classeType(type)}`}>
      <span className="coffre-point" aria-hidden="true" />
      <span className="coffre-liee-texte">{children}</span>
      {onVoir && (
        <button type="button" className="profil-lien-bouton" onClick={onVoir} aria-label={`Voir « ${titreVoir} »`}>
          voir
        </button>
      )}
    </p>
  )
}

/** « 2, 4 et 6 ». */
function listeNumeros(n: number[]): string {
  if (n.length <= 1) return n.join('')
  return `${n.slice(0, -1).join(', ')} et ${n[n.length - 1]}`
}

/** Miniature papier stylisée (pas un rendu du document) : cartouche (école · professeur, titre). */
function Miniature({ surtitre, titre }: { surtitre: string; titre: string }) {
  return (
    <div className="coffre-miniature" aria-hidden="true">
      <div className="coffre-miniature-cartouche">
        {surtitre && <div className="coffre-miniature-surtitre">{surtitre}</div>}
        <div className="coffre-miniature-titre">{titre}</div>
      </div>
      {[0, 1].map((bloc) => (
        <div key={bloc} className="coffre-miniature-bloc">
          <span className="coffre-miniature-filet" />
          {[92, 70, 84, 55].map((w, i) => (
            <span key={i} className="coffre-miniature-ligne" style={{ width: `${w}%` }} />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Téléphone : fiche en tiroir au-dessus de la barre « Mon espace » — réduit (type, date, titre,
 * résumé, « Ouvrir dans le panneau » + « … ») ou ouvert (fiche complète). */
function Tiroir(
  p: ProprietesFiche & { ouvert: boolean; onBasculer: () => void; onFermer: () => void; onRenommerTiroir: () => void; onSupprimerTiroir: () => void },
) {
  const { plan, resume } = p
  const idCorps = `${p.titreId}-corps`
  const ouvert = p.ouvert || !!p.renommage || p.confirmation
  const resumeTexte = [resume.niveau, chapitresTexte(resume.chapitres, false), contenuCourt(resume), resume.series.length > 1 ? `séries ${resume.series.join(', ')}` : ''].filter(Boolean).join(' · ')
  return (
    <div className={`coffre-tiroir${ouvert ? ' ouvert' : ''}`}>
      <div className="coffre-tiroir-barre">
        <button type="button" className="coffre-tiroir-poignee" aria-expanded={ouvert} aria-controls={idCorps} onClick={p.onBasculer}>
          <span className="coffre-tiroir-trait" aria-hidden="true" />
          <span className="coffre-tiroir-libelle">{ouvert ? 'Réduire la fiche' : 'Toute la fiche'}</span>
        </button>
        <button type="button" className="carnet-bouton carnet-fermer coffre-tiroir-fermer" aria-label="Fermer la fiche" onClick={p.onFermer}>
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div id={idCorps} className="coffre-tiroir-corps">
        {ouvert ? (
          <Fiche {...p} dansTiroir />
        ) : (
          <section className={`coffre-tiroir-resume ${classeType(plan.type)}`} aria-labelledby={p.titreId}>
            <span className="coffre-tiroir-ligne">
              <PastilleType type={plan.type} />
              <time className="coffre-date" dateTime={plan.modifie_le}>
                {dateCourte(plan.modifie_le)}
              </time>
            </span>
            <h2 id={p.titreId} className="coffre-tiroir-titre" data-titre-fiche tabIndex={-1}>
              {plan.titre}
            </h2>
            <p className="coffre-ligne-meta">{resumeTexte}</p>
            <div className="coffre-tiroir-actions">
              <Link className="carnet-bouton principal" to={lienPanneau(plan)} onClick={p.onOuvrir}>
                Ouvrir dans le panneau
              </Link>
              <MenuActions
                libelle={`Autres actions — « ${plan.titre} » : voir le contenu, renommer, dupliquer, supprimer`}
                actions={[
                  { texte: 'Voir le contenu', onChoisir: p.onBasculer },
                  { texte: 'Renommer', onChoisir: p.onRenommerTiroir, desactive: p.occupe },
                  { texte: 'Dupliquer', onChoisir: p.onDupliquer, desactive: p.occupe },
                  { texte: 'Supprimer…', onChoisir: p.onSupprimerTiroir, danger: true, desactive: p.occupe },
                ]}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function IconeCoffre() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5h8v2" />
    </svg>
  )
}
