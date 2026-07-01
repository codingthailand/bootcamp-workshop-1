---
name: sales-analytics
description: Query and analyze sales order data from the "orders" table. Use this skill when the user asks about sales, revenue, order count,average order value, daily/monthly/yearly sales, date-range sales, top orders, or Thai terms such as ยอดขาย, รายได้, จำนวนออเดอร์, สรุปยอด, ยอดขายวันนี้, ยอดขายรายวัน, ยอดขายรายเดือน, ยอดขายรายปี.
---

# Sales Analytics Skill

## Purpose

Use this skill to answer questions about sales order analytics from the MariaDB database.

This skill covers only the `orders` table.

## Database Schema

### Table: `orders`

| Column       | Type              | Description               |
| ------------ | ----------------- | ------------------------- |
| id           | SERIAL / INTEGER  | รหัสออเดอร์               |
| date         | DATE              | วันที่ลูกค้าสั่งซื้อจริง  |
| customer_id  | INTEGER           | รหัสลูกค้า                |
| total_amount | INTEGER / NUMERIC | ยอดรวมของออเดอร์ หน่วยบาท |

## Business Rules

* Use `SUM(total_amount)` when the user asks about sales, revenue, รายได้, or ยอดขาย.
* Use `COUNT(*)` when the user asks about number of orders or จำนวนออเดอร์.
* Use `AVG(total_amount)` for average order value.
* Round average order value with `ROUND(AVG(total_amount))`.
* Use `date` as the business date of the order.
* The database is MariaDB.
* The table name is `orders`.
* Do not use `"order"` because the table has changed to `orders`.

## SQL Safety Rules

Only generate read-only SQL.

Allowed:

```sql
SELECT
```

Not allowed:

```sql
INSERT
UPDATE
DELETE
DROP
TRUNCATE
ALTER
CREATE
```

Additional rules:

* Do not use `SELECT *` unless the user asks to inspect raw rows.
* Prefer aggregate queries for summary questions.
* Use `COALESCE(SUM(total_amount), 0)` when the query may return no rows.
* When executing with user-provided dates, use parameterized values if the runtime supports them.
* Do not guess a date range if the user asks for an unclear period. Ask for clarification or state the assumption clearly.

## Process

1. Identify the user's intent:

   * total revenue
   * order count
   * average order value
   * daily sales
   * monthly sales
   * yearly sales
   * date range sales
   * top orders
   * comparison

2. Identify the time period:

   * all time
   * today
   * last 7 days
   * this month
   * last month
   * specific date range
   * specific month
   * specific year

3. Build a MariaDB query using `orders`.

4. Execute the query if a database query tool is available.

5. Explain the result in Thai unless the user asks for another language.

6. Include key numbers clearly:

   * total orders
   * total revenue
   * average order value
   * period or date range

## SQL Query Examples

### Total Sales Summary

```sql
SELECT
  COUNT(*) AS total_orders,
  COALESCE(SUM(total_amount), 0) AS total_revenue,
  ROUND(AVG(total_amount)) AS avg_order_value
FROM orders;
```

### Daily Sales

```sql
SELECT
  date,
  COUNT(*) AS total_orders,
  COALESCE(SUM(total_amount), 0) AS daily_revenue,
  ROUND(AVG(total_amount)) AS avg_order_value
FROM orders
GROUP BY date
ORDER BY date DESC;
```

### Monthly Sales

```sql
SELECT
  TO_CHAR(date, 'YYYY-MM') AS month,
  COUNT(*) AS total_orders,
  COALESCE(SUM(total_amount), 0) AS monthly_revenue,
  ROUND(AVG(total_amount)) AS avg_order_value
FROM orders
GROUP BY TO_CHAR(date, 'YYYY-MM')
ORDER BY month DESC;
```

### Yearly Sales

```sql
SELECT
  EXTRACT(YEAR FROM date) AS year,
  COUNT(*) AS total_orders,
  COALESCE(SUM(total_amount), 0) AS yearly_revenue,
  ROUND(AVG(total_amount)) AS avg_order_value
FROM orders
GROUP BY EXTRACT(YEAR FROM date)
ORDER BY year DESC;
```

### Sales in a Date Range

```sql
SELECT
  COUNT(*) AS total_orders,
  COALESCE(SUM(total_amount), 0) AS revenue,
  ROUND(AVG(total_amount)) AS avg_order_value
FROM orders
WHERE date BETWEEN $1 AND $2;
```

### Today's Sales

```sql
SELECT
  COUNT(*) AS total_orders,
  COALESCE(SUM(total_amount), 0) AS today_revenue,
  ROUND(AVG(total_amount)) AS avg_order_value
FROM orders
WHERE date = CURRENT_DATE;
```

### Last 7 Days Sales

```sql
SELECT
  date,
  COUNT(*) AS total_orders,
  COALESCE(SUM(total_amount), 0) AS daily_revenue,
  ROUND(AVG(total_amount)) AS avg_order_value
FROM orders
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY date
ORDER BY date DESC;
```

### This Month vs Last Month

```sql
SELECT
  CASE
    WHEN date >= DATE_TRUNC('month', CURRENT_DATE)
      THEN 'เดือนนี้'
    ELSE 'เดือนที่แล้ว'
  END AS period,
  COUNT(*) AS total_orders,
  COALESCE(SUM(total_amount), 0) AS revenue,
  ROUND(AVG(total_amount)) AS avg_order_value
FROM orders
WHERE date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
  AND date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY period
ORDER BY period;
```

### Top 3 Orders by Amount

```sql
SELECT
  id,
  customer_id,
  total_amount,
  date
FROM orders
ORDER BY total_amount DESC
LIMIT 3;
```

## Response Format

When answering in Thai, prefer this format:

```text
สรุปยอดขาย:

- จำนวนออเดอร์: <total_orders> รายการ
- ยอดขายรวม: <total_revenue> บาท
- ค่าเฉลี่ยต่อออเดอร์: <avg_order_value> บาท

ช่วงข้อมูล: <period>
```

For grouped results such as daily or monthly sales, return a compact table.

```text
ยอดขายรายเดือน:

| เดือน | จำนวนออเดอร์ | ยอดขายรวม | ค่าเฉลี่ยต่อออเดอร์ |
|---|---:|---:|---:|
| 2025-01 | 120 | 350,000 | 2,917 |
```

## Output Guidelines

* Answer clearly and directly.
* Use Thai language by default.
* Format money with comma separators when presenting results.
* Use "บาท" as the currency unit.
* State the date range or period used in the calculation.
* If there is no matching data, say that no orders were found for that period.
* If the user asks for SQL only, return only the SQL.
* If the user asks for explanation, explain the query briefly.

## Validation Checklist

Before finalizing the answer, verify that:

* The query uses `orders`.
* Sales/revenue uses `SUM(total_amount)`.
* Order count uses `COUNT(*)`.
* Sales date uses `date`.
* The query is read-only.
* The time period matches the user's question.
* The final answer includes units in baht where relevant.