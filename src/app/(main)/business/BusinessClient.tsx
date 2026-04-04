"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PostFeed from "@/components/posts/PostFeed";
import { useToast } from "@/components/ui/ToastProvider";

type DashboardItem = {
  id: string;
  name: string;
  sku?: string | null;
  category?: string | null;
  supplier?: string | null;
  unit?: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
  costPrice: string;
  sellPrice: string;
  notes?: string | null;
};

type DashboardSale = {
  id: string;
  itemName: string;
  quantity: number;
  unitCost: string;
  unitPrice: string;
  totalAmount: string;
  profitAmount: string;
  customerName?: string | null;
  soldAt: string;
};

type DashboardExpense = {
  id: string;
  title: string;
  category?: string | null;
  amount: string;
  expenseDate: string;
};

type DashboardPurchaseRequest = {
  id: string;
  buyerName: string;
  postId: string;
  itemId?: string | null;
  saleId?: string | null;
  productName: string;
  quantity: number;
  requestedUnitPrice: string;
  totalAmount: string;
  note?: string | null;
  sellerResponse?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type DashboardSummary = {
  totalStock: number;
  inventoryValue: number;
  expectedRevenue: number;
  lowStockCount: number;
  totalSales: number;
  totalProfit: number;
  salesCount: number;
  totalExpenses: number;
  expenseCount: number;
  netCashflow: number;
};

type DashboardPayload = {
  items: DashboardItem[];
  sales: DashboardSale[];
  expenses: DashboardExpense[];
  purchaseRequests: DashboardPurchaseRequest[];
  summary: DashboardSummary;
};

const EMPTY_SUMMARY: DashboardSummary = {
  totalStock: 0,
  inventoryValue: 0,
  expectedRevenue: 0,
  lowStockCount: 0,
  totalSales: 0,
  totalProfit: 0,
  salesCount: 0,
  totalExpenses: 0,
  expenseCount: 0,
  netCashflow: 0,
};

type InventoryFilter = "all" | "low" | "category" | "supplier";
type BusinessTab = "overview" | "requests" | "inventory" | "sales" | "products";

function formatMoney(value: number | string) {
  const amount = typeof value === "number" ? value : Number(value || 0);
  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-ZM", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

const BUSINESS_TABS: Array<{ id: BusinessTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "requests", label: "Requests" },
  { id: "inventory", label: "Stock Manager" },
  { id: "sales", label: "Sales" },
  { id: "products", label: "Marketplace" },
];

const MARKETPLACE_CATEGORIES = [
  "Electronics",
  "Phones & Tablets",
  "Computers",
  "Fashion",
  "Shoes",
  "Beauty",
  "Health",
  "Home & Kitchen",
  "Furniture",
  "Groceries",
  "Baby Products",
  "Books & Stationery",
  "Sports & Outdoors",
  "Automotive",
  "Tools & Hardware",
  "Agriculture",
  "Services",
  "Other",
] as const;

export default function BusinessClient({ currentUserId }: { currentUserId: string | null }) {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<BusinessTab>("products");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<null | "item" | "sale" | "expense">(null);
  const [requestActionLoading, setRequestActionLoading] = useState<Record<string, "accept" | "reject" | null>>({});
  const [requestItemSelection, setRequestItemSelection] = useState<Record<string, string>>({});
  const [incomingRequests, setIncomingRequests] = useState<DashboardPurchaseRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<DashboardPurchaseRequest[]>([]);
  const [incomingHasMore, setIncomingHasMore] = useState(false);
  const [outgoingHasMore, setOutgoingHasMore] = useState(false);
  const [loadingMoreIncoming, setLoadingMoreIncoming] = useState(false);
  const [loadingMoreOutgoing, setLoadingMoreOutgoing] = useState(false);
  const [visibleInventoryCount, setVisibleInventoryCount] = useState(10);
  const [visibleSalesCount, setVisibleSalesCount] = useState(8);
  const [visibleExpensesCount, setVisibleExpensesCount] = useState(8);
  const [dashboard, setDashboard] = useState<DashboardPayload>({
    items: [],
    sales: [],
    expenses: [],
    purchaseRequests: [],
    summary: EMPTY_SUMMARY,
  });
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilter>("all");
  const [inventoryFilterValue, setInventoryFilterValue] = useState("");
  const [itemForm, setItemForm] = useState({
    name: "",
    sku: "",
    category: "",
    supplier: "",
    unit: "item",
    stockQuantity: "0",
    lowStockThreshold: "5",
    costPrice: "0",
    sellPrice: "0",
    notes: "",
  });
  const [saleForm, setSaleForm] = useState({
    itemId: "",
    quantity: "1",
    unitPrice: "",
    customerName: "",
    notes: "",
  });
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    category: "",
    amount: "",
    notes: "",
  });
  const [marketplaceQuery, setMarketplaceQuery] = useState("");
  const [appliedMarketplaceQuery, setAppliedMarketplaceQuery] = useState("");
  const [marketplaceCategory, setMarketplaceCategory] = useState("");

  const selectedSaleItem = useMemo(
    () => dashboard.items.find((item) => item.id === saleForm.itemId) ?? null,
    [dashboard.items, saleForm.itemId]
  );

  const categoryOptions = useMemo(
    () => Array.from(new Set(dashboard.items.map((item) => item.category?.trim()).filter(Boolean))) as string[],
    [dashboard.items]
  );

  const supplierOptions = useMemo(
    () => Array.from(new Set(dashboard.items.map((item) => item.supplier?.trim()).filter(Boolean))) as string[],
    [dashboard.items]
  );

  const lowStockItems = useMemo(
    () => dashboard.items.filter((item) => item.stockQuantity <= item.lowStockThreshold),
    [dashboard.items]
  );

  const pendingRequests = useMemo(
    () => incomingRequests.filter((request) => request.status === "pending"),
    [incomingRequests]
  );

  const filteredItems = useMemo(() => {
    if (inventoryFilter === "low") return lowStockItems;
    if (inventoryFilter === "category" && inventoryFilterValue) {
      return dashboard.items.filter((item) => item.category === inventoryFilterValue);
    }
    if (inventoryFilter === "supplier" && inventoryFilterValue) {
      return dashboard.items.filter((item) => item.supplier === inventoryFilterValue);
    }
    return dashboard.items;
  }, [dashboard.items, inventoryFilter, inventoryFilterValue, lowStockItems]);

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleInventoryCount),
    [filteredItems, visibleInventoryCount]
  );

  const visibleSales = useMemo(
    () => dashboard.sales.slice(0, visibleSalesCount),
    [dashboard.sales, visibleSalesCount]
  );

  const visibleExpenses = useMemo(
    () => dashboard.expenses.slice(0, visibleExpensesCount),
    [dashboard.expenses, visibleExpensesCount]
  );

  const visibleTabs = useMemo(
    () => (currentUserId ? BUSINESS_TABS : BUSINESS_TABS.filter((tab) => tab.id === "products")),
    [currentUserId]
  );

  const canExportCurrentTab = useMemo(() => {
    if (activeTab === "inventory") return dashboard.items.length > 0;
    if (activeTab === "sales") return dashboard.sales.length > 0 || dashboard.expenses.length > 0;
    if (activeTab === "requests") return incomingRequests.length > 0 || outgoingRequests.length > 0;
    return false;
  }, [activeTab, dashboard.items.length, dashboard.sales.length, dashboard.expenses.length, incomingRequests.length, outgoingRequests.length]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/business/dashboard", { cache: "no-store" });
      if (!res.ok) throw new Error("Unable to load business dashboard.");
      const data = (await res.json()) as DashboardPayload;
      setDashboard({
        items: data.items ?? [],
        sales: data.sales ?? [],
        expenses: data.expenses ?? [],
        purchaseRequests: data.purchaseRequests ?? [],
        summary: data.summary ?? EMPTY_SUMMARY,
      });
    } catch (error) {
      showToast({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to load business dashboard.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRequestHistory = async (scope: "incoming" | "outgoing", append = false) => {
    const offset = append ? (scope === "incoming" ? incomingRequests.length : outgoingRequests.length) : 0;
    if (scope === "incoming") setLoadingMoreIncoming(append);
    if (scope === "outgoing") setLoadingMoreOutgoing(append);
    try {
      const res = await fetch(`/api/business/purchase-requests?scope=${scope}&offset=${offset}&limit=10`, { cache: "no-store" });
      if (!res.ok) throw new Error("Unable to load purchase requests.");
      const data = await res.json();
      const requests = (data.requests ?? []) as DashboardPurchaseRequest[];
      if (scope === "incoming") {
        setIncomingRequests((current) => (append ? [...current, ...requests.filter((item) => !current.some((c) => c.id === item.id))] : requests));
        setIncomingHasMore(!!data.hasMore);
      } else {
        setOutgoingRequests((current) => (append ? [...current, ...requests.filter((item) => !current.some((c) => c.id === item.id))] : requests));
        setOutgoingHasMore(!!data.hasMore);
      }
    } catch (error) {
      showToast({ type: "error", message: error instanceof Error ? error.message : "Unable to load purchase requests." });
    } finally {
      if (scope === "incoming") setLoadingMoreIncoming(false);
      if (scope === "outgoing") setLoadingMoreOutgoing(false);
    }
  };

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    void loadDashboard();
    void loadRequestHistory("incoming", false);
    void loadRequestHistory("outgoing", false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  useEffect(() => {
    if (selectedSaleItem && !saleForm.unitPrice) {
      setSaleForm((current) => ({ ...current, unitPrice: String(selectedSaleItem.sellPrice ?? "") }));
    }
  }, [selectedSaleItem, saleForm.unitPrice]);

  useEffect(() => {
    setVisibleInventoryCount(10);
  }, [inventoryFilter, inventoryFilterValue]);

  useEffect(() => {
    const section = searchParams.get("section");
    if (!currentUserId) {
      setActiveTab("products");
      return;
    }
    if (section === "requests" || section === "history") {
      setActiveTab("requests");
      return;
    }
    const tab = searchParams.get("tab");
    if (tab === "requests" || tab === "inventory" || tab === "sales" || tab === "products" || tab === "overview") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const section = searchParams.get("section");
    if (!section) return;
    const id = section === "history" ? "business-request-history" : "business-requests";
    const target = document.getElementById(id);
    if (!target) return;
    const timer = window.setTimeout(() => {
      setActiveTab("requests");
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.add("ring-1", "ring-cyan-400/30");
      window.setTimeout(() => target.classList.remove("ring-1", "ring-cyan-400/30"), 1800);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [searchParams, incomingRequests.length, outgoingRequests.length]);

  const exportReport = () => {
    let rows: string[] = [];
    let filename = "business-report";

    if (activeTab === "inventory") {
      filename = "stock-manager";
      rows = [
        ["name", "sku", "category", "supplier", "stock_quantity", "unit", "cost_price", "sell_price", "notes"].join(","),
        ...dashboard.items.map((item) =>
          [
            JSON.stringify(item.name),
            JSON.stringify(item.sku || ""),
            JSON.stringify(item.category || ""),
            JSON.stringify(item.supplier || ""),
            item.stockQuantity,
            JSON.stringify(item.unit || ""),
            item.costPrice,
            item.sellPrice,
            JSON.stringify(item.notes || ""),
          ].join(",")
        ),
      ];
    } else if (activeTab === "sales") {
      filename = "sales-expenses";
      rows = [
        ["type", "name", "category", "quantity", "amount", "profit", "date"].join(","),
        ...dashboard.sales.map((sale) =>
          [
            "sale",
            JSON.stringify(sale.itemName),
            "",
            sale.quantity,
            sale.totalAmount,
            sale.profitAmount,
            new Date(sale.soldAt).toISOString(),
          ].join(",")
        ),
        ...dashboard.expenses.map((expense) =>
          [
            "expense",
            JSON.stringify(expense.title),
            JSON.stringify(expense.category || ""),
            "",
            expense.amount,
            "",
            new Date(expense.expenseDate).toISOString(),
          ].join(",")
        ),
      ];
    } else if (activeTab === "requests") {
      filename = "purchase-requests";
      rows = [
        ["scope", "product_name", "buyer_name", "quantity", "total_amount", "status", "date"].join(","),
        ...incomingRequests.map((request) =>
          [
            "incoming",
            JSON.stringify(request.productName),
            JSON.stringify(request.buyerName),
            request.quantity,
            request.totalAmount,
            request.status,
            new Date(request.createdAt).toISOString(),
          ].join(",")
        ),
        ...outgoingRequests.map((request) =>
          [
            "history",
            JSON.stringify(request.productName),
            JSON.stringify(request.buyerName),
            request.quantity,
            request.totalAmount,
            request.status,
            new Date(request.createdAt).toISOString(),
          ].join(",")
        ),
      ];
    } else {
      return;
    }

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const createItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting("item");
    try {
      const res = await fetch("/api/business/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Unable to save inventory item.");
      showToast({ type: "success", message: "Inventory item added." });
      setItemForm({
        name: "",
        sku: "",
        category: "",
        supplier: "",
        unit: "item",
        stockQuantity: "0",
        lowStockThreshold: "5",
        costPrice: "0",
        sellPrice: "0",
        notes: "",
      });
      await loadDashboard();
    } catch (error) {
      showToast({ type: "error", message: error instanceof Error ? error.message : "Unable to save inventory item." });
    } finally {
      setSubmitting(null);
    }
  };

  const createSale = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting("sale");
    try {
      const res = await fetch("/api/business/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Unable to record sale.");
      showToast({ type: "success", message: "Sale recorded." });
      setSaleForm({ itemId: "", quantity: "1", unitPrice: "", customerName: "", notes: "" });
      await loadDashboard();
    } catch (error) {
      showToast({ type: "error", message: error instanceof Error ? error.message : "Unable to record sale." });
    } finally {
      setSubmitting(null);
    }
  };

  const createExpense = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting("expense");
    try {
      const res = await fetch("/api/business/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Unable to record expense.");
      showToast({ type: "success", message: "Expense recorded." });
      setExpenseForm({ title: "", category: "", amount: "", notes: "" });
      await loadDashboard();
    } catch (error) {
      showToast({ type: "error", message: error instanceof Error ? error.message : "Unable to record expense." });
    } finally {
      setSubmitting(null);
    }
  };

  const handlePurchaseRequest = async (requestId: string, action: "accept" | "reject") => {
    setRequestActionLoading((current) => ({ ...current, [requestId]: action }));
    try {
      const res = await fetch(`/api/business/purchase-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "accept" ? { action, itemId: requestItemSelection[requestId] } : { action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Unable to update purchase request.");
      showToast({
        type: "success",
        message: action === "accept" ? "Purchase request accepted." : "Purchase request rejected.",
      });
      await loadDashboard();
      await loadRequestHistory("incoming", false);
      await loadRequestHistory("outgoing", false);
    } catch (error) {
      showToast({ type: "error", message: error instanceof Error ? error.message : "Unable to update purchase request." });
    } finally {
      setRequestActionLoading((current) => ({ ...current, [requestId]: null }));
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/business/items/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Unable to delete item.");
      showToast({ type: "success", message: "Inventory item deleted." });
      await loadDashboard();
    } catch (error) {
      showToast({ type: "error", message: error instanceof Error ? error.message : "Unable to delete item." });
    }
  };

  const submitMarketplaceSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedMarketplaceQuery(marketplaceQuery.trim());
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[22px] border border-white/10 bg-white/[0.03] p-2">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
          <p className="text-sm font-semibold text-white">Business Manager</p>
          {canExportCurrentTab ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={exportReport} className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white">
                Export CSV
              </button>
              <button type="button" onClick={() => window.print()} className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white">
                Print
              </button>
            </div>
          ) : null}
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Stock",
            value: formatMoney(dashboard.summary.inventoryValue),
            detail: `${dashboard.summary.totalStock} units`,
            accent: "text-cyan-300",
          },
          {
            label: "Sales",
            value: formatMoney(dashboard.summary.totalSales),
            detail: `${dashboard.summary.salesCount} recorded`,
            accent: "text-white",
          },
          {
            label: "Profit",
            value: formatMoney(dashboard.summary.totalProfit),
            detail: `Expenses ${formatMoney(dashboard.summary.totalExpenses)}`,
            accent: "text-emerald-200",
          },
          {
            label: "Requests",
            value: String(pendingRequests.length),
            detail: `${outgoingRequests.length} history`,
            accent: pendingRequests.length > 0 ? "text-amber-200" : "text-white/80",
          },
        ].map((card) => (
          <div key={card.label} className="rounded-[18px] bg-black/15 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">{card.label}</p>
            <p className={`mt-1 text-[15px] font-semibold ${card.accent}`}>{card.value}</p>
            <p className="mt-1 text-[11px] text-white/42">{card.detail}</p>
          </div>
        ))}
        </div>
      </section>

      <section className="rounded-[22px] border border-white/10 bg-white/[0.03] p-2">
        <div className="flex flex-wrap gap-2">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-cyan-400/90 text-slate-950"
                  : "bg-white/[0.04] text-white/72 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "overview" ? (
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Requests</p>
            <p className="mt-2 text-2xl font-semibold text-white">{pendingRequests.length}</p>
            <p className="mt-2 text-sm text-white/55">Pending buyer requests waiting for your action.</p>
            <button
              type="button"
              onClick={() => setActiveTab("requests")}
              className="mt-4 rounded-full bg-white/[0.06] px-4 py-2 text-sm text-white/78 transition-colors hover:bg-white/[0.1] hover:text-white"
            >
              Open requests
            </button>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Stock Manager</p>
            <p className="mt-2 text-2xl font-semibold text-white">{dashboard.items.length}</p>
            <p className="mt-2 text-sm text-white/55">
              {dashboard.summary.lowStockCount} low-stock item{dashboard.summary.lowStockCount === 1 ? "" : "s"} to review.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("inventory")}
              className="mt-4 rounded-full bg-white/[0.06] px-4 py-2 text-sm text-white/78 transition-colors hover:bg-white/[0.1] hover:text-white"
            >
              Open stock manager
            </button>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Sales & Marketplace</p>
            <p className="mt-2 text-2xl font-semibold text-white">{dashboard.summary.salesCount}</p>
            <p className="mt-2 text-sm text-white/55">
              {formatMoney(dashboard.summary.netCashflow)} net cashflow across recent sales and expenses.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("sales")}
                className="rounded-full bg-white/[0.06] px-4 py-2 text-sm text-white/78 transition-colors hover:bg-white/[0.1] hover:text-white"
              >
                Open sales
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("products")}
                className="rounded-full bg-white/[0.06] px-4 py-2 text-sm text-white/78 transition-colors hover:bg-white/[0.1] hover:text-white"
              >
                Open marketplace
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {(activeTab === "requests" || activeTab === "inventory" || activeTab === "sales") ? (
      <section className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <div className="space-y-4">
          {activeTab === "requests" ? (
          <div id="business-requests" className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 transition-shadow">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">Purchase Requests</h2>
              </div>
              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100/85">{pendingRequests.length} pending</span>
            </div>
            {incomingRequests.length === 0 ? (
              <div className="py-10 text-center text-sm text-white/45">No purchase requests yet.</div>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((request) => {
                  const loadingState = requestActionLoading[request.id];
                  const selectedItemId = requestItemSelection[request.id] ?? "";
                  return (
                    <div key={request.id} className="rounded-[18px] border border-white/8 bg-black/15 px-3 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-white">{request.productName}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] ${request.status === "pending" ? "bg-amber-400/10 text-amber-200" : request.status === "accepted" ? "bg-emerald-400/10 text-emerald-200" : "bg-rose-400/10 text-rose-200"}`}>
                              {request.status}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-white/48">
                            {request.buyerName} requested {request.quantity} • {formatMoney(request.totalAmount)} • {formatDate(request.createdAt)}
                          </p>
                          {request.note ? <p className="mt-2 text-xs leading-relaxed text-white/58">{request.note}</p> : null}
                        </div>
                      </div>
                      {request.status === "pending" ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <select
                            value={selectedItemId}
                            onChange={(e) => setRequestItemSelection((current) => ({ ...current, [request.id]: e.target.value }))}
                            className="min-w-[220px] rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white outline-none"
                          >
                            <option value="" className="bg-slate-900">Select inventory item</option>
                            {dashboard.items.map((item) => (
                              <option key={item.id} value={item.id} className="bg-slate-900">
                                {item.name} ({item.stockQuantity} in stock)
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={loadingState === "accept"}
                            onClick={() => {
                              if (!selectedItemId) {
                                showToast({ type: "error", message: "Select an inventory item before accepting." });
                                return;
                              }
                              void handlePurchaseRequest(request.id, "accept");
                            }}
                            className="rounded-full bg-emerald-400/90 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-300 disabled:opacity-60"
                          >
                            {loadingState === "accept" ? "Accepting..." : "Accept"}
                          </button>
                          <button
                            type="button"
                            disabled={loadingState === "reject"}
                            onClick={() => void handlePurchaseRequest(request.id, "reject")}
                            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-60"
                          >
                            {loadingState === "reject" ? "Rejecting..." : "Reject"}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
                {incomingHasMore ? (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => void loadRequestHistory("incoming", true)}
                      disabled={loadingMoreIncoming}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-60"
                    >
                      {loadingMoreIncoming ? "Loading..." : "Load more requests"}
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          ) : null}

          {activeTab === "requests" ? (
          <div id="business-request-history" className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 transition-shadow">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">Your Request History</h2>
              </div>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/70">{outgoingRequests.length} shown</span>
            </div>
            {outgoingRequests.length === 0 ? (
              <div className="py-10 text-center text-sm text-white/45">You have not requested any products yet.</div>
            ) : (
              <div className="space-y-3">
                {outgoingRequests.map((request) => (
                  <div key={request.id} className="rounded-[18px] border border-white/8 bg-black/15 px-3 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white">{request.productName}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] ${request.status === "pending" ? "bg-amber-400/10 text-amber-200" : request.status === "accepted" ? "bg-emerald-400/10 text-emerald-200" : "bg-rose-400/10 text-rose-200"}`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-white/48">
                          {request.quantity} requested • {formatMoney(request.totalAmount)} • {formatDate(request.createdAt)}
                        </p>
                        {request.note ? <p className="mt-2 text-xs leading-relaxed text-white/58">{request.note}</p> : null}
                        {request.sellerResponse ? <p className="mt-2 text-xs leading-relaxed text-cyan-100/70">{request.sellerResponse}</p> : null}
                      </div>
                    </div>
                  </div>
                ))}
                {outgoingHasMore ? (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => void loadRequestHistory("outgoing", true)}
                      disabled={loadingMoreOutgoing}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-60"
                    >
                      {loadingMoreOutgoing ? "Loading..." : "Load more history"}
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          ) : null}

          {activeTab === "inventory" ? (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">Stock Manager</h2>
                <p className="mt-1 text-xs text-white/45">{filteredItems.length} items, {dashboard.summary.totalStock} units in stock</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={inventoryFilter} onChange={(e) => { setInventoryFilter(e.target.value as InventoryFilter); setInventoryFilterValue(""); }} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white outline-none">
                  <option value="all" className="bg-slate-900">All items</option>
                  <option value="low" className="bg-slate-900">Low stock</option>
                  <option value="category" className="bg-slate-900">By category</option>
                  <option value="supplier" className="bg-slate-900">By supplier</option>
                </select>
                {(inventoryFilter === "category" || inventoryFilter === "supplier") ? (
                  <select value={inventoryFilterValue} onChange={(e) => setInventoryFilterValue(e.target.value)} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white outline-none">
                    <option value="" className="bg-slate-900">{inventoryFilter === "category" ? "All categories" : "All suppliers"}</option>
                    {(inventoryFilter === "category" ? categoryOptions : supplierOptions).map((option) => (
                      <option key={option} value={option} className="bg-slate-900">{option}</option>
                    ))}
                  </select>
                ) : null}
              </div>
            </div>
            {loading ? (
              <div className="py-10 text-center text-sm text-white/45">Loading stock...</div>
            ) : filteredItems.length === 0 ? (
              <div className="py-10 text-center text-sm text-white/45">No stock items match this filter.</div>
            ) : (
              <div className="space-y-2">
                {visibleItems.map((item) => (
                  <div key={item.id} className="rounded-[18px] border border-white/8 bg-black/15 px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                          {item.category ? <span className="rounded-full bg-white/6 px-2 py-0.5 text-[11px] text-white/48">{item.category}</span> : null}
                          {item.supplier ? <span className="rounded-full bg-cyan-400/8 px-2 py-0.5 text-[11px] text-cyan-100/78">{item.supplier}</span> : null}
                        </div>
                        <p className="mt-1 text-xs text-white/45">{item.sku ? `${item.sku} • ` : ""}{item.stockQuantity} {item.unit || "item"} in stock</p>
                        <p className="mt-2 text-xs text-white/58">Cost {formatMoney(item.costPrice)} • Sell {formatMoney(item.sellPrice)}</p>
                      </div>
                      <button type="button" onClick={() => void deleteItem(item.id)} className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs text-white/68 transition-colors hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-200">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {filteredItems.length > visibleItems.length ? (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleInventoryCount((count) => count + 10)}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white"
                    >
                      Load more stock
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          ) : null}

          {activeTab === "sales" ? (
            <>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Recent Sales</h2>
                    <p className="mt-1 text-xs text-white/45">{dashboard.summary.salesCount} sales recorded.</p>
                  </div>
                </div>
                {dashboard.sales.length === 0 ? (
                  <div className="py-10 text-center text-sm text-white/45">No sales recorded yet.</div>
                ) : (
                  <div className="space-y-2">
                    {visibleSales.map((sale) => (
                      <div key={sale.id} className="rounded-[18px] border border-white/8 bg-black/15 px-3 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{sale.itemName}</p>
                            <p className="mt-1 text-xs text-white/48">
                              {sale.quantity} sold • {formatMoney(sale.totalAmount)} • {formatDate(sale.soldAt)}
                            </p>
                            {sale.customerName ? <p className="mt-2 text-xs text-white/58">{sale.customerName}</p> : null}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-white/42">Profit</p>
                            <p className="mt-1 text-sm font-semibold text-emerald-200">{formatMoney(sale.profitAmount)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {dashboard.sales.length > visibleSales.length ? (
                      <div className="pt-2 text-center">
                        <button
                          type="button"
                          onClick={() => setVisibleSalesCount((count) => count + 8)}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white"
                        >
                          Load more sales
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Recent Expenses</h2>
                    <p className="mt-1 text-xs text-white/45">{dashboard.summary.expenseCount} expenses recorded.</p>
                  </div>
                </div>
                {dashboard.expenses.length === 0 ? (
                  <div className="py-10 text-center text-sm text-white/45">No expenses logged yet.</div>
                ) : (
                  <div className="space-y-2">
                    {visibleExpenses.map((expense) => (
                      <div key={expense.id} className="rounded-[18px] border border-white/8 bg-black/15 px-3 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{expense.title}</p>
                            <p className="mt-1 text-xs text-white/48">
                              {expense.category || "General"} • {formatDate(expense.expenseDate)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-rose-200">{formatMoney(expense.amount)}</p>
                        </div>
                      </div>
                    ))}
                    {dashboard.expenses.length > visibleExpenses.length ? (
                      <div className="pt-2 text-center">
                        <button
                          type="button"
                          onClick={() => setVisibleExpensesCount((count) => count + 8)}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white"
                        >
                          Load more expenses
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        <div className="space-y-4">
          {activeTab === "inventory" ? (
          <form onSubmit={createItem} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-sm font-semibold text-white">Add Stock Item</h2>
            <div className="mt-4 grid gap-3">
              <input value={itemForm.name} onChange={(e) => setItemForm((c) => ({ ...c, name: e.target.value }))} placeholder="Item name" className="sage-input text-sm" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={itemForm.sku} onChange={(e) => setItemForm((c) => ({ ...c, sku: e.target.value }))} placeholder="SKU" className="sage-input text-sm" />
                <input value={itemForm.category} onChange={(e) => setItemForm((c) => ({ ...c, category: e.target.value }))} placeholder="Category" className="sage-input text-sm" />
              </div>
              <input value={itemForm.supplier} onChange={(e) => setItemForm((c) => ({ ...c, supplier: e.target.value }))} placeholder="Supplier" className="sage-input text-sm" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={itemForm.stockQuantity} onChange={(e) => setItemForm((c) => ({ ...c, stockQuantity: e.target.value }))} type="number" min="0" placeholder="Stock quantity" className="sage-input text-sm" />
                <input value={itemForm.lowStockThreshold} onChange={(e) => setItemForm((c) => ({ ...c, lowStockThreshold: e.target.value }))} type="number" min="0" placeholder="Low stock alert" className="sage-input text-sm" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={itemForm.costPrice} onChange={(e) => setItemForm((c) => ({ ...c, costPrice: e.target.value }))} type="number" min="0" step="0.01" placeholder="Cost price" className="sage-input text-sm" />
                <input value={itemForm.sellPrice} onChange={(e) => setItemForm((c) => ({ ...c, sellPrice: e.target.value }))} type="number" min="0" step="0.01" placeholder="Sell price" className="sage-input text-sm" />
              </div>
              <textarea value={itemForm.notes} onChange={(e) => setItemForm((c) => ({ ...c, notes: e.target.value }))} placeholder="Notes" className="sage-input min-h-[88px] resize-none text-sm" />
              <button type="submit" disabled={submitting === "item"} className="rounded-full bg-cyan-400/90 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 disabled:opacity-60">
                {submitting === "item" ? "Saving..." : "Save item"}
              </button>
            </div>
          </form>
          ) : null}

          {activeTab === "sales" ? (
          <form onSubmit={createSale} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-sm font-semibold text-white">Record Sale</h2>
            <div className="mt-4 grid gap-3">
              <select value={saleForm.itemId} onChange={(e) => setSaleForm((c) => ({ ...c, itemId: e.target.value, unitPrice: "" }))} className="sage-input bg-transparent text-sm">
                <option value="" className="bg-slate-900">Select inventory item</option>
                {dashboard.items.map((item) => (
                  <option key={item.id} value={item.id} className="bg-slate-900">{item.name} ({item.stockQuantity} in stock)</option>
                ))}
              </select>
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={saleForm.quantity} onChange={(e) => setSaleForm((c) => ({ ...c, quantity: e.target.value }))} type="number" min="1" placeholder="Quantity sold" className="sage-input text-sm" />
                <input value={saleForm.unitPrice} onChange={(e) => setSaleForm((c) => ({ ...c, unitPrice: e.target.value }))} type="number" min="0" step="0.01" placeholder="Unit price" className="sage-input text-sm" />
              </div>
              <input value={saleForm.customerName} onChange={(e) => setSaleForm((c) => ({ ...c, customerName: e.target.value }))} placeholder="Customer name" className="sage-input text-sm" />
              <textarea value={saleForm.notes} onChange={(e) => setSaleForm((c) => ({ ...c, notes: e.target.value }))} placeholder="Sale notes" className="sage-input min-h-[88px] resize-none text-sm" />
              <button type="submit" disabled={submitting === "sale"} className="rounded-full bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300 disabled:opacity-60">
                {submitting === "sale" ? "Saving..." : "Record sale"}
              </button>
            </div>
          </form>
          ) : null}

          {activeTab === "sales" ? (
          <form onSubmit={createExpense} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-sm font-semibold text-white">Log Expense</h2>
            <div className="mt-4 grid gap-3">
              <input value={expenseForm.title} onChange={(e) => setExpenseForm((c) => ({ ...c, title: e.target.value }))} placeholder="Expense title" className="sage-input text-sm" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={expenseForm.category} onChange={(e) => setExpenseForm((c) => ({ ...c, category: e.target.value }))} placeholder="Category" className="sage-input text-sm" />
                <input value={expenseForm.amount} onChange={(e) => setExpenseForm((c) => ({ ...c, amount: e.target.value }))} type="number" min="0" step="0.01" placeholder="Amount" className="sage-input text-sm" />
              </div>
              <textarea value={expenseForm.notes} onChange={(e) => setExpenseForm((c) => ({ ...c, notes: e.target.value }))} placeholder="Expense notes" className="sage-input min-h-[88px] resize-none text-sm" />
              <button type="submit" disabled={submitting === "expense"} className="rounded-full bg-rose-400/90 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-rose-300 disabled:opacity-60">
                {submitting === "expense" ? "Saving..." : "Save expense"}
              </button>
            </div>
          </form>
          ) : null}
        </div>
      </section>
      ) : null}

      {activeTab === "products" ? (
      <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-cyan-300/70">Marketplace</p>
            <h2 className="mt-1 text-sm font-semibold text-white">Your product listings</h2>
            <p className="mt-1 text-xs text-white/45">Your public product listings appear here. Buyers can send purchase requests.</p>
          </div>
          {!currentUserId ? (
            <p className="text-xs text-white/55">Sign in to manage stock, requests, sales, and expenses.</p>
          ) : null}
        </div>
        <form onSubmit={submitMarketplaceSearch} className="mb-4 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={marketplaceQuery}
            onChange={(e) => setMarketplaceQuery(e.target.value)}
            placeholder="Search products..."
            className="sage-input min-w-[220px] flex-1 text-sm"
          />
          <select
            value={marketplaceCategory}
            onChange={(e) => setMarketplaceCategory(e.target.value)}
            className="sage-input min-w-[180px] bg-transparent text-sm"
          >
            <option value="" className="bg-slate-900 text-white">All categories</option>
            {MARKETPLACE_CATEGORIES.map((category) => (
              <option key={category} value={category} className="bg-slate-900 text-white">
                {category}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            Search
          </button>
          {(appliedMarketplaceQuery || marketplaceCategory) ? (
            <button
              type="button"
              onClick={() => {
                setMarketplaceQuery("");
                setAppliedMarketplaceQuery("");
                setMarketplaceCategory("");
              }}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/68 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              Clear
            </button>
          ) : null}
        </form>
        <PostFeed
          postType="product"
          productCategory={marketplaceCategory || undefined}
          search={appliedMarketplaceQuery || undefined}
          currentUserId={currentUserId}
          showComposer={false}
        />
      </section>
      ) : null}
    </div>
  );
}
