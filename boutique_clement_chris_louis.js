// On cherche la base d'utilisateurs dans la mémoire
var baseDeDonneesUtilisateurs = JSON.parse(localStorage.getItem("pokemarket_users"));

// Si la base n'existe pas, on initialise des comptes de test
if (baseDeDonneesUtilisateurs === null) {
    baseDeDonneesUtilisateurs = [
        { id: "Sacha", pass: "pikachu123", monnaie: 150, inventaire: [
            {nom: "Pikachu", type: "Rare", hp: 85, maxHp: 85, atk: 32}, 
            {nom: "Dracaufeu EX", type: "Légendaire", hp: 210, maxHp: 210, atk: 95}
        ] },
        { id: "Ondine", pass: "stari456", monnaie: 100, inventaire: [{nom: "Stari", type: "Rare", hp: 75, maxHp: 75, atk: 26}] }
    ];
    localStorage.setItem("pokemarket_users", JSON.stringify(baseDeDonneesUtilisateurs));
}

var utilisateurActuel = null;
var indexCarteActiveSurTerrain = null; 

// Catalogue des cartes par rareté
var catalogueCartes = {
    Commun: ["Rattata", "Chenipan", "Roucool", "Nosferapti"],
    Rare: ["Pikachu", "Bulbizarre", "Salamèche", "Carapuce"],
    Épique: ["Arcanin", "Léviator", "Ectoplasma", "Ronflex"],
    Légendaire: ["Dracaufeu EX", "Mewtwo GX", "Lugia Brillant", "Rayquaza Shiny"]
};

// Fonction pour générer des stats uniques selon la rareté
function genererStatistiquesCarte(typeBooster) {
    var hpMin = 40, hpMax = 65;
    var atkMin = 10, atkMax = 20;

    if (typeBooster === 'Rare') {
        hpMin = 70; hpMax = 100;
        atkMin = 25; atkMax = 40;
    } else if (typeBooster === 'Épique') {
        hpMin = 110; hpMax = 150;
        atkMin = 45; atkMax = 70;
    } else if (typeBooster === 'Légendaire') {
        hpMin = 180; hpMax = 250;
        atkMin = 80; atkMax = 120;
    }

    var hpAleatoires = Math.floor(Math.random() * (hpMax - hpMin + 1)) + hpMin;
    return {
        hp: hpAleatoires,
        maxHp: hpAleatoires, 
        atk: Math.floor(Math.random() * (atkMax - atkMin + 1)) + atkMin
    };
}

function sinscrire() {
    var idInput = document.getElementById("reg-id").value.trim();
    var passInput = document.getElementById("reg-pass").value.trim();

    if (idInput === "" || passInput === "") {
        alert("Remplis tous les champs stp !");
        return;
    }

    for (var i = 0; i < baseDeDonneesUtilisateurs.length; i++) {
        if (baseDeDonneesUtilisateurs[i].id === idInput) {
            alert("Ce nom d'utilisateur existe déjà.");
            return;
        }
    }

    var nouvelUtilisateur = {
        id: idInput,
        pass: passInput,
        monnaie: 100,
        inventaire: []
    };

    baseDeDonneesUtilisateurs.push(nouvelUtilisateur);
    localStorage.setItem("pokemarket_users", JSON.stringify(baseDeDonneesUtilisateurs));

    alert("Compte créé avec succès ! Tu peux te connecter.");
    document.getElementById("reg-id").value = "";
    document.getElementById("reg-pass").value = "";
}

function seConnecter() {
    var idInput = document.getElementById("login-id").value.trim();
    var passInput = document.getElementById("login-pass").value.trim();

    var utilisateurTrouve = null;

    for (var i = 0; i < baseDeDonneesUtilisateurs.length; i++) {
        if (baseDeDonneesUtilisateurs[i].id === idInput && baseDeDonneesUtilisateurs[i].pass === passInput) {
            utilisateurTrouve = baseDeDonneesUtilisateurs[i];
            break;
        }
    }

    if (utilisateurTrouve !== null) {
        utilisateurActuel = utilisateurTrouve;

        document.getElementById("username-display").innerHTML = utilisateurActuel.id;
        document.getElementById("wallet-display").innerHTML = utilisateurActuel.monnaie;

        document.getElementById("auth-section").classList.add("hidden");
        document.getElementById("main-section").classList.remove("hidden");
        document.getElementById("user-info").classList.remove("hidden");

        reinitialiserSessionCombat();
        mettreAJourCasier();
    } else {
        alert("Identifiant ou mot de passe incorrect.");
    }
}

