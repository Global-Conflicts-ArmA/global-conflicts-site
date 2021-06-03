import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import * as Sentry from "@sentry/angular";
import { Integrations } from "@sentry/tracing";


if (environment.production) {
	enableProdMode();
}

Sentry.init({
	dsn: "https://6d793abce48248c8ba67927a9da0654d@o614507.ingest.sentry.io/5749688",
	integrations: [
		new Integrations.BrowserTracing({

			routingInstrumentation: Sentry.routingInstrumentation,
		}),
	],

	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for performance monitoring.
	// We recommend adjusting this value in production
	tracesSampleRate: 1.0,
});


platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch((err) => console.log(err));
