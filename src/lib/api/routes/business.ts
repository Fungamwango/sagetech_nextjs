import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { businessExpenses, businessItems, businessPurchaseRequests, businessSales, notifications, posts, users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";

const itemSchema = z.object({
  name: z.string().trim().min(1).max(150),
  sku: z.string().trim().max(80).optional().or(z.literal("")),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  supplier: z.string().trim().max(120).optional().or(z.literal("")),
  unit: z.string().trim().max(40).optional().or(z.literal("")),
  stockQuantity: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0),
  costPrice: z.coerce.number().min(0),
  sellPrice: z.coerce.number().min(0),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

const saleSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0),
  customerName: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  soldAt: z.string().datetime().optional(),
});

const expenseSchema = z.object({
  title: z.string().trim().min(1).max(150),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  amount: z.coerce.number().min(0),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  expenseDate: z.string().datetime().optional(),
});

const purchaseRequestSchema = z.object({
  postId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(9999),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});

const purchaseRequestActionSchema = z.object({
  action: z.enum(["accept", "reject"]),
  itemId: z.string().uuid().optional(),
  responseNote: z.string().trim().max(1000).optional().or(z.literal("")),
});

function toMoney(value: number) {
  return value.toFixed(2);
}

async function createSystemNotification({
  userId,
  actorId,
  content,
  postId,
}: {
  userId: string;
  actorId?: string | null;
  content: string;
  postId?: string | null;
}) {
  await db.insert(notifications).values({
    userId,
    actorId: actorId || null,
    type: "system",
    content,
    postId: postId || null,
  });
}

