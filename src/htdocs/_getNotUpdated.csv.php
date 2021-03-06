<?php

include_once '../conf/config.inc.php'; // app config
include_once '../lib/_functions.inc.php'; // app functions
include_once '../lib/classes/Db.class.php'; // db connector, queries

date_default_timezone_set('UTC');

$network = safeParam('network', 'Pacific');

$db = new Db();

// Db query result: all stations that haven't been updated in past x days
$rsLastUpdated = $db->queryLastUpdated($network, 7);

// Send csv stream to browser
header('Content-Type: text/plain');

print "station, last observation\n";
while($row = $rsLastUpdated->fetch()) {
	printf("%s, %s\n",
    $row['station'],
    $row['last_observation']
  );
}
