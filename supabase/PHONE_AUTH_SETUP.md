# Supabase Phone Authentication Setup Guide

## Step 1: Enable Phone Auth in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Phone** and toggle it **ON**

## Step 2: Configure SMS Provider (Twilio)

### Option A: Use Twilio (Recommended for Production)

1. **Create Twilio Account**
   - Go to [twilio.com](https://www.twilio.com)
   - Sign up for an account
   - Verify your email and phone

2. **Get Twilio Credentials**
   - In Twilio Console, find:
     - Account SID
     - Auth Token
     - Phone Number (purchase one if needed)

3. **Configure in Supabase**
   - In Supabase Dashboard → Authentication → Providers → Phone
   - Select "Twilio" as provider
   - Enter:
     - Twilio Account SID
     - Twilio Auth Token
     - Twilio Phone Number (with country code, e.g., +60123456789)
   - Click **Save**

### Option B: Use Supabase Test Numbers (Development Only)

For testing without SMS costs:

1. In Supabase Dashboard → Authentication → Providers → Phone
2. Scroll to "Test Phone Numbers"
3. Add test numbers like:
   - Phone: `+60123456789`
   - OTP: `123456`
4. These numbers will always accept the specified OTP

## Step 3: Update Phone Auth Settings

In Supabase Dashboard → Authentication → Providers → Phone:

1. **OTP Expiry**: Set to 60 seconds (default)
2. **OTP Length**: Set to 6 digits (default)
3. **Template**: Customize SMS message (optional)
   ```
   Your SP Fresh Chicken verification code is: {{ .Token }}
   ```

## Step 4: Test the Integration

1. Restart your Next.js dev server
2. Go to `/login`
3. Click "Phone" tab
4. Enter a phone number (without leading 0)
5. Click "Send OTP"
6. Check your phone for the code
7. Enter the 6-digit code
8. Click "Verify & Login"

## Troubleshooting

### "Invalid phone number format"
- Ensure number starts with country code (+60 for Malaysia)
- Remove any spaces or dashes
- Example: `+60123456789` not `012-345 6789`

### "SMS not received"
- Check Twilio account balance
- Verify phone number is correct
- Check spam/blocked messages
- Try using test numbers for development

### "OTP verification failed"
- OTP expires after 60 seconds
- Use "Resend OTP" to get a new code
- Ensure you're entering the latest code

## Cost Estimation (Twilio)

- **SMS Cost**: ~$0.0075 per message (Malaysia)
- **Monthly Base**: ~$15 for phone number rental
- **100 logins/month**: ~$15.75 total
- **1000 logins/month**: ~$22.50 total

## Security Best Practices

1. **Rate Limiting**: Supabase automatically limits OTP requests
2. **Phone Verification**: Only verified phones can login
3. **Session Management**: Sessions expire after inactivity
4. **Profile Privacy**: Phone numbers stored securely in profiles table

## Next Steps

After setup:
- Test with real phone numbers
- Monitor Twilio usage in dashboard
- Set up billing alerts
- Consider adding phone number verification for email accounts
