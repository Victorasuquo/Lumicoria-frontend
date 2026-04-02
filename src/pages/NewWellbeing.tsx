import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, LineChart, CircularProgress } from '@/components/ui/charts';
import {
  Heart,
  Coffee,
  Timer,
  Activity,
  Brain,
  Droplets,
  Calendar,
  CheckCircle,
  ArrowRight,
  Clock,
  BrainCircuit,
  Zap,
  PlayCircle,
  AlarmClock,
  Dumbbell,
  Lightbulb,
  Loader2,
  ArrowUp,
  ArrowDown,
  MoveUp,
  Plus,
} from 'lucide-react';
import {
  wellbeingApi,
  WellbeingMetric,
  WellbeingGoal,
  WellbeingRecommendation,
  BreakRecommendation,
  WellbeingAnalytics,
  WellbeingStats,
} from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// ── Icon mapping for metric types ──────────────────────────────────────
const METRIC_ICONS: Record<string, React.ElementType> = {
  mood: Heart,
  energy: Zap,
  stress: BrainCircuit,
  sleep: Clock,
  exercise: Dumbbell,
  mindfulness: Brain,
  productivity: Activity,
  focus: BrainCircuit,
  default: Activity,
};

const METRIC_LABELS: Record<string, string> = {
  mood: 'Mood Score',
  energy: 'Energy Level',
  stress: 'Stress Level',
  sleep: 'Sleep Quality',
  exercise: 'Exercise',
  mindfulness: 'Mindfulness',
  productivity: 'Productivity',
  focus: 'Focus Score',
};

