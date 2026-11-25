import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { RichText } from '../components/Math'
import '../components/eleve/classe.css'
import { generatorLink } from '../lib/generatorLink'
import { urlEntrainementEleve } from '../lib/carnetMatiere'
import { chargerSupabase, supabaseConfigure } from '../lib/supabase'
import { usePageNonIndexee } from '../lib/useDocumentMeta'
import {
  codeAffiche,
  codeClasseValide,
  dateEleve,
  dateLocale,
  erreurCodeClasse,
  garderCode,
  garderPage,
  joursAvant,
  lienEtape,
  lienPlanRevision,
  lireCodeGarde,
  lirePageGardee,
  morceauxDate,
  normaliserCodeClasse,
  oublierClasse,
  pageAuJour,
  texteMiseAJour,
  type DevoirPublie,
  type EtapePubliee,
  type GenerateurPublie,
  type InterroPubliee,
  type PageEleve,
  type SeancePubliee,
} from '../lib/pageClasse'
import { lirePageClasse } from '../lib/pageClasseDonnees'

/**
 * `/classe` — page de classe à code (élèves SANS compte, planche 12 des maquettes « côté élève »).
 * Publique, `noindex`, jamais pré-rendue (absente de `scripts/routes.mjs`).
 *
 * - L'élève tape le code (tirets, espaces, minuscules ignorés ; saisie jamais bloquée) ou ouvre le QR
 *   code (`/classe?code=K7Q4MX` : le code est retiré de l'adresse dès la lecture). Ensuite, la page
 *   s'ouvre directement sur cet appareil (code gardé dans `localStorage`, clé `classe:code`).
 * - Rien ne lui est demandé : aucun nom, aucune adresse, aucun compte. Rien n'est envoyé : la page ne
 *   fait que LIRE ce que le professeur publie (`lire_page_classe`, 0010).
 * - Hors ligne ou serveur indisponible : la dernière version vue (gardée sur l'appareil, datée).
 * - `?apercu=1` (« Voir comme un élève », carnet du professeur) : même page, rien n'est gardé.
 */

type Etat =
  | { vue: 'saisie'; message?: string }
  | { vue: 'chargement'; code: string; gardee: { page: PageEleve; recueLe: string } | null }
  | { vue: 'page'; code: string; page: PageEleve; recueLe: string; avis?: Avis }
  | { vue: 'indisponible'; code: string; avis: Avis }

interface Avis {
  sorte: 'hors-ligne' | 'trop-essais' | 'absente'
  texte: string
}

/** Lit `?code=` et `?apercu=1` une seule fois, puis retire le code de l'adresse (historique, partage
 * d'écran, envoi du lien par erreur) AVANT tout appel réseau. */
let dejaLus: { adresse: string; resultat: { code: string | null; apercu: boolean } } | null = null

function lireParametres(): { code: string | null; apercu: boolean } {
  if (typeof window === 'undefined') return { code: null, apercu: false }
  // Lu une seule fois par adresse : un second appel (mode strict de React) ne doit pas perdre le code
  // déjà retiré de l'adresse.
  if (dejaLus && dejaLus.adresse === window.location.href) return dejaLus.resultat
  const url = new URL(window.location.href)
  const brut = url.searchParams.get('code')
  const apercu = url.searchParams.get('apercu') === '1'
  if (brut !== null) {
    url.searchParams.delete('code')
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  }
  const code = brut !== null ? normaliserCodeClasse(brut) : null
  const resultat = { code: code && codeClasseValide(code) ? code : null, apercu }
  dejaLus = { adresse: window.location.href, resultat }
  return resultat
}