export const businessRouter = new Hono()
  .get("/purchase-requests", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const scope = c.req.query("scope") === "outgoing" ? "outgoing" : "incoming";
    const offset = Math.max(0, parseInt(c.req.query("offset") ?? "0", 10) || 0);
    const limit = Math.min(20, Math.max(1, parseInt(c.req.query("limit") ?? "10", 10) || 10));
    const whereClause =
      scope === "outgoing"
        ? eq(businessPurchaseRequests.buyerId, session.userId)
        : eq(businessPurchaseRequests.sellerId, session.userId);

    const [countResult, requests] = await Promise.all([
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(businessPurchaseRequests)
        .where(whereClause)
        .then((rows) => rows[0]),
      db
        .select()
        .from(businessPurchaseRequests)
        .where(whereClause)
        .orderBy(
          sql`CASE WHEN ${businessPurchaseRequests.status} = 'pending' THEN 0 ELSE 1 END`,
          desc(businessPurchaseRequests.createdAt)
        )
        .limit(limit)
        .offset(offset),
    ]);

    const totalCount = Number(countResult?.count ?? 0);
    return c.json({
      requests,
      totalCount,
      hasMore: offset + requests.length < totalCount,
    });
  })
  .get("/dashboard", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const userId = session.userId;

    const [items, sales, expenses, purchaseRequests, stockSummary, salesSummary, expenseSummary] = await Promise.all([
      db
        .select()
        .from(businessItems)
        .where(eq(businessItems.userId, userId))
        .orderBy(desc(businessItems.updatedAt)),
      db
        .select()
        .from(businessSales)
        .where(eq(businessSales.userId, userId))
        .orderBy(desc(businessSales.soldAt))
        .limit(20),
      db
        .select()
        .from(businessExpenses)
        .where(eq(businessExpenses.userId, userId))
        .orderBy(desc(businessExpenses.expenseDate))
        .limit(20),
      db
        .select()
        .from(businessPurchaseRequests)
        .where(eq(businessPurchaseRequests.sellerId, userId))
        .orderBy(
          sql`CASE WHEN ${businessPurchaseRequests.status} = 'pending' THEN 0 ELSE 1 END`,
          desc(businessPurchaseRequests.createdAt)
        )
        .limit(20),
      db
        .select({
          totalStock: sql<number>`COALESCE(SUM(${businessItems.stockQuantity}), 0)`,
          inventoryValue: sql<string>`COALESCE(SUM(${businessItems.stockQuantity} * ${businessItems.costPrice}), 0)`,
          expectedRevenue: sql<string>`COALESCE(SUM(${businessItems.stockQuantity} * ${businessItems.sellPrice}), 0)`,
          lowStockCount: sql<number>`COALESCE(SUM(CASE WHEN ${businessItems.stockQuantity} <= ${businessItems.lowStockThreshold} THEN 1 ELSE 0 END), 0)`,
        })
        .from(businessItems)
        .where(eq(businessItems.userId, userId))
        .then((rows) => rows[0]),
      db
        .select({
          totalSales: sql<string>`COALESCE(SUM(${businessSales.totalAmount}), 0)`,
          totalProfit: sql<string>`COALESCE(SUM(${businessSales.profitAmount}), 0)`,
          salesCount: sql<number>`COUNT(*)`,
        })
        .from(businessSales)
        .where(eq(businessSales.userId, userId))
        .then((rows) => rows[0]),
      db
        .select({
          totalExpenses: sql<string>`COALESCE(SUM(${businessExpenses.amount}), 0)`,
          expenseCount: sql<number>`COUNT(*)`,
        })
        .from(businessExpenses)
        .where(eq(businessExpenses.userId, userId))
        .then((rows) => rows[0]),
    ]);

    return c.json({
      items,
      sales,
      expenses,
      purchaseRequests,
      summary: {
        totalStock: Number(stockSummary?.totalStock ?? 0),
        inventoryValue: Number(stockSummary?.inventoryValue ?? 0),
        expectedRevenue: Number(stockSummary?.expectedRevenue ?? 0),
        lowStockCount: Number(stockSummary?.lowStockCount ?? 0),
        totalSales: Number(salesSummary?.totalSales ?? 0),
        totalProfit: Number(salesSummary?.totalProfit ?? 0),
        salesCount: Number(salesSummary?.salesCount ?? 0),
        totalExpenses: Number(expenseSummary?.totalExpenses ?? 0),
        expenseCount: Number(expenseSummary?.expenseCount ?? 0),
        netCashflow:
          Number(salesSummary?.totalSales ?? 0) - Number(expenseSummary?.totalExpenses ?? 0),
      },
    });
  })
  .post("/items", zValidator("json", itemSchema), async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const data = c.req.valid("json");
    const [item] = await db
      .insert(businessItems)
      .values({
        userId: session.userId,
        name: data.name,
        sku: data.sku || null,
        category: data.category || null,
        supplier: data.supplier || null,
        unit: data.unit || "item",
        stockQuantity: data.stockQuantity,
        lowStockThreshold: data.lowStockThreshold,
        costPrice: toMoney(data.costPrice),
        sellPrice: toMoney(data.sellPrice),
        notes: data.notes || null,
      })
      .returning();

    return c.json({ success: true, item }, 201);
  })
  .patch("/items/:id", zValidator("json", itemSchema.partial()), async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const [item] = await db
      .select({ id: businessItems.id })
      .from(businessItems)
      .where(and(eq(businessItems.id, id), eq(businessItems.userId, session.userId)))
      .limit(1);

    if (!item) return c.json({ error: "Item not found" }, 404);

    const data = c.req.valid("json");
    const patch = Object.fromEntries(
      Object.entries(data).flatMap(([key, value]) => {
        if (value === undefined) return [];
        if (key === "costPrice" || key === "sellPrice") return [[key, toMoney(Number(value))]];
        return [[key, value]];
      })
    );

    const [updated] = await db
      .update(businessItems)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(businessItems.id, id))
      .returning();

    return c.json({ success: true, item: updated });
  })
  .delete("/items/:id", async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const [sale] = await db
      .select({ id: businessSales.id })
      .from(businessSales)
      .where(and(eq(businessSales.itemId, id), eq(businessSales.userId, session.userId)))
      .limit(1);

    if (sale) return c.json({ error: "This item already has sales records and cannot be deleted." }, 400);

    await db.delete(businessItems).where(and(eq(businessItems.id, id), eq(businessItems.userId, session.userId)));
    return c.json({ success: true });
  })
  .post("/sales", zValidator("json", saleSchema), async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const data = c.req.valid("json");
    const result = await db.transaction(async (tx) => {
      const [item] = await tx
        .select()
        .from(businessItems)
        .where(and(eq(businessItems.id, data.itemId), eq(businessItems.userId, session.userId)))
        .limit(1);

      if (!item) {
        throw new Error("Inventory item not found.");
      }

      if ((item.stockQuantity ?? 0) < data.quantity) {
        throw new Error("Not enough stock for this sale.");
      }

      const totalAmount = data.quantity * data.unitPrice;
      const totalCost = data.quantity * Number(item.costPrice ?? 0);
      const profitAmount = totalAmount - totalCost;

      const [sale] = await tx
        .insert(businessSales)
        .values({
          userId: session.userId,
          itemId: item.id,
          itemName: item.name,
          quantity: data.quantity,
          unitCost: toMoney(Number(item.costPrice ?? 0)),
          unitPrice: toMoney(data.unitPrice),
          totalAmount: toMoney(totalAmount),
          profitAmount: toMoney(profitAmount),
          customerName: data.customerName || null,
          notes: data.notes || null,
          soldAt: data.soldAt ? new Date(data.soldAt) : new Date(),
        })
        .returning();

      const [updatedItem] = await tx
        .update(businessItems)
        .set({
          stockQuantity: (item.stockQuantity ?? 0) - data.quantity,
          updatedAt: new Date(),
        })
        .where(eq(businessItems.id, item.id))
        .returning();

      return { sale, item: updatedItem };
    });

    return c.json({ success: true, ...result }, 201);
  })
  .post("/expenses", zValidator("json", expenseSchema), async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const data = c.req.valid("json");
    const [expense] = await db
      .insert(businessExpenses)
      .values({
        userId: session.userId,
        title: data.title,
        category: data.category || null,
        amount: toMoney(data.amount),
        notes: data.notes || null,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
      })
      .returning();

    return c.json({ success: true, expense }, 201);
  })
  .post("/purchase-requests", zValidator("json", purchaseRequestSchema), async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const data = c.req.valid("json");
    const [buyer] = await db
      .select({ id: users.id, username: users.username })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const [productPost] = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        postType: posts.postType,
        approved: posts.approved,
        privacy: posts.privacy,
        productName: posts.productName,
        productPrice: posts.productPrice,
      })
      .from(posts)
      .where(eq(posts.id, data.postId))
      .limit(1);

    if (!buyer) return c.json({ error: "Buyer account not found." }, 404);
    if (!productPost || productPost.postType !== "product" || !productPost.approved || productPost.privacy !== "public") {
      return c.json({ error: "This product is not available for purchase requests." }, 400);
    }
    if (productPost.userId === session.userId) {
      return c.json({ error: "You cannot request your own product." }, 400);
    }

    const unitPrice = Number(productPost.productPrice ?? 0);
    const totalAmount = data.quantity * unitPrice;

    const [request] = await db
      .insert(businessPurchaseRequests)
      .values({
        sellerId: productPost.userId,
        buyerId: session.userId,
        buyerName: buyer.username,
        postId: productPost.id,
        productName: productPost.productName || "Product",
        quantity: data.quantity,
        requestedUnitPrice: toMoney(unitPrice),
        totalAmount: toMoney(totalAmount),
        note: data.note || null,
      })
      .returning();

    await createSystemNotification({
      userId: productPost.userId,
      actorId: session.userId,
      postId: productPost.id,
      content: `${buyer.username} requested to buy ${productPost.productName || "your product"}.`,
    });

    return c.json({ success: true, request }, 201);
  })
  .patch("/purchase-requests/:id", zValidator("json", purchaseRequestActionSchema), async (c) => {
    const session = await getSession();
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const requestId = c.req.param("id");
    const data = c.req.valid("json");

    const [request] = await db
      .select()
      .from(businessPurchaseRequests)
      .where(and(eq(businessPurchaseRequests.id, requestId), eq(businessPurchaseRequests.sellerId, session.userId)))
      .limit(1);

    if (!request) return c.json({ error: "Purchase request not found." }, 404);
    if (request.status !== "pending") return c.json({ error: "This purchase request has already been handled." }, 400);

    if (data.action === "reject") {
      const [updated] = await db
        .update(businessPurchaseRequests)
        .set({
          status: "rejected",
          sellerResponse: data.responseNote || null,
          updatedAt: new Date(),
        })
        .where(eq(businessPurchaseRequests.id, request.id))
        .returning();

      await createSystemNotification({
        userId: request.buyerId,
        actorId: session.userId,
        postId: request.postId,
        content: `Your purchase request for ${request.productName} was rejected.`,
      });

      return c.json({ success: true, request: updated });
    }

    if (!data.itemId) return c.json({ error: "Select an inventory item before accepting this request." }, 400);

    const result = await db.transaction(async (tx) => {
      const [item] = await tx
        .select()
        .from(businessItems)
        .where(and(eq(businessItems.id, data.itemId!), eq(businessItems.userId, session.userId)))
        .limit(1);

      if (!item) throw new Error("Inventory item not found.");
      if ((item.stockQuantity ?? 0) < request.quantity) throw new Error("Not enough stock to accept this request.");

      const totalAmount = Number(request.totalAmount ?? 0);
      const unitPrice = Number(request.requestedUnitPrice ?? 0);
      const unitCost = Number(item.costPrice ?? 0);
      const totalCost = request.quantity * unitCost;
      const profitAmount = totalAmount - totalCost;

      const [sale] = await tx
        .insert(businessSales)
        .values({
          userId: session.userId,
          itemId: item.id,
          itemName: item.name,
          quantity: request.quantity,
          unitCost: toMoney(unitCost),
          unitPrice: toMoney(unitPrice),
          totalAmount: toMoney(totalAmount),
          profitAmount: toMoney(profitAmount),
          customerName: request.buyerName,
          notes: request.note || null,
          soldAt: new Date(),
        })
        .returning();

      await tx
        .update(businessItems)
        .set({
          stockQuantity: (item.stockQuantity ?? 0) - request.quantity,
          updatedAt: new Date(),
        })
        .where(eq(businessItems.id, item.id));

      const [updatedRequest] = await tx
        .update(businessPurchaseRequests)
        .set({
          status: "accepted",
          itemId: item.id,
          saleId: sale.id,
          sellerResponse: data.responseNote || null,
          updatedAt: new Date(),
        })
        .where(eq(businessPurchaseRequests.id, request.id))
        .returning();

      return { request: updatedRequest, sale };
    });

    await createSystemNotification({
      userId: request.buyerId,
      actorId: session.userId,
      postId: request.postId,
      content: `Your purchase request for ${request.productName} was accepted.`,
    });

    return c.json({ success: true, ...result });
  });