function sauvegarderDonneesUtilisateur() {
    for (var i = 0; i < baseDeDonneesUtilisateurs.length; i++) {
        if (baseDeDonneesUtilisateurs[i].id === utilisateurActuel.id) {
            baseDeDonneesUtilisateurs[i] = utilisateurActuel;
            break;
        }
    }
    localStorage.setItem("pokemarket_users", JSON.stringify(baseDeDonneesUtilisateurs));
}

function changerOnglet(nomOnglet) {
    document.getElementById("tab-shop").classList.add("hidden");
    document.getElementById("tab-casier").classList.add("hidden");
    document.getElementById("tab-combat").classList.add("hidden");

    document.getElementById("tab-shop-btn").classList.remove("active");
    document.getElementById("tab-casier-btn").classList.remove("active");
    document.getElementById("tab-combat-btn").classList.remove("active");

    if (nomOnglet === 'shop') {
        document.getElementById("tab-shop").classList.remove("hidden");
        document.getElementById("tab-shop-btn").classList.add("active");
    } else if (nomOnglet === 'casier') {
        document.getElementById("tab-casier").classList.remove("hidden");
        document.getElementById("tab-casier-btn").classList.add("active");
        mettreAJourCasier();
    } else if (nomOnglet === 'combat') {
        document.getElementById("tab-combat").classList.remove("hidden");
        document.getElementById("tab-combat-btn").classList.add("active");
        chargerPlateauCombat();
    }
}

// Acheter un booster
function acheterBooster(typeBooster, prix) {
    if (utilisateurActuel.monnaie < prix) {
        alert("Pas assez de pièces ! Fais des combats pour en gagner.");
        return;
    }

    utilisateurActuel.monnaie -= prix;
    document.getElementById("wallet-display").innerHTML = utilisateurActuel.monnaie;

    var listePossibles = catalogueCartes[typeBooster];
    var nomCarteObtenue = listePossibles[Math.floor(Math.random() * listePossibles.length)];
    var stats = genererStatistiquesCarte(typeBooster);

    var nouvelleCarte = {
        nom: nomCarteObtenue,
        type: typeBooster,
        hp: stats.hp,
        maxHp: stats.maxHp,
        atk: stats.atk
    };
    
    utilisateurActuel.inventaire.push(nouvelleCarte);
    sauvegarderDonneesUtilisateur();

    var logBox = document.getElementById("shop-log");
    logBox.innerHTML = "Achat Booster " + typeBooster + " -> " + nomCarteObtenue + " (PV: " + nouvelleCarte.hp + ", ATK: " + nouvelleCarte.atk + ")<br>" + logBox.innerHTML;

    alert("Ouverture du booster " + typeBooster + "...\nTu as obtenu : " + nomCarteObtenue + "\n❤️ PV : " + nouvelleCarte.hp + " | ⚔️ ATK : " + nouvelleCarte.atk);
}

// Mettre à jour l'affichage du casier
function mettreAJourCasier() {
    var conteneurCasier = document.getElementById("inventory-container");
    document.getElementById("casier-count").innerHTML = utilisateurActuel.inventaire.length;

    if (utilisateurActuel.inventaire.length === 0) {
        conteneurCasier.innerHTML = "<p style='color: #777; grid-column: 1 / -1; text-align: center;'>Ton casier est vide.</p>";
        return;
    }

    var htmlContent = "";
    for (var i = 0; i < utilisateurActuel.inventaire.length; i++) {
        var carte = utilisateurActuel.inventaire[i];
        
        if (carte.hp === undefined) {
            var statsSecours = genererStatistiquesCarte(carte.type);
            carte.hp = statsSecours.hp;
            carte.maxHp = statsSecours.maxHp;
            carte.atk = statsSecours.atk;
        }

        var estKO = carte.hp <= 0;
        var estBlesse = carte.hp < carte.maxHp;
        var classeKO = estKO ? " card-ko" : "";

        htmlContent += '<div class="inventory-item rarity-' + carte.type.toLowerCase() + classeKO + '">';
        htmlContent += '<div>';
        htmlContent += '<div style="font-size: 1.5rem;">🎴</div>';
        htmlContent += '<strong>' + carte.nom + '</strong>';
        htmlContent += '<p style="font-size: 0.75rem; color: #aaa;">' + carte.type + '</p>';
        htmlContent += '<p style="font-size: 0.75rem; color: #ffcb05; margin-top: 4px;">❤️ ' + carte.hp + '/' + carte.maxHp + ' | ⚔️ ' + carte.atk + '</p>';
        if (estKO) {
            htmlContent += '<span style="font-size: 0.6rem; color: #ff4757; font-weight: bold;">K.O.</span>';
        }
        htmlContent += '</div>';

        if (estBlesse) {
            htmlContent += '<button class="btn-heal" onclick="soignerCarte(' + i + ')">💊 Soigner (15 🪙)</button>';
        }

        htmlContent += '</div>';
    }

    conteneurCasier.innerHTML = htmlContent;
}

