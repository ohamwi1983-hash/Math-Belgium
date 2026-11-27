import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { qrCodeSvg } from '../../entrainement/export/qrSvg'
import type { Classe } from '../../lib/carnet'
import { codeAffiche, type ContenuPageClasse, type ReglagesPageClasse } from '../../lib/pageClasse'
import type { PageClasseProf } from '../../lib/pageClasseDonnees'
import './page-classe-eleves.css'

/**
 * `/carnet/classe/:id/eleves` — « Page de classe des élèves » (planche 12, côté professeur) : QR code +
 * code, « Projeter le code en classe », « Nouveau code » (l'ancien cesse aussitôt), « Couper le code »
 * (confirmation dans la page), interrupteurs de ce qui est publié, encadré « Jamais publié », état de
 * la publication et « Mettre à jour maintenant », « Voir comme un élève » (`/classe?code=…&apercu=1`,
 * nouvel onglet, rien n'est gardé).
 *
 * Publication : AUTOMATIQUE — dès que le carnet change (séance, interro, devoir, événement, ouverture
 * du carnet un autre jour), la copie est recalculée et, si elle diffère de celle du serveur, republiée
 * (`CarnetPage`, effet de publication). Le bouton « Mettre à jour maintenant » relit le carnet et force
 * cette vérification.
 */
