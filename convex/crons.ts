import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval(
  'expire links',
  { minutes: 30 }, // runs every 30 minutes
  internal.links.expireLinks,
);

export default crons;