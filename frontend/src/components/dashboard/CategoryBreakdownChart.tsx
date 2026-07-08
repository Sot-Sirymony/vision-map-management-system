import { Bar, BarChart, CartesianGrid, Pie, PieChart, Rectangle, Sector, XAxis } from 'recharts';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
  count: { label: 'Count', color: 'var(--primary)' },
} satisfies ChartConfig;

const DEFAULT_DONUT_COLORS = ['#171717', '#525252', '#a3a3a3', '#737373', '#d4d4d4', '#0a0a0a'];

type CategoryBreakdownChartProps = {
  title: string;
  description: string;
  data: Record<string, number>;
  formatLabel?: (key: string) => string;
  variant?: 'bar' | 'donut';
  colorForKey?: (key: string) => string;
};

export function CategoryBreakdownChart({
  title,
  description,
  data,
  formatLabel = (key) => key,
  variant = 'bar',
  colorForKey,
}: CategoryBreakdownChartProps) {
  const chartData = Object.entries(data).map(([key, count], index) => ({
    category: formatLabel(key),
    count,
    key,
    fill: colorForKey ? colorForKey(key) : DEFAULT_DONUT_COLORS[index % DEFAULT_DONUT_COLORS.length],
  }));

  return (
    <Card>
      <CardHeader title={title} subheader={description} />
      <CardContent>
        {chartData.length === 0 ? (
          <Box sx={{ display: 'flex', height: 220, alignItems: 'center', justifyContent: 'center' }}>
            <Box component="span" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>No data yet.</Box>
          </Box>
        ) : variant === 'donut' ? (
          <>
            <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="category" hideLabel />} />
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="category"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  shape={(props) => {
                    const { payload, ...sectorProps } = props;
                    return <Sector {...sectorProps} fill={payload.fill} />;
                  }}
                />
              </PieChart>
            </ChartContainer>
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', justifyContent: 'center', pt: 1.5 }}>
              {chartData.map((entry) => (
                <Stack key={entry.key} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: entry.fill }} />
                  <Typography variant="caption" color="text.secondary">{entry.category}</Typography>
                </Stack>
              ))}
            </Stack>
          </>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="category" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip
                content={<ChartTooltipContent nameKey="category" color={colorForKey ? undefined : 'var(--color-count)'} />}
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={4}
                shape={
                  colorForKey
                    ? (props) => {
                        const { payload, ...rectProps } = props;
                        return <Rectangle {...rectProps} fill={payload.fill} />;
                      }
                    : undefined
                }
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
