erDiagram
    USER ||--o{ ENROLLMENT : enrolls
    COURSE ||--o{ ENROLLMENT : has

    USER ||--o{ RESULT : receives
    COURSE ||--o{ RESULT : produces

    USER ||--o{ ACHIEVEMENT : records
    ACHIEVEMENT ||--o{ ACHIEVEMENT_MEDIA : has

    ADMIN ||--o{ CSV_BATCH : uploads
    CSV_BATCH ||--o{ RESULT : imports

    USER {
      bigint id PK
      string name
      string email UK
      string password_hash
      string student_no UK
      enum level  "3RD, 4TH"
      string phone nullable
      string avatar_url nullable
      datetime created_at
      datetime updated_at
    }

    ADMIN {
      bigint id PK
      string name
      string email UK
      string password_hash
      string role  "e.g., super, staff"
      datetime created_at
      datetime updated_at
    }

    COURSE {
      bigint id PK
      string code UK
      string title
      text description nullable
      int credits
      enum status "ACTIVE, ARCHIVED"
      datetime created_at
      datetime updated_at
    }

    ENROLLMENT {
      bigint id PK
      bigint user_id FK "-> USER.id"
      bigint course_id FK "-> COURSE.id"
      enum status "ENROLLED, DROPPED"
      date enrolled_at
      date dropped_at nullable
      datetime created_at
      datetime updated_at
      UNIQUE (user_id, course_id)
    }

    RESULT {
      bigint id PK
      bigint user_id FK "-> USER.id"
      bigint course_id FK "-> COURSE.id"
      string grade_letter  "A+, A, A-, …"
      decimal grade_point  "0.00–4.00"
      decimal marks nullable
      int attempt_no default 1
      bigint csv_batch_id FK nullable "-> CSV_BATCH.id"
      datetime published_at
      datetime created_at
      datetime updated_at
      UNIQUE (user_id, course_id, attempt_no)
    }

    CSV_BATCH {
      bigint id PK
      bigint admin_id FK "-> ADMIN.id"
      string filename
      string notes nullable
      datetime uploaded_at
      datetime created_at
      datetime updated_at
    }

    ACHIEVEMENT {
      bigint id PK
      bigint user_id FK "-> USER.id"
      string title
      text description nullable
      string link nullable
      date achieved_on nullable
      datetime created_at
      datetime updated_at
    }

    ACHIEVEMENT_MEDIA {
      bigint id PK
      bigint achievement_id FK "-> ACHIEVEMENT.id"
      enum media_type "IMAGE, DOCUMENT, VIDEO"
      string file_path
      string url
      datetime created_at
      datetime updated_at
    }
