const nodemailer = require('nodemailer');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const app = express();


// --- CONFIGURATION SÉCURITÉ ---
const SECRET_KEY = "91511556"; 

const pool = new Pool({
  connectionString: 'postgresql://gestion_boutique_mrg8_user:Ox0AbrwsOGvclO2aetiukifG9O3hsSo4@dpg-d91lldho3t8c73eairh0-a.ohio-postgres.render.com/gestion_boutique_mrg8'
});


app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'admin-id'] // 🌟 AJOUTÉ ICI
}));

// 🌟 CONFIGURATION DE LA TAILLE DE SAUVEGARDE AJOUTÉE ICI SANS RIEN TOUCHER D'AUTRE
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MIDDLEWARES ---
const genererCle12Caracteres = () => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let cle = '';
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * caracteres.length);
    cle += caracteres.charAt(randomIndex);
  }
  return cle;
};
const clesUtilisees = new Set();
let derniereCleGeneree = "";
// On initialise l'abonnement comme inactif au lancement du serveur
let statutAbonnement = {
  actif: false,
  dateExpiration: null,
  forfait: null
};
if (typeof statutAbonnementParAdmin === 'undefined') {
  global.statutAbonnementParAdmin = {}; 
}
const verifierConnexion = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ error: "Accès refusé" });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // --- AJOUT SÉCURITÉ ---
    // On s'assure que l'ID est bien présent dans le token décodé
    if (!decoded.id) {
      return res.status(401).json({ error: "Token invalide : ID manquant" });
    }
    
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ error: "Session expirée" });
  }
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Destination : le dossier vide créé automatiquement
  },
  filename: (req, file, cb) => {
    // On prend l'heure exacte en millisecondes + l'extension d'origine (.jpg, .png...)
    // Exemple de nom généré : 1717300000123.jpg
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Initialisation de l'outil de téléchargement
const upload = multer({ storage: storage });

// Vérifie si le dossier 'uploads' existe, sinon il le crée automatiquement
const dossierUploads = './uploads';
if (!fs.existsSync(dossierUploads)) {
    fs.mkdirSync(dossierUploads);
    console.log("📁 Le dossier 'uploads' a été créé automatiquement !");
}

const verifierAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ error: "Accès refusé" });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: "Action réservée à l'administrateur" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Session expirée" });
  }
};

// --- AUTHENTIFICATION ---

