# Video series scheduler (upload → auto-cut → serialized posting → auto-delete)

Status: **not implemented** — feasibility notes only.

## Goal

User uploads one video. Social Deck:
1. Cuts it into fixed-length segments (e.g. 30s each).
2. Schedules each segment to post one-by-one, in order, on an interval (a "Part 1, Part 2, …"
   serialized release — not recurring AI content like Auto Run).
3. Once the last part has posted, automatically deletes every part it posted from the
   platform(s).

This is a distinct feature from [video-generation.md](video-generation.md) — no AI involved,
the video is user-supplied. Feasible, but it's four separable pieces of work, each with its own
open questions.

## Building blocks

### 1. Video upload — new capability
Social Deck has no file-upload pipeline today (unlike Community, which already has
`useUploadMultipleFiles` / multer + Cloudinary, max 10 files). Would need an equivalent
video-upload endpoint here — larger size limits, video-specific Cloudinary config.

### 2. Splitting into segments — ffmpeg
master-backend is a persistent Express server (not serverless), so shelling out to ffmpeg as a
child process is viable — would need `ffmpeg-static` (or a system ffmpeg install) plus a temp
working directory for the cut files before they're uploaded to Cloudinary and the local temp
files cleaned up. 30s is a safe universal chunk length — under Instagram Reels' and YouTube
Shorts' duration ceilings, so the same cut works for both without per-platform re-splitting.

### 3. Sequential scheduling — a new concept, not Auto Run
Auto Run's model (`socialDeckAutoRun.model.js`) is built around a recurring AI context that
generates fresh content forever on an interval. A video series is the opposite shape: a fixed,
ordered list of N pre-cut clips, each posted once, on a schedule, then the series *terminates*.
Reuses the node-cron tick pattern (`processDueAutoRuns`-style polling) but needs its own model
— something like `SocialDeckVideoSeries { parts: [{ videoUrl, order, postedAt, externalId,
connectionId }], intervalMinutes, status }` — with a "next unposted part is due" check instead
of Auto Run's "always due again after intervalHours."

### 4. Auto-delete on completion — feasible per platform
Every platform in use already supports deleting content the API published:
- Instagram Graph API: `DELETE /{media-id}`.
- YouTube Data API: `videos.delete`.
- LinkedIn: delete on `/ugcPosts/{id}`.
- Community: internal delete already exists.

Each part's `externalId` is already captured in the existing publish flow
(`results[].externalId` in `publish.service.js`) — the series model just needs to retain those
IDs per part so the cleanup step has something to call delete on.

## Open questions before building

- **Delete trigger**: immediately after the last part posts, after a fixed delay (e.g. "keep
  the full set live for 24h then wipe"), or only after explicit user confirmation? Auto-deleting
  live posts on a connected platform is irreversible and affects a shared/external system —
  worth requiring an explicit confirm step (same pattern already used for the Disconnect
  confirmation modals) rather than a silent automatic wipe, at least for a first version.
- **Partial-series failure**: if part 3 of 6 fails to post (rate limit, expired token), does the
  series retry, skip and continue, or pause the whole sequence? And if it's later deleted, does
  "delete all" mean only the parts that succeeded?
- **Per-platform video specs**: Instagram Reels wants vertical (9:16); YouTube accepts more
  aspect ratios but Shorts specifically wants vertical too. If the uploaded source video isn't
  already vertical, does cutting also mean cropping/padding, or is that out of scope for v1
  (require the user to upload a video that's already the right shape)?
- **Storage cost**: N segments × video file size on Cloudinary, on top of whatever the
  video-generation feature (if built) also stores — same underlying cost question raised in
  video-generation.md, compounded here since a single upload produces multiple stored assets.
- **UI**: a new page/flow (upload once, preview the cut segments, set interval, confirm) rather
  than fitting into Compose or Auto Run's existing UI, since the mental model (one-time
  serialized release with a defined end) doesn't match either of those.
