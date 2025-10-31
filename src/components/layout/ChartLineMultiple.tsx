import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export const description = 'A multiple line chart';

const chartData = [
  { month: 'January', wrong: 186, review: 80 },
  { month: 'February', wrong: 305, review: 200 },
  { month: 'March', wrong: 237, review: 120 },
  { month: 'April', wrong: 73, review: 190 },
  { month: 'May', wrong: 209, review: 130 },
  { month: 'June', wrong: 214, review: 140 },
];

const chartConfig = {
  wrong: {
    label: 'wrong',
    color: 'var(--chart-1)',
  },
  review: {
    label: 'review',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function ChartLineMultiple() {
  return (
    <Card>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="wrong"
              type="monotone"
              stroke="var(--color-wrong)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="review"
              type="monotone"
              stroke="var(--color-review)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