// Soigner manuellement une carte
function soignerCarte(index) {
    var carte = utilisateurActuel.inventaire[index];
    var coutSoin = 15;

    if (utilisateurActuel.monnaie < coutSoin) {
        alert("Tu n'as pas assez de pièces pour soigner cette carte (Coût : 15 🪙). Fais des combats !");
        return;
    }

    utilisateurActuel.monnaie -= coutSoin;
    carte.hp = carte.maxHp;

    document.getElementById("wallet-display").innerHTML = utilisateurActuel.monnaie;
    sauvegarderDonneesUtilisateur();
    mettreAJourCasier();

    alert("✨ Soin réussi ! " + carte.nom + " a récupéré tous ses PV (" + carte.maxHp + ").");
}

// ==========================================
// ARÈNE DE COMBAT
// ==========================================

function chargerPlateauCombat() {
    var mainJoueurConteneur = document.getElementById("player-hand");
    
    if (utilisateurActuel.inventaire.length === 0) {
        mainJoueurConteneur.innerHTML = "<p style='color: #aaa;'>Achète des cartes pour combattre !</p>";
        return;
    }

    var htmlContent = "";
    for (var i = 0; i < utilisateurActuel.inventaire.length; i++) {
        var carte = utilisateurActuel.inventaire[i];
        if (carte.hp === undefined) {
            var statsSecours = genererStatistiquesCarte(carte.type);
            carte.hp = statsSecours.hp;
            carte.maxHp = statsSecours.maxHp;
            carte.atk = statsSecours.atk;
        }

        var estKO = carte.hp <= 0;
        var classeUtilisee = estKO ? " card-used" : "";
        var fonctionClic = estKO ? "" : 'onclick="selectionnerCarteCombat(' + i + ')"';

        var texteEtat = "";
        if (estKO) {
            texteEtat = '<span style="font-size: 0.6rem; color: #ff4757; font-weight: bold;">K.O. (0 PV)</span>';
        }

        htmlContent += '<div class="inventory-item rarity-' + carte.type.toLowerCase() + classeUtilisee + '" ' + fonctionClic + '>';
        htmlContent += '<div>';
        htmlContent += '<div style="font-size: 1.3rem;">🎴</div>';
        htmlContent += '<strong style="font-size: 0.8rem;">' + carte.nom + '</strong>';
        htmlContent += '<p style="font-size: 0.7rem; color: #ffcb05;">❤️ ' + carte.hp + '/' + carte.maxHp + ' | ⚔️ ' + carte.atk + '</p>';
        htmlContent += texteEtat;
        htmlContent += '</div>';
        htmlContent += '</div>';
    }
    mainJoueurConteneur.innerHTML = htmlContent;
}

function selectionnerCarteCombat(index) {
    var carte = utilisateurActuel.inventaire[index];

    if (carte.hp <= 0) {
        alert("Cette carte est K.O. (0 PV) ! Va la soigner dans ton casier.");
        return;
    }

    indexCarteActiveSurTerrain = index;
    
    var slotPlayer = document.getElementById("slot-player");
    slotPlayer.className = "slot-box rarity-" + carte.type.toLowerCase();
    slotPlayer.innerHTML = '<div style="font-size: 1.8rem;">🎴</div><strong style="font-size:0.9rem;">' + carte.nom + '</strong><small style="color:#ffcb05;">❤️ ' + carte.hp + '/' + carte.maxHp + ' | ⚔️ ' + carte.atk + '</small>';

    var logBox = document.getElementById("battle-log");
    logBox.innerHTML = "<strong>" + carte.nom + "</strong> entre sur le terrain de combat !<br>" + logBox.innerHTML;
}

