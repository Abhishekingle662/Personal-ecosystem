import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
} from 'recharts'
import { useJobs } from '@micro/storage'
import { Card, CardHeader, CardContent } from '@micro/ui'
import { COLUMN_LABELS, COLUMN_COLORS, JOB_COLUMNS, type JobStatus } from '../types'

function weekLabel(weeksAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - weeksAgo * 7)
  return `${(d.getMonth() + 1).toString()}/${d.getDate().toString()}`
}

export function AnalyticsView() {
  const { data: jobs } = useJobs()

  // Funnel data — count per stage (excluding withdrawn)
  const funnelData = JOB_COLUMNS.map((status) => ({
    name: COLUMN_LABELS[status],
    value: jobs.filter((j) => j.status === status).length,
    fill: COLUMN_COLORS[status as JobStatus],
  })).filter((d) => d.value > 0)

  // Response rate: (screen + technical + offer) / applied
  const applied = jobs.filter((j) => j.status !== 'wishlist').length
  const advanced = jobs.filter((j) =>
    ['screen', 'technical', 'offer'].includes(j.status),
  ).length
  const responseRate = applied > 0 ? Math.round((advanced / applied) * 100) : 0

  // Avg days to first screen
  const screened = jobs.filter(
    (j) => j.appliedAt && ['screen', 'technical', 'offer'].includes(j.status),
  )
  const avgDaysToScreen =
    screened.length > 0
      ? Math.round(
          screened.reduce((sum, j) => {
            const days = Math.floor(
              (Date.now() - new Date(j.appliedAt!).getTime()) / 86_400_000,
            )
            return sum + days
          }, 0) / screened.length,
        )
      : null

  // Applications per week (last 8 weeks)
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weeksAgo = 7 - i
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weeksAgo * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const count = jobs.filter((j) => {
      if (!j.appliedAt) return false
      const d = new Date(j.appliedAt)
      return d >= weekStart && d < weekEnd
    }).length

    return { week: weekLabel(weeksAgo), count }
  })

  return (
    <div className="space-y-4 p-6">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-mono font-bold text-[var(--text-primary)]">
              {jobs.length}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Total applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-mono font-bold text-[var(--success)]">
              {responseRate}%
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Response rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-mono font-bold text-[var(--text-primary)]">
              {avgDaysToScreen !== null ? `${avgDaysToScreen.toString()}d` : '—'}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Avg days to screen</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Pipeline funnel */}
        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-[var(--text-primary)]">Pipeline funnel</p>
          </CardHeader>
          <CardContent>
            {funnelData.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-8 text-center">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <FunnelChart>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                  />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    {funnelData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                    <LabelList
                      position="right"
                      fill="var(--text-secondary)"
                      stroke="none"
                      dataKey="name"
                      style={{ fontSize: '11px' }}
                    />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Weekly applications */}
        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Applications per week
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <XAxis
                  dataKey="week"
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: 'var(--bg-tertiary)' }}
                />
                <Bar dataKey="count" fill="var(--accent)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
