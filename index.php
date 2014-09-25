<?php

// load application config (error reporting etc.)
require 'app/config/config.php';

// load application class
require 'app/libs/app.php';
require 'app/libs/controller.php';

// start the application
$app = new App();