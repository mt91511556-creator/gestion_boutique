import React, { useEffect, useState } from 'react';/* global html2pdf */
import axios from 'axios';
import { ShoppingCart, PlusCircle, X, CreditCard, Plus, Minus, Search, AlertTriangle, TrendingUp, DollarSign, Package, BarChart3, Wallet, Trash2, FileText, Edit3, Lock, User, LogOut, FileSpreadsheet, PieChart, Archive, Users, Eye, EyeOff, RefreshCw, Mail, RotateCcw, ArrowLeft, ArrowRight, Truck, Phone, Printer, Save, Briefcase, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';

function App() {
  // --- ÉTATS POUR L'AUTHENTIFICATION ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loginData, setLoginData] = useState({ nom_utilisateur: '', mot_de_passe: '' });
  const [loginError, setLoginError] = useState("");

  // --- ÉTATS EXISTANTS ---
  const [produits, setProduits] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [panier, setPanier] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nouveauProduit, setNouveauProduit] = useState({
    nom: '', prix_achat: '', prix_vente: '', stock_actuel: '', stock_alerte: '', date_entree: new Date().toISOString().split('T')[0]
  });
// Ajoute ces 4 lignes juste à côté de const [nomVendeur, setNomVendeur] = useState('');
const [prenomVendeur, setPrenomVendeur] = useState('');
const [nomFamilleVendeur, setNomFamilleVendeur] = useState('');
const [telVendeur, setTelVendeur] = useState('');

  const [sourcePaiement, setSourcePaiement] = useState("null"); // "caisse" par défaut
  const [showModalPaiement, setShowModalPaiement] = useState(false);
const [montantAPayer, setMontantAPayer] = useState("");
  const [produitAEditer, setProduitAEditer] = useState(null);
const [showModalEdit, setShowModalEdit] = useState(false);
  const [sousOngletProduit, setSousOngletProduit] = useState('nouveau');
  const [secondes, setSecondes] = useState(120); // 120 secondes = 2 minutes
const [peutRenvoyer, setPeutRenvoyer] = useState(false);
  const [codeSaisi, setCodeSaisi] = useState('');
  const [enAttenteValidation, setEnAttenteValidation] = useState(false);
const [emailAVerifier, setEmailAVerifier] = useState('');
  const [modeInscription, setModeInscription] = useState(false);
const [inscriptionData, setInscriptionData] = useState({ nom: '', motDePasse: '', confirmerMotDePasse: '' });
  const [nouvelleDepense, setNouvelleDepense] = useState({
  motif: '',
  montant: '',
  date_depense: new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
});
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
// Étape 1 : Déclarer les états pour la gestion du mot de passe oublié
const [forgotPasswordStep, setForgotPasswordStep] = useState('login'); // Gère l'affichage ('login', 'identify', 'verify')
const [forgotUsername, setForgotUsername] = useState('');              // Stocke le nom d'utilisateur saisi
const [validationCode, setValidationCode] = useState('');              // Stocke le code à 6 chiffres
const [resetError, setResetError] = useState('');                      // Gère les messages d'erreur spécifiques à la récupération
const [showModalModif, setShowModalModif] = useState(false);
const [sousOngletFacture, setSousOngletFacture] = useState('concevoir');
const ouvrirModif = (fournisseur) => {
  setFournisseurModifier({
    ...fournisseur,
    // Si adresse est null dans la console, on met "" pour débloquer l'input
    adresse: fournisseur.adresse || "" 
  });
  console.log("Vérification data :", fournisseur);
  setShowModalModif(true);
};
const [vueActuelle, setVueActuelle] = useState('catalogue'); // ou le nom de ton état de navigation actuel
const [fournisseurModifier, setFournisseurModifier] = useState({});
const [enModeEdition, setEnModeEdition] = useState(false);
const [fournisseurSelectionne, setFournisseurSelectionne] = useState(null);

const [fournisseurs, setFournisseurs] = useState([]);
const [showModalFournisseur, setShowModalFournisseur] = useState(false);
const [nouveauFournisseur, setNouveauFournisseur] = useState({
    nom: '',
    telephone: '', // Vérifie bien que c'est 'telephone'
    adresse: '',
    categorie: ''
});
const [produitsFournisseur, setProduitsFournisseur] = useState([]);
const [rechercheProduit, setRechercheProduit] = useState('');
const [statsDebut, setstatsDebut] = useState("");
const [statsFin, setstatsFin] = useState("");
  const [moisSelectionne, setMoisSelectionne] = useState(new Date().toISOString().slice(0, 7));
  const [filtreDateDebut, setFiltreDateDebut] = useState("");
const [filtreDateFin, setFiltreDateFin] = useState("");
  const [depenses, setDepenses] = useState([]);
  const [statsMensuels, setStatsMensuels] = useState([]); // Ajoute cette ligne
  const [ancienMdp, setAncienMdp] = useState('');
const [nouveauMdp, setNouveauMdp] = useState('');
const [confirmerMdp, setConfirmerMdp] = useState('');
  const [listeUtilisateurs, setListeUtilisateurs] = useState([]);
const [voirMdp, setVoirMdp] = useState({}); // Pour gérer l'affichage de l'œil par ligne
  const [sousOnglet, setSousOnglet] = useState('menu'); // 'menu', 'creation', 'liste' ou 'password'
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [vendeurs, setVendeurs] = useState([]); // Liste des vendeurs
const [nomVendeur, setNomVendeur] = useState('');
const [emailVendeur, setEmailVendeur] = useState('');
const [mdpVendeur, setMdpVendeur] = useState('');
  const [ongletActif, setOngletActif] = useState('gestion');
  const [historique, setHistorique] = useState([]);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [filtreArticle, setFiltreArticle] = useState("");
  const [montantRecu, setMontantRecu] = useState("");
  const [stats, setStats] = useState({
    
    aujourdhui: { ca: 0, benefice: 0, nb_tickets: 0 },
    global: { ca: 0, benefice: 0, ventes: 0 },
    top: [],
    stock: { valeur_achat: 0, valeur_vente_potentielle: 0 }
  });
  const [configTicketGlobal, setConfigTicketGlobal] = useState({ nom_boutique: 'TICKET DE CAISSE', adresse: '', telephone: '', message_pied: '', logo_url: null });
  const [modeAffichage, setModeAffichage] = useState('liste'); // 'liste' ou 'grille'
const [modePaiement, setModePaiement] = useState("Espèce");
  const API_URL = "http://localhost:5000/api/produits";
  const [showPreuve, setShowPreuve] = useState(false);
const [ventePreuve, setVentePreuve] = useState(null);
const [isMenuOuvert, setIsMenuOuvert] = useState(false);
const [sauvegardeEnCours, setSauvegardeEnCours] = React.useState(false);
const [afficherModalClient, setAfficherModalClient] = useState(false);
const [credits, setCredits] = useState([]); // Ta liste dynamique viendra se charger ici via ton fetch backend
const [listeClients, setListeClients] = useState([]);
const [clientSelectionne, setClientSelectionne] = useState(null);
const [formClient, setFormClient] = useState({ prenom: '', nom: '', telephone: '', adresse: '', notes: '' });
const [clientPourCredit, setClientPourCredit] = useState('');
const [statsGlobales, setStatsGlobales] = useState({ total_dehors: 0, clients_actifs: 0, total_recouvre: 0 });
const [sousOngletCredit, setSousOngletCredit] = useState('liste_credits');
const [filtreStatut, setFiltreStatut] = useState("Tous");
const [rechercheClient, setRechercheClient] = useState('');
const [venteSelectionnee, setVenteSelectionnee] = useState(null);
const [rechercheFacture, setRechercheFacture] = useState('');
const [modeleSelectionne, setModeleSelectionne] = useState('moderne');
const [nomEntreprise, setNomEntreprise] = useState('');
const [adresseEntreprise, setAdresseEntreprise] = useState('');
const [logoUrl, setLogoUrl] = useState('');
const [emailEntreprise, setEmailEntreprise] = useState('');
const [ribEntreprise, setRibEntreprise] = useState('');
const [siteWeb, setSiteWeb] = useState('');
const [factureConfig, setFactureConfig] = useState({
  nom: '',
  adresse: '',
  logo: '',
  email: '',
  rib: '',
  site: ''
});
const [modeFacture, setModeFacture] = useState('defaut');
const [fondDeRoulement, setFondDeRoulement] = useState(0);
const [nouveauMontantFond, setNouveauMontantFond] = useState('');
const [montantGlobalCaisse, setMontantGlobalCaisse] = useState(0);
const [modeSombre, setModeSombre] = useState(() => {
  // Regarde si un thème est enregistré localement au rechargement
  const themeEnregistre = localStorage.getItem('themeMode');
  return themeEnregistre === 'sombre'; 
});
const [rechercheProforma, setRechercheProforma] = useState('');
const [panierProforma, setPanierProforma] = useState([]);
const [clientProforma, setClientProforma] = useState('');
const [fichierCharge, setFichierCharge] = useState(null);
const [filtreDesignation, setFiltreDesignation] = useState('');
const [forfaitSelectionne, setForfaitSelectionne] = useState(null);
const [chargementCle, setChargementCle] = useState(false);
const [statutMessage, setStatutMessage] = useState('');
const [cleSaisieUtilisateur, setCleSaisieUtilisateur] = useState('');
const [cleRecueDuServeur, setCleRecueDuServeur] = useState('');
const [messageValidation, setMessageValidation] = useState('');
const [cleDejaUtilisee, setCleDejaUtilisee] = useState(false);
const [abonnementValide, setAbonnementValide] = useState(false);
const [chargementAbonnement, setChargementAbonnement] = useState(true);
const [afficherSaisie, setAfficherSaisie] = useState(false);
const [dateEcheance, setDateEcheance] = useState('');
// 1. PREMIER EFFECT : Récupère et force la conversion en millisecondes numériques
const [expirationTimestamp, setExpirationTimestamp] = useState(null);
const [declencherRafraichissement, setDeclencherRafraichissement] = useState(0);
const [formProfil, setFormProfil] = useState({
  prenom: user?.prenom || '',
  nom_reel: user?.nom_reel || '',
  telephone: user?.telephone || user?.phone || '',
  email: user?.email || ''
});

useEffect(() => {
  setFormProfil({
    prenom: user?.prenom || '',
    nom_reel: user?.nom_reel || '',
    telephone: user?.telephone || user?.phone || '',
    email: user?.email || ''
  });
}, [user]);
useEffect(() => {
  const verifierStatutAbonnement = async () => {
    // 💡 MODIFICATION CHIRURGICALE : On prend l'ID direct de l'utilisateur connecté (Admin ou Vendeur)
    let idAbonnementAVerifier = user?.id;

    if (!idAbonnementAVerifier) {
      try {
        const sessionStockee = localStorage.getItem('user'); 
        if (sessionStockee) {
          const sessionObj = JSON.parse(sessionStockee);
          idAbonnementAVerifier = sessionObj.id;
        }
      } catch (e) {
        console.error("Erreur de lecture de la session locale :", e);
      }
    }

    // CHANGEMENT ICI : Si aucun ID n'est trouvé, on attend (on ne passe pas l'abonnement à false prématurément)
    if (!idAbonnementAVerifier) {
      return;
    }

    try {
      // 🎯 L'ID envoyé ici (qu'il soit vendeur ou admin) sera intercepté par ton nouveau backend qui cherchera le compte parent automatiquement
      const response = await fetch(`http://localhost:5000/api/abonnement/verifier-statut?userId=${idAbonnementAVerifier}`);
      const data = await response.json();
      
      if (data.actif) {
        setAbonnementValide(true);
        
        if (data.dateExpiration) {
          // MODIFICATION : Prise en compte du format de date "illimite" ou de la date lointaine '2099-12-31' générée par la base
          if (data.dateExpiration === 'illimite' || data.dateExpiration.startsWith('2099-12-31')) {
            setDateEcheance('Illimité (À vie)');
            setExpirationTimestamp('illimite');
          } else {
            const dateObjet = new Date(data.dateExpiration);
            const dateFormatee = dateObjet.toLocaleDateString('fr-FR');
            
            setDateEcheance(dateFormatee);
            setExpirationTimestamp(dateObjet.getTime());
          }
        }
      } else {
        // Le serveur a répondu et a explicitement dit que c'est expiré en Base de Données
        setAbonnementValide(false); 
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'abonnement :", error);
    } finally {
      setChargementAbonnement(false); 
    }
  };

  verifierStatutAbonnement();
}, [user, declencherRafraichissement]);

// 2. DEUXIÈME EFFECT : CHRONOMÈTRE COMPARANT DEUX NOMBRES (MILISECONDES)
useEffect(() => {
  if (!expirationTimestamp || expirationTimestamp === 'illimite') return;

  const minuteurRealTime = setInterval(() => {
    const maintenant = new Date().getTime();

    // La comparaison se fait maintenant entre deux nombres purs : aucun bug possible
    if (maintenant > expirationTimestamp) {
      // 1. On bloque l'abonnement globalement
      setAbonnementValide(false); 
      
      // 2. AJOUT : On vide immédiatement la date d'échéance pour forcer l'affichage "Licence expirée" en temps réel
      if (typeof setDateEcheance === 'function') {
        setDateEcheance('');
      }

      // 3. AJOUT : On nettoie le timestamp pour arrêter définitivement les vérifications inutiles
      if (typeof setExpirationTimestamp === 'function') {
        setExpirationTimestamp(null);
      }

      clearInterval(minuteurRealTime);
      alert("❌ Votre abonnement a expiré ! Le logiciel est désormais bloqué.");
    }
  }, 2000); // Vérification toutes les 2 secondes

  return () => clearInterval(minuteurRealTime);
}, [expirationTimestamp]);
// useEffect pour faire disparaître le message de demande de clé après 4 secondes
useEffect(() => {
  if (statutMessage) {
    const timer = setTimeout(() => {
      setStatutMessage('');
    }, 4000); // 4000 ms = 4 secondes
    return () => clearTimeout(timer);
  }
}, [statutMessage]);

// useEffect pour faire disparaître le message de validation après 4 secondes
useEffect(() => {
  if (messageValidation) {
    const timer = setTimeout(() => {
      setMessageValidation('');
    }, 5000);
    return () => clearTimeout(timer);
  }
}, [messageValidation]);
useEffect(() => {
  // On ne déclenche le vidage QUE si le message contient le badge de succès vert ✅
  if (messageValidation && messageValidation.includes('✅')) {
    
    // On attend 3 secondes (3000 ms) avant de remettre le champ à zéro
    const timer = setTimeout(() => {
      setCleSaisieUtilisateur('');
    }, 7000);

    // Nettoyage du timer
    return () => clearTimeout(timer);
  }
}, [messageValidation]);
useEffect(() => {
  // 1. On vérifie d'abord si l'utilisateur a fait un choix sur ce navigateur
  const themeLocal = localStorage.getItem('themeMode');

  if (themeLocal) {
    // Si un choix existe localement, on lui donne la priorité absolue
    setModeSombre(themeLocal === 'sombre');
  } else if (user && user.theme_preference) {
    // 2. Si aucun choix local, on regarde la préférence en base de données
    const estSombre = user.theme_preference === 'sombre';
    setModeSombre(estSombre);
    localStorage.setItem('themeMode', estSombre ? 'sombre' : 'clair');
  }
  // Si 'user' n'est pas encore chargé, on ne fait RIEN pour ne pas écraser le mode actuel !
}, [user]);
useEffect(() => {
  const chargerFondRoulement = async () => {
    // Si aucun utilisateur n'est connecté, on ne fait rien
    if (!user) return; 

    try {
      // 🌟 LOGIQUE MULTI-COMPTE : On cible l'ID de l'admin propriétaire
      const idProprietaire = user?.role === 'vendeur' 
        ? (user?.admin_id || user?.cree_par) 
        : (user?.id || user?._id);

      const response = await fetch(`http://localhost:5000/api/fond-roulement?utilisateur=${idProprietaire}`);
      const data = await response.json();
      
      if (data && data.montant !== undefined) {
        setFondDeRoulement(data.montant);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du fond de roulement :", error);
    }
  };

  chargerFondRoulement();
  // Se relance si l'utilisateur change ou si l'onglet actif change
}, [ongletActif, isLoggedIn, user]);
// CHARGEMENT INITIAL DEPUIS LA BASE DE DONNÉES AU DÉMARRAGE
  React.useEffect(() => {
    const chargerConfigurationServeur = async () => {
      try {
        // 🌟 LOGIQUE MULTI-COMPTE / VENDEUR :
        // Si c'est un vendeur, on prend l'ID de son admin. Sinon, on prend son propre ID.
        const idPourFacture = user?.role === 'vendeur' 
          ? (user?.admin_id || user?.cree_par) 
          : (user?.id || user?._id);

        if (!idPourFacture) return;

        const response = await fetch('http://localhost:5000/api/facture-config', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'admin-id': idPourFacture // On demande la facture de l'admin concerné
          }
        });

        if (response.ok) {
          const config = await response.json();
          if (config) {
            if (typeof setFactureConfig === 'function') setFactureConfig(config);
            if (typeof setNomEntreprise === 'function') setNomEntreprise(config.nom || '');
            if (typeof setAdresseEntreprise === 'function') setAdresseEntreprise(config.adresse || '');
            if (typeof setLogoUrl === 'function') setLogoUrl(config.logo || '');
            if (typeof setEmailEntreprise === 'function') setEmailEntreprise(config.email || '');
            if (typeof setRibEntreprise === 'function') setRibEntreprise(config.rib || '');
            if (typeof setSiteWeb === 'function') setSiteWeb(config.site || '');
            if (config.mode_facture && typeof setModeleSelectionne === 'function') setModeleSelectionne(config.mode_facture); // 🌟 AJOUTÉ ET CORRIGÉ ICI
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la facture :", error);
      }
    };

    if (user) {
      chargerConfigurationServeur();
    }
  }, [user]);
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);
  const gererChangementInput = (cle, valeur) => {
  setFormProfil(prev => ({ ...prev, [cle]: valeur }));
};

// Sauvegarde et met à jour instantanément l'affichage
const sauvegarderModificationsProfil = async () => {
  try {
    const reponse = await fetch('http://localhost:5000/api/users/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: user?.id,
        prenom: formProfil.prenom,
        nom_reel: formProfil.nom_reel,
        telephone: formProfil.telephone,
        email: formProfil.email
      })
    });

    const data = await reponse.json();

    if (data.success) {
      // 1. Sauvegarde dans le localStorage pour persister après un F5
      localStorage.setItem('user', JSON.stringify(data.user));

      // 2. 💡 MISE À JOUR DIRECTE : On utilise ton vrai 'setUser' pour actualiser l'écran à la seconde
      setUser(data.user);
      
      alert("Profil mis à jour avec succès !");
      setEnModeEdition(false);
    } else {
      alert(data.message || "Une erreur est survenue.");
    }
  } catch (erreur) {
    console.error("Erreur lors de la sauvegarde du profil :", erreur);
    alert("Impossible de joindre le serveur.");
  }
};
 const demanderCleActivation = async () => {
  if (!forfaitSelectionne) return;

  setChargementCle(true);
  setStatutMessage('');
  setMessageValidation('');
  setCleSaisieUtilisateur('');

  try {
    const response = await fetch('http://localhost:5000/api/abonnement/demande-cle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        forfait: forfaitSelectionne,
        nomUtilisateur: user ? user.nom_utilisateur || user.nom : 'Utilisateur inconnu',
        telephone: user ? user.telephone || user.tel : 'Non renseigné'
      })
    });

    const data = await response.json();

    if (response.ok) {
      setStatutMessage(`✅ Clé générée !`);
      setCleRecueDuServeur(data.cle); // Sauvegarde la bonne clé reçue du backend pour comparaison
    } else {
      setStatutMessage(`❌ Erreur: ${data.message}`);
    }
  } catch (error) {
    setStatutMessage("❌ Impossible de contacter le serveur backend.");
  } finally {
    setChargementCle(false);
  }
};

const validerCleActivation = async () => {
  setMessageValidation('');

  // SÉCURITÉ 1 : Vérification de la clé
  if (!cleSaisieUtilisateur.trim()) {
    setMessageValidation('❌ Veuillez saisir une clé.');
    return;
  }

  // SÉCURITÉ 2 : Vérification du forfait
  if (!forfaitSelectionne) {
    setMessageValidation('❌ Veuillez sélectionner un forfait (1 mois, 3 mois...) ci-dessus avant de valider.');
    return;
  }

  // 🔴 LOGS DE VÉRIFICATION : Regarde dans ta console F12 si ces données sont bien remplies !
  console.log("=== TENTATIVE D'ACTIVATION ===");
  console.log("Clé saisie :", cleSaisieUtilisateur.trim());
  console.log("Forfait choisi :", forfaitSelectionne);
  console.log("Utilisateur actuel (user) :", user);
  console.log("ID Admin envoyé :", user?.admin_id || user?.id);

  try {
    const response = await fetch('http://localhost:5000/api/abonnement/valider-cle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cleSaisie: cleSaisieUtilisateur.trim(),
        forfaitChoisi: forfaitSelectionne, 
        idAdmin: user?.admin_id || user?.id || "ID_MANQUANT" // Évite d'envoyer un undefined qui casse le JSON
      })
    });

    const data = await response.json();
    console.log("Réponse du serveur (data) :", data);

    if (response.status === 200 && data.success) {
      setMessageValidation(data.message);
      
      if (typeof setAbonnementValide === 'function') setAbonnementValide(true);
      if (typeof setDateEcheance === 'function' && (data.nouvelleDate || data.dateEcheance)) {
        setDateEcheance(data.nouvelleDate || data.dateEcheance);
      }
      
      // MODIFICATION CHIRURGICALE : Utilisation de Date.now() pour forcer le rafraîchissement sans faire planter la syntaxe
      if (typeof setDeclencherRafraichissement === 'function') setDeclencherRafraichissement(Date.now());
      
      if (typeof setSousOnglet === 'function') setSousOnglet('');
      
    } else {
      setMessageValidation(data.message || '❌ Une erreur est survenue');
    }
  } catch (error) {
    console.error("Erreur critique de connexion au serveur :", error);
    setMessageValidation('❌ Impossible de se connecter au serveur.');
  }
};
  const basculerTheme = async () => {
  const nouveauTheme = !modeSombre ? 'sombre' : 'clair';
  const token = localStorage.getItem('token');

  setModeSombre(!modeSombre);
  localStorage.setItem('themeMode', nouveauTheme); // Écrit bien 'themeMode' ici

  if (token && user) {
    try {
      await fetch('http://localhost:5000/api/utilisateur/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ theme: nouveauTheme }) // Adaptez ici selon ce que votre backend attend (theme ou theme_preference)
      });
    } catch (err) {
      console.error("Erreur serveur theme :", err);
    }
  }
};
  // Fonction centrale pour graver le nom du client depuis n'importe quelle facture
  const exporterPDF = () => {
  let contenuHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #ffffff;">
      <h1 style="text-align: center; margin-bottom: 5px; color: #2c3e50;">Rapport Journal des Ventes</h1>
      <div style="text-align: center; font-size: 14px; color: #7f8c8d; margin-bottom: 30px;">
        Rapport généré le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()} <br/>
        ${dateDebut ? `Du : ${new Date(dateDebut).toLocaleDateString()}` : ''} ${dateFin ? ` Au : ${new Date(dateFin).toLocaleDateString()}` : ''}
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px;">
        <thead>
          <tr style="background-color: #f2f2f2; color: #2c3e50; font-weight: bold;">
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">N° Ticket</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Date</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Désignation / Article</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Quantité</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Total Brut</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Mode Paiement</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">État</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (typeof historiqueFiltre !== 'undefined' && historiqueFiltre.length > 0) {
    let grandTotal = 0;
    
    historiqueFiltre.forEach((v, index) => {
      const estMemeTicket = index > 0 && v.numero_ticket === historiqueFiltre[index - 1].numero_ticket;
      const estAnnule = v.etat && v.etat.toString().toLowerCase().includes('annul');
      
      if (!estAnnule) {
        grandTotal += parseFloat(v.prix_total || 0);
      }

      contenuHtml += `
        <tr style="${estAnnule ? 'color: #ef4444; background-color: #fff5f5;' : ''} border-bottom: 1px solid #bdc3c7;">
          <td style="border: 1px solid #bdc3c7; padding: 10px;">${estMemeTicket ? "" : String(v.numero_ticket).padStart(3, '0')}</td>
          <td style="border: 1px solid #bdc3c7; padding: 10px;">${estMemeTicket ? "" : new Date(v.date_vente).toLocaleString()}</td>
          <td style="border: 1px solid #bdc3c7; padding: 10px;">${v.designation || 'N/A'} ${estAnnule ? ' (ANNULÉ)' : ''}</td>
          <td style="border: 1px solid #bdc3c7; padding: 10px;">x${v.quantite}</td>
          <td style="border: 1px solid #bdc3c7; padding: 10px; font-weight: bold;">${parseFloat(v.prix_total || 0).toLocaleString()} F</td>
          <td style="border: 1px solid #bdc3c7; padding: 10px;">${estMemeTicket ? "" : (v.mode_paiement || 'Espèce')}</td>
          <td style="border: 1px solid #bdc3c7; padding: 10px; font-weight: bold; color: ${estAnnule ? '#ef4444' : '#27ae60'}; text-transform: uppercase; font-size: 11px;">
            ${estAnnule ? "Annulée" : "Validée"}
          </td>
        </tr>
      `;
    });

    contenuHtml += `
      <tr style="font-weight: bold; background-color: #eaeded;">
        <td colspan="4" style="border: 1px solid #bdc3c7; padding: 10px; text-align: right;">TOTAL GÉNÉRAL DES VENTES VALIDES :</td>
        <td colspan="3" style="border: 1px solid #bdc3c7; padding: 10px;">${grandTotal.toLocaleString()} F CFA</td>
      </tr>
    `;
  } else {
    contenuHtml += `<tr><td colspan="7" style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">Aucune vente enregistrée sur cette période.</td></tr>`;
  }

  contenuHtml += `
        </tbody>
      </table>
    </div>
  `;

  const options = {
    margin:       10,
    filename:     `Journal_Ventes_${new Date().toISOString().split('T')[0]}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  const elementTemporaire = document.createElement('div');
  elementTemporaire.innerHTML = contenuHtml;
  
  // 🌟 Appel direct et sécurisé de la bibliothèque importée localement
  html2pdf().set(options).from(elementTemporaire).save();
};
const exporterCreditsPDF = () => {
  // 1. Construction du contenu HTML pour le rapport des crédits
  let contenuHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #ffffff;">
      <h1 style="text-align: center; margin-bottom: 5px; color: #2c3e50;">Rapport Carnet des Crédits & Dettes</h1>
      <div style="text-align: center; font-size: 14px; color: #7f8c8d; margin-bottom: 30px;">
        Rapport généré le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()} <br/>
        ${filtreDateDebut ? `Du : ${new Date(filtreDateDebut).toLocaleDateString()}` : ''} ${filtreDateFin ? ` Au : ${new Date(filtreDateFin).toLocaleDateString()}` : ''}
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px;">
        <thead>
          <tr style="background-color: #f2f2f2; color: #2c3e50; font-weight: bold;">
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Client</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Date Prêt</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Article</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Montant Total</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Avance Versée</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Reste à Payer</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Statut</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Date Solde</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Utilisation des mêmes crédits filtrés pour construire le PDF
  const donneesAPdf = (credits || []).filter((credit) => {
    const nomArticle = credit.nom_produit || credit.produit_nom || '';
    const matchArticle = nomArticle.toLowerCase().includes((filtreArticle || '').toLowerCase());
    
    let matchStatut = true;
    if (filtreStatut !== "Tous") {
      if (filtreStatut === "Payé") matchStatut = Number(credit.reste_a_payer) <= 0;
      else if (filtreStatut === "En cours") matchStatut = Number(credit.reste_a_payer) > 0;
    }
    
    let matchDate = true;
    if (credit.date_pret) {
      const datePretFormattee = new Date(credit.date_pret).toISOString().split('T')[0];
      const matchDateDebut = filtreDateDebut ? datePretFormattee >= filtreDateDebut : true;
      const matchDateFin = filtreDateFin ? datePretFormattee <= filtreDateFin : true;
      matchDate = matchDateDebut && matchDateFin;
    } else if (filtreDateDebut || filtreDateFin) {
      matchDate = false;
    }

    return matchArticle && matchStatut && matchDate;
  });

  if (donneesAPdf.length > 0) {
    let totalResteAPayer = 0;

    donneesAPdf.forEach((c) => {
      const reste = parseFloat(c.reste_a_payer || 0);
      totalResteAPayer += reste;
      const estSolde = reste <= 0 || c.statut === 'SOLDE';

      // 🌟 CORRECTION 1 : Récupération de l'avance avec la bonne variable (montant_paye)
      const avanceVersee = parseFloat(c.montant_paye || 0);

      // 🌟 CORRECTION 2 : Affichage identique de la date solde dynamique (Date + Heure)
      const dateSoldeAffichee = estSolde 
        ? new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' à')
        : '—';

      // Format Date Prêt avec Heure
      const datePretAffichee = c.date_pret 
        ? new Date(c.date_pret).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' à') 
        : '—';

      // Récupération correcte du libellé de l'article
      const nomArticleAffichee = c.designation || c.nom_produit || 'N/A';

      contenuHtml += `
        <tr style="border-bottom: 1px solid #bdc3c7;">
          <td style="border: 1px solid #bdc3c7; padding: 10px; font-weight: bold;">${c.prenom || ''} ${c.nom || ''}</td>
          <td style="border: 1px solid #bdc3c7; padding: 10px;">${datePretAffichee}</td>
          <td style="border: 1px solid #bdc3c7; padding: 10px;">${nomArticleAffichee}</td>
          <td style="border: 1px solid #bdc3c7; padding: 10px;">${parseFloat(c.montant_total || 0).toLocaleString()} F</td>
          <td style="border: 1px solid #bdc3c7; padding: 10px;">${avanceVersee.toLocaleString()} F</td>
          <td style="border: 1px solid #bdc3c7; padding: 10px; font-weight: bold; color: ${estSolde ? '#27ae60' : '#ef4444'};">${reste.toLocaleString()} F</td>
          <td style="border: 1px solid #bdc3c7; padding: 10px; font-weight: bold; color: ${estSolde ? '#27ae60' : '#ef4444'}; text-transform: uppercase; font-size: 11px;">
            ${estSolde ? "SOLDÉ" : "EN COURS"}
          </td>
          <td style="border: 1px solid #bdc3c7; padding: 10px; color: ${estSolde ? '#27ae60' : '#7f8c8d'}; font-weight: '600';">
            ${dateSoldeAffichee}
          </td>
        </tr>
      `;
    });

    contenuHtml += `
      <tr style="font-weight: bold; background-color: #eaeded;">
        <td colspan="5" style="border: 1px solid #bdc3c7; padding: 10px; text-align: right;">TOTAL DES DETTES RESTANTES :</td>
        <td colspan="3" style="border: 1px solid #bdc3c7; padding: 10px; color: #ef4444;">${totalResteAPayer.toLocaleString()} F CFA</td>
      </tr>
    `;
  } else {
    contenuHtml += `<tr><td colspan="8" style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">Aucun crédit trouvé avec ces filtres.</td></tr>`;
  }

  contenuHtml += `
        </tbody>
      </table>
    </div>
  `;

  // 2. Options de configuration du PDF
  const options = {
    margin:       10,
    filename:     `Rapport_Credits_${new Date().toISOString().split('T')[0]}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  // 3. Génération et téléchargement
  const elementTemporaire = document.createElement('div');
  elementTemporaire.innerHTML = contenuHtml;
  html2pdf().set(options).from(elementTemporaire).save();
};
const exporterFicheClientPDF = (client) => {
  if (!client) return;

  // 1. On récupère toutes les dettes liées à ce client spécifique
  const dettesDuClient = (credits || []).filter(c => c.telephone === client.telephone);
  const totalResteAPayer = dettesDuClient.reduce((acc, c) => acc + Number(c.reste_a_payer || 0), 0);

  let contenuHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #ffffff;">
      <h1 style="text-align: center; margin-bottom: 5px; color: #2c3e50;">Fiche Client & Historique</h1>
      <div style="text-align: center; font-size: 14px; color: #7f8c8d; margin-bottom: 25px;">
        Document généré le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}
      </div>

      <div style="display: flex; justify-content: space-between; background-color: #f8f9fa; padding: 15px; borderRadius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px;">
        <div>
          <h2 style="margin: 0 0 8px 0; color: #2c3e50;">${client.prenom || ''} ${client.nom || ''}</h2>
          <p style="margin: 4px 0; font-size: 14px;"><strong>📞 Téléphone :</strong> ${client.telephone || '—'}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>📍 Adresse :</strong> ${client.adresse || 'Aucune adresse enregistrée'}</p>
        </div>
        <div style="text-align: right; min-width: 200px;">
          <span style="font-size: 12px; font-weight: bold; color: ${totalResteAPayer > 0 ? '#ef4444' : '#10b981'}; text-transform: uppercase;">
            ${totalResteAPayer > 0 ? 'SOLDE RESTE À DEVOIR' : 'SITUATION SAINE'}
          </span>
          <h1 style="margin: 5px 0 0 0; color: ${totalResteAPayer > 0 ? '#ef4444' : '#10b981'}; font-size: 24px; font-weight: 900;">
            ${totalResteAPayer.toLocaleString()} F CFA
          </h1>
        </div>
      </div>

      ${client.notes ? `
      <div style="background-color: #fffaf0; padding: 12px; border-left: 4px solid #dd6b20; font-size: 13px; font-style: italic; margin-bottom: 25px;">
        <strong>Notes / Garanties :</strong> ${client.notes}
      </div>
      ` : ''}

      <h3 style="color: #2c3e50; margin-bottom: 10px; font-size: 15px;">Historique des Engagements</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="background-color: #f2f2f2; color: #2c3e50; font-weight: bold;">
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Article</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Date Dette</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Montant Total</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Payé (Avance)</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Reste à Payer</th>
            <th style="border: 1px solid #bdc3c7; padding: 10px; text-align: left;">Statut</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (dettesDuClient.length > 0) {
    dettesDuClient.forEach((dette) => {
      const reste = parseFloat(dette.reste_a_payer || 0);
      const estSolde = reste <= 0;
      const dateDetteBrute = dette.date_pret || dette.date_creation;

      const dateDetteAffichee = dateDetteBrute 
        ? new Date(dateDetteBrute).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' à') 
        : '—';

      contenuHtml += `
        <tr style="border-bottom: 1px solid #bdc3c7;">
          <td style="border: 1px solid #bdc3c7; padding: 10px; font-weight: bold;">${dette.designation || dette.nom_produit || 'N/A'}</td>
          <td style="border: 1px solid #bdc3c7; padding: 10px;">${dateDetteAffichee}</td>
          <td style="border: 1px solid #bdc3c7; padding: 10px;">${parseFloat(dette.montant_total || 0).toLocaleString()} F</td>
          <td style="border: 1px solid #bdc3c7; padding: 10px; color: #10b981;">${parseFloat(dette.montant_paye || 0).toLocaleString()} F</td>
          <td style="border: 1px solid #bdc3c7; padding: 10px; font-weight: bold; color: ${estSolde ? '#10b981' : '#ef4444'};">${reste.toLocaleString()} F</td>
          <td style="border: 1px solid #bdc3c7; padding: 10px; font-weight: bold; color: ${estSolde ? '#10b981' : '#ef4444'}; font-size: 11px;">
            ${estSolde ? "✅ SOLDÉ" : "❌ EN COURS"}
          </td>
        </tr>
      `;
    });
  } else {
    contenuHtml += `<tr><td colspan="6" style="border: 1px solid #bdc3c7; padding: 20px; text-align: center; color: #7f8c8d; font-style: italic;">Aucun engagement ou historique de crédit pour ce client.</td></tr>`;
  }

  contenuHtml += `
        </tbody>
      </table>
    </div>
  `;

  // Configuration de l'export
  const options = {
    margin:       12,
    filename:     `Fiche_Client_${client.prenom || ''}_${client.nom || ''}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' } // Format Portrait vertical pour une fiche client
  };

  const elementTemporaire = document.createElement('div');
  elementTemporaire.innerHTML = contenuHtml;
  html2pdf().set(options).from(elementTemporaire).save();
};
const exporterDepensesPDF = () => {
  // 1. On applique exactement les mêmes filtres que l'affichage de la table
  const depensesFiltrees = depenses.filter(d => {
    const dDate = d.date_depense.split('T')[0];
    const debut = filtreDateDebut || '1900-01-01';
    const fin = filtreDateFin || '2100-12-31';
    const correspondDesignation = d.motif.toLowerCase().includes(filtreDesignation.toLowerCase());
    return dDate >= debut && dDate <= fin && correspondDesignation;
  });

  // 2. Calcul du total des dépenses filtrées
  const totalDepenses = depensesFiltrees.reduce((acc, curr) => acc + Number(curr.montant), 0);

  // 3. Construction de la structure HTML du document PDF
  let contenuHtml = `
    <div style="font-family: Arial, sans-serif; padding: 24px; color: #333; background-color: #ffffff;">
      <h1 style="text-align: center; margin-bottom: 6px; color: #2c3e50; font-size: 24px; font-weight: 800;">Rapport des Dépenses</h1>
      <div style="text-align: center; font-size: 13px; color: #7f8c8d; margin-bottom: 30px;">
        Document généré le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}
      </div>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h4 style="margin: 0 0 5px 0; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Critères de recherche :</h4>
          <p style="margin: 3px 0; font-size: 14px; color: #1e293b;">
            <strong>Période :</strong> ${filtreDateDebut ? new Date(filtreDateDebut).toLocaleDateString() : 'Début'} au ${filtreDateFin ? new Date(filtreDateFin).toLocaleDateString() : 'Fin'}
          </p>
          ${filtreDesignation ? `<p style="margin: 3px 0; font-size: 14px; color: #1e293b;"><strong>Motif contient :</strong> "${filtreDesignation}"</p>` : ''}
        </div>
        <div style="text-align: right;">
          <span style="font-size: 11px; font-weight: 800; color: #e74c3c; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL DÉPENSÉ</span>
          <h1 style="margin: 4px 0 0 0; color: #e74c3c; font-size: 22px; font-weight: 900;">${totalDepenses.toLocaleString()} F CFA</h1>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #e2e8f0;">
        <thead>
          <tr style="background-color: #f1f5f9; color: #334155; font-weight: 700; border-bottom: 2px solid #cbd5e1;">
            <th style="border: 1px solid #e2e8f0; padding: 12px 10px; text-align: left; width: 25%;">Date</th>
            <th style="border: 1px solid #e2e8f0; padding: 12px 10px; text-align: left; width: 50%;">Désignation / Motif</th>
            <th style="border: 1px solid #e2e8f0; padding: 12px 10px; text-align: right; width: 25%;">Montant</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Remplissage des lignes du tableau
  if (depensesFiltrees.length > 0) {
    depensesFiltrees.forEach((d) => {
      const brute = d.date_depense.split('T')[0];
      const parties = brute.split('-');
      const dateAffichee = `${parties[2]}/${parties[1]}/${parties[0]}`;

      contenuHtml += `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="border: 1px solid #e2e8f0; padding: 12px 10px; color: #475569;">${dateAffichee}</td>
          <td style="border: 1px solid #e2e8f0; padding: 12px 10px; font-weight: 500; color: #1e293b;">${d.motif}</td>
          <td style="border: 1px solid #e2e8f0; padding: 12px 10px; text-align: right; font-weight: 600; color: #e74c3c;">${Number(d.montant).toLocaleString()} F</td>
        </tr>
      `;
    });

    // Ligne finale de totalisation intégrée au tableau
    contenuHtml += `
      <tr style="background-color: #f8f9fa; font-weight: bold; border-top: 2px solid #cbd5e1;">
        <td colspan="2" style="border: 1px solid #e2e8f0; padding: 14px 10px; text-align: right; color: #334155; font-size: 15px;">TOTAL CUMULÉ :</td>
        <td style="border: 1px solid #e2e8f0; padding: 14px 10px; text-align: right; color: #e74c3c; font-size: 16px; font-weight: 800;">${totalDepenses.toLocaleString()} F CFA</td>
      </tr>
    `;
  } else {
    contenuHtml += `<tr><td colspan="3" style="border: 1px solid #e2e8f0; padding: 24px; text-align: center; color: #64748b; font-style: italic;">Aucune dépense enregistrée pour les critères sélectionnés.</td></tr>`;
  }

  contenuHtml += `
        </tbody>
      </table>
    </div>
  `;

  // 4. Options d'impression html2pdf
  const options = {
    margin:       15,
    filename:     `Rapport_Depenses_${new Date().toISOString().split('T')[0]}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // 5. Génération et téléchargement immédiat
  const elementTemporaire = document.createElement('div');
  elementTemporaire.innerHTML = contenuHtml;
  html2pdf().set(options).from(elementTemporaire).save();
};
const exporterFicheFournisseurPDF = (fournisseur, historiqueAchats) => {
  if (!fournisseur) return;

  // 1. Calcul des totaux pour l'historique
  const volumeAchat = fournisseur.montant_total || 0;
  const resteDette = fournisseur.dette_totale || 0;

  // 2. Construction de la structure HTML du document PDF
  let contenuHtml = `
    <div style="font-family: Arial, sans-serif; padding: 24px; color: #333; background-color: #ffffff;">
      <h1 style="text-align: center; margin-bottom: 6px; color: #00000; font-size: 24px; font-weight: 800;">Fiche Profil Fournisseur</h1>
      <div style="text-align: center; font-size: 13px; color: #7f8c8d; margin-bottom: 30px;">
        Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </div>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px; display: flex; justify-content: space-between;">
        <div style="flex: 1;">
          <h2 style="margin: 0 0 8px 0; color: #1e293b; font-size: 20px; font-weight: 800;">${fournisseur.nom}</h2>
          <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>🏷️ Catégorie :</strong> ${fournisseur.categorie || 'Général'}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>📞 Téléphone :</strong> ${fournisseur.telephone || '---'}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>📍 Adresse :</strong> ${fournisseur.adresse || '---'}</p>
        </div>
        <div style="text-align: right; min-width: 200px; padding-left: 20px; border-left: 2px dashed #cbd5e1;">
          <div style="margin-bottom: 12px;">
            <span style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">Volume Total d'Achat</span>
            <h3 style="margin: 2px 0 0 0; color: #1e293b; font-size: 18px; font-weight: 700;">${volumeAchat.toLocaleString()} F CFA</h3>
          </div>
          <div>
            <span style="font-size: 11px; font-weight: 800; color: ${resteDette > 0 ? '#ef4444' : '#10b981'}; text-transform: uppercase;">En-cours Dette</span>
            <h2 style="margin: 2px 0 0 0; color: ${resteDette > 0 ? '#ef4444' : '#10b981'}; font-size: 22px; font-weight: 800;">${resteDette.toLocaleString()} F CFA</h2>
          </div>
        </div>
      </div>

      <h3 style="color: #1e293b; font-size: 16px; margin-bottom: 12px; font-weight: 700;">📦 Historique des achats</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #e2e8f0;">
        <thead>
          <tr style="background-color: #f1f5f9; color: #334155; font-weight: 700; border-bottom: 2px solid #cbd5e1;">
            <th style="border: 1px solid #e2e8f0; padding: 10px; text-align: left;">Produit</th>
            <th style="border: 1px solid #e2e8f0; padding: 10px; text-align: center; width: 15%;">Qté</th>
            <th style="border: 1px solid #e2e8f0; padding: 10px; text-align: right; width: 20%;">Prix Unitaire</th>
            <th style="border: 1px solid #e2e8f0; padding: 10px; text-align: left; width: 20%;">Date</th>
            <th style="border: 1px solid #e2e8f0; padding: 10px; text-align: left; width: 25%;">Statut Paiement</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Remplissage dynamique des lignes de l'historique
  if (historiqueAchats && historiqueAchats.length > 0) {
    historiqueAchats.forEach((item) => {
      let statutPaiement = "";
      const paye = item.montant_paye !== undefined && item.montant_paye !== null ? Number(item.montant_paye) : null;
      const credit = item.montant_credit !== undefined && item.montant_credit !== null ? Number(item.montant_credit) : null;
      const source = String(item.source_paiement || '').toLowerCase().trim();

      if (credit === 0 || credit === null) {
        statutPaiement = source === 'poche' ? "Comptant (Poche)" : "Comptant (Caisse)";
      } else if (paye === 0) {
        statutPaiement = "Crédit Total";
      } else {
        statutPaiement = source === 'poche' ? `Partiel (Poche)` : `Partiel (Caisse)`;
      }

      const dateAffichee = new Date(item.date_entree).toLocaleDateString('fr-FR');

      contenuHtml += `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="border: 1px solid #e2e8f0; padding: 10px; font-weight: 600; color: #1e293b;">${item.nom}</td>
          <td style="border: 1px solid #e2e8f0; padding: 10px; text-align: center; color: #475569;">${item.quantite}</td>
          <td style="border: 1px solid #e2e8f0; padding: 10px; text-align: right; color: #475569;">${item.prix_achat.toLocaleString()} F</td>
          <td style="border: 1px solid #e2e8f0; padding: 10px; color: #475569;">${dateAffichee}</td>
          <td style="border: 1px solid #e2e8f0; padding: 10px; font-weight: 600; color: ${credit > 0 ? '#b91c1c' : '#15803d'};">${statutPaiement}</td>
        </tr>
      `;
    });
  } else {
    contenuHtml += `<tr><td colspan="5" style="border: 1px solid #e2e8f0; padding: 20px; text-align: center; color: #64748b; font-style: italic;">Aucun achat enregistré pour ce fournisseur.</td></tr>`;
  }

  contenuHtml += `
        </tbody>
      </table>
    </div>
  `;

  // 3. Configuration de html2pdf
  const options = {
    margin:       15,
    filename:     `Fiche_Fournisseur_${fournisseur.nom.replace(/\s+/g, '_')}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // 4. Génération du fichier
  const elementTemporaire = document.createElement('div');
  elementTemporaire.innerHTML = contenuHtml;
  html2pdf().set(options).from(elementTemporaire).save();
};
const graverNomClientManuel = async (numeroTicket, nomSaisi) => {
  if (!numeroTicket) return;
  try {
    const token = localStorage.getItem('token');
    
    // Envoi au backend sur le port 5000
    await fetch('http://localhost:5000/api/ventes/modifier-client', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        numeroTicket: numeroTicket,
        clientNomManuel: nomSaisi
      })
    });

    // 🌟 UN SIMPLE LOG DANS LA CONSOLE : Plus aucun rechargement ni clignotement !
    console.log("Nom gravé avec succès dans pgAdmin en tâche de fond.");

  } catch (err) {
    console.error("Erreur gravure nom:", err);
  }
};
// 🌟 ON EXTRAIT LA FONCTION POUR QU'ELLE SOIT ACCESSIBLE PARTOUT 🌟
const chargerDonneesCredits = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // 1. Chargement des statistiques globales (Zone Verte)
    const responseStats = await fetch('http://localhost:5000/api/credits/stats-globales', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataStats = await responseStats.json();
    setStatsGlobales(dataStats);

    // 2. Chargement de la liste du suivi des dettes (Zone Rouge)
    const responseListe = await fetch('http://localhost:5000/api/credits/liste', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataListe = await responseListe.json();
    
    setCredits(dataListe);
    
  } catch (err) {
    console.error("Erreur de chargement des données crédits :", err);
  }
};

// Ton useEffect reste propre et écoute toujours l'onglet actif
useEffect(() => {
  if (ongletActif === 'credits') {
    chargerDonneesCredits();
    chargerClients(); 
  }
}, [ongletActif]);
const gererEncaissement = async (creditId, resteAPayer) => {
  // 1. On demande le montant au vendeur
  const montantVerse = prompt(`Reste à payer : ${resteAPayer} F CFA. Entrez le montant du versement :`);
  
  // Si le vendeur annule ou ne met rien, on s'arrête
  if (!montantVerse || isNaN(montantVerse) || Number(montantVerse) <= 0) {
    return;
  }

  if (Number(montantVerse) > Number(resteAPayer)) {
    alert("Attention, le montant versé est supérieur au reste à payer !");
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/credits/encaisser', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        credit_id: creditId,
        montant: Number(montantVerse)
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Versement enregistré avec succès !");
      
      // 🌟 REFRESH AUTOMATIQUE ET PROPRE 🌟
      // On rappelle immédiatement les fonctions de chargement pour mettre à jour l'écran
      chargerDonneesCredits();
      if (typeof chargerClients === 'function') {
        chargerClients();
      }
      
    } else {
      alert("Erreur : " + data.error);
    }
  } catch (err) {
    console.error("Erreur lors de l'encaissement :", err);
    alert("Impossible de contacter le serveur.");
  }
};
 useEffect(() => {
  const token = localStorage.getItem('token');

  // 🔒 SÉCURITÉ : Si aucun token ou aucun utilisateur n'est trouvé, 
  // on vide immédiatement le ticket pour le prochain utilisateur
  if (!token || !user) {
    setConfigTicketGlobal({
      nom_boutique: 'TICKET DE CAISSE',
      adresse: '',
      telephone: '',
      message_pied: '',
      logo_url: null
    });
    return; 
  }

  // 🔄 Si quelqu'un est connecté, on charge les bonnes données
  const chargerConfigurationTicket = async () => {
    try {
      // 🌟 LOGIQUE VENDEUR : Si c'est un vendeur, on va chercher le ticket de son admin
      const idPourTicket = user?.role === 'vendeur' 
        ? (user?.admin_id || user?.cree_par) 
        : (user?.id || user?._id);

      const response = await fetch('http://localhost:5000/api/ticket-config', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'admin-id': idPourTicket // 🌟 Transmet le bon ID propriétaire au serveur
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfigTicketGlobal(data);
      }
    } catch (err) {
      console.error("Erreur chargement ticket global:", err);
    }
  };
  
  chargerConfigurationTicket();

  // 🛠️ On ajoute [user] dans les dépendances pour recharger dès que l'utilisateur (ou son rôle) est dispo
}, [ongletActif, isLoggedIn, user]);
const chargerClients = async () => {
  // 1. On récupère l'ID de l'admin connecté (adapte "user?.id" selon ta variable globale)
  const adminId = typeof user !== 'undefined' ? user?.id : 1;

  try {
    // 2. On ajoute l'id_utilisateur dans l'URL pour que le serveur sache qui demande la liste
    const reponse = await fetch(`http://localhost:5000/api/credits/clients?id_utilisateur=${adminId}`);
    const data = await reponse.json();
    
    if (Array.isArray(data)) {
      setListeClients(data);
      
      // Sélectionne automatiquement le premier client s'il y en a un
      if (data.length > 0 && !clientSelectionne) {
        setClientSelectionne(data[0]);
      }
    }
  } catch (err) {
    console.error("Erreur de chargement des clients :", err);
  }
};

  // =================================================================
  // 3. FONCTION DE SOUMISSION DU FORMULAIRE (ENVOI AU BACKEND)
  // =================================================================
  const gererSoumissionClient = async (e) => {
  e.preventDefault();
  const telephoneSaisi = formClient.telephone;

  // 1. On récupère l'ID de l'admin connecté (adapte la variable selon ton projet, ex: user.id)
  const adminId = typeof user !== 'undefined' ? user?.id : 1; 

  try {
    // 2. On ajoute l'id_utilisateur dans les données envoyées au serveur
    const reponse = await fetch('http://localhost:5000/api/credits/nouveau-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formClient,
        id_utilisateur: adminId // 👈 Transmis au serveur pour pgAdmin !
      })
    });
    
    const data = await reponse.json();
    
    if (data.success) {
      alert(data.msg);
      
      // Ferme et réinitialise le formulaire
      setAfficherModalClient(false); 
      setFormClient({ prenom: '', nom: '', telephone: '', adresse: '', notes: '' }); 
      
      // 3. On force la recharge en passant l'id_utilisateur pour que le serveur accepte de renvoyer la liste
      const reponseNouvelle = await fetch(`http://localhost:5000/api/credits/clients?id_utilisateur=${adminId}`);
      const clientsMisAJour = await reponseNouvelle.json();
      setListeClients(clientsMisAJour);
      
      // Ouvre directement la fiche du client créé à droite
      const nouveauClient = clientsMisAJour.find(c => c.telephone === telephoneSaisi);
      if (nouveauClient) {
        setClientSelectionne(nouveauClient);
      } else if (clientsMisAJour.length > 0) {
        setClientSelectionne(clientsMisAJour[0]);
      }
      
      // Bascule l'affichage sur le répertoire
     setSousOngletCredit('repertoire_clients');
    } else {
      alert(data.msg || "Une erreur est survenue.");
    }
  } catch (err) {
    console.error("Erreur connexion backend :", err);
    alert("Impossible de contacter le serveur.");
  }
};
// 🌟 LE VERROU MAGIQUE : À mettre tout en haut avec tes autres useEffect
useEffect(() => {
  // Si on a un ticket sélectionné à droite et qu'il possède un nom manuel
  if (venteSelectionnee?.numero_ticket && venteSelectionnee?.client_nom_manuel) {
    // On force l'application à retenir ce nom en local dans le navigateur
    localStorage.setItem(`nom_ticket_${venteSelectionnee.numero_ticket}`, venteSelectionnee.client_nom_manuel);
  }
}, [venteSelectionnee?.numero_ticket, venteSelectionnee?.client_nom_manuel]);
  // =================================================================
  // 4. DECLENCHEMENT AUTOMATIQUE AU CHANGEMENT D'ONGLET
  // =================================================================
  useEffect(() => {
    if (ongletActif === 'credits') {
      chargerClients();
    }
  }, [ongletActif]);
// BLOC 2 : Le Journal et les Dépenses (FIXE : ne bouge JAMAIS avec les dates)
useEffect(() => {
  if (user) {
    chargerHistorique(); // On charge le journal une seule fois au login
    chargerDepenses();   // On charge les dépenses une seule fois
  }
}, [user]); // <--- On ne met PAS dateDebut/dateFin ici, donc le journal reste intact
useEffect(() => {
    // Cette fonction s'exécutera à chaque fois que 'user' change
    if (user) {
        chargerFournisseurs();
    } else {
        setFournisseurs([]); // On vide la liste si personne n'est connecté
    }
}, [user]);
// BLOC 3 : Le Total Cumulé (DYNAMIQUE : change selon les dates)
useEffect(() => {
  if (user?.role === 'admin') {
    chargerStats(); // Cette fonction met à jour les 531 932 et 113 446
  }
}, [user, statsDebut, statsFin]); // <--- ICI on surveille les dates
const sauvegarderNouveauModeFacture = async (nouveauMode) => {
  try {
    // 1. On change immédiatement le style visuel à l'écran
    setModeFacture(nouveauMode);

    // 2. On l'enregistre en base de données pour cet administrateur
    const token = localStorage.getItem('token');
    await fetch('http://localhost:5000/api/facture-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'admin-id': user?.id || user?._id
      },
      body: JSON.stringify({
        nom: nomEntreprise,
        adresse: adresseEntreprise,
        logo: logoUrl,
        email: emailEntreprise,
        rib: ribEntreprise,
        site: siteWeb,
        mode_facture: nouveauMode // Injection du nouveau modèle
      })
    });
  } catch (error) {
    console.error("Erreur lors du changement de modèle de facture :", error);
  }
};
 const handleLogin = async (e) => {
    e.preventDefault();
    try {
       // Nettoyage préventif des anciennes données de session pour éviter les conflits de cache
       localStorage.removeItem('user');
       
       const res = await axios.post("http://localhost:5000/api/auth/login", loginData);
       
       localStorage.setItem('token', res.data.token);
       localStorage.setItem('user', JSON.stringify(res.data.user));
       setOngletActif('gestion')
       // AJOUT : Stocker le rôle dans le localStorage pour persistance
       localStorage.setItem('role', res.data.user.role);

       setUser(res.data.user);
      
       // AJOUT : Mettre à jour l'état du rôle (assure-toi d'avoir const [role, setRole] = useState('') au début)
       if (typeof setRole === 'function') {
         setRole(res.data.user.role);
       }

       setIsLoggedIn(true);
    } catch (err) {
       setLoginError("Identifiants incorrects");
    }
  };
  
  const handleSelectFournisseur = async (f) => {
    // 1. On affiche d'abord les infos du fournisseur (Nom, Tel, Dette)
    setFournisseurSelectionne(f);
    
    // 2. On vide la liste précédente pour éviter de voir les produits du fournisseur d'avant
    setProduitsFournisseur([]);

    try {
        const token = localStorage.getItem('token');
        // 3. On appelle le backend pour récupérer les produits liés à ce fournisseur
        const response = await axios.get(`http://localhost:5000/api/fournisseurs/${f.id}/produits`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // 4. On met à jour l'état avec les produits reçus
        setProduitsFournisseur(response.data);
    } catch (err) {
        console.error("Erreur lors du chargement des produits du fournisseur:", err);
        // Si erreur, on s'assure que la liste reste vide
        setProduitsFournisseur([]);
    }
};
// Cette fonction ouvre juste la "petite caisse"
const reglerDette = () => {
    setMontantAPayer(""); // On vide le champ
    setShowModalPaiement(true); // On affiche le modal
};

// Celle-ci fait le vrai travail quand on clique sur "Valider" dans le modal
const handleValiderPaiement = async () => {
    if (!montantAPayer || montantAPayer <= 0) return alert("Entrez un montant valide");

    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`http://localhost:5000/api/fournisseurs/${fournisseurSelectionne.id}/payer`, 
            { montant_verse: Number(montantAPayer) },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // 1. On ferme le modal
        setShowModalPaiement(false);
        setMontantAPayer("");

        // 2. MISE À JOUR LOCALE (évite le rechargement de page)
        setFournisseurSelectionne(prev => ({
            ...prev,
            dette_totale: response.data.nouvelle_dette
        }));

        // 3. Optionnel : Mettre à jour la liste globale des fournisseurs
        setFournisseurs(prev => prev.map(f => 
            f.id === fournisseurSelectionne.id 
            ? { ...f, dette_totale: response.data.nouvelle_dette } 
            : f
        ));

        // On affiche le message de succès du serveur
        alert(response.data.message || "Paiement effectué !");
        
    } catch (err) {
        // AJOUT : Affiche l'erreur précise envoyée par le serveur (ex: Fonds insuffisants)
        const errorMessage = err.response?.data?.error || "Serveur injoignable";
        alert("🚨 ÉCHEC : " + errorMessage);
    }
};
const mettreAJourFournisseur = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // VERIFICATION : On utilise 'fournisseurModifier' (les infos de la Modal)
    if (!fournisseurModifier?.id) {
      alert("Erreur : ID du fournisseur introuvable.");
      return;
    }

    const donneesEnvoyees = {
      nom: fournisseurModifier.nom,
      telephone: fournisseurModifier.telephone,
      adresse: fournisseurModifier.adresse, // CHANGÉ : on utilise la clé 'adresse' ici
      categorie: fournisseurModifier.categorie
    };

    // Envoi au serveur
    await axios.put(
      `http://localhost:5000/api/fournisseurs/${fournisseurModifier.id}`, 
      donneesEnvoyees, 
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("✅ Profil mis à jour avec succès !");
    
    // ACTIONS APRES SUCCÈS
    setShowModalModif(false); // On ferme la fenêtre Modal
    if (typeof setEnModeEdition === 'function') setEnModeEdition(false); // On ferme le mode édition si actif
    
    await chargerFournisseurs(); // On rafraîchit la liste de gauche
    
    // On met aussi à jour l'affichage central avec une copie propre pour React
    setFournisseurSelectionne({ ...fournisseurModifier }); 

  } catch (err) {
    // ICI ON AFFICHE LA VRAIE ERREUR
    const messageErreur = err.response?.data?.error || err.message;
    console.error("ERREUR COMPLETE :", err.response);
    alert("Détail technique de l'erreur : " + messageErreur);
  }
};
 const chargerFournisseurs = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("Pas de token trouvé !");
            return;
        }

        const response = await axios.get('http://localhost:5000/api/fournisseurs', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const nouvellesDonnees = response.data;
        setFournisseurs(nouvellesDonnees);

        // --- ACTUALISATION DU DÉTAIL À DROITE ---
        // Si un fournisseur est sélectionné, on met à jour son objet avec les nouveaux chiffres
        setFournisseurSelectionne(prev => {
            if (!prev) return null;
            const misAJour = nouvellesDonnees.find(f => f.id === prev.id);
            return misAJour || prev;
        });

    } catch (err) {
        console.error("Erreur Axios :", err.response?.data || err.message);
    }
};
useEffect(() => {
  if (fournisseurSelectionne) {
    // On cherche la version mise à jour du fournisseur sélectionné dans la nouvelle liste
    const misAJour = fournisseurs.find(f => f.id === fournisseurSelectionne.id);
    if (misAJour) {
      setFournisseurSelectionne(misAJour);
    }
  }
}, [fournisseurs]); // Se déclenche dès que la liste des fournisseurs change

// Appelez cette fonction dans votre useEffect de démarrage
useEffect(() => {
    chargerFournisseurs();
}, []);
const handleAjouterFournisseur = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    
    // On force les noms de clés pour correspondre EXACTEMENT au backend
    const data = {
      nom: nouveauFournisseur.nom,
      telephone: nouveauFournisseur.telephone || nouveauFournisseur.contact, // On prend l'un ou l'autre
      adresse: nouveauFournisseur.adresse,
      categorie: nouveauFournisseur.categorie
    };

    console.log("Données envoyées au serveur :", data); // Vérifie ici dans ta console F12

    await axios.post('http://localhost:5000/api/fournisseurs', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    alert("Fournisseur ajouté !");
    setShowModalFournisseur(false);
    chargerFournisseurs();
  } catch (err) {
    console.error("Erreur lors de l'envoi :", err);
  }
};
const chargerVendeurs = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/admin/vendeurs', {
      headers: { Authorization: `Bearer ${token}` }
    });
    // On s'assure que les données reçues sont bien un tableau
    setListeUtilisateurs(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Erreur chargement vendeurs:", err);
    if (err.response?.status === 401 || err.response?.status === 403) {
      // Optionnel : rediriger ou déconnecter si le token est expiré
    }
    alert("Erreur lors du chargement des vendeurs");
  }
};
const ajouterProduit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    
    // 🛠️ AJOUT UNIQUE : Utilisation de FormData pour empaqueter les données et le fichier image
    const formData = new FormData();
    formData.append('nom', nouveauProduit.nom);
    formData.append('categorie', nouveauProduit.categorie || 'Général');
    formData.append('prix_achat', Number(nouveauProduit.prix_achat));
    formData.append('prix_vente', Number(nouveauProduit.prix_vente));
    formData.append('stock_actuel', Number(nouveauProduit.stock_actuel));
    formData.append('stock_minimum', Number(nouveauProduit.stock_alerte)); // <--- Correction ici
    formData.append('date_entree', new Date().toISOString());

    // 🛠️ AJOUT UNIQUE : Inclusion de la photo si elle est présente dans l'état
    if (nouveauProduit.image_fichier) {
      formData.append('image', nouveauProduit.image_fichier);
    }

    if (isEditing) {
      await axios.put(`http://localhost:5000/api/produits/${nouveauProduit.id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // 🛠️ Requis pour les fichiers
        }
      });
    } else {
      await axios.post('http://localhost:5000/api/produits', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // 🛠️ Requis pour les fichiers
        }
      });
    }

    await chargerProduits(); // Rafraîchit la liste
    setShowModal(false); // Recharge la liste depuis la base de données
    await chargerStats();    // Actualise les statistiques (alertes, etc.)
    
    // --- AJOUT POUR ACTUALISER LE PANNEAU FOURNISSEUR ---
  
    // --------------------------------------------------
    
    // Réinitialisation et fermeture
    setShowModal(false);
    setIsEditing(false);
    setNouveauProduit({ nom: '', prix_achat: '', prix_vente: '', stock_actuel: '', stock_alerte: '', image_fichier: null });
    
  } catch (err) {
    console.error("Erreur lors de l'ajout/modification:", err);
    alert("Erreur lors de l'enregistrement du produit");
  }
};
const handleInscriptionAdmin = async () => {
  // 🛠️ On extrait proprement toutes les variables de inscriptionData (Ajout de nom_famille)
  const { nom, nom_famille, motDePasse, confirmerMotDePasse, prenom, telephone, email } = inscriptionData;

  // On vérifie les 3 champs obligatoires dans React
  if (!nom || !motDePasse || !confirmerMotDePasse) {
    return alert("Veuillez remplir le nom et les deux mots de passe.");
  }

  try {
    const res = await axios.post('http://localhost:5000/api/auth/inscription-admin', {
      nom, // 💻 C'est ça qui sert de "Nom d'utilisateur" (identifiant) côté serveur !
      nom_famille, // 🛠️ AJOUT UNIQUE : Le vrai nom de famille est maintenant envoyé au serveur !
      motDePasse,
      confirmerMotDePasse,
      prenom,
      telephone,
      email
    });

    // On prépare la validation pour l'email commun
    setEmailAVerifier("mt91511556@gmail.com"); 
    setEnAttenteValidation(true); 
    setModeInscription(false); 
    
    alert("Compte créé ! Le code a été envoyé à l'administrateur.");
  } catch (err) {
    alert(err.response?.data?.error || "Erreur lors de l'inscription");
  }
};
const handleRenvoyerCode = async () => {
  try {
    // On utilise l'objet inscriptionData pour récupérer les valeurs
    await axios.post('http://localhost:5000/api/auth/inscription-admin', {
      nom: inscriptionData.nom,
      motDePasse: inscriptionData.motDePasse,
      confirmerMotDePasse: inscriptionData.confirmerMotDePasse
    });

    // Réinitialisation du minuteur
    setSecondes(120);
    setPeutRenvoyer(false);
    alert("Un nouveau code a été envoyé !");
  } catch (err) {
    alert(err.response?.data?.error || "Erreur lors du renvoi du code");
  }
};
 const handleLogout = () => {
    // 1. Supprime le token, l'utilisateur et TOUTES les clés locales pour fermer proprement la session
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear(); // Sécurité supplémentaire pour tout raser dans le stockage local

    // 2. Remet les états d'authentification de base à zéro
    setIsLoggedIn(false);
    setUser(null);

    // 3. 🛠️ AJOUT DE SÉCURITÉ : Force le rechargement total de la page.
    // Cela détruit instantanément la mémoire RAM de React et efface tous les stocks/ventes de l'Admin A.
    window.location.reload();
};

  const chargerProduits = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/produits', {
      headers: { Authorization: `Bearer ${token}` }
    });
    // On s'assure que response.data est bien un tableau
    setProduits(Array.isArray(response.data) ? response.data : []);
  } catch (error) {
    console.error("Erreur chargement produits:", error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      setIsLoggedIn(false);
    }
  }
};
const creerCompteVendeur = async () => {
  if (!nomVendeur || !mdpVendeur) return alert("Nom et mot de passe obligatoires");
  
  try {
    const token = localStorage.getItem('token');
    await axios.post('http://localhost:5000/api/admin/creer-vendeur', 
      { 
        nom_utilisateur: nomVendeur, 
        email: emailVendeur, 
        mot_de_passe: mdpVendeur,
        prenom: prenomVendeur,             // 🛠️ AJOUT UNIQUE
        nom_famille: nomFamilleVendeur,    // 🛠️ AJOUT UNIQUE
        telephone: telVendeur              // 🛠️ AJOUT UNIQUE
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    alert("Compte vendeur créé !");
    // Optionnel : vider les champs après création
    setNomVendeur('');
    setMdpVendeur('');
    setEmailVendeur('');
    setPrenomVendeur('');         // 🛠️ AJOUT UNIQUE
    setNomFamilleVendeur('');      // 🛠️ AJOUT UNIQUE
    setTelVendeur('');             // 🛠️ AJOUT UNIQUE
  } catch (err) {
    alert("Erreur : " + (err.response?.data?.error || "Impossible de créer le compte"));
  }
};
  const chargerHistorique = () => {
  const token = localStorage.getItem('token');
  axios.get("http://localhost:5000/api/ventes", {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    setHistorique(res.data);
    // 🌟 On attache la fonction à window pour qu'elle soit utilisable partout
    window.maFonctionDeRecharge = chargerHistorique;
  })
  .catch(err => console.error(err));
};

// Mets-la aussi juste en dessous pour être sûr qu'elle soit détectée tout de suite au démarrage
window.maFonctionDeRecharge = chargerHistorique;

  const chargerStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get("http://localhost:5000/api/stats", {
        headers: { Authorization: `Bearer ${token}` },
        params: { dateDebut: statsDebut, dateFin: statsFin } // AJOUT : Filtrage pour le Total Cumulé
      });
      const topNettoye = res.data.top.map(item => ({
        ...item,
        gain_net: Number(item.gain_net),
        benefice: Number(item.benefice || item.gain_net) // AJOUT : Sécurité pour le graphique
      }));
      setStats({ ...res.data, top: topNettoye });

      // AJOUT : Chargement de l'historique mensuel
      const resMensuel = await axios.get("http://localhost:5000/api/stats/mensuel", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Sécurité : On s'assure que les données mensuelles sont bien traitées comme des nombres
      const mensuelNettoye = resMensuel.data.map(m => ({
        ...m,
        benefice: Number(m.benefice || 0),
        ca: Number(m.ca || 0)
      }));
      
      setStatsMensuels(mensuelNettoye);

      // AJOUT : Mise à jour du stock en même temps que les stats
      chargerProduits();

    } catch (err) {
      console.error("Erreur stats:", err);
    }
  };
  // --- FICHIER FRONTEND (React) ---
const ajouterDepense = async (e) => {
  if (e) e.preventDefault(); 
  
  if (!nouvelleDepense.motif || !nouvelleDepense.montant) {
    alert("Veuillez remplir le motif et le montant");
    return;
  }

  try {
    // CORRECTION : Récupération et envoi du Token pour l'autorisation
    const token = localStorage.getItem('token');
    await axios.post("http://localhost:5000/api/depenses", nouvelleDepense, {
      headers: { Authorization: `Bearer ${token}` } // Crucial pour que req.user.id existe
    });

    // Rechargement des données
    await chargerDepenses(); 
    await chargerStats();    
    
    setNouvelleDepense({
      motif: '',
      montant: '',
      date_depense: new Date().toISOString().split('T')[0]
    });

    alert("Dépense enregistrée avec succès !");
  } catch (err) {
    console.error("Erreur lors de l'ajout de la dépense:", err);
    alert("Erreur lors de l'enregistrement : Vérifiez votre connexion.");
  }
};
const supprimerFournisseur = async (id) => {
  if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.")) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/fournisseurs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Fournisseur supprimé !");
      chargerFournisseurs(); // On rafraîchit la liste
      setFournisseurSelectionne(null); // On ferme la vue détails
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  }
};
const chargerDepenses = async () => {
  try {
    const tokenStocke = localStorage.getItem('token');
    const res = await axios.get("http://localhost:5000/api/depenses", {
      headers: { Authorization: `Bearer ${tokenStocke}` }
    });

    // AJOUT : Tri des dépenses par date (de la plus récente à la plus ancienne)
    // Cela permet de voir immédiatement la dépense que tu viens d'ajouter, même si elle est antidatée.
    const depensesTriees = res.data.sort((a, b) => 
      new Date(b.date_depense) - new Date(a.date_depense)
    );

    setDepenses(depensesTriees);
  } catch (err) {
    console.error("Erreur chargement dépenses:", err);
  }
};
// On surveille le changement de compte (via le token ou l'admin_id)
useEffect(() => {
    // Si l'utilisateur change, on réinitialise la sélection pour la sécurité
    setFournisseurSelectionne(null);
    
    // On met le token (ou adminId) dans les dépendances
}, [localStorage.getItem('token')]); 

// Un deuxième useEffect pour garder les infos à jour sans fermer la page
useEffect(() => {
    if (fournisseurSelectionne && fournisseurs.length > 0) {
        const misAJour = fournisseurs.find(f => f.id === fournisseurSelectionne.id);
        if (misAJour) {
            setFournisseurSelectionne(misAJour);
        }
    }
}, [fournisseurs]); // Celui-ci met à jour les textes (adresse, etc.) sans vider l'écran
  useEffect(() => { 
    if(isLoggedIn) {
      chargerProduits(); 
      if(user?.role === 'admin') chargerStats(); 
    }
  }, [isLoggedIn, user]);
useEffect(() => {
  const chargerClientsPourCaisse = async () => {
    // Si user.id n'est pas dispo, on met 1 par défaut pour éviter le "undefined"
    const adminId = (typeof user !== 'undefined' && user?.id) ? user.id : 1;
    const token = localStorage.getItem('token');

    try {
      const reponse = await fetch(`http://localhost:5000/api/credits/clients?id_utilisateur=${adminId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await reponse.json();
      
      if (Array.isArray(data)) {
        setListeClients(data); 
        console.log("Clients chargés dans la caisse avec succès :", data);
      }
    } catch (err) {
      console.error("Erreur chargement clients dans la caisse :", err);
    }
  };

  // On lance le chargement immédiatement au démarrage de l'appli
  chargerClientsPourCaisse();

  // On relance un chargement de sécurité après 1.5 seconde (le temps que la session s'initialise)
  const timerScurite = setTimeout(() => {
    chargerClientsPourCaisse();
  }, 1500);

  return () => clearTimeout(timerScurite);
}, [user, ongletActif]); // Se déclenche aussi au changement d'onglet ou d'utilisateur
 useEffect(() => {
  let intervalle = null;

  // Si on attend la validation et qu'il reste du temps
  if (enAttenteValidation && secondes > 0) {
    intervalle = setInterval(() => {
      setSecondes((prev) => prev - 1);
    }, 1000);
  } else if (secondes === 0) {
    setPeutRenvoyer(true); // Active le bouton quand le temps est fini
    clearInterval(intervalle);
  }

  // Nettoyage de l'intervalle si on quitte la page
  return () => clearInterval(intervalle);
}, [enAttenteValidation, secondes]);
// Force le retour à l'accueil de la gestion produit quand on change d'onglet
useEffect(() => {
  if (ongletActif === 'gestion_produits') {
    setSousOngletProduit(null);
  }
}, [ongletActif]);
const handleEnregistrerProduit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const produitFinal = {
    nom: nouveauProduit.nom,
    categorie: "Général",
    prix_achat: parseFloat(nouveauProduit.prix_achat) || 0,
    prix_vente: parseFloat(nouveauProduit.prix_vente) || 0,
    stock_actuel: parseInt(nouveauProduit.stock_actuel) || 0,
    stock_alerte: parseInt(nouveauProduit.stock_alerte) || 0,   // <-- CORRIGÉ : On envoie le bon nom de champ pour le seuil
    stock_minimum: parseInt(nouveauProduit.stock_alerte) || 0,  // <-- PAR SÉCURITÉ : On remplit aussi celui-ci si ton backend l'attend
    date_entree: nouveauProduit.date_entree
  };

  try {
    if (isEditing) {
      await axios.put(`http://localhost:5000/api/produits/${nouveauProduit.id}`, produitFinal, config);
    } else {
      // Création simple sans fournisseur
      await axios.post("http://localhost:5000/api/produits", produitFinal, config);
    }

    setShowModal(false);
    setIsEditing(false);
    
    // Reset du formulaire
    setNouveauProduit({
      nom: '', prix_achat: '', prix_vente: '', stock_actuel: '', stock_alerte: '', 
      date_entree: new Date().toISOString().split('T')[0]
    });
    
    await chargerProduits(); 
    alert("Produit ajouté au catalogue ! Utilisez 'Réapprovisionner' pour lier un fournisseur.");

  } catch (err) {
    alert("Erreur lors de l'enregistrement");
  }
};
 const ouvrirPreuve = (numTicket) => {
  // 1. On récupère tous les articles qui ont ce numéro de ticket
  const articlesDuTicket = historique.filter(v => v.numero_ticket === numTicket);

  if (articlesDuTicket.length > 0) {
    const premierArticle = articlesDuTicket[0]; // On prend les infos communes (date, paiement)
    
    // 2. On calcule le total du ticket (somme des prix_total)
    const totalTicket = articlesDuTicket.reduce((acc, curr) => acc + parseFloat(curr.prix_total), 0);

    // 3. On remplit l'état pour l'affichage
    setVentePreuve({
      numero: numTicket,
      date: premierArticle.date_vente,
      modePaiement: premierArticle.mode_paiement, // <--- TRÈS IMPORTANT
      montantRecu: premierArticle.montant_recu,
      monnaieRendue: premierArticle.monnaie_rendue,
      venduPar: premierArticle.vendu_par, // AJOUTÉ : Pour afficher le vendeur sur la preuve
      total: totalTicket,
      articles: articlesDuTicket.map(a => ({
        designation: a.designation,
        quantite: a.quantite,
        prix_total: a.prix_total
      }))
    });

    // 4. On ouvre la fenêtre du ticket
    setShowPreuve(true);
  }
};
const effectuerVente = async () => {
  if (panier.length === 0) return;
  const token = localStorage.getItem('token');
  const montantDonne = parseFloat(montantRecu) || 0;
  const monnaieARendre = montantDonne - total;

  // 1. CALCUL DU BÉNÉFICE TOTAL DE LA VENTE
  const beneficeVente = panier.reduce((acc, item) => {
    const prixAchat = parseFloat(item.prix_achat) || 0;
    const prixVente = parseFloat(item.prix_vente) || 0;
    return acc + ((prixVente - prixAchat) * item.quantite);
  }, 0);

  try {
    // 2. Enregistrement de la vente avec le bénéfice et les infos de crédit si applicable
    const res = await axios.post('http://localhost:5000/api/ventes', {
      articles: panier,
      montantRecu: montantDonne, // Ce montant correspondra à l'avance réelle reçue
      monnaieRendue: modePaiement === 'Crédit' ? 0 : monnaieARendre,
      modePaiement: modePaiement,
      benefice: beneficeVente, // Envoyé au backend pour mise à jour de la base de données
      // 👇 DONNÉES CRÉDIT AJOUTÉES
      id_client: modePaiement === 'Crédit' ? clientPourCredit : null,
      resteAPayer: modePaiement === 'Crédit' ? Math.max(0, total - montantDonne) : 0
    }, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000 
    });

    alert("Vente enregistrée avec succès !");

    // 3. Gestion de l'impression
   const ticketFinal = res.data?.ticket;

if (window.confirm("Voulez-vous imprimer le ticket ?")) {
  // Remplace ton ancien appel par celui-ci pour forcer le mode :
imprimerTicket(
  ticketFinal, 
  panier, 
  total, 
  montantDonne, 
  monnaieARendre, 
  (total - montantDonne > 0) ? "Crédit" : modePaiement 
);
}

    // 4. NETTOYAGE ET MISE À JOUR SYNCHRONE DU RAPPORT
    setPanier([]);
    setMontantRecu("");
    if (typeof setClientPourCredit === 'function') setClientPourCredit(""); // Réinitialise le choix du client
    
    // On rafraîchit les produits (stock) ET les statistiques (rapport financier)
    chargerProduits(); 
    if (typeof chargerStats === 'function') {
      // AJOUT DU await ICI POUR FORCER LA MISE À JOUR DE L'ENCADRÉ VERT
      await chargerStats(); 
    }

    // 5. Rafraîchissement de l'historique
    try {
      const resH = await axios.get('http://localhost:5000/api/ventes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistorique(resH.data);
    } catch (e) {
      console.log("Erreur mineure de rafraîchissement.");
    }

  } catch (error) {
    console.error("Erreur de vente:", error);
    alert("Problème lors de la validation. Vérifiez votre connexion.");
  }
};

// Exemple pour la suppression
const supprimerProduit = async (id) => {
  if (window.confirm("Voulez-vous vraiment supprimer ce produit ? (Il sera envoyé en archive)")) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/produits/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // TRÈS IMPORTANT : Recharger la liste pour que le produit 
      // disparaisse du stock et apparaisse dans l'archive
      await chargerProduits(); 
      alert("Produit archivé !");
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  }
};
const supprimerDepense = async (id) => {
  if (window.confirm("Voulez-vous vraiment supprimer cette dépense ?")) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/depenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // On rafraîchit tout pour mettre à jour les calculs du dashboard
      await chargerDepenses();
      await chargerStats();
      
      alert("Dépense supprimée");
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert("Impossible de supprimer cette dépense");
    }
  }
};
const restaurerProduit = async (id) => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`http://localhost:5000/api/produits/restaurer/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await chargerProduits();
    alert("Produit restauré !");
  } catch (error) {
    alert("Erreur lors de la restauration");
  }
};
  const preparerEdition = (p) => {
    setNouveauProduit({ ...p, date_entree: p.date_entree ? p.date_entree.split('T')[0] : new Date().toISOString().split('T')[0] });
    setIsEditing(true);
    setShowModal(true);
  };

  const ajouterAuPanier = (produit) => {
    const existe = panier.find(item => item.id === produit.id);
    if (existe) {
      if (existe.qte < produit.stock_actuel) {
        setPanier(panier.map(item => item.id === produit.id ? { ...item, qte: item.qte + 1 } : item));
      } else { alert("Stock insuffisant !"); }
    } else {
      if (produit.stock_actuel > 0) {
        setPanier([...panier, { ...produit, qte: 1 }]);
      }
    }
  };

  const modifierQuantite = (id, delta) => {
    const pOrigine = produits.find(p => p.id === id);
    setPanier(panier.map(item => {
      if (item.id === id) {
        const nvelleQte = item.qte + delta;
        if (nvelleQte > pOrigine.stock_actuel) return item;
        return nvelleQte > 0 ? { ...item, qte: nvelleQte } : item;
      }
      return item;
    } ));
  };
const supprimerDuPanier = (id) => {
  setPanier(panier.filter(item => item.id !== id));
};
  const total = panier.reduce((sum, item) => sum + (item.prix_vente * item.qte), 0);

  const imprimerTicket = (numeroTicket, articles, total, montantRecu, monnaie, mode, vendeurNom) => {
    const fenetre = window.open('', '', 'width=300,height=600');
    
    // Formatage du numéro de ticket (ex: 001)
    const numeroFormate = String(numeroTicket).padStart(3, '0');

    // RÉCUPÉRATION DYNAMIQUE DES INFOS MODIFIÉES
    let boutiqueNom = 'TICKET DE CAISSE';
    let boutiqueAdresse = '';
    let boutiqueTel = '';
    let messagePiedPage = 'Merci de votre confiance !<br>À bientôt.';
    let logoHtml = '';

    const configurationActive = typeof configTicketGlobal !== 'undefined' ? configTicketGlobal : null;

    if (configurationActive) {
      if (configurationActive.nom_boutique) boutiqueNom = configurationActive.nom_boutique;
      if (configurationActive.adresse) boutiqueAdresse = `<p style="margin:2px 0; font-size:12px; color:#555;">${configurationActive.adresse}</p>`;
      if (configurationActive.telephone) boutiqueTel = `<p style="margin:2px 0; font-size:12px; color:#555;">Tel: ${configurationActive.telephone}</p>`;
      if (configurationActive.message_pied) messagePiedPage = configurationActive.message_pied.replace(/\n/g, '<br>');
      if (configurationActive.logo_url) {
        logoHtml = `<img src="${configurationActive.logo_url}" alt="Logo" style="max-width:60px; max-height:60px; margin-bottom:5px; object-fit:contain;" />`;
      }
    }

    // --- LOGIQUE SÉCURISÉE POUR LE CRÉDIT ---
    // Accepte "Crédit", "credit", "CREDIT" ou si la chaîne contient "cred"
    const estUnCredit = mode && (
      mode.toLowerCase().includes('credit') || 
      mode.toLowerCase().includes('crédit') || 
      mode.toLowerCase().includes('cred')
    );
    
    // Convertir proprement les montants pour éviter les erreurs de calcul
    const totalNum = parseFloat(total) || 0;
    const avanceNum = parseFloat(montantRecu) || 0;
    
    // Le reste à payer est la différence mathématique
    const resteAPayer = totalNum - avanceNum;

    fenetre.document.write(`
      <html>
        <head>
          <style>
            @page {
              size: auto;
              margin: 0mm;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 8px; /* Marges réduites pour économiser le papier */
              width: 280px; /* S'adapte parfaitement aux rouleaux de 58mm et 80mm */
              margin: 0;
              background-color: #fff;
              color: #000;
            }
            .text-center { text-align: center; }
            .bold { font-weight: bold; }
            hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
            table { width: 100%; font-size: 13px; border-collapse: collapse; }
            .flex-space { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="text-center">
            ${logoHtml}
            <h2 style="margin:2px 0; font-size:16px; letter-spacing:1px; text-transform: uppercase;">${boutiqueNom}</h2>
            ${boutiqueAdresse}
            ${boutiqueTel}
            <hr>
            <p style="margin: 5px 0; font-size: 11px;">
              <span class="bold">TICKET n°:</span> ${numeroFormate}<br>
              <span class="bold">Date:</span> ${new Date().toLocaleString()}<br>
              ${vendeurNom ? `<span class="bold">Vendeur:</span> ${vendeurNom}` : ''}
            </p>
          </div>
          <hr>
          
          <table>
            ${articles.map(a => `
              <tr>
                <td style="padding: 2px 0;">${a.nom} x${a.qte}</td>
                <td style="text-align:right; padding: 2px 0;">${(a.prix_vente * a.qte).toLocaleString('fr-FR')} F</td>
              </tr>
            `).join('')}
          </table>
          <hr>
          
          <div class="flex-space bold" style="font-size:14px; margin: 4px 0;">
            <span>TOTAL :</span>
            <span>${totalNum.toLocaleString('fr-FR')} FCFA</span>
          </div>
          
          <div style="margin-top:6px; font-size:12px; line-height: 1.3;">
            <div class="flex-space">
              <span>Mode de paiement :</span>
              <span class="bold">${mode || 'Espèce'}</span>
            </div>

            ${estUnCredit ? `
              <div class="flex-space">
                <span>Avance :</span>
                <span>${avanceNum.toLocaleString('fr-FR')} F</span>
              </div>
              
              <div class="flex-space bold" style="border-top: 1px dashed #000; padding-top: 4px; margin-top: 4px;">
                <span>Reste à payer :</span>
                <span>${resteAPayer.toLocaleString('fr-FR')} F</span>
              </div>
              
            
            ` : `
              <div class="flex-space">
                <span>Montant reçu :</span>
                <span>${avanceNum.toLocaleString('fr-FR')} F</span>
              </div>
              
              <div class="flex-space bold">
                <span>Monnaie rendue :</span>
                <span>${(parseFloat(monnaie) || 0).toLocaleString('fr-FR')} F</span>
              </div>
            `}
          </div>

          <hr>
          <p class="text-center" style="font-size:11px; margin-top:6px; font-style: italic;">${messagePiedPage}</p>
          
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    fenetre.document.close();
};

  const historiqueFiltre = historique.filter(v => {
    const dateVente = new Date(v.date_vente).setHours(0,0,0,0);
    const debut = dateDebut ? new Date(dateDebut).setHours(0,0,0,0) : null;
    const fin = dateFin ? new Date(dateFin).setHours(0,0,0,0) : null;
    const correspondDate = (!debut || dateVente >= debut) && (!fin || dateVente <= fin);
    const correspondArticle = filtreArticle === "" || v.designation.toLowerCase().includes(filtreArticle.toLowerCase());
    return correspondDate && correspondArticle;
  });

 const exporterExcel = () => {
  // 🌟 CALCUL AUTOMATIQUE DE LA PÉRIODE
  let textePeriode = "Période : Toutes les ventes";
  
  if (historiqueFiltre && historiqueFiltre.length > 0) {
    // On récupère toutes les dates valides du tableau filtré
    const dates = historiqueFiltre
      .map(v => v.date_vente || v.date)
      .filter(Boolean)
      .map(d => new Date(d))
      .sort((a, b) => a - b); // Tri chronologique (de la plus ancienne à la plus récente)

    if (dates.length > 0) {
      const premiereDate = dates[0].toLocaleDateString('fr-FR');
      const derniereDate = dates[dates.length - 1].toLocaleDateString('fr-FR');
      
      // 🌟 CORRECTION ICI : Utilisation de premiereDate à la place de listDate
      if (premiereDate === derniereDate) {
        textePeriode = `Période : Du ${premiereDate}`;
      } else {
        textePeriode = `Période : Du ${premiereDate} au ${derniereDate}`;
      }
    }
  }

  // 1. Création des lignes d'en-tête avec la période dynamique
  const enteteJolie = [
    ["JOURNAL DES VENTES - RAPPORT EXCEL"],
    [textePeriode], // Affiche par exemple : "Période : Du 02/01/2026 au 28/02/2026"
    [`Date d'export : ${new Date().toLocaleString('fr-FR')}`],
    [] // Ligne vide pour aérer avant le tableau
  ];

  // 2. Formatage complet de toutes les colonnes avec ajout de l'État
  const donneesFormatees = historiqueFiltre.map(v => {
    // Détection de l'état (Annulée ou Validée) comme dans ton tableau
    const estAnnule = v.etat && v.etat.toString().toLowerCase().includes('annul');
    
    return {
      'Ticket n°': v.numero_ticket ? String(v.numero_ticket).padStart(3, '0') : String(v.numero || '').padStart(3, '0'),
      'Date': v.date_vente ? new Date(v.date_vente).toLocaleString('fr-FR') : (v.date ? new Date(v.date).toLocaleString('fr-FR') : ''),
      'Article': v.designation || v.nom || v.article || '',
      'Qté': parseFloat(v.quantite || v.qte || 1),
      'Montant': parseFloat(v.prix_total || v.montant || v.total || 0),
      'Mode': v.mode_paiement || v.modePaiement || 'Espèce',
      'Vendu par': v.vendu_par || v.utilisateur || v.vendeur || 'Inconnu',
      'État': estAnnule ? "ANNULÉE" : "VALIDÉE" // 🌟 COLONNE ÉTAT RAJOUTÉE
    };
  });

  // 3. Création de la feuille Excel en commençant par l'en-tête jolie
  const feuille = XLSX.utils.aoa_to_sheet(enteteJolie);

  // 4. Ajout des données du tableau juste en dessous de l'en-tête (Décalé à la ligne 5)
  XLSX.utils.sheet_add_json(feuille, donneesFormatees, { origin: "A5" });

  // 5. Ajustement automatique de la largeur des colonnes (taille ajoutée pour l'État)
  const largeurs = [
    { wch: 12 }, // Ticket n°
    { wch: 22 }, // Date
    { wch: 30 }, // Article
    { wch: 8 },  // Qté
    { wch: 16 }, // Montant
    { wch: 12 }, // Mode
    { wch: 15 }, // Vendu par
    { wch: 14 }  // 🌟 État
  ];
  feuille['!cols'] = largeurs;

  // 6. Génération et téléchargement du fichier
  const classeur = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(classeur, feuille, "Journal des Ventes");
  XLSX.writeFile(classeur, `Journal_Ventes_${new Date().toISOString().split('T')[0]}.xlsx`);
};
const cardStyle = {
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  border: '1px solid #eee'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  boxSizing: 'border-box'
};

const buttonStyle = {
  width: '100%',
  padding: '14px',
  backgroundColor: '#27ae60',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '20px'
};
const supprimerVendeur = async (id) => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/admin/vendeurs/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("Vendeur supprimé !");
    chargerVendeurs(); // Pour mettre à jour la liste immédiatement
  } catch (err) {
    alert("Erreur lors de la suppression du vendeur");
  }
};
const reinitialiserMdp = async (id, nom) => {
  const nouveauMdp = window.prompt(`Saisir le nouveau mot de passe pour ${nom} :`);
  
  if (nouveauMdp && nouveauMdp.trim() !== "") {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/vendeurs/${id}/reset-password`, 
        { mot_de_passe: nouveauMdp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Le mot de passe de ${nom} a été mis à jour avec succès !`);
      chargerVendeurs(); // Cette fonction doit déjà exister pour rafraîchir la liste
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la réinitialisation du mot de passe.");
    }
  }
};
const modifierMonMdp = async () => {
  // ... (ton code de vérification et l'appel axios reste le même)

  try {
    const token = localStorage.getItem('token');
    await axios.put('http://localhost:5000/api/admin/modifier-mon-mdp', 
      { ancienMdp, nouveauMdp },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    alert("✅ Mot de passe mis à jour !");
    
    // 1. On vide les champs
    setAncienMdp('');
    setNouveauMdp('');
    setConfirmerMdp('');
    
    // 2. ON CHANGE CETTE LIGNE :
    // Au lieu de 'gestion', on met 'menu' pour revenir à l'accueil de l'onglet
    setSousOnglet('menu'); 

  } catch (err) {
    const messageErreur = err.response?.data?.error || "Erreur lors du changement";
    alert("❌ " + messageErreur);
  }
};
const handleVerifierCode = async () => {
  // On vérifie que le code n'est pas vide
  if (!codeSaisi) return alert("Veuillez entrer le code reçu");

  try {
    // MODIFICATION : Appel de la nouvelle route de création réelle
    const res = await axios.post('http://localhost:5000/api/auth/valider-et-creer-admin', {
      code: codeSaisi
    });

    alert("Félicitations ! Votre compte admin est maintenant créé et actif.");
    
    // On réinitialise les états pour revenir à l'écran de connexion
    setEnAttenteValidation(false);
    setModeInscription(false);
  } catch (err) {
    // Si le code est faux ou expiré
    alert(err.response?.data?.error || "Code incorrect");
  }
};
const handleAnnulerVente = async (numeroSaisi, motif) => {
  if (!window.confirm(`Annuler la vente liée au ticket n°${numeroSaisi} ?`)) return;
  console.log("Envoi du rôle :", role);
  
  try {
    const response = await fetch(`http://localhost:5000/api/ventes/annuler/ticket/${numeroSaisi}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        // AJOUT DU TOKEN POUR L'AUTORISATION
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ 
        role: role, 
        motif: motif
      })
    });

    const data = await response.json();
    if (response.ok) {
      alert(data.message);
      
      // --- AJOUT POUR MISE À JOUR RÉELLE ---
      // On vide le cache et on recharge les données du serveur
      window.location.href = window.location.origin + window.location.pathname;
      // -------------------------------------

      // Vider les champs
      if(document.getElementById('idVenteAnnuler')) document.getElementById('idVenteAnnuler').value = '';
      if(document.getElementById('motifAnnulation')) document.getElementById('motifAnnulation').value = '';
    } else {
      alert("⚠️ " + data.error);
    }
  } catch (err) {
    alert("❌ Erreur de connexion au serveur");
  }
};
const handleReapprovisionnement = async (e) => {
  e.preventDefault();

  // VERIFICATION OBLIGATOIRE : Bloque si aucune source n'est sélectionnée
  if (!nouveauProduit.source_paiement) {
    alert("Veuillez sélectionner obligatoirement la source du paiement (Caisse ou Poche) !");
    return;
  }

  try {
    const token = localStorage.getItem('token');
    
    // CALCUL AUTOMATIQUE DU CRÉDIT : (Quantité × Prix d'achat) - Montant Payé
    const totalAchat = (Number(nouveauProduit.quantiteAjout) || 0) * (Number(nouveauProduit.prix_achat_nouveau) || 0);
    const montantCredit = totalAchat - (Number(nouveauProduit.montant_paye) || 0);

    // Ajout des données de liaison fournisseur pour le backend
    const donneesReappro = {
      produit_id: nouveauProduit.id,
      quantite_ajoutee: Number(nouveauProduit.quantiteAjout) || 0,
      prix_achat_nouveau: Number(nouveauProduit.prix_achat_nouveau) || 0,
      prix_vente_nouveau: Number(nouveauProduit.prix_vente) || 0,
      fournisseur_id: nouveauProduit.fournisseur_id, // LIAISON
      montant_paye: Number(nouveauProduit.montant_paye) || 0, // LIAISON
      montant_credit: montantCredit >= 0 ? montantCredit : 0, // AJOUT DU CRÉDIT CALCULÉ
      source_paiement: nouveauProduit.source_paiement // AJOUT SOURCE
    };

    // Envoi au backend
    await axios.post('http://localhost:5000/api/reapprovisionner', donneesReappro, {
      headers: { Authorization: `Bearer ${token}` }
    });

    alert("Stock et compte fournisseur mis à jour avec succès !");

    // Rechargement des produits ET des fournisseurs pour synchroniser l'affichage
    await chargerProduits(); 
    await chargerFournisseurs(); // ACTUALISATION AUTOMATIQUE DE L'ONGLET FOURNISSEUR
    
    // Nettoyage de l'interface
    setSousOngletProduit(null);
    setNouveauProduit({ 
      nom: '', 
      prix_achat: '', 
      prix_vente: '', 
      stock_actuel: '', 
      stock_alerte: '',
      fournisseur_id: '', // Réinitialisation
      montant_paye: '',   // Réinitialisation
      source_paiement: null // Réinitialisation à null pour forcer le choix au prochain réappro
    });

  } catch (err) {
    console.error("Erreur lors du réapprovisionnement:", err.response?.data || err.message);
    alert("Erreur : " + (err.response?.data?.error || "Vérifiez les données du formulaire"));
  }
};
// --- STYLES UNIQUES POUR LE FORMULAIRE PRODUIT ---
  const styleChampSaisie = {
    padding: '12px 15px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
    transition: '0.3s',
    backgroundColor: '#fdfdfd',
    width: '100%',
    boxSizing: 'border-box'
  };

  const styleBoutonValider = {
    width: '100%',
    padding: '15px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
    transition: '0.3s'
  };
  const stylesTheme = {
  fondApplication: modeSombre ? '#000000' : '#f8fafc',    // Vrai noir pur pour le grand fond
  fondCartes: modeSombre ? '#121212' : '#ffffff',        // Gris très très foncé pour que tes blocs restent visibles
  textePrincipal: modeSombre ? '#ffffff' : '#1e293b',    // Blanc pur pour les titres
  texteSecondaire: modeSombre ? '#a0aec0' : '#64748b',   // Gris clair pour les sous-titres
  bordures: modeSombre ? '#2d3748' : '#e2e8f0'           // Lignes de séparation très subtiles
};
  if (!isLoggedIn) {
  // --- LOGIQUE D'AFFICHAGE CONDITIONNELLE ---
  // --- NOUVEL ÉCRAN : VALIDATION DU CODE ---
  if (enAttenteValidation) {
    
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#2c3e50' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', width: '350px' }}>
          <h2 style={{ color: '#2c3e50' }}>Vérification</h2>
          <p style={{ color: '#7f8c8d', fontSize: '14px' }}>Veuillez entrer le code de validation pour finaliser la création du compte <br/><strong></strong></p>
          
          <input 
            type="text" 
            placeholder="Code à 6 chiffres" 
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center', fontSize: '20px', letterSpacing: '5px', marginBottom: '20px' }}
            onChange={(e) => setCodeSaisi(e.target.value)}
          />

          <button 
            onClick={handleVerifierCode}
            style={{ backgroundColor: '#e67e22', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', width: '100%', fontWeight: 'bold', cursor: 'pointer' }}
          >
            VALIDER MON COMPTE
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
  {!peutRenvoyer ? (
    <p style={{ color: '#666', fontSize: '14px' }}>
      Renvoyer le code dans : 
      <span style={{ fontWeight: 'bold', marginLeft: '5px' }}>
        {Math.floor(secondes / 60)}:{(secondes % 60).toString().padStart(2, '0')}
      </span>
    </p>
  ) : (
    <button
      type="button"
      onClick={handleRenvoyerCode}
      style={{
        backgroundColor: 'transparent',
        color: '#007bff',
        border: 'none',
        textDecoration: 'underline',
        cursor: 'pointer',
        fontSize: '14px'
      }}
    >
      Je n'ai pas reçu de code, renvoyer
    </button>
  )}
</div>
          </button>
        </div>
      </div>
    );
  }
  if (modeInscription) {
    return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0f172a', padding: '20px', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', width: '100%', maxWidth: '440px', boxSizing: 'border-box' }}>
          
          <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '8px', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>Créer votre compte Admin</h2>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginTop: 0, marginBottom: '30px' }}>Configurez vos accès d'administration principale</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Conteneur en ligne pour Prénom et Nom pour gagner de la place et faire plus pro */}
            <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
              {/* Champ Prénom */}
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px', fontWeight: '600' }}>Prénom</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={16} />
                  <input 
                    type="text" 
                    placeholder="Youssoufa" 
                    style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '14px', color: '#1e293b', transition: 'border-color 0.2s' }} 
                    onChange={e => setInscriptionData({...inscriptionData, prenom: e.target.value})} 
                  />
                </div>
              </div>

              {/* Champ Nom */}
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px', fontWeight: '600' }}>Nom</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={16} />
                  <input 
                    type="text" 
                    placeholder="Keita" 
                    style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '14px', color: '#1e293b', transition: 'border-color 0.2s' }} 
                    onChange={e => setInscriptionData({...inscriptionData, nom_famille: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            {/* Champ Téléphone (Nouveau) */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px', fontWeight: '600' }}>Numéro de téléphone</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>📞</span>
                <input 
                  type="tel" 
                  placeholder="Ex: +223 70 00 00 00" 
                  style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '14px', color: '#1e293b' }} 
                  onChange={e => setInscriptionData({...inscriptionData, telephone: e.target.value})} 
                />
              </div>
            </div>

            {/* Champ Email - Optionnel (Nouveau) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>Adresse Email</label>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', marginLeft: 'auto' }}>Optionnel</span>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8', fontSize: '14px' }}>✉️</span>
                <input 
                  type="email" 
                  placeholder="exemple@gmail.com" 
                  style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '14px', color: '#1e293b' }} 
                  onChange={e => setInscriptionData({...inscriptionData, email: e.target.value})} 
                />
              </div>
            </div>

            {/* Champ Username */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px', fontWeight: '600' }}>Nom d'utilisateur</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={16} />
                <input 
                  type="text" 
                  placeholder="Boutique_Mali" 
                  style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '14px', color: '#1e293b' }} 
                  onChange={e => setInscriptionData({...inscriptionData, nom: e.target.value})} 
                />
              </div>
            </div>

            {/* Champ Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px', fontWeight: '600' }}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={16} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '14px', color: '#1e293b' }} 
                  onChange={e => setInscriptionData({...inscriptionData, motDePasse: e.target.value})} 
                />
              </div>
            </div>

            {/* Champ Confirmer Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px', fontWeight: '600' }}>Confirmer Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={16} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '14px', color: '#1e293b' }} 
                  onChange={e => setInscriptionData({...inscriptionData, confirmerMotDePasse: e.target.value})} 
                />
              </div>
            </div>

            {/* Bouton Créer */}
            <button 
              onClick={handleInscriptionAdmin}
              style={{ backgroundColor: '#0284c7', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '15px', marginTop: '10px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0369a1'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
            >
              Créer mon compte
            </button>

            {/* Lien retour */}
            <button 
              onClick={() => setModeInscription(false)} 
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px', textDecoration: 'none', fontWeight: '600', marginTop: '5px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0284c7'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
              Déjà un compte ? Se connecter
            </button>
          </div>

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '11px', marginTop: '25px', lineHeight: '1.6' }}>
            En créant un compte, vous acceptez nos <span style={{ color: '#0284c7', cursor: 'pointer', fontWeight: '500' }}>Conditions d'utilisation</span> et notre <span style={{ color: '#0284c7', cursor: 'pointer', fontWeight: '500' }}>Politique de confidentialité</span>.
          </p>
        </div>
      </div>
   );
  } 

  // --- FORMULAIRE DE CONNEXION (S'affiche si modeInscription est false) ---
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#2c3e50' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '350px' }}>
        
        {/* ================= ÉTAPE INTERFACE : CONNEXION NORMALE ================= */}
        {forgotPasswordStep === 'login' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ backgroundColor: '#e67e22', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 15px' }}>
                <Lock color="white" size={30} />
              </div>
              <h2 style={{ margin: 0, color: '#2c3e50' }}>Gestion Boutique</h2>
              <p style={{ color: '#7f8c8d', fontSize: '14px' }}>Connectez-vous pour continuer</p>
            </div>
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '10px', top: '12px', color: '#bdc3c7' }} size={18} />
                <input type="text" placeholder="Utilisateur" required style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
                  onChange={e => setLoginData({...loginData, nom_utilisateur: e.target.value})} />
              </div>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '10px', top: '12px', color: '#bdc3c7' }} size={18} />
                <input type="password" placeholder="Mot de passe" required style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
                  onChange={e => setLoginData({...loginData, mot_de_passe: e.target.value})} />
              </div>
              {loginError && <p style={{ color: '#e74c3c', fontSize: '12px', textAlign: 'center', margin: 0 }}>{loginError}</p>}
              <button type="submit" style={{ backgroundColor: '#e67e22', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                SE CONNECTER
              </button>
            </form>

            <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center' }}>
              <p style={{ color: '#7f8c8d', fontSize: '12px', margin: '0 0 8px 0' }}>Vous êtes propriétaire d'une boutique ?</p>
              <button 
                onClick={() => setModeInscription(true)} 
                style={{ background: 'none', border: 'none', color: '#e67e22', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline', marginBottom: '12px', display: 'block', width: '100%' }}
              >
                Créer mon compte Admin 
              </button>
              
              {/* Nouveau Lien Mot de passe oublié */}
              <button 
                onClick={() => { setForgotPasswordStep('identify'); setResetError(''); }} 
                style={{ background: 'none', border: 'none', color: '#ab9997', cursor: 'pointer', fontSize: '12px', textDecoration: 'none' }}
              >
                Mot de passe oublié ?
              </button>
            </div>
          </>
        )}
{/* ================= ÉTAPE INTERFACE : IDENTIFICATION COMPTE ================= */}
{forgotPasswordStep === 'identify' && (
  <>
    <div style={{ textAlign: 'center', marginBottom: '25px' }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Récupération de compte</h3>
      <p style={{ color: '#7f8c8d', fontSize: '13px', lineHeight: '1.4' }}>Entrez votre nom d'utilisateur pour identifier votre compte admin.</p>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ position: 'relative' }}>
        <User style={{ position: 'absolute', left: '10px', top: '12px', color: '#bdc3c7' }} size={18} />
        <input 
          type="text" 
          placeholder="Nom d'utilisateur" 
          value={forgotUsername}
          style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', outline: 'none' }} 
          onChange={e => setForgotUsername(e.target.value)} 
        />
      </div>

      {resetError && <p style={{ color: '#e74c3c', fontSize: '12px', textAlign: 'center', margin: 0 }}>{resetError}</p>}

      <button 
  onClick={async () => {
    if (forgotUsername.trim() === "") {
      setResetError("Veuillez saisir votre nom d'utilisateur");
      return;
    }

    try {
      // 1. Appel à la vraie route de ton API backend
      const response = await fetch(`http://localhost:5000/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom_utilisateur: forgotUsername })
      });

      const data = await response.json();

      if (response.ok) {
        // Si le compte existe et que le code a été généré/envoyé avec succès
        setForgotPasswordStep('verify');
        setResetError('');
      } else {
        // Si le serveur renvoie une erreur (Ex: "Utilisateur non trouvé")
        setResetError(data.message || "Ce nom d'utilisateur n'existe pas.");
      }

    } catch (error) {
      console.error("Erreur lors de la vérification :", error);
      setResetError("Impossible de joindre le serveur. Vérifiez que votre backend est démarré.");
    }
  }} 
  style={{ backgroundColor: '#e67e22', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
>
  Continuer
</button>
      <button 
        onClick={() => setForgotPasswordStep('login')} 
        style={{ background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
      >
        Annuler
      </button>
    </div>
  </>
)}

        {/* ================= ÉTAPE INTERFACE : CODE DE VALIDATION ================= */}
        {forgotPasswordStep === 'verify' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Code de vérification</h3>
              <p style={{ color: '#7f8c8d', fontSize: '13px', lineHeight: '1.4' }}>Un code de validation a été envoyé à l'adresse e-mail associée à votre compte.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Entrez le code à 6 chiffres" 
                  maxLength={6}
                  value={validationCode}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', outline: 'none', textAlign: 'center', fontSize: '16px', letterSpacing: '4px', fontWeight: 'bold' }} 
                  onChange={e => setValidationCode(e.target.value)} 
                />
              </div>

              {resetError && <p style={{ color: '#e74c3c', fontSize: '12px', textAlign: 'center', margin: 0 }}>{resetError}</p>}

         <button 
  onClick={async () => {
    if(validationCode.length < 6) {
      setResetError("Le code doit contenir 6 chiffres");
    } else {
      try {
        setResetError('');
        
        // On force l'adresse locale complète de ton serveur Node.js
        const response = await fetch('http://127.0.0.1:5000/api/auth/verify-recovery-code', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ code: validationCode })
        });

        // Si le serveur répond avec un code d'erreur (ex: 404, 500)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setResetError(errorData.message || `Erreur serveur (Code ${response.status})`);
          return;
        }

        const data = await response.json();

        if (data.success) {
          // Tout est bon, on passe à l'étape suivante !
          setForgotPasswordStep('new-password');
        } else {
          setResetError(data.message || "Code incorrect ou expiré.");
        }

      } catch (error) {
        // En cas de plantage réseau, on affiche le vrai message dans la console pour déboguer
        console.error("Détails de l'erreur réseau :", error);
        setResetError("Impossible de joindre le serveur. Vérifiez qu'il est bien démarré.");
      }
    }
  }} 
  style={{ backgroundColor: '#2ecc71', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
>
  Vérifier le code
</button>
              <button 
                onClick={() => setForgotPasswordStep('identify')} 
                style={{ background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', fontSize: '13px', }}
              >
                Retour
              </button>
            </div>
          </>
        )}
{/* ================= ÉTAPE INTERFACE : NOUVEAU MOT DE PASSE ================= */}
{/* ================= ÉTAPE INTERFACE : NOUVEAU MOT DE PASSE ================= */}
{forgotPasswordStep === 'new-password' && (
  <>
    <div style={{ textAlign: 'center', marginBottom: '25px' }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Nouveau mot de passe</h3>
      <p style={{ color: '#7f8c8d', fontSize: '13px', lineHeight: '1.4' }}>Définissez votre nouveau mot de passe d'accès.</p>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      {/* Champ : Nouveau mot de passe */}
      <div style={{ position: 'relative' }}>
        <input 
          type={showNewPassword ? "text" : "password"} 
          placeholder="Nouveau mot de passe" 
          value={newPassword}
          style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', outline: 'none', fontSize: '15px' }} 
          onChange={e => {
            setResetError('');
            setNewPassword(e.target.value);
          }} 
        />
        <span 
          onClick={() => setShowNewPassword(!showNewPassword)}
          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px', userSelect: 'none', color: '#7f8c8d' }}
        >
          {showNewPassword ? '🙈' : '👁️'}
        </span>
      </div>

      {/* Champ : Confirmer le mot de passe */}
      <div style={{ position: 'relative' }}>
        <input 
          type={showConfirmPassword ? "text" : "password"} 
          placeholder="Confirmer le mot de passe" 
          value={confirmPassword}
          style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', outline: 'none', fontSize: '15px' }} 
          onChange={e => {
            setResetError('');
            setConfirmPassword(e.target.value);
          }} 
        />
        <span 
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px', userSelect: 'none', color: '#7f8c8d' }}
        >
          {showConfirmPassword ? '🙈' : '👁️'}
        </span>
      </div>

      {resetError && <p style={{ color: '#e74c3c', fontSize: '12px', textAlign: 'center', margin: 0 }}>{resetError}</p>}

      <button 
        onClick={async () => {
          if (!newPassword || !confirmPassword) {
            setResetError("Veuillez remplir tous les champs");
          } else if (newPassword !== confirmPassword) {
            setResetError("Les mots de passe ne correspondent pas");
          } else if (newPassword.length < 4) {
            setResetError("Le mot de passe doit contenir au moins 4 caractères");
          } else {
            try {
              setResetError('');
              
              const response = await fetch('http://localhost:5000/api/auth/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  nom_utilisateur: forgotUsername, 
                  nouveau_mot_de_passe: newPassword
                })
              });

              const data = await response.json();

              if (data.success) {
                alert("Mot de passe modifié avec succès !");
                
                // 🟢 REMPLACE 'identify' PAR 'login' POUR RETOURNER DIRECTEMENT AU FORMULAIRE DE CONNEXION
                setForgotPasswordStep('login'); 
                
                // Nettoyage des champs pour la sécurité
                setNewPassword('');
                setConfirmPassword('');
                setForgotUsername('');
              } else {
                setResetError(data.message || "Une erreur est survenue.");
              }

            } catch (error) {
              console.error("Erreur réseau :", error);
              setResetError("Impossible de joindre le serveur.");
            }
          }
        }} 
        style={{ backgroundColor: '#3498db', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
      >
        Enregistrer le mot de passe
      </button>
  
      <button 
        onClick={() => setForgotPasswordStep('verify')} 
        style={{ background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', fontSize: '13px' }}
      >
        Retour
      </button>
    </div>
  </>
)}
</div>
</div>
 );

} 
// 1. Écran d'attente pendant que le serveur vérifie la date d'échéance
if (chargementAbonnement) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <h3>Vérification de la licence en cours...</h3>
    </div>
  );
}

// 2. BLOCAGE ABSOLU : Si l'abonnement n'est pas actif, on affiche l'interface restreinte divisée en deux
if (!abonnementValide) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', fontFamily: 'sans-serif', backgroundColor: stylesTheme?.fondApplication, color: stylesTheme?.textePrincipal, minHeight: '100vh', width: '100%', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      
      {/* BALISE DE STYLE INTERNE : GÈRE LE HOVER ET FORCE TOUT LE CONTENU ENFANT À S'ÉTIRER SANS AUCUNE RESTRICTION */}
      <style>{`
        .sidebar-btn {
          transition: all 0.2s ease-in-out !important;
        }
        .sidebar-btn:hover {
          background-color: #334155 !important;
          color: #f8fafc !important;
          padding-left: 22px !important;
        }
        .sidebar-btn-active:hover {
          opacity: 0.9 !important;
        }

        /* FORCE CHAQUE COMPOSANT, GRILLE, TABLEAU OU DIV INJECTÉ À PRENDRE 100% DE LA LARGEUR DISPONIBLE */
        .main-content-zone, 
        .main-content-zone > *, 
        .main-content-zone > div,
        .main-content-zone > section {
          width: 100% !important;
          max-width: 100% !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          box-sizing: border-box !important;
        }

        /* AJOUT DE L'ANIMATION DE REPLI DE LA SIDEBAR */
        .sidebar-toggle-zone {
          transition: all 0.3s ease-in-out !important;
        }
      `}</style>

      {/* CONTENEUR ENVELOPPE : IL RÉSERVE L'ESPACE AU SOL POUR QUE LA DROITE NE GLISSE JAMAIS EN DESSOUS */}
      <div className="no-print sidebar-toggle-zone" style={{
        width: isMenuOuvert ? '65px' : '280px',
        minWidth: isMenuOuvert ? '65px' : '280px',
        height: '100vh',
        position: 'relative'
      }}>
        
        {/* TA DIV DE NAVIGATION RESTE FIXÉE À L'ÉCRAN À 100% DANS SON ESPACE RÉSERVÉ */}
        <div style={{ 
          width: isMenuOuvert ? '65px' : '280px', 
          minWidth: isMenuOuvert ? '65px' : '280px',
          backgroundColor: '#0f172a', 
          padding: isMenuOuvert ? '20px 10px' : '30px 20px', 
          borderRight: '1px solid #1e293b', 
          boxShadow: '4px 0 15px rgba(0,0,0,0.05)',
          position: 'fixed', 
          left: '0',
          top: '0',        
          height: '100vh',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column', 
          justifyContent: 'flex-start',
          gap: '8px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}>
          {/* CONTAINER EN LIGNE : REGROUPE LE BURGER ET LA ZONE PROFIL (ZONE JAUNE) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #1e293b' }}>
            
            {/* 🍔 ZONE BURGER ET SAUVEGARDE PLACÉE TOUT EN HAUT À GAUCHE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: isMenuOuvert ? 'center' : 'flex-start', paddingLeft: isMenuOuvert ? '0px' : '5px' }}>
              <button 
                onClick={() => setIsMenuOuvert(!isMenuOuvert)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px', width: '24px', padding: '4px', boxSizing: 'border-box' }}
              >
                <span style={{ backgroundColor: '#38bdf8', height: '3px', width: '100%', borderRadius: '2px', transition: '0.3s' }}></span>
                <span style={{ backgroundColor: '#38bdf8', height: '3px', width: '100%', borderRadius: '2px', transition: '0.3s' }}></span>
                <span style={{ backgroundColor: '#38bdf8', height: '3px', width: '100%', borderRadius: '2px', transition: '0.3s' }}></span>
              </button>

              {/* 💾 BOUTON SAUVEGARDE MANUELLE AVEC CHARGEMENT SUBTIL */}
              <button
                onClick={async () => {
                  if (sauvegardeEnCours) return;
                  setSauvegardeEnCours(true);
                  try {
  const response = await fetch('http://localhost:5000/api/backup-manuel', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nomAdmin: user?.nom_utilisateur || 'Admin',
      idAdmin: user?.id // 🔥 Ajouté ici pour filtrer la sauvegarde uniquement sur cet admin
    })
  });
  
  if (response.ok) {
    alert("✓ Sauvegarde réussie ");
  } else {
    alert("✕ Erreur lors de la sauvegarde.");
  }
} catch (err) {
  console.error(err);
  alert("✕ Erreur de connexion avec le serveur.");
} finally {
  setSauvegardeEnCours(false);
}
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: sauvegardeEnCours ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '32px',
                  height: '32px',
                  transition: 'background 0.2s',
                }}
                title="Lancer une sauvegarde manuelle (Local & Email)"
                disabled={sauvegardeEnCours}
              >
                <Save 
                  size={18} 
                  color={sauvegardeEnCours ? '#94a3b8' : '#2ecc71'} 
                />

                {sauvegardeEnCours && (
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    background: '#1e293b',
                    borderRadius: '50%',
                    padding: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <RefreshCw 
                      size={10} 
                      color="#2ecc71" 
                      style={{ animation: 'spin 1s linear infinite' }}
                    />
                  </div>
                )}
              </button>

              {/* ☀️ / 🌙 BOUTON DE CHANGEMENT DE THÈME PLACÉ DANS LA ZONE ENTOURÉE EN ROUGE */}
              <button
                onClick={basculerTheme}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  transition: 'background 0.2s, transform 0.1s active',
                  fontSize: '16px'
                }}
                title={modeSombre ? "Passer au Mode Clair" : "Passer au Mode Sombre"}
              >
                {modeSombre ? '☀️' : '🌙'}
              </button>
            </div>

            {/* ZONE PROFIL */}
            <button 
              onClick={() => {
                setOngletActif('profil'); 
              }}
              style={{ 
                display: isMenuOuvert ? 'none' : 'flex', 
                alignItems: 'center', 
                gap: '10px',          
                paddingRight: '5px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                outline: 'none',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <span style={{ fontSize: '24px', color: '#38bdf8', display: 'flex', alignItems: 'center' }}>
                👤
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#f8fafc' }}>
                  {user?.nom_utilisateur || 'Mon Profil'}
                </span>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: '700', marginTop: '1px' }}>
                  {user?.role || 'Admin'}
                </span>
              </div>
            </button>

          </div>

          {/* BOUTONS DE NAVIGATION */}
          <button 
            onClick={() => setOngletActif('gestion')} 
            className={ongletActif === 'gestion' ? 'sidebar-btn-active' : 'sidebar-btn'}
            style={{ 
              width: '100%', textAlign: 'left', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', 
              backgroundColor: ongletActif === 'gestion' ? '#38bdf8' : 'transparent', 
              color: ongletActif === 'gestion' ? '#0f172a' : '#94a3b8', 
              fontWeight: '700', fontSize: '14px',
              whiteSpace: 'nowrap'
            }}
          >
            📦 {isMenuOuvert ? '' : 'STOCKS & CAISSE'}
          </button>
          
          <button 
            onClick={() => { setOngletActif('historique'); chargerHistorique(); }} 
            className={ongletActif === 'historique' ? 'sidebar-btn-active' : 'sidebar-btn'}
            style={{ 
              width: '100%', textAlign: 'left', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', 
              backgroundColor: ongletActif === 'historique' ? '#38bdf8' : 'transparent', 
              color: ongletActif === 'historique' ? '#0f172a' : '#94a3b8', 
              fontWeight: '700', fontSize: '14px',
              whiteSpace: 'nowrap'
            }}
          >
            📜 {isMenuOuvert ? '' : 'Journal'}
          </button>

          <button
            onClick={() => setOngletActif('facturation')}
            className={ongletActif === 'facturation' ? 'sidebar-btn-active' : 'sidebar-btn'}
            style={{
              width: '100%', textAlign: 'left', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', 
              backgroundColor: ongletActif === 'facturation' ? '#38bdf8' : 'transparent', 
              color: ongletActif === 'facturation' ? '#0f172a' : '#94a3b8', 
              fontWeight: '700', fontSize: '14px',
              whiteSpace: 'nowrap'
            }}
          >
            📄 {isMenuOuvert ? '' : 'Facturation'}
          </button>
          
          {user?.role === 'admin' && (
            <div 
              onClick={() => setOngletActif('gestion_produits')}
              className={ongletActif === 'gestion_produits' ? 'sidebar-btn-active' : 'sidebar-btn'}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px',
                backgroundColor: ongletActif === 'gestion_produits' ? '#3498db' : 'transparent',
                color: ongletActif === 'gestion_produits' ? 'white' : '#94a3b8',
                fontWeight: '700', fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              <Package size={18} />
              {isMenuOuvert ? '' : 'Gestion des produits'}
            </div>
          )}

          {user?.role === 'admin' && (
            <button 
              onClick={() => setOngletActif('archive')} 
              className={ongletActif === 'archive' ? 'sidebar-btn-active' : 'sidebar-btn'}
              style={{ 
                width: '100%', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', 
                backgroundColor: ongletActif === 'archive' ? '#e11d48' : 'transparent', 
                color: ongletActif === 'archive' ? 'white' : '#94a3b8', 
                fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px',
                whiteSpace: 'nowrap'
              }}
            >
              <Archive size={18} /> {isMenuOuvert ? '' : 'Archive'}
            </button>
          )}

          <button 
            onClick={() => {
              setOngletActif('credits');
              setSousOnglet('liste_credits');
            }} 
            className={ongletActif === 'credits' ? 'sidebar-btn-active' : 'sidebar-btn'}
            style={{ 
              width: '100%', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', 
              backgroundColor: ongletActif === 'credits' ? '#10b981' : 'transparent', 
              color: ongletActif === 'credits' ? 'white' : '#94a3b8', 
              fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            💳  {isMenuOuvert ? '' : 'Gestion crédits'}
          </button>

          {user?.role === 'admin' && (
            <button 
              onClick={() => setOngletActif('depenses')}
              className={ongletActif === 'depenses' ? 'nav-active sidebar-btn-active' : 'nav-button sidebar-btn'}
              style={{ 
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '8px', border: 'none',
                backgroundColor: ongletActif === 'depenses' ? '#f59e0b' : 'transparent',
                color: ongletActif === 'depenses' ? 'white' : '#94a3b8',
                fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <DollarSign size={18} /> {isMenuOuvert ? '' : '💸 Dépenses'}
            </button>
          )}
          
          {user?.role === 'admin' && (
            <button 
              onClick={() => { setOngletActif('dashboard'); chargerStats(); }} 
              className={ongletActif === 'dashboard' ? 'sidebar-btn-active' : 'sidebar-btn'}
              style={{ 
                width: '100%', textAlign: 'left', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', 
                backgroundColor: ongletActif === 'dashboard' ? '#10b981' : 'transparent', 
                color: ongletActif === 'dashboard' ? 'white' : '#94a3b8', 
                fontWeight: '700', fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              📊 {isMenuOuvert ? '' : 'Rapport Financier'}
            </button>
          )}

          {user?.role === 'admin' && (
            <button 
              onClick={() => setOngletActif('fournisseurs')} 
              className={ongletActif === 'fournisseurs' ? 'sidebar-btn-active' : 'sidebar-btn'}
              style={{ 
                width: '100%', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', 
                backgroundColor: ongletActif === 'fournisseurs' ? '#f97316' : 'transparent', 
                color: ongletActif === 'fournisseurs' ? 'white' : '#94a3b8', 
                fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px',
                whiteSpace: 'nowrap'
              }}
            >
              <Truck size={18} /> {isMenuOuvert ? '' : 'Fournisseurs'}
            </button>
          )}

          {user?.role === 'admin' && (
            <button 
              onClick={() => {
                setOngletActif('utilisateurs');
                setSousOnglet('menu'); 
              }} 
              className={ongletActif === 'utilisateurs' ? 'sidebar-btn-active' : 'sidebar-btn'}
              style={{ 
                width: '100%', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', 
                backgroundColor: ongletActif === 'utilisateurs' ? '#a855f7' : 'transparent', 
                color: ongletActif === 'utilisateurs' ? 'white' : '#94a3b8', 
                fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px',
                whiteSpace: 'nowrap'
              }}
            >
              <Users size={18} /> {isMenuOuvert ? '' : 'Utilisateurs'}
            </button>
          )}
          
          <div style={{ position: 'absolute', bottom: '50px', left: '16px', right: '16px' }}>
            <button 
              onClick={handleLogout} 
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: 'none', 
                color: '#ef4444', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '10px 14px', 
                borderRadius: '8px', 
                fontWeight: '700', 
                fontSize: '13px', 
                width: '100%',
                transition: '0.2s', 
                whiteSpace: 'nowrap' 
              }}
            >
              <LogOut size={16}/> {isMenuOuvert ? '' : 'Déconnexion'}
            </button>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '40px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '900px', fontFamily: 'sans-serif', textAlign: 'center' }}>
          
          {/* 1. SECTION PROFIL */}
          {ongletActif === 'profil' && (
            <div style={{ 
              padding: '40px 30px', 
              backgroundColor: stylesTheme.fondCartes, 
              borderRadius: '16px', 
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)', 
              maxWidth: '650px', 
              margin: '30px auto',
              border: `1px solid ${stylesTheme.bordures}`
            }}>
              
              {/* En-tête du Profil */}
              <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                <div style={{ 
                  width: '90px', 
                  height: '90px', 
                  background: stylesTheme.fondApplication, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 15px auto',
                  border: '2px solid #38bdf8',
                  boxShadow: '0 0 15px rgba(56, 189, 248, 0.15)'
                }}>
                  <span style={{ fontSize: '42px' }}>👤</span>
                </div>
                <h2 style={{ margin: '0', color: stylesTheme.textePrincipal, fontSize: '26px', fontWeight: '600', letterSpacing: '-0.5px' }}>
                  {user?.prenom || user?.nom_reel ? `${user?.prenom || ''} ${user?.nom_reel || ''}`.trim() : (user?.nom_utilisateur || 'Mon Profil')}
                </h2>
                <p style={{ margin: '6px 0 0 0', color: stylesTheme.texteSecondaire, fontSize: '14px' }}>Gestion des accès et informations personnelles</p>
              </div>

              {/* Grille d'informations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Ligne : Identité */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 20px', backgroundColor: stylesTheme.fondApplication, borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}` }}>
                  <span style={{ fontSize: '20px', color: '#38bdf8', display: 'flex', alignItems: 'center' }}>🪪</span>
                  <div style={{ display: 'flex', flex: 1, gap: '20px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ color: stylesTheme.texteSecondaire, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prénom</span>
                      <span style={{ color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '500', marginTop: '2px' }}>
                        {user?.prenom || 'Non renseigné'}
                      </span>
                    </div>
                    <div style={{ width: '1px', backgroundColor: stylesTheme.bordures, height: '35px' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ color: stylesTheme.texteSecondaire, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nom</span>
                      <span style={{ color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '500', marginTop: '2px' }}>
                        {user?.nom_reel && user.nom_reel !== user.nom_utilisateur ? user.nom_reel : 'Non renseigné'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ligne : Téléphone */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 20px', backgroundColor: stylesTheme.fondApplication, borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}` }}>
                  <span style={{ fontSize: '20px', color: '#38bdf8' }}>📞</span>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ color: stylesTheme.texteSecondaire, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Numéro de téléphone</span>
                    <span style={{ color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '500', marginTop: '2px' }}>
                      {user?.telephone || user?.phone || 'Non renseigné'}
                    </span>
                  </div>
                </div>

                {/* Ligne : Email */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 20px', backgroundColor: stylesTheme.fondApplication, borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}` }}>
                  <span style={{ fontSize: '20px', color: '#38bdf8' }}>✉️</span>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ color: stylesTheme.texteSecondaire, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Adresse Email</span>
                    <span style={{ color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '500', marginTop: '2px' }}>
                      {user?.email || 'Non renseignée'}
                    </span>
                  </div>
                </div>

                {/* Ligne : Nom d'utilisateur */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 20px', backgroundColor: stylesTheme.fondApplication, borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}` }}>
                  <span style={{ fontSize: '20px', color: '#38bdf8' }}>💻</span>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ color: stylesTheme.texteSecondaire, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nom d'utilisateur</span>
                    <span style={{ color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '500', marginTop: '2px' }}>
                      {user?.nom_utilisateur || user?.nom || 'Non défini'}
                    </span>
                  </div>
                </div>

                {/* Ligne : Rôle Système */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: stylesTheme.fondApplication, borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '20px', color: '#38bdf8' }}>🛡️</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: stylesTheme.texteSecondaire, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Habilitation</span>
                      <span style={{ color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '500', marginTop: '2px' }}>Privilège Système</span>
                    </div>
                  </div>
                  <span style={{ 
                    backgroundColor: 'rgba(56, 189, 248, 0.1)', 
                    color: '#0284c7', 
                    padding: '6px 14px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: '700', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    border: '1px solid rgba(56, 189, 248, 0.2)'
                  }}>
                    {user?.role || 'Admin'}
                  </span>
                </div>

             {/* MODIFICATION ICI : Gestion de l'affichage dynamique (Actif vs Expiré) */}
                {user?.role === 'admin' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 20px', backgroundColor: stylesTheme.fondApplication, borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}` }}>
                    <span style={{ fontSize: '20px', color: dateEcheance && !messageValidation?.includes('expiré') ? '#c026d3' : '#ef4444' }}>📅</span>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ color: stylesTheme.texteSecondaire, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Validité du Logiciel</span>
                      <span style={{ color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '700', marginTop: '2px' }}>
                        {dateEcheance ? (
                          <>Abonnement actif jusqu'au : <span style={{ color: '#c026d3' }}>{dateEcheance}</span></>
                        ) : (
                          <>État de la licence : <span style={{ color: '#ef4444' }}>Licence expirée</span></>
                        )}
                      </span>
                    </div>
                  </div>
                )}
                {/* Bouton de retour */}
                <button 
                  onClick={() => setOngletActif('gestion')} 
                  style={{ 
                    marginTop: '20px', backgroundColor: 'transparent', color: stylesTheme.texteSecondaire, padding: '14px', border: `1px solid ${stylesTheme.bordures}`, borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease-in-out', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = stylesTheme.fondApplication;
                    e.currentTarget.style.color = stylesTheme.textePrincipal;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = stylesTheme.texteSecondaire;
                  }}
                >
                  <span>←</span> Retour au tableau de bord
                </button>
              </div>
            </div>
          )}

          {/* SÉCURITÉ : On cache TOUT ce qui suit si l'onglet actif est 'profil' */}
          {ongletActif !== 'profil' && (
            <>
              {sousOnglet !== 'abonnement' ? (
                /* 2. MESSAGE D'EXPIRATION CLASSIQUE */
                <div style={{ margin: '100px auto', maxWidth: '500px' }}>
                  <span style={{ fontSize: '80px' }}>⚠️</span>
                  <h2>Votre code d'activation / licence a expiré</h2>
                  <p style={{ color: '#64748b', maxWidth: '500px', fontSize: '15px', lineHeight: '1.6', marginBottom: '25px' }}>
                    L'accès aux fonctionnalités du système a été suspendu. Veuillez contacter votre administrateur ou renouveler votre clé produit pour débloquer l'application.
                  </p>
                  
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => setSousOnglet('abonnement')}
                      style={{ backgroundColor: '#c026d3', color: 'white', border: 'none', padding: '12px 24px', fontSize: '15px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', marginTop: '15px', transition: 'background-color 0.2s' }}
                    >
                      Prendre un abonnement / Saisir une clé
                    </button>
                  )}
                </div>
              ) : (
                /* 3. INTERFACE DE GESTION DES FORFAITS (S'affiche uniquement si sousOnglet === 'abonnement') */
                <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  <div style={{ marginBottom: '35px', textAlign: 'left' }}>
                    <h2 style={{ color: stylesTheme?.textePrincipal, margin: 0, fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      Consulter / Gérer vos Forfaits
                    </h2>
                    <p style={{ color: stylesTheme?.texteSecondaire, margin: '5px 0 0 0', fontSize: '14px' }}>
                      Sélectionnez un forfait pour inscrire ou renouveler votre licence d'utilisation.
                    </p>
                  </div>

                  {/* GLISSIÈRE DES CARTES */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginBottom: '35px' }}>
                    <div onClick={() => setForfaitSelectionne('1_mois')} style={{ width: '220px', backgroundColor: stylesTheme?.fondCartes, borderRadius: '16px', padding: '30px 20px', border: forfaitSelectionne === '1_mois' ? '2px solid #c026d3' : `1px solid ${stylesTheme?.bordures}`, boxShadow: forfaitSelectionne === '1_mois' ? '0 10px 20px rgba(192, 38, 211, 0.1)' : '0 4px 15px rgba(0,0,0,0.02)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease' }}>
                      <h3 style={{ color: stylesTheme?.textePrincipal, margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>1 Mois</h3>
                      <p style={{ color: stylesTheme?.texteSecondaire, fontSize: '13px', margin: 0 }}>Formule Mensuelle</p>
                    </div>

                    <div onClick={() => setForfaitSelectionne('3_mois')} style={{ width: '220px', backgroundColor: stylesTheme?.fondCartes, borderRadius: '16px', padding: '30px 20px', border: forfaitSelectionne === '3_mois' ? '2px solid #c026d3' : `1px solid ${stylesTheme?.bordures}`, boxShadow: forfaitSelectionne === '3_mois' ? '0 10px 20px rgba(192, 38, 211, 0.1)' : '0 4px 15px rgba(0,0,0,0.02)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease' }}>
                      <h3 style={{ color: stylesTheme?.textePrincipal, margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>3 Mois</h3>
                      <p style={{ color: stylesTheme?.texteSecondaire, fontSize: '13px', margin: 0 }}>Formule Trimestrielle</p>
                    </div>

                    <div onClick={() => setForfaitSelectionne('1_an')} style={{ width: '220px', backgroundColor: stylesTheme?.fondCartes, borderRadius: '16px', padding: '30px 20px', border: forfaitSelectionne === '1_an' ? '2px solid #c026d3' : `1px solid ${stylesTheme?.bordures}`, boxShadow: forfaitSelectionne === '1_an' ? '0 12px 24px rgba(192, 38, 211, 0.15)' : '0 4px 15px rgba(0,0,0,0.02)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease' }}>
                      <h3 style={{ color: stylesTheme?.textePrincipal, margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>1 Année</h3>
                      <p style={{ color: stylesTheme?.texteSecondaire, fontSize: '13px', margin: 0 }}>Formule Annuelle</p>
                    </div>

                    <div onClick={() => setForfaitSelectionne('a_vie')} style={{ width: '220px', backgroundColor: stylesTheme?.fondCartes, borderRadius: '16px', padding: '30px 20px', border: forfaitSelectionne === 'a_vie' ? '2px solid #8b5cf6' : `1px solid ${stylesTheme?.bordures}`, boxShadow: forfaitSelectionne === 'a_vie' ? '0 10px 20px rgba(139, 92, 246, 0.15)' : '0 4px 15px rgba(0,0,0,0.02)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease' }}>
                      <h3 style={{ color: stylesTheme?.textePrincipal, margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>À Vie</h3>
                      <p style={{ color: stylesTheme?.texteSecondaire, fontSize: '13px', margin: 0 }}>Accès Illimité (VIP)</p>
                    </div>
                  </div>

                  {/* ENTRÉE FORMULAIRE CLÉ */}
                  <div style={{ backgroundColor: stylesTheme?.fondCartes, borderRadius: '24px', border: `1px solid ${stylesTheme?.bordures}`, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '45px 30px', maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: forfaitSelectionne ? '25px' : '0' }}>
                      <button disabled={!forfaitSelectionne || chargementCle} onClick={demanderCleActivation} style={{ background: forfaitSelectionne ? 'linear-gradient(135deg, #d946ef 0%, #c026d3 100%)' : stylesTheme?.bordures, color: forfaitSelectionne ? '#ffffff' : stylesTheme?.texteSecondaire, border: 'none', padding: '16px 36px', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: forfaitSelectionne ? 'pointer' : 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        {chargementCle ? <>⏳ Envoi de la demande...</> : <>✨ Demander une clé d'activation</>}
                      </button>

                      {statutMessage && (
                        <p style={{ color: statutMessage.includes('❌') || statutMessage.includes('erreur') ? '#ef4444' : '#27ae60', fontSize: '14px', fontWeight: '600', margin: 0, backgroundColor: statutMessage.includes('❌') ? 'rgba(239, 68, 68, 0.05)' : 'rgba(39, 174, 96, 0.05)', padding: '8px 16px', borderRadius: '20px' }}>
                          {statutMessage}
                        </p>
                      )}
                    </div>

                    {forfaitSelectionne && (
                      <div style={{ width: '80%', height: '1px', backgroundColor: stylesTheme?.bordures, margin: '15px 0 30px 0', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: stylesTheme?.fondCartes, padding: '0 15px', color: stylesTheme?.texteSecondaire, fontSize: '12px' }}>OU</span>
                      </div>
                    )}

                    {forfaitSelectionne ? (
                      <div style={{ width: '100%', maxWidth: '460px', padding: '25px', border: `1px solid ${stylesTheme?.bordures}`, borderRadius: '20px' }}>
                        <h4 style={{ color: stylesTheme?.textePrincipal, margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700' }}>🔑 Saisir la clé d'activation</h4>
                        <p style={{ color: stylesTheme?.texteSecondaire, fontSize: '12px', margin: '0 0 20px 0' }}>Entrez le code à 12 caractères reçu.</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                          <input type="text" maxLength={12} value={cleSaisieUtilisateur} onChange={(e) => setCleSaisieUtilisateur(e.target.value)} style={{ padding: '13px 16px', borderRadius: '12px', border: `1.5px solid ${stylesTheme?.bordures}`, backgroundColor: stylesTheme?.fondCartes, color: stylesTheme?.textePrincipal, fontSize: '16px', fontWeight: '700', letterSpacing: '2px', textAlign: 'center', width: '65%', textTransform: 'uppercase' }} />
                          <button onClick={validerCleActivation} style={{ backgroundColor: '#27ae60', color: '#ffffff', border: 'none', padding: '13px 22px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Vérifier</button>
                        </div>
                        {messageValidation && (
                          <div style={{ marginTop: '15px', padding: '10px', borderRadius: '10px', backgroundColor: messageValidation.includes('incorrect') ? 'rgba(239, 68, 68, 0.08)' : 'rgba(39, 174, 96, 0.08)', color: messageValidation.includes('incorrect') ? '#ef4444' : '#27ae60', fontSize: '13px', fontWeight: '700' }}>
                            {messageValidation}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ color: stylesTheme?.texteSecondaire, fontSize: '13px' }}>
                        💡 <i>Veuillez sélectionner un forfait ci-dessus pour débloquer les options d'activation.</i>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>     
    </div>
  );
}

  return (
<div style={{ display: 'flex', flexDirection: 'row', fontFamily: 'sans-serif', backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, minHeight: '100vh', width: '100%', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      
      {/* BALISE DE STYLE INTERNE : GÈRE LE HOVER ET FORCE TOUT LE CONTENU ENFANT À S'ÉTIRER SANS AUCUNE RESTRICTION */}
      <style>{`
        .sidebar-btn {
          transition: all 0.2s ease-in-out !important;
        }
        .sidebar-btn:hover {
          background-color: #334155 !important;
          color: #f8fafc !important;
          padding-left: 22px !important;
        }
        .sidebar-btn-active:hover {
          opacity: 0.9 !important;
        }

        /* FORCE CHAQUE COMPOSANT, GRILLE, TABLEAU OU DIV INJECTÉ À PRENDRE 100% DE LA LARGEUR DISPONIBLE */
        .main-content-zone, 
        .main-content-zone > *, 
        .main-content-zone > div,
        .main-content-zone > section {
          width: 100% !important;
          max-width: 100% !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          box-sizing: border-box !important;
        }

        /* AJOUT DE L'ANIMATION DE REPLI DE LA SIDEBAR */
        .sidebar-toggle-zone {
          transition: all 0.3s ease-in-out !important;
        }
      `}</style>

      {/* CONTENEUR ENVELOPPE : IL RÉSERVE L'ESPACE AU SOL POUR QUE LA DROITE NE GLISSE JAMAIS EN DESSOUS */}
      <div className="no-print sidebar-toggle-zone" style={{
        width: isMenuOuvert ? '65px' : '280px',
        minWidth: isMenuOuvert ? '65px' : '280px',
        height: '100vh',
        position: 'relative'
      }}>
        
        {/* TA DIV DE NAVIGATION RESTE FIXÉE À L'ÉCRAN À 100% DANS SON ESPACE RÉSERVÉ */}
        <div style={{ 
          width: isMenuOuvert ? '65px' : '280px', 
          minWidth: isMenuOuvert ? '65px' : '280px',
          backgroundColor: '#0f172a', 
          padding: isMenuOuvert ? '20px 10px' : '30px 20px', 
          borderRight: '1px solid #1e293b', 
          boxShadow: '4px 0 15px rgba(0,0,0,0.05)',
          position: 'fixed', 
          left: '0',
          top: '0',        
          height: '100vh',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column', 
          justifyContent: 'flex-start',
          gap: '8px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}>
       {/* CONTAINER EN LIGNE : REGROUPE LE BURGER ET LA ZONE PROFIL (ZONE JAUNE) */}
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #1e293b' }}>
  
  {/* 🍔 ZONE BURGER ET SAUVEGARDE PLACÉE TOUT EN HAUT À GAUCHE */}
<div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: isMenuOuvert ? 'center' : 'flex-start', paddingLeft: isMenuOuvert ? '0px' : '5px' }}>
  <button 
    onClick={() => setIsMenuOuvert(!isMenuOuvert)}
    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px', width: '24px', padding: '4px', boxSizing: 'border-box' }}
  >
    <span style={{ backgroundColor: '#38bdf8', height: '3px', width: '100%', borderRadius: '2px', transition: '0.3s' }}></span>
    <span style={{ backgroundColor: '#38bdf8', height: '3px', width: '100%', borderRadius: '2px', transition: '0.3s' }}></span>
    <span style={{ backgroundColor: '#38bdf8', height: '3px', width: '100%', borderRadius: '2px', transition: '0.3s' }}></span>
  </button>

  {/* 💾 BOUTON SAUVEGARDE MANUELLE AVEC CHARGEMENT SUBTIL */}
  <button
    onClick={async () => {
      if (sauvegardeEnCours) return;
      setSauvegardeEnCours(true);
      try {
  const response = await fetch('http://localhost:5000/api/backup-manuel', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nomAdmin: user?.nom_utilisateur || 'Admin',
      idAdmin: user?.id // 🔥 Ajouté ici pour filtrer la sauvegarde uniquement sur cet admin
    })
  });
  
  if (response.ok) {
    alert("✓ Sauvegarde réussie ");
  } else {
    alert("✕ Erreur lors de la sauvegarde.");
  }
} catch (err) {
  console.error(err);
  alert("✕ Erreur de connexion avec le serveur.");
} finally {
  setSauvegardeEnCours(false);
}
    }}
    style={{
      background: 'rgba(255, 255, 255, 0.08)',
      border: 'none',
      borderRadius: '6px',
      padding: '6px',
      cursor: sauvegardeEnCours ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative', // Nécessaire pour positionner le petit rond de chargement en surimpression
      width: '32px',
      height: '32px',
      transition: 'background 0.2s',
    }}
    title="Lancer une sauvegarde manuelle (Local & Email)"
    disabled={sauvegardeEnCours}
  >
    {/* L'icône de disquette principale reste fixe et ne tourne JAMAIS */}
    <Save 
      size={18} 
      color={sauvegardeEnCours ? '#94a3b8' : '#2ecc71'} 
    />

    {/* Le petit rond de chargement qui apparaît en bas à droite uniquement pendant la sauvegarde */}
    {sauvegardeEnCours && (
      <div style={{
        position: 'absolute',
        bottom: '2px',
        right: '2px',
        background: '#1e293b', // Fond sombre pour masquer l'arrière de la disquette
        borderRadius: '50%',
        padding: '1px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <RefreshCw 
          size={10} 
          color="#2ecc71" 
          style={{ animation: 'spin 1s linear infinite' }} // Seul ce petit logo tourne !
        />
      </div>
    )}
  </button>

  {/* ☀️ / 🌙 BOUTON DE CHANGEMENT DE THÈME PLACÉ DANS LA ZONE ENTOURÉE EN ROUGE */}
  <button
    onClick={basculerTheme}
    style={{
      background: 'rgba(255, 255, 255, 0.08)',
      border: 'none',
      borderRadius: '6px',
      padding: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '32px',
      height: '32px',
      transition: 'background 0.2s, transform 0.1s active',
      fontSize: '16px'
    }}
    title={modeSombre ? "Passer au Mode Clair" : "Passer au Mode Sombre"}
  >
    {modeSombre ? '☀️' : '🌙'}
  </button>
</div>

  {/* 💡 MODIFICATION ICI : setOngletActif au lieu de setVueActuelle */}
  <button 
    onClick={() => {
      setOngletActif('profil'); 
    }}
    style={{ 
      display: isMenuOuvert ? 'none' : 'flex', 
      alignItems: 'center', 
      gap: '10px',          
      paddingRight: '5px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      outline: 'none',
      transition: 'opacity 0.2s'
    }}
    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
  >
    <span style={{ fontSize: '24px', color: '#38bdf8', display: 'flex', alignItems: 'center' }}>
      👤
    </span>

    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
      <span style={{ fontSize: '14px', fontWeight: '500', color: '#f8fafc' }}>
        {user?.nom_utilisateur || 'Mon Profil'}
      </span>
      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: '700', marginTop: '1px' }}>
        {user?.role || 'Admin'}
      </span>
    </div>
  </button>

</div>
         {/* BOUTONS DE NAVIGATION */}
          <button 
            onClick={() => setOngletActif('gestion')} 
            className={ongletActif === 'gestion' ? 'sidebar-btn-active' : 'sidebar-btn'}
            style={{ 
              width: '100%', textAlign: 'left', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', 
              backgroundColor: ongletActif === 'gestion' ? '#38bdf8' : 'transparent', 
              color: ongletActif === 'gestion' ? '#0f172a' : '#94a3b8', 
              fontWeight: '700', fontSize: '14px',
              whiteSpace: 'nowrap'
            }}
          >
            📦 {isMenuOuvert ? '' : 'STOCKS & CAISSE'}
          </button>
          
          <button 
            onClick={() => { setOngletActif('historique'); chargerHistorique(); }} 
            className={ongletActif === 'historique' ? 'sidebar-btn-active' : 'sidebar-btn'}
            style={{ 
              width: '100%', textAlign: 'left', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', 
              backgroundColor: ongletActif === 'historique' ? '#38bdf8' : 'transparent', 
              color: ongletActif === 'historique' ? '#0f172a' : '#94a3b8', 
              fontWeight: '700', fontSize: '14px',
              whiteSpace: 'nowrap'
            }}
          >
            📜 {isMenuOuvert ? '' : 'Journal'}
          </button>

          <button
            onClick={() => setOngletActif('facturation')}
            className={ongletActif === 'facturation' ? 'sidebar-btn-active' : 'sidebar-btn'}
            style={{
              width: '100%', textAlign: 'left', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', 
              backgroundColor: ongletActif === 'facturation' ? '#38bdf8' : 'transparent', 
              color: ongletActif === 'facturation' ? '#0f172a' : '#94a3b8', 
              fontWeight: '700', fontSize: '14px',
              whiteSpace: 'nowrap'
            }}
          >
            📄 {isMenuOuvert ? '' : 'Facturation'}
          </button>
          
          {user?.role === 'admin' && (
            <div 
              onClick={() => setOngletActif('gestion_produits')}
              className={ongletActif === 'gestion_produits' ? 'sidebar-btn-active' : 'sidebar-btn'}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px',
                backgroundColor: ongletActif === 'gestion_produits' ? '#3498db' : 'transparent',
                color: ongletActif === 'gestion_produits' ? 'white' : '#94a3b8',
                fontWeight: '700', fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              <Package size={18} />
              {isMenuOuvert ? '' : 'Gestion des produits'}
            </div>
          )}
          {user?.role === 'admin' && (
            <button 
              onClick={() => setOngletActif('archive')} 
              className={ongletActif === 'archive' ? 'sidebar-btn-active' : 'sidebar-btn'}
              style={{ 
                width: '100%', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', 
                backgroundColor: ongletActif === 'archive' ? '#e11d48' : 'transparent', 
                color: ongletActif === 'archive' ? 'white' : '#94a3b8', 
                fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px',
                whiteSpace: 'nowrap'
              }}
            >
              <Archive size={18} /> {isMenuOuvert ? '' : 'Archive'}
            </button>
          )}
          {/* 💳 NOUVEL ONGLET : GESTION DES CRÉDITS (ACCESSIBLE À TOUS SANS CONDITION DE RÔLE) */}
          <button 
           onClick={() => {
  setOngletActif('credits');
  setSousOnglet('liste_credits');
}} 
            className={ongletActif === 'credits' ? 'sidebar-btn-active' : 'sidebar-btn'}
            style={{ 
              width: '100%', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', 
              backgroundColor: ongletActif === 'credits' ? '#10b981' : 'transparent', // Un joli vert émeraude pour la gestion de l'argent
              color: ongletActif === 'credits' ? 'white' : '#94a3b8', 
              fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            💳  {isMenuOuvert ? '' : 'Gestion crédits'}
          </button>
          {user?.role === 'admin' && (
            <button 
              onClick={() => setOngletActif('depenses')}
              className={ongletActif === 'depenses' ? 'nav-active sidebar-btn-active' : 'nav-button sidebar-btn'}
              style={{ 
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '8px', border: 'none',
                backgroundColor: ongletActif === 'depenses' ? '#f59e0b' : 'transparent',
                color: ongletActif === 'depenses' ? 'white' : '#94a3b8',
                fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <DollarSign size={18} /> {isMenuOuvert ? '' : '💸 Dépenses'}
            </button>
          )}
          
          {user?.role === 'admin' && (
            <button 
              onClick={() => { setOngletActif('dashboard'); chargerStats(); }} 
              className={ongletActif === 'dashboard' ? 'sidebar-btn-active' : 'sidebar-btn'}
              style={{ 
                width: '100%', textAlign: 'left', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', 
                backgroundColor: ongletActif === 'dashboard' ? '#10b981' : 'transparent', 
                color: ongletActif === 'dashboard' ? 'white' : '#94a3b8', 
                fontWeight: '700', fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              📊 {isMenuOuvert ? '' : 'Rapport Financier'}
            </button>
          )}

          {/* ONGLET FOURNISSEURS */}
          {user?.role === 'admin' && (
            <button 
              onClick={() => setOngletActif('fournisseurs')} 
              className={ongletActif === 'fournisseurs' ? 'sidebar-btn-active' : 'sidebar-btn'}
              style={{ 
                width: '100%', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', 
                backgroundColor: ongletActif === 'fournisseurs' ? '#f97316' : 'transparent', 
                color: ongletActif === 'fournisseurs' ? 'white' : '#94a3b8', 
                fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px',
                whiteSpace: 'nowrap'
              }}
            >
              <Truck size={18} /> {isMenuOuvert ? '' : 'Fournisseurs'}
            </button>
          )}

          {user?.role === 'admin' && (
  <button 
    onClick={() => {
      setOngletActif('utilisateurs');
      setSousOnglet('menu'); // 🔥 LA CORRECTION EST ICI : On force l'affichage de ton menu à choix !
    }} 
    className={ongletActif === 'utilisateurs' ? 'sidebar-btn-active' : 'sidebar-btn'}
    style={{ 
      width: '100%', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', 
      backgroundColor: ongletActif === 'utilisateurs' ? '#a855f7' : 'transparent', 
      color: ongletActif === 'utilisateurs' ? 'white' : '#94a3b8', 
      fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px',
      whiteSpace: 'nowrap'
    }}
  >
    <Users size={18} /> {isMenuOuvert ? '' : 'Utilisateurs'}
  </button>
)}
          
          <div style={{ position: 'absolute', bottom: '50px', left: '16px', right: '16px' }}>
            <button 
              onClick={handleLogout} 
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: 'none', 
                color: '#ef4444', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '10px 14px', 
                borderRadius: '8px', 
                fontWeight: '700', 
                fontSize: '13px', 
                width: '100%',
                transition: '0.2s', 
                whiteSpace: 'nowrap' 
              }}
            >
              <LogOut size={16}/> {isMenuOuvert ? '' : 'Déconnexion'}
            </button>
          </div>
        </div>
      </div>

      {/* ZONE DU CONTENU PRINCIPAL À DROITE (Totalement libre et alignée, ne glisse plus jamais dessous) */}
      <div className="main-content-zone" style={{ flex: 1, padding: '25px', overflowY: 'auto', minWidth: '0', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        {/* Vos vues d'onglets s'affichent automatiquement ici */}
      



{/* ================= ZONE AFFICHAGE : MON PROFIL (CORRIGÉE & THÉMABLE) ================= */}
{ongletActif === 'profil' && (() => {
  // 💡 Aucune fonction, aucun useState, aucun useEffect ici. Tout est placé en haut du composant parent.

  return (
    <div style={{ 
      padding: '40px 30px', 
      backgroundColor: stylesTheme.fondCartes, 
      borderRadius: '16px', 
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)', 
      maxWidth: '650px', 
      margin: '30px auto',
      border: `1px solid ${stylesTheme.bordures}`
    }}>
      
      {/* En-tête du Profil */}
      <div style={{ textAlign: 'center', marginBottom: '35px' }}>
        <div style={{ 
          width: '90px', 
          height: '90px', 
          background: stylesTheme.fondApplication, 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 15px auto',
          border: '2px solid #38bdf8',
          boxShadow: '0 0 15px rgba(56, 189, 248, 0.15)'
        }}>
          <span style={{ fontSize: '42px' }}>👤</span>
        </div>
        <h2 style={{ margin: '0', color: stylesTheme.textePrincipal, fontSize: '26px', fontWeight: '600', letterSpacing: '-0.5px' }}>
          {enModeEdition ? (
            `${formProfil.prenom} ${formProfil.nom_reel}`.trim() || 'Modification...'
          ) : (
            user?.prenom || user?.nom_reel ? `${user?.prenom || ''} ${user?.nom_reel || ''}`.trim() : (user?.nom_utilisateur || 'Mon Profil')
          )}
        </h2>
        <p style={{ margin: '6px 0 0 0', color: stylesTheme.texteSecondaire, fontSize: '14px' }}>Gestion des accès et informations personnelles</p>
      </div>

      {/* Grille d'informations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Ligne : Identité (Prénom & Nom) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 20px', backgroundColor: stylesTheme.fondApplication, borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}` }}>
          <span style={{ fontSize: '20px', color: '#38bdf8', display: 'flex', alignItems: 'center' }}>🪪</span>
          
          <div style={{ display: 'flex', flex: 1, gap: '20px', alignItems: 'center' }}>
            {/* Bloc Prénom */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ color: stylesTheme.texteSecondaire, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prénom</span>
              {enModeEdition ? (
                <input 
                  type="text" 
                  value={formProfil.prenom} 
                  onChange={(e) => gererChangementInput('prenom', e.target.value)}
                  style={{ backgroundColor: 'transparent', border: 'none', color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '500', marginTop: '2px', outline: 'none', width: '100%', padding: '2px 0' }}
                />
              ) : (
                <span style={{ color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '500', marginTop: '2px' }}>
                  {user?.prenom || 'Non renseigné'}
                </span>
              )}
            </div>

            {/* Ligne de séparation verticale */}
            <div style={{ width: '1px', backgroundColor: stylesTheme.bordures, height: '35px' }}></div>

            {/* Bloc Nom */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ color: stylesTheme.texteSecondaire, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nom</span>
              {enModeEdition ? (
                <input 
                  type="text" 
                  value={formProfil.nom_reel} 
                  onChange={(e) => gererChangementInput('nom_reel', e.target.value)}
                  style={{ backgroundColor: 'transparent', border: 'none', color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '500', marginTop: '2px', outline: 'none', width: '100%', padding: '2px 0' }}
                />
              ) : (
                <span style={{ color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '500', marginTop: '2px' }}>
                  {user?.nom_reel && user.nom_reel !== user.nom_utilisateur ? user.nom_reel : 'Non renseigné'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Ligne : Téléphone */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 20px', backgroundColor: stylesTheme.fondApplication, borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}` }}>
          <span style={{ fontSize: '20px', color: '#38bdf8' }}>📞</span>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ color: stylesTheme.texteSecondaire, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Numéro de téléphone</span>
            {enModeEdition ? (
              <input 
                type="text" 
                value={formProfil.telephone} 
                onChange={(e) => gererChangementInput('telephone', e.target.value)}
                style={{ backgroundColor: 'transparent', border: 'none', color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '500', marginTop: '2px', outline: 'none', width: '100%', padding: '2px 0' }}
              />
            ) : (
              <span style={{ color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '500', marginTop: '2px' }}>
                {user?.telephone || user?.phone || 'Non renseigné'}
              </span>
            )}
          </div>
        </div>

        {/* Ligne : Email */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 20px', backgroundColor: stylesTheme.fondApplication, borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}` }}>
          <span style={{ fontSize: '20px', color: '#38bdf8' }}>✉️</span>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ color: stylesTheme.texteSecondaire, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Adresse Email</span>
            {enModeEdition ? (
              <input 
                type="email" 
                value={formProfil.email} 
                onChange={(e) => gererChangementInput('email', e.target.value)}
                style={{ backgroundColor: 'transparent', border: 'none', color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '500', marginTop: '2px', outline: 'none', width: '100%', padding: '2px 0' }}
              />
            ) : (
              <span style={{ color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '500', marginTop: '2px' }}>
                {user?.email || 'Non renseignée'}
              </span>
            )}
          </div>
        </div>

        {/* Ligne : Nom d'utilisateur */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 20px', backgroundColor: stylesTheme.fondApplication, borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}` }}>
          <span style={{ fontSize: '20px', color: '#38bdf8' }}>💻</span>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ color: stylesTheme.texteSecondaire, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nom d'utilisateur</span>
            <span style={{ color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '500', marginTop: '2px' }}>
              {user?.nom_utilisateur || user?.nom || 'Non défini'}
            </span>
          </div>
        </div>

        {/* Ligne : Rôle Système */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: stylesTheme.fondApplication, borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '20px', color: '#38bdf8' }}>🛡️</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: stylesTheme.texteSecondaire, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Habilitation</span>
              <span style={{ color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '500', marginTop: '2px' }}>Privilège Système</span>
            </div>
          </div>
          <span style={{ 
            backgroundColor: 'rgba(56, 189, 248, 0.1)', 
            color: '#0284c7', 
            padding: '6px 14px', 
            borderRadius: '20px', 
            fontSize: '12px', 
            fontWeight: '700', 
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            border: '1px solid rgba(56, 189, 248, 0.2)'
          }}>
            {user?.role || 'Admin'}
          </span>
        </div>

        {user?.role === 'admin' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 20px', backgroundColor: stylesTheme.fondApplication, borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}` }}>
            <span style={{ fontSize: '20px', color: dateEcheance && !messageValidation?.includes('expiré') ? '#c026d3' : '#ef4444' }}>📅</span>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ color: stylesTheme.texteSecondaire, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Validité du Logiciel</span>
              <span style={{ color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '700', marginTop: '2px' }}>
                {dateEcheance ? (
                  <>Abonnement actif jusqu'au : <span style={{ color: '#c026d3' }}>{dateEcheance}</span></>
                ) : (
                  <>État de la licence : <span style={{ color: '#ef4444' }}>Licence expirée</span></>
                )}
              </span>
            </div>
          </div>
        )}

        {/* SECTION DES BOUTONS DE NAVIGATION ET D'ACTION PROPRES */}
        <div style={{ display: 'flex', gap: '15px', marginTop: '20px', width: '100%', boxSizing: 'border-box' }}>
          
          {/* BOUTON RETOUR (À GAUCHE) */}
          <button 
            onClick={() => setOngletActif('gestion')} 
            style={{ 
              flex: 1,
              backgroundColor: 'transparent', 
              color: stylesTheme.texteSecondaire, 
              padding: '14px', 
              border: `1px solid ${stylesTheme.bordures}`, 
              borderRadius: '12px', 
              fontWeight: '600', 
              fontSize: '14px',
              cursor: 'pointer', 
              transition: 'all 0.2s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = stylesTheme.fondApplication;
              e.currentTarget.style.color = stylesTheme.textePrincipal;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = stylesTheme.texteSecondaire;
            }}
          >
            <span>←</span> Retour au tableau de bord
          </button>

          {/* BOUTON MODIFIER / ENREGISTRER (À DROITE - UNIQUEMENT ADMIN) */}
          {user?.role === 'admin' && (
            <button 
              onClick={enModeEdition ? sauvegarderModificationsProfil : () => setEnModeEdition(true)} 
              style={{ 
                flex: 1,
                backgroundColor: 'transparent', 
                color: stylesTheme.texteSecondaire, 
                padding: '14px', 
                border: `1px solid ${stylesTheme.bordures}`, 
                borderRadius: '12px', 
                fontWeight: '600', 
                fontSize: '14px',
                cursor: 'pointer', 
                transition: 'all 0.2s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = stylesTheme.fondApplication;
                e.currentTarget.style.color = stylesTheme.textePrincipal;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = stylesTheme.texteSecondaire;
              }}
            >
              {enModeEdition ? <>Enregistrer la modification</> : <>Modifier</>}
            </button>
          )}

        </div>
      </div>
    </div>
  );
})()}
{console.log("VALEUR DE CREDITS :", credits)}
{console.log("VALEUR DE LISTE CLIENTS :", listeClients)}
{/* ================= 💳 ONGLET : GESTION DES CRÉDITS ================= */}
{ongletActif === 'credits' && (
  <div style={{ padding: '24px', backgroundColor: stylesTheme.fondApplication, height: 'calc(100vh - 50px)', fontFamily: 'Segoe UI, sans-serif', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
    
    {/* EN-TÊTE STYLÉ */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexShrink: 0 }}>
      <div>
        <h1 style={{ margin: 0, color: stylesTheme.textePrincipal, fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          📑 Carnet des Crédits & Dettes
        </h1>
        <p style={{ margin: '6px 0 0 0', color: stylesTheme.texteSecondaire, fontSize: '14px', fontWeight: '500' }}>
          Suivez les montants dus, gérez les clients et enregistrez les versements en temps réel.
        </p>
      </div>
      
      {/* BOUTON + NOUVEAU CREDIT */}
      <button 
        onClick={() => setAfficherModalClient(true)}
        style={{ 
          backgroundColor: '#10b981', color: 'white', padding: '12px 20px', border: 'none', borderRadius: '10px', 
          fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)', transition: 'transform 0.2s, background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#059669';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#10b981';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span style={{ fontSize: '16px' }}>＋</span> Nouveau Client
      </button>
    </div>

    {/* CARTES DE STATISTIQUES */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px', flexShrink: 0 }}>
      <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '5px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${stylesTheme.bordures}`, borderRight: `1px solid ${stylesTheme.bordures}`, borderBottom: `1px solid ${stylesTheme.bordures}` }}>
        <div>
          <span style={{ color: stylesTheme.texteSecondaire, fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Total Dû (Dehors)</span>
          <h2 style={{ margin: '8px 0 0 0', color: stylesTheme.textePrincipal, fontSize: '24px', fontWeight: '800' }}>
            {/* Connection aux statistiques de l'API ou calcul de secours si non chargé */}
            {statsGlobales?.total_dehors 
              ? Number(statsGlobales.total_dehors).toLocaleString() 
              : (credits?.reduce((acc, curr) => acc + (Number(curr.montant_total || 0) - Number(curr.montant_paye || 0)), 0).toLocaleString() || 0)} F CFA
          </h2>
        </div>
        <div style={{ backgroundColor: '#fee2e2', padding: '12px', borderRadius: '12px', fontSize: '22px' }}>🔴</div>
      </div>

      <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '5px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${stylesTheme.bordures}`, borderRight: `1px solid ${stylesTheme.bordures}`, borderBottom: `1px solid ${stylesTheme.bordures}` }}>
        <div>
          <span style={{ color: stylesTheme.texteSecondaire, fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Dettes Actives</span>
          <h2 style={{ margin: '8px 0 0 0', color: stylesTheme.textePrincipal, fontSize: '24px', fontWeight: '800' }}>
            {/* Récupère le compte exact des clients actifs depuis l'API */}
            {statsGlobales?.clients_actifs !== undefined 
              ? statsGlobales.clients_actifs 
              : (credits?.filter(c => (Number(c.montant_total || 0) - Number(c.montant_paye || 0)) > 0).length || 0)} Clients
          </h2>
        </div>
        <div style={{ backgroundColor: '#fef3c7', padding: '12px', borderRadius: '12px', fontSize: '22px' }}>⏳</div>
      </div>

      <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '5px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${stylesTheme.bordures}`, borderRight: `1px solid ${stylesTheme.bordures}`, borderBottom: `1px solid ${stylesTheme.bordures}` }}>
        <div>
          <span style={{ color: stylesTheme.texteSecondaire, fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Recouvré (Total)</span>
          <h2 style={{ margin: '8px 0 0 0', color: stylesTheme.textePrincipal, fontSize: '24px', fontWeight: '800' }}>
            {statsGlobales?.total_recouvre 
              ? Number(statsGlobales.total_recouvre).toLocaleString() 
              : (credits?.reduce((acc, curr) => acc + (Number(curr.montant_paye) || 0), 0).toLocaleString() || 0)} F CFA
          </h2>
        </div>
        <div style={{ backgroundColor: '#d1fae5', padding: '12px', borderRadius: '12px', fontSize: '22px' }}>🟢</div>
      </div>
    </div>

    {/* 🌟 SOUS_MENU INTERNE POUR PASSER DU CARNET AU REPERTOIRE */}
    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: `2px solid ${stylesTheme.bordures}`, paddingBottom: '10px', flexShrink: 0 }}>
      <button 
        onClick={() => setSousOnglet('liste_credits')}
        style={{
          padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px',
          backgroundColor: sousOnglet === 'liste_credits' ? '#3498db' : 'transparent',
          color: sousOnglet === 'liste_credits' ? 'white' : stylesTheme.texteSecondaire,
          transition: '0.2s'
        }}
      >
        💳 Suivi des Dettes
      </button>
      <button 
        onClick={() => setSousOnglet('repertoire_clients')}
        style={{
          padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px',
          backgroundColor: sousOnglet === 'repertoire_clients' ? '#3498db' : 'transparent',
          color: sousOnglet === 'repertoire_clients' ? 'white' : stylesTheme.texteSecondaire,
          transition: '0.2s'
        }}
      >
        👥 Répertoire Clients ({listeClients?.length || 0})
      </button>
    </div>

{/* 📋 SOUS-ONGLET A : TABLEAU DES DETTES CRÉDITS */}
{sousOnglet === 'liste_credits' && (() => {
  // 🌟 LOGIQUE DE FILTRAGE INSTANTANÉ DES DONNÉES
  const creditsFiltres = (credits || []).filter((credit) => {
    // 1. Filtrage par texte d'article
    const nomArticle = credit.nom_produit || credit.produit_nom || '';
    const matchArticle = nomArticle.toLowerCase().includes((filtreArticle || '').toLowerCase());
    
    // 2. Filtrage par état du statut
    let matchStatut = true;
    if (filtreStatut !== "Tous") {
      if (filtreStatut === "Payé") {
        matchStatut = Number(credit.reste_a_payer) <= 0;
      } else if (filtreStatut === "En cours") {
        matchStatut = Number(credit.reste_a_payer) > 0;
      }
    }
    
    // 3. 📅 Filtrage uniquement par la date de prêt (date_pret)
    let matchDate = true;
    if (credit.date_pret) {
      // On extrait uniquement la partie YYYY-MM-DD (ex: 2026-06-11) pour correspondre aux inputs HTML
      const datePretFormattee = new Date(credit.date_pret).toISOString().split('T')[0];
      
      const matchDateDebut = filtreDateDebut ? datePretFormattee >= filtreDateDebut : true;
      const matchDateFin = filtreDateFin ? datePretFormattee <= filtreDateFin : true;
      
      matchDate = matchDateDebut && matchDateFin;
    } else {
      // 🔒 Sécurité : Si un crédit n'a exceptionnellement pas de date_pret, 
      // et que tu as mis un filtre de date, on ne l'affiche pas.
      if (filtreDateDebut || filtreDateFin) matchDate = false;
    }

    return matchArticle && matchStatut && matchDate;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      
      {/* 🌟 BARRE DE FILTRAGE + BOUTON EXPORT PDF INSÉRÉ SUR TON TRAIT ROUGE */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', backgroundColor: stylesTheme.fondApplication, padding: '12px 20px', borderRadius: '12px', alignItems: 'center', flexWrap: 'wrap', border: `1px solid ${stylesTheme.bordures}` }}>
        
        {/* Dates */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: stylesTheme.texteSecondaire }}>Du :</span>
          <input type="date" value={filtreDateDebut} onChange={(e) => setFiltreDateDebut(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, fontSize: '13px', outline: 'none' }} />
          <span style={{ fontSize: '12px', fontWeight: '700', color: stylesTheme.texteSecondaire }}>Au :</span>
          <input type="date" value={filtreDateFin} onChange={(e) => setFiltreDateFin(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, fontSize: '13px', outline: 'none' }} />
        </div>

        {/* Article */}
        <input 
          type="text" 
          placeholder="🔍 Rechercher un article..." 
          value={filtreArticle}
          onChange={(e) => setFiltreArticle(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '6px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, fontSize: '13px', minWidth: '180px', outline: 'none' }}
        />

        {/* Statut */}
        <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: `1px solid ${stylesTheme.bordures}`, fontSize: '13px', backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, outline: 'none', cursor: 'pointer', fontWeight: '600' }}>
          <option value="Tous" style={{ backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal }}>📊 Tous les statuts</option>
          <option value="En cours" style={{ backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal }}>⏳ En cours</option>
          <option value="Payé" style={{ backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal }}>✅ Soldé</option>
        </select>

        {/* 🌟 NOUVEAU BOUTON : Placé tout à droite de la barre grâce au margin-left: 'auto' */}
        <button 
          onClick={typeof exporterCreditsPDF !== 'undefined' ? exporterCreditsPDF : () => alert("Fonction de génération PDF non liée.")} 
          style={{ 
            marginLeft: 'auto', 
            padding: '8px 16px', 
            backgroundColor: '#e74c3c', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '13px'
          }}
        >
          Exporter en PDF
        </button>
      </div>

     {/* Le tableau se remplit maintenant avec creditsFiltres */}
      <div style={{ backgroundColor: stylesTheme.fondCartes, borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflowY: 'auto', flex: 1, border: `1px solid ${stylesTheme.bordures}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr style={{ backgroundColor: stylesTheme.fondApplication, borderBottom: `1px solid ${stylesTheme.bordures}` }}>
              <th style={{ padding: '16px', color: stylesTheme.texteSecondaire, fontWeight: '700', fontSize: '13px', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 10, minWidth: '150px' }}>Client</th>
              <th style={{ padding: '16px', color: stylesTheme.texteSecondaire, fontWeight: '700', fontSize: '13px', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 10, minWidth: '140px' }}>Date Dette</th>
              <th style={{ padding: '16px', color: stylesTheme.texteSecondaire, fontWeight: '700', fontSize: '13px', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 10, minWidth: '180px' }}>Article Pris</th>
              <th style={{ padding: '16px', color: stylesTheme.texteSecondaire, fontWeight: '700', fontSize: '13px', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 10 }}>Montant Total</th>
              <th style={{ padding: '16px', color: stylesTheme.texteSecondaire, fontWeight: '700', fontSize: '13px', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 10 }}>Avance Versée</th>
              <th style={{ padding: '16px', color: stylesTheme.texteSecondaire, fontWeight: '700', fontSize: '13px', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 10 }}>Reste à Payer</th>
              <th style={{ padding: '16px', color: stylesTheme.texteSecondaire, fontWeight: '700', fontSize: '13px', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 10, minWidth: '110px' }}>Statut</th>
              <th style={{ padding: '16px', color: stylesTheme.texteSecondaire, fontWeight: '700', fontSize: '13px', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 10, minWidth: '140px' }}>Date Solde</th>
              <th style={{ padding: '16px', color: stylesTheme.texteSecondaire, fontWeight: '700', fontSize: '13px', textAlign: 'center', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {creditsFiltres && creditsFiltres.length > 0 ? (
              creditsFiltres.map((credit, index) => {
                const estSolde = Number(credit.reste_a_payer) <= 0 || credit.statut === 'SOLDE';
                const dateDetteBrute = credit.date_pret;

                return (
                  <tr key={credit.id || index} style={{ borderBottom: `1px solid ${stylesTheme.bordures}` }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '700', color: stylesTheme.textePrincipal }}>{credit.prenom} {credit.nom}</div>
                      <div style={{ fontSize: '12px', color: stylesTheme.texteSecondaire }}>📞 {credit.telephone}</div>
                    </td>

                    {/* 📅 DATE DETTE JUSTE APRÈS CLIENT */}
                    <td style={{ padding: '16px', color: stylesTheme.textePrincipal, fontWeight: '600', fontSize: '13px' }}>
                      {dateDetteBrute ? (
                        new Date(dateDetteBrute).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).replace(',', ' à')
                      ) : '—'}
                    </td>

                    <td style={{ padding: '16px', color: stylesTheme.textePrincipal, fontWeight: '500' }}>{credit.designation || credit.nom_produit}</td>
                    <td style={{ padding: '16px', color: stylesTheme.textePrincipal }}>{Number(credit.montant_total).toLocaleString()} F</td>
                    <td style={{ padding: '16px', color: stylesTheme.textePrincipal }}>{Number(credit.montant_paye).toLocaleString()} F</td>
                    <td style={{ padding: '16px', color: '#ef4444', fontWeight: '700' }}>{Number(credit.reste_a_payer).toLocaleString()} F</td>
                    
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        backgroundColor: estSolde ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                        color: estSolde ? '#10b981' : '#ef4444', 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '11px', 
                        fontWeight: '700' 
                      }}>
                        {estSolde ? '🟢 SOLDE' : `❌ ${credit.statut || 'NON PAYÉ'}`}
                      </span>
                    </td>

                    {/* 🏁 DATE SOLDE JUSTE APRÈS STATUT */}
                    <td style={{ padding: '16px', color: estSolde ? '#10b981' : stylesTheme.texteSecondaire, fontWeight: '600', fontSize: '13px' }}>
                      {estSolde ? (
                        new Date().toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).replace(',', ' à')
                      ) : '—'}
                    </td>

                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button 
                        onClick={() => gererEncaissement(credit.id, credit.reste_a_payer)}
                        style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        💵 Encaisser
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ padding: '30px', textAlign: 'center', color: stylesTheme.texteSecondaire }}>📭 Aucun dossier de crédit ne correspond à vos filtres.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
})()}

{/* 👥 SOUS-ONGLET B : REPERTOIRE DES CLIENTS DIVISÉ EN DEUX (GAUCHE / DROITE) */}
{sousOnglet === 'repertoire_clients' && (
  <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start', flex: 1, minHeight: 0 }}>
    
    {/* ⬅️ COLONNE GAUCHE : LISTE COMPACTE DES CLIENTS AVEC BARRE DE RECHERCHE INTÉGRÉE */}
    <div style={{ backgroundColor: stylesTheme.fondCartes, borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden', border: `1px solid ${stylesTheme.bordures}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Titre de la liste */}
      <div style={{ padding: '16px 16px 8px 16px', backgroundColor: stylesTheme.fondCartes, fontWeight: '700', color: stylesTheme.texteSecondaire, fontSize: '14px' }}>
        👥 Liste des Clients
      </div>

      {/* Barre de recherche locale connectée */}
      <div style={{ padding: '0 16px 12px 16px', backgroundColor: stylesTheme.fondCartes, borderBottom: `1px solid ${stylesTheme.bordures}` }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: stylesTheme.texteSecondaire, fontSize: '14px' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Rechercher un client..." 
            value={rechercheClient}
            onChange={(e) => setRechercheClient(e.target.value)}
            style={{ width: '100%', padding: '8px 8px 8px 34px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, outline: 'none', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Conteneur interne de défilement de la liste des clients */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {(() => {
          // Filtrage en temps réel de la liste selon la saisie de l'utilisateur
          const clientsFiltrés = (listeClients || []).filter(client => {
            const terme = rechercheClient.toLowerCase().trim();
            if (!terme) return true; // Si vide, on affiche tout
            
            return (
              (client.prenom || '').toLowerCase().includes(terme) ||
              (client.nom || '').toLowerCase().includes(terme) ||
              (client.telephone || '').includes(terme)
            );
          });

          return clientsFiltrés.length > 0 ? (
            clientsFiltrés.map((client) => {
              const estSelectionne = clientSelectionne?.id === client.id;
              return (
                <div 
                  key={client.id}
                  onClick={() => setClientSelectionne(client)}
                  style={{ 
                    padding: '16px', 
                    borderBottom: `1px solid ${stylesTheme.bordures}`, 
                    cursor: 'pointer',
                    backgroundColor: estSelectionne ? 'rgba(52, 152, 219, 0.15)' : 'transparent',
                    transition: 'background-color 0.2s',
                    borderLeft: estSelectionne ? '4px solid #3498db' : '4px solid transparent'
                  }}
                  onMouseEnter={(e) => { if(!estSelectionne) e.currentTarget.style.backgroundColor = stylesTheme.fondApplication; }}
                  onMouseLeave={(e) => { if(!estSelectionne) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div style={{ fontWeight: '700', color: estSelectionne ? '#3498db' : stylesTheme.textePrincipal, fontSize: '14px' }}>
                    {client.prenom} {client.nom}
                  </div>
                  <div style={{ fontSize: '12px', color: stylesTheme.texteSecondaire, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>📞</span> {client.telephone}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: stylesTheme.texteSecondaire, fontSize: '14px' }}>
              {rechercheClient.trim() ? "❌ Aucun client ne correspond à la recherche." : "Aucun client enregistré."}
            </div>
          );
        })()}
      </div>
    </div>

    {/* ➡️ COLONNE DROITE : FICHE DÉTAILLÉE DU CLIENT SÉLECTIONNÉ */}
    <div style={{ backgroundColor: stylesTheme.fondCartes, borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '24px', border: `1px solid ${stylesTheme.bordures}`, height: '100%', overflow: 'hidden', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      {clientSelectionne ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          
          {/* SECTION FIXE DU HAUT (Ne bouge pas au défilement) */}
          <div style={{ flexShrink: 0 }}>
            {/* Header de la fiche */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${stylesTheme.bordures}`, paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h2 style={{ margin: 0, color: stylesTheme.textePrincipal, fontSize: '22px', fontWeight: '800' }}>
                  👤 {clientSelectionne.prenom} {clientSelectionne.nom}
                </h2>
                
                {/* 🌟 NOUVEAU BOUTON EXPORT PDF INSÉRÉ ICI SUR TON RECTANGLE ROUGE */}
                <button
                  onClick={() => typeof exporterFicheClientPDF !== 'undefined' ? exporterFicheClientPDF(clientSelectionne) : alert("Fonction PDF non définie")}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  📄 PDF
                </button>
              </div>
              
              {/* CALCUL ET AFFICHAGE MINIATURISÉ DU MONTANT DU À LA PLACE DU BOUTON */}
              {(() => {
                const dettesDuClient = (credits || []).filter(c => c.telephone === clientSelectionne.telephone);
                const totalResteAPayer = dettesDuClient.reduce((acc, c) => acc + Number(c.reste_a_payer || 0), 0);
                
                return (
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    backgroundColor: totalResteAPayer > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    border: totalResteAPayer > 0 ? '1px solid #ef4444' : '1px solid #10b981',
                    textAlign: 'right'
                  }}>
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: totalResteAPayer > 0 ? '#ef4444' : '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {totalResteAPayer > 0 ? 'Reste à devoir' : 'Situation saine'}
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: totalResteAPayer > 0 ? '#ef4444' : '#10b981' }}>
                      {totalResteAPayer.toLocaleString()} F CFA
                    </span>
                  </div>
                );
              })()}
            </div>
            
            {/* Coordonnées & Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: stylesTheme.fondApplication, padding: '14px', borderRadius: '10px', border: `1px solid ${stylesTheme.bordures}` }}>
                <span style={{ display: 'block', color: stylesTheme.texteSecondaire, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Contact & Adresse</span>
                <div style={{ color: stylesTheme.textePrincipal, fontWeight: '600', fontSize: '14px' }}>📞 {clientSelectionne.telephone}</div>
                <div style={{ color: stylesTheme.texteSecondaire, fontSize: '13px', marginTop: '6px' }}>📍 {clientSelectionne.adresse || 'Aucune adresse enregistrée'}</div>
              </div>
              
              <div style={{ backgroundColor: stylesTheme.fondApplication, padding: '14px', borderRadius: '10px', border: `1px solid ${stylesTheme.bordures}` }}>
                <span style={{ display: 'block', color: stylesTheme.texteSecondaire, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Notes & Garanties</span>
                <div style={{ color: stylesTheme.texteSecondaire, fontSize: '13px', fontStyle: 'italic' }}>
                  {clientSelectionne.notes || 'Aucun commentaire ou garantie de confiance ajouté.'}
                </div>
              </div>
            </div>

            {/* Titre de la section historique */}
            <h3 style={{ color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🗂️ Historique des Crédits & Engagements
            </h3>
          </div>

          {/* 🌟 ZONE DE TABLEAU EXCLUSIVEMENT DÉFILANTE (L'en-tête reste figé) */}
          <div style={{ 
            border: `1px solid ${stylesTheme.bordures}`, 
            borderRadius: '12px', 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            flex: 1, 
            backgroundColor: stylesTheme.fondCartes
          }}>
            <div style={{ overflowY: 'auto', width: '100%', height: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                
                {/* EN-TÊTE COLLÉ ET STATIQUE (STICKY) */}
                <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: stylesTheme.fondApplication }}>
                  <tr style={{ borderBottom: `2px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication }}>
                    <th style={{ padding: '12px 16px', color: stylesTheme.texteSecondaire, fontWeight: '700', backgroundColor: stylesTheme.fondApplication }}>Article</th>
                    {/* 📅 AJOUT DE L'EN-TÊTE DATE DETTE */}
                    <th style={{ padding: '12px 16px', color: stylesTheme.texteSecondaire, fontWeight: '700', backgroundColor: stylesTheme.fondApplication }}>Date Dette</th>
                    <th style={{ padding: '12px 16px', color: stylesTheme.texteSecondaire, fontWeight: '700', backgroundColor: stylesTheme.fondApplication }}>Montant</th>
                    <th style={{ padding: '12px 16px', color: stylesTheme.texteSecondaire, fontWeight: '700', backgroundColor: stylesTheme.fondApplication }}>Payé</th>
                    <th style={{ padding: '12px 16px', color: stylesTheme.texteSecondaire, fontWeight: '700', backgroundColor: stylesTheme.fondApplication }}>Reste à Payer</th>
                    <th style={{ padding: '12px 16px', color: stylesTheme.texteSecondaire, fontWeight: '700', backgroundColor: stylesTheme.fondApplication }}>Statut</th>
                  </tr>
                </thead>
                
                {/* LA LISTE DES ARTICLES DÉFILE DESSOUS ICI */}
                <tbody>
                  {(() => {
                    const dettesFiltrees = (credits || []).filter(c => c.telephone === clientSelectionne.telephone);
                    
                    return dettesFiltrees.length > 0 ? (
                      dettesFiltrees.map((dette, i) => {
                        const dateDetteBrute = dette.date_pret || dette.date_creation;

                        return (
                          <tr key={dette.id || i} style={{ borderBottom: `1px solid ${stylesTheme.bordures}` }}>
                            <td style={{ padding: '12px 16px', fontWeight: '500', color: stylesTheme.textePrincipal }}>{dette.designation || dette.nom_produit}</td>
                            
                            {/* 📅 CELLULE DATE DETTE (AVEC HEURE ET MINUTE) */}
                            <td style={{ padding: '12px 16px', color: stylesTheme.texteSecondaire, fontWeight: '600', fontSize: '13px' }}>
                              {dateDetteBrute ? (
                                new Date(dateDetteBrute).toLocaleString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }).replace(',', ' à')
                              ) : '—'}
                            </td>

                            <td style={{ padding: '12px 16px', color: stylesTheme.textePrincipal }}>{Number(dette.montant_total).toLocaleString()} F</td>
                            <td style={{ padding: '12px 16px', color: '#10b981' }}>{Number(dette.montant_paye).toLocaleString()} F</td>
                            <td style={{ padding: '12px 16px', color: '#ef4444', fontWeight: '700' }}>{Number(dette.reste_a_payer).toLocaleString()} F</td>
                            
                            <td style={{ padding: '12px 16px' }}>
                              {Number(dette.reste_a_payer) <= 0 ? (
                                <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                                  ✅ SOLDÉ
                                </span>
                              ) : (
                                <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                                  ❌ EN COURS
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        {/* 🌟 AJUSTEMENT DU COLSPAN À 6 POUR COUVRIR TOUTE LA LARGEUR DU TABLEAU */}
                        <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: stylesTheme.texteSecondaire, fontStyle: 'italic' }}>
                          ✅ Ce client n'a aucun crédit actif en cours. Situation saine !
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: stylesTheme.texteSecondaire }}>
          <span style={{ fontSize: '48px', marginBottom: '10px' }}>👈</span>
          <p style={{ fontWeight: '600', margin: 0, fontSize: '15px', color: stylesTheme.textePrincipal }}>Sélectionnez un client dans la liste de gauche</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Pour consulter ses coordonnées complètes et l'état de ses dettes.</p>
        </div>
      )}
    </div>

  </div>
)}

  {/* 🌟 LE FORMULAIRE POP-UP (MODAL) CORRIGÉ & CONNECTÉ AU BACKEND */}
{afficherModalClient && (
  <div style={{ 
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
    backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(6px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
  }}>
    
    <div style={{ 
      backgroundColor: stylesTheme.fondCartes, width: '90%', maxWidth: '520px', borderRadius: '20px',
      padding: '30px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      border: `1px solid ${stylesTheme.bordures}`, position: 'relative', boxSizing: 'border-box'
    }}>
      
      {/* Bouton de fermeture en haut à droite */}
      <button 
        type="button"
        onClick={() => setAfficherModalClient(false)}
        style={{ position: 'absolute', top: '20px', right: '20px', background: stylesTheme.fondApplication, border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: stylesTheme.texteSecondaire, fontSize: '14px' }}
      >
        ✕
      </button>

      {/* En-tête de la fiche client */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '25px', borderBottom: `1px solid ${stylesTheme.bordures}`, paddingBottom: '15px' }}>
        <div style={{ backgroundColor: 'rgba(52, 152, 219, 0.15)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
          👤
        </div>
        <div>
          <h3 style={{ margin: 0, color: stylesTheme.textePrincipal, fontSize: '18px', fontWeight: '800' }}>Créer une Fiche Client</h3>
          <p style={{ margin: '3px 0 0 0', color: stylesTheme.texteSecondaire, fontSize: '12px', fontWeight: '500' }}>Ouvrir un dossier de crédit pour un acheteur</p>
        </div>
      </div>

      {/* FORMULAIRE */}
      <form onSubmit={gererSoumissionClient}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Prénom et Nom */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: stylesTheme.texteSecondaire, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prénom</label>
              <input 
                type="text" 
                placeholder="Ex: Adama" 
                required
                value={formClient.prenom}
                onChange={(e) => setFormClient({...formClient, prenom: e.target.value})}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: stylesTheme.texteSecondaire, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nom</label>
              <input 
                type="text" 
                placeholder="Ex: Diarra" 
                required
                value={formClient.nom}
                onChange={(e) => setFormClient({...formClient, nom: e.target.value})}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Numéro de téléphone */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: stylesTheme.texteSecondaire, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Numéro de téléphone</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: stylesTheme.texteSecondaire, fontSize: '14px' }}>📞</span>
              <input 
                type="tel" 
                placeholder="Ex: +223 70 00 00 00" 
                required
                value={formClient.telephone}
                onChange={(e) => setFormClient({...formClient, telephone: e.target.value})}
                style={{ width: '100%', padding: '11px 14px 11px 38px', borderRadius: '10px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Adresse Géographique */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: stylesTheme.texteSecondaire, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Adresse / Quartier</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: stylesTheme.texteSecondaire, fontSize: '14px' }}>📍</span>
              <input 
                type="text" 
                placeholder="Ex: Badalabougou, Rue 14" 
                value={formClient.adresse}
                onChange={(e) => setFormClient({...formClient, adresse: e.target.value})}
                style={{ width: '100%', padding: '11px 14px 11px 38px', borderRadius: '10px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Note ou Commentaire Additionnel */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: stylesTheme.texteSecondaire, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notes de confiance (Optionnel)</label>
            <textarea 
              placeholder="Informations ou garanties supplémentaires laissées par le client..." 
              rows="2"
              value={formClient.notes}
              onChange={(e) => setFormClient({...formClient, notes: e.target.value})}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          {/* Actions du Formulaire */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button 
              type="button" 
              onClick={() => setAfficherModalClient(false)}
              style={{ flex: 1, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, padding: '12px', border: `1px solid ${stylesTheme.bordures}`, borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}
            >
              Enregistrer le Client
            </button>
          </div>

        </div>
      </form>

    </div>
  </div>
)}
  </div>
)}
  {ongletActif === 'gestion' && (
  <div style={{ position: 'relative' }}>
    <div style={{ display: 'flex', gap: '50px', animation: 'fadeIn 0.5s', maxWidth: '1600px', margin: '0 auto', alignItems: 'flex-start' }}>
      
    {/* SECTION GAUCHE : CATALOGUE */}
      <div style={{ flex: 3 }}> 
        <div style={{ backgroundColor: stylesTheme.fondCartes, borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: `1px solid ${stylesTheme.bordures}` }}>
          
          <div style={{ 
            padding: '25px 30px', 
            borderBottom: `2px solid ${stylesTheme.bordures}`, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            backgroundColor: stylesTheme.fondCartes,
            // ---------- MODIFICATION ICI : DÉFIXATION COMPLÈTE ----------
            borderRadius: '20px 20px 0 0' // Garde les coins arrondis en haut
            // ------------------------------------------------------------
          }}>
            <div>
              <h2 style={{ margin: 0, color: stylesTheme.textePrincipal, fontSize: '24px', fontWeight: '800' }}>📦 Catalogue Produits</h2>
              <p style={{ margin: '5px 0 0 0', color: stylesTheme.texteSecondaire, fontSize: '14px' }}>Gérez votre stock et ajoutez au panier</p>
            </div>
            
            {/* Conteneur pour la recherche et les boutons d'affichage */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ position: 'relative', width: '320px' }}>
                <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                <input 
                  type="text" 
                  placeholder="Recherche rapide..." 
                  value={recherche} 
                  onChange={e => setRecherche(e.target.value)} 
                  style={{ 
                    width: '100%', padding: '14px 20px 14px 45px', borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}`, 
                    outline: 'none', fontSize: '15px', backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, transition: '0.3s', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* 🛠️ AJOUT UNIQUE : Sélecteur Liste / Grille */}
              <div style={{ display: 'flex', backgroundColor: stylesTheme.fondApplication, padding: '4px', borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}` }}>
                <button 
                  onClick={() => typeof setModeAffichage === 'function' && setModeAffichage('liste')}
                  style={{ 
                    padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
                    backgroundColor: (typeof modeAffichage === 'undefined' || modeAffichage === 'liste') ? stylesTheme.fondCartes : 'transparent', 
                    color: (typeof modeAffichage === 'undefined' || modeAffichage === 'liste') ? stylesTheme.textePrincipal : stylesTheme.texteSecondaire, 
                    boxShadow: (typeof modeAffichage === 'undefined' || modeAffichage === 'liste') ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', 
                    transition: '0.2s' 
                  }}
                >
                  📄 Liste
                </button>
                <button 
                  onClick={() => typeof setModeAffichage === 'function' && setModeAffichage('grille')}
                  style={{ 
                    padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
                    backgroundColor: (typeof modeAffichage !== 'undefined' && modeAffichage === 'grille') ? stylesTheme.fondCartes : 'transparent', 
                    color: (typeof modeAffichage !== 'undefined' && modeAffichage === 'grille') ? stylesTheme.textePrincipal : stylesTheme.texteSecondaire, 
                    boxShadow: (typeof modeAffichage !== 'undefined' && modeAffichage === 'grille') ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', 
                    transition: '0.2s' 
                  }}
                >
                  📱 Grille
                </button>
              </div>
            </div>
          </div>

          {/* 🛠️ AJOUT CONDITIONNEL : Rendu selon le mode choisi */}
       {(typeof modeAffichage === 'undefined' || modeAffichage === 'liste') ? (
            /* --- MODE TABLEAU SIMPLE (LISTE) --- */
            <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', position: 'relative' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', backgroundColor: stylesTheme.fondApplication }}>
                    <th style={{ padding: '20px 30px', color: stylesTheme.texteSecondaire, fontSize: '13px', textTransform: 'uppercase', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 1 }}>Désignation</th>
                    <th style={{ color: stylesTheme.texteSecondaire, fontSize: '13px', textTransform: 'uppercase', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 1 }}>Date d'entrée</th> 
                    <th style={{ color: stylesTheme.texteSecondaire, fontSize: '13px', textTransform: 'uppercase', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 1 }}>Disponibilité</th>
                    <th style={{ color: stylesTheme.texteSecondaire, fontSize: '13px', textTransform: 'uppercase', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 1 }}>Prix Unitaire</th>
                    <th style={{ padding: '20px 30px', textAlign: 'right', color: stylesTheme.texteSecondaire, fontSize: '13px', textTransform: 'uppercase', width: '150px', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 1 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {produits
                    .filter(p => p.actif !== false && p.nom.toLowerCase().includes(recherche.toLowerCase()))
                    .map(p => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${stylesTheme.bordures}`, transition: '0.3s' }}>
                      <td style={{ padding: '25px 30px' }}>
                        <div style={{ fontWeight: '700', color: stylesTheme.textePrincipal, fontSize: '17px' }}>{p.nom}</div>
                      </td>
                      <td style={{ color: stylesTheme.texteSecondaire, fontSize: '14px' }}>
                        {p.date_entree ? new Date(p.date_entree).toLocaleDateString() : '-'}
                      </td>
                     <td>
                        <div style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold',
                          // 🌟 Ajout de Number() pour forcer la comparaison numérique et corriger le bug de couleur
                          backgroundColor: Number(p.stock_actuel) <= Number(p.stock_alerte) ? '#fff5f5' : '#f0fff4',
                          color: Number(p.stock_actuel) <= Number(p.stock_alerte) ? '#e53e3e' : '#22c55e'
                        }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                          {p.stock_actuel} en stock
                        </div>
                      </td>
                      {/* 🌟 Prix Unitaire sans décimales */}
                      <td style={{ fontSize: '18px', fontWeight: '800', color: stylesTheme.textePrincipal }}>
                        {Math.round(p.prix_vente).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>F</span>
                      </td>
                      <td style={{ padding: '25px 30px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                          {role === 'admin' && (
                            <>
                              <button 
                                onClick={() => {
                                  setProduitAEditer({...p});
                                  setShowModalEdit(true);
                                }} 
                                style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', transition: '0.2s' }}
                                title="Modifier les informations"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button 
                                onClick={() => supprimerProduit(p.id)} 
                                style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', transition: '0.2s' }}
                                title="Supprimer du catalogue"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => ajouterAuPanier(p)} 
                            disabled={p.stock_actuel <= 0} 
                            style={{ 
                              backgroundColor: p.stock_actuel <= 0 ? '#e2e8f0' : '#1e293b', 
                              color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', 
                              cursor: p.stock_actuel <= 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold'
                            }}
                          >
                            + Ajouter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* --- 🛠️ AJOUT UNIQUE : MODE GRILLE / MOSAÏQUE AVEC PHOTOS --- */
          <div style={{ padding: '30px', maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '25px' }}>
              {produits
                .filter(p => p.actif !== false && p.nom.toLowerCase().includes(recherche.toLowerCase()))
                .map(p => (
                  <div key={p.id} style={{ border: `1px solid ${stylesTheme.bordures}`, borderRadius: '16px', overflow: 'hidden', backgroundColor: stylesTheme.fondCartes, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', position: 'relative' }}>
                    
                    {/* Zone de l'image */}
                    <div style={{ width: '100%', height: '140px', backgroundColor: stylesTheme.fondApplication, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${stylesTheme.bordures}`, position: 'relative' }}>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '42px', color: '#94a3b8' }}>📦</span>
                      )}
                      
                      {/* Badge de stock flottant */}
                      <div style={{ 
                        position: 'absolute', top: '10px', right: '10px', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold',
                        // 🌟 Ajout de Number() pour forcer la comparaison numérique et corriger le bug de couleur
                        backgroundColor: Number(p.stock_actuel) <= Number(p.stock_alerte) ? '#fff5f5' : '#f0fff4',
                        color: Number(p.stock_actuel) <= Number(p.stock_alerte) ? '#e53e3e' : '#22c55e'
                      }}>
                        {p.stock_actuel} Pcs
                      </div>
                    </div>

                    {/* Descriptif & Prix */}
                    <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontWeight: '700', color: stylesTheme.textePrincipal, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.nom}>
                          {p.nom}
                        </div>
                        {/* Le bloc affichant le Code ID a été complètement retiré d'ici pour alléger la carte */}
                      </div>

                      {/* 🌟 Structure verticale propre pour le prix et les boutons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        
                        {/* Prix sur toute la largeur, masquage des décimales avec maximumFractionDigits: 0 */}
                        <div style={{ fontSize: '16px', fontWeight: '800', color: stylesTheme.textePrincipal, wordBreak: 'break-all' }}>
                          {Math.round(p.prix_vente).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span style={{ fontSize: '11px', fontWeight: 'normal' }}>F</span>
                        </div>
                        
                        {/* Boutons alignés proprement en bas à droite */}
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {role === 'admin' && (
                            <button 
                              onClick={() => {
                                  setProduitAEditer({...p});
                                  setShowModalEdit(true);
                                }}
                              style={{ backgroundColor: stylesTheme.fondApplication, color: stylesTheme.texteSecondaire, border: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                              <Edit3 size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => ajouterAuPanier(p)}
                            disabled={p.stock_actuel <= 0}
                            style={{ 
                              backgroundColor: p.stock_actuel <= 0 ? '#e2e8f0' : '#1e293b', 
                              color: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '8px', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold',
                              cursor: p.stock_actuel <= 0 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            +
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

     {/* SECTION DROITE : LA CAISSE */}
<div style={{ flex: 1.3, position: 'relative' }}>
    <div style={{ 
      backgroundColor: stylesTheme.fondCartes, 
      borderRadius: '30px', 
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', 
      
      // ---------- MODIFICATIONS ICI ----------
      position: 'sticky',   // 💡 Devient collant dans son conteneur sans sortir du flux flexbox
      top: '25px',          // 💡 S'accroche à 25px du haut dès qu'on défile
      width: '100%',        // 💡 Prend 100% des "1.3" de flex alloués (s'adapte au pixel près)
      // ----------------------------------------

      border: `1px solid ${stylesTheme.bordures}`,
      display: 'flex', 
      flexDirection: 'column', 
      maxHeight: 'calc(100vh - 50px)', // Calcule automatiquement la hauteur parfaite par rapport au top
      zIndex: 10,
      overflow: 'hidden'
    }}>
      
      <div style={{ 
        background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)', 
        padding: '20px 30px', color: 'white', textAlign: 'center' 
      }}>
        <ShoppingCart size={28} style={{ marginBottom: '8px' }} />
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', letterSpacing: '1px' }}>CAISSE</h3>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {panier.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: stylesTheme.texteSecondaire }}>
            <Package size={40} style={{ opacity: 0.3, marginBottom: '15px' }} />
            <p style={{ fontSize: '16px', fontWeight: '600' }}>Panier vide</p>
          </div>
            ) : (
              <>
                {/* MODIFICATION : Ajout de flex: 1 et overflowY pour faire défiler uniquement la liste des articles */}
<div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px', marginBottom: '15px' }}>
                  {panier.map(item => (
                    <div key={item.id} style={{ borderBottom: `1px solid ${stylesTheme.bordures}`, padding: '12px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '800', color: stylesTheme.textePrincipal, fontSize: '14px' }}>{item.nom}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ color: '#e67e22', fontWeight: '700', fontSize: '13px' }}>
                              {item.prix_vente.toLocaleString()} F
                            </div>
            {/* OPTION BONUS : USAGE PERSONNEL */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '11px', color: stylesTheme.texteSecondaire, backgroundColor: stylesTheme.fondApplication, padding: '2px 6px', borderRadius: '5px' }}>
              <input 
                type="checkbox" 
                checked={item.prix_vente === 0}
                onChange={(e) => {
                  const nouveauPanier = panier.map(p => {
                    if (p.id === item.id) {
                      // On stocke le prix original s'il n'existe pas encore
                      const prixOriginal = p.prix_original || p.prix_vente;
                      return { 
                        ...p, 
                        prix_original: prixOriginal,
                        prix_vente: e.target.checked ? 0 : prixOriginal 
                      };
                    }
                    return p;
                  });
                  setPanier(nouveauPanier);
                }}
              />
              Bonus 
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: stylesTheme.fondApplication, borderRadius: '10px', border: `1px solid ${stylesTheme.bordures}`, padding: '2px' }}>
            <button onClick={() => modifierQuantite(item.id, -1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '5px', color: stylesTheme.textePrincipal }}><Minus size={12} strokeWidth={3}/></button>
            <span style={{ width: '25px', textAlign: 'center', fontWeight: '900', fontSize: '14px', color: stylesTheme.textePrincipal }}>{item.qte}</span>
            <button onClick={() => modifierQuantite(item.id, 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '5px', color: stylesTheme.textePrincipal }}><Plus size={12} strokeWidth={3}/></button>
          </div>
          <button onClick={() => supprimerDuPanier(item.id)} style={{ color: '#cbd5e1', border: 'none', background: 'none', cursor: 'pointer' }}><X size={18}/></button>
        </div>
      </div>
    </div>
  ))}
</div>

<div style={{ backgroundColor: '#0f172a', borderRadius: '20px', padding: '20px', color: 'white' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
    <span style={{ fontSize: '12px', color: '#94a3b8' }}>TOTAL</span>
    <span style={{ fontSize: '26px', fontWeight: '900', color: '#e67e22' }}>{total.toLocaleString()} F</span>
  </div>

  <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '15px' }}>
  {['Espèce', 'Mobile', 'Crédit'].map((mode) => (
    <button
      key={mode}
      onClick={() => { 
        if (mode === 'Mobile') {
          setModePaiement('Mobile Money');
          setMontantRecu(total);
        } else if (mode === 'Crédit') {
          setModePaiement('Crédit');
          setMontantRecu(0); // 👈 Pour le crédit, on commence à 0F d'avance
        } else {
          setModePaiement('Espèce');
          // Optionnel : tu peux laisser le montant vide ou à 0 pour l'espèce selon ton habitude
        }
      }}
      style={{
        flex: 1, padding: '8px', fontSize: '11px', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: 'bold',
        backgroundColor: (modePaiement === mode || (mode === 'Mobile' && modePaiement === 'Mobile Money')) ? '#e67e22' : 'transparent',
        color: (modePaiement === mode || (mode === 'Mobile' && modePaiement === 'Mobile Money')) ? 'white' : '#94a3b8'
      }}
    >
      {mode}
    </button>
  ))}
</div>

               {modePaiement === "Espèce" && (
  <div style={{ marginBottom: '15px' }}>
    <input 
      type="number" 
      value={montantRecu}
      onChange={(e) => setMontantRecu(e.target.value)}
      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', fontSize: '20px', fontWeight: '900', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', marginBottom: '10px', boxSizing: 'border-box' }}
      placeholder="Montant reçu"
    />
    
    {/* CHAMP MONNAIE À RENDRE */}
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: 'rgba(230, 126, 34, 0.1)', borderRadius: '10px', border: '1px dashed #e67e22', boxSizing: 'border-box' }}>
      <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold' }}>MONNAIE :</span>
      <span style={{ fontSize: '16px', fontWeight: '900', color: '#4ade80' }}>
        {montantRecu > total ? (montantRecu - total).toLocaleString() : 0} F
      </span>
    </div>
  </div>
)}

{/* 👇 BLOC AJOUTÉ : UNIQUEMENT POUR LE MODE CRÉDIT */}
{modePaiement === "Crédit" && (
  <div style={{ marginBottom: '15px' }}>
    
    {/* 1. SÉLECTION DU CLIENT */}
    <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>
      CHOISIR LE CLIENT :
    </label>

    {/* 🔍 RECHERCHE EN DIRECT COMPATIBLE ESLINT */}
    <input 
      type="text"
      placeholder="🔍 Rechercher un client..."
      id="search_client_caisse"
      onInput={(e) => {
        const terme = e.target.value.toLowerCase().trim();
        const select = document.getElementById('select_client_caisse');
        if (!select) return;

        let compteur = 0;
        // Parcourir toutes les options du select pour masquer/afficher en direct
        Array.from(select.options).forEach((option) => {
          if (option.value === "") return; // On laisse toujours l'option par défaut

          const texteOption = option.getAttribute('data-search') || '';
          
          if (terme) {
            // Si on recherche, on affiche tout ce qui correspond
            if (texteOption.includes(terme)) {
              option.style.display = "";
            } else {
              option.style.display = "none";
            }
          } else {
            // Si le champ est vide, on masque tout sauf les 5 premiers (qui sont les 5 derniers du tableau inversé)
            if (compteur < 5) {
              option.style.display = "";
            } else {
              option.style.display = "none";
            }
            compteur++;
          }
        });
      }}
      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px', backgroundColor: '#1e293b', color: 'white', marginBottom: '8px', outline: 'none', boxSizing: 'border-box' }}
    />

    <select
      id="select_client_caisse"
      value={clientPourCredit}
      onChange={(e) => setClientPourCredit(e.target.value)}
      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', marginBottom: '12px', cursor: 'pointer', boxSizing: 'border-box' }}
    >
      <option value="" style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>-- Sélectionner un client --</option>
      {(() => {
        // On inverse la liste pour avoir les plus récents en premier
        const clientsInverses = [...(listeClients || [])].reverse();

        if (clientsInverses.length > 0) {
          return clientsInverses.map((client, index) => {
            const idClient = client.id || client.client_id || client.ID;
            const nomComplet = `${client.prenom || ''} ${client.nom || ''} ${client.telephone || ''}`.toLowerCase();
            
            // Par défaut, si pas de recherche, on cache après le 5ème client
            const styleInitial = index >= 5 ? { display: 'none', backgroundColor: '#1e293b', color: 'white' } : { backgroundColor: '#1e293b', color: 'white' };

            return (
              <option 
                key={idClient} 
                value={idClient} 
                data-search={nomComplet} 
                style={styleInitial}
              >
                {client.prenom || ''} {client.nom || ''} {client.telephone ? `(${client.telephone})` : ''}
              </option>
            );
          });
        } else {
          return <option disabled style={{ backgroundColor: '#1e293b', color: '#64748b' }}>Aucun client trouvé</option>;
        }
      })()}
    </select>

    {/* 2. AVANCE VERSÉE */}
    <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>
      AVANCE VERSÉE (OPTIONNEL) :
    </label>
    <input 
      type="number" 
      value={montantRecu}
      onChange={(e) => setMontantRecu(e.target.value)}
      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', fontSize: '20px', fontWeight: '900', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', marginBottom: '12px', boxSizing: 'border-box' }}
      placeholder="0 F"
    />
    
    {/* 3. CHAMP RESTE À PAYER (DETTE) */}
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px', border: '1px dashed #ef4444', boxSizing: 'border-box' }}>
      <span style={{ fontSize: '12px', color: '#fca5a5', fontWeight: 'bold' }}>RESTE À PAYER :</span>
      <span style={{ fontSize: '16px', fontWeight: '900', color: '#f87171' }}>
        {Math.max(0, total - Number(montantRecu || 0)).toLocaleString()} F
      </span>
    </div>
  </div>
)}

{/* BOUTON ENCAISSER SÉCURISÉ */}
<button 
  onClick={() => { 
    effectuerVente(); 
    setMontantRecu(""); 
    setClientPourCredit(""); 
    if (document.getElementById('search_client_caisse')) {
      document.getElementById('search_client_caisse').value = "";
    }
  }} 
  disabled={
    (modePaiement === "Espèce" && (montantRecu < total || !montantRecu)) || 
    (modePaiement === "Crédit" && !clientPourCredit) || 
    panier.length === 0
  }
  style={{ 
    width: '100%', padding: '18px', borderRadius: '15px', border: 'none', color: 'white', fontWeight: '900', fontSize: '16px', 
    cursor: 'pointer', boxSizing: 'border-box',
    backgroundColor: (
      (modePaiement === "Espèce" && (montantRecu < total || !montantRecu)) ||
      (modePaiement === "Crédit" && !clientPourCredit)
    ) ? '#334155' : '#e67e22'
  }}
>
  ENCAISSER
</button>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
  </div>

  {showModalEdit && produitAEditer && (
  <div style={{ 
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', 
    alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' 
  }}>
    <div style={{ 
      backgroundColor: stylesTheme.fondCartes, padding: '30px', borderRadius: '20px', 
      width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: `1px solid ${stylesTheme.bordures}`
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', color: stylesTheme.textePrincipal }}>Modifier le produit</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '13px', color: stylesTheme.texteSecondaire, marginBottom: '5px' }}>Nom du produit</label>
        <input 
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal }}
          value={produitAEditer.nom}
          onChange={e => setProduitAEditer({...produitAEditer, nom: e.target.value})}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '13px', color: stylesTheme.texteSecondaire, marginBottom: '5px' }}>Prix d'achat</label>
        <input 
          type="number"
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal }}
          value={produitAEditer.prix_achat}
          onChange={e => setProduitAEditer({...produitAEditer, prix_achat: Number(e.target.value)})}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', color: stylesTheme.texteSecondaire, marginBottom: '5px' }}>Prix de vente</label>
        <input 
          type="number"
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal }}
          value={produitAEditer.prix_vente}
          onChange={e => setProduitAEditer({...produitAEditer, prix_vente: Number(e.target.value)})}
        />
      </div>

  {/* 🛠️ AJOUT UNIQUE : Affichage de la photo actuelle et sélecteur de fichier local */}
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ display: 'block', fontSize: '13px', color: stylesTheme.texteSecondaire }}>📸 Photo du produit</label>
        {produitAEditer.image_url && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', backgroundColor: stylesTheme.fondApplication, padding: '8px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: stylesTheme.texteSecondaire }}>Actuelle :</span>
              <img 
                src={produitAEditer.image_url} 
                alt="Aperçu actuel" 
                style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover', border: `1px solid ${stylesTheme.bordures}` }} 
              />
            </div>
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm("Voulez-vous vraiment supprimer la photo de ce produit ?")) return;
                try {
                  const response = await fetch(`http://localhost:5000/api/produits/${produitAEditer.id}`, {
                    method: 'PUT',
                    headers: { 
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      nom: produitAEditer.nom,
                      categorie: produitAEditer.categorie || 'Général',
                      prix_achat: Number(produitAEditer.prix_achat),
                      prix_vente: Number(produitAEditer.prix_vente),
                      stock_actuel: Number(produitAEditer.stock_actuel) || 0,
                      stock_minimum: Number(produitAEditer.stock_minimum) || 0,
                      stock_alerte: Number(produitAEditer.stock_alerte) || 0,
                      supprimer_image: true
                    })
                  });

                  if (response.ok) {
                    const data = await response.json();
                    const produitMisAJour = data.produit ? data.produit : { ...produitAEditer, ...data, image_url: null };
                    
                    setProduitAEditer(prev => ({ ...prev, image_url: null, image_fichier: null }));
                    const nouveauxProduits = produits.map(p => p.id === produitAEditer.id ? produitMisAJour : p);
                    setProduits(nouveauxProduits);
                    localStorage.setItem('produits', JSON.stringify(nouveauxProduits));
                    alert("Photo supprimée avec succès !");
                  } else {
                    alert("Erreur lors de la suppression sur le serveur.");
                  }
                } catch (error) {
                  console.error("Erreur:", error);
                  alert("Impossible de contacter le serveur.");
                }
              }}
              style={{ padding: '4px 10px', backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
            >
              ❌ Supprimer
            </button>
          </div>
        )}
        <input 
          type="file" 
          accept="image/*"
          onChange={e => {
            const file = e.target.files[0];
            if (file) {
              setProduitAEditer({...produitAEditer, image_fichier: file});
            }
          }}
          style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, cursor: 'pointer', fontSize: '12px' }}
        />
      </div>

     <div style={{ display: 'flex', gap: '10px' }}>
       <button 
  onClick={async () => {
    try {
      // 🛠️ AJOUT UNIQUE : Utilisation de FormData pour envoyer le fichier image au serveur
      const formData = new FormData();
      formData.append('nom', produitAEditer.nom);
      formData.append('categorie', produitAEditer.categorie || 'Général');
      formData.append('prix_achat', Number(produitAEditer.prix_achat));
      formData.append('prix_vente', Number(produitAEditer.prix_vente));
      formData.append('stock_actuel', Number(produitAEditer.stock_actuel) || 0);
      formData.append('stock_minimum', Number(produitAEditer.stock_minimum) || 0);
      formData.append('stock_alerte', Number(produitAEditer.stock_alerte) || 0);
      
      if (produitAEditer.image_fichier) {
        formData.append('image', produitAEditer.image_fichier);
      }

      // 1. ENVOI AU SERVEUR (Pour que ce soit permanent en base de données)
      const response = await fetch(`http://localhost:5000/api/produits/${produitAEditer.id}`, {
        method: 'PUT',
        headers: { 
          // Note: Pas de Content-Type ici, le navigateur le configure lui-même pour le FormData
          // Ajoute ton token si tu en utilises un pour 'verifierConnexion'
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // Le serveur nous renvoie le produit complet mis à jour (contenant potentiellement la nouvelle URL d'image)
        const produitMisAJour = data.produit ? data.produit : { ...produitAEditer, ...data };

        // 2. Mise à jour de l'affichage local si le serveur a validé
        const nouveauxProduits = produits.map(p => p.id === produitAEditer.id ? produitMisAJour : p);
        setProduits(nouveauxProduits);
        
        // 3. Mise à jour du localStorage par précaution
        localStorage.setItem('produits', JSON.stringify(nouveauxProduits));
        
        setShowModalEdit(false);
        alert("Modifié avec succès !");
      } else {
        alert("Erreur lors de la sauvegarde sur le serveur.");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      alert("Impossible de contacter le serveur.");
    }
  }}
  style={{ 
    flex: 1, padding: '12px', backgroundColor: '#e67e22', color: 'white', 
    border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' 
  }}
>
  Enregistrer
</button>
        <button 
          onClick={() => setShowModalEdit(false)}
          style={{ 
            flex: 1, 
            padding: '12px', 
            // 🛠️ CORRECTION : Utilisation de votre objet de thème existant pour le mode sombre/clair
            backgroundColor: stylesTheme.fondApplication, 
            color: stylesTheme.texteSecondaire, 
            border: `1px solid ${stylesTheme.bordures}`, 
            borderRadius: '10px', 
            fontWeight: 'bold', 
            cursor: 'pointer' 
          }}
        >
          Annuler
        </button>
      </div>
        </div>
      </div>
    )}
  </div>
)}
{ongletActif === 'facturation' && (
  <div style={{ 
    padding: '20px', 
    flex: 1, 
    backgroundColor: stylesTheme.fondApplication, 
    height: '100vh',           /* Prend toute la hauteur disponible */
    maxHeight: '94vh',
    overflow: 'hidden',        /* Coupe les débordements extérieurs : LA PAGE DEVIENT FIXE */
    display: 'flex', 
    flexDirection: 'column', 
    boxSizing: 'border-box',   /* Inclus le padding dans les 100vh */
    fontFamily: 'system-ui, sans-serif' 
  }}>
    
    {/* EN-TÊTE DE LA PAGE */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
      <div>
        <h1 style={{ color: stylesTheme.textePrincipal, fontSize: '24px', fontWeight: '800', margin: 0 }}>
          Générateur de Factures
        </h1>
        <p style={{ color: stylesTheme.texteSecondaire, fontSize: '13px', margin: '4px 0 0 0' }}>
          Gerez, personnalisez et imprimez les factures officielles de vos ventes
        </p>
      </div>
    </div>

    {/* BARRE DES 4 SOUS-ONGLETS MODERNES */}
   <div style={{ 
      display: 'flex', 
      gap: '10px', 
      backgroundColor: stylesTheme.fondApplication, 
      padding: '6px', 
      borderRadius: '12px', 
      marginBottom: '24px',
      maxWidth: 'fit-content',
      border: `1px solid ${stylesTheme.bordures}`,
      flexShrink: 0            /* Empêche les boutons de s'écraser */
    }}>
      <button
        onClick={() => setSousOngletFacture('concevoir')}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: '0.2s',
          backgroundColor: sousOngletFacture === 'concevoir' ? stylesTheme.fondCartes : 'transparent',
          color: sousOngletFacture === 'concevoir' ? stylesTheme.textePrincipal : stylesTheme.texteSecondaire,
          boxShadow: sousOngletFacture === 'concevoir' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
        }}
      >
        🛠️ Concevoir une facture
      </button>
      <button
        onClick={() => setSousOngletFacture('proforma')}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: '0.2s',
          backgroundColor: sousOngletFacture === 'proforma' ? stylesTheme.fondCartes : 'transparent',
          color: sousOngletFacture === 'proforma' ? stylesTheme.textePrincipal : stylesTheme.texteSecondaire,
          boxShadow: sousOngletFacture === 'proforma' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
        }}
      >
        📄 Facture Proforma
      </button>

      {user?.role !== 'vendeur' && (
        <>
          <button
            onClick={() => setSousOngletFacture('mode')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: '0.2s',
              backgroundColor: sousOngletFacture === 'mode' ? stylesTheme.fondCartes : 'transparent',
              color: sousOngletFacture === 'mode' ? stylesTheme.textePrincipal : stylesTheme.texteSecondaire,
              boxShadow: sousOngletFacture === 'mode' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            🎨 Mode de Facture
          </button>

          <button
            onClick={() => setSousOngletFacture('configuration')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: '0.2s',
              backgroundColor: sousOngletFacture === 'configuration' ? stylesTheme.fondCartes : 'transparent',
              color: sousOngletFacture === 'configuration' ? stylesTheme.textePrincipal : stylesTheme.texteSecondaire,
              boxShadow: sousOngletFacture === 'configuration' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            ⚙️ Configuration de la facture
          </button>
        </>
      )}
    </div>
    
    {/* ZONE PRINCIPALE UTILISANT LE RESTE DE L'ÉCRAN DISPONIBLE */}
    <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden', marginBottom: '20px' }}>
      
    {sousOngletFacture === 'concevoir' ? (
  <>
    {/* LOGIQUE DE REGROUPEMENT DES TICKETS PAR NUMÉRO */}
    {(() => {
      const ticketsRegroupes = [];

      if (typeof historique !== 'undefined' && historique.length > 0) {
        historique.forEach(ligne => {
          // On passe tout en minuscules pour ne rater aucune correspondance
          const desigNettoye = (ligne.designation || "").toLowerCase().trim();
          
          // EXCLUSION RADICALE : Si la désignation contient l'un des deux mots-clés, on ignore complètement la ligne
          if (desigNettoye.includes("paiement fournisseur") || desigNettoye.includes("achat stock")) {
            return; // On passe immédiatement à la ligne suivante
          }

          const ticketExistant = ticketsRegroupes.find(t => t.numero_ticket === ligne.numero_ticket);
          
const articleFormate = {
  designation: ligne.designation || "Article",
  quantite: ligne.quantite || 1,
  prix_unitaire: ligne.prix_unitaire_vente || 0
};

if (ticketExistant) {
  // 🌟 CORRECTION CRUCIALE : Si le ticket existe déjà mais qu'il n'avait pas encore le nom du client (ou affichait Client Comptant)
  // et que la ligne actuelle contient les infos du client, on met à jour le nom !
  if (ligne.client_nom_manuel) {
    ticketExistant.client_nom_manuel = ligne.client_nom_manuel;
    ticketExistant.client = ligne.client_nom_manuel;
  } else if ((!ticketExistant.client || ticketExistant.client === "Client Comptant") && (ligne.client_prenom || ligne.client_nom)) {
    ticketExistant.client = `${ligne.client_prenom || ''} ${ligne.client_nom || ''}`.trim();
  }
  
  ticketExistant.articles.push(articleFormate);
  ticketExistant.totalGlobal += (articleFormate.prix_unitaire * articleFormate.quantite);
} else {
  // On extrait proprement l'avance et le reste de la ligne du journal
  const avanceLigne = parseFloat(ligne.avance || ligne.montant_recu || ligne.montantRecu || 0);
  const resteLigne = parseFloat(ligne.reste || ligne.reste_a_payer || ligne.resteAPayer || 0);

  ticketsRegroupes.push({
    numero_ticket: ligne.numero_ticket,
    
    // 🌟 AJOUT : On récupère la colonne de la BDD pour l'injecter dans le ticket regroupé
    client_nom_manuel: ligne.client_nom_manuel || "",
    
    // Ton bloc de détection automatique (Parfait !)
    client: (() => {
      // 🌟 AJOUT PRIORITÉ ABSOLUE : Si un nom manuel existe en BDD, on l'affiche en priorité
      if (ligne.client_nom_manuel) {
        return ligne.client_nom_manuel;
      }

      // 1. Priorité absolue : Si le serveur a renvoyé les colonnes de notre jointure SQL
      if (ligne.client_prenom || ligne.client_nom) {
        return `${ligne.client_prenom || ''} ${ligne.client_nom || ''}`.trim();
      }

      // 2. Si le serveur a envoyé un champ brut complet
      if (ligne.client && typeof ligne.client === 'string' && ligne.client !== "Client Comptant") {
        return ligne.client;
      }

      // 3. Secours : Recherche locale dans la liste des clients si le serveur a juste envoyé l'ID
      if (typeof listeClients !== 'undefined' && Array.isArray(listeClients)) {
        const trouve = listeClients.find(c => c.id === ligne.client_id || c.id === ligne.id_client || c.id === ligne.id_client_facture);
        if (trouve) {
          return `${trouve.prenom || ''} ${trouve.nom || ''}`.trim() || "Client Comptant";
        }
      }

      // 4. Dernier recours : Autres variantes possibles
      return ligne.nom_client || ligne.nom || "Client Comptant";
    })(),
    
    date: ligne.date || new Date().toLocaleDateString('fr-FR'),
    mode_paiement: ligne.mode_paiement || ligne.modePaiement || "Espèce",
    avance: avanceLigne, 
    reste: resteLigne,   
    articles: [articleFormate],
    totalGlobal: (articleFormate.prix_unitaire * articleFormate.quantite)
  });



// 🕵️‍♂️ ESPION LOG (Regardons ce qu'il y a dans "ligne" pour le crédit)
if (ligne.mode_paiement?.toLowerCase().includes('cred') || ligne.modePaiement?.toLowerCase().includes('cred')) {
  console.log("=== CONTENU DE LA LIGNE DE CRÉDIT ===", ligne);
}
          }
        });
      }

      return (
        <>
    {/* COLONNE GAUCHE : Tickets uniques regroupés */}
<div style={{ 
  flex: '1', 
  backgroundColor: stylesTheme.fondCartes, 
  padding: '20px', 
  borderRadius: '12px', 
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
  display: 'flex', 
  flexDirection: 'column', 
  height: '100%',
  overflow: 'hidden',
  border: `1px solid ${stylesTheme.bordures}`,
  boxSizing: 'border-box'
}}>
  <h3 style={{ marginTop: 0, color: stylesTheme.textePrincipal, borderBottom: `1px solid ${stylesTheme.bordures}`, paddingBottom: '10px', marginBottom: '15px', flexShrink: 0 }}>
    Sélectionner une vente du Journal
  </h3>
  
  <div style={{ marginBottom: '15px', position: 'relative', flexShrink: 0 }}>
    <input 
      type="text"
      placeholder="🔍 Rechercher par N° de ticket ou client..."
      value={rechercheFacture}
      onChange={(e) => setRechercheFacture(e.target.value)}
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: '8px',
        border: `1px solid ${stylesTheme.bordures}`,
        backgroundColor: stylesTheme.fondApplication,
        color: stylesTheme.textePrincipal,
        fontSize: '13px',
        outline: 'none',
        boxSizing: 'border-box'
      }}
    />
  </div>

  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
    {ticketsRegroupes.length > 0 ? (
  ticketsRegroupes
    .filter(ticket => {
      const term = rechercheFacture.toLowerCase();
      return (
        ticket.numero_ticket?.toString().toLowerCase().includes(term) ||
        ticket.client?.toLowerCase().includes(term) ||
        ticket.articles.some(art => art.designation.toLowerCase().includes(term))
      );
    })
    .map((ticket, index) => {
      // 🌟 LE SAUVEGARDEUR : Si ce ticket de la liste est celui qu'on a modifié à droite, 
      // on force la liste à conserver son nom au lieu de l'écraser !
      if (venteSelectionnee && String(ticket.numero_ticket) === String(venteSelectionnee.numero_ticket)) {
        ticket.client_nom_manuel = venteSelectionnee.client_nom_manuel;
        ticket.client = venteSelectionnee.client || "Client Comptant";
      }

      // 🌟 CALCUL DU NOMBRE TOTAL D'ARTICLES DANS CE TICKET
      const totalArticles = ticket.articles ? ticket.articles.reduce((acc, art) => acc + (parseFloat(art.quantite || art.qte || 1)), 0) : 0;

      const estSelectionne = venteSelectionnee?.numero_ticket === ticket.numero_ticket;

      return (
        <div 
          key={ticket.numero_ticket || index}
          onClick={() => {
            // 🌟 SÉCURITÉ AU CLIC : On injecte de force les valeurs au moment où on clique dessus
            if (venteSelectionnee && String(ticket.numero_ticket) === String(venteSelectionnee.numero_ticket)) {
              ticket.client_nom_manuel = venteSelectionnee.client_nom_manuel;
              ticket.client = venteSelectionnee.client;
            }
            setVenteSelectionnee(ticket);
          }}
          style={{ 
            padding: '12px', 
            borderRadius: '8px', 
            border: '1px solid', 
            // PLUS DE BLEU NI DE GRIS IMPOSÉ : On utilise uniquement la couleur de fond de tes cartes
            backgroundColor: stylesTheme.fondCartes,
            // Optionnel : une légère accentuation de la bordure existante si sélectionné, sinon bordure normale
            borderColor: estSelectionne ? stylesTheme.textePrincipal : stylesTheme.bordures,
            cursor: 'pointer', 
            transition: '0.2s',
            // Effet d'ombre un peu plus prononcé si sélectionné pour le repérer discrètement
            boxShadow: estSelectionne ? '0 2px 4px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '13px', color: stylesTheme.textePrincipal }}>
            <span>Ticket #{ticket.numero_ticket}</span>
            <span style={{ color: '#10b981' }}>{ticket.totalGlobal.toLocaleString()} F</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: stylesTheme.texteSecondaire, marginTop: '4px', alignItems: 'center' }}>
            <span style={{ fontWeight: estSelectionne ? '700' : 'normal', color: stylesTheme.textePrincipal }}>
              {ticket.client_nom_manuel || ticket.client || "Client Comptant"}
            </span>
            <span style={{ 
              backgroundColor: stylesTheme.fondApplication, 
              padding: '2px 6px', 
              borderRadius: '4px', 
              fontWeight: '700', 
              fontSize: '11px', 
              color: stylesTheme.textePrincipal, 
              border: `1px solid ${stylesTheme.bordures}` 
            }}>
              {ticket.mode_paiement}
            </span>
          </div>

          {/* 🌟 ZONE ENTOURÉE : Affichage discret du nombre d'articles sous le nom du client */}
          <div style={{ fontSize: '11px', color: stylesTheme.texteSecondaire, marginTop: '2px', fontStyle: 'italic' }}>
            {totalArticles} {totalArticles > 1 ? 'articles' : 'article'} achete(s)
          </div>

          <div style={{ fontSize: '11px', color: stylesTheme.texteSecondaire, marginTop: '4px', textAlign: 'right' }}>
            {ticket.date}
          </div>
        </div>
      );
    })
) : (
  <p style={{ color: stylesTheme.texteSecondaire, fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
    Aucune vente disponible dans l'historique...
  </p>
)}
  </div>
</div>

 {/* COLONNE DROITE : Élargie à flex: '1.8' pour donner plus d'espace à l'aperçu */}
<div style={{ 
  flex: '1.8', 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center', 
  height: '100%',
  overflow: 'hidden' 
}}>
  {/* Conteneur d'en-tête principal aligné sur une seule ligne */}
<div style={{ 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  width: '100%', 
  marginBottom: '15px',
  flexShrink: 0 
}}>
  
  {/* Titre à gauche */}
  <h3 style={{ marginTop: 0, marginBottom: 0, color: stylesTheme.textePrincipal, display: 'flex', alignItems: 'center', gap: '6px' }}>
    👁️ Aperçu de la Facture
  </h3>
  
  {/* ZONE ACTIONS : Saisie et bouton poussés tout à fait à droite */}
{venteSelectionnee && venteSelectionnee.mode_paiement !== 'Crédit' && (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    backgroundColor: stylesTheme.fondApplication, 
    padding: '6px 12px', 
    borderRadius: '8px', 
    border: `1px solid ${stylesTheme.bordures}`,
    width: '450px'
  }}>
    {/* Champ de saisie du nom mis à jour et nettoyé */}
<div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
  <span style={{ fontSize: '13px', fontWeight: 'bold', color: stylesTheme.texteSecondaire, whiteSpace: 'nowrap' }}>
    Nom du Client :
  </span>
  <input
    type="text"
    id="input-nom-client-manuel"
    /* 🌟 On lit directement la valeur de la facture sélectionnée */
    value={venteSelectionnee?.client_nom_manuel || (venteSelectionnee?.client !== "Client Comptant" ? venteSelectionnee?.client : "") || ""}
    placeholder="Ex: Établissement Diallo, Traoré..."
    onChange={(e) => {
      const valeur = e.target.value;
      
      // On met à jour l'objet sélectionné en direct pendant qu'on écrit
      if (venteSelectionnee) {
        venteSelectionnee.client_nom_manuel = valeur;
        venteSelectionnee.client = valeur || "Client Comptant";
      }
      
      // On force l'aperçu à se redessiner à chaque lettre tapée
      setVenteSelectionnee({ ...venteSelectionnee });
    }}
    style={{
      width: '100%',
      padding: '6px 10px',
      fontSize: '13px',
      border: `1px solid ${stylesTheme.bordures}`,
      borderRadius: '6px',
      outline: 'none',
      backgroundColor: stylesTheme.fondCartes,
      color: stylesTheme.textePrincipal
    }}
  />
</div>

  {/* Bouton Enregistrer */}
<button
  type="button"
  onClick={async () => {
    const inputNom = document.getElementById('input-nom-client-manuel');
    const valeurSaisie = inputNom ? inputNom.value.trim() : "";
    
    if (venteSelectionnee?.numero_ticket) {
      // 1. On applique directement la valeur sur l'aperçu de droite
      venteSelectionnee.client_nom_manuel = valeurSaisie;
      venteSelectionnee.client = valeurSaisie || "Client Comptant";

      // 2. On grave le nom dans pgAdmin en arrière-plan
      await graverNomClientManuel(venteSelectionnee.numero_ticket, valeurSaisie);

      // 3. 🌟 L'ACTUALISATION INFAILLIBLE : On appelle ta vraie fonction du journal !
      // L'écran ne clignote pas, l'onglet ne bouge pas, mais ta liste se met à jour.
      if (typeof window.maFonctionDeRecharge === 'function') {
        await window.maFonctionDeRecharge();
      }

      // 4. On force l'aperçu de droite à se redessiner
      setVenteSelectionnee({ ...venteSelectionnee });
      
      alert("Le nom du client a été enregistré avec succès !");
    }
  }}
  style={{
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 'bold',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: '0.2s',
    whiteSpace: 'nowrap'
  }}
  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
>
  💾 Enregistrer
</button>
  </div>
)}
</div> 
  
  
  <div style={{ 
    width: '100%', 
    height: '100%',
    backgroundColor: stylesTheme.fondCartes, 
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
    border: `1px solid ${stylesTheme.bordures}`,
    borderRadius: '4px',
    padding: '40px',
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden'
  }}>
    
    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
      {venteSelectionnee ? (
        (() => {
          // --- FONCTION DE CONVERSION DU MONTANT EN LETTRES SANS AUCUN UNDEFINED ---
          const nombreEnLettres = (num) => {
            if (num === 0) return "Zéro";

            const unites = ["", "Un", "Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf", 
                            "Dix", "Onze", "Douze", "Treize", "Quatorze", "Quinze", "Seize", "Dix-Sept", "Dix-Huit", "Dix-Neuf"];
            const dizaines = ["", "", "Vingt", "Trente", "Quarante", "Cinquante", "Soixante", "Soixante", "Quatre-Vingt", "Quatre-Vingt"];

            const convertirMoinsDe100 = (n) => {
              if (n < 20) return unites[n];
              const d = Math.floor(n / 10);
              const r = n % 10;
              if (d === 7) {
                if (r === 1) return "Soixante et Onze";
                return "Soixante-" + unites[10 + r].toLowerCase();
              }
              if (d === 9) {
                if (r === 1) return "Quatre-Vingt-Onze";
                return "Quatre-Vingt-" + unites[10 + r].toLowerCase();
              }
              let liaison = "";
              if (r === 1 && d !== 8) {
                liaison = " et ";
              } else if (r > 0) {
                liaison = "-";
              }
              return dizaines[d] + (r > 0 ? liaison + unites[r].toLowerCase() : "");
            };

            const convertirMoinsDe1000 = (n) => {
              const c = Math.floor(n / 100);
              const reste = n % 100;
              let res = "";
              if (c > 0) {
                res += (c === 1 ? "Cent" : unites[c] + " Cent");
              }
              if (reste > 0) {
                res += (res ? " " : "") + convertirMoinsDe100(reste);
              }
              return res;
            };

            let md = Math.floor(num / 1000000000);
            let resteMd = num % 1000000000;
            let mi = Math.floor(resteMd / 1000000);
            let resteMi = resteMd % 1000000;
            let m = Math.floor(resteMi / 1000);
            let resteM = resteMi % 1000;

            let txt = "";
            if (md > 0) txt += (md === 1 ? "Un Milliard " : convertirMoinsDe1000(md) + " Milliards ");
            if (mi > 0) txt += (mi === 1 ? "Un Million " : convertirMoinsDe1000(mi) + " Millions ");
            if (m > 0) txt += (m === 1 ? "Mille " : convertirMoinsDe1000(m) + " Mille ");
            if (resteM > 0) txt += convertirMoinsDe1000(resteM);

            return txt.trim();
          };

          // 1. Détection stricte et robuste du mode crédit
          const estUnCredit = 
            (venteSelectionnee.mode_paiement && venteSelectionnee.mode_paiement.toLowerCase().includes('crédit')) ||
            (venteSelectionnee.mode_paiement && venteSelectionnee.mode_paiement.toLowerCase().includes('credit')) ||
            venteSelectionnee.statut === 'credit' ||
            venteSelectionnee.type_vente === 'credit' ||
            (venteSelectionnee.reste !== undefined && parseFloat(venteSelectionnee.reste) > 0) ||
            (venteSelectionnee.montant_paye !== undefined && parseFloat(venteSelectionnee.montant_paye) < parseFloat(venteSelectionnee.totalGlobal));

          // 2. Extraction sécurisée du montant payé / avance
          const totalFacture = venteSelectionnee.totalGlobal || 0;
          const avanceClient = venteSelectionnee.avance !== undefined ? parseFloat(venteSelectionnee.avance) : 
                               (venteSelectionnee.montant_paye !== undefined ? parseFloat(venteSelectionnee.montant_paye) : 0);
          
          // 3. Calcul intelligent ou récupération du reste à payer
          let resteAPayer = 0;
          if (estUnCredit) {
            if (venteSelectionnee.reste !== undefined && parseFloat(venteSelectionnee.reste) > 0) {
              resteAPayer = parseFloat(venteSelectionnee.reste);
            } else if (venteSelectionnee.montant_total !== undefined && venteSelectionnee.montant_paye !== undefined) {
              resteAPayer = parseFloat(venteSelectionnee.montant_total) - parseFloat(venteSelectionnee.montant_paye);
            } else {
              resteAPayer = totalFacture - avanceClient;
            }
          }

       const nomClientAffiche = venteSelectionnee.client || "Client Comptant";

          // Bloc Reste à payer réutilisable pour éviter les répétitions
          const renderBlocCredit = (borderRadiusValue) => estUnCredit && (
  <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
    <div style={{ padding: '12px', backgroundColor: stylesTheme.fondApplication, borderRadius: borderRadiusValue || '0px', border: `1px solid ${stylesTheme.bordures}` }}>
      <span style={{ color: stylesTheme.texteSecondaire, display: 'block', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Acompte Versé</span>
      <strong style={{ color: stylesTheme.textePrincipal, fontSize: '14px' }}>{avanceClient.toLocaleString()} FCFA</strong>
    </div>
    <div style={{ padding: '12px', backgroundColor: stylesTheme.fondApplication === '#ffffff' ? '#fef2f2' : '#2d1f1f', borderRadius: borderRadiusValue || '0px', border: `1px solid ${stylesTheme.fondApplication === '#ffffff' ? '#fee2e2' : '#4a2424'}` }}>
      <span style={{ color: '#ef4444', display: 'block', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Reste à Payer</span>
      <strong style={{ color: '#dc2626', fontSize: '14px' }}>{resteAPayer.toLocaleString()} FCFA</strong>
    </div>
  </div>
);


// ==========================================
// MODÈLE 1 : MINIMALISTE ÉPURÉ (Design Linéaire, Pas de blocs de couleurs)
// ==========================================
if (modeleSelectionne === 'minimaliste') {
  return (
   <div style={{ fontFamily: '"Courier New", Courier, monospace', color: '#111827', backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', fontSize: '13px' }}>
      
      {/* EN-TÊTE : LOGO À L'EXTRÊME GAUCHE ET INFORMATIONS ÉLARGIES À DROITE */}
      {/* 🌟 Ajustement des marges ici : paddingBottom 10px et marginBottom 15px */}
     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #111827', paddingBottom: '10px', marginTop: '-50px', marginBottom: '15px' }}>
        
        {/* BLOC LOGO (CALÉ À GAUCHE) */}
        <div style={{ 
          width: '200px', /* Ta largeur raisonnable */
          height: '250px', /* 🌟 Fixé à 250px comme demandé */
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-start', 
          backgroundColor: factureConfig.logo ? 'transparent' : '#f9fafb',
          border: factureConfig.logo ? 'none' : '1px dashed #6b7280', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          {factureConfig.logo ? (
            <img 
              src={factureConfig.logo} 
              alt="Logo" 
              /* L'image s'adapte parfaitement à la hauteur fixe de 250px sans déformer */
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left center' }} 
            />
          ) : (
            <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', color: '#6b7280', paddingLeft: '10px' }}>
              [ Logo ]
            </span>
          )}
        </div>

        {/* INFORMATIONS ENTREPRISE ÉLARGIES ET RIB INTEGRÉ (À DROITE) */}
        <div style={{ textAlign: 'right', fontSize: '13px', lineHeight: '1.4' }}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{factureConfig.nom}</p>
          <p style={{ margin: 0 }}>{factureConfig.adresse}</p>
          <p style={{ margin: 0 }}>{factureConfig.email}</p>
          <p style={{ margin: 0 }}>{factureConfig.site}</p>
          {factureConfig.rib && <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontStyle: 'italic', color: '#374151' }}>RIB: {factureConfig.rib}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
        <div>
          <p style={{ margin: 0 }}><strong>FACTURE N°:</strong> 000{venteSelectionnee.numero_ticket}</p>
          <p style={{ margin: '4px 0 0 0' }}><strong>DATE:</strong> {venteSelectionnee.date}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0 }}><strong>Client:</strong></p>
          <p style={{ margin: '4px 0 0 0', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '14px' }}>
            {venteSelectionnee?.client_nom_manuel || (venteSelectionnee?.client && venteSelectionnee.client !== "Client Comptant" ? venteSelectionnee.client : "CLIENT COMPTANT")}
          </p>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #111827' }}>
            <th style={{ textAlign: 'center', padding: '8px', width: '40px' }}>QTÉ</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>DESCRIPTION</th>
            <th style={{ textAlign: 'right', padding: '8px', width: '100px' }}>P.UNIT</th>
            <th style={{ textAlign: 'right', padding: '8px', width: '110px' }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {venteSelectionnee.articles?.map((art, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #111827' }}>
              <td style={{ textAlign: 'center', padding: '8px' }}>{art.quantite}</td>
              <td style={{ textAlign: 'left', padding: '8px' }}>{art.designation}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>{(art.prix_unitaire_vente || art.prix_unitaire || 0).toLocaleString()}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>{((art.prix_unitaire_vente || art.prix_unitaire || 0) * art.quantite).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
        <div style={{ width: '220px', borderTop: '2px solid #111827', paddingTop: '8px', textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>NET À PAYER : {totalFacture.toLocaleString()} FCFA</p>
        </div>
      </div>
      
      <div style={{ paddingLeft: '5px', lineHeight: '1.6', fontSize: '12px', color: '#1f2937' }}>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>Arrêtée la présente Facture à la somme de :</strong> {nombreEnLettres(totalFacture)} Francs CFA
        </p>
        
        {estUnCredit && (
          <div style={{ marginTop: '5px', borderTop: '1px dashed #cbd5e1', paddingTop: '5px' }}>
            <p style={{ margin: '0 0 4px 0', color: '#4b5563' }}><strong>Déjà payé :</strong> {avanceClient.toLocaleString()} FCFA</p>
            <p style={{ margin: 0, color: '#dc2626', fontWeight: '600' }}><strong>Reste à payer :</strong> {resteAPayer.toLocaleString()} FCFA</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', borderTop: '1px dashed #111827', paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }}>
        <span>CLIENT</span>
        <span>LE PRESTATAIRE</span>
      </div>
    </div>
  );
}
// ==========================================
// MODÈLE 2 : LUXE & PRESTIGE (Asymétrique, Lettrines, Noir & Or)
// ==========================================
if (modeleSelectionne === 'luxe') {
  return (
    <div style={{ 
      fontFamily: '"Helvetica Neue", Arial, sans-serif', 
      color: '#000000', 
      fontSize: '12px', 
      padding: '40px', 
      backgroundColor: '#ffffff', 
      width: '100%', 
      maxWidth: '794px', 
      boxSizing: 'border-box'
    }}>
      
     {/* EN-TÊTE : LOGO À GAUCHE ET INFORMATIONS DE L'ENTREPRISE À DROITE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #111827', paddingBottom: '20px', marginBottom: '25px' }}>
        
       {/* Côté gauche : Logo Dynamique */}
<div style={{ 
  width: '200px', 
  height: '250px', 
  marginTop: '-70px', /* 🌟 Fait monter uniquement le logo côté gauche */
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'flex-start', 
  backgroundColor: factureConfig.logo ? 'transparent' : '#fafafa',
  border: factureConfig.logo ? 'none' : '1px solid #000000', 
  borderRadius: '12px',
  overflow: 'hidden'
}}>
  {factureConfig.logo ? (
    <img 
      src={factureConfig.logo} 
      alt="Logo" 
      style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left center' }} 
    />
  ) : (
    <span style={{ fontSize: '11px', color: '#666666', fontWeight: 'bold', letterSpacing: '1px', paddingLeft: '15px' }}>
      [ EMPLACEMENT LOGO ]
    </span>
  )}
</div>

        {/* Côté droit : Remplacement du titre par les informations de l'entreprise */}
        <div style={{ textAlign: 'right', fontSize: '13px', lineHeight: '1.4' }}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px', letterSpacing: '1px' }}>{factureConfig.nom}</p>
          <p style={{ margin: '4px 0 0 0' }}>{factureConfig.adresse}</p>
          <p style={{ margin: '2px 0 0 0' }}>{factureConfig.email}</p>
          <p style={{ margin: '2px 0 0 0' }}>{factureConfig.site}</p>
          {factureConfig.rib && (
            <p style={{ margin: '6px 0 0 0', fontSize: '12px', fontStyle: 'italic', color: '#374151' }}>
              RIB: {factureConfig.rib}
            </p>
          )}
        </div>
      </div>

      {/* METADONNÉES : NUMÉRO, DATE & CLIENT */}
      <div style={{ display: 'flex', border: '1px solid #000000', borderRadius: '12px 12px 0 0', borderBottom: 'none', overflow: 'hidden' }}>
        <div style={{ flex: 2, padding: '10px 15px', borderRight: '1px solid #000000' }}>
          <span style={{ fontSize: '10px', color: '#555555', display: 'block', marginBottom: '2px' }}>DÉLIVRÉE À :</span>
          <strong style={{ fontSize: '14px' }}>{nomClientAffiche}</strong>
        </div>
        <div style={{ flex: 1, padding: '10px 15px', borderRight: '1px solid #000000' }}>
          <span style={{ fontSize: '10px', color: '#555555', display: 'block', marginBottom: '2px' }}>FACTURE N° :</span>
          <strong>#000{venteSelectionnee.numero_ticket}</strong>
        </div>
        <div style={{ flex: 1, padding: '10px 15px' }}>
          <span style={{ fontSize: '10px', color: '#555555', display: 'block', marginBottom: '2px' }}>DATE :</span>
          <strong>{venteSelectionnee.date}</strong>
        </div>
      </div>

      {/* TABLEAU PRINCIPAL STYLE "CARNET" */}
      <div style={{ border: '1px solid #000000', borderRadius: '0 0 12px 12px', overflow: 'hidden', marginBottom: '25px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#000000', color: '#ffffff' }}>
              <th style={{ padding: '10px', textAlign: 'center', width: '60px', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #ffffff' }}>QTÉ</th>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #ffffff' }}>DESIGNATION DES PRESTATIONS</th>
              <th style={{ padding: '10px', textAlign: 'right', width: '110px', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #ffffff' }}>P. UNITAIRE</th>
              <th style={{ padding: '10px', textAlign: 'right', width: '130px', fontSize: '11px', fontWeight: 'bold' }}>MONTANT</th>
            </tr>
          </thead>
          <tbody>
            {venteSelectionnee.articles?.map((art, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #000000' }}>{art.quantite}</td>
                <td style={{ padding: '12px 10px', fontWeight: '500', borderRight: '1px solid #000000' }}>{art.designation}</td>
                <td style={{ padding: '12px 10px', textAlign: 'right', borderRight: '1px solid #000000' }}>{(art.prix_unitaire_vente || art.prix_unitaire || 0).toLocaleString()} F</td>
                <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 'bold' }}>{((art.prix_unitaire_vente || art.prix_unitaire || 0) * art.quantite).toLocaleString()} F</td>
              </tr>
            ))}
            {/* Lignes vides pour remplir l'espace */}
            {[...Array(Math.max(0, 3 - (venteSelectionnee.articles?.length || 0)))].map((_, i) => (
              <tr key={`empty-${i}`} style={{ height: '35px', borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ borderRight: '1px solid #000000' }}></td>
                <td style={{ borderRight: '1px solid #000000' }}></td>
                <td style={{ borderRight: '1px solid #000000' }}></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECTION FINALE SOUDÉE (ÉVITE TOUT SAUT DE PAGE INTEMPESTIF LORS DE L'EXPORT) */}
      <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          
          {/* Bloc de gauche : Signatures (entouré en vert) */}
          <div style={{ width: '340px', border: '1px solid #000000', borderRadius: '12px', padding: '15px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold' }}>
              <span>BON POUR ACCORD</span>
              <span>LA DIRECTION</span>
            </div>
            <div style={{ height: '65px' }}></div>
          </div>

          {/* Bloc de droite : Calculs financiers ET la mention en lettres remontée ici */}
          <div style={{ width: '300px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '15px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 0', color: '#555555' }}>SOMME TOTALE :</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: '600' }}>{totalFacture.toLocaleString()} F</td>
                </tr>
                
                {estUnCredit && (
                  <>
                    <tr>
                      <td style={{ padding: '4px 0', color: '#555555' }}>DÉJÀ PAYÉ :</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', color: '#4b5563' }}>{avanceClient.toLocaleString()} F</td>
                    </tr>
                    <tr style={{ borderTop: '1px dashed #000000' }}>
                      <td style={{ padding: '4px 0', fontWeight: 'bold', color: '#dc2626' }}>RESTE À PAYER :</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>{resteAPayer.toLocaleString()} F</td>
                    </tr>
                  </>
                )}

                <tr style={{ borderTop: '2px solid #000000' }}>
                  <td style={{ padding: '8px 0', fontWeight: 'bold', fontSize: '13px' }}>NET À PAYER :</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '900', fontSize: '16px' }}>{totalFacture.toLocaleString()} FCFA</td>
                </tr>
              </tbody>
            </table>

            {/* Le montant en lettres est maintenant intégré juste ici sous les totaux pour être dans la facture */}
            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '11px', lineHeight: '1.4' }}>
              <strong>Arrêtée la présente Facture à la somme de :</strong><br />
              {nombreEnLettres(totalFacture)} Francs CFA
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

// ==========================================
// MODÈLE 3 : CORPORATE (Inspiré du modèle vert/turquoise)
// ==========================================
if (modeleSelectionne === 'corporate') {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#1f2937', fontSize: '13px', backgroundColor: '#ffffff', padding: '20px 30px', width: '794px', height: '1123px', position: 'relative', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      
      {/* Ligne décorative supérieure gauche */}
      <div style={{ width: '45%', height: '4px', backgroundColor: '#005f73', position: 'absolute', top: '30px', left: '0' }}></div>
      <div style={{ width: '22%', height: '4px', backgroundColor: '#0a9396', position: 'absolute', top: '34px', left: '0' }}></div>

      {/* EN-TÊTE : Infos Facture à gauche et Emplacement Logo à droite */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '45px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'normal', color: '#000000', letterSpacing: '0.5px', lineHeight: '1.2' }}>
            FACTURE<br />
            N°: 000{venteSelectionnee.numero_ticket}
          </h1>
          <div style={{ width: '120px', height: '2px', backgroundColor: '#0a9396', margin: '8px 0 12px 0' }}></div>
          <p style={{ margin: 0, fontSize: '13px', color: '#000000', fontWeight: 'normal' }}>
            Date: {venteSelectionnee.date}
          </p>
        </div>

       {/* --- ZONE LOGO DYNAMIQUE CALÉ À GAUCHE (REMONTE) --- */}
        <div style={{ 
          width: '200px', 
          height: '250px', 
          marginTop: '-100px', /* Fait remonter l'emplacement du logo vers le haut */
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-start', /* Aligne le logo à l'extrême gauche */
          backgroundColor: factureConfig.logo ? 'transparent' : '#f8fafc',
          border: factureConfig.logo ? 'none' : '1px solid #cbd5e1', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          {factureConfig.logo ? (
            <img 
              src={factureConfig.logo} 
              alt="Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left center' }} 
            />
          ) : (
            <span style={{ fontSize: '13px', color: '#94a3b8', paddingLeft: '15px' }}>
              [ Emplacement Logo ]
            </span>
          )}
        </div>
      </div>

      {/* BLOC CLIENT */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px', marginTop: '-50px' }}>
        <div style={{ fontSize: '15px', color: '#000000' }}>
          <span style={{ color: '#0a9396', marginRight: '15px', fontSize: '22px', fontWeight: '300' }}>|</span>
          Client: {nomClientAffiche}
        </div>
      </div>

      {/* TABLEAU DE FACTURATION */}
      <div style={{ marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
          <thead>
            <tr style={{ backgroundColor: '#0a9396', color: 'white' }}>
              <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '13px', fontWeight: 'normal', borderRadius: '10px 0 0 10px', width: '45%' }}>DESCRIPTION</th>
              <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '13px', fontWeight: 'normal', width: '15%' }}>QTÉ</th>
              <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '13px', fontWeight: 'normal', width: '20%' }}>Prix.U</th>
              <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '13px', fontWeight: 'normal', borderRadius: '0 10px 10px 0', width: '20%' }}>Montant</th>
            </tr>
          </thead>
          <tbody>
            {venteSelectionnee.articles?.map((art, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 1 ? '#ffffff' : '#f1f5f9' }}>
                <td style={{ padding: '14px 15px', color: '#4b5563', fontSize: '13px', borderBottom: '1px solid #e2e8f0' }}>{art.designation}</td>
                <td style={{ padding: '14px 15px', textAlign: 'center', color: '#4b5563', fontSize: '13px', borderBottom: '1px solid #e2e8f0' }}>{art.quantite}</td>
                <td style={{ padding: '14px 15px', textAlign: 'right', color: '#4b5563', fontSize: '13px', borderBottom: '1px solid #e2e8f0' }}>{(art.prix_unitaire_vente || art.prix_unitaire || 0).toLocaleString()} </td>
                <td style={{ padding: '14px 15px', textAlign: 'right', color: '#4b5563', fontSize: '13px', borderBottom: '1px solid #e2e8f0' }}>{((art.prix_unitaire_vente || art.prix_unitaire || 0) * art.quantite).toLocaleString()} FCFA</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BLOC BAS : TOTAL ET SIGNATURES */}
      <div style={{ padding: '30px 25px', backgroundColor: '#e5e7eb', borderRadius: '6px', minHeight: '180px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ width: '55%', fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
            <strong>Arrêtée la présente Facture à la somme de :</strong><br />
            <span style={{ textTransform: 'capitalize', fontWeight: 'normal' }}>{nombreEnLettres(totalFacture)} Francs CFA</span>
          </div>
          
          <div style={{ backgroundColor: '#005f73', color: 'white', padding: '12px 20px', fontSize: '14px', fontWeight: 'normal', minWidth: '220px', textAlign: 'right' }}>
            Montant TOTAL : {totalFacture.toLocaleString()} FCFA
          </div>
        </div>

        {estUnCredit && (
          <div style={{ marginTop: '5px', borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginBottom: '20px' }}>
            <p style={{ margin: '0 0 4px 0', color: '#4b5563', fontSize: '12px' }}><strong>Déjà payé :</strong> {avanceClient.toLocaleString()} FCFA</p>
            <p style={{ margin: 0, color: '#dc2626', fontWeight: '600', fontSize: '12px' }}><strong>Reste à payer :</strong> {resteAPayer.toLocaleString()} FCFA</p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'normal', color: '#374151', padding: '0 40px' }}>
          <span>POUR ACQUIT</span>
          <span>LE PRESTATAIRE</span>
        </div>
      </div>

     {/* PIED DE PAGE IMPOSÉ TOUT EN BAS DE LA FEUILLE ET SUR TOUTE LA LARGEUR */}
      <div style={{ 
        position: 'absolute', 
        bottom: '0px',             /* Fixé à l'extrême bas de la feuille */
        left: '0px',               /* Aligné pile sur le bord gauche */
        width: '794px',            /* Prend exactement la largeur totale de la facture (794px) */
        backgroundColor: '#005f73', 
        color: '#ffffff', 
        padding: '10px 30px',      /* Réduit de 15px à 10px pour être plus compact */
        textAlign: 'center', 
        fontSize: '9px',           /* Taille de texte réduite (au lieu de 11px) */
        lineHeight: '1',         /* Interligne resserré (au lieu de 1.5) */
        letterSpacing: '0.3px',
        boxSizing: 'border-box'    /* Évite que le padding n'élargisse le bloc au-delà des 794px */
      }}>
        <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{factureConfig.nom}</span>
        {factureConfig.adresse && <span> • 📍 {factureConfig.adresse}</span>}
        {factureConfig.email && <span> • ✉️ {factureConfig.email}</span>}
        {factureConfig.site && <span> • 🌐 {factureConfig.site}</span>}
        {factureConfig.rib && (
          <div style={{ 
            marginTop: '4px', 
            fontSize: '8.5px',      /* Taille du texte du RIB réduite */
            opacity: 0.8, 
           
            paddingTop: '3px' 
          }}>
            <strong>RIB :</strong> {factureConfig.rib}
          </div>
        )}
      </div>

    </div>
  );
}

// ==========================================
// MODÈLE 4 : PREMIUM ROYAL (Look Violet moderne, Cartes & Badges)
// ==========================================
if (modeleSelectionne === 'premium') {
  return (
    <div className="zone-facture-blanche" style={{ 
      fontSize: '13px', 
      color: '#1e293b', 
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      position: 'relative',
      backgroundColor: '#ffffff',
      width: '100%',
      maxWidth: '794px',
      minHeight: '1060px', /* Hauteur A4 idéale sans forcer un écrasement */
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      padding: '40px 40px 0 40px',
      overflow: 'hidden'
    }}>
      
      {/* Contenu principal supérieur */}
      <div style={{ flex: '1 0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Décoration d'arrière-plan en haut à droite */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '300px',
          height: '220px',
          background: 'radial-gradient(circle, rgba(45,212,191,0.15) 0%, rgba(14,116,144,0.04) 100%)',
          borderBottomLeftRadius: '100px',
          zIndex: -1,
          pointerEvents: 'none'
        }}></div>

        {/* EN-TÊTE : Logo et Titre de la Facture */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
  <div style={{ 
    width: '200px', 
    height: '250px', 
    border: factureConfig.logo ? 'none' : '1px dashed #cbd5e1', 
    borderRadius: '6px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: '#94a3b8', 
    backgroundColor: factureConfig.logo ? 'transparent' : '#f8fafc',
    overflow: 'hidden'
  }}>
    {factureConfig.logo ? (
      <img 
        src={factureConfig.logo} 
        alt="Logo" 
        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
      />
    ) : (
      <span style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '0.5px' }}>[ Emplacement Logo ]</span>
    )}
  </div>
          
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '28px', fontWeight: '800', letterSpacing: '1px', lineHeight: '1' }}>FACTURE</h2>
            <p style={{ margin: '6px 0 2px 0', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
              Numéro: <span style={{ color: '#0f172a', fontWeight: '700' }}>000{venteSelectionnee.numero_ticket}</span>
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
              Date: <span style={{ color: '#0f172a', fontWeight: '700' }}>{venteSelectionnee.date}</span>
            </p>
          </div>
        </div>

        {/* BLOC CLIENT */}
<div style={{ marginTop: '-60px', marginBottom: '30px', paddingLeft: '4px', borderLeft: '3px solid #0f7490' }}>
  <h4 style={{ margin: '0 0 2px 0', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#0e7490', fontWeight: '700' }}>CLIENT</h4>
  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
    {nomClientAffiche}
  </p>
</div>

        {/* TABLEAU DE FACTURATION */}
        <div style={{ marginBottom: '30px' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #134e5e 0%, #0f7490 100%)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: 'white', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description de l'article</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '11px', fontWeight: '600', color: 'white', width: '60px', textTransform: 'uppercase' }}>Qté</th>
                <th style={{ textAlign: 'right', padding: '12px 12px', fontSize: '11px', fontWeight: '600', color: 'white', width: '110px', textTransform: 'uppercase' }}>Prix U.</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: 'white', width: '130px', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', textTransform: 'uppercase' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {venteSelectionnee.articles?.map((art, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                  <td style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontWeight: '500' }}>{art.designation}</td>
                  <td style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{art.quantite}</td>
                  <td style={{ textAlign: 'right', padding: '12px 12px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>
                    {(art.prix_unitaire_vente || art.prix_unitaire || 0).toLocaleString()} F
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #f1f5f9', color: '#0f172a', fontWeight: '700' }}>
                    {((art.prix_unitaire_vente || art.prix_unitaire || 0) * art.quantite).toLocaleString()} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BLOC DES RECAPITULATIFS (TOTAL & SOMME EN LETTRES) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '30px', marginBottom: '40px' }}>
          <div style={{ flex: 1, maxWidth: '55%', lineHeight: '1.6', fontSize: '12px', color: '#334155' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Arrêtée la présente Facture à la somme de :</strong><br />
              <span style={{ color: '#0f172a', fontWeight: '500' }}>{nombreEnLettres(totalFacture)} Francs CFA</span>
            </p>
            
            {estUnCredit && (
              <div style={{ marginTop: '12px', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                <p style={{ margin: '0 0 4px 0', color: '#475569' }}><strong>Déjà payé :</strong> {avanceClient.toLocaleString()} FCFA</p>
                <p style={{ margin: 0, color: '#b91c1c', fontWeight: '700' }}><strong>Reste à payer :</strong> {resteAPayer.toLocaleString()} FCFA</p>
              </div>
            )}
          </div>

          <div style={{ width: '220px', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', fontSize: '12px' }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>SOUS TOTAL</span>
              <span style={{ color: '#475569', fontWeight: '600' }}>{totalFacture.toLocaleString()} F</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', fontSize: '13px', borderTop: '1px solid #e2e8f0' }}>
              <span style={{ color: '#0f172a', fontWeight: '800' }}>TOTAL NET</span>
              <span style={{ color: '#0f7490', fontWeight: '800' }}>{totalFacture.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>
 {/* Zone des Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 30px', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '50px' }}>
          <span style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px', minWidth: '120px', textAlign: 'center', letterSpacing: '0.5px' }}>POUR ACQUIT</span>
          <span style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px', minWidth: '120px', textAlign: 'center', letterSpacing: '0.5px' }}>LE PRESTATAIRE</span>
        </div>

      </div>

     {/* PIED DE PAGE : Signatures et Bandeau de couleur fixés en bas de page */}
      <div style={{ 
        position: 'absolute', 
        bottom: '0px',             /* Fixé à l'extrême bas de la feuille */
        left: '0px',               /* Aligné pile sur le bord gauche */
        width: '794px',            /* Prend exactement la largeur totale de la feuille */
        boxSizing: 'border-box'
      }}>
        
        {/* Bande décorative premium en bas de page */}
        <div style={{
          minHeight: '35px',       /* Permet au bandeau de s'agrandir un peu si le texte passe sur 2 lignes */
          background: 'linear-gradient(90deg, #0f7490 0%, #134e5e 100%)',
          borderTopLeftRadius: '30px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '8px 30px',     /* Espace interne pour le texte */
          color: '#ffffff',
          fontSize: '9px',         /* Écriture petite et discrète */
          lineHeight: '1',
          letterSpacing: '0.3px',
          boxSizing: 'border-box'
        }}>
          <div>
            <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{factureConfig.nom}</span>
            {factureConfig.adresse && <span> • 📍 {factureConfig.adresse}</span>}
            {factureConfig.email && <span> • ✉️ {factureConfig.email}</span>}
            {factureConfig.site && <span> • 🌐 {factureConfig.site}</span>}
          </div>
          {factureConfig.rib && (
            <div style={{ 
              marginTop: '3px', 
              fontSize: '8.5px', 
              opacity: 0.8, 
              borderTop: '0.5px solid rgba(255, 255, 255, 0.15)', 
              paddingTop: '3px',
              width: '100%',
              textAlign: 'center'
            }}>
              <strong>RIB :</strong> {factureConfig.rib}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ==========================================
// MODÈLE PAR DÉFAUT : MODERNE TECH (Ton design d'origine)
// ==========================================
return (
  <div className="zone-facture-blanche" style={{ 
    width: '794px', 
    height: '1123px', 
    fontSize: '13px', 
    color: '#333333', 
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#ffffff',
    padding: '40px 40px 20px 40px', /* Espace intérieur de la feuille */
    position: 'relative',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  }}>
    
    {/* EN-TÊTE : LOGO À GAUCHE ET NUMÉROTATION À DROITE */}
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
  
  {/* 🌟 CÔTÉ GAUCHE (LOGO) : C'est ici qu'on ajoute le marginTop négatif pour le faire monter seul */}
  <div style={{ 
    width: '200px', 
    height: '250px', 
    marginTop: '-90px', /* 🌟 Fait monter uniquement le logo vers le haut */
    border: factureConfig.logo ? 'none' : '1px solid #d1d5db', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: '#9ca3af',
    overflow: 'hidden'
  }}>
    {factureConfig.logo ? (
      <img 
        src={factureConfig.logo} 
        alt="Logo" 
        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
      />
    ) : (
      <span style={{ fontSize: '11px' }}>[ Emplacement Logo ]</span>
    )}
  </div>
  
  {/* CÔTÉ DROIT (NUMÉROTATION) : Reste sagement à sa place d'origine */}
  <div style={{ textAlign: 'right', minWidth: '150px' }}>
    <h2 style={{ margin: 0, color: '#4b5563', fontSize: '22px', fontWeight: '700', letterSpacing: '1px' }}>FACTURE</h2>
    <h3 style={{ margin: '2px 0 0 0', fontSize: '20px', color: '#111827', fontWeight: '700' }}>N°: 000{venteSelectionnee.numero_ticket}</h3>
    <div style={{ width: '100%', height: '1px', backgroundColor: '#4b5563', margin: '8px 0' }}></div>
    <p style={{ margin: 0, fontSize: '13px', color: '#1f2937' }}>Date: {venteSelectionnee.date}</p>
  </div>
</div>

 {/* SECTION CLIENT */}
<div style={{ marginTop: '-50px', marginBottom: '25px', paddingLeft: '5px' }}>
  <p style={{ margin: 0, fontSize: '14px', color: '#1f2937' }}>
    <strong>Client:</strong> {nomClientAffiche}
  </p>
</div>

    {/* TABLEAU DES ARTICLES */}
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #4b5563', marginBottom: '10px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#4b5563', color: 'white' }}>
            <th style={{ textAlign: 'center', padding: '10px', fontSize: '12px', fontWeight: '600', width: '50px' }}>Qté.</th>
            <th style={{ textAlign: 'left', padding: '10px', fontSize: '12px', fontWeight: '600' }}>Description</th>
            <th style={{ textAlign: 'right', padding: '10px', fontSize: '12px', fontWeight: '600', width: '100px' }}>Prix.U</th>
            <th style={{ textAlign: 'right', padding: '10px', fontSize: '12px', fontWeight: '600', width: '120px' }}>Montant</th>
          </tr>
        </thead>
        <tbody>
          {venteSelectionnee.articles?.map((art, idx) => (
            <tr key={idx} style={{ backgroundColor: 'white' }}>
              <td style={{ textAlign: 'center', padding: '12px 10px', borderBottom: '1px solid #e5e7eb', color: '#1f2937' }}>{art.quantite}</td>
              <td style={{ textAlign: 'left', padding: '12px 10px', borderBottom: '1px solid #e5e7eb', color: '#1f2937', fontWeight: '500' }}>{art.designation}</td>
              <td style={{ textAlign: 'right', padding: '12px 10px', borderBottom: '1px solid #e5e7eb', color: '#1f2937' }}>
                {(art.prix_unitaire_vente || art.prix_unitaire || 0).toLocaleString()} 
              </td>
              <td style={{ textAlign: 'right', padding: '12px 10px', borderBottom: '1px solid #e5e7eb', color: '#1f2937' }}>
                {((art.prix_unitaire_vente || art.prix_unitaire || 0) * art.quantite).toLocaleString()} FCFA
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* BLOC MONTANT TOTAL */}
    <div style={{ 
      backgroundColor: '#4b5563', 
      color: 'white', 
      borderRadius: '12px', 
      padding: '10px 15px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      fontWeight: '700',
      fontSize: '13px',
      marginBottom: '20px'
    }}>
      <span>Montant TOTAL :</span>
      <span>{totalFacture.toLocaleString()} FCFA</span>
    </div>

    {/* MENTIONS COMPLÉMENTAIRES & SOMME EN LETTRES */}
    <div style={{ paddingLeft: '5px', lineHeight: '1.6', fontSize: '12px', color: '#1f2937' }}>
      <p style={{ margin: '0 0 8px 0' }}>
        <strong>Arrêtée la présente Facture à la somme de :</strong> {nombreEnLettres(totalFacture)} Francs CFA
      </p>
      
      {/* CONDITION : Affiché uniquement si c'est un crédit */}
      {estUnCredit && (
        <div style={{ marginTop: '5px', borderTop: '1px dashed #cbd5e1', paddingTop: '5px' }}>
          <p style={{ margin: '0 0 4px 0', color: '#4b5563' }}><strong>Déjà payé :</strong> {avanceClient.toLocaleString()} FCFA</p>
          <p style={{ margin: 0, color: '#dc2626', fontWeight: '600' }}><strong>Reste à payer :</strong> {resteAPayer.toLocaleString()} FCFA</p>
        </div>
      )}
    </div>

    {/* BLOC SIGNATURES */}
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', padding: '0 20px', fontSize: '11px', fontWeight: '700', color: '#374151' }}>
      <span>POUR ACQUIT</span>
      <span>LE PRESTATAIRE</span>
    </div>

    {/* PIED DE PAGE : Fixé harmonieusement tout en bas de la feuille */}
    <div style={{ 
      position: 'absolute', 
      bottom: '0px',             /* Fixé à l'extrême bas de la feuille */
      left: '0px',               /* Aligné pile sur le bord gauche */
      width: '794px',            /* Largeur totale stricte de la facture */
      backgroundColor: '#4b5563', /* Gris ardoise assorti au tableau */
      color: '#ffffff',          /* Texte en blanc pur pour le contraste */
      padding: '12px 30px',      /* Hauteur compacte */
      textAlign: 'center', 
      fontSize: '9px',           /* Écriture discrète */
      lineHeight: '1',         /* Interligne propre */
      letterSpacing: '0.3px',
      boxSizing: 'border-box'
    }}>
      <div>
        <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#ffffff' }}>{factureConfig.nom}</span>
        {factureConfig.adresse && <span> • 📍 {factureConfig.adresse}</span>}
        {factureConfig.email && <span> • ✉️ {factureConfig.email}</span>}
        {factureConfig.site && <span> • 🌐 {factureConfig.site}</span>}
      </div>
      {factureConfig.rib && (
        <div style={{ 
          marginTop: '4px', 
          fontSize: '8.5px', 
          opacity: 0.8, 
          borderTop: '0.5px solid rgba(255, 255, 255, 0.25)', /* Ligne blanche très subtile */
          paddingTop: '4px',
          width: '100%',
          textAlign: 'center'
        }}>
          <strong>RIB :</strong> {factureConfig.rib}
        </div>
      )}
    </div>

  </div>
);
        })()
      ) : (
        <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '100px' }}>
          Sélectionne une vente pour générer l'aperçu de la facture...
        </p>
      )}
    </div>
  
    {/* BOUTONS ACTIONS EN BAS TOTALEMENT OPÉRATIONNELS */}
    <div style={{ display: 'flex', gap: '12px', borderTop: `1px solid ${stylesTheme.bordures}`, paddingTop: '20px', marginTop: 'auto', backgroundColor: stylesTheme.fondCartes, flexShrink: 0 }}>
      
     {/* BOUTON 1 : IMPRESSION PHYSIQUE CORRIGÉE ET SÉCURISÉE */}
      <button
        disabled={!venteSelectionnee}
        onClick={() => {
          const elementFacture = document.querySelector('.zone-facture-blanche') || document.querySelector('table')?.parentElement?.parentElement;
          if (elementFacture) {
            const fenetreImpression = window.open('', '_blank', 'height=850,width=850');
            
            // On récupère les styles calculés du conteneur d'origine pour ne rien perdre
            const paddingOrigine = elementFacture.style.padding || '20px 30px';

            fenetreImpression.document.write(`
              <html>
                <head>
                  <title>Facture N°${venteSelectionnee.numero_ticket}</title>
                  <style>
                    body { 
                      font-family: Arial, sans-serif; 
                      margin: 0; 
                      padding: 0; 
                      background-color: white; 
                      -webkit-print-color-adjust: exact; 
                      print-color-adjust: exact; 
                    }
                    @page { 
                      size: A4 portrait; 
                      margin: 0mm; 
                    }
                    .print-wrapper {
                      width: 794px;
                      height: 1123px;
                      position: relative;
                      box-sizing: border-box;
                      display: flex;
                      flex-direction: column;
                      padding: ${paddingOrigine};
                      background-color: #ffffff;
                      overflow: hidden;
                    }
                  </style>
                </head>
                <body>
                  <div class="print-wrapper">
                    ${elementFacture.innerHTML}
                  </div>
                </body>
              </html>
            `);
            fenetreImpression.document.close();
            setTimeout(() => {
              fenetreImpression.focus();
              fenetreImpression.print();
              fenetreImpression.close();
            }, 300);
          } else {
            window.print();
          }
        }}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px',
          backgroundColor: venteSelectionnee ? '#0284c7' : stylesTheme.bordures, 
          color: 'white',
          border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: venteSelectionnee ? 'pointer' : 'not-allowed', transition: '0.2s'
        }}
      >
        🖨️ Imprimer la Facture
      </button>

      {/* BOUTON 2 : TÉLÉCHARGEMENT DIRECT DU PDF CORRIGÉ */}
      <button
        disabled={!venteSelectionnee}
        onClick={() => {
          const elementFacture = document.querySelector('.zone-facture-blanche') || document.querySelector('table')?.parentElement?.parentElement;
          
          if (!elementFacture) {
            alert("Erreur : Impossible de trouver le contenu de la facture.");
            return;
          }

          const telechargerPDF = () => {
            const options = {
              margin: 0, /* Marges à 0 car gérées en interne par les 794px de la facture */
              filename: `Facture_No_000${venteSelectionnee.numero_ticket}.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true, logging: false },
              jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' } /* Impose la taille exacte de l'image pixel par pixel */
            };

            // On clone l'élément en lui ré-appliquant la structure Flexbox verticale et la hauteur stricte
            const conteneurTemporaire = document.createElement('div');
            conteneurTemporaire.style.width = '794px';
            conteneurTemporaire.style.height = '1123px';
            conteneurTemporaire.style.position = 'relative';
            conteneurTemporaire.style.boxSizing = 'border-box';
            conteneurTemporaire.style.display = 'flex';
            conteneurTemporaire.style.flexDirection = 'column';
            conteneurTemporaire.style.fontFamily = 'Arial, sans-serif';
            conteneurTemporaire.style.backgroundColor = '#ffffff';
            
            // On conserve exactement le padding d'origine de votre facture
            conteneurTemporaire.style.padding = '20px 30px'; 
            
            conteneurTemporaire.innerHTML = elementFacture.innerHTML;

            window.html2pdf().from(conteneurTemporaire).set(options).save();
          };

          if (window.html2pdf) {
            telechargerPDF();
          } else {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = () => {
              telechargerPDF();
            };
            document.head.appendChild(script);
          }
        }}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px',
          backgroundColor: stylesTheme.fondApplication, 
          color: venteSelectionnee ? stylesTheme.textePrincipal : stylesTheme.texteSecondaire, 
          border: `1px solid ${stylesTheme.bordures}`,
          borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: venteSelectionnee ? 'pointer' : 'not-allowed', transition: '0.2s'
        }}
      >
        📥 Exporter en PDF
      </button>

    </div>
  </div>
</div>
        </>
      );
    })() /* FIN DE LA LOGIQUE ISOLEÉ */}
  </>
) : (
        /* CONTENU PLEINE LARGEUR POUR LES AUTRES SOUS-ONGLETS */
        <div style={{ 
          flex: '1', 
          backgroundColor: stylesTheme.fondCartes, 
          padding: '20px', 
          borderRadius: '12px', 
          border: `1px solid ${stylesTheme.bordures}`,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
          height: '100%', 
          overflowY: 'auto',
          boxSizing: 'border-box'
        }}>

        {/* ========================================================================= */}
{/* 📄 SOUS-ONGLET : FACTURE PROFORMA (CONCEPTION & IMPRESSION VOLATILE)       */}
{/* ========================================================================= */}
{sousOngletFacture === 'proforma' && (
<div style={{ 
  display: 'flex', 
  gap: '20px', 
  padding: '0px', 
  
  // 1. ÉLARGISSEMENT HAUT & BAS
  marginTop: '-20px',             // Aligne le haut de force en grignotant l'espace du haut
  marginBottom: '-20px',          // Évite de bloquer le défilement ou de créer un bug en bas
  height: 'calc(100vh - 300px)',  // Réduit la soustraction (de 340px à 170px) pour forcer le bas à descendre au maximum
  
  // 2. ÉLARGISSEMENT GAUCHE & DROITE (Inchangé, parfait)
  width: 'calc(100% + 40px)', 
  marginLeft: '-20px', 
  marginRight: '-20px' 
}}>
    
    {/* --- 1. COLONNE GAUCHE : SÉLECTION DES PRODUITS --- */}
    <div style={{ flex: '0.7', display: 'flex', flexDirection: 'column', backgroundColor: stylesTheme.fondCartes, borderRadius: '16px', border: `1px solid ${stylesTheme.bordures}`, padding: '20px' }}>
      <h3 style={{ margin: '0 0 15px 0', color: stylesTheme.textePrincipal, fontSize: '16px' }}>Sélection des articles</h3>
      
      {/* Barre de recherche locale - Sécurisée contre le débordement */}
      <input
        type="text"
        placeholder="🔍 Rechercher un produit..."
        value={rechercheProforma || ''}
        onChange={(e) => setRechercheProforma(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 15px', borderRadius: '10px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, marginBottom: '15px', outline: 'none' }}
      />

      {/* Liste des produits */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {produits
          .filter(p => p.actif !== false && p.nom.toLowerCase().includes((rechercheProforma || '').toLowerCase()))
          .map((p) => {
            const itemDansPanier = panierProforma?.find(item => item.id === p.id);
            const qte = itemDansPanier ? itemDansPanier.quantite : 0;

            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication }}>
                <div>
                  <div style={{ fontWeight: '700', color: stylesTheme.textePrincipal, fontSize: '14px' }}>{p.nom}</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: stylesTheme.texteSecondaire, marginTop: '2px' }}>
                    {Math.round(p.prix_vente).toLocaleString(undefined, { maximumFractionDigits: 0 })} F
                  </div>
                </div>

                {/* Boutons + / - de quantité */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {qte > 0 && (
                    <>
                      <button
                        onClick={() => {
                          setPanierProforma(ancien => {
                            const cible = ancien.find(item => item.id === p.id);
                            if (cible.quantite === 1) return ancien.filter(item => item.id !== p.id);
                            return ancien.map(item => item.id === p.id ? { ...item, quantite: item.quantite - 1 } : item);
                          });
                        }}
                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center', color: stylesTheme.textePrincipal }}>{qte}</span>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setPanierProforma(ancien => {
                        const panierSûr = ancien || [];
                        const existe = panierSûr.find(item => item.id === p.id);
                        if (existe) return panierSûr.map(item => item.id === p.id ? { ...item, quantite: item.quantite + 1 } : item);
                        return [...panierSûr, { ...p, quantite: 1 }];
                      });
                    }}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>

   {/* --- 2. COLONNE DROITE : APERÇU PROFORMA IDENTIQUE À CONCEVOIR FACTURE --- */}
<div style={{ 
  flex: '1.8', 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center', 
  height: '100%',
  overflow: 'hidden' 
}}>
  
  {/* Conteneur d'en-tête principal aligné sur une seule ligne et élargi à 100% */}
<div style={{ 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  width: '100%', 
  marginBottom: '15px',
  flexShrink: 0,
  boxSizing: 'border-box' /* Évite que les paddings éventuels ne fassent déborder le bloc */
}}>
  
  {/* Titre à gauche */}
  <h3 style={{ marginTop: 0, marginBottom: 0, color: stylesTheme.textePrincipal, display: 'flex', alignItems: 'center', gap: '6px' }}>
    👁️ Aperçu de la Facture
  </h3>
  
  {/* Saisie Client temporaire poussée et fixée à droite */}
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    backgroundColor: stylesTheme.fondApplication, 
    padding: '6px 12px', 
    borderRadius: '8px', 
    border: `1px solid ${stylesTheme.bordures}`,
    width: '450px'
  }}>
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '13px', fontWeight: 'bold', color: stylesTheme.texteSecondaire, whiteSpace: 'nowrap' }}>
        Nom du Client :
      </span>
      <input
        type="text"
        value={clientProforma || ""}
        placeholder="Ex: Établissement Diallo, Traoré..."
        onChange={(e) => setClientProforma(e.target.value)}
        style={{
          width: '100%',
          padding: '6px 10px',
          fontSize: '13px',
          border: `1px solid ${stylesTheme.bordures}`,
          borderRadius: '6px',
          outline: 'none',
          backgroundColor: stylesTheme.fondCartes,
          color: stylesTheme.textePrincipal
        }}
      />
    </div>
  </div>
</div> 

{/* Zone grise de défilement accueillant la feuille A4 */}
<div style={{ 
  width: '100%', 
  height: '100%',
  backgroundColor: stylesTheme.fondApplication,
  border: `1px solid ${stylesTheme.bordures}`,
  borderRadius: '12px',
  padding: '20px',
  overflowY: 'auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  boxSizing: 'border-box'
}}>
    
    {/* FEUILLE FORMAT A4 CONTENANT LES MODÈLES DYNAMIQUES */}
    {(() => {
      // Préparation des données proforma pour le rendu identique
      const totalProforma = panierProforma ? panierProforma.reduce((acc, item) => acc + (item.prix_vente * item.quantite), 0) : 0;
      const nomClientAffiche = clientProforma || "Client Comptant";
      const dateAujourdhui = new Date().toLocaleDateString('fr-FR');

      // --- FONCTION DE CONVERSION DU MONTANT EN LETTRES ---
      const nombreEnLettres = (num) => {
        if (num === 0) return "Zéro";
        const unites = ["", "Un", "Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf", "Dix", "Onze", "Douze", "Treize", "Quatorze", "Quinze", "Seize", "Dix-Sept", "Dix-Huit", "Dix-Neuf"];
        const dizaines = ["", "", "Vingt", "Trente", "Quarante", "Cinquante", "Soixante", "Soixante", "Quatre-Vingt", "Quatre-Vingt"];
        
        const convertirMoinsDe100 = (n) => {
          if (n < 20) return unites[n];
          const d = Math.floor(n / 10);
          const r = n % 10;
          if (d === 7) {
            if (r === 1) return "Soixante et Onze";
            return "Soixante-" + unites[10 + r].toLowerCase();
          }
          if (d === 9) {
            if (r === 1) return "Quatre-Vingt-Onze";
            return "Quatre-Vingt-" + unites[10 + r].toLowerCase();
          }
          let liaison = "";
          if (r === 1 && d !== 8) liaison = " et ";
          else if (r > 0) liaison = "-";
          return dizaines[d] + (r > 0 ? liaison + unites[r].toLowerCase() : "");
        };

        const convertirMoinsDe1000 = (n) => {
          const c = Math.floor(n / 100);
          const reste = n % 100;
          let res = "";
          if (c > 0) res += (c === 1 ? "Cent" : unites[c] + " Cent");
          if (reste > 0) res += (res ? " " : "") + convertirMoinsDe100(reste);
          return res;
        };

        let md = Math.floor(num / 1000000000); let resteMd = num % 1000000000;
        let mi = Math.floor(resteMd / 1000000); let resteMi = resteMd % 1000000;
        let m = Math.floor(resteMi / 1000); let resteM = resteMi % 1000;
        let txt = "";
        if (md > 0) txt += (md === 1 ? "Un Milliard " : convertirMoinsDe1000(md) + " Milliards ");
        if (mi > 0) txt += (mi === 1 ? "Un Million " : convertirMoinsDe1000(mi) + " Millions ");
        if (m > 0) txt += (m === 1 ? "Mille " : convertirMoinsDe1000(m) + " Mille ");
        if (resteM > 0) txt += convertirMoinsDe1000(resteM);
        return txt.trim();
      };

      // ==========================================
      // MODÈLE 1 : MINIMALISTE ÉPURÉ 
      // ==========================================
      // ==========================================
// MODÈLE 1 : MINIMALISTE
// ==========================================
if (modeleSelectionne === 'minimaliste') {
  return (
   <div style={{ fontFamily: '"Courier New", Courier, monospace', color: '#111827', backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', fontSize: '13px' }}>
      
      {/* EN-TÊTE : LOGO À L'EXTRÊME GAUCHE ET INFORMATIONS ÉLARGIES À DROITE */}
      {/* 🌟 Ajustement des marges ici : paddingBottom 10px et marginBottom 15px */}
     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #111827', paddingBottom: '10px', marginTop: '-50px', marginBottom: '15px' }}>
        
        {/* BLOC LOGO (CALÉ À GAUCHE) */}
        <div style={{ 
          width: '200px', /* Ta largeur raisonnable */
          height: '250px', /* 🌟 Fixé à 250px comme demandé */
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-start', 
          backgroundColor: factureConfig.logo ? 'transparent' : '#f9fafb',
          border: factureConfig.logo ? 'none' : '1px dashed #6b7280', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          {factureConfig.logo ? (
            <img 
              src={factureConfig.logo} 
              alt="Logo" 
              /* L'image s'adapte parfaitement à la hauteur fixe de 250px sans déformer */
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left center' }} 
            />
          ) : (
            <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', color: '#6b7280', paddingLeft: '10px' }}>
              [ Logo ]
            </span>
          )}
        </div>

        {/* INFORMATIONS ENTREPRISE ÉLARGIES ET RIB INTEGRÉ (À DROITE) */}
        <div style={{ textAlign: 'right', fontSize: '13px', lineHeight: '1.4' }}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{factureConfig.nom}</p>
          <p style={{ margin: 0 }}>{factureConfig.adresse}</p>
          <p style={{ margin: 0 }}>{factureConfig.email}</p>
          <p style={{ margin: 0 }}>{factureConfig.site}</p>
          {factureConfig.rib && <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontStyle: 'italic', color: '#374151' }}>RIB: {factureConfig.rib}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
        <div>
          <p style={{ margin: 0 }}><strong>FACTURE PROFORMA</strong></p>
          <p style={{ margin: '4px 0 0 0' }}><strong>DATE:</strong> {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0 }}><strong>Client:</strong></p>
          <p style={{ margin: '4px 0 0 0', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '14px' }}>
            {clientProforma || "CLIENT COMPTANT"}
          </p>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #111827' }}>
            <th style={{ textAlign: 'center', padding: '8px', width: '40px' }}>QTÉ</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>DESCRIPTION</th>
            <th style={{ textAlign: 'right', padding: '8px', width: '100px' }}>P.UNIT</th>
            <th style={{ textAlign: 'right', padding: '8px', width: '110px' }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {panierProforma?.map((art, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #111827' }}>
              <td style={{ textAlign: 'center', padding: '8px' }}>{art.quantite}</td>
              <td style={{ textAlign: 'left', padding: '8px' }}>{art.nom}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>{(art.prix_vente || 0).toLocaleString()}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>{((art.prix_vente || 0) * art.quantite).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
        <div style={{ width: '260px', borderTop: '2px solid #111827', paddingTop: '8px', textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>TOTAL : {totalProforma.toLocaleString()} FCFA</p>
        </div>
      </div>
      
      <div style={{ paddingLeft: '5px', lineHeight: '1.6', fontSize: '12px', color: '#1f2937' }}>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>Arrêtée la présente Proforma à la somme de :</strong> {nombreEnLettres(totalProforma)} Francs CFA
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', borderTop: '1px dashed #111827', paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }}>
        <span>CLIENT</span>
        <span>LE PRESTATAIRE</span>
      </div>
    </div>
  );
}
// ==========================================
// MODÈLE 2 : LUXE & PRESTIGE
// ==========================================
if (modeleSelectionne === 'luxe') {
  return (
    <div style={{ 
      fontFamily: '"Helvetica Neue", Arial, sans-serif', 
      color: '#000000', 
      fontSize: '12px', 
      padding: '40px', 
      backgroundColor: '#ffffff', 
      width: '100%', 
      maxWidth: '794px', 
      boxSizing: 'border-box'
    }}>
      
     {/* EN-TÊTE : LOGO À GAUCHE ET INFORMATIONS DE L'ENTREPRISE À DROITE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #111827', paddingBottom: '20px', marginBottom: '25px' }}>
        
       {/* Côté gauche : Logo Dynamique */}
<div style={{ 
  width: '200px', 
  height: '250px', 
  marginTop: '-70px', /* 🌟 Fait monter uniquement le logo côté gauche */
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'flex-start', 
  backgroundColor: factureConfig.logo ? 'transparent' : '#fafafa',
  border: factureConfig.logo ? 'none' : '1px solid #000000', 
  borderRadius: '12px',
  overflow: 'hidden'
}}>
  {factureConfig.logo ? (
    <img 
      src={factureConfig.logo} 
      alt="Logo" 
      style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left center' }} 
    />
  ) : (
    <span style={{ fontSize: '11px', color: '#666666', fontWeight: 'bold', letterSpacing: '1px', paddingLeft: '15px' }}>
      [ EMPLACEMENT LOGO ]
    </span>
  )}
</div>

        {/* Côté droit : Remplacement du titre par les informations de l'entreprise */}
        <div style={{ textAlign: 'right', fontSize: '13px', lineHeight: '1.4' }}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px', letterSpacing: '1px' }}>{factureConfig.nom}</p>
          <p style={{ margin: '4px 0 0 0' }}>{factureConfig.adresse}</p>
          <p style={{ margin: '2px 0 0 0' }}>{factureConfig.email}</p>
          <p style={{ margin: '2px 0 0 0' }}>{factureConfig.site}</p>
          {factureConfig.rib && (
            <p style={{ margin: '6px 0 0 0', fontSize: '12px', fontStyle: 'italic', color: '#374151' }}>
              RIB: {factureConfig.rib}
            </p>
          )}
        </div>
      </div>

      {/* METADONNÉES : NUMÉRO, DATE & CLIENT */}
      <div style={{ display: 'flex', border: '1px solid #000000', borderRadius: '12px 12px 0 0', borderBottom: 'none', overflow: 'hidden' }}>
        <div style={{ flex: 2, padding: '10px 15px', borderRight: '1px solid #000000' }}>
          <span style={{ fontSize: '10px', color: '#555555', display: 'block', marginBottom: '2px' }}>DÉLIVRÉE À :</span>
          <strong style={{ fontSize: '14px' }}>{clientProforma || "CLIENT COMPTANT"}</strong>
        </div>
        <div style={{ flex: 1, padding: '10px 15px', borderRight: '1px solid #000000' }}>
          <span style={{ fontSize: '10px', color: '#555555', display: 'block', marginBottom: '2px' }}>DOCUMENT :</span>
          <strong>PROFORMA</strong>
        </div>
        <div style={{ flex: 1, padding: '10px 15px' }}>
          <span style={{ fontSize: '10px', color: '#555555', display: 'block', marginBottom: '2px' }}>DATE :</span>
          <strong>{new Date().toLocaleDateString('fr-FR')}</strong>
        </div>
      </div>

      {/* TABLEAU PRINCIPAL STYLE "CARNET" */}
      <div style={{ border: '1px solid #000000', borderRadius: '0 0 12px 12px', overflow: 'hidden', marginBottom: '25px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#000000', color: '#ffffff' }}>
              <th style={{ padding: '10px', textAlign: 'center', width: '60px', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #ffffff' }}>QTÉ</th>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #ffffff' }}>DESIGNATION DES PRESTATIONS</th>
              <th style={{ padding: '10px', textAlign: 'right', width: '110px', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #ffffff' }}>P. UNITAIRE</th>
              <th style={{ padding: '10px', textAlign: 'right', width: '130px', fontSize: '11px', fontWeight: 'bold' }}>MONTANT</th>
            </tr>
          </thead>
          <tbody>
            {panierProforma?.map((art, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #000000' }}>{art.quantite}</td>
                <td style={{ padding: '12px 10px', fontWeight: '500', borderRight: '1px solid #000000' }}>{art.nom}</td>
                <td style={{ padding: '12px 10px', textAlign: 'right', borderRight: '1px solid #000000' }}>{(art.prix_vente || 0).toLocaleString()} F</td>
                <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 'bold' }}>{((art.prix_vente || 0) * art.quantite).toLocaleString()} F</td>
              </tr>
            ))}
            {/* Lignes vides pour remplir l'espace */}
            {[...Array(Math.max(0, 3 - (panierProforma?.length || 0)))].map((_, i) => (
              <tr key={`empty-${i}`} style={{ height: '35px', borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ borderRight: '1px solid #000000' }}></td>
                <td style={{ borderRight: '1px solid #000000' }}></td>
                <td style={{ borderRight: '1px solid #000000' }}></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECTION FINALE SOUDÉE */}
      <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          
          {/* Bloc de gauche : Signatures */}
          <div style={{ width: '340px', border: '1px solid #000000', borderRadius: '12px', padding: '15px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold' }}>
              <span>BON POUR ACCORD</span>
              <span>LA DIRECTION</span>
            </div>
            <div style={{ height: '65px' }}></div>
          </div>

          {/* Bloc de droite : Calculs financiers */}
          <div style={{ width: '300px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '15px' }}>
              <tbody>
                <tr style={{ borderTop: '2px solid #000000' }}>
                  <td style={{ padding: '8px 0', fontWeight: 'bold', fontSize: '13px' }}>TOTAL :</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '900', fontSize: '16px' }}>{totalProforma.toLocaleString()} FCFA</td>
                </tr>
              </tbody>
            </table>

            {/* Le montant en lettres est maintenant intégré juste ici sous les totaux */}
            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '11px', lineHeight: '1.4' }}>
              <strong>Arrêtée la présente Proforma à la somme de :</strong><br />
              {nombreEnLettres(totalProforma)} Francs CFA
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

      // ==========================================
      // MODÈLE 3 : CORPORATE (Bleu/Turquoise)
      // ==========================================
      if (modeleSelectionne === 'corporate') {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#1f2937', fontSize: '13px', backgroundColor: '#ffffff', padding: '20px 30px', width: '794px', height: '1123px', position: 'relative', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      
      {/* Ligne décorative supérieure gauche */}
      <div style={{ width: '45%', height: '4px', backgroundColor: '#005f73', position: 'absolute', top: '30px', left: '0' }}></div>
      <div style={{ width: '22%', height: '4px', backgroundColor: '#0a9396', position: 'absolute', top: '34px', left: '0' }}></div>

      {/* EN-TÊTE : Infos Facture à gauche et Emplacement Logo à droite */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '45px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'normal', color: '#000000', letterSpacing: '0.5px', lineHeight: '1.2' }}>
            FACTURE PROFORMA
          </h1>
          <div style={{ width: '120px', height: '2px', backgroundColor: '#0a9396', margin: '8px 0 12px 0' }}></div>
          <p style={{ margin: 0, fontSize: '13px', color: '#000000', fontWeight: 'normal' }}>
            Date: {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

       {/* --- ZONE LOGO DYNAMIQUE CALÉ À GAUCHE (REMONTE) --- */}
        <div style={{ 
          width: '200px', 
          height: '250px', 
          marginTop: '-100px', /* Fait remonter l'emplacement du logo vers le haut */
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-start', /* Aligne le logo à l'extrême gauche */
          backgroundColor: factureConfig.logo ? 'transparent' : '#f8fafc',
          border: factureConfig.logo ? 'none' : '1px solid #cbd5e1', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          {factureConfig.logo ? (
            <img 
              src={factureConfig.logo} 
              alt="Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left center' }} 
            />
          ) : (
            <span style={{ fontSize: '13px', color: '#94a3b8', paddingLeft: '15px' }}>
              [ Emplacement Logo ]
            </span>
          )}
        </div>
      </div>

      {/* BLOC CLIENT */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px', marginTop: '-50px' }}>
        <div style={{ fontSize: '15px', color: '#000000' }}>
          <span style={{ color: '#0a9396', marginRight: '15px', fontSize: '22px', fontWeight: '300' }}>|</span>
          Client: {clientProforma || nomClientAffiche || "CLIENT COMPTANT"}
        </div>
      </div>

      {/* TABLEAU DE FACTURATION */}
      <div style={{ marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
          <thead>
            <tr style={{ backgroundColor: '#0a9396', color: 'white' }}>
              <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '13px', fontWeight: 'normal', borderRadius: '10px 0 0 10px', width: '45%' }}>DESCRIPTION</th>
              <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '13px', fontWeight: 'normal', width: '15%' }}>QTÉ</th>
              <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '13px', fontWeight: 'normal', width: '20%' }}>Prix.U</th>
              <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '13px', fontWeight: 'normal', borderRadius: '0 10px 10px 0', width: '20%' }}>Montant</th>
            </tr>
          </thead>
          <tbody>
            {panierProforma?.map((art, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 1 ? '#ffffff' : '#f1f5f9' }}>
                <td style={{ padding: '14px 15px', color: '#4b5563', fontSize: '13px', borderBottom: '1px solid #e2e8f0' }}>{art.designation || art.nom}</td>
                <td style={{ padding: '14px 15px', textAlign: 'center', color: '#4b5563', fontSize: '13px', borderBottom: '1px solid #e2e8f0' }}>{art.quantite}</td>
                <td style={{ padding: '14px 15px', textAlign: 'right', color: '#4b5563', fontSize: '13px', borderBottom: '1px solid #e2e8f0' }}>{(art.prix_unitaire_vente || art.prix_unitaire || art.prix_vente || 0).toLocaleString()} </td>
                <td style={{ padding: '14px 15px', textAlign: 'right', color: '#4b5563', fontSize: '13px', borderBottom: '1px solid #e2e8f0' }}>{((art.prix_unitaire_vente || art.prix_unitaire || art.prix_vente || 0) * art.quantite).toLocaleString()} FCFA</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BLOC BAS : TOTAL ET SIGNATURES */}
      <div style={{ padding: '30px 25px', backgroundColor: '#e5e7eb', borderRadius: '6px', minHeight: '180px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ width: '55%', fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
            <strong>Arrêtée la présente Proforma à la somme de :</strong><br />
            <span style={{ textTransform: 'capitalize', fontWeight: 'normal' }}>{nombreEnLettres(totalProforma)} Francs CFA</span>
          </div>
          
          <div style={{ backgroundColor: '#005f73', color: 'white', padding: '12px 20px', fontSize: '14px', fontWeight: 'normal', minWidth: '220px', textAlign: 'right' }}>
            Montant TOTAL : {totalProforma.toLocaleString()} FCFA
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'normal', color: '#374151', padding: '0 40px', marginTop: '30px' }}>
          <span>BON POUR ACCORD</span>
          <span>LE PRESTATAIRE</span>
        </div>
      </div>

     {/* PIED DE PAGE IMPOSÉ TOUT EN BAS DE LA FEUILLE ET SUR TOUTE LA LARGEUR */}
      <div style={{ 
        position: 'absolute', 
        bottom: '0px',              /* Fixé à l'extrême bas de la feuille */
        left: '0px',               /* Aligné pile sur le bord gauche */
        width: '794px',            /* Prend exactement la largeur totale de la facture (794px) */
        backgroundColor: '#005f73', 
        color: '#ffffff', 
        padding: '10px 30px',      /* Réduit de 15px à 10px pour être plus compact */
        textAlign: 'center', 
        fontSize: '9px',           /* Taille de texte réduite (au lieu de 11px) */
        lineHeight: '1',         /* Interligne resserré (au lieu de 1.5) */
        letterSpacing: '0.3px',
        boxSizing: 'border-box'    /* Évite que le padding n'élargisse le bloc au-delà des 794px */
      }}>
        <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{factureConfig.nom}</span>
        {factureConfig.adresse && <span> • 📍 {factureConfig.adresse}</span>}
        {factureConfig.email && <span> • ✉️ {factureConfig.email}</span>}
        {factureConfig.site && <span> • 🌐 {factureConfig.site}</span>}
        {factureConfig.rib && (
          <div style={{ 
            marginTop: '4px', 
            fontSize: '8.5px',      /* Taille du texte du RIB réduite */
            opacity: 0.8, 
           
            paddingTop: '3px' 
          }}>
            <strong>RIB :</strong> {factureConfig.rib}
          </div>
        )}
      </div>

    </div>
  );
}

// ==========================================
// MODÈLE 4 : PREMIUM ROYAL
// ==========================================
if (modeleSelectionne === 'premium') {
  return (
    <div className="zone-facture-blanche" style={{ 
      fontSize: '13px', 
      color: '#1e293b', 
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      position: 'relative',
      backgroundColor: '#ffffff',
      width: '100%',
      maxWidth: '794px',
      minHeight: '1060px', /* Hauteur A4 idéale sans forcer un écrasement */
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      padding: '40px 40px 0 40px',
      overflow: 'hidden'
    }}>
      
      {/* Contenu principal supérieur */}
      <div style={{ flex: '1 0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Décoration d'arrière-plan en haut à droite */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '300px',
          height: '220px',
          background: 'radial-gradient(circle, rgba(45,212,191,0.15) 0%, rgba(14,116,144,0.04) 100%)',
          borderBottomLeftRadius: '100px',
          zIndex: -1,
          pointerEvents: 'none'
        }}></div>

        {/* EN-TÊTE : Logo et Titre de la Facture */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
  <div style={{ 
    width: '200px', 
    height: '250px', 
    border: factureConfig.logo ? 'none' : '1px dashed #cbd5e1', 
    borderRadius: '6px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: '#94a3b8', 
    backgroundColor: factureConfig.logo ? 'transparent' : '#f8fafc',
    overflow: 'hidden'
  }}>
    {factureConfig.logo ? (
      <img 
        src={factureConfig.logo} 
        alt="Logo" 
        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
      />
    ) : (
      <span style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '0.5px' }}>[ Emplacement Logo ]</span>
    )}
  </div>
          
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '24px', zIndex: 10, fontWeight: '800', letterSpacing: '1px', lineHeight: '1' }}>PROFORMA</h2>
            <p style={{ margin: '6px 0 2px 0', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
              Type: <span style={{ color: '#0f172a', fontWeight: '700' }}>DEVIS ESTIMATIF</span>
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
              Date: <span style={{ color: '#0f172a', fontWeight: '700' }}>{new Date().toLocaleDateString('fr-FR')}</span>
            </p>
          </div>
        </div>

        {/* BLOC CLIENT */}
<div style={{ marginTop: '-60px', marginBottom: '30px', paddingLeft: '4px', borderLeft: '3px solid #0f7490' }}>
  <h4 style={{ margin: '0 0 2px 0', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#0e7490', fontWeight: '700' }}>CLIENT</h4>
  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
    {clientProforma || nomClientAffiche || "CLIENT COMPTANT"}
  </p>
</div>

        {/* TABLEAU DE FACTURATION */}
        <div style={{ marginBottom: '30px' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #134e5e 0%, #0f7490 100%)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: 'white', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description de l'article</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '11px', fontWeight: '600', color: 'white', width: '60px', textTransform: 'uppercase' }}>Qté</th>
                <th style={{ textAlign: 'right', padding: '12px 12px', fontSize: '11px', fontWeight: '600', color: 'white', width: '110px', textTransform: 'uppercase' }}>Prix U.</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: 'white', width: '130px', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', textTransform: 'uppercase' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {panierProforma?.map((art, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                  <td style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontWeight: '500' }}>{art.designation || art.nom}</td>
                  <td style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{art.quantite}</td>
                  <td style={{ textAlign: 'right', padding: '12px 12px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>
                    {(art.prix_unitaire_vente || art.prix_unitaire || art.prix_vente || 0).toLocaleString()} F
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #f1f5f9', color: '#0f172a', fontWeight: '700' }}>
                    {((art.prix_unitaire_vente || art.prix_unitaire || art.prix_vente || 0) * art.quantite).toLocaleString()} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BLOC DES RECAPITULATIFS (TOTAL & SOMME EN LETTRES) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '30px', marginBottom: '40px' }}>
          <div style={{ flex: 1, maxWidth: '55%', lineHeight: '1.6', fontSize: '12px', color: '#334155' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Arrêtée la présente Proforma à la somme de :</strong><br />
              <span style={{ color: '#0f172a', fontWeight: '500' }}>{nombreEnLettres(totalProforma)} Francs CFA</span>
            </p>
          </div>

          <div style={{ width: '240px', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', fontSize: '12px' }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>SOUS TOTAL</span>
              <span style={{ color: '#475569', fontWeight: '600' }}>{totalProforma.toLocaleString()} F</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', fontSize: '13px', borderTop: '1px solid #e2e8f0' }}>
              <span style={{ color: '#0f172a', fontWeight: '800' }}>TOTAL NET</span>
              <span style={{ color: '#0f7490', fontWeight: '800' }}>{totalProforma.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        {/* Zone des Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 30px', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '50px' }}>
          <span style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px', minWidth: '120px', textAlign: 'center', letterSpacing: '0.5px' }}>BON POUR ACCORD</span>
          <span style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px', minWidth: '120px', textAlign: 'center', letterSpacing: '0.5px' }}>LE PRESTATAIRE</span>
        </div>

      </div>

      {/* PIED DE PAGE : Signatures et Bandeau de couleur fixés en bas de page */}
      <div style={{ 
        position: 'absolute', 
        bottom: '0px',              /* Fixé à l'extrême bas de la feuille */
        left: '0px',               /* Aligné pile sur le bord gauche */
        width: '794px',            /* Prend exactement la largeur totale de la feuille */
        boxSizing: 'border-box'
      }}>
        
        {/* Bande décorative premium en bas de page */}
        <div style={{
          minHeight: '35px',       /* Permet au bandeau de s'agrandir un peu si le texte passe sur 2 lignes */
          background: 'linear-gradient(90deg, #0f7490 0%, #134e5e 100%)',
          borderTopLeftRadius: '30px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '8px 30px',     /* Espace interne pour le texte */
          color: '#ffffff',
          fontSize: '9px',         /* Écriture petite et discrète */
          lineHeight: '1',
          letterSpacing: '0.3px',
          boxSizing: 'border-box'
        }}>
          <div>
            <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{factureConfig.nom}</span>
            {factureConfig.adresse && <span> • 📍 {factureConfig.adresse}</span>}
            {factureConfig.email && <span> • ✉️ {factureConfig.email}</span>}
            {factureConfig.site && <span> • 🌐 {factureConfig.site}</span>}
          </div>
          {factureConfig.rib && (
            <div style={{ 
              marginTop: '3px', 
              fontSize: '8.5px', 
              opacity: 0.8, 
              borderTop: '0.5px solid rgba(255, 255, 255, 0.15)', 
              paddingTop: '3px',
              width: '100%',
              textAlign: 'center'
            }}>
              <strong>RIB :</strong> {factureConfig.rib}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
   return (
  <div className="zone-facture-blanche" style={{ 
    width: '794px', 
    height: '1123px', 
    fontSize: '13px', 
    color: '#333333', 
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#ffffff',
    padding: '40px 40px 20px 40px', /* Espace intérieur de la feuille */
    position: 'relative',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  }}>
    
    {/* EN-TÊTE : LOGO À GAUCHE ET NUMÉROTATION À DROITE */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
      
      {/* 🌟 CÔTÉ GAUCHE (LOGO) : C'est ici qu'on ajoute le marginTop négatif pour le faire monter seul */}
      <div style={{ 
        width: '200px', 
        height: '250px', 
        marginTop: '-90px', /* 🌟 Fait monter uniquement le logo vers le haut */
        border: factureConfig.logo ? 'none' : '1px solid #d1d5db', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: '#9ca3af',
        overflow: 'hidden'
      }}>
        {factureConfig.logo ? (
          <img 
            src={factureConfig.logo} 
            alt="Logo" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        ) : (
          <span style={{ fontSize: '11px' }}>[ Emplacement Logo ]</span>
        )}
      </div>
      
      {/* CÔTÉ DROIT (NUMÉROTATION) : Reste sagement à sa place d'origine */}
      <div style={{ textAlign: 'right', minWidth: '150px' }}>
        <h2 style={{ margin: 0, color: '#4b5563', fontSize: '22px', fontWeight: '700', letterSpacing: '1px' }}>FACTURE PROFORMA</h2>
        <div style={{ width: '100%', height: '1px', backgroundColor: '#4b5563', margin: '8px 0' }}></div>
        <p style={{ margin: 0, fontSize: '13px', color: '#1f2937' }}>Date: {new Date().toLocaleDateString('fr-FR')}</p>
      </div>
    </div>

    {/* SECTION CLIENT */}
    <div style={{ marginTop: '-50px', marginBottom: '25px', paddingLeft: '5px' }}>
      <p style={{ margin: 0, fontSize: '14px', color: '#1f2937' }}>
        <strong>Client:</strong> {clientProforma || nomClientAffiche || "CLIENT COMPTANT"}
      </p>
    </div>

    {/* TABLEAU DES ARTICLES */}
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #4b5563', marginBottom: '10px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#4b5563', color: 'white' }}>
            <th style={{ textAlign: 'center', padding: '10px', fontSize: '12px', fontWeight: '600', width: '50px' }}>Qté.</th>
            <th style={{ textAlign: 'left', padding: '10px', fontSize: '12px', fontWeight: '600' }}>Description</th>
            <th style={{ textAlign: 'right', padding: '10px', fontSize: '12px', fontWeight: '600', width: '100px' }}>Prix.U</th>
            <th style={{ textAlign: 'right', padding: '10px', fontSize: '12px', fontWeight: '600', width: '120px' }}>Montant</th>
          </tr>
        </thead>
        <tbody>
          {panierProforma?.map((art, idx) => (
            <tr key={idx} style={{ backgroundColor: 'white' }}>
              <td style={{ textAlign: 'center', padding: '12px 10px', borderBottom: '1px solid #e5e7eb', color: '#1f2937' }}>{art.quantite}</td>
              <td style={{ textAlign: 'left', padding: '12px 10px', borderBottom: '1px solid #e5e7eb', color: '#1f2937', fontWeight: '500' }}>{art.designation || art.nom}</td>
              <td style={{ textAlign: 'right', padding: '12px 10px', borderBottom: '1px solid #e5e7eb', color: '#1f2937' }}>
                {(art.prix_unitaire_vente || art.prix_unitaire || art.prix_vente || 0).toLocaleString()} 
              </td>
              <td style={{ textAlign: 'right', padding: '12px 10px', borderBottom: '1px solid #e5e7eb', color: '#1f2937' }}>
                {((art.prix_unitaire_vente || art.prix_unitaire || art.prix_vente || 0) * art.quantite).toLocaleString()} FCFA
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* BLOC MONTANT TOTAL */}
    <div style={{ 
      backgroundColor: '#4b5563', 
      color: 'white', 
      borderRadius: '12px', 
      padding: '10px 15px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      fontWeight: '700',
      fontSize: '13px',
      marginBottom: '20px'
    }}>
      <span>Montant TOTAL :</span>
      <span>{totalProforma.toLocaleString()} FCFA</span>
    </div>

    {/* MENTIONS COMPLÉMENTAIRES & SOMME EN LETTRES */}
    <div style={{ paddingLeft: '5px', lineHeight: '1.6', fontSize: '12px', color: '#1f2937' }}>
      <p style={{ margin: '0 0 8px 0' }}>
        <strong>Arrêtée la présente Proforma à la somme de :</strong> <span style={{ textTransform: 'capitalize' }}>{nombreEnLettres(totalProforma)}</span> Francs CFA
      </p>
    </div>

    {/* BLOC SIGNATURES */}
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', padding: '0 20px', fontSize: '11px', fontWeight: '700', color: '#374151' }}>
      <span>BON POUR ACCORD</span>
      <span>LE PRESTATAIRE</span>
    </div>

    {/* PIED DE PAGE : Fixé harmonieusement tout en bas de la feuille */}
    <div style={{ 
      position: 'absolute', 
      bottom: '0px',              /* Fixé à l'extrême bas de la feuille */
      left: '0px',               /* Aligné pile sur le bord gauche */
      width: '794px',            /* Largeur totale stricte de la facture */
      backgroundColor: '#4b5563', /* Gris ardoise assorti au tableau */
      color: '#ffffff',          /* Texte en blanc pur pour le contraste */
      padding: '12px 30px',      /* Hauteur compacte */
      textAlign: 'center', 
      fontSize: '9px',           /* Écriture discrète */
      lineHeight: '1',         /* Interligne propre */
      letterSpacing: '0.3px',
      boxSizing: 'border-box'
    }}>
      <div>
        <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#ffffff' }}>{factureConfig.nom}</span>
        {factureConfig.adresse && <span> • 📍 {factureConfig.adresse}</span>}
        {factureConfig.email && <span> • ✉️ {factureConfig.email}</span>}
        {factureConfig.site && <span> • 🌐 {factureConfig.site}</span>}
      </div>
      {factureConfig.rib && (
        <div style={{ 
          marginTop: '4px', 
          fontSize: '8.5px', 
          opacity: 0.8, 
          borderTop: '0.5px solid rgba(255, 255, 255, 0.25)', /* Ligne blanche très subtile */
          paddingTop: '4px',
          width: '100%',
          textAlign: 'center'
        }}>
          <strong>RIB :</strong> {factureConfig.rib}
        </div>
      )}
    </div>

  </div>
);
 })()}
  </div>


      {/* BOUTONS ACTIONS EN BAS TOTALEMENT OPÉRATIONNELS */}
<div style={{ display: 'flex', gap: '12px', borderTop: `1px solid ${stylesTheme.bordures}`, paddingTop: '20px', marginTop: 'auto', backgroundColor: stylesTheme.fondCartes, flexShrink: 0 }}>
  
  {/* BOUTON 1 : IMPRESSION PHYSIQUE CORRIGÉE ET SÉCURISÉE */}
  <button
    disabled={!venteSelectionnee && (!panierProforma || panierProforma.length === 0)}
    onClick={() => {
      const elementFacture = document.querySelector('.zone-facture-blanche') || document.querySelector('table')?.parentElement?.parentElement;
      if (elementFacture) {
        const fenetreImpression = window.open('', '_blank', 'height=850,width=850');
        
        // On récupère les styles calculés du conteneur d'origine pour ne rien perdre
        const paddingOrigine = elementFacture.style.padding || '20px 30px';

        // Détermination dynamique du titre
        const titreImpression = venteSelectionnee 
          ? `Facture N°${venteSelectionnee.numero_ticket}` 
          : `Facture Proforma - ${new Date().toLocaleDateString('fr-FR')}`;

        fenetreImpression.document.write(`
          <html>
            <head>
              <title>${titreImpression}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 0; 
                  background-color: white; 
                  -webkit-print-color-adjust: exact; 
                  print-color-adjust: exact; 
                }
                @page { 
                  size: A4 portrait; 
                  margin: 0mm; 
                }
                .print-wrapper {
                  width: 794px;
                  height: 1123px;
                  position: relative;
                  box-sizing: border-box;
                  display: flex;
                  flex-direction: column;
                  padding: ${paddingOrigine};
                  background-color: #ffffff;
                  overflow: hidden;
                }
              </style>
            </head>
            <body>
              <div class="print-wrapper">
                ${elementFacture.innerHTML}
              </div>
            </body>
          </html>
        `);
        fenetreImpression.document.close();
        setTimeout(() => {
          fenetreImpression.focus();
          fenetreImpression.print();
          fenetreImpression.close();
        }, 300);
      } else {
        window.print();
      }
    }}
    style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px',
      backgroundColor: (venteSelectionnee || (panierProforma && panierProforma.length > 0)) ? '#0284c7' : stylesTheme.bordures, 
      color: 'white',
      border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: (venteSelectionnee || (panierProforma && panierProforma.length > 0)) ? 'pointer' : 'not-allowed', transition: '0.2s'
    }}
  >
    🖨️ Imprimer {venteSelectionnee ? "la Facture" : "la Proforma"}
  </button>

  {/* BOUTON 2 : TÉLÉCHARGEMENT DIRECT DU PDF CORRIGÉ */}
  <button
    disabled={!venteSelectionnee && (!panierProforma || panierProforma.length === 0)}
    onClick={() => {
      const elementFacture = document.querySelector('.zone-facture-blanche') || document.querySelector('table')?.parentElement?.parentElement;
      
      if (!elementFacture) {
        alert("Erreur : Impossible de trouver le contenu du document.");
        return;
      }

      const telechargerPDF = () => {
        // Nom de fichier dynamique selon le mode actif
        const nomFichier = venteSelectionnee 
          ? `Facture_Proforma_${new Date().toISOString().slice(0,10)}.pdf` 
          : `Facture_Proforma_${new Date().toISOString().slice(0,10)}.pdf`;

        const options = {
          margin: 0, /* Marges à 0 car gérées en interne par les 794px de la facture */
          filename: nomFichier,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' } /* Impose la taille exacte de l'image pixel par pixel */
        };

        // On clone l'élément en lui ré-appliquant la structure Flexbox verticale et la hauteur stricte
        const conteneurTemporaire = document.createElement('div');
        conteneurTemporaire.style.width = '794px';
        conteneurTemporaire.style.height = '1123px';
        conteneurTemporaire.style.position = 'relative';
        conteneurTemporaire.style.boxSizing = 'border-box';
        conteneurTemporaire.style.display = 'flex';
        conteneurTemporaire.style.flexDirection = 'column';
        conteneurTemporaire.style.fontFamily = 'Arial, sans-serif';
        conteneurTemporaire.style.backgroundColor = '#ffffff';
        
        // On conserve exactement le padding d'origine de votre facture
        conteneurTemporaire.style.padding = '20px 30px'; 
        
        conteneurTemporaire.innerHTML = elementFacture.innerHTML;

        window.html2pdf().from(conteneurTemporaire).set(options).save();
      };

      if (window.html2pdf) {
        telechargerPDF();
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => {
          telechargerPDF();
        };
        document.head.appendChild(script);
      }
    }}
    style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px',
      backgroundColor: stylesTheme.fondApplication, 
      color: (venteSelectionnee || (panierProforma && panierProforma.length > 0)) ? stylesTheme.textePrincipal : stylesTheme.texteSecondaire, 
      border: `1px solid ${stylesTheme.bordures}`,
      borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: (venteSelectionnee || (panierProforma && panierProforma.length > 0)) ? 'pointer' : 'not-allowed', transition: '0.2s'
    }}
  >
    📥 Exporter en PDF
  </button>

</div>

    </div>
  </div>
)}
      {sousOngletFacture === 'mode' && (
  <div>
    <h3 style={{ marginTop: 0, color: stylesTheme.textePrincipal, borderBottom: `1px solid ${stylesTheme.bordures}`, paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      🎨 Choix du Modèle Graphique de Facture
    </h3>
    <p style={{ color: stylesTheme.texteSecondaire, fontSize: '13px', marginBottom: '20px' }}>
      Sélectionnez le style visuel de vos factures. Le modèle choisi sera appliqué automatiquement à l'aperçu et lors de l'impression.
    </p>

    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
      gap: '16px', 
      marginTop: '15px' 
    }}>
      {[
        { id: 'moderne', nom: 'Moderne Tech', desc: 'Angles arrondis, look technologique et dynamique. Idéal pour le retail tech.', couleur: '#4b5563' },
        { id: 'minimaliste', nom: 'Minimaliste Épuré', desc: 'Lignes ultra-fines, aucun bloc lourd, style scandinave très lisible.', couleur: '#111827' },
        { id: 'premium', nom: 'Premium Royal', desc: 'Teintes violettes/indigo élégantes pour une image haut de gamme.', couleur: '#6366f1' },
        { id: 'luxe', nom: 'Facture Simple', desc: 'Structure classique en noir et blanc avec bordures fines et espace de signature.', couleur: '#000000' },
        { id: 'corporate', nom: 'Corporate Bleu', desc: 'Structure robuste, en-têtes bleues solides, inspire une confiance maximale.', couleur: '#0284c7' }
      ].map((modele) => {
        const estActif = modeleSelectionne === modele.id;
        return (
          <div 
            key={modele.id}
            onClick={async () => {
              try {
                // 1. On change immédiatement le visuel sur l'écran React
                if (typeof setModeleSelectionne === 'function') setModeleSelectionne(modele.id);

                // 2. On l'enregistre en base de données pour cet administrateur
                const token = localStorage.getItem('token');
                await fetch('http://localhost:5000/api/facture-config', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'admin-id': user?.id || user?._id
                  },
                  body: JSON.stringify({
                    nom: nomEntreprise,
                    adresse: adresseEntreprise,
                    logo: logoUrl,
                    email: emailEntreprise,
                    rib: ribEntreprise,
                    site: siteWeb,
                    mode_facture: modele.id // Envoi du modèle sélectionné
                  })
                });
              } catch (error) {
                console.error("Erreur lors de la sauvegarde du modèle :", error);
              }
            }}
            style={{
              border: estActif ? `2px solid ${modele.couleur}` : `1px solid ${stylesTheme.bordures}`,
              borderRadius: '12px',
              padding: '16px',
              backgroundColor: stylesTheme.fondCartes,
              cursor: 'pointer',
              boxShadow: estActif ? '0 4px 12px rgba(0,0,0,0.08)' : '0 2px 4px rgba(0,0,0,0.02)',
              transform: estActif ? 'scale(1.02)' : 'none',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            {estActif && (
              <span style={{ 
                position: 'absolute', top: '10px', right: '10px', 
                backgroundColor: modele.couleur, color: 'white', 
                borderRadius: '50%', width: '20px', height: '20px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' 
              }}>✓</span>
            )}
            <div style={{ width: '40px', height: '6px', backgroundColor: modele.couleur, borderRadius: '3px', marginBottom: '12px' }}></div>
            <h4 style={{ margin: '0 0 6px 0', color: stylesTheme.textePrincipal, fontSize: '15px', fontWeight: '600' }}>{modele.nom}</h4>
            <p style={{ margin: 0, color: stylesTheme.texteSecondaire, fontSize: '12px', lineHeight: '1.4' }}>{modele.desc}</p>
          </div>
        );
      })}
    </div>
  </div>
)}

{sousOngletFacture === 'configuration' && (
  <div style={{ 
    backgroundColor: stylesTheme.fondCartes, 
    padding: '30px', 
    borderRadius: '16px', 
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    width: '100%',
    boxSizing: 'border-box',
    border: `1px solid ${stylesTheme.bordures}`
  }}>
    <h3 style={{ marginTop: 0, color: stylesTheme.textePrincipal, fontSize: '18px', fontWeight: '700', borderBottom: `1px solid ${stylesTheme.bordures}`, paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ backgroundColor: stylesTheme.fondApplication, padding: '6px', borderRadius: '8px', fontSize: '16px' }}>⚙️</span> Configuration de la Facture
    </h3>
    <p style={{ color: stylesTheme.texteSecondaire, fontSize: '13px', marginBottom: '25px', lineHeight: '1.5' }}>
      Modifiez les informations et mentions légales. Cliquez sur Enregistrer pour les appliquer au bas de vos factures.
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '25px' }}>
      {/* COLONNE GAUCHE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: stylesTheme.texteSecondaire, marginBottom: '6px' }}>Nom de l'entreprise</label>
          <input 
            type="text" 
            value={nomEntreprise} 
            onChange={(e) => setNomEntreprise(e.target.value)} 
            placeholder="Ex: Mon Entreprise" 
            style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1px solid ${stylesTheme.bordures}`, fontSize: '13px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal }} 
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; e.target.style.backgroundColor = stylesTheme.fondCartes; }}
            onBlur={(e) => { e.target.style.borderColor = stylesTheme.bordures; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = stylesTheme.fondApplication; }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: stylesTheme.texteSecondaire, marginBottom: '6px' }}>Adresse géographique</label>
          <input 
            type="text" 
            value={adresseEntreprise} 
            onChange={(e) => setAdresseEntreprise(e.target.value)} 
            placeholder="Ex: Rue, Ville, Pays" 
            style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1px solid ${stylesTheme.bordures}`, fontSize: '13px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal }} 
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; e.target.style.backgroundColor = stylesTheme.fondCartes; }}
            onBlur={(e) => { e.target.style.borderColor = stylesTheme.bordures; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = stylesTheme.fondApplication; }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: stylesTheme.texteSecondaire, marginBottom: '6px' }}>Logo de l'entreprise</label>
          <input 
            id="facture-logo-input"
            type="file" 
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setLogoUrl(reader.result);
                };
                reader.readAsDataURL(file);
              }
            }} 
            style={{ 
              width: '100%', 
              fontSize: '13px',
              color: stylesTheme.texteSecondaire,
              padding: '8px 0'
            }} 
          />
          {logoUrl && (
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: stylesTheme.fondApplication, borderRadius: '10px', border: `1px solid ${stylesTheme.bordures}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: stylesTheme.texteSecondaire }}>Aperçu du logo :</span>
                <img src={logoUrl} alt="Aperçu logo" style={{ display: 'block', maxHeight: '45px', maxWidth: '140px', objectFit: 'contain', borderRadius: '4px' }} />
              </div>
              <button
                type="button"
                onClick={() => {
                  setLogoUrl('');
                  const input = document.getElementById('facture-logo-input');
                  if (input) input.value = ''; 
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#fee2e2',
                  color: '#ef4444',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#fca5a5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#fee2e2'}
              >
                🗑️ Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* COLONNE DROITE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: stylesTheme.texteSecondaire, marginBottom: '6px' }}>Email de contact</label>
          <input 
            type="email" 
            value={emailEntreprise} 
            onChange={(e) => setEmailEntreprise(e.target.value)} 
            placeholder="contact@exemple.com" 
            style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1px solid ${stylesTheme.bordures}`, fontSize: '13px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal }} 
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; e.target.style.backgroundColor = stylesTheme.fondCartes; }}
            onBlur={(e) => { e.target.style.borderColor = stylesTheme.bordures; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = stylesTheme.fondApplication; }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: stylesTheme.texteSecondaire, marginBottom: '6px' }}>Coordonnées Bancaires (RIB)</label>
          <input 
            type="text" 
            value={ribEntreprise} 
            onChange={(e) => setRibEntreprise(e.target.value)} 
            placeholder="Banque - N° de Compte" 
            style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1px solid ${stylesTheme.bordures}`, fontSize: '13px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal }} 
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; e.target.style.backgroundColor = stylesTheme.fondCartes; }}
            onBlur={(e) => { e.target.style.borderColor = stylesTheme.bordures; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = stylesTheme.fondApplication; }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: stylesTheme.texteSecondaire, marginBottom: '6px' }}>Site Internet</label>
          <input 
            type="text" 
            value={siteWeb} 
            onChange={(e) => setSiteWeb(e.target.value)} 
            placeholder="www.exemple.com" 
            style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1px solid ${stylesTheme.bordures}`, fontSize: '13px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal }} 
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; e.target.style.backgroundColor = stylesTheme.fondCartes; }}
            onBlur={(e) => { e.target.style.borderColor = stylesTheme.bordures; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = stylesTheme.fondApplication; }}
          />
        </div>
      </div>
    </div>

  {/* BOUTON ENREGISTRER - SAUVEGARDE EN BASE DE DONNÉES */}
    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${stylesTheme.bordures}`, paddingTop: '18px' }}>
      <button
        onClick={async () => {
          const nouvelleConfig = {
            nom: nomEntreprise,
            adresse: adresseEntreprise,
            logo: logoUrl,
            email: emailEntreprise,
            rib: ribEntreprise,
            site: siteWeb
          };

          try {
            const adminId = user?.id || user?._id || user?.username;

            const response = await fetch('http://localhost:5000/api/facture-config', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'admin-id': adminId 
              },
              body: JSON.stringify(nouvelleConfig)
            });

            if (response.ok) {
              setFactureConfig(nouvelleConfig);
              alert('Configuration de la facture enregistrée en base de données avec succès !');
            } else {
              const errorData = await response.json().catch(() => ({}));
              alert(`Erreur lors de la sauvegarde sur le serveur : ${errorData.message || response.statusText}`);
            }
          } catch (error) {
            console.error("Erreur de connexion au serveur :", error);
            alert("Impossible de joindre le serveur. Vérifiez votre connexion internet.");
          }
        }}
        style={{
          padding: '11px 24px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontWeight: '600',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
        }}
        onMouseEnter={(e) => { e.target.style.backgroundColor = '#1d4ed8'; e.target.style.boxShadow = '0 6px 14px rgba(37, 99, 235, 0.3)'; }}
        onMouseLeave={(e) => { e.target.style.backgroundColor = '#2563eb'; e.target.style.boxShadow = '0 4px 10px rgba(37, 99, 235, 0.2)'; }}
      >
        💾 Enregistrer les informations
      </button>
    </div>
  </div>
)}
        </div>
      )}

    </div>
  </div>
)}
{ongletActif === 'utilisateurs' && (
  <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
    
    {/* MENU DE SÉLECTION */}
    {(!sousOnglet || sousOnglet === 'menu') && (
      <div>
        <h2 style={{ color: stylesTheme.textePrincipal, marginBottom: '40px', textAlign: 'center', fontWeight: '800', fontSize: '26px', letterSpacing: '0.5px' }}>
          👥 Gestion du Personnel
        </h2>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '25px', 
          justifyContent: 'center',
          alignItems: 'stretch'
        }}>
          
          {/* GESTION DES VENDEURS */}
          <div onClick={() => setSousOnglet('gestion')} style={{ width: '280px', backgroundColor: stylesTheme.fondCartes, padding: '30px 20px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', textAlign: 'center', cursor: 'pointer', border: `1px solid ${stylesTheme.bordures}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: stylesTheme.fondApplication === '#ffffff' ? '#f3e8ff' : '#2e1b4e', padding: '15px', borderRadius: '50%', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={32} color="#8e44ad" />
            </div>
            <h3 style={{ margin: '0', fontSize: '16px', color: stylesTheme.textePrincipal, fontWeight: '700' }}>Gestion des vendeurs</h3>
          </div>

          {/* CRÉATION DE VENDEUR */}
          <div onClick={() => setSousOnglet('creation')} style={{ width: '280px', backgroundColor: stylesTheme.fondCartes, padding: '30px 20px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', textAlign: 'center', cursor: 'pointer', border: `1px solid ${stylesTheme.bordures}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: stylesTheme.fondApplication === '#ffffff' ? '#dcfce7' : '#143c24', padding: '15px', borderRadius: '50%', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlusCircle size={32} color="#27ae60" />
            </div>
            <h3 style={{ margin: '0', fontSize: '16px', color: stylesTheme.textePrincipal, fontWeight: '700' }}>Création de vendeur</h3>
          </div>

          {/* MODIFIER MOT DE PASSE */}
          <div onClick={() => setSousOnglet('password')} style={{ width: '280px', backgroundColor: stylesTheme.fondCartes, padding: '30px 20px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', textAlign: 'center', cursor: 'pointer', border: `1px solid ${stylesTheme.bordures}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: stylesTheme.fondApplication === '#ffffff' ? '#ffedd5' : '#452a14', padding: '15px', borderRadius: '50%', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={32} color="#e67e22" />
            </div>
            <h3 style={{ margin: '0', fontSize: '16px', color: stylesTheme.textePrincipal, fontWeight: '700' }}>Modifier mot de passe</h3>
          </div>

         {/* ANNULER UNE VENTE */}
          <div onClick={() => setSousOnglet('annulation')} style={{ width: '280px', backgroundColor: stylesTheme.fondCartes, padding: '30px 20px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', textAlign: 'center', cursor: 'pointer', border: `1px solid ${stylesTheme.bordures}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: stylesTheme.fondApplication === '#ffffff' ? '#fee2e2' : '#4c1d1d', padding: '15px', borderRadius: '50%', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCcw size={32} color="#e74c3c" />
            </div>
            <h3 style={{ margin: '0', fontSize: '16px', color: stylesTheme.textePrincipal, fontWeight: '700' }}>Annuler une vente</h3>
          </div>

         {/* TICKET DE CAISSE */}
          <div onClick={() => setSousOnglet('ticket')} style={{ width: '280px', backgroundColor: stylesTheme.fondCartes, padding: '30px 20px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', textAlign: 'center', cursor: 'pointer', border: `1px solid ${stylesTheme.bordures}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: stylesTheme.fondApplication === '#ffffff' ? '#ccfbf1' : '#113c34', padding: '15px', borderRadius: '50%', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Printer size={32} color="#1abc9c" />
            </div>
            <h3 style={{ margin: '0', fontSize: '16px', color: stylesTheme.textePrincipal, fontWeight: '700' }}>Ticket de caisse</h3>
          </div>

          {/* 🌟 NOUVEAU SOUS-ONGLET : FOND DE ROULEMENT */}
          <div onClick={() => setSousOnglet('fond_roulement')} style={{ width: '280px', backgroundColor: stylesTheme.fondCartes, padding: '30px 20px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', textAlign: 'center', cursor: 'pointer', border: `1px solid ${stylesTheme.bordures}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: stylesTheme.fondApplication === '#ffffff' ? '#e0e7ff' : '#1e1b4b', padding: '15px', borderRadius: '50%', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={32} color="#4f46e5" />
            </div>
            <h3 style={{ margin: '0', fontSize: '16px', color: stylesTheme.textePrincipal, fontWeight: '700' }}>Fond de roulement</h3>
          </div>

          {/* 🌟 NOUVEAU SOUS-ONGLET : RESTAURATION (AJOUTÉ JUSTE AVANT RESET) */}
          <div onClick={() => setSousOnglet('restauration')} style={{ width: '280px', backgroundColor: stylesTheme.fondCartes, padding: '30px 20px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', textAlign: 'center', cursor: 'pointer', border: `1px solid ${stylesTheme.bordures}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: stylesTheme.fondApplication === '#ffffff' ? '#fef3c7' : '#78350f', padding: '15px', borderRadius: '50%', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={32} color="#d97706" />
            </div>
            <h3 style={{ margin: '0', fontSize: '16px', color: stylesTheme.textePrincipal, fontWeight: '700' }}>Restauration</h3>
          </div>
{/* 🌟 NOUVEAU SOUS-ONGLET : ABONNEMENT (AJOUTÉ APRÈS RESET) */}
          <div onClick={() => setSousOnglet('abonnement')} style={{ width: '280px', backgroundColor: stylesTheme.fondCartes, padding: '30px 20px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', textAlign: 'center', cursor: 'pointer', border: `1px solid ${stylesTheme.bordures}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: stylesTheme.fondApplication === '#ffffff' ? '#fae8ff' : '#701a75', padding: '15px', borderRadius: '50%', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={32} color="#c026d3" />
            </div>
            <h3 style={{ margin: '0', fontSize: '16px', color: stylesTheme.textePrincipal, fontWeight: '700' }}>Abonnement</h3>
          </div>
          {/* REMISE À ZÉRO (RESET COMPTE CONNECTÉ) */}
          <div onClick={() => setSousOnglet('reset')} style={{ width: '280px', backgroundColor: stylesTheme.fondCartes, padding: '30px 20px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.06)', textAlign: 'center', cursor: 'pointer', border: stylesTheme.fondApplication === '#ffffff' ? '1px solid #fee2e2' : '1px solid #4c1d1d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: stylesTheme.fondApplication === '#ffffff' ? '#fee2e2' : '#4c1d1d', padding: '15px', borderRadius: '50%', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={32} color="#ef4444" />
            </div>
            <h3 style={{ margin: '0', fontSize: '16px', color: '#ef4444', fontWeight: '700' }}>Reset</h3>
          </div>
        </div>
      </div>
    )}

   {/* BOUTON RETOUR */}
    {sousOnglet && sousOnglet !== 'menu' && (
      <button 
        onClick={() => setSousOnglet('menu')}
        style={{ marginBottom: '25px', padding: '12px 24px', cursor: 'pointer', borderRadius: '10px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondCartes, fontWeight: 'bold', color: stylesTheme.textePrincipal, boxShadow: '0 2px 5px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        ⬅️ Retour au menu
      </button>
    )}
    {/* PAGE : CRÉATION DE VENDEUR */}
    {sousOnglet === 'creation' && (
      <div style={{ maxWidth: '550px', margin: '0 auto' }}>
        <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '35px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: `1px solid ${stylesTheme.bordures}` }}>
          <h2 style={{ marginTop: 0, color: stylesTheme.textePrincipal, fontSize: '22px', borderBottom: '2px solid #8e44ad', paddingBottom: '12px', fontWeight: '700' }}>
            ➕ Créer une session vendeur
          </h2>
          <div style={{ marginTop: '25px' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: stylesTheme.texteSecondaire }}>Prénom</label>
                <input 
                  type="text" 
                  value={prenomVendeur} 
                  onChange={(e) => setPrenomVendeur(e.target.value)}
                  placeholder="Ex: Moussa"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: stylesTheme.texteSecondaire }}>Nom de famille</label>
                <input 
                  type="text" 
                  value={nomFamilleVendeur} 
                  onChange={(e) => setNomFamilleVendeur(e.target.value)}
                  placeholder="Ex: Diarra"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
            </div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: stylesTheme.texteSecondaire }}>Nom d'utilisateur</label>
            <input 
              type="text" 
              value={nomVendeur} 
              onChange={(e) => setNomVendeur(e.target.value)}
              placeholder="Ex: Moussa_MG"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, marginBottom: '15px', outline: 'none' }}
            />

            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: stylesTheme.texteSecondaire }}>Téléphone</label>
                <input 
                  type="text" 
                  value={telVendeur} 
                  onChange={(e) => setTelVendeur(e.target.value)}
                  placeholder="Ex: 70707070"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: stylesTheme.texteSecondaire }}>Adresse Email</label>
                <input 
                  type="email" 
                  value={emailVendeur} 
                  onChange={(e) => setEmailVendeur(e.target.value)}
                  placeholder="Ex: v@gmail.com"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
            </div>

            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: stylesTheme.texteSecondaire }}>Mot de passe</label>
            <input 
              type="password" 
              value={mdpVendeur} 
              onChange={(e) => setMdpVendeur(e.target.value)}
              placeholder="Saisir un mot de passe"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, marginBottom: '25px', outline: 'none' }}
            />
            <button 
              onClick={creerCompteVendeur}
              style={{ width: '100%', padding: '14px', backgroundColor: '#8e44ad', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 12px rgba(142, 68, 173, 0.2)' }}
            >
              CRÉER LE COMPTE VENDEUR
            </button>
          </div>
        </div>
      </div>
    )}
    {/* PAGE : LISTE GESTION */}
    {sousOnglet === 'gestion' && (
      <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: `1px solid ${stylesTheme.bordures}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ marginTop: 0, color: stylesTheme.textePrincipal, fontWeight: '700' }}>📋 Liste des vendeurs</h2>
          <button onClick={chargerVendeurs} style={{ padding: '10px 16px', cursor: 'pointer', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 10px rgba(243, 156, 18, 0.2)' }}>
            Actualiser la liste
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: stylesTheme.fondApplication, borderBottom: `2px solid ${stylesTheme.bordures}` }}>
                <th style={{ textAlign: 'left', padding: '14px', color: stylesTheme.texteSecondaire, fontSize: '14px' }}>Utilisateur</th>
                <th style={{ textAlign: 'left', padding: '14px', color: stylesTheme.texteSecondaire, fontSize: '14px' }}>Rôle</th>
                <th style={{ textAlign: 'left', padding: '14px', color: stylesTheme.texteSecondaire, fontSize: '14px' }}>Mot de passe</th>
                <th style={{ textAlign: 'center', padding: '14px', color: stylesTheme.texteSecondaire, fontSize: '14px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listeUtilisateurs.map((u) => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${stylesTheme.bordures}` }}>
                  <td style={{ padding: '14px', fontWeight: '600', color: stylesTheme.textePrincipal }}>{u.nom_utilisateur}</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ backgroundColor: u.role === 'admin' ? '#fee2e2' : (stylesTheme.fondApplication === '#ffffff' ? '#e0f2fe' : '#143c59'), color: u.role === 'admin' ? '#ef4444' : '#0284c7', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', display: 'inline-block' }}>
                      {u.role ? u.role.toUpperCase() : 'USER'}
                    </span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type={voirMdp[u.id] ? "text" : "password"} 
                        value={u.mot_de_passe} 
                        readOnly
                        style={{ border: 'none', background: 'none', width: '130px', outline: 'none', color: voirMdp[u.id] ? '#10b981' : '#94a3b8', fontWeight: '600', fontSize: '15px' }}
                      />
                      <button 
                        onClick={() => setVoirMdp({...voirMdp, [u.id]: !voirMdp[u.id]})}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                      >
                        {voirMdp[u.id] ? <EyeOff size={18} color="#ef4444" /> : <Eye size={18} color="#64748b" />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <button 
                        onClick={() => reinitialiserMdp(u.id, u.nom_utilisateur)}
                        style={{ background: stylesTheme.fondApplication === '#ffffff' ? '#fef3c7' : '#453514', border: 'none', color: '#d97706', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Réinitialiser le mot de passe"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if(window.confirm(`Voulez-vous vraiment supprimer définitivement le vendeur ${u.nom_utilisateur} ?`)) {
                            supprimerVendeur(u.id);
                          }
                        }}
                        style={{ background: stylesTheme.fondApplication === '#ffffff' ? '#fee2e2' : '#4c1d1d', border: 'none', color: '#ef4444', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Supprimer le vendeur"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* PAGE : MOT DE PASSE */}
    {sousOnglet === 'password' && (
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '35px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: `1px solid ${stylesTheme.bordures}` }}>
          <h2 style={{ marginTop: 0, color: '#e67e22', fontSize: '20px', borderBottom: '2px solid #e67e22', paddingBottom: '12px', fontWeight: '700' }}>
            🔐 Changer mon mot de passe (Admin)
          </h2>
          <div style={{ marginTop: '25px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: stylesTheme.texteSecondaire }}>Ancien mot de passe</label>
            <input type="password" value={ancienMdp} onChange={(e) => setAncienMdp(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, marginBottom: '15px', outline: 'none' }} />
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: stylesTheme.texteSecondaire }}>Nouveau mot de passe</label>
            <input type="password" value={nouveauMdp} onChange={(e) => setNouveauMdp(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, marginBottom: '15px', outline: 'none' }} />
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: stylesTheme.texteSecondaire }}>Confirmer le nouveau</label>
            <input type="password" value={confirmerMdp} onChange={(e) => setConfirmerMdp(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, marginBottom: '25px', outline: 'none' }} />
            <button onClick={modifierMonMdp} style={{ width: '100%', padding: '14px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 12px rgba(230, 126, 34, 0.2)' }}>METTRE À JOUR</button>
          </div>
        </div>
      </div>
    )}

    {/* NOUVELLE PAGE : ANNULATION DE VENTE */}
    {sousOnglet === 'annulation' && (
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '35px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: `1px solid ${stylesTheme.bordures}` }}>
          <h2 style={{ marginTop: 0, color: '#e74c3c', fontSize: '20px', borderBottom: '2px solid #e74c3c', paddingBottom: '12px', fontWeight: '700' }}>
            🚫 Annuler une transaction
          </h2>
          <div style={{ marginTop: '25px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: stylesTheme.texteSecondaire }}>Numéro de la vente (ID)</label>
            <input 
              type="number" 
              id="idVenteAnnuler"
              placeholder="Ex: 45" 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, marginBottom: '15px', outline: 'none' }} 
            />
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: stylesTheme.texteSecondaire }}>Motif de l'annulation</label>
            <textarea 
              id="motifAnnulation"
              placeholder="Pourquoi annulez-vous ?" 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, marginBottom: '25px', minHeight: '80px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }} 
            ></textarea>
            <button 
              onClick={() => {
                const id = document.getElementById('idVenteAnnuler').value;
                const motif = document.getElementById('motifAnnulation').value;
                if(id && motif) handleAnnulerVente(id, motif);
              }}
              style={{ width: '100%', padding: '14px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 12px rgba(231, 76, 60, 0.2)' }}
            >
              CONFIRMER L'ANNULATION
            </button>
          </div>
        </div>
      </div>
    )}
    {/* PAGE DE CONFIGURATION DU TICKET DE CAISSE */}
    {sousOnglet === 'ticket' && (() => {
      const TicketConfigForm = () => {
        const [formTicket, setFormTicket] = React.useState({
          nom_boutique: '',
          adresse: '',
          telephone: '',
          message_pied: '',
          logo_url: null,
          logo_fichier: null
        });
        const [chargement, setChargement] = React.useState(true);

        React.useEffect(() => {
          const chargerConfig = async () => {
            try {
              const response = await fetch('http://localhost:5000/api/ticket-config', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              });
              if (response.ok) {
                const data = await response.json();
                setFormTicket({
                  nom_boutique: data.nom_boutique || '',
                  adresse: data.adresse || '',
                  telephone: data.telephone || '',
                  message_pied: data.message_pied || '',
                  logo_url: data.logo_url || null,
                  logo_fichier: null
                });
              }
            } catch (err) {
              console.error("Erreur de chargement de la configuration:", err);
            } finally {
              setChargement(false);
            }
          };
          chargerConfig();
        }, []);

        const supprimerLogo = async () => {
          if (!window.confirm("Voulez-vous vraiment supprimer le logo actuel ?")) return;
          try {
            const response = await fetch('http://localhost:5000/api/ticket-config', {
              method: 'PUT',
              headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                nom_boutique: formTicket.nom_boutique,
                adresse: formTicket.adresse,
                telephone: formTicket.telephone,
                message_pied: formTicket.message_pied,
                supprimer_logo: true // On envoie un indicateur pour nettoyer le champ sur le serveur
              })
            });

            if (response.ok) {
              const data = await response.json();
              setFormTicket(prev => ({
                ...prev,
                logo_url: null,
                logo_fichier: null
              }));
              if (typeof setConfigTicketGlobal === 'function') {
                setConfigTicketGlobal(data.config);
              }
              alert("Logo supprimé avec succès !");
            } else {
              alert("Erreur lors de la suppression du logo sur le serveur.");
            }
          } catch (err) {
            console.error("Erreur lors de la suppression du logo:", err);
            alert("Erreur de connexion avec le serveur.");
          }
        };

        const sauvegarderConfig = async () => {
          try {
            const formData = new FormData();
            formData.append('nom_boutique', formTicket.nom_boutique);
            formData.append('adresse', formTicket.adresse);
            formData.append('telephone', formTicket.telephone);
            formData.append('message_pied', formTicket.message_pied);
            if (formTicket.logo_fichier) {
              formData.append('logo', formTicket.logo_fichier);
            }

            const response = await fetch('http://localhost:5000/api/ticket-config', {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
              body: formData
            });

            if (response.ok) {
              const data = await response.json();
              setFormTicket(prev => ({
                ...prev,
                logo_url: data.config.logo_url,
                logo_fichier: null
              }));

              if (typeof setConfigTicketGlobal === 'function') {
                setConfigTicketGlobal(data.config);
              }

              alert("Ticket de caisse configuré avec succès !");
            } else {
              alert("Erreur lors de la mise à jour sur le serveur.");
            }
          } catch (err) {
            console.error("Erreur lors de la sauvegarde:", err);
            alert("Erreur de connexion avec le serveur.");
          }
        };

        if (chargement) return <div style={{ textAlign: 'center', padding: '20px', color: stylesTheme.texteSecondaire }}>Chargement de la configuration...</div>;

        return (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '35px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: `1px solid ${stylesTheme.bordures}` }}>
              <h2 style={{ marginTop: 0, color: '#1abc9c', fontSize: '20px', borderBottom: '2px solid #1abc9c', paddingBottom: '12px', fontWeight: '700' }}>
                🖨️ Personnaliser le ticket de caisse
              </h2>
              <div style={{ marginTop: '25px' }}>
                
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: stylesTheme.texteSecondaire }}>Nom de la boutique</label>
                <input 
                  type="text" 
                  value={formTicket.nom_boutique} 
                  onChange={(e) => setFormTicket({...formTicket, nom_boutique: e.target.value})} 
                  placeholder="Ex: Supermarché Horizon"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, marginBottom: '15px', boxSizing: 'border-box', outline: 'none' }} 
                />

                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: stylesTheme.texteSecondaire }}>Adresse de la boutique</label>
                <input 
                  type="text" 
                  value={formTicket.adresse} 
                  onChange={(e) => setFormTicket({...formTicket, adresse: e.target.value})} 
                  placeholder="Ex: Rue 24, Grand Marché, Bamako"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, marginBottom: '15px', boxSizing: 'border-box', outline: 'none' }} 
                />

                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: stylesTheme.texteSecondaire }}>Téléphone</label>
                <input 
                  type="text" 
                  value={formTicket.telephone} 
                  onChange={(e) => setFormTicket({...formTicket, telephone: e.target.value})} 
                  placeholder="Ex: +223 70 00 00 00"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, marginBottom: '15px', boxSizing: 'border-box', outline: 'none' }} 
                />

                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: stylesTheme.texteSecondaire }}>Message de bas de page</label>
                <textarea 
                  value={formTicket.message_pied} 
                  onChange={(e) => setFormTicket({...formTicket, message_pied: e.target.value})} 
                  placeholder="Ex: Les marchandises vendues ne sont pas reprises. Merci !" 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, marginBottom: '20px', minHeight: '60px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }} 
                ></textarea>

                <div style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: stylesTheme.texteSecondaire }}>🖼️ Logo de l'entreprise</label>
                  {formTicket.logo_url && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', backgroundColor: stylesTheme.fondApplication, padding: '8px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', color: stylesTheme.texteSecondaire }}>Logo actuel :</span>
                        <img 
                          src={formTicket.logo_url} 
                          alt="Logo Actuel" 
                          style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'contain', backgroundColor: '#ffffff', border: `1px solid ${stylesTheme.bordures}` }} 
                        />
                      </div>
                      <button
                        type="button"
                        onClick={supprimerLogo}
                        style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                      >
                        ❌ Supprimer
                      </button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormTicket({...formTicket, logo_fichier: file});
                      }
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, cursor: 'pointer', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <button 
                  onClick={sauvegarderConfig}
                  style={{ width: '100%', padding: '14px', backgroundColor: '#1abc9c', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 12px rgba(26, 188, 156, 0.2)' }}
                >
                  ENREGISTRER LA CONFIGURATION
                </button>
              </div>
            </div>
          </div>
        );
      };
      return <TicketConfigForm />;
    })()}

 {sousOnglet === 'fond_roulement' && (
  <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', maxWidth: '500px', margin: '0 auto', border: `1px solid ${stylesTheme.bordures}` }}>
    
    {/* Bouton Retour */}
    <button 
      onClick={() => setSousOnglet(null)} 
      style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'transparent', border: 'none', color: stylesTheme.texteSecondaire, cursor: 'pointer', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}
    >
      ← Retour aux configurations
    </button>

    <div style={{ textAlign: 'center', marginBottom: '25px' }}>
      <h2 style={{ margin: '0 0 10px 0', color: stylesTheme.textePrincipal, fontSize: '22px', fontWeight: '700' }}>Alimentation Centrale de la Caisse</h2>
      <p style={{ margin: '0', color: stylesTheme.texteSecondaire, fontSize: '14px' }}>
        Saisissez le fond de roulement de départ de votre boutique. Ce montant est sécurisé par compte.
      </p>
    </div>

    {/* BLOC : AFFICHAGE DU FOND DE ROULEMENT ACTUEL */}
    <div style={{ backgroundColor: stylesTheme.fondApplication, border: `1px solid ${stylesTheme.bordures}`, borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '25px' }}>
      <span style={{ fontSize: '13px', color: stylesTheme.texteSecondaire, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Fond de caisse actuel (BD)
      </span>
      <h1 style={{ margin: '5px 0 0 0', color: '#4f46e5', fontSize: '32px', fontWeight: '800' }}>
        {Number(fondDeRoulement).toLocaleString('fr-FR')} F
      </h1>
    </div>

    {/* FORMULAIRE D'INJECTION SERVEUR */}
    <form onSubmit={async (e) => {
      e.preventDefault();
      const montantSaisi = parseFloat(nouveauMontantFond || 0);

      if (!user) {
        alert("Session expirée. Veuillez vous reconnecter.");
        return;
      }

      // Récupération de l'ID propriétaire pour associer l'argent au bon compte
      const idProprietaire = user?.role === 'vendeur' 
        ? (user?.admin_id || user?.cree_par) 
        : (user?.id || user?._id);

      try {
        // Envoi à ta nouvelle route backend
        const response = await fetch('http://localhost:5000/api/fond-roulement', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            montant: montantSaisi, 
            utilisateur: idProprietaire 
          }),
        });

        if (response.ok) {
          // Mise à jour immédiate de l'affichage local si tout est ok en BD
          setFondDeRoulement(montantSaisi);
          setNouveauMontantFond('');
          alert(`Le fond de roulement de ${montantSaisi.toLocaleString('fr-FR')} F a été enregistré avec succès !`);
        } else {
          alert("Erreur lors de l'enregistrement sur le serveur.");
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
        alert("Impossible de contacter le serveur.");
      }
    }} 
    style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: '700', color: stylesTheme.texteSecondaire }}>
          Montant initial à sauvegarder (F) :
        </label>
        <input 
          type="number"
          placeholder="Ex: 100000"
          value={nouveauMontantFond}
          onChange={(e) => setNouveauMontantFond(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '8px',
            border: `1px solid ${stylesTheme.bordures}`,
            backgroundColor: stylesTheme.fondApplication,
            color: stylesTheme.textePrincipal,
            fontSize: '15px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
          required
        />
      </div>

      <button 
        type="submit"
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: '14px',
          transition: '0.2s',
          boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
        }}
      >
        Enregistrer en Base de Données
      </button>
    </form>

  </div>
)}
{sousOnglet === 'restauration' && (
  <div style={{ padding: '20px', backgroundColor: stylesTheme.fondCartes, borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}`, maxWidth: '600px', margin: '0 auto' }}>
    <h2 style={{ color: stylesTheme.textePrincipal, marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
      ⏪ Restauration des Données
    </h2>
    <p style={{ color: stylesTheme.texteSecondaire, fontSize: '14px', lineHeight: '1.5' }}>
      Si vous changez d'ordinateur ou si vous réinstallez l'application, importez votre dernier fichier de sauvegarde au format <strong>.json</strong>.
    </p>

    {/* ZONE DE DÉPÔT / SÉLECTION */}
    <div style={{ margin: '25px 0', padding: '30px', border: fichierCharge ? `2px solid #0284c7` : `2px dashed ${stylesTheme.bordures}`, borderRadius: '10px', textAlign: 'center', backgroundColor: stylesTheme.fondApplication, transition: '0.2s' }}>
      <input 
        type="file" 
        accept=".json" 
        id="upload-backup"
        style={{ display: 'none' }} 
        onChange={(e) => {
          const fichier = e.target.files[0];
          if (fichier) {
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const donneesParsees = JSON.parse(event.target.result);
                window.fichierSauvegardeSelectionne = donneesParsees; 
                
                console.log("📂 [REACT] Fichier JSON chargé avec succès :", donneesParsees);
                
                setFichierCharge({
                  nom: fichier.name,
                  taille: (fichier.size / 1024).toFixed(2) + " KB",
                  auteur: donneesParsees.metadata?.auteur || "Inconnu",
                  date: donneesParsees.metadata?.date_sauvegarde ? new Date(donneesParsees.metadata.date_sauvegarde).toLocaleString('fr-FR') : "Inconnue"
                });

              } catch (err) {
                console.error("❌ [REACT] Erreur lors du parsing JSON :", err);
                setFichierCharge({ error: "Le fichier n'est pas un JSON de sauvegarde valide." });
              }
            };
            reader.readAsText(fichier);
          }
        }}
      />
      <label htmlFor="upload-backup" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '40px' }}>{fichierCharge ? "📄" : "📂"}</span>
        <span style={{ color: '#0284c7', fontWeight: 'bold', fontSize: '14px' }}>
          {fichierCharge ? "Changer de fichier de sauvegarde" : "Cliquez pour sélectionner le fichier de sauvegarde"}
        </span>
        <span style={{ color: stylesTheme.texteSecondaire, fontSize: '12px' }}>Format accepté : .json uniquement</span>
      </label>
    </div>

    {/* AFFICHAGE DIRECT DES INFOS DU FICHIER SUR L'ÉCRAN */}
    {fichierCharge && !fichierCharge.error && (
      <div style={{ backgroundColor: stylesTheme.fondApplication, border: `1px solid ${stylesTheme.bordures}`, borderRadius: '8px', padding: '15px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ margin: '0 0 5px 0', color: '#0284c7', fontSize: '14px' }}>📊 Informations du fichier chargé :</h4>
        <div style={{ fontSize: '13px', color: stylesTheme.textePrincipal }}><strong>Nom :</strong> {fichierCharge.nom}</div>
        <div style={{ fontSize: '13px', color: stylesTheme.textePrincipal }}><strong>Taille :</strong> {fichierCharge.taille}</div>
        <div style={{ fontSize: '13px', color: stylesTheme.textePrincipal }}><strong>Sauvegardé par :</strong> {fichierCharge.auteur}</div>
        <div style={{ fontSize: '13px', color: stylesTheme.textePrincipal }}><strong>Date du backup :</strong> {fichierCharge.date}</div>
      </div>
    )}

    {/* Affichage en cas d'erreur de fichier */}
    {fichierCharge && fichierCharge.error && (
      <div style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', padding: '12px', color: '#991b1b', fontSize: '13px', marginBottom: '20px', fontWeight: 'bold' }}>
        ❌ {fichierCharge.error}
      </div>
    )}

    {/* BOUTON DE SÉCURITÉ DE RESTAURATION */}
    <button
      disabled={!fichierCharge || fichierCharge.error}
      onClick={async () => {
        if (!window.fichierSauvegardeSelectionne) return;

        const confirmation = window.confirm("⚠️ ATTENTION CRITIQUE :\n\nCette action va SUPPRIMER toutes les données actuelles de ce logiciel pour les remplacer par celles du fichier chargé.\n\nÊtes-vous sûr de vouloir écraser la base actuelle ?");
        
        if (confirmation) {
          try {
            // 🌟 CORRECTION : Lecture de l'objet utilisateur complet en session ou clés alternatives directes
            const sessionUtilisateur = JSON.parse(localStorage.getItem('user')) || {};
            const adminIdEnvoye = sessionUtilisateur.id 
              || localStorage.getItem('adminId') 
              || localStorage.getItem('userId') 
              || '1';

            console.log("📡 [REACT] Envoi de la requête de restauration pour l'Admin ID :", adminIdEnvoye);

            const reponse = await fetch('http://localhost:5000/api/restore-manuel', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'admin-id': String(adminIdEnvoye)
              },
              body: JSON.stringify(window.fichierSauvegardeSelectionne)
            });

            console.log("⚙️ [REACT] Statut HTTP reçu du serveur :", reponse.status);
            const resultat = await reponse.json();
            console.log("📥 [REACT] Contenu de la réponse serveur :", resultat);

            if (resultat.success) {
              alert("🎉 Félicitations ! Vos données ont été restaurées à 100% sur votre compte administrateur.");
              console.log("🔄 [REACT] Rechargement de la page imminent...");
              window.location.reload();
            } else {
              console.error("❌ [REACT] Le serveur a refusé la restauration :", resultat.error);
              alert(`❌ Échec côté serveur : ${resultat.error || JSON.stringify(resultat)}`);
            }
          } catch (error) {
            console.error("🚨 [REACT] Exception capturée lors du fetch :", error);
            alert(`❌ Erreur réseau ou crash : ${error.message}`);
          }
        }
      }}
      style={{
        width: '100%',
        padding: '14px',
        backgroundColor: (!fichierCharge || fichierCharge.error) ? stylesTheme.bordures : '#d97706',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '15px',
        cursor: (!fichierCharge || fichierCharge.error) ? 'not-allowed' : 'pointer',
        transition: '0.2s'
      }}
      onMouseEnter={(e) => {
        if(fichierCharge && !fichierCharge.error) e.currentTarget.style.backgroundColor = '#b45309';
      }}
      onMouseLeave={(e) => {
        if(fichierCharge && !fichierCharge.error) e.currentTarget.style.backgroundColor = '#d97706';
      }}
    >
      🔄 Lancer la Restauration Complète
    </button>
  </div>
)}
{/* ÉCRAN DU SOUS-ONGLET : ABONNEMENT */}
{sousOnglet === 'abonnement' && (
  <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
    
   
    
    {/* EN-TÊTE DU SOUS-ONGLET */}
    <div style={{ marginBottom: '35px' }}>
      <h2 style={{ color: stylesTheme.textePrincipal, margin: 0, fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
        💳 Gestion des Forfaits
      </h2>
      <p style={{ color: stylesTheme.texteSecondaire, margin: '5px 0 0 0', fontSize: '14px' }}>
        Sélectionnez un forfait pour afficher les membres actifs ou inscrire un nouveau client.
      </p>
    </div>

    {/* GRILLE DES 4 FORFAITS */}
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '20px', 
      justifyContent: 'center',
      marginBottom: '35px'
    }}>
      
      {/* 1. FORFAIT 1 MOIS */}
      <div 
        onClick={() => setForfaitSelectionne('1_mois')}
        style={{
          width: '220px',
          backgroundColor: stylesTheme.fondCartes,
          borderRadius: '16px',
          padding: '30px 20px',
          border: forfaitSelectionne === '1_mois' ? '2px solid #c026d3' : `1px solid ${stylesTheme.bordures}`,
          boxShadow: forfaitSelectionne === '1_mois' ? '0 10px 20px rgba(192, 38, 211, 0.1)' : '0 4px 15px rgba(0,0,0,0.02)',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}
      >
        <h3 style={{ color: stylesTheme.textePrincipal, margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>
          1 Mois
        </h3>
        <p style={{ color: stylesTheme.texteSecondaire, fontSize: '13px', margin: 0 }}>
          Formule Mensuelle
        </p>
      </div>

      {/* 2. FORFAIT 3 MOIS */}
      <div 
        onClick={() => setForfaitSelectionne('3_mois')}
        style={{
          width: '220px',
          backgroundColor: stylesTheme.fondCartes,
          borderRadius: '16px',
          padding: '30px 20px',
          border: forfaitSelectionne === '3_mois' ? '2px solid #c026d3' : `1px solid ${stylesTheme.bordures}`,
          boxShadow: forfaitSelectionne === '3_mois' ? '0 10px 20px rgba(192, 38, 211, 0.1)' : '0 4px 15px rgba(0,0,0,0.02)',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}
      >
        <h3 style={{ color: stylesTheme.textePrincipal, margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>
          3 Mois
        </h3>
        <p style={{ color: stylesTheme.texteSecondaire, fontSize: '13px', margin: 0 }}>
          Formule Trimestrielle
        </p>
      </div>

      {/* 3. FORFAIT 1 ANNÉE */}
      <div 
        onClick={() => setForfaitSelectionne('1_an')}
        style={{
          width: '220px',
          backgroundColor: stylesTheme.fondCartes,
          borderRadius: '16px',
          padding: '30px 20px',
          border: forfaitSelectionne === '1_an' ? '2px solid #c026d3' : `1px solid ${stylesTheme.bordures}`,
          boxShadow: forfaitSelectionne === '1_an' ? '0 12px 24px rgba(192, 38, 211, 0.15)' : '0 4px 15px rgba(0,0,0,0.02)',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}
      >
        <h3 style={{ color: stylesTheme.textePrincipal, margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>
          1 Année
        </h3>
        <p style={{ color: stylesTheme.texteSecondaire, fontSize: '13px', margin: 0 }}>
          Formule Annuelle
        </p>
      </div>

      {/* 4. FORFAIT À VIE */}
      <div 
        onClick={() => setForfaitSelectionne('a_vie')}
        style={{
          width: '220px',
          backgroundColor: stylesTheme.fondCartes,
          borderRadius: '16px',
          padding: '30px 20px',
          border: forfaitSelectionne === 'a_vie' ? '2px solid #8b5cf6' : `1px solid ${stylesTheme.bordures}`,
          boxShadow: forfaitSelectionne === 'a_vie' ? '0 10px 20px rgba(139, 92, 246, 0.15)' : '0 4px 15px rgba(0,0,0,0.02)',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}
      >
        <h3 style={{ color: stylesTheme.textePrincipal, margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>
          À Vie
        </h3>
        <p style={{ color: stylesTheme.texteSecondaire, fontSize: '13px', margin: 0 }}>
          Accès Illimité (VIP)
        </p>
      </div>
    </div>

    {/* ================================================================= */}
    {/* ZONE DU BAS REFAITE, TRÈS JOLIE ET CRÉATIVE (ENTOURÉE EN ROUGE)   */}
    {/* ================================================================= */}
    <div style={{ 
      backgroundColor: stylesTheme.fondCartes, 
      borderRadius: '24px', 
      border: `1px solid ${stylesTheme.bordures}`,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '45px 30px',
      maxWidth: '800px',
      margin: '0 auto',
      transition: 'all 0.3s ease'
    }}>
      
      {/* SECTION ACTION : DEMANDE DE CLÉ */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '15px', // Espace régulier entre le bouton et son message en dessous
        marginBottom: forfaitSelectionne ? '25px' : '0' 
      }}>
        <button
          disabled={!forfaitSelectionne || chargementCle}
          onClick={demanderCleActivation}
          style={{
            background: forfaitSelectionne ? 'linear-gradient(135deg, #d946ef 0%, #c026d3 100%)' : stylesTheme.bordures,
            color: forfaitSelectionne ? '#ffffff' : stylesTheme.texteSecondaire,
            border: 'none',
            padding: '16px 36px',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: forfaitSelectionne ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            boxShadow: forfaitSelectionne ? '0 6px 20px rgba(192, 38, 211, 0.25)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onMouseEnter={(e) => {
            if (forfaitSelectionne && !chargementCle) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(192, 38, 211, 0.35)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = forfaitSelectionne ? '0 6px 20px rgba(192, 38, 211, 0.25)' : 'none';
          }}
        >
          {chargementCle ? (
            <>⏳ Envoi de la demande...</>
          ) : (
            <>✨ Demander une clé d'activation</>
          )}
        </button>

        {/* MESSAGE DE STATUT POSITIONNÉ IDÉALEMENT JUSTE EN DESSOUS DU BOUTON */}
        {statutMessage && (
          <p style={{ 
            color: statutMessage.includes('❌') || statutMessage.includes('erreur') ? '#ef4444' : '#27ae60', 
            fontSize: '14px', 
            fontWeight: '600',
            margin: 0,
            backgroundColor: statutMessage.includes('❌') ? 'rgba(239, 68, 68, 0.05)' : 'rgba(39, 174, 96, 0.05)',
            padding: '8px 16px',
            borderRadius: '20px',
            display: 'inline-block',
            animation: 'fadeIn 0.3s ease'
          }}>
            {statutMessage}
          </p>
        )}
      </div>

      {/* LIGNE DE SÉPARATION VISUELLE ET DESIGN */}
      {forfaitSelectionne && (
        <div style={{ 
          width: '80%', 
          height: '1px', 
          backgroundColor: stylesTheme.bordures, 
          margin: '15px 0 30px 0',
          position: 'relative'
        }}>
          <span style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: stylesTheme.fondCartes,
            padding: '0 15px',
            color: stylesTheme.texteSecondaire,
            fontSize: '12px',
            fontWeight: '500'
          }}>
            OU
          </span>
        </div>
      )}

      {/* ZONE FORMULAIRE D'ACTIVATION ULTRA MODERNE */}
      {forfaitSelectionne ? (
        <div style={{
          width: '100%',
          maxWidth: '460px',
          padding: '25px',
          border: `1px solid ${stylesTheme.bordures}`,
          borderRadius: '20px',
          backgroundColor: modeSombre ? 'rgba(255,255,255,0.01)' : '#fcfcfd',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)',
          textAlign: 'center'
        }}>
          <h4 style={{ color: stylesTheme.textePrincipal, margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            🔑 Saisir la clé d'activation
          </h4>
          <p style={{ color: stylesTheme.texteSecondaire, fontSize: '12px', margin: '0 0 20px 0' }}>
            Entrez le code à 12 caractères reçu sur votre boîte de réception.
          </p>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
            <input 
              type="text"
              placeholder=""
              maxLength={12}
              value={cleSaisieUtilisateur}
              onChange={(e) => setCleSaisieUtilisateur(e.target.value)}
              style={{
                padding: '13px 16px',
                borderRadius: '12px',
                border: `1.5px solid ${stylesTheme.bordures}`,
                backgroundColor: stylesTheme.fondCartes,
                color: stylesTheme.textePrincipal,
                fontSize: '16px',
                fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace',
                fontWeight: '700',
                letterSpacing: '2px',
                textAlign: 'center',
                width: '65%',
                outline: 'none',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#c026d3'}
              onBlur={(e) => e.currentTarget.style.borderColor = stylesTheme.bordures}
            />
            <button
              onClick={validerCleActivation}
              style={{
                backgroundColor: '#27ae60',
                color: '#ffffff',
                border: 'none',
                padding: '13px 22px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(39, 174, 96, 0.2)',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#219653'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#27ae60'}
            >
              Vérifier
            </button>
          </div>
          
          {messageValidation && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: messageValidation.includes('incorrect') ? 'rgba(239, 68, 68, 0.08)' : 'rgba(39, 174, 96, 0.08)',
              color: messageValidation.includes('incorrect') ? '#ef4444' : '#27ae60',
              fontSize: '13px',
              fontWeight: '700',
              animation: 'fadeIn 0.3s ease'
            }}>
              {messageValidation}
            </div>
          )}
        </div>
      ) : (
        /* MESSAGE SANS SÉLECTION */
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: stylesTheme.texteSecondaire, fontSize: '13px' }}>
          💡 <span style={{ fontStyle: 'italic' }}>Veuillez sélectionner un forfait ci-dessus pour débloquer les options d'activation.</span>
        </div>
      )}
    </div>

  </div>
)}
    {/* PAGE : REMISE À ZÉRO SÉCURISÉE (RESET DYNAMIQUE DU COMPTE CONNECTÉ) */}
    {sousOnglet === 'reset' && (
      <div style={{ maxWidth: '550px', margin: '0 auto' }}>
        <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '35px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(239, 68, 68, 0.08)', border: stylesTheme.fondApplication === '#ffffff' ? '1px solid #fee2e2' : `1px solid ${stylesTheme.bordures}` }}>
          <h2 style={{ marginTop: 0, color: '#ef4444', fontSize: '22px', borderBottom: '2px solid #ef4444', paddingBottom: '12px', fontWeight: '700' }}>
            ⚠️ Réinitialisation de votre compte
          </h2>
          <div style={{ marginTop: '25px' }}>
            <p style={{ color: stylesTheme.textePrincipal, fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
              Cette action va supprimer <strong>l'intégralité des données</strong> associées à votre espace administrateur (vos produits, vos ventes, vos dépenses, vos configurations, etc.).
            </p>
            <div style={{ backgroundColor: stylesTheme.fondApplication === '#ffffff' ? '#fff7ed' : '#452614', border: stylesTheme.fondApplication === '#ffffff' ? '1px solid #ffedd5' : '1px solid #6b3816', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
              <span style={{ color: stylesTheme.fondApplication === '#ffffff' ? '#c2410c' : '#ff9e6e', fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>🛡️ Barrière de Sécurité :</span>
              <p style={{ color: stylesTheme.fondApplication === '#ffffff' ? '#ea580c' : '#ffb088', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                Les données des autres administrateurs du logiciel (Admin B, Admin C, etc.) restent parfaitement protégées et <strong>ne seront pas touchées</strong>. Votre compte de connexion reste actif.
              </p>
            </div>

            <button 
              onClick={async () => {
                const premierClic = window.confirm("ATTENTION ! Êtes-vous absolument sûr de vouloir effacer TOUTES vos données ? Cette action est irréversible.");
                if (!premierClic) return;

                const confirmationText = window.prompt("Pour confirmer la suppression de vos données de manière sécurisée, veuillez écrire 'RESET' en lettres majuscules :");
                if (confirmationText !== "RESET") {
                  alert("Action annulée : mot clé incorrect.");
                  return;
                }

                try {
                  const response = await fetch('http://localhost:5000/api/reset-total', {
                    method: 'POST',
                    headers: { 
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ idAdmin: user?.id }) // Cible l'identifiant unique de cet admin
                  });

                  if (response.ok) {
                    alert("💥 Vos données ont été réinitialisées avec succès. L'application va redémarrer.");
                    window.location.reload();
                  } else {
                    const dataErr = await response.json();
                    alert(`✕ Échec : ${dataErr.error || 'Erreur lors de la remise à zéro.'}`);
                  }
                } catch (err) {
                  console.error(err);
                  alert("✕ Erreur réseau lors de la communication avec le serveur.");
                }
              }}
              style={{ width: '100%', padding: '14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}
            >
              CONFIRMER LE RESET DE MON ESPACE
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
)}
{ongletActif === 'historique' && (
  <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: `1px solid ${stylesTheme.bordures}`, color: stylesTheme.textePrincipal }}>
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, color: stylesTheme.textePrincipal }}>📜 Journal des Ventes</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={exporterExcel} style={{ padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet size={18}/> Exporter Excel
            </button>
            {/* 🌟 BOUTON PDF CORRIGÉ ET JOLI */}
            <button onClick={exporterPDF} style={{ padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Exporter en PDF
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: stylesTheme.fondApplication, padding: '15px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}` }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '12px', color: stylesTheme.texteSecondaire }}>Du :</span>
              <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '12px', color: stylesTheme.texteSecondaire }}>Au :</span>
              <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <span style={{ fontSize: '12px', color: stylesTheme.texteSecondaire }}>Chercher un article :</span>
              <input type="text" placeholder="Ex: iPhone..." value={filtreArticle} onChange={(e) => setFiltreArticle(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, outline: 'none' }} />
            </div>
        </div>
    </div>

   <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 260px)', overflowY: 'auto', position: 'relative' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: `2px solid ${stylesTheme.bordures}` }}>
          <th style={{ padding: '12px', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, zIndex: 1 }}>Ticket n°</th>
          <th style={{ position: 'sticky', top: 0, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, zIndex: 1 }}>Date</th>
          <th style={{ position: 'sticky', top: 0, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, zIndex: 1 }}>Article</th>
          <th style={{ position: 'sticky', top: 0, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, zIndex: 1 }}>Qté</th>
          <th style={{ textAlign: 'right', paddingRight: '20px', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, zIndex: 1 }}>Montant</th>
          <th style={{ position: 'sticky', top: 0, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, zIndex: 1 }}>Mode</th>
          <th style={{ position: 'sticky', top: 0, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, zIndex: 1 }}>Vendu par</th>
          <th style={{ position: 'sticky', top: 0, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, zIndex: 1 }}>État</th>
        </tr>
      </thead>
      <tbody>
         {historiqueFiltre.map((v, index) => {
  const estMemeTicket = index > 0 && v.numero_ticket === historiqueFiltre[index - 1].numero_ticket;
  
  const estAnnule = v.etat && v.etat.toString().toLowerCase().includes('annul');

  // 1. LE FOND : On ne met PLUS de fond rouge/marron si c'est annulé. On garde le fond normal du tableau !
  const fondLigne = estMemeTicket ? 'transparent' : stylesTheme.fondApplication;

  // 2. LA POLICE : Si c'est annulé, TOUT le texte de la ligne devient rouge clair/rose
  const couleurTexte = estAnnule 
    ? '#ff4d4d' // Un rouge clair/rose bien visible sur fond blanc (comme sur ton PDF)
    : stylesTheme.textePrincipal;

  return (
    <tr 
      key={index} 
      onClick={() => ouvrirPreuve(v.numero_ticket)} 
      style={{ 
        cursor: 'pointer', 
        borderBottom: `1px solid ${stylesTheme.bordures}`,
        backgroundColor: fondLigne,
        color: couleurTexte,
        textDecoration: 'none'
      }}
      title={estAnnule ? "Cette vente a été annulée" : "Cliquez pour voir la preuve de vente"}
    >
      <td style={{ padding: '12px', fontWeight: 'bold', color: couleurTexte }}>
        {estMemeTicket ? "" : String(v.numero_ticket).padStart(3, '0')}
      </td>

      <td style={{ padding: '12px', color: couleurTexte }}>
        {estMemeTicket ? "" : new Date(v.date_vente || v.date_achat).toLocaleString()}
      </td>

      <td style={{ padding: '12px', color: couleurTexte }}>{v.designation || v.article_nom}</td>

      <td style={{ padding: '12px', fontWeight: '500', color: couleurTexte }}>
        {v.quantite ? `x${v.quantite}` : (v.quantite_achat ? `x${v.quantite_achat}` : "—")}
      </td>

      <td style={{ padding: '12px', textAlign: 'right', paddingRight: '20px', fontWeight: 'bold', color: couleurTexte }}>
        {v.prix_total || v.montant_total} F
      </td>

      {/* Mode de paiement : Passe aussi en rouge clair si annulé */}
      <td style={{ padding: '12px', fontSize: '13px', color: estAnnule ? '#ff4d4d' : stylesTheme.texteSecondaire }}>
        {estMemeTicket ? "" : (v.mode_paiement || v.source_paiement || "—")}
      </td>

      <td style={{ padding: '12px' }}>
        {!estMemeTicket && (
          <span style={{ 
            padding: '4px 8px', 
            borderRadius: '6px', 
            fontSize: '12px', 
            fontWeight: 'bold',
            backgroundColor: v.vendu_par === 'admin' ? (stylesTheme.fondApplication === '#ffffff' ? '#fef3c7' : '#4d3d17') : (stylesTheme.fondApplication === '#ffffff' ? '#e0f2fe' : '#1e3a5f'),
            color: v.vendu_par === 'admin' ? (stylesTheme.fondApplication === '#ffffff' ? '#92400e' : '#fcd34d') : (stylesTheme.fondApplication === '#ffffff' ? '#0369a1' : '#bae6fd')
          }}>
            {v.vendu_par || 'Inconnu'}
          </span>
        )}
      </td>

      <td style={{ padding: '12px' }}>
        {!estMemeTicket && (
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 'bold', 
            textTransform: 'uppercase',
            color: estAnnule ? '#ff4d4d' : '#27ae60' // Couleur de l'état assortie au reste du texte
          }}>
            {estAnnule ? "Annulée" : "Validée"}
          </span>
        )}
      </td>
    </tr>
  );
})}
          </tbody>
        </table>
      </div>
  </div>
)}
{ongletActif === 'archive' && (
  <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: `1px solid ${stylesTheme.bordures}`, color: stylesTheme.textePrincipal }}>
    <h2 style={{ color: '#e11d48', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Archive size={24} /> Produits Archivés (Supprimés)
    </h2>
    
    {/* 💡 MODIFICATION : Zone de défilement vertical adaptée au thème */}
    <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 190px)', overflowY: 'auto', position: 'relative' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: stylesTheme.fondApplication, textAlign: 'left' }}>
            {/* 💡 MODIFICATION : Cellules d'en-tête en position 'sticky' sans transparence au défilement */}
            <th style={{ padding: '12px', borderBottom: `2px solid ${stylesTheme.bordures}`, position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, zIndex: 1 }}>Désignation</th>
            <th style={{ padding: '12px', borderBottom: `2px solid ${stylesTheme.bordures}`, position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, zIndex: 1 }}>Prix Vente</th>
            <th style={{ padding: '12px', borderBottom: `2px solid ${stylesTheme.bordures}`, position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, zIndex: 1 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {/* On filtre TOUT ce qui n'est pas marqué comme actif */}
          {produits.filter(p => p.actif === false || p.actif === 0 || !p.actif).length === 0 ? (
            <tr>
              <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: stylesTheme.texteSecondaire }}>
                Aucun produit dans l'archive.
              </td>
            </tr>
          ) : (
            produits.filter(p => p.actif === false || p.actif === 0 || !p.actif).map(p => (
              <tr key={p.id} style={{ borderBottom: `1px solid ${stylesTheme.bordures}` }}>
                <td style={{ padding: '12px' }}>{p.nom}</td>
                <td style={{ padding: '12px' }}>{p.prix_vente} F</td>
                <td style={{ padding: '12px' }}>
                  <button 
                    onClick={() => restaurerProduit(p.id)}
                    style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Restaurer
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

{ongletActif === 'dashboard' && user?.role === 'admin' && (
  <div style={{ animation: 'fadeIn 0.4s' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
      <h2 style={{ color: stylesTheme.textePrincipal, margin: 0 }}>📊 Rapport de Performance </h2>
      <button onClick={chargerStats} style={{ backgroundColor: stylesTheme.fondCartes, border: `1px solid ${stylesTheme.bordures}`, color: stylesTheme.textePrincipal, padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
        <PlusCircle size={14}/> Actualiser
      </button>
    </div>

    {/* SECTION : AUJOURD'HUI */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
      <div style={{ backgroundColor: '#2c3e50', color: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ opacity: 0.8, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><DollarSign size={14}/> VENTES AUJOURD'HUI</div>
        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0 0' }}>{Number(stats.aujourdhui?.ca || 0).toLocaleString()} <span style={{fontSize: '12px'}}>FCFA</span></p>
      </div>
      <div style={{ backgroundColor: '#27ae60', color: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ opacity: 0.8, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={14}/> BÉNÉFICE JOUR</div>
        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0 0' }}>{Number(stats.aujourdhui?.benefice || 0).toLocaleString()} <span style={{fontSize: '12px'}}>FCFA</span></p>
      </div>
      <div style={{ backgroundColor: stylesTheme.fondCartes, border: `1px solid ${stylesTheme.bordures}`, padding: '25px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ color: stylesTheme.texteSecondaire, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={14}/> CLIENTS DU JOUR</div>
        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0 0', color: stylesTheme.textePrincipal }}>{stats.aujourdhui?.nb_tickets || 0}</p>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
      <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '25px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: `1px solid ${stylesTheme.bordures}` }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: stylesTheme.textePrincipal, marginBottom: '25px' }}>📈 Top Performance Articles</h3>
        
        <div style={{ width: '100%', height: '400px' }}>
          {(() => {
            const rawData = stats?.top || [];
            console.log("Contenu de stats.top original:", rawData);

            if (rawData.length === 0) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                  <div style={{ fontSize: '50px' }}>🔍</div>
                  <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>Le serveur a envoyé 0 donnée.</p>
                  <p style={{ color: stylesTheme.texteSecondaire, fontSize: '14px' }}>
                    Vérifiez votre console (F12) onglet 'Network' cliquez sur 'stats' <br/>
                    Si vous voyez "top: []", le problème est dans votre code SQL (Node.js).
                  </p>
                </div>
              );
            }

            const groupedDataMap = {};

            rawData.forEach((item) => {
              if (!item.designation) return;
              const vraiNomArticle = item.designation.replace(/^Recouvrement Dette -\s*/i, "");

              if (groupedDataMap[vraiNomArticle]) {
                groupedDataMap[vraiNomArticle].benefice += Number(item.benefice) || 0;
              } else {
                groupedDataMap[vraiNomArticle] = {
                  ...item,
                  designation: vraiNomArticle,
                  benefice: Number(item.benefice) || 0
                };
              }
            });

            const cleanedData = Object.values(groupedDataMap);

            return (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cleanedData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={stylesTheme.bordures} />
                  <XAxis dataKey="designation" fontSize={10} angle={-40} textAnchor="end" height={80} stroke={stylesTheme.texteSecondaire} />
                  <YAxis stroke={stylesTheme.texteSecondaire} />
                  <Tooltip contentStyle={{ backgroundColor: stylesTheme.fondCartes, borderColor: stylesTheme.bordures, color: stylesTheme.textePrincipal }} />
                  <Bar dataKey="benefice" fill="#3498db" />
                </BarChart>
              </ResponsiveContainer>
            );
          })()}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '25px', borderRadius: '15px', border: `1px solid ${stylesTheme.bordures}`, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h4 style={{ margin: '0 0 20px 0', color: stylesTheme.texteSecondaire, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={16}/> VALEUR DU STOCK</h4>
          <div style={{ marginBottom: '15px' }}>
            <span style={{ fontSize: '12px', color: stylesTheme.texteSecondaire }}>Capital investi (Prix achat)</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: stylesTheme.textePrincipal }}>{Number(stats.stock?.valeur_achat || 0).toLocaleString()} FCFA</div>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#27ae60' }}>Chiffre d'affaires attendu</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#27ae60' }}>{Number(stats.stock?.valeur_vente_potentielle || 0).toLocaleString()} FCFA</div>
          </div>
        </div>

        <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '25px', borderRadius: '15px', border: `1px solid ${stylesTheme.bordures}`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ margin: 0, color: '#e67e22', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={16} color="#e67e22"/> TOTAL CUMULÉ
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input 
                type="date" 
                value={statsDebut} 
                onChange={(e) => setstatsDebut(e.target.value)} 
                style={{ fontSize: '11px', border: `1px solid ${stylesTheme.bordures}`, borderRadius: '4px', padding: '2px', backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal }}
              />
              <span style={{ fontSize: '11px', color: stylesTheme.texteSecondaire }}>au</span>
              <input 
                type="date" 
                value={statsFin} 
                onChange={(e) => setstatsFin(e.target.value)} 
                style={{ fontSize: '11px', border: `1px solid ${stylesTheme.bordures}`, borderRadius: '4px', padding: '2px', backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <span style={{ fontSize: '12px', color: stylesTheme.texteSecondaire }}>Chiffre d'Affaires Total</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: stylesTheme.textePrincipal }}>{Number(stats.global?.ca || 0).toLocaleString()} FCFA</div>
          </div>
          <div style={{ borderTop: `1px solid ${stylesTheme.bordures}`, paddingTop: '15px', marginTop: '10px' }}>
            <span style={{ fontSize: '12px', color: '#e67e22' }}>Bénéfice Net Total</span>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#e67e22' }}>{Number(stats.global?.benefice || 0).toLocaleString()} FCFA</div>
          </div>
        </div>
      </div>
    </div>

    {/* SECTION : ANALYSE MENSUELLE */}
    <div style={{ marginTop: '30px', backgroundColor: stylesTheme.fondCartes, padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${stylesTheme.bordures}`, color: stylesTheme.textePrincipal }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: `1px solid ${stylesTheme.bordures}`, paddingBottom: '15px' }}>
        <h3 style={{ marginTop: 0, fontSize: '18px' }}>🗓️ Rapport Mensuel Global</h3>
        <input 
          type="month" 
          defaultValue={new Date().toISOString().slice(0, 7)}
          onChange={(e) => setMoisSelectionne(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}
        />
      </div>

      {(() => {
        const selection = moisSelectionne || new Date().toISOString().slice(0, 7);
        const [anneeSel, moisSel] = selection.split('-');
        
        const dataVentes = statsMensuels?.find(m => 
          m?.annee?.toString() === anneeSel && 
          Number(m?.mois_num) === Number(moisSel)
        ) || { ca: 0, benefice: 0 };
        
        const beneficeBrutMois = Number(dataVentes.benefice || 0);

        const totalDepensesMois = depenses
          .filter(d => d.date_depense?.startsWith(selection))
          .reduce((acc, curr) => acc + Number(curr.montant), 0);

        const beneficeNetFinal = beneficeBrutMois - totalDepensesMois;
        
        const estModeSombre = stylesTheme.fondApplication !== '#ffffff';

        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={{ backgroundColor: stylesTheme.fondApplication, padding: '20px', borderRadius: '12px', borderLeft: '5px solid #3498db', borderTop: `1px solid ${stylesTheme.bordures}`, borderRight: `1px solid ${stylesTheme.bordures}`, borderBottom: `1px solid ${stylesTheme.bordures}` }}>
              <span style={{ fontSize: '11px', color: stylesTheme.texteSecondaire, fontWeight: 'bold', textTransform: 'uppercase' }}>Bénéfice Mensuel</span>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: stylesTheme.textePrincipal, marginTop: '5px' }}>{beneficeBrutMois.toLocaleString()} F</div>
            </div>
            <div style={{ backgroundColor: stylesTheme.fondApplication, padding: '20px', borderRadius: '12px', borderLeft: '5px solid #e74c3c', borderTop: `1px solid ${stylesTheme.bordures}`, borderRight: `1px solid ${stylesTheme.bordures}`, borderBottom: `1px solid ${stylesTheme.bordures}` }}>
              <span style={{ fontSize: '11px', color: stylesTheme.texteSecondaire, fontWeight: 'bold', textTransform: 'uppercase' }}>Total Dépenses</span>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#e74c3c', marginTop: '5px' }}>{totalDepensesMois.toLocaleString()} F</div>
            </div>
            <div style={{ backgroundColor: beneficeNetFinal >= 0 ? (estModeSombre ? '#1a3a2a' : '#ebfbee') : (estModeSombre ? '#3c1e1e' : '#fff5f5'), padding: '20px', borderRadius: '12px', borderLeft: `5px solid ${beneficeNetFinal >= 0 ? '#27ae60' : '#e74c3c'}`, borderTop: `1px solid ${stylesTheme.bordures}`, borderRight: `1px solid ${stylesTheme.bordures}`, borderBottom: `1px solid ${stylesTheme.bordures}` }}>
              <span style={{ fontSize: '11px', color: stylesTheme.texteSecondaire, fontWeight: 'bold', textTransform: 'uppercase' }}>Bénéfice Net Réel</span>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: beneficeNetFinal >= 0 ? '#27ae60' : '#e74c3c', marginTop: '5px' }}>{beneficeNetFinal.toLocaleString()} F</div>
            </div>
          </div>
        );
      })()}
    </div>
  </div>
)}

{showModal && (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
    <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '30px', borderRadius: '15px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', border: `1px solid ${stylesTheme.bordures}`, color: stylesTheme.textePrincipal }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: stylesTheme.textePrincipal }}>{isEditing ? 'Modifier le Produit' : 'Nouvel Article'}</h2>
        <button onClick={() => { setShowModal(false); setIsEditing(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: stylesTheme.textePrincipal }}><X /></button>
      </div>
      <form onSubmit={handleEnregistrerProduit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" placeholder="Nom du produit" value={nouveauProduit.nom} onChange={e => setNouveauProduit({...nouveauProduit, nom: e.target.value})} required style={{padding:'10px', borderRadius:'5px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, outline: 'none'}} />
        <input type="number" placeholder="Prix d'achat" value={nouveauProduit.prix_achat} onChange={e => setNouveauProduit({...nouveauProduit, prix_achat: e.target.value})} required style={{padding:'10px', borderRadius:'5px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, outline: 'none'}} />
        <input type="number" placeholder="Prix de vente" value={nouveauProduit.prix_vente} onChange={e => setNouveauProduit({...nouveauProduit, prix_vente: e.target.value})} required style={{padding:'10px', borderRadius:'5px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, outline: 'none'}} />
        <input type="number" placeholder="Quantité en stock" value={nouveauProduit.stock_actuel} onChange={e => setNouveauProduit({...nouveauProduit, stock_actuel: e.target.value})} required style={{padding:'10px', borderRadius:'5px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, outline: 'none'}} />
        <input type="number" placeholder="Seuil d'alerte" value={nouveauProduit.stock_alerte} onChange={e => setNouveauProduit({...nouveauProduit, stock_alerte: e.target.value})} required style={{padding:'10px', borderRadius:'5px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, outline: 'none'}} />
        <button type="submit" style={{ backgroundColor: isEditing ? '#3498db' : '#27ae60', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
          {isEditing ? 'Confirmer la modification' : 'Enregistrer le produit'}
        </button>
      </form>
    </div>
  </div>
)}
 {showPreuve && ventePreuve && (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '4px', width: '320px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', fontFamily: 'monospace', color: '#000' }}>
      
      {/* EN-TÊTE DU TICKET */}
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0', fontSize: '16px', letterSpacing: '1px' }}>TICKET DE CAISSE</h3>
        <p style={{ fontSize: '11px', margin: '5px 0' }}><br/></p>
        <hr style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />
        <p style={{ margin: '5px 0', fontWeight: 'bold' }}>TICKET N°: {String(ventePreuve.numero).padStart(3, '0')}</p>
        <p style={{ fontSize: '11px' }}>{new Date(ventePreuve.date).toLocaleString()}</p>
      </div>
      
      <hr style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />

      {/* TABLEAU DES ARTICLES AVEC CALCUL UNITAIRE FORCE */}
      <div style={{ margin: '15px 0' }}>
        {(() => {
          let vraiTotalCalculer = 0;

          return (
            <>
              {ventePreuve.articles.map((art, idx) => {
                const qte = parseFloat(art.quantite || art.qte || 1);
                
                // Analyse de toutes les structures possibles renvoyées par PostgreSQL pour l'historique
                // On cherche le prix unitaire, ou le prix global divisé par la quantité si disponible
                const prixBrut = art.prix_unitaire_facture || 
                                 art.prix_unitaire_vente || 
                                 art.prix_unitaire || 
                                 art.prix_vente || 
                                 art.prix || 
                                 art.montant || 
                                 (art.prix_total ? parseFloat(art.prix_total) / qte : 0);

                const prixUnitaireReel = parseFloat(prixBrut) || 0; 
                
                // Calcul de la ligne de l'article
                const ligneTotal = prixUnitaireReel * qte;
                vraiTotalCalculer += ligneTotal;

                // LOGIQUE DE SCISSION POUR LE RECOUVREMENT DETTE
                const designationTotale = art.designation || art.nom || '';
                const estRecouvrement = designationTotale.toLowerCase().includes('recouvrement');
                
                let lignePrincipale = designationTotale;
                let sousLigneDetail = "";

                if (estRecouvrement && designationTotale.includes(' - ')) {
                  const parties = designationTotale.split(' - ');
                  lignePrincipale = parties[0]; // "Recouvrement Dette"
                  sousLigneDetail = parties[1]; // "NOM DU CLIENT (PRODUIT)"
                }

                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingRight: '10px' }}>
                      <span>
                        {lignePrincipale} {!estRecouvrement && `x${qte}`}
                      </span>
                      {sousLigneDetail && (
                        <span style={{ fontSize: '11px', color: '#444', marginTop: '2px', fontStyle: 'italic' }}>
                          {sousLigneDetail}
                        </span>
                      )}
                      {estRecouvrement && (
                        <span style={{ fontSize: '11px', color: '#444' }}>x{qte}</span>
                      )}
                    </div>
                    <span style={{ whiteSpace: 'nowrap' }}>{ligneTotal.toLocaleString('fr-FR')} F</span>
                  </div>
                );
              })}
              
              {/* Balise invisible pour transmettre le bon total au bloc suivant */}
              <span id="vrai-total-hidden" data-montant={vraiTotalCalculer} style={{ display: 'none' }}></span>
            </>
          );
        })()}
      </div>

      <hr style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />
      
      {/* BLOC TOTAL ET CALCUL DU RESTE À PAYER */}
      {(() => {
        const mode = ventePreuve.modePaiement || '';
        const estUnCredit = mode.toLowerCase().includes('credit') || 
                            mode.toLowerCase().includes('crédit') || 
                            mode.toLowerCase().includes('cred');

        // Récalcul du total final basé strictement sur l'accumulation des lignes réelles pour écraser la valeur corrompue de la bdd
        let totalFinal = 0;
        if (ventePreuve.articles && ventePreuve.articles.length > 0) {
          totalFinal = ventePreuve.articles.reduce((acc, art) => {
            const qte = parseFloat(art.quantite || art.qte || 1);
            const pu = parseFloat(art.prix_unitaire_facture || art.prix_unitaire_vente || art.prix_unitaire || art.prix_vente || art.prix || art.montant || (art.prix_total ? parseFloat(art.prix_total) / qte : 0) || 0);
            return acc + (pu * qte);
          }, 0);
        }

        // Si le calcul des articles donne toujours 0 parce que la ligne entière est vide, on affiche le montant du reçu en secours
        if (totalFinal === 0) totalFinal = parseFloat(ventePreuve.montantRecu) || parseFloat(ventePreuve.total) || 0;

        const avanceNum = parseFloat(ventePreuve.montantRecu) || 0;
        const resteAPayer = totalFinal - avanceNum;

        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', margin: '10px 0' }}>
              <span>TOTAL :</span>
              <span>{totalFinal.toLocaleString('fr-FR')} FCFA</span>
            </div>

            {/* MODE DE PAIEMENT */}
            <div style={{ fontSize: '13px', marginBottom: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Mode de paiement :</span>
                <span style={{ fontWeight: 'bold' }}>{mode || 'Espèce'}</span>
              </div>
            </div>

            {/* AVANCE & RESTE / COMPTANT */}
            <div style={{ marginTop: '10px', fontSize: '14px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              {estUnCredit ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Avance :</span>
                    <span>{avanceNum.toLocaleString('fr-FR')} F</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px dashed #000', paddingTop: '4px', marginTop: '4px' }}>
                    <span>Reste à payer :</span>
                    <span>{resteAPayer.toLocaleString('fr-FR')} F</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Montant reçu :</span>
                    <span>{avanceNum.toLocaleString('fr-FR')} F</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>Monnaie rendue :</span>
                    <span>{parseFloat(ventePreuve.monnaieRendue || 0).toLocaleString('fr-FR')} F</span>
                  </div>
                </>
              )}
            </div>
          </>
        );
      })()}

      <hr style={{ borderTop: '1px dashed #000', marginTop: '15px' }} />
      <p style={{ textAlign: 'center', fontSize: '11px' }}>Merci de votre confiance !</p>

      <button 
        onClick={() => setShowPreuve(false)}
        style={{ width: '100%', padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }}
      >
        FERMER
      </button>
    </div>
  </div>
)}
{ongletActif === 'gestion_produits' && user?.role === 'admin' && (
  <div style={{ animation: 'fadeIn 0.4s', padding: '10px', color: stylesTheme.textePrincipal }}>
    
    {/* ENTÊTE AVEC BOUTON RETOUR DYNAMIQUE */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
      <div>
        <h2 style={{ color: stylesTheme.textePrincipal, margin: 0, fontSize: '28px' }}>📦 Gestion du Stock</h2>
        <p style={{ color: stylesTheme.texteSecondaire, margin: '5px 0 0 0', fontSize: '15px' }}>
          {!sousOngletProduit ? 'Sélectionnez l\'action à effectuer' : 'Administration des articles'}
        </p>
      </div>

      {sousOngletProduit && (
        <button 
          onClick={() => setSousOngletProduit(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
            backgroundColor: stylesTheme.fondCartes, color: '#3498db', border: `1px solid ${stylesTheme.bordures}`,
            borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s',
            boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3498db'; e.currentTarget.style.color = 'white';}}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = stylesTheme.fondCartes; e.currentTarget.style.color = '#3498db';}}
        >
          <ArrowLeft size={18} /> Retour aux options
        </button>
      )}
    </div>

    {/* MENU DE CHOIX (GRANDES CARTES) */}
    {!sousOngletProduit ? (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '30px',
        perspective: '1000px'
      }}>
        
        <div 
          onClick={() => { setSousOngletProduit('nouveau'); setIsEditing(false); setNouveauProduit({ nom: '', prix_achat: '', prix_vente: '', stock_actuel: '', stock_alerte: '', fournisseur_id: '', montant_paye: '' }); }}
          style={{
            backgroundColor: stylesTheme.fondCartes, padding: '50px 40px', borderRadius: '25px', textAlign: 'center',
            cursor: 'pointer', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', transition: 'all 0.4s ease',
            border: `1px solid ${stylesTheme.bordures}`, position: 'relative', overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(52, 152, 219, 0.15)';
            e.currentTarget.style.borderColor = '#3498db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.05)';
            e.currentTarget.style.borderColor = stylesTheme.bordures;
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', backgroundColor: '#3498db' }}></div>
          <div style={{ backgroundColor: stylesTheme.fondApplication !== '#ffffff' ? '#1a3a54' : '#ebf5ff', width: '100px', height: '100px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px', transform: 'rotate(-5deg)', boxShadow: '0 10px 20px rgba(52, 152, 219, 0.1)' }}>
            <PlusCircle size={50} color="#3498db" />
          </div>
          <h3 style={{ color: stylesTheme.textePrincipal, fontSize: '22px', marginBottom: '12px' }}>Nouveau produit</h3>
          <p style={{ color: stylesTheme.texteSecondaire, fontSize: '15px', lineHeight: '1.6', margin: 0, padding: '0 10px' }}>Enregistrer une référence inédite. Idéal pour les nouveaux arrivages.</p>
          <div style={{ marginTop: '30px', color: '#3498db', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>Ouvrir le formulaire <ArrowRight size={16} /></div>
        </div>

        <div 
          onClick={() => { setSousOngletProduit('reappro'); setRechercheProduit(''); setNouveauProduit({ fournisseur_id: '', montant_paye: '' }); }}
          style={{
            backgroundColor: stylesTheme.fondCartes, padding: '50px 40px', borderRadius: '25px', textAlign: 'center',
            cursor: 'pointer', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', transition: 'all 0.4s ease',
            border: `1px solid ${stylesTheme.bordures}`, position: 'relative', overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(39, 174, 96, 0.15)';
            e.currentTarget.style.borderColor = '#27ae60';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.05)';
            e.currentTarget.style.borderColor = stylesTheme.bordures;
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', backgroundColor: '#27ae60' }}></div>
          <div style={{ backgroundColor: stylesTheme.fondApplication !== '#ffffff' ? '#1b4d32' : '#eafff1', width: '100px', height: '100px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px', transform: 'rotate(5deg)', boxShadow: '0 10px 20px rgba(39, 174, 96, 0.1)' }}>
            <RefreshCw size={50} color="#27ae60" />
          </div>
          <h3 style={{ color: stylesTheme.textePrincipal, fontSize: '22px', marginBottom: '12px' }}>Réapprovisionnement</h3>
          <p style={{ color: stylesTheme.texteSecondaire, fontSize: '15px', lineHeight: '1.6', margin: 0, padding: '0 10px' }}>Augmenter la quantité d'un article déjà en stock.</p>
          <div style={{ marginTop: '30px', color: '#27ae60', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>Ouvrir l'outil <ArrowRight size={16} /></div>
        </div>
      </div>
    ) : (
      <div style={{ animation: 'fadeIn 0.3s' }}>
        <div style={{ 
          backgroundColor: stylesTheme.fondCartes, padding: '40px', borderRadius: '20px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: `1px solid ${stylesTheme.bordures}`, 
          minHeight: '450px', maxWidth: '850px', margin: '0 auto'
        }}>
          
        {sousOngletProduit === 'nouveau' ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', paddingBottom: '15px', borderBottom: `1px solid ${stylesTheme.bordures}` }}>
              <div style={{ backgroundColor: stylesTheme.fondApplication !== '#ffffff' ? '#1a3a54' : '#ebf5ff', padding: '12px', borderRadius: '12px' }}><PlusCircle color="#3498db" size={24}/></div>
              <div>
                <h3 style={{ margin: 0, color: stylesTheme.textePrincipal, fontSize: '20px' }}>Créer une nouvelle fiche produit</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: stylesTheme.texteSecondaire }}>Enregistrez l'article dans le catalogue avant de réapprovisionner.</p>
              </div>
            </div>

            {/* 🌟 CORRECTION ICI : width: '100%' au lieu de maxWidth: '600px' */}
            <form onSubmit={ajouterProduit} style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ color: '#27ae60', marginBottom: '5px', borderLeft: '4px solid #27ae60', paddingLeft: '10px' }}>Détails du Produit</h4>
                
                {/* Désignation */}
                <input 
                  type="text" 
                  value={nouveauProduit.nom} 
                  onChange={e => setNouveauProduit({...nouveauProduit, nom: e.target.value})} 
                  placeholder="Désignation du produit" 
                  style={{...styleChampSaisie, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, borderColor: stylesTheme.bordures, outline: 'none'}} 
                  required 
                />

                {/* Prix */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '12px', color: stylesTheme.texteSecondaire, fontWeight: 'bold' }}>Prix d'achat (F CFA)</label>
                    <input type="number" value={nouveauProduit.prix_achat} onChange={e => setNouveauProduit({...nouveauProduit, prix_achat: e.target.value})} placeholder="0" style={{...styleChampSaisie, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, borderColor: stylesTheme.bordures, outline: 'none'}} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '12px', color: stylesTheme.texteSecondaire, fontWeight: 'bold' }}>Prix de vente (F CFA)</label>
                    <input type="number" value={nouveauProduit.prix_vente} onChange={e => setNouveauProduit({...nouveauProduit, prix_vente: e.target.value})} placeholder="0" style={{...styleChampSaisie, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, borderColor: stylesTheme.bordures, outline: 'none'}} required />
                  </div>
                </div>

                {/* Stocks */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '12px', color: stylesTheme.texteSecondaire, fontWeight: 'bold' }}>Stock Initial</label>
                    <input 
                      type="number" 
                      value={0} 
                      readOnly 
                      style={{...styleChampSaisie, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.texteSecondaire, border: `1px solid ${stylesTheme.bordures}`, cursor: 'not-allowed', outline: 'none'}} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '12px', color: '#f39c12', fontWeight: 'bold' }}>Seuil d'alerte</label>
                    <input type="number" value={nouveauProduit.stock_alerte} onChange={e => setNouveauProduit({...nouveauProduit, stock_alerte: e.target.value})} placeholder="ex: 5" style={{...styleChampSaisie, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, borderColor: '#f39c12', outline: 'none'}} required />
                  </div>
                </div>

                {/* Sélectionneur de fichier local */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', color: stylesTheme.texteSecondaire, fontWeight: 'bold' }}>📸 Sélectionner la photo sur l'appareil</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        setNouveauProduit({...nouveauProduit, image_fichier: file});
                      }
                    }} 
                    style={{ 
                      ...styleChampSaisie, 
                      padding: '10px', 
                      backgroundColor: stylesTheme.fondApplication, 
                      color: stylesTheme.textePrincipal,
                      borderColor: stylesTheme.bordures,
                      cursor: 'pointer'
                    }} 
                  />
                </div>
              </div>

              <div style={{ marginTop: '10px' }}>
                <button type="submit" style={{...styleBoutonValider, fontWeight: 'bold', width: '100%'}}>
                  <PlusCircle size={20} /> Enregistrer le produit
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', paddingBottom: '15px', borderBottom: `1px solid ${stylesTheme.bordures}` }}>
              <div style={{ backgroundColor: stylesTheme.fondApplication !== '#ffffff' ? '#1b4d32' : '#eafff1', padding: '12px', borderRadius: '12px' }}><RefreshCw color="#27ae60" size={24}/></div>
              <div>
                <h3 style={{ margin: 0, color: stylesTheme.textePrincipal, fontSize: '20px' }}>Réapprovisionnement de stock</h3>
              </div>
            </div>

            <form onSubmit={handleReapprovisionnement} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ backgroundColor: stylesTheme.fondApplication, padding: '15px', borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}` }}>
                <label style={{ fontWeight: '600', color: '#27ae60', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                  <Search size={14} /> Rechercher et sélectionner le produit *
                </label>
                
                <input 
                  type="text"
                  placeholder="Tapez le nom du produit..."
                  style={{ ...styleChampSaisie, marginBottom: '10px', backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, borderColor: '#3498db', outline: 'none' }}
                  value={rechercheProduit || ''}
                  onChange={(e) => setRechercheProduit(e.target.value)}
                />

                <select 
                  style={{...styleChampSaisie, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, borderColor: stylesTheme.bordures, outline: 'none'}} 
                  required 
                  onChange={(e) => {
                    const p = produits.find(prod => prod.id === parseInt(e.target.value));
                    if(p) setNouveauProduit({
                      ...p, 
                      quantiteAjout: '', 
                      prix_achat_nouveau: p.prix_achat,
                      prix_vente: p.prix_vente,
                      fournisseur_id: '',
                      montant_paye: ''
                    });
                  }}
                >
                  <option value="" style={{backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal}}>-- Choisir dans la liste --</option>
                  {produits
                    .filter(p => p.nom.toLowerCase().includes((rechercheProduit || '').toLowerCase()))
                    .map(p => (
                      <option key={p.id} value={p.id} style={{backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal}}>{p.nom} (Stock actuel: {p.stock_actuel})</option>
                    ))
                  }
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '15px', border: `1px solid ${stylesTheme.bordures}`, borderRadius: '12px', backgroundColor: stylesTheme.fondApplication }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontWeight: '600', color: stylesTheme.texteSecondaire, fontSize: '13px' }}>Fournisseur *</label>
                  <select 
                    style={{...styleChampSaisie, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, borderColor: stylesTheme.bordures, outline: 'none'}} 
                    value={nouveauProduit.fournisseur_id || ''} 
                    onChange={e => setNouveauProduit({...nouveauProduit, fournisseur_id: e.target.value})}
                    required
                  >
                    <option value="" style={{backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal}}>-- Choisir --</option>
                    {fournisseurs.map(f => (
                      <option key={f.id} value={f.id} style={{backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal}}>{f.nom}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontWeight: '600', color: stylesTheme.texteSecondaire, fontSize: '13px' }}>Montant payé (F CFA) *</label>
                    
                    {/* Sélecteur de source de paiement */}
                    <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: stylesTheme.textePrincipal }}>
                        <input 
                          type="radio" 
                          name="sourcePaiement" 
                          value="caisse" 
                          checked={nouveauProduit.source_paiement === 'caisse'} 
                          onChange={() => setNouveauProduit({...nouveauProduit, source_paiement: 'caisse'})}
                        /> 🏦 Caisse
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: stylesTheme.textePrincipal }}>
                        <input 
                          type="radio" 
                          name="sourcePaiement" 
                          value="poche" 
                          checked={nouveauProduit.source_paiement === 'poche'} 
                          onChange={() => setNouveauProduit({...nouveauProduit, source_paiement: 'poche'})}
                        /> 👤 Poche
                      </label>
                    </div>
                  </div>

                  <input 
                    type="number" 
                    placeholder="Somme versée" 
                    style={{...styleChampSaisie, backgroundColor: stylesTheme.fondCartes, color: stylesTheme.textePrincipal, borderColor: stylesTheme.bordures, outline: 'none'}} 
                    value={nouveauProduit.montant_paye || ''} 
                    onChange={e => setNouveauProduit({...nouveauProduit, montant_paye: e.target.value})} 
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: '600', color: stylesTheme.textePrincipal, fontSize: '14px' }}>Quantité à ajouter *</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 10" 
                      style={{...styleChampSaisie, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, borderColor: stylesTheme.bordures, outline: 'none'}} 
                      required 
                      min="1"
                      value={nouveauProduit.quantiteAjout || ''}
                      onChange={(e) => setNouveauProduit({...nouveauProduit, quantiteAjout: e.target.value})} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: '600', color: '#27ae60', fontSize: '14px' }}>Nouveau prix d'achat unitaire *</label>
                    <input 
                      type="number" 
                      placeholder="Prix payé aujourd'hui" 
                      style={{...styleChampSaisie, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, borderColor: '#27ae60', outline: 'none'}} 
                      required 
                      value={nouveauProduit.prix_achat_nouveau || ''}
                      onChange={(e) => setNouveauProduit({...nouveauProduit, prix_achat_nouveau: e.target.value})} 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: '600', color: stylesTheme.texteSecondaire, fontSize: '14px' }}>Prix d'achat actuel (Info)</label>
                    <input type="number" value={nouveauProduit.prix_achat || 0} style={{...styleChampSaisie, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.texteSecondaire, borderColor: stylesTheme.bordures, cursor: 'not-allowed', outline: 'none'}} readOnly />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: '600', color: '#e67e22', fontSize: '14px' }}>Ajuster le prix de vente ?</label>
                    <input 
                      type="number" 
                      style={{...styleChampSaisie, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, borderColor: '#e67e22', outline: 'none'}} 
                      required 
                      value={nouveauProduit.prix_vente || ''}
                      onChange={(e) => setNouveauProduit({...nouveauProduit, prix_vente: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {nouveauProduit.prix_achat_nouveau && nouveauProduit.quantiteAjout && (
                <div style={{ textAlign: 'right', fontSize: '14px', color: stylesTheme.textePrincipal }}>
                  Total achat : <strong>{(parseFloat(nouveauProduit.prix_achat_nouveau) * parseInt(nouveauProduit.quantiteAjout)).toLocaleString()} F</strong> | 
                  Dette : <strong style={{ color: '#e11d48' }}>{((parseFloat(nouveauProduit.prix_achat_nouveau) * parseInt(nouveauProduit.quantiteAjout)) - (parseFloat(nouveauProduit.montant_paye) || 0)).toLocaleString()} F</strong>
                </div>
              )}

              <div style={{ marginTop: '10px' }}>
                <button type="submit" style={{...styleBoutonValider, backgroundColor: '#27ae60', fontWeight: 'bold'}}>
                  <RefreshCw size={20} /> Confirmer le réapprovisionnement
                </button>
              </div>
            </form>
          </div>
        )}
        </div>
      </div>
    )}
  </div>
)}
{/* CONTENU DE L'ONGLET FOURNISSEURS */}
{ongletActif === 'fournisseurs' && (
  <div style={{ 
    padding: '30px', 
    height: 'calc(100vh - 50px)', 
    display: 'flex', 
    flexDirection: 'column',
    backgroundColor: stylesTheme.fondApplication, 
    fontFamily: "'Inter', sans-serif"
  }}>
    
    {/* EN-TÊTE PREMIUM */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '30px' 
    }}>
      <div>
        <h2 style={{ color: stylesTheme.textePrincipal, margin: 0, fontSize: '28px', fontWeight: '800' }}>
          Fournisseurs
        </h2>
        <p style={{ color: stylesTheme.texteSecondaire, margin: '5px 0 0 0', fontSize: '14px' }}>
          Gerez vos relations commerciales et vos encours.
        </p>
      </div>
      <button 
        onClick={() => setShowModalFournisseur(true)}
        style={{
          padding: '12px 24px',
          backgroundColor: '#2563eb', // Bleu moderne conserve
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span style={{ fontSize: '20px' }}>+</span> Ajouter un fournisseur
      </button>
    </div>

    {/* ZONE PRINCIPALE MASTER-DETAIL */}
    <div style={{ display: 'flex', gap: '25px', flex: 1, overflow: 'hidden' }}>
      
      {/* SIDEBAR GAUCHE (LISTE) */}
      <div style={{ 
        flex: '0 0 380px', 
        backgroundColor: stylesTheme.fondCartes, 
        borderRadius: '20px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${stylesTheme.bordures}`
      }}>
        <div style={{ padding: '20px', borderBottom: `1px solid ${stylesTheme.bordures}` }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '14px 14px 14px 40px', 
                borderRadius: '12px', 
                border: `1px solid ${stylesTheme.bordures}`,
                outline: 'none',
                backgroundColor: stylesTheme.fondApplication,
                color: stylesTheme.textePrincipal,
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ position: 'absolute', left: '15px', top: '14px', opacity: 0.5 }}>🔍</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {fournisseurs.filter(f => f.nom.toLowerCase().includes(recherche.toLowerCase())).length > 0 ? (
            fournisseurs.filter(f => f.nom.toLowerCase().includes(recherche.toLowerCase())).map((f) => (
              <div 
                key={f.id} 
                onClick={() => handleSelectFournisseur(f)}
                style={{ 
                  padding: '16px', 
                  marginBottom: '8px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: fournisseurSelectionne?.id === f.id 
                    ? (stylesTheme.fondApplication !== '#ffffff' ? '#1e3a5f' : '#eff6ff') 
                    : 'transparent',
                  border: fournisseurSelectionne?.id === f.id 
                    ? `1px solid ${stylesTheme.fondApplication !== '#ffffff' ? '#3b82f6' : '#bfdbfe'}` 
                    : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: fournisseurSelectionne?.id === f.id 
                      ? (stylesTheme.fondApplication !== '#ffffff' ? '#60a5fa' : '#1e40af') 
                      : stylesTheme.textePrincipal 
                  }}>
                    {f.nom}
                  </div>
                  {f.dette_totale > 0 && (
                    <span style={{ 
                      backgroundColor: '#fee2e2', 
                      color: '#991b1b', 
                      fontSize: '10px', 
                      padding: '2px 8px', 
                      borderRadius: '10px',
                      fontWeight: '700' 
                    }}>DETTE</span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: stylesTheme.texteSecondaire, marginTop: '4px' }}>{f.categorie}</div>
              </div>
            ))
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: stylesTheme.texteSecondaire, fontSize: '14px' }}>Aucun fournisseur trouve</div>
          )}
        </div>
      </div>

      {/* ZONE DE DÉTAILS (DROITE) */}
      <div style={{ 
        flex: 1, 
        backgroundColor: stylesTheme.fondCartes, 
        borderRadius: '24px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
        border: `1px solid ${stylesTheme.bordures}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {fournisseurSelectionne ? (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Header Détail */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ 
                    width: '60px', height: '60px', backgroundColor: '#3b82f6', 
                    borderRadius: '16px', display: 'flex', justifyContent: 'center', 
                    alignItems: 'center', color: 'white', fontSize: '24px', fontWeight: 'bold'
                  }}>
                    {fournisseurSelectionne.nom.charAt(0)}
                  </div>

                  <div>
                    {enModeEdition ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input 
                          type="text" 
                          value={fournisseurSelectionne.nom} 
                          onChange={(e) => setFournisseurSelectionne({...fournisseurSelectionne, nom: e.target.value})}
                          style={{ fontSize: '24px', fontWeight: '800', padding: '5px 10px', borderRadius: '8px', border: '2px solid #3b82f6', backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, outline: 'none' }}
                        />
                        <input 
                          type="text" 
                          value={fournisseurSelectionne.categorie} 
                          onChange={(e) => setFournisseurSelectionne({...fournisseurSelectionne, categorie: e.target.value})}
                          placeholder="Categorie..."
                          style={{ fontSize: '14px', padding: '5px 10px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, outline: 'none' }}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <h1 style={{ margin: 0, color: stylesTheme.textePrincipal, fontSize: '32px', fontWeight: '800' }}>
                            {fournisseurSelectionne.nom}
                          </h1>
                          
                          {/* 🌟 NOUVEAU BOUTON PDF INTEGRÉ SUR TON RECTANGLE ROUGE */}
                          <button
                            onClick={() => typeof exporterFicheFournisseurPDF !== 'undefined' ? exporterFicheFournisseurPDF(fournisseurSelectionne, produitsFournisseur) : alert("Fonction PDF non definie")}
                            style={{
                              padding: '6px 14px',
                              backgroundColor: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 6px rgba(231, 76, 60, 0.15)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            📄 PDF
                          </button>
                        </div>
                        <span style={{ 
                          backgroundColor: stylesTheme.fondApplication, color: stylesTheme.texteSecondaire, padding: '4px 12px', 
                          borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, fontSize: '13px', fontWeight: '600', 
                          alignSelf: 'flex-start'
                        }}>
                          🏷️ {fournisseurSelectionne.categorie || 'General'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div style={{ textAlign: 'right', padding: '15px 25px', backgroundColor: stylesTheme.fondApplication, borderRadius: '16px', border: `1px solid ${stylesTheme.bordures}` }}>
                <div style={{ fontSize: '12px', color: stylesTheme.texteSecondaire, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>En-cours Dette</div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: fournisseurSelectionne.dette_totale > 0 ? '#ef4444' : '#10b981', marginTop: '5px' }}>
                  {fournisseurSelectionne.dette_totale.toLocaleString()} F
                </div>
              </div>
            </div>

            {/* Grille d'infos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '24px', backgroundColor: stylesTheme.fondCartes, borderRadius: '20px', border: `1px solid ${stylesTheme.bordures}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <div style={{ color: stylesTheme.texteSecondaire, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>Telephone</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: stylesTheme.textePrincipal }}>{fournisseurSelectionne.telephone || '---'}</div>
              </div>
              <div style={{ padding: '24px', backgroundColor: stylesTheme.fondCartes, borderRadius: '20px', border: `1px solid ${stylesTheme.bordures}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <div style={{ color: stylesTheme.texteSecondaire, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>Adresse</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: stylesTheme.textePrincipal }}>{fournisseurSelectionne.adresse || '---'}</div>
              </div>
              <div style={{ padding: '24px', backgroundColor: stylesTheme.fondCartes, borderRadius: '20px', border: `1px solid ${stylesTheme.bordures}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <div style={{ color: stylesTheme.texteSecondaire, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>Volume d'achat</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: stylesTheme.textePrincipal }}>{fournisseurSelectionne.montant_total.toLocaleString()} F</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: '50px', display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => ouvrirModif(fournisseurSelectionne)} 
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, fontWeight: '600', cursor: 'pointer' }}
              >
                Modifier le profil
              </button>

              <button 
                onClick={reglerDette} 
                disabled={fournisseurSelectionne?.dette_totale <= 0} 
                style={{ 
                  flex: 1, 
                  padding: '14px', 
                  borderRadius: '12px', 
                  border: 'none', 
                  backgroundColor: fournisseurSelectionne?.dette_totale <= 0 ? (stylesTheme.fondApplication !== '#ffffff' ? '#334155' : '#cbd5e1') : '#10b981', 
                  color: 'white', 
                  fontWeight: '600', 
                  cursor: fournisseurSelectionne?.dette_totale <= 0 ? 'not-allowed' : 'pointer' 
                }}
              >
                Regler la dette
              </button>

              <button 
                onClick={() => supprimerFournisseur(fournisseurSelectionne.id)} 
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#fee2e2', color: '#ef4444', fontWeight: '600', cursor: 'pointer' }}
              >
                Supprimer
              </button>
            </div>

            {/* --- AJOUT : LISTE DES PRODUITS FOURNIS --- */}
            <div style={{ marginTop: '30px' }}>
              <h4 style={{ color: stylesTheme.textePrincipal, marginBottom: '15px' }}>Historique des achats chez ce fournisseur</h4>
              
              <div style={{ 
                backgroundColor: stylesTheme.fondCartes, 
                borderRadius: '12px', 
                border: `1px solid ${stylesTheme.bordures}`, 
                overflow: 'hidden',
                maxHeight: '260px', 
                overflowY: 'auto' 
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 1 }}>
                    <tr style={{ backgroundColor: stylesTheme.fondApplication, textAlign: 'left', color: stylesTheme.textePrincipal }}>
                      <th style={{ padding: '12px' }}>Produit</th>
                      <th style={{ padding: '12px' }}>Quantite achetee</th>
                      <th style={{ padding: '12px' }}>Prix Unitaire</th>
                      <th style={{ padding: '12px' }}>Date</th>
                      <th style={{ padding: '12px' }}>Mode de paiement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produitsFournisseur.map((item, index) => {
                      let statutPaiement = "";
                      
                      const paye = item.montant_paye !== undefined && item.montant_paye !== null ? Number(item.montant_paye) : null;
                      const credit = item.montant_credit !== undefined && item.montant_credit !== null ? Number(item.montant_credit) : null;
                      const source = String(item.source_paiement || '').toLowerCase().trim();

                      if (credit === 0 || credit === null) {
                        if (source === 'poche') {
                          statutPaiement = "🔵 Comptant (Poche)";
                        } else {
                          statutPaiement = "🟢 Comptant (Caisse)";
                        }
                      } else if (paye === 0) {
                        statutPaiement = "🔴 Credit Total";
                      } else {
                        if (source === 'poche') {
                          statutPaiement = `🟡 Partiel ( Poche: ${paye.toLocaleString()}F / 🔴 Credit: ${credit.toLocaleString()}F)`;
                        } else {
                          statutPaiement = `🟡 Partiel ( Caisse: ${paye.toLocaleString()}F / 🔴 Credit: ${credit.toLocaleString()}F)`;
                        }
                      }

                      return (
                        <tr key={index} style={{ borderTop: `1px solid ${stylesTheme.bordures}`, color: stylesTheme.textePrincipal }}>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.nom}</td>
                          <td style={{ padding: '12px' }}>{item.quantite}</td>
                          <td style={{ padding: '12px' }}>{item.prix_achat.toLocaleString()} F</td>
                          
                          <td style={{ padding: '15px', color: stylesTheme.texteSecondaire, fontSize: '13px' }}>
                            <div style={{ fontWeight: '600', color: stylesTheme.textePrincipal }}>
                              {new Date(item.date_entree).toLocaleDateString('fr-FR')}
                            </div>
                            <div style={{ fontSize: '13px', marginTop: '2px' }}>
                              à {new Date(item.date_entree).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>

                          <td style={{ padding: '12px', fontWeight: '600', fontSize: '13px' }}>
                            {statutPaiement}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: stylesTheme.fondApplication }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>📁</div>
            <h3 style={{ color: stylesTheme.textePrincipal, margin: '0 0 10px 0' }}>Aucune selection</h3>
            <p style={{ color: stylesTheme.texteSecondaire, fontSize: '14px' }}>Choisissez un fournisseur à gauche pour afficher ses donnees.</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* MODAL NOUVEAU FOURNISSEUR STYLE MODERNE */}
{showModalFournisseur && (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000, backdropFilter: 'blur(8px)'
  }}>
    <div style={{
      backgroundColor: stylesTheme.fondCartes, padding: '40px', borderRadius: '28px', width: '480px',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: `1px solid ${stylesTheme.bordures}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h3 style={{ margin: 0, color: stylesTheme.textePrincipal, fontSize: '24px', fontWeight: '800' }}>Nouveau Fournisseur</h3>
        <button onClick={() => setShowModalFournisseur(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', opacity: 0.3, color: stylesTheme.textePrincipal }}>×</button>
      </div>
      
      <form onSubmit={handleAjouterFournisseur}>
        {[
          { label: 'Nom complet', key: 'nom', placeholder: 'ex: SODIMA SARL', req: true },
          { label: 'Catégorie', key: 'categorie', placeholder: 'ex: Alimentation, Matériel...', req: true },
          { label: 'Téléphone', key: 'telephone', placeholder: '+223 ...', req: false },
          { label: 'Adresse', key: 'adresse', placeholder: 'Bamako, Mali', req: false }
        ].map((field) => (
          <div key={field.key} style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: stylesTheme.texteSecondaire, fontSize: '14px' }}>{field.label}</label>
            <input 
              type="text" required={field.req}
              style={{ 
                width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${stylesTheme.bordures}`, 
                boxSizing: 'border-box', backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, fontSize: '15px', outlineColor: '#3b82f6' 
              }}
              value={nouveauFournisseur[field.key]}
              onChange={(e) => setNouveauFournisseur({...nouveauFournisseur, [field.key]: e.target.value})}
              placeholder={field.placeholder}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
          <button 
            type="button"
            onClick={() => setShowModalFournisseur(false)}
            style={{ flex: 1, padding: '14px', backgroundColor: stylesTheme.fondApplication, color: stylesTheme.texteSecondaire, border: `1px solid ${stylesTheme.bordures}`, borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}
          >
            Annuler
          </button>
          <button 
            type="submit"
            style={{ flex: 2, padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
          >
            Créer le fournisseur
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{ongletActif === 'depenses' && user?.role === 'admin' && (
  /* 💡 MODIFICATION : Retrait de position absolute/fixed. On utilise width: '100%', height: '100vh' et un calcul dynamique flex pour que ça s'ajuste parfaitement à côté du menu */
  <div style={{ padding: '25px', animation: 'fadeIn 0.3s', backgroundColor: stylesTheme.fondApplication, height: '95vh', width: '100%', overflow: 'hidden', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
    
    {/* EN-TÊTE HARMONISÉ : Titre à gauche, Bouton d'exportation élégant à droite */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
      <h2 style={{ color: stylesTheme.textePrincipal, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ backgroundColor: '#e74c3c', color: 'white', padding: '8px', borderRadius: '8px', display: 'flex' }}><DollarSign size={20}/></span>
        Gestion des Dépenses
      </h2>
      
      {/* Bouton Export PDF - Position Créative et Pro */}
      <button 
        onClick={exporterDepensesPDF} // Remplace par ta fonction d'export
        style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#27ae60', color: 'white', padding: '10px 18px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: '0.3s', boxShadow: '0 4px 6px rgba(39, 174, 96, 0.2)' }}
      >
        📥 Exporter en PDF
      </button>
    </div>
    
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '25px' }}>
      <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '25px', borderRadius: '15px', border: `1px solid ${stylesTheme.bordures}`, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '14px', color: stylesTheme.texteSecondaire, marginTop: 0, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Nouvelle Dépense</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}> 
            <div style={{ flex: '1', minWidth: '150px', marginRight: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: stylesTheme.textePrincipal, marginBottom: '8px', fontWeight: 'bold' }}>Date de l'opération</label>
              <input 
                type="date" 
                id="depense_date_manuelle" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>
            <div style={{ flex: '2', minWidth: '200px', marginRight: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: stylesTheme.textePrincipal, marginBottom: '8px', fontWeight: 'bold' }}>Motif de la dépense</label>
              <input type="text" id="depense_motif" placeholder="Ex: Loyer boutique, Facture EDM..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: '1', minWidth: '120px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: stylesTheme.textePrincipal, marginBottom: '8px', fontWeight: 'bold' }}>Montant (FCFA)</label>
              <input type="number" id="depense_montant" placeholder="0" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <button 
            onClick={async () => {
                const motif = document.getElementById('depense_motif').value;
                const montant = document.getElementById('depense_montant').value;
                const dateManuelle = document.getElementById('depense_date_manuelle').value;
                const tokenStocke = localStorage.getItem('token'); 

                if(!motif || !montant || !dateManuelle) return alert("Veuillez remplir tous les champs (n'oubliez pas la date)");
                
                try {
                  await axios.post('http://localhost:5000/api/depenses', { 
                    motif, 
                    montant, 
                    date_depense: dateManuelle,
                    categorie: 'Divers' 
                  }, {
                      headers: { Authorization: `Bearer ${tokenStocke}` }
                  });
                  
                  document.getElementById('depense_motif').value = '';
                  document.getElementById('depense_montant').value = '';
                  document.getElementById('depense_date_manuelle').value = '';
                  alert("Dépense enregistrée !");
                  chargerDepenses();
                  chargerStats(); 
                } catch (err) {
                  alert("Erreur lors de l'ajout.");
                }
            }}
            style={{ backgroundColor: '#e74c3c', color: 'white', padding: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: '0.3s', boxShadow: '0 4px 6px rgba(231, 76, 60, 0.2)' }}
          >
            Enregistrer la dépense
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${stylesTheme.bordures}`, borderLeft: '5px solid #e74c3c' }}>
          <span style={{ fontSize: '11px', color: stylesTheme.texteSecondaire, fontWeight: 'bold', textTransform: 'uppercase' }}>Total Dépenses affichées</span>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c', marginTop: '5px' }}>
            {depenses.filter(d => {
              const dDate = d.date_depense.split('T')[0];
              const debut = filtreDateDebut || '1900-01-01';
              const fin = filtreDateFin || '2100-12-31';
              const correspondDesignation = d.motif.toLowerCase().includes(filtreDesignation.toLowerCase());
              return dDate >= debut && dDate <= fin && correspondDesignation;
            }).reduce((acc, curr) => acc + Number(curr.montant), 0).toLocaleString()} <span style={{fontSize: '14px'}}>FCFA</span>
          </div>
        </div>
        
        {/* BLOC DE FILTRAGE DESIGN AMÉLIORÉ */}
        <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '20px', borderRadius: '15px', border: `1px solid ${stylesTheme.bordures}`, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '13px', color: stylesTheme.textePrincipal, fontWeight: 'bold' }}>Filtres de recherche</h4>
          
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: stylesTheme.texteSecondaire, marginBottom: '4px' }}>Par désignation / motif</label>
            <input 
              type="text" 
              placeholder="Rechercher un motif..." 
              value={filtreDesignation}
              onChange={(e) => setFiltreDesignation(e.target.value)} 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: stylesTheme.texteSecondaire, marginBottom: '4px' }}>Par période</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="date" id="date_debut" onChange={(e) => setFiltreDateDebut(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, fontSize: '12px', outline: 'none' }} />
              <input type="date" id="date_fin" onChange={(e) => setFiltreDateFin(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, fontSize: '12px', outline: 'none' }} />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* LISTE TABLEAU */}
    <div style={{ backgroundColor: stylesTheme.fondCartes, borderRadius: '15px', border: `1px solid ${stylesTheme.bordures}`, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
      <div style={{ overflowX: 'auto', flex: 1, overflowY: 'auto', position: 'relative' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: stylesTheme.fondApplication, textAlign: 'left', borderBottom: `2px solid ${stylesTheme.bordures}` }}>
              <th style={{ padding: '18px 25px', color: stylesTheme.texteSecondaire, fontSize: '12px', textTransform: 'uppercase', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 1 }}>Date</th>
              <th style={{ padding: '18px 25px', color: stylesTheme.texteSecondaire, fontSize: '12px', textTransform: 'uppercase', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 1 }}>Désignation / Motif</th>
              <th style={{ padding: '18px 25px', color: stylesTheme.texteSecondaire, fontSize: '12px', textTransform: 'uppercase', textAlign: 'right', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 1 }}>Montant</th>
              <th style={{ padding: '18px 25px', color: stylesTheme.texteSecondaire, fontSize: '12px', textTransform: 'uppercase', textAlign: 'center', position: 'sticky', top: 0, backgroundColor: stylesTheme.fondApplication, zIndex: 1 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {depenses.filter(d => {
              const dDate = d.date_depense.split('T')[0];
              const debut = filtreDateDebut || '1900-01-01';
              const fin = filtreDateFin || '2100-12-31';
              const correspondDesignation = d.motif.toLowerCase().includes(filtreDesignation.toLowerCase());
              return dDate >= debut && dDate <= fin && correspondDesignation;
            }).map((d, index) => {
              const brute = d.date_depense.split('T')[0]; 
              const parties = brute.split('-');
              const dateAffichee = `${parties[2]}/${parties[1]}/${parties[0]}`;

              return (
                <tr key={index} style={{ borderBottom: `1px solid ${stylesTheme.bordures}` }}>
                  <td style={{ padding: '18px 25px', color: stylesTheme.textePrincipal, fontSize: '14px' }}>{dateAffichee}</td>
                  <td style={{ padding: '18px 25px', fontWeight: '500', color: stylesTheme.textePrincipal, fontSize: '14px' }}>{d.motif}</td>
                  <td style={{ padding: '18px 25px', textAlign: 'right', color: '#e74c3c', fontWeight: 'bold', fontSize: '15px' }}>
                    {Number(d.montant).toLocaleString()} F
                  </td>
                  <td style={{ padding: '18px 25px', textAlign: 'center' }}>
                    <button 
                      onClick={async () => {
                        if(window.confirm("Supprimer définitivement cette dépense ?")) {
                          try {
                            const token = localStorage.getItem('token');
                            await axios.delete(`http://localhost:5000/api/depenses/${d.id}`, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            chargerDepenses();
                            chargerStats(); 
                          } catch (err) {
                            alert("Erreur lors de la suppression");
                          }
                        }
                      }}
                      style={{ backgroundColor: '#fff5f5', color: '#e74c3c', border: '1px solid #fed7d7', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

{showModalPaiement && (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
  }}>
    <div style={{ backgroundColor: stylesTheme.fondCartes, padding: '30px', borderRadius: '24px', width: '400px', border: `1px solid ${stylesTheme.bordures}`, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
      <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: stylesTheme.textePrincipal }}>Caisse 🏦</h2>
      <p style={{ color: stylesTheme.texteSecondaire, fontSize: '13px', marginBottom: '20px' }}>
        Le montant sera retiré du Chiffre d'Affaire pour payer <strong>{fournisseurSelectionne?.nom}</strong>.
      </p>
      
      <input 
        type="number" 
        autoFocus
        value={montantAPayer}
        onChange={(e) => setMontantAPayer(e.target.value)}
        placeholder="Montant à payer..."
        style={{ width: '90%', padding: '15px', borderRadius: '12px', border: `2px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}
      />

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => setShowModalPaiement(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal, cursor: 'pointer' }}>Annuler</button>
        <button onClick={handleValiderPaiement} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Confirmer</button>
      </div>
    </div>
  </div>
)}

{showModalModif && (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
    alignItems: 'center', zIndex: 2000
  }}>
    <div style={{
      backgroundColor: stylesTheme.fondCartes, padding: '30px', borderRadius: '20px',
      width: '450px', border: `1px solid ${stylesTheme.bordures}`, boxShadow: '0 20px 25px rgba(0,0,0,0.2)'
    }}>
      <h2 style={{ marginBottom: '20px', color: stylesTheme.textePrincipal }}>Modifier le profil</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ color: stylesTheme.textePrincipal }}>Nom du fournisseur</label>
        <input 
          style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal }}
          value={fournisseurModifier.nom}
          onChange={(e) => setFournisseurModifier({...fournisseurModifier, nom: e.target.value})}
        />

        <label style={{ color: stylesTheme.textePrincipal }}>Catégorie</label>
        <input 
          style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal }}
          value={fournisseurModifier.categorie}
          onChange={(e) => setFournisseurModifier({...fournisseurModifier, categorie: e.target.value})}
        />

        <label style={{ color: stylesTheme.textePrincipal }}>Téléphone</label>
        <input 
          style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal }}
          value={fournisseurModifier.telephone}
          onChange={(e) => setFournisseurModifier({...fournisseurModifier, telephone: e.target.value})}
        />

        <label style={{ color: stylesTheme.textePrincipal }}>Adresse (Localisation)</label>
        <input 
          style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${stylesTheme.bordures}`, backgroundColor: stylesTheme.fondApplication, color: stylesTheme.textePrincipal }}
          value={fournisseurModifier.adresse || ""} 
          onChange={(e) => setFournisseurModifier({...fournisseurModifier, adresse: e.target.value})}
        />
      </div>

      <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={mettreAJourFournisseur} // Ta fonction qui fait l'axios.put
          style={{ flex: 1, padding: '12px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Enregistrer
        </button>
        <button 
          onClick={() => setShowModalModif(false)}
          style={{ flex: 1, padding: '12px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
)}

</div>
<style>{`
  @keyframes spin {
    100% { 
      transform: rotate(360deg); 
    }
  }
`}</style>
    </div>
  );
}

export default App;