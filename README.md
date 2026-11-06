# Capital One Banking Demo

A React banking demo with Amazon Cognito authentication and an AWS API Gateway integration. Users can sign in, create a bank account, view their balance, and submit deposits and withdrawals.

## Features

- Sign up, log in, and log out through Cognito using OpenID Connect.
- Create an account with a full name, date of birth, and starting balance.
- Load an existing account after signing in.
- Deposit or withdraw money and refresh the displayed balance.
- Validate amounts in the browser and send monetary values as integer cents.
- Display account loading and error states, with a retry option.

The interface accepts starting balances from $0 to $1,000,000 and individual deposits or withdrawals from $0.01 to $10,000. The backend is responsible for enforcing transaction rules and authorization.

## Tech stack

- React and Vite
- `react-oidc-context` and `oidc-client-ts`
- Amazon Cognito and AWS API Gateway
- Oxlint
- A bundled Python `psycopg2` dependency layer for AWS Lambda

## Run locally

Prerequisites: Node.js 20.19+ on the 20.x line, or Node.js 22.12 or later, and npm (as required by the installed Vite package).

```bash
git clone https://github.com/lureta/capital-one-demo.git
cd capital-one-demo
npm ci
npm run dev
```

Open the URL printed by Vite. Authentication and account operations require access to the configured AWS services; there is no local mock backend.

## AWS configuration

Configuration currently lives in the source files rather than environment variables:

| File | Configuration |
| --- | --- |
| `src/main.jsx` | Cognito authority, app client ID, OIDC scopes, and sign-in redirect |
| `src/App.jsx` | Cognito hosted login domain, app client ID, and logout redirect |
| `src/bankApi.js` | API Gateway base URL |
| `src/awsAuth.js` | Cognito identity pool credential helper; currently unused by the UI |

To use your own AWS resources, update these values. Register your frontend origin followed by `/` as an allowed Cognito callback URL and sign-out URL. The frontend derives both redirects from `window.location.origin`.

Configure the API to allow requests from your frontend origin, including the `Authorization` and `Content-Type` headers. Account requests send the Cognito ID token as `Authorization: Bearer <id_token>`.

The repository includes the frontend and a packaged database dependency layer. Backend handlers, database schema, and infrastructure provisioning code are not included.

## API integration

All routes below are relative to the base URL in `src/bankApi.js` and return JSON.

| Method | Route | Request body / expected behavior |
| --- | --- | --- |
| `GET` | `/accounts` | Returns an account with `fullName` and `balanceCents`; a `404` prompts account creation |
| `POST` | `/accounts` | `{ fullName, dob, balanceCents }` |
| `POST` | `/deposits` | `{ amountCents, transactionId }` |
| `POST` | `/withdrawals` | `{ amountCents, transactionId }` |

The client generates a UUID for each deposit or withdrawal request. Successful transaction responses are expected to contain a `message`; error responses can contain `error` or `message`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Generate the production frontend in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |

## Project layout

```text
src/
  App.jsx          Account forms, balance display, and transaction flows
  main.jsx         React entry point and Cognito authentication provider
  bankApi.js       Authenticated account API requests
  awsAuth.js       Cognito identity pool credential helper
  App.css          Banking interface styles
  index.css        Global styles
  assets/          Images and SVG assets
public/            Static assets
aurora-layer/      Python psycopg2 dependency layer
aurora-layer.zip   Packaged dependency layer
```

## Build and deployment

Run `npm run build` and deploy the generated `dist/` directory to your static hosting service. Register the deployed origin in Cognito and allow it in the API's CORS configuration. The AWS services must be provisioned separately.