export function ClassePage() {
  usePageNonIndexee('Ma classe')
  const [{ code: codeUrl, apercu }] = useState(lireParametres)
  useEffect(() => {
    // Lecture consommée : une prochaine visite de /classe ne reprendra pas ce code.
    dejaLus = null
  }, [])
  const configure = supabaseConfigure()
  const [etat, setEtat] = useState<Etat>(() => {
    const code = codeUrl ?? (apercu ? null : lireCodeGarde())
    if (!code) return { vue: 'saisie' }
    const g = apercu ? null : lirePageGardee(code)
    return { vue: 'chargement', code, gardee: g ? { page: g.page, recueLe: g.recueLe } : null }
  })
  const [maintenant, setMaintenant] = useState(() => new Date())
  const titreRef = useRef<HTMLHeadingElement>(null)
  const appel = useRef(0)

  const ouvrir = useCallback(
    async (code: string, origine: 'saisie' | 'garde') => {
      const n = ++appel.current
      const gardee = apercu ? null : lirePageGardee(code)
      setEtat({ vue: 'chargement', code, gardee: gardee ? { page: gardee.page, recueLe: gardee.recueLe } : null })
      const client = await chargerSupabase()
      const r = client ? await lirePageClasse(client, code) : ({ statut: 'injoignable' } as const)
      if (n !== appel.current) return
      const instant = new Date()
      setMaintenant(instant)
      if (r.statut === 'ok') {
        if (!apercu) {
          garderCode(code)
          garderPage(code, r.page, instant)
        }
        setEtat({ vue: 'page', code, page: r.page, recueLe: instant.toISOString() })
        return
      }
      if (r.statut === 'inconnu') {
        if (!apercu) oublierClasse()
        setEtat({
          vue: 'saisie',
          message:
            origine === 'garde'
              ? 'Ce code ne marche plus : ton professeur l’a sans doute changé ou coupé. Demande-lui le nouveau code.'
              : 'Ce code ne correspond à aucune classe : vérifie-le avec ton professeur.',
        })
        return
      }
      const avis: Avis =
        r.statut === 'trop_essais'
          ? { sorte: 'trop-essais', texte: `Trop d’essais de code depuis ce réseau : réessaie dans ${Math.max(1, Math.ceil(r.reessayerDans / 60))} minute${r.reessayerDans > 60 ? 's' : ''}.` }
          : r.statut === 'absente'
            ? { sorte: 'absente', texte: 'La page de classe n’est pas encore activée sur le site.' }
            : { sorte: 'hors-ligne', texte: 'Pas de connexion au serveur pour l’instant.' }
      if (gardee) setEtat({ vue: 'page', code, page: gardee.page, recueLe: gardee.recueLe, avis })
      else if (origine === 'saisie' && r.statut === 'trop_essais') setEtat({ vue: 'saisie', message: avis.texte })
      else setEtat({ vue: 'indisponible', code, avis })
    },
    [apercu],
  )

  // Premier chargement : code de l'adresse (QR) ou code gardé sur l'appareil.
  useEffect(() => {
    if (etat.vue === 'chargement' && configure) void ouvrir(etat.code, codeUrl ? 'saisie' : 'garde')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une fois, au montage
  }, [])

  // La page reprend la main en revenant en ligne.
  useEffect(() => {
    const enLigne = () => {
      if (etat.vue === 'page' && etat.avis?.sorte === 'hors-ligne') void ouvrir(etat.code, 'garde')
      if (etat.vue === 'indisponible' && etat.avis.sorte === 'hors-ligne') void ouvrir(etat.code, 'garde')
    }
    window.addEventListener('online', enLigne)
    return () => window.removeEventListener('online', enLigne)
  }, [etat, ouvrir])

  // Titre de la classe : le focus y va quand la page s'ouvre après la saisie (lecteur d'écran).
  const vue = etat.vue
  useEffect(() => {
    if (vue === 'page') titreRef.current?.focus({ preventScroll: true })
  }, [vue])

  function quitter() {
    oublierClasse()
    setEtat({ vue: 'saisie', message: 'C’est fait : le code est oublié sur cet appareil.' })
  }

  let contenu: ReactNode
  if (!configure) {
    contenu = (
      <div className="cl-encadre" role="status">
        <p>
          <strong>Page de classe indisponible.</strong> Le site n’est pas relié à son serveur (configuration manquante). Les cours et les exercices restent ouverts depuis{' '}
          <Link to="/">l’accueil</Link>.
        </p>
      </div>
    )
  } else if (etat.vue === 'saisie') {
    contenu = <Saisie message={etat.message} onCode={(c) => void ouvrir(c, 'saisie')} />
  } else if (etat.vue === 'chargement') {
    contenu = etat.gardee ? (
      <VuePage page={pageAuJour(etat.gardee.page, dateLocale(maintenant))} code={etat.code} maintenant={maintenant} apercu={apercu} titreRef={titreRef} onQuitter={quitter} miseAJour />
    ) : (
      <p className="cl-chargement" role="status" aria-live="polite">
        Ouverture de la page de ta classe…
      </p>
    )
  } else if (etat.vue === 'indisponible') {
    contenu = (
      <div className="cl-encadre cl-encadre-attention" role="alert">
        <p>
          <strong>{etat.avis.texte}</strong> {etat.avis.sorte === 'hors-ligne' ? 'Vérifie ta connexion, puis réessaie.' : ''}
        </p>
        <p className="cl-boutons">
          <button type="button" className="cl-bouton" onClick={() => void ouvrir(etat.code, 'garde')}>
            Réessayer
          </button>
          {!apercu && (
            <button type="button" className="cl-bouton cl-bouton-discret" onClick={quitter}>
              Changer de code
            </button>
          )}
        </p>
      </div>
    )
  } else {
    contenu = (
      <VuePage
        page={pageAuJour(etat.page, dateLocale(maintenant))}
        code={etat.code}
        maintenant={maintenant}
        apercu={apercu}
        titreRef={titreRef}
        onQuitter={quitter}
        avis={etat.avis}
        recueLe={etat.recueLe}
        onReessayer={() => void ouvrir(etat.code, 'garde')}
      />
    )
  }

  return (
    <>
      <SiteHeader />
      <main className="cl-page">{contenu}</main>
    </>
  )
}

