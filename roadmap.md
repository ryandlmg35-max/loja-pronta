# Tasks
- [ ] Fix endless payment checking with bounded requests, automatic recovery and visible retry; verify with a real paid order and delayed/failed responses.
- [x] Replace new BunnyPay checkouts with Mercado Pago PIX using email, preserving server-confirmed private access and old orders.
- [x] Verify payment generation, confirmation safeguards, and desktop/mobile checkout without publishing.
- [ ] Confirm automatic private-link delivery after an actual approved Mercado Pago payment — requires a real paid purchase.
- [x] Add a separate Mercado Pago preview test with email only; keep BunnyPay unchanged and do not publish.
- [x] Verify the test form, validation, and existing payment tests.