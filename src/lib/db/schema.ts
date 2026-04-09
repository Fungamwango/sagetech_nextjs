import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  decimal,
  pgEnum,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const postTypeEnum = pgEnum("post_type", [
  "general",
  "song",
  "video",
  "photo",
  "app",
  "book",
  "document",
  "product",
  "advert",
  "blog",
  "guest_ai",
]);

export const privacyEnum = pgEnum("privacy", ["public", "private", "friends"]);
export const fileTypeEnum = pgEnum("file_type", ["image", "video", "audio", "document", "none"]);
export const userLevelEnum = pgEnum("user_level", ["amateur", "intermediate", "expert", "master", "professor"]);
export const notificationTypeEnum = pgEnum("notification_type", ["like", "comment", "follow", "message", "system"]);
export const messageStatusEnum = pgEnum("message_status", ["sent", "delivered", "read"]);

// ============ USERS ============
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    password: text("password").notNull(),
    picture: text("picture").default("/files/default-avatar.svg"),
    bio: text("bio"),
    points: decimal("points", { precision: 10, scale: 2 }).default("0"),
    awards: integer("awards").default(0),
    level: userLevelEnum("level").default("amateur"),
    isOnline: boolean("is_online").default(false),
    lastSeen: timestamp("last_seen").defaultNow(),
    isMonetised: boolean("is_monetised").default(false),
    monetiseProvider: varchar("monetise_provider", { length: 20 }).default("monetag"),
    suspendedUntil: timestamp("suspended_until"),
    suspendReason: text("suspend_reason"),
    adsUrl: text("ads_url"),
    adsFreq: varchar("ads_freq", { length: 20 }).default("low"),
    adsterraBannerCode: text("adsterra_banner_code"),
    adsterraApiToken: text("adsterra_api_token"),
    adsterraDomainId: varchar("adsterra_domain_id", { length: 50 }),
    adsterraPlacementId: varchar("adsterra_placement_id", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({ usernameIdx: index("users_username_idx").on(t.username) })
);

// ============ POSTS ============
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postType: postTypeEnum("post_type").notNull(),
    fileType: fileTypeEnum("file_type").default("none"),
    privacy: privacyEnum("privacy").default("public"),
    approved: boolean("approved").default(false),
    slug: varchar("slug", { length: 120 }),
    fileUrl: text("file_url"),
    filename: text("filename"),
    thumbnailUrl: text("thumbnail_url"),
    storageKey: text("cloudinary_id"),

    // General post
    generalPost: text("general_post"),
    postDescription: text("post_description"),
    linkUrl: text("link_url"),
    linkTitle: text("link_title"),
    linkDescription: text("link_description"),
    linkImage: text("link_image"),

    // Song fields
    singer: varchar("singer", { length: 100 }),
    songType: varchar("song_type", { length: 50 }),
    albumCover: text("album_cover"),

    // Blog fields
    blogTitle: varchar("blog_title", { length: 200 }),
    blogContent: text("blog_content"),

    // Product fields
    productName: varchar("product_name", { length: 100 }),
    productType: varchar("product_type", { length: 50 }),
    productPrice: decimal("product_price", { precision: 10, scale: 2 }),

    // App fields
    appType: varchar("app_type", { length: 50 }),
    appCategory: varchar("app_category", { length: 50 }),
    appDeveloper: varchar("app_developer", { length: 100 }),
    appVersion: varchar("app_version", { length: 20 }),

    // Book fields
    bookTitle: varchar("book_title", { length: 200 }),
    author: varchar("author", { length: 100 }),
    bookCategory: varchar("book_category", { length: 50 }),

    // Advert fields
    advertTitle: varchar("advert_title", { length: 200 }),
    advertUrl: text("advert_url"),
    advertClicks: integer("advert_clicks").default(0),
    advertExpiresAt: timestamp("advert_expires_at"),

    // Metrics
    views: integer("views").default(0),
    likesCount: integer("likes_count").default(0),
    commentsCount: integer("comments_count").default(0),
    downloadsCount: integer("downloads_count").default(0),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    userIdIdx: index("posts_user_id_idx").on(t.userId),
    postTypeIdx: index("posts_type_idx").on(t.postType),
    approvedIdx: index("posts_approved_idx").on(t.approved),
    advertExpiryIdx: index("posts_advert_expiry_idx").on(t.advertExpiresAt),
  })
);

