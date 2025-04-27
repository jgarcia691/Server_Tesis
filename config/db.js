import { createClient } from "@libsql/client";

const db = createClient({
  url: "libsql://service-jagarciar.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDU3MTY2MjUsImlkIjoiYTg3ODkzNTAtOGYyOC00M2U4LWIxNmUtNmY0ODY0NTBhOTBmIiwicmlkIjoiNWE5ZjQ5YTAtNjJiZC00YTA4LWEyOWUtMDkxNTI1YjEzOTI3In0.uN_mDjQtN2MfiozmNGdZbdcdCkww-Mid4QBG8MhP7o8KlXsl6CKbWt5W4Yww87j-oRn9i3dAA34e6vJcRANvDg",
});

export default db;
