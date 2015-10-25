$(document).ready(function(){
   $('form').submit(function(e){
       if($('input.setPassword').val() !== $('input.confirmPassword').val() ){
           e.preventDefault();
           $('input.confirmPassword, input.setPassword').val('');
           $('input.confirmPassword, input.setPassword').css('background-color','red');
       }
   });

});