import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * Cloud Function: Auto-enforce ride joining
 * - Ensures a user can only be in one active ride at a time
 */
export const enforceSingleRide = functions.firestore
	.document("rides/{rideId}")
	.onUpdate(async (change, context) => {
		const after = change.after.data();
		const before = change.before.data();

		// if passengers didn't change, exit
		if (JSON.stringify(after.passengers) === JSON.stringify(before.passengers)) {
			return null;
		}

		const newPassengers = after.passengers || [];
		const addedPassengers = newPassengers.filter(
			(p) => !(before.passengers || []).includes(p)
		);

		for (const uid of addedPassengers) {
			// Query if user is already in another active ride
			const activeRides = await db
				.collection("rides")
				.where("passengers", "array-contains", uid)
				.where("status", "==", "upcoming")
				.get();

			if (activeRides.size > 1) {
				// Rollback: remove user from this new ride
				await change.after.ref.update({
					passengers: admin.firestore.FieldValue.arrayRemove(uid),
				});
				console.log(`Auto-removed ${uid} from ${context.params.rideId} (already in another ride)`);
			}
		}
		return null;
	});
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
