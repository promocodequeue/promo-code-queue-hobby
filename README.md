# Promo Code Queue

A simple static web app for distributing promo codes, powered by a Cloudflare Worker and KV for true one-time code assignment.

---

## Features

- Each visitor gets a unique promo code (globally)
- Modern, responsive design with Tailwind CSS
- Atomic queue operations ensure no duplicate codes
- Built on Cloudflare's free tier

---

## How It Works

- The static site calls a Cloudflare Worker endpoint
- The Worker atomically pops a code from a queue in Cloudflare KV and returns it
- When codes run out, users get an error message
- Each code can only be used once globally

---

## Quick Start

### Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/):
  ```sh
  npm install -g wrangler
  # or
  pnpm add -g wrangler
  # or
  yarn global add wrangler
  ```

### Deployment Summary

1. **Backend**: Deploy Worker from `worker/` directory
2. **Frontend**: Deploy website from `website/` directory  
3. **Connect**: Update Worker URL in `website/index.html`

### 1. Clone This Repo

```sh
git clone https://github.com/promocodequeue/promo-code-queue-hobby.git
cd promo-code-queue-hobby
```

This project has two main components:
- `website/` - Static frontend files
- `worker/` - Cloudflare Worker backend
  - `wrangler-template.toml` - Template configuration file (copy to `wrangler.toml` and add your IDs)

### 2. Authenticate with Cloudflare

```sh
wrangler login
```

### 3. Get Your Account ID

```sh
wrangler whoami
```

### 4. Set Up Configuration

Copy the template file and update it with your IDs:

```sh
cp worker/wrangler-template.toml worker/wrangler.toml
```

Edit `worker/wrangler.toml` and replace:
- `<your-account-id>` with your actual Cloudflare account ID
- `<your-kv-namespace-id>` with your KV namespace ID (you'll get this in the next step)

### 5. Create KV Namespace

```sh
wrangler kv namespace create PROMO_CODES
```

This will output a namespace ID. Update the `id` field in the `[[kv_namespaces]]` section of `worker/wrangler.toml` with this namespace ID.

### 6. Add Your Promo Codes

```sh
wrangler kv key put --binding=PROMO_CODES --remote codes '["CODE1","CODE2","CODE3","CODE4","CODE5"]'
```

Replace with your actual promo codes.

### 7. Deploy the Worker

```sh
cd worker
wrangler deploy
```

Note the URL of your deployed Worker (e.g., `https://your-worker-name.your-subdomain.workers.dev`)

### 8. Update the Frontend

In `website/index.html`, update the `WORKER_ENDPOINT` constant with your Worker URL:

```js
const WORKER_ENDPOINT = 'https://your-worker-name.your-subdomain.workers.dev/get-code';
```

### 9. Test Locally

```sh
cd website
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser.

### 10. Deploy the Static Site

#### Option A: Deploy via Wrangler CLI (Recommended)

```sh
# Deploy from the website directory
cd website
wrangler pages deploy . --project-name=promo-code-queue
```

Your site will be available at `https://your-project-name.pages.dev`

**Example URLs:**
- Website: `https://promo-code-queue.pages.dev`
- Worker API: `https://promo-code-queue-worker.your-subdomain.workers.dev/get-code`

#### Option B: Deploy via Cloudflare Dashboard

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Pages
2. Click "Create a project" → "Connect to Git"
3. Select your repository
4. Configure:
   - **Project name**: `promo-code-queue`
   - **Production branch**: `main`
   - **Framework preset**: `None`
   - **Build output directory**: `website`
5. Click "Save and Deploy"

#### Option C: Other Static Hosts

Deploy the `website/` folder to any static hosting service:
- GitHub Pages
- Netlify
- Vercel

---

## API Endpoint

**POST** `/get-code`

Returns a JSON response:
```json
{
  "code": "PROMOCODE123"
}
```

Or when no codes are left:
```json
{
  "error": "No codes left"
}
```

---

## Adding More Codes

To add more promo codes to the queue:

```sh
wrangler kv key put --binding=PROMO_CODES --remote codes '["NEWCODE1","NEWCODE2","NEWCODE3"]'
```

---

## Troubleshooting

### Common Issues

**Worker deployment fails:**
- Ensure you're authenticated: `wrangler login`
- Check your account ID in `wrangler.toml`
- Verify KV namespace ID is correct

**No codes returned:**
- Check if codes exist: `wrangler kv key get --binding=PROMO_CODES codes`
- Add more codes using the command in "Adding More Codes" section

**CORS errors:**
- Ensure your Worker URL is correct in `website/index.html`
- Check that the Worker is deployed and accessible

**Frontend not connecting to Worker:**
- Verify the `WORKER_ENDPOINT` URL in `website/index.html`
- Test the Worker endpoint directly: `curl -X POST https://your-worker-url/get-code`

---

## License

MIT — free to use, modify, and share.
