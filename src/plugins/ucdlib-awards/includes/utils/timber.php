<?php

require_once( __DIR__ . '/config.php' );

class UcdlibAwardsTimber {

  public static function renderAdminPage( $page, $context ){
    $template = '@' . UcdlibAwardsConfig::$twigNamespace . '/admin/pages/' . $page . '.twig';
    Timber::render( $template, $context );
  }

}
