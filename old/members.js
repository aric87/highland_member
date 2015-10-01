angular.module('HLSPB', ['ngMaterial'])
.controller('TabController', ['$scope' ,function ($scope) {
$scope.links =[
    {name:"Table of Contents", file:'tunes/2014TuneToC.pdf'},
  {name:'Amazing grace', file:'tunes/AmazingGraceMelody.pdf', seconds:'tunes/AmazingGraceSeconds.pdf', thirds:'tunes/AmazingGraceThirds.pdf'},
  {name:'Bonnie Charlie', file:'tunes/BonnieCharlie.pdf'},
  {name:'Bonnie Dundee', file:'tunes/BonnieDundee.pdf'},
  {name:'Bonnie Lass O\' Fyvie', file:'tunes/BonnieLass.pdf'},
  {name:'Castle Dangerous', file:'tunes/CastleDangerous.pdf'},
  {name:'Constable Bill Baines', file:'tunes/ConstableBillBainesMelody.pdf', seconds:'tunes/ConstableBillBainesSeconds.pdf', snare:'drum-scores/ConstableBillBainessnare.pdf', tenor:'drum-scores/ConstableBillBainestenor.pdf', bass:'drum-scores/ConstableBillBainesbass.pdf'},
    {name:'Cockney Jocks', file:'tunes/CockneyJocks.pdf'},
  {name:'Cullen Bay', file:'tunes/CullenBayMelody.pdf', seconds:'tunes/CullenBaySeconds.pdf'},
  {name:'Flower of Scotland', file:'tunes/FlowerofScotlandMelody.pdf', seconds:'tunes/FlowerSeconds.pdf'},
  {name:'God Bless America', file:'tunes/GodBlessAmerica.pdf'},
  {name:'Green Hills', file:'tunes/GreenHillsMelody.pdf',  seconds:'tunes/GreensHillsSeconds.pdf'},
  {name:'Haughs of Cromdale', file:'tunes/HaughsofCromdale.pdf', snare:'drum-scores/HaughsOfCromdalesnarerev..pdf', mid:'drum-scores/HaughsOfCromdalemid-section.pdf'},
  {name:'Highland Cathedral', file:'tunes/HighlandCathedralMelody.pdf', seconds:'tunes/HighlandCathedralSeconds.pdf'},
  {name:'Inercontinental Gathering', file:'tunes/IntercontinentalMelody.pdf', seconds:'tunes/IntercontinentalSeconds.pdf', snare:'drum-scores/IntercontinentalGatheringsnare4_3_13.pdf', mid:'drum-scores/IntercontinentalGatheringmid-sectionscore.pdf'},
  {name:'Jimmy Findlater', file:'tunes/JimmyFindlater.pdf'},
  {name:'Kelley the Boy from Killane', file:'tunes/KelleytheBoyfromKillane.pdf'},
  {name:'Lochanside', file:'tunes/LochansideMelody.pdf', seconds:'tunes/LochansideSeconds.pdf'},
  {name:'Lord Lovats lament', file:'tunes/LordLovatsLament.pdf'},
  {name:'Marine Corps Hymn', file:'tunes/MarineCorpsHymn.pdf'},
  {name:'McKenna\'s Dream', file:'tunes/McKennasDream.pdf'},
  {name:'Men of the West', file:'tunes/MenoftheWest.pdf'},
  {name:'Minstrel Boy', file:'tunes/MinstrelBoy.pdf'},
  {name:'Molly Connel', file:'tunes/MollyConnell.pdf', snare:'drum-scores/MollyConnellsnarescore.pdf', mid:'drum-scores/MollyConnellmid-sectionscore.pdf'},
  {name:'My land', file:'tunes/MyLand.pdf'},
  {name:'O\'reillys Jig', file:'tunes/OReilysJig.pdf', snare:'drum-scores/OReilyssnarerev4_30_13.pdf', mid:'drum-scores/OReilysJigmid-sectionscore.pdf'},
  {name:'Oyster Rant', file:'tunes/OysterRant.pdf', snare:'drum-scores/OysterRantsnarescore.pdf', mid:'drum-scores/OysterRantmid-sectionscore.pdf'},
  {name:'Paddy McGintys Goat', file:'tunes/PaddyMcGintysGoat.pdf'},
  {name:'Piper of Drummond', file:'tunes/PiperofDrummond.pdf', snare:'drum-scores/PiperofDrummondsnare.pdf', mid:'drum-scores/PiperofDrummondMid-Section.pdf'},
  {name:'Rakes of Mallow', file:'tunes/RakesofMallow.pdf'},
  {name:'Roddy McCorley', file:'tunes/RoddyMcCorley.pdf'},
  {name:'Rowan Tree', file:'tunes/RowanTree.pdf'},
  {name:'Scot\'s Wha\' Hae', file:'tunes/ScotsWhaHae.pdf'},
  {name:'Scotland the Brave', file:'tunes/ScotlandtheBrave.pdf'},
  {name:'Scotsville Reel', file:'tunes/ScotsvilleReelMelody.pdf', seconds:'tunes/ScotsvilleReelSeconds.pdf', snare:'drum-scores/ScotsvilleReelsnarescorerev1.pdf', mid:'drum-scores/ScotsvilleReelmid-sectionscore.pdf'},
  {name:'Semper Paratus', file:'tunes/SemperParatusMelody.pdf', seconds:'tunes/SemperParatusSeconds.pdf'},
  {name:'Shoals of Herring', file:'tunes/ShoalsofHerring.pdf'},
  {name:'Tending Cattle', file:'tunes/TendingCattleMelody.pdf', seconds:'tunes/TendingCattleSeconds.pdf'},
  {name:'We\'re no Awa\'', file:'tunes/WerenoAwa.pdf'},
  {name:'Wearin O\' the Green', file:'tunes/WearinOtheGreen.pdf'},
  {name:'Wee Buns', file:'tunes/WeeBuns.pdf', snare:'drum-scores/WeeBunssnare4_30_13.pdf', mid:'drum-scores/WeeBunsmid-sectionscore.pdf'},
  {name:'When the Battle\'s O\'er', file:'tunes/WhentheBattlesOerMelody.pdf', seconds:'tunes/WhentheBattlesOerSeconds.pdf'},
  {name:'Wings', file:'tunes/Wings.pdf'}
]
$scope.show = function(item){
    if (item === "pipes") {
        $scope.pipes = true;
        $scope.drums = false;
        } else if (item ==="drums"){
        $scope.pipes = false;
        $scope.drums = true;
    } else {
        $scope.pipes = false;
        $scope.drums = false;
    }
}
}]);