const NewWellbeing = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const { user } = useAuth();
  const { toast } = useToast();

  // Real data state
  const [metrics, setMetrics] = useState<WellbeingMetric[]>([]);
  const [goals, setGoals] = useState<WellbeingGoal[]>([]);
  const [recommendations, setRecommendations] = useState<WellbeingRecommendation[]>([]);
  const [breakRec, setBreakRec] = useState<BreakRecommendation | null>(null);
  const [analytics, setAnalytics] = useState<WellbeingAnalytics | null>(null);
  const [stats, setStats] = useState<WellbeingStats | null>(null);
  const [submittingMetric, setSubmittingMetric] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [metricsRes, goalsRes, analyticsRes, statsRes] = await Promise.allSettled([
        wellbeingApi.getMetrics(),
        wellbeingApi.getGoals(),
        wellbeingApi.getAnalytics(timeRange),
        wellbeingApi.getStats(timeRange),
      ]);

      if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value);
      if (goalsRes.status === 'fulfilled') setGoals(goalsRes.value);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);

      // Load recommendations and break rec separately (they may use the AI agent and be slower)
      const [recsRes, breakRes] = await Promise.allSettled([
        wellbeingApi.getRecommendations(),
        wellbeingApi.getBreakRecommendation(),
      ]);
      if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value);
      if (breakRes.status === 'fulfilled') setBreakRec(breakRes.value);
    } catch (error) {
      console.error('Error fetching wellbeing data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wellbeing data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Quick metric submit ──────────────────────────────────────────
  const submitQuickMetric = async (metricType: string, value: number) => {
    setSubmittingMetric(true);
    try {
      const newMetric = await wellbeingApi.submitMetric({
        metric_type: metricType,
        value,
        source: 'user_input',
      });
      setMetrics(prev => [newMetric, ...prev]);
      toast({ title: 'Metric recorded', description: `${METRIC_LABELS[metricType] || metricType}: ${value}/10` });
    } catch {
      toast({ title: 'Error', description: 'Failed to record metric.', variant: 'destructive' });
    } finally {
      setSubmittingMetric(false);
    }
  };

  // ── Record activity (break, exercise, etc.) ──────────────────────
  const startBreak = async (type: string = 'relaxation', duration: number = 5) => {
    try {
      await wellbeingApi.recordActivity({ activity_type: type, duration_minutes: duration });
      toast({ title: 'Break Started', description: `Your ${duration}-minute break has been logged.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to log break.', variant: 'destructive' });
    }
  };

  // ── Derived data from real metrics ───────────────────────────────
  const metricSummary = analytics?.metrics_summary || {};
  const overviewCards = Object.entries(metricSummary).slice(0, 4).map(([key, data]) => {
    const trend = data.trend;
    const lastTwo = trend.length >= 2 ? trend.slice(-2) : [0, 0];
    const direction = lastTwo[1] > lastTwo[0] ? 'up' : lastTwo[1] < lastTwo[0] ? 'down' : 'stable';
    const change = lastTwo[0] > 0 ? Math.round(((lastTwo[1] - lastTwo[0]) / lastTwo[0]) * 100) : 0;
    return {
      title: METRIC_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      value: Math.round(data.avg * 10), // Scale 0-10 to 0-100 for progress bar
      rawValue: data.avg,
      icon: METRIC_ICONS[key] || METRIC_ICONS.default,
      trend: direction,
      change: `${change >= 0 ? '+' : ''}${change}%`,
      key,
    };
  });

  const recentActivities = (analytics?.recent_activities || []).slice(0, 6);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <MoveUp className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 1) return 'bg-red-100 text-red-800';
    if (priority <= 3) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority <= 1) return 'High';
    if (priority <= 3) return 'Medium';
    return 'Low';
  };

  // ── Loading state ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading wellbeing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Well-being Dashboard</h1>
          <p className="text-gray-600">
            Monitor your well-being metrics and get personalized recommendations
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm bg-white"
          >
            <option value="1d">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => submitQuickMetric('mood', 7)}
            disabled={submittingMetric}
          >
            {submittingMetric ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Quick Check-in
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW TAB ─────────────────────────────────────────── */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Metric Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Your Well-being Metrics</span>
                    <Badge variant="outline" className="text-purple-600 border-purple-600">
                      {stats ? `${stats.total_records} records` : 'Live'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {overviewCards.length > 0
                      ? 'Track your real-time well-being indicators and progress'
                      : 'Start logging metrics to see your well-being trends'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {overviewCards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {overviewCards.map((metric) => (
                        <div key={metric.key} className="rounded-lg border p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 bg-purple-100 rounded-md">
                                <metric.icon className="w-5 h-5 text-purple-600" />
                              </div>
                              <h3 className="font-medium text-gray-900">{metric.title}</h3>
                            </div>
                            <div className="flex items-center">
                              <span className="text-2xl font-bold text-purple-600 mr-2">
                                {metric.rawValue.toFixed(1)}
                              </span>
                              <div className="flex items-center" title={metric.change}>
                                {getTrendIcon(metric.trend)}
                              </div>
                            </div>
                          </div>
                          <Progress value={metric.value} className="h-2 mb-2" />
                          <p className="text-xs text-gray-600">
                            Avg over {timeRange === '1d' ? 'today' : `last ${timeRange.replace('d', ' days')}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No metrics recorded yet</p>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {['mood', 'energy', 'stress', 'sleep'].map((type) => (
                          <Button
                            key={type}
                            variant="outline"
                            size="sm"
                            onClick={() => submitQuickMetric(type, 7)}
                            disabled={submittingMetric}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Log {METRIC_LABELS[type]}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your well-being activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivities.length > 0 ? (
                    <div className="relative border-l border-gray-200 pl-6 ml-3">
                      {recentActivities.map((activity, index) => {
                        const Icon = METRIC_ICONS[activity.type] || Activity;
                        return (
                          <div key={index} className="mb-6 relative">
                            <div className="absolute -left-9 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                              <Icon className="h-3 w-3 text-purple-600" />
                            </div>
                            <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                              {new Date(activity.timestamp).toLocaleString()}
                            </time>
                            <h3 className="text-lg font-semibold text-gray-900 capitalize">
                              {activity.type.replace(/_/g, ' ')}
                            </h3>
                            <p className="text-sm text-gray-600">{activity.duration} minutes</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No activities recorded yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => startBreak('physical', 10)}
                      >
                        <Dumbbell className="w-3 h-3 mr-1" />
                        Log an Activity
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* AI Recommendations */}
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5 text-purple-600" />
                      AI Recommendations
                    </div>
                  </CardTitle>
                  <CardDescription>Personalized suggestions for your well-being</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.length > 0 ? (
                    recommendations.slice(0, 4).map((rec) => (
                      <div key={rec.id} className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-md bg-purple-100">
                            <Lightbulb className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm capitalize">
                                {rec.recommendation_type} tip
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(rec.priority)}`}>
                                {getPriorityLabel(rec.priority)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{rec.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500">
                        Record some metrics to get personalized recommendations
                      </p>
                    </div>
                  )}
                </CardContent>
                {recommendations.length > 4 && (
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View All ({recommendations.length})
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                )}
              </Card>

              {/* Break Recommendation */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Your Next Break</CardTitle>
                </CardHeader>
                <CardContent>
                  {breakRec ? (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <AlarmClock className="h-10 w-10 text-purple-600 mr-3" />
                          <div>
                            <h3 className="font-medium">
                              {breakRec.duration_minutes}-minute {breakRec.break_type.replace(/_/g, ' ')}
                            </h3>
                            <p className="text-sm text-gray-600">{breakRec.reason}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => startBreak(breakRec.break_type, breakRec.duration_minutes)}
                        >
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      </div>
                      {breakRec.suggested_activities.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {breakRec.suggested_activities.map((activity, i) => (
                            <p key={i} className="text-xs text-gray-500 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {activity}
                            </p>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Coffee className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Break recommendations loading...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── GOALS TAB ────────────────────────────────────────────── */}
        <TabsContent value="goals">
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Well-being Goals</CardTitle>
                    <CardDescription>Track your progress towards your well-being goals</CardDescription>
                  </div>
                  <Button onClick={() => toast({ title: 'Coming soon', description: 'Goal creation dialog coming in next update.' })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Set New Goal
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {goals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {goals.map((goal) => (
                      <div key={goal.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900 capitalize">
                              {goal.goal_type.replace(/_/g, ' ')}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Target: {goal.target_value}
                            </p>
                          </div>
                          <Badge variant={goal.status === 'completed' ? 'default' : 'outline'}>
                            {goal.status === 'completed' ? 'Completed' : 'In Progress'}
                          </Badge>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{goal.current_value} / {goal.target_value}</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                        </div>
                        <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                          <span>Started: {new Date(goal.start_date).toLocaleDateString()}</span>
                          <span>Target: {new Date(goal.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">No goals set yet</p>
                    <p className="text-sm text-gray-400">Create a goal to start tracking your progress</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goal trends chart */}
            {stats && stats.total_records > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Goal Trends</CardTitle>
                  <CardDescription>Track your progress over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <BarChart
                      data={[
                        Math.round(stats.average_mood * 10),
                        Math.round(stats.average_energy * 10),
                        Math.round((10 - stats.average_stress) * 10), // Invert stress (lower is better)
                        Math.round(stats.average_sleep * 12.5), // Scale sleep 0-8 to 0-100
                      ]}
                      labels={["Mood", "Energy", "Calm", "Sleep"]}
                      colors={["#7C3AED", "#8B5CF6", "#9333EA", "#A855F7"]}
                      title="Average Scores"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ── INSIGHTS TAB ─────────────────────────────────────────── */}
        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trend chart */}
            {stats && stats.mood_trend.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Mood Trend</CardTitle>
                  <CardDescription>Your mood scores over the last {timeRange.replace('d', ' days')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <LineChart
                      data={stats.mood_trend}
                      labels={stats.mood_trend.map((_, i) => `Day ${i + 1}`)}
                      title="Mood Score"
                      color="#7C3AED"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity distribution */}
            {stats && stats.total_records > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                  <CardDescription>Breakdown of your well-being averages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-around">
                    <CircularProgress
                      value={Math.round(stats.average_mood * 10)}
                      size={180}
                      label="Mood"
                      color="#7C3AED"
                    />
                    <CircularProgress
                      value={Math.round(stats.average_energy * 10)}
                      size={180}
                      label="Energy"
                      color="#8B5CF6"
                    />
                    <CircularProgress
                      value={Math.round((10 - stats.average_stress) * 10)}
                      size={180}
                      label="Calm"
                      color="#A855F7"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Insights — from analytics data */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Analysis of your well-being patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics && Object.keys(analytics.metrics_summary).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(analytics.metrics_summary).slice(0, 4).map(([key, data]) => {
                      const trend = data.trend;
                      const isImproving = trend.length >= 2 && trend[trend.length - 1] >= trend[0];
                      const label = METRIC_LABELS[key] || key.replace(/_/g, ' ');
                      return (
                        <div
                          key={key}
                          className={`p-4 rounded-lg ${isImproving ? 'bg-green-50' : 'bg-amber-50'}`}
                        >
                          <h3 className={`font-medium mb-2 ${isImproving ? 'text-green-900' : 'text-amber-900'}`}>
                            {label} Analysis
                          </h3>
                          <p className={isImproving ? 'text-green-800' : 'text-amber-800'}>
                            Your average {label.toLowerCase()} is <strong>{data.avg.toFixed(1)}</strong> (range: {data.min.toFixed(1)} - {data.max.toFixed(1)}) over {data.count} records.
                            {isImproving
                              ? ` Great progress — your ${label.toLowerCase()} has been trending upward.`
                              : ` Consider focusing on improving your ${label.toLowerCase()} through regular check-ins.`
                            }
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BrainCircuit className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Record metrics over time to unlock AI insights</p>
                    <p className="text-sm text-gray-400 mt-1">
                      We need at least a few days of data to identify patterns
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewWellbeing;
