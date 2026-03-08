"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_LABELS } from "@/lib/constants";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ChartData {
  name: string;
  value: number;
}

interface DashboardChartsProps {
  dataCategorias: ChartData[];
  dataFiliais: ChartData[];
}

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#9333ea",
  "#0891b2",
];

export function DashboardCharts({
  dataCategorias,
  dataFiliais,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gráfico de Barras: Patrimônio por Filial */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">
            Bens por Filial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataFiliais}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  formatter={(value: number | undefined) => {
                    return [value, "Bens"];
                  }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza: Categorias de Patrimônio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">
            Distribuição por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataCategorias}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {dataCategorias.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name?: string) => {
                    const label =
                      CATEGORY_LABELS[name as keyof typeof CATEGORY_LABELS] ||
                      name ||
                      "";
                    return [value, label];
                  }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Legenda Customizada */}
            <div className="flex flex-wrap justify-center gap-4">
              {dataCategorias.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center text-sm text-slate-600"
                >
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  {CATEGORY_LABELS[entry.name as keyof typeof CATEGORY_LABELS]}{" "}
                  ({entry.value})
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
