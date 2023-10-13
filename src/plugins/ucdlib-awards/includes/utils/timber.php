<?php

require_once( __DIR__ . '/config.php' );

class UcdlibAwardsTimber {

  public static function renderAdminPage( $page, $context ){
    $template = '@' . UcdlibAwardsConfig::$twigNamespace . '/admin/pages/' . $page . '.twig';
    Timber::render( $template, $context );
  }

  public static function renderEvaluationPage( $page, $context ){
    $template = '@' . UcdlibAwardsConfig::$twigNamespace . '/evaluation/pages/' . $page . '.twig';
    Timber::render( $template, $context );
  }

  public static function getApplicationHtml( $applicant, $data, $award ){
    $context = [
      'applicant' => $applicant,
      'questions' => $data,
      'award' => $award
    ];
    $template = '@' . UcdlibAwardsConfig::$twigNamespace . '/evaluation/application.twig';
    $compiled = Timber::compile( $template, $context );

    // remove trailing line break
    $compiled = preg_replace('/\s+$/m', '', $compiled);
    return $compiled;
  }

}