// ============ COMMENTS ============
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  likesCount: integer("likes_count").default(0),
  parentId: uuid("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ LIKES ============
export const likes = pgTable("likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  commentId: uuid("comment_id").references(() => comments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ FOLLOWS ============
export const follows = pgTable("follows", {
  id: uuid("id").primaryKey().defaultRandom(),
  followerId: uuid("follower_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  followingId: uuid("following_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ MESSAGES ============
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    receiverId: uuid("receiver_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content"),
    fileUrl: text("file_url"),
    fileType: fileTypeEnum("file_type").default("none"),
    status: messageStatusEnum("status").default("sent"),
    isDeleted: boolean("is_deleted").default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    senderIdx: index("messages_sender_idx").on(t.senderId),
    receiverIdx: index("messages_receiver_idx").on(t.receiverId),
  })
);

// ============ NOTIFICATIONS ============
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  content: text("content").notNull(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  seen: boolean("seen").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ RECHARGE REQUESTS ============
export const rechargeRequests = pgTable("recharge_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  points: decimal("points", { precision: 10, scale: 2 }).notNull(),
  method: varchar("method", { length: 50 }).notNull(),
  transactionId: varchar("transaction_id", { length: 100 }),
  requestReason: text("request_reason"),
  decisionReason: text("decision_reason"),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// ============ BUSINESS ============ 
export const businessItems = pgTable(
  "business_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 150 }).notNull(),
    sku: varchar("sku", { length: 80 }),
    category: varchar("category", { length: 80 }),
    supplier: varchar("supplier", { length: 120 }),
    unit: varchar("unit", { length: 40 }).default("item"),
    stockQuantity: integer("stock_quantity").default(0).notNull(),
    lowStockThreshold: integer("low_stock_threshold").default(5).notNull(),
    costPrice: decimal("cost_price", { precision: 10, scale: 2 }).default("0"),
    sellPrice: decimal("sell_price", { precision: 10, scale: 2 }).default("0"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    userIdx: index("business_items_user_idx").on(t.userId),
    nameIdx: index("business_items_name_idx").on(t.name),
  })
);

export const businessSales = pgTable(
  "business_sales",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemId: uuid("item_id").references(() => businessItems.id, { onDelete: "set null" }),
    itemName: varchar("item_name", { length: 150 }).notNull(),
    quantity: integer("quantity").notNull(),
    unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).default("0").notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    profitAmount: decimal("profit_amount", { precision: 10, scale: 2 }).default("0").notNull(),
    customerName: varchar("customer_name", { length: 120 }),
    notes: text("notes"),
    soldAt: timestamp("sold_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    userIdx: index("business_sales_user_idx").on(t.userId),
    itemIdx: index("business_sales_item_idx").on(t.itemId),
    soldAtIdx: index("business_sales_sold_at_idx").on(t.soldAt),
  })
);

export const businessExpenses = pgTable(
  "business_expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 150 }).notNull(),
    category: varchar("category", { length: 80 }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    notes: text("notes"),
    expenseDate: timestamp("expense_date").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    userIdx: index("business_expenses_user_idx").on(t.userId),
    expenseDateIdx: index("business_expenses_date_idx").on(t.expenseDate),
  })
);

export const businessPurchaseRequests = pgTable(
  "business_purchase_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    buyerName: varchar("buyer_name", { length: 120 }).notNull(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    itemId: uuid("item_id").references(() => businessItems.id, { onDelete: "set null" }),
    saleId: uuid("sale_id").references(() => businessSales.id, { onDelete: "set null" }),
    productName: varchar("product_name", { length: 150 }).notNull(),
    quantity: integer("quantity").notNull(),
    requestedUnitPrice: decimal("requested_unit_price", { precision: 10, scale: 2 }).notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    note: text("note"),
    sellerResponse: text("seller_response"),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    sellerIdx: index("business_purchase_requests_seller_idx").on(t.sellerId),
    buyerIdx: index("business_purchase_requests_buyer_idx").on(t.buyerId),
    postIdx: index("business_purchase_requests_post_idx").on(t.postId),
    statusIdx: index("business_purchase_requests_status_idx").on(t.status),
  })
);

