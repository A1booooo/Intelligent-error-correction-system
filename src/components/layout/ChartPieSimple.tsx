import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

const pieData = [
  { name: '代数', value: 35, color: 'var(--chart-1)' },
  { name: '几何', value: 25, color: 'var(--chart-2)' },
  { name: '其他', value: 40, color: 'var(--chart-3)' },
];

const chartConfig = {
  代数: { label: '代数', color: 'var(--chart-1)' },
  几何: { label: '几何', color: 'var(--chart-2)' },
  其他: { label: '其他', color: 'var(--chart-3)' },
};

export function ChartPieSimple() {
  return (
    <ChartContainer config={chartConfig} className="h-[200px]">
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={60}
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  );
}
