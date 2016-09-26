var Song = require('../app/models/song');
var User = require('../app/models/user');
exports.run = function(callback, errback) {
    Song.create(
        {name:'Amazing grace', melody:'tunes/AmazingGraceMelody.pdf', seconds:'tunes/AmazingGraceSeconds.pdf', thirds:'tunes/AmazingGraceThirds.pdf'},
        {name:'Bonnie Charlie', melody:'tunes/BonnieCharlie.pdf'},
        {name:'Bonnie Dundee', melody:'tunes/BonnieDundee.pdf'},
        {name:'Bonnie Lass O\' Fyvie', melody:'tunes/BonnieLass.pdf'},
        {name:'Castle Dangerous', melody:'tunes/CastleDangerous.pdf'},
        {name:'Constable Bill Baines', melody:'tunes/ConstableBillBainesMelody.pdf', seconds:'tunes/ConstableBillBainesSeconds.pdf', snare:'drum-scores/ConstableBillBainessnare.pdf', tenor:'drum-scores/ConstableBillBainestenor.pdf', bass:'drum-scores/ConstableBillBainesbass.pdf'},
        {name:'Cockney Jocks', melody:'tunes/CockneyJocks.pdf'},
        {name:'Cullen Bay', melody:'tunes/CullenBayMelody.pdf', seconds:'tunes/CullenBaySeconds.pdf'},
        {name:'Flower of Scotland', melody:'tunes/FlowerofScotlandMelody.pdf', seconds:'tunes/FlowerSeconds.pdf'},
        {name:'God Bless America', melody:'tunes/GodBlessAmerica.pdf'},
        {name:'Green Hills', melody:'tunes/GreenHillsMelody.pdf',  seconds:'tunes/GreensHillsSeconds.pdf'},
        {name:'Haughs of Cromdale', melody:'tunes/HaughsofCromdale.pdf', snare:'drum-scores/HaughsOfCromdalesnarerev..pdf', tenor:'drum-scores/HaughsOfCromdalemid-section.pdf'},
        {name:'Highland Cathedral', melody:'tunes/HighlandCathedralMelody.pdf', seconds:'tunes/HighlandCathedralSeconds.pdf'},
        {name:'Inercontinental Gathering', melody:'tunes/IntercontinentalMelody.pdf', seconds:'tunes/IntercontinentalSeconds.pdf', snare:'drum-scores/IntercontinentalGatheringsnare4_3_13.pdf', tenor:'drum-scores/IntercontinentalGatheringmid-sectionscore.pdf'},
        {name:'Jimmy Findlater', melody:'tunes/JimmyFindlater.pdf'},
        {name:'Kelley the Boy from Killane', melody:'tunes/KelleytheBoyfromKillane.pdf'},
        {name:'Lochanside', melody:'tunes/LochansideMelody.pdf', seconds:'tunes/LochansideSeconds.pdf'},
        {name:'Lord Lovats lament', melody:'tunes/LordLovatsLament.pdf'},
        {name:'Marine Corps Hymn', melody:'tunes/MarineCorpsHymn.pdf'},
        {name:'McKenna\'s Dream', melody:'tunes/McKennasDream.pdf'},
        {name:'Men of the West', melody:'tunes/MenoftheWest.pdf'},
        {name:'Minstrel Boy', melody:'tunes/MinstrelBoy.pdf'},
        {name:'Molly Connel', melody:'tunes/MollyConnell.pdf', snare:'drum-scores/MollyConnellsnarescore.pdf', tenor:'drum-scores/MollyConnellmid-sectionscore.pdf'},
        {name:'My land', melody:'tunes/MyLand.pdf'},
        {name:'O\'reillys Jig', melody:'tunes/OReilysJig.pdf', snare:'drum-scores/OReilyssnarerev4_30_13.pdf', tenor:'drum-scores/OReilysJigmid-sectionscore.pdf'},
        {name:'Oyster Rant', melody:'tunes/OysterRant.pdf', snare:'drum-scores/OysterRantsnarescore.pdf', tenor:'drum-scores/OysterRantmid-sectionscore.pdf'},
        {name:'Paddy McGintys Goat', melody:'tunes/PaddyMcGintysGoat.pdf'},
        {name:'Piper of Drummond', melody:'tunes/PiperofDrummond.pdf', snare:'drum-scores/PiperofDrummondsnare.pdf',tenor:'drum-scores/PiperofDrummondMid-Section.pdf'},
        {name:'Rakes of Mallow', melody:'tunes/RakesofMallow.pdf'},
        {name:'Roddy McCorley', melody:'tunes/RoddyMcCorley.pdf'},
        {name:'Rowan Tree', melody:'tunes/RowanTree.pdf'},
        {name:'Scot\'s Wha\' Hae', melody:'tunes/ScotsWhaHae.pdf'},
        {name:'Scotland the Brave', melody:'tunes/ScotlandtheBrave.pdf'},
        {name:'Scotsville Reel', melody:'tunes/ScotsvilleReelMelody.pdf', seconds:'tunes/ScotsvilleReelSeconds.pdf', snare:'drum-scores/ScotsvilleReelsnarescorerev1.pdf', tenor:'drum-scores/ScotsvilleReelmid-sectionscore.pdf'},
        {name:'Semper Paratus', melody:'tunes/SemperParatusMelody.pdf', seconds:'tunes/SemperParatusSeconds.pdf'},
        {name:'Shoals of Herring', melody:'tunes/ShoalsofHerring.pdf'},
        {name:'Tending Cattle', melody:'tunes/TendingCattleMelody.pdf', seconds:'tunes/TendingCattleSeconds.pdf'},
        {name:'We\'re no Awa\'', melody:'tunes/WerenoAwa.pdf'},
        {name:'Wearin O\' the Green', melody:'tunes/WearinOtheGreen.pdf'},
        {name:'Wee Buns', melody:'tunes/WeeBuns.pdf', snare:'drum-scores/WeeBunssnare4_30_13.pdf', tenor:'drum-scores/WeeBunsmid-sectionscore.pdf'},
        {name:'When the Battle\'s O\'er', melody:'tunes/WhentheBattlesOerMelody.pdf', seconds:'tunes/WhentheBattlesOerSeconds.pdf'},
        {name:'Wings', melody:'tunes/Wings.pdf'},
        function(err, items) {
            if (err) {
                errback(err);
                return;
            }

    User.create(
        {
        name:"Aric",
        yearsIn:2,
        bio:"adfgasdfgasdfasdfasdf",
        email: "aric87@comcast.net",
        password: User.genHash("heyo")
        },
        function(err,user){
            if (err){
                errback(err);
                return;
            }
            callback();
        });
     });
};

if (require.main === module) {
    require('./connect');
    exports.run(function() {
        var mongoose = require('mongoose');
        mongoose.disconnect();
    }, function(err) {
        console.error(err);
    });
}
