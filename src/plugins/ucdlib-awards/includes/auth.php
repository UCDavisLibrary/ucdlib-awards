<?php

/**
 * @description Custom authentication actions including mods to the OpenID Connect Generic plugin.
 */
class UcdlibAwardsAuth {

  public function __construct( $plugin ){
    $this->plugin = $plugin;

    // if a user has these client roles, their role will be set to the first matching role in the array.
    $this->allowedClientRoles = [
      'administrator',
      'editor',
      'author',
      'subscriber'
    ];

    // if a user has these realm roles, they will be given access to the site.
    $this->allowedRealmRoles = [
      'admin-access'
    ];

    // if a user has this client role, they will be given access to the prize admin.
    // should be accompanied by a 'editor' or 'author' client role.
    // 'administrator' role have access to prize admin by default.
    $this->prizeAdminClientRole = 'prize-admin';

    $this->setRoleFromClaim = true;

    $this->oidcIsActivated = in_array('openid-connect-generic/openid-connect-generic.php', apply_filters('active_plugins', get_option('active_plugins')));
    if ( $this->oidcIsActivated ) {
      add_action( 'openid-connect-generic-update-user-using-current-claim', [$this, 'setAdvancedRole'], 10, 2 );
      add_action( 'openid-connect-generic-user-create', [$this, 'setAdvancedRole'], 10, 2 );
      add_action( 'openid-connect-generic-login-button-text', [$this, 'loginButtonText'], 10, 1);
      add_filter ( 'allow_password_reset', function (){return false;} );
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

    // check client roles
    $roleSet = false;
    $clientRoles = [];
    $client_id = $this->client_id();
    if ( isset( $accessToken['resource_access'][$client_id]['roles'] ) ) {
      $clientRoles = $accessToken['resource_access'][$client_id]['roles'];
    }
    $allowedRoles = array_intersect( $this->allowedClientRoles, $clientRoles );
    if ( count( $allowedRoles ) > 0 ) {
      $allowedRoles = array_values( $allowedRoles );
      $user->set_role( $allowedRoles[0] );
      $roleSet = true;
    }

    // check realm roles
    if ( isset( $accessToken['realm_access']['roles'] ) ) {
      if ( in_array('admin-access',  $accessToken['realm_access']['roles']) ){
        $user->set_role( 'administrator' );
        $roleSet = true;
      }
    }

    if ( !$roleSet ) {
      $defaultRole = get_option( 'default_role' );
      if ( $defaultRole ) {
        $user->set_role( $defaultRole );
      }
    }

    // grant/remove prize admin role if user has respective client role
    $isPrizeAdmin = in_array( $this->prizeAdminClientRole, $clientRoles );
    $existingPrizeUser = $this->plugin->users->userRecordExists($user->user_login, $user->user_email);
    if ( $isPrizeAdmin && !$existingPrizeUser){
      // create user as admin
      $this->plugin->users->clearCache();
      $prizeUser = $this->plugin->users->getByUsername( $user->user_login );
      $prizeUser->setWpUser( $user );
      $prizeUser->createFromWpAccount( true );
    } else if ( !$isPrizeAdmin && $existingPrizeUser ) {
      // check if user has prize admin role, and remove it
      if ( $existingPrizeUser->isPrizeAdmin() ) {
        $existingPrizeUser->setPrizeAdmin( false );
      }
    } else if ( $isPrizeAdmin && $existingPrizeUser ) {
      // check if user has prize admin role, and add it
      if ( !$existingPrizeUser->isPrizeAdmin() ) {
        $existingPrizeUser->setPrizeAdmin( true );
      }
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
    if ( defined( 'OIDC_CLIENT_ID' ) && !empty( OIDC_CLIENT_ID ) ) {
      $this->client_id = OIDC_CLIENT_ID;
      return $this->client_id;
    }
    $options = get_option( 'openid_connect_generic_settings', [] );
    $client_id = isset( $options['client_id'] ) ? $options['client_id'] : '';
    $this->client_id = $client_id;
    return $client_id;
  }
}
