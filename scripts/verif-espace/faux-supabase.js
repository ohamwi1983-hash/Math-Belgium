/*
 * Faux client Supabase pour vérifier l'espace professeur sans serveur (NON importé par l'application).
 *
 * Injecté par Playwright (`page.addInitScript`) AVANT le démarrage du site, dans un build de DÉVELOPPEMENT
 * (`NODE_ENV=development npx vite build --mode test --outDir …`) : `src/lib/supabase.ts` lit alors
 * `window.__MB_FAUX_SUPABASE__` (jamais dans un build de production).
 *
 * - Données : `window.__MB_DONNEES__` (tables → lignes) au premier chargement de l'onglet, puis gardées dans
 *   `sessionStorage['faux-supabase:db']` (elles survivent aux navigations et rechargements du même onglet).
 * - Session : `window.__MB_DONNEES__.utilisateur` ({ id, email }) ; `window.__MB_OPTIONS__.anonyme` = pas de session.
 * - Options (`window.__MB_OPTIONS__`) : `sans0013` (colonne `seances.evaluation_competences` inconnue : 42703).
 * - Requêtes chaînées : select / insert / update / delete / upsert, eq, neq, is, not(…, 'is', null), in, gte, lte,
 *   order, limit, single, maybeSingle (thenable comme supabase-js) ; rpc : lire_page_classe, nouveau_code_classe,
 *   couper_code_classe, definir_ecole_par_defaut ; auth : onAuthStateChange, getSession, getUser,
 *   signInWithPassword, signOut.
 * - Règles imitées : `seances.evaluation_evenement` remis à NULL quand l'événement est supprimé (ON DELETE SET NULL),
 *   liaisons `evenements_classes` supprimées avec leur événement, `publie_le` posé quand le contenu d'une page change.
 * - Journal des écritures : `window.__MB_JOURNAL__` (tableau { op, table, valeurs }) pour les vérifications.
 */
