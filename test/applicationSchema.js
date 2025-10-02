// applicationSchema.js:

"use strict";

const applicationSchema = {
  http_port: { type: "integer", required: true, min: 1000, max: 6500 },
  db_url: { type: "string", required: true, max: 255 },
  log_table_name: { type: "string", required: true, max: 255 },
  log_expiration_days: { type: "integer", required: true, min: 1, max: 365 },
  log_max_rows: { type: "integer", required: true },
  rate_limit_minutes: { type: "integer", required: true, min: 1 },
  rate_limit_requests: { type: "integer", requirred: true, min: 1 },
  body_limit: { type: "string", required: true },
  session_secret: { type: "string", required: true, min: 64, max: 64 },
  static_path: { type: "string", required: true, min: 1, max: 255 },
  views_path: { type: "string", required: true, min: 1, max: 255 },
  views_default_layout: { type: "string", required: true, min: 1, max: 255 },
  views_layouts_path: { type: "string", required: true, min: 1, max: 255 },
  views_partials_path: { type: "string", required: true, min: 1, max: 255 },
  emails_path: { type: "string", required: true, min: 1, max: 255 },
};

module.exports = { applicationSchema };
