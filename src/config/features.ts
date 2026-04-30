// Central feature flags. Flip to true to re-enable.
export const FEATURES = {
  jamb: false,        // JAMB track paused — focus on University + School
  marketingSite: true, // Show new University-first landing for signed-out users
  school: true,       // School Management System
} as const;
