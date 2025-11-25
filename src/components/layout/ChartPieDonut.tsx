import { PieChart, Pie, Cell } from 'recharts';

import { ChartContainer } from '../ui/chart';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const pieData = [
  { name: '数学', value: 35, color: 'var(--chart-1)' },
  { name: '物理', value: 25, color: 'var(--chart-2)' },
];

const chartConfig = {
  数学: { label: '数学', color: 'var(--chart-1)' },
  物理: { label: '物理', color: 'var(--chart-2)' },
};

export function ChartPieDonut() {
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