export function PageClasseEleves({
  classe,
  actif,
  erreurChargement,
  page,
  apercu,
  occupe,
  message,
  erreur,
  onCreer,
  onNouveau,
  onCouper,
  onReglages,
  onMettreAJour,
}: {
  classe: Classe
  /** 0010 appliquée. */
  actif: boolean
  erreurChargement: string | null
  page: PageClasseProf | undefined
  /** Ce qui part en ce moment (copie calculée d'après le carnet). */
  apercu: ContenuPageClasse
  occupe: boolean
  message: string | null
  erreur: string | null
  onCreer: () => void
  onNouveau: () => void
  onCouper: () => void
  onReglages: (r: ReglagesPageClasse) => void
  onMettreAJour: () => void
}) {
  const id = useId()
  const [projection, setProjection] = useState(false)
  const [confirmerCoupure, setConfirmerCoupure] = useState(false)
  const annuler = useRef<HTMLButtonElement>(null)
  const boutonCouper = useRef<HTMLButtonElement>(null)
  const code = page?.code ?? null

  useEffect(() => {
    if (confirmerCoupure) annuler.current?.focus()
  }, [confirmerCoupure])

  const tete = (
    <header className="pce-tete">
      <p className="pce-surtitre">
        <Link to={`/carnet/classe/${classe.id}`}>Carnet · {classe.nom}</Link>
      </p>
      <h2 className="carnet-titre-vue" id={`${id}-h`}>Page des élèves</h2>
      <p className="pce-chapeau">Vos élèves l’ouvrent avec un code, sans compte. Ils voient uniquement ce que vous cochez ici ; ils ne vous envoient rien.</p>
    </header>
  )

  if (!actif) {
    return (
      <section className="pce" aria-labelledby={`${id}-h`}>
        {tete}
        <div className="compte-encadre" role="status">
          <p>
            <strong>Pour activer la page des élèves, collez 0010.</strong> Copiez tout le fichier <code>supabase/migrations/0010_page_classe.sql</code> dans l’éditeur SQL de Supabase (SQL Editor →
            New query → coller → Run), puis rechargez cette page. « Mes classes » fonctionne normalement en attendant.
          </p>
        </div>
      </section>
    )
  }

  // Lecture des pages en panne : rien n'est proposé (un « Créer le code » sur une page existante
  // remplacerait le code que les élèves ont déjà).
  if (erreurChargement) {
    return (
      <section className="pce" aria-labelledby={`${id}-h`}>
        {tete}
        <div className="compte-encadre compte-erreur" role="alert">
          <p>Page des élèves illisible pour l’instant ({erreurChargement})</p>
          <button type="button" className="compte-bouton-secondaire" disabled={occupe} onClick={onMettreAJour}>
            Réessayer
          </button>
        </div>
      </section>
    )
  }

  const url = `${window.location.origin}/classe?code=${code ?? ''}`
  const lienCourt = `${window.location.host}/classe`
  const reglages: ReglagesPageClasse = {
    publier_interros: page?.publier_interros ?? true,
    publier_devoirs: page?.publier_devoirs ?? true,
    publier_matiere: page?.publier_matiere ?? true,
    publier_heure: page?.publier_heure ?? false,
    publier_nom: page?.publier_nom ?? false,
  }
  const etat = code ? 'publiee' : page ? 'coupee' : 'aucune'
  const resume = [
    reglages.publier_interros ? `${apercu.interros.length} interro${apercu.interros.length > 1 ? 's' : ''} à venir` : null,
    reglages.publier_devoirs ? `${apercu.devoirs.length} devoir${apercu.devoirs.length > 1 ? 's' : ''} à rendre` : null,
    reglages.publier_matiere ? `${apercu.seances.length} dernière${apercu.seances.length > 1 ? 's' : ''} séance${apercu.seances.length > 1 ? 's' : ''}` : null,
  ].filter(Boolean)

  return (
    <section className="pce" aria-labelledby={`${id}-h`}>
      {tete}
      {(message || erreur || erreurChargement) && (
        <p className={erreur || erreurChargement ? 'compte-erreur-champ' : 'compte-message'} role={erreur || erreurChargement ? 'alert' : 'status'}>
          {erreur ?? erreurChargement ?? message}
        </p>
      )}
      <div className="pce-cadre">
        <div className="pce-cadre-tete">
          <h3 id={`${id}-t`}>{classe.nom}</h3>
          <span className={`pce-etat pce-etat-${etat}`}>{etat === 'publiee' ? '● Publiée' : etat === 'coupee' ? 'Code coupé : la page ne s’ouvre plus' : 'Pas encore créée'}</span>
        </div>
        <div className="pce-corps">
          <div className="pce-code">
            {code ? (
              <>
                <div className="pce-qr" dangerouslySetInnerHTML={{ __html: qrCodeSvg(url, 168, `QR code de la page des élèves (${codeAffiche(code)})`) }} />
                <p className="pce-code-texte" aria-label={`Code : ${code.split('').join(' ')}`}>
                  {codeAffiche(code)}
                </p>
                <p className="pce-lien-court">{lienCourt}</p>
                <div className="pce-code-actions">
                  <button type="button" className="carnet-bouton" onClick={() => setProjection(true)}>
                    Projeter le code en classe
                  </button>
                  <button type="button" className="carnet-bouton" disabled={occupe} onClick={onNouveau}>
                    Nouveau code
                  </button>
                  {confirmerCoupure ? (
                    <div className="pce-confirmer" role="group" aria-label="Couper le code ?" onKeyDown={(e) => e.key === 'Escape' && (setConfirmerCoupure(false), boutonCouper.current?.focus())}>
                      <p>Couper le code ? La page ne s’ouvrira plus du tout, même avec un code gardé. « Nouveau code » la rouvrira.</p>
                      <div className="pce-confirmer-boutons">
                        <button
                          type="button"
                          ref={annuler}
                          className="carnet-bouton"
                          onClick={() => {
                            setConfirmerCoupure(false)
                            requestAnimationFrame(() => boutonCouper.current?.focus())
                          }}
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          className="carnet-bouton pce-danger-plein"
                          disabled={occupe}
                          onClick={() => {
                            setConfirmerCoupure(false)
                            onCouper()
                          }}
                        >
                          Couper le code
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" ref={boutonCouper} className="carnet-bouton pce-danger" disabled={occupe} onClick={() => setConfirmerCoupure(true)}>
                      Couper le code
                    </button>
                  )}
                </div>
                <p className="pce-aide">« Nouveau code » : l’ancien cesse de marcher (élève parti, code diffusé hors de la classe). « Couper » : la page ne s’ouvre plus du tout.</p>
              </>
            ) : (
              <>
                <p className="pce-sans-code">{page ? 'Le code est coupé : vos élèves ne peuvent plus ouvrir la page.' : 'Aucun code pour cette classe.'}</p>
                <button type="button" className="carnet-bouton principal carnet-bouton-large" disabled={occupe} onClick={onCreer}>
                  {page ? 'Nouveau code' : 'Créer le code'}
                </button>
                <p className="pce-aide">Un code de 6 caractères (sans 0, O, 1 ni I) et son QR code, à montrer à la classe. La page se publie dès sa création.</p>
              </>
            )}
          </div>

          <div className="pce-publier">
            <h3>Ce que les élèves voient</h3>
            <Interrupteur
              nom="Prochaines interros"
              desc="Date, étapes du chapitre et générateurs « Pour t’entraîner » (repris de l’interro annoncée dans Mes classes)."
              actif={reglages.publier_interros}
              desactive={occupe || !page}
              onChange={(v) => onReglages({ ...reglages, publier_interros: v })}
            />
            <Interrupteur
              nom="Devoirs à rendre"
              desc="Texte du devoir et exercices en ligne joints, jusqu’au jour où il est à rendre."
              actif={reglages.publier_devoirs}
              desactive={occupe || !page}
              onChange={(v) => onReglages({ ...reglages, publier_devoirs: v })}
            />
            <Interrupteur
              nom="Matière vue"
              desc="Les 3 dernières séances : date et étapes du chapitre, avec un lien vers chaque étape."
              actif={reglages.publier_matiere}
              desactive={occupe || !page}
              onChange={(v) => onReglages({ ...reglages, publier_matiere: v })}
            />
            <Interrupteur
              nom="Heure des séances et des interros"
              desc="« 2e heure » ou la plage horaire, selon votre réglage de l’agenda."
              actif={reglages.publier_heure}
              desactive={occupe || !page}
              onChange={(v) => onReglages({ ...reglages, publier_heure: v })}
            />
            <Interrupteur
              nom="Mon nom"
              desc="« Publié par … » avec le nom de votre profil. Coupé : « Publié par ton professeur »."
              actif={reglages.publier_nom}
              desactive={occupe || !page}
              onChange={(v) => onReglages({ ...reglages, publier_nom: v })}
            />
            <p className="pce-jamais">
              <strong>Jamais publié :</strong> les remarques de séance, les objectifs et compétences, les autres classes, le nom de l’école, votre nom (sauf si vous le cochez), les autres
              événements de l’agenda. Une copie de ce qui est coché part sur le serveur à chaque changement dans Mes classes ; le reste ne quitte pas votre compte. Les élèves n’envoient rien.
            </p>
            {page && (
              <div className="pce-etat-publication">
                <p>
                  {code ? (page.publie_le ? `Publié le ${new Date(page.publie_le).toLocaleString('fr-BE', { dateStyle: 'long', timeStyle: 'short' })}.` : 'Publication en cours…') : 'Rien n’est visible tant que le code est coupé.'}{' '}
                  {resume.length > 0 ? `En ce moment : ${resume.join(', ')}.` : 'Rien n’est coché.'}
                </p>
                <div className="pce-boutons">
                  <button type="button" className="carnet-bouton" disabled={occupe || !code} onClick={onMettreAJour}>
                    Mettre à jour maintenant
                  </button>
                  {code ? (
                    <a className="carnet-bouton" href={`/classe?code=${code}&apercu=1`} target="_blank" rel="noopener">
                      Voir comme un élève <span className="carnet-sr">(nouvel onglet)</span>
                    </a>
                  ) : (
                    <button type="button" className="carnet-bouton" disabled>
                      Voir comme un élève
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {projection && code && <Projection code={code} url={url} lienCourt={lienCourt} classe={classe.nom} onFermer={() => setProjection(false)} />}
    </section>
  )
}

function Interrupteur({ nom, desc, actif, desactive, onChange }: { nom: string; desc: string; actif: boolean; desactive: boolean; onChange: (v: boolean) => void }) {
  const id = useId()
  return (
    <div className="pce-interrupteur">
      <span className="pce-it-texte">
        <span className="pce-it-nom" id={`${id}-n`}>
          {nom}
        </span>
        <span className="pce-it-desc" id={`${id}-d`}>
          {desc}
        </span>
      </span>
      <button type="button" role="switch" aria-checked={actif} aria-labelledby={`${id}-n`} aria-describedby={`${id}-d`} className="pce-it-bouton" disabled={desactive} onClick={() => onChange(!actif)}>
        <span className="pce-it-etat" aria-hidden="true">
          {actif ? 'Oui' : 'Non'}
        </span>
      </button>
    </div>
  )
}

/** Code projeté en plein écran, lisible au fond de la classe (Échap ou « Fermer »). */
function Projection({ code, url, lienCourt, classe, onFermer }: { code: string; url: string; lienCourt: string; classe: string; onFermer: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const fermer = useRef<HTMLButtonElement>(null)
  const titre = useId()
  useEffect(() => {
    const precedent = document.activeElement instanceof HTMLElement ? document.activeElement : null
    fermer.current?.focus()
    const debordement = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const el = ref.current
    try {
      if (el && document.fullscreenEnabled && !document.fullscreenElement) void el.requestFullscreen().catch(() => undefined)
    } catch {
      /* plein écran refusé : la projection occupe déjà toute la fenêtre */
    }
    return () => {
      document.body.style.overflow = debordement
      try {
        if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
      } catch {
        /* rien */
      }
      if (precedent && document.contains(precedent)) precedent.focus({ preventScroll: true })
    }
  }, [])
  function clavier(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onFermer()
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      fermer.current?.focus()
    }
  }

  return createPortal(
    <div className="pce-projection" role="dialog" aria-modal="true" aria-labelledby={titre} ref={ref} onKeyDown={clavier}>
      <p className="pce-proj-classe" id={titre}>
        Page de la classe {classe}
      </p>
      <div className="pce-proj-corps">
        <div className="pce-proj-qr" dangerouslySetInnerHTML={{ __html: qrCodeSvg(url, 480, `QR code de la page des élèves (${codeAffiche(code)})`) }} />
        <div className="pce-proj-texte">
          <p className="pce-proj-consigne">Scanne le QR code, ou va sur</p>
          <p className="pce-proj-lien">{lienCourt}</p>
          <p className="pce-proj-consigne">et tape le code</p>
          <p className="pce-proj-code">{codeAffiche(code)}</p>
          <p className="pce-proj-note">Aucun nom, aucun compte : rien ne t’est demandé.</p>
        </div>
      </div>
      <button type="button" ref={fermer} className="pce-proj-fermer" onClick={onFermer}>
        Fermer <span className="pce-proj-touche">(Échap)</span>
      </button>
    </div>,
    document.body,
  )
}
