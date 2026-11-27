<?php
if (isset($_GET['seccion']) && $_GET['seccion'] === 'pluma-libre') { require __DIR__.'/includes/pluma.php'; exit; }
$studioView='home';
require __DIR__.'/includes/portal.php';
