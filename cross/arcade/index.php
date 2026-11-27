<?php
define('STUDIO_SECTION_ENTRY',true);
require dirname(__DIR__).'/includes/header.php';
header('Location: '.studioBase().'#daily-challenge',true,302);
exit;
