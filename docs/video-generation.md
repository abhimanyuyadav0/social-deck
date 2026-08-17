# Video generation — provider research

Status: **not implemented** — research/recommendation only, written before starting the build.

## Goal

Add AI video generation to Social Deck, alongside the existing text (chat completions) and
image (Images API) generation in `aiGenerate.service.js`. The immediate payoff: the YouTube
connector already exists and authorizes fine, but publishing is disabled because YouTube
requires a video file and Social Deck only generates text/image posts today
(`src/services/social-deck/constants.js`, `CONNECTION_TYPES.YOUTUBE` guidance in
`publish.service.js`). Video generation unblocks that.

## Provider options considered

### Claude (Anthropic) — not viable
Claude has no image or video generation capability — it can read/understand images (vision
input) but cannot produce images or video as output. Ruled out.

### Gemini (Google Veo)
Capable video model, but adopting it means a second AI provider next to OpenAI:
- A new per-user API key field and a new "Connect Gemini" card on the Connections page,
  parallel to the existing AI Assistant (OpenAI) card.
- A separate billing account for the user to manage.
- A parallel service module next to `aiConfig.service.js` / `aiGenerate.service.js`, since
  today's AI config is OpenAI-only.

### OpenAI (Sora API) — recommended
Fits the current architecture with no new integration surface:
- Same per-user OpenAI API key already stored in `aiConfig.service.js` — no new connector, no
  new key field, no separate billing account for the user to set up.
- Same request/poll/host pattern already used for images in `generateAndHostImages()`
  (`aiGenerate.service.js`) — generate, poll until ready, upload to Cloudinary via
  `imageUpload.service.js`'s sibling pattern (would need a `uploadSocialDeckVideo*` equivalent).
- Directly unblocks the already-stubbed YouTube publish path.

## Recommendation

Go with OpenAI's Sora API. The deciding factor is architectural fit and reuse, not a raw
quality comparison between Sora and Veo — Social Deck's whole AI layer (text + images) already
assumes "one OpenAI key per user," and Sora keeps that assumption true for video too.

## Open questions to resolve before implementing

- **Access/pricing**: confirm the connected OpenAI account actually has Sora API access
  (tiered rollout) and check per-second/per-clip pricing before exposing it as a user-facing
  toggle that bills their account.
- **Generation latency**: video generation is almost certainly much slower than image
  generation (minutes, not seconds) — needs an async job pattern (poll-and-store, likely
  similar to how `waitForContainerReady()` polls Instagram media containers in
  `instagram.service.js`) rather than a synchronous request inside `generatePostWithAi()`.
  For Auto Run specifically, this likely means the cron tick kicks off generation and a
  *separate* tick publishes once the video is ready, rather than one atomic generate-then-publish
  cycle like today.
- **Hosting**: confirm Cloudinary plan supports video upload/storage at whatever size Sora
  outputs (current Cloudinary usage in `imageUpload.service.js` is images-only).
  Video files are much larger than images — check storage/bandwidth cost impact.
  YouTube might not even need Cloudinary as an intermediate — it may be cheaper/simpler to hand
  the video buffer straight to the YouTube upload API since YouTube is the only outbound target
  discussed so far.
- **Format constraints per platform**: YouTube (Shorts vs regular upload — aspect ratio,
  length), and whether this should later extend to Instagram Reels / LinkedIn video, which
  would mean the same asset needs to satisfy multiple platforms' constraints (resolution,
  duration limits, aspect ratio) — out of scope for a first pass, but worth designing the
  generation prompt/config to not paint us into a YouTube-only corner unnecessarily.
- **UI surface**: where does this show up — a new toggle in Compose/Auto Run next to
  "Include AI images," or is it YouTube-connection-specific since that's the only platform that
  can currently use it?
- **Instagram music**: Instagram's Content Publishing API does not expose their licensed music
  library for programmatic use — picking a track from Instagram's in-app catalog is a manual,
  in-app-only action (licensing restriction). The Reels `audio_name` field is a cosmetic text
  label, not a track selector. If a post needs music, it has to already be mixed into the
  video's own audio track before upload (e.g. burn in a royalty-free/licensed track with ffmpeg
  as a post-processing step after Sora generation) — Instagram just plays whatever audio is
  embedded in the uploaded file.
