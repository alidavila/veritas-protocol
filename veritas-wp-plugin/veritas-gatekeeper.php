<?php
/**
 * Plugin Name: Veritas Gatekeeper
 * Description: Bloquea bots de IA no autorizados y cobra micro-pagos (X402) por acceso a tu contenido. Protege tu propiedad intelectual.
 * Version: 2.0.0
 * Author: Veritas Protocol (PulsoConnect LLC)
 * Author URI: https://veritas.protocol
 * License: GPL v2 or later
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ============================================================
// CONSTANTS
// ============================================================
define('VERITAS_VERSION', '2.0.0');
define('VERITAS_AI_AGENTS', array(
    'GPTBot',
    'ChatGPT-User',
    'anthropic-ai',
    'Claude-Web',
    'CCBot',
    'Google-Extended',
    'Bytespider',
    'PerplexityBot',
    'Applebot-Extended',
    'FacebookBot',
    'Amazonbot',
    'cohere-ai',
    'Diffbot',
    'Omgilibot',
    'YouBot'
));

// ============================================================
// SETTINGS PAGE
// ============================================================
add_action('admin_menu', 'veritas_menu');

function veritas_menu() {
    add_options_page(
        'Veritas Gatekeeper',
        '🛡️ Veritas Gatekeeper',
        'manage_options',
        'veritas-settings',
        'veritas_settings_page'
    );
}

function veritas_settings_page() {
    // Save settings
    if (isset($_POST['veritas_save']) && check_admin_referer('veritas_settings_nonce')) {
        update_option('veritas_wallet', sanitize_text_field($_POST['veritas_wallet']));
        update_option('veritas_price', sanitize_text_field($_POST['veritas_price']));
        update_option('veritas_gateway_url', esc_url_raw($_POST['veritas_gateway_url']));
        update_option('veritas_mode', sanitize_text_field($_POST['veritas_mode']));
        echo '<div class="updated"><p>✅ Configuración guardada.</p></div>';
    }

    $wallet = get_option('veritas_wallet', '');
    $price = get_option('veritas_price', '0.002');
    $gateway = get_option('veritas_gateway_url', '');
    $mode = get_option('veritas_mode', 'block');
    $stats = get_option('veritas_stats', array('blocked' => 0, 'paid' => 0, 'total_revenue' => 0));
    ?>
    <div class="wrap">
        <h1>🛡️ Veritas Gatekeeper v<?php echo VERITAS_VERSION; ?></h1>
        <p>Convierte a los Agentes de IA en tus clientes. Cobra micropagos por cada visita.</p>

        <!-- STATS -->
        <div style="display:flex; gap:20px; margin:20px 0;">
            <div style="background:#f0f0f1; padding:15px 25px; border-radius:8px; text-align:center;">
                <strong style="font-size:24px; color:#d63638;">🚫 <?php echo number_format($stats['blocked']); ?></strong>
                <p style="margin:5px 0 0; color:#666;">Bots Bloqueados</p>
            </div>
            <div style="background:#f0f0f1; padding:15px 25px; border-radius:8px; text-align:center;">
                <strong style="font-size:24px; color:#00a32a;">💰 <?php echo number_format($stats['paid']); ?></strong>
                <p style="margin:5px 0 0; color:#666;">Pagos Recibidos</p>
            </div>
            <div style="background:#f0f0f1; padding:15px 25px; border-radius:8px; text-align:center;">
                <strong style="font-size:24px; color:#2271b1;">$<?php echo number_format($stats['total_revenue'], 4); ?></strong>
                <p style="margin:5px 0 0; color:#666;">Revenue Total</p>
            </div>
        </div>

        <form method="post">
            <?php wp_nonce_field('veritas_settings_nonce'); ?>
            <table class="form-table">
                <tr>
                    <th><label>Tu Wallet (0x...)</label></th>
                    <td>
                        <input type="text" name="veritas_wallet" value="<?php echo esc_attr($wallet); ?>" class="regular-text" placeholder="0x4d2B70d358C5DA9c4fC6e8Ce743Ed67d55C19099">
                        <p class="description">Tu wallet de Base Sepolia para recibir pagos.</p>
                    </td>
                </tr>
                <tr>
                    <th><label>Precio por Visita (USD)</label></th>
                    <td>
                        <input type="text" name="veritas_price" value="<?php echo esc_attr($price); ?>" class="small-text">
                        <p class="description">Micro-pago que cobra a cada agente IA.</p>
                    </td>
                </tr>
                <tr>
                    <th><label>URL del Gateway X402</label></th>
                    <td>
                        <input type="url" name="veritas_gateway_url" value="<?php echo esc_attr($gateway); ?>" class="regular-text" placeholder="https://your-gateway.vercel.app/api/verify">
                        <p class="description">Endpoint donde se verifican los pagos. Deja vacío para funcionar sin verificación.</p>
                    </td>
                </tr>
                <tr>
                    <th><label>Modo</label></th>
                    <td>
                        <select name="veritas_mode">
                            <option value="block" <?php selected($mode, 'block'); ?>>🚫 Bloquear — Niega acceso a IAs que no paguen</option>
                            <option value="monitor" <?php selected($mode, 'monitor'); ?>>👁️ Monitor — Solo cuenta visitas sin bloquear</option>
                            <option value="paywall" <?php selected($mode, 'paywall'); ?>>💰 Paywall — Muestra paywall con instrucciones de pago</option>
                        </select>
                    </td>
                </tr>
            </table>
            <p class="submit">
                <input type="submit" name="veritas_save" class="button button-primary" value="Guardar Configuración">
            </p>
        </form>

        <hr>
        <h3>📋 Agentes IA Monitoreados</h3>
        <p class="description">El Gatekeeper detecta estos User-Agents automáticamente:</p>
        <code style="display:block; padding:10px; background:#f0f0f1; border-radius:4px;">
            <?php echo implode(', ', VERITAS_AI_AGENTS); ?>
        </code>
    </div>
    <?php
}

// ============================================================
// THE GATEKEEPER — Server-side detection (PHP, no JS dependency)
// ============================================================
add_action('init', 'veritas_gatekeeper_check', 1);

function veritas_gatekeeper_check() {
    // Skip admin pages and logged-in users
    if (is_admin() || is_user_logged_in()) return;

    $wallet = get_option('veritas_wallet');
    if (empty($wallet)) return;

    $mode = get_option('veritas_mode', 'block');
    $price = get_option('veritas_price', '0.002');
    $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';

    // Detect AI agent
    $is_ai = false;
    $detected_agent = '';
    foreach (VERITAS_AI_AGENTS as $agent) {
        if (stripos($user_agent, $agent) !== false) {
            $is_ai = true;
            $detected_agent = $agent;
            break;
        }
    }

    if (!$is_ai) return;

    // Update stats
    $stats = get_option('veritas_stats', array('blocked' => 0, 'paid' => 0, 'total_revenue' => 0));

    // Check for payment header (X402 protocol)
    $payment_token = isset($_SERVER['HTTP_X_VERITAS_PAYMENT']) ? $_SERVER['HTTP_X_VERITAS_PAYMENT'] : '';

    if (!empty($payment_token)) {
        // Verify payment against gateway
        $gateway_url = get_option('veritas_gateway_url');
        if (!empty($gateway_url)) {
            $response = wp_remote_post($gateway_url, array(
                'body' => json_encode(array(
                    'token' => $payment_token,
                    'wallet' => $wallet,
                    'amount' => $price
                )),
                'headers' => array('Content-Type' => 'application/json'),
                'timeout' => 5
            ));

            if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
                $stats['paid']++;
                $stats['total_revenue'] += floatval($price);
                update_option('veritas_stats', $stats);
                return; // Payment verified, allow access
            }
        }
    }

    // No valid payment — take action based on mode
    $stats['blocked']++;
    update_option('veritas_stats', $stats);

    if ($mode === 'monitor') {
        // Just count, don't block
        return;
    }

    if ($mode === 'paywall') {
        // Return 402 Payment Required with instructions
        status_header(402);
        header('Content-Type: application/json');
        header('X-Veritas-Protocol: x402');
        header('X-Veritas-Price: ' . $price);
        header('X-Veritas-Wallet: ' . $wallet);
        echo json_encode(array(
            'error' => 'Payment Required',
            'protocol' => 'veritas-x402',
            'version' => VERITAS_VERSION,
            'price_usd' => $price,
            'wallet' => $wallet,
            'network' => 'base-sepolia',
            'instructions' => 'Send payment and include the transaction hash in the X-Veritas-Payment header.',
            'info' => 'https://veritas.protocol/docs/x402'
        ));
        exit;
    }

    // Default: block
    status_header(403);
    header('Content-Type: application/json');
    echo json_encode(array(
        'error' => 'Access Denied',
        'message' => 'This content is protected by Veritas Gatekeeper. AI agents must pay to access.',
        'agent_detected' => $detected_agent,
        'solution' => 'Install Veritas Wallet and include X-Veritas-Payment header.'
    ));
    exit;
}

// ============================================================
// META TAGS — Expose pricing info for compliant agents
// ============================================================
add_action('wp_head', 'veritas_inject_meta');

function veritas_inject_meta() {
    $wallet = get_option('veritas_wallet');
    if (empty($wallet)) return;

    $price = get_option('veritas_price', '0.002');
    echo "\n<!-- Veritas Gatekeeper v" . VERITAS_VERSION . " -->\n";
    echo "<meta name='veritas-protocol' content='x402'>\n";
    echo "<meta name='veritas-price' content='" . esc_attr($price) . "'>\n";
    echo "<meta name='veritas-wallet' content='" . esc_attr($wallet) . "'>\n";
    echo "<meta name='veritas-network' content='base-sepolia'>\n";
}