app.post('/api/auth/login', async (req, res) => {
  const nom_utilisateur = req.body.nom_utilisateur ? req.body.nom_utilisateur.trim() : "";
  const mot_de_passe = req.body.mot_de_passe ? req.body.mot_de_passe.trim() : "";
  
  try {
    // 🔍 1. DIAGNOSTIC : Qu'est-ce que React envoie au serveur ?
    console.log("=== DIAGNOSTIC LOGIN : REÇU DE REACT ===");
    console.log("nom_utilisateur reçu :", nom_utilisateur);

    const userResult = await pool.query(
      'SELECT id, nom_utilisateur, mot_de_passe, role, admin_id, prenom, nom_reel, telephone, email FROM utilisateurs WHERE nom_utilisateur = $1', 
      [nom_utilisateur]
    );
    
    if (userResult.rows.length === 0) {
      console.log("❌ RÉSULTAT : Aucun utilisateur trouvé dans la base de données pour ce nom.");
      return res.status(400).json({ error: "Utilisateur non trouvé" });
    }

    const user = userResult.rows[0];

    // 🔍 2. DIAGNOSTIC : Qu'est-ce qui est Réellement écrit dans ton SQL pour cet utilisateur ?
    console.log("=== DIAGNOSTIC LOGIN : CONTENU DE LA BASE SQL ===");
    console.log("id :", user.id);
    console.log("nom_utilisateur :", user.nom_utilisateur);
    console.log("prenom en base :", user.prenom);
    console.log("nom_reel en base :", user.nom_reel);
    console.log("telephone en base :", user.telephone);
    console.log("email en base :", user.email);

    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isMatch) {
      console.log("❌ RÉSULTAT : Mot de passe incorrect.");
      return res.status(400).json({ error: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, nom: user.nom_utilisateur, adminId: user.admin_id }, 
      SECRET_KEY, 
      { expiresIn: '24h' }
    );
    
    const reponseObj = { 
      id: user.id, 
      nom_utilisateur: user.nom_utilisateur,
      role: user.role,
      admin_id: user.admin_id,
      prenom: user.prenom || "", 
      nom_reel: user.nom_reel || "", 
      telephone: user.telephone || "Non renseigné",
      email: user.email || "Non renseigné"
    };

    // 🔍 3. DIAGNOSTIC : Qu'est-ce que le serveur renvoie finalement à React ?
    console.log("=== DIAGNOSTIC LOGIN : ENVOYÉ VERS REACT ===");
    console.log(reponseObj);
    console.log("=============================================");
    
    res.json({ token, user: reponseObj });

  } catch (err) {
    console.error("💥 ERREUR SERVEUR LOGIN :", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// Créer un nouveau vendeur (Seul l'admin peut)
app.post('/api/admin/creer-vendeur', verifierConnexion, verifierAdmin, async (req, res) => {
  // 🛠️ Extraction de toutes les variables possibles envoyées par le frontend
  const { nom_utilisateur, email, mot_de_passe, prenom, nom_famille } = req.body;
  
  // Prise en compte du téléphone s'il fait partie de req.body
  const telephone = req.body.telephone || null;

  // 🛠️ Sécurité : Si le nom de famille est identique à l'identifiant, on met null pour éviter le doublon
  const nomReelFinal = (nom_famille && nom_famille !== nom_utilisateur) ? nom_famille : null;

  try {
    const hash = await bcrypt.hash(mot_de_passe, 10);
    
    // 🛠️ Mise à jour de la requête pour insérer le prénom, le nom réel nettoyé, et le téléphone
    await pool.query(
      'INSERT INTO utilisateurs (nom_utilisateur, email, mot_de_passe, role, admin_id, prenom, nom_reel, telephone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        nom_utilisateur, 
        email || null, 
        hash, 
        'vendeur', 
        req.user.id, 
        prenom || null, 
        nomReelFinal, 
        telephone
      ]
    );
    res.json({ message: "Vendeur créé avec succès !" });
  } catch (err) {
    // MODIFICATION ICI : on renvoie le message d'erreur SQL exact
    console.error(err);
    res.status(500).json({ error: "Détail SQL : " + err.message });
  }
});
app.put('/api/admin/modifier-mon-mdp', verifierConnexion, verifierAdmin, async (req, res) => {
  // CE MESSAGE DOIT APPARAITRE DÈS QUE TU CLIQUES
  console.log("--- TENTATIVE DE CHANGEMENT DE MDP REÇUE ---");
  
  const { ancienMdp, nouveauMdp } = req.body;
  const userFromToken = req.user || req.utilisateur;
  
  console.log("Contenu du token :", userFromToken);

  const adminId = userFromToken?.id;

  if (!adminId) {
    console.log("ERREUR : ID introuvable dans le token");
    return res.status(401).json({ error: "Utilisateur non identifié dans le token." });
  }

  try {
    const userResult = await pool.query('SELECT * FROM utilisateurs WHERE id = $1', [adminId]);
    
    if (userResult.rows.length === 0) {
      console.log("ERREUR : ID " + adminId + " absent de la base de données");
      return res.status(404).json({ error: "Compte admin introuvable dans la base." });
    }

    const match = await bcrypt.compare(ancienMdp, userResult.rows[0].mot_de_passe);
    if (!match) {
      return res.status(401).json({ error: "L'ancien mot de passe est faux." });
    }

    const hash = await bcrypt.hash(nouveauMdp, 10);
    await pool.query('UPDATE utilisateurs SET mot_de_passe = $1 WHERE id = $2', [hash, adminId]);
    
    console.log("SUCCÈS : Mot de passe mis à jour");
    res.json({ message: "Succès" });
  } catch (err) {
    console.error("ERREUR SQL :", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// 4. LISTE DES VENDEURS (Ajout du champ mot_de_passe pour l'affichage du hash avec l'œil)
app.get('/api/admin/vendeurs', verifierConnexion, verifierAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nom_utilisateur, email, mot_de_passe, role FROM utilisateurs WHERE role = $1 AND admin_id = $2', 
      ['vendeur', req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur lecture vendeurs" });
  }
});
// --- GESTION PRODUITS ---

// REMPLACE TON GET PAR CELUI-CI
app.get('/api/produits', verifierConnexion, async (req, res) => {
  try {
    // --- AJOUT DU FILTRE PAR ADMIN_ID (ADMIN OU PATRON DU VENDEUR) ---
    const idAUtiliser = req.user.role === 'admin' ? req.user.id : req.user.adminId;

    const result = await pool.query(
      "SELECT * FROM produits WHERE admin_id = $1 ORDER BY nom ASC",
      [idAUtiliser]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/produits', verifierConnexion, upload.single('image'), async (req, res) => {
  const { nom, categorie, prix_achat, prix_vente, stock_actuel, stock_minimum, date_entree } = req.body;
  const admin_id = req.user.id; 

  try {
    // 🛠️ AJOUT UNIQUE : Récupération de l'URL de l'image si elle a été fournie
    const image_url = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      "INSERT INTO produits (nom, categorie, prix_achat, prix_vente, stock_actuel, stock_minimum, actif, admin_id, date_entree, image_url) VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8, $9) RETURNING *",
      [nom, categorie || 'Général', prix_achat, prix_vente, stock_actuel, stock_minimum, admin_id, date_entree || new Date(), image_url]
    );
    
    // On ne touche plus aux fournisseurs ici, on renvoie juste le produit créé
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur SQL:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});
app.get('/api/fournisseurs/:id/produits', verifierConnexion, async (req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;

    try {
        // AJOUT : a.montant_paye et a.montant_credit sélectionnés ici
        const result = await pool.query(
            `SELECT p.nom, a.quantite, a.prix_achat_unitaire as prix_achat, a.date_achat as date_entree, a.montant_paye, a.montant_credit, a.source_paiement 
             FROM achats a
             JOIN produits p ON a.produit_id = p.id
             WHERE a.fournisseur_id = $1 AND a.admin_id = $2
             ORDER BY a.date_achat DESC`,
            [id, adminId]
        );
        
        console.log(`Transactions trouvées pour le fournisseur ${id}:`, result.rows.length);
        res.json(result.rows);
    } catch (err) {
        console.error("Erreur SQL:", err.message);
        res.status(500).json({ error: "Erreur de récupération" });
    }
});
app.post('/api/fournisseurs/:id/payer', verifierConnexion, async (req, res) => {
    const { id } = req.params;
    const { montant_verse } = req.body; 
    const adminId = req.user.id;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        // --- SÉCURITÉ 1 : VÉRIFIER LA DETTE ACTUELLE ---
        const checkFournisseur = await client.query(
            `SELECT nom, dette_totale FROM fournisseurs WHERE id = $1 AND admin_id = $2`,
            [id, adminId]
        );
        if (checkFournisseur.rows.length === 0) {
            throw new Error("Fournisseur non trouvé");
        }
        const detteActuelle = parseFloat(checkFournisseur.rows[0].dette_totale);
        if (detteActuelle <= 0) {
            return res.status(400).json({ error: "Ce fournisseur n'a aucune dette à régler." });
        }
        if (montant_verse > detteActuelle) {
            return res.status(400).json({ error: `Le montant dépasse la dette (Dette: ${detteActuelle} F).` });
        }
        // --- SÉCURITÉ 2 : VÉRIFIER LE SOLDE EN CAISSE ---
        const checkCaisse = await client.query(
    `SELECT COALESCE(SUM(prix_total), 0) as total_caisse FROM ventes WHERE admin_id = $1`,
    [adminId]
);
// COALESCE permet d'avoir 0 au lieu de NULL si la table est vide.
        const montantNum = Number(montant_verse);
const caisseNum = Number(checkCaisse.rows[0].total_caisse);

console.log(`Tentative: ${montantNum} F | Caisse: ${caisseNum} F`); // Regarde tes logs serveurs !

if (montantNum > caisseNum) {
    return res.status(400).json({ error: `Fonds insuffisants. Solde caisse : ${caisseNum} F` });
}
        // 1. Récupérer le dernier numéro de ticket utilisé dans la table ventes
        const lastTicketRes = await client.query(
            `SELECT numero_ticket FROM ventes 
             WHERE admin_id = $1 
             ORDER BY id DESC LIMIT 1`, 
            [adminId]
        );
        // On calcule le nouveau numéro (si pas de ticket, on commence à 001)
        let dernierNumero = lastTicketRes.rows[0]?.numero_ticket || "000";
        let nouveauNumero = (parseInt(dernierNumero) + 1).toString().padStart(3, '0');
        // 2. Réduire la dette du fournisseur
        const resFournisseur = await client.query(
            `UPDATE fournisseurs 
             SET dette_totale = dette_totale - $1 
             WHERE id = $2 AND admin_id = $3
             RETURNING nom, dette_totale`,
            [montant_verse, id, adminId]
        );
        
        // MODIFICATION ICI : Ajout de type_operation ($5) et de sa valeur 'reappro' pour ne pas impacter la situation du jour
        await client.query(
            `INSERT INTO ventes (designation, prix_total, date_vente, admin_id, etat, numero_ticket, mode_paiement, type_operation) 
             VALUES ($1, $2, NOW(), $3, 'validee', $4, 'Espèce', 'reappro')`,
            [`PAIEMENT FOURNISSEUR : ${resFournisseur.rows[0].nom}`, -montant_verse, adminId, nouveauNumero] 
        );
        await client.query('COMMIT');
        res.json({ 
            message: "Paiement enregistré avec ticket n°" + nouveauNumero, 
            nouvelle_dette: resFournisseur.rows[0].dette_totale // REPARÉ ICI : 'nouvelle_dette' à la place de 'node_dette'
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Erreur paiement :", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});
// REMPLACE TON PUT PAR CELUI-CI
app.put('/api/produits/:id', verifierConnexion, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  // On récupère toutes les valeurs envoyées par le frontend
  // Note : j'ai ajouté stock_alerte et date_entree si vous les utilisez
  const { nom, categorie, prix_achat, prix_vente, stock_actuel, stock_minimum, stock_alerte } = req.body;
  const supprimer_image = req.body.supprimer_image === 'true' || req.body.supprimer_image === true;

  try {
    let result;

    // 🛠️ Si l'utilisateur demande la suppression de la photo actuelle
    if (supprimer_image) {
      // 1. On cherche d'abord si le produit avait déjà une ancienne image stockée
      const ancienProduit = await pool.query("SELECT image_url FROM produits WHERE id = $1", [id]);
      if (ancienProduit.rows.length > 0 && ancienProduit.rows[0].image_url) {
        const ancienneUrl = ancienProduit.rows[0].image_url;
        
        // On extrait le nom du fichier à partir de l'URL
        const nomFichier = ancienneUrl.split('/').pop();
        const cheminFichier = path.join(__dirname, 'uploads', nomFichier);
        
        // 2. On supprime l'ancien fichier du disque dur s'il existe vraiment
        if (fs.existsSync(cheminFichier)) {
          fs.unlinkSync(cheminFichier);
        }
      }

      // 3. On met à jour le produit en mettant image_url à NULL
      result = await pool.query(
        `UPDATE produits 
         SET nom=$1, categorie=$2, prix_achat=$3, prix_vente=$4, stock_actuel=$5, stock_minimum=$6, stock_alerte=$7, actif=true, image_url=NULL 
         WHERE id=$8 RETURNING *`,
        [nom, categorie, prix_achat, prix_vente, stock_actuel, stock_minimum, stock_alerte || 0, id]
      );
    }
    // 🛠️ AJOUT UNIQUE : Vérification si une nouvelle photo a été sélectionnée sur l'appareil
    else if (req.file) {
      const image_url = `http://localhost:5000/uploads/${req.file.filename}`;
      
      // 1. On cherche d'abord si le produit avait déjà une ancienne image stockée
      const ancienProduit = await pool.query("SELECT image_url FROM produits WHERE id = $1", [id]);
      if (ancienProduit.rows.length > 0 && ancienProduit.rows[0].image_url) {
        const ancienneUrl = ancienProduit.rows[0].image_url;
        
        // On extrait le nom du fichier à partir de l'URL (ex: http://localhost:5000/uploads/123.jpg -> 123.jpg)
        const nomFichier = ancienneUrl.split('/').pop();
        const cheminFichier = path.join(__dirname, 'uploads', nomFichier);
        
        // 2. On supprime l'ancien fichier du disque dur s'il existe vraiment
        if (fs.existsSync(cheminFichier)) {
          fs.unlinkSync(cheminFichier);
        }
      }

      // 3. On met à jour le produit avec la NOUVELLE image
      result = await pool.query(
        `UPDATE produits 
         SET nom=$1, categorie=$2, prix_achat=$3, prix_vente=$4, stock_actuel=$5, stock_minimum=$6, stock_alerte=$7, actif=true, image_url=$8 
         WHERE id=$9 RETURNING *`,
        [nom, categorie, prix_achat, prix_vente, stock_actuel, stock_minimum, stock_alerte || 0, image_url, id]
      );
    } else {
      // 🛠️ AJOUT UNIQUE : Si aucune photo n'est fournie, on conserve l'ancienne image intacte
      result = await pool.query(
        `UPDATE produits 
         SET nom=$1, categorie=$2, prix_achat=$3, prix_vente=$4, stock_actuel=$5, stock_minimum=$6, stock_alerte=$7, actif=true 
         WHERE id=$8 RETURNING *`,
        [nom, categorie, prix_achat, prix_vente, stock_actuel, stock_minimum, stock_alerte || 0, id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    res.json({ message: "Produit modified avec succès", produit: result.rows[0] });
  } catch (err) {
    console.error("Erreur Modif:", err.message);
    res.status(500).json({ error: "Erreur lors de la modification du serveur" });
  }
});
app.put('/api/produits/restaurer/:id', verifierConnexion, async (req, res) => {
  try {
    await pool.query("UPDATE produits SET actif = true WHERE id = $1", [req.params.id]);
    res.json({ message: "OK" });
  } catch (err) { res.status(500).send(err); }
});
app.put('/api/admin/vendeurs/:id/reset-password', verifierConnexion, verifierAdmin, async (req, res) => {
  const { id } = req.params;
  const { mot_de_passe } = req.body;

  try {
    const hash = await bcrypt.hash(mot_de_passe, 10);
    await pool.query(
      'UPDATE utilisateurs SET mot_de_passe = $1 WHERE id = $2 AND role = $3',
      [hash, id, 'vendeur']
    );
    res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

// --- ROUTE POUR SUPPRIMER UN VENDEUR ---
app.delete('/api/admin/vendeurs/:id', verifierConnexion, verifierAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // On s'assure de ne pas supprimer l'admin par erreur
    const result = await pool.query(
      'DELETE FROM utilisateurs WHERE id = $1 AND role = $2', 
      [id, 'vendeur']
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Vendeur non trouvé" });
    }

    res.json({ message: "Vendeur supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur SQL lors de la suppression" });
  }
});

// --- ROUTE POUR RÉINITIALISER LE MOT DE PASSE ---
app.put('/api/admin/vendeurs/:id/reset-password', verifierConnexion, verifierAdmin, async (req, res) => {
  const { id } = req.params;
  const { mot_de_passe } = req.body;

  try {
    // On hache le nouveau mot de passe pour la sécurité
    const hash = await bcrypt.hash(mot_de_passe, 10);
    
    const result = await pool.query(
      'UPDATE utilisateurs SET mot_de_passe = $1 WHERE id = $2 AND role = $3',
      [hash, id, 'vendeur']
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Vendeur non trouvé" });
    }

    res.json({ message: "Mot de passe mis à jour !" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur SQL lors de la mise à jour" });
  }
});

// --- ROUTE ARCHIVAGE NETTOYÉE ---
app.delete('/api/produits/:id', verifierConnexion, async (req, res) => {
  try {
    const { id } = req.params; // CORRECTION ICI
    
    const result = await pool.query(
      "UPDATE produits SET actif = false WHERE id = $1 RETURNING *", 
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Produit introuvable" });
    }

    res.json({ message: "Succès : Archivé" });
  } catch (err) {
    console.error("ERREUR :", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
app.delete('/api/depenses/:id', verifierAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const resultat = await pool.query(
      'DELETE FROM depenses WHERE id = $1 RETURNING *',
      [id]
    );

    if (resultat.rowCount === 0) {
      return res.status(404).json({ error: "Dépense introuvable" });
    }

    res.json({ message: "Dépense supprimée avec succès" });
  } catch (err) {
    console.error("ERREUR SUPPRESSION DEPENSE:", err.message);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});
// --- GESTION DES VENTES (AJOUTÉ POUR FIXER LE BOUTON) ---
// ROUTE POUR VÉRIFIER LE CODE
app.post('/api/auth/verifier-code', async (req, res) => {
  const { email, code } = req.body;

  try {
    // Vérifier si le code existe pour cet email
    const result = await pool.query(
      "SELECT * FROM codes_validation WHERE email = $1 AND code = $2 AND expire_at > CURRENT_TIMESTAMP",
      [email, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Code incorrect ou expiré" });
    }

    // Si le code est bon, on active l'utilisateur
    await pool.query(
      "UPDATE utilisateurs SET est_valide = TRUE WHERE email = $1",
      [email]
    );

    // Supprimer le code utilisé
    await pool.query("DELETE FROM codes_validation WHERE email = $1", [email]);

    res.json({ message: "Compte activé !" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
app.post('/api/ventes', verifierConnexion, async (req, res) => {
  const { articles, montantRecu, monnaieRendue, monnaie_rendue, modePaiement, id_client, resteAPayer } = req.body;
  const client = await pool.connect();
  
  const adminId = req.user.role === 'admin' ? req.user.id : req.user.adminId; 
  const nomVendeur = req.user.nom;

  if (!adminId) {
    return res.status(401).json({ error: "Utilisateur non identifié. Reconnectez-vous." });
  }

  try {
    await client.query('BEGIN');

    const resDernierTicket = await client.query(
      "SELECT MAX(numero_ticket) as max_num FROM ventes WHERE admin_id = $1",
      [adminId]
    );
    const numeroTicket = (parseInt(resDernierTicket.rows[0].max_num) || 0) + 1;

    // Calcul du montant total réel du panier (Prix de vente total théorique)
    const totalPanierVente = articles.reduce((acc, art) => acc + (Number(art.prix_vente) * art.qte), 0);

    for (const art of articles) {
      // 1. Mise à jour du stock
      await client.query(
        "UPDATE produits SET stock_actuel = stock_actuel - $1 WHERE id = $2 AND admin_id = $3", 
        [art.qte, art.id, adminId]
      );
      
      const prixVenteTotalArt = art.prix_vente * art.qte;
      const coutAchatTotalArt = art.prix_achat * art.qte;

      let prixTotalPourCaisse = prixVenteTotalArt;
      let prixAchatPourCaisse = coutAchatTotalArt;
      let beneficePourCaisse = prixVenteTotalArt - coutAchatTotalArt;

      if (modePaiement === 'Crédit') {
        const avanceGlobale = Number(montantRecu) || 0;

        // On calcule le prorata (la part) de ce produit dans le panier global
        const partDuProduit = totalPanierVente > 0 ? (prixVenteTotalArt / totalPanierVente) : 0;
        
        // L'avance attribuée à CE produit spécifiquement
        const avancePourCeProduit = avanceGlobale * partDuProduit;

        // Le chiffre d'affaires qui rentre immédiatement en caisse pour ce produit est sa part d'avance
        prixTotalPourCaisse = avancePourCeProduit;

        if (avancePourCeProduit > coutAchatTotalArt) {
          // Cas A : L'avance sur ce produit dépasse son prix d'achat
          beneficePourCaisse = avancePourCeProduit - coutAchatTotalArt;
          prixAchatPourCaisse = coutAchatTotalArt;
        } else {
          // Cas B : L'avance n'atteint pas le coût d'achat du produit
          beneficePourCaisse = 0;
          prixAchatPourCaisse = avancePourCeProduit; // Évite les bénéfices négatifs en caisse aujourd'hui
        }
      }

      // 2. Insertion dans la table ventes
      await client.query(
        `INSERT INTO ventes (numero_ticket, designation, quantite, prix_unitaire_vente, prix_total, prix_unitaire_achat, date_vente, montant_recu, monnaie_rendue, mode_paiement, admin_id, benefice, vendeur_nom) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9, $10, $11, $12)`,
        [
          numeroTicket, 
          art.nom, 
          art.qte, 
          art.prix_vente, 
          prixTotalPourCaisse, 
          prixAchatPourCaisse, 
          modePaiement === 'Crédit' ? prixTotalPourCaisse : (montantRecu || 0), // Pour les crédits, le reçu par ligne correspond à son avance au prorata
          modePaiement === 'Crédit' ? 0 : (monnaieRendue || monnaie_rendue || 0),
          modePaiement || 'Espèce',
          adminId, 
          beneficePourCaisse,
          nomVendeur
        ]
      );
    }

    // 3. Enregistrement du crédit global du client (Reste inchangé)
    if (modePaiement === 'Crédit' && id_client && resteAPayer > 0) {
      const montantTotalAchat = (Number(montantRecu) || 0) + Number(resteAPayer);
      const premierProduitId = articles && articles.length > 0 ? articles[0].id : null;

      // 🌟 LE SEUL AJOUT : Intégration du numero_ticket ici
      await client.query(
        `INSERT INTO credits (client_id, admin_id, montant_total, montant_paye, statut, date_pret, produit_id, numero_ticket) 
         VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)`,
        [
          id_client, 
          adminId,
          montantTotalAchat, 
          montantRecu || 0, 
          'En cours',
          premierProduitId,
          numeroTicket // 🌟 Ajouté ici
        ]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({ ticket: numeroTicket, vendeur: nomVendeur });

  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error("Crash vente:", err.message);
    res.status(500).json({ error: "Erreur interne" });
  } finally {
    client.release();
  }
});
app.get('/api/credits/stats-globales', verifierConnexion, async (req, res) => {
  const adminId = req.user.role === 'admin' ? req.user.id : req.user.adminId;
  
  try {
    const statsResult = await pool.query(
      `SELECT 
        COALESCE(SUM(montant_total - montant_paye), 0) as total_dehors,
        COUNT(DISTINCT client_id) FILTER (WHERE montant_total > montant_paye) as clients_actifs,
        COALESCE(SUM(montant_paye), 0) as total_recouvre
       FROM credits 
       WHERE admin_id = $1`,
      [adminId]
    );

    res.json(statsResult.rows[0]);
  } catch (err) {
    console.error("Erreur stats globales crédits:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
app.get('/api/credits/client/:id_client', verifierConnexion, async (req, res) => {
  const adminId = req.user.role === 'admin' ? req.user.id : req.user.adminId;
  const { id_client } = req.params;

  try {
    // 1. Calcul du montant total dû par CE client spécifique
    const infoDetteResult = await pool.query(
      `SELECT COALESCE(SUM(montant_total - montant_paye), 0) as total_du_client
       FROM credits 
       WHERE client_id = $1 AND admin_id = $2`,
      [id_client, adminId]
    );

    // 2. Récupération de l'historique des articles pris à crédit
    const historiqueResult = await pool.query(
      `SELECT 
        c.id,
        COALESCE(p.designation, 'Article inconnu') as article,
        c.montant_total as montant,
        c.montant_paye as paye,
        (c.montant_total - c.montant_paye) as reste_a_payer,
        c.statut,
        c.date_pret
       FROM credits c
       LEFT JOIN produits p ON c.produit_id = p.id
       WHERE c.client_id = $1 AND c.admin_id = $2
       ORDER BY c.date_pret DESC`,
      [id_client, adminId]
    );

    res.json({
      totalDu: infoDetteResult.rows[0].total_du_client,
      historique: historiqueResult.rows[0] ? historiqueResult.rows : []
    });
  } catch (err) {
    console.error("Erreur détails client crédit:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// ROUTE D'INSCRIPTION ADMIN//
app.post('/api/auth/inscription-admin', async (req, res) => {
  try {
    // On extrait toutes les variables possibles envoyées par ton formulaire React (Ajout de nom_famille et nom_reel)
    const { nom_utilisateur, nom, nom_famille, nom_reel, motDePasse, confirmerMotDePasse, prenom, telephone, email } = req.body;
    const EMAIL_UNIQUE = "mt91511556@gmail.com"; 

    // Sécurité : On s'assure d'avoir un identifiant de connexion
    const identifiantFinal = nom_utilisateur || nom;
    
    // 🛠️ CORRECTION BLINDÉE : On intercepte le nom dans toutes les variables possibles (nom_famille, nom_reel ou nom)
    const inputNom = nom_famille || nom_reel || nom;

    // Si "inputNom" contient la même chose que l'identifiant (ex: 1234), 
    // on sait que ce n'est pas un vrai nom de famille. On met null à la place pour éviter le doublon !
    const nomDeFamilleFinal = (inputNom && inputNom !== identifiantFinal) ? inputNom : null;

    // --- CONFIGURATION DE L'ENVOYEUR (GMAIL) ---
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false, 
      auth: {
        user: 'mt91511556@gmail.com',
        pass: 'kwqerdnpnyodecfz'
      }
    });

    console.log("Tentative d'inscription pour l'identifiant :", identifiantFinal);

    if (!identifiantFinal || !motDePasse || !confirmerMotDePasse) {
      return res.status(400).json({ error: "Veuillez remplir les 3 champs (Nom, Mot de passe, Confirmation)" });
    }

    if (motDePasse !== confirmerMotDePasse) {
      return res.status(400).json({ error: "Les mots de passe ne correspondent pas" });
    }

    const userCheck = await pool.query("SELECT * FROM utilisateurs WHERE nom_utilisateur = $1", [identifiantFinal]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: "Ce nom d'utilisateur est déjà utilisé" });
    }
    const saltRounds = 10;
    const motDePasseHache = await bcrypt.hash(motDePasse, saltRounds);
    const codeValidation = Math.floor(100000 + Math.random() * 900000).toString();
    // Suppression des anciennes tentatives
    await pool.query("DELETE FROM codes_validation WHERE email = $1", [EMAIL_UNIQUE]);
    await pool.query(
      `INSERT INTO codes_validation 
      (email, code, nom_temporaire, pass_temporaire, prenom_temp, nom_reel_temp, telephone_temp, email_perso_temp) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        EMAIL_UNIQUE, 
        codeValidation, 
        identifiantFinal, 
        motDePasseHache, 
        prenom || null, 
        nomDeFamilleFinal, // 🛠️ Utilise maintenant la valeur nettoyée et multi-compatible
        telephone || null, 
        email || null
      ]
    );

    // --- ENVOI RÉEL DU MAIL ---
    const mailOptions = {
      from: 'mt91511556@gmail.com',
      to: EMAIL_UNIQUE,
      subject: 'Code de validation Administrateur',
      text: `Bonjour ${identifiantFinal},\n\nVotre code de validation pour la création du compte administrateur est : ${codeValidation}\n\nCe code is confidentiel.`
    };

    await transporter.sendMail(mailOptions);
    console.log(`📩 Email envoyé avec succès à ${EMAIL_UNIQUE}`);

    res.status(201).json({ 
      message: "Code généré et envoyé par mail ! Le compte sera créé après validation." 
    });

  } catch (err) {
    console.error("ERREUR INSCRIPTION :", err.message);
    res.status(500).json({ error: "Erreur lors de l'envoi du mail ou de l'inscription." });
  }
});

app.post('/api/auth/valider-et-creer-admin', async (req, res) => {
  const { code } = req.body;
  const EMAIL_COMMUN = "mt91511556@gmail.com";

  try {
    // 1. On cherche si le code existe pour l'email commun dans la table temporaire
    const resultatAttente = await pool.query(
      "SELECT * FROM codes_validation WHERE email = $1 AND code = $2",
      [EMAIL_COMMUN, code]
    );

    if (resultatAttente.rows.length === 0) {
      return res.status(400).json({ error: "Code incorrect ou expiré." });
    }

    // 2. Récupération des lignes de la base de données
    const row = resultatAttente.rows[0];

    const nom_temporaire = row.nom_temporaire || row.nom_temp;
    const pass_temporaire = row.pass_temporaire || row.pass_temp;
    
    // Détection des données pour le profil
    const prenomFinal = row.prenom_temp || row.prenom || "";
    
    // 🛠️ FORCE URGENCE : Si le nom est identique à l'identifiant (ex: '1234'), on force une chaîne vide ''
    // pour empêcher PostgreSQL d'utiliser une ancienne valeur par défaut ou de dupliquer l'identifiant.
    let nomReelFinal = row.nom_reel_temp || row.nom_reel || "";
    if (nomReelFinal === nom_temporaire || nomReelFinal === "1234") {
      nomReelFinal = ""; 
    }
    
    const telephoneFinal = row.telephone_temp || row.telephone || "";
    const emailFinal = row.email_perso_temp || row.email_perso || "Non renseigné";

    // 3. CRÉATION RÉELLE : Insertion forcée et propre
    const nouveauCompte = await pool.query(
      "INSERT INTO utilisateurs (nom_utilisateur, email, mot_de_passe, role, est_valide, prenom, nom_reel, telephone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, nom_utilisateur",
      [
        nom_temporaire, 
        emailFinal, 
        pass_temporaire, 
        'admin', 
        true, 
        prenomFinal, 
        nomReelFinal, 
        telephoneFinal
      ]
    );

    const compteCree = nouveauCompte.rows[0];

    // ============================================================
    // AJOUT MODIFIÉ : 2 MINUTES D'ESSAI GRATUIT ENREGISTRÉES EN BDD
    // ============================================================
    if (compteCree && compteCree.id) {
      const maintenant = new Date();
      let dateExpiration = new Date();
      dateExpiration.setDate(maintenant.getDate() + 7);
      const dateExpirationFinale = dateExpiration.toISOString();

      // Enregistrement direct et obligatoire en base de données pour éviter le clignement au premier rechargement
      await pool.query(
        `INSERT INTO abonnements (id_admin, actif, date_expiration, forfait) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id_admin) 
         DO UPDATE SET actif = EXCLUDED.actif, date_expiration = EXCLUDED.date_expiration, forfait = EXCLUDED.forfait`,
        [compteCree.id, true, dateExpirationFinale, '7_jours_essai']
      );

      statutAbonnementParAdmin[compteCree.id] = {
        actif: true,
        dateExpiration: dateExpiration.getTime(),
        forfait: '7_jours_essai'
      };
      
      console.log(`🎁 [ESSAI TEST] 2 minutes d'essai gratuit activées et enregistrées en BDD pour l'admin ID: ${compteCree.id}`);
    }

    // 4. NETTOYAGE : On supprime le code utilisé
    await pool.query("DELETE FROM codes_validation WHERE email = $1", [EMAIL_COMMUN]);

    res.json({ 
      message: "Félicitations ! Votre compte admin a été créé et activé.",
      user: compteCree
    });

  } catch (err) {
    console.error("Erreur lors de la validation :", err.message);
    res.status(500).json({ error: "Erreur serveur lors de la création du compte." });
  }
});
app.post('/api/auth/forgot-password', async (req, res) => {
  const { nom_utilisateur } = req.body;

  try {
    // 1. Chercher si l'utilisateur existe dans la base PostgreSQL
    const userResult = await pool.query(
      'SELECT email FROM utilisateurs WHERE nom_utilisateur = $1', 
      [nom_utilisateur]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Ce nom d'utilisateur n'existe pas." });
    }

    // L'unique email qui recevra tous les messages
    const emailUnique = 'mt91511556@gmail.com';

    // 2. Générer un code à 6 chiffres aléatoires
    const codeValidation = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Sauvegarder le code dans la table codes_validation
    await pool.query(
      'INSERT INTO codes_validation (email, code, expire_at) VALUES ($1, $2, CURRENT_TIMESTAMP + interval \'15 minutes\')',
      [emailUnique, codeValidation]
    );

    // 4. CONFIGURATION DE NODEMAILER POUR GMAIL
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mt91511556@gmail.com', 
        pass: 'kwqerdnpnyodecfz' // ⚠️ Voir explication importante ci-dessous
      }
    });

    // 5. CONTENU DE L'EMAIL
    const mailOptions = {
      from: '"Gestion Alimentation" <mt91511556@gmail.com>',
      to: emailUnique, // Reçoit sur ton adresse unique
      subject: '🔑 Code de récupération - Mot de passe oublié',
      text: `Bonjour,\n\nVotre code de validation pour réinitialiser votre mot de passe est : ${codeValidation}\n\nCe code expirera dans 15 minutes.`,
      html: `<p>Bonjour,</p><p>Votre code de validation pour réinitialiser votre mot de passe est : <strong>${codeValidation}</strong></p><p>Ce code expirera dans 15 minutes.</p>`
    };

    // 6. ENVOI RÉEL DE L'EMAIL
    await transporter.sendMail(mailOptions);
    console.log(`[Succès] Vrai email envoyé avec le code ${codeValidation} à ${emailUnique}`);

    return res.status(200).json({ success: true, message: "Code envoyé avec succès sur votre boîte mail." });

  } catch (error) {
    console.error("Erreur Nodemailer/SQL:", error);
    return res.status(500).json({ message: "Erreur lors de l'envoi de l'e-mail." });
  }
});
app.post('/api/auth/verify-recovery-code', async (req, res) => {
  const { code } = req.body;
  const emailUnique = 'mt91511556@gmail.com';

  try {
    // Recherche du code dans la table codes_validation que l'on voit dans ton fichier SQL
    const result = await pool.query(
      'SELECT * FROM codes_validation WHERE email = $1 AND code = $2 AND expire_at > CURRENT_TIMESTAMP',
      [emailUnique, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Code incorrect ou expiré." });
    }

    return res.status(200).json({ success: true, message: "Code valide !" });

  } catch (error) {
    console.error("Erreur serveur lors de la vérification :", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
});
app.post('/api/auth/update-password', async (req, res) => {
  // On force le serveur à dire au navigateur qu'il va répondre en JSON
  res.setHeader('Content-Type', 'application/json');

  const { nom_utilisateur, nouveau_mot_de_passe } = req.body;
  const emailUnique = 'mt91511556@gmail.com'; 

  // Vérification de sécurité de base côté serveur
  if (!nom_utilisateur || !nouveau_mot_de_passe) {
    return res.status(400).json({ success: false, message: "Données incomplètes." });
  }

  try {
    // Hasher le mot de passe avec le bcrypt importé globalement
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(nouveau_mot_de_passe, saltRounds);

    // Mise à jour du mot de passe dans la table 'utilisateurs'
    const result = await pool.query(
      'UPDATE utilisateurs SET mot_de_passe = $1 WHERE nom_utilisateur = $2',
      [hashedPassword, nom_utilisateur]
    );

    // Si le nom d'utilisateur n'existe pas ou est incorrect
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }

    // Nettoyage de sécurité : on supprime les codes de validation consommés pour cet e-mail
    await pool.query(
      'DELETE FROM codes_validation WHERE email = $1', 
      [emailUnique]
    );

    // Tout s'est bien passé !
    return res.status(200).json({ 
      success: true, 
      message: "Votre mot de passe a été modifié avec succès !" 
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe :", error);
    // On s'assure d'envoyer un JSON même en cas de crash de la bdd
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
});
app.post('/api/reapprovisionner', verifierConnexion, async (req, res) => {
    const { 
        produit_id, 
        quantite_ajoutee, 
        prix_achat_nouveau, 
        prix_vente_nouveau, 
        fournisseur_id, 
        montant_paye, 
        source_paiement 
    } = req.body;
    
    const adminId = req.user.role === 'admin' ? req.user.id : req.user.adminId;
    const nomUtilisateur = req.user.nom; // Récupération du nom de l'utilisateur connecté

    if (!adminId) {
        return res.status(401).json({ error: "Utilisateur non identifié." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Vérification du produit
        const produitRes = await client.query(
            'SELECT nom, stock_actuel FROM produits WHERE id = $1 AND admin_id = $2', 
            [produit_id, adminId]
        );
        
        if (produitRes.rows.length === 0) {
            throw new Error("Produit non trouvé.");
        }

        const nomProduit = produitRes.rows[0].nom;
        const nouveauStockTotal = Number(produitRes.rows[0].stock_actuel) + Number(quantite_ajoutee);
        const montantTotalAchat = Number(quantite_ajoutee) * Number(prix_achat_nouveau);
        const resteAPayer = montantTotalAchat - Number(montant_paye || 0);

      // 2. Gestion de la source de paiement
        const source = String(source_paiement || 'caisse').toLowerCase().trim();

        if (source === 'caisse' && Number(montant_paye) > 0) {
            // Vérification du solde issu des ventes
            const checkCaisse = await client.query(
                `SELECT COALESCE(SUM(prix_total), 0) as total_caisse FROM ventes WHERE admin_id = $1`,
                [adminId]
            );
            const soldeVentes = parseFloat(checkCaisse.rows[0].total_caisse);

            // 🌟 RECHERCHE PAR ID : On récupère le fond lié à l'ID de la boutique/admin
            const checkFond = await client.query(
                `SELECT COALESCE(montant, 0) as montant_fond FROM fond_roulement WHERE admin_id = $1`,
                [adminId]
            );
            const montantFond = checkFond.rows.length > 0 ? parseFloat(checkFond.rows[0].montant_fond) : 0;

            // L'argent disponible total réel
            const soldeCaisseTotal = soldeVentes + montantFond;

            console.log(`[Vérification Caisse] Ventes: ${soldeVentes} F | Fond trouvé: ${montantFond} F | Total: ${soldeCaisseTotal} F | Demandé: ${montant_paye} F`);

            if (Number(montant_paye) > soldeCaisseTotal) {
                throw new Error(`Fonds insuffisants (Caisse: ${soldeCaisseTotal} F).`);
            }

            // Récupération du numéro de ticket
            const lastTicketRes = await client.query(
                `SELECT numero_ticket FROM ventes WHERE admin_id = $1 ORDER BY id DESC LIMIT 1`,
                [adminId]
            );
            
            let dernierNumero = lastTicketRes.rows[0]?.numero_ticket || "000";
            let nouveauNumero = (parseInt(dernierNumero) + 1).toString().padStart(3, '0');

            await client.query(
                `INSERT INTO ventes (designation, prix_total, date_vente, admin_id, etat, numero_ticket, mode_paiement, type_operation, quantite) 
                 VALUES ($1, $2, NOW(), $3, 'validee', $4, 'Espèce', 'reappro', $5)`,
                [
                    `ACHAT STOCK : ${nomProduit}`,
                    -Number(montant_paye),
                    adminId,
                    nouveauNumero,
                    Number(quantite_ajoutee)
                ]
            );
        }

        // 3. Mise à jour produit
        await client.query(
            'UPDATE produits SET stock_actuel = $1, prix_achat = $2, prix_vente = $3, fournisseur_id = $4 WHERE id = $5 AND admin_id = $6',
            [nouveauStockTotal, prix_achat_nouveau, prix_vente_nouveau, fournisseur_id || null, produit_id, adminId]
        );

        // 4. Historique et Fournisseur
        if (fournisseur_id) {
            await client.query(
                `INSERT INTO achats (produit_id, fournisseur_id, quantite, prix_achat_unitaire, montant_total, admin_id, date_achat, montant_paye, montant_credit, source_paiement) 
                 VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9)`,
                [produit_id, fournisseur_id, quantite_ajoutee, prix_achat_nouveau, montantTotalAchat, adminId, Number(montant_paye || 0), resteAPayer, source]
            );

            await client.query(
                `UPDATE fournisseurs 
                 SET montant_total = montant_total + $1, 
                     dette_totale = dette_totale + $2 
                 WHERE id = $3 AND admin_id = $4`,
                [montantTotalAchat, resteAPayer, fournisseur_id, adminId]
            );
        }

        await client.query('COMMIT');
        res.json({ message: "Réapprovisionnement réussi !", nouveauStock: nouveauStockTotal });
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Erreur serveur détaillée :", err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});
// ROUTE DE REMISE À ZÉRO DYNAMIQUE ET SÉCURISÉE PAR COMPTE ADMIN
app.post('/api/reset-total', async (req, res) => {
  // On récupère un client du pool pour exécuter une transaction sécurisée
  const client = await pool.connect();
  try {
    const idAdmin = parseInt(req.body.idAdmin); 
    if (!idAdmin || isNaN(idAdmin)) {
      return res.status(400).json({ error: "Identification de l'administrateur manquante ou invalide." });
    }

    console.log(`⚠️ RESET TOTAL automatique demandé pour l'Admin ID: ${idAdmin}`);

    // COMMENCER LA TRANSACTION SÉCURISÉE
    await client.query('BEGIN');

    // 1. Vidage ciblé et sécurisé de toutes les données métiers et configurations de cet admin
    const tablesA_Vider = [
      'credits', 
      'achats', 
      'ventes', 
      'stock_history',
      'produits', 
      'fournisseurs', 
      'clients', 
      'depenses', 
      'entete_ticket', 
      'facture_config', 
      'fond_roulement', 
      'codes_validation'
    ];
    
    console.log("🗑️ Nettoyage ciblé des tables métiers pour cet administrateur uniquement...");
    for (const nomTable of tablesA_Vider) {
      // 🔍 Vérification dynamique de la colonne de liaison existante ('admin_id' ou 'id_admin')
      const colCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name IN ('admin_id', 'id_admin')
      `, [nomTable]);

      if (colCheck.rows.length > 0) {
        // Suppression restrictive liée uniquement à cet administrateur
        const nomColonne = colCheck.rows[0].column_name;
        await client.query(`DELETE FROM public.${nomTable} WHERE "${nomColonne}" = $1`, [idAdmin]);
      } else {
        // Table globale ou sans colonne admin (par sécurité, si applicable)
        await client.query(`DELETE FROM public.${nomTable}`);
      }
    }

    // 2. SÉCURITÉ ABSOLUE POUR LES UTILISATEURS : On supprime uniquement les vendeurs rattachés à cet admin
    console.log("🛡️ Suppression des comptes utilisateurs secondaires (vendeurs) rattachés à cet admin...");
    await client.query(`DELETE FROM public.utilisateurs WHERE role = 'vendeur' AND admin_id = $1`, [idAdmin]);

    // VALIDER ET APPLIQUER TOUTES LES SUPPRESSIONS D'UN COUP
    await client.query('COMMIT');
    client.release();

    return res.status(200).json({ 
      success: true, 
      message: `Toutes vos données (y compris vendeurs et tickets) ont été remises à zéro avec succès.` 
    });

  } catch (error) {
    // En cas de bug, on annule tout pour ne pas corrompre la base de données
    try {
      await client.query('ROLLBACK');
    } catch (e) {}
    client.release();
    
    console.error("Erreur lors du reset dynamique :", error);
    res.status(500).json({ error: "Une erreur système est survenue lors de la réinitialisation." });
  }
});
// ROUTE : SAUVEGARDE MANUELLE EN FORMAT JSON AUTOMATIQUE (SANS UTILS POSTGRES EXTERNES)
app.post('/api/backup-manuel', async (req, res) => {
  try {
    // 💡 RÉCUPÉRATION DU NOM ET DE L'ID DE L'ADMIN DEPUIS LE FRONTEND
    const nomAdmin = req.body.nomAdmin || 'Administrateur inconnu';
    const idAdmin = req.body.idAdmin; // 🔥 TRÈS IMPORTANT : Tu dois envoyer l'ID de l'admin depuis le frontend

    if (!idAdmin) {
      return res.status(400).json({ success: false, error: "L'identifiant de l'admin (idAdmin) est requis pour filtrer la sauvegarde." });
    }

    // 1. CONFIGURATION DU TRANSPORTER MAIL
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false, 
      auth: {
        user: 'mt91511556@gmail.com',
        pass: 'kwqerdnpnyodecfz'
      }
    });

    // 2. CONFIGURATION DE L'EMPLACEMENT
    const dossierBackup = path.join(__dirname, 'sauvegardes');
    if (!fs.existsSync(dossierBackup)) {
      fs.mkdirSync(dossierBackup);
    }

    const date = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
    const nomFichier = `backup_manuel_${nomAdmin}_${date}.json`; 
    const cheminFichier = path.join(dossierBackup, nomFichier);

    console.log(`⚡ Extraction ciblée des données pour l'admin ID [${idAdmin}]...`);

    // ==========================================
    // STEP A : RÉCUPÉRER LES VENDEURS DE CET ADMIN
    // ==========================================
    // On cherche les comptes qui appartiennent à cet admin (ex: colonne 'admin_id' ou 'parent_id')
    // Ajuste le nom de la colonne ('admin_id') selon ta structure de table 'utilisateurs'
    const resultVendeurs = await pool.query(
      `SELECT id FROM public.utilisateurs WHERE id = $1 OR admin_id = $1`, 
      [idAdmin]
    );
    const listeIdsComptes = resultVendeurs.rows.map(row => row.id); // Exemple: [4, 12, 15] (Admin + ses vendeurs)

    if (listeIdsComptes.length === 0) listeIdsComptes.push(idAdmin);

    const backupData = {
      metadata: {
        version_logiciel: "1.0.0",
        date_sauvegarde: new Date().toISOString(),
        auteur: nomAdmin,
        admin_id: idAdmin,
        base_origine: "gestion_alimentation"
      },
      data: {}
    };

// ==========================================
// STEP B : EXTRACTION INTELLIGENTE ET SÉCURISÉE
// ==========================================
const tablesAExporter = [
  'abonnements', 'achats', 'clients', 'codes_validation', 'credits', 
  'depenses', 'entete_ticket', 'facture_config', 'fond_roulement', 
  'fournisseurs', 'produits', 'stock_history', 'utilisateurs', 'ventes'
];

for (const nomTable of tablesAExporter) {
  try {
    let result;

    // 1. Découvrir dynamiquement les colonnes réelles de la table pour éviter les erreurs SQL
    const infoColonnes = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1`, 
      [nomTable]
    );
    const colonnes = infoColonnes.rows.map(c => c.column_name.toLowerCase());

    // 2. Stratégie de filtrage selon les colonnes existantes dans la table
    if (colonnes.includes('id_admin')) {
      // Si la table contient explicitement 'id_admin'
      result = await pool.query(`SELECT * FROM public.${nomTable} WHERE id_admin = $1`, [idAdmin]);
    } 
    else if (colonnes.includes('admin_id')) {
      // Si la table utilise l'autre variante 'admin_id'
      result = await pool.query(`SELECT * FROM public.${nomTable} WHERE admin_id = $1`, [idAdmin]);
    } 
    else if (nomTable === 'utilisateurs') {
      // Pour les utilisateurs, on prend l'admin lui-même et ses vendeurs associés
      result = await pool.query(`SELECT * FROM public.utilisateurs WHERE id = $1 OR id_admin = $1 OR admin_id = $1`, [idAdmin]);
    }
    else if (colonnes.includes('user_id')) {
      // Si la table est liée aux actions des utilisateurs/vendeurs (ex: ventes, crédits si pas d'id_admin direct)
      result = await pool.query(`SELECT * FROM public.${nomTable} WHERE user_id = ANY($1)`, [listeIdsComptes]);
    } 
    else {
      // Sécurité : Si aucune colonne de cloisonnement n'est trouvée, on récupère tout pour ne pas perdre la donnée
      result = await pool.query(`SELECT * FROM public.${nomTable}`);
    }

    backupData.data[nomTable] = result.rows;
    console.log(`🔹 Table [${nomTable}] exportée avec succès (${result.rows.length} lignes)`);

  } catch (tableError) {
    console.warn(`⚠️ Erreur imprévue sur la table [${nomTable}], ignorée.`, tableError.message);
    backupData.data[nomTable] = [];
  }
}

    // 5. ÉCRITURE DU FICHIER TEXTE JSON SUR LE DISQUE
    fs.writeFileSync(cheminFichier, JSON.stringify(backupData, null, 2), 'utf-8');
    console.log(`💾 Sauvegarde cloisonnée réussie pour ${nomAdmin}`);

    // ACTION 2 : Envoi du fichier JSON par mail
    try {
      const mailOptions = {
        from: 'mt91511556@gmail.com',
        to: 'mt91511556@gmail.com',
        subject: `🚨 SAUVEGARDE FILTRÉE JSON - ${nomAdmin}`,
        text: `Bonjour,\n\nLa sauvegarde de sécurisation des données pour l'établissement de ${nomAdmin} a été effectuée.\n\nContenu : Uniquement les données de cet Admin et de ses serveurs/vendeurs associés.\n📅 Date : ${new Date().toLocaleString()}`,
        attachments: [{ filename: nomFichier, path: cheminFichier }]
      };

      await transporter.sendMail(mailOptions);
      return res.status(200).json({ success: true, message: "Sauvegarde cloisonnée réussie !" });

    } catch (mailError) {
      return res.status(500).json({ error: "Fichier créé mais envoi email échoué." });
    }

  } catch (globalError) {
    console.error(globalError);
    res.status(500).json({ error: "Erreur interne lors du traitement du backup." });
  }
});

app.post('/api/restore-manuel', async (req, res) => {
  const clientDb = await pool.connect(); 
  
  try {
    const { metadata, data } = req.body;

    if (!metadata || !data || metadata.base_origine !== "gestion_alimentation") {
      return res.status(400).json({ error: "Le fichier fourni n'est pas un fichier de sauvegarde valide." });
    }

    // 🌟 DÉTECTION STRICTE ET RESTRUCTURÉE : On prend l'exact ID fourni par le navigateur
    const adminIdActuel = parseInt(req.headers['admin-id']);

    if (!adminIdActuel || isNaN(adminIdActuel)) {
      return res.status(400).json({ error: "Impossible de restaurer : l'ID de l'administrateur actuel n'est pas détecté par le serveur." });
    }

    console.log(`⚡ Début de la restauration totale automatique sur l'Admin ID : ${adminIdActuel}`);

    // DÉBUT DE LA TRANSACTION
    await clientDb.query('BEGIN');

    // 2. Vidage ciblé et sécurisé par Admin
    console.log("🗑️ Nettoyage ciblé des anciennes tables pour cet administrateur uniquement...");
    
    const tablesA_Nettoyer = [
      'abonnements', 'credits', 'achats', 'ventes', 'stock_history',
      'produits', 'fournisseurs', 'clients', 'depenses', 'entete_ticket',
      'facture_config', 'fond_roulement', 'codes_validation'
    ];

    for (const table of tablesA_Nettoyer) {
      // 🔍 On vérifie dynamiquement les colonnes existantes pour cette table
      const colCheck = await clientDb.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name IN ('admin_id', 'id_admin')
      `, [table]);

      if (colCheck.rows.length > 0) {
        // Si la table contient une colonne de liaison, on filtre par l'ID de l'admin
        const nomColonne = colCheck.rows[0].column_name;
        await clientDb.query(`DELETE FROM public.${table} WHERE "${nomColonne}" = $1`, [adminIdActuel]);
      } else {
        // Si c'est une table de configuration générale sans ID d'admin, on applique un DELETE global
        await clientDb.query(`DELETE FROM public.${table}`);
      }
    }

    // Dictionnaires de correspondance pour les ID
    const mapFournisseurs = {};
    const mapClients = {};
    const mapProduits = {};

    // ==========================================
    // STEP 0 : LES ABONNEMENTS (Ajouté chirurgicalement)
    // ==========================================
    if (data['abonnements'] && data['abonnements'].length > 0) {
      console.log(`📥 Restauration du statut de l'abonnement...`);
      for (const ab of data['abonnements']) {
        // Sécurité : On lie l'abonnement sauvegardé au nouvel ID Admin de la machine actuelle
        ab.id_admin = adminIdActuel;

        const colonnes = Object.keys(ab).map(col => `"${col}"`).join(', ');
        const placeholders = Object.keys(ab).map((_, i) => `$${i + 1}`).join(', ');

        await clientDb.query(
          `INSERT INTO public.abonnements (${colonnes}) VALUES (${placeholders})
           ON CONFLICT (id_admin) 
           DO UPDATE SET actif = EXCLUDED.actif, date_expiration = EXCLUDED.date_expiration, forfait = EXCLUDED.forfait`,
          Object.values(ab)
        );
      }
      console.log(`✅ Statut d'abonnement restauré avec succès.`);
    }

    // ==========================================
    // STEP 1 : LES FOURNISSEURS
    // ==========================================
    if (data['fournisseurs'] && data['fournisseurs'].length > 0) {
      console.log(`📥 Restauration des fournisseurs (${data['fournisseurs'].length})...`);
      for (const f of data['fournisseurs']) {
        const ancienId = f.id;
        delete f.id; 
        if (f.hasOwnProperty('admin_id')) f.admin_id = adminIdActuel;

        const colonnes = Object.keys(f).map(c => `"${c}"`).join(', ');
        const placeholders = Object.keys(f).map((_, i) => `$${i + 1}`).join(', ');
        
        const resIns = await clientDb.query(`INSERT INTO public.fournisseurs (${colonnes}) VALUES (${placeholders}) RETURNING id`, Object.values(f));
        mapFournisseurs[ancienId] = resIns.rows[0].id;
      }
    }

   // ==========================================
    // STEP 3 : CLIENTS (CORRIGÉ ET SÉCURISÉ)
    // ==========================================
    if (data['clients'] && data['clients'].length > 0) {
      console.log(`📥 Restauration des clients (${data['clients'].length})...`);
      
      for (const cl of data['clients']) {
        const ancienId = cl.id;
        delete cl.id; // On laisse Postgres réattribuer un ID propre
        
        // On s'assure d'associer le client à l'admin actuellement connecté
        if (cl.hasOwnProperty('admin_id')) cl.admin_id = adminIdActuel;
        if (cl.hasOwnProperty('id_utilisateur')) cl.id_utilisateur = adminIdActuel;

        const colonnes = Object.keys(cl).map(col => `"${col}"`).join(', ');
        const placeholders = Object.keys(cl).map((_, i) => `$${i + 1}`).join(', ');
        
        const result = await clientDb.query(
          `INSERT INTO public.clients (${colonnes}) VALUES (${placeholders}) RETURNING id`, 
          Object.values(cl)
        );
        
        // On remplit la table de correspondance pour l'étape des crédits
        mapClients[ancienId] = result.rows[0].id;
      }
      console.log(`✅ Table clients restaurée avec succès.`);
    }

    // ==========================================
    // STEP 3 : LES PRODUITS
    // ==========================================
    if (data['produits'] && data['produits'].length > 0) {
      console.log(`📥 Restauration des produits (${data['produits'].length})...`);
      for (const p of data['produits']) {
        const ancienId = p.id;
        delete p.id;
        if (p.hasOwnProperty('admin_id')) p.admin_id = adminIdActuel;

        const colonnes = Object.keys(p).map(col => `"${col}"`).join(', ');
        const placeholders = Object.keys(p).map((_, i) => `$${i + 1}`).join(', ');

        const resIns = await clientDb.query(`INSERT INTO public.produits (${colonnes}) VALUES (${placeholders}) RETURNING id`, Object.values(p));
        mapProduits[ancienId] = resIns.rows[0].id;
      }
    }

    // ==========================================
    // STEP 4 : LES VENTES
    // ==========================================
    if (data['ventes'] && data['ventes'].length > 0) {
      console.log(`📥 Restauration des ventes (${data['ventes'].length})...`);
      for (const v of data['ventes']) {
        delete v.id;
        if (v.hasOwnProperty('admin_id')) v.admin_id = adminIdActuel;
        if (v.hasOwnProperty('id_utilisateur') && v.id_utilisateur !== null) v.id_utilisateur = adminIdActuel;
        
        if (v.produit_id && mapProduits[v.produit_id]) {
          v.produit_id = mapProduits[v.produit_id];
        }

        const colonnes = Object.keys(v).map(col => `"${col}"`).join(', ');
        const placeholders = Object.keys(v).map((_, i) => `$${i + 1}`).join(', ');
        await clientDb.query(`INSERT INTO public.ventes (${colonnes}) VALUES (${placeholders})`, Object.values(v));
      }
    }

    // ==========================================
    // STEP 5 : LES ACHATS
    // ==========================================
    if (data['achats'] && data['achats'].length > 0) {
      console.log(`📥 Restauration des achats (${data['achats'].length})...`);
      for (const a of data['achats']) {
        delete a.id;
        if (a.hasOwnProperty('admin_id')) a.admin_id = adminIdActuel;
        
        if (a.produit_id && mapProduits[a.produit_id]) a.produit_id = mapProduits[a.produit_id];
        if (a.fournisseur_id && mapFournisseurs[a.fournisseur_id]) a.fournisseur_id = mapFournisseurs[a.fournisseur_id];

        const colonnes = Object.keys(a).map(col => `"${col}"`).join(', ');
        const placeholders = Object.keys(a).map((_, i) => `$${i + 1}`).join(', ');
        await clientDb.query(`INSERT INTO public.achats (${colonnes}) VALUES (${placeholders})`, Object.values(a));
      }
    }

   // ==========================================
    // STEP 6 : LES CRÉDITS (VERSION CORRIGÉE)
    // ==========================================
    if (data['credits'] && data['credits'].length > 0) {
      console.log(`📥 Restauration des crédits (${data['credits'].length})...`);
      for (const cr of data['credits']) {
        delete cr.id;
        if (cr.hasOwnProperty('admin_id')) cr.admin_id = adminIdActuel;
        
        if (cr.produit_id && mapProduits[cr.produit_id]) {
          cr.produit_id = mapProduits[cr.produit_id];
        }

        if (cr.client_id) {
          if (mapClients[cr.client_id]) {
            cr.client_id = mapClients[cr.client_id];
          } else {
            cr.client_id = cr.client_id;
          }
        } else {
          cr.client_id = null; 
        }

        const colonnes = Object.keys(cr).map(col => `"${col}"`).join(', ');
        const placeholders = Object.keys(cr).map((_, i) => `$${i + 1}`).join(', ');
        await clientDb.query(`INSERT INTO public.credits (${colonnes}) VALUES (${placeholders})`, Object.values(cr));
      }
    }

    // ==========================================
    // STEP 7 : LES DÉPENSES (Nouveau)
    // ==========================================
    if (data['depenses'] && data['depenses'].length > 0) {
      console.log(`📥 Restauration des dépenses (${data['depenses'].length})...`);
      for (const d of data['depenses']) {
        delete d.id;
        if (d.hasOwnProperty('admin_id')) d.admin_id = adminIdActuel;

        const colonnes = Object.keys(d).map(col => `"${col}"`).join(', ');
        const placeholders = Object.keys(d).map((_, i) => `$${i + 1}`).join(', ');
        await clientDb.query(`INSERT INTO public.depenses (${colonnes}) VALUES (${placeholders})`, Object.values(d));
      }
    }

    // ==========================================
    // STEP 8 : L'ENTÊTE DE TICKET (Nouveau)
    // ==========================================
    if (data['entete_ticket'] && data['entete_ticket'].length > 0) {
      console.log(`📥 Restauration des entêtes de ticket (${data['entete_ticket'].length})...`);
      for (const et of data['entete_ticket']) {
        delete et.id;
        if (et.hasOwnProperty('admin_id')) et.admin_id = adminIdActuel;

        const colonnes = Object.keys(et).map(col => `"${col}"`).join(', ');
        const placeholders = Object.keys(et).map((_, i) => `$${i + 1}`).join(', ');
        await clientDb.query(`INSERT INTO public.entete_ticket (${colonnes}) VALUES (${placeholders})`, Object.values(et));
      }
    }

    // ==========================================
    // STEP 9 : LA CONFIGURATION FACTURE (Nouveau)
    // ==========================================
    if (data['facture_config'] && data['facture_config'].length > 0) {
      console.log(`📥 Restauration de la configuration des factures (${data['facture_config'].length})...`);
      for (const fc of data['facture_config']) {
        delete fc.id;
        if (fc.hasOwnProperty('admin_id')) fc.admin_id = adminIdActuel;

        const colonnes = Object.keys(fc).map(col => `"${col}"`).join(', ');
        const placeholders = Object.keys(fc).map((_, i) => `$${i + 1}`).join(', ');
        await clientDb.query(`INSERT INTO public.facture_config (${colonnes}) VALUES (${placeholders})`, Object.values(fc));
      }
    }

    // ==========================================
    // STEP 10 : LE FOND DE ROULEMENT (CORRIGÉ)
    // ==========================================
    if (data['fond_roulement'] && data['fond_roulement'].length > 0) {
      console.log(`📥 Restauration du fond de roulement (${data['fond_roulement'].length})...`);
      for (const fr of data['fond_roulement']) {
        delete fr.id;

        if (fr.hasOwnProperty('admin_id')) fr.admin_id = adminIdActuel;
        if (fr.hasOwnProperty('id_admin')) fr.id_admin = adminIdActuel;

        const colonnes = Object.keys(fr).map(col => `"${col}"`).join(', ');
        const placeholders = Object.keys(fr).map((_, i) => `$${i + 1}`).join(', ');
        
        await clientDb.query(`INSERT INTO public.fond_roulement (${colonnes}) VALUES (${placeholders})`, Object.values(fr));
      }
      console.log(`✅ Table fond_roulement restaurée et liée à l'Admin ID ${adminIdActuel}`);
    }

    // ==========================================
    // STEP 11 : L'HISTORIQUE DES STOCKS (Nouveau)
    // ==========================================
    if (data['stock_history'] && data['stock_history'].length > 0) {
      console.log(`📥 Restauration de l'historique des stocks (${data['stock_history'].length})...`);
      for (const sh of data['stock_history']) {
        delete sh.id;
        if (sh.hasOwnProperty('admin_id')) sh.admin_id = adminIdActuel;
        if (sh.produit_id && mapProduits[sh.produit_id]) sh.produit_id = mapProduits[sh.produit_id];

        const colonnes = Object.keys(sh).map(col => `"${col}"`).join(', ');
        const placeholders = Object.keys(sh).map((_, i) => `$${i + 1}`).join(', ');
        await clientDb.query(`INSERT INTO public.stock_history (${colonnes}) VALUES (${placeholders})`, Object.values(sh));
      }
    }

    // ==========================================
    // STEP 12 : CODES DE VALIDATION (Nouveau)
    // ==========================================
    if (data['codes_validation'] && data['codes_validation'].length > 0) {
      console.log(`📥 Restauration des codes de validation (${data['codes_validation'].length})...`);
      for (const cv of data['codes_validation']) {
        delete cv.id;
        if (cv.hasOwnProperty('admin_id')) cv.admin_id = adminIdActuel;

        const colonnes = Object.keys(cv).map(col => `"${col}"`).join(', ');
        const placeholders = Object.keys(cv).map((_, i) => `$${i + 1}`).join(', ');
        await clientDb.query(`INSERT INTO public.codes_validation (${colonnes}) VALUES (${placeholders})`, Object.values(cv));
      }
    }

    // ==========================================
    // STEP 13 : UTILISATEURS (CORRIGÉ SANS FAUSSE COLONNE)
    // ==========================================
    if (data['utilisateurs'] && data['utilisateurs'].length > 0) {
      console.log(`📥 Traitement des comptes utilisateurs secondaires...`);
      for (const u of data['utilisateurs']) {
        
        if (u.role === 'vendeur') {
          const identifiant = u.nom_utilisateur || u.nom;
          u.admin_id = adminIdActuel;
          
          if (u.hasOwnProperty('id_admin')) {
            delete u.id_admin;
          }

          const checkUser = await clientDb.query(
            `SELECT id FROM public.utilisateurs WHERE nom_utilisateur = $1 OR nom = $2`, 
            [u.nom_utilisateur || null, u.nom]
          );

          if (checkUser.rows.length === 0) {
            delete u.id; 
            const colonnes = Object.keys(u).map(col => `"${col}"`).join(', ');
            const placeholders = Object.keys(u).map((_, i) => `$${i + 1}`).join(', ');
            
            await clientDb.query(`INSERT INTO public.utilisateurs (${colonnes}) VALUES (${placeholders})`, Object.values(u));
            console.log(`✅ Vendeur [${identifiant}] créé et lié à l'Admin ID ${adminIdActuel}`);
          } else {
            const existantId = checkUser.rows[0].id;
            
            await clientDb.query(
              `UPDATE public.utilisateurs 
               SET admin_id = $1, role = 'vendeur' 
               WHERE id = $2`,
              [adminIdActuel, existantId]
            );
            console.log(`🔄 Vendeur [${identifiant}] existant détecté : rattachement mis à jour vers l'Admin ID ${adminIdActuel}`);
          }
        }
      }
    }

    // Validation finale
    await clientDb.query('COMMIT');
    console.log(`🎉 BASE DE DONNÉES RESTAURÉE SANS AUCUN CONFLIT D'ID ! (ID Utilisé : ${adminIdActuel})`);
    
    res.status(200).json({ success: true, message: "La base de données a été restaurée avec succès." });

  } catch (restoreError) {
    await clientDb.query('ROLLBACK');
    console.error("❌ ÉCHEC DE LA RESTAURATION FLEXIBLE :", restoreError.message);
    res.status(500).json({ error: "Échec de la restauration flexible.", details: restoreError.message });
  } finally {
    clientDb.release(); 
  }
});
// 1. Route pour AJOUTER un fournisseur
app.post('/api/fournisseurs', verifierConnexion, async (req, res) => {
    // 1. Log pour voir si le serveur reçoit bien ce que la console React a envoyé
    console.log("RECU SUR LE SERVEUR :", req.body);

    try {
        const { nom, telephone, adresse, categorie } = req.body;
        
        // 2. Extraction sécurisée de l'admin_id
        // On vérifie req.user (rempli par verifierConnexion)
        const adminId = req.user.id || req.user.adminId;
        
        console.log("ID ADMIN DECODE :", adminId);

        if (!adminId) {
            return res.status(401).json({ error: "Utilisateur non identifié" });
        }

        // 3. L'insertion SQL
        const nouveauFournisseur = await pool.query(
            `INSERT INTO fournisseurs (nom, telephone, adresse, categorie, admin_id) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [nom, telephone, adresse, categorie, adminId]
        );

        console.log("SUCCÈS SQL :", nouveauFournisseur.rows[0]);
        res.json(nouveauFournisseur.rows[0]);

    } catch (err) {
        console.error("ERREUR SERVEUR :", err.message);
        res.status(500).json({ error: err.message });
    }
});
// ==========================================
// 📑 CONFIGURATION DU TICKET DE CAISSE
// ==========================================

// 1. Route pour RÉCUPÉRER les informations actuelles et le logo
// =================================================================
// 1. ROUTE GET : Récupérer la configuration du ticket
// =================================================================
app.get('/api/ticket-config', verifierConnexion, async (req, res) => {
  try {
    // Priorité à l'admin-id envoyé par React (très important pour le vendeur), 
    // sinon on prend l'ID de la session utilisateur connectée
    const adminId = req.headers['admin-id'] || req.user?.id;

    if (!adminId) {
      return res.status(400).json({ error: "Identifiant de l'administrateur manquant." });
    }

    // 🌟 On cherche la configuration liée à cet ID unique
    const result = await pool.query("SELECT * FROM entete_ticket WHERE id = $1", [adminId]);
    
    if (result.rows.length === 0) {
      // Modèle par défaut propre si rien n'est encore enregistré
      return res.json({ nom_boutique: 'Ma Boutique', adresse: '', telephone: '', message_pied: '', logo_url: null });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur récupération ticket:", err.message);
    res.status(500).json({ error: "Erreur serveur lors du chargement de la configuration" });
  }
});

// =================================================================
// 2. ROUTE PUT : Modifier la configuration (Dynamique et Propre)
// =================================================================
app.put('/api/ticket-config', verifierConnexion, upload.single('logo'), async (req, res) => {
  const adminId = req.headers['admin-id'] || req.user?.id;

  if (!adminId) {
    return res.status(400).json({ error: "Identifiant de l'administrateur manquant." });
  }

  const nom_boutique = req.body.nom_boutique || 'Ma Boutique';
  const adresse = req.body.adresse || '';
  const telephone = req.body.telephone || '';
  const message_pied = req.body.message_pied || '';
  const supprimer_logo = req.body.supprimer_logo === 'true' || req.body.supprimer_logo === true;

  try {
    let result;

    // Fonction utilitaire interne pour supprimer physiquement l'ancien fichier s'il existe
    const supprimerAncienLogoDuDisque = async () => {
      const ancienneConfig = await pool.query("SELECT logo_url FROM entete_ticket WHERE id = $1", [adminId]);
      if (ancienneConfig.rows.length > 0 && ancienneConfig.rows[0].logo_url) {
        const ancienneUrl = ancienneConfig.rows[0].logo_url;
        const nomFichier = ancienneUrl.split('/').pop();
        const cheminFichier = path.join(__dirname, 'uploads', nomFichier);
        if (fs.existsSync(cheminFichier)) {
          fs.unlinkSync(cheminFichier);
        }
      }
    };

    // 🛠️ CAS 1 : Demande de suppression du logo actuel
    if (supprimer_logo) {
      await supprimerAncienLogoDuDisque();

      result = await pool.query(
        `UPDATE entete_ticket 
         SET nom_boutique = $1, adresse = $2, telephone = $3, message_pied = $4, logo_url = NULL 
         WHERE id = $5 RETURNING *`,
        [nom_boutique, adresse, telephone, message_pied, adminId]
      );
    }
    // 🛠️ CAS 2 : Un NOUVEAU logo a été téléversé
    else if (req.file) {
      await supprimerAncienLogoDuDisque();
      const logo_url = `http://localhost:5000/uploads/${req.file.filename}`;

      result = await pool.query(
        `UPDATE entete_ticket 
         SET nom_boutique = $1, adresse = $2, telephone = $3, message_pied = $4, logo_url = $5 
         WHERE id = $6 RETURNING *`,
        [nom_boutique, adresse, telephone, message_pied, logo_url, adminId]
      );
    } 
    // 🛠️ CAS 3 : Modification des textes uniquement (Le logo ne bouge pas)
    else {
      result = await pool.query(
        `UPDATE entete_ticket 
         SET nom_boutique = $1, adresse = $2, telephone = $3, message_pied = $4 
         WHERE id = $5 RETURNING *`,
        [nom_boutique, adresse, telephone, message_pied, adminId]
      );
    }

    // 🛠️ CAS 4 : Si aucune ligne n'existait pour cet Admin, on l'insère pour la première fois
    if (result.rows.length === 0) {
      const logo_url = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;
      result = await pool.query(
        `INSERT INTO entete_ticket (id, nom_boutique, adresse, telephone, message_pied, logo_url)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [adminId, nom_boutique, adresse, telephone, message_pied, logo_url]
      );
    }

    res.json({ message: "Ticket configuré avec succès", config: result.rows[0] });
  } catch (err) {
    console.error("Erreur modification ticket détaillée:", err);
    res.status(500).json({ error: "Erreur serveur lors de la modification du ticket" });
  }
});
// 2. Route pour RÉCUPÉRER tous les fournisseurs
app.get('/api/fournisseurs', verifierConnexion, async (req, res) => {
    try {
        const idDeLAdmin = req.user.id || req.user.adminId;
        
        // On utilise une requête ultra-simple sans fioritures
        const SQL = 'SELECT * FROM fournisseurs WHERE admin_id = $1 ORDER BY id DESC';
        const resultatDeLaRequete = await pool.query(SQL, [idDeLAdmin]);
        
        res.json(resultatDeLaRequete.rows);
    } catch (erreurServeur) {
        console.error("ERREUR :", erreurServeur.message);
        res.status(500).json({ error: erreurServeur.message });
    }
});
// Récupérer l'historique des ventes
app.get('/api/ventes', verifierConnexion, async (req, res) => {
  try {
    const adminId = parseInt(req.user.role === 'admin' ? req.user.id : (req.user.adminId || req.user.id));

    if (isNaN(adminId)) {
      return res.status(400).json({ error: "ID admin invalide dans le token" });
    }

    // CORRECTION : Utilisation de COALESCE pour éviter que les tickets null ou réappro ne bloquent la jointure
    const result = await pool.query(`
      SELECT 
        v.numero_ticket, 
        v.designation, 
        v.quantite, 
        v.prix_unitaire_vente, 
        v.prix_total, 
        v.prix_unitaire_achat, 
        v.date_vente, 
        v.montant_recu, 
        v.monnaie_rendue, 
        v.mode_paiement,
        v.benefice,
        v.etat, 
        v.vendeur_nom AS vendu_par,
        v.client_nom_manuel, -- 🌟 LE NOM DU CLIENT COMPTANT GRAVÉ EST RÉCUPÉRÉ ICI MAINTENANT !
        c.nom AS client_nom,       
        c.prenom AS client_prenom  
      FROM ventes v
      LEFT JOIN credits cr ON COALESCE(v.numero_ticket::text, '') = cr.numero_ticket -- 🌟 Protection contre les valeurs vides ou réappro intégrée ici !
      LEFT JOIN clients c ON cr.client_id = c.id
      WHERE v.admin_id = $1 
      ORDER BY v.date_vente DESC
    `, [adminId]); 

    res.json(result.rows || []);
  } catch (err) {
    console.error("Erreur historique détaillée:", err.message);
    res.status(500).json({ error: "Erreur lecture historique" });
  }
});

// Enregistrer une dépense
// --- FICHIER SERVEUR (Node.js) ---
// Enregistrer une dépense
app.post('/api/depenses', verifierConnexion, async (req, res) => { 
  try {
    const { motif, montant, categorie, date_depense } = req.body;
    
    if (!motif || !montant) {
      return res.status(400).json({ error: "Données manquantes" });
    }

    const dateFinale = date_depense || new Date().toISOString().split('T')[0];

    const nouveauResultat = await pool.query(
      // CORRECTION : Ajout de la colonne admin_id et du paramètre $5
      'INSERT INTO depenses (motif, montant, categorie, date_depense, admin_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [motif, montant, categorie || 'Divers', dateFinale, req.user.id] // CORRECTION : Passage de req.user.id
    );
    
    res.json(nouveauResultat.rows[0]);
  } catch (err) {
    console.error("ERREUR SERVEUR DEPENSES:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});
app.get('/api/depenses', verifierConnexion, async (req, res) => {
  try {
    // req.user.id provient du middleware verifierConnexion (votre Token JWT)
    const result = await pool.query(
      'SELECT id, motif, montant, categorie, date_depense FROM depenses WHERE admin_id = $1 ORDER BY date_depense DESC',
      [req.user.id]
    );

    // On renvoie le tableau des dépenses au frontend
    res.json(result.rows);
  } catch (err) {
    console.error("ERREUR LORS DU CHARGEMENT DES DEPENSES:", err.message);
    res.status(500).json({ error: "Erreur lors de la récupération des dépenses" });
  }
});

// --- STATS POUR LE DASHBOARD (AJOUTÉ) ---

// --- STATS POUR LE DASHBOARD (CORRIGÉ AVEC ACTIF = TRUE) ---
app.get('/api/stats', verifierConnexion, async (req, res) => {
  // 🌟 MODIFICATION LOGIQUE MULTI-COMPTE : Support des administrateurs et des vendeurs connectés
  const adminId = req.user.role === 'admin' ? req.user.id : req.user.admin_id;
  // AJOUT : Récupération des dates de filtrage
  const { dateDebut, dateFin } = req.query;

  try {
    // 1. 🌟 ON RÉCUPÈRE LE FOND DE ROULEMENT DE L'ADMIN CONNECTÉ (CORRIGÉ : Recherche par admin_id)
    const fondResult = await pool.query(
      'SELECT montant FROM fond_roulement WHERE admin_id = $1', 
      [adminId]
    );
    // Si un fond existe, on le récupère, sinon on met 0
    const fondDeRoulement = fondResult.rows.length > 0 ? parseFloat(fondResult.rows[0].montant) : 0;

    // MODIFICATION ICI : Formule saine avec sécurité. Si le bénéfice calculé est <= 0 à cause d'un prix d'achat mal saisi, on affiche 50% du prix_total comme bénéfice estimé.
    const aujourdhui = await pool.query(`
      SELECT 
        SUM(prix_total::numeric) as ca, 
        SUM(
          CASE 
            WHEN (prix_total::numeric - (prix_unitaire_achat::numeric * quantite::numeric)) <= 0 THEN (prix_total::numeric * 0.5)
            ELSE (prix_total::numeric - (prix_unitaire_achat::numeric * quantite::numeric))
          END
        ) as benefice,
        COUNT(DISTINCT numero_ticket) as nb_tickets
      FROM ventes 
      WHERE date_vente::date = CURRENT_DATE 
        AND admin_id = $1 
        AND (etat IS NULL OR etat != 'annulée')
        AND type_operation = 'vente'`, [adminId]);

    // MODIFICATION : Idem pour le calcul Global
    let queryGlobal = `
      SELECT 
        SUM(prix_total::numeric) as ca, 
        SUM(
          CASE 
            WHEN (prix_total::numeric - (prix_unitaire_achat::numeric * quantite::numeric)) <= 0 THEN (prix_total::numeric * 0.5)
            ELSE (prix_total::numeric - (prix_unitaire_achat::numeric * quantite::numeric))
          END
        ) as benefice
      FROM ventes
      WHERE admin_id = $1 
        AND (etat IS NULL OR etat != 'annulée')`;
    
    let paramsGlobal = [adminId];

    if (dateDebut && dateFin) {
      queryGlobal += ` AND date_vente::date BETWEEN $2 AND $3`;
      paramsGlobal.push(dateDebut, dateFin);
    }

    const global = await pool.query(queryGlobal, paramsGlobal);

    const top = await pool.query(`
      SELECT 
        designation, 
        SUM(
          CASE 
            WHEN (prix_total::numeric - (prix_unitaire_achat::numeric * quantite::numeric)) <= 0 THEN (prix_total::numeric * 0.5)
            ELSE (prix_total::numeric - (prix_unitaire_achat::numeric * quantite::numeric))
          END
        ) as benefice
      FROM ventes 
      WHERE admin_id = $1 
        AND (etat IS NULL OR etat != 'annulée')
        -- On exclut strictement les opérations de stock et fournisseurs
        AND designation NOT ILIKE '%ACHAT%' 
        AND designation NOT ILIKE '%PAIEMENT%'
        AND designation NOT ILIKE '%STOCK%'
        AND designation NOT ILIKE '%FOURNISSEUR%'
      GROUP BY designation 
      ORDER BY benefice DESC 
      LIMIT 10`, [adminId]);

    const stock = await pool.query(`
      SELECT 
        SUM(stock_actuel * prix_achat) as valeur_achat,
        SUM(stock_actuel * prix_vente) as valeur_vente_potentielle
      FROM produits 
      WHERE actif = true AND admin_id = $1`, [adminId]);

    // Extraction des données de la journée
    const donnéesAujourdhui = aujourdhui.rows[0];

    // 3. 🌟 AJOUT DE LA LIGNE COMPTE POUR LE BLOC "TOTAL CUMULÉ" (uniquement dans la caisse globale)
    const donnéesGlobal = global.rows[0];
    const caGlobalHistorique = parseFloat(donnéesGlobal.ca || 0);
    donnéesGlobal.ca = caGlobalHistorique + fondDeRoulement;

    res.json({
      aujourdhui: donnéesAujourdhui, 
      global: donnéesGlobal,         
      top: top.rows,
      stock: stock.rows[0]
    });
  } catch (err) {
    console.error("Erreur stats:", err.message);
    res.status(500).json({ error: "Erreur statistiques" });
  }
});

app.get('/api/stats/mensuel', verifierConnexion, async (req, res) => {
  const adminId = req.user.id;
  try {
    await pool.query("SET lc_time = 'fr_FR.UTF-8'");

    const result = await pool.query(`
      SELECT 
        TO_CHAR(date_vente, 'Month YYYY') as mois_nom,
        EXTRACT(MONTH FROM date_vente) as mois_num,
        EXTRACT(YEAR FROM date_vente) as annee,
        SUM(prix_total) as ca,
        SUM(benefice) as benefice
      FROM ventes
      WHERE admin_id = $1 
        AND (etat IS NULL OR etat != 'annulée')
      GROUP BY annee, mois_num, mois_nom
      ORDER BY annee DESC, mois_num DESC
    `, [adminId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur stats mensuelles:", err.message);
    res.status(500).json({ error: "Erreur lors de la récupération de l'historique" });
  }
});
// --- ROUTE DU RAPPORT FINANCIER SÉPARÉ ---
app.get('/api/rapport-financier', verifierConnexion, async (req, res) => {
  const adminId = req.user.id; // L'ID de l'admin actuellement connecté
  
  try {
    // 1. Calcul du Chiffre d'Affaires (Somme des ventes) - Exclut les annulées
    const resultCA = await pool.query(
      "SELECT SUM(prix_total) as total FROM ventes WHERE admin_id = $1 AND (etat IS NULL OR etat != 'annulée')", 
      [adminId]
    );

    // 2. Calcul du Bénéfice total - Exclut les annulées
    const resultBenef = await pool.query(
      "SELECT SUM(benefice) as total FROM ventes WHERE admin_id = $1 AND (etat IS NULL OR etat != 'annulée')", 
      [adminId]
    );

    // 3. Calcul des Dépenses totales
    const resultDep = await pool.query(
      "SELECT SUM(montant) as total FROM depenses WHERE admin_id = $1", 
      [adminId]
    );

    // Conversion en nombres (pour éviter les erreurs de calcul JS)
    const chiffreAffaire = parseFloat(resultCA.rows[0].total) || 0;
    const beneficeReel = parseFloat(resultBenef.rows[0].total) || 0;
    const depenses = parseFloat(resultDep.rows[0].total) || 0;

    // Réponse au front-end
    res.json({
      chiffreAffaire: chiffreAffaire,
      beneficeReel: beneficeReel,
      depenses: depenses,
      net: beneficeReel - depenses // Bénéfice après avoir payé les charges
    });

  } catch (err) {
    console.error("Erreur rapport financier:", err.message);
    res.status(500).json({ error: "Impossible de calculer le rapport financier" });
  }
});
app.delete('/api/fournisseurs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM fournisseurs WHERE id = $1', [id]);
    res.json({ message: "Supprimé" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});
app.put('/api/fournisseurs/:id', async (req, res) => {
  const { id } = req.params;
  // On extrait "adresse" (envoyé par React)
  const { nom, telephone, adresse, categorie } = req.body; 

  try {
    const query = `
      UPDATE fournisseurs 
      SET nom = $1, telephone = $2, adresse = $3, categorie = $4 
      WHERE id = $5
    `;
    // On passe bien "adresse" en troisième position ($3)
    const values = [nom, telephone, adresse, categorie, id];

    await pool.query(query, values);
    res.json({ message: "Mise à jour réussie !" });

  } catch (err) {
    console.error("ERREUR SQL :", err.message);
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
});
app.put('/api/ventes/annuler/ticket/:num', verifierConnexion, async (req, res) => {
  const { num } = req.params;
  const adminId = req.user.id; // Récupération de l'ID de l'admin connecté
  console.log(`--- ANNULATION (ARCHIVAGE) DU TICKET N°: ${num} ---`);

  try {
    // 1. Trouver la vente (on vérifie l'admin_id et qu'elle n'est pas déjà annulée)
    const rechercheVente = await pool.query(
      "SELECT * FROM ventes WHERE numero_ticket::text LIKE $1 AND admin_id = $2 AND (etat IS NULL OR etat != 'annulée')",
      [`%${num}`, adminId]
    );

    if (rechercheVente.rows.length === 0) {
      return res.status(404).json({ error: "Ticket introuvable, déjà annulé ou accès non autorisé." });
    }

    const vente = rechercheVente.rows[rechercheVente.rows.length - 1];
    const nomProduit = vente.designation;
    const qteArendre = vente.quantite;

    // 2. MODIFICATION : On change l'état en vérifiant l'ID et l'admin_id
    await pool.query(
      "UPDATE ventes SET etat = 'annulée' WHERE id = $1 AND admin_id = $2", 
      [vente.id, adminId]
    );
    console.log(`✅ Vente ${vente.numero_ticket} marquée comme 'annulée'.`);

    // 3. REMISE EN STOCK INTELLIGENTE (Filtrée par admin_id également)
    const structureProduit = await pool.query("SELECT * FROM produits LIMIT 1");
    
    if (structureProduit.rows.length > 0) {
      const colonnes = Object.keys(structureProduit.rows[0]);
      
      const colStock = colonnes.find(c => ['qte', 'quantite_stock', 'stock_actuel', 'disponibilite', 'quantite'].includes(c));
      const colNom = colonnes.includes('designation') ? 'designation' : 'nom';

      if (colStock) {
        await pool.query(
          `UPDATE produits SET ${colStock} = ${colStock} + $1 WHERE ${colNom} = $2 AND admin_id = $3`,
          [qteArendre, nomProduit, adminId]
        );
        console.log(`✅ Stock mis à jour (+${qteArendre}).`);
      }
    }

    res.json({ message: `Le ticket n°${vente.numero_ticket} a été marqué comme annulé.` });

  } catch (err) {
    console.log("❌ ERREUR :");
    console.error(err.message);
    res.status(500).json({ error: "Erreur : " + err.message });
  }
});
// =================================================================
// 💳 GESTION DES CRÉDITS & CLIENTS (AVEC APP DIRECTEMENT)
// =================================================================

// ==========================================
//// ➡️ ROUTE 1 (CORRIGÉE : FILTRÉE PAR ADMIN COMPATIBLE ÉQUIPE)
// ==========================================================
app.get('/api/credits/liste', verifierConnexion, async (req, res) => {
    try {
        const utilisateurId = req.user.id;
        const roleUtilisateur = req.user.role;

        // Si c'est un admin, on prend son ID. Si c'est un vendeur, on va chercher l'ID de son admin.
        const queryAdmin = `
            SELECT id FROM utilisateurs 
            WHERE id = $1 AND role = 'admin'
            UNION
            SELECT admin_id FROM utilisateurs 
            WHERE id = $1 AND role = 'vendeur'
        `;
        const adminRes = await pool.query(queryAdmin, [utilisateurId]);
        
        if (adminRes.rows.length === 0) {
            return res.status(403).json({ error: "Accès refusé ou structure utilisateur incorrecte." });
        }
        const adminIdEffectif = adminRes.rows[0].id || adminRes.rows[0].admin_id;

        const query = `
            SELECT 
                c.id, 
                cl.prenom, cl.nom, cl.telephone, cl.adresse,
                c.montant_total, c.montant_paye,
                (c.montant_total - c.montant_paye) AS reste_a_payer,
                c.statut,
                c.produit_id,
                c.date_pret,
                COALESCE(p.nom, 'Achat Multiples / Autre') AS nom_produit
            FROM credits c
            LEFT JOIN clients cl ON c.client_id = cl.id
            LEFT JOIN produits p ON c.produit_id = p.id
            WHERE c.admin_id = $1  -- 🔒 Sécurité : Uniquement les crédits de cet admin/équipe
            ORDER BY c.id DESC
        `;
        
        const result = await pool.query(query, [adminIdEffectif]);
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur /api/credits/liste:', err.message);
        res.status(500).send('Erreur serveur');
    }
});

// ==========================================
// ➡️ DOUBLE SÉCURITÉ : REQUÊTE FILTRÉE PAR COMPTE
// ==========================================
app.get('/api/credits', verifierConnexion, async (req, res) => {
    try {
        const utilisateurId = req.user.id;

        const query = `
            SELECT 
                c.id, cl.prenom, cl.nom, cl.telephone, cl.adresse,
                COALESCE(p.designation, 'Achat Caisse (Articles Multiples)') AS nom_produit,
                c.montant_total, c.montant_paye,
                (c.montant_total - c.montant_paye) AS reste_a_payer,
                c.statut, 
                c.date_pret
            FROM credits c
            JOIN clients cl ON c.client_id = cl.id
            LEFT JOIN produits p ON c.produit_id = p.id
            WHERE c.admin_id = $1 OR c.admin_id = (SELECT admin_id FROM utilisateurs WHERE id = $1) -- 🔒 Sécurité
            ORDER BY c.date_pret DESC
        `;
        const result = await pool.query(query, [utilisateurId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur /api/credits:', err.message);
        res.status(500).send('Erreur serveur');
    }
});

// ==========================================
// ➡️ TRIPLE SÉCURITÉ : REQUÊTE FILTRÉE PAR COMPTE
// ==========================================
app.get('/api/credits/suivi', verifierConnexion, async (req, res) => {
    try {
        const utilisateurId = req.user.id;

        const query = `
            SELECT 
                c.id, cl.prenom, cl.nom, cl.telephone, cl.adresse,
                COALESCE(p.designation, 'Achat Caisse (Articles Multiples)') AS nom_produit,
                c.montant_total, c.montant_paye,
                (c.montant_total - c.montant_paye) AS reste_a_payer,
                c.statut, 
                c.date_pret
            FROM credits c
            JOIN clients cl ON c.client_id = cl.id
            LEFT JOIN produits p ON c.produit_id = p.id
            WHERE c.admin_id = $1 OR c.admin_id = (SELECT admin_id FROM utilisateurs WHERE id = $1) -- 🔒 Sécurité
            ORDER BY c.date_pret DESC
        `;
        const result = await pool.query(query, [utilisateurId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur /api/credits/suivi:', err.message);
        res.status(500).send('Erreur serveur');
    }
});

// ➡️ ROUTE 2 : ENREGISTRER UN NOUVEAU CLIENT DEPUIS LE FORMULAIRE POP-UP (CORRIGÉE)
app.post('/api/credits/nouveau-client', async (req, res) => {
    const { prenom, nom, telephone, adresse, notes, id_utilisateur } = req.body;
    try {
        // 1. On cherche d'abord si l'utilisateur qui clique est un vendeur qui a un admin
        const checkUser = await pool.query('SELECT role, admin_id FROM utilisateurs WHERE id = $1', [id_utilisateur]);
        
        let idProprietaireFinal = id_utilisateur;

        // 2. Si c'est un vendeur, on force le client à appartenir à l'ID de son Admin !
        if (checkUser.rows.length > 0 && checkUser.rows[0].role === 'vendeur' && checkUser.rows[0].admin_id) {
            idProprietaireFinal = checkUser.rows[0].admin_id;
        }

        const query = `
            INSERT INTO clients (prenom, nom, telephone, adresse, notes, id_utilisateur)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const values = [prenom, nom, telephone, adresse, notes, idProprietaireFinal];
        const newClient = await pool.query(query, values);
        
        res.status(201).json({
            success: true,
            msg: 'Fiche client créée avec succès !',
            client: newClient.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});
// ➡️ ROUTE 3 : RÉCUPÉRER TOUS LES CLIENTS (Pour ton répertoire - CORRIGÉE)
app.get('/api/credits/clients', async (req, res) => {
    const { id_utilisateur } = req.query;

    try {
        if (!id_utilisateur) {
            return res.status(400).json({ success: false, msg: "L'identifiant de l'utilisateur est requis." });
        }

        // 🎯 LOGIQUE MAGIQUE : On affiche les clients si l'id_utilisateur est directement l'admin,
        // OU si le client appartient à l'admin qui a créé ce vendeur (en vérifiant dans la table utilisateurs).
        // Note : Remplace "utilisateurs" par le nom de ta table de comptes si elle s'appelle autrement (ex: vendeurs, accounts...)
        const query = `
            SELECT * FROM clients 
            WHERE id_utilisateur = $1 
               OR id_utilisateur = (
                   SELECT admin_id FROM utilisateurs WHERE id = $1
               )
            ORDER BY cree_at DESC
        `;
        
        const result = await pool.query(query, [id_utilisateur]);
        res.json(result.rows); // Envoie la liste partagée de l'équipe au frontend
    } catch (err) {
        console.error('Erreur lors de la récupération des clients:', err.message);
        res.status(500).send('Erreur serveur');
    }
});
// ➡️ ROUTE POUR ENCAISSER COMPATIBLE AVEC TA LOGIQUE DE VENTE
// ===================================================================
app.post('/api/credits/encaisser', verifierConnexion, async (req, res) => {
    const { credit_id, montant, dette_precedente } = req.body;
    const client = await pool.connect();

    // On récupère le nom de l'utilisateur connecté depuis le token
    const nomVendeur = req.user.nom;

    try {
        await client.query('BEGIN');

        // 1. 🌟 REQUÊTE CORRIGÉE : On fusionne le prénom et le nom avec || ' ' ||
        // On utilise COALESCE pour éviter les bugs si un client n'a pas de prénom enregistré
        const creditRes = await client.query(`
            SELECT c.*, p.prix_vente, p.prix_achat, p.nom AS produit_nom, 
                   TRIM(CONCAT(cl.prenom, ' ', cl.nom)) AS nom_du_client
            FROM credits c
            LEFT JOIN produits p ON c.produit_id = p.id
            LEFT JOIN clients cl ON c.client_id = cl.id
            WHERE c.id = $1
        `, [credit_id]);

        if (creditRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Crédit non trouvé." });
        }

        const credit = creditRes.rows[0];
        const montantVerse = Number(montant);
        
        // Si le résultat de la fusion est vide, on met un texte de secours
        const nomDuClient = credit.nom_du_client && credit.nom_du_client.trim() !== "" 
            ? credit.nom_du_client 
            : "Client Anonyme";
            
        const nomArticle = credit.produit_nom || 'Article';

        const prixAchatTotal = Number(credit.prix_achat);
        const dejaPayeAvant = Number(credit.montant_paye); 
        const nouveauTotalPaye = dejaPayeAvant + montantVerse; 

        // Logique de calcul du bénéfice réel
        let beneficeVersement = 0;

        if (credit.prix_achat && credit.prix_vente) {
            if (dejaPayeAvant <= prixAchatTotal && nouveauTotalPaye > prixAchatTotal) {
                beneficeVersement = nouveauTotalPaye - prixAchatTotal;
            } 
            else if (dejaPayeAvant > prixAchatTotal) {
                beneficeVersement = montantVerse;
            }
            else {
                beneficeVersement = 0;
            }
        }

        // 3. Mise à jour du crédit
        const updateCreditQuery = `
            UPDATE credits 
            SET montant_paye = montant_paye + $1,
                statut = CASE WHEN (montant_total - (montant_paye + $1)) <= 0 THEN 'Payé' ELSE 'En cours' END
            WHERE id = $2
            RETURNING *
        `;
        const result = await client.query(updateCreditQuery, [montantVerse, credit_id]);

        // 4. Détermination du numéro de ticket
        const resDernierTicket = await client.query(
          "SELECT MAX(numero_ticket) as max_num FROM ventes WHERE admin_id = $1",
          [credit.admin_id]
        );
        const numeroTicket = (parseInt(resDernierTicket.rows[0].max_num) || 0) + 1;

        const prixAchatPourCaisse = montantVerse - beneficeVersement;

        // 5. AJOUT DANS LA CAISSE (Table ventes)
        await client.query(
            `INSERT INTO ventes (numero_ticket, designation, quantite, prix_unitaire_vente, prix_total, prix_unitaire_achat, date_vente, montant_recu, monnaie_rendue, mode_paiement, admin_id, benefice, vendeur_nom, dette_precedente) 
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, 0, $8, $9, $10, $11, $12)`,
            [
                numeroTicket,
                // 🌟 Le nom affichera maintenant : Prénom + Nom (Ex: Recouvrement Dette - Mohamed CISSE (A))
                `Recouvrement Dette - ${nomDuClient} (${nomArticle})`, 
                1,                                                                        
                montantVerse,                                                             
                montantVerse,                                                             
                prixAchatPourCaisse,                                 
                montantVerse,                                                             
                'Espèce',                                                                 
                credit.admin_id,
                beneficeVersement,                                                        
                nomVendeur,
                dette_precedente ? Number(dette_precedente) : null
            ]
        );

        await client.query('COMMIT');
        res.json({ success: true, credit: result.rows[0], beneficeGenere: beneficeVersement });
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('Erreur /api/credits/encaisser:', err.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});
// =================================================================
// 1. ROUTE GET : Récupérer la configuration (Avec mode_facture)
// =================================================================
app.get('/api/facture-config', async (req, res) => {
  const adminId = req.headers['admin-id']; 

  if (!adminId) {
    return res.status(400).json({ message: "Identifiant de l'administrateur manquant." });
  }

  const query = 'SELECT nom, adresse, logo, email, rib, site, mode_facture FROM facture_config WHERE admin_id = $1';
  
  try {
    const results = await pool.query(query, [adminId]);

    if (results.rows.length === 0) {
      // Modèle par défaut si non configuré
      return res.json({ nom: '', adresse: '', logo: '', email: '', rib: '', site: '', mode_facture: 'defaut' });
    }

    res.json(results.rows[0]);
  } catch (err) {
    console.error("Erreur PostgreSQL GET:", err);
    return res.status(500).json({ message: "Erreur lors de la récupération en base de données." });
  }
});

// =================================================================
// 2. ROUTE POST : Enregistrer ou Mettre à jour (Avec mode_facture)
// =================================================================
app.post('/api/facture-config', async (req, res) => {
  const adminId = req.headers['admin-id'];
  const { nom, adresse, logo, email, rib, site, mode_facture } = req.body;

  if (!adminId) {
    return res.status(400).json({ message: "Identifiant de l'administrateur manquant." });
  }

  const query = `
    INSERT INTO facture_config (admin_id, nom, adresse, logo, email, rib, site, mode_facture)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (admin_id) 
    DO UPDATE SET 
      nom = EXCLUDED.nom, 
      adresse = EXCLUDED.adresse, 
      logo = EXCLUDED.logo, 
      email = EXCLUDED.email, 
      rib = EXCLUDED.rib, 
      site = EXCLUDED.site,
      mode_facture = EXCLUDED.mode_facture
  `;

  const values = [adminId, nom, adresse, logo, email, rib, site, mode_facture || 'defaut'];

  try {
    await pool.query(query, values);
    res.json({ message: "Configuration enregistrée avec succès !" });
  } catch (err) {
    console.error("Erreur PostgreSQL POST:", err);
    return res.status(500).json({ message: "Erreur lors de l'enregistrement en base de données." });
  }
});
// 🌟 ROUTE DÉDIÉE : Enregistrer ou modifier le nom du client sur un ticket existant
app.put('/api/ventes/modifier-client', verifierConnexion, async (req, res) => {
  const { numeroTicket, clientNomManuel } = req.body;
  
  // Sécurité pour récupérer l'admin_id peu importe si c'est l'admin ou le vendeur connecté
  const adminId = parseInt(req.user.role === 'admin' ? req.user.id : (req.user.adminId || req.user.id));

  if (!numeroTicket) {
    return res.status(400).json({ error: "Numéro de ticket manquant" });
  }

  try {
    // 🌟 CORRECTION CONVERSION : On force numeroTicket en integer (::integer) pour correspondre au type de la table
    const result = await pool.query(
      `UPDATE ventes 
       SET client_nom_manuel = $1 
       WHERE numero_ticket = $2::integer AND admin_id = $3
       RETURNING *`, // Permet de voir si des lignes ont réellement été modifiées
      [clientNomManuel ? clientNomManuel.trim() : null, numeroTicket, adminId]
    );

    console.log(`[SQL] Lignes modifiées dans ventes : ${result.rowCount}`);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Aucun ticket trouvé avec ce numéro pour cet admin" });
    }

    res.status(200).json({ message: "Nom du client enregistré avec succès dans la base de données !" });
  } catch (err) {
    console.error("Erreur lors de l'enregistrement du nom client:", err.message);
    res.status(500).json({ error: "Erreur interne lors de la mise à jour" });
  }
});
// ==========================================
// 1. CHARGER LE FOND DE ROULEMENT (S'exécute à l'actualisation)
// ==========================================
app.get('/api/fond-roulement', async (req, res) => {
  // On récupère l'id envoyé depuis React (?utilisateur=3)
  const { utilisateur } = req.query; 
  
  if (!utilisateur) {
    return res.status(400).json({ error: "L'identifiant est obligatoire." });
  }

  try {
    const adminId = parseInt(utilisateur, 10);

    // On cherche d'abord par l'admin_id (nouvelle logique ultra-fiable)
    let result = await pool.query(
      'SELECT montant FROM fond_roulement WHERE admin_id = $1', 
      [adminId]
    );
    
    // Si on ne trouve rien par ID, on tente par le nom textuel au cas où
    if (result.rows.length === 0) {
      result = await pool.query(
        'SELECT montant FROM fond_roulement WHERE utilisateur_nom = $1', 
        [utilisateur]
      );
    }

    if (result.rows.length > 0) {
      res.json({ montant: parseFloat(result.rows[0].montant) });
    } else {
      res.json({ montant: 0 });
    }
  } catch (err) {
    console.error("Erreur GET /api/fond-roulement :", err.message);
    res.status(500).json({ error: "Erreur lors de la récupération du fond de roulement." });
  }
});

// ==========================================
// 2. ENREGISTRER LE FOND DE ROULEMENT
// ==========================================
app.post('/api/fond-roulement', async (req, res) => {
  console.log("=== REQUÊTE POST REÇUE ===");
  console.log("Body reçu de React :", req.body);

  const { montant, utilisateur } = req.body; 
  
  if (!utilisateur) {
    return res.status(400).json({ error: "L'identifiant est obligatoire." });
  }
  
  try {
    const adminId = parseInt(utilisateur, 10);
    const montantNumerique = parseFloat(montant || 0);

    let nomAffiche = 'Admin'; 
    try {
      const userRes = await pool.query(
        'SELECT nom FROM public.utilisateurs WHERE id = $1',
        [adminId]
      );
      if (userRes.rows.length > 0 && userRes.rows[0].nom) {
        nomAffiche = userRes.rows[0].nom;
      }
    } catch (userErr) {
      console.log("Note : Impossible de lire le nom dans la table utilisateurs.");
    }

    if (!nomAffiche) nomAffiche = 'Admin';

    // Insertion ou mise à jour du fond de roulement
    const result = await pool.query(
      `INSERT INTO fond_roulement (admin_id, utilisateur_nom, montant, derniere_mise_a_jour) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (admin_id) 
       DO UPDATE SET montant = $3, utilisateur_nom = $2, derniere_mise_a_jour = CURRENT_TIMESTAMP
       RETURNING montant`,
      [adminId, nomAffiche, montantNumerique]
    );

    console.log(`✅ Fond de roulement enregistré (${montantNumerique} F) pour l'admin ID : ${adminId}`);
    res.json({ success: true, montant: parseFloat(result.rows[0].montant) });

  } catch (err) {
    console.log("❌ CRASH POST /api/fond-roulement :");
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});
// ===================================================
// ROUTE INDÉPENDANTE : SAUVEGARDER LE THÈME PAR COMPTE
// ===================================================
app.post('/api/utilisateur/theme', verifierConnexion, async (req, res) => {
  // 🔒 Sécurité : req.user.id est l'ID unique de la personne connectée (admin OU vendeur)
  const userId = req.user.id; 
  const { theme } = req.body; // Reçoit 'clair' ou 'sombre'

  if (!theme) {
    return res.status(400).json({ error: "Le choix du thème est obligatoire." });
  }

  try {
    // On met à jour uniquement l'utilisateur qui a fait la demande
    await pool.query(
      'UPDATE utilisateurs SET theme_preference = $1 WHERE id = $2',
      [theme, userId]
    );
    
    res.json({ success: true, theme });
  } catch (err) {
    console.error("Erreur lors de la sauvegarde du thème :", err.message);
    res.status(500).json({ error: "Erreur serveur lors de l'enregistrement du thème." });
  }
});

// Route app.post avec tes identifiants configurés
app.post('/api/abonnement/demande-cle', async (req, res) => {
  // Extraction du forfait, du nom d'utilisateur et du numéro de téléphone
  const { forfait, nomUtilisateur, telephone } = req.body;

  if (!forfait) {
    return res.status(400).json({ message: 'Le forfait est obligatoire.' });
  }

  // 1. Génération de la clé de 12 caractères
  const cleActivation = genererCle12Caracteres();

  // === LIGNE AJOUTÉE POUR SAUVEGARDER LA CLÉ SUR LE SERVEUR ===
  derniereCleGeneree = cleActivation;
  // ============================================================

  // 2. Configuration de Nodemailer avec tes accès
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mt91511556@gmail.com',
      pass: 'kwqerdnpnyodecfz' // Ton code d'application Google à 16 lettres
    }
  });

  // 3. Préparation du contenu de l'e-mail (Nom d'entreprise retiré)
  const mailOptions = {
    from: '"Gestion des Forfaits" <mt91511556@gmail.com>', 
    to: 'mt91511556@gmail.com',
    subject: `🔑 Clé d'Activation (${cleActivation}) - Forfait ${forfait.toUpperCase()}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; max-width: 550px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="font-size: 40px;">🔑</span>
        </div>
        <h2 style="color: #c026d3; text-align: center; margin-top: 0; font-weight: 800;">Nouvelle Clé d'Activation</h2>
        <p style="color: #4b5563; font-size: 15px; text-align: center; line-height: 1.5;">
          Une demande d'activation de licence vient d'être effectuée depuis votre plateforme de gestion.
        </p>
        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
        
        <div style="margin-bottom: 20px; font-size: 14px; color: #1f2937; line-height: 1.6;">
          <p style="margin: 4px 0;"><strong>Demandeur :</strong> ${nomUtilisateur || 'Non renseigné'}</p>
          <p style="margin: 4px 0;"><strong>Téléphone :</strong> ${telephone || 'Non renseigné'}</p>
          <p style="margin: 4px 0;">
            <strong>Type de Forfait :</strong> 
            <span style="text-transform: capitalize; color: #c026d3; font-weight: 700; background-color: #fdf4ff; padding: 2px 8px; border-radius: 6px;">
              ${forfait.replace('_', ' ')}
            </span>
          </p>
        </div>
        
        <div style="background-color: #fafafa; border: 1px dashed #e5e7eb; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0;">
          <p style="margin: 0 0 10px 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Clé générée (12 caractères)</p>
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 26px; font-weight: bold; letter-spacing: 1.5px; color: #111827;">
            ${cleActivation}
          </span>
        </div>
        
        <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 25px; line-height: 1.4;">
          Système automatique de délivrance de licences.
        </p>
      </div>
    `
  };

  try {
    // Envoi effectif du mail
    await transporter.sendMail(mailOptions);
    
    // On renvoie "cle: cleActivation" au format JSON pour la validation frontend
    return res.status(200).json({ 
      success: true, 
      message: 'Clé générée et envoyée par e-mail avec succès.',
      cle: cleActivation 
    });
  } catch (error) {
    console.error("Erreur d'envoi du mail :", error);
    return res.status(500).json({ message: "Erreur lors de l'envoi de l'e-mail." });
  }
});
app.post('/api/abonnement/valider-cle', async (req, res) => {
  const { cleSaisie, forfaitChoisi, idAdmin } = req.body;

  if (!idAdmin) return res.status(400).json({ success: false, message: 'ID Admin requis.' });
  if (!cleSaisie) return res.status(400).json({ success: false, message: 'Clé requise.' });

  const clePropre = cleSaisie.trim();

  // 🔒 SÉCURITÉ : On empêche l'utilisation multiple de la même clé
  if (clesUtilisees.has(clePropre)) {
    return res.status(400).json({ success: false, message: 'Cette clé a déjà été utilisée.' });
  }

  if (clePropre !== derniereCleGeneree) {
    return res.status(400).json({ success: false, message: 'code incorrect' });
  }

  const numericAdminId = parseInt(idAdmin, 10);
  const maintenant = new Date();
  let dateDepart = new Date(maintenant);

  try {
    // 🔍 1. On cherche la date d'expiration actuelle DIRECTEMENT en Base de Données
    const verifResult = await pool.query(
      'SELECT actif, date_expiration AS "dateExpiration" FROM abonnements WHERE id_admin = $1',
      [numericAdminId]
    );

    const abonnementActuel = verifResult.rows[0];

    // Si l'abonnement existe, est actif et que la date est encore bonne, on prend cette date comme départ
    if (abonnementActuel && abonnementActuel.actif && abonnementActuel.dateExpiration) {
      const ancienneExpiration = new Date(abonnementActuel.dateExpiration);
      if (ancienneExpiration > maintenant) {
        dateDepart = new Date(ancienneExpiration);
      }
    }
    let dateExpiration = new Date(dateDepart);

    if (forfaitChoisi === '1_mois') dateExpiration.setDate(dateDepart.getDate() + 31);  
    else if (forfaitChoisi === '3_mois') dateExpiration.setDate(dateDepart.getDate() + 93);
    else if (forfaitChoisi === '1_an') dateExpiration.setDate(dateDepart.getDate() + 365);
    else if (forfaitChoisi === 'a_vie') dateExpiration.setFullYear(dateDepart.getFullYear() + 200);
    else return res.status(400).json({ success: false, message: 'Forfait invalide.' });
    const dateExpirationFinale = dateExpiration.toISOString();
    console.log(`[SQL TENTATIVE] Sauvegarde pour id_admin: ${numericAdminId}, expire: ${dateExpirationFinale}`);  
    // 💾 3. Sauvegarde (UPSERT)
    await pool.query(
      `INSERT INTO abonnements (id_admin, actif, date_expiration, forfait) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id_admin) 
       DO UPDATE SET actif = EXCLUDED.actif, date_expiration = EXCLUDED.date_expiration, forfait = EXCLUDED.forfait`,
      [numericAdminId, true, dateExpirationFinale, forfaitChoisi]
    );

    console.log(`✅ [SQL SUCCÈS] Base de données mise à jour pour l'id_admin: ${numericAdminId}`);

    // Mise à jour de la mémoire tampon locale
    statutAbonnementParAdmin[idAdmin] = {
      actif: true,
      dateExpiration: dateExpiration.getTime(),
      forfait: forfaitChoisi
    };

    // On consomme la clé
    clesUtilisees.add(clePropre);

    return res.status(200).json({ 
      success: true, 
      message: '✅ Clé d’activation correcte ! Forfait activé.',
      statutAbonnement: statutAbonnementParAdmin[idAdmin]
    });

  } catch (error) {
    console.log("\nxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    console.error("🚨 ERREUR CRITIQUE POSTGRESQL DETECTÉE :", error.message);
    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n");
    
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/abonnement/verifier-statut', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ actif: false, message: "ID Utilisateur manquant." });
  }

  const numericUserId = parseInt(userId, 10);

  try {
    // 👑 ÉTAPE 1 : Trouver à quel Admin appartient cet utilisateur (CORRIGÉ : admin_id)
    const userCheck = await pool.query(
      'SELECT id, role, admin_id FROM public.utilisateurs WHERE id = $1', 
      [numericUserId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ actif: false, message: "Utilisateur introuvable." });
    }

    const { role, admin_id } = userCheck.rows[0];

    // Si c'est un admin, l'ID cible est son propre ID. Si c'est un vendeur, c'est son admin_id parent.
    const numericAdminId = role === 'admin' ? numericUserId : parseInt(admin_id, 10);

    if (!numericAdminId) {
      return res.status(400).json({ actif: false, message: "Cet utilisateur n'est rattaché à aucun administrateur valide." });
    }

    // 🎯 ÉTAPE 2 : Vérification de l'abonnement
    const result = await pool.query(
      'SELECT actif, date_expiration AS "dateExpiration", forfait FROM public.abonnements WHERE id_admin = $1',
      [numericAdminId]
    );

    const monStatut = result.rows[0];

    if (!monStatut || !monStatut.actif) {
      return res.json({ actif: false, message: "Aucun abonnement actif pour cet établissement." });
    }

    // Comparaison mathématique standard et robuste des timestamps
    const tempsActuel = new Date().getTime();
    const expirationTimestamp = new Date(monStatut.dateExpiration).getTime();
    
    if (tempsActuel > expirationTimestamp) {
      await pool.query(
        'UPDATE public.abonnements SET actif = false, date_expiration = null, forfait = null WHERE id_admin = $1',
        [numericAdminId]
      );
      return res.json({ actif: false, message: "❌ L'abonnement de l'établissement a expiré. Le logiciel est désormais bloqué." });
    }

    return res.json({ actif: true, dateExpiration: monStatut.dateExpiration });

  } catch (error) {
    console.error("Erreur PostgreSQL lors de la vérification de l'abonnement :", error);
    return res.status(500).json({ actif: false, message: "Erreur interne du serveur." });
  }
});
// Route PostgreSQL pour modifier le profil de l'utilisateur
// Route PostgreSQL (avec Pool) pour modifier le profil de l'utilisateur
app.put('/api/users/update-profile', async (req, res) => {
  const { id, prenom, nom_reel, telephone, email } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, message: "ID utilisateur manquant." });
  }

  try {
    const queryText = `
      UPDATE utilisateurs 
      SET prenom = $1, nom_reel = $2, telephone = $3, email = $4 
      WHERE id = $5
      RETURNING id, nom_utilisateur, prenom, nom_reel, telephone, email, role;
    `;
    
    const values = [prenom, nom_reel, telephone, email, id];

    // Utilisation directe de pool.query
    const result = await pool.query(queryText, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé en base de données." });
    }

    // On récupère l'utilisateur mis à jour retourné par RETURNING
    const userMisAJour = result.rows[0];

    return res.json({ 
      success: true, 
      message: "Profil mis à jour avec succès !",
      user: userMisAJour
    });

  } catch (error) {
    console.error("❌ ERREUR SQL TECHNIQUE :", error.message);
    res.status(500).json({ success: false, message: `Erreur serveur : ${error.message}` });
  }
});
// --- FONCTION DE SAUVEGARDE ---
const effectuerSauvegarde = () => {
  const dossierBackup = path.join(__dirname, 'sauvegardes');
  if (!fs.existsSync(dossierBackup)) fs.mkdirSync(dossierBackup);
  const pgDumpPath = `C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe`;
  const date = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
  const commande = `set PGPASSWORD=91511556&& "${pgDumpPath}" -U postgres -h localhost -F c gestion_alimentation -f "${path.join(dossierBackup, `backup_${date}.backup`)}"`;
  exec(commande, (error) => { if (!error) console.log("💾 Backup auto OK"); });
};

// --- LANCEMENT ---
app.listen(5000, async () => {
  console.log("✅ SERVEUR DÉMARRÉ SUR LE PORT 5000 (Accessible sur le réseau)");
  
  try {
    // Les comptes par défaut ont été retirés pour éviter leur création automatique à chaque démarrage.
    console.log("🚀 Système d'initialisation prêt.");
  } catch (err) {
    console.error("Erreur initialisation :", err.message);
  }
  
  effectuerSauvegarde();
});
