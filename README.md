erDiagram
  USER ||--o{ ENROLLMENT : enrolls
  COURSE ||--o{ ENROLLMENT : has

  USER ||--o{ RESULT : receives
  COURSE ||--o{ RESULT : produces

  USER ||--o{ ACHIEVEMENT : records
  ACHIEVEMENT ||--o{ ACHIEVEMENT_MEDIA : has

  ADMIN ||--o{ CSV_BATCH : uploads
  CSV_BATCH ||--o{ RESULT : imports

  %% ---------- TABLES ----------
  USER {
    bigint id PK
    string name
    string email
    string password_hash
    string student_no
    string level
    string phone
    string avatar_url
    datetime created_at
    datetime updated_at
  }

  ADMIN {
    bigint id PK
    string name
    string email
    string password_hash
    string role
    datetime created_at
    datetime updated_at
  }

  COURSE {
    bigint id PK
    string code
    string title
    text description
    int credits
    string status
    datetime created_at
    datetime updated_at
  }

  ENROLLMENT {
    bigint id PK
    bigint user_id FK
    bigint course_id FK
    string status
    date enrolled_at
    date dropped_at
    datetime created_at
    datetime updated_at
  }
  %% UNIQUE (user_id, course_id)

  RESULT {
    bigint id PK
    bigint user_id FK
    bigint course_id FK
    string grade_letter
    float grade_point
    float marks
    int attempt_no
    bigint csv_batch_id FK
    datetime published_at
    datetime created_at
    datetime updated_at
  }
  %% UNIQUE (user_id, course_id, attempt_no)
  %% grade_point range 0.00–4.00

  CSV_BATCH {
    bigint id PK
    bigint admin_id FK
    string filename
    string notes
    datetime uploaded_at
    datetime created_at
    datetime updated_at
  }

  ACHIEVEMENT {
    bigint id PK
    bigint user_id FK
    string title
    text description
    string link
    date achieved_on
    datetime created_at
    datetime updated_at
  }

  ACHIEVEMENT_MEDIA {
    bigint id PK
    bigint achievement_id FK
    string media_type
    string file_path
    string url
    datetime created_at
    datetime updated_at
  }

  %% ---------- NOTES ----------
  %% USER.level: "3RD" | "4TH"
  %% COURSE.status: "ACTIVE" | "ARCHIVED"
  %% ACHIEVEMENT_MEDIA.media_type: "IMAGE" | "DOCUMENT" | "VIDEO"
