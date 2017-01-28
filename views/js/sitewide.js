$(document).ready(function(){
   $('form').submit(function(e){
       if($('input.setPassword').val() !== $('input.confirmPassword').val() ){
           e.preventDefault();
           $('input.confirmPassword, input.setPassword').val('');
           $('input.confirmPassword, input.setPassword').css('background-color','red');
       }
   });
   $('a.asyncAction').click(function(e){
     e.preventDefault();
     var self = $(this),
     confirmed = true;
     if(self.hasClass('confirm')){
       confirmed = confirm("Are you sure?");
     }
     if(!confirmed){return;}
     $.post(self.attr('href')).then(function(data){
       var v = self.parents('p:first').find('.bool');
       if(v.text() === 'true'){
         v.text('false');
       } else if( v.text() === 'false'){
         v.text('true');
       } else{
         var role = self.attr('href').split('role=')[1];
         var action = self.attr('href').split('action=')[1].split('&')[0];
         if(action === 'delete'){
           self.parents('.spaceBelow').remove();
         } else {
          v.text(role);
         }
       }
     });
   });
   $('.clearImage').click(function(e){
     e.preventDefault();
     $.post('/members/profile/imageClear').then(function(data){
        $('#formProfileImage').attr('src','/images/default.jpg');
     });
   });
   var addTuneContents = $('#tuneSelectorContainer label:first').clone();
   $('#addAnotherTune').click(function(e){
     e.preventDefault();
     $('#tuneSelectorContainer').append(addTuneContents.clone());
	      $('#tuneSelectorContainer').append('<br/>');
   });
   $('.removeTuneFromSet').click(function(e){
     e.preventDefault();
     $(this).parents('label:first').remove();
   });

   $('#chooseVenue').change(function(){
     var chosen = $(this).val();
     if(chosen == "new"){
       $('#newVenue').slideDown();
       $('[class*="venueDetail"]').slideUp();
     } else {
       $('#newVenue').slideUp();
       $('.venueDetail-'+chosen).slideDown();
     }
   });
    $('.datetime').datetimepicker({
      sideBySide:true,
      format:'dddd MM/DD/YYYY hh:mm:ss'
    });
});