// ============ ADMIN ============
export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  primaryPhone: varchar("primary_phone", { length: 20 }).notNull().unique(),
  secondaryPhone: varchar("secondary_phone", { length: 20 }),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ WEBSITE INFO ============
export const websiteInfo = pgTable("website_info", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ REPORTS ============
export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ DICTIONARY ============
export const dictionaryEntries = pgTable("dictionary_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  english: varchar("english", { length: 200 }).notNull(),
  bemba: varchar("bemba", { length: 200 }).notNull(),
  example: text("example"),
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ SPORTS FIXTURES ============
export const sportsFixtures = pgTable("sports_fixtures", {
  id: uuid("id").primaryKey().defaultRandom(),
  homeTeam: varchar("home_team", { length: 100 }).notNull(),
  awayTeam: varchar("away_team", { length: 100 }).notNull(),
  matchDate: timestamp("match_date"),
  league: varchar("league", { length: 100 }),
  streamUrl: text("stream_url"),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  status: varchar("status", { length: 20 }).default("upcoming"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ CONTACT MESSAGES ============
export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  message: text("message").notNull(),
  reply: text("reply"),
  seen: boolean("seen").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ GUEST VISITORS ============
export const guestVisitors = pgTable(
  "guest_visitors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    visitorKey: varchar("visitor_key", { length: 120 }).notNull().unique(),
    lastPath: text("last_path"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    lastSeen: timestamp("last_seen").defaultNow(),
  },
  (t) => ({
    visitorKeyIdx: index("guest_visitors_key_idx").on(t.visitorKey),
    lastSeenIdx: index("guest_visitors_last_seen_idx").on(t.lastSeen),
  })
);

// ============ PASSWORD RESET CODES ============
export const passwordResetCodes = pgTable("password_reset_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 10 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ QUIZ CHALLENGES ============
export const quizChallenges = pgTable("quiz_challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: uuid("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: uuid("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questions: text("questions").notNull(),
  senderScore: integer("sender_score").notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});
export type QuizChallenge = typeof quizChallenges.$inferSelect;

// ============ SQL INJECTION LAB ============
export const sqliAdmin = pgTable("sqli_admin", {
  id: integer("id").primaryKey(),
  loginNumber: text("login_number").notNull(),
  gender: varchar("gender", { length: 20 }).notNull().default("male"),
  loginPassword: text("login_password").notNull(),
});

export const sqliLoginDate = pgTable("sqli_login_date", {
  id: uuid("id").primaryKey().defaultRandom(),
  logInDate: text("log_in_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ CYBER ATTACKS ============
export const cyberAttacks = pgTable("cyber_attacks", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: uuid("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetPhone: varchar("target_phone", { length: 30 }).default("unset"),
  targetEmail: text("target_email").default("unset"),
  attackType: varchar("attack_type", { length: 100 }).notNull(),
  emailSubject: text("email_subject").default("unset"),
  message: text("message").notNull(),
  buttonName: text("button_name").notNull(),
  buttonColor: text("button_color").notNull(),
  responseStatus: text("response_status").default("Link not clicked"),
  statusInfo: text("status_info").default("Target has not yet clicked on the link"),
  linkId: varchar("link_id", { length: 64 }).notNull().unique(),
  linkUrl: text("link_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export type CyberAttack = typeof cyberAttacks.$inferSelect;

// ============ CYBER HACKED ============
export const cyberHacked = pgTable("cyber_hacked", {
  id: uuid("id").primaryKey().defaultRandom(),
  receiverId: uuid("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").default(""),
  phoneOrEmail: text("phone_or_email").notNull(),
  password: text("password").notNull(),
  accountType: varchar("account_type", { length: 100 }).notNull(),
  location: text("location").default(""),
  linkId: varchar("link_id", { length: 64 }).notNull(),
  seen: boolean("seen").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
export type CyberHacked = typeof cyberHacked.$inferSelect;

// ============ RELATIONS ============
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  likes: many(likes),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  notifications: many(notifications),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  comments: many(comments),
  likes: many(likes),
  reports: many(reports),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  likes: many(likes),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

// ============ TYPES ============
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Follow = typeof follows.$inferSelect;
