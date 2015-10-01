<?php

$feedback_page = "members.html";

$Password =  $_POST['password'] ;

if ($Password === 'password') {
  $html = file_get_contents('members.html');
  $html = str_replace('<head>', '<head><base href="members.html" />', $html);
echo $html;
// header( "Location: $feedback_page" );
} else {
  header( "location: http://highlandlight.com");
}
?>
