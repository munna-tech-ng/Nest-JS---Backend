# Firebase Admin SDK Setup Guide

This guide explains how to obtain Firebase Admin SDK credentials for server-side authentication.

## Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one if you don't have one)

## Step 2: Generate Service Account Key

### Method 1: Download Service Account JSON File (Recommended)

1. In Firebase Console, click on the **Settings/gear icon** (⚙️) next to "Project Overview"
2. Select **Project settings**
3. Go to the **Service accounts** tab
4. Click **Generate new private key** button
5. A JSON file will be downloaded (e.g., `your-project-firebase-adminsdk-xxxxx.json`)
6. **Important**: Keep this file secure and never commit it to version control

### Method 2: Get Individual Credentials from Service Account JSON

If you already have the service account JSON file, you can extract the following values:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",           // → FIREBASE_PROJECT_ID
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",  // → FIREBASE_PRIVATE_KEY
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",  // → FIREBASE_CLIENT_EMAIL
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## Step 3: Configure Environment Variables

Add one of the following configurations to your `.env` file:

### Option A: Using Service Account File Path (Recommended for Development)

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/your-project-firebase-adminsdk-xxxxx.json
```

**Note**: Place the JSON file in a secure location outside your project root or in a `.secrets` folder that's gitignored.

### Option B: Using Service Account JSON String (Good for Production/CI)

```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",...}
```

**Note**: The entire JSON must be on a single line. Escape quotes properly.

### Option C: Using Individual Credentials (Alternative)

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**Note**: 
- The `FIREBASE_PRIVATE_KEY` must include the `\n` characters (newlines) as shown
- Keep the quotes around the private key value
- In some systems, you may need to use actual newlines instead of `\n`

## Step 4: Verify Setup

After configuring, restart your NestJS application. The `FirebaseAdminService` will initialize on module startup.

If initialization fails, check:
1. File path is correct (if using Option A)
2. JSON is valid (if using Option B)
3. All three credentials are provided (if using Option C)
4. Service account has proper permissions

## Security Best Practices

1. **Never commit** service account JSON files to Git
2. Add to `.gitignore`:
   ```
   *.json
   firebase-adminsdk-*.json
   .secrets/
   ```
3. Use environment variables in production
4. Restrict service account permissions to minimum required
5. Rotate keys periodically

## Troubleshooting

### Error: "Firebase Admin SDK configuration missing"
- Check that at least one configuration method is provided in `.env`
- Verify environment variables are loaded correctly

### Error: "Invalid Firebase ID token"
- Ensure the client is sending a valid Firebase ID token
- Check that Firebase Authentication is enabled in your Firebase project
- Verify the token hasn't expired

### Error: "Failed to initialize Firebase Admin SDK"
- Check file permissions if using file path
- Verify JSON syntax if using JSON string
- Ensure private key format is correct (includes `\n` for newlines)