function lancerLigneCombat() {
    if (indexCarteActiveSurTerrain === null) {
        alert("Sélectionne d'abord une carte dans ta main en bas !");
        return;
    }

    var carteJoueur = utilisateurActuel.inventaire[indexCarteActiveSurTerrain];

    if (carteJoueur.hp <= 0) {
        alert("Cette carte est K.O. ! Impossible de combattre.");
        return;
    }

    var types = ["Commun", "Rare", "Épique", "Légendaire"];
    var typeAdv = types[Math.floor(Math.random() * types.length)];
    var nomAdv = catalogueCartes[typeAdv][Math.floor(Math.random() * catalogueCartes[typeAdv].length)];
    var statsAdv = genererStatistiquesCarte(typeAdv);

    var slotOpponent = document.getElementById("slot-opponent");
    slotOpponent.className = "slot-box rarity-" + typeAdv.toLowerCase();
    slotOpponent.innerHTML = '<div style="font-size: 1.8rem;">🎴</div><strong style="font-size:0.9rem;">' + nomAdv + '</strong><small style="color:#ffcb05;">❤️ ' + statsAdv.hp + ' | ⚔️ ' + statsAdv.atk + '</small>';

    var logBox = document.getElementById("battle-log");

    // L'adversaire riposte et retire directement les PV de la carte active en mémoire
    var degatsSubis = statsAdv.atk;
    carteJoueur.hp = carteJoueur.hp - degatsSubis;

    var scoreJoueur = carteJoueur.atk + (carteJoueur.hp / 3);
    var scoreAdv = statsAdv.atk + (statsAdv.hp / 3);

    var messageResultat = "";

    if (scoreJoueur >= scoreAdv) {
        utilisateurActuel.monnaie += 35;
        document.getElementById("wallet-display").innerHTML = utilisateurActuel.monnaie;
        messageResultat = "<span style='color: #2ed573;'>🎉 VICTOIRE ! " + carteJoueur.nom + " a vaincu " + nomAdv + " ! (+35 🪙). Subit " + degatsSubis + " dégâts.</span><br>";
    } else {
        messageResultat = "<span style='color: #ff4757;'>❌ DÉFAITE... " + nomAdv + " a dominé " + carteJoueur.nom + " et lui a infligé " + degatsSubis + " dégâts.</span><br>";
    }

    // Si les PV tombent à 0 ou en dessous
    if (carteJoueur.hp <= 0) {
        carteJoueur.hp = 0;
        messageResultat += "<span style='color: #ff4757; font-weight: bold;'>⚠️ " + carteJoueur.nom + " est K.O. (0 PV) ! Va la soigner dans ton casier.</span><br>";
        
        document.getElementById("slot-player").innerHTML = '<span style="color: #ff4757;">K.O. (0 PV)</span>';
        document.getElementById("slot-player").className = "slot-box";
        indexCarteActiveSurTerrain = null;
    } else {
        // Mise à jour immédiate et explicite des PV restants dans le slot de combat
        var slotPlayer = document.getElementById("slot-player");
        slotPlayer.innerHTML = '<div style="font-size: 1.8rem;">🎴</div><strong style="font-size:0.9rem;">' + carteJoueur.nom + '</strong><small style="color:#ffcb05;">❤️ ' + carteJoueur.hp + '/' + carteJoueur.maxHp + ' | ⚔️ ' + carteJoueur.atk + '</small>';
    }

    logBox.innerHTML = messageResultat + logBox.innerHTML;

    // Sauvegarde immédiate dans le localStorage pour persister la perte de PV
    sauvegarderDonneesUtilisateur();
    chargerPlateauCombat();
}

function reinitialiserSessionCombat() {
    indexCarteActiveSurTerrain = null;
    document.getElementById("slot-player").innerHTML = '<span style="color: #555;">Choisis une carte</span>';
    document.getElementById("slot-player").className = "slot-box";
    document.getElementById("slot-opponent").innerHTML = '<span style="color: #555;">En attente...</span>';
    document.getElementById("slot-opponent").className = "slot-box";
    document.getElementById("battle-log").innerHTML = "Nouveau round prêt. Choisis une carte en bonne santé !";
    chargerPlateauCombat();
}