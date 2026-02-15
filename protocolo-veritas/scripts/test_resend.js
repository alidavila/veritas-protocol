/**
 * TEST RESEND — Connection Validator
 * 
 * Usage: node scripts/test_resend.js
 */
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const key = process.env.RESEND_API_KEY;

async function test() {
    if (!key || key === 're_...' || key === '') {
        console.error('❌ ERROR: Missing RESEND_API_KEY in .env file.');
        process.exit(1);
    }

    const resend = new Resend(key);
    console.log('⏳ Testing Resend connection...');

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'delivered@resend.dev',
            subject: 'Veritas Resend Test',
            html: '<p>Resend is working correctly for Veritas.</p>'
        });

        if (error) throw error;
        console.log('✅ SUCCESS: Connection established. Email ID:', data.id);
    } catch (e) {
        console.error('❌ FAILED:', e.message);
    }
}

test();
