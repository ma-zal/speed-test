<?php
$count = (isset($_GET['sizeMB']) ? (int)$_GET['sizeMB'] : 100);
header("Content-Length: " . (1024*1024*$count));
header("Content-Disposition: attachment");
header("Content-Type: application/octet-stream");
for ($i = 1; $i <= $count; $i++) {
    $bytes = openssl_random_pseudo_bytes(1024*1024);
//    $hex   = bin2hex($bytes);

	echo $bytes;
}
