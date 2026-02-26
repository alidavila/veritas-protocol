<?php
/**
 * Plugin Name: Veritas Gatekeeper Connector
 * Plugin URI: https://veritas-protocol-app.vercel.app
 * Description: Protects your WordPress site against AI bots and scrapers. Universal integration for Veritas Protocol.
 * Version: 2.0.0
 * Author: Veritas Protocol
 * Author URI: https://veritas-protocol-app.vercel.app
 * License: GPL2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Settings Page
 */
add_action( 'admin_menu', 'veritas_gk_add_admin_menu' );
add_action( 'admin_init', 'veritas_gk_settings_init' );

function veritas_gk_add_admin_menu() {
	add_options_page( 'Veritas Gatekeeper', 'Veritas Gatekeeper', 'manage_options', 'veritas_gatekeeper', 'veritas_gk_options_page' );
}

function veritas_gk_settings_init() {
	register_setting( 'veritas_gk_options', 'veritas_gk_settings' );

	add_settings_section(
		'veritas_gk_section',
		__( 'Configuración del Nodo Gatekeeper', 'veritas' ),
		'veritas_gk_settings_section_callback',
		'veritas_gk_options'
	);

	add_settings_field(
		'veritas_id',
		__( 'Veritas Client ID', 'veritas' ),
		'veritas_gk_id_render',
		'veritas_gk_options',
		'veritas_gk_section'
	);

	add_settings_field(
		'veritas_wallet',
		__( 'Wallet para Cobros (x402)', 'veritas' ),
		'veritas_gk_wallet_render',
		'veritas_gk_options',
		'veritas_gk_section'
	);
}

function veritas_gk_id_render() {
	$options = get_option( 'veritas_gk_settings' );
	?>
	<input type='text' name='veritas_gk_settings[veritas_id]' value='<?php echo esc_attr( $options['veritas_id'] ); ?>' class="regular-text" placeholder="client-00x">
	<p class="description">Obtén esto en tu Dashboard de Veritas</p>
	<?php
}

function veritas_gk_wallet_render() {
	$options = get_option( 'veritas_gk_settings' );
	?>
	<input type='text' name='veritas_gk_settings[veritas_wallet]' value='<?php echo esc_attr( $options['veritas_wallet'] ); ?>' class="regular-text" placeholder="0x...">
	<p class="description">Dirección donde recibirás los pagos de las IAs</p>
	<?php
}

function veritas_gk_settings_section_callback() {
	echo __( 'Ingresa tus credenciales para activar la protección.', 'veritas' );
}

function veritas_gk_options_page() {
	?>
	<form action='options.php' method='post'>
		<h2>Veritas Gatekeeper</h2>
		<?php
		settings_fields( 'veritas_gk_options' );
		do_settings_sections( 'veritas_gk_options' );
		submit_button();
		?>
	</form>
	<?php
}

/**
 * Inject Script in Front-end
 */
add_action( 'wp_head', 'veritas_gk_inject_script' );

function veritas_gk_inject_script() {
	$options = get_option( 'veritas_gk_settings' );
	$id = !empty($options['veritas_id']) ? $options['veritas_id'] : 'public-node';
	$wallet = !empty($options['veritas_wallet']) ? $options['veritas_wallet'] : '0x4d2B70d358C5DA9c4fC6e8Ce743Ed67d55C19099';
	
	echo "\n<!-- Veritas Gatekeeper Protection -->\n";
	echo "<script src=\"https://veritas-protocol-app.vercel.app/gatekeeper.js\"\n";
	echo "  data-veritas-id=\"" . esc_attr($id) . "\"\n";
	echo "  data-wallet=\"" . esc_attr($wallet) . "\"\n";
	echo "  data-rate=\"0.002\"></script>\n";
}