;(function () {
  const CLE = 'faux-supabase:db'
  const donnees = window.__MB_DONNEES__ || {}
  const options = window.__MB_OPTIONS__ || {}
  const utilisateur = options.anonyme ? null : donnees.utilisateur || null
  let db
  try {
    db = JSON.parse(sessionStorage.getItem(CLE) || 'null')
  } catch {
    db = null
  }
  if (!db) {
    db = JSON.parse(JSON.stringify(donnees.tables || {}))
    sauver()
  }
  window.__MB_JOURNAL__ = window.__MB_JOURNAL__ || []

  function sauver() {
    try {
      sessionStorage.setItem(CLE, JSON.stringify(db))
    } catch {
      /* rien */
    }
  }
  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16))
  }
  const table = (nom) => (db[nom] = db[nom] || [])
  const SANS_ID = new Set(['pages_classe', 'carnet_reglages', 'horaires_ecoles', 'evenements_classes'])
  const DEFAUTS = {
    seances: {
      heure_fin: null,
      numero_heure: null,
      numero_heure_fin: null,
      parties: [],
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
    },
    evenements: { intitule: '', journee_entiere: true, heure_debut: null, heure_fin: null, toutes_classes: false, accompagne: false, classe_id: null, chapitre: null },
    pages_classe: { code: null, publier_interros: true, publier_devoirs: true, publier_matiere: true, publier_heure: false, publier_nom: false, contenu: {}, publie_le: null },
  }
  function erreurColonne(cols) {
    if (options.sans0013 && /evaluation_competences/.test(cols || '')) return { code: '42703', message: 'column seances.evaluation_competences does not exist' }
    return null
  }

  class Requete {
    constructor(nom) {
      this.nom = nom
      this.op = 'select'
      this.filtres = []
      this.tri = []
      this.valeurs = null
      this.unique = null
      this.max = null
      this.cols = '*'
      this.retour = false
    }
    select(cols) {
      if (this.op === 'select') this.cols = cols || '*'
      else this.retour = true
      this.colsRetour = cols
      return this
    }
    insert(v) {
      this.op = 'insert'
      this.valeurs = v
      return this
    }
    upsert(v) {
      this.op = 'upsert'
      this.valeurs = v
      return this
    }
    update(v) {
      this.op = 'update'
      this.valeurs = v
      return this
    }
    delete() {
      this.op = 'delete'
      return this
    }
    eq(c, v) {
      this.filtres.push((r) => r[c] === v)
      return this
    }
    neq(c, v) {
      this.filtres.push((r) => r[c] !== v)
      return this
    }
    is(c, v) {
      this.filtres.push((r) => (r[c] ?? null) === v)
      return this
    }
    not(c, op, v) {
      if (op === 'is') this.filtres.push((r) => (r[c] ?? null) !== v)
      else this.filtres.push((r) => r[c] !== v)
      return this
    }
    in(c, liste) {
      this.filtres.push((r) => liste.includes(r[c]))
      return this
    }
    gte(c, v) {
      this.filtres.push((r) => r[c] >= v)
      return this
    }
    lte(c, v) {
      this.filtres.push((r) => r[c] <= v)
      return this
    }
    order(c, o) {
      this.tri.push([c, !o || o.ascending !== false])
      return this
    }
    limit(n) {
      this.max = n
      return this
    }
    single() {
      this.unique = 'single'
      return this
    }
    maybeSingle() {
      this.unique = 'maybe'
      return this
    }
    then(ok, ko) {
      return Promise.resolve()
        .then(() => this.executer())
        .then(ok, ko)
    }
    lignes() {
      return table(this.nom).filter((r) => (r.proprietaire === undefined || !utilisateur || r.proprietaire === utilisateur.id) && this.filtres.every((f) => f(r)))
    }
    executer() {
      const err = erreurColonne(this.op === 'select' ? this.cols : JSON.stringify(this.valeurs || {}) + (this.colsRetour || ''))
      if (err && this.nom === 'seances') return { data: null, error: err }
      let data
      const maintenant = new Date().toISOString()
      if (this.op === 'select') {
        data = this.lignes().map((r) => ({ ...r }))
        for (const [c, asc] of [...this.tri].reverse()) data.sort((a, b) => ((a[c] ?? '') < (b[c] ?? '') ? (asc ? -1 : 1) : (a[c] ?? '') > (b[c] ?? '') ? (asc ? 1 : -1) : 0))
        if (this.max !== null) data = data.slice(0, this.max)
      } else if (this.op === 'insert' || this.op === 'upsert') {
        const liste = Array.isArray(this.valeurs) ? this.valeurs : [this.valeurs]
        data = liste.map((v) => {
          const ligne = { ...(DEFAUTS[this.nom] || {}), ...(SANS_ID.has(this.nom) ? {} : { id: uuid() }), proprietaire: utilisateur ? utilisateur.id : null, cree_le: maintenant, modifie_le: maintenant, ...v }
          if (this.nom === 'pages_classe' && v.contenu) ligne.publie_le = maintenant
          if (this.op === 'upsert' && this.nom === 'carnet_reglages') {
            const ex = table(this.nom).find((r) => r.proprietaire === ligne.proprietaire)
            if (ex) return Object.assign(ex, v)
          }
          table(this.nom).push(ligne)
          return ligne
        })
        window.__MB_JOURNAL__.push({ op: this.op, table: this.nom, valeurs: JSON.parse(JSON.stringify(liste)) })
      } else if (this.op === 'update') {
        data = this.lignes()
        for (const r of data) {
          if (this.nom === 'pages_classe' && this.valeurs.contenu && JSON.stringify(this.valeurs.contenu) !== JSON.stringify(r.contenu)) r.publie_le = maintenant
          Object.assign(r, this.valeurs, { modifie_le: maintenant })
        }
        window.__MB_JOURNAL__.push({ op: 'update', table: this.nom, valeurs: JSON.parse(JSON.stringify(this.valeurs)), ids: data.map((r) => r.id ?? r.classe_id) })
      } else if (this.op === 'delete') {
        const partants = this.lignes()
        db[this.nom] = table(this.nom).filter((r) => !partants.includes(r))
        if (this.nom === 'evenements')
          for (const e of partants) {
            for (const s of table('seances')) if (s.evaluation_evenement === e.id) s.evaluation_evenement = null
            db.evenements_classes = table('evenements_classes').filter((l) => l.evenement_id !== e.id)
          }
        window.__MB_JOURNAL__.push({ op: 'delete', table: this.nom, ids: partants.map((r) => r.id ?? r.classe_id) })
        data = partants
      }
      sauver()
      if (this.unique) {
        if (data.length === 0) return this.unique === 'single' ? { data: null, error: { code: 'PGRST116', message: 'no rows' } } : { data: null, error: null }
        return { data: data[0], error: null }
      }
      return { data, error: null }
    }
  }

  const JOUR = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

  function rpc(nom, args) {
    const p = Promise.resolve().then(() => {
      if (nom === 'lire_page_classe') {
        const code = String(args.p_code || '').replace(/[\s-]/g, '').toUpperCase()
        const page = table('pages_classe').find((x) => x.code === code)
        if (!page) return { data: { statut: 'inconnu' }, error: null }
        const classe = table('classes').find((c) => c.id === page.classe_id)
        const auj = JOUR()
        const res = { statut: 'ok', classe: classe ? classe.nom : '', mis_a_jour: page.publie_le }
        const c = page.contenu || {}
        const sansHeure = (e) => {
          const x = { ...e }
          if (!page.publier_heure) delete x.heure
          return x
        }
        if (page.publier_interros) res.interros = (c.interros || []).filter((i) => i.date >= auj).map(sansHeure)
        if (page.publier_devoirs) res.devoirs = (c.devoirs || []).filter((d) => !d.pour || d.pour >= auj)
        if (page.publier_matiere) res.seances = (c.seances || []).map(sansHeure)
        return { data: res, error: null }
      }
      if (nom === 'nouveau_code_classe') {
        let page = table('pages_classe').find((x) => x.classe_id === args.p_classe)
        if (!page) {
          page = { ...DEFAUTS.pages_classe, classe_id: args.p_classe, proprietaire: utilisateur.id, contenu: {} }
          table('pages_classe').push(page)
        }
        page.code = Array.from({ length: 6 }, () => ALPHABET[(Math.random() * 32) | 0]).join('')
        page.code_cree_le = new Date().toISOString()
        sauver()
        return { data: page.code, error: null }
      }
      if (nom === 'couper_code_classe') {
        const page = table('pages_classe').find((x) => x.classe_id === args.p_classe)
        if (page) page.code = null
        sauver()
        return { data: null, error: null }
      }
      if (nom === 'definir_ecole_par_defaut') {
        for (const e of table('ecoles')) e.par_defaut = e.id === args.p_ecole
        sauver()
        return { data: null, error: null }
      }
      return { data: null, error: { code: '42883', message: `function ${nom} does not exist` } }
    })
    return p
  }

  const session = utilisateur ? { access_token: 'faux', user: { id: utilisateur.id, email: utilisateur.email, user_metadata: {} } } : null
  const client = {
    from: (nom) => new Requete(nom),
    rpc,
    auth: {
      onAuthStateChange(cb) {
        setTimeout(() => cb('INITIAL_SESSION', session), 0)
        return { data: { subscription: { unsubscribe() {} } } }
      },
      getSession: async () => ({ data: { session }, error: null }),
      getUser: async () => ({ data: { user: session ? session.user : null }, error: null }),
      signInWithPassword: async () => ({ data: { session }, error: null }),
      signOut: async () => ({ error: null }),
    },
  }
  window.__MB_FAUX_SUPABASE__ = client
  window.__MB_FAUX_DB__ = () => db
})()
