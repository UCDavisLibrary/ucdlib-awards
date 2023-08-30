<?php

/**
 * @description Custom authentication on top of OpenID Connect Generic plugin.
 */
class UcdlibAwardsAuth {

  public function __construct( $plugin ){
    $this->plugin = $plugin;

    // if a user has these client roles, they will be given access to the site.
    $this->allowedClientRoles = [
      'administrator',
      'editor',
      'author',
      'subscriber'
    ];

    // if a user has these realm roles, they will be given access to the site.
    $this->allowedRealmRoles = [
      'basic-access',
      'admin-access'
    ];

    $this->setRoleFromClaim = true;

    $this->oidcIsActivated = in_array('openid-connect-generic/openid-connect-generic.php', apply_filters('active_plugins', get_option('active_plugins')));
    if ( $this->oidcIsActivated ) {
      add_action( 'openid-connect-generic-update-user-using-current-claim', [$this, 'setAdvancedRole'], 10, 2 );
      add_action( 'openid-connect-generic-user-create', [$this, 'setAdvancedRole'], 10, 2 );
      add_action( 'openid-connect-generic-login-button-text', [$this, 'loginButtonText'], 10, 1);
      add_filter ( 'allow_password_reset', function (){return false;} );
    } else {
      add_action(
        'admin_notices',
        function() {
          echo '<div class="error"><p>OpenID Connect Generic plugin not activated, which is required for the UC Davis Library Awards platform. </p></div>';
        }
      );
    }

    add_action('after_setup_theme', [$this, 'hideAdminBar']);
  }

  /**
   * @description Hide the floating admin bar on front-end pages for "subscribers"
   */
  public function hideAdminBar(){
    $user = wp_get_current_user();
    if ( !$user ) return;
    $allowedRoles = array( 'editor', 'administrator', 'author' );
    if (array_intersect( ['subscriber'], $user->roles ) && !is_admin()) {
      show_admin_bar(false);
    }
  }

  /**
   * @description Set the wordpress user role beyond default subscriber,
   * if the user has a corresponding claim in access token from identity provider.
   */
  public function setAdvancedRole($user, $userClaim){
    if ( !$this->setRoleFromClaim ) return;
    $tokensEncoded = get_user_meta( $user->ID, 'openid-connect-generic-last-token-response', true );
    if ( !$tokensEncoded ) return;
    try {
      $parts = explode( '.', $tokensEncoded['access_token'] );
      if ( count( $parts ) != 3 ) return;
      $accessToken = json_decode(
        base64_decode(
          str_replace(
            array( '-', '_' ),
            array( '+', '/' ),
            $parts[1]
          )
        ),
        true
      );
    } catch (\Throwable $th) {
      return;
    }
    if ( !$accessToken ) return;

    // check realm roles
    if ( isset( $accessToken['realm_access']['roles'] ) ) {
      if ( in_array('admin-access',  $accessToken['realm_access']['roles']) ){
        $user->set_role( 'administrator' );
        return;
      }
    }

    // check client roles
    $client_id = $this->client_id();
    if ( !$client_id ) return;
    if ( !isset( $accessToken['resource_access'][$client_id]['roles'] ) ) return;
    $roles = $accessToken['resource_access'][$client_id]['roles'];
    $allowedRoles = array_intersect( $this->allowedClientRoles, $roles );
    if ( count( $allowedRoles ) > 0 ) {
      $allowedRoles = array_values( $allowedRoles );
      $user->set_role( $allowedRoles[0] );
    }
  }

  /**
   * @description Change the text on the OIDC login button.
   */
  public function loginButtonText($text){
    return 'Login with Your UC Davis Account';
  }

  protected $client_id;
  public function client_id(){
    if ( ! empty($this->client_id) ){
      return $this->client_id;
    }
    $options = get_option( 'openid_connect_generic_settings', [] );
    $client_id = isset( $options['client_id'] ) ? $options['client_id'] : '';
    $this->client_id = $client_id;
    return $client_id;
  }
}
