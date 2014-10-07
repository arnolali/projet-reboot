<?php
	require 'app/libs/Mustache/Autoloader.php';
	Mustache_Autoloader::register();

	$mustache = new Mustache_Engine(array(
		'loader' => new Mustache_Loader_FilesystemLoader('app/templates'),
		'partials_loader' => new Mustache_Loader_FilesystemLoader('app/templates/partials/')
	));

	$tpl = $mustache->loadTemplate('home');
	//print_r($this);
	echo $tpl->render($this);
?>