<?php

include_once '../conf/config.inc.php'; // app config
include_once '../lib/_functions.inc.php'; // app functions
include_once '../lib/classes/Db.class.php'; // db connector, queries

date_default_timezone_set('UTC');

$callback = safeParam('callback');

// when this script is called via importJsonToArray() which is declared in
// functions.inc.php, $network is passed in as a function param
if (!isset($network)) {
  $network = safeParam('network', 'Pacific');
}
$now = date(DATE_RFC2822);

$db = new Db;

// Db query result: all stations in a given network
$rsStations = $db->queryStations($network);

// Initialize array template for json feed
$output = [
  'count' => $rsStations->rowCount(),
  'generated' => $now,
  'features' => [],
  'network' => $network,
  'type' => 'FeatureCollection'
];

// Store results from db into features array
while ($row = $rsStations->fetch(PDO::FETCH_ASSOC)) {
  $secs = 86400; // secs in one day
  $days = floor((strtotime($now) - strtotime($row['last_observation'])) / $secs);

  $feature = [
    'id' => intval($row['id']),
    'geometry' => [
      'coordinates' => [
        floatval($row['lon']),
        floatval($row['lat'])
      ],
      'type' => 'Point'
    ],
    'properties' => [
      'days' => $days,
      'last_observation' => $row['last_observation'],
      'rms' => [
        'east' => floatval($row['east_rms']),
        'north' => floatval($row['north_rms']),
        'up' => floatval($row['up_rms'])
      ],
      'showcoords' => intval($row['showcoords']),
      'station' => $row['station'],
      'type' => $row['stationtype']
    ],
    'type' => 'Feature'
  ];

  array_push($output['features'], $feature);
}

// Send json stream to browser
showJson($output, $callback);
