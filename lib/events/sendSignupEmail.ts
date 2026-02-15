import "server-only";
import EventEmitter from "node:events";

export type SignupPayload = { id?: string; email: string; name?: string | null };

// Module-scoped emitter: listeners register once at import time
const signupEmitter = new EventEmitter();

console.log("THIS SHIT WORK???")

// Keep a console.log here for local/dev visibility — replace with real mailer later
signupEmitter.on("signup-success", (payload?: SignupPayload) => {
  console.log("CALLED signup-success listener for:", payload?.email ?? "(no email)");
  // TODO: integrate mailer here (e.g. sendGrid/SES)
});

// Emit helper — call from server routes after successful signup
export function emitSignupSuccess(payload: SignupPayload) {
  signupEmitter.emit("signup-success", payload);
}

// Optional helpers for tests/other subscribers
export function onSignupSuccess(fn: (p: SignupPayload) => void) {
  signupEmitter.on("signup-success", fn);
}

export function offSignupSuccess(fn: (p: SignupPayload) => void) {
  signupEmitter.off("signup-success", fn);
} 
