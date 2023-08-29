<?php
/**
 * Plugin Name: UC Davis Library OIDC Customizations
 * Description: Modifications to openid-connect-generic plugin to support our Keycloak instance
 * Author: UC Davis Library Online Strategy
 */

class UcdlibOidc {
  public function __construct(){

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

    // If set to true, wp role will be set to
    // - the first matching role in the allowedClientRoles array.
    // - administrator if the user has the admin-access realm role.
    $this->setRoleFromClaim = true;

    $this->oidcIsActivated = in_array('openid-connect-generic/openid-connect-generic.php', apply_filters('active_plugins', get_option('active_plugins')));
    if ( $this->oidcIsActivated ) {
      add_action( 'openid-connect-generic-update-user-using-current-claim', [$this, 'setAdvancedRole'], 10, 2 );
      add_action( 'openid-connect-generic-user-create', [$this, 'setAdvancedRole'], 10, 2 );
      add_action( 'openid-connect-generic-login-button-text', [$this, 'loginButtonText'], 10, 1);
      add_filter ( 'allow_password_reset', function (){return false;} );
      add_filter('openid-connect-generic-user-login-test', [$this, 'authorizeUser'], 10, 2);
      add_filter('openid-connect-generic-user-creation-test', [$this, 'authorizeUser'], 10, 2);
    }

  }

  /**
   * @description Authorize a user to view site based on their keycloak roles
   * @param $authorize boolean
   * @param $user_claim array - This is either the user id endpoint response or the id token. Depending on if the OIDC_ENDPOINT_USERINFO_URL env var is set.
   */
  public function authorizeUser( $authorize, $user_claim ){
    $authorize = false;

    // check realm roles
    if ( isset( $user_claim['realm_access']['roles'] ) ) {
      $intersect = array_intersect( $this->allowedRealmRoles, $user_claim['realm_access']['roles'] );
      if ( count( $intersect ) > 0 ) {
        return true;
      }
    }

    // check client roles
    $client_id = $this->client_id();
    if ( !$client_id ) return $authorize;
    if ( !isset( $user_claim['resource_access'][$client_id]['roles'] ) ) return $authorize;
    $clientRoles = $user_claim['resource_access'][$client_id]['roles'];
    $intersect = array_intersect( $this->allowedClientRoles, $clientRoles );
    if ( count( $intersect ) > 0 ) {
      return true;
    }
    return $authorize;
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

new UcdlibOidc();