/* ------------------------------------------------------------------------------- saisie du code */

function Saisie({ message, onCode }: { message?: string; onCode: (code: string) => void }) {
  const [valeur, setValeur] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const id = useId()
  const champ = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (message) champ.current?.focus()
  }, [message])

  function envoyer(e: FormEvent) {
    e.preventDefault()
    const err = erreurCodeClasse(valeur)
    setErreur(err)
    if (err) {
      champ.current?.focus()
      return
    }
    onCode(normaliserCodeClasse(valeur))
  }

  const aide = `${id}-aide`
  const err = `${id}-erreur`
  return (
    <>
      <p className="cl-surtitre">Page de classe</p>
      <h1 className="cl-titre">Rejoindre ma classe</h1>
      <p className="cl-chapeau">Ton professeur t’a donné un code ou un QR code. Tu ne le tapes qu’une fois : ensuite, la page de ta classe s’ouvre directement sur cet appareil.</p>
      {message && (
        <p className="cl-encadre cl-encadre-attention" role="status">
          {message}
        </p>
      )}
      <form className="cl-bloc" onSubmit={envoyer} noValidate>
        <div className="cl-champ">
          <label htmlFor={id}>Code de la classe</label>
          <input
            ref={champ}
            id={id}
            type="text"
            value={valeur}
            onChange={(e) => {
              setValeur(e.target.value)
              if (erreur) setErreur(null)
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            enterKeyHint="go"
            aria-describedby={erreur ? `${aide} ${err}` : aide}
            aria-invalid={erreur ? true : undefined}
          />
          <p id={aide} className="cl-aide">
            6 lettres ou chiffres ; les tirets et les espaces ne comptent pas.
          </p>
          {erreur && (
            <p id={err} className="cl-erreur" role="alert">
              {erreur}
            </p>
          )}
        </div>
        <button type="submit" className="cl-bouton cl-bouton-plein cl-pleine-largeur">
          Ouvrir la page de ma classe
        </button>
        <p className="cl-ou">ou</p>
        <p className="cl-qr">
          <IconeQr />
          <span>
            <strong>Tu as un QR code ?</strong> Scanne-le avec l’appareil photo de ton téléphone : la page de ta classe s’ouvre directement, sans rien taper.
          </span>
        </p>
      </form>
      <section className="cl-bloc" aria-labelledby={`${id}-rien`}>
        <h2 id={`${id}-rien`} className="cl-etiquette">
          <IconeBouclier /> Rien ne t’est demandé
        </h2>
        <ul className="cl-rien">
          <li>
            <span className="cl-coche" aria-hidden="true">
              ✓
            </span>
            <span>
              <strong>Aucun nom, aucune adresse, aucun compte.</strong> La page ne sait pas qui la lit.
            </span>
          </li>
          <li>
            <span className="cl-coche" aria-hidden="true">
              ✓
            </span>
            <span>
              Tu vois seulement ce que ton professeur <strong>publie</strong> : interros, devoirs, matière vue.
            </span>
          </li>
          <li>
            <span className="cl-coche" aria-hidden="true">
              ✓
            </span>
            <span>
              Le code est gardé <strong>sur cet appareil</strong>. Ce que tu fais sur le site (étapes lues, exercices, cartes) n’est jamais envoyé, ni à ton professeur ni à personne.
            </span>
          </li>
        </ul>
      </section>
    </>
  )
}

/* ------------------------------------------------------------------------------- page de la classe */

function VuePage({
  page,
  code,
  maintenant,
  apercu,
  titreRef,
  onQuitter,
  avis,
  recueLe,
  onReessayer,
  miseAJour = false,
}: {
  page: PageEleve
  code: string
  maintenant: Date
  apercu: boolean
  titreRef: RefObject<HTMLHeadingElement | null>
  onQuitter: () => void
  avis?: Avis
  recueLe?: string
  onReessayer?: () => void
  miseAJour?: boolean
}) {
  const aujourdhui = dateLocale(maintenant)
  const id = useId()
  const parQui = page.professeur ? `Publié par ${page.professeur}` : 'Publié par ton professeur'
  const [prochaine, ...suivantes] = page.interros ?? []
  return (
    <>
      {apercu && (
        <p className="cl-encadre cl-apercu" role="note">
          <strong>Aperçu professeur :</strong> exactement ce que voient vos élèves avec le code {codeAffiche(code)}. Rien n’est gardé sur cet appareil.
        </p>
      )}
      <p className="cl-surtitre">Ma classe · mathématiques</p>
      <h1 className="cl-titre" ref={titreRef} tabIndex={-1}>
        {page.classe || 'Ma classe'}
      </h1>
      <p className="cl-maj">
        {parQui} · {page.misAJour ? `mis à jour ${texteMiseAJour(page.misAJour, maintenant)}` : 'rien n’a encore été publié'}
        {miseAJour && <span className="cl-maj-encours"> · vérification des nouveautés…</span>}
      </p>
      {avis && (
        <div className={`cl-encadre ${avis.sorte === 'hors-ligne' ? 'cl-encadre-hors-ligne' : 'cl-encadre-attention'}`} role="status">
          <p>
            <strong>{avis.texte}</strong> Voici la dernière version vue sur cet appareil{recueLe ? `, reçue ${texteMiseAJour(recueLe, maintenant)}` : ''}.
          </p>
          {onReessayer && (
            <p className="cl-boutons">
              <button type="button" className="cl-bouton" onClick={onReessayer}>
                Réessayer
              </button>
            </p>
          )}
        </div>
      )}

      {page.interros !== null &&
        (prochaine ? (
          <>
            <CarteInterro interro={prochaine} aujourdhui={aujourdhui} principale />
            {suivantes.map((i) => (
              <CarteInterro key={`${i.date}-${i.titre}`} interro={i} aujourdhui={aujourdhui} />
            ))}
          </>
        ) : (
          <section className="cl-bloc" aria-labelledby={`${id}-interro`}>
            <h2 id={`${id}-interro`} className="cl-h2">
              Interros
            </h2>
            <p className="cl-vide">Aucune interro annoncée pour l’instant.</p>
          </section>
        ))}

      {page.devoirs !== null && (
        <section className="cl-bloc" aria-labelledby={`${id}-devoirs`}>
          <h2 id={`${id}-devoirs`} className="cl-h2">
            Devoirs à rendre
          </h2>
          {page.devoirs.length === 0 ? <p className="cl-vide">Aucun devoir à rendre pour l’instant.</p> : page.devoirs.map((d, k) => <Devoir key={k} devoir={d} aujourdhui={aujourdhui} />)}
        </section>
      )}

      {page.seances !== null && (
        <section className="cl-bloc" aria-labelledby={`${id}-seances`}>
          <h2 id={`${id}-seances`} className="cl-h2">
            Dernières séances
          </h2>
          {page.seances.length === 0 ? <p className="cl-vide">Aucune séance publiée pour l’instant.</p> : page.seances.map((s, k) => <Seance key={k} seance={s} aujourdhui={aujourdhui} />)}
        </section>
      )}

      {page.interros === null && page.devoirs === null && page.seances === null && <p className="cl-encadre">Ton professeur ne publie rien pour l’instant sur cette page.</p>}

      <p className="cl-confiance">
        <IconeBouclier />
        <span>
          <strong>Rien ne t’est demandé, aucun nom.</strong> Cette page ne fait que lire ce que ton professeur publie ; elle ne sait pas qui tu es. Le code est gardé sur cet appareil. Rien n’est
          envoyé.
        </span>
      </p>
      <p className="cl-pied">
        <span>
          Code de la classe : <strong className="cl-code">{codeAffiche(code)}</strong>
        </span>
        {!apercu && (
          <button type="button" className="cl-lien" onClick={onQuitter}>
            Quitter cette classe sur cet appareil
          </button>
        )}
      </p>
    </>
  )
}

/** Lien interne (navigation sans rechargement) ou externe (générateur encore sur plateforme-maths). */
function Lien({ href, className, children, ariaLabel }: { href: string; className?: string; children: ReactNode; ariaLabel?: string }) {
  if (href.startsWith('/') && !href.startsWith('//')) {
    return (
      <Link to={href} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  )
}

function titreEtapes(etapes: EtapePubliee[]): string {
  const n = etapes.map((e) => e.numero).filter((x) => x > 0)
  if (n.length === 0) return ''
  if (n.length === 1) return `étape ${n[0]}`
  return `étapes ${n.slice(0, -1).join(', ')} et ${n[n.length - 1]}`
}

function decompte(jours: number): { grand: string; petit: string; lu: string } {
  if (jours <= 0) return { grand: '0', petit: 'aujourd’hui', lu: 'aujourd’hui' }
  if (jours === 1) return { grand: '1', petit: 'demain', lu: 'demain' }
  return { grand: String(jours), petit: 'jours', lu: `dans ${jours} jours` }
}

function lienGenerateur(niveau: string, g: GenerateurPublie): string | null {
  return niveau ? generatorLink(niveau, g.id) : null
}

function CarteInterro({ interro, aujourdhui, principale = false }: { interro: InterroPubliee; aujourdhui: string; principale?: boolean }) {
  const id = useId()
  const d = decompte(joursAvant(interro.date, aujourdhui))
  const nature = interro.type === 'bilan' ? 'Contrôle-bilan' : 'Interro'
  const etapes = titreEtapes(interro.etapes)
  const titre = interro.titre ? `${interro.titre}${etapes ? ` : ${etapes}` : ''}` : `${nature} de mathématiques`
  const preparer = interro.niveau && interro.chapitre ? urlEntrainementEleve(interro.niveau, interro.chapitre, interro.etapes.map((e) => e.id), interro.generateurs.map((g) => g.id)) : null
  const plan = lienPlanRevision(interro)
  return (
    <section className={`cl-interro${principale ? ' cl-interro-principale' : ''}`} aria-labelledby={`${id}-t`}>
      <p className="cl-etiquette">
        <IconeCalendrier /> {principale ? `Prochaine ${nature === 'Interro' ? 'interro' : 'évaluation : contrôle-bilan'}` : `Ensuite : ${nature.toLowerCase()}`}
      </p>
      <div className="cl-interro-haut">
        <div className="cl-interro-texte">
          <h2 className="cl-interro-titre" id={`${id}-t`}>
            {titre}
          </h2>
          <p className="cl-interro-date">
            {dateEleve(interro.date, aujourdhui)}
            {interro.heure && (
              <>
                {' · '}
                <span className="cl-heure">{interro.heure}</span>
              </>
            )}
          </p>
        </div>
        <p className="cl-decompte" aria-label={d.lu}>
          <span className="cl-decompte-grand" aria-hidden="true">
            {d.grand}
          </span>
          <span aria-hidden="true">{d.petit}</span>
        </p>
      </div>
      {interro.etapes.length > 0 && (
        <ol className="cl-etapes" aria-label="Étapes de l’interro">
          {interro.etapes.map((e) => {
            const href = lienEtape(interro.niveau, interro.chapitre, e.id)
            return (
              <li key={e.id}>
                <span className="cl-num" aria-hidden="true">
                  {e.numero || '•'}
                </span>
                <span>
                  {href ? (
                    <Lien href={href}>
                      <span className="cl-sr">Étape {e.numero} : </span>
                      <RichText text={e.titre} />
                    </Lien>
                  ) : (
                    <RichText text={e.titre} />
                  )}
                  {e.precision && (
                    <span className="cl-precision">
                      <RichText text={e.precision} />
                    </span>
                  )}
                </span>
              </li>
            )
          })}
        </ol>
      )}
      {interro.generateurs.length > 0 && (
        <>
          <h3 className="cl-sous-titre">Pour t’entraîner</h3>
          <ul className="cl-gens">
            {interro.generateurs.map((g) => {
              const href = lienGenerateur(interro.niveau, g)
              return href ? (
                <li key={g.id}>
                  <Lien href={href} className="cl-gen">
                    <span className="cl-gen-id">{g.id}</span>
                    <span className="cl-gen-titre">{g.titre}</span>
                    <span className="cl-chevron" aria-hidden="true">
                      ›
                    </span>
                  </Lien>
                </li>
              ) : null
            })}
          </ul>
        </>
      )}
      {(preparer || plan) && (
        <div className="cl-interro-actions">
          {preparer && (
            <Lien href={preparer} className="cl-bouton cl-bouton-plein cl-pleine-largeur">
              Préparer mon interro
            </Lien>
          )}
          {plan && (
            <Lien href={plan} className="cl-bouton cl-bouton-contour cl-pleine-largeur">
              Mon plan de révision jusqu’au {dateEleve(interro.date, aujourdhui).replace(/^\S+ /, '')}
            </Lien>
          )}
        </div>
      )}
    </section>
  )
}

function PastilleDate({ iso }: { iso: string | null }) {
  const m = iso ? morceauxDate(iso) : null
  if (!m) {
    return (
      <span className="cl-date">
        <b>—</b>sans date
      </span>
    )
  }
  return (
    <span className="cl-date" aria-hidden="true">
      {m.jour}
      <b>{m.numero}</b>
      {m.mois}
    </span>
  )
}

function Devoir({ devoir, aujourdhui }: { devoir: DevoirPublie; aujourdhui: string }) {
  return (
    <div className="cl-devoir">
      <PastilleDate iso={devoir.pour} />
      <div className="cl-devoir-corps">
        <p className="cl-sr">{devoir.pour ? `À rendre ${dateEleve(devoir.pour, aujourdhui).toLowerCase()}` : 'Sans date de remise'}</p>
        {devoir.texte && <p className="cl-devoir-texte">{devoir.texte}</p>}
        {!devoir.pour && devoir.donne_le && <p className="cl-precision">Donné le {dateEleve(devoir.donne_le, aujourdhui).replace(/^\S+ /, '')}, sans date de remise.</p>}
        {devoir.generateurs.length > 0 && (
          <ul className="cl-puces">
            {devoir.generateurs.map((g) => {
              const href = lienGenerateur(devoir.niveau, g)
              return href ? (
                <li key={g.id}>
                  <Lien href={href} className="cl-puce">
                    <span>
                      <span className="cl-gen-id">{g.id}</span> · {g.titre}
                    </span>
                    <span aria-hidden="true">›</span>
                  </Lien>
                </li>
              ) : null
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function Seance({ seance, aujourdhui }: { seance: SeancePubliee; aujourdhui: string }) {
  return (
    <div className="cl-seance">
      <p className="cl-seance-date">
        {dateEleve(seance.date, aujourdhui)}
        {seance.heure && (
          <>
            {' · '}
            <span className="cl-heure">{seance.heure}</span>
          </>
        )}
      </p>
      {seance.titre && <p className="cl-seance-titre">{seance.titre}</p>}
      {seance.etapes.length > 0 && (
        <ul className="cl-seance-etapes">
          {seance.etapes.map((e) => {
            const href = lienEtape(seance.niveau, seance.chapitre, e.id)
            return (
              <li key={e.id}>
                <p className="cl-seance-etape">
                  <span className="cl-seance-num">Étape {e.numero}</span> <RichText text={e.titre} />
                  {e.precision && (
                    <span className="cl-precision">
                      <RichText text={e.precision} />
                    </span>
                  )}
                </p>
                {href && (
                  <Lien href={href} className="cl-puce">
                    <span>Revoir l’étape {e.numero}</span>
                    <span aria-hidden="true">›</span>
                  </Lien>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------------------- icônes */

function IconeBouclier() {
  return (
    <svg className="cl-icone" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6l-8-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function IconeCalendrier() {
  return (
    <svg className="cl-icone" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  )
}

function IconeQr() {
  return (
    <svg className="cl-icone cl-icone-qr" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
    </svg>
  )
}
