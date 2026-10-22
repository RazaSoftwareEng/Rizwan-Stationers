
import { Link, useNavigate } from "react-router-dom";
import { useCatalog } from "../catalog.jsx";
import { formatRs, ORDER_STATUSES } from "../cart.jsx";
import { useAdminOrders, OrdersGate } from "./ordersStore.jsx";
import { PageHead, Kpi, Empty, CatalogNotice, formatDateTime } from "./ui.jsx";
import { AreaChart, BarChart, Donut, ColumnChart, CHART } from "./charts.jsx";

const DAYS = 14;
const dayKey = (d) => d.toISOString().slice(0, 10);
const shortRs = (v) => (v >= 1000 ? `Rs ${(v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(/\.0$/, "")}k` : `Rs ${Math.round(v)}`);

// order value per day for the last two weeks
function salesByDay(orders) {
  const days = [];
  const today = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    days.push({
      key: dayKey(d),
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      full: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
      value: 0,
      count: 0,
    });
  }
  const byKey = new Map(days.map((d) => [d.key, d]));
  for (const o of orders) {
    const d = new Date(o.date);
    const day = byKey.get(dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate())));
    if (day) {
      day.value += o.total || 0;
      day.count += 1;
    }
  }
  return days.map((d) => ({ ...d, note: `${d.count} ${d.count === 1 ? "order" : "orders"}` }));
}

// five even price bands from 0 to a round number above the most expensive product
function priceBands(products) {
  if (!products.length) return [];
  const top = Math.max(...products.map((p) => p.price));
  const step = Math.max(1, Math.ceil(top / 5 / 50) * 50);
  return Array.from({ length: 5 }, (_, i) => {
    const lo = i * step;
    const hi = (i + 1) * step;
    return {
      label: `${shortRs(lo).replace("Rs ", "")}–${shortRs(hi).replace("Rs ", "")}`,
      value: products.filter((p) => p.price >= lo && (i === 4 ? p.price <= hi : p.price < hi)).length,
    };
  });
}

export default function Dashboard() {
  const { products, categories } = useCatalog();
  const { orders, status: ordersStatus } = useAdminOrders();
  const navigate = useNavigate();

  const inStock = products.filter((p) => p.inStock).length;
  const out = products.length - inStock;
  const revenue = orders.reduce((n, o) => n + (o.total || 0), 0);
  const open = orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length;
  const sales = salesByDay(orders);
  const last14 = sales.reduce((n, d) => n + d.value, 0);
  const outList = products.filter((p) => !p.inStock).slice(0, 6);

  return (
    <>
      <PageHead title="Dashboard" sub="A quick look at the shop today." />
      <CatalogNotice />
      {ordersStatus !== "ready" && <OrdersGate />}

      <div className="adm-kpis">
        <Kpi icon="box" label="Products" value={products.length} note={`${inStock} in stock`} to="/admin/products" />
        <Kpi icon="alert" label="Out of stock" value={out} note={out ? "Needs restocking" : "All products available"} tone={out ? "warn" : "ok"} to="/admin/products?stock=out" />
        <Kpi icon="tag" label="Categories" value={categories.length} to="/admin/categories" />
        <Kpi icon="receipt" label="Orders" value={orders.length} note={`${open} open`} to="/admin/orders" />
        <Kpi icon="money" label="Order value" value={formatRs(revenue)} note={orders.length ? `Avg ${formatRs(Math.round(revenue / orders.length))}` : "No orders yet"} to="/admin/orders" />
      </div>

      <div className="adm-grid-main">
        <section className="adm-card">
          <div className="adm-card__head">
            <div>
              <h2>Order value</h2>
              <p className="adm-muted">Last {DAYS} days · {formatRs(last14)}</p>
            </div>
            <Link to="/admin/orders">All orders</Link>
          </div>
          <AreaChart data={sales} format={shortRs} label="Order value" emptyText="No orders in the last two weeks yet." />
        </section>

        <section className="adm-card">
          <div className="adm-card__head">
            <h2>Stock status</h2>
            <Link to="/admin/products?stock=out">Out of stock</Link>
          </div>
          <Donut
            label="Products in and out of stock"
            centerValue={products.length ? `${Math.round((inStock / products.length) * 100)}%` : "—"}
            centerLabel="in stock"
            segments={[
              { label: "In stock", value: inStock, color: CHART.good },
              { label: "Out of stock", value: out, color: CHART.critical },
            ]}
          />
        </section>
      </div>

      <div className="adm-grid3">
        <section className="adm-card">
          <div className="adm-card__head">
            <h2>Products by category</h2>
            <Link to="/admin/categories">All</Link>
          </div>
          {categories.length ? (
            <BarChart
              label="Products"
              data={categories.slice(0, 8).map((c) => ({ id: c.id, label: c.name, value: c.count }))}
              onSelect={(d) => navigate(`/admin/products?cat=${d.id}`)}
            />
          ) : (
            <Empty>No categories yet.</Empty>
          )}
        </section>

        <section className="adm-card">
          <div className="adm-card__head">
            <h2>Orders by status</h2>
            <Link to="/admin/orders">Manage</Link>
          </div>
          <Donut
            label="Orders by status"
            centerValue={orders.length}
            centerLabel={orders.length === 1 ? "order" : "orders"}
            segments={ORDER_STATUSES.map((s, i) => ({ label: s, value: orders.filter((o) => o.status === s).length, color: CHART.ordinal[i] }))}
          />
        </section>

        <section className="adm-card">
          <div className="adm-card__head">
            <h2>Price range</h2>
            <span className="adm-muted">Products per band (Rs)</span>
          </div>
          {products.length ? <ColumnChart label="Products by price range" data={priceBands(products)} /> : <Empty>No products yet.</Empty>}
        </section>
      </div>

      <div className="adm-grid2">
        <section className="adm-card">
          <div className="adm-card__head">
            <h2>Out of stock</h2>
            <Link to="/admin/products?stock=out">View all</Link>
          </div>
          {outList.length ? (
            <ul className="adm-list">
              {outList.map((p) => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  <span className="adm-muted">{p.categoryName}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Everything is in stock.</Empty>
          )}
        </section>

        <section className="adm-card">
          <div className="adm-card__head">
            <h2>Recent orders</h2>
            <Link to="/admin/orders">All orders</Link>
          </div>
          {orders.length ? (
            <ul className="adm-list">
              {orders.slice(0, 5).map((o) => (
                <li key={o.number}>
                  <span>
                    <span className="adm-strong">{o.number}</span> · {o.customer?.name || "—"}
                    <span className="adm-prod__desc">{formatDateTime(o.date)}</span>
                  </span>
                  <span>
                    {formatRs(o.total || 0)}{" "}
                    <span className={`adm-status adm-status--${(o.status || "").toLowerCase()}`}>{o.status}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No orders yet. Orders placed through checkout will appear here.</Empty>
          )}
        </section>
      </div>
    </>
  );
}
