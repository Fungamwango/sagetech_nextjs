<!--ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua.-->
<?php 
if(!empty($_POST['name']) && !empty($_POST['pass'])){
echo "Hello, your name is ".ucfirst($_POST['name']). "<br> and your password is ".$_POST['pass'];
}
?> 