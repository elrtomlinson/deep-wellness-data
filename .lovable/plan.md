## Social Energy Tracking — Implementation Plan

### Phase 1: Data Model & Manual Logging
1. **Types** — Add `SocialEvent` interface with: type (social/work/medical/alone), groupSize, duration, location (home/out), preEnergy, postEnergy, recoveryMinutes, notes
2. **Add `socialEvents` to `DailyLog`** and `socialBattery` (0-100) field
3. **SocialEnergyTracker component** — Manual event logger with type tags, group size picker, duration, location toggle, pre/post energy sliders, recovery time
4. **Social Battery widget** — Visual battery indicator that depletes based on logged social events

### Phase 2: Correlation Integration
5. **Add social variables to correlation engine** — socialBattery, event count, total social duration, avg group size as correlation variables
6. **Timeline display** — Show social events inline on daily log entries

### Phase 3: Google Calendar Sync
7. **This requires Lovable Cloud** — We'll need an edge function to handle Google Calendar OAuth and event fetching. I'll build the UI and data flow first, then set up the calendar integration.

**Note**: Google Calendar isn't available as a built-in connector, so we'll need to set up OAuth manually via Lovable Cloud with a Google Cloud project. I'll handle the manual tracking first, then walk you through the calendar setup.

Shall I proceed?