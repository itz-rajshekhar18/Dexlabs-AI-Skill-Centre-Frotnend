# Dexlabs AI Skill Centre

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Razorpay payment API

The Admission page uses the Go API in `backend/` to create Razorpay orders and verify checkout signatures. Razorpay secrets stay server-side; only the public key ID is returned to the browser.

1. Copy `backend/.env.example` to `backend/.env` (or set the same variables in your shell) and fill in your Razorpay Test or Live credentials.
2. Start the API from PowerShell:

   ```powershell
   cd backend
   $env:RAZORPAY_KEY_ID="rzp_test_..."
   $env:RAZORPAY_KEY_SECRET="..."
   $env:FRONTEND_ORIGIN="http://localhost:4200"
   go run .
   ```

3. Start the Angular app in a second terminal with `npm start`, then open the Admission page and submit the payment form.

The API exposes `GET /api/health`, `POST /api/payments/orders` (the current admission checkout is server-locked to 100000 paise), and `POST /api/payments/verify`. Use HTTPS, a restricted `FRONTEND_ORIGIN`, and Live credentials only in a production deployment.

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
